# mobile-nav-qa

- **상태**: ✅ 완료 (2026-07-05)
- **시작일**: 2026-07-04
- **브랜치**: feat/mobile-nav-qa
- **Open questions**: none
- **ADR needed**: no

## 목표

BottomNav·BottomSheet·교회 소식 탭·/about 라우팅을 실기기 QA에 맞게 고친다 — 다음세대 대신 교회 소식 진입, 뒤로가기로 시트 닫기, /about 직접 렌더, news 형제 탭(주보>공지사항>갤러리) 복원.

## Non-goals

- 다음세대(`/next-gen`) 페이지 자체는 안 건드린다 — BottomNav 진입만 교체.
- admin BottomSheet(FilterDropdown)·Modal·Drawer의 뒤로가기 동작은 안 바꾼다(BottomSheet 한정).
- GNB children 순서·드로어·데스크톱 드롭다운은 그대로 둔다 — news 형제 탭만 순서를 따로 정한다.
- 뉴스 상세(`/[id]`)의 헤더·공유·뒤로가기는 유지 — 형제 탭은 목록에만(사용자 결정).
- `/about/pastor`는 유지 — `/about`과 인사말을 공유한다(사용자 결정, 2 URL은 canonical로 정리).

## 검증된 Assumptions

- Hero/SELF_HERO_PATHS는 ADR 0021로 제거됨 — 헤더는 `resolveMobileHeader`가 전담 (explorer: `src/components/layout/`에 Hero/ 없음).
- BottomNav 아이콘은 `ICON_MAP`(BottomNav.tsx:11-17) + `IconName`(navigation.ts:11), `BOTTOM_NAV_ITEMS`(navigation.ts:59-65)로 렌더. `'nextgen'`은 BOTTOM_NAV_ITEMS에서만 쓰인다.
- `/about/pastor/page.tsx`: 정적 `metadata`(title '인사말') + `getPastorPageData()` + 인사말 JSX. AboutTabNav는 `about/layout.tsx`의 `AboutSectionShell`이 `ABOUT_REDESIGNED_ROUTES` 매치 시 주입.
- `/about`는 `redirect('/about/pastor')`(page.tsx:6). ABOUT_REDESIGNED_ROUTES·AboutTabNav TABS에 없다. `/about` 링크 8곳(GNB·BottomNav·not-found·홈 3·sitemap·DesktopHeader)은 redirect 제거 후에도 유효.
- news 형제 탭: `resolveSiblingTabs`가 notices/bulletins에서 null을 반환한다. GNB children(공지>주보>갤러리)은 드로어·데스크톱 드롭다운과 공유하므로 순서를 바꾸면 세 곳에 다 번진다. 그래서 news 전용 배열을 따로 둔다.
- `/news`(bulletins 재export)는 `resolveMobileHeader`→showBack:false(로고)·`resolveSiblingTabs`→null (구현 중 브라우저 실측으로 확정).
- BottomSheet는 controlled(부모가 open 소유), `useDialog`는 부수효과만 한다. useDialog는 Modal·Drawer도 공유 → history는 opt-in이어야 Drawer 이중 방지.

## Success Criteria

- BottomNav 5개: 홈>교회 소개>설교>교회 소식>마이페이지, 다음세대 없음, `/news` 아이콘 표시.
- BottomSheet 뒤로가기: (a) 열린 시트에서 기기 back → 페이지 이동 없이 시트만 닫힘, (b) 버튼·backdrop으로 닫아도 히스토리 오염 없음(back 1회만), (c) 라우트 이동·unmount 시 pushed 상태 정리. admin FilterDropdown 동작 불변.
- `/about` 진입 시 redirect 없이 인사말 렌더 + metadata(title 인사말). `/about`·`/about/pastor` canonical이 `/about/pastor`로 일치. 헤더·탭이 일관.
- news 목록(`/news/notices`·`/news/bulletins`·`/news/gallery`)에 형제 탭(주보>공지사항>갤러리) 표시·현재 경로 활성. 상세는 현행 헤더 유지. `/news`는 `/news/bulletins`로 redirect.
- verify-task lint/styles/build 통과. knip 신규 0(`'nextgen'` 제거 반영).

## 접근법 (핵심 결정)

