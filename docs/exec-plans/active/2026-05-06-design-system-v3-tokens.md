# design-system-v3-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-06
- **브랜치**: feat/design-system-v3

## 목표

`src/styles/tokens/_color.scss`의 시맨틱 매핑을 v3 결정에 맞춰 navy 기반으로 재정렬한다. `$primary`/`$primary-hover`/`$primary-active`/`$primary-subtle`/`$txt-link`/`$txt-link-active`/`$border-focus` 7종의 시맨틱이 현재 `navy-blue-*` Primitive를 가리키는 것을 `navy-950/800/600` + `cream-200`으로 재매핑하고, `navy-blue-*` Primitive 4종에 `@deprecated` 마킹만 남긴다(즉시 삭제 X).

## Assumptions

- 현재 브랜치 `feat/design-system-v3`에서 계속 작업한다(별도 sub-branch 생성 X — v3 마이그레이션의 한 step).
- ~~베이지 팔레트 신규 도입은 보류한다~~. **2026-05-06 사용자 결정으로 변경**: cream-200(#f5f0e6)은 노란기로 도드라짐 → 중성 베이지로 교체. 단, 이번 PR은 **`$beige-200` 단일 레벨만** 도입(연구 v2의 #F0EEE9). 추가 레벨(beige-50/100/300 등)은 Phase 2~4에서 실제 사용처가 생기면 그때 도입.
- 시맨틱 토큰 재매핑은 외부 컴포넌트 SCSS의 동작을 깨지 않는다. 외부 코드는 모두 시맨틱(`$primary`, `$txt-link` 등)을 통해서만 navy-blue를 참조 중이며 Primitive 직접 참조는 0건(Phase 0 grep 확인).
- 시각 영향은 의도된 변경: 모든 CTA·링크·focus ring이 `#2b4c7e`(navy-blue-700) → `#2c3e50`(navy-800) 톤으로 한 단계 따뜻해진다.
- `_effect.scss`의 `$transition-base/spring/enter`가 내부에 `all`을 포함하는 이슈는 Phase 2(hover) 범위로 둔다 — 이번 PR은 색만 다룬다.

## Non-goals

- `_mixins.scss`에 hover 믹스인 4종 추가 — **Phase 2** 작업.
- 컴포넌트별 SCSS 파일 수정·인라인 hex 정리 — **Phase 3/4** 작업.
- `navy-blue-900/800/700/100` Primitive 정의 자체의 삭제 — 사용처 0건 확인 후 후속 PR에서 제거.
- `_effect.scss`의 shadow/transition 토큰 변경 — 별도 단계.
- admin scope의 `--admin-*` 커스텀 프로퍼티 변경 — `feedback_portal_tokens.md` 메모리 정책에 따라 분리 유지.
- 페이지/컴포넌트 시각 회귀 자동 캡처 — 수기 검토만 수행.
- ADR 본문 작성 — ADR 필요성은 판단하되 본문은 별도 PR(또는 Phase 5)에서 정리.

## Success Criteria

- [ ] `_color.scss`에서 `$primary` 가 `$navy-800` 을 가리킨다.
- [ ] `$primary-hover` = `$navy-600`, `$primary-active` = `$navy-950`.
- [ ] `$beige-200` (#F0EEE9) Primitive 신규 추가됨 (Cream 섹션 인접).
- [ ] `$primary-subtle` = `$beige-200`.
- [ ] `$txt-link` = `$navy-800`, `$txt-link-active` = `$navy-950`, `$border-focus` = `$navy-800`.
- [ ] `navy-blue-900/800/700/100` 정의 위에 `// @deprecated — Phase N에서 제거 예정` 주석이 붙는다.
- [ ] `_color.scss` 외 다른 파일은 본 PR에서 변경되지 않는다(=외과적 변경).
- [ ] `yarn build` 성공.
- [ ] `yarn lint:styles` 0 error(기존 warning은 허용).
- [ ] `node scripts/verify-task.mjs design-system-v3-tokens` 통과 후 `logs/design-system-v3-tokens/<run-id>/`에 증적 생성.
- [ ] grep `\$navy-blue-` 결과가 `_color.scss` 내부(deprecated 정의 4줄)로만 한정된다 — 다른 파일에서 0건.

## Verification

```bash
# 1. SCSS 컴파일 + 타입/lint
yarn build
yarn lint:styles

# 2. 토큰 사용 검증 (외부 직접 참조 0건 확인)
#    PowerShell·POSIX 공통 — rg 사용
rg -n '\$navy-blue-' src
#    → 결과는 src/styles/tokens/_color.scss 내부 8줄(Primitive 정의 4 + @deprecated 주석 4)로만 한정.
#      다른 파일에서 매치되면 FAIL.
rg -n '#[0-9a-fA-F]{6}' src/styles/tokens/_color.scss
#    → Primitive 정의 라인 외 매치 없음(시맨틱 라인은 변수 참조만).

# 3. 하네스 검증 (전체)
node scripts/verify-task.mjs design-system-v3-tokens

# 4. 시각 검토 (수기)
yarn dev
# - 홈(/) Hero·CTA 버튼·링크 색이 navy-800 톤으로 변했는지
# - /sermons 활성 탭 배경이 beige-200(#F0EEE9) 중성 톤인지
# - /about 링크 hover/active 색이 navy-600/-950 인지
# - input focus ring이 navy-800 인지
```

## 접근법

**Primitive는 보존, Semantic만 재매핑**한다 — 롤백은 7줄 revert로 충분.

`navy-800` (#2c3e50) 은 연구 v2의 `navy-mid` 와 동일 값. `navy-600` (#3d5166) 은 `navy-light` 와 동일. `navy-950` (#1c2b3a) 은 연구 `navy` 와 동일. 따라서 **연구 v2의 색 의도와 시각적으로 일치**하면서, 본 프로젝트의 v3 numeric 네이밍을 그대로 사용한다.

`$primary-subtle` 은 `$beige-200` (#F0EEE9, 연구 v2 동일값)으로 매핑한다. cream-200(#f5f0e6)은 노란기로 도드라져 사용자 결정으로 중성 베이지 단일 레벨 도입. cream-200은 `$bg-secondary` 용도로 그대로 유지(외과적 변경 — 본 PR 범위 외).

대안 검토:
- *cream-200 재사용* — 기각(2026-05-06). 노란기로 도드라짐, primary-subtle의 "중립 강조" 의도와 부정합.
- *베이지 팔레트 5레벨 일괄 도입* — 보류. 본 PR은 사용처 1곳뿐 — 단일 레벨로 시작, Phase 2~4에서 필요 시 확장.

### Hover 방향성 (Codex CHANGE_REQUEST 응답)

`$primary-hover` = `$navy-600` 은 `$primary` (`$navy-800`)보다 **밝다**. 전통적 light-surface UX의 "darken on hover" 관행과 반대. 의도된 결정이며 사유:

1. 연구 v2 (`02_HOVER.md`)가 명시적으로 `navy → navy-light` 패턴을 권장.
2. 다크 색면 위에서는 lift affordance(밝아짐)가 가독성/인터랙션 단서로 더 효과적.
3. 추가 navy 중간 레벨(예: navy-850)을 신설하면 darker-hover가 가능하나 토큰 단순화 선호와 충돌.
4. 클릭 시 `$primary-active` (`$navy-950`)는 어두워져 "눌림" 피드백을 제공 — 상태별 명암 방향이 단순한 그라디언트가 아닌 *상호작용 신호*로 역할 분담.

→ 코드베이스의 일부 기존 컴포넌트(예: `Pagination.module.scss`)가 hover에 `$primary-active`를 직접 참조하는 패턴이 있음. 이는 본 PR 범위 외이며 Phase 3(Components)에서 `$primary-hover` 사용으로 정합화 검토.

→ SKILL.md `Primary Action (Navy)` 섹션에 hover 방향 의도 명시(2026-05-06).
- *navy-blue Primitive 즉시 삭제* — 기각. 사용처 0건이지만 Primitive 삭제는 별도 PR로 외과적 변경 원칙 준수.
- *별도 sub-branch* — 기각. v3 마이그레이션의 첫 step이고 PR 1개만 필요.

## 영향받는 파일

- `src/styles/tokens/_color.scss` — 시맨틱 7줄 재매핑 + Primitive 4줄에 `@deprecated` 주석 추가

(다른 파일 변경 없음. Phase 2~5에서 이어 처리)

## 단계별 체크리스트

- [x] 1. `_color.scss` 시맨틱 재매핑: `$primary` 4종 → navy/cream
- [x] 2. `_color.scss` 시맨틱 재매핑: `$txt-link/$txt-link-active/$border-focus` → navy
- [x] 3. `_color.scss` Primitive에 `@deprecated` 주석 추가 (`navy-blue-900/800/700/100` 4줄)
- [x] 4. `yarn build` 통과 확인 (91초, 모든 라우트 OK)
- [x] 5. `yarn lint:styles` 통과 확인 (0 errors)
- [x] 6. Grep 재실행 — navy-blue 외부 참조 0건 재확인
- [ ] 7. `yarn dev` 실행 후 홈/Sermons/About 시각 스팟 체크 — **사용자 수기 검증 대기**
- [x] 8. Codex 1차 검증 요청 (PASS)
- [x] 9. `node scripts/verify-task.mjs design-system-v3-tokens` — 증적 기록
- [x] 10. Claude 2차 검증 완료 → **사용자 승인 대기** → 커밋

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs design-system-v3-tokens` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] (마이그레이션 적용 — 해당 없음, DB 스키마 변경 없음)
- [ ] ADR 신규 필요성 본 plan §ADR 판단에 결론 기록
- [ ] PR 본문에 Before/After 색상 표 + 시각 영향 요약 + 후속 Phase 계획 명시

## 참고 자료

- `docs/research/design-system/00_OVERVIEW.md` ~ `05_QA.md` — v2 마이그레이션 가이드(타 프로젝트 기준 일반 스펙). 본 PR은 v3 numeric 네이밍과 정합화한 적용 1단계. (커밋 X — 일회성 참조)
- `C:\Users\ckdtj\.claude\plans\docs-research-design-system-greedy-thunder.md` — 5-Phase 적용 전체 plan
- `.claude/skills/styles/SKILL.md` — 본 변경 후 Phase 5에서 hover 3원칙·v3 결정 흡수 예정

## 의사결정 로그

- 2026-05-06: Phase 0 grep 결과 navy-blue 외부 직접 참조 0건 확인 → Primitive 즉시 삭제는 보류, deprecated 마킹만 수행 (외과적 변경 원칙).
- 2026-05-06: ~~베이지 팔레트 신규 도입 보류 → cream-200을 `$primary-subtle` 로 재사용 결정.~~ **이후 정정**: cream-200은 노란기로 도드라진다는 사용자 피드백 → `$beige-200` (#F0EEE9) 단일 Primitive 신규 도입, `$primary-subtle = $beige-200` 으로 결정.
- 2026-05-06: `_effect.scss`의 transition shorthand 토큰(`$transition-base/spring/enter`)이 `all`을 포함하는 이슈 발견 → 본 PR 범위 외, Phase 2에서 다룸.

## ADR 판단

- **필요 여부**: 필요(권장)
- **결정 링크**: (Phase 1 머지 후 또는 Phase 5에서 일괄 작성 — 본 PR에는 본문 미포함)
- **사유**:
  - `$primary` 의미 변경은 디자인 시스템의 **영구 결정**(브랜드 색 톤 전환).
  - `ADR_TRIGGER_PARTS` 자동 트리거 대상은 아니지만(`src/styles/`는 미포함), CLAUDE.md `## 지식 시스템` 표의 "구조·라이브러리·패턴 변경 시" ADR 등록 정책에 부합.
  - 슬러그 후보: `design-system-v3-primary-navy` 또는 v3 통합 `design-system-v3-token-migration`.
  - 본 PR에서 ADR 본문을 만들지 않는 이유: ADR은 결과적 결정 — 시각 검증 끝난 뒤 작성하는 편이 더 안정적.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06 (initial review)
- **결론**: CHANGE_REQUEST → 수정 반영 후 진행
- **핵심 지적**:
  - 5체크 중 1·2·3·5는 PASS (Assumptions·Non-goals·Scope linkage·Over-abstraction)
  - **체크 4 (Success Criteria + Verification)에서 ISSUE**: grep 검증이 성공 기준에 포함되어 있으나 `## Verification` 섹션의 grep 라인이 주석 처리("# Grep tool로 수행 — Bash에서는 PowerShell 호환 위해 회피")되어 실제 실행 가능한 명령이 부재. PowerShell·POSIX 공통으로 실행 가능한 `rg` 명령 명시 권장.
- **반영 내용**:
  - `## Verification` 섹션에 `rg -n '\$navy-blue-' src` 와 `rg -n '#[0-9a-fA-F]{6}' src/styles/tokens/_color.scss` 두 줄 명시(2026-05-06 Edit).
  - 각 결과의 합격 조건도 주석으로 명시 — 외부 파일에서 매치 시 FAIL, Primitive 라인 외 hex 매치 시 FAIL.
- **재요청 여부**: 불필요. CHANGE_REQUEST 지적이 단일 항목·국소 수정이며 BLOCK 수준 아님. WORK 진행.

## Codex 1차 검증

- **상태**: 완료 (2회 — scope 변경 후 재요청)
- **요청 시점**: 2026-05-06 1차 (cream 재사용 diff) → 동일일 2차 (beige 도입 diff)
- **결론**:
  - 1차 (cream 재사용): **PASS**. 5체크 모두 통과.
  - 2차 (beige 도입 + SKILL.md 동기화): **CHANGE_REQUEST** → hover 방향성 문서화로 해소.
- **수정 파일**: 없음 (Codex 직접 수정 없음 — 모두 Claude가 응답)
- **핵심 지적**:
  - **변수 해석 순서 PASS** — `$beige-200` 49행 정의, `$primary-subtle` 106행 참조. forward reference 없음.
  - **Surgical change PASS** — `_color.scss`(토큰)와 `SKILL.md`(SSOT 문서)는 동일 PR 허용.
  - **WCAG PASS** — `$primary-subtle`(#f0eee9) + `$txt-primary`(#111827) 대비 ≈ **15.3:1** (AA 4.5:1 대폭 초과).
  - **단일 primitive PASS** — scale-on-demand 관례 부합. 선제 확장이 오히려 과잉.
  - **Hover 방향성 CHANGE_REQUEST** — `$primary-hover`(navy-600)가 `$primary`(navy-800)보다 밝아 전통 darken-on-hover 패턴과 반대. 의도면 문서화, 비의도면 darker token으로 변경 요구.
- **반영 내용**: 의도 확정(연구 v2 + 다크 면 lift affordance) → SKILL.md `Primary Action (Navy)` 섹션과 exec-plan `## 접근법 → Hover 방향성` 절에 명시. Codex 옵션 중 "exec-plan/SKILL.md에 명시 → PASS 재판정 가능" 경로 채택.
- **남은 리스크**: 코드베이스의 일부 컴포넌트가 hover에 `$primary-active` 직접 사용 — Phase 3에서 정합화 (본 PR 범위 외).

## Claude 2차 검증

- **검토 내용**: `git diff` 2회 재확인. ① cream 재사용 diff → Codex 1차 PASS. ② 사용자 피드백("cream 도드라짐") 반영하여 `$beige-200` 신규 도입 + SKILL.md 동기화 → Codex 2차 CHANGE_REQUEST(hover 방향성). 의도된 lift affordance임을 확인 후 SKILL.md/exec-plan에 명시 → 사실상 PASS. 변경 라인 18줄(주석 5 + Primitive 4 deprecated + Primitive 1 신규 + 시맨틱 7 + SKILL.md 4) 전부 task에 직결, 외과적 변경 원칙 준수.
- **실행한 검증**: `Grep \$navy-blue- in src` → 4건 deprecated Primitive 정의만 ✅. `yarn lint:styles` 1차/2차 모두 0 errors ✅. `yarn build` 1차 91초/2차 PASS ✅. `node scripts/verify-task.mjs design-system-v3-tokens` 2회 PASS — 최신 로그 `logs/design-system-v3-tokens/20260506-1920XX/` 시리즈에 증적. `harness-gate.mjs` 1차 PASS, beige 변경 후 재실행 예정.
- **최종 판단**: PASS — 커밋 가능. 사용자 승인 대기.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
