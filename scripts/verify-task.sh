#!/usr/bin/env bash
# verify-task.sh — 커밋·PR 전 전체 검증
# 사용법: bash scripts/verify-task.sh
#         또는 yarn verify

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# ANSI 색상 (TTY일 때만)
if [[ -t 1 ]]; then
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BOLD=''; RESET=''
fi

FAILED=()
WARNED=()

run_step() {
  local label="$1"; shift
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  if "$@"; then
    echo "${GREEN}✓ $label 통과${RESET}"
  else
    local code=$?
    echo "${RED}✗ $label 실패 (exit $code)${RESET}"
    FAILED+=("$label")
  fi
}

# 비차단 단계 — 실패 시 FAILED가 아닌 WARNED에 기록 (전체 종료 코드는 0 유지)
run_warning_step() {
  local label="$1"; shift
  echo ""
  echo "${BOLD}━━━ $label ━━━${RESET}"
  if "$@"; then
    echo "${GREEN}✓ $label 통과${RESET}"
  else
    local code=$?
    echo "${YELLOW}⚠ $label 경고 (exit $code)${RESET}"
    WARNED+=("$label")
  fi
}

run_step         "ESLint"            yarn lint
run_step         "stylelint"         yarn lint:styles
run_step         "Build (next)"      yarn build
run_warning_step "Knip (미사용 코드)" yarn knip

echo ""
echo "${BOLD}━━━ 결과 요약 ━━━${RESET}"
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "${GREEN}✓ 모든 검증 통과${RESET}"
  if [[ ${#WARNED[@]} -gt 0 ]]; then
    echo "${YELLOW}⚠ 경고: ${WARNED[*]}${RESET}"
  fi
  exit 0
else
  echo "${RED}✗ 실패: ${FAILED[*]}${RESET}"
  echo ""
  echo "각 단계 출력 위 내용 확인 후 수정하세요."
  exit 1
fi
