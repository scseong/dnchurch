# mobile-frame-launch

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-06
- **브랜치**: 신규 예정 (`feat/mobile-frame-launch` — 커밋 시 사용자와 base 확정)
- **Open questions**: none (프레임 폭 768px·PC 유지 페이지 없음·하단바 바=전체폭/아이콘=프레임폭·본문 프레임 채움으로 확정)
- **ADR needed**: no — ADR_TRIGGER_PARTS 파일 미포함(styles/·config/·components/·app/만). 되돌릴 수 있는 출시용 레이아웃 토글, 레이어·라이브러리 변경 없음

## 목표

출시 일정을 지키기 위해 공개 사이트를 태블릿 이하 레이아웃으로 제한한다. 세부 요구는 아래와 같다.

- 넓은 화면에서도 모바일 헤더를 유지하고, 헤더·탭·본문을 768px(`--app-frame-max`) 폭 한 열로 가운데 정렬한다.
- 하단바는 화면 전체 폭 바에 아이콘만 프레임 폭으로 모은다.
- 본문은 페이지별 자체 max-width 없이 프레임을 채워 좌우 여백을 같게 맞춘다.
- 교회소개(about)·교회소식(news) 하위 페이지가 같은 컨테이너(MainContainer)를 쓰게 맞춘다.
- PC 작업물(DesktopHeader·PC 전용 SCSS)은 삭제하지 않고 라우트 화이트리스트로 재노출할 수 있게 남긴다.

## 검증된 Assumptions

- `Header.tsx`가 `MobileHeader`+`DesktopHeader`를 모두 렌더하고 CSS로 `$header-breakpoint`(768px) 기준 토글 — Read 확인. 그래서 768px 이상(태블릿 포함)에 PC 헤더가 뜬다.
- `SectionTabNav`는 `MobileHeader` 안에서만 렌더되고 `LayoutContainer`로 감싸지지 않아 뷰포트 전체 폭 차지 — `MobileHeader.tsx:93`·`SectionTabNav.module.scss` 확인.
- 콘텐츠 폭은 `LayoutContainer`/`MainContainer`가 `max-width: $container-max`(= `var(--container-max)`)로 제어 — 모바일 76.8rem / 태블릿·PC 120rem, `globals.scss:50-107` 확인.
- `BottomNav`는 `$header-breakpoint` 이상 `display:none` — `BottomNav.module.scss:19` 확인.
- `1rem`은 각 브레이크포인트에서 10px로 리셋되는 vw 기반 → `90rem ≈ 900px` — `_breakpoint.scss` `$responsive-font-vw-map` 확인.
- `config/navigation.ts`에 `isRouteMatch` 등 경로 판별 헬퍼가 이미 있어 화이트리스트 헬퍼를 같은 패턴으로 추가 가능 — Read 확인.

## Success Criteria

- 넓은 뷰포트에서 모든 `(content)` 페이지가 `DesktopHeader` 대신 `MobileHeader`를 보여준다 (화이트리스트 비어 있음).
- 헤더·탭·본문 컨테이너가 768px(`--app-frame-max`) 폭으로 가운데 정렬되고, 안쪽 콘텐츠가 같은 gutter로 좌우 정렬된다(전 페이지 동일 `contentL`·`contentR` — 1784px 기준 455/1307 실측).
- 본문 콘텐츠가 페이지별 자체 max-width 없이 프레임을 채운다(news·about 전 페이지 좌측 좌표가 같다).
- 하단바 바 배경은 화면 전체 폭을 쓰고, 아이콘 그리드는 프레임 폭으로 가운데 정렬한다.
- 교회소개(about)·교회소식(news) 하위 전 페이지가 같은 `MainContainer`(좌우 `$container-padding`·상하 20/80·PC 40)를 쓴다.
- `PC_LAYOUT_ROUTES`에 라우트를 넣으면 그 라우트만 기존 PC UI(DesktopHeader + 120rem 콘텐츠)를 그대로 보여준다 — 코드 삭제 없이 토글.
- 실제 모바일 폭(≤768px)에서 헤더·탭·하단바·본문에 시각적 회귀가 없다 (프레임 cap이 뷰포트보다 커서 무효, 하단바는 기기 전체 폭).
- 프레임 폭이 변수 1곳(`--app-frame-max`)에 정의되고 헤더·탭·본문이 이 값을 참조한다.
- `verify-task`: lint / stylelint / build 통과, knip 신규 0.

## 영향받는 파일

