# 디자인 시스템 통합 — Phase 1 감사

> 본 문서는 Phase 1 감사 결과의 snapshot이다. `(content)` 7 도메인 / 36 페이지에서 4 영역(컴포넌트 선택·레이아웃 구조·시각 토큰·상호작용/빈 상태) 일관성 위반을 file:line 증거로 식별한다. Phase 2 카탈로그 작성의 입력 자료.
>
> - **감사일**: 2026-05-30
> - **기준 커밋**: 7a23c93 (admin 토큰 흡수) — 2026-06-01 develop 47608d5에 맞춰 정렬했다. #106이 `/fellowship` 도메인을 삭제해 페이지를 37에서 36으로, 스켈레톤 집계를 16으로 정정했다(fellowship 1건 + 기존 합계 오기 1건).
> - **갱신 정책**: 본 문서는 Phase 1 시점의 기록이다. 이후 Phase에서 위반을 해소하면 결과는 `docs/exec-plans/completed/`에 기록하고 본 문서는 그대로 둔다.

## 한눈에 보기

| 영역 | 핵심 발견 | 증거 카운트 |
| --- | --- | --- |
| 1. 컴포넌트 선택 | 페이지 컨테이너 2종 혼재(`LayoutContainer` 10·`MainContainer` 5). 카드 그리드 4종이 sermons 안에서 별도 컴포넌트로 공존. about 정적 페이지의 카드/스텝 패턴은 페이지 SCSS로 직접 작성 — 공통화 0. | 컨테이너 19, 카드 4 |
| 2. 레이아웃 구조 | 36 페이지 중 16 페이지가 1줄짜리 placeholder(`<div>한글</div>` 또는 다른 경로 위임). 구현된 20 페이지도 hero·body·footer 배치가 도메인별로 다름. | 스켈레톤 16, hero 패턴 3종 |
| 3. 시각 토큰 | `(content)` 영역만으로 primitive 토큰 직접 사용 36건, hex 하드코딩 3건, focus-ring 비표준 8건. semantic 도입 후에도 warm tint를 hover 면에 쓰는 Hover 3원칙 #1 위반. | 36 + 3 + 8 + 2 |
| 4. 상호작용·빈 상태 | `loading.tsx`·`error.tsx`·`not-found.tsx`·`EmptyState`가 sermons 도메인에 편중. news 부분 적용, 나머지 5 도메인 0. | sermons 11 / 그 외 7 / 5 도메인 0 |

## 페이지 유형 분류 (36 페이지)

분류 정의 — **랜딩**: 도메인/홈 메인. **리스트**: 컬렉션 목록 + 페이지네이션·필터. **디테일**: 단일 엔티티(`[id]`·`[slug]`). **정보형**: 정적 콘텐츠 중심(소개·인사말 등). **폼**: create/update 액션. **위임**: 다른 경로 컴포넌트 재사용. **스켈레톤**: 1–3줄 placeholder.

| 도메인 | 랜딩 | 리스트 | 디테일 | 정보형 | 폼 | 위임 | 스켈레톤 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `(content)` 루트 | `page.tsx` (홈) | — | — | — | — | — | — |
| about | `about/page.tsx` | `about/serving-people/page.tsx` | — | `location`·`pastor`·`vision`·`welcome`·`worship` | — | — | — |
| community | — | — | — | — | — | — | `community/page`·`groups`·`groups/[id]`·`prayer`·`prayer/[id]`·`sharing`·`sharing/[id]` (7) |
| news | — | `news/bulletins/page.tsx`·`news/notices/page.tsx` | `news/bulletins/[id]/page.tsx`·`news/notices/[id]/page.tsx` | — | `news/bulletins/create/page.tsx`·`news/bulletins/[id]/update/page.tsx` | `news/page.tsx`(→bulletins) | `news/gallery/page`·`gallery/[id]` (2) |
| next-gen | — | — | — | — | — | — | `next-gen/page`·`elementary`·`kindergarten`·`young-adult`·`youth` (5) |
| notifications | — | — | — | — | — | — | `notifications/page.tsx` |
| search | — | — | — | — | — | — | `search/page.tsx` |
| sermons | `sermons/page.tsx` | `sermons/all/page.tsx`·`sermons/series/page.tsx` | `sermons/[id]/page.tsx`·`sermons/series/[id]/page.tsx` | — | — | — | — |
| **합계** | 3 | 5 | 4 | 5 | 2 | 1 | **16 (44%)** |

스켈레톤 16 페이지는 Phase 3(next-gen 신규) + Phase 4(기존 페이지 마이그레이션) 작업 큐.

