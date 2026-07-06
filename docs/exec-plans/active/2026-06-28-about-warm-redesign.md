# about-warm-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-28
- **브랜치**: style/about-warm-redesign (커밋 시 생성 — 본 작업 파일만 선택 스테이징, 현재 트리의 home SCSS 변경은 별개)
- **Open questions**: none
- **ADR needed**: no — services/about/index.ts는 기존 fetch 합성(staff + church_history Promise.all)일 뿐 새 데이터 흐름·레이어 변경이 아니다. warm 토큰은 값 변경 없이 사용 범위 주석만 넓힌다.

## 목표

교회 소개(About) 섹션을 claude.ai/design 목업(한빛골드 따뜻한 톤)으로 다시 입힌다. 1단계로 인사말(`/about/pastor`)에 목업의 인사말 화면 레이아웃을 적용하고, 5개 섹션을 잇는 라우트형 탭 내비를 만든다. 실데이터는 보존하고 목업에서는 디자인·레이아웃만 가져온다.

## 검증된 Assumptions

(EXPLORE에서 Read/Grep으로 직접 확인한 사실만.)

- 목업 색이 `_home.scss` warm 토큰과 값이 같다 — `$home-gold-strong:#6e5016`·`$home-gold:#93702e`·`$home-gold-deep:#5a4318`·`$home-surface:#f6f3ec`·`$home-tint:#efe6cf`·`$home-border:#efe7df`·`$home-text:#23271f`·`$home-text-sub:#62665c`·`$home-border-gold:#e4d3a6` (Read `src/styles/tokens/_home.scss`). 신규 토큰 0.
- 명조(Gowun Batang)는 `$font-family-home-serif: var(--font-gowunBatang)`로 이미 있고 `src/app/layout.tsx`가 `<html>`에 변수를 단다 (Grep layout.tsx: `Gowun_Batang` + `--font-gowunBatang`). 전역 사용 가능.
- 인사말 데이터: `getPastorPageData()` → `getActiveStaff()`(`staff` 테이블)가 `name·title·image_url·education[]·experience[]·greeting_paragraphs[]` 반환 (Read `src/services/about/index.ts:67-106`). 약력 = education + experience, 인사말 = greeting_paragraphs.
- `staff`에 부임연도 컬럼이 없다 → 목업의 "2005년 부임·사역 20년째" 부제는 데이터 출처가 없다(D2).
- 교회 이력: `church_history` site collection 존재 — `getVisionPageData`·`getHubPageData`가 이미 `getSiteCollection<HistoryItem>('church_history')`로 읽는다 (Read services/about).
- 교단: `CHURCH_INFO.legalName = '대한예수교장로회(합신) 대구동남교회'` (Read `src/config/seo.ts:23-37`). 목업의 합신 표어 '바른 신학·바른 교회·바른 생활'은 이 교단 실제 표어라 대구동남교회에 정확.
- About는 현재 cool semantic(`$bg-card`·`$accent`(gold-as-accent)·`$bg-dark-nav`) 사용 ([[2026-06-15-about-tokens]]). 목업은 warm gold가 primary → warm 스코프 확장이 핵심 결정(D1).
- `(content)/layout.tsx`가 `/about/pastor`에 auto-Hero(eyebrow ABOUT + title + Breadcrumb)를 렌더했었다 (hero.config.ts). 사용자 지시(2026-06-28)로 이 Hero를 제거한다(D3).
- 사이트가 이미 헤더에 라우트형 섹션 탭 바를 갖는다 — `MobileHeader`가 `resolveSiblingTabs(pathname)`로 About 형제 6탭을 렌더한다 (Read MobileHeader.tsx + navigation.ts). 목업 in-page 탭과 중복이라 pastor에서 헤더 탭을 끈다(D3).

## Success Criteria