- **item 2·4 (BottomNav)**: `IconName`에 `'news'` 추가·`'nextgen'` 제거, `ICON_MAP`에 `news: LuNewspaper`, `BOTTOM_NAV_ITEMS`를 홈>소개>설교>소식>마이페이지로(다음세대 제거, `/news` 추가). 라벨은 기존 짧은 스타일('소개'와 짝맞춰 '소식').
- **item 1 (BottomSheet 뒤로가기)**: `useDialog`에 `enableHistory` opt-in — open 시 `history.pushState`, `popstate` 시 `onClose`, 버튼·backdrop close 시 `history.back()`. `pushedRef`·`closingFromPopRef` 가드로 popstate↔onClose 루프와 back() 중복을 막고, unmount·pathname 변경 시 정리한다(`useDrawerHistory` 계약과 동일). `enableHistory`는 **BottomSheet의 prop(기본 off)** — 콘텐츠 시트(MonthPicker·ShareSheet·AdvancedFilter·NewFamilyRegister)만 켜고 admin FilterDropdown은 안 켠다(Non-goal 준수). Drawer는 계속 `useDrawerHistory`라 이중 없음.
- **item 3 (/about)**: 인사말 JSX를 `about/_component/PastorGreeting`로 추출 → `/about`·`/about/pastor` page가 각각 렌더(metadata·`getPastorPageData`는 각 page 소유). 둘 다 `alternates.canonical: '/about/pastor'`로 지정(중복 URL 정리 — 다른 about 섹션과 같은 명명 URL을 canonical로). `/about`을 `ABOUT_REDESIGNED_ROUTES`에 추가(헤더 '교회 소개'·탭·warm 표면), `AboutTabNav` 인사말 탭을 `/about`·`/about/pastor` 모두 활성. `/about/page.tsx`의 redirect 제거.
- **item 5 (news 탭)**: `NEWS_TABS`(주보>공지사항>갤러리) 배열 신설. `isNewsListPath`(정확히 `/news`·`/news/notices`·`/news/bulletins`·`/news/gallery` — 상세·create·update 제외)를 만들어 `resolveSiblingTabs`가 이 목록 경로에만 NEWS_TABS 반환(notices/bulletins null 분기 제거). `resolveMobileHeader` news 목록 → '교회 소식'. 상세(`/[숫자id]`)는 현행(섹션 헤더+뒤로+공유, 탭 없음) 유지. `/news`는 `/news/bulletins`로 **redirect**한다 — 재export는 `MobileHeader`의 `startsWith` 활성 계산에서 어느 탭과도 안 맞아(Codex 1차 finding 2) redirect로 헤더·탭·활성을 `/news/bulletins`에 정확히 붙인다.

## 영향받는 파일

- `src/config/navigation.ts` — IconName·BOTTOM_NAV_ITEMS·ABOUT_REDESIGNED_ROUTES·NEWS_TABS·isNewsListPath·resolveSiblingTabs·resolveMobileHeader
- `src/components/layout/BottomNav/BottomNav.tsx` — LuNewspaper import + ICON_MAP
- `src/hooks/useDialog.ts` — enableHistory opt-in(pushedRef·closingFromPopRef 가드·cleanup)
- `src/components/ui/BottomSheet/BottomSheet.tsx` — enableHistory prop 추가·전달
- 콘텐츠 시트 4곳 enableHistory 켜기 — `MonthPickerSheet`·`ShareSheet`·`AdvancedFilterSheet`·welcome `NewFamilyRegister`
- `src/app/(content)/about/page.tsx` — redirect 제거 → PastorGreeting + metadata(canonical `/about/pastor`)
- `src/app/(content)/about/pastor/page.tsx` — PastorGreeting로 교체(canonical `/about/pastor`)
- 신규 `src/app/(content)/about/_component/PastorGreeting.tsx` (+scss) — 인사말 JSX 추출
- `src/app/(content)/about/_component/AboutTabNav.tsx` — 인사말 탭 `/about`·`/about/pastor` 활성
- `src/app/(content)/news/page.tsx` — 재export → `/news/bulletins` redirect (Codex 1차 finding 2)

## 단계별 체크리스트

- [x] 1. BottomNav: IconName(news 추가·nextgen 제거)·ICON_MAP·BOTTOM_NAV_ITEMS 재정렬 (items 2·4)
- [x] 2. BottomSheet 뒤로가기: useDialog `enableHistory`(가드·cleanup) + BottomSheet prop + 콘텐츠 시트 4곳 opt-in (item 1) — 브라우저 실측
- [x] 3. /about: PastorGreeting 추출 + `/about`·`/about/pastor` 렌더(canonical `/about/pastor`) + ABOUT_REDESIGNED_ROUTES + AboutTabNav + redirect 제거 (item 3)
- [x] 4. news 탭: NEWS_TABS + isNewsListPath + resolveSiblingTabs·resolveMobileHeader (item 5) — `/news`는 `/news/bulletins` redirect로 확정
- [x] 5. VERIFY: verify-task 통과(run-id 20260704-220229) + knip 신규 0(`'nextgen'` 제거 확인)

