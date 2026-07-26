# perf-audit-fixes

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-24
- **브랜치**: feat/mypage-parity-touchup
- **Open questions**: none
- **ADR needed**: no — 기존 레이어·인증·캐시 정책 안에서의 성능 수정, 새 패턴 도입 없음 (RPC는 record_prior_chapters 선례 반복)

## 목표

성능 감사에서 확정한 결함과 확장성 이슈를 우선순위 순서로 고친다. 수정 전후로 네트워크 요청 수와 리렌더 횟수를 재서 효과를 기록한다.

## 검증된 Assumptions

- `useTimer.start()`가 기존 interval을 정리하지 않고 `intervalRef.current`를 덮어쓴다 — `src/hooks/useTimer.tsx:31-39` Read. 소비처는 `ForgetPasswordFlow.tsx` 하나뿐이고 발송(:49)·재전송(:63)에서 `start()`를 다시 부른다.
- `useToastStore()`를 selector 없이 부르는 파일 15개 — `rg "useToastStore()"` 결과 (TrackerSection, ShareSheet×2, SermonListPage, SermonFormShell, AccountMenu, ProfileEditModal, PasswordChangeModal, useSignOut, CopyChip, NewFamilyRegister, GalleryPostSheet, GalleryComposeSheet, BulletinShareCard, ToastContainer).
- `bible_reading_records`는 unique(user_id, book_order, chapter, read_date) + prior 부분 unique(user_id, book_order, chapter, cycle) where read_date is null — `supabase/migrations/20260717000000`, `20260720000000` Read. `record_prior_chapters` RPC가 settings의 current_cycle을 파라미터로 받아 on conflict do nothing insert하는 선례가 이미 있다.
- ~~파생 함수 중 전 회차 행이 필요한 것은 `countByDate` 기반뿐~~ → 폐기: `computeTodayEntries`(`bible-tracker.ts:121-128`)와 Recorder 날짜 상세(`Recorder.tsx:64-78,137`)는 cycle 필터 없이 임의 날짜의 book/chapter 행을 요구하고, Recorder 날짜 탐색은 과거로 무제한이다(`Recorder.tsx:90-94` — 하한 없음). 회차 전환 이전 날짜의 행은 현재 회차 페치에 없어 상세가 깨진다 (Codex 계획 검증 CR).
- `recordChaptersAction`은 요청마다 Supabase 왕복 3회(auth.getUser → settings select → upsert) — `src/actions/bible-reading.action.ts:29-65` Read. `startNextCycleAction`은 완주 확인을 위해 현재 회차 전 행을 페이지네이션으로 내려받아 JS에서 distinct를 센다(:204-223).
- `getBibleReadingRecords`는 전 회차 행을 PAGE_SIZE 1000 순차 루프로 전부 가져온다 — `src/apis/bible-reading.ts:8-28` Read. /mypage 서버 렌더마다 실행된다.

## Success Criteria

- 인증코드 재전송 2회 후 살아있는 interval이 1개다 (dev 콘솔 계측으로 확인).
- 토스트가 뜰 때 `toasts` 상태를 안 쓰는 소비 컴포넌트(예: TrackerSection)의 리렌더가 0회다 (dev 임시 계측으로 확인, 계측 코드는 커밋 전 제거).
- /mypage 서버 렌더의 `bible_reading_records` 페이지 조회가 순차가 아니라 병렬로 나간다: 첫 페이지 응답의 count로 남은 페이지를 `Promise.all`로 요청한다 (코드 + dev 로그로 확인). 3,610행 렌더 시간은 참고 지표로 기록한다.
- 장 기록 액션 내부 Supabase 왕복이 3회 → 2회다 (getUser + RPC 1회).
- 트래커 회귀 없음: 기록/해제, prior 기록/해제, 오늘·주간·월간·streak·통독 수치, 공유 시트가 수정 전과 같게 동작한다 (dev 실측).
- `node scripts/verify-task.mjs perf-audit-fixes` 통과.

## Non-goals

- 장 탭 클라이언트 배치(디바운스 묶음 전송) — 낙관적 UI 동작이 바뀌는 별도 작업.
- BottomSheet 닫힘 상태 unmount 전략 변경 — 애니메이션 트레이드오프 별도 판단.
- React.memo 전면 도입, 기존 dead code 정리.