- `/about/pastor`가 목업 인사말 레이아웃을 보인다: 골드 틴트 프레임의 목사 사진 카드 + '담임목사' 라벨 + 이름 + 명조 인사말 본문 + 서명 + 약력 카드(골드 점 bullet) + 교회 이력 타임라인 + 교단 소개 카드.
- 인사말·교단 본문이 `$font-family-home-serif`(Gowun Batang) 명조로 렌더된다.
- 라우트형 탭 내비가 5탭(인사말·예배·오시는 길·비전·환영)을 보이고, 현재 경로(`usePathname`)에 해당하는 탭이 골드로 활성, 각 탭은 해당 `/about/*`로 이동하는 `<Link>`다. 마크업은 `nav > ul > li > a`.
- 새 SCSS에 하드코딩 색/값 0건 — warm 토큰(`$home-*`)·기존 semantic·spacing/radius 토큰만 사용. `$home-*`은 About 스코프로 쓰며 `_home.scss` 주석을 그에 맞게 갱신.
- 교회 이력 타임라인이 `church_history` 실데이터를, 교단 카드가 `CHURCH_INFO.legalName`을 쓴다(더미 아님).
- `/about/pastor`에 레이아웃 자동 Hero(다크 ABOUT 배너 + 브레드크럼)가 안 보이고, 섹션 탭 바는 in-page warm 1개만 보인다(헤더 형제 탭 숨김).
- Hero가 갖던 h1을 대체해 페이지에 시각적으로 숨긴 `<h1>인사말</h1>`이 있다(문서 아웃라인 유지).
- `verify-task` ESLint·stylelint·build 통과. Chrome `/about/pastor`가 목업과 시각 일치.

## 영향받는 파일

- `src/styles/tokens/_home.scss` — warm 토큰 스코프 주석에 About 추가(값 변경 0).
- `src/app/(content)/about/_component/AboutTabNav.tsx` — 신규, `'use client'`. 라우트형 탭 내비.
- `src/app/(content)/about/_component/AboutTabNav.module.scss` — 신규. 목업 탭 바 스타일(warm 토큰).
- `src/app/(content)/about/pastor/page.tsx` — 목업 인사말 레이아웃으로 재작성 + `<AboutTabNav/>` + 교회 이력·교단 섹션.
- `src/app/(content)/about/pastor/page.module.scss` — 목업 인사말 디자인(warm 토큰 + 명조)으로 재작성.
- `src/services/about/index.ts` — `getPastorPageData`가 `church_history`도 반환하도록 확장(staff + history `Promise.all`).
- `src/components/layout/Hero/hero.config.ts` — `/about/pastor`를 `SELF_HERO_PATHS`에 추가(자동 Hero 끔). [사용자 지시 2026-06-28]
- `src/config/navigation.ts` — `resolveSiblingTabs`가 `/about/pastor`에서 null 반환(헤더 형제 탭 숨김, in-page 탭 중복 제거). [사용자 지시 2026-06-28]
- `public/images/logo.svg` — 합신 교단 로고(사용자 추가). 교단 카드에서 정적 `<img>`로 참조(Cloudinary 미경유 — 정적 브랜드 SVG는 변환 불필요). [사용자 지시 2026-06-28]
- `src/config/navigation.ts` — `resolveMobileHeader`가 `/about/pastor`에서 `{title:'교회 소개', showBack:true}` 반환(목업 헤더). [사용자 지시 2026-06-28]
- `src/components/layout/Header/MobileHeader.tsx` — `/about/pastor` 헤더 타이틀 가운데 정렬(`centeredTitle`). [사용자 지시 2026-06-28]
- `src/components/layout/Header/Header.module.scss` — `.mobile_title_centered` 추가(가운데 정렬), `.mobile_back` flex-start·`.mobile_menu` flex-end(아이콘을 버튼 가장자리=컨테이너 padding 라인에 정렬, **전역 모바일 헤더**). ⚠️ home-bg WIP와 같은 파일 — 커밋 시 hunk 분리 필요. [사용자 지시 2026-06-28]

## Non-goals

- 다른 4개 페이지(worship·location·vision·welcome)·Hub·serving-people 변경 — 2단계 이후.
- 환영 페이지의 새가족 등록 모달(BottomSheet 폼) — welcome 차례에.
- `$home-*` → `$warm-*` 리네이밍 — 추측성 정리, 외과적 변경 원칙에 어긋남(후속).
- `.claude/skills/styles/SKILL.md`의 warm/cool 가이드 갱신 — 전체 롤아웃 시(ADR 트리거라 별도 판단).
- 교단 로고 이미지(hapshin-logo) 추가 — 에셋 필요, 텍스트 카드로 먼저(후속).
- 인접 코드 정리·포맷·rename.

## 접근법