## 컨테이너 사용 분포

| 컨테이너 | 페이지 수 | 사용처 |
| --- | --- | --- |
| `LayoutContainer` | 10 | about/* (5/6 — `serving-people` 제외)·sermons/* (5/5) |
| `MainContainer` | 5 | `about/serving-people` + `news/bulletins/*` (3) + `news/notices/page.tsx` |
| 컨테이너 없음 | 17 | 홈(자체 hero 섹션) + 스켈레톤 16 |
| **합계** | 32 | (스켈레톤 일부 포함, 위임 1 = `news/page.tsx` 제외) |

`(content)` 라우트 그룹은 layout이 HeroSection + Breadcrumb를 자동 포함하지만 페이지 본문 컨테이너는 페이지가 직접 선택한다. about/serving-people만 about 도메인 안에서 `MainContainer`를 쓰는 이유는 staff list가 board(news와 같은 패턴)와 가까워서로 추정.

## 공용 UI 사용 매트릭스

`(content)` 안에서 `from '@/components/ui'` import 분포(13종 기준 — Carousel은 직접 경로 import).

| 컴포넌트 | sermons | about | news | community | next-gen | notifications | search |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `EmptyState` | 4 | 1 (`worship`) | 0 | 0 | 0 | 0 | 0 |
| `Pagination` | 1 (`all`) | 0 | 2 (`bulletins`, `notices`) | 0 | 0 | 0 | 0 |
| `Skeleton` | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Label` | 0 | 0 | 2 (`notices`) | 0 | 0 | 0 | 0 |
| `ListItem` | 3 | 0 | 1 (`notices/Drawer`) | 0 | 0 | 0 | 0 |
| `BottomSheet` | 3 | 0 | 1 (`notices/CategoryBottomSheet`) | 0 | 0 | 0 | 0 |
| `Button` | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Carousel` | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Pill` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Tabs` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Modal` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `TextField` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `Textarea` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

요약 — sermons가 공용 UI를 가장 적극 사용(7종). about는 EmptyState 1건만. news는 4종(Pagination/Label/ListItem/BottomSheet) 사용. 나머지 4 도메인은 0건(스켈레톤). `Pill·Tabs·Modal·TextField·Textarea` 5종은 `(content)` 전체에서 0건 — admin 또는 `src/components/` 내부에서만 쓰이는 것으로 추정.

## 4 영역 위반 정리

### 영역 1 — 컴포넌트 선택 비일관

#### V1-1. 페이지 컨테이너 2종 혼재

- **현상**: `LayoutContainer`와 `MainContainer`가 같은 라우트 그룹 안에서 혼재. 같은 도메인 안에서도 about/serving-people만 다른 컨테이너.
- **증거**:
  - `src/app/(content)/sermons/all/page.tsx:3` — `import { LayoutContainer } from '@/components/layout';`
  - `src/app/(content)/news/bulletins/page.tsx:3` — `import MainContainer from '@/components/layout/container/MainContainer';`
  - `src/app/(content)/about/page.tsx:4` + `src/app/(content)/about/serving-people/page.tsx:3` — about 안에서 컨테이너 갈림
- **권장 대체**: Phase 2에서 사용 기준을 ADR로 정의. 둘 다 필요하면 명시적 prop 차이(`title` 자동 표기 vs 자유 hero)로 구분, 아니면 하나로 통합.

#### V1-2. 카드 컴포넌트 sermons 안에서 4종 공존

- **현상**: sermons 도메인이 "썸네일 + 제목 + 메타" 카드를 사용처마다 별도 컴포넌트로 구현. 시각·구조는 비슷한데 props·layout이 다름.
- **증거**:
  - `src/app/(content)/sermons/_component/GridCard/GridCard.tsx` — `sermons/all` 리스트용
  - `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonCarouselCard.tsx` — Recent Carousel용
  - `src/app/(content)/sermons/_component/SermonSeriesCarousel/SeriesCard.tsx` — Series Carousel용
  - `src/app/(content)/sermons/_component/SeriesDetailPage/SeriesEpisodeCard.tsx` — Series 디테일 에피소드용
- **권장 대체**: Phase 2에서 `SermonCard`(설교 단일 표현) + `SeriesCard`(시리즈 단일 표현) 2종으로 통합. variant prop(`grid`·`carousel`·`episode`)으로 layout 차이 흡수.

#### V1-3. 카드/스텝/필러 그리드를 페이지 SCSS로 직접 작성

- **현상**: about 정적 페이지들이 같은 "번호 + 라벨 + 제목 + 설명" 카드를 매번 페이지 SCSS로 새로 작성. 공통 컴포넌트 추출 없음.
- **증거**:
  - `src/app/(content)/about/page.tsx:130-150` — INDEX 4 카드, `styles.index_card`
  - `src/app/(content)/about/welcome/page.tsx:66-79` — 4 STEPS, `styles.step_card`
  - `src/app/(content)/about/vision/page.tsx:98-113` — 3 PILLARS, `styles.pillar_card`
- **권장 대체**: Phase 2에서 `NumberedCard`(번호·라벨·제목·설명·옵션 아이콘 prop) 1종 도입 검토. 도입 비용 vs 페이지별 표현 자유도 절충은 Phase 2 ADR.

#### V1-4. `news/page.tsx`가 `bulletins` 컴포넌트로 위임

- **현상**: `/news` 진입 시 `<Bulletin searchParams={...} />`를 그대로 렌더. URL과 콘텐츠가 따로 노는 anti-pattern.
- **증거**: `src/app/(content)/news/page.tsx:1-9`
- **권장 대체**: Phase 2에서 결정 — (a) `/news`에서 `/news/bulletins`로 redirect, (b) news 도메인 랜딩(bulletins + notices + gallery 3 영역 요약) 신규 구현.

#### V1-5. 빈 상태/에러 처리 방식 비일관

- **현상**: 같은 "데이터 없음" 상황에 `EmptyState` 사용 페이지와 raw `<div>` 사용 페이지가 공존.
- **증거**:
  - `src/app/(content)/sermons/all/page.tsx:84-88` — `<EmptyState title="해당 시리즈를 찾을 수 없습니다" description="..." announce />`
  - `src/app/(content)/news/bulletins/page.tsx:37` — `if (error || !data) return <div>데이터를 불러올 수 없습니다.</div>;`
  - `src/app/(content)/about/worship/page.tsx:110` — `<EmptyState title="예배 일정 준비 중" size="compact" />`
- **권장 대체**: 데이터 부재·에러 양쪽에서 `EmptyState`를 표준 — Phase 4에서 news 페이지 raw `<div>`를 교체.

### 영역 2 — 레이아웃 구조 비일관

#### V2-1. 스켈레톤 페이지 16개 — `(content)`의 44%

- **현상**: 36 페이지 중 16 페이지가 1–3줄 placeholder. 라우트는 잡혀 있으나 콘텐츠·레이아웃 미구현.
- **증거**(전수 — Phase 3·4 작업 큐):
  - community: `community/page.tsx`·`groups/page.tsx`·`groups/[id]/page.tsx`·`prayer/page.tsx`·`prayer/[id]/page.tsx`·`sharing/page.tsx`·`sharing/[id]/page.tsx`
  - news: `news/gallery/page.tsx`·`gallery/[id]/page.tsx`
  - next-gen: `next-gen/page.tsx`·`elementary/page.tsx`·`kindergarten/page.tsx`·`young-adult/page.tsx`·`youth/page.tsx`
  - notifications: `notifications/page.tsx`
  - search: `search/page.tsx`
- **권장 대체**: Phase 2 카탈로그 정의 → Phase 3에서 next-gen 5개부터 적용 → Phase 4에서 나머지 11개.

#### V2-2. Hero 패턴 3종 공존

- **현상**: 같은 라우트 그룹 안에서 hero 처리 방식이 3가지로 갈림.
  - (a) `(content)/layout.tsx`의 자동 HeroSection — sermons/all·news/bulletins·news/notices 등 기본 사용.
  - (b) 페이지 자체 hero 섹션(다크 배경) — `about/page.tsx:81-101`의 `styles.hero` + `LayoutContainer` 우회, 다크 배경 별도 정의.
  - (c) "full-width 섹션을 LayoutContainer 밖으로 빼내기" 패턴 — `about/welcome/page.tsx:83-118`(FAQ 섹션) + `about/vision/page.tsx:117-134`(HISTORY 섹션).
- **증거 file:line**: 위 (b)·(c) 각각 명시.
- **권장 대체**: Phase 2에서 hero 패턴 표준화 — 자동 hero(자동 표기) vs 자체 hero(다크/특수 배경) 분기 규약을 ADR로 정의. full-width 섹션은 컨테이너 prop(`fullBleed`)으로 흡수.

### 영역 3 — 시각 토큰 비일관

#### V3-1. primitive 토큰 직접 사용 (`(content)` 영역 36건)

- **현상**: stylelint warning이 이미 가시화한 부채(전체 143건 중 본 영역 36건). `(content)` 페이지·_component SCSS에서 primitive를 semantic 우회 없이 직접 사용.
- **증거**(파일별 카운트, 대표 예):
  - `src/app/(content)/news/notices/_component/NoticeTable.module.scss` — `$gray-` 5건
  - `src/app/(content)/news/notices/_component/NoticeDrawer.module.scss` — `$gray-` 4건
  - `src/app/(content)/about/page.module.scss` — `$beige-` 7건, `$navy-` 1건
  - `src/app/(content)/about/welcome/page.module.scss` — `$beige-` 2건, `$navy-` 1건
  - `src/app/(content)/about/vision/page.module.scss` — `$beige-` 3건
  - `src/app/(content)/about/worship/page.module.scss` — `$beige-` 2건
  - `src/app/(content)/about/worship/_component/AboutWorship.module.scss` — `$gold-` 7건
  - `src/app/(content)/about/worship/_component/SchoolGrid.module.scss` — `$gold-` 2건
- **권장 대체**: `.claude/skills/styles/SKILL.md`의 "Primitive → Semantic 치트시트"대로 영역별 분리 PR(Phase 4). 모두 해소 후 stylelint 룰을 warning → error.
- **연결**: `docs/tech-debt/active.md` "SCSS primitive 토큰 직접 사용 (143건)".

#### V3-2. hex 하드코딩 (`(content)` 영역 3건)

- **현상**: stylelint warning. 토큰 매핑 없이 hex 직사용.
- **증거**:
  - `src/app/(content)/about/serving-people/page.module.scss:72` — `border: 1px solid #eee;`
  - `src/app/(content)/news/bulletins/_component/BulletinForm.module.scss:15` — `border: 1px solid #ccc;`
  - `src/app/(content)/news/bulletins/_component/BulletinForm.module.scss:17` — `outline-color: #aaa;`
- **권장 대체**: `#eee`·`#ccc` → `$border-primary`, `#aaa` → `$border-strong` 또는 `$focus-ring-color` 결정 후 교체.
- **연결**: `docs/tech-debt/active.md` "SCSS 하드코딩 색상 (49건)".

#### V3-3. `:focus-visible` outline 8건 — 토큰 미적용

- **현상**: `news/notices/_component` 5 파일·7건이 모두 동일 패턴(`outline: 2px solid $primary-active`)이지만 `$focus-ring-*` 토큰 미사용. offset도 `2px`·`-2px` 혼재.
- **증거**:
  - `news/notices/_component/NoticeTable.module.scss:47-49, 203-205` — offset `-2px`
  - `news/notices/_component/NoticeDrawer.module.scss:126-128, 206-208` — offset `2px`
  - `news/notices/_component/NoticeControlBar.module.scss:50-52, 81-83, 106-108, 168-170` — offset `2px`, 4건 동일 패턴
  - 대조 — `sermons/_component/SermonNoteEditor/SermonNoteEditor.module.scss:31-33` — `outline: $focus-ring-width solid $focus-ring-color; outline-offset: $focus-ring-offset;` (토큰 적용 정답)
- **권장 대체**: Phase 4 focus-ring 일괄 정리 작업의 일부. 모두 `$focus-ring-*` 토큰 + 단일 offset(기본 `2px`) 사용.
- **연결**: `docs/tech-debt/active.md` "focus-ring 패턴 통일 (10곳)".

#### V3-4. hover 면에 warm primitive — Hover 3원칙 #1 위반

- **현상**: `hover-bg-shift` mixin에 warm primitive(`$beige-100`)를 넘김. styles SKILL의 "warm vs cool 역할 분리"에 따르면 hover 면은 cool tint(`$bg-hover` 등) 전용.
- **증거**:
  - `src/app/(content)/about/page.module.scss:288` — `@include hover-bg-shift($beige-100);`
  - `src/app/(content)/about/worship/page.module.scss:358` — `@include hover-bg-shift($beige-100);`
- **권장 대체**: `$beige-100` → `$bg-hover`로 교체. 정적 warm 면 위에서도 hover는 cool tint로 표현하는 규칙(`feedback_card_separation`과도 정합).

### 영역 4 — 상호작용·빈 상태 비일관

#### V4-1. `loading.tsx`·`error.tsx`·`not-found.tsx` 분포 편중

- **현상**: 라우트 차원 placeholder가 sermons에 6+1+0건, news에 0+0+2건, 그 외 6 도메인 0건.
- **증거**(전수):
  - sermons — `sermons/[id]/loading.tsx`·`sermons/all/loading.tsx`·`sermons/series/[id]/loading.tsx`·`sermons/series/loading.tsx`·`sermons/loading.tsx`·`sermons/error.tsx`
  - news — `news/bulletins/not-found.tsx`·`news/notices/not-found.tsx`
- **권장 대체**: Phase 2에서 도메인별 표준 정의 — 리스트/디테일 페이지는 `loading.tsx` 필수, 디테일은 `not-found.tsx` 필수, 도메인 루트는 `error.tsx` 권장 등.

#### V4-2. `EmptyState` 사용 sermons 편중

- **현상**: `(content)` 5곳 사용 중 4곳이 sermons. about/worship 1곳만 그 외.
- **증거**: 위 "공용 UI 사용 매트릭스" 1행 참조.
- **권장 대체**: Phase 4에서 news raw `<div>` 빈 상태 + community/next-gen 신규 페이지에 `EmptyState` 전파.

#### V4-3. SEO/JSON-LD 패턴 sermons 디테일에만 적용

- **현상**: `sermons/[id]/page.tsx`만 `<script type="application/ld+json">` 직접 렌더(VideoObject). news/bulletins/[id]·news/notices/[id] 디테일에는 JSON-LD 0건.
- **증거**: `src/app/(content)/sermons/[id]/page.tsx:52-72, 99-104` — `buildJsonLd` 함수 + `<script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`
- **권장 대체**: Phase 2에서 디테일 페이지 JSON-LD 정책 정의 — Article schema를 news 디테일에도 적용할지 결정. 결정만 ADR로, 적용은 Phase 4.

## 신규 tech-debt 후보

본 감사에서 새로 드러난 항목. focus-ring 10곳·primitive 143건·hex 49건은 이미 active.md에 등록됨.

- **컨테이너 사용 기준 부재** — `LayoutContainer` vs `MainContainer` 선택 기준이 없어 도메인별·페이지별로 갈림. Phase 2 ADR로 해소.
- **카드 컴포넌트 sermons 안 4종 공존** — `GridCard`·`SermonCarouselCard`·`SeriesCard`·`SeriesEpisodeCard` 통합 검토.
- **`news/page.tsx` 위임 anti-pattern** — `/news` URL이 `/news/bulletins` 콘텐츠를 그대로 렌더.
- **about 정적 페이지 카드 그리드 공통화 미진** — INDEX/STEP/PILLAR 3 페이지가 같은 시각 패턴을 각자 작성.
- **hover 면 warm primitive 2건** — Hover 3원칙 #1 위반. focus-ring 작업 PR에 묶거나 별도 정리.
- **JSON-LD 적용 1 페이지** — news 디테일 미적용. Phase 2 SEO 정책 결정.

## Phase 2 입력으로 권장하는 카탈로그 항목

Phase 2 페이지 유형 카탈로그(`docs/design-system/page-patterns.md`)는 본 audit 결과를 입력으로 다음 표준을 정의해야 한다.

1. **컨테이너 선택 규약** — `LayoutContainer` vs `MainContainer` 또는 단일화.
2. **카드 패턴 카탈로그** — 콘텐츠형(설교·시리즈)·정보형(번호+라벨+제목+설명·step·pillar) 표준.
3. **Hero 패턴 규약** — 자동 hero / 자체 hero / full-width 섹션 분기.
4. **빈 상태·에러 표준** — `EmptyState` + `loading.tsx`·`error.tsx`·`not-found.tsx` 최소 요구.
5. **SEO/JSON-LD 정책** — 디테일 페이지 schema 적용 기준.
6. **토큰·focus-ring 정합 규칙** — Phase 4 마이그레이션 PR이 따라야 할 file:line 매핑.

## 후속 작업

- Phase 2 `page-patterns.md` 작성 — 본 audit의 6 카탈로그 항목을 표준으로 정의.
- Phase 2에서 신규 ADR 작성 — 컨테이너 선택·Hero 패턴·빈 상태 정책 셋 분리 또는 통합.
- Phase 3 next-gen 5 페이지 — 카탈로그 첫 적용.
- Phase 4 마이그레이션 — focus-ring 10곳·primitive 143건·hex 49건·hover warm 2건 일괄.

## 참고

- 컨텍스트: `docs/design-system/context.md`.
- 활성 부채: `docs/tech-debt/active.md`.
- 토큰 SSOT: `src/styles/tokens/`.
- 공용 UI SSOT: `.claude/skills/ui-components/SKILL.md` + `src/components/ui/`.
- 스타일 규칙 SSOT: `.claude/skills/styles/SKILL.md`.
