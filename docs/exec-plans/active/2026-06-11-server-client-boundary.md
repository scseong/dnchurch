# server-client-boundary

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-11
- **브랜치**: refactor/server-client-boundary
- **Open questions**: none
- **ADR needed**: yes — Server Action 공통 패턴(도메인별 위치·수동 검증·`{ success, message }` 반환·태그 기본 revalidate)은 영구 패턴 결정. 커밋 6 전 `server-action-conventions`로 작성

## 목표

작업은 세 갈래다.

1. 'use client' 경계를 리프로 내린다 (설교 상세·공지 목록 중심)
2. 누락된 loading/error/Suspense를 보완한다
3. auth 2건(signUp·재설정 메일)을 Server Action으로 전환한다

페이지 데이터 페칭과 DB write는 이미 전부 서버라 이동 대상이 없다 — Phase 0 진단으로 확인됨.

## 검증된 Assumptions

- `SermonDetailPage.tsx`에 훅·이벤트 핸들러 0개, props는 서버 page가 전달 — Read 직접 확인 + Codex CONFIRMED (`sermons/[id]/page.tsx:105-109`)
- `CloudinaryImage`는 인라인 `loader` 함수 prop(`CloudinaryImage.tsx:33`) 때문에 'use client' 필수 — Read 직접 확인, (c)→(a) 정정
- 클라이언트 직접 DB write 0건. 클라 직접 Supabase는 auth 6건(`src/apis/auth.ts`) + 프로필 조회(`src/apis/user.ts`, 읽기 전용) — grep 전수 + Codex 검증
- Route Handler 2개는 외부 진입점(OAuth 콜백·이메일 링크)이라 유지 — Codex CONFIRMED (`auth/callback/route.ts:4-11`, `auth/reset-password/route.ts:4-17`)
- 액션 반환 형태 `{ success: boolean; message: string }` 5곳 통일 — grep 확인 (`sermon.action.ts:141,183`, `create-bulletin.action.ts:20-25`)
- `updateTag`는 `next/cache` API. 액션에서 태그 4종 호출 중 — grep 확인 (`sermon.action.ts:170,223,247`, `create-bulletin.action.ts:47`, `update-bulletin.action.ts:83-84`)
- 모든 도메인 캐시 키가 ROOT 태그를 포함 — Read 확인 (`bulletin-cache.ts:3-19`의 `ROOT = 'bulletin'`, `sermon-cache.ts`·`notice-cache.ts`·`worship-cache.ts` 동일 구조). ROOT 태그 1개 무효화로 도메인 전체 캐시가 갱신됨
- `about/loading.tsx` 1개로 하위 7개 라우트 커버 (nearest-ancestor 경계) — Codex CONFIRMED

## Success Criteria

