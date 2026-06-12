# Server/Client 경계 정리 + Server Action 도입 — Phase 0 진단 · Phase 1 계획안

- 작성: 2026-06-11, claude-code (탐색 에이전트 4종 병렬 진단 + 핵심 발견 직접 교차 확인)
- 기준 커밋: `15166d4` (origin/develop)
- 상태: Phase 0 완료, Phase 1 합의 대기. **Phase 0~1에서 코드 수정 없음.**
- 제안 task-id: `server-client-boundary`

## 핵심 요약 — 진단 전 가정과 다른 점 3가지

1. **페이지 데이터의 클라이언트 초기 페칭은 0건이다.** 모든 페이지 데이터는 page.tsx(서버)에서 페칭해 props로 내린다. "데이터 페칭을 서버로 이동" 단계는 할 일이 없다. 예외 1건 (Codex 교차 검증에서 정정): 로그인 사용자의 프로필은 `SessionContextProvider.tsx:55-58`이 `INITIAL_SESSION` 이벤트에서 `getProfileById`(`src/apis/user.ts` — 브라우저 클라이언트)로 클라이언트 페칭한다. auth 세션이 클라 쿠키 기반이라 구조적 선택이지만, 페이지 로드마다 발생하므로 auth 전환 설계 시 함께 본다.
2. **클라이언트에서 DB를 직접 write(insert/update/delete)하는 곳은 0건이다.** 주보·설교 mutation은 전부 Server Action → service → api 레이어를 타고, 서버 검증과 revalidate를 갖췄다. 클라이언트 직접 Supabase 호출은 auth 6건(`src/apis/auth.ts`)과 프로필 조회 1건(`src/apis/user.ts` — 읽기 전용)이다.
3. **Route Handler 2개는 둘 다 외부 진입점이라 유지가 정답이다.** `auth/callback`은 Kakao OAuth 리다이렉트, `auth/reset-password`는 이메일 링크 진입점이라 Server Action 전환이 불가능하다.

실제 작업은 세 갈래다: ① 경계 정리('use client'를 리프로), ② App Router 보완(loading/Suspense/metadata), ③ auth Server Action 전환.

## 1. Server/Client 경계 진단 ('use client' 101개 파일 전수)

페이지·레이아웃 레벨 'use client'는 0건. 전염의 시작점은 페이지가 아니라 대형 래퍼 컴포넌트다.

| 분류 | 개수 | 의미 |
| --- | --- | --- |
| (a) 정당 | 약 74 | 상태·이벤트·브라우저 API·제3자 클라 라이브러리 실사용 |
| (b) 분리 후보 | 14 | 일부 인터랙션 때문에 정적 마크업 전체가 클라이언트 |
| (c) 서버 전환 후보 | 4 | 클라이언트 기능이 전혀 없는데 지시어가 붙음 |
| (d) 전염 | 6 | 클라 부모 아래라 지시어가 무의미하거나 컨텍스트 의존 |

(a) 약 73개는 ui 프리미티브(Modal·BottomSheet·Carousel·Tabs 등), 훅 9종, auth 폼 5종, error.tsx 2종, 지도·갤러리·카카오 SDK 계열로, 경계가 정당해서 손댈 필요가 없다.

### 라우트 단위 클라이언트화 (최우선 표시 대상)

| 라우트 | 클라 트리 비중 | 원인 | 비고 |
| --- | --- | --- | --- |
| `/sermons/[id]` | 약 90% | `SermonDetailPage.tsx` — 훅 0개인 정적 래퍼에 'use client' (직접 확인) | 지시어 제거만으로 사이드바·메타 마크업이 서버 렌더로 복귀. 효과 최대·위험 최소 |
| `/news/notices` | 약 85% | `NoticeListClient.tsx` — drawer 상태 하나 때문에 Table+Pagination+Drawer 전부 위임 | 분리하려면 행 클릭 콜백·drawer 상태 설계 필요 — 난도 높음 |
| `/news/bulletins` | 60~70% | BulletinTable(`useReactTable` — 정당) + PhotoSwipe + 권한 게이트 | react-table 의존이라 축소 여지 제한적 |
| `/sermons/all`, `/sermons/series` | 25~40% | 서버 골격 + 클라 리프 구조 | 이미 모범 패턴 — 다른 라우트의 목표 형태 |

