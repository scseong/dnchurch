# scripts/ — 워크플로우 자동화

CLAUDE.md의 EXPLORE → PLAN → WORK → COMMIT 워크플로우를 보조하는 스크립트.

## 스크립트

| 스크립트 | 시점 | 동작 |
| --- | --- | --- |
| `start-task.sh <slug>` | PLAN 시작 | `_template.md` 복사 → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` |
| `complete-task.sh <pattern>` | 머지 후 | `active/` → `completed/` 이동 |
| `verify-task.sh` | COMMIT 전 | ESLint + stylelint + build + knip 묶음 (= `yarn verify`) |

## 사용 예

```bash
# 새 작업 시작
bash scripts/start-task.sh sermon-empty-state
# → docs/exec-plans/active/2026-05-01-sermon-empty-state.md 생성

# 작업 후 검증
yarn verify
# 또는: bash scripts/verify-task.sh

# 머지 후 정리
bash scripts/complete-task.sh sermon-empty-state
# → active/ → completed/ 이동
```

## 환경

- Bash 필요 (Windows에서는 Git Bash 또는 WSL)
- `git`, `yarn` 필요
- `find`, `sed`, `mktemp` (POSIX 표준)

## 슬러그 규칙

- 소문자·숫자·하이픈만 (`^[a-z0-9][a-z0-9-]*$`)
- 영문 권장. 한글은 파일명 호환성 이슈로 비권장