- `SermonDetailPage.tsx`에서 'use client' 제거 후 build 통과, /sermons/[id]의 영상 재생·탭 전환·북마크·공유 동작
- about(7)·news에 loading.tsx, 루트에 global-error.tsx, `(admin)`에 loading.tsx 추가 후 build 통과 (홈 폴백은 섹션 Suspense가 대체 — D7)
- 홈 async 섹션 3개(Banner·RecentSermons·FeedSection)가 각각 Suspense로 격리
- (c)/(d) 지시어 제거 5개 파일(BoardBody·SeriesFilter·PreacherFilter·CategoryBottomSheet·TextField) + bulletins/not-found Link 전환 후 build·lint 통과
- /news/notices에서 클라 경계가 drawer·행 클릭 단위로 축소되고 목록·정렬·drawer·페이지네이션 동작 유지
- signUp·재설정 메일이 `src/actions/auth.action.ts` 경유 + 서버 입력 검증, 가입 직후 리다이렉트·프로필 반영 동작 (세션 재동기화 설계 포함)
- bulletin create/update 액션이 D4 태그 대체표대로 `updateTag('bulletin')`로 갱신하고, 주보 생성·수정 직후 목록(`/news/bulletins`)·요약(`/news`)·상세·nav 화면에 반영됨
- `sermons/series/[id]`에 `revalidate = 86400`, /news 중복 URL 정리
- `node scripts/verify-task.mjs server-client-boundary` 통과

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` (지시어 1줄)
- `src/app/(content)/about/loading.tsx`, `src/app/(content)/news/**/loading.tsx·error.tsx`, `src/app/global-error.tsx`, `src/app/(admin)/loading.tsx` (신규)
- `src/app/(content)/page.tsx` + 홈 섹션 skeleton (Suspense)
- `src/components/board/BoardBody.tsx`, `src/components/admin/sermons/SermonListPage/parts/{SeriesFilter,PreacherFilter}.tsx`, `src/app/(content)/news/notices/_component/CategoryBottomSheet.tsx`, `src/components/ui/TextField/TextField.tsx`, `src/app/(content)/news/bulletins/not-found.tsx`
- `src/app/(content)/news/notices/_component/{NoticeListClient,NoticeTable}.tsx` (재구성)
- `src/actions/auth.action.ts` (신규), `src/app/_component/auth/{SignUpForm,EmailVerificationRequestForm}.tsx`, `src/apis/auth.ts`
- `src/actions/create-bulletin.action.ts`, `src/actions/update-bulletin.action.ts` (revalidate 태그 표준화)
- `src/app/(content)/sermons/series/[id]/page.tsx`, `src/app/(content)/news/page.tsx`

## 단계별 체크리스트 (한 항목 = 한 커밋)

- [x] 1. Refactor: SermonDetailPage 서버 컴포넌트화 — 지시어 제거, /sermons/[id] 동작 확인 (`0d5e4c1`)
- [x] 2. Feat: loading/error 보완 — about·news·홈 loading, global-error, (admin) loading (`6424609`)
- [x] 3. Feat: 홈 섹션 Suspense 스트리밍 — 섹션별 skeleton (`ac7805c`)
- [x] 4. Refactor: 무의미 'use client' 제거 묶음 — 5개 파일 + not-found Link 전환 (`0015e86`)
- [x] 5. Refactor: notices 경계 축소 — drawer 상태·행 클릭만 클라로, DTO 축소 포함 (`9aeb1c1`) + (content) 광역 loading 제거 (`b75df20`, D7)
- [x] 6. Feat: signUp Server Action 전환 — 서버 검증 + 세션 재동기화, ADR 0016 작성 (`346d8eb`)
- [x] 7. Feat: 재설정 메일 Server Action 전환 (`5c47850`)
- [x] 8. Refactor: bulletin 액션 revalidate를 태그 표준으로 교체 — D4의 태그 대체표 적용 (`7493e83`)
- [x] 9. Chore: series/[id] revalidate 86400 + /news canonical 정리 (`5b92747`)

## Non-goals

- admin 테이블 분리(SermonTable·MobileCardList), 소형 (b) 9건(Pill·ImagePreview·FeedContent·NewHere·ActiveFilters·AdminHeader·PageHeader·VideoCard·LatestBulletinImages) — 효과 대비 비용, 사용자 확정으로 제외
- signInWithPassword·signOut·카카오 OAuth 전환 — 세션 흐름 재작업 비용 큼
- queueMicrotask 4건 제거와 쓰이지 않는 코드 2건(`SeriesEpisodeList` import 0건, `apis/auth.ts`의 `updatePassword` 호출자 0건) 정리는 이번 범위 밖 — 후속 작업 참조
- RPC 내부 검증·RLS 정책 점검 — DB 범위, 이번 조사 밖

## 의사결정 로그

- **D1 — 비목표 3건을 범위에서 제외한다**
  - 문제: 진단이 찾은 개선 후보 전부를 한 task에 담으면 커밋 13개 이상으로 커진다.
  - 해결: admin 테이블 분리·소형 (b) 9건·signInWithPassword 전환을 제외하는 안을 제시했고 사용자가 확정했다. Codex도 비목표 3건 모두 근거 타당(SAFE) 판정.
  - 결과: 커밋 8개로 범위 고정.
- **D2 — Server Action 파일은 도메인별 `src/actions/`로 통일한다**
  - 문제: 도메인별(주보·설교·공지)과 라우트 로컬(reset-password) 두 방식이 공존한다.
  - 해결: 다수 패턴이고 레이어 규칙(apis→services→actions→app)과 맞는 도메인별 방식을 사용자가 선택했다. auth 전환분은 `auth.action.ts` 신설.
  - 결과: 새 auth 액션은 `src/actions/auth.action.ts`에 둔다. reset-password 이동은 이번 범위 아님.
- **D3 — 입력 검증은 수동 검증 + 도메인 헬퍼를 유지한다**
  - 문제: Server Action 전환 시 검증 방식을 정해야 한다.
  - 해결: zod 미도입 정책(프로젝트 결정)이 있고 현행 `checkAdminPermission`·`validateFiles`·`validateSermonAction` 패턴이 검증돼 있어 사용자가 현행 유지를 선택했다.
  - 결과: 의존성 추가 없음. auth 액션도 같은 패턴으로 작성.
- **D4 — 갱신은 태그 revalidate를 기본으로 한다**
  - 문제: sermon은 태그만, bulletin은 경로+태그 병행으로 도메인마다 달랐고, 임시 지침은 "revalidatePath 기본"이었다.
  - 해결: 캐시 인프라가 태그 기반(`createStaticClient` + force-cache)이고 sermon이 ROOT 태그 1줄로 5개 라우트를 커버하는 동작 증명이 있어, 경로 나열(화면 추가 때마다 액션 수정·누락 사고) 대신 태그 기본을 권고했고 사용자가 동의했다. 임시 지침(CLAUDE.local.md)도 같이 수정했다. 트레이드오프 상세는 참고 자료의 진단 문서 참조.
  - 결과: bulletin 액션을 아래 태그 대체표대로 정리한다 (체크리스트 8, Codex 계획 검증 CR 조치).

  | 현행 (create/update-bulletin.action.ts) | 대체 | 근거 |
  | --- | --- | --- |
  | `revalidatePath('/news/bulletins')` + `revalidatePath('/news')` | `updateTag('bulletin')` (ROOT) | 목록·요약 캐시 태그가 `['bulletin', 'bulletin-list']`·`['bulletin', 'bulletin-summary']` (`bulletin-cache.ts:6-13`) — ROOT가 전부 포함 |
  | `updateTag('bulletin-nav')` (`create:47`) | `updateTag('bulletin')`에 흡수 — 제거 | nav 태그도 ROOT 포함 (`bulletin-cache.ts:17-19`) |
  | `updateTag('bulletin-detail')` + `updateTag('bulletin-detail-nav')` (`update:83-84`) | `updateTag('bulletin')`에 흡수 — 제거 | detail 태그도 ROOT 포함 (`bulletin-cache.ts:14-16`) |

  - 참고 (Codex 재검증 지적, expression-only): 기존 `updateTag('bulletin-detail-nav')`(`update:84`)는 `bulletin-cache.ts` 캐시 키에 없는 태그라 효과 없는 호출이었다 — 표준화로 함께 제거된다.

- **D5 — 에러 반환은 `{ success, message }`를 `ActionResult` 타입으로 명문화한다**
  - 문제: 액션 5곳이 같은 형태를 쓰지만 공유 타입 없이 각자 inline 선언이다 (`sermon.action.ts:141,183` 등).
  - 해결: discriminated union(필드별 에러)은 현재 폼 UX가 toast 메시지 1개라 쓸 곳이 없고 전면 수정 비용만 들어 기각. 현행 형태를 타입 alias로 명문화하고 데이터 필요 시점에 제네릭 확장하기로 사용자가 동의했다.
  - 결과: `src/actions/`에 `ActionResult` 타입 1개 추가, auth 액션부터 적용.
- **D6 — Codex 계획 검증 CR로 커밋 1개를 추가한다 (8개 → 9개)**
  - 문제: Codex 1차 계획 검증이 D4 표준화 시 bulletin 액션의 `revalidatePath` 제거가 어떤 태그 조합으로 대체되는지 미명시를 material로 지적했다 — `bulletin-nav`만 갱신하면 목록·요약 화면이 86400초 캐시에 옛 데이터로 남는다.
  - 해결: `bulletin-cache.ts`를 직접 읽어 ROOT 태그 구조를 확인하고 D4에 태그 대체표를 추가했다. bulletin 액션 교체는 auth 전환과 의도가 달라 별도 커밋(체크리스트 8)으로 분리했다.
  - 결과: 커밋 9개로 확정. 사용자 승인 범위(8개)에서 1개 늘어난 점은 본 계획 승인 시 함께 확인받는다.
- **D7 — Codex 설계 검증(2026-06-12) 후속 2건을 커밋 5 시점에 반영한다**
  - 문제: 구현 후 설계 검증이 ① notices 배열이 RSC payload에 두 번 직렬화됨(서버 셀 마크업 + provider prop 전체 row), ② `(content)/loading.tsx`가 즉시 렌더 stub 라우트(community·next-gen 등)까지 generic skeleton으로 덮는 UX를 지적했다.
  - 해결: drawer가 읽는 7개 필드만 담는 `NoticeDrawerItem` DTO(`types/notice.ts`)를 만들어 provider에 내리고, `(content)` 광역 loading 2개 파일은 제거했다 — 홈 폴백은 커밋 3의 섹션 Suspense가 대체한다. BannerFallback skeleton 보강과 TextField 함수 prop 주의 주석은 효과가 작아 후속 작업으로만 기록.
  - 결과: payload 중복이 row 전체에서 drawer 필드 7개로 줄고, stub 라우트는 즉시 렌더를 유지한다.
- **D8 — signUp 세션 재동기화는 전체 페이지 이동으로 한다**
  - 문제: Server Action이 만든 세션 쿠키를 브라우저 클라이언트 싱글톤이 모르므로 `SIGNED_IN` 이벤트가 없고, `router.refresh()`는 클라이언트 provider를 재마운트하지 않아 프로필·redirect 흐름이 끊긴다.
  - 해결: 가입 성공(세션 생성) 시 `window.location.assign(redirect)`로 전체 페이지를 다시 연다 — SessionContextProvider가 재마운트되며 `INITIAL_SESSION`이 새 세션 쿠키를 읽는다. 이메일 확인이 필요한 가입은 세션이 없으므로 기존 localStorage 방식을 유지한다. Codex 1차 검증이 redirect 원문 전달의 open redirect를 지적해 같은 출처 상대 경로 가드를 추가했다.
  - 결과: 가입 1회당 전체 로드 1번 비용으로 세션 반영이 결정적이 된다. ADR 0016(`docs/decisions/0016-server-action-conventions.md`)이 패턴 SSOT.
## Verification

- `node scripts/verify-task.mjs server-client-boundary`
- 커밋 단위별: `npx tsc --noEmit` + `yarn build` + 해당 라우트 수동 확인 (Success Criteria의 동작 항목)

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence: high) — 2차 재검증, 2026-06-11
- **현재 판단**: 1차 CHANGE_REQUEST의 material 1건(D4 태그 대체 미명시 → 목록·요약 86400초 stale 위험)은 D4 태그 대체표 + 체크리스트 8 + SC 추가로 해소. 재검증에서 `updateTag('bulletin')`가 기존 `revalidatePath` 2개의 커버 범위를 대체함을 Codex가 확인 (`bulletin-cache.ts:3-19` ROOT 구조, `news/page.tsx:1-13` re-export, `bulletins/page.tsx:6,35` 단일 fetch). 남은 지적은 코드 동작과 무관한 표현 1건(캐시 키에 없는 태그) — D4 참고 줄에 기록함.
- **다음 행동**: 사용자 Phase 2 승인 후 WORK 진입. 3차 자동 호출 금지 (재요청은 사용자 명시 승인 시만)

Codex 재검증 결론 verbatim:

> 재검토 결과, 이전 material CR은 구현 전 계획 수준에서 충분히 해소됐습니다. 남은 건 material이 아닌 문구 보강 1건입니다. (…) 현재 `update-bulletin.action.ts:83-84`의 `updateTag('bulletin-detail-nav')`는 `bulletin-cache.ts:17-19`에 없는 dead tag입니다. (…) 남은 material risk는 없습니다. signUp 세션 재동기화 gate도 유지되어 있고, bulletin revalidation은 명시적이고 검증 가능한 형태입니다. **PASS_WITH_DECISION_LOG** confidence: high

풀이: 계획대로 구현해도 캐시 누락이 없고, 남은 지적은 기록만 하면 되는 수준이다.

## Codex 1차 검증

- **결론**: PASS — 커밋 1~4 구현 diff (수정 파일 8 + 신규 13), 2026-06-12
- **현재 판단**: 확정 버그 0건, Codex 직접 수정 0건. 5개 섹션(버그/타입 5건·RSC 경계 5건·레이어 2건·외과적 변경 3건·loading 의미론 2건) 전부 INFO 판정. RSC 경계는 지시어 제거 5개 파일의 실제 importer를 Codex가 추적해 함수 prop 전달 경로가 모두 클라이언트 부모임을 확인 (`NoticeControlBar.tsx:1`·`SermonListPage/index.tsx:1` 'use client' 확인 등). `(content)/loading.tsx`와 sermons 기존 loading 충돌 없음(가까운 파일 우선), `global-error.tsx`의 globals.scss import 허용 확인.
- **다음 행동**: SermonDetailPage 훅 재확인 권고 1건 → Claude 2차 검증에서 처리. 기록 주의: Codex stdout이 인코딩 깨짐(EUC-KR/UTF-8 혼재)으로 래퍼 에이전트가 요약 전달 — verbatim 원문 확보 불가, 요약 기준 기록

## Claude 2차 검증

- **최종 판단**: PASS — 커밋 1~9 전체, 2026-06-12
- **현재 판단**: 검증 6회 모두 lint·styles·build가 통과했고, knip가 새로 잡은 미사용 코드는 없다 (아래 표). Codex 1차 검증이 찾은 수정 지점 2건(open redirect 가드, 재설정 메일 env 가드)은 반영 후 재검증을 통과했다. 구현 후 설계 검증의 보완 2건(notices DTO·광역 loading 제거)은 D7로 반영했다.
- **다음 행동**: Docs 커밋(ADR·exec-plan) → harness-gate → PR (doc-editor → commit-pr-author 순서)

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 (커밋 1~4) | 20260612-000511 | ✅ | ✅ | ✅ | 0 | /sermons/[id] 영상·탭·북마크·공유, 홈 섹션 스트리밍, about·news 스켈레톤 노출 |
| 2차 (커밋 5) | 20260612-001656 | ✅ | ✅ | ✅ | 0 | /news/notices 행 클릭·Enter·drawer 이전/다음·닫기, 모바일 카드 클릭 |
| 3차 (커밋 5 보완 — D7) | 20260612-003801 | ✅ | ✅ | ✅ | 0 | drawer 본문·첨부 표시(DTO 필드 누락 여부), community·next-gen 즉시 렌더 |
| 4차 (커밋 6) | 20260612-005051 | ✅ | ✅ | ✅ | 0 | 가입 성공 직후 헤더 로그인 상태·redirect 이동, 잘못된 입력 서버 거부 메시지 |
| 5차 (커밋 7) | 20260612-144409 | ✅ | ✅ | ✅ | 0 | 재설정 메일 발송 성공 안내·재요청 타이머, 잘못된 이메일 서버 거부 |
| 6차 (커밋 8·9) | 20260612-151451 | ✅ | ✅ | ✅ | 0 | 주보 생성·수정 직후 /news·목록·상세 갱신, /news 응답 head의 canonical |

커밋 5~9의 Codex 1차 검증 상세는 `## 검증 이력` 참조 — WARNING 2건(커밋 6 open redirect, 커밋 7 env 가드)은 모두 수정 후 재검증을 통과했다.

## 검증 이력

<details>
<summary>2026-06-12 Codex 1차 검증 — 커밋 5</summary>

- 판정: PASS
- 이유: 동작 동등성·RSC 경계·엣지·외과적 변경 4개 항목 점검 verbatim — "발견 사항 없음."
- 조치: 없음

</details>

<details>
<summary>2026-06-12 Codex 1차 검증 — 커밋 6</summary>

- 판정: WARNING 1건 후 해소
- 이유: `redirect` 쿼리 원문을 `window.location.assign`에 전달하는 open redirect — "직접 경로를 추가해 파리티보다 나빠졌습니다"
- 조치: 같은 출처 상대 경로 가드(`/` 시작 + `//` 차단) 추가, 재검증 통과

</details>

<details>
<summary>2026-06-12 Codex 1차 검증 — 커밋 7</summary>

- 판정: WARNING 1건 후 해소
- 이유: `NEXT_PUBLIC_SITE_URL`이 비면 깨진 링크 메일 발송 (sitemap·robots는 가드, 액션만 누락)
- 조치: 발송 전 env 가드 추가, 재검증 run-id 20260612-144409 통과

</details>

<details>
<summary>2026-06-12 Codex 1차 검증 — 커밋 8·9</summary>

- 판정: PASS (수정 0건)
- 이유: `updateTag('bulletin')` 커버리지·canonical의 metadataBase 해석 확인. series 비활성화가 DB 직접 수정으로 일어나면 최대 86400초 이전 화면 — 형제 상세와 같은 ISR 특성
- 조치: 없음 (특성 2건 기록만, `getAllBulletinIds`는 빌드 전용이라 갱신 범위 밖)

