---
name: harness-workflow
description: 기능 추가, 버그 수정, 리팩터링, 설계/정책 변경, PLAN Mode 시작, task-id/exec-plan/Codex 검증/verify-task/harness-gate 언급 시 이 저장소의 하네스 워크플로우를 적용할 때 사용
---

# 하네스 워크플로우

이 스킬은 작업을 `EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT` 순서로 진행하게 한다.

## 시작 판단

다음 중 하나면 이 스킬을 사용한다.

- 사용자가 기능 추가, 버그 수정, 리팩터링, 구조 변경을 요청한다.
- 사용자가 PLAN Mode, 계획부터, task-id, exec-plan, Codex 검증, verify-task, harness-gate를 언급한다.
- 변경이 여러 파일, 여러 단계, 레이어 경계, 라이브러리/정책, 검증 정책에 영향을 준다.

단순 typo, 한 줄 수정, rename은 PLAN을 생략할 수 있다. 그래도 EXPLORE와 VERIFY는 유지한다.

## 필수 로딩

먼저 다음을 읽는다.

1. `CLAUDE.md`
2. `docs/README.md`
3. 관련 코드
4. 작업 유형별 추가 skill
   - Supabase/cache/auth/action: `.claude/skills/supabase/SKILL.md`
   - SCSS/token/layout: `.claude/skills/styles/SKILL.md`
   - 파일 위치/구조: `.claude/skills/file-structure/SKILL.md`

## task-id

작업 시작 시 task-id를 확보한다.

- 사용자가 주면 그대로 사용한다.
- 없으면 짧은 영문 kebab-case task-id를 제안한다.
- slug 규칙: `^[a-z0-9][a-z0-9-]*$`

## 절차

### 1. EXPLORE

- 기존 코드, 문서, 패턴을 먼저 확인한다.
- 레이어 방향 `apis → services → actions → app`을 확인한다.
- 스타일 작업은 token/mixin 규칙을 확인한다.

### 2. PLAN

다단계 작업이면 실행한다.

```bash
node scripts/start-task.mjs <task-id>
```

생성된 `docs/exec-plans/active/<date>-<task-id>.md`에 목표, 접근법, 영향 파일, 체크리스트, DoD를 채운다.

### 3. CODEX_PLAN_REVIEW

구현 전 Codex 계획 검증을 요청한다. 질문은 영어로 작성하고 마지막에 `Respond in Korean.`을 붙인다.

Codex가 결론을 내기 전에 다음 5체크를 수행하도록 프롬프트에 포함한다.

1. 가정(Assumptions)이 명시되어 있는가?
2. 비목표(Non-goals)가 명시되어 있는가?
3. 변경 범위가 요청과 직접 연결되는가? (창발적 추가가 없는가)
4. 성공 기준(Success Criteria)과 검증 명령이 구체적인가?
5. 새 추상화·새 라이브러리·데이터 흐름 변경이 과한가? (없어야 정상)

Codex 결론은 `PASS`, `CHANGE_REQUEST`, `BLOCK` 중 하나로 해석한다.

- `PASS`: 구현 진행
- `CHANGE_REQUEST`: exec-plan 수정 후 구현 진행 (5체크 중 어느 하나라도 미충족이면 기본적으로 CHANGE_REQUEST)
- `BLOCK`: exec-plan 재작성 후 Codex 재요청 필수. 재요청도 BLOCK이면 사용자에게 에스컬레이션 — 최종 판단은 사용자가 내린다.

결과는 exec-plan의 `## Codex 계획 검증`에 기록한다.

### 4. WORK

- Claude Code가 구현한다.
- exec-plan 체크리스트를 진행하면서 갱신한다.
- 계획 밖 변경이 필요하면 먼저 exec-plan과 ADR 판단을 갱신한다.

### 5. CODEX_FIRST_PASS

구현 diff가 생기면 Codex 1차 검증을 요청한다.

Codex가 우선 확인할 항목:

- 버그·타입 오류·누락 guard·엣지 케이스
- 레이어 경계 위반
- **외과적 변경 (surgical changes)** — 변경된 각 파일이 현재 task와 직접 관련 있는가? 인접 코드 정리·포맷·이름 변경이 섞여 있는가? 이번 변경으로 생긴 unused import/변수만 제거되었고 기존 dead code는 보존되었는가? (인접 정리가 섞여 있으면 별도 작업 분리 요청)

Codex가 직접 수정 가능한 범위:

- 명백한 버그
- 타입 오류
- 누락 guard
- 검증 실패의 직접 원인인 국소 수정

Codex가 직접 수정하지 않고 Claude Code에 반환해야 하는 범위:

- 계획 변경
- 새 라이브러리
- 데이터 흐름 변경
- 인증/캐시/배포 정책 변경
- 여러 모듈 책임 경계 재설계
- 인접 코드 리팩터·포맷·이름 변경 등 외과적 변경 위반 (Claude Code가 별도 작업으로 처리)

결과는 exec-plan의 `## Codex 1차 검증`에 기록한다.

### 6. VERIFY

Claude Code가 2차 검증을 수행한다. 수행 항목: ESLint, stylelint, build, knip.

```bash
node scripts/verify-task.mjs <task-id>
```

결과는 `logs/<task-id>/<run-id>/`에 저장된다 (커밋 X — 로컬 증적).

실패 시 신규 회귀인지 기존 부채인지 `docs/tech-debt-tracker.md`와 대조한다. 원인 불명·반복 실패 시 Codex 분석 검토.

Codex가 1차 수정한 경우 Claude Code는 diff를 다시 읽고 의도·범위·검증 결과를 교차 확인한다. 결과는 exec-plan의 `## Claude 2차 검증`에 기록.

### 7. COMMIT / GATE

커밋 전 또는 merge/release 전에는 실행한다.

```bash
node scripts/harness-gate.mjs <task-id>
```

사용자 승인 없이 자동 커밋하지 않는다.

머지 후에는 실행한다.

```bash
node scripts/complete-task.mjs <task-id>
```

## ADR 판단

다음 변경은 exec-plan의 `## ADR 판단`에 필요 여부와 사유를 기록한다.

- `package.json`, `next.config.*`, `eslint.config.*`, `stylelint.config.*`, `tsconfig.json`
- `src/apis/`, `src/services/`, `src/actions/`, `src/lib/supabase/`
- `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.codex/`, `scripts/`
- `docs/ARCHITECTURE.md`, `docs/references/constraints.md`

영구 결정이면 실행한다.

```bash
node scripts/start-adr.mjs <slug>
node scripts/update-adr-index.mjs
```

일회성 판단이면 `ADR 판단`에 `불필요`와 사유를 남긴다.

## 최소 사용자 프롬프트 예시

```text
PLAN Mode로 <작업 내용> 진행해줘. task-id는 <slug>.
```

task-id가 없으면 먼저 제안하고 진행한다.
