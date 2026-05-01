# scripts/ — 워크플로우 자동화

CLAUDE.md의 EXPLORE → PLAN → WORK → COMMIT 워크플로우를 보조하는 스크립트.

## 스크립트

| 스크립트 | 시점 | 동작 |
| --- | --- | --- |
| `start-task.sh <slug>` | PLAN 시작 | `_template.md` 복사 → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` |
| `complete-task.sh <pattern>` | 머지 후 | `active/` → `completed/` 이동 |
| `verify-task.sh <task-id>` | VERIFY | ESLint + stylelint + build + knip 실행, `logs/<task-id>/`에 증적 저장 |
| `prevent-main-src-commit.sh` | COMMIT 전 | `main` 브랜치에서 staged `src/` 변경 커밋 차단 |
| `enforce-verification.sh` | COMMIT 전 | 최신 검증 기록과 현재 diff 일치 여부 확인 (`VERIFY_ENFORCE=1`이면 차단) |
| `start-adr.sh <slug>` | 큰 결정 시 | 다음 ADR 번호 계산 → `docs/decisions/NNNN-<slug>.md` 생성 |
| `update-adr-index.sh` | ADR 추가/상태 변경 후 | `docs/decisions/README.md` 인덱스 재생성 |

## 사용 예

```bash
# 새 작업 시작
bash scripts/start-task.sh sermon-empty-state
# → docs/exec-plans/active/2026-05-01-sermon-empty-state.md 생성

# 작업 후 검증
TASK_ID=sermon-empty-state bash scripts/verify-task.sh
# 또는: bash scripts/verify-task.sh sermon-empty-state

# 머지 후 정리
bash scripts/complete-task.sh sermon-empty-state
# → active/ → completed/ 이동

# ADR 생성
bash scripts/start-adr.sh supabase-cache-policy
bash scripts/update-adr-index.sh
```

## 환경

- Bash 필요 (Windows에서는 Git Bash 또는 WSL): 모든 `*.sh`
- `git`, `yarn` 필요
- `find`, `sed`, `awk` (POSIX 표준)

## 검증 로그

`verify-task.sh`는 실행 결과를 `logs/<task-id>/<run-id>/`에 저장한다. `logs/`는 로컬 증적이므로 git에 커밋하지 않는다.

주요 파일:

- `summary.log` — 전체 요약
- `eslint.log`, `stylelint.log`, `build.log`, `knip.log` — 단계별 출력
- `current.patch`, `staged.patch` — 검증 시점 diff
- `manifest.json`, `latest.json` — 검증 상태와 diff hash

pre-commit의 `enforce-verification.sh`는 기본 경고 모드다. `VERIFY_ENFORCE=1`을 설정하면 검증 누락 또는 diff 변경 시 커밋을 차단한다.

## 슬러그 규칙

- 소문자·숫자·하이픈만 (`^[a-z0-9][a-z0-9-]*$`)
- 영문 권장. 한글은 파일명 호환성 이슈로 비권장
