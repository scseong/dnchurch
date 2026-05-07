# design-system-v4-recolor

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-06
- **브랜치**: feat/design-system-v3 (v3 6 커밋 위에 v4 누적)

## 목표

v3 토큰의 온도 충돌을 해소한다. **인터랙티브 피드백(hover/active/subtle)은 cool**, **장식 면(page/section/card bg)은 warm**으로 역할을 분리해 navy ↔ beige가 무작위 인접하지 않도록 시스템 차원에서 강제한다.

## Assumptions

- 사용자는 "기존 스타일에 맞추는 보수적 적용"이 아니라 **연구 문서의 의도(베이지 면 + Navy 브랜드 + Gold 액센트)에 맞춘 적극적 재정합**을 원한다. 따라서 기존 컴포넌트 일부의 시각이 바뀌는 것은 의도된 결과.
- v3 6 커밋(토큰 1차 재매핑·hover mixin·15 파일 정리)은 그대로 유지하고 v4가 위에 누적된다(option 3). v3가 도입한 `$beige-200` primitive는 보존, semantic 매핑만 재배치.
- admin scope(`src/components/admin/`)는 `--admin-*` 정책에 따라 본 PR 제외(portal_tokens 정책).

## Non-goals

- **공통 컴포넌트 신규 구축**(Button/Card/Modal `src/components/ui/`)은 별도 exec-plan `design-system-v4-foundation`. 본 PR은 토큰·기존 컴포넌트 정합화까지.
- 페이지 레벨 인라인 hex 정리.
- admin scope 토큰 재정합.
- gold/accent·status 토큰 재배치(현행 유지).
- v3 commit 리셋·이력 정리.

## Success Criteria

- [ ] `$primary-subtle`이 더 이상 warm primitive(beige/cream)를 참조하지 않는다.
- [ ] `$bg-hover` 신설(`rgba($navy-800, 0.06)`), `$bg-tertiary` **삭제**(사용처 9 파일은 의도에 따라 `$bg-secondary` 또는 `$bg-hover`로 분류 매핑).
- [ ] 칩/active 항목 패턴에서 **warm bg + cool stroke/text** 조합 0건 — `:hover` 블록 안에 warm primitive(`$beige|$cream-`) 또는 `$bg-tertiary` 잔존 0건으로 판정.
- [ ] SKILL.md `Color Tokens` 섹션에 warm(decorative) vs cool(interactive) 역할 표 명시.
- [ ] `yarn lint:styles` 0 errors / `yarn build` 통과 / `verify-task.mjs` PASS.

## Verification

```bash
yarn lint:styles
yarn build
node scripts/verify-task.mjs design-system-v4-recolor

# warm primitive를 인터랙티브 semantic으로 참조하는 위반 0건
rg -n '\$(primary-subtle|bg-hover):.*\$(beige|cream)' src/styles/tokens/_color.scss

# $bg-tertiary 정의·사용 잔존 0건 (삭제 확정)
rg -n '\$bg-tertiary' src/styles src --glob '!**/admin/**'

# `:hover { ... }` 블록 안에 warm primitive 또는 deprecated tertiary 잔존 0건 (multiline)
rg -nU --multiline ':hover\s*\{[^}]*?(\$beige|\$cream-|\$bg-tertiary)' src --glob '!**/admin/**'

# 변경 파일 admin 0건
! git diff --name-only HEAD | grep -i admin
```

## 접근법

**역할 기반 토큰 재배치** — primitive는 그대로(warm/cool 둘 다 보존). semantic 매핑만 다음과 같이.

| Semantic | 현재 (v3) | 신규 (v4) | 역할 |
|---|---|---|---|
| `$bg-primary` | `$gray-50` | 동일 | 페이지 기본 |
| `$bg-secondary` | `$cream-200` (warm) | 동일 | 섹션·카드 정적 면 (decorative warm) |
| `$bg-tertiary` | `$cream-300` (warm hover) | **삭제** | — |
| **`$bg-hover`** (신설) | — | `rgba($navy-800, 0.06)` | 인터랙티브 hover 피드백 (cool, 면 종류 무관) |
| `$primary-subtle` | `$beige-200` (warm) | `rgba($navy-800, 0.08)` | active/selected 항목의 cool 강조 면 |

**`$primary-subtle-strong`은 본 PR에서 신설하지 않음** — Phase A 범위에 확인된 소비자 없음(YAGNI). Phase B(공통 컴포넌트)에서 active 강조가 약하다고 판정되면 그때 도입.

**`$beige-200` primitive 보존** — Phase A에서 일시적으로 unused primitive 상태가 됨(의도적 허용). Phase B에서 warm Card variant(prayer/about hero 카드 등)의 면 색으로 소비될 예정. unused 경고가 lint에서 발생하면 lint config로 primitive scope 예외 처리 또는 임시 주석 처리.

**rgba 선택 이유**: navy primary + beige page bg(`$bg-secondary`) 위 + gray page bg(`$bg-primary`) 위에서 모두 자연스럽게 작동해야 함. 단색 cool 토큰은 warm 면 위에서 어색. opacity 기반 cool tint는 두 면 모두에서 일관된 강조 신호. WCAG: `$navy-800` 6%/8% 합성된 면 위 `$txt-primary(#111827)` 대비비 8.5~15.4(AA 충족, Codex 검증 완료).

**Step 3 분류 규칙(작업 가이드)**:

| 케이스 | 매핑 | 예시 |
|---|---|---|
| `&:hover { background: $primary-subtle }` 또는 `$bg-tertiary` | → `$bg-hover` | NoticeDrawer `.close_btn:hover`, SeriesBrowserSheet `.item:hover` |
| `.active { background: $primary-subtle }` 또는 `&.active`/`&.selected` 정적 강조 | → `$primary-subtle`(자동으로 cool rgba로 매핑됨, 변경 불요) | AdvancedFilterSheet `.chip_active`, SeriesBrowserSheet `.item.active` |
| 그 외(검색 input bg 등 정적 면) | 개별 판단 + exec-plan `의사결정 로그`에 한 줄 사유 기록 | SeriesBrowserSheet `.search_input` (현재 `$primary-subtle`) |

## 영향받는 파일

- `src/styles/tokens/_color.scss` — semantic 재매핑
- `.claude/skills/styles/SKILL.md` — warm/cool 역할 표 + Hover 시스템 보강
- 비-admin 컴포넌트 16 파일(`$primary-subtle` 사용처) — 시각 의도가 active/selected면 그대로 유지(rgba navy로 변경됨), hover 면이면 `$bg-hover`로 변경
- 비-admin 컴포넌트 9 파일(`$bg-tertiary` 사용처) — 사용 의도 분류해 `$bg-hover`(인터랙티브) 또는 그대로(정적 warm) 결정

(admin 5 파일은 본 PR 제외 — `dropdown.module.scss`, `ConfirmModal/index.module.scss` 등)

## 단계별 체크리스트

- [ ] 1. `_color.scss` semantic 재매핑: `$bg-hover` 신설, `$bg-tertiary` 정의 삭제, `$primary-subtle` → `rgba($navy-800, 0.08)` (warm primitive는 보존)
- [ ] 2. SKILL.md 역할 표(warm decorative vs cool interactive) + Hover 시스템 갱신
- [ ] 3. `$primary-subtle` 사용처 16 파일 — 분류 규칙(접근법 표) 적용 후 hover 패턴만 `$bg-hover`로 교체, active/selected는 토큰명 유지
- [ ] 4. `$bg-tertiary` 사용처 9 파일 — hover 용도면 `$bg-hover`, 정적 warm 의도면 `$bg-secondary`로 매핑
- [ ] 5. verify grep 4종(접근법) 통과 확인
- [ ] 6. lint:styles + build 통과
- [ ] 7. verify-task.mjs 증적
- [ ] 8. Codex 1차 검증
- [ ] 9. Claude 2차 검증 → 사용자 승인 → 커밋

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs design-system-v4-recolor` 통과
- [ ] 사용자 승인 후 커밋
- [ ] ADR 갱신(0001 또는 신규 ADR로 v4 정합화 사유 기록)

## 의사결정 로그

- 2026-05-06: warm decorative vs cool interactive 분리 채택. 단색이 아닌 `rgba(navy)` opacity 기반으로 양쪽 면에서 자연스럽게 작동.
- 2026-05-06: `$beige-200` primitive 보존. semantic 매핑에서만 인터랙티브 토큰과 분리.
- 2026-05-06: 공통 컴포넌트 구축은 `design-system-v4-foundation`로 분리 — 토큰 안정화 후 진행해야 컴포넌트가 재작업 안 됨.

## ADR 판단

- **필요 여부**: 검토 중 (likely 필요)
- **사유**: `src/styles/tokens/_color.scss` semantic 매핑 변경은 ADR_TRIGGER_PARTS. v3 ADR 갱신 또는 v4 별도 ADR.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06
- **결론**: CHANGE_REQUEST → 5개 보강 후 진행
- **핵심 지적**:
  - `$bg-tertiary` 결정이 "삭제 또는 유지"로 미확정 — WORK 단계 판단 비용 발생.
  - `$primary-subtle-strong` 신설은 Phase A 소비자 없음(YAGNI).
  - Step 3 분류 규칙이 모호("의도 분류 후") — 작업자별 결과 차이 가능.
  - "warm bg + cool stroke 조합 0건" 판정 grep 부재.
  - `$beige-200` orphan 처리 방침 미명시.
  - WCAG: `rgba($navy-800, 0.06/0.08)` 합성 면 위 `$txt-primary` 대비비 8.5~15.4(AA 충족) — 통과.
- **반영 내용**:
  - 접근법 표: `$bg-tertiary` **삭제**로 확정. 사용처 9 파일은 `$bg-secondary`(정적 warm) 또는 `$bg-hover`(인터랙티브)로 분류 매핑.
  - `$primary-subtle-strong` 신설 제거. Phase B에서 소비자 발견 시 도입.
  - Step 3 분류 규칙 표를 접근법에 추가(`&:hover`/`&.active`/그 외 3 케이스).
  - Verification에 multiline rg 추가: `:hover` 블록 내부 warm primitive·`$bg-tertiary` 잔존 0건 + tertiary 정의·사용 0건.
  - `$beige-200` orphan은 의도적 허용 — Phase B warm Card variant 소비 예정 명시.
- **재요청 여부**: 불필요. 5개 모두 국소 보강. WORK 진행.

## Codex 1차 검증

- **상태**: 미요청

## Claude 2차 검증

- **검토 내용**:
- **실행한 검증**:
- **최종 판단**:

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰
- [ ] 멀티 세션 리뷰 (codex:rescue)

## 회고 (머지 후 작성)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채:
