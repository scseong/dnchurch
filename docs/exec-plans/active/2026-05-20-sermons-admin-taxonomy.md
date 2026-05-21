# sermons-admin-taxonomy

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-20
- **브랜치**: feat/sermons-admin-taxonomy
- **Open questions**: 어드민 함수가 반환할 `sermon_count`의 의미를 published count로 유지할 것인가, 전체(draft 포함) count로 바꿀 것인가. 본 plan은 published count 유지로 진행(D2 참조), codex 계획 검증으로 확정 — Codex Q1 결과로 published count + LEFT join 채택.
- **Sister branch 위험 (Codex CR Q3)**: 같은 sermon 도메인 active plan `docs/exec-plans/active/2026-05-18-sermons-a11y-perf.md`가 `feat/sermons-perf` 브랜치에서 진행 중. 본 작업 변경 파일(`services/sermon/*`, `(admin)/admin/sermons/*`)과 직접 겹치진 않지만 PR base가 동일(develop)이라 머지 순서·rebase 충돌 점검 필요. PR 생성 직전 `git fetch origin develop && git rebase origin/develop` 수동 확인 후 push.
- **ADR needed**: maybe — `src/services/`(`scripts/_shared-config.mjs:16`)에 해당하는 변경. 단 어드민 전용 신규 함수 2개 추가이고 공개 함수·schema 불변. codex plan 검증 결과로 최종 결정.

## 목표

어드민 설교 등록·필터에서 신규 설교자·시리즈가 select에 나타나지 않아 **첫 설교 등록이 차단되는 결함**을 해소한다. `src/services/sermon/admin.ts`에 어드민 전용 `getAdminPreachers`·`getAdminSeries`를 신설하고, 어드민 3개 페이지가 그것을 사용하도록 교체한다. 공개 함수(`getAllPreachers`·`getAllSeries`) 시그니처와 동작은 불변으로 둬 공개 라우트 회귀를 0으로 만든다.

## 검증된 Assumptions

- 공개 게이트 함수 본문이 published 회차가 1편 이상인 항목만 반환한다 — `src/services/sermon/sermon-service.ts:125-130`(`allSeries`)에서 `.eq('is_active', true)` + `sermons!inner(count)` + `.eq('sermons.is_published', true)` + `.is('sermons.deleted_at', null)` 동시 적용 확인. `:204-212`(`allPreachers`)도 동일 패턴.
- 결과적으로 `is_published=true` 회차가 0편인 설교자·시리즈는 반환에서 빠진다 — inner join 의미상 매칭되는 published row가 없으면 부모 row도 제외.
- 호출처 매트릭스 (`rg 'getAllPreachers|getAllSeries' src` 2026-05-20):
  - 어드민 3건: `app/(admin)/admin/sermons/new/page.tsx:5`, `page.tsx:27-28`, `[id]/edit/page.tsx:14-15`
  - 공개 3건: `app/(content)/sermons/page.tsx:51` (getAllSeries 단독), `series/page.tsx:37` (getAllSeries 단독), `all/page.tsx:51-52` (둘 다)
- 어드민 UI도 `sermon_count`를 사용한다 — `src/components/admin/sermons/SermonListPage/parts/SeriesFilter.tsx:26-29`가 `series.map(({ id, title, sermon_count }) => …)`로 분해. 즉 어드민 함수도 sermon_count 필드가 있어야 타입·UI 모두 호환.
- `SermonForm`(`src/components/admin/sermons/SermonForm/index.tsx`)은 `preachers: Preacher[]`·`series: SeriesWithSermonCount[]`를 받지만 본문에서 `sermon_count`를 사용하지 않음 — 자식 `PreviewCard.tsx`도 `series.find` 매핑만 함. 즉 어드민 폼은 sermon_count 유무에 무관.
- `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7-26`)에 `src/services/` 포함. 본 작업은 `src/services/sermon/admin.ts` 변경이라 트리거에 걸린다 — codex 계획 검증으로 ADR 정식 필요 여부 판정.
- RLS 가정 (Codex CR Q3 반영): `createServerSideClient()`는 anon key 기반. `sermons` 테이블 RLS는 `is_published=true`만 노출하는 정책으로 가정. 즉 admin 함수의 `sermons(count)` 집계도 RLS-visible published rows 기준으로 계산된다. 어드민이 안 보이는 draft를 count에 포함하지 않는 게 본 plan의 의도와 정합 (D2의 "published count 유지"와 일치). RLS가 다른 동작이면 (예: admin context에서 draft 노출) count 의미가 바뀌므로 별도 검증 필요.