- **warm 토큰**: `_home.scss`의 `$home-*`를 About에서 직접 쓴다. 값이 목업과 같아 신규 토큰 0. 스코프 주석만 "홈 + 공용 레이아웃 + About"로 넓힌다(D1).
- **탭 내비**: `usePathname()` 기반 `'use client'` 컴포넌트. 시맨틱 `nav > ul > li > Link`(memory feedback_semantic_nav). 활성 = 골드 텍스트 + 골드 언더라인, 비활성 = muted. 좁은 모바일은 가로 스크롤. 1단계는 pastor 페이지에만 삽입(나머지 4페이지·공용 about/layout 승격 여부는 2단계 판단).
- **데이터**: `getPastorPageData`를 `staff` + `church_history` `Promise.all`로 확장(services 레이어 유지). 교단은 `CHURCH_INFO`(config) import.
- **명조**: 인사말·교단 본문에 `$font-family-home-serif`.
- **hover**: `hover-*` mixin 3원칙. `transition: all`·hover 내 `border-color` 금지.

## 단계별 체크리스트

- [ ] 1. `_home.scss` 스코프 주석 갱신(About 포함)
- [ ] 2. `AboutTabNav` 컴포넌트 + module.scss 작성(라우트형, usePathname 활성)
- [ ] 3. `getPastorPageData` 확장(staff + church_history)
- [ ] 4. `pastor/page.tsx` 재작성(목업 인사말 레이아웃 + 탭 내비 + 약력 + 이력 + 교단)
- [ ] 5. `pastor/page.module.scss` 재작성(warm 토큰 + 명조)
- [ ] 6. Codex 1차 검증 → `verify-task` → Chrome 시각 검수

## Verification

- `node scripts/verify-task.mjs about-warm-redesign`
- Chrome 실측: `/about/pastor` 모바일/PC가 목업 인사말 화면과 시각 일치(골드 카드·명조 본문·타임라인·교단 카드·탭 활성).

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence high)
- **현재 판단**: 5체크 모두 PASS. D1(warm `$home-*`를 About로 확장)·D2(`getPastorPageData`에 `church_history` 합치기)·D3(이력 hub·vision·pastor 3중 렌더) 모두 material risk 아님 — 신규 토큰 0, services 내부 fetch 조합 1건(`docs/ARCHITECTURE.md:25` 규칙 안), 데이터 레이어 문제 없음. 유일 지적은 `.claude/skills/styles/SKILL.md`의 warm/cool 문구와 About warm 적용 사이 문서 부채(expression-only) — D1 결과·후속 작업에 이미 기록.
- **다음 행동**: WORK 1단계 진행(`_home.scss` 주석 → `AboutTabNav` → `getPastorPageData` → pastor 페이지).

## Codex 1차 검증

- **결론**: FIX_APPLIED (신뢰도 88%) — null 항목을 통과시키던 `church_history` 필터 버그를 Codex가 `page.tsx:38`에서 직접 막았다.
- **현재 판단**: Codex가 버그 1건을 직접 고친다 — `church_history` 필터가 null 항목을 통과시켜 `item.year`에서 런타임 에러가 날 여지를, `page.tsx:38`에서 `Boolean(item) && item.year !== 'TODO'`(타입 좁힘 포함)로 막는다. ESLint를 통과한다. 결정 3건: ① 전역 헤더 아이콘 정렬(`Header.module.scss:105·135`)은 별도 커밋 B로 나눈다(D10, 사용자 승인). ② `HeroCarousel.module.scss`·`Button.module.scss`(home-bg WIP)는 스테이징에서 뺀다. ③ page.module.scss의 geometry 매직값은 raw로 둔다(D9). sticky offset(5.4rem·`$header-height-compact`·`$header-height`)·z-index·색 토큰 규율은 PASS다. 1차 지적(task 밖 파일 분리)도 같게 처리한다.
- **다음 행동**: doc-editor를 반영하고, dev를 멈춘 뒤 `verify-task`를 돌리고, 커밋 A(인사말 재디자인)·B(헤더 아이콘 정렬)로 나눠 스테이징한다.

## Claude 2차 검증

- **최종 판단**: PASS — 필수 3단계(lint·styles·build) 모두 통과, Knip은 기존 부채라 커밋을 막지 않는다(아래 표).

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260628-200138 | ✅ (18.4s) | ✅ (4.8s) | ✅ (42.5s) | 0 | Chrome /about/pastor 실측 |

