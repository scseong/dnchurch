# home-gold-redesign

- **상태**: ✅ 완료 (2026-06-26)
- **시작일**: 2026-06-25
- **브랜치**: develop
- **Open questions**: none — 방향 전환(2026-06-25): 목업의 UI·레이아웃·톤을 **그대로 재현**(홈 스코프). 기존 토큰 재사용(D1)에서 목업 정확 재현(D6~D8)으로 변경. 공통 레이아웃(Header·BottomNav) P4 제외는 유지
- **ADR needed**: no — UI 컴포넌트 개편 중심. `services/home`·`services/bulletin` read-wrapper는 기존 패턴. `embla-carousel` 의존성 추가(package.json)는 단일 Hero 컴포넌트의 인터랙션 라이브러리로 사용자 명시 요청 — 아키텍처·레이어·전역 정책 변경 아님 → D10 참조

## 목표

홈(`src/app/(content)/page.tsx`)을 claude.ai/design 디자인 레퍼런스 목업의 웜 골드·명조 톤으로 개편한다. 대구동남교회 실데이터·이름은 유지하고, 프로젝트 토큰·SCSS 모듈·레이어 규칙을 따른다. 목업의 모바일 디자인을 기준으로 데스크톱까지 반응형으로 확장한다.

## 검증된 Assumptions

- 골드 액센트·웜 베이지 면·세리프 토큰이 이미 존재 — `$accent`(`$gold-600` `#c4924a`), `$bg-accent-subtle`, `$bg-secondary`(`$beige-150`), `$font-family-secondary`(Noto Serif KR). `src/styles/tokens/_color.scss`·`_typography.scss` Read.
- 목업 톤은 더 따뜻함 — 목업 골드 `#93702E`(올리브골드) vs 토큰 `#c4924a`, 목업 페이지 `#EFEBE2`(웜 크림) vs `$beige-50` `#fafaf8`("노란기 적은 중성", `_color.scss:34` 주석). 온도 차 존재.
- 인증 페이지 실재 — `src/app/login/page.tsx`·`sign-up`·`mypage` 존재(Glob 확인). 공개 헤더·바텀나비에 링크만 없음. 목업 로그인 버튼·프롬프트는 `/login`으로 연결 가능.
- "오늘의 말씀" 데이터·컴포넌트 전무 — site_settings에 verse 키 없음(`20260314000003_create_site_settings.sql` seed 확인), 전용 테이블·서비스 없음. 신규.
- 주보 service 존재, 홈 진입 함수 부재 — `bulletinService(supabase).summary().latest`(= `sunday_date desc` 1건) 재사용 가능. 날짜 필드는 `sunday_date`(`database.types.ts`). 홈용 래퍼는 신규.
- 기존 `ui/Carousel`은 자유 스크롤(scroll-snap proximity)이라 자동재생·도트·페이지 전환 없음 — 목업 §2 hero에는 신규 로직 필요, 목업 §7 포토 갤러리에는 거의 적합(grep `autoplay`/`dots` 0건).
- Header·BottomNav는 `(content)` 그룹 공통 — 변경 시 홈 외 모든 콘텐츠 페이지에 적용. BottomNav 탭은 현재 홈/설교/소식/교제/전체(`navigation.ts` `BOTTOM_NAV_ITEMS`), 목업은 홈/소개/다음세대/설교/소식. 라우트(`/about`·`/next-gen`·`/sermons`·`/news`)는 모두 실재.
- `index.ts`의 `AboutOurChurch`·`ChurchVision`은 미사용 export(grep 0건) — 이번 범위 밖, 보고만.

## Success Criteria

- 홈의 각 섹션이 목업 §1~§10 레이아웃·골드/명조 톤과 시각적으로 일치한다(Chrome 스크린샷 대조).
- 색·간격·폰트·radius·shadow를 하드코딩 없이 토큰으로만 작성한다(`yarn lint:styles` 통과).
- 설교·주보·소식은 기존 데이터 레이어(`createStaticClient` 캐싱)로 실데이터를 렌더한다.
- 모바일·데스크톱 양쪽에서 레이아웃이 깨지지 않는다(반응형 모바일 퍼스트).
- `node scripts/verify-task.mjs home-gold-redesign` 통과(lint·stylelint·build·knip 신규 0).

## 접근법 (단계 분리)

목업은 자족적 신규 섹션, 기존 섹션 리스타일, 대형 신규(캐러셀), 공통 레이아웃(블래스트 반경 큼)이 섞여 있다. 위험·응집도로 4단계로 나눠 단계마다 커밋한다.

