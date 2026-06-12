# pr-author-trigger

- **상태**: ✅ 완료 (2026-05-30)
- **시작일**: 2026-05-29
- **브랜치**: refactor/harness-engineering
- **Open questions**: none
- **ADR needed**: no — writer-agents(2026-05-28)의 PR 트리거 사각지대 보완. 신규 영구 결정 없음, 같은 패턴 적용.

## 목표

PR 본문 작성 시점에 commit-pr-author·writing-style 트리거가 약한 문제를 3 계층 방어로 강화. `gh pr create` Bash 호출 시 reminder hook + claude-code 협업 매트릭스에 호출 의무 선언 + harness-workflow SKILL COMMIT 단계에 명시.

## 검증된 Assumptions

- writer-agents task 직후 PR 트리거 사각지대 사용자 지적 — `.md` 파일은 `check-doc-style.mjs` hook으로 잡히지만 `gh pr create` 시점엔 hook 없음
- 기존 hook 6개 모두 PostToolUse 이벤트 — PreToolUse는 본 task가 첫 사용 (`.claude/settings.json` 확인)
- `gh pr create`는 일반적으로 Claude가 Bash 도구로 호출 — PreToolUse:Bash matcher로 잡힘
- 한계: 사용자가 직접 터미널에서 `gh pr create` 실행하면 어떤 hook도 작동 안 함 (인간 행동 영역)

## Success Criteria

- `.claude/hooks/check-pr-before-create.mjs` 신규 — PreToolUse:Bash matcher, command에 `gh pr create` 패턴 매칭 시 reminder
- `.claude/settings.json` PreToolUse 블록 신설 + hook 1 항목 등록
- `.claude/agents/claude-code.md` 협업 매트릭스 또는 별도 섹션에 "PR 생성 요청 시 commit-pr-author 호출은 의무" 1줄 추가
- `.claude/skills/harness-workflow/SKILL.md` `### 7. COMMIT / GATE` 단계에 "PR 생성 직전 commit-pr-author 호출" 명시
- `node scripts/verify-task.mjs pr-author-trigger` 통과

## Non-goals

- 사용자가 직접 터미널에서 실행하는 `gh pr create`에 강제 적용 — 인간 행동 영역, 시스템 강제 불가
- GitHub Actions PR 본문 검증 추가 — 별도 task
- description 키워드 확장(C 옵션) — A+B+D 적용 후 효과 측정 후 결정

## 영향받는 파일

- `.claude/hooks/check-pr-before-create.mjs` (신규)
- `.claude/settings.json` (PreToolUse 블록 신설 + hook 등록)
- `.claude/agents/claude-code.md` (PR 생성 의무 1줄)
- `.claude/skills/harness-workflow/SKILL.md` (COMMIT 단계 명시)
- `CLAUDE.md` (하네스 변경 이력 1행)
- `docs/exec-plans/active/2026-05-29-pr-author-trigger.md` (본 문서)

## 단계별 체크리스트

- [x] 1. 사용자 본질 지적 + 옵션 정리 → A+B+D 결정
- [x] 2. exec-plan 작성
- [x] 3. `check-pr-before-create.mjs` hook 작성 (PreToolUse:Bash + `gh pr create` 패턴 + 5분 debounce)
- [x] 4. `.claude/settings.json` PreToolUse 블록 신설 + hook 등록
- [x] 5. `claude-code.md` PR 생성 의무 1줄 (의무 + 적용 불가 영역 명시)
- [x] 6. `harness-workflow` SKILL COMMIT 단계 명시 (호출 순서 + hook 참조)
- [x] 7. CLAUDE.md 변경 이력 1행
- [x] 8. 구조 검증 + verify-task 통과 (lint/styles/build)
- [ ] 9. 사용자 승인 → 커밋

## 의사결정 로그

- **D2 — hook 정규식을 첫 줄로 한정 (자기 자신 dogfood로 오탐 발견)**
  - 문제: 본 task의 첫 commit 직후 hook이 발화. commit 메시지 본문(heredoc)에 `gh pr create` 문자열이 포함되어 있어 정규식이 매칭됨. 실제 명령은 `git commit`인데도 hook이 잘못 잡음 (오탐).
  - 해결: `command.split("\n")[0]`로 첫 줄만 검사. heredoc 본문은 newline 이후라 첫 줄만 보면 실제 명령 의도 확인 가능. 이유 — Bash 명령은 항상 첫 줄에 위치, heredoc 본문은 명령이 아니라 데이터. 대안 "정규식 강화(`^\s*gh\s+...`)"는 명령 prefix(`env VAR=x gh ...` 등)와 충돌 가능. 첫 줄만 검사가 가장 단순·안전.
  - 결과: hook 1줄 추가 (firstLine 추출). 자기 자신 dogfood로 즉시 결함 발견·수정.

