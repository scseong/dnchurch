# style-tokens-doc-sync

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-10
- **브랜치**: refactor/about-page-redesign

## 목표

디자인 시스템 docs ↔ 토큰 정의 불일치 2건 정정. (1) `$section-padding-*` 잔재 표기를 `$section-gap-*`로 통일하고, (2) `text-page-title` mixin이 `$heading-letter-spacings` map을 참조하도록 단일 소스로 묶는다.

## Assumptions

- v3 디자인 시스템 마이그레이션(2026-05-04 회고) 시 `$section-padding-* → $section-gap-*` 토큰 자체는 정리됐으나 SKILL.md / `_usage-guide.scss`의 docs 갱신이 누락된 잔재 상태다.
- globals h2 자동 적용 값(`$heading-letter-spacings.h2 = -0.05rem`)과 h2-role mixin(`text-page-title`)의 letter-spacing(`-0.15rem`)이 어긋나는 것은 v3 마이그레이션 시 이관 누락이다 — ADR 0003·v3 회고 어디에도 의도적 분리 근거가 없음(Codex 검증).
- `$letter-spacing-heading` 토큰을 직접 사용하는 두 모듈(`Hero.module.scss`, `AboutWorship.module.scss`)은 본 작업 범위 밖. 토큰 값 자체는 변경하지 않는다.

## Non-goals

