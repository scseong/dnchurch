---
name: styles
description: SCSS 파일 생성/수정, 스타일 작성, 디자인 토큰 사용, 믹스인 적용, className 작업, 반응형 레이아웃 구현 시 사용
---

# SCSS 토큰 · 믹스인 · 시맨틱 매핑

## 토큰 파일 구조

`_variables.scss`가 아래 7개 토큰 파일을 `@import`하여 모든 변수를 하나로 묶는다.

| 파일 | 주요 토큰 |
|---|---|
| `tokens/_breakpoint.scss` | Primitive(`$breakpoint-420` ~ `$breakpoint-1920`), Semantic(`$breakpoint-mobile` ~ `$breakpoint-pc-xl`), `$responsive-font-vw-map` |
| `tokens/_color.scss` | Gray/Navy/Gold/Cream/Status primitive, 시맨틱(`$txt-*` `$bg-*` `$border-*` `$primary` `$accent` `$status-*`) |
| `tokens/_effect.scss` | `$shadow-*`, `$transition-*`, `@keyframes fadeUp` |
| `tokens/_layout.scss` | `$container-padding/min/max`, `$header-height`, `$button-height-*`, `$icon-button-size-*` |
| `tokens/_spacing.scss` | `$spacing-{px값}` (숫자=px): `$spacing-0` ~ `$spacing-200`, 4·8 배수 기반 |
| `tokens/_typography.scss` | `$font-family-*`, `$font-size-{11~42}` (숫자=px), `$font-weight-*`, `$line-height-*`, `$letter-spacing-*`, heading size map |
| `tokens/_semantic.scss` | `$padding-*`, `$content-gap-{xl~xs}`, `$section-padding-*`, `$radius-xl/l/m/s/xs/xxs/circle`, `$overlay-*` |

## 자동 주입 동작 방식

`additionalData` → `_variables.scss` → 토큰 7개 파일이 모든 `.module.scss`에 주입된다. `@keyframes fadeUp`(`_effect.scss` 정의)도 각 모듈에 로컬 스코프로 주입되어 별도 import 없이 사용할 수 있다.

## 사용 가능한 믹스인 (`_mixins.scss`)

| 믹스인 | 용도 |
|---|---|
| `respond-up($width)` | min-width 미디어 쿼리 (모바일 퍼스트 기본) |
| `respond($width)` | max-width 미디어 쿼리 (예외적 사용) |
| `blind` | 접근성용 화면 가림 |
| `prevent-img-drag` | 이미지 드래그 방지 |
| `ellipsis-multi($lines)` | 여러 줄 말줄임 |
| `text-page-title($color, $weight)` | 페이지 최상위 제목 (h2 반응형 26→34px + bold) |
| `text-card-title($color, $weight)` | 카드/아이템 제목 (h5 반응형 18→20px + semibold) |
| `text-sub($color)` | 보조 텍스트 (14px + regular + `$txt-secondary`) |
| `text-caption($color)` | 캡션/메타 (13px + regular + `$txt-tertiary`) |
| `text-body-emphasis($color)` | 본문 강조 (15px + medium + `$txt-primary`) |
| `text-sub-emphasis($color)` | 보조 본문 강조 (14px + medium + `$txt-secondary`) |
| `text-label-emphasis($color)` | 라벨 강조 (13px + semibold + `$txt-secondary`) |
| `text-caption-small($color)` | 작은 캡션 (12px + medium + `$txt-tertiary`) |
| `text-caption-strong($color)` | 강조 캡션/뱃지 (11px + semibold + `$txt-tertiary`) |

## 컬러 토큰 체계

### Primitive (순수 색상값 — 직접 사용 금지, Semantic 토큰을 통해서만 참조)

- **Gray**: `$gray-900` `$gray-700` `$gray-500` `$gray-400` `$gray-300` `$gray-200` `$gray-100` `$gray-50` `$black` `$white`
- **Navy (Brand)**: `$navy-950` `$navy-800` `$navy-600`
- **Navy-Blue (Primary Action)**: `$navy-blue-900` `$navy-blue-800` `$navy-blue-700` `$navy-blue-100`
- **Gold (Accent)**: `$gold-600` `$gold-400` `$gold-100`
- **Cream (Warm Surface)**: `$cream-200` `$cream-300`
- **Status**: `$green-500` `$green-100` `$red-500` `$red-100` `$orange-600` `$orange-100`

