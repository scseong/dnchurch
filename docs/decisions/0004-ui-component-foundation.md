# 0004 — UI Component Foundation (디자인 시스템 v4)

- **Status**: Accepted
- **Date**: 2026-05-06
- **Deciders**: scseong
- **Tags**: frontend, design-system

## Context

v3 디자인 시스템에서 `$primary-subtle = $beige-200` (warm) + `$primary = $navy-800` (cool) 매핑이 칩·active 항목·hover에서 온도 충돌을 일으킴. 또한 사이트의 "버튼/클릭 가능한 row" 패턴이 컴포넌트 단위로 정리되지 않고 모든 페이지에 인라인 SCSS로 흩어져 일관성이 무너져 있었음. 사용자 피드백: "공통 컴포넌트로 적용해 사이트 전체의 일관된 UI"가 필요.

## Decision

1. **토큰 역할 재정합 (Phase A)**
   - 정적 면(decorative) = warm: `$bg-secondary`(cream-200) 유지.
   - 인터랙티브 피드백(interactive) = cool: `$bg-hover` 신설(`rgba($navy-800, 0.06)`), `$primary-subtle` 재매핑(`rgba($navy-800, 0.08)`).
   - `$bg-tertiary` 삭제 — hover 용도면 `$bg-hover`, 정적 warm은 `$bg-secondary` 재사용.
   - cream/beige primitive는 보존(decorative gradient 등 명시 컨슈머).
2. **공통 UI 컴포넌트 디렉토리 신설 (Phase B-1)**
   - 위치: `src/components/ui/` (신규). 컴포넌트별 폴더 + `Component.tsx` + `Component.module.scss`. barrel index 미생성.
   - **Button**: variant `primary | secondary | ghost` × size `sm | md | lg`. `fullWidth` prop.
   - **ListItem**: 클릭 가능한 row. `<button>` / Next `<Link>` 두 모드(href 유무로 분기). props: `selected` `disabled` `trailing` `className`.
3. **마이그레이션 정책**
   - 시각 회귀를 최소화하되 "공통 default 시각이 더 일관되면 수용". 외부 className override는 시각 보존이 필요한 곳에만.
   - admin scope(`--admin-*` 정책)는 별도 — 본 토대 PR 미적용.

## Consequences

### 긍정적
- 칩/active/hover의 온도 충돌 시스템 차원 해소.
- Button/ListItem 도입으로 사이트의 클릭 어휘 일관화 시작 — 후속 phase에서 Card·Modal·Sheet으로 확장 가능.
- ADR_TRIGGER_PARTS(`src/components/ui/`) 변경이 ADR로 명시됨.

### 부정적 / 트레이드오프
- 마이그레이션 위치(7+)에서 외부 SCSS override가 일부 잔존 — 시각 보존 vs 컴포넌트 단순성 사이의 타협.
- Banner CTA·Pagination·SermonVideoTools `.tool` 등 layout이 표준에서 크게 벗어난 곳은 미적용 — 후속 phase에서 별도 패턴 정립 필요.
- cream/beige primitive 중 일부는 일시적으로 적은 컨슈머 — Phase B-2(Card warm variant)에서 회수 예정.

### 영향 범위
- 코드: `src/styles/tokens/_color.scss`, `.claude/skills/styles/SKILL.md`, `src/components/ui/{Button,ListItem}/`, 비-admin 컴포넌트 ~25 파일.
- 운영: 시각 변화 — 칩/active 면이 warm beige → cool navy tint, 칩 hover가 색→cool tint 면, 일부 footer/sidebar의 hover 색온도 변경.

## Operational Enforcement

> Updated 2026-05-07 — Phase B 후반(Modal/BottomSheet/Tabs/TextField/Textarea/Label/Pill/Pagination/Skeleton/EmptyState) 통합과 시스템 진입 표면 도입에 맞춰 운영 메커니즘 보강.

- **자동 로딩**: `.claude/skills/ui-components/SKILL.md`가 UI 작업(폼·다이얼로그·탭·뱃지·로딩·빈 상태) 트리거 시 자동 로딩되어, 에이전트는 raw `<button>`/`<input>`/`<dialog>` 직접 작성 전에 `@/components/ui` 카탈로그를 우선 검토한다. 동일 스킬에 컴포넌트 선택 가이드(Modal vs BottomSheet, Label vs Pill 등)와 금지 패턴이 표로 정리됨.
- **인간 진입점**: `src/components/ui/README.md`(컴포넌트 12종 카탈로그 + 선택 가이드 + a11y/토큰 정책)와 `src/components/ui/index.ts`(barrel). 신규 코드는 `import { Button, ... } from '@/components/ui'` 권장.
- **신규 컴포넌트 승격 절차**: 재사용 2곳 이상 확인 → `src/components/ui/<Name>/` 배치 → barrel 등록 → README 표 갱신 → JSDoc 작성 → a11y 체크리스트(키보드·focus·ARIA) → 사용처 1곳 이상에서 기능·시각 수기 검증(테스트 환경 부재로 PR 스크린샷 첨부). 다이얼로그류는 `src/hooks/useDialog.ts` 위임.
- **시그니처 변경 가드**: prop 제거/필수화/이름 변경은 신규 ADR 후보 — 영향 범위(`grep -r '<Button' src/`) 산출 후 결정.

## Alternatives Considered

### A안: Pure cool palette (베이지 전면 제거)
- 사유로 기각: 연구 문서의 "베이지+네이비+골드" 브랜드 의도 훼손. 페이지 전체가 차가워짐.

### B안: 토큰만 정합화하고 컴포넌트 도입은 후속 PR
- 사유로 기각: 사용자가 "공통 컴포넌트로 적용해 일관 UI"를 핵심 요구로 명시. 토큰만 PR 시 가시 변화가 작음.

### C안: Button만 도입 + ListItem 별도 phase
- 사유로 기각: 사이트 특성상 단독 button보다 list-item-as-button 패턴이 다수. Button만으로는 "광범위 적용"이 어려움. 한 PR에 토대 두 개 묶음.

## References

- 관련 exec-plan: `docs/exec-plans/active/2026-05-06-design-system-v4-recolor.md`, `docs/exec-plans/active/2026-05-06-design-system-v4-button.md`
- 관련 ADR: 0001 (codex orchestration strategy)
- 관련 연구: `docs/research/design-system/00_OVERVIEW.md`, `02_HOVER.md`, `03_COMPONENTS.md`