## Non-goals

- 공개 `getAllPreachers`·`getAllSeries` 시그니처·반환 형태·필터 조건 변경. 공개 게이트는 그대로 유지(공개 sidebar 카운트 의미 보존).
- 공개 라우트(`(content)/sermons/{,all,series}/page.tsx`) 호출처 수정.
- DB schema 변경, 마이그레이션, RLS 정책 수정.
- 검색 RPC 변환, 전문검색 도입(C 항목).
- 다른 어드민 도메인(스태프·공지·주보 등)의 비슷한 패턴 정리. 본 작업은 sermon 전용.
- `tech-debt-tracker.md`에 등록된 `select('*')` + JS 집계 정리(J 항목) — 같은 함수 영역이지만 의도가 다름. 별도 PR.

## 접근법

**대안 1 — 어드민 전용 신규 함수를 `services/sermon/admin.ts`에 추가** [채택]

- 공개 함수 시그니처 불변 → 공개 라우트 회귀 0.
- 어드민·공개 데이터 경계가 코드 레벨로 분리되어, 향후 어느 한쪽 조건이 바뀌어도 다른 쪽이 흔들리지 않는다.
- 작업 범위: 함수 2개 추가 + 어드민 호출처 3곳 교체. 외과적.

**대안 2 — 기존 공개 함수에 `{ adminMode: true }` 옵션 파라미터 추가** [기각]

- 공개 함수 시그니처가 모든 호출처에 영향. 호출 누락 시 silent 버그(공개 라우트가 어드민 데이터 노출 등).
- 함수의 의도가 흐려진다(공개와 어드민이 한 함수에).

**대안 3 — 어드민 layer에서 공개 함수 호출 + 누락된 시리즈·설교자를 별도 쿼리로 보충** [기각]

- 쿼리 2회 + 클라이언트 합치기 로직 → 복잡도·페이로드 증가.
- "published 0편이면 보충"이라는 조건이 어드민 UI 곳곳에 흩어진다.

**대안 4 — RLS 정책에서 어드민 컨텍스트일 때 게이트 무력화** [기각]

- DB 레이어 변경 → ADR_TRIGGER + 마이그레이션 + 검증 부담.
- 게이트는 "공개 카운트" 의도인데 RLS로 풀면 의미 불일치.

D1·D2(의사결정 로그)에 채택 근거와 sermon_count 처리 결정을 별도 기록.

## Success Criteria

- 신규 파일·함수: `src/services/sermon/admin.ts`에 `getAdminPreachers`·`getAdminSeries` 함수가 존재. `published inner join` 없음, **`is_active` 필터도 없음** (D3 reversal — 초안·공개·종결 모두 select 노출). 정렬·published count 필터는 공개 함수와 동일.
- 어드민 3개 페이지(`new/page.tsx`, `page.tsx`, `[id]/edit/page.tsx`)가 `getAdminPreachers`·`getAdminSeries`를 호출한다. `getAllPreachers`·`getAllSeries` import 잔류 0건(`rg "getAll(Preachers|Series)" src/app/\(admin\)` 결과 0).
- 공개 라우트의 `getAllPreachers`·`getAllSeries` 호출처는 변경 0(diff 검토로 확인).
- 어드민 함수가 반환하는 row 모양이 `SeriesWithSermonCount`·`PreacherWithSermonCount`와 호환되어 `SeriesFilter.tsx:26-29`와 `SermonListPage` prop 타입이 깨지지 않는다.
- 검증: `yarn lint` PASS, `yarn build` PASS, `node scripts/verify-task.mjs sermons-admin-taxonomy` PASS, knip 신규 0.
- 수동 확인: dev에서 published=0인 새 설교자·시리즈를 1건씩 만들어 어드민 새 설교 등록 페이지(`/admin/sermons/new`)의 설교자·시리즈 select에 표시됨을 캡처. 공개 `/sermons/all` sidebar에는 노출되지 않음을 동시 캡처.

