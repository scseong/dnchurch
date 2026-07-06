# sermon-view-count-fix

- **상태**: ✅ 완료 (2026-07-02)
- **시작일**: 2026-07-02
- **브랜치**: develop (작업 브랜치 분리 예정: fix/sermon-view-count)
- **Open questions**: none
- **ADR needed**: no — 기존 레이어 패턴(서비스 RPC 호출 + Server Action 진입점) 안의 결함 수정. 새 구조·라이브러리·정책 없음

## 목표

설교 상세 방문 시 조회수가 실제로 +1 되게 한다. 지금은 dev DB 설교 9건 전부 `view_count = 0`이다 — RPC 오버로드 모호성, ISR 렌더 내 호출, 에러 무시 세 겹이 원인이다.

## 검증된 Assumptions

- 실 DB에 `increment_sermon_views`가 uuid·bigint 2개 오버로드로 존재. bigint 버전은 SECURITY INVOKER(DEFINER 아님), search_path 미고정 — `pg_get_functiondef` 조회 (2026-07-02)
- 생성 타입에 오버로드 모호성 에러 문자열 존재 — `src/types/database.types.ts:638-649` "Could not choose the best candidate function"
- `sermons` UPDATE RLS는 `sermons_update_admin`뿐 → INVOKER 함수로는 익명·일반 사용자 방문 시 UPDATE가 0행 무음 — advisor 정책 목록
- 호출부는 ISR 페이지 렌더 안 — `src/app/(content)/sermons/[id]/page.tsx:96` `incrementSermonViewCount(sermon.id).catch(() => {})`, 같은 파일 `:51` `revalidate = 86400`
- 서비스도 에러 미확인 — `src/services/sermon/sermon-service.ts:270-274` (rpc 결과 버림), 진입점 `src/services/sermon/index.ts:54-57`은 `createServerSideClient()` 사용(렌더 중 `cookies()` 접근)
- `view_count` 소비처는 admin 목록 정렬뿐 — `src/components/admin/sermons/SermonListPage/hooks/list-filter-params.ts:13`. 공개 상세에는 미표시 → 캐시 즉시 무효화 불필요
- dev DB 설교 9건 전부 `view_count = 0` — SQL 조회 (2026-07-02)

## Success Criteria

- [x] DB에 `increment_sermon_views` 오버로드가 bigint 1개만 존재 (`pg_proc` SQL 조회로 판정 — args `sermon_id bigint`, prosecdef true)
- [x] `yarn generate:types` 후 `database.types.ts`에 "Could not choose" 문자열 0건 (grep 0건, diff +4/−13)
- [x] dev에서 `/sermons/[id]` 방문 1회 → 해당 행 `view_count` +1 (id 5: 0→1, id 3: 0→1 — StrictMode에서도 정확히 +1)
- [x] 렌더 중 `cookies()` 호출 제거 확인 — build 마커는 D2 참조 (ƒ 표시는 회귀 아님, 대조군 동일)
- [x] `node scripts/verify-task.mjs sermon-view-count-fix` 통과 (run 20260702-141605)

## 접근법

1. **마이그레이션 1건** (dev 우선): uuid 오버로드 DROP + bigint 버전을 SECURITY DEFINER + `SET search_path = public, pg_temp`로 재생성. 대상을 `is_published = true AND deleted_at IS NULL`로 한정해 비공개 설교 조회수 조작을 막는다.
2. **조회수 증가 경로를 렌더 밖으로**: 클라이언트 tracker 컴포넌트(`SermonViewTracker`, useEffect 1회 실행)가 Server Action을 fire-and-forget 호출. ISR 페이지는 정적으로 남고, 방문마다 카운트된다.
3. **에러를 숨기지 않기**: 서비스는 rpc error를 throw, 액션은 catch 후 서버 로그(`console.error`) — 방문자 UX에는 영향 없음.
4. `page.tsx:96` 렌더 중 호출 제거 (+ 안 쓰게 된 import 정리).

## 영향받는 파일