### Semantic (역할 기반 — 컴포넌트에서 직접 사용)

**Text**
`$txt-primary` `$txt-secondary` `$txt-tertiary` `$txt-link` `$txt-link-active` `$txt-disabled` `$txt-inverse`
`$txt-image-subtle` (이미지 위 보조) `$txt-dark-muted` (다크배경 보조) `$txt-dark-faint` (다크배경 약한)

**Background**
`$bg-primary`(gray-50) `$bg-secondary`(cream-200) `$bg-tertiary`(cream-300) `$bg-accent-subtle`(gold 12% tint)
`$bg-dark` `$bg-dark-card` `$bg-dark-nav`(헤더·푸터)

**Border**
`$border-primary` `$border-subtle` `$border-strong` `$border-focus` `$border-warm`(cream·gold 배경 위)
`$border-inverse` `$border-dark-subtle` `$border-dark-faint`

**Primary Action (Navy-Blue)**
`$primary` `$primary-hover` `$primary-active` `$primary-subtle`

**Accent (Gold)**
`$accent` `$accent-hover` `$accent-subtle`

**Status**
`$status-positive` `$status-positive-bg` `$status-negative` `$status-negative-bg` `$status-warning` `$status-warning-bg`

```scss
// ❌ 하드코딩
color: #1f2937;
background: #f5f0e6;

// ✅ 시맨틱 토큰 우선
color: $txt-primary;
background: $bg-secondary;
border-color: $border-primary;

// ✅ 역할이 명확할 때 Primitive도 허용
color: $gold-600;       // 강조 텍스트
background: $navy-950;  // 헤더·다크 섹션
```

## Semantic Token 매핑 규칙

| UI 요소 | spacing | radius | 기타 |
|---|---|---|---|
| input, button | `$padding-control` | `$radius-xs` | |
| 큰 CTA 버튼 | `$padding-control-wide` | `$radius-xs` | |
| card, 패널 | `$padding-card` | `$radius-s` | `$shadow-sm` |
| 소형 카드, 리스트 아이템 | `$padding-card-compact` | `$radius-s` | `$content-gap-s` |
| 모달, 바텀시트 | `$padding-card` | `$radius-m` | `$overlay-scrim` |
| 태그, 뱃지 | `$padding-inline-xs` | `$radius-circle` | |
| 섹션 컨테이너 | `$container-padding` / `$section-padding-*` | — | `$container-max` |
| 이미지 오버레이 | — | — | `$overlay-scrim`, `$txt-image-subtle` |

**Content Gap** (XL→XS): `$content-gap-xl`(32px) > `$content-gap-l`(24px) > `$content-gap-m`(16px) > `$content-gap-s`(12px) > `$content-gap-xs`(8px)

**Section Gap**: `$section-padding-80` / `$section-padding-64` / `$section-padding-40`

다크 섹션: `$bg-dark`, `$bg-dark-card` / 이미지·영상 위: `$overlay-image`, `$txt-image-subtle`

상세 매핑은 `src/styles/_usage-guide.scss` 참조.

## Transition 토큰 (`_effect.scss`)

```scss
// ✅ 범용 (버튼·링크·색상)
transition: $transition-base;    // all 0.22s ease

// ✅ 탄력 있는 인터랙션 (카드 lift, 아이콘 등장)
transition: $transition-spring;  // all 0.24s spring

// ✅ 패널·모달·시트 진입
transition: $transition-enter;   // all 0.36s snappy
```

## 폰트

- **Pretendard Variable** (CDN) — `$font-family-base`, 모든 헤딩·본문·UI 텍스트 기본
- **Noto Serif KR** (Google Fonts, CSS variable `--font-notoserifKR`) — `$font-family-secondary`, 교회 로고타입·성경 인용구 전용

토큰에 없는 값이 필요한 경우, 해당 파일 상단에 로컬 변수로 선언하고 사용한다.