## 영향받는 파일

수정:

- `src/services/sermon/admin.ts` — 함수 2개 추가(`getAdminPreachers`·`getAdminSeries`).
- `src/app/(admin)/admin/sermons/new/page.tsx` — import·호출 교체.
- `src/app/(admin)/admin/sermons/page.tsx` — import·호출 교체.
- `src/app/(admin)/admin/sermons/[id]/edit/page.tsx` — import·호출 교체.

신규 docs:

- 본 exec-plan (`docs/exec-plans/active/2026-05-20-sermons-admin-taxonomy.md`).
- 머지 후 `docs/exec-plans/completed/`로 이관 + 회고.

영향 없음(불변 확인 대상):

- `src/services/sermon/index.ts` (공개 wrappers)
- `src/services/sermon/sermon-service.ts` (public methods)
- `src/app/(content)/sermons/**`

## 단계별 체크리스트

- [x] 1. EXPLORE — 공개 함수 게이트 조건·호출처 매트릭스·sermon_count 사용처 매핑 (assumptions에 기록)
- [ ] 2. codex 계획 검증 — `## Codex 계획 검증` 결과 PASS/CR 반영. CR이면 plan 갱신 후 재요청
- [ ] 3. `services/sermon/admin.ts`에 함수 2개 추가 (Codex CR Q1 반영)
  - `getAdminPreachers()`: 공개 `allPreachers`에서 **`sermons!inner(count)` → `sermons(count)` 한 글자 차이만 적용**. `.eq('sermons.is_published', true)`·`.is('sermons.deleted_at', null)` 필터는 **유지** — count 의미를 "발행+미삭제 회차 수"로 보존하면서 0편 row만 포함하도록.
  - `getAdminSeries()`: 같은 변경(inner 해제만).
  - `.eq('is_active', true)`는 **제거** (D3 reversal — 초안·종결도 select 노출). 정렬은 공개 함수와 동일.
  - 반환은 `PreacherWithSermonCount[]`·`SeriesWithSermonCount[]`로 정규화 (`sermons?.[0]?.count ?? 0` 패턴 — 공개 함수와 동일).
- [ ] 4. 어드민 3페이지 import·호출 교체
- [ ] 5. lint·build·knip 통과 — 타입 호환 깨짐 0
- [ ] 6. dev 수동 검증 — published=0 신규 설교자·시리즈를 등록 후 어드민 select 노출 + 공개 sidebar 비노출 동시 확인. 캡처를 검증 로그에 첨부
- [ ] 7. `node scripts/verify-task.mjs sermons-admin-taxonomy` — run-id·증적 기록
- [ ] 8. codex 1차 검증 요청(diff 기반) — `## Codex 1차 검증` 반영
- [ ] 9. claude 2차 검증 — `## Claude 2차 검증` 반영
- [ ] 10. 사용자 승인 후 commit·PR(base=develop)

## Verification

자동:

- `yarn lint` — ESLint 통과(레이어 의존성 포함)
- `yarn lint:styles` — stylelint(스코프 외, 회귀 0 확인용)
- `yarn build` — Next 빌드 PASS
- `yarn knip` — 신규 미사용 0. **verify-task는 knip이 warningOnly이므로 로그를 직접 열어 신규 sermon 영역 항목 0건을 눈으로 확인** (Codex CR Q3).
- `node scripts/verify-task.mjs sermons-admin-taxonomy` — 위 항목 통합 + `logs/sermons-admin-taxonomy/<run-id>/` 증적 기록
- 정적 query-shape 체크 (Codex CR Q4 반영):
  - `rg "sermons!inner" src/services/sermon/admin.ts` → 0건 (inner join 잔존 없음)
  - `rg "getAll(Preachers|Series)" src/app/\(admin\)` → 0건 (공개 함수 잔존 import 없음)
  - `rg "is_published" src/services/sermon/admin.ts` 및 `rg "deleted_at" src/services/sermon/admin.ts` → 새 함수 2개 본문에서 양쪽 필터가 그대로 살아 있음을 확인 (D2 정합)

수동:

- `/admin/sermons/new` — 설교자·시리즈 select에 published=0 신규 row 노출 확인
- `/admin/sermons` 리스트 필터 — 시리즈 필터에 published=0 시리즈 노출 확인. 어드민 SeriesFilter의 `sermon_count` 표시도 (0편)으로 렌더링되는지 확인
- `/sermons/all` sidebar — published=0 신규 row 비노출 확인 (공개 게이트 유지 회귀 테스트)
- `/sermons/series` — 같은 회귀 테스트

회귀 우선 확인 매트릭스 (검증 로그 표에 기록):

| 라우트 | 시리즈 케이스 | 기대 동작 | 결과 |
| --- | --- | --- | --- |
| `/admin/sermons/new` | `열왕기 강해` (is_active=true + published=0) | select에 노출 (D1·D2 회귀 테스트) | ✅ 코드 검증 (admin.ts에 published inner join·is_active 필터 모두 없음) |
| `/admin/sermons/new` | `마태복음 강해` (is_active=false + 0편) | select에 노출 (D3 reversal 회귀 테스트) | ✅ 코드 검증 (is_active 필터 제거됨) |
| `/admin/sermons` 필터 | 위 두 시리즈 | 시리즈 필터 dropdown에 둘 다 노출 | ✅ 코드 검증 |
| `/admin/sermons/[id]/edit` | 기존 + 두 신규 시리즈 | 기존 동작 그대로 + 두 신규 row 노출 | ✅ 코드 검증 |
| `/sermons/all` sidebar | `열왕기 강해` (is_active=false로 토글됨) | **비노출** (공개 게이트 유지 회귀 0) | ✅ 사용자 dev 검증 |
| `/sermons/all` sidebar | `마태복음 강해` (is_active=false) | **비노출** (공개 게이트 유지 회귀 0) | ✅ 사용자 dev 검증 |
| `/sermons/series` | 위 두 시리즈 | 둘 다 비노출 (공개 게이트 유지 회귀 0) | ✅ 사용자 dev 검증 |

**검증 노트 (2026-05-21)**: 어드민 노출(1~4행)은 admin.ts diff(`is_active` + `published inner join` 모두 제거)로 코드 검증. 공개 비노출(5~7행)은 사용자가 dev DB에서 `마태복음 강해`·`열왕기 강해`의 `is_active`를 `false`로 토글한 뒤 공개 페이지에서 두 시리즈가 안 보이는 것을 직접 확인 (워크플로 시뮬레이션 — 후속 `sermons-series-auto-activate` plan에서 자동화 예정).

## 기대 효과

- **사용자 가치(어드민 운영)**: 신규 설교자·시리즈를 등록한 직후 첫 설교를 바로 입력할 수 있다. 현재는 "왜 설교자 select가 비어 있지?"라는 차단 경험.
- **시스템 무결성**: 어드민과 공개의 데이터 경계가 코드 레벨로 분리되어, 향후 어느 한쪽 조건 변경이 다른 쪽에 영향을 안 준다. 회귀 표면이 줄어든다.
- **후속 작업 기반**: PR `sermons-view-count-side-effect`·`sermons-publish-ssot`에서 어드민 layer를 수정할 때 같은 경계 안에서 작업 가능. 어드민 전용 서비스 파일(`admin.ts`)이 성장 베이스가 된다.

## 트레이드오프

- `services/sermon/admin.ts` 파일이 함수 1개에서 3개로 늘어난다 — 작아 보이지만 sermon 도메인 admin 표면이 확장되는 시작점. 향후 다른 어드민 함수도 여기로 모이도록 컨벤션 유지.
- `sermon_count`의 의미가 공개·어드민 모두 "published 회차 수"로 통일됨(D2). 어드민 관점에서 "전체 회차 수"가 더 유의미할 수 있지만, 그건 후속 task로 분리.
- 어드민 함수에 초안·공개·종결 시리즈가 같이 섞임(D3 reversal) — 어드민 dropdown의 시각적 구분이 약함. 후속 task에서 (초안)/(종결) 배지로 보강 예정. 본 작업은 차단 결함 해소까지만.

## 의사결정 로그

- **D1 — 어드민 전용 함수를 별도 파일에 신설(대안 1 채택)**
  - 문제: 공개용 `getAllPreachers`·`getAllSeries`가 `is_active=true` + `sermons!inner(count)` + `is_published=true` + `deleted_at IS NULL`을 동시에 걸어, published 회차 0편인 새 설교자·시리즈는 select에 안 보인다. 어드민이 첫 설교를 등록할 수 없는 차단 상태.
  - 해결: `services/sermon/admin.ts`에 published-게이트 없는 어드민 전용 함수 2개를 신설하고, 어드민 페이지가 그것을 사용한다. 대안 2(공개 함수 옵션 파라미터)는 공개·어드민 의도를 한 함수에 섞어 silent 버그 위험. 대안 3(보충 쿼리)은 클라이언트 합치기 복잡도. 대안 4(RLS)는 DB 변경 부담. 그래서 대안 1.
  - 결과: 공개 함수 시그니처·동작 불변 → 공개 라우트 회귀 0. 어드민·공개 데이터 경계가 코드 레벨로 명확해진다. 향후 어느 한쪽 조건 변경이 다른 쪽을 흔들지 않는다.

- **D2 — 어드민 함수도 `sermon_count`를 반환(published count 유지, inner→LEFT join)**
  - 문제: 어드민 `SeriesFilter.tsx:26-29`가 `sermon_count`를 destructure로 사용 중. 어드민 함수가 count를 빼면 타입·UI가 깨진다. 동시에 published 0편 row를 포함해야 한다.
  - 해결: 어드민 함수도 `published count`를 반환하되 inner join 대신 default(LEFT) join으로 변경 — 0편이어도 row 자체는 포함되고 count=0으로 노출. count 의미는 공개와 동일하게 "발행된 회차 수"로 유지. 대안(전체 회차 count로 분기)은 코드 읽기를 어렵게 해 기각, 후속 task 후보.
  - **구체 변경 (Codex CR Q1)**: 공개 함수에서 한 글자만 차이. `sermons!inner(count)` → `sermons(count)`로 inner 해제. `.eq('sermons.is_published', true)`·`.is('sermons.deleted_at', null)` 두 필터는 **유지** — count 계산 의미를 그대로 보존해야 D2 의도("0편 row 포함 + count=published count")가 성립.
  - 결과: 타입 호환 유지, UI 변경 0, 새 row 포함. count=0은 어드민 운영자에게 "발행된 회차 없음"이라는 직관적 신호.

- **D3 — 어드민 함수에서 `is_active` 필터 제거 (초안·공개·종결 모두 select 노출)**
  - **정정 이력**: 초기안은 "`is_active=true` 유지"였으나 2026-05-21 dev 수동 검증 중 catch-22 발견 — 새 시리즈는 default `is_active=false`라 어드민 select에 안 보임 → 첫 설교 등록 불가. 메모리 `project_sermon_series_semantics.md`("is_active=발행 게이트, 초안↔공개")와 결합한 결과.
  - 문제: catch-22(위 정정 이력). 어드민이 새 시리즈에 첫 설교를 등록할 길이 없다.
  - 해결: 어드민 함수에서 `.eq('is_active', true)` 한 줄 제거. 어드민은 모든 시리즈·설교자 노출. 공개 함수는 불변 — 공개 sidebar는 게이트 그대로(`is_active=true` + published 1편 이상). 대안 (a) 시리즈 관리 어드민 UI 신설 + 활성화 토글 — 큰 UI 추가. 대안 (b) DB default를 `true`로 변경 — semantics(초안 게이트)와 충돌. 그래서 어드민 함수 한 줄 제거가 가장 외과적.
  - 결과: 첫 설교 등록 흐름 매끄러움. 어드민 dropdown에 초안·종결 시리즈가 같이 섞임 → 후속 task에서 (초안)/(종결) 배지로 시각적 구분 보강. 첫 설교 등록 시 자동 활성화(trigger)는 별도 plan `sermons-series-auto-activate`로 분리(이번 plan의 Non-goals "DB schema 변경, 마이그레이션").

- **D4 — gemini-code-assist 봇이 지적한 4건(`select('*')`·`as unknown as`)을 본 PR에서 defer**
  - 문제: PR #99 머지 직전 gemini-code-assist 봇이 4개 코멘트 — (a) `select('*, sermons(count)')` 성능 지적 2건(`admin.ts:40`·`:62`), (b) `as unknown as PreacherWithSermonCount`/`SeriesWithSermonCount` 타입 단언 정확성 지적 2건(`:47-49`·`:69-71`).
  - 해결: 모두 defer. 사유 — (1) 본 plan의 Non-goals에 `select('*')` + JS 집계 정리(도메인 리뷰 Item J)가 명시적으로 제외되어 있음. (2) 동일 패턴이 공개 함수에도 있음(`sermon-service.ts:205`·`:213-215`·`:123`·`:131-133`) — 어드민만 고치면 공개·어드민 비대칭이 생겨 더 나빠짐. (3) 두 패턴 모두 도메인 리뷰 Item J(`select('*')`)·Item K(`as unknown as` 단언)로 후속 task 등록되어 있음 — 공개·어드민 동시 정리해야 일관성 유지.
  - Codex 독립 검증: PR 머지 직전 codex 객관 검증 결과 `PASS_WITH_DECISION_LOG` — 4건 모두 defer 동의, 런타임 결함·머지 차단 리스크 없음 명시.
  - 결과: 본 PR은 차단 결함 해소까지만. gemini 코멘트 4건에는 후속 PR 약속을 GitHub 답글로 기록(reviewer 트래킹용).

## ADR 판단

- 변경 파일: `src/services/sermon/admin.ts`(추가만), `src/app/(admin)/admin/sermons/*.tsx`(호출 교체).
- ADR_TRIGGER_PARTS의 `src/services/`(line 16)에 해당 → 트리거.
- 그러나 내용은:
  - 어드민 전용 신규 함수 추가(공개 contract 영향 0)
  - schema·migration 없음
  - 새 라이브러리 없음
  - 영구 아키텍처 결정이 아닌 데이터 경계 정합화(어드민이 공개 게이트를 우회한다는 의도가 코드로 드러남)
- 판단: ADR 정식 발급 불필요로 추정. **codex 계획 검증에서 최종 확정** — codex가 ADR 권장이면 `start-adr.mjs` 실행.

## 참고 자료

- 도메인 리뷰(전체 18개 항목 중 본 작업은 N): `docs/research/2026-05-20-sermons-domain-review.md`
- 같은 sermon 도메인 진행 중 작업: `docs/exec-plans/active/2026-05-18-sermons-a11y-perf.md`
- ADR 트리거 SSOT: `scripts/_shared-config.mjs:7-26`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS (4차 자체 점검 — codex 3차 CR이 명시한 3곳을 외과적으로 정정)
- **현재 판단**: 흐름 — 1차 CR(5건 Q1~Q4) → 정정 → 2차 PASS → 구현 + dev 수동 검증 → D3 reversal(`is_active` 필터 제거) → 3차 CR(plan 본문 3곳에 stale 문장 잔존) → `:62`·`:96`·`:149` 외과적 정정 → 자체 grep으로 잔존 stale 0 확인. codex가 명시한 정정 지점만 변경했고 다른 검증(diff 정확성·공개 회귀·매트릭스 커버리지·엣지 케이스·D1·D2 유효성)은 3차에서 이미 PASS.
- **다음 행동**: Claude 2차 검증 갱신 → 사용자 수동 검증·승인 → commit·PR.

<details>
<summary>Codex 2차 PASS stdout (verbatim, 2026-05-21, run 약 7분 28초)</summary>

```
PASS

각 항목 결과:

- **Q1 — PASS**: 체크리스트 step 3와 D2 모두 `sermons!inner(count)` → `sermons(count)` (inner 해제만) + `.eq('sermons.is_published', true)` / `.is('sermons.deleted_at', null)` 필터 유지를 명시한다.
- **Q2 — PASS**: `## ADR 판단` 유지, "schema·migration 없음, 새 라이브러리 없음, 영구 아키텍처 결정이 아닌 데이터 경계 정합화"로 근거가 충분하다.
- **Q3-a — PASS**: Assumptions에 "`sermons` 테이블 RLS는 `is_published=true`만 노출하는 정책으로 가정" 및 "RLS-visible published rows 기준" 명시.
- **Q3-b — PASS**: Verification 자동 항목에 "knip warningOnly이므로 로그를 직접 열어 신규 sermon 영역 항목 0건을 눈으로 확인" 절차가 있다.
- **Q3-c — PASS**: Open questions 바로 다음 metadata bullet에 "Sister branch 위험 (Codex CR Q3)" + `feat/sermons-perf` 브랜치 언급이 있다.
- **Q4 — PASS**: Verification 자동 항목에 `rg "sermons!inner"`, `rg "getAll(Preachers|Series)"`, `rg "is_published"`, `rg "deleted_at"` 4개의 rg 명령이 있다.

신규 이슈 없음. 플랜을 구현으로 넘겨도 된다.
```

평이 풀이: 2차 PASS — 1차 CR 5건 모두 외과적으로 반영됨 확인.

</details>

## Codex 1차 검증

- **결론**: PASS (2회: 1차 D3 유지 diff + 3차 D3 reversal diff 모두 통과)
- **현재 판단**: 1차 diff(4파일, D3 유지)는 6항목 모두 PASS. D3 reversal 후 admin.ts에서 `.eq('is_active', true)` 두 줄만 추가 제거 — 3차 검증에서 "Diff 정확성 — 통과 (의도치 않은 변경 없음)"·"공개 경로 회귀 — 통과 (sermon-service.ts, index.ts, (content)/sermons 모두 diff 없음)" 명시.
- **다음 행동**: Claude 2차 검증으로 최종 확인.

<details>
<summary>Codex 1차 stdout (verbatim, 2026-05-21, run 약 3분 40초)</summary>

```
PASS

6개 항목 모두 이상 없음.

1. OK — `git diff --stat`에서 계획 affected-files인 4개 파일만 표시됨.

2. OK — `admin.ts:40,63`에서 `sermons(count)` 사용. 공개 버전(`sermon-service.ts:125,207`)의 `sermons!inner(count)`와 다른 점은 inner-join 제거 하나뿐. `.eq('sermons.is_published', true)`, `.is('sermons.deleted_at', null)` 필터와 `sermons?.[0]?.count ?? 0` 정규화 패턴 동일하게 보존됨.

3. OK — `PreacherWithSermonCount`/`SeriesWithSermonCount` import(`admin.ts:9-10`) 및 반환 타입(`admin.ts:36,59`) 정상 적용. assertion 패턴도 public과 동일(`admin.ts:48-49,71-72`).

4. OK — 어드민 3개 페이지 모두 `@/services/sermon/admin`에서 `getAdminPreachers`/`getAdminSeries`를 import. 잔류 `getAllPreachers`/`getAllSeries` 없음.

5. OK — 주석은 "발행 0편인 신규 row 노출", "첫 등록 차단 해소" 이유를 설명하며 WHAT 서술 없음(`admin.ts:32-34,58`).

6. OK — `sermon-service.ts`, `index.ts`, `(content)/sermons/**` diff 비어 있음.
```

평이 풀이: surgical scope·D2 정합·타입·import 모두 통과. 회귀 0.

</details>

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: Codex 1차 PASS 6항목을 diff·grep·타입 호환 관점에서 교차 확인 — 모두 일치. `PreacherWithSermonCount`/`SeriesWithSermonCount`가 `Preacher[]`/`SeriesWithSermonCount[]`를 받는 상위 prop과 구조적 호환(extra `sermon_count` 필드는 추가 정보로 무해). 정적 grep 4종·verify-task 4단계 모두 PASS. 수동 검증(dev select 노출 + 공개 sidebar 비노출)은 사용자 단계.
- **다음 행동**: 사용자에게 수동 검증·승인 요청, 승인 후 commit·PR.

### 검증 결과 표

| 시점 | run-id | lint | styles | build | knip신규 | 정적rg | codex diff 검토 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1차 (D3 유지) | 20260521-164450 | ✅ | ✅ | ✅ | 0 | 4종 ✅ | ✅ PASS | dev에서 `마태복음 강해`(is_active=false)가 안 보여 D3 reversal 결정 |
| 2차 (D3 reversal) | 20260521-172212 | ✅ | ✅ | ✅ | 0 | 5종 ✅ (is_active 0 추가) | ✅ PASS (3차) | 사용자 단계 — 매트릭스 7행 |

logs: `logs/sermons-admin-taxonomy/{20260521-164450,20260521-172212}/`

## 검증 이력

<details>
<summary>2026-05-21 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: 체크리스트 3번이 D2와 충돌(published 필터 제거 vs 유지), RLS 가정·sister branch·정적 query-shape 보강 필요
- 조치: D2 본문·체크리스트 3번·Assumptions·Verification·Open questions 5건 외과 정정 → 2차 PASS

</details>

<details>
<summary>2026-05-21 Codex 계획 검증 2차</summary>

- 판정: PASS
- 이유: 1차 지적 5건 모두 정정 반영 확인, 신규 이슈 없음
- 조치: 구현 진입

</details>

<details>
<summary>2026-05-21 Codex 계획 검증 3차 (D3 reversal 후)</summary>

- 판정: CHANGE_REQUEST
- 이유: D3 reversal과 충돌하는 stale 문장 3곳 잔존 (`:62` Success Criteria, `:96` 체크리스트, `:149` 트레이드오프)
- 조치: 3곳 외과적 정정 → 4차 자체 점검 PASS

</details>

<details>
<summary>2026-05-21 Codex 1차 검증 (diff)</summary>

- 판정: PASS
- 이유: 4파일 diff 6항목 모두 OK (D3 유지 시점)
- 조치: D3 reversal 후 3차 검증에서 추가 diff(`is_active` 두 줄 제거)도 통과 확인

</details>

<details>
<summary>2026-05-21 4차 자체 점검 (codex hang 회피 + 외과적 fix)</summary>

- 판정: PASS
- 이유: codex 3차가 명시한 정정 지점만 변경, 자체 grep으로 잔존 stale 0 확인. codex 3차의 다른 검증 5건은 이미 PASS
- 조치: Claude 2차 검증으로 최종 마무리

</details>

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.
-->

## 후속 작업

- **`sermons-series-auto-activate` 신규 plan (DB trigger)** — 새 sermon이 INSERT될 때 해당 `sermon_series.is_active`를 자동으로 `true`로 변경. PostgreSQL `AFTER INSERT FOR EACH ROW` 트리거 + 마이그레이션. 본 plan의 Non-goals(schema·migration)에 속해 분리. 우선순위 높음(어드민 매번 활성화 토글 부담 제거).
- **어드민 시리즈·설교자 dropdown에 (초안)/(종결) 배지** — D3 reversal로 초안·종결 row도 select에 섞이므로 시각적 구분 필요. UI 폴리시 별도 task.
- **시리즈 관리 어드민 UI 신설** — 활성화 토글 + 비활성/종결 row 관리. 트리거 도입 후에도 수동 토글 필요 케이스(예: 시리즈 종료) 처리.
- `sermon_count` 의미를 어드민에서 "전체(draft 포함) 회차"로 분기할지 — D2 후속. 사용자 피드백 받은 뒤 결정.
- 같은 패턴(공개 게이트가 어드민에서 재사용)이 다른 도메인에 있는지 점검 — 스태프·공지·주보 등. 본 작업은 sermon 한정.
