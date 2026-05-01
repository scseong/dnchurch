#!/usr/bin/env bash
# start-task.sh — EXEC_PLAN 생성
# 사용법: bash scripts/start-task.sh <task-slug>
# 결과: docs/exec-plans/active/<YYYY-MM-DD>-<task-slug>.md 생성

set -euo pipefail

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: bash scripts/start-task.sh <task-slug>" >&2
  echo "  예: bash scripts/start-task.sh sermon-empty-state" >&2
  exit 1
fi

if [[ ! "$SLUG" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Error: slug은 소문자·숫자·하이픈만 허용 (시작은 영숫자)." >&2
  echo "  입력: $SLUG" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
TEMPLATE="$REPO_ROOT/docs/exec-plans/_template.md"
ACTIVE_DIR="$REPO_ROOT/docs/exec-plans/active"
DATE="$(date +%Y-%m-%d)"
TARGET="$ACTIVE_DIR/${DATE}-${SLUG}.md"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Error: template 없음: $TEMPLATE" >&2
  exit 1
fi

if [[ -f "$TARGET" ]]; then
  echo "Error: 이미 존재함: $TARGET" >&2
  echo "       다른 slug을 쓰거나 기존 파일을 사용하세요." >&2
  exit 1
fi

mkdir -p "$ACTIVE_DIR"
cp "$TEMPLATE" "$TARGET"

# 템플릿 placeholder 치환 (제목, 시작일)
# macOS와 GNU sed 호환을 위해 임시 파일 방식
TMP="$(mktemp)"
sed \
  -e "s|^# <작업 제목>$|# ${SLUG}|" \
  -e "s|^- \*\*시작일\*\*: YYYY-MM-DD$|- **시작일**: ${DATE}|" \
  "$TARGET" > "$TMP"
mv "$TMP" "$TARGET"

# 현재 브랜치 자동 채우기
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
if [[ -n "$BRANCH" && "$BRANCH" != "HEAD" ]]; then
  TMP="$(mktemp)"
  sed -e "s|^- \*\*브랜치\*\*: feat/\.\.\.$|- **브랜치**: ${BRANCH}|" "$TARGET" > "$TMP"
  mv "$TMP" "$TARGET"
fi

REL_PATH="${TARGET#$REPO_ROOT/}"
echo "✓ EXEC_PLAN 생성됨: $REL_PATH"
echo ""
echo "다음 단계:"
echo "  1. 파일 열어서 목표·접근법·체크리스트 채우기"
echo "  2. 코드 작업 시작 (CLAUDE.md WORK 단계)"
echo "  3. 머지 후: bash scripts/complete-task.sh ${SLUG}"