- **현재 판단**: 빌드가 통과해 타입·라우트·번들 회귀가 없다. Knip 경고 목록을 내 신규 파일과 대조해 무관함을 확인했다 — 미사용 13파일·미사용 export 29건은 모두 기존 항목(worship `_component` 3종, `resolveNavLabel`, UI barrel 등)이고 `AboutTabNav`·pastor `page`는 목록에 없다.
- **시각 검증**: Chrome `/about/pastor` 실측(viewport 410px, scrollWidth 394 — 가로 overflow 없음)에서 목업과 대조해 일치를 확인했다.
  - warm 탭 바 하나만 노출(5탭 균등, 인사말 골드 활성)
  - 자동 Hero·헤더 중복 탭 제거됨
  - 목사 카드: 김성규 실사진, 명조 인사말 1.3rem
  - 약력·이력(TODO 항목 숨김)·교단 카드 표시
- **다음 행동**: 커밋 A(인사말 재디자인)·B(헤더 아이콘 정렬)로 나눠 스테이징한 뒤, 사용자 승인을 받아 커밋한다.

## 의사결정 로그

- **D1 — About에 warm 톤을 기존 `$home-*` 토큰 재사용으로 적용**
  - 문제: 목업은 골드를 primary로 쓰는데 About는 현재 cool semantic(navy primary + gold accent)이다. 목업 색(#6e5016 등)은 `_home.scss` warm 토큰과 값이 같지만, 그 토큰은 주석상 "홈 모듈에서만" 쓰게 돼 있고 styles SKILL은 인터랙션 색을 cool로만 쓰라고 한다.
  - 해결: 새 warm 토큰을 만들거나 `$home-*`를 `$warm-*`로 리네이밍하는 대신, 값이 같은 기존 `$home-*`를 About 스코프로 그대로 쓴다. 이유 — 신규 토큰 0(memory "토큰 추가보다 단순화 선호" + [[2026-06-15-about-tokens]]·[[2026-06-15-home-tokens]]의 값 동일 재사용 선례), 리네이밍은 home 사용처까지 건드리는 추측성 정리라 외과적 변경 원칙에 어긋난다. About는 홈과 같은 warm 테마를 입는 섹션으로 본다(인터랙션도 warm 골드 — 목업 의도, 사용자 승인).
  - 결과: About가 cool→warm로 재스킨되며 토큰 정의값은 그대로다. SKILL의 warm/cool 가이드와 어긋나는 부분은 전체 롤아웃 때 문서로 정리한다(후속).
- **D2 — 부임연도 부제는 생략, 교단 표어·legalName은 실데이터로 표기**
  - 문제: 목업 목사 카드의 "2005년 부임·사역 20년째"는 `staff`에 해당 컬럼이 없다. 목업 교단 표어(바른 신학·바른 교회·바른 생활)는 합신 교단 실제 표어다.
  - 해결: 없는 데이터는 지어내지 않고 부제를 뺀다. 교단 표어·legalName은 `CHURCH_INFO` 실값으로 표기한다.
  - 결과: 화면이 데이터와 일치한다. 부임 정보가 필요하면 `staff` 스키마 확장이 선행한다(후속).
- **D3 — pastor에서 레이아웃 Hero 제거 + 헤더 중복 섹션 탭 숨김 (사용자 지시 2026-06-28)**
  - 문제: Chrome 검증에서 `/about/pastor`에 다크 자동 Hero(ABOUT 배너)와 헤더의 기존 섹션 탭 바(`resolveSiblingTabs` — 인사말·교회의 비전 등 6탭)가 in-page warm 탭 바와 함께 떠 탭 바가 두 줄로 겹쳤다. 사용자가 "목업 UI 그대로, 기존 Hero도 제거"를 지시했다.
  - 해결: `SELF_HERO_PATHS`에 `/about/pastor`를 넣어 자동 Hero를 끄고, `resolveSiblingTabs`가 `/about/pastor`에서 null을 반환해 헤더 형제 탭을 숨겼다. in-page warm 탭 바(AboutTabNav) 하나만 남긴다. 경로 가드를 pastor에 한정해 다른 About 페이지·다른 섹션은 안 건드린다 — 롤아웃 때 일반화.
  - 결과: 목업처럼 헤더 → warm 탭 바 → 카드로 이어진다. 계획 Non-goals(헤더 불변)를 사용자 지시로 pastor 한정 확장했다.
- **D4 — Hero 제거로 빠진 h1을 시각적으로 숨긴 h1으로 보완**
  - 문제: Hero가 페이지 h1(`인사말`)을 제공했는데, 제거하면 문서 아웃라인이 h2부터 시작해 접근성·SEO에 불리하다.
  - 해결: 페이지 상단에 `@include blind`로 시각적으로 숨긴 `<h1>인사말</h1>`을 둔다. 목업엔 큰 제목이 없어 화면엔 안 보이되 아웃라인·스크린리더용으로 남긴다.
  - 결과: 시각은 목업과 같고 페이지 h1이 유지된다.
- **D5 — 본문 prose 1.3rem + 탭 균등 분배 (사용자 지시 2026-06-28, 목업 정합)**
  - 문제: 사용자가 "본문 텍스트는 1.3rem"을 지시했다. `한빛교회 - 교회소개.html`을 로컬 8137 서버로 띄워 봤으나 번들 래퍼라 "missing bundle data"로 렌더되지 않았다 — 대신 같은 디자인인 `교회 소개.dc.html` 인라인 스펙으로 정합을 맞췄다.
  - 해결: greeting·교단 prose를 `$font-size-15`→`$font-size-13`(1.3rem)으로 낮췄다(약력·이력은 이미 1.3rem). 탭 `.item`을 `flex: 1 0 auto`→`flex: 1`로 바꿔 목업처럼 5탭을 균등 분배했다.
  - 결과: 본문 크기가 1.3rem로 통일되고 탭이 균등해졌다. Chrome 실측에서 overflow 없이 목업과 일치했다.
- **D6 — 실데이터 + 목업 디자인: 이름 "목사" 표기, 부임 부제 생략 (사용자 지시 2026-06-28)**
  - 문제: 사용자가 "데이터는 실데이터, 디자인·레이아웃은 목업 참고"를 지시했다. 목업은 이름을 "{이름} 목사"로 쓰고 "2005년 부임·사역 N년째" 부제를 보이는데, 우리 `staff`에는 부임 연도 필드가 없다. (256KB로 잘린 디자인-프로젝트 export는 "missing bundle data"로 안 떴고, `docs/references/한빛교회 - 교회 소개.html` 27MB 완본을 localhost:8137로 띄워 실제 목업을 렌더해 비교했다.)
  - 해결: 이름은 실데이터에 목업 표기 형식을 입혀 senior pastor만 `{name} 목사`로 맞췄다(서명은 목업대로 호칭 없이 `{title} {name} 드림`). 부임 부제는 실데이터가 없어 지어내지 않고 생략했다.
  - 결과: 이름 "김성규 목사"로 목업과 일치. 교단 로고는 사용자가 `public/images/logo.svg`로 제공해 교단 카드 우측에 `<img>`로 넣었다(정적 브랜드 SVG라 Cloudinary 미경유). 부임 부제는 `staff` 부임 필드 확보 시 후속.
- **D7 — About 헤더·간격·탭 라벨을 목업에 맞춤 (사용자 지시 2026-06-28)**
  - 문제: 사용자가 ① wrapper의 padding-top이 header와 탭 사이를 너무 벌리고, ② 헤더가 로고라 목업(← 교회 소개 ☰)과 다르며, ③ 탭 라벨이 짧다(예배·비전·환영)고 지적했다.
  - 해결: ① `.container`의 padding-top을 없앴다. ② `resolveMobileHeader`가 `/about/pastor`에서 `{title:'교회 소개', showBack:true}`를 반환하고 `MobileHeader`가 그 타이틀만 가운데 정렬한다(`.mobile_title_centered`) — pastor 한정이라 다른 페이지 헤더는 그대로다. ③ `AboutTabNav` 라벨을 예배 안내·교회의 비전·환영합니다로 바꾸고, 긴 라벨에 맞춰 탭을 `flex:1`→`flex:1 0 auto`(내용폭+확장, 좁으면 가로 스크롤)로 바꿨다.
  - 결과: 헤더가 ← 교회 소개(가운데) ☰, 탭이 헤더에 붙고 라벨이 길어졌다. Chrome 실측 일치. 헤더 변경이 전역 `Header.module.scss`를 건드려 home-bg WIP와 같은 파일이 됐다 — 커밋 때 hunk를 분리한다.
- **D8 — 탭 내비 sticky·풀폭, 헤더 아이콘 가장자리 정렬 (사용자 지시 2026-06-28)**
  - 문제: ① 탭 내비가 헤더처럼 스크롤 시 안 고정됨, ② 탭 내비가 컨테이너 padding 때문에 풀폭이 아님, ③ 헤더 아이콘이 버튼 자체 padding(가운데 정렬)만큼 안쪽으로 밀려 컨테이너 콘텐츠 가장자리와 안 맞음.
  - 해결: ① `AboutTabNav .nav`를 `position: sticky`로, top을 헤더 높이(모바일 5.4rem / 태블릿 `$header-height-compact` / PC `$header-height`)에 맞춰 헤더 바로 아래 고정(bg `$home-surface`, z-index `calc($z-header - 1)`). ② `AboutTabNav`를 `LayoutContainer` 밖(`.surface` 직속)으로 빼 풀폭으로 만들고, `.container`에 `padding-top: $spacing-16`(탭↔첫 카드 간격). ③ `.mobile_back`을 `justify-content: flex-start`, `.mobile_menu`를 `flex-end`로 바꿔 아이콘을 버튼 가장자리(=컨테이너 padding 라인)에 맞췄다. ②는 About 한정, ③은 전역 모바일 헤더에 적용.
  - 결과: 스크롤하면 헤더와 탭이 함께 상단에 고정되고, 탭이 좌우 끝까지 차며, 아이콘이 콘텐츠 가장자리에 맞는다. Chrome 실측으로 확인했다.
- **D9 — page.module.scss의 geometry 매직값을 raw로 둔다**
  - 문제: Codex 2차가 사진 폭(15.2rem)·열 max-width(52rem)·점 크기와 오프셋·타임라인 geometry·로고 높이(4rem)에 토큰이나 로컬 변수가 없다고 지적했다. 색·간격·radius·폰트는 토큰을 쓰지만 이 값들은 이 컴포넌트에만 쓰는 치수다.
  - 해결: 토큰을 새로 만들거나 로컬 변수로 빼지 않고 raw 값을 둔다. 재사용이 없는 일회성 치수이고, memory "토큰 추가보다 단순화 선호"와 [[2026-05-08-about-page-redesign]]가 같은 종류(card min-height·underline)를 raw로 둔 선례가 있어서다. 금지 대상인 색 하드코딩은 0건이다.
  - 결과: SCSS가 단순하게 남는다. beige·geometry 토큰 체계가 잡히면 그때 일괄 정리한다(후속).
- **D10 — 커밋을 관심사 2개로 나눈다 (사용자 승인)**
  - 문제: 작업이 ① About 인사말 목업 재디자인과 ② 전역 모바일 헤더 아이콘 정렬(`.mobile_back`·`.mobile_menu`, 모든 페이지에 영향)을 함께 담는다. 한 커밋에 넣으면 의도가 섞이고 commit-msg R4의 `+` 신호가 뜬다.
  - 해결: 커밋 A(인사말 재디자인 — page·AboutTabNav·토큰·service·hero·navigation·MobileHeader·`Header.mobile_title_centered`)와 커밋 B(전역 헤더 아이콘 정렬 — `Header.mobile_back`·`mobile_menu`)로 나눈다. `Header.module.scss`는 hunk를 갈라 A·B에 따로 넣고, home-bg WIP hunk(`.mobile_login`)는 둘 다에서 뺀다.
  - 결과: 한 커밋이 한 의도를 담는다. home-bg WIP와 research·troubleshooting은 언커밋으로 남는다.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: -
- **사유**: 변경 파일 중 `src/services/about/index.ts`만 ADR_TRIGGER_PARTS(`src/services/`)에 든다. 그러나 변경은 기존 두 fetch(staff·church_history)를 한 함수에서 `Promise.all`로 합치는 것뿐 — 새 데이터 흐름·레이어 경계·인증/캐시 변경이 없다. warm 토큰은 정의값을 안 바꾸고 사용 범위 주석만 넓힌다. 새 라이브러리·배포 정책 변경 없음.

## 후속 작업

- 나머지 4개 About 페이지(worship·location·vision·welcome) + Hub warm 재스킨 — 1단계 패턴 승인 후. 공용 `about/layout.tsx`로 탭 내비 승격 여부도 그때 판단.
  - 기록 위치: 본 plan 후속(다음 increment)
- 환영 페이지 새가족 등록 BottomSheet 폼.
- `$home-*` → `$warm-*` 리네이밍 + styles SKILL warm/cool 가이드 갱신(ADR 트리거 판단 포함).
- 교단 로고 이미지 에셋(hapshin-logo).
- 교회 이력 중복(hub·vision·pastor) IA 정합.
- `staff` 부임연도 컬럼(필요 시).
