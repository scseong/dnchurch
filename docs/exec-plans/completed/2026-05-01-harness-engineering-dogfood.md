# harness-engineering-dogfood

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering

## 목표

이번 하네스 구축 변경 자체를 하네스 워크플로우로 회수한다.
Claude Code 오케스트레이터 / Codex 서브 에이전트 분업, Node-first 자동화, 검증 증적, ADR 판단, merge/release gate를 exec-plan과 ADR에 기록해 이후 작업의 기준선으로 삼는다.

## 접근법

이미 적용된 하네스 변경을 하나의 dogfood 작업으로 정리한다.
영구 정책 결정은 ADR 0002로 승격하고, 작업 단위 판단과 검증 결과는 본 EXEC_PLAN에 남긴다.

## 영향받는 파일

- `CLAUDE.md`
- `AGENTS.md`
- `.codex/skills/context-loader/SKILL.md`
- `.claude/settings.json`
- `.claude/hooks/*.mjs`
- `scripts/*.mjs`
- `scripts/README.md`
- `docs/exec-plans/_template.md`
- `.claude/skills/harness-workflow/SKILL.md`
- `docs/decisions/0002-node-first-harness-gate.md`
- `docs/decisions/README.md`
- `src/**` React Compiler lint debt cleanup files

## 단계별 체크리스트

- [x] 1. Claude Code / Codex 역할 분리를 `CLAUDE.md`, `AGENTS.md`, `.codex/skills/context-loader/`에 반영
- [x] 2. Claude 계획 → Codex 계획 검증 → Claude 구현 → Codex 1차 검증 → Claude 2차 검증 흐름을 문서화
- [x] 3. 계획 후 Codex 제안, 구현 후 Codex 제안, ADR 제안 Hook 추가
- [x] 4. workflow scripts를 `.sh`에서 Node-first `.mjs`로 완전 전환
- [x] 5. `verify-task.mjs`가 Windows에서 Yarn을 안정적으로 실행하도록 보정
- [x] 6. React Compiler hard error 10건 제거
- [x] 7. `verify-task.mjs` PASS 증적 생성
- [x] 8. exec-plan에 ADR/Codex/Claude 검증 기록 섹션 추가
- [x] 9. `harness-gate.mjs` 추가로 merge/release 전 강제 확인 경로 생성
- [x] 10. Node-first + harness gate 정책을 ADR 0002로 기록
- [x] 11. 새 세션 진입을 단순화하기 위해 `.claude/skills/harness-workflow/` 추가
- [x] 12. 운영 문서 간 참조 정합성 점검 및 stale 항목 정리
- [x] 13. 최종 `node scripts/verify-task.mjs harness-engineering-dogfood` 실행
- [x] 14. 최종 `node scripts/harness-gate.mjs harness-engineering-dogfood` 실행

## 완료 기준 (DoD)

- [x] `node scripts/verify-task.mjs harness-engineering-dogfood` 통과
- [x] `node scripts/harness-gate.mjs harness-engineering-dogfood` 통과
- [x] 사용자 승인 후 커밋 전 하네스 산출물을 exec-plan에 기록
- [x] ADR 0002 작성 및 인덱스 갱신
- [ ] 머지 후 `node scripts/complete-task.mjs harness-engineering-dogfood` 실행 + 회고 작성

## 참고 자료

- [ADR 0001](../../decisions/0001-codex-orchestration-strategy.md) — Codex 오케스트레이션 전략 채택
- [ADR 0002](../../decisions/0002-node-first-harness-gate.md) — Node-first 하네스 자동화와 merge/release gate 채택
- `logs/verification-cleanup/20260501-194612/summary.log` — baseline 없이 PASS한 첫 검증 증적

## 의사결정 로그

- 2026-05-01: `.sh`와 `.mjs` 혼재를 해소하기 위해 workflow script를 Node-first로 완전 전환한다. Windows + PowerShell 환경에서 shell script 의존보다 Node 실행이 안정적이다.
- 2026-05-01: baseline 모드는 도입하지 않는다. 기존 hard error를 정리해 완전 검증 통과 상태를 먼저 만든다.
- 2026-05-01: Knip은 아직 warning-only로 유지한다. 미사용 코드 부채는 많지만 build/lint hard failure와 성격이 달라 별도 정리 대상으로 둔다.
- 2026-05-01: 개발 중 pre-commit은 warning 중심으로 유지하고, merge/release 직전에 `harness-gate.mjs`로 강제 확인한다.
- 2026-05-01: Codex 결과 자동 기록은 보류한다. 현재 단계에서는 Hook이 기록 위치를 안내하고 Claude Code가 exec-plan에 반영한다.
- 2026-05-01: 새 세션에서 긴 프롬프트를 반복하지 않도록 하네스 절차를 `.claude/skills/harness-workflow/`로 캡슐화한다. PLAN Mode는 일반 계획 모드일 뿐 하네스 절차 자동 적용을 보장하지 않으므로 skill 트리거를 추가한다.
- 2026-05-01: 변경 범위가 커져 운영 문서의 stale 참조를 점검했다. `TASK_ID` 환경변수 예시, verify-task baseline 부채, hooks orchestration 보류 사유를 현재 Node-first 하네스 상태에 맞게 정리한다.

