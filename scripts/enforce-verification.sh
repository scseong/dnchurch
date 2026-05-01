#!/usr/bin/env bash
# enforce-verification.sh — 커밋 전 통과 검증 기록 확인
# 사용법: TASK_ID=<slug> bash scripts/enforce-verification.sh
#         또는 bash scripts/enforce-verification.sh <task-id>
set -uo pipefail

TASK_ID="${1:-${TASK_ID:-}}"
ENFORCE="${VERIFY_ENFORCE:-0}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
LOGS_ROOT="$REPO_ROOT/logs"

warn() {
  echo "$1" >&2
  [[ "$ENFORCE" == "1" ]] && exit 1
}

current_hash=$(git diff --binary | git hash-object --stdin 2>/dev/null || echo "")
staged_hash=$(git diff --cached --binary | git hash-object --stdin 2>/dev/null || echo "")

# 검사할 latest.json 목록 구성
candidates=()
if [[ -n "$TASK_ID" ]]; then
  candidates=("$LOGS_ROOT/$TASK_ID/latest.json")
elif [[ -d "$LOGS_ROOT" ]]; then
  while IFS= read -r -d '' dir; do
    [[ -f "$dir/latest.json" ]] && candidates+=("$dir/latest.json")
  done < <(find "$LOGS_ROOT" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)
fi

# 각 manifest에서 status·hash 읽기 (node -e로 JSON 파싱)
for manifest in "${candidates[@]}"; do
  [[ -f "$manifest" ]] || continue
  info=$(node -e "
    try {
      const m = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));
      process.stdout.write([m.status||'', m.currentDiffHash||'', m.stagedDiffHash||'', m.taskId||'', m.runId||''].join('\t'));
    } catch {}
  " "" "$manifest" 2>/dev/null) || continue
  IFS=$'\t' read -r status m_current m_staged task_id run_id <<< "$info"
  [[ "$status" == "pass" ]] || continue
  if [[ "$m_current" == "$current_hash" && "$m_staged" == "$staged_hash" ]]; then
    echo "✓ 검증 기록 확인: logs/$task_id/$run_id"
    exit 0
  fi
done

if [[ -n "$TASK_ID" ]]; then
  hint="TASK_ID=$TASK_ID bash scripts/verify-task.sh"
else
  hint="TASK_ID=<task-id> bash scripts/verify-task.sh"
fi
warn "⚠ 현재 diff와 일치하는 통과 검증 기록이 없습니다.
  다시 검증하세요: $hint"
exit 0
