# design-system-v4-button (Button + ListItem)

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-06
- **브랜치**: feat/design-system-v3 (v3 6 + v4-recolor 미커밋 위에 누적)

## 목표

`src/components/ui/`에 **Button**(3 variant × 3 size)과 **ListItem**(클릭 가능한 row) 두 공통 컴포넌트를 신설하고, 사이트의 흩어진 인라인 button/row 패턴을 10개 이상 위치에서 마이그레이션해 클릭 어휘를 통일한다.

## Assumptions

- v4-recolor 토큰(`$bg-hover`, cool `$primary-subtle`)이 미커밋이지만 같은 브랜치에 적용된 상태에서 작성. 컴포넌트는 그 위에서 짠다.
- admin scope 제외(`--admin-*` 정책).
- 사이트 특성상 단독 button보다 list-item-as-button(`.row`, `.option`, `.nav_btn`, `.sidebar_item` 등)이 다수 — Button만으론 광범위 적용 불가능. 그래서 ListItem 동반.
- Banner의 dark hero CTA, 인라인 SVG icon-only 버튼, Pagination(자체 패턴)은 본 phase 미적용 — 별도 패턴 정립 필요.
- v4-recolor + Phase B-1을 묶어 통합 PR로 push.

## Non-goals

- Card / Sheet / BottomSheet / Modal / Form / Toast / Tabs / Accordion 등 다른 공통 컴포넌트(B-2~B-5).
- Chip(toggle filter) — `.chip`은 별도 ToggleChip 컴포넌트. 본 phase는 명백한 button/row 의미만.
- IconButton(작은 icon-only — 닫기·재생 등) 분리. 본 phase에서 만나면 `<button>` 인라인 잔존.
- Banner의 dark hero CTA(gold 위 dark surface) 및 hero 영역 인터랙션 — 별도 hero 패턴 정립 후 처리.
- Pagination 마이그레이션 — `.page_link`는 자체 패턴, 후속.
- 페이지 hex 정리 / 미사용 코드 제거 / admin 영역.
- `cta-featured` variant 도입 — Banner 외 소비자 없음(YAGNI). 후속 phase에서 Featured Card·Hero CTA 패턴 확정 시 도입.
- ListItem `leading` slot — 현 phase 소비자 없음(YAGNI). `trailing`만 도입.

## Success Criteria

- [ ] `src/components/ui/Button/{Button.tsx, Button.module.scss, index.ts}` 존재.
- [ ] Button variant: `primary | secondary | ghost` (3) × size: `sm | md | lg` (3) 모두 정의.
- [ ] `src/components/ui/ListItem/{ListItem.tsx, ListItem.module.scss, index.ts}` 존재.
- [ ] ListItem props: `href`(있으면 Next `<Link>`) / `onClick`(있으면 `<button>`) / 둘 다 없으면 `<div role="button">` 자동 분기. `selected`, `disabled`, `trailing` slot.
- [ ] **`selected`는 opt-in 시각 처리** — 컴포넌트는 `aria-current` + className만 부여하고 시각(`$primary-subtle` bg/`$primary` color)은 *기본값*으로 적용하되 컨테이너 측에서 className override 가능.
- [ ] **마이그레이션 ≥10 위치** (Button ≥3 + ListItem ≥7).
- [ ] 마이그레이션된 위치의 인라인 SCSS는 외과적으로 삭제.
- [ ] `yarn lint:styles` 0 errors / `yarn build` 통과 / `verify-task.mjs` PASS.
- [ ] 시각 회귀 없음(토큰만 적용, 형태/사이즈 유지). CategoryBottomSheet는 selected 시 기존이 weight+check만이었음 → 마이그레이션 후 옅은 cool 배경 추가됨(의도된 변화, 합의됨).
- [ ] ADR 생성 — `docs/decisions/0002-ui-component-foundation.md` (`src/components/ui/` 패턴 + Phase A·B 토대 통합).

## Verification

