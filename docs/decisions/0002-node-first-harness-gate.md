# 0002 — Node-first 하네스 자동화와 merge/release gate 채택

- **Status**: Accepted
- **Date**: 2026-05-01
- **Deciders**: 프로젝트 오너
- **Tags**: harness-engineering, automation, verification, workflow

## Context

하네스 구축 과정에서 `.mjs` Hook과 `.sh` workflow script가 동시에 존재했다.
초기에는 shell script가 단순해 보였지만, 실제 운영 요구가 늘어나면서 다음 문제가 생겼다.

- Windows + PowerShell 환경에서 Git Bash와 shell pipe가 불안정했다.
- Hook은 Claude Code 입력/출력 JSON을 다루기 때문에 이미 Node.js 기반이었다.
- `verify-task`는 logs, manifest, diff hash, per-step output 등 구조화 데이터 처리가 필요했다.
- 검증과 기록을 강제하려면 shell 문자열 처리보다 Node의 파일/JSON/process API가 더 안전했다.
- pre-commit을 곧바로 hard block으로 만들면 feature 작업 중 흐름이 자주 끊길 수 있었다.

이 결정을 미루면 발생하는 비용:

- 자동화 스크립트 런타임이 분산되어 유지보수 비용이 증가한다.
- Windows 로컬 환경에서 검증 스크립트가 빈 로그 또는 실행 실패를 만들 수 있다.
- 검증 증적과 exec-plan 협업 기록이 merge 전에 실제로 확인되지 않을 수 있다.

## Decision

workflow 자동화의 실제 로직은 Node.js `.mjs`로 통일한다.

삭제된 shell script:

- `scripts/start-task.sh`
- `scripts/complete-task.sh`
- `scripts/verify-task.sh`
- `scripts/enforce-verification.sh`
- `scripts/prevent-main-src-commit.sh`
- `scripts/start-adr.sh`
- `scripts/update-adr-index.sh`

채택한 Node script:

- `scripts/start-task.mjs`
- `scripts/complete-task.mjs`
- `scripts/verify-task.mjs`
- `scripts/enforce-verification.mjs`
- `scripts/prevent-main-src-commit.mjs`
- `scripts/start-adr.mjs`
- `scripts/update-adr-index.mjs`
- `scripts/harness-gate.mjs`

검증 운영은 두 단계로 나눈다.

1. 개발 중: Hook과 pre-commit은 경고 중심으로 빠르게 피드백한다.
2. merge/release 전: `node scripts/harness-gate.mjs <task-id>`가 검증 증적, exec-plan 협업 기록, ADR 판단을 hard gate로 확인한다.

## Consequences

### 긍정적

- Node.js, JSON, 파일 경로, child process 처리로 자동화 런타임이 통일된다.
- Windows 환경에서 shell 호환성 비용을 줄인다.
- `verify-task.mjs`가 `logs/<task-id>/<run-id>/` 증적과 `latest.json` pointer를 안정적으로 생성한다.
- `harness-gate.mjs`로 merge/release 전 검증 누락, Codex/Claude 검증 기록 누락, ADR 판단 누락을 차단할 수 있다.
- package script와 Hook script가 같은 런타임을 공유한다.

### 부정적 / 트레이드오프

- POSIX shell만으로 실행 가능한 단순성은 사라진다.
- Node.js가 workflow script의 필수 런타임이 된다.
- 기존 `bash scripts/*.sh` 명령을 사용하던 습관은 모두 `node scripts/*.mjs`로 바꿔야 한다.
- `harness-gate`가 제대로 작동하려면 exec-plan 섹션을 사람이 채워야 한다. Codex 응답 자동 기록은 아직 없다.

### 영향 범위

- 코드: `scripts/*.mjs`, `.husky/pre-commit`, `package.json`
- 문서: `CLAUDE.md`, `AGENTS.md`, `scripts/README.md`, `docs/exec-plans/_template.md`
- 운영: merge/release 전 `harness-gate` 실행이 표준 절차가 된다.

## Alternatives Considered

### A안: `.sh` 유지

- 장점: 기존 명령 유지, 간단한 shell 작업에는 빠름
- 사유로 기각: Windows + PowerShell 환경에서 Git Bash/pipe 안정성이 낮고, logs/manifest/diff hash 같은 구조화 처리가 커질수록 유지보수 비용이 증가한다.

### B안: `.mjs`와 `.sh` wrapper 혼합

- 장점: 기존 명령 호환 가능
- 사유로 기각: 사용자가 우려한 “혼재”가 계속 남는다. 실제 로직은 Node로 통일하면서 진입점까지 Node로 맞추는 편이 더 명확하다.

### C안: pre-commit에서 즉시 hard enforce

- 장점: 검증 누락을 가장 빨리 차단
- 사유로 기각: 도입 초기에 작업 흐름을 과도하게 끊을 수 있다. feature 개발 중은 경고, merge/release 전은 hard gate로 나누는 방식이 운영 리스크가 낮다.

### D안: baseline 모드 도입

- 장점: 기존 부채가 있어도 신규 회귀만 차단 가능
- 사유로 기각: 현재는 hard failure 10건을 정리해 baseline 없이 PASS 가능 상태를 만들 수 있었다. baseline은 부채 고착 위험이 있으므로 현 단계에서는 도입하지 않는다.

## References

- 관련 ADR: [0001 — Codex 오케스트레이션 전략 채택](0001-codex-orchestration-strategy.md)
- 관련 exec-plan: [harness-engineering-dogfood](../exec-plans/completed/2026-05-01-harness-engineering-dogfood.md)
- 검증 증적: `logs/verification-cleanup/20260501-194612/summary.log`