### 조치 대상 파일 (b)/(c)/(d) 25개

| 파일 | 분류 | 근거 · 주의 |
| --- | --- | --- |
| `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` | (b) | 훅·이벤트 0. 지시어 제거 시 클라 자식(SermonVideoPlayer·SermonMetaActions·SermonDetailSections)은 그대로 동작 |
| `src/app/(content)/news/notices/_component/NoticeListClient.tsx` | (b) | drawer 상태만 클라 필요 |
| `src/app/(content)/news/notices/_component/NoticeTable.tsx` | (b) | 행 클릭 콜백 1개 때문에 대형 테이블 전체 클라 |
| `src/components/admin/sermons/SermonListPage/parts/SermonTable.tsx`, `MobileCardList.tsx` | (b) | 정렬·행클릭·버튼만 인터랙티브. admin이라 효과는 번들 위주 |
| `src/app/_component/home/FeedContent.tsx`, `NewHere.tsx` | (b) | 탭 전환·아코디언 토글만 클라 필요 |
| `ActiveFilters` · `AdminHeader` · `PageHeader` · `Pill` · `ImagePreview` · `VideoCard` · `LatestBulletinImages` | (b) | 버튼 1~2개 때문에 전체 클라. 개별 효과는 작음 |
| `src/components/ui/TextField/TextField.tsx` | (c) | `useId`만 사용(RSC에서도 동작). 현 사용처가 전부 클라 폼이라 제거해도 무해, 효과도 제한적 |
| `src/components/common/CloudinaryImage.tsx` | (a)로 정정 | Codex 교차 검증에서 정정: 클라 필요 사유는 자기 자신의 인라인 `loader` 함수 prop(`CloudinaryImage.tsx:33`). 서버 컴포넌트는 next/image에 함수를 못 넘기므로 전환 불가 — 조치 대상에서 제외 |
| `src/app/(content)/news/bulletins/not-found.tsx` | (c) | `window.location.href` onClick → `<Link>`로 바꾸면 서버 가능 |
| `src/app/(content)/news/notices/_component/CategoryBottomSheet.tsx` | (c) | 훅·이벤트 0, props만 전달 |
| `src/app/(content)/sermons/_component/SeriesEpisodeList/` | (c) | import 0건 — dead code 의심 (제거 판단 별건) |
| `src/components/board/BoardBody.tsx`, admin `SeriesFilter`·`PreacherFilter` | (d) | 자식이 이미 클라라 지시어 무의미 — 제거만 |
| `src/app/(content)/sermons/_component/SermonListPage/SermonSeriesBanner.tsx` | (d) | URL 파라미터를 클라 훅으로 읽음 — 서버에서 searchParams 주입하면 서버화 가능 |
| `src/app/_component/auth/UserIdMatcher.tsx`, `bulletins/_component/CreateBulletinButton.tsx` | (d) | 세션 컨텍스트(`useProfile`) 소비라 서버 전환 불가 — 현상 유지 |

## 2. Mutation 패턴 진단 (총 13건)

| 실행 방식 | 건수 | 내용 |
| --- | --- | --- |
| ① 클라이언트 직접 Supabase | 6 | 전부 auth (`src/apis/auth.ts` — signUp, signInWithPassword, 카카오 OAuth, signOut, 재설정 메일, updatePassword) |
| ② Route Handler | 2 | OAuth 콜백 + 이메일 링크 진입점 — 외부 호출이라 유지 확정 |
| ③ Server Action 직접 | 1 | 비밀번호 재설정 (`src/app/reset-password/actions.ts`) |
| ④ SA → service → api | 5+1 | 주보 2, 설교 3 (검증·revalidate·실패 시 cleanup 완비) + 조회수 RPC 1 |

