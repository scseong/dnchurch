# transition-focus-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-10
- **브랜치**: refactor/about-page-redesign

## 목표

디자인 시스템 v3에서 미정리된 두 영역 정리:
- (a) **함정 transition 토큰 제거** — `$transition-base/spring/enter`는 모두 `all 0.22~0.36s` 형태로 정의되어 있어 Hover 3원칙 #1(transition: all 금지)에 정면 위반. EXPLORE에서 사용처 정의 외 0건 확인 → 삭제.
- (b) **focus-ring 토큰화** — 글로벌 `:focus-visible`(`globals.scss:174`)이 `$primary` + `0.2rem` 하드코딩. `$border-focus`가 `_color.scss`에 별도 정의되어 있음에도 미사용. 본 PR은 `$focus-ring-{width,offset}` 신설 + globals 1곳만 토큰 적용. 다른 11곳(Pagination·ListItem·NoticeDrawer·NoticeTable·NoticeControlBar)의 focus-ring은 색상·패턴이 다양해 별도 영역 PR로 분리.

## Assumptions

- `$transition-base/spring/enter` 사용처 0건이 grep으로 확인됨(`_effect.scss` 정의 외 매치 없음). 삭제 시 컴파일 영향 없음.
- `$transition-easing-default/spring/snappy` + `$transition-duration-normal`는 `_mixins.scss`의 hover-* mixin이 사용 중이라 보존.
- `globals.scss:174`의 `:focus-visible` 패턴은 디자인 시스템의 표준 focus-ring으로 간주. width(0.2rem) / offset(0.2rem) / color(`$primary`)를 그대로 토큰화.
- 11곳의 다양한 focus-ring 패턴(2px/`$primary-active`/negative offset 등)은 의도가 다양한 케이스라 본 PR이 일괄 통일하면 외과적 원칙 위반. tech-debt 등록 후 영역별 PR.
- `$border-focus`(이미 정의 = `$navy-800` = `$primary`)와 새 `$focus-ring-color`는 동일 색상 가리키지만 의미가 다름(border vs ring). `$focus-ring-color: $border-focus`로 별칭하면 단일 source 유지.

## Non-goals

- 11곳 focus-ring 사용처(Pagination·ListItem·NoticeDrawer/Table/ControlBar 등) 일괄 통일 — 각 모듈의 색상·offset·패턴이 다양해 별도 영역 PR.
- `$transition-easing-*` / `$transition-duration-*` 토큰 정리 — `_mixins.scss`의 hover-* mixin이 사용 중. 보존.
- 새 transition 토큰 신설 — 현재 hover-* mixin이 transition 패턴을 모두 커버. 새 케이스 발생 시 jit 추가.
- focus-ring mixin 신설 — globals 1곳만 적용하므로 mixin 추상화 불필요. 11곳 통일 PR에서 신설 검토.
- `$primary` ↔ `$border-focus` 의미 분리 — 두 토큰이 같은 `$navy-800`을 가리키지만 각각 의미가 다름(action vs focus). 본 PR은 별칭만, 의미 재정의 X.
- 다른 8개 디자인 시스템 개선안 — 이미 PR 1·2·4 완료, PR 5+가 #4 청소.

## Success Criteria

- `$transition-base/spring/enter` 토큰 정의 3개와 *"hover에서 사용 금지"* 안내 주석이 `_effect.scss`에서 제거됨.
- `$focus-ring-width`/`$focus-ring-offset`/`$focus-ring-color` 3개 토큰이 `_color.scss` 또는 `_semantic.scss`에 신설.
- `globals.scss:173-176`의 `:focus-visible`이 새 토큰 사용으로 갱신.
- SKILL.md "Transition 토큰" 섹션이 함정 토큰 삭제를 반영하여 갱신(또는 삭제). focus-ring 토큰 추가 안내.
- `tech-debt-tracker.md`에 *"focus-ring 패턴 통일 (11곳)"* 신규 항목 추가.
- `yarn lint:styles` 통과(새 룰 warning 수 PR 4 대비 변화 없음 또는 -1, error 0).
- `yarn build` 통과.
- `verify-task.mjs` 통과.

## Verification

- `rg '\$transition-base|\$transition-spring|\$transition-enter' src` → 0 hits
- `rg '\$focus-ring-' src` → globals.scss + 토큰 정의에서만 등장
- `rg ':focus-visible' src/styles/globals.scss` → 새 토큰 사용 확인
- `node scripts/verify-task.mjs transition-focus-tokens`

