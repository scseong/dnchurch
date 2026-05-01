#!/usr/bin/env bash
# verify-task.sh — 커밋·머지 전 전체 검증 + 증적 기록
# 사용법: TASK_ID=<slug> bash scripts/verify-task.sh
#         또는 bash scripts/verify-task.sh <task-id>

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TASK_ID="${1:-${TASK_ID:-manual}}"
if [[ ! "$TASK_ID" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]]; then
  echo "Error: TASK_ID는 영숫자·_·.·-만 허용합니다. 입력: $TASK_ID" >&2
  exit 1
fi

DATE_PREFIX="$(date +%Y-%m-%d)"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="$REPO_ROOT/logs/${DATE_PREFIX}-${TASK_ID}"
RUN_DIR="$LOG_DIR/$RUN_ID"
mkdir -p "$RUN_DIR"

SUMMARY_LOG="$RUN_DIR/summary.log"   # 사람용: 모든 단계 출력 통합
MANIFEST="$RUN_DIR/manifest.json"    # 기계용: status·hash (enforce-verification이 참조)
LATEST="$LOG_DIR/latest.json"        # task 루트 포인터 (enforce-verification이 직접 읽음)

CURRENT_HASH="$(git diff --binary | git hash-object --stdin)"
STAGED_HASH="$(git diff --cached --binary | git hash-object --stdin)"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

if [[ -t 1 ]]; then
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BOLD=''; RESET=''
fi

FAILED=()
WARNED=()

json_array() {
  local first=1
  printf '['
  for item in "$@"; do
    [[ $first -eq 0 ]] && printf ','
    first=0
    printf '"%s"' "$item"
  done
  printf ']'
}

write_manifest() {
  local status="$1"
  cat > "$MANIFEST" <<EOF
{
  "taskId": "$TASK_ID",
  "runId": "$RUN_ID",
  "status": "$status",
  "branch": "$BRANCH",
  "head": "$HEAD_SHA",
  "currentDiffHash": "$CURRENT_HASH",
  "stagedDiffHash": "$STAGED_HASH",
  "startedAt": "$STARTED_AT",
  "finishedAt": "$(date -Iseconds)",
  "failed": $(json_array "${FAILED[@]}"),
  "warned": $(json_array "${WARNED[@]}"),
  "log": "logs/${DATE_PREFIX}-${TASK_ID}/${RUN_ID}/summary.log"
}
EOF
  cp "$MANIFEST" "$LATEST"
}

run_step() {
  local label="$1"; shift
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  echo "" >> "$SUMMARY_LOG"
  echo "━━━ $label ━━━" >> "$SUMMARY_LOG"
  "$@" 2>&1 | tee -a "$SUMMARY_LOG"
  if [[ "${PIPESTATUS[0]}" -eq 0 ]]; then
    echo "${GREEN}✓ $label 통과${RESET}"
    echo "✓ $label 통과" >> "$SUMMARY_LOG"
  else
    echo "${RED}✗ $label 실패${RESET}"
    echo "✗ $label 실패" >> "$SUMMARY_LOG"
    FAILED+=("$label")
  fi
}

run_warning_step() {
  local label="$1"; shift
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  echo "" >> "$SUMMARY_LOG"
  echo "━━━ $label ━━━" >> "$SUMMARY_LOG"
  "$@" 2>&1 | tee -a "$SUMMARY_LOG"
  if [[ "${PIPESTATUS[0]}" -eq 0 ]]; then
    echo "${GREEN}✓ $label 통과${RESET}"
    echo "✓ $label 통과" >> "$SUMMARY_LOG"
  else
    echo "${YELLOW}⚠ $label 경고${RESET}"
    echo "⚠ $label 경고" >> "$SUMMARY_LOG"
    WARNED+=("$label")
  fi
}

STARTED_AT="$(date -Iseconds)"
{
  echo "TASK_ID=$TASK_ID"
  echo "RUN_ID=$RUN_ID"
  echo "BRANCH=$BRANCH"
  echo "HEAD=$HEAD_SHA"
  echo "STARTED_AT=$STARTED_AT"
} | tee "$SUMMARY_LOG"

run_step         "ESLint"            yarn lint
run_step         "stylelint"         yarn lint:styles
run_step         "Build (next)"      yarn build
run_warning_step "Knip (미사용 코드)" yarn knip

echo ""
echo "${BOLD}━━━ 결과 요약 ━━━${RESET}"
echo "" >> "$SUMMARY_LOG"
echo "━━━ 결과 요약 ━━━" >> "$SUMMARY_LOG"

LOG_PATH="logs/${DATE_PREFIX}-${TASK_ID}/${RUN_ID}/summary.log"

if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "${GREEN}✓ 모든 검증 통과${RESET}" | tee -a "$SUMMARY_LOG"
  [[ ${#WARNED[@]} -gt 0 ]] && echo "${YELLOW}⚠ 경고: ${WARNED[*]}${RESET}" | tee -a "$SUMMARY_LOG"
  write_manifest "pass"
  echo "검증 로그: $LOG_PATH"
  exit 0
else
  echo "${RED}✗ 실패: ${FAILED[*]}${RESET}" | tee -a "$SUMMARY_LOG"
  write_manifest "fail"
  echo "검증 로그: $LOG_PATH"
  exit 1
fi