</details>

<details>
<summary>2026-06-11 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST (confidence: high)
- 이유: D4 태그 표준화 시 bulletin 액션의 `revalidatePath` 제거를 대체할 태그 조합 미명시 — `bulletin-nav`만으로는 목록·요약이 86400초 stale
- 조치: D4 태그 대체표·체크리스트 8·SC 1건 추가 (D6 기록), expression-only(Assumptions file:line 누락)는 직접 보강

</details>

## 후속 작업

- queueMicrotask 4건 제거 (`DesktopHeader.tsx:21`, `useListFilters.ts:27`, `useMediaQuery.ts:10`, `NoticeControlBar.tsx:26`)
  - 이유: 금지 규칙 위반이지만 이번 task와 관심사가 다름 (외과적 변경 원칙)
  - 다음 기준: 본 task 머지 후 별도 Fix task
  - 기록 위치: `docs/tech-debt/active.md`
- dead code 2건 정리 — `SeriesEpisodeList`(import 0건), `apis/auth.ts` `updatePassword`(호출자 0건)
  - 이유: 발견 시 보고만 (외과적 변경 원칙)
  - 다음 기준: 별도 Chore task에서 제거 또는 활성화 판단
  - 기록 위치: `docs/tech-debt/active.md`

- BannerFallback을 빈 section 대신 최소 skeleton으로 보강
  - 이유: cache miss 첫 화면이 빈 hero로 보일 수 있음 (Codex 설계 검증 지적) — 효과 대비 디자인 비용으로 이번 범위 제외
  - 다음 기준: 홈 UX 다듬기 작업 시
  - 기록 위치: 없음 (본 exec-plan)
- 가입 폼 닉네임(username)을 `profiles.display_name`으로 저장하는 경로 설계
  - 이유: 폼이 닉네임을 받아 검증까지 하는데 `profiles`에 `username` 컬럼이 없고 metadata 소비 코드도 없어 어디에도 저장되지 않음 (PR #116 Gemini 리뷰 #1 — 본 PR 이전부터 있던 결함이라 분리)
  - 다음 기준: 프로필 생성 트리거(DB) 확인 후 별도 Feat task
  - 기록 위치: `docs/tech-debt/active.md`
- TextField에 "server parent에서 함수 prop 전달 금지" 주의 주석 추가
  - 이유: 지시어 제거로 server 사용이 열렸는데 InputHTMLAttributes가 이벤트 prop을 허용 (Codex 설계 검증 지적)
  - 다음 기준: TextField 첫 실사용 도입 시
  - 기록 위치: 없음 (본 exec-plan)

## 참고 자료

- Phase 0 진단·Phase 1 계획·Codex 교차 검증 전문: `docs/research/server-client-boundary/2026-06-11-phase0-diagnosis.md`
