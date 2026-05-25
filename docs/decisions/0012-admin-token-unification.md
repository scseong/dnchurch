# 0012 — admin token unification

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: scseong
- **Tags**: frontend, design-system, scss, tokens, admin

> ADR 0003 References의 placeholder(`0005-admin-token-unification`) 자리. 0005는 그 후 `about-pages-content-model`로 사용되어 본 ADR은 0012 번호로 신설.

## Context

admin 영역은 메인 디자인 시스템(`src/styles/tokens/`)과 분리된 채 자체 토큰 시스템을 운영해 왔다. 결함이 세 가지 누적되어 있다.

1. **SSOT 분기** — `src/components/admin/layout/AdminLayout/index.module.scss:1-30`의 `.shell` scope에 CSS 커스텀 프로퍼티 29종(`--admin-*` 26 + `--header-h`·`--sidebar-w`·`--sidebar-w-collapsed`)이 선언되고, admin 영역 13 파일이 `var(--admin-*)`·`var(--sidebar-*)`·`var(--header-h)`를 340회 호출한다. `src/styles/tokens/`만 SSOT라는 컨벤션이 admin에서만 깨져 있다.

2. **stylelint 가드레일 비대상** — `.stylelintrc.json`의 primitive 직접 사용 금지 규칙(`declaration-property-value-disallowed-list`)은 SCSS `$xxx` 변수를 대상으로 한다. CSS 커스텀 프로퍼티(`var(--admin-*)`)는 룰이 닿지 않아 admin 영역에서 토큰 컨벤션 위반·하드코딩이 가시화되지 않는다.

3. **결정 비용** — 신규 admin 컴포넌트를 작성할 때 `var(--admin-*)`를 쓸지 메인 `$xxx`를 쓸지 매번 판단이 필요하다. `feedback_portal_tokens.md`(portal 컴포넌트는 메인 토큰 사용)가 메모리로만 존재해 신규 작성자에게 SSOT 가시성이 부족하다.

ADR 0003(typography hierarchy)은 admin 통합을 함께 시도했으나 Codex 계획 검증에서 "회귀 범위가 비대해 의존 없는 typography와 묶는 건 부적절"로 분리됐다. 그 후 `tech-debt-tracker.md:142` "admin 토큰 통합 (ADR 0005 placeholder)"로 항목만 유지된 상태가 약 18일 누적.

결정 안 하면: 신규 admin 페이지·컴포넌트 추가 시 토큰 SSOT 결정이 매번 ad-hoc. stylelint 가드레일에 admin이 영구 사각지대. portal/공용 UI에 admin 톤 누설 위험 재발.

## Decision

세 가지를 **하나의 통합 계약**으로 결정한다 — 모두 "admin 토큰 28종을 메인 시스템 어디에 어떻게 두느냐"라는 단일 질문에 대한 답.

### 1. 흡수(Adopt-and-rename) — admin 톤 보존, 정의 위치만 이주

admin의 색·hue·brightness는 그대로 두고, CSS 커스텀 프로퍼티 정의를 SCSS 토큰(`src/styles/tokens/_color.scss`·`_layout.scss`)으로 옮긴다. 사용 사이트는 `var(--admin-foo)` → `$foo` 또는 의미를 살린 신규 SCSS 변수명으로 치환.

**핵심**: admin의 cool 톤·navy 변종 accent·muted status 색은 **의도된 디자인 차이**라고 본 ADR이 확정한다. 메인 brand 톤(navy-800/gold-600/beige cream)과 통일하지 않는다.

이유:
- admin은 정보 밀도가 높은 표면(테이블·폼 카드·사이드바). cool gray + 채도 낮은 status가 가독성·시각 부담 측면에서 적합. 메인은 콘텐츠 표면(home/about/sermons/news) — warm beige + vivid status가 신뢰감·따뜻함을 표현.
- 색 통일을 시도하면 admin 5 페이지 13 SCSS 모듈에 시각 회귀가 발생해 회귀 검증 범위가 plan보다 ×2-3 확대된다. 본 작업은 SSOT 단일화가 목표.

