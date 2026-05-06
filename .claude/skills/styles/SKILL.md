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
| `hover-bg-shift($hover-bg, $duration: 0.18s)` | 배경색 hover (`background-color`만) — 버튼·드롭다운 |
| `hover-color-shift($hover-color, $duration: 0.18s)` | 텍스트 색 hover (`color`만) — 링크·텍스트 버튼 |
| `hover-lift($shadow: $shadow-md, $lift: 2px, $duration: 0.22s)` | Lift 효과 hover (`transform` + `box-shadow`, 모바일 `:active` 분기 포함) — 카드·CTA |

## 컬러 토큰 체계

### Warm vs Cool 역할 분리 (v4 — 가장 먼저 읽기)

색상은 **온도(warm/cool)** 와 **역할(decorative/interactive)** 두 축으로 나뉜다. 두 축이 어긋나면 navy ↔ beige가 무작위 인접해 시각이 부서진다.

| 역할 | 온도 | 용도 | 토큰 |
|---|---|---|---|
| **Decorative surface** | warm | 페이지·섹션·카드 정적 면 | `$bg-secondary` (cream), `$bg-accent-subtle` (gold tint) |
| **Interactive feedback** | cool | hover/active/selected | `$bg-hover` (navy 6% rgba), `$primary-subtle` (navy 8% rgba), `$primary` |
| **Brand action** | cool | CTA·링크·focus | `$primary`, `$primary-hover`, `$primary-active` |
| **Accent action** | warm | Featured/eyebrow/Gold CTA | `$accent`, `$accent-hover`, `$accent-subtle` |

**규칙**: hover/active 안에서 warm primitive(`$beige-*` `$cream-*`)나 warm semantic(`$bg-secondary`)을 직접 면 색으로 쓰지 않는다. 인터랙션 신호는 cool tint로만 표현한다(예외: 정적 warm 카드 위에서 또 다른 warm 카드로 강조하는 디자인 명시 케이스).

### Primitive (순수 색상값 — 직접 사용 금지, Semantic 토큰을 통해서만 참조)

- **Gray**: `$gray-900` `$gray-700` `$gray-500` `$gray-400` `$gray-300` `$gray-200` `$gray-100` `$gray-50` `$black` `$white`
- **Navy (Brand · Primary Action · Interactive cool)**: `$navy-950` `$navy-800` `$navy-600`
- **Navy-Blue** _@deprecated_: `$navy-blue-900` `$navy-blue-800` `$navy-blue-700` `$navy-blue-100` (사용 금지 — Primary Action은 Navy 계열)
- **Gold (Accent)**: `$gold-600` `$gold-400` `$gold-100`
- **Cream / Beige (Warm Decorative Surface)**: `$cream-200` `$cream-300` `$beige-200` — 정적 면 전용. 인터랙션 토큰에 직접 매핑하지 않는다.
- **Status**: `$green-500` `$green-100` `$red-500` `$red-100` `$orange-600` `$orange-100`

### Semantic (역할 기반 — 컴포넌트에서 직접 사용)

**Text**
`$txt-primary` `$txt-secondary` `$txt-tertiary` `$txt-link` `$txt-link-active` `$txt-disabled` `$txt-inverse`
`$txt-image-subtle` (이미지 위 보조) `$txt-dark-muted` (다크배경 보조) `$txt-dark-faint` (다크배경 약한)

**Background**
- 정적 warm: `$bg-primary`(gray-50) `$bg-secondary`(cream-200) `$bg-accent-subtle`(gold 12% tint)
- 인터랙티브 cool: `$bg-hover`(navy 6% rgba) — 면 종류 무관, hover/active 피드백 전용 ★
- 다크: `$bg-dark` `$bg-dark-card` `$bg-dark-nav`(헤더·푸터)

> v4: `$bg-tertiary`(cream-300) **삭제**. hover 피드백은 `$bg-hover`로, 정적 deeper-warm 면은 `$bg-secondary` 재사용 또는 명시적 cream primitive로 한정.

**Border**
`$border-primary` `$border-subtle` `$border-strong` `$border-focus` `$border-warm`(cream·gold 배경 위)
`$border-inverse` `$border-dark-subtle` `$border-dark-faint`

**Primary Action (Navy · Cool)**
`$primary`(navy-800) `$primary-hover`(navy-600 — _lighter_) `$primary-active`(navy-950 — _darker_) `$primary-subtle`(navy 8% rgba — active/selected 면)