- 서버 검증 없는 클라 직접 mutation은 auth 6건뿐이다. 시급한 것은 `signUp`(가입 데이터 무검증)과 `requestPasswordResetEmail`(메일 발송 남용·rate-limit 없음). `apis/` 레이어에 브라우저 클라이언트가 들어있어 레이어 규칙(`apis → services → actions → app`) 위반이기도 하다. mutation은 아니지만 `src/apis/user.ts`(프로필 조회)도 같은 방식의 브라우저 클라이언트 직접 호출이다.
- stale 위험 지점은 사실상 없다. 주보·설교는 `revalidatePath` + `updateTag` + redirect/`router.refresh()`가 완비돼 있다. 다만 로그인·가입의 후처리가 `SessionContextProvider`의 `onAuthStateChange` 전역 구독에 암묵 의존하는 구조는 전환 시 함께 정리할 지점이다.
- dead code 의심 2건 (보고만): `src/apis/auth.ts`의 `updatePassword`(호출자 0건), `SeriesEpisodeList`(import 0건).

## 3. App Router 기능 활용도

- **loading/error 커버리지**: sermons 트리와 admin/sermons만 정비됨. about 7개 라우트, 홈, news/bulletins·notices 5개 라우트, admin 편집 화면이 loading/error 없이 await에 블로킹된다. `global-error.tsx` 없음.
- **Suspense**: 전 프로젝트 3곳뿐이고 전부 `useSearchParams` 경계용. 부분 스트리밍 0건 — 홈은 async 섹션 3개(Banner·RecentSermons·FeedSection)를 Suspense 없이 렌더해서 가장 느린 페칭이 첫 화면 전체를 막는다.
- **워터폴**: 거의 없다. Promise.all 7곳 적용, 순차 await 2곳은 데이터 의존이라 정당. generateMetadata와 본문의 중복 호출 3곳은 fetch HTTP 캐시(`cache: 'force-cache'`)로 실제 1회만 나간다 (`src/lib/supabase/static.ts:6-13` 코드로 검증).
- **metadata**: 루트 layout이 title template·OG까지 갖췄고, 구현된 상세 페이지 3개 모두 generateMetadata 보유. 공백은 `sermons/series/[id]`의 `revalidate` 누락(형제 상세는 86400)과 `/news`가 bulletins 페이지를 재export해서 같은 콘텐츠에 URL이 2개인 점.

## 4. 범위 밖 발견 (보고만, 수정 안 함)

- `queueMicrotask` 사용 4건 — 금지 규칙 위반: `DesktopHeader.tsx:21`, `useListFilters.ts:27`, `useMediaQuery.ts:10`, `NoticeControlBar.tsx:26`
- `src/apis/cloudinary.ts`에 `'use server'` — 액션 성격 코드가 apis 레이어에 위치 (호출은 Server Action 내부에서만 일어나 동작 문제는 없음)

---

# Phase 1 계획안

## 우선순위 (효과 큰 순 / 위험 표기)

| 순위 | 작업 | 효과 | 위험 |
| --- | --- | --- | --- |
| 1 | `SermonDetailPage` 지시어 제거 | 상세 페이지 클라 트리 90% → 대폭 축소 | 낮음 — 훅 0 확인됨 |
| 2 | loading/error 보완 (about·news·홈·global-error) | 빈 화면 구간 제거 | 거의 없음 — 파일 추가만 |
| 3 | 홈 섹션 Suspense 스트리밍 | LCP 영역 우선 노출 | 낮음 — 레이아웃 시프트만 확인 |
| 4 | (c)/(d) 지시어 제거 소묶음 | 일관성 + 소폭 번들 감소 | 낮음 (CloudinaryImage는 전환 불가 확정 — 대상 아님) |
| 5 | `NoticeListClient` 경계 축소 | /news/notices 클라 트리 85% → 축소 | 중간 — drawer 상태·행 클릭 재설계 |
| 6 | auth Server Action 전환 (signUp → 재설정 메일 순) | 서버 검증·rate-limit 지점 확보, 레이어 정리 | 중간 — 세션 동기화 흐름 변경 |
| 7 | 잔여 정리 (series/[id] revalidate, /news 중복 URL) | ISR 일관성, SEO | 낮음 |

**비목표 제안 3건**: ① admin 테이블 분리(효과가 번들뿐), ② 소형 (b) 9건(Pill·ImagePreview 등 — 개별 효과 미미), ③ `signInWithPassword` 전환(세션 쿠키 + `onAuthStateChange` 의존 재작업 비용이 효과 대비 큼).

## 커밋 단위 분할 (Phase 2에서 이 순서대로)