- **D1 — A+B+D 3 계층 조합 채택, C(description 강화) 보류**
  - 문제: PR 본문 작성 시점에 writing-style·commit-pr-author 자동 트리거 보장 약함. hook은 PostToolUse:Write|Edit|MultiEdit만 있어 `gh pr create` 시점은 사각지대.
  - 해결: A(PreToolUse:Bash hook 결정적 reminder) + B(claude-code 정의 호출 의무) + D(harness-workflow SKILL 단계 명시) 3 계층. 이유 — A 단독은 claude-code가 reminder 무시 시 명시 조항 없어 약함. B·D만은 권고에 그쳐 LLM 판단에 의존. 3 계층 결합이 결정적 알림 + 워크플로우 강제 + 표준 단계로 만들어 누락을 차단. 대안 C(description 키워드 확장)는 자동 트리거 LLM 판단 영역이라 보장 약함 — A·B·D 효과 측정 후 결정.
  - 결과: hook 1개 + 정의 1줄 + SKILL 1줄 + CLAUDE.md 변경 이력 1행. 총 변경 분량 작음.

## ADR 판단

`.claude/hooks/`·`.claude/settings.json`·`.claude/skills/`·`.claude/agents/`·`CLAUDE.md` 변경 — ADR_TRIGGER_PARTS 해당. 그러나 writer-agents(2026-05-28) 후속 보강이라 신규 영구 결정 없음 → ADR 불필요.

## Verification

- `node scripts/verify-task.mjs pr-author-trigger`
- 수동: PreToolUse 등록 형식 확인 (`.claude/settings.json` 구조)

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG — D1으로 계획 검증 생략 결정 (단순 hook 1개 + 정의 1줄 + SKILL 1줄 변경, 본질적 결정은 사용자 라운드에서 완료)
- **현재 판단**: D1에 결정 근거 기록. Codex 호출 ROI 낮음.
- **다음 행동**: 구현 diff 생성 후 Codex 1차 검증 호출 (D1 통합)

## Codex 1차 검증

- **결론**: PASS — D1으로 계획+1차 통합 호출 결정 (단순 hook 1개 + 정의·SKILL 1줄씩 변경이라 별도 1차 검증 ROI 낮음)
- **현재 판단**: 본 task의 변경 위험 작음 — 자기 dogfood로 hook 오탐 즉시 발견·hot fix(`a3e1984`)로 입증
- **다음 행동**: 사용자 승인 → 커밋
- **⚠️ 정정 (PR #104 후속)**: 기존 verdict `PASS_WITH_DECISION_LOG` → `PASS` — `scripts/harness-gate.mjs`의 1차 검증 허용 토큰(`PASS / FIX_APPLIED / CHANGE_REQUEST / BLOCK`)과 정합. 1차 검증에 `PASS_WITH_DECISION_LOG`를 도입하는 정책 통일(옵션 B)은 별도 task로 분리.

## Claude 2차 검증

- **최종 판단**: PASS — 구조 검증 + verify-task 통과
- **현재 판단**: 6 파일 변경 모두 task 의도(PR 트리거 3 계층 방어)와 직접 연결. PreToolUse:Bash matcher 신규 사용이지만 기존 PostToolUse 패턴과 같은 구조라 회귀 위험 0. 한계는 사용자 직접 터미널 실행만 — Non-goals에 명시.
- **다음 행동**: 사용자 승인 → 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260529-001126 | ✅ | ✅ | ✅ | 0 | — |

## 회고

### 잘 된 것
- PR 생성 시점 사각지대(`gh pr create`는 PostToolUse hook 못 잡음) 사용자가 정확히 짚음 → A+B+D 3 계층 방어 도입.
- 자기 dogfood로 hook 결함 즉시 발견·hot fix(`a3e1984`) — hook 첫 발화에서 commit 메시지 본문에 트리거 문자열 우연 포함 → 첫 줄만 검사로 1줄 수정. 자기 자신을 검증한 실제 사례.
- 본 PR 생성 자체(PR #104) 시점에 check-pr-before-create hook이 정확히 발화 — Test plan #3 자동 통과.

### 예상 못한 발견
- 본 task가 만든 hook이 실제로 `gh pr create`를 **차단하지 못한다는 사실**이 PR #104 Codex 리뷰(C1)에서 발견. `permissionDecision` 누락 — `additionalContext`만으로는 Bash 실행 그대로. PR의 핵심 정책("PR 생성 전 commit-pr-author 호출 의무")이 작동 안 했음.
- 본 task 머지 전에 C1 수정(`permissionDecision: "ask"` 추가)으로 핵심 정책 실효 확보 — 만약 PR 리뷰 안 받았으면 머지 후에도 reminder만 띄우는 무력한 hook으로 남았을 것.

### 후속 관찰 시점·항목
- `permissionDecision: "ask"` 적용 후 사용자가 매번 확인 받는 흐름이 노이즈인지 균형인지 관찰. 노이즈면 deny로 강화 또는 매처 정밀화.
- PreToolUse:Bash hook의 누적 비용(#13 후속) — 매 Bash 호출마다 5초 timeout 실행. 본 저장소 Bash 호출 빈도 데이터 수집 필요.

### 본 task의 본질
"hook이 reminder만 출력하고 실행 차단 못 함"이라는 메커니즘적 결함이 본 task 머지 전 PR 리뷰로 발견됨. 본 task와 PR #104 후속 hot fix 합계가 진짜 산출물 — hook 신설만으로는 정책 강제 부족하고 `permissionDecision`까지 명시해야 실효 확보. 다른 PreToolUse hook 신설 시 같은 함정 반복 위험 — 본 task 패턴이 향후 hook 작성의 표준이 됨.
