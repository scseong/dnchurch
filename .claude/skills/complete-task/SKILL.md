---
name: complete-task
description: 사용자가 PR 머지 완료, complete-task, 회고 작성, exec-plan completed 이동, tech-debt 등록을 언급할 때 사용
---

# 작업 완료 처리

PR이 머지된 후 `docs/exec-plans/active/<slug>.md`에 회고를 채우고 `completed/`로 이동하며, `docs/tech-debt-tracker.md` 업데이트와 별도 PR 제출을 어시스트한다.

## 시작 판단

다음 모두 해당하면 사용한다.

- 사용자가 작업 완료, 회고 작성, complete-task, exec-plan 이동, completed 이동, tech-debt 등록을 언급한다.
- 대상 PR이 이미 머지되었거나 사용자가 머지를 마쳤다고 알린다.
- 대상 slug의 active EXEC_PLAN이 존재한다.

머지되지 않은 PR은 절차를 시작하지 않고 머지 완료를 먼저 요청한다.

## 사용자 승인 강제

이 스킬은 사용자 검토를 반드시 통과해야 하는 절차다. 사용자 승인 문구가 없으면 다음 명령을 절대 실행하지 않는다.

- `git switch`, `git pull`
- `node scripts/complete-task.mjs`
- `git commit`, `git push`
- `gh pr create`

승인 없이 위 명령을 실행하면 즉시 중단하고 사용자에게 보고한다.

## 절차

### 1. 사전 확인

- slug 확보 — 사용자가 명시했거나 active/에 1개만 존재한다. 여러 개면 사용자에게 선택을 요청한다.
- 머지 검증 — `gh pr list --state merged --search "head:<branch>"` 또는 PR 번호로 확인한다. 미머지면 중단한다.
- 작업 트리 정리 — `git status`로 변경/스테이지된 파일이 없는지 확인한다. 있으면 사용자에게 처리를 요청한다.

### 2. develop 동기화 (사용자 승인 후)

작업 트리가 깨끗함을 확인한 뒤 사용자에게 develop 동기화를 묻고 승인이 떨어지면 실행한다. 자동으로 브랜치를 바꾸지 않는다.

```bash
git switch develop
git pull
```

`docs/exec-plans/active/<date>-<slug>.md` 위치를 확인한다. 동일 이름이 이미 `completed/`에 있으면 중단한다.

### 3. 회고 초안 작성 (active 위치에서, 이동 전)

이동 전에 active plan의 `## 회고`를 채운다 — 이동 후 빈 회고로 남는 위험을 사전에 차단한다.

다음 컨텍스트를 읽고 세 항목의 초안을 작성한다.

- exec-plan의 `## 의사결정 로그`, `## Codex 계획 검증`, `## Codex 1차 검증`, `## Claude 2차 검증`
- 머지된 PR 본문 — `gh pr view <num> --json body,commits`
- 해당 브랜치의 commit log
- `logs/<slug>/<run-id>/`의 verify-task 출력 (경고/실패 분류용)

작성 규칙:

- **잘된 것**: Codex/Claude 검증에서 PASS로 끝난 항목, 의사결정 로그의 좋은 판단.
- **다음에 할 것**: Codex 검증의 "남은 리스크", 의사결정 로그의 미해결 항목, Non-goals 중 다음 작업으로 옮긴 것.
- **발견된 부채 (→ tech-debt-tracker.md 옮길 것)**: verify-task 경고와 의사결정 로그의 부채 언급.

초안은 사용자에게 먼저 보여주고 수정/승인을 받는다. 빈 회고로 두지 않는다.

### 4. tech-debt 후보 등록 제안

회고의 "부채" 항목과 verify-task 경고에서 신규 부채 후보를 추출한다.

- 기존 `docs/tech-debt-tracker.md`와 대조해 중복은 제외한다.
- 신규 항목은 사용자에게 등록 여부를 묻는다.
- 승인 시 같은 commit에 포함되도록 같은 작업 트리에 변경을 적용한다.

### 5. complete-task.mjs 실행 (사용자 승인 후)

회고가 채워진 채로 이동한다.

```bash
node scripts/complete-task.mjs <slug>
```

회고 섹션이 채워져 있어 검증 섹션 누락 경고는 정상 통과한다. 경고가 뜨면 회고 단계로 돌아가 채운 뒤 재실행한다. `HARNESS_ENFORCE=1` 환경에서는 경고가 fail로 동작한다.

### 6. 별도 브랜치 분기 (보수적 정책)

develop 직접 commit 대신 별도 브랜치로 분기해 PR 리뷰 단계를 거친다.

```bash
git checkout -b chore/complete-<slug>
```

이 저장소는 develop을 PR-only로 보호하지 않지만, 회고와 tech-debt 변경도 한 번의 리뷰 시점을 거치도록 별도 PR을 사용한다.

### 7. 사용자 승인 후 commit + push + PR

```bash
git add docs/exec-plans/ docs/tech-debt-tracker.md
git commit -m "Docs: <slug> 회고 작성 및 completed 이동"
git push -u origin chore/complete-<slug>
gh pr create --base develop --assignee "@me" --label "📝 문서" \
  --title "[Docs] <slug> 회고 및 completed 이동" \
  --body "..."
```

- 메시지 prefix는 `Docs:` 사용 (회고/이동은 문서 변경).
- PR 본문은 `.github/PULL_REQUEST_TEMPLATE/maintenance.md` 형식 — Task ID, Exec Plan 경로, 머지된 원 PR 번호를 반드시 명시한다.
- 사용자 승인 없이 commit/push/PR 생성 금지.

## 중단 조건

- 대상 PR이 머지되지 않았다.
- 작업 트리가 더러워 안전하게 develop으로 전환할 수 없다.
- `active/<date>-<slug>.md`가 존재하지 않거나 동일 이름이 이미 `completed/`에 있다.
- 회고 초안에 필요한 컨텍스트(PR 본문, exec-plan 검증 섹션)가 부족하고 사용자에게 추가 정보를 받지 못했다.
- 어느 단계에서든 사용자 승인 문구가 없다.
