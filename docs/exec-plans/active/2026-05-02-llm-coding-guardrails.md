# llm-coding-guardrails

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-02
- **브랜치**: chore/llm-coding-guardrails (develop에서 분기, 2026-05-02)

## 목표

LLM(Claude/Codex)의 공통 코딩 실수(가정 누락·과추상화·인접 코드 오염·불명확한 성공 기준)를 줄이기 위해 Karpathy 스타일 4개 행동 가드레일을 이 저장소의 하네스(문서·템플릿·SKILL·hook) 4지점에 동시 주입한다. 결과적으로 PLAN 품질 상승, diff 범위 축소, 검증 누락 감소를 기대한다.

## 접근법

원문(`forrestchang/andrej-karpathy-skills/CLAUDE.md`)의 4개 원칙을 **그대로 복사하지 않고** 이 저장소 워크플로우(EXPLORE→...→COMMIT)에 흡수한다. 단순 문서 추가로 끝내지 않고 ① CLAUDE.md(상시 로딩) ② exec-plan 템플릿(작업 시작) ③ harness-workflow SKILL(워크플로우 진행) ④ Codex 관련 hook(자동 제안 메시지) 네 지점에 동기화한다. 한국어 톤·"지도" 철학을 유지한다.

기각 대안: (a) CLAUDE.md만 수정 — 강제력이 약해 효과 미미. (b) 영문 원문 그대로 삽입 — 기존 한국어 문서와 톤 불일치. (c) 별도 가이드 문서 신설 — "백과사전화 금지" 원칙 위배.

## 영향받는 파일

**1차 (Claude 진영, commit `7925557`):**
- `CLAUDE.md` — `## 행동 가드레일` 섹션 신규 (WHAT 다음, Workflow 앞)
- `docs/exec-plans/_template.md` — `## Assumptions`, `## Non-goals`, `## Success Criteria`, `## Verification` 4섹션 추가 (목표 다음)
- `.claude/skills/harness-workflow/SKILL.md` — CODEX_PLAN_REVIEW에 5체크 기준, CODEX_FIRST_PASS에 surgical changes 체크 추가
- `.claude/hooks/check-codex-after-plan.mjs` — 권장 Codex 요청 프롬프트에 5체크 반영
- `.claude/hooks/post-implementation-review.mjs` — 1차 검증 메시지에 surgical changes 체크 추가

**2차 (Codex 진영 거울 적용, 사용자 지적으로 추가):**
- `AGENTS.md` — `## 행동 가드레일` 섹션 신규 (CLAUDE.md와 동일 4원칙, 위치는 `프로젝트 요약` 다음)
- `.codex/skills/context-loader/SKILL.md` — `계획 검증` 섹션에 5체크 기준 추가, `구현 후 1차 검증` 섹션에 surgical changes 체크 추가

## 단계별 체크리스트