| # | 커밋 | 대상 | 검증 | 동작 변경 가능 지점 |
| --- | --- | --- | --- | --- |
| 1 | Refactor: SermonDetailPage 서버 컴포넌트화 | `SermonDetailPage.tsx` 지시어 1줄 제거 | `tsc --noEmit`·build + /sermons/[id] 영상 재생·탭·북마크·공유 확인 | SermonSeriesSidebar·SermonOtherByPreacher가 서버 렌더로 — HTML 동일해야 함 |
| 2 | Feat: about·news·홈 loading/error 추가 | `about/loading.tsx`(하위 7개 커버), news 쪽 loading/error, `global-error.tsx`, `(admin)/loading.tsx` | build + 각 라우트 전환 시 스켈레톤 확인 | 없음 (추가만) |
| 3 | Feat: 홈 섹션 Suspense 스트리밍 | `(content)/page.tsx` + 섹션 skeleton | 홈 LCP·섹션 순차 노출 확인 | 섹션 로딩 순서가 시각적으로 달라짐 |
| 4 | Refactor: 무의미 'use client' 제거 묶음 | BoardBody·SeriesFilter·PreacherFilter·CategoryBottomSheet·TextField·bulletins/not-found(Link 전환) | build + 해당 화면 동작 | not-found 버튼이 풀 리로드에서 클라 네비게이션으로 |
| 5 | Refactor: notices 경계 축소 | NoticeListClient·NoticeTable 재구성 | 목록·정렬·drawer·페이지네이션 전수 확인 | 행 클릭 → drawer 흐름 — 별도 설계 후 진행 |
| 6 | Feat: signUp Server Action 전환 (+서버 검증) | `src/actions/auth.action.ts` 신설, SignUpForm 연결 | 가입 성공·실패·리다이렉트 확인 | **세션 동기화 리스크 (Codex material 지적)**: 서버에서 `createServerSideClient`로 세션 쿠키를 만들면 브라우저 클라이언트 싱글톤(`src/lib/supabase/client.ts:8-16`)에 `SIGNED_IN` 이벤트가 발생한다는 보장이 없어, `SessionContextProvider.tsx:55-64`의 redirect·프로필 페칭이 동작하지 않을 수 있다. 전환 설계에 클라 세션 재동기화(예: `router.refresh()` + 세션 재조회) 방안을 반드시 포함한다 |
| 7 | Feat: 재설정 메일 Server Action 전환 | 동일 파일에 추가 | 메일 발송·안내 UI | 없음 (발송 트리거만 이동) |
| 8 | Chore: series/[id] revalidate + /news URL 정리 | 2개 파일 | build + 캐시 동작 | /news 접근 방식 (redirect 시) |

## 최종 결정 (2026-06-11 사용자 확정)

1. 비목표 3건(admin 테이블 분리, 소형 (b) 9건, signInWithPassword 전환) 제외 — 커밋 8개로 범위 고정
2. 액션 파일 위치: 도메인별 `src/actions/<domain>.action.ts` 통일
3. 입력 검증: zod 미도입 유지, 수동 검증 + 도메인 헬퍼
4. revalidate: **태그 기본** (아래 합의안 3번의 절충안 대신 — 캐시 인프라가 태그 기반이고 sermon이 태그 1줄로 5개 라우트를 커버하는 동작 증명). 에러 반환은 현행 `{ success, message }`를 `ActionResult` 타입으로 명문화. `CLAUDE.local.md` 임시 지침도 같이 수정함

실행 계획·의사결정 로그: `docs/exec-plans/active/2026-06-11-server-client-boundary.md`

## Server Action 공통 패턴 — 합의 필요 3건 (이력 보존용 — 위 최종 결정으로 종결)

기존 코드에 검증된 패턴이 있어서, 새로 만들기보다 현행 표준화를 권한다.