- 27개 module.scss의 primitive 직접 사용 정리 (별도 PR — stylelint 규칙 추가가 선행).
- `$letter-spacing-heading` 토큰 값 변경 또는 토큰 자체 분리.
- 다른 8개 디자인 시스템 개선안 (#3~#10).
- `_usage-guide.scss` 위치 이동(`docs/references/`로) — PR 2 범위.
- mixin signature 변경 또는 `text-card-title` 등 다른 text-* mixin 변경.
- **heading typography source-of-truth 통합 리팩터** — globals heading map과 모든 text-*-title mixin을 단일 데이터로 통합하는 더 큰 typography 리팩터는 본 PR 범위 밖. 본 PR은 h2-role 한 지점의 값 정합화만 수행.
- SKILL.md 토큰 위치 표(line 14~20) 재구성 — `$content-gap-*`/`$section-gap-*`는 실제로 `_semantic.scss`에 있으므로 표 자체는 정확. `$section-padding-*` 표기만 정정.

## Success Criteria

- `rg '\$section-padding'` 결과가 `docs/exec-plans/completed/`·`docs/decisions/` 외 0건.
- SKILL.md의 토큰 위치 표가 실제 파일 정의와 일치 (`$content-gap-*`·`$section-gap-*`은 `_spacing.scss`, padding/radius/overlay는 `_semantic.scss`).
- `text-page-title` mixin의 letter-spacing이 `$heading-letter-spacings` map의 `'h2'` 값과 동일.
- `yarn lint:styles` 통과, `yarn build` 통과.

## Verification

- `rg '\$section-padding' -g '!docs/exec-plans/completed' -g '!docs/decisions'` → 0 hits
- `node scripts/verify-task.mjs style-tokens-doc-sync` (lint·lint:styles·build·knip)
- 수동 정성 확인: home `NewHere`/`FeedSection` 타이틀 letter-spacing이 -1.5px → -0.5px (1px 차이)로 변경됨을 dev에서 확인. 회귀로 판단되면 의사결정 로그에 기록 후 사용자 결정.

## 접근법

docs 잔재 청소(#1)와 mixin 단일소스 정정(#2) 두 변경만 외과적으로 적용. 토큰 정의 자체와 사용처 코드는 건드리지 않는다.

- **#1 docs 정정**: `.claude/skills/styles/SKILL.md` 3곳 + `src/styles/_usage-guide.scss` 1곳에서 `$section-padding-*` 표기를 `$section-gap-*`로 치환. SKILL.md 토큰 파일 매핑 표 자체(line 14~20)는 정확하므로 재구성하지 않음 — `_semantic.scss` 행 안의 `$section-padding-*` 토큰명만 정정.
- **#2 mixin 정정**: `src/styles/_mixins.scss:90` `text-page-title` 안의 `letter-spacing: $letter-spacing-heading;` →  `letter-spacing: map-get($heading-letter-spacings, 'h2');` 1줄 변경. 이로써 mixin 출력과 globals h2 자동 적용이 동일.

## 영향받는 파일

- `.claude/skills/styles/SKILL.md` — 3곳에서 `$section-padding-*` → `$section-gap-*` (line ~20·159·164)
- `src/styles/_usage-guide.scss` — line 146 `$section-padding-*` → `$section-gap-*`
- `src/styles/_mixins.scss` — line 90 `text-page-title` letter-spacing이 heading map 참조

## 단계별 체크리스트

- [x] 1. SKILL.md line ~20 `tokens/_semantic.scss` 행 안의 `$section-padding-*` → `$section-gap-*`.
- [x] 2. SKILL.md Semantic Token 매핑 표 line 159·164의 `$section-padding-*` → `$section-gap-*`.
- [x] 3. `_usage-guide.scss:146` `$section-padding-*` → `$section-gap-*`.
- [x] 4. `_mixins.scss:90` letter-spacing → `map-get($heading-letter-spacings, 'h2')`.
- [x] 5. `rg '\$section-padding'` 잔재 확인 (active 본 plan + completed/decisions 이력 제외 0건).
- [x] 6. `node scripts/verify-task.mjs style-tokens-doc-sync` 실행 → ESLint·stylelint·Build 통과, Knip 경고는 기존 부채.

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs style-tokens-doc-sync` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] ADR 불필요 (사유: docs 정합성 + mixin 1줄 정정. 정책·구조·라이브러리 변경 없음)

## 참고 자료

- `docs/exec-plans/completed/2026-05-04-design-system-v3.md` — `$section-padding-* → $section-gap-*` 토큰 마이그레이션 원본 회고
- `docs/decisions/0003-design-system-v3-token-unification.md` — deprecated alias 정리 ADR

## 의사결정 로그

- 2026-05-10: 본 PR은 PR 1로 docs 정합성 + mixin 단일소스 두 건만 처리. 나머지 9건은 후속 PR (실행 순서 표 참조).

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: —
- **사유**: 토큰 정의·구조·정책 모두 그대로. SKILL.md/주석/mixin 1줄 정정으로 기존 ADR 0003의 마이그레이션 잔재를 청소.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-10
- **결론**: CHANGE_REQUEST → 반영 완료
- **핵심 지적**:
  1. **토큰 위치 표 잘못된 정정**: `$content-gap-*`/`$section-gap-*`는 실제 `_semantic.scss:29-49`에 정의되어 있음. 초기 계획이 "`_spacing.scss`로 옮겨 정정"이라 적었으나, 표 자체는 정확하므로 행 안의 `$section-padding-*` 표기만 치환해야 함.
  2. **"다른 mixin은 heading map을 통해 일관됨"이 과한 전제**: `set-heading-fonts`는 map을 쓰지만 `text-card-title`은 letter-spacing 자체가 없음. 전제를 "globals h2 자동 적용 vs h2-role mixin 불일치"로 좁힐 것.
  3. **제3 해석 명시 거절 부재**: globals heading map과 모든 text-*-title mixin을 단일 데이터로 통합하는 더 큰 typography 리팩터가 가능. 본 PR이 그 큰 리팩터를 비목표로 명시 거절해야 함.
  4. **확인 사항**: ADR 0003·v3 회고 어디에도 `$letter-spacing-heading: -0.15rem`을 h2 map의 -0.05rem과 의도적으로 분리한 근거 없음 → 이관 누락으로 판단. mixin letter-spacing 변경(2 home 모듈에 1px 영향)은 docs-sync PR 범위 안에서 처리 가능.
- **반영 내용**:
  - Assumptions #2 문장을 "globals h2 자동 적용과 h2-role mixin의 letter-spacing 불일치"로 좁히고 ADR 0003 근거 부재 명시.
  - Non-goals에 "heading typography source-of-truth 통합 리팩터"와 "SKILL.md 토큰 위치 표 재구성" 두 항목 추가.
  - 접근법·영향받는 파일·체크리스트에서 "`_spacing.scss`로 표 옮김" 표현 제거하고 "표 자체는 정확, 토큰명만 치환"으로 정정.

## Codex 1차 검증

- **상태**: 생략
- **요청 시점**: —
- **결론**: 생략 (사유: diff 총 5줄 — SKILL.md 3 + `_usage-guide.scss` 주석 1 + `_mixins.scss` 1줄. CLAUDE.md 트리거(큰 diff·고위험 파일·레이어 변경·검증 실패) 어느 것도 해당 없음. 계획 검증에서 의도·범위 이미 확정)
- **수정 파일**: —
- **핵심 지적**: —
- **남은 리스크**: home `NewHere`/`FeedSection` 타이틀 letter-spacing -1.5px → -0.5px (1px) 시각 변화. ADR 0003·v3 회고에 의도적 분리 근거 없음을 Codex 계획 검증으로 확인.

## Claude 2차 검증

- **검토 내용**:
  - SKILL.md 3곳, `_usage-guide.scss` 1곳, `_mixins.scss` 1곳 변경 모두 plan 범위와 정확히 일치. 인접 정리·포맷 변경 없음(외과적).
  - `rg '\$section-padding'` 잔재: active 본 plan + completed exec-plan + decisions ADR 외 0건. 코드·docs 정합 달성.
  - `_mixins.scss:90` `letter-spacing: map-get($heading-letter-spacings, 'h2');` — globals `set-heading-fonts(...)`가 `<h2>`에 적용하는 값과 동일 데이터 참조. 단일 source of truth 달성.
- **실행한 검증**:
  - `node scripts/verify-task.mjs style-tokens-doc-sync` → ESLint ✓, stylelint ✓, Build ✓. Knip 경고는 기존 부채(NoticeCategoryFilter, SchoolGrid 등 본 PR 무관).
  - `rg '\$section-padding'` 검증 통과.
- **최종 판단**: 사용자 승인 후 커밋 진행 가능. 시각 변화는 home 2모듈에서 1px 미세 변화 — 사용자 dev 확인 권장.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: Codex 계획 검증이 토큰 위치 표 잘못된 정정을 차단 — 표 자체는 정확, 토큰명만 치환하는 올바른 범위 확정. diff 총 5줄로 docs 정합화 + `text-page-title` mixin 단일 source 달성.
- 다음에 할 것: home `NewHere`/`FeedSection` 타이틀 letter-spacing 시각 변화(-1.5px → -0.5px) 사용자 dev 확인. heading typography 전체 통합 리팩터는 별도 PR.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): 없음