레이아웃 프레임·토글:
- `src/styles/globals.scss` — `:root`에 `--app-frame-max: 76.8rem`(768px) 추가
- `src/styles/tokens/_layout.scss` — `$app-frame-max` semantic 토큰
- `src/config/navigation.ts` — `PC_LAYOUT_ROUTES`(빈 배열) + `isPcLayoutRoute(pathname)`
- `src/components/layout/LayoutMode/LayoutMode.tsx` (신규, client) + `LayoutMode.module.scss` (신규)
- `src/components/layout/index.ts` — `LayoutMode` export 추가 (기존 barrel)
- `src/app/(content)/layout.tsx` — 자식을 `LayoutMode`로 래핑
- `src/app/(content)/layout.module.scss` — app 모드에서 하단바 여백 유지

헤더·탭·하단바:
- `src/components/layout/Header/Header.module.scss` — app 모드 헤더 토글 + `.mobile_top` 폭 제한
- `src/components/layout/SectionTabNav/SectionTabNav.module.scss` — app 모드 폭 제한 + sticky top offset + 탭 gutter
- `src/components/layout/BottomNav/BottomNav.module.scss` — app 모드 표시 + 바 전체폭 + 아이콘 그리드만 프레임 폭 가운데 정렬

본문 컨테이너·페이지(여백 통일):
- `src/components/layout/container/MainContainer.module.scss` — 가로 gutter를 `$container-padding` 한 값으로 맞춤
- `src/app/(content)/news/bulletins/page.module.scss`·`_component/BulletinDetail.module.scss`·`news/gallery/page.module.scss` — content wrapper `max-width` 제거(프레임 채움)
- `src/app/(content)/about/{worship,vision,location}/page.tsx`·`_component/PastorGreeting.tsx`·`about/welcome/page.tsx` — `LayoutContainer`→`MainContainer` 교체
- `src/app/(content)/about/{worship,vision,location}/page.module.scss`·`_component/PastorGreeting.module.scss`·`about/welcome/page.module.scss` — content wrapper `max-width` 제거, welcome FAQ 밴드 프레임 폭 제한

## Non-goals

- DesktopHeader·PC 전용 SCSS 삭제 금지 — 보존하고 화이트리스트로 재노출.
- `(admin)`·`login` 등 `(content)` 그룹 밖 레이아웃은 손대지 않음.
- 개별 페이지의 디자인 의도(카드·색·타이포)는 그대로 — 폭·컨테이너만 손댄다.

> 초기 Non-goal이던 "페이지 콘텐츠 미변경"은 사용자의 여백·컨테이너 통일 요청으로 D5·D6에서 넓혔다(읽기폭 cap 제거·about 컨테이너 교체).

## 접근법

- 새 변수 `--app-frame-max: 76.8rem`(=768px). app 모드에서 `--container-max`를 이 값으로 덮어 모든 컨테이너를 자동으로 프레임 폭 cap. (초기 90rem→768px로 조정 — D4 참조.)
- `LayoutMode`(client)가 `usePathname()`으로 mode 판정 후 래퍼에 `data-layout="app" | "pc"` 지정. `PC_LAYOUT_ROUTES`가 비면 항상 `app`. 래퍼는 `#root` flex 열 체인을 잇도록 `display:flex; flex-direction:column; flex:1`.
- 각 컴포넌트 SCSS는 `[data-layout='app'] &`(bare 속성 선택자, D2)로 app 모드만 분기 — 기존 PC 규칙은 그대로 두고 덮어쓴다(특이도 0,2,0 > 0,1,0으로 미디어쿼리 규칙보다 우선). PC 모드는 손대지 않아 기존 동작 그대로.

## 단계별 체크리스트

- [x] 1. `--app-frame-max` 변수 + `$app-frame-max` 토큰 추가
- [x] 2. `PC_LAYOUT_ROUTES` + `isPcLayoutRoute()` 추가
- [x] 3. `LayoutMode` 컴포넌트·SCSS 신규 + barrel export
- [x] 4. `(content)/layout.tsx`를 `LayoutMode`로 래핑
- [x] 5. Header/SectionTabNav/BottomNav/content_shell SCSS에 app 모드 분기
- [x] 6. 브라우저 실측(1920px)으로 헤더 전환·탭/본문/하단바 900px 정렬·PC 토글 확인
- [x] 7. Codex 1차 검증(PASS) → ESLint·stylelint·knip 통과(build만 dev 중지 후)
- [x] 8. 헤더·탭·하단바·본문 gutter 정렬(D3) + 실측 재확인(넷 다 541/1360)
- [x] 9. 프레임 900→768px, 하단바 전체폭 바 + 프레임폭 아이콘(D4)
- [x] 10. news·about 페이지별 읽기폭 cap 제거로 본문 여백 통일(D5) — 전 페이지 455/1307
- [x] 11. about 5개 페이지 `LayoutContainer`→`MainContainer` 통일 + welcome FAQ 프레임 폭(D6)
- [ ] 12. dev 중지 → verify-task(build) → 브랜치(feat/mobile-frame-launch, develop 기반) → 커밋(승인 후)