## ADR 판단

- **필요 여부**: 필요
- **결정 링크**: [ADR 0002 — node first harness gate](../../decisions/0002-node-first-harness-gate.md)
- **사유**: workflow runtime, 검증 증적, merge/release gate, 협업 기록 강제 정책은 반복 운영 기준이므로 exec-plan 내부 판단을 넘어 영구 결정으로 남긴다.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 하네스 구축 방향 평가 및 적용 순서 결정 시점
- **결론**: PASS
- **핵심 지적**:
  - 역할 분리는 명확하지만 Codex 자동 호출은 아직 제안 기반이다.
  - 검증은 PASS 가능 상태가 되었으나 warning/Knip debt는 남아 있다.
  - 산출물 자동 생성은 exec-plan, ADR, logs 중심으로 구축됐지만 Codex 응답 자동 기록은 아직 없다.
- **반영 내용**:
  - exec-plan에 ADR/Codex/Claude 검증 섹션 추가
  - ADR 제안 Hook과 complete/harness gate 확인 추가
  - merge/release 전 강제 게이트 추가

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: Node-first 전환, verify-task 보정, gate 추가 이후
- **결론**: FIX_APPLIED
- **수정 파일**:
  - `scripts/verify-task.mjs`
  - `scripts/harness-gate.mjs`
  - `.claude/skills/harness-workflow/SKILL.md`
  - `.claude/hooks/check-adr-needed.mjs`
  - `.claude/hooks/check-codex-after-plan.mjs`
  - `docs/exec-plans/_template.md`
  - React Compiler lint error 대상 `src/**` 10개 파일
- **핵심 지적**:
  - Windows에서 Node가 `yarn.cmd/.ps1` shim을 직접 spawn하지 못해 검증 로그가 비어 있었다.
  - `react-hooks/set-state-in-effect` 10건이 완전 검증을 막고 있었다.
  - merge/release 전 hard gate가 없어 warning 기반 운영에 머무르고 있었다.
- **남은 리스크**:
  - ESLint warning 30개, stylelint warning 61개, Knip warning-only 부채가 남아 있다.
  - Codex 응답은 아직 자동 기록되지 않고 Claude Code가 exec-plan에 옮긴다.
  - CI/PR gate는 아직 로컬 스크립트 수준이다.

## Claude 2차 검증

- **검토 내용**: `verify-task.mjs` 실행, PASS manifest/diff hash 대조, Hook JSON 출력, `.claude/settings.json` 등록 상태, exec-plan 템플릿 섹션을 확인했다.
- **실행한 검증**: `scripts/` 및 `.claude/hooks/` 내 각 `.mjs` 파일 syntax 체크(`node --check <file>`), `node scripts/verify-task.mjs verification-cleanup`, `node scripts/enforce-verification.mjs verification-cleanup`, 최종 `node scripts/verify-task.mjs harness-engineering-dogfood`, 최종 `node scripts/harness-gate.mjs harness-engineering-dogfood`.
- **최종 판단**: 하네스 v1은 실사용 가능하다. 최종 dogfood 증적은 `logs/harness-engineering-dogfood/latest.json`이 가리키는 PASS 실행과 `harness-gate.mjs` 통과 결과를 기준으로 삼는다.

## 리뷰 (완료 직전)

- [x] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [x] **멀티 세션 리뷰**: 현재 Codex 세션에서 계획/구현/검증 관점으로 교차 확인했다. 별도 자동 Codex 호출은 아직 Hook 제안 단계다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: 하네스 v1 전체 사이클(exec-plan → Codex 계획 검증 → 구현 → 1차 검증 → verify-task → harness-gate → complete-task)을 실제 작업에 처음 적용하면서 구조 문제를 실시간으로 발견하고 수정했다. scripts/_shared-config.mjs(ADR SSOT), slugFromFilename 정확 매칭, clean-tree 검증 경로 등 핵심 신뢰성 문제가 이 dogfood 사이클에서 모두 식별·수정됐다.
- 다음에 할 것: CI gate(GitHub Actions) — 로컬 harness-gate와 동일한 검사를 PR merge 전에 강제한다(Work Unit C, 명시적으로 보류 중).
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): ESLint warning 30개 / stylelint warning 61개 / Knip unused export — 기존 등록 항목과 동일, 신규 없음.
