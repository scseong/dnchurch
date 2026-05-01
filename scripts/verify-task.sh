#!/usr/bin/env bash
# verify-task.sh — 커밋·머지 전 전체 검증 + 증적 기록
# 사용법: TASK_ID=<slug> bash scripts/verify-task.sh
#         또는 bash scripts/verify-task.sh <task-id>
#         또는 yarn verify

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TASK_ID="${1:-${TASK_ID:-manual}}"
if [[ ! "$TASK_ID" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]]; then
  echo "Error: TASK_ID는 영숫자·_·.·-만 허용합니다. 입력: $TASK_ID" >&2
  exit 1
fi

RUN_ID="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="$REPO_ROOT/logs/$TASK_ID"
RUN_DIR="$LOG_DIR/$RUN_ID"
mkdir -p "$RUN_DIR"

SUMMARY_LOG="$RUN_DIR/summary.log"
MANIFEST="$RUN_DIR/manifest.json"
LATEST="$LOG_DIR/latest.json"
CURRENT_PATCH="$RUN_DIR/current.patch"
STAGED_PATCH="$RUN_DIR/staged.patch"

git diff --binary > "$CURRENT_PATCH"
git diff --cached --binary > "$STAGED_PATCH"

CURRENT_HASH="$(git diff --binary | git hash-object --stdin)"
STAGED_HASH="$(git diff --cached --binary | git hash-object --stdin)"
HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

# ANSI 색상 (TTY일 때만)
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
    if [[ $first -eq 0 ]]; then
      printf ','
    fi
    first=0
    printf '"%s"' "$item"
  done
  printf ']'
}

write_manifest() {
  local status="$1"
  local finished_at
  finished_at="$(date -Iseconds)"
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
  "finishedAt": "$finished_at",
  "failed": $(json_array "${FAILED[@]}"),
  "warned": $(json_array "${WARNED[@]}"),
  "logs": {
    "summary": "logs/$TASK_ID/$RUN_ID/summary.log",
    "eslint": "logs/$TASK_ID/$RUN_ID/eslint.log",
    "stylelint": "logs/$TASK_ID/$RUN_ID/stylelint.log",
    "build": "logs/$TASK_ID/$RUN_ID/build.log",
    "knip": "logs/$TASK_ID/$RUN_ID/knip.log",
    "currentPatch": "logs/$TASK_ID/$RUN_ID/current.patch",
    "stagedPatch": "logs/$TASK_ID/$RUN_ID/staged.patch"
  }
}
EOF
  cp "$MANIFEST" "$LATEST"
}

run_step() {
  local label="$1"; local logfile="$2"; shift 2
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  echo "━━━ $label ━━━" >> "$SUMMARY_LOG"
  if "$@" > "$logfile" 2>&1; then
    cat "$logfile"
    echo "${GREEN}✓ $label 통과${RESET}"
    echo "PASS $label" >> "$SUMMARY_LOG"
  else
    local code=$?
    cat "$logfile"
    echo "${RED}✗ $label 실패 (exit $code)${RESET}"
    echo "FAIL $label exit=$code" >> "$SUMMARY_LOG"
    FAILED+=("$label")
  fi
}

# 비차단 단계 — 실패 시 FAILED가 아닌 WARNED에 기록 (전체 종료 코드는 0 유지)
run_warning_step() {
  local label="$1"; local logfile="$2"; shift 2
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  echo "━━━ $label ━━━" >> "$SUMMARY_LOG"
  if "$@" > "$logfile" 2>&1; then
    cat "$logfile"
    echo "${GREEN}✓ $label 통과${RESET}"
    echo "PASS $label" >> "$SUMMARY_LOG"
  else
    local code=$?
    cat "$logfile"
    echo "${YELLOW}⚠ $label 경고 (exit $code)${RESET}"
    echo "WARN $label exit=$code" >> "$SUMMARY_LOG"
    WARNED+=("$label")
  fi
}

STARTED_AT="$(date -Iseconds)"
{
  echo "TASK_ID=$TASK_ID"
  echo "RUN_ID=$RUN_ID"
  echo "BRANCH=$BRANCH"
  echo "HEAD=$HEAD_SHA"
  echo "CURRENT_DIFF_HASH=$CURRENT_HASH"
  echo "STAGED_DIFF_HASH=$STAGED_HASH"
  echo "STARTED_AT=$STARTED_AT"
} > "$SUMMARY_LOG"

run_step         "ESLint"            "$RUN_DIR/eslint.log"    yarn lint
run_step         "stylelint"         "$RUN_DIR/stylelint.log" yarn lint:styles
run_step         "Build (next)"      "$RUN_DIR/build.log"     yarn build
run_warning_step "Knip (미사용 코드)" "$RUN_DIR/knip.log"      yarn knip

echo ""
echo "${BOLD}━━━ 결과 요약 ━━━${RESET}"
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "${GREEN}✓ 모든 검증 통과${RESET}"
  echo "RESULT=pass" >> "$SUMMARY_LOG"
  if [[ ${#WARNED[@]} -gt 0 ]]; then
    echo "${YELLOW}⚠ 경고: ${WARNED[*]}${RESET}"
    echo "WARNED=${WARNED[*]}" >> "$SUMMARY_LOG"
  fi
  write_manifest "pass"
  echo "검증 로그: logs/$TASK_ID/$RUN_ID"
  exit 0
else
  echo "${RED}✗ 실패: ${FAILED[*]}${RESET}"
  echo ""
  echo "각 단계 출력 위 내용 확인 후 수정하세요."
  echo "RESULT=fail" >> "$SUMMARY_LOG"
  echo "FAILED=${FAILED[*]}" >> "$SUMMARY_LOG"
  write_manifest "fail"
  echo "검증 로그: logs/$TASK_ID/$RUN_ID"
  exit 1
fi