## Verification

- `node scripts/verify-task.mjs mobile-nav-qa`

## 의사결정 로그

- **D1 — 교회 소식·소개 섹션 탭을 공용 `SectionTabNav` 한 컴포넌트로 합침 (PR #144 QA 후속)**
  - 문제: 형제 탭이 두 곳에 따로 구현돼 있었다 — 교회 소식은 `MobileHeader`의 인라인 `.mobile_tab*`, 교회 소개는 전용 `AboutTabNav` 컴포넌트. QA에서 두 탭 UI를 같게 맞추려니 같은 스타일을 두 파일에 두 번씩 고쳐야 했고, 앞으로도 어긋날 위험이 있었다.
  - 해결: `src/components/layout/SectionTabNav`(tsx+scss)를 만들어 마크업·스타일을 한 곳에 두고 `MobileHeader`(교회 소식)와 `AboutSectionShell`(교회 소개)이 함께 쓴다. 경로별 active 판별만 달라 `isActive` prop 하나로 받아 처리한다 — 교회 소식은 기본 매처(정확 매칭 + 하위 세그먼트), 교회 소개는 `/about`에서 인사말(`/about/pastor`) 탭을 활성으로 보는 특례를 넘긴다. active 언더라인은 Link 전체 폭이 아니라 라벨 텍스트 폭만 덮도록 inline-block span에 border를 뒀다(사용자 요청). `AboutTabNav`(tsx+scss)는 삭제하고 `Header.module.scss`의 탭 블록도 뺐다.
  - 결과: 탭 스타일을 한 곳에서 관리한다. 교회 소식 탭이 콘텐츠와 같은 warm 팔레트를 쓰고, 두 섹션 탭이 항상 같은 UI로 유지된다. 교회 소식 탭에도 `aria-current`가 붙어 접근성이 좋아졌다.

- **D2 — PR #144 봇 리뷰 반영: `/news` 쿼리 보존 + 시트 히스토리 잔여 엔트리 정리**
  - 문제: (③) `/news`를 단순 `redirect('/news/bulletins')`로 바꾸며 옛 재export가 넘기던 `searchParams`가 사라져 `/news?page=2`·`?year=&month=` 링크가 무필터로 떨어졌다. (④) `enableHistory` 시트가 `router.replace/push`로 URL을 바꾼 뒤 닫으면 synthetic 엔트리가 남아 back 한 스텝이 잉여로 생겼다.
  - 해결: (③) redirect 대상에 원래 query string을 붙였다. (④) `useDialog`에 `closeDialogWithNavigation(navigate, close)`를 두어 URL 변경 전에 `history.back()`으로 synthetic 엔트리를 먼저 소비하고 그 popstate에서 navigation·close를 실행한다(`BulletinArchive`·`AdvancedFilterSheet`가 사용). 소비 대상과 엔트리가 같은 URL이라 재fetch·flash가 없다. 설계는 Codex, diff는 코드로 교차 확인했다.
  - 결과: 기존 `/news?...` 링크 호환을 되살렸고, replace(월별)·push(설교 필터) 모두 Back이 이전 페이지로 정확히 돌아간다. gemini 지적 2건은 오탐(PastorGreeting은 서비스가 `?? []`로 정규화)·잠재(조건부 unmount는 현재 소비처에서 미발생)로 회신했다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 2026-07-04 1차
- **현재 판단**: 구현을 막을 material 지적 5건을 계획에 반영했다. (1) BottomSheet `enableHistory`를 일괄 전달에서 prop opt-in으로 바꿔 admin FilterDropdown에는 영향이 없게 했다(Non-goal 복원). (2) `useDialog` 히스토리에 `pushedRef`·`closingFromPopRef` 가드를 넣고 unmount·route cleanup을 명시했다. (3) news 목록과 상세가 섞이지 않게 `isNewsListPath` 정확 매처를 도입했다. (4) 계획 검증 때는 재export를 유지하기로 했으나, 1차 검증에서 재export가 활성 탭과 안 맞음이 드러나 `/news`→`/news/bulletins` redirect로 뒤집었다(목적지가 canonical·자체 metadata를 가진다). (5) `/about`·`/about/pastor` canonical을 `/about/pastor`로 확정했다.
- **다음 행동**: WORK 진행. CHANGE_REQUEST는 plan 수정 후 진행(재검증 불필요).

Codex 핵심 지적(요약):
- admin `FilterDropdown`이 같은 `BottomSheet`라 `enableHistory` 일괄 전달 시 Non-goal 위반 → prop opt-in. → 접근법 item 1.
- controlled open에서 popstate↔onClose 루프·back() 중복·route cleanup을 가드해야 한다 → `useDialog` 계약에 명시했다. → 접근법 item 1·Success Criteria.
- `isBulletinPath`가 detail/create/update 포함이라 목록 전용 매처가 필요 → `isNewsListPath`. → 접근법 item 5.
- `/news` redirect는 현재 metadata title·canonical(`/news/bulletins`)을 잃는다 → 계획 땐 재export 유지로 판단(1차 검증에서 redirect로 뒤집힘 — 아래 1차 검증 참조). → 접근법 item 5.
- `/about` 2 URL canonical 미지정 → `/about/pastor`로 지정. → 접근법 item 3.
- `'nextgen'` 제거 안전(소비처는 BOTTOM_NAV_ITEMS·ICON_MAP뿐, `PhotoGallery`의 `tone:'nextgen'`은 별개 키), GNB children 유지+`NEWS_TABS` 분리 전제도 코드로 확인(expression-only).

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high) — 2026-07-04 1차
- **현재 판단**: material 2건을 모두 고쳤다. (1) `enableHistory`가 시트 안에서 `router.replace/push`로 URL을 바꾼 뒤 닫히면 `history.back()`이 방금 적용한 필터를 되돌리던 버그 — 우리가 쌓은 엔트리(`window.history.state.__sheet`)가 그대로일 때만 back()하도록 가드했다(URL이 바뀌면 그 엔트리가 사라져 back 안 함). (2) `/news`(재export)에 활성 탭이 없던 문제 — `/news`를 `/news/bulletins` redirect로 바꿔 헤더·탭·활성이 정확히 붙게 하고 `isNewsListPath`에서 죽은 `/news`를 뺐다.
- **다음 행동**: verify-task 후 Claude 2차 검증.

