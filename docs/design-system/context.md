# 디자인 시스템 통합 — 컨텍스트

> 본 문서는 디자인 시스템 통합 작업의 영구 SSOT다. 현재 자산, 4 영역 일관성 위반 가설, Phase 로드맵을 한곳에 모은다.
>
> - **최초 작성**: 2026-05-30 (design-audit Phase 1)
> - **갱신 정책**: Phase 진행으로 자산·가설·로드맵이 바뀌면 본 문서를 갱신한다. exec-plan은 진행 중인 단계의 상세만 담는다.

## 트리거와 목표

새 도메인(`next-gen`) 작업을 시작하기 전에 페이지별로 깨진 일관성을 통합한다. 사용자가 가장 거슬리는 영역으로 4가지를 모두 지목했다 — 컴포넌트 선택·레이아웃 구조·시각 토큰·상호작용 및 빈 상태. 작업 규모는 1개월 이상의 장기 트랙으로 잡았다.

## 현재 디자인 시스템 자산

### ADR (영구 결정)

- `docs/decisions/0003-design-system-v3-token-unification.md` — typography hierarchy.
- `docs/decisions/0004-ui-component-foundation.md` — UI Component Foundation (v4).
- `docs/decisions/0012-admin-token-unification.md` — admin 토큰을 메인 SCSS 토큰으로 흡수.

### SKILL (자동 로딩 컨텍스트)

- `.claude/skills/styles/SKILL.md` — SCSS 토큰·믹스인·시맨틱 매핑. primitive↔semantic 치트시트와 Hover 3원칙을 담는다.
- `.claude/skills/ui-components/SKILL.md` — 공용 UI 12종 사용·확장·신규 가이드.

### 코드 자산

- `src/styles/tokens/` — 토큰 파일 7개. `src/styles/_variables.scss`가 `@import`로 묶어 `additionalData`로 모든 `.module.scss`에 자동 주입.
  - `_breakpoint.scss` — 반응형 분기.
  - `_color.scss` — primitive(gray/navy/gold/beige/status) + semantic(`$txt-*`·`$bg-*`·`$border-*`·`$primary`·`$accent`).
  - `_effect.scss` — shadow·transition·`@keyframes fadeUp`.
  - `_layout.scss` — container·header·button·icon-button 치수.
  - `_spacing.scss` — `$spacing-{px}` (4·8 배수).
  - `_typography.scss` — font-family·size·weight·line-height·letter-spacing.
  - `_semantic.scss` — padding·content-gap·section-gap·radius·overlay.