1. **액션 파일 위치** — 권고: 도메인별 `src/actions/<domain>.action.ts` 통일 (현행 주보·설교·공지 방식). 라우트 로컬 `actions.ts`는 `reset-password` 1곳뿐이라 도메인 방식이 다수 패턴이고 레이어 규칙과도 맞다.
2. **입력 검증** — 권고: zod 미도입 유지(프로젝트 정책), 액션 진입부 수동 검증 + 도메인 헬퍼 분리 (현행 `checkAdminPermission`·`validateFiles`·`validateSermonAction` 패턴 그대로).
3. **에러 반환·revalidate** — 권고: 현행 sermon/bulletin 액션의 반환 형태를 표준으로 문서화하고, revalidatePath 기본 + 여러 라우트가 공유하는 데이터만 updateTag 병행.

## 금지 사항 점검 (사용자 지정)

- Route Handler 외부 호출 확인 없이 삭제 금지 → 2개 모두 외부 진입점으로 확인, 삭제 안 함
- 낙관적 업데이트·디바운스 제거 금지 → 검색 디바운스(SermonSearchForm 등)는 URL 동기화용이라 이번 작업과 충돌 없음. 낙관적 업데이트 사용처 없음
- realtime 구독은 클라이언트 유지 → realtime 구독 없음 (`onAuthStateChange` 구독만 있고 클라 유지)
- 한 커밋에서 경계 정리와 mutation 전환 동시 금지 → 커밋 분할표 #1~5(경계)와 #6~7(mutation) 분리

## 진단 신뢰도 한계 (실행 전 재확인 필요)

- (c)/(d) 전환의 최종 안전성은 각 컴포넌트의 모든 사용처에서 함수 prop 전달 여부에 달려 있다. 전환 실행 직전에 import 그래프를 다시 확인한다 (TextField 사용처 미전수. CloudinaryImage는 Codex 검증으로 전환 불가 확정 — 재확인 불필요).
- RPC(`create_bulletin` 등) 내부 검증과 RLS 정책은 DB 정의 직접 확인이 필요하다 (이번 조사는 `src/` 범위).
- about/sermons 페이지 하위 `_component` 트리의 숨은 추가 await는 홈만 정밀 확인했다.

## Codex 교차 검증 (2026-06-11)

- 결론: `CHANGE_REQUEST` / confidence high — material 4건, expression-only 1건. 아래 정정을 본 문서에 반영 완료.

### 지적 처리 요약 (지적 칸은 요약 풀이 — 원문은 아래 verbatim 섹션 참조)

| # | Codex 지적 (요약) | 분류 | 처리 |
| --- | --- | --- | --- |
| 1 | 클라 초기 페칭 0건 주장은 틀림 — `SessionContextProvider.tsx:55-58, 83-87`이 `INITIAL_SESSION` 때 `fetchProfile` 호출, `src/apis/user.ts:1-9`가 browser client로 `profiles.select` | material | 핵심 요약 1번에 예외 1건으로 정정 |
| 2 | 클라 직접 Supabase 호출은 auth.ts뿐이라는 부분이 틀림 — `src/apis/user.ts:1-9`도 직접 사용. DB write mutation 없음은 맞음 | material | 핵심 요약 2번·mutation 섹션에 프로필 조회(읽기 전용) 추가 |
| 3 | PhotoSwipe onLoad 때문에 제거 불가는 과장 — PhotoSwipe 자체가 'use client', server 사용처는 직렬화 가능 props만 전달 | material | claude-code 재확인 결과 클라 필요 사유는 인라인 `loader` 함수 prop(`CloudinaryImage.tsx:33`) — (c)에서 (a)로 정정, 조치 대상 제외 |
| 4 | signUp Server Action 전환은 실제 리스크 — server에서 세션 쿠키를 만들면 browser singleton의 local event 흐름이 보장되지 않음 (`src/lib/supabase/client.ts:8-16`) | material | 커밋 #6 동작 변경 지점에 세션 재동기화 설계 의무 명시 |
| 5 | "request memoization"은 정확히는 HTTP cache 활용 | expression-only | 3절 표현 정정 (fetch HTTP 캐시) |

- 계획 비평: 커밋 순서(경계 먼저, mutation 나중) SAFE, 비목표 3건 모두 근거 타당 판정.

### Codex 응답 원문 (verbatim)