## 영향받는 파일

- Phase 1: `src/hooks/useTimer.tsx`, toast 소비 15개 파일, `src/app/(content)/mypage/_component/tracker/Recorder.tsx`
- Phase 2: `supabase/migrations/<new>`, `src/types/database.types.ts`(재생성), `src/apis/bible-reading.ts`, `src/actions/bible-reading.action.ts`, `src/services/sermon/sermon-service.ts`(adminStatusCounts)

## 단계별 체크리스트

측정(M)은 dev 서버 + Chrome으로 수정 전 baseline을 먼저 뜨고, 각 수정 후 같은 시나리오를 다시 잰다. 로그인 세션을 못 얻으면 정적 산정(요청 수 계산)으로 대체하고 그 사실을 기록한다.

- [x] M0. baseline 측정 — /mypage 로드 시 Supabase 요청 수·행 수, 장 탭 1회당 요청 수 (토스트 리렌더는 2번 단계에서 계측과 함께 측정)
- [x] 1. `useTimer.start()`에 기존 interval 정리 선행 (Fix 커밋)
- [x] 2. toast 소비 15개 파일 selector 구독 전환 (Refactor 커밋)
- [x] 3. Recorder 파생 계산 3곳 useMemo (Refactor 커밋)
- [x] 4. `getBibleReadingRecords` 페이지 요청을 병렬로 전환: 첫 페이지에 `count: 'exact'`를 붙여 총 행 수를 받고, 남은 페이지를 `Promise.all`로 요청 (Refactor 커밋 — 마이그레이션·동작 변경 없음)
- [x] 5. 마이그레이션: `record_chapters` RPC(settings 조회 + insert 통합) + `count_cycle_chapters` RPC(distinct 카운트) — dev 프로젝트 적용 + `yarn generate:types` 완료
- [x] 6. `recordChaptersAction`을 RPC 1회로 통합 (3→2 왕복), `startNextCycleAction`을 distinct 카운트 RPC로 전환 (5번 마이그레이션과 같은 Refactor 커밋)
- [x] 7. `adminStatusCounts`를 head-count 2회로 전환 (Refactor 커밋)
- [x] M1. 수정 후 측정 — 아래 `## 측정 기록` M1 표 참조

## Verification

- `node scripts/verify-task.mjs perf-audit-fixes`
- 트래커 회귀 실측: dev 서버에서 기록/해제·prior·공유·주간/월간 수치 확인

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high)
- **현재 판단**: CR 1건(material) 반영 완료 — D1(현재 회차 행 + 날짜 집계) 폐기, D2(병렬 페이지네이션)로 교체. 1·2·3·5·6번 항목은 문제없음 판정.
- **다음 행동**: WORK 진입 (SKILL 기준 CR은 plan 수정 후 재요청 없이 진행)

Codex 지적 verbatim (4번 항목, material):

> plan은 "현재 회차 행 + 날짜별 집계"만으로 기존 동작 유지가 가능하다고 한다. 하지만 `computeTodayEntries`는 `src/utils/bible-tracker.ts:121-128`에서 cycle 필터 없이 오늘의 책/장 범위를 만들고, `Recorder.tsx:64-68`, `:137`도 임의 날짜의 book/chapter 상세를 요구한다. 예: 2026-07-01에 cycle 1 `창세기 1장`을 읽고 cycle 2로 넘어간 뒤 같은 날짜를 열면, 현재 회차 행에는 해당 장이 없고 날짜별 count aggregate 1개로는 `book_order/chapter`를 복원할 수 없다.
>
> **CR 해소 방법**: plan 4/5단계에서 "현재 회차 행 + 날짜별 count aggregate"만으로 상세 UI를 유지한다는 주장을 제거해야 한다. 최소 수정안은 `todayEntries`와 Recorder 선택 날짜의 `book_order/chapter` 상세를 보존할 별도 RPC/쿼리(초기 today 상세 또는 날짜 선택 시 lazy fetch)를 명시하고, Success Criteria의 "2회 고정"을 그 데이터 계약에 맞게 바꾸는 것이다.

풀이: 회차를 넘긴 뒤 과거 날짜를 열면 그 날짜의 장 상세가 사라진다는 지적이다. lazy fetch 대신 페치 범위를 유지하고 병렬 요청으로 바꾸는 쪽(D2)으로 계획을 바꿔 해소했다.