> **Hover 방향 의도**: 다크 navy primary는 hover에서 **밝아진다**(lift affordance). 클릭 시 active로 한 단계 어두워진다.
>
> **`$primary-subtle` v4**: warm beige가 아닌 **cool navy tint(rgba 8%)**. 칩의 `.active`, 선택 패널 등에서 `$primary` 텍스트/보더와 같은 온도로 짝을 이룬다. warm 면 위·cool 면 위 모두에서 자연스러운 강조를 만든다.

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

## Hover 시스템

Hover 패턴은 **3원칙**을 예외 없이 따른다 — 다른 곳에서 `transition: all`/shorthand `background:`/hover 안 `border-color`를 쓰면 인라인 스타일 충돌·border 흔들림·다른 색면과의 부조화가 발생.

| 원칙 | 금지 | 권장 |
|---|---|---|
| **#1** | `transition: all 0.18s` | 변하는 속성만 명시 (`transition: background-color 0.18s ease`) — 또는 `hover-*` mixin 사용 |
| **#2** | `:hover { background: $primary-hover; }` shorthand | `:hover { background-color: $primary-hover; }` — 또는 `@include hover-bg-shift($primary-hover);` |
| **#3** | `:hover { border-color: $primary; }` 또는 hover에서 `border:` 명시 | hover에서 border 관련 코드 자체를 작성하지 않음 (다크 outline 버튼은 Phase 3 별도 mixin) |

### 패턴별 mixin 매핑

| 컴포넌트 | hover 의도 | 사용 |
|---|---|---|
| Primary 버튼 (light/dark surface 모두) | bg navy-800 → navy-600 (lighter) | `@include hover-bg-shift($primary-hover);` + `&:active { background-color: $primary-active; }` |
| Secondary 버튼 / 아이콘 버튼 / 드롭다운 항목 | 정적 면 → cool tint | `@include hover-bg-shift($bg-hover);` (border는 절대 건드리지 X) |
| 칩 / 리스트 항목 (선택 가능) | hover → cool tint, active/selected → cool 강조 | hover: `@include hover-bg-shift($bg-hover);` · active: `background-color: $primary-subtle;` |
| 텍스트 링크 | color $txt-link → $primary | `@include hover-color-shift($primary);` |
| 다크 위 링크 | color → $accent | `@include hover-color-shift($accent);` |
| 카드 (clickable) | translateY + box-shadow | `@include hover-lift;` (기본 `$shadow-md`) |
| Featured/Dark CTA 카드 | translateY + 강조 shadow | `@include hover-lift($shadow: $shadow-lg);` |
| Tab 비활성 | color → $txt-primary | `@include hover-color-shift($txt-primary);` |

### 사용 예시

```scss
@use '@/styles/_variables.scss' as *;
@use '@/styles/_mixins.scss' as *;

.button_primary {
  background-color: $primary;
  color: $txt-inverse;
  padding: $padding-control;
  border-radius: $radius-xs;

  @include text-label-emphasis($color: $txt-inverse);
  @include hover-bg-shift($primary-hover);

  &:active {
    background-color: $primary-active;
  }
}

.card {
  background-color: $white;
  border: 1px solid $border-primary;
  border-radius: $radius-m;
  padding: $padding-card;

  @include hover-lift;
  // base border는 허용. hover 안에서 border 관련 코드 작성 X
}
```

## Transition 토큰 (`_effect.scss`)

> **주의**: 아래 shorthand 토큰은 내부에 `all`을 포함한다. **hover 인터랙션에서는 사용하지 말고** `hover-*` mixin을 쓴다(Hover 3원칙 #1). 셔터 진입·일회성 등장 등 비-hover 영역에서만 사용.

```scss
// 비-hover 범용 (예: SchoolGrid 카드 등장)
transition: $transition-base;    // all 0.22s ease

// 비-hover 탄력 (아이콘 등장)
transition: $transition-spring;  // all 0.24s spring

// 패널·모달·시트 진입
transition: $transition-enter;   // all 0.36s snappy
```

hover에서 색·배경 한 속성만 변경하려면 직접 명시 또는 mixin 사용:

```scss
transition: background-color 0.18s ease;  // 직접 명시
@include hover-bg-shift($primary-hover);  // mixin (권장)
```

## 폰트

- **Pretendard Variable** (CDN) — `$font-family-base`, 모든 헤딩·본문·UI 텍스트 기본
- **Noto Serif KR** (Google Fonts, CSS variable `--font-notoserifKR`) — `$font-family-secondary`, 교회 로고타입·성경 인용구 전용

토큰에 없는 값이 필요한 경우, 해당 파일 상단에 로컬 변수로 선언하고 사용한다.