```bash
# 신규 컴포넌트 존재
ls src/components/ui/Button src/components/ui/ListItem

# variant Type 정의
rg -n "type ButtonVariant|type ButtonSize" src/components/ui/Button

# 마이그레이션된 인라인 클래스 잔존 0건 (각 위치별)
rg -n '\.btn_(apply|reset)\b' src/app/\(content\)/sermons/_component/AdvancedFilterSheet
rg -n '\.view_all\b|\.row\b' src/app/\(content\)/sermons/_component/SeriesEpisodeList
rg -n '\.option\b' src/app/\(content\)/news/notices/_component/CategoryBottomSheet.module.scss
rg -n '\.nav_btn\b' src/app/\(content\)/news/notices/_component/NoticeDrawer.module.scss
rg -n '\.sidebar_item\b' src/app/\(content\)/sermons/_component/SermonListPage
rg -n '\.tool\b|\.speed_option\b' src/app/\(content\)/sermons/_component/SermonVideoTools

# 컴포넌트 import 분포(≥10)
rg -n "from.*'@/components/ui/Button'|from.*'@/components/ui/ListItem'" src --glob '!**/admin/**'

# 토큰 일치 확인 (v4 hover token만)
rg -n ':hover\s*\{[^}]*?(\$beige|\$cream-|\$bg-tertiary)' src --multiline --glob '!**/admin/**'

yarn lint:styles
yarn build
node scripts/verify-task.mjs design-system-v4-button

# admin 0건 변경
! git diff --name-only HEAD | grep -i admin
```

## 접근법

**컴포넌트 인터페이스 (최소·확장 가능)**

```tsx
// Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;  // default 'primary'
  size?: ButtonSize;         // default 'md'
}

// ListItem.tsx — auto-element 분기, leading 미도입(YAGNI)
interface ListItemProps {
  href?: string;          // 있으면 Next <Link>
  external?: boolean;     // href + external true → raw <a target="_blank">
  onClick?: () => void;   // href 없고 onClick 있으면 <button>
  selected?: boolean;     // aria-current="true" + selected className(기본 시각 적용)
  disabled?: boolean;
  trailing?: ReactNode;   // chevron/check/badge slot
  children: ReactNode;
  className?: string;     // 외부 override(시각 customize)
}
```

**Variant 매핑 표 (Button — 3 variant)**

| Button variant | base | hover | active |
|---|---|---|---|
| primary | `$primary` bg + `$txt-inverse` | `$primary-hover` | `$primary-active` |
| secondary | `$bg-primary` + `1px solid $border-primary` | `$bg-hover` (border 변경 X) | `$primary-subtle` |
| ghost | transparent + `$primary` color | color → `$primary-hover` | `$primary-subtle` bg |

**ListItem 상태**
- base: transparent + `$txt-primary`
- hover: `$bg-hover`
- **selected (default 시각)**: `$primary-subtle` bg + `$primary` color + `aria-current="true"`. 외부 className으로 override 가능.
- disabled: `$txt-disabled` + `cursor: not-allowed`

**SermonVideoTools 분류 결정**
- `.tool` (toolbar의 icon+label, active state 있음) → **Button variant=ghost**, active 시 `aria-pressed` + custom className.
- `.speed_option` (popup 내 menuitem row) → **ListItem**, selected는 현재 속도와 매칭 시 적용.

**Hover 3원칙 준수** — `transition: all` 금지 / shorthand `background:` 금지 / hover 안 `border*` 금지.

## 영향받는 파일

**신규 (6)**
- `src/components/ui/Button/Button.tsx`
- `src/components/ui/Button/Button.module.scss`
- `src/components/ui/Button/index.ts`
- `src/components/ui/ListItem/ListItem.tsx`
- `src/components/ui/ListItem/ListItem.module.scss`
- `src/components/ui/ListItem/index.ts`

**마이그레이션 대상 (확정 10 위치)**

Button 적용 (3 위치):
1. AdvancedFilterSheet `.btn_apply` → Button primary
2. AdvancedFilterSheet `.btn_reset` → Button secondary
3. SeriesEpisodeList `.view_all` → Button ghost (size sm)
4. SermonVideoTools `.tool` → Button ghost (active=aria-pressed) — 4개 인스턴스(toolbar 항목)

ListItem 적용 (7 패턴):
5. SeriesEpisodeList `.row` → ListItem (selected=`row_current`)
6. CategoryBottomSheet `.option` → ListItem (selected + trailing check)
7. NoticeDrawer `.nav_btn` → ListItem (disabled prop, .first-child border 자체 처리)
8. SermonListPage `.sidebar_item` → ListItem (selected=`sidebar_item_active`)
9. SermonVideoTools `.speed_option` → ListItem (selected=현재 속도 매치)
10. SeriesBrowserSheet `.item` → ListItem (selected + trailing badge)

**확장 후보 (시간 여력 시)**: SermonListPage `.year_card` 등 — Phase B-1.5 또는 후속 ToggleChip phase로.

## 단계별 체크리스트