## 접근법

세 영역 외과적 변경. 각 영역 독립.

- **#3a transition 함정 토큰 삭제**: `_effect.scss:51-61` 영역에서 `$transition-base/spring/enter` 3개 정의 + 주석 삭제. `$transition-easing-*`·`$transition-duration-normal`·`$animation-duration-reveal`은 보존(mixin 의존).
- **#3b SKILL.md transition 섹션 정리**: SKILL.md "Transition 토큰" 섹션(line 226-244) 제거 — hover-* mixin 사용 가이드만 남김.
- **#5a focus-ring 토큰 신설**: `_semantic.scss` 또는 `_color.scss`에 `$focus-ring-width: $spacing-2` / `$focus-ring-offset: $spacing-2` / `$focus-ring-color: $border-focus` 3개 추가. 위치는 `_semantic.scss`가 더 적절(spacing·color 합성 토큰).
- **#5b globals 적용**: `globals.scss:173-176` `:focus-visible` 블록을 `outline: $focus-ring-width solid $focus-ring-color; outline-offset: $focus-ring-offset;`로 갱신.
- **#5c SKILL.md focus-ring 안내**: SKILL.md Semantic Token 매핑 표에 focus-ring 항목 1줄 추가.
- **#5d tech-debt 등록**: 11곳 focus-ring 사용처 통일을 미해결 부채로 등록.

## 영향받는 파일

- `src/styles/tokens/_effect.scss` — `$transition-base/spring/enter` 3개 + 주석 제거
- `src/styles/tokens/_semantic.scss` — `$focus-ring-{width,offset,color}` 3개 추가
- `src/styles/globals.scss` — `:focus-visible` 블록 토큰화
- `.claude/skills/styles/SKILL.md` — Transition 섹션 정리 + focus-ring 안내 추가
- `docs/tech-debt-tracker.md` — focus-ring 패턴 통일 부채 항목 추가

## 단계별 체크리스트