## Verification

- 브라우저 실측: 1440px에서 모바일 헤더·900px 정렬·탭 폭 일치, 375px에서 회귀 없음
- `node scripts/verify-task.mjs mobile-frame-launch` (lint·stylelint·build·knip)

## ADR 판단

불필요 — 변경 파일에 ADR_TRIGGER_PARTS 없음(`styles/`·`config/`·`components/`·`app/`만). 출시용 레이아웃 토글이라 되돌릴 수 있고 레이어·라이브러리·인증/캐시 정책 변경 없음. 추후 PC 페이지가 늘어 `data-layout` 패턴이 굳으면 그때 ADR 승격을 검토한다.

## 의사결정 로그

- **D1 — 상단 `ADR needed` 줄 영향 범위 표기 정정**
  - 문제: 계획 상단 `ADR needed`(`:7`)는 영향 범위를 `styles/·config/·components/만`으로 적었으나, 실제 영향 파일에 `src/app/(content)/layout.tsx`·`layout.module.scss`가 있어 `app/`가 빠졌다. Codex 계획 검증이 expression-only로 지적.
  - 해결: 상단 줄을 아래 `## ADR 판단`과 같게 `styles/·config/·components/·app/`로 맞췄다. 구현 판단은 바뀌지 않아 CR 아님(PASS_WITH_DECISION_LOG 처리).
  - 결과: `:7`과 `## ADR 판단`의 범위 표기가 일치. ADR 불필요 결론은 동일.

- **D2 — app 모드 분기 선택자에서 `:global()` 제거**
  - 문제: `:global([data-layout='app']) &`를 쓰자 stylelint `selector-pseudo-class-no-unknown`이 `:global`을 모르는 pseudo-class로 막아 5개 error가 났다(커밋 차단). 런타임(HMR)에서는 정상 동작했다.
  - 해결: `:global()`을 빼고 bare `[data-layout='app'] &`로 바꿨다. CSS Modules는 속성 선택자를 해시로 스코프하지 않아 `:global()`이 필요 없고, 같은 커밋의 `LayoutMode.module.scss:15 .shell[data-layout='app']`도 이미 bare 속성 선택자로 stylelint를 통과한다. stylelint config에 `ignorePseudoClasses` 예외를 추가(ADR_TRIGGER 파일 변경)하기보다 이 쪽이 외과적이라 택했다.
  - 결과: 변경 파일 stylelint 0 error(경고 2건은 Header의 기존 `$beige` 부채). 브라우저 재측정에서 app 모드·900px 정렬 동일(탭·하단바·본문 모두 left 501·width 900, 탭 top 50px).

- **D3 — 헤더·탭·하단바·본문의 안쪽 gutter를 `$container-padding`으로 통일**
  - 문제: 바깥 박스는 넷 다 900px로 맞았지만 안쪽 콘텐츠 gutter가 헤더 40px(`$container-padding`)·탭/하단바 0px(edge-to-edge)·본문 20px(MainContainer의 `$spacing-20`)로 제각각이라, 1920px 실측에서 콘텐츠 좌우가 어긋났다(헤더 541 vs 탭·하단바 501 vs 본문 521). 사용자가 "width가 안 맞는다"로 지적.
  - 해결: 탭(`SectionTabNav .list`)·하단바(`BottomNav .tab_list`)에 app 모드 gutter `$container-padding`을 주고, 본문 컨테이너 두 종 중 20px를 쓰던 `MainContainer`의 가로 padding을 `$container-padding`으로 바꿨다. `$container-padding`은 헤더·`LayoutContainer`가 이미 쓰는 표준 gutter라 이 값으로 통일했다(탭 20px에 맞추면 `LayoutContainer` 40px 페이지가 어긋남). 바 밑줄·배경은 전체 900px 유지, 탭·아이콘·본문만 gutter 안으로 들인다.
  - 결과: 1920px 재측정에서 헤더·탭·하단바·본문 넷 다 `contentL 541`·`contentR 1360`으로 일치(`allLeftEqual`·`allRightEqual` true). MainContainer 페이지(news·serving-people)와 LayoutContainer 페이지(about·sermons·privacy) 모두 정렬 확인. 부작용: news·serving-people 본문 가로 gutter가 PC에서 20→40px로 넓어지고, 모바일 하단바·탭이 edge-to-edge→20px inset으로 바뀐다(사용자 보고 필요).

