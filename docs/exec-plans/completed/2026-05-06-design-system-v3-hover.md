# design-system-v3-hover

- **상태**: ✅ 완료 (로컬 커밋 a7357f2, 미머지 — 멀티 Phase 통합 PR 예정)
- **시작일**: 2026-05-06
- **완료일**: 2026-05-06
- **브랜치**: feat/design-system-v3

## 목표

`src/styles/_mixins.scss`에 v3 디자인 시스템 hover 패턴 3종(`hover-bg-shift`, `hover-color-shift`, `hover-lift`)을 추가하고, `.claude/skills/styles/SKILL.md`에 Hover 3원칙(`transition: all` 금지 / shorthand `background:` 금지 / hover 안에서 `border*` 명시 금지) + mixin 사용 표를 명시한다. 본 PR은 **foundation only** — 컴포넌트별 hover 위반 60+ 건 정리는 Phase 3에서 다룬다. `hover-outline-dark`(다크 영역 outline 버튼)는 Hover 3원칙 #3과 의도된 예외 관계라 실제 consumer가 발생하는 Phase 3에서 예외 정책과 함께 도입한다(YAGNI).

## Assumptions

- 현재 브랜치 `feat/design-system-v3`에서 계속 작업 — Phase 1 직후 같은 브랜치에 누적.
- `_effect.scss`의 `$transition-base/spring/enter` shorthand가 내부에 `all`을 포함하는 이슈는 본 PR 범위 외. 외부 사용은 1건(SchoolGrid.module.scss)뿐이며, Phase 3 컴포넌트 정리에서 같이 다룬다.
- `hover-lift` 의 기본 shadow는 기존 `$shadow-md` 사용 — 새 shadow 토큰 도입 X.
- `@media (hover: none)` 분기는 `hover-lift`에만 포함 — 다른 mixin은 simple :hover로 충분.
- mixin 시그니처는 연구 v2 (`docs/research/design-system/02_HOVER.md`)와 동일 형태로 유지하되, 본 프로젝트 토큰(`$shadow-md`, `$transition-easing-default` 등) 사용.
- 컴포넌트 SCSS 파일은 본 PR에서 변경하지 않는다 — Phase 3가 mixin 채택을 담당.

## Non-goals

- 컴포넌트별 hover 위반 정리 (60+ 건) — **Phase 3** 작업.
- `_effect.scss`의 `$transition-base/spring/enter` shorthand 토큰 정합화 — Phase 3에서 SchoolGrid 컨슈머와 함께 처리.
- `$primary-active`를 hover에 직접 사용하는 패턴(예: Pagination, ConfirmModal) 정합화 — Phase 3.
- 새 shadow 토큰(`$shadow-modal`, `$shadow-drawer`, `$shadow-preview`) 도입 — 사용처 발생 시 도입.
- `hover-outline-dark` mixin 추가 — Codex CHANGE_REQUEST에 따라 본 PR 제외(Phase 3에서 실제 consumer + 3원칙 예외 정책과 함께 도입).
- 페이지·인라인 hex 정리 — Phase 4.
- ADR 본문 작성 — 본 PR에서 ADR 판단만 기록.

## Success Criteria

- [ ] `_mixins.scss`에 `hover-bg-shift($hover-bg, $duration: 0.18s)` 추가.
- [ ] `_mixins.scss`에 `hover-color-shift($hover-color, $duration: 0.18s)` 추가.
- [ ] `_mixins.scss`에 `hover-lift($shadow: $shadow-md, $lift: 2px, $duration: 0.22s)` 추가 (`@media (hover: none)` 분기 포함).
- [ ] `_mixins.scss` hover 섹션 도입부에 Hover 3원칙 주석 블록 명시.
- [ ] `SKILL.md`에 `## Hover 시스템` 섹션 신설 (3원칙 + 4 mixin 시그니처/용도 표 + 사용 예시 1~2개).
- [ ] `yarn lint:styles` 0 error.
- [ ] `yarn build` 통과 — `_mixins.scss`가 globals 자동 주입 대상이므로 SCSS 컴파일 안정 보장.
- [ ] `node scripts/verify-task.mjs design-system-v3-hover` 통과.
- [ ] 컴포넌트 SCSS 파일 변경 0건(외과적 변경 — `git diff --stat` 확인).