Codex 핵심 지적(요약):
- [material] `useDialog.ts`의 back()이 `BulletinArchive`(month 선택 시 `router.replace`)·`AdvancedFilterSheet`(`setFilter`→`router.push`) 뒤 닫힘에서 방금 적용한 필터 URL을 되돌린다. → `history.state.__sheet` 가드로 수정.
- [material] `/news`는 bulletins 콘텐츠를 보이지만 `MobileHeader`의 `pathname.startsWith(tab.href)` 활성 계산에서 어느 탭과도 안 맞는다. → `/news`→`/news/bulletins` redirect로 수정.
- 정상 확인: popstate 루프·double back 없음, pathname cleanup, Modal/Drawer/admin FilterDropdown early-return, 뉴스 상세는 섹션 헤더+null tabs, `/about` 파급(AboutSectionShell·AboutTabNav), BottomNav `/news/*` 활성, `nextgen` 제거 안전, canonical `/about/pastor`.

D1 `SectionTabNav` refactor 1차 검증 (2026-07-05):

- **결론**: PASS (confidence high) — material·expression 지적 0건.
- Codex가 6개 체크포인트를 확인했다. (1) 공용 컴포넌트의 sticky `top`이 모바일 전용 뉴스 탭·전 뷰포트 About 탭 양쪽에 맞다(뉴스는 `respond-up($header-breakpoint)`에서 `display:none`). (2) 뉴스 active 기본 매처(`===` + 하위 세그먼트)가 목록 경로 정확 매칭이라 회귀·sibling-prefix 오탐 없다. (3) `/about`·`/about/pastor` 둘 다 `PastorGreeting`을 렌더하고 pastor 특례가 이 경우만 처리한다. (4) `aria-current`는 유지되고 뉴스 탭에도 붙으며 `.surface` warm 배경도 셸에 남는다. (5) `NavItem[]`→`SectionTab[]` 대입이 타입 안전하다. (6) transparent border 예약으로 레이아웃 시프트 없다.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task 통과(lint/styles/build/knip은 아래 표). knip 미사용 파일 10·export 27은 useDebounce·useModal 등 기존 부채라 이번 변경과 무관하다. Codex 수정·검증 항목을 코드로 교차 확인했다:
  - `useDialog.ts:69-76` — 버튼·backdrop close 시 `window.history.state.__sheet`가 그대로일 때만 `history.back()`을 부른다. 시트 안에서 `router.replace/push`로 URL이 바뀌면 그 엔트리가 사라져 back을 건너뛰므로, 방금 적용한 월별 보기·설교 필터가 되돌려지지 않는다.
  - `news/page.tsx` — `redirect('/news/bulletins')`로 바꾸고 `isNewsListPath`(navigation.ts)에서 bare `/news`를 뺐다. 헤더 '교회 소식'·형제 탭·활성이 `/news/bulletins`에 붙는다.
  - `SectionTabNav`(D1) — 교회 소식·소개 탭이 이 공용 컴포넌트 하나를 쓴다. 뉴스 active는 기본 매처라 목록 경로 정확 매칭으로 회귀가 없고, 교회 소개는 `/about`→인사말 특례를 `isActive`로 넘긴다. `SectionTab` export를 지워 knip 신규 0을 지킨다.