- [x] 1. CLAUDE.md에 `## 행동 가드레일` 섹션 추가 (4원칙: 코딩 전 사고 / 단순함 우선 / 외과적 변경 / 검증 가능한 목표) — verify: `yarn lint:styles` 영향 없음, `## Workflow` 위에 위치 확인
- [x] 2. `docs/exec-plans/_template.md`에 4섹션 추가 (Assumptions / Non-goals / Success Criteria / Verification) — verify: `node scripts/start-task.mjs <test-slug>` 으로 새 파일 생성 시 4섹션 포함 확인 후 테스트 파일 삭제
- [x] 3. `.claude/skills/harness-workflow/SKILL.md` CODEX_PLAN_REVIEW에 5체크 추가, CODEX_FIRST_PASS에 surgical changes 체크 추가 — verify: 두 섹션 모두 갱신 확인
- [x] 4. `.claude/hooks/check-codex-after-plan.mjs` 권장 프롬프트 5체크 반영 — verify: hook 메시지에 5체크 포함 확인
- [x] 5. `.claude/hooks/post-implementation-review.mjs` 메시지에 surgical changes 체크 추가 — verify: hook 메시지에 해당 문구 포함 확인
- [x] 6. `node scripts/verify-task.mjs llm-coding-guardrails` 실행 — verify: lint + lint:styles + build + knip 통과 (이번 변경은 .md/.mjs만이라 build 영향 없음 예상) → ✓ 필수 검증 통과 (run_id: 20260502-171033). knip/eslint 경고는 기존 부채(src/ 파일).
- [x] 7. (확장) `AGENTS.md`에 `## 행동 가드레일` 섹션 추가 — verify: `프로젝트 요약` 다음, `필수 규칙` 앞에 위치 확인. CLAUDE.md 4원칙과 동일 표현.
- [x] 8. (확장) `.codex/skills/context-loader/SKILL.md` `계획 검증` 섹션에 5체크 기준 추가 — verify: 결론 분류(`PASS`/`CHANGE_REQUEST`/`BLOCK`) 직전에 위치.
- [x] 9. (확장) `.codex/skills/context-loader/SKILL.md` `구현 후 1차 검증` 섹션에 surgical changes 체크 추가 — verify: 1번(레이어 경계) 다음에 surgical 체크 삽입, 분류 표현이 SKILL.md(harness-workflow)와 일치.
- [x] 10. (확장) `node scripts/verify-task.mjs llm-coding-guardrails` 재실행 — verify: 통과 (run_id: 20260502-172531). knip warning은 동일 기존 부채.

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs llm-coding-guardrails` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] (해당 없음) 마이그레이션
- [ ] ADR 판단 섹션 채움 — 본 변경은 ADR 0001(Codex 오케스트레이션) 운영 가이드 강화에 해당, 별도 ADR 불필요로 판단

## Assumptions

- Karpathy 4원칙은 이 저장소의 기존 워크플로우와 충돌하지 않는다 — EXPLORE/PLAN/VERIFY가 이미 같은 방향성을 갖는다.
- exec-plan 템플릿 변경은 기존 active/completed exec-plan에 소급 적용하지 않는다 — 신규 작업부터 적용된다.
- hook 메시지 변경은 동작 변경이 아니라 문구 강화 — JSON 스키마/exit code는 건드리지 않는다.
- 사용자는 한국어 톤·"지도" 철학을 유지하길 원한다 (이전 대화에서 합의).

## Non-goals

- 기존 active/completed exec-plan 소급 수정 — 이번 PR 범위 아님.
- ADR 신규 작성 — 운영 가이드 강화이며 새 아키텍처 결정 아님.
- 새 검증 명령 추가 — 기존 verify-task.mjs를 그대로 사용.
- harness-gate.mjs 게이트 강화 — 차후 가드레일 정착 결과 보고 결정.
- Codex CLI 동작 변경 — 메시지 문구만 강화, 호출 방식·결론 분류 변경 없음.

## Success Criteria

- CLAUDE.md `## 행동 가드레일` 섹션이 WHAT과 Workflow 사이에 위치하고, 4원칙이 모두 포함된다.
- `node scripts/start-task.mjs <slug>`로 생성된 새 exec-plan 파일이 Assumptions / Non-goals / Success Criteria / Verification 4섹션을 포함한다.
- harness-workflow SKILL.md의 CODEX_PLAN_REVIEW 섹션에 5체크 기준이 명시된다.
- harness-workflow SKILL.md의 CODEX_FIRST_PASS 섹션에 surgical changes 체크가 명시된다.
- 두 hook 메시지에 각각 5체크/surgical 문구가 포함된다.
- `verify-task.mjs llm-coding-guardrails`가 PASS로 종료된다.
- (확장) `AGENTS.md`에 `## 행동 가드레일` 섹션이 `프로젝트 요약` 다음에 위치하고, CLAUDE.md와 동일한 4원칙을 포함한다.
- (확장) `.codex/skills/context-loader/SKILL.md`의 `계획 검증`에 5체크가, `구현 후 1차 검증`에 surgical changes 체크가 명시된다.
- (확장) `verify-task.mjs llm-coding-guardrails` 재실행이 PASS로 종료된다.

## Verification

- `node scripts/verify-task.mjs llm-coding-guardrails` — lint + lint:styles + build + knip 통과.
- 수동: 임시 slug으로 `node scripts/start-task.mjs verify-template-temp` 실행 → 새 파일에 4섹션 존재 확인 → 임시 파일 삭제.
- 수동: 변경된 두 hook 파일을 grep으로 신규 문구 포함 여부 확인.
- 수동: CLAUDE.md 섹션 순서가 WHAT → 행동 가드레일 → Workflow 순인지 확인.

## 참고 자료

- `https://github.com/forrestchang/andrej-karpathy-skills/blob/main/CLAUDE.md` — 원문 4원칙 출처
- `docs/decisions/0001-codex-orchestration-strategy.md` — 본 가드레일이 강화하는 상위 결정

## 의사결정 로그

- 2026-05-02: 시작. 사용자 승인으로 1차 범위 #1+#2+#3+#4 (Codex 권고 항목) 진행.
- 2026-05-02: Codex PASS + 브랜치 분리 권고 → 사용자 승인으로 develop에서 `chore/llm-coding-guardrails` 분기 (실제 현재 위치는 develop이었음, 시스템 reminder가 stale). PR 이력 cohesion 확보.
- 2026-05-02: 1차 commit `7925557` 후 사용자 지적 — Codex는 CLAUDE.md를 읽지 않으므로 AGENTS.md/`.codex/skills/context-loader/SKILL.md` 동기화가 빠져 있었음. 참조: forrestchang/andrej-karpathy-skills PR #119 (Karpathy도 동일 4원칙을 별도 AGENTS.md로 분리). 사용자 승인으로 3파일 거울 적용 + Codex 재검증 추가.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: `docs/decisions/0001-codex-orchestration-strategy.md`
- **사유**: 본 변경은 ADR 0001(Codex 오케스트레이션 전략)의 운영 가이드라인을 강화하는 것이며, 새로운 아키텍처 방향·라이브러리·데이터 흐름 변경이 아니다. 가드레일 정착 결과(diff 범위 축소·재작업 빈도 감소 등)가 누적되면 별도 ADR로 승격 고려.