## Verification

```bash
yarn lint:styles
yarn build
node scripts/verify-task.mjs design-system-v3-hover

# 외과적 변경 확인 — 변경 파일은 _mixins.scss + SKILL.md + exec-plan 3개로만 한정
git diff --name-only HEAD
```

## 접근법

**Foundation only**. Mixin 정의 + 가이드 문서화로 끝낸다. 컴포넌트가 mixin을 채택하는 것은 Phase 3의 일이며, 본 PR은 mixin이 컴파일되고 SKILL.md가 문법을 안내하면 충분.

mixin 시그니처는 연구 v2의 형태를 그대로 차용 — 이미 디자인 의도가 검증된 인터페이스. 단, 토큰 이름은 본 프로젝트 v3 ($navy-800, $cream-200, $beige-200, $shadow-md, $transition-easing-default)로 사용.

`_effect.scss`의 `all` shorthand 이슈를 본 PR에서 다루지 않는 이유: (a) 외부 사용 1건뿐이라 Phase 3에서 컴포넌트 정리와 같이 처리하면 충분, (b) 본 PR을 foundation으로 좁혀 blast radius 최소화.

대안 검토:
- *Phase 2에서 컴포넌트 위반 60+ 건도 정리* — 기각. blast radius 과대(외과적 변경 위반), 리뷰 부담, 회귀 위험. mixin 없이는 정리 자체가 불가능하므로 단계 분리가 자연스러움.
- *`_effect.scss` `all` 제거* — 보류. 사용처 1건이라 단독 처리는 과한 비용. Phase 3 컴포넌트 정리와 함께.
- *새 shadow 토큰(modal/drawer/preview) 도입* — 보류. 본 PR에서 사용처 없음.

## 영향받는 파일

- `src/styles/_mixins.scss` — hover mixin 4종 + 도입부 주석 추가
- `.claude/skills/styles/SKILL.md` — `## Hover 시스템` 섹션 신설

## 단계별 체크리스트