### 2. 신규 semantic 명명 — 20개 토큰 메인에 추가 (색 17 + 레이아웃 3)

| Admin 원본 (값) | 신규 SCSS 변수 | 위치 | 의미 |
| --- | --- | --- | --- |
| `--admin-bg` `#f7f8fa` | `$bg-admin` | `_color.scss` Background | admin 페이지 cool 면 (warm `$bg-primary`와 별개) |
| `--admin-bg-w` `#f1f3f6` | `$bg-admin-subtle` | `_color.scss` Background | admin 보조 면 (row hover·input 비활성 등) |
| `--admin-bg-hover` `#eef0f4` | `$bg-admin-hover` | `_color.scss` Background | admin 단색 hover (메인 `$bg-hover` rgba와 분리) |
| `--admin-bd` `#e5e8ed` | `$border-admin` | `_color.scss` Border | admin 표면 카드·divider |
| `--admin-t3` `#8a94a3` | `$txt-admin-tertiary` | `_color.scss` Text | admin meta·캡션 (`$txt-tertiary`보다 밝고 cool) |
| `--admin-accent` `#5b6ba5` | `$primary-soft` | `_color.scss` Primary Action | navy 밝은 변종 (link·badge·active) |
| `--admin-accent-bg` rgba(91,107,165,.08) | `$primary-soft-subtle` | `_color.scss` Primary Action | `$primary-soft`의 8% subtle |
| `--admin-warn` `#d97706` `--admin-warn-bg` rgba | `$status-warning-soft` + `$status-warning-soft-bg` | `_color.scss` Status | muted amber. 메인 `$status-warning`(vivid orange) 별도 |
| `--admin-ok` `#2e7d5b` `--admin-ok-bg` rgba | `$status-positive-soft` + `$status-positive-soft-bg` | `_color.scss` Status | muted forest green |
| `--admin-err` `#c0392b` | `$status-negative-soft` | `_color.scss` Status | muted brick red |
| `--admin-sidebar-t2` `#9ba2ae` | `$txt-on-dark-nav-muted` | `_color.scss` Text | 단색 cool gray (메인 `$txt-dark-muted` rgba 대비 가독성 ↑) |
| `--admin-sidebar-t3` `#6b7280` | `$txt-on-dark-nav-faint` | `_color.scss` Text | 단색 약한 cool gray |
| `--admin-sidebar-hover` `#2a2f36` | `$bg-dark-nav-hover` | `_color.scss` Background | `$bg-dark-nav`($navy-950) 위 1단 밝은 hover |
| `--admin-sidebar-active` `#3b434d` | `$bg-dark-nav-active` | `_color.scss` Background | 2단 밝은 active |
| `--admin-sidebar-border` `#2a2f36` | `$border-dark-nav` | `_color.scss` Border | 다크 nav divider (hover와 동값이지만 의미 분리) |
| `--header-h` `56px` | `$admin-header-height: 5.6rem` | `_layout.scss` | 공용 `$header-height: 7.2rem`과 별개 |
| `--sidebar-w` `240px` | `$admin-sidebar-width: 24rem` | `_layout.scss` | |
| `--sidebar-w-collapsed` `64px` | `$admin-sidebar-width-collapsed: 6.4rem` | `_layout.scss` | |

총 신규 = `_color.scss` 17 + `_layout.scss` 3 = **20개**. 명명 규칙:
- `-admin` 접미사 = admin 표면 전용(메인 콘텐츠 영역에서는 사용 금지)
- `-soft` 접미사 = 같은 의미의 채도 낮은 변종(`$primary` vs `$primary-soft`, `$status-warning` vs `$status-warning-soft`)
- `-on-dark-nav` = 다크 nav 표면(`$bg-dark-nav` 위)에서만 사용