- `src/styles/_mixins.scss` — `respond-up`·`respond`·`blind`·`ellipsis-multi`·`text-*` 헬퍼·`hover-bg-shift`·`hover-color-shift`·`hover-lift`.
- `src/components/ui/` — 공용 UI 컴포넌트 라이브러리(Button·TextField·Textarea·Modal·BottomSheet·Tabs·Label·Pill·ListItem·Pagination·Skeleton·EmptyState 12종).
- Route Group `src/app/(content)/` — HeroSection + Breadcrumb 자동 포함. 7 도메인(about·community·news·next-gen·notifications·search·sermons) / 36 `page.tsx`. (2026-06-01 #106이 `/fellowship` 삭제)

### 활성 tech-debt (디자인 관련 발췌)

`docs/tech-debt/active.md`에 등록된 항목 중 디자인 시스템 통합에 직결되는 것:

- ~~focus-ring 패턴 통일~~ → ✅ 해소: `focus-ring` mixin·`$focus-ring-*` 토큰으로 통일하고, 남아 있던 `ui/Select`와 admin focus까지 바꿨다(PR #108 + focus-ring-unify 2026-06-15). 상세는 [`../tech-debt/resolved.md`](../tech-debt/resolved.md).
- **SCSS primitive 토큰 직접 사용 (143건)** — `$gray-*`·`$navy-*`·`$gold-*`·`$beige-*`를 컴포넌트 SCSS에서 직접 사용. stylelint warning은 도입돼 있지만 error는 못 올림.
- **SCSS 하드코딩 색상 (49건)** — `.module.scss`에서 hex 색 직접 사용. `color-no-hex` 룰을 warning으로 운영.
- **SCSS 네이밍 패턴 위반 (12건)** — snake_case 위반 className 5건, kebab-case 위반 SCSS 변수 7건.

## 4 영역 일관성 위반 가설

Phase 1 감사가 이 가설들을 file:line 증거로 검증한다. 가설이 빗나가면 audit 결과에 정정 기록을 남기고 Phase 2 카탈로그 작성 방향을 조정한다.

### 1. 컴포넌트 선택 비일관

- 같은 UX 역할(목록 카드·시리즈 카드·필터·검색)을 페이지마다 다른 컴포넌트로 구현하지 않았나.
- 확인 방법: `src/app/(content)/*/page.tsx`와 `_component/` 디렉토리를 grep으로 같은 역할 컴포넌트 식별.
- 의심 영역: sermons GridCard / SeriesGrid / SeriesEpisodeCard 비교.

### 2. 레이아웃 구조 비일관

- 같은 유형 페이지(리스트·디테일)인데 hero 아래 구역 배치와 spacing이 다르지 않나.
- 확인 방법: 페이지별 `page.tsx` jsx 구조 비교, `.module.scss`의 grid·flex·gap 패턴 비교.
- 의심 영역: about / news / sermons 리스트 페이지 비교.

### 3. 시각 토큰 비일관

- semantic 토큰을 도입했지만 영역별로 다른 토큰을 쓰지 않나.
- 확인 방법: primitive 직접 사용 카운트(`rg "\$gray-|\$beige-|\$navy-|\$gold-" src -g '*.scss'`), semantic 분포 샘플.
- 이미 알려진 위반: primitive 직접 사용 143건, 하드코딩 색상 49건. (focus-ring은 해소 — 위 활성 tech-debt 발췌 참조)

### 4. 상호작용·빈 상태 비일관

- hover·focus·transition·`loading.tsx`·`error.tsx`·`EmptyState` 사용 분포가 페이지별로 다르지 않나.
- 확인 방법: `loading.tsx`·`error.tsx`·`not-found.tsx` 존재 여부, `EmptyState` import 분포, hover mixin 사용 매트릭스.
- 이미 알려진 위반: sermons는 `loading.tsx` 6개·`error.tsx` 1개가 갖춰져 있지만 news는 `not-found.tsx` 2개만, 나머지 5 도메인은 0건.

## Phase 로드맵

| Phase | 기간 | 작업 | 산출물 |
| --- | --- | --- | --- |
| **P1. 감사** | 1주 | `(content)` 7 도메인·36 페이지를 유형별로 분류하고 4 영역 위반을 file:line 증거로 식별 | `docs/design-system/audit.md` + 신규 tech-debt 후보 |
| **P2. 페이지 유형 카탈로그** | 1주 | 발견된 유형(리스트·디테일·아카이브·랜딩·폼)별 표준 패턴 정의와 ADR 작성 | `docs/design-system/page-patterns.md` + 신규 ADR |
| **P3. next-gen 신규 도메인** | 1–2주 | 카탈로그를 첫 적용 사례로 next-gen 페이지 구축 | next-gen 페이지·컴포넌트·SCSS |
| **P4. 기존 페이지 마이그레이션** | 2주+ | 카탈로그에 맞춰 sermons 외 도메인 정리. primitive 직접 사용 등 활성 부채 포함 | 페이지별 분리 PR |
| **P5. 자동화** | 1–2주 | 페이지간 일관성 감사 에이전트 + 시각 회귀 테스트(Playwright) | 신규 에이전트·CI 설정 |

각 Phase는 별도 task + 분리 PR. develop으로 단계별 머지. 본 표는 진행 결과에 따라 갱신한다.

## 참고

### 관련 메모리 (사용자 결정·선호)

- `feedback_design_tokens` — 토큰 추가보다 단순화 선호, Codeit 네이밍 패턴.
- `feedback_card_separation` — 카드/배경 구분 약할 때 border 강화 X, `$bg-card` 표면 대비.
- `feedback_portal_tokens` — Modal·BottomSheet 등 portal 컴포넌트는 admin 토큰 사용 금지.
- `feedback_no_absolute_layout` — 레이아웃에 absolute 금지, flexbox 사용.
- `feedback_no_global_important` — 전역 `*`·`*::before/after`에 `!important` 일괄 적용 금지.
- `feedback_calc_negative` — SCSS 음수값은 `-$var` 금지, `calc(-1 * $var)` 사용.
- `feedback_css_module_short_names` — CSS Module className은 컴포넌트 접두사 없이 의미 단위.
- `feedback_semantic_nav` — nav 하위는 `ol`/`ul`/`li` + `a`/`button`, `div` 중첩 금지.
- `feedback_consolidate_module_scss` — feature 하위 컴포넌트별 `.module.scss` 반사적 생성 금지.

### 워크플로우

- 본 저장소 워크플로우: `CLAUDE.md` + `.claude/skills/harness-workflow/SKILL.md`.
- 작업 시작: `node scripts/start-task.mjs <slug>`.
- 검증: `node scripts/verify-task.mjs <slug>`.
- 머지 게이트: `node scripts/harness-gate.mjs <slug>`.
- 머지 후: `node scripts/complete-task.mjs <slug>`.

### Codex 협업

- 큰 변경(아키텍처·정책)은 PLAN 직후 `codex:rescue`로 계획 검증.
- 구현 diff 생성 후 `codex:rescue`로 1차 검증.
- 호출 prompt는 영어, 끝에 `Respond in Korean.` 명시.