## Codex 1차 검증

- **결론**: FIX_APPLIED — 수정 1건 / 반환 0건
- **현재 판단**: material finding 없음 — useTimer stop 선행, toast 잔여 무selector 0건, Recorder memo dependency, RPC 마이그레이션의 unique/RLS 정합, adminStatusCounts 집계 의미 유지 모두 확인. `yarn tsc --noEmit`·대상 파일 eslint·`git diff --check` 통과.
- **다음 행동**: Codex 수정분 교차 확인 후 커밋 (Claude 2차 검증 참조)

Codex 수정 verbatim:

> 수정함: `src/apis/bible-reading.ts:26`에 `count === null` fallback을 추가했습니다. 기존 구현은 `count`가 `null`이고 첫 페이지가 1,000행이면 `total = records.length`가 되어 1,001번째 이후 기록을 반환하지 못하는 시나리오가 있었습니다. 지금은 `src/apis/bible-reading.ts:27`부터 기존 순차 페이지 방식으로 나머지를 읽습니다.

풀이: count 헤더가 안 오는 예외 상황에서 기록이 1,000행에서 잘리는 구멍을 막았다 — 그 경우에만 이전의 순차 루프 방식으로 되돌아간다.

## Codex 원점 재검토 (4번 항목)

- **결론**: FIX_APPLIED — 첫 페이지에서 총 행 수를 받고 남은 페이지를 `Promise.all`로 병렬 요청하는 구조는 그대로 두고, 정렬 키에 빠져 있던 `cycle`을 더했다
- **현재 판단**: 지적이 맞아 고쳤다. `src/apis/bible-reading.ts`의 정렬에 `.order('cycle')`을 마지막 키로 더해 어떤 두 행도 순서가 같아지지 않게 했다 (원인과 판단 근거는 의사결정 로그 D3 참조).
- **다음 행동**: verify-task 3차 실행 통과 확인 완료, 사용자 승인 후 커밋

Codex 지적 verbatim (핵심 결함):

> 실제 문제는 정렬이 total order가 아니라는 점입니다. dated row는 기존 unique `(user_id, book_order, chapter, read_date)`로 tie가 막히지만, `read_date null` prior row는 cycle별 중복이 허용되는 별도 partial unique가 있습니다. 현재 order는 `read_date, book_order, chapter`까지만 있어 cycle 1/2 prior row가 동률입니다. 이 tie가 page 경계에 걸리면 병렬 offset page 간 duplicate/skip 가능성이 생깁니다.

풀이: 같은 장을 1회차와 2회차에 모두 "이전에 읽음"으로 기록한 사용자에게서만 생기는 구멍이다. 정렬 키에 cycle을 더하면 어떤 행 조합에서도 순서가 하나로 정해져 페이지가 어긋나지 않는다.

같이 확인한 것 — 아래 4건은 코드를 바꾸지 않기로 했다.

- `count: 'exact'`를 그대로 쓴다. `planned`·`estimated` 추정값은 1행만 틀려도 마지막 페이지를 놓친다.
- 다음 페이지를 미리 받아두는 방식(speculative prefetch)은 쓰지 않는다. 기록이 적은 사용자에게 빈 페이지 요청만 늘어난다.
- `createServerSideClient()`를 그대로 쓴다. 본인 행만 읽는 owner RLS(행 수준 접근 제어) 경로라 캐시 클라이언트로 바꾸면 다른 사용자와 결과가 섞인다.
- RPC 집계와 keyset 커서(마지막 행 값을 기준으로 다음 페이지를 읽는 방식) 전환은 지금 규모(수천 행)에서는 필요 없다.

이 4건은 Claude 자체 검증 8개 항목과 결론이 같다.

## Claude 2차 검증

