---
name: styles
description: SCSS 파일 생성/수정, 스타일 작성, 디자인 토큰 사용, 믹스인 적용, className 작업, 반응형 레이아웃 구현 시 사용
---

# SCSS 토큰 · 믹스인 · 시맨틱 매핑

## 토큰 파일 구조

`_variables.scss`가 아래 7개 토큰 파일을 `@import`하여 모든 변수를 하나로 묶는다.

| 파일 | 주요 토큰 |
|---|---|
| `tokens/_breakpoint.scss` | `$breakpoint-xs(361px)` ~ `$breakpoint-xxxl(1921px)`, `$responsive-font-vw-map` |
| `tokens/_color.scss` | 색상 스케일(blue/orange/gray), 교회 브랜드(`$color-navy` `$color-gold` `$color-cream` `$color-cream-deep`), 시맨틱 토큰(primary/secondary/text/bg/border) |
| `tokens/_effect.scss` | `$border-radius-*`, `$shadow-*`, `$transition-*`, `@keyframes fadeUp` |
| `tokens/_layout.scss` | `$max-width`, `$header-height`, `$button-height-*` |
| `tokens/_spacing.scss` | `$spacing-nano(0.2rem)` ~ `$spacing-7xl(9.6rem)`, 하위호환 alias(`$spacing-xxxl` 등) |
| `tokens/_typography.scss` | `$font-family-*`, `$font-size-*`, `$font-weight-*`, `$line-height-*`, `$letter-spacing-*`, heading size map |
| `tokens/_semantic.scss` | `$padding-*`, `$gap-*`, `$radius-*`, `$overlay-*`, `$text-on-image*` — 역할 기반 시맨틱 토큰 |

## 자동 주입 동작 방식

`additionalData` → `_variables.scss` → 토큰 7개 파일이 모든 `.module.scss`에 주입된다. 이 덕분에 `@keyframes fadeUp`(`_effect.scss` 정의)도 각 모듈에 로컬 스코프로 주입되어 `animation: fadeUp`을 별도 import 없이 사용할 수 있다. `_mixins.scss`는 `@use '_variables' as *`로 토큰을 내부 참조하므로, mixin 내에서 모든 토큰 변수를 사용할 수 있다.

## 사용 가능한 믹스인 (`_mixins.scss`)

| 믹스인 | 용도 |
|---|---|
| `respond-up($width)` | min-width 미디어 쿼리 (모바일 퍼스트 기본) |
| `respond($width)` | max-width 미디어 쿼리 (예외적 사용) |
| `blind` | 접근성용 화면 가림 |
| `prevent-img-drag` | 이미지 드래그 방지 |
| `ellipsis-multi($lines)` | 여러 줄 말줄임 |
| `text-hero` | 히어로 타이틀 (h1 반응형 + bold) |
| `text-page-title` | 페이지 타이틀 (h2 반응형 + bold) |
| `text-section-title` | 섹션 타이틀 (h3 반응형 + bold) |
| `text-sub-section-title` | 서브 섹션 타이틀 (h4 반응형 + semibold) |
| `text-card-title` | 카드/아이템 타이틀 (h5 반응형 + semibold) |
| `text-body` | 본문 (default + regular + $color-text-default) |
| `text-sub` | 보조 텍스트 (md + regular + $color-text-secondary) |
| `text-caption` | 캡션/메타 (sm + regular + $color-text-subtle) |
| `text-label` | 라벨/카테고리 (sm + medium + $color-text-secondary) |

## 디자인 토큰 사용 원칙

색상·간격·폰트·효과 값은 반드시 `styles/tokens/`에 정의된 SCSS 변수를 사용한다. 하드코딩 금지.

```scss
// ❌ 하드코딩
color: #1f2937;
padding: 16px 24px;
font-size: 14px;

// ✅ 토큰 사용
color: $color-gray-800;
padding: $spacing-md $spacing-lg;
font-size: $font-size-md;

// ✅ 교회 브랜드 색상 (토큰에 포함)
color: $color-gold;
background: $color-navy;
```

## Semantic Token 매핑 규칙

Primitive 토큰 위에 역할 기반 시맨틱 토큰(`tokens/_semantic.scss`)이 정의되어 있다. UI 요소를 스타일링할 때 primitive 토큰 대신 **시맨틱 토큰을 우선 사용**한다.

| UI 요소 | spacing | radius | 기타 |
|---|---|---|---|
| input, button | `$padding-control` | `$radius-control` | |
| card, 패널 | `$padding-card` | `$radius-card` | `$shadow-sm` |
| 모달, 바텀시트 | `$padding-card` | `$radius-sheet` | `$overlay-scrim` |
| 태그, 뱃지 | `$padding-inline-xs` | `$radius-pill` | |
| 섹션 컨테이너 | `$padding-section-x/y` | — | `$gap-section` |
| 리스트 아이템 | `$padding-card-compact` | — | `$gap-items` |
| 이미지 오버레이 | — | — | `$overlay-image-text`, `$text-on-image` |

**간격(gap) 원칙** — 근접성의 법칙: `$gap-inline`(0.8rem) < `$gap-items`(1.2rem) < `$gap-group`(2rem) < `$gap-section`(6.4rem)

다크 섹션(이미지/영상 위 콘텐츠): `$color-bg-dark`, `$color-bg-dark-card`, `$color-bg-dark-card-hover`

상세 매핑은 `src/styles/_usage-guide.scss` 참조.

토큰에 없는 값이 필요한 경우, 해당 파일 상단에 로컬 변수로 선언하고 사용한다.

```scss
// 로컬 변수 선언 (토큰 미포함 값)
$color-bg-section: #0f1820;
$btn-gold-hover: #a38458;
```

## 폰트

- **Pretendard** (CDN, variable font) — 본문 기본 폰트
- **Nanum Myeongjo** (Google Fonts, CSS variable `--font-myeongjo`) — 특정 헤딩/강조