### 3. 직접 매핑 — 9개 토큰 메인 재사용

값/의미가 메인 토큰과 근사한 9종은 기존 토큰 그대로 사용. 시각 차이는 미미(hex 4-25 차이).

| Admin 원본 | 메인 매핑 | 시각 차이 |
| --- | --- | --- |
| `--admin-bg-card` `#fff` | `$bg-card` `$white` | 동일 |
| `--admin-ease` `cubic-bezier(.4,0,.2,1)` | `$transition-easing-default` | 동일 |
| `--admin-t1` `#1a1d23` | `$txt-primary` `$gray-900 #111827` | hex 8 차이, 시각 미미 |
| `--admin-t2` `#4b5563` | `$txt-secondary` `$gray-700 #374151` | hex 12 차이, 시각 미미 |
| `--admin-pri` `#2e3440` | `$primary` `$navy-800 #2c3e50` | hex 4 차이, 시각 미미 |
| `--admin-sidebar-bg` `#1f2329` | `$bg-dark-nav` `$navy-950 #1c2b3a` | hex 4 차이, 시각 미미 |
| `--admin-bd-s` `#d1d6de` | `$border-primary` `$gray-300 #d1d5db` | hex 4 차이, 시각 미미 |
| `--admin-sh-s` `0 1px 2px rgba(15,20,30,.06)` | `$shadow-sm` `0 1px 3px rgba($gray-900,.06)` | 시각 미미 |
| `--admin-sidebar-t1` `#e6e8ec` | `$txt-inverse` `$white` `#fff` | hex 약 25 차이 — admin의 살짝 cool tint를 white로 통일. 다크 nav 위에서 식별 어려움 |

9 토큰은 **본 ADR이 의도된 통일**로 결정(`--admin-sidebar-t1` 포함). 픽셀 단위 동일성보다 SSOT 단순화가 우선.

## Consequences

### 긍정적

- SSOT 단일화 — `src/styles/tokens/`만 admin·콘텐츠 양쪽의 토큰 정의 위치. 신규 admin 페이지 추가 시 토큰 결정이 1줄 규칙("admin 톤은 `-admin`·`-soft`·`-on-dark-nav` 접미사 토큰")으로 환원.
- stylelint 가드레일 admin 영역까지 적용 가능 — primitive 직접 사용 금지 룰이 SCSS 변수 기반이라 `var(--admin-*)` 사라진 후 admin 코드도 같은 룰에 들어감.
- 다크 nav hover/active 토큰을 메인이 갖게 됨 — 향후 콘텐츠 영역에 다크 nav가 도입되면(예: 푸터 메뉴 인터랙션) 재사용 가능.
- 명명에 의미 노출 — `$primary-soft`·`$status-warning-soft` 같이 "muted variant"가 코드에서 즉시 식별. admin 톤의 의도(낮은 채도·정보 밀도 표면)가 가시화.

### 부정적 / 트레이드오프

- `_color.scss` 17줄 증가, `_layout.scss` 3줄 증가 — 토큰 표면 확대로 SKILL.md 치트시트도 갱신 필요.
- admin 톤이 메인 brand 톤과 다른 상태가 영구화(의도된 결정). 미래에 brand 톤 통일을 결정하면 다시 토큰 값 변경 필요.
- `$bg-admin`·`$primary-soft` 같은 admin 전용 토큰을 콘텐츠 영역에서 오용할 위험. SKILL.md "Primitive → Semantic 치트시트"에 "admin 전용 — 콘텐츠 영역에서 사용 금지" 1줄 명시로 방지.

### 영향 범위

- **코드**:
  - `src/styles/tokens/_color.scss` — 신규 semantic 17
  - `src/styles/tokens/_layout.scss` — 신규 layout 3
  - `src/components/admin/layout/AdminLayout/index.module.scss` — `.shell` 내 커스텀 프로퍼티 29행 블록 제거 + 사용 치환
  - admin 영역 13 SCSS 모듈 — 340 치환