- [x] 1. `_mixins.scss`에 Hover 3원칙 주석 블록 + `hover-bg-shift` 추가
- [x] 2. `hover-color-shift` 추가
- [x] 3. `hover-lift` 추가 (모바일 `(hover: none)` 분기 포함)
- [x] 4. `SKILL.md`에 `## Hover 시스템` 섹션 추가 (3원칙 + 패턴 표 + 예시 + Transition caveat)
- [x] 5. `yarn lint:styles` 통과 확인 (0 errors)
- [x] 6. `yarn build` 통과 확인
- [x] 7. Codex 1차 검증 — FIX_APPLIED (Codex가 markdown 2건 직접 수정)
- [x] 8. `node scripts/verify-task.mjs design-system-v3-hover` 증적 기록 — `logs/design-system-v3-hover/20260506-200018/`
- [x] 9. Claude 2차 검증 완료 → **사용자 승인 대기** → 커밋

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs design-system-v3-hover` 통과
- [ ] 사용자 승인 후 커밋
- [ ] 변경 파일 `_mixins.scss`, `SKILL.md`, exec-plan 3개로만 한정 — 외과적 변경 확인
- [ ] Phase 3 시작 전 본 PR이 통합 PR 브랜치에 누적되어 있음

## 참고 자료

- `docs/research/design-system/02_HOVER.md` — 4 mixin 원형 (커밋 X — 일회성 참조)
- `docs/exec-plans/completed/2026-05-06-design-system-v3-tokens.md` — Phase 1 회고에 본 Phase 2가 next step으로 명시됨
- `.claude/skills/styles/SKILL.md` — Phase 1에서 Primary Action hover 방향성(lighter on hover) 명시 — 본 PR에서 mixin 사용 예시도 일관

## 의사결정 로그

- 2026-05-06: Phase 2 scope를 mixin foundation으로 좁혀 결정. 컴포넌트 정리·`_effect.scss` shorthand·`$primary-active` 패턴 정합화는 Phase 3에서 일괄 처리.
- 2026-05-06: 새 shadow 토큰 도입 보류 — 본 PR에 사용처 없음. `hover-lift` 기본 shadow는 `$shadow-md` 재사용.
- 2026-05-06: Codex CHANGE_REQUEST 수용 — `hover-outline-dark` 제거. 사유: (a) 현재 consumer 0건(YAGNI), (b) hover에서 `border-color` 변경이 Hover 3원칙 #3과 충돌하므로 예외 정책 명시 없이 도입 시 가이드 일관성 훼손. Phase 3에서 실제 다크 outline 버튼 consumer 발견 시, 예외 정책과 함께 별도 도입.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: 없음
- **사유**: ADR_TRIGGER_PARTS 자동 트리거 대상 없음(`src/styles/_mixins.scss`, `.claude/skills/styles/SKILL.md` 모두 비대상). Hover 3원칙은 design-system v3의 일부이며 Phase 1 통합 ADR(예: `design-system-v3-token-migration`) 본문에 hover 결정도 함께 기재 예정.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06 (initial review)
- **결론**: CHANGE_REQUEST → 수용 후 진행
- **핵심 지적**:
  - 5체크 중 2·3·4 PASS, 1·5는 FAIL.
  - **체크 5 (Over-abstraction) FAIL**: `hover-outline-dark`는 repo 검색상 consumer 0건(YAGNI) + hover에서 `border-color` 변경이 Hover 3원칙 #3 ("hover에서 `border*` 명시 금지")과 충돌. 예외 정책 명시 없이 도입 시 가이드 일관성 훼손.
  - **체크 1 (Assumptions) FAIL**: hover-outline-dark의 예외 관계가 Assumptions에 누락.
  - 특수 플래그: `_effect.scss` shorthand Phase 3 deferral은 consumer 1건(SchoolGrid) 검증으로 타당. SKILL.md 중복 위험 없음(Phase 1은 색 의미, Phase 2는 3원칙·mixin 표).
- **반영 내용**:
  - `hover-outline-dark` mixin을 본 PR에서 제거 — 4 mixin → **3 mixin** 으로 축소.
  - §목표 / §Non-goals / §Success Criteria / §단계별 체크리스트 / §의사결정 로그에 결정과 사유 명시.
  - Phase 3에서 실제 다크 outline 버튼 consumer 발견 시 예외 정책과 함께 재도입.
- **재요청 여부**: 불필요. 단일 항목 국소 제거이며 BLOCK 수준 아님. WORK 진행.

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06 (post-implementation diff review)
- **결론**: FIX_APPLIED (Codex 직접 markdown 2건 수정)
- **수정 파일**: `.claude/skills/styles/SKILL.md` (markdown only, 2 lines)
- **핵심 지적**:
  - Mixin 시그니처 PASS — `hover-lift`의 transform=spring + box-shadow=default 분리 easing이 시각적으로 자연스러움.
  - `calc(-1 * #{$lift})` PASS — px 리터럴/spacing 토큰/CSS var 모두 정상.
  - Surgical change PASS — Transition 토큰 caveat 추가도 hover 시스템 핵심 원칙(`transition: all` 금지)과 직접 연결되어 in-scope.
  - **FIX 1**: 패턴별 mixin 매핑 표의 Featured/Dark CTA 행이 즉석 `rgba($gold-600, 0.3)` shadow를 권장하여 효과 토큰 우선 규칙과 충돌 → `$shadow-lg` 토큰으로 교체.
  - **FIX 2**: Card 사용 예시 주석이 base-level border와 hover border 금지를 혼동시킬 여지 → "base border는 허용. hover 안에서 border 관련 코드 작성 X"로 명확화.
- **남은 리스크**: 없음. SCSS `_mixins.scss`는 변경 없음. 두 fix 모두 markdown 가이드 정확도 향상이며 mixin 동작·소비자 코드에 영향 없음.

## Claude 2차 검증

- **검토 내용**: `git diff` 재확인 — `_mixins.scss` 50줄 추가(주석 9 + mixin 3개 41줄), `SKILL.md` 75줄 추가/수정. 추가 파일 0건. Codex가 직접 수정한 SKILL.md 2 라인(Featured shadow 토큰화 + Card 주석 명확화)도 의도와 일치 확인. mixin 3종은 시그니처·기본값·시맨틱 모두 연구 v2 + Phase 1 결정과 정합. `hover-lift`의 transform=spring·box-shadow=default 분리 easing은 의도된 시각적 차별화. Hover 3원칙(transition all 금지/shorthand 금지/border 금지)은 mixin 구현체 자체가 강제 — `hover-bg-shift`는 background-color만 transition, `hover-color-shift`는 color만 transition. SKILL.md `## Hover 시스템` + Transition caveat은 Phase 1 §Primary Action 노트와 시너지 — 명도 방향성과 mixin 사용을 한 자리에서 안내. 컴포넌트 변경 0건 — 외과적 변경 원칙 준수.
- **실행한 검증**: `yarn lint:styles` 0 errors ✅. `yarn build` 통과 ✅. `node scripts/verify-task.mjs design-system-v3-hover` 통과(필수 PASS, Knip 경고는 기존 부채, 로그 `logs/design-system-v3-hover/20260506-200018/`). `git diff --name-only` → `_mixins.scss`/`SKILL.md`/exec-plan 3 파일만 ✅. `_mixins.scss`가 `additionalData` 자동 주입 대상이므로 mixin 정의 파싱 오류면 빌드가 실패 — 통과는 곧 모든 모듈에서 mixin 사용 가능 의미.
- **최종 판단**: PASS — 커밋 가능. 사용자 승인 대기.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (2026-05-06 작성)

- 잘된 것:
  - **YAGNI 적용** — Codex가 `hover-outline-dark`를 consumer 0건 + 3원칙 충돌 위험으로 지적 → 수용. 실제 다크 outline 버튼 consumer가 발견될 Phase 3에서 예외 정책과 함께 도입하는 게 안전.
  - **Foundation-only scope 유지** — 60+ 컴포넌트 hover 위반은 Phase 3로 분리. 본 PR은 mixin 정의 + 가이드 회수만, 빌드/lint 영향 최소화.
  - **3원칙을 mixin이 강제** — `hover-bg-shift`/`-color-shift`는 단일 속성 transition + 단일 속성 hover. 컴포넌트가 mixin을 채택하기만 하면 3원칙이 자동으로 보장됨.
  - **SKILL.md SSOT 회수** — Hover 3원칙 + 패턴 표 + 사용 예시 + Transition caveat을 같은 자리에 배치. Phase 3 작업자가 어디를 봐야 할지 명확.
  - **Codex FIX_APPLIED 직접 활용** — markdown 정확도 fix(Featured shadow → 토큰화, Card 주석 명확화) 2건을 Codex가 직접 수정하고 Claude는 교차 확인만. 검토 비용 절감.

- 다음에 할 것 (Phase 3):
  - `node scripts/start-task.mjs design-system-v3-components` — 컴포넌트별 hover 위반 정리 + mixin 채택.
  - `_effect.scss` `$transition-base/spring/enter` shorthand의 `all` 정합화 — SchoolGrid 1건과 함께 동시 처리(전체 영향 1 컨슈머 + 모든 신규 컴포넌트 권고 변경).
  - 코드베이스에 산재한 `hover에 $primary-active 직접 사용` 패턴(예: Pagination, ConfirmModal) 정합화 — `$primary-hover` 사용으로 통일하여 다크 navy lift affordance 구조에 맞춤.
  - 다크 outline 버튼 consumer 발견 시 `hover-outline-dark` mixin 도입 — 3원칙 #3의 명시적 예외 정책과 함께 SKILL.md에 반영.
  - 하버 60+ 위반 일괄 정리: `:hover` 안의 `border*` 명시 제거, `background:` shorthand → `background-color:` 또는 mixin 채택.

- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
  - **컴포넌트별 hover 위반 60+ 건** — Phase 3가 next step이라 별도 트래커 등록 불필요.
  - **`_effect.scss` shorthand 토큰의 `all`** — Phase 3 범위. 이미 SKILL.md Transition 토큰 섹션에 caveat 추가.
  - **`hover-outline-dark` 부재** — 다크 outline 버튼 consumer 발생 시 도입 필요. Phase 3에서 트리거.
  - **`hover-lift`의 transform=spring + box-shadow=default 분리 easing** — 시각 검증 시 의도와 다른 느낌이면 단일 easing으로 통합 검토. 우선 의도된 디자인 결정으로 진행.