- `supabase/migrations/<timestamp>_fix_increment_sermon_views.sql` (신규)
- `src/types/database.types.ts` (yarn generate:types 재생성)
- `src/services/sermon/sermon-service.ts` — `incrementViewCount` 에러 확인 추가
- `src/actions/sermon-views.action.ts` (신규) — 공개 액션 (admin CRUD인 `sermon.action.ts`와 분리)
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonViewTracker.tsx` (신규, 'use client')
- `src/app/(content)/sermons/[id]/page.tsx` — 렌더 중 호출 제거 + tracker 렌더

## Non-goals

- 다른 sermon RPC(create/update/delete_sermon, handle_new_user)의 search_path 고정 — P2(DB 위생 마이그레이션)에서 일괄
- 세션/쿠키 기반 중복 방문 dedup, rate-limit — 새로고침·반복 호출 재집계는 수용. 조회수는 admin 정렬용 근사치라 부풀리기 유인이 낮고, 방지 인프라 도입 비용이 더 크다
- route handler + sendBeacon 방식 — unload 시점 전송이 필요 없고 mount 시 +1로 충분해 의식적으로 제외
- notices의 view_count 증가 경로 — 별개 도메인
- 조회수 변경에 대한 updateTag — 공개 상세에 미표시, admin은 no-store라 불필요

## 단계별 체크리스트

- [x] 1. 마이그레이션 작성 + dev 적용 (MCP apply_migration) + 파일 커밋용 저장
- [x] 2. `yarn generate:types` → 오버로드 에러 문자열 소멸 확인
- [x] 3. 서비스 에러 확인 추가 (`sermon-service.ts:270`)
- [x] 4. `sermon-views.action.ts` + `SermonViewTracker.tsx` 작성, `page.tsx` 호출 이전 — dev StrictMode에서 Effect가 2회 실행되므로 tracker에 `useRef` 초기화 guard 포함 (Codex 1차 지적으로 boolean → sermonId 비교 ref로 교체)
- [x] 5. dev에서 방문 → SQL 전후 대조 — 값이 정확히 +1인지 확인 (StrictMode 이중 실행 영향 없음 판정)
- [x] 6. verify-task + build output 확인 (마커 해석은 D2)

## 의사결정 로그

- **D1 — Codex 계획 검증에서 나온 표현 지적 4건을 계획에 반영**
  - 문제: 계획 본문에 tracker의 StrictMode 이중 실행 대책과 공개 액션의 조회수 부풀리기 허용 근거가 안 적혀 있었다.
  - 해결: 구현 판단을 바꾸는 지적이 아니라서 수정 요청(CR) 없이 계획 문구만 갱신했다 — 체크리스트 4·5에 `useRef` 중복 실행 방지와 +1 정밀 확인을 명시하고, Non-goals에 rate-limit 미도입 근거와 sendBeacon 기각 사유를 추가했다.
  - 결과: 계획 갱신으로 종료, 구현 변경 없음.

- **D2 — SC4의 "build output ISR 표시" 기대를 정정**
  - 문제: `next build` 라우트 표에서 `/sermons/[id]`가 `ƒ (Dynamic)`으로 나와 SC 문구("ISR로 표시")와 안 맞았다.
  - 해결: 대조군으로 판단했다 — 같은 설정(revalidate 86400 + generateStaticParams 없음)이고 `cookies()` 호출이 원래 없던 `/sermons/series/[id]`도 똑같이 `ƒ`다. generateStaticParams가 없는 동적 세그먼트는 빌드 시점 프리렌더가 없어서 `ƒ`로 표시될 뿐이고, 첫 요청 후 revalidate 86400으로 캐시된다. 이번 변경의 목적인 "렌더 경로에서 동적 API 제거"는 코드로 확인했다(`page.tsx`에서 `incrementSermonViewCount` 제거, 남은 조회는 전부 static client).
  - 결과: SC4를 "렌더 중 cookies() 호출 제거"로 판정하고 충족 처리. 빌드 마커는 변경 전후 동일해 회귀 아님.

## Verification

- `node scripts/verify-task.mjs sermon-view-count-fix`
- SQL: `select id, view_count from sermons where id = <방문한 id>` 전후 대조
- `next build` output에서 `/sermons/[id]` 렌더링 모드 확인 (사용자 dev 서버 중지 상태에서만)

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence: high)
- **현재 판단**: material 지적 0건 — 5체크를 전부 충족한다고 봤다. 표현만 지적한 4건(useRef 방지 문구·조회수 부풀리기 허용 근거·StrictMode 검증 문구·sendBeacon 기각 기록)은 D1로 반영했다.
- **다음 행동**: WORK 진입. 재검증 요청 안 함 (3차 자동 호출 금지 규칙).

## Codex 1차 검증

- **결론**: FIX_APPLIED (지적 1건 반영 완료)
- **현재 판단**: boolean guard가 상세 간 이동(prop 교체) 시 두 번째 설교의 조회수를 막는다 → `trackedSermonId: useRef<number | null>` 비교로 교체했다 (`SermonViewTracker.tsx:13-19`).
- **다음 행동**: Claude 2차 검증 (verify-task — dev 서버 중지 후)

### Codex 1차 검증 결과 (verbatim)

> `hasTracked`가 boolean `useRef`라, 같은 컴포넌트 인스턴스에서 `sermonId` prop이 바뀌어도 액션이 두 번째부터 실행되지 않습니다. App Router에서 설교 상세 → 다른 설교 상세로 client-side 내비게이션이 일어나면 컴포넌트가 unmount 없이 prop만 바뀔 수 있고, 두 번째 설교의 조회수가 누락됩니다.

풀이: 상세 간 이동은 컴포넌트를 unmount하지 않을 수 있어 boolean guard가 두 번째 집계를 막는다.

이상 없다고 본 항목:
- (a) primitive prop만 받는 클라이언트 컴포넌트라 ISR이 유지된다
- (b) 익명 컨텍스트 RPC는 SECURITY DEFINER + 기존 EXECUTE 권한 보존으로 동작한다
- (c) fragment 내 배치는 hydration 문제가 없다
- 마이그레이션의 파라미터 이름·search_path·공개 조건이 계획과 일치한다

## Claude 2차 검증

- **최종 판단**: PASS — Codex 수정분(tracker ref 교체)까지 diff 재확인, 실측 +1 확인, verify-task 통과.
- **현재 판단**: Codex가 고친 범위는 `SermonViewTracker.tsx`의 guard 로직뿐이고 의도(상세 간 이동 재집계)와 일치한다. knip 경고는 기존 부채이며 이번 신규 파일 관련 경고는 0건 (`knip.log` grep).
- **다음 행동**: 사용자 승인 후 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260702-141605 | ✅ | ✅ | ✅ | 0 | 실측 +1 (id 5·3, StrictMode 이중 집계 없음) |
| 2차 (문서 갱신 후 재검증, harness-gate 통과) | 20260702-143454 | ✅ | ✅ | ✅ | 0 | — |

## 검증 이력

## PR 리뷰 대응

| 지적 | 출처 | 대조 | 판정 | 조치 |
| --- | --- | --- | --- | --- |
| 실패 로그에 sermonId 컨텍스트 누락 | PR #137 Gemini 인라인 (id 3510728337, `sermon-views.action.ts:13`) | 코드 확인 — console.error 메시지에 sermonId 없음 | 타당 | 템플릿 리터럴로 sermonId 포함, 커밋 8e2d800, verify run 20260702-145247, 답글 r3510784851 |

## 후속 작업

- P2 DB 위생 마이그레이션 (RLS initplan 래핑·중복 permissive 정책 분리·sermon RPC search_path·중복 인덱스·FK 인덱스)
  - 이유: 이번 범위는 조회수 결함만 — 위생 항목을 섞으면 diff가 비대해진다
  - 다음 기준: 본 task 머지 후 우선순위 합의대로
  - 기록 위치: `docs/tech-debt/active.md` (완료 이관 시 등록 — 감사 문서는 로컬 보관이라 부채 파일로 옮김)

## 회고

- **잘된 것**: 증상 하나(view_count 0)에 원인이 세 겹(RPC 오버로드 모호성·SECURITY INVOKER+RLS 무음 UPDATE·ISR 렌더 내 호출)으로 겹친 걸 층별 증거(생성 타입의 에러 문자열, `pg_proc` 조회, RLS 정책 목록, 빌드 마커 대조군)로 분리 진단했다. Codex 1차 검증이 tracker의 boolean guard 결함(상세 간 이동 시 두 번째 설교 누락)을 실측 전에 잡았다. 수정 후 브라우저 방문 실측 0→1로 닫았다 (StrictMode 이중 집계 없음).
- **다음에 할 것**: ① `sermons-static-rendering` — `/sermons/[id]`·`/sermons/series/[id]`에 generateStaticParams, `/sermons`의 레거시 redirect를 next.config로 이전해 정적화, `getFilteredSermons` 캐시 전환. ② DB 위생 마이그레이션 — 아래 부채 등록 참조.
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: 신규 코드 부채 없음 (knip 경고는 기존 부채, 이번 신규 파일 관련 0건). 2026-07-02 리팩토링 감사에서 확인한 DB 위생 항목(sermon RPC search_path 미고정 5종, RLS `auth.uid()` 미래핑 14정책, 중복 permissive 정책, 중복 인덱스, FK 인덱스 누락)을 tech-debt로 등록.
