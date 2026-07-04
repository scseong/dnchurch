# mobile-nav-qa

- **상태**: 🟡 진행 중
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

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task(run-id 20260704-220229) 필수 3단계 통과 — ESLint ✅·stylelint ✅·Build(next) ✅. knip 경고 10개 미사용 파일·27개 미사용 export는 전부 기존 부채(useDebounce·useModal·about/worship 컴포넌트 등)로 이번 변경과 무관하다 → **신규 0**. `'nextgen'` 제거로 생긴 orphan 없음(ESLint no-unused 통과). Codex 1차 수정 2건을 코드로 교차 확인했다. (1) `useDialog.ts:69-76` — 버튼·backdrop close 시 `window.history.state.__sheet`가 그대로일 때만 `history.back()`을 호출한다. 시트 안에서 `router.replace/push`로 URL을 바꾸면 우리 `__sheet` 엔트리가 사라져 back을 건너뛰므로, 방금 적용한 월별 보기·설교 필터가 되돌려지지 않는다. (2) `news/page.tsx` — `redirect('/news/bulletins')`로 바뀌었고 `isNewsListPath`(navigation.ts:173-179)에서 bare `/news`를 뺐다. 헤더 '교회 소식'·형제 탭·활성이 `/news/bulletins`에 붙는다.
- **다음 행동**: 커밋 → push → `feat/mobile-nav-qa → develop` PR(Preview 빌드).

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| Codex 1차 | 20260704-220229 | ✅ | ✅ | ✅ | 0 | 실기기 back·시트 닫기(item 1) |
| Claude 2차 | 20260704-220229 | ✅ | ✅ | ✅ | 0 | Preview에서 5개 항목 실측 |

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

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

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