- [ ] 1. Button 컴포넌트 신설 (TSX + SCSS Module + index)
- [ ] 2. ListItem 컴포넌트 신설 (auto-element 분기 포함)
- [ ] 3. AdvancedFilterSheet 마이그레이션 (Button primary + secondary)
- [ ] 4. SeriesEpisodeList `.row` + `.view_all` (ListItem + Button)
- [ ] 5. CategoryBottomSheet `.option` → ListItem
- [ ] 6. NoticeDrawer `.nav_btn` → ListItem
- [ ] 7. SermonListPage `.sidebar_item` → ListItem
- [ ] 8. SermonVideoTools `.tool` (Button) + `.speed_option` (ListItem)
- [ ] 9. SeriesBrowserSheet `.item` → ListItem
- [ ] 10. 인라인 SCSS 외과적 제거 + verify grep 통과
- [ ] 11. yarn build + verify-task PASS
- [ ] 12. ADR `0002-ui-component-foundation.md` 작성
- [ ] 13. Codex 1차 검증 + Claude 2차 검증 → 사용자 승인 → 커밋

## 완료 기준 (DoD)

- [ ] verify-task PASS
- [ ] 사용자 승인 후 커밋
- [ ] **ADR `docs/decisions/0002-ui-component-foundation.md` 작성** (`src/components/ui/` 패턴 + Phase A 토큰 정합 + Phase B-1 컴포넌트 토대 통합 결정)
- [ ] `node scripts/update-adr-index.mjs` 실행

## 의사결정 로그

- 2026-05-06: Phase B-1 scope를 Button+ListItem 동반으로 결정 — 사이트 특성상 Button 단독은 가시 변화 작음(list-item-as-button 다수). 두 컴포넌트 동시 도입으로 클릭 어휘를 한 PR에 통일.
- 2026-05-06: Banner dark CTA·IconButton·Chip·Pagination은 본 phase 제외 — 각 패턴 별 정립 후 후속.
- 2026-05-06: Codex CHANGE_REQUEST 반영 — variant 4→3(`cta-featured` 제거, YAGNI), `leading` slot 제거(YAGNI), `as` polymorphism을 auto-element 분기로 단순화(Next Link 호환), `selected` opt-in semantic 명시, SermonVideoTools 분류 고정(`.tool`=Button ghost, `.speed_option`=ListItem), 마이그레이션 12+→10 확정 위치, ADR DoD 확정.

## ADR 판단

- **필요 여부**: **필요** (확정).
- **결정 링크**: `docs/decisions/0002-ui-component-foundation.md` (본 phase에서 작성).
- **사유**: `src/components/ui/` 디렉토리 신설은 ARCHITECTURE 변경(ADR_TRIGGER_PARTS). 컴포넌트 위치 정책 + variant naming + auto-element 분기 + Phase A 토큰 정합을 통합 기록.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06
- **결론**: CHANGE_REQUEST → 8개 보강 후 진행
- **핵심 지적**:
  - variant 4개 중 `cta-featured` 소비자 없음(YAGNI).
  - ListItem `leading` slot 소비자 없음(YAGNI).
  - `as: 'a'`가 raw anchor인지 Next `<Link>`인지 불명확.
  - `selected` 시각 강제 vs opt-in 모호 — CategoryBottomSheet는 기존 weight+check만이라 회귀 위험.
  - SermonVideoTools `.tool`/`.speed_option` 분류 TBD.
  - 마이그레이션 12+ inflated — 명명 후보 ~9 수준.
  - Verification에 list-item-as-button 잔존 검증 grep 부재.
  - ADR 생성이 "검토 중"이라 DoD 확정 항목 아님.
- **반영 내용**:
  - variant 3개로 축소(`cta-featured` 삭제). `leading` slot 삭제.
  - ListItem auto-element 분기: `href`→Next `<Link>` / `external`+`href`→raw `<a>` / `onClick`→`<button>`.
  - `selected`는 default 시각 적용하되 className override 가능 — Success Criteria에 명시.
  - SermonVideoTools `.tool`=Button ghost(aria-pressed), `.speed_option`=ListItem 고정.
  - 마이그레이션 10 위치 확정(접근법 표).
  - Verification에 위치별 잔존 grep + import 분포 grep 추가.
  - ADR 생성을 DoD 확정 항목으로 고정.
- **재요청 여부**: 불필요. 모두 국소 보강. WORK 진행.

## Codex 1차 검증

- **상태**: 미요청

## Claude 2차 검증

- **검토 내용**:
- **실행한 검증**:
- **최종 판단**:

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰
- [ ] 멀티 세션 리뷰

## 회고 (머지 후 작성)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채:
