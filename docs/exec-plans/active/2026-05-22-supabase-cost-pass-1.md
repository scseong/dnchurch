# supabase-cost-pass-1

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-22
- **브랜치**: feat/supabase-cost-pass-1 (예정 — 현재 `feat/sermons-publish-ssot` PR 머지 후 분기)
- **Open questions**: none
- **ADR needed**: no — 기존 supabase 스킬의 4가지 캐시 패턴을 잘못 적용된 곳에 일관 적용. 새 패턴·라이브러리·데이터 흐름 변경 없음.

## 목표

공개 데이터 fetch 5곳의 캐시 빠짐·풀 컬럼 페치·넓은 범위 무효화를 좁혀 Supabase Egress·CPU·콜드 미스 발생을 줄인다. 마이그레이션 없이 기존 서비스·캐시 구조 안에서만 손본다.

## 검증된 Assumptions

- `src/services/sermon/sermon-service.ts:28-33,66-92` — `list`가 `SERMON_WITH_RELATIONS_SELECT`(`*, preacher(*), sermon_series(*), sermon_resources(*)`)로 sermon_resources 풀 컬럼까지 매번 페치. 같은 파일 `:35-39`에 `SERMON_LIST_ITEM_SELECT` 경량 셀렉트가 정의돼 있는데 list에서 미사용. Read 확인.
- `src/services/sermon/index.ts:49-52 getFeaturedSermon` — `getSermons({pageSize: 1})` 경유로 호출되어 `count: 'exact'`와 풀 관계 join이 1건만 보여주려고 발동. Read 확인.
- `src/actions/sermon.action.ts:152,205,229` — 생성·수정·삭제 액션 3곳 모두 `updateTag('sermon')`로 도메인 전체 캐시(`sermon-list`·`sermon-recent`·`sermon-series-list`·`preacher-list`·전체 `sermon-detail`) 일괄 무효화. Grep 확인.
- `src/actions/update-bulletin.action.ts:81-84` — 단건 수정에서 `updateTag('bulletin-detail')`(전체) + `updateTag('bulletin-detail-nav')`로 다른 상세 캐시까지 무효화. Read 확인.
- `src/services/notice/notice-service.ts:48-58 categoryCounts`, `src/services/bulletin/bulletin-service.ts:71-83 allDatesRes` — 카운트·연도 목록을 풀 row 페치 후 JS에서 집계. SQL 집계 이관은 B 대안(따로 plan)로 분리. 이 plan에서는 다루지 않음.
- `src/lib/supabase/static.ts:6-13` + `src/services/sermon/sermon-cache.ts:8-12`·`src/services/bulletin/bulletin-cache.ts:5-9` — `cache: 'force-cache'`와 `revalidate: 86400`이 같은 옵션 묶음에 들어감. 두 값이 동시에 fetch에 전달되면 Next.js는 `revalidate` 우선이라 `force-cache`는 무의미. Read 확인.

## Non-goals

- PostgreSQL RPC·뷰 도입으로 `categoryCounts`·`yearCounts`·`adminStatusCounts`·`allDatesRes` 같은 풀 페치 집계를 SQL로 이관 (B 대안). → 후속 plan `supabase-cost-pass-2`.
- `src/lib/supabase/client.ts:9` deprecated `supabase` named export 제거. `SessionContextProvider.tsx:14`·`apis/auth.ts:1` 호출처 마이그레이션이 별개라 이 plan에 포함하지 않는다. → 후속.
- `_auth-helpers.ts:14` admin claim fallback 제거. JWT hook 운영 보강 후 별개로 처리.
- DB schema·types 변경 (`yarn generate:types` 불필요).
- 공개 사용자 시나리오 외 어드민 페이지의 캐시 정책 (어드민은 항상 no-store 유지).

## Success Criteria

- sermons 카드 목록 응답 JSON에 `sermon_resources` 키가 빠진다 (Network 탭 raw 응답 비교).
- 어드민에서 sermon 1건을 수정한 직후, 같은 시리즈 안 다른 sermon 상세 페이지를 새로고침했을 때 PostgREST 로그가 새로 찍히지 않는다 (`sermon-detail-${id}` 키는 좁아져서 살아남음).
- 같은 방식으로 bulletin 1건 수정 후 다른 bulletin 상세 캐시가 살아남는다.
- `getFeaturedSermon`이 호출한 PostgREST 응답에 `count` 헤더가 없거나 `count: estimated`로 바뀐다 (exact 제거 확인).
- `yarn lint`·`yarn lint:styles`·`yarn build`·`yarn knip` 통과. `node scripts/verify-task.mjs supabase-cost-pass-1` 통과.

## 영향받는 파일

- `src/services/sermon/sermon-service.ts` — `list` 셀렉트 분기, `count: 'exact'` 옵션 검토.
- `src/services/sermon/sermon-cache.ts` — `cache: 'force-cache'` 중복 정리, 필요 시 태그 키 보강.
- `src/services/sermon/index.ts` — `getFeaturedSermon`을 `recent(1)` 같은 경량 함수로 교체.
- `src/services/bulletin/bulletin-service.ts` — count 옵션 정리. `allDatesRes` 자체는 이 plan에서 손대지 않음 (B 대안 대상).
- `src/services/bulletin/bulletin-cache.ts` — `cache: 'force-cache'` 중복 정리.
- `src/services/notice/notice-service.ts` — `list`의 `count` 옵션 정리.
- `src/actions/sermon.action.ts` — `updateTag('sermon')` 3곳을 도메인별 좁은 키 묶음으로 교체.
- `src/actions/update-bulletin.action.ts` — `updateTag('bulletin-detail')` → `updateTag('bulletin-detail-${id}')` + 인접 키.
- `src/actions/create-bulletin.action.ts` — 신규 생성 시 무효화 키 점검 (지금도 좁은 편이지만 일관성 확인).
- `src/types/sermon.ts` — `SermonListItem`·`SermonWithRelations` 분기 시 호출처 타입 정합.
- 호출처: `src/app/(content)/sermons/page.tsx`, `src/app/(content)/sermons/all/page.tsx`, `src/app/(content)/sermons/[id]/page.tsx`, `src/components/sermons/SermonCard*` — 경량 타입 분기와 페이지네이션 인자.

## 단계별 체크리스트

- [ ] 2. `sermon-service.ts list`가 경량 셀렉트(`SERMON_LIST_ITEM_SELECT` 확장형: 카드 UI가 실제 쓰는 컬럼만)로 응답하도록 분기. 카드 UI(`SermonCard`·`SermonFilteredList` 등)가 참조하는 필드 grep해서 빠짐 없는지 확인. 상세·어드민은 풀 셀렉트 유지.
- [ ] 3. `getFeaturedSermon`을 `sermonService.recent(1)` 또는 신규 경량 함수로 교체. 캐시 태그는 `sermon-recent` 재사용. `count: 'exact'` 제거.
- [ ] 4. `actions/sermon.action.ts`의 `updateTag('sermon')` 3곳을 다음으로 교체.
  - 생성: `updateTag('sermon-list')` + `updateTag('sermon-recent')` + `updateTag('sermon-series-list')` + `updateTag('preacher-list')`.
  - 수정: 위 묶음 + `updateTag('sermon-detail-${id}')` + (시리즈 변경·이동 시) **변경 전 `series_id`를 update RPC 호출 전에 조회 또는 RPC 반환값에 포함** + `if (oldSeriesId) updateTag('sermon-series-detail-${oldSeriesId}')` + `if (newSeriesId) updateTag('sermon-series-detail-${newSeriesId}')` (**null guard 필수** — 설교가 시리즈 미선택·시리즈 제거 케이스에서 `oldSeriesId`/`newSeriesId` null 가능. guard 없으면 `sermon-series-detail-null` 잘못된 태그 발생. 새 series만 무효화하면 이전 series 상세 캐시가 stale로 남음).
  - 삭제: 위 묶음 + **삭제 전 `series_id` 조회 필수** (RPC 반환값 또는 delete 전 SELECT) + `if (seriesId) updateTag('sermon-series-detail-${seriesId}')` (null guard).
- [ ] 5. `update-bulletin.action.ts:83-84`에서 `updateTag('bulletin-detail')` → `updateTag('bulletin-detail-${bulletinId}')`로 좁힘. 인접 nav는 실제 캐시 태그가 `bulletin-nav` + `bulletin-nav-${targetId}`(`bulletin-cache.ts:18`)이므로 **수정 대상 자기 nav** `updateTag('bulletin-nav-${bulletinId}')` (본문 변경이 자기 nav 카드 표시에 영향) + **인접 nav** `updateTag('bulletin-nav-${prevId}')` + `updateTag('bulletin-nav-${nextId}')` (날짜 변경 시 prev/next 인접 글의 nav도 stale)로 좁힐 수 있는지 검토 (`get_adjacent_bulletins` 호출 결과로 prev/next id 확보). 좁히기 어려우면 `updateTag('bulletin-nav')`로 fallback + 의사결정 로그에 기록.
- [ ] 6. `count: 'exact'`가 페이지 응답에 실제로 필요한 곳(목록 페이지네이션 total)과 불필요한 곳(featured 1건, recent 캐러셀)을 분리. 후자에서 옵션 제거.
- [ ] 7. `static.ts`의 `createStaticClient` 호출 옵션에서 `cache: 'force-cache'`와 `revalidate`가 충돌하는 케이스(`sermon-cache.ts:9`·`bulletin-cache.ts:5-13`)를 점검. revalidate가 있으면 `cache` 키 제거, revalidate 없으면 `cache: 'force-cache'` 유지.
- [ ] 8. 타입·호출처 회귀: `tsc --noEmit` 또는 `yarn build`, 카드 UI 한 번 렌더 확인 (`yarn dev` + 브라우저).
- [ ] 9. `node scripts/verify-task.mjs supabase-cost-pass-1` 실행, 로그 첨부 (커밋 X).

## Verification

- `node scripts/verify-task.mjs supabase-cost-pass-1`
- 수동: `yarn dev` 후 브라우저에서 `/news/notices`·`/sermons`·`/sermons/all`·`/news/bulletins/{id}` 진입해 Network 탭 응답 크기 비교 (announcement 라우트는 dead code로 후속 task에서 삭제 예정).
- 수동: Supabase Dashboard `Logs → API`에서 같은 페이지 두 번째 진입 시 PostgREST 호출 부재 확인 (ISR hit).

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 사용자 지시로 이 plan은 Codex 계획 검증을 건너뜀. 머지 게이트 단계에서 verdict token이 강제되면 그때 사용자와 다시 합의.
- **다음 행동**: WORK 진입. 게이트에서 막히면 사용자 승인 후 Codex 호출.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 사용자 승인 받으면 호출.

## Claude 2차 검증

- **최종 판단**: 미작성
- **현재 판단**: 미작성
- **다음 행동**: verify-task 후 갱신.

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.
-->

## 후속 작업

- **announcement.ts dead code 삭제** — `/news/announcements` 라우트 부재 확인(rg `(content)/news/announcements` → 0건). `src/apis/announcement.ts` + 호출처 grep 0건 확인 후 cleanup task로 분리.
  - 이유: 본 plan(캐시 최적화 5곳)과 별개 — 죽은 코드 삭제 의도. 캐시 패턴 적용 대상에서 제외 (Cdx-5 후속).
  - 다음 기준: 본 plan 머지 직후 작은 PR로 분리 (1 파일 삭제 + grep 검증).
  - 기록 위치: `docs/tech-debt-tracker.md`
- B 대안: 풀 페치 집계를 SQL로 이관 (notice category counts, sermon year counts, sermon admin status counts, bulletin year list).
  - 이유: RPC 또는 뷰 도입은 마이그레이션·타입 재생성이 필요해 이 plan 범위 밖. ADR 트리거에 해당해 따로 절차가 필요.
  - 다음 기준: row 수 sermons ≥ 500 또는 notices ≥ 200 도달, 또는 어드민 페이지 응답 지연 체감 시.
  - 기록 위치: 이 plan 머지 후 신규 exec-plan `supabase-cost-pass-2`.
- deprecated `src/lib/supabase/client.ts:9` `supabase` named export 제거.
  - 이유: `SessionContextProvider.tsx:14`·`apis/auth.ts:1` 호출처 마이그레이션이 별개 작업. UX 변화 없음.
  - 다음 기준: 이 plan 머지 직후 작은 PR로 분리.
  - 기록 위치: `docs/tech-debt-tracker.md`.
- `_auth-helpers.ts:14` admin claim fallback 제거.
  - 이유: JWT hook 안정성 검증 후 진행. 이 plan과 무관.
  - 다음 기준: hook 운영 30일 무사고 후.
  - 기록 위치: `docs/tech-debt-tracker.md`.

---

## 의사결정 로그

- **D1 — Codex 계획 검증 생략 결정**
  - 문제: ADR 0001에 따르면 트레이드오프 분석·다단계 작업은 Codex 계획 검증 대상. 이 plan은 5개 영역에 걸친 다단계 작업이라 일반 절차상 호출이 권장된다.
  - 해결: 호출하지 않는다. 이유 — 사용자가 "codex 리뷰는 하지 않고"를 명시했다. 이 plan의 변경은 supabase 스킬에 이미 정의된 4가지 캐시 패턴을 잘못 적용된 곳에 옮겨 붙이는 작업이라 새 설계 결정이 적다. 다만 머지 게이트에서 verdict token이 강제되면 그 시점에 사용자와 다시 합의한다.
  - 결과: WORK 진입을 막지 않는다. 게이트 차단 가능성은 작업 시작 전에 사용자가 인지한 상태.

- **D2 — SQL 집계 이관(B 대안)은 이 plan에서 제외**
  - 문제: 풀 페치 + JS 집계가 4곳에서 비용을 만든다. SQL 집계로 옮기면 row 수에 따른 비용 곡선이 평평해진다.
  - 해결: 이 plan에서 다루지 않고 후속 `supabase-cost-pass-2`로 분리. 이유 — RPC·뷰 도입은 마이그레이션 + types 재생성 + dev/prod 양쪽 적용이 필요해 작업 폭이 다르다. 현재 row 수(sermons 수십~수백, notices 수십)에서는 ROI가 작아 캐시·셀렉트 정리가 먼저다.
  - 결과: 이 plan은 마이그레이션 없이 끝난다. B는 row 수 기준 충족 시 새 plan으로 시작.

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->