- **D4 — 프레임 폭 900→768px, 하단바를 전체폭 바 + 프레임폭 아이콘으로**
  - 문제: 900px 프레임에서 사용자가 (1) 본문이 프레임보다 좁아 보이고 (2) 하단바가 화면 끝에 안 붙는다고 지적했다. 넓은 화면에서 900px 프레임 안에 페이지 자체 읽기폭(예: 주보 64rem=640px)이 갇혀 본문이 좁아 보였고, D3에서 하단바를 프레임 폭 중앙정렬로 좁혀 화면 좌우에 여백이 생겼다.
  - 해결: `--app-frame-max`를 90rem→76.8rem(768px, 태블릿 폭)으로 줄여 콘텐츠가 프레임을 더 채우게 했다(사용자 제안값). 하단바는 D3 중앙정렬을 되돌려 `.tab_bar` 배경은 화면 전체 폭으로 두고, `.tab_list`(아이콘 그리드)만 `max-width: var(--app-frame-max); margin: 0 auto`로 프레임 폭 중앙정렬했다(사용자 선택 "바=전체폭/아이콘=프레임폭").
  - 결과: 넓은 화면에서 본문이 프레임을 더 채우고 하단바가 화면 좌우 끝까지 붙는다. 태블릿 이하(뷰포트≤768)에선 프레임=뷰포트라 하단바가 기기 전체 폭이다.

- **D5 — 페이지별 읽기폭 cap 제거로 본문 좌우 여백 통일**
  - 문제: 페이지마다 `.wrap`/`.page`에 자체 `max-width`(52·62·64rem)를 두고 중앙정렬해, 1784px 실측에서 콘텐츠 좌측이 주보 79px·공지 50px·갤러리 92px·about 154px로 제각각이었다. 사용자가 "본문 좌우 여백이 모두 다르다"고 지적했다.
  - 해결: news(주보 목록·상세·갤러리)·about(인사말·예배·비전·오시는길)의 content wrapper에서 `max-width`를 없애 컨테이너 안쪽(프레임-padding)을 채우게 했다. 프레임(768)이 단일 폭 기준이 되고, 페이지별 cap이 만들던 추가 여백을 없앤다. 의도된 읽기폭(주보 이미지 크기 제한)은 프레임 자체가 대신 맡는다.
  - 결과: 전 페이지 콘텐츠 컨테이너가 좌 455·우 1307(1784px 기준)로 통일됐다. 본문이 프레임을 채워 "좁다" 문제도 함께 풀렸다.

- **D6 — about 페이지를 news와 같은 MainContainer로 통일 + welcome FAQ 프레임 폭**
  - 문제: about 페이지가 컨테이너를 섞어 썼다 — worship·vision·location·pastor는 `LayoutContainer body`(상하 28·64), serving-people는 `MainContainer`(상하 20·80)로 세로 padding·클래스가 페이지마다 달랐다. welcome은 FAQ가 컨테이너 밖 전체폭 밴드였다. 사용자가 "about 페이지마다 padding class가 다르다, news와 동일하게" 요청했다.
  - 해결: worship·vision·location·pastor·welcome을 `<LayoutContainer>`→`<MainContainer>`로 교체해 news와 같은 클래스·padding을 쓰게 했다. welcome FAQ 밴드는 `max-width: $container-max; margin: 0 auto`로 프레임 폭에 가뒀다(전체폭→프레임폭).
  - 결과: 교회소개·교회소식 하위 전 페이지가 같은 MainContainer(좌우 `$container-padding`·상하 20/80·PC 40)를 쓴다. welcome FAQ 밴드가 넓은 화면에서 프레임 폭, 모바일(프레임≥뷰포트)에선 전체폭으로 나온다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (신뢰도 높음)