> **7개 핵심 주장 검증**
>
> 1. CONFIRMED — `SermonDetailPage.tsx:1`, `:17-27`, `:28-69`. hook/event handler 없음. server page가 데이터 props를 전달 확인: `sermons/[id]/page.tsx:105-109`.
>
> 2. WRONG / material — "client-side initial-render fetch 0건" 주장은 틀렸습니다. `SessionContextProvider.tsx:83-87`에서 mount 후 browser Supabase auth 구독을 걸고, `INITIAL_SESSION`/`SIGNED_IN` 이벤트 때 `fetchProfile(userId)`를 호출합니다 (`:55-58`). `fetchProfile`은 browser Supabase client로 `profiles.select('*')`를 실행합니다: `src/apis/user.ts:1-9`.
>
> 3. OVERSTATED / material — "client-direct Supabase 호출은 `auth.ts`뿐" 부분이 틀렸습니다. `src/apis/user.ts:1-9`도 browser client를 직접 사용하고, `SessionContextProvider.tsx:83-87`도 마찬가지입니다. DB write mutation이 없다는 점은 맞습니다.
>
> 4. CONFIRMED — `auth/callback/route.ts:4-11`, `:13-27`과 `auth/reset-password/route.ts:4-17` 모두 외부 진입점으로 확인됩니다.
>
> 5. CONFIRMED (표현 정밀화 필요, expression-only) — 세 페이지 모두 `generateMetadata`와 page body에서 같은 fetch를 중복 호출하지만, `createStaticClient`가 `cache: 'force-cache'` fetch를 사용해 `src/lib/supabase/static.ts:6-13`에서 중복 네트워크 요청이 제거됩니다. "request memoization"은 정확히는 HTTP cache 활용입니다.
>
> 6. CONFIRMED — `about/` 하위 7개 page가 확인됩니다. 현재 `loading.tsx`가 없으므로 `about/loading.tsx` 추가 시 nearest-ancestor 경계로 모든 하위 route를 덮습니다.
>
> 7. OVERSTATED / material — "PhotoSwipe가 onLoad를 넘겨서 제거 불가"는 과장입니다. `PhotoSwipe.tsx`는 그 자체가 `'use client'`이고, 그 안에서 `CloudinaryImage`를 사용합니다. server component에서 `CloudinaryImage`를 직접 사용하는 곳은 함수 prop 없이 `src/alt/width/height`만 전달합니다 (`about/serving-people/page.tsx:59-64` 등). `onLoad`가 직렬화 문제를 만드는 상황은 아닙니다.
>
> **Phase 1 계획 비평**
>
> A. SAFE — boundary cleanup 먼저, mutation 전환 나중 순서는 안전합니다. `SermonDetailPage`는 props만 받는 wrapper이고 server page가 데이터를 전달합니다. auth mutation은 session flow 변경 리스크가 크므로 나중에 다루는 것이 맞습니다.
>
> B. SAFE — 3개 비목표 모두 근거가 있습니다. admin table은 정렬/클릭/삭제 callback이 많아 단순 제거가 아니고, 작은 (b) 파일들은 tab/accordion state가 client 이유의 전부라 단순하지만 효과 대비 비용 판단은 타당합니다. `signInWithPassword` 제외도 redirect/session 의존성 때문에 맞습니다.
>
> C. RISK / material — signUp Server Action 전환은 실제 리스크입니다. 현재 가입은 client Supabase `auth.signUp`이고 (`src/apis/auth.ts:10-24`), session 반영은 `onAuthStateChange`의 `SIGNED_IN`/`INITIAL_SESSION` 이벤트에 의존합니다 (`src/context/SessionContextProvider.tsx:55-64`, `:83-87`). Server Action에서 `createServerSideClient`로 session cookie를 만들면 browser Supabase singleton의 local event 흐름이 그대로 발생한다는 보장이 코드상 없습니다 (`src/lib/supabase/client.ts:8-16`). 진단 문서가 이 리스크를 명시적으로 다루지 않는다면 추가가 필요합니다.
>
> D. RISK / material — `CloudinaryImage` 제외 근거가 "PhotoSwipe onLoad 직렬화 불가"로 적혀 있다면 실제 import graph와 맞지 않아 Phase 1 범위 산정에 영향을 줍니다. 실제 이유(client-side `useState`/`useRef`/`next/image`의 `onLoad` 사용 여부)를 재확인해야 합니다.
>
> **최종 판정**
>
> CHANGE_REQUEST high