- **다음 행동**: 커밋한 뒤 push해 PR #144(`feat/mobile-nav-qa` → `develop`)를 갱신한다(Preview 빌드).

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| Codex 1차 (nav-QA) | 20260704-220229 | ✅ | ✅ | ✅ | 0 | 실기기 back·시트 닫기 |
| Codex 1차 (SectionTabNav) | 20260705-131639 | ✅ | ✅ | ✅ | 0 | Preview 탭 UI 실측 |
| Claude 2차 | 20260705-132327 | ✅ | ✅ | ✅ | 0 | Preview에서 전체 항목 실측 |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

- 이 PR에 합쳐진 `fix/bulletins-detail-qa` 브랜치를 삭제한다 (커밋 `593ad5a`를 `c989b5d`로 cherry-pick해 PR #144에 넣었다).
  - 이유: 별도 PR 없이 이 PR에 합쳤다.
  - 다음 기준: 완료 처리 시 바로.
  - 기록 위치: 없음.

## 회고

### 잘된 것

- Codex 계획 검증(CHANGE_REQUEST 5건)·1차 검증(back이 필터를 되돌리던 버그·`/news` 활성 탭 없음 2건)을 구현 전·중에 잡아 반영했다.
- 교회 소식·소개 탭을 공용 `SectionTabNav`로 합쳐 중복을 없앴다(Codex 1차 PASS high, 6개 체크포인트 모두 통과). 앞으로 탭 UI는 한 곳만 고치면 두 섹션에 함께 반영된다.
- PR 봇 리뷰 4건을 코드로 직접 확인했다.
  - codex 2건(`/news` 쿼리 누락·시트 synthetic 엔트리): 고쳤다.
  - gemini 2건: 오탐(`PastorGreeting`은 서비스가 `?? []`로 정규화)·잠재(조건부 unmount는 현재 안 생김)로 근거를 회신했다.
- 이미지 저장이 실기기에서 1장만 되던 것을 Web Share로 풀었다 — 모바일의 제스처당 다운로드 1개 제한을 공유 시트로 우회했고, 실기기에서 전체 저장을 확인했다.

### 다음에 할 것

- Web Share 제스처 활성이 만료되거나 이미지 fetch가 CORS로 막히면 이미지를 미리 fetch해둔다 — 지금은 실기기에서 정상이라 아직 안 손댔다.
- `enableHistory`를 조건부 렌더 소비처에 붙일 일이 생기면 그때 useDialog unmount 정리를 함께 손본다.

### 발견된 부채 (→ tech-debt 후보)

- `enableHistory` 시트를 조건부 렌더(`{open && <Sheet/>}`)로 붙이는 소비처가 생기면, 열린 채 unmount될 때 synthetic 히스토리 엔트리가 남는다. 현재 소비처 5곳(ShareSheet 2·MonthPicker·AdvancedFilter·NewFamilyRegister)은 모두 항상 마운트돼 있어 지금은 안 생긴다. 조건부 렌더 소비처가 생기면 그때 터진다.
- 시트가 URL을 바꾼 뒤 남는 synthetic 엔트리는 forward-stack에 그대로 쌓여 public History API로 지울 수 없다. Back 동작은 정확하고 forward 쪽만 안 보이게 남는다(구조적 한계).
- knip 경고는 전부 기존 부채(useDebounce·useModal 등)로 이번 신규 0.

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