- **현재 판단**: 5체크를 모두 통과했고, 심각도 큰 결함(구현 차단 사유)은 0건이다. 아래 5개 리스크를 코드 `file:line`으로 확인했다.
  - 특이도: 최종 선택자 `[data-layout='app'] &`는 컴파일 후 `[data-layout='app'] .<class>`로 0,2,0이라 `Header.module.scss`·`BottomNav.module.scss`의 미디어쿼리 `display` 규칙(0,1,0)을 이긴다.
  - 커스텀 프로퍼티: `_layout.scss:13`이 `$container-max: var(--container-max)`라, wrapper에서 app 모드만 `--container-max`를 다시 선언하면 `LayoutContainer.module.scss:4`·`MainContainer.module.scss:5`가 900px를 상속하고, pc 모드는 `globals.scss:93-98`의 120rem을 그대로 쓴다.
  - flex 체인: `#root`(`globals.scss:178-183`)→LayoutMode→`content_shell`(`layout.module.scss:3-8`)→`#main`(`globals.scss:185` flex:1)로 이어지고, BottomNav는 `position:fixed`라 흐름 밖이라 영향이 없다.
  - 탭 top: app 모드에서 탭 top을 `$app-header-height: 5rem`(`_layout.scss:24`)로 되돌리면 768/1024 미디어쿼리 규칙까지 덮는다.
  - full-bleed: `100vw`는 Toast(`Toast.module.scss:6`) 1건뿐이고, `HeroCarousel.module.scss:14`는 max-width 64rem이며, `sizes="100vw"`는 이미지 후보 크기 힌트라 실제 박스 폭이 아니다.
  - 표현만 어긋난 지적 1건(상단 `ADR needed` 줄이 `app/`를 빠뜨림)은 D1로 정정했다.
- **다음 행동**: D1 반영을 마치고 WORK로 들어갔다. 재요청은 하지 않는다(PASS_WITH_DECISION_LOG는 3차 자동 호출 금지).

## Codex 1차 검증

- **결론**: PASS (confidence high)
- **현재 판단**: 5개 카테고리(버그·타입·guard / 레이어 / 외과적 변경 / CSS 특이도 / 토큰·정책) 전부 "No issue found". 근거 — `PC_LAYOUT_ROUTES` 빈 배열이라 `LayoutMode.tsx:14-18`이 모든 경로에서 `data-layout="app"`로 수렴(hydration 안정), Server Component children의 client 래핑은 `ReactNode` slot이라 무해, `@/config/navigation`만 참조해 레이어 방향 불변, `--app-frame-max: 90rem`이 단일 raw 정의점이고 나머지는 CSS var 경유. Codex는 D2 이전(`:global()`) diff를 봤고 그 selector도 런타임 정상 — D2는 컴파일 출력이 같은 등가 변경이라 PASS가 유지된다.
- **다음 행동**: Claude 2차 검증(실측·정적 검사) 완료. `yarn build`만 dev 중지 후 verify-task로 마무리.

## Claude 2차 검증

- **최종 판단**: 브라우저 실측(전 페이지) + 정적 검사 통과. `yarn build`만 dev 중지 후 verify-task로 확정.
- **현재 판단**:
  - 넓은 뷰포트에서 데스크톱 전역 내비게이션(GNB)은 숨고(`offsetParent` null) 모바일 헤더가 뜬다. `data-layout='pc'` 강제 시 기존 PC UI(120rem+GNB)가 복원된다.
  - D4~D6 반영 뒤 전 `(content)` 페이지(홈·about 6·sermons·news 3·공지 상세·placeholder·로그인 리다이렉트)를 브라우저로 훑어 프레임 정렬·하단바 전체폭·본문 프레임 채움을 확인했다.
  - 본문 컨테이너 좌우가 전 페이지 `455/1307`(1784px 기준)로 같음을 `getBoundingClientRect`로 재측정했다.
  - 창 리사이즈가 이 환경에서 실뷰포트를 안 바꿔 넓은 화면 일부는 스크린샷을 못 떴다. 그 부분은 컨테이너 공통 CSS 패턴(`max-width: $container-max`, 앞서 실측한 것과 같음)으로 대신 확인했다.
- **다음 행동**: dev 중지 → `verify-task.mjs mobile-frame-launch`(build 포함) → 커밋 승인 요청.

| 시점 | 도구 | 결과 |
| --- | --- | --- |
| 2차 | ESLint (`yarn lint` 전체) | 0 error / 13 warning (전부 기존 부채)<br>- admin `<img>`<br>- login deps<br>- MainContainer 미사용 `title` |
| 2차 | stylelint (`yarn lint:styles` 전체) | 0 error / 경고만 (기존 `$beige`·hex 부채) |
| 2차 | knip | 신규 0 (`PC_LAYOUT_ROUTES` export 제거로 해소) |
| 2차 | 브라우저 실측 (전 페이지·1784px·444px) | 확인:<br>- 헤더 전환<br>- 프레임 정렬<br>- 하단바 전체폭<br>- 본문 여백 같음 |
| 2차 | `yarn build` | 미실행 (dev 구동 중) — dev 중지 후 verify-task |

## 검증 이력

## 후속 작업

<!-- full-bleed(100vw) 섹션이 900px 프레임을 깨는 경우 발견 시 -->