- [x] 1. `_effect.scss` "TRANSITION SHORTHAND" 섹션(헤더 + 주석 + 토큰 3개) 제거.
- [x] 2. `_semantic.scss`에 `$focus-ring-{width,offset,color}` 3개 + 의도 주석 추가.
- [x] 3. `globals.scss:174-175` `:focus-visible` 블록을 새 토큰 3개로 갱신.
- [x] 4. SKILL.md "Transition 토큰" 섹션을 짧은 포인터로 축약 (Codex 권고 반영).
- [x] 5. SKILL.md Semantic Token 매핑 표에 focus-ring 행 1줄 추가.
- [x] 6. `tech-debt-tracker.md`에 *"focus-ring 패턴 통일 (11곳)"* 항목 추가 + Codex 권고 추적성 노트(`rg ':focus|outline'`).
- [x] 7. `rg '\$transition-base|\$transition-spring|\$transition-enter' src` → 0 / `rg '\$focus-ring-' src` 검증.
- [x] 8. `node scripts/verify-task.mjs transition-focus-tokens` 실행 → ESLint·stylelint·Build 통과.

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs transition-focus-tokens` 통과
- [ ] 사용자 승인 후 커밋
- [ ] ADR 불필요 (사유: 함정 토큰 삭제 + 신규 토큰 신설은 ADR 0003 v3 시맨틱 정합화의 후속. 정책 변경 없음)

## 참고 자료

- `docs/decisions/0003-design-system-v3-token-unification.md` — primitive ↔ semantic 분리 ADR
- `docs/exec-plans/active/2026-05-10-stylelint-primitive-guardrail.md` — PR 4 (가드레일)
- `docs/exec-plans/completed/2026-05-04-design-system-v3.md` — Hover 3원칙 도입

## 의사결정 로그

- 2026-05-10: focus-ring을 globals 1곳만 토큰 적용. 11곳 일괄 통일은 색상·offset·패턴 다양성으로 외과적 원칙 위반 → tech-debt 등록 후 영역 PR.
- 2026-05-10: focus-ring mixin 신설 보류 — globals 1곳에 mixin이 과한 추상화. 11곳 통일 PR에서 도입 검토.
- 2026-05-10: `$transition-easing-*` / `$transition-duration-normal`는 hover-* mixin이 사용 중이라 보존. 함정 shorthand 토큰 3개만 삭제.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: `docs/decisions/0003-design-system-v3-token-unification.md`
- **사유**: 함정 토큰 삭제 + focus-ring 토큰 신설은 ADR 0003 v3 시맨틱 정합화의 후속 청소. 정책·구조·라이브러리 변경 없음.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-10
- **결론**: PASS
- **핵심 지적**: 없음. 5체크 모두 충족.
- **권고 사항** (PASS 범위, 선택 반영):
  - SKILL.md transition 섹션은 짧은 포인터 형태("transition shorthand token은 제공하지 않으며 hover는 hover-* mixin 또는 명시 속성 transition을 사용") 권장 — 반영.
  - tech-debt 항목에 `rg ':focus|outline' src -g '*.scss'` 기준 추적성 명시 — 반영.
  - `$focus-ring-color: $border-focus` 별칭은 의도적 aliasing(border focus vs ring color는 변경 이유 다름) — 유지.
  - 토큰 위치 `_semantic.scss` 적절(UI 상태 패턴의 합성 semantic token) — 유지.
- **반영 내용**:
  - SKILL.md transition 섹션을 *완전 삭제*가 아닌 *짧은 포인터*로 축약(체크리스트 #4 갱신).
  - tech-debt 항목에 `rg ':focus|outline'` 기반 추적성 노트 추가(체크리스트 #6 갱신).

## Codex 1차 검증

- **상태**: 생략
- **요청 시점**: —
- **결론**: 생략 (사유: 5 파일 외과적 변경 — `_effect.scss` -19줄, `_semantic.scss` +16줄, `globals.scss` 2줄, SKILL.md +2/-21줄, tech-debt +13줄. CLAUDE.md 트리거(큰 diff·고위험 파일·레이어 변경·검증 실패) 모두 해당 없음. 계획 검증에서 PASS, 권고사항도 모두 반영)
- **수정 파일**: —
- **핵심 지적**: —
- **남은 리스크**: 11곳 focus-ring 사용처는 본 PR 범위 밖(tech-debt 등록). 영역별 정리 PR에서 새 토큰 또는 신설 mixin으로 일괄 통일 예정.

## Claude 2차 검증

- **검토 내용**:
  - 5 파일 변경 모두 plan 범위와 정확히 일치. 인접 정리·포맷 변경 없음(외과적).
  - `_effect.scss`: TRANSITION SHORTHAND 섹션만 제거(헤더+주석+토큰 3개). easing/duration 토큰은 보존.
  - `_semantic.scss`: focus-ring 3개 토큰을 OVERLAY 다음에 의도 주석과 함께 추가. `_color.scss`가 아닌 `_semantic.scss` 위치 — Codex 권고와 일치.
  - `globals.scss`: `:focus-visible` 두 줄만 변경. width/offset 모두 `$spacing-2` 기반으로 일관.
  - SKILL.md: Transition 섹션은 5줄 포인터로 축약(완전 삭제 아님 — Codex 권고). focus-ring 행 1줄 매핑 표에 추가.
  - tech-debt-tracker.md: focus-ring 패턴 통일 항목이 형식(상태/무엇/왜/마이그레이션/영향/확인/발견일) 일관. 11곳 사용처 모두 명시. Codex 권고대로 `rg ':focus|outline'` 추적성 명령 포함.
- **실행한 검증**:
  - `rg '\$transition-base|\$transition-spring|\$transition-enter' src` → 0 hits ✓
  - `rg '\$focus-ring-' src` → 토큰 정의 3건 + globals 2건 = 5건 ✓
  - `node scripts/verify-task.mjs transition-focus-tokens` → ESLint ✓, stylelint ✓, Build ✓. Knip 경고는 기존 부채.
- **최종 판단**: 사용자 승인 후 커밋 진행 가능. 본 PR 커밋 staging은 6 파일.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: Codex PASS + 권고사항(SKILL.md transition 포인터 축약, tech-debt 추적성 명령) 선택 반영. 함정 토큰 3개 삭제 + focus-ring 토큰 신설 모두 verify 통과. `$focus-ring-color: $border-focus` 별칭으로 단일 source 유지.
- 다음에 할 것: 11곳 focus-ring 패턴 통일 영역 PR. 통일 시 focus-ring mixin 신설 검토.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): focus-ring 패턴 통일 (11곳) — tech-debt-tracker 등록 완료