- **최종 판단**: PASS — 3차 실행(20260726-214033)까지 lint·styles·build 통과, knip 경고는 전부 기존 부채(UI barrel 타입 등, 이번 변경 파일 0건)
- **현재 판단**: PASS. Codex가 고친 `count === null` 폴백과 원점 재검토로 더한 `cycle` 정렬 키를 코드로 교차 확인했다. 폴백 루프 조건 `records.length === from`은 마지막 페이지가 가득 찼을 때만 다음 페이지를 읽는 기존 순차 구현과 같은 의미고, 정렬 키는 read_date·book_order·chapter·cycle 4개가 되어 마이그레이션의 두 유니크 제약 어느 쪽에서도 순서가 하나로 정해진다.
- **다음 행동**: 사용자 승인 후 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260724-145024 | ✅ | ✅ | ✅ | 0 | — (트래커 회귀는 측정 기록의 dev 실측으로 확인) |
| 2차 (Codex 폴백 가드 반영) | 20260724-151155 | ✅ | ✅ | ✅ | 0 | — |
| 3차 (원점 재검토 cycle 정렬 키 반영) | 20260726-214033 | ✅ | ✅ | ✅ | 0 | — |

## 검증 이력

## ADR 판단

불필요 — `src/apis`·`src/services`·`src/actions` 변경은 기존 레이어 서열과 클라이언트 구분(`createServerSideClient`) 안에서의 쿼리 축소와 RPC 이관이고, 새 라이브러리도 새 패턴도 정책 변경도 없다. D4(기록 전체 로드 후 클라이언트 파생)의 로드 범위 축소는 아래 의사결정 로그 D1에 기록한다.

## 의사결정 로그

- **D1 — /mypage 기록 로드를 "현재 회차 행 + 날짜별 집계"로 줄인다**
  - 문제: 기록은 회차가 쌓일수록 늘고(회차당 1,189행 이상), PAGE_SIZE 1000 순차 루프라 1,000행을 넘길 때마다 서버 렌더 왕복이 하나씩 는다.
  - 해결: 날짜별 카운트는 RPC 집계로 받고 행은 현재 회차만 받으려 했다.
  - 결과: ⚠️ 정정(Codex 계획 검증 CR): 폐기했다(D2 참조). `computeTodayEntries`와 Recorder 날짜 상세는 회차 전환 이전 날짜의 book/chapter 행이 필요한데, 날짜별 count 집계로는 복원할 수 없다.
- **D2 — 페치 범위는 그대로 두고 페이지 요청만 병렬로 바꾼다**
  - 문제: D1이 날짜 상세를 깨뜨리고, 이를 살리려면 임의 날짜 lazy fetch(클라이언트 캐시·로딩 상태·낙관적 병합)가 필요해 수정 범위가 커진다.
  - 해결: 이 서비스의 기록 증가 속도는 사용자당 연 2,000~3,000행 수준이라 응답 전송량 자체는 수년간 문제가 아니고, M0 실측에서 병목은 순차 왕복이었다(3,610행에서 4요청 순차). 첫 페이지에 `count: 'exact'`를 붙여 총 행 수를 받고 남은 페이지를 `Promise.all`로 병렬 요청한다. lazy fetch 대안은 규모 대비 복잡도가 과해 기각.
  - 결과: 동작과 데이터 계약이 전혀 안 바뀌고, 페치 소요가 페이지 수에 비례하던 것이 병렬 1단계로 줄어든다. 전송량이 행 수에 비례해 계속 커지는 문제는 남는 부채로, 행 수가 1만을 넘는 사용자가 나오면 lazy fetch를 다시 검토한다 (후속 작업에 기록).
- **D3 — 기록 조회 정렬 키에 cycle을 더한다 (Codex 원점 재검토 반영)**
  - 문제: prior 행(read_date null)은 부분 유니크가 (사용자·책·장·회차)라서 같은 책·장이 회차만 다르게 두 번 들어갈 수 있다. 정렬 키가 read_date·book_order·chapter 3개뿐이면 그 두 행은 순서가 같아지고, 페이지 경계에 걸리면 병렬 offset 페이지 사이에서 행이 중복되거나 빠질 수 있다.
  - 해결: `src/apis/bible-reading.ts` 정렬에 `.order('cycle')`을 마지막 키로 더했다.
  - 결과: 어떤 행 조합에서도 순서가 하나로 정해져 페이지가 어긋나지 않는다. 응답 내용과 데이터 계약은 그대로다.

## 후속 작업

- 장 탭 배치 전송(디바운스로 여러 장을 한 액션에 묶기)
  - 이유: 낙관적 UI 실패 롤백 단위가 바뀌는 UX 판단이 필요하다.
  - 다음 기준: 기록 액션 지연이 실사용에서 문제로 보고될 때.
  - 기록 위치: 없음