## Codex 계획 검증

- **상태**: 완료 — 1차 (fresh thread) + 거울 적용 확장 (resume thread)
- **요청 시점**: 2026-05-02 (1차) / 2026-05-02 (확장)
- **결론**: PASS (1차) / PASS (확장)
- **핵심 지적**:
  - (Risk 1) hook `.mjs` 파일은 실제 출력의 `additionalContext`, `hookSpecificOutput.additionalContext`, `continue`, `suppressOutput` JSON 계약을 그대로 유지해야 — diff 리뷰에서 반드시 확인.
  - (Risk 2) 템플릿 변경은 기존 active/completed plan에 소급 적용되지 않음을 Assumptions/Non-goals에 명시했으므로 충분. 단, 구현 diff에서 새 섹션이 "신규 작업에만 적용" 성격을 유지하도록 유의.
  - (Risk 3) `verify-task.mjs`가 doc/policy-only 변경에 비해 무거운 검증(build/knip 포함)이지만 하네스 원칙과 일치. 실패 시 기존 부채와 신규 회귀 분류 필요.
  - (Branch) `chore/llm-coding-guardrails`로 분리 권장. 현재 브랜치 이름·목적과 달라 리뷰 이력이 흐려짐. PR split은 불필요.
- **반영 내용**:
  - WORK 단계에서 hook .mjs 수정 시 기존 JSON 출력 키 보존을 self-check.
  - 브랜치 분리 결정은 사용자 승인 후 진행 (의사결정 로그에 기록).
  - (확장) AGENTS.md 삽입 위치 `프로젝트 요약` 다음/`필수 규칙` 앞이 맞음 — Codex 부트스트랩 흐름과 충돌 없음. context-loader SKILL.md 두 삽입 위치도 확인됨. 추가 Codex-discoverable 파일은 없음 (`.codex/`에 SKILL.md 1개만 존재). docs/README.md는 이번 범위에서 수정 불필요.

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-02
- **결론**: PASS
- **수정 파일**: 없음 (Codex 직접 수정 없음)
- **핵심 지적**:
  - Hook JSON contract(`continue`/`suppressOutput`/`additionalContext`/`hookSpecificOutput`) 그대로 유지됨 — 두 `.mjs` 모두 keys 변동 없음.
  - 변경 범위가 요청된 5파일에만 한정. active/completed exec-plan 파일은 미변경.
  - 4원칙(CLAUDE.md) ↔ 4섹션(template) ↔ 5체크(SKILL.md) ↔ hook 프롬프트 일관성 확인.
  - 기존 계획 소급 영향 없음 — 새 템플릿은 이후 생성 plan에만 적용.
- **남은 리스크**: 없음 (verify-task만 통과하면 머지 가능 상태).
- **검증 도구**: `git diff`, `rg`, `git diff --check`

## Claude 2차 검증

- **검토 내용**: 1차(Claude 진영) + 확장(Codex 진영 거울 적용)에 대한 외과적 변경·일관성·문구 대칭 교차 확인.
  - 5개 파일 diff 재확인 — 모두 계획 범위 내. 인접 코드/포맷/이름 변경 없음 (외과적 변경 준수).
  - Hook JSON contract 양쪽 모두 keys 변동 없이 메시지 문자열만 확장 — Codex 1차 검증과 일치.
  - 임시 slug `verify-template-temp`로 신규 exec-plan 생성 시 4개 신규 섹션(Assumptions/Non-goals/Success Criteria/Verification) 정상 출력 확인 후 임시 파일 삭제.
  - 4원칙(CLAUDE.md) ↔ 4섹션(template) ↔ 5체크(SKILL+hook) ↔ surgical(SKILL+hook) 일관성 ✓.
  - **(확장)** AGENTS.md 4원칙이 CLAUDE.md와 동일 표현 사용 — 문구 대칭 확인. 위치: `프로젝트 요약` 다음/`필수 규칙` 앞 (Codex 부트스트랩 흐름 적합).
  - **(확장)** context-loader SKILL.md `계획 검증` 5체크 — harness-workflow SKILL.md의 표현과 동일 5문구. `구현 후 1차 검증` surgical 체크 — harness-workflow SKILL.md `CODEX_FIRST_PASS`의 surgical 표현과 동일 분류 어휘.
- **실행한 검증**: `verify-task.mjs` 2회 통과 + `git diff --stat` 두 commit 모두 확인 + 수동 grep.
  - 1차: `verify-task.mjs llm-coding-guardrails` (run_id: 20260502-171033) → ✓ 통과. 5 files, +57/-4.
  - 확장: `verify-task.mjs llm-coding-guardrails` (run_id: 20260502-172531) → ✓ 통과. 추가 3 files (exec-plan 포함), +40/-8.
  - 수동: 신규 템플릿 생성 검증, hook 메시지 grep, AGENTS.md/context-loader 위치/표현 점검.
- **최종 판단**: PASS. 머지 가능. 사용자 승인 후 2차 커밋.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