- **Phase 1 — 자족적 신규 섹션** (블래스트 반경 0, 기존 데이터/서비스 재사용): §3 오늘의 말씀 카드, §5 이번 주 주보 홈 카드, §9 로그인 프롬프트 카드.
- **Phase 2 — 기존 홈 섹션 리스타일** (웜 톤 적용): §4 QuickAccess(원형 골드 아이콘 4열), §6 NewHere(2×2 정보 그리드 + 골드 notice), §8 RecentSermons(단일 프리뷰 카드), §7 포토 갤러리(신규, `ui/Carousel` 재사용).
- **Phase 3 — Hero 캐러셀** (단일 최대 작업): §2 Banner를 자동재생·도트·스와이프 캐러셀로 교체. 슬라이드 1 = site_settings 실데이터, 슬라이드 2~3 = 정적 편집 콘텐츠(수련회·방문 안내).
- **Phase 4 — 공통 레이아웃** (홈 외 전 페이지 영향): 이번 범위에서 **제외**(사용자 확정). §1 Header·§10 BottomNav는 후속에서 별도로 다룬다.

## 의사결정 로그

- **D1 — 웜 톤은 홈 스코프로, 전역 primitive는 건드리지 않는다(권장)**
  - 문제: 목업 골드(`#93702E`)·크림(`#EFEBE2`)이 토큰(`#c4924a`·`#fafaf8`)보다 따뜻하다. 정확히 맞추려면 primitive 값을 바꿔야 하는데, 그러면 about·sermons·news·admin 등 전 페이지 톤이 함께 바뀐다(블래스트 반경 전역).
  - 해결: 1차로 기존 시맨틱 토큰(`$accent`·`$bg-accent-subtle`·`$bg-secondary`·`$font-family-secondary`)을 그대로 쓴다. 목업과 미세한 온도 차는 감수한다. 전역 primitive를 목업 값으로 깊게 조정하는 안은 사용자 승인 시에만 별도로 진행한다. 이유: 사용자가 고른 범위는 "홈 리디자인"이고, primitive 변경은 그 범위를 넘는다. 되돌리기 쉬운 보수적 선택을 먼저 둔다.
  - 결과: 사용자가 "기존 토큰 재사용(홈 스코프)"으로 1차 확정했으나, P1 렌더 확인 후 "목업 그대로"로 방향 전환. ⚠️ 정정(2026-06-25): 폐기 → D6 참조(목업 정확 톤을 홈 스코프 토큰으로 재현).
- **D6 — 목업의 정확한 웜 톤을 홈 전용 토큰으로 재현 (D1 대체)**
  - 문제: 사용자가 목업의 UI·레이아웃·톤을 그대로 원한다. 기존 토큰(`$accent` `#c4924a`·`$bg-primary` `#fafaf8`)은 목업(`#93702E`·`#EFEBE2`)보다 덜 따뜻하다. 전역 primitive를 바꾸면 다른 페이지까지 영향("홈에만 적용" 위반).
  - 해결: `src/styles/tokens/_home.scss`에 목업 팔레트(`$home-gold` `#93702e`·`$home-bg` `#efebe2`·`$home-text` `#23271f` 등)를 홈 전용 토큰으로 선언하고 `_variables.scss` import 체인에 추가(auto-inject). 홈 모듈 SCSS만 이 토큰을 참조하므로 사용처로 스코프된다(admin 전용 토큰과 같은 컨벤션). 페이지 배경(웜 크림)은 `src/app/(content)/page.module.scss`의 home wrapper로 홈에만 적용. 이유: 전역 토큰을 안 바꾸면서 목업 톤을 정확히 맞추고, 다른 페이지는 그대로 둔다.
  - 결과: 신규 토큰 파일 1개 + import 1줄 + home wrapper. 기존 토큰·다른 페이지 영향 0.
- **D7 — 목업 세리프(Gowun Batang)를 홈 전용으로 추가**
  - 문제: 목업은 헤딩·로고·인용구에 Gowun Batang 명조를 쓴다. 기존 `$font-family-secondary`는 Noto Serif KR로 글자 느낌이 다르다.
  - 해결: `layout.tsx`에 `next/font/google`의 `Gowun_Batang`(400·700)을 추가하고 `--font-gowunBatang` CSS 변수로 노출, `_typography.scss`에 `$font-family-home-serif`로 매핑해 홈 모듈에서만 사용. 이유: 목업 글자체를 그대로 맞춘다. 폰트 1종 추가 비용은 `display: swap`·subset으로 흡수, 적용은 홈 한정.
  - 결과: 루트 layout에 폰트 1종 추가(전 페이지 로드, 사용은 홈만). 필요 시 Noto Serif KR로 되돌리기 쉬움.
- **D8 — 목업의 섹션 구성·순서를 그대로 따른다 (FeedSection 홈 제외)**
  - 문제: 현재 홈 순서·구성이 목업과 다르다. 목업에는 "교회 소식"(FeedSection) 섹션이 없다(소식은 바텀나비 §10에 흡수).
  - 해결: 홈 섹션 순서를 목업대로 재배열 — 히어로 캐러셀 → 오늘의 말씀 → 퀵링크(4) → 이번 주 주보 → 처음 오시나요(2×2) → 함께하는(갤러리) → 말씀 먼저(설교 1) → 로그인 프롬프트. FeedSection은 홈에서 내린다(컴포넌트·소식 페이지는 보존, page.tsx 조합에서만 제외). 이유: "레이아웃 그대로" 요구에 맞춘다.
  - 결과: page.tsx 조합 재배열. FeedSection은 사용자 "홈 유지" 선택으로 홈에 남기되 웜 톤으로 재스타일(⚠️ 정정: D8의 "홈 제외"는 폐기).
- **D9 — Header·BottomNav를 목업 기준으로 개편, Drawer는 헤더 메뉴로 이전 (P4, 2026-06-26)**
  - 문제: 사용자가 Header·BottomNav도 목업대로 원함. 목업 바텀나비 5탭(홈/소개/다음세대/설교/소식)에는 '전체'(메뉴) 탭이 없어, 그대로 바꾸면 모바일 전체메뉴(Drawer = MobileNavigation)가 사라져 깊은 페이지(예배안내·오시는길·주보·갤러리·교제·검색·알림) 접근이 끊긴다.
  - 해결: 바텀나비를 5탭으로 바꾸고, Drawer 트리거(useDrawerHistory)·overlay·Drawer 렌더를 BottomNav에서 MobileHeader로 옮긴다. 모바일 헤더에 골드 로고(leaf)+세리프 교회명+메뉴(햄버거)를 둔다(로그인 링크는 사용자 요청으로 제거). 처음에는 전역 토큰(`$accent`·`$font-family-secondary`)으로 두었으나, 사용자가 "Header·BottomNav만 bg 톤이 안 맞는다"고 해 BottomNav·Header 배경·active 색을 `$home-bg`·`$home-gold-strong` 등 홈 토큰으로 맞췄다. 이유: 사용자가 고른 "헤더 메뉴 버튼" 방식 — 목업 5탭 유지 + 네비게이션 손실 0 + 콘텐츠 크림 톤과 레이아웃 톤 일치.
  - 결과: BottomNav 5탭+골드 active(`$home-gold-strong`), MobileHeader 목업화+Drawer 보유(렌더 확인), 데스크톱 로고 골드+세리프. 공용 BottomNav·Header에 홈 토큰을 적용했으므로 콘텐츠 전 페이지에 크림 톤이 깔린다(`_home.scss` 주석에 사용처 반영). (BottomNav.module.scss의 옛 `drawer_overlay` 클래스는 미사용으로 남음 — 후속 정리.)
  - ⚠️ 정정(PR #132 리뷰):
    - 5번째 탭은 '소식'이 아니라 '마이페이지'다(사용자가 마지막 열을 마이페이지로 변경 요청).
    - `/mypage`가 `(content)` 밖이라 Header·BottomNav 없이 빈 화면에 갇혔다 — 코드 리뷰 #6 지적으로 `src/app/(content)/mypage/`로 옮겨 헤더·하단바가 함께 뜨게 했다.
- **D10 — Hero 캐러셀을 직접 구현에서 Embla Carousel로 교체 (2026-06-26)**
  - 문제: 직접 구현한 캐러셀(touch 핸들러 + setInterval autoplay)은 관성 스크롤·무한 루프·기기별 터치 이벤트 파편화를 제대로 못 다룬다. 또 클라이언트 컴포넌트에서 레이아웃 배럴을 import해 blank 렌더 버그도 났었다.
  - 해결: `embla-carousel-react` + `embla-carousel-autoplay`(8.6.0) 도입. `loop: true` + `Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true })`. headless라 기존 SCSS·마크업 구조를 그대로 쓰고, 직접 만든 touch/타이머/transform 로직은 제거. 도트는 `emblaApi.scrollTo`·`selectedScrollSnap`·`on('select')`로 연결. 이유: 사용자가 관성 스크롤·무한 루프·터치 안정성·headless·경량(~4KB)을 근거로 명시 요청.
  - 결과: 신규 런타임 의존성 2개(+transitive `embla-carousel`·`reactive-utils`). HeroCarousel.tsx가 `useEmblaCarousel` 기반으로 단순화. ADR은 frontmatter 판단대로 불필요(단일 컴포넌트 라이브러리).
- **D2 — 오늘의 말씀 데이터는 site_settings 키 + 정적 폴백**
  - 문제: verse 데이터·테이블·서비스가 없다. 새 테이블은 과한 추상화다.
  - 해결: `verse_text`·`verse_reference` site_settings 키로 읽되, `app/`은 `apis/`를 직접 못 부르므로(`eslint.config.mjs`) `services/home/index.ts`에 읽기 래퍼 `getTodayVerse()`를 두고 그 안에서 `getSiteSettings([...])`를 호출한다. 미설정 키는 `displaySettingValue`(`src/utils/site-settings.ts`)로 정적 폴백(마태복음 11:28)을 적용한다. 이유: `ChurchJsonLd` → `@/services/about` 패턴처럼 레이어 규칙을 지키고, `Banner`의 eslint-disable 우회(신규 위반 누적)를 따르지 않는다. 전용 admin UI는 후속.
  - 결과: 신규 `services/home` 래퍼 1개 + 컴포넌트 1개 + 키 2개. 캐시 태그는 기존 `site-settings` 공유, 레이어 위반 0.
- **D3 — Hero 캐러셀 슬라이드 데이터는 실데이터 1 + 정적 편집 2**
  - 문제: 목업은 3슬라이드인데 site_settings는 단일 배너용 키만 있다. 3슬라이드를 전부 DB화하면 admin 입력 모델까지 신규로 커진다.
  - 해결: 슬라이드 1은 기존 `banner_*` site_settings(실데이터), 슬라이드 2~3(수련회·방문 안내)은 정적 편집 콘텐츠로 둔다. 이유: 가장 자주 바뀌는 메인 배너만 운영 데이터로 두고, 홍보성 슬라이드는 코드 상수로 충분하다. 슬라이드 전체 DB화는 후속.
  - 결과: Phase 3은 UI·캐러셀 로직 중심. 데이터 모델 신규 최소화.
  - ⚠️ 정정(PR #132 리뷰): 사용자가 'Hero 전부 더미 데이터 사용'을 명시 요청해 슬라이드 1~3 모두 정적 `SLIDES`(Banner.tsx)로 바꿨다. `banner_*` site_settings 연결은 하지 않는다 — 정식 운영 시 후속. (리뷰 P1 지적은 운영 전 상태라 회귀 아님.)
- **D4 — 이번 주 주보는 기존 `summary()`/팩토리를 재사용, 쿼리 복제 금지 (Codex F2)**
  - 문제: 홈 카드용 "최신 1건"을 따로 짜면 정렬·`deleted_at` 필터·`bulletin_images(*)` join이 `bulletin-service.ts:60` `summary()`와 2벌로 갈라진다.
  - 해결: 공유 헬퍼 `latestQuery(supabase)`를 추출해 `summary()`의 latest 쿼리와 새 `latest()` 메서드가 같이 쓴다. `services/bulletin/index.ts`에 `getLatestBulletin = () => bulletinService(createStaticClient(bulletinCache.summary())).latest()` 래퍼를 둔다. 이유: 쿼리 조건을 한 곳에서만 관리해 중복을 없애고, 캐시 태그(`bulletin`·`bulletin-summary`)는 주보 mutation의 기존 `updateTag('bulletin')`이 무효화하므로 새 태그가 필요 없다.
  - 결과: 팩토리에 `latest()` 1개 + index.ts 래퍼 1개. `summary()`는 헬퍼 호출로 1줄 교체. 쿼리 중복 0.
- **D5 — 톤 비교 토큰 라벨 정정 (Codex F4)**
  - 문제: Assumptions가 목업 페이지 `#EFEBE2`를 `$bg-primary`(`$beige-50` `#fafaf8`)와 비교했는데, 카드·섹션 웜 면에 실제로 쓸 토큰은 `$bg-secondary`(`$beige-150` `#f2f0eb`)·`$bg-card`다.
  - 해결: 페이지 배경 비교는 그대로 두되, 카드 면 작성 시 기준 토큰은 `$bg-secondary`·`$bg-card`임을 명시한다. 온도 차 감수라는 결론(D1)은 바뀌지 않는다.
  - 결과: 표현 정정 1줄. 구현·판정 영향 없음.

## 영향받는 파일

- 신규: `src/app/_component/home/TodayVerse.tsx`(+scss), `WeeklyBulletin.tsx`(+scss), `LoginPrompt.tsx`(+scss), `PhotoGallery.tsx`(+scss), `HeroCarousel.tsx`(+scss, Phase 3)
- 수정: `src/app/_component/home/QuickAccess.*`, `NewHere.*`, `RecentSermons.*`+`SermonCard.*`, `Banner.*`(Phase 3 교체), `SectionFallbacks.tsx`, `index.ts`, `src/app/(content)/page.tsx`
- 데이터: `src/services/home/index.ts`(신규 — `getTodayVerse` 래퍼), `src/services/bulletin/index.ts`+`bulletin-service.ts`(`getLatestBulletin` 래퍼 + `latest()` 메서드 + `latestQuery` 공유 헬퍼)
- 공통(Phase 4): `src/components/layout/Header/*`, `BottomNav/*`, `src/constants` 또는 `navigation.ts`
- 루트: `src/app/layout.tsx`(세리프 weight 추가는 목업이 요구할 때만 — perf 부채 주의)

## 단계별 체크리스트

- [x] P1-1. `services/home` `getTodayVerse` 래퍼(+`displaySettingValue` 폴백) + TodayVerse 컴포넌트 (§3)
- [x] P1-2. bulletin `latestQuery`+`latest()`+`getLatestBulletin` 래퍼 + WeeklyBulletin 카드 (§5)
- [x] P1-3. LoginPrompt 카드 (§9)
- [x] P1-4. page.tsx에 배치 + 웜 톤 토큰 검증 + Chrome 대조
- [x] P2-1. QuickAccess 4열 원형 골드 아이콘 (§4) — 렌더 확인
- [x] P2-2. NewHere 2×2 정보 그리드 + 골드 notice (§6) — 'use client'·FAQ 제거, 정적 카드로. 렌더 확인
- [x] P2-3. RecentSermons 단일 프리뷰 카드 (§8) — SermonCard를 목업 프리뷰 카드(16:9 썸네일+재생+밝은 info)로 재작업, RecentSermons 단건. 렌더 확인
- [x] P2-4. PhotoGallery 가로 스크롤 (§7) — 신규, 골드 그라디언트 placeholder. 렌더 확인
- [x] P2-5. page.tsx 목업 순서 재배열 — NewHere를 RecentSermons 앞으로, PhotoGallery 삽입. FeedSection은 사용자 "홈 유지" 선택 후 웜 톤으로 재스타일(목업과 톤 일치)
- [ ] (폴리시) NewHere 2×2 타일의 카드 대비를 `$bg-card` 표면 대비로 올릴지 판단
- [ ] (폴리시) FeedSection 이중 헤더(섹션 h2와 column 헤더 중복)를 하나로 합칠지 판단
- [x] P3-1. HeroCarousel(자동재생·도트·스와이프, `'use client'` + 타이머 cleanup) — Banner를 서버 래퍼로, HeroCarousel 클라이언트로 분리. 슬라이드1 banner_* 실데이터, 2·3 정적. 그라디언트 배경. 렌더 확인
- [x] P3-2. BannerFallback 갱신 — HeroCarousel.module.scss skeleton 사용, Banner.module.scss 삭제
- [x] P4-1. BottomNav 5탭(홈/소개/다음세대/설교/소식) + 골드 active + 아이콘 (§10) — 렌더 확인
- [x] P4-2. MobileHeader 골드 로고+세리프 교회명+로그인+메뉴, Drawer 헤더로 이전 (§1) — 렌더 확인(Drawer 정상)
- [x] P4-3. 데스크톱 로고 골드+세리프(CSS) · 캐러셀 padding 정합(LayoutContainer)
- [x] 전체 diff 대상 Codex 1차 검증(CR 1건 폰트 미연결 → 수정) + verify-task(run 164443, dev 중지 후)
- [ ] 커밋(사용자 승인) — feature 브랜치, task 파일만(연구 문서 제외)

## Non-goals

- (정정 2026-06-26) 공통 레이아웃(Header·BottomNav)은 사용자 요청으로 **범위 포함**(P4) — 아래 D9.
- 전역 primitive 색 값 조정(D1) — 홈 스코프로 기존 토큰만 재사용.
- `AboutOurChurch`·`ChurchVision` 미사용 export 제거 — 이전 page도 안 쓰던 기존 dead code, 별도 정리 작업.
- `getRevealStyle`(`utils/reveal.ts`)·`NOTICE_CATEGORY_VARIANT`(`constants/notice.ts`) 제거 — 이번에 `data-reveal`·컬러 배지를 빼며 새로 고아가 됨. 둘 다 홈 밖 공용 파일이라 이 커밋은 home 리디자인으로 좁히고 후속에서 일괄 정리. (`utils/reveal.ts`의 `revealStyle`은 `AboutOurChurch`·`ChurchVision`이 여전히 써 남긴다.)
- 캐러셀 슬라이드·오늘의 말씀 admin 입력 UI — 후속(site_settings 직접 입력으로 충분).
- 인증 흐름 자체 변경 — 기존 `/login` 페이지로 링크만 연결.

## Verification

- `node scripts/verify-task.mjs home-gold-redesign`
- Phase별 Chrome 시각 검증(dev 서버 렌더 → 스크린샷 → 목업 대조)

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high) — 2026-06-25
- **핵심 지적**:
  - F1 (material): TodayVerse가 `getSiteSettings`(`src/apis/site-settings.ts`)를 직접 import하면 `app/`→`apis/` 금지(`eslint.config.mjs`, `Banner.tsx:3`의 기존 eslint-disable이 규칙 실재 증명)로 `yarn lint` 신규 error 1건 → Success Criteria(lint 통과) 자동 실패. `services/` 래퍼 경유 필요(본보기: `ChurchJsonLd.tsx` → `@/services/about`).
  - F2 (material): `getLatestBulletin`이 팩토리에 새 쿼리를 복제하면 정렬·`deleted_at` 필터·`bulletin_images(*)` join이 `bulletin-service.ts:60` `summary()`와 2벌로 갈라짐. 기존 `summary`/팩토리 재사용 필요.
  - F3·F4·F5 (expression-only): verse 캐시·데이터 안전(폴백은 `displaySettingValue` 재사용), 톤 비교 토큰 라벨 정정, 캐러셀 client cleanup은 1차 검증 항목.
- **현재 판단**: material 2건은 plan 텍스트 수정으로 해소 — D2 정정(F1), D4 추가(F2), 영향 파일에 `services/home` 추가. 새 라이브러리·데이터 흐름·인증/캐시 변경 0건.
- **다음 행동**: 수정 반영 완료 → WORK(P1) 진행. CR이라 재요청 불필요(BLOCK 아님).

## Codex 1차 검증

- **결론**: FIX_APPLIED (confidence: high) — 2026-06-26, 전체 diff(56파일) 대상 (Codex가 CHANGE_REQUEST 1건 보고 → Claude가 수정 적용)
- **CR 1건 (material·버그)**: Gowun Batang 폰트를 `layout.tsx:47`에 선언했으나 `:56` `<html className>`에 `gowunBatang.variable`을 더하지 않아 `--font-gowunBatang` CSS 변수가 출력되지 않았다. `$font-family-home-serif: var(--font-gowunBatang)`를 쓰는 히어로 title(`HeroCarousel.module.scss:73`)·오늘의 말씀 인용구(`TodayVerse.module.scss:29`)가 브라우저 기본 세리프로 폴백 → D7 목업 글자체 재현이 깨진다. ESLint가 `47:7 'gowunBatang' is assigned a value but never used` warning으로만 잡아 lint 게이트는 통과했다.
  - 적용 수정: `className={`${notoserifKR.variable} ${gowunBatang.variable}`}` (`layout.tsx:56`) — 1줄. ESLint unused warning도 함께 해소(아래 run 164443 lint ✅).
- **expression-only 1건 (CR 아님)**: `_home.scss` 주석("홈 외 페이지에서 사용 금지")·D9 문구("전역 토큰을 쓴다")가 실제 구현(공용 BottomNav·Header가 `$home-bg`·`$home-gold-strong` 사용)과 어긋났다. → 두 곳을 고쳐 처리했다. D9 문구를 실제 구현(공용 레이아웃도 홈 토큰 사용)에 맞췄고, `_home.scss` 주석에 사용처(홈과 공용 레이아웃)를 적었다.
- **PASS 확인 항목**: Embla(cleanup `off('select')`·`off('reInit')`·`loop: true`·dot sync `on('select')` 정상), WeeklyBulletin 날짜 파싱(`sunday_date` non-null date `YYYY-MM-DD`), getTodayVerse 폴백(`displaySettingValue`), 레이어 경계(신규 app→apis 직접 import 0), 외과적 변경(Footer 삭제 dangling 0 · `latestQuery` 추출 동작 동일), Drawer 이전(useDrawerHistory·overlay·렌더 정상).

## Claude 2차 검증

- **최종 판단**: PASS — Codex CR(폰트 미연결) 수정 후 verify-task 재실행(run 164443)에서 lint·stylelint·build 통과. knip 신규 2건은 `getRevealStyle`·`NOTICE_CATEGORY_VARIANT`다. 이번에 `data-reveal`·컬러 배지를 빼며 고아가 됐고, Non-goals에서 후속 정리로 분리했다. 나머지 경고는 기존 부채다.
- **폰트 수정 교차 확인**: `layout.tsx:56` className에 `gowunBatang.variable` 추가 → `_typography.scss` `$font-family-home-serif: var(--font-gowunBatang)` → `HeroCarousel.module.scss:73`·`TodayVerse.module.scss:29` 참조까지 사슬 연결 확인. build 통과 + ESLint unused warning 소멸. 브라우저 computed font-family 실측은 커밋용 dev 중지 상태라 미수행 — 사슬·빌드로 구조 확인.
- **Chrome 실측(이전 run)**: dev 서버 `GET / 200`, `verse_text/verse_reference`·`bulletins limit=1` 쿼리 200. 렌더 순서 — Banner → 오늘의 말씀(골드 그라디언트 인용구) → QuickAccess → 이번 주 주보 → RecentSermons → NewHere → FeedSection → 로그인 프롬프트. 크림 bg + 골드 그라디언트 verse + 골드틴트 주보 렌더 확인. 데스크톱은 `resize_window` 호출이 어긋나 일부 스크린샷을 못 얻었다 — 카드는 `max-width: 64rem` 중앙정렬이라 구조상 안전하다.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차(Codex, 구 P1) | — | ✅ | — | — | — | tsc 0 · eslint 0 · 쿼리 동일성 |
| 2차(Claude, 구 P1) | 20260625-223208 | ✅ | ✅ | ✅ | 0 | Chrome 3섹션 렌더 |
| 재작업(Claude) | 20260625-225615 | ✅ | ✅ | ✅ | 0 | 목업 웜 톤 — verse/bulletin/login + 크림 bg |
| 최종(Codex 1차 + Claude 2차) | 20260626-164443 | ✅ | ✅ | ✅ | 2(후속분리) | 폰트 CR 수정 · 폰트 사슬 구조 확인 |

## PR 리뷰 대응

PR #132 자동 리뷰(gemini·codex-connector) 8건을 코드로 직접 확인하고 Codex로 교차 검증했다(두 검증 판정 일치).

| # | 지적 | 출처 | 코드 대조 | 판정 | 조치 |
| --- | --- | --- | --- | --- | --- |
| 1 | getSiteSettings null 반환 → null 참조 크래시(NPE) | gemini HIGH | `site-settings.ts:18` `Object.fromEntries((data ?? [])…)`가 항상 객체 반환 | 오탐 | 없음(이중 guard) |
| 2 | 주보 `sunday_date.split` 크래시 | gemini MED | `database.types.ts` `sunday_date: string` non-null + `!bulletin` 가드 | 오탐 | 없음 |
| 3 | verify-task rmSync try-catch | gemini MED | PR diff에 `scripts/verify-task.mjs` 없음(base ec00f48) | 범위 밖 | 없음 |
| 4 | Banner 더미 → admin 배너 끊김 | codex P1 | `Banner.tsx` 정적 SLIDES, 사이트 운영 전 상태 | 의도됨 | D3 정정 |
| 5 | `/`에 h1 없음 | codex P2 | home·page.tsx에 h1 0건, 슬라이드 제목은 h2 | REAL | page.tsx에 `blind` h1 추가 |
| 6 | 마이페이지 탭 빈 화면 trap | codex P2 | `mypage/page.tsx`=`<div>Mypage</div>`, (content) 밖 | REAL | `(content)/mypage`로 이동 |
| 7 | 개인정보처리방침 링크가 사라짐 | codex P2 | Footer 삭제, src에 `/privacy-policy` 링크 0건 | REAL | MobileNavigation 하단에 링크 추가 |
| 8 | 비활성 슬라이드 CTA 포커스 | codex P2 | 슬라이드에 inert/aria-hidden 없음 | REAL | 비활성 슬라이드 `inert`+`aria-hidden` |

봇이 매긴 심각도가 실제 위험과 맞지 않았다. HIGH(#1)·P1(#4)은 오탐이거나 의도한 동작이고, 사용자가 실제로 막히는 건 P2로 분류된 #6·#7이었다.

### 2차 재리뷰 (codex-connector, 수정 push 후)

수정 push 뒤 codex가 4건을 더 지적했다. 코드·문서로 다시 확인했다.

| # | 지적 | 판정 | 조치 |
| --- | --- | --- | --- |
| A | 데스크톱에 `/privacy-policy` 링크 없음(1차 #7 수정이 모바일 Drawer만 커버) | REAL | claude.ai/design '교회 푸터' 목업을 본떠 `src/components/layout/Footer/`를 새로 만들고 데스크톱·모바일 공통으로 노출한다(로고·교회명, 예배안내, 오시는길, 개인정보처리방침)<br>예배안내는 `(content)/layout`(app 레이어)에서 `worship_schedules`(예배 일정 원본)를 읽어 props로 내려준다 — `components/`는 `services/`를 직접 import할 수 없어서다<br>연락처(`site_settings` 미설정)·이용약관(페이지 없음)은 넣지 않았다<br>기존 Drawer 링크는 Footer로 모으고 Drawer에서는 지웠다 |
| B | LoginPrompt가 로그인 진입점을 재노출 — info-site-cleanup이 정한 인증 진입점 숨김, 가입 동의 UI 런칭 게이트와 충돌 | REAL(정책) | 사용자 결정으로 유지한다<br>동의 UI는 tech-debt 런칭 게이트(7/1 전)로 이미 추적한다 |
| C | 마이페이지 탭이 인증 체크 없는 미완성 페이지로 연결 | 부분 타당 | 사용자 결정으로 탭을 유지한다(빈 화면은 1차 #6 이동으로 해소)<br>페이지 본문과 인증은 후속으로 미룬다 |
| D | 자동재생 캐러셀에 정지 수단 없음(WCAG 2.2.2) | REAL(a11y) | 이번 PR에서는 보류한다<br>prefers-reduced-motion 대응과 정지 버튼은 후속으로 미룬다 |

## 회고

### 잘된 것
- claude.ai/design 목업을 실데이터로 옮기며 더미(한빛교회·연락처 TODO)는 빼고 SSOT(`worship_schedules`·`CHURCH_INFO`)에 연결했다. 페이지 없는 이용약관 링크도 만들지 않았다.
- 코드 리뷰 12건을 코드로 직접 확인하고 Codex로 교차 검증해, 봇 오탐 3건(getSiteSettings NPE·주보 날짜·verify-task 범위 밖)을 근거 들어 기각했다. 봇이 매긴 심각도(HIGH·P1)와 실제 위험이 뒤집힌 것도 가려냈다.
- 레이어 위반(components→services)을 빌드 실패로 잡아 app 레이어 fetch + props 주입으로 바로잡았다.

### 다음에 할 것
- 데이터가 필요한 공용 컴포넌트는 처음부터 props 주입으로 설계한다 — `components/`는 `services/`를 직접 import할 수 없다는 점을 먼저 확인한다.
- 라우트 이동(mypage)·async 전환 뒤에는 `.next`를 비우고 빌드한다 — 스테일 생성 타입으로 빌드가 두 번 깨졌다.

### 부채 (tech-debt/active.md 등록)
- 신규 등록 3건:
  - 캐러셀 자동재생에 정지 수단이 없다 (WCAG 2.2.2)
  - 마이페이지 본문과 인증 흐름이 미완성이다
  - 홈 리디자인으로 생긴 고아 코드를 정리한다
- 기존 추적: 가입 동의 UI(7/1 런칭 게이트), Banner 슬라이드 1 `site_settings` 재연결(운영 시).

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

- 공통 레이아웃 골드/명조 적용(목업 §1 Header·§10 BottomNav)
  - 이유: Header·BottomNav는 `(content)` 그룹 공통이라 홈 외 모든 페이지에 적용된다. 특히 바텀나비 탭 교체(교제·전체 → 소개·다음세대)는 모바일 네비게이션 IA 변경이라 별도 검토가 필요하다.
  - 다음 기준: 홈 P1~P3 완료 후 사용자와 IA 변경 범위를 합의하면 진행.
  - 기록 위치: 없음(이 후속 항목으로 추적)

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