- BottomSheet 닫힘 상태 children 렌더 생략
  - 이유: 슬라이드 애니메이션과 트레이드오프라 공용 컴포넌트 정책 판단이 필요하다.
  - 다음 기준: 시트가 무거운 화면(월간 42셀 이상)이 더 생길 때.
  - 기록 위치: 없음
- 기록 행 1만 초과 사용자 대응 (날짜 상세 lazy fetch)
  - 이유: D2 참조 — 지금 규모에서는 병렬 페이지네이션으로 충분하고, lazy fetch는 복잡도가 과하다.
  - 다음 기준: `bible_reading_records`에 행 1만 초과 사용자가 나올 때.
  - 기록 위치: `docs/tech-debt/active.md`
- /mypage의 `departments`·`districts` 조회를 정적 캐시로 전환 (M0 측정 중 dev 로그에서 발견 — 매 렌더 no-store 2요청)
  - 이유: 공개 참조 데이터인데 `createServerSideClient` 경로로 매번 조회한다. 캐시 클라이언트 구분 판단이 필요해 이번 범위 밖.
  - 다음 기준: 이번 작업 머지 후 별도 소작업.
  - 기록 위치: 없음

## 측정 기록

측정 환경: dev 서버(Turbopack) + dev Supabase 프로젝트, 테스트 계정(실제 기록 76행). 회독 누적 상황은 합성 행 3,534개(cycle 999, read_date 2023년 — 화면 통계에 안 잡히는 값)를 넣어 총 3,610행으로 재현했다. 합성 행은 M1 측정 후 `cycle = 999` 조건으로 삭제한다. 시간 값은 dev 서버 로그(`GET /mypage 200 in …`) 기준이라 편차가 크다 — 판정은 요청 수(결정적)를 우선한다.

### M0 baseline (수정 전)

| 시나리오 | records 요청 수 | 서버 렌더 시간 (표본) |
| --- | --- | --- |
| /mypage 로드, 76행 | 1회 | 954ms / 1398ms / 1781ms |
| /mypage 로드, 3,610행 | 4회 순차 (offset 0/1000/2000/3000) | 2.9s / 4.1s / 8.4s |
| 장 기록 1탭 | 내부 3회 순차 (getUser 37ms → settings 330ms → upsert 216ms) | 액션 전체 1721ms |
| 장 해제 1탭 | 내부 2회 (getUser 48ms → delete 335ms) | 액션 전체 661ms |

로그에서 추가로 본 것: /mypage 서버 렌더가 `departments`·`districts` 참조 데이터도 매번 no-store로 조회한다(프로필 수정 모달용). 이번 범위 밖 — 후속 작업에 기록.

### M1 수정 후 (같은 시나리오)

| 시나리오 | 결과 | baseline 대비 |
| --- | --- | --- |
| /mypage 로드, 3,610행 | records 요청 4회가 병렬로 나감 (dev 로그에서 offset 1000/2000/3000 응답이 순서 뒤섞여 완료). 렌더 797ms / 1007ms / 1641ms (+ Supabase 지연 outlier 5.5s 1회) | 렌더 2.9~8.4s → 0.8~1.6s |
| 장 기록 1탭 | 내부 2회 순차 (getUser 57ms → rpc/record_chapters 441ms) | 내부 3회 → 2회 |
| 토스트 1회 (등장+자동 해제) | TrackerSection 리렌더 0회 (selector 구독) | 4회 → 0회 (selector 없는 구독으로 되돌려 재측정: 등장 2회 + 해제 2회, StrictMode 이중 렌더 포함) |

리렌더 측정 방법: TrackerSection에 `console.count` 임시 계측을 넣고 공유 시트의 링크 복사로 info 토스트를 띄워 콘솔 횟수를 세었다. 계측 코드는 측정 후 제거했다. 합성 행 3,534개는 M1 측정 후 `cycle = 999` 조건으로 삭제해 원상 복구했다(잔여 76행 확인).

회귀 실측: 기록 1탭 → 해제 1탭(데이터 원복), 주간·월간 뷰 수치, prior 모드 통독 진행(창세기 32/50, 출애굽기 40/40), 공유 시트 열기·링크 복사 — 모두 수정 전과 같게 동작.
