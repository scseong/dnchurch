# scripts/ — 워크플로우 자동화

CLAUDE.md의 EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT 워크플로우를 보조하는 Node.js 스크립트.

## 스크립트

| 스크립트 | 시점 | 동작 |
| --- | --- | --- |
| `start-task.mjs <slug>` | PLAN 시작 | `_template.md` 복사 → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` |
| `complete-task.mjs <pattern>` | 머지 후 | `active/` → `completed/` 이동 |
| `verify-task.mjs <task-id>` | VERIFY | ESLint + stylelint + build + knip 실행, `logs/<task-id>/`에 증적 저장 |
| `harness-gate.mjs <task-id>` | 머지/릴리스 전 | 검증 증적 + exec-plan 협업 기록 + ADR 판단을 강제 확인 |
| `prevent-main-src-commit.mjs` | COMMIT 전 | `main` 브랜치에서 staged `src/` 변경 커밋 차단 |
| `enforce-verification.mjs` | COMMIT 전 | 최신 검증 기록과 현재 diff 일치 여부 확인 (`VERIFY_ENFORCE=1`이면 차단) |
| `start-adr.mjs <slug>` | 큰 결정 시 | 다음 ADR 번호 계산 → `docs/decisions/NNNN-<slug>.md` 생성 |
| `update-adr-index.mjs` | ADR 추가/상태 변경 후 | `docs/decisions/README.md` 인덱스 재생성 |

## 사용 예

```bash
# 새 작업 시작
node scripts/start-task.mjs sermon-empty-state
# → docs/exec-plans/active/2026-05-01-sermon-empty-state.md 생성

# 작업 후 검증
node scripts/verify-task.mjs sermon-empty-state

# 머지/릴리스 전 하네스 게이트
node scripts/harness-gate.mjs sermon-empty-state

# 머지 후 정리
node scripts/complete-task.mjs sermon-empty-state
# → active/ → completed/ 이동

# ADR 생성
node scripts/start-adr.mjs supabase-cache-policy
node scripts/update-adr-index.mjs
```

## 환경

- Node.js 필요: 모든 workflow 스크립트는 `.mjs`로 통일
- `git`, `yarn` 필요

## 검증 로그

`verify-task.mjs`는 실행 결과를 `logs/<task-id>/<run-id>/`에 저장한다. `logs/`는 로컬 증적이므로 git에 커밋하지 않는다.

주요 파일:

- `summary.log` — 전체 요약
- `eslint.log`, `stylelint.log`, `build-next.log`, `knip.log` — 단계별 출력
- `current.patch`, `staged.patch` — 검증 시점 diff
- `manifest.json`, `latest.json` — 검증 상태와 diff hash

pre-commit의 `enforce-verification.mjs`는 기본 경고 모드다. `VERIFY_ENFORCE=1`을 설정하면 검증 누락 또는 diff 변경 시 커밋을 차단한다.

## 협업 기록 검사

`complete-task.mjs`는 exec-plan을 completed로 옮기기 전에 다음 섹션이 있는지 확인한다.

- `## ADR 판단`
- `## Codex 계획 검증`
- `## Codex 1차 검증`
- `## Claude 2차 검증`

기본은 경고 모드다. `HARNESS_ENFORCE=1`을 설정하면 섹션 누락, `미요청`, `미검토` 상태가 남아 있을 때 완료 처리를 차단한다.

ADR 후보 파일(`package.json`, `src/apis/`, `src/services/`, `src/actions/`, `.claude/`, `.codex/`, `scripts/` 등)을 변경했는데 `docs/decisions/` 변경이 없으면 `ADR 판단` 섹션을 확인한다.

## 머지/릴리스 게이트

평소 개발 중 pre-commit은 경고 중심으로 두고, 머지 또는 릴리스 전에는 다음 명령으로 강제 확인한다.

```bash
node scripts/harness-gate.mjs <task-id>
```

이 명령은 다음을 모두 통과해야 성공한다.

- 현재 diff와 일치하는 `verify-task.mjs` PASS 증적
- active exec-plan의 `Codex 계획 검증`, `Codex 1차 검증`, `Claude 2차 검증` 작성 상태
- ADR 후보 변경이 있을 때 `ADR 판단` 작성 또는 실제 ADR 변경

## 슬러그 규칙

- 소문자·숫자·하이픈만 (`^[a-z0-9][a-z0-9-]*$`)
- 영문 권장. 한글은 파일명 호환성 이슈로 비권장