- **운영**: 시각 회귀 점검은 admin 5 페이지(`/admin`, `/admin/sermons`, `/admin/sermons/new`, `/admin/sermons/[id]/edit`, `loading/error`) PC + 모바일 2 viewport. 직접 매핑 8 토큰은 hex 4-12 차이라 시각 회귀 위험 낮음. 신규 14 토큰은 값 보존이라 시각 회귀 없음.
- **문서**: `docs/exec-plans/active/2026-05-22-admin-token-unification.md`, `docs/tech-debt-tracker.md`(부채 해소), `.claude/skills/styles/SKILL.md`(치트시트 갱신).

## Alternatives Considered

| 대안 | 기각 사유 |
| --- | --- |
| **A. 색 완전 통일** — admin → 메인 brand 톤(navy/gold/cream) 채택 | admin status(amber/forest/brick)가 메인 vivid status로 바뀌면 정보 밀도 높은 표면에서 시각 부담 ↑. 회귀 검증 범위 ×2-3. 본 작업 목표는 SSOT 단일화이지 톤 통일 아님 |
| **B. 현 상태 유지(no-op)** | tech-debt-tracker 항목 영구 존속. stylelint 가드레일 admin 사각지대 영구화. 신규 admin 작성자가 매번 SSOT 판단 |
| **C. 메인을 admin 톤에 맞춰 정정** | 메인 톤은 콘텐츠 영역(home/about/sermons/news)에 최적화됨. admin 1 영역 때문에 메인 14 토큰 정정은 회귀 영향 비대 |
| **D. cool admin / warm content 영구 분리** — admin은 별도 시스템으로 인정 | 토큰 SSOT가 두 곳이 되는 결함이 미해결. 신규 작성자 결정 비용 존속 |
| **E. CSS 커스텀 프로퍼티 유지** — 다크모드 토글 가능성 보존 | admin 다크모드 도입 결정 없음. 메모리·tech-debt에 다크모드는 별도 ADR 후속으로 합의. 본 ADR에 미리 도입 시 yagni |
| **F. SCSS 변수가 아닌 SCSS map으로 묶기** (`$admin-tokens: ('bg': ..., ...)`) | 사용 사이트가 `map-get($admin-tokens, 'bg')`로 길어짐. 메인 토큰은 평면 SCSS 변수라 컨벤션 일관성 깨짐 |

## Verification

- 본 ADR exec-plan: `docs/exec-plans/active/2026-05-22-admin-token-unification.md`
- `rg 'var\(--admin-' src` → 0 hit
- `rg 'var\(--sidebar-w|var\(--header-h' src` → 0 hit
- `src/components/admin/layout/AdminLayout/index.module.scss`에 `:root` 정의 0행
- `node scripts/verify-task.mjs admin-token-unification` PASS (lint·styles·build·knip)
- 시각 회귀 점검 — admin 5 페이지 × PC/모바일 2 viewport. 직접 매핑 8 토큰의 hex 4-12 차이가 의도된 통일임을 본 ADR이 사전 명시(회귀 보고 불필요)

## References

- 관련 PR: (Phase별 생성 시점에 추가)
- 관련 exec-plan: [2026-05-22-admin-token-unification](../exec-plans/active/2026-05-22-admin-token-unification.md)
- 관련 ADR: [0003 — design-system-v3 typography hierarchy](0003-design-system-v3-token-unification.md) (admin 통합 분리 결정)
- 관련 부채: `docs/tech-debt-tracker.md` "admin 토큰 통합 (ADR 0005 placeholder)" 항목 — 본 ADR로 해소
- 외부 레퍼런스: `.claude/skills/styles/SKILL.md` (Primitive → Semantic 치트시트)
