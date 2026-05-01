#!/usr/bin/env bash
# complete-task.sh — EXEC_PLAN을 active/ → completed/ 로 이동
# 사용법: bash scripts/complete-task.sh <slug-or-pattern>
# 패턴 부분 일치 — 정확히 1개 매칭이어야 진행

set -euo pipefail

PATTERN="${1:-}"
if [[ -z "$PATTERN" ]]; then
  echo "Usage: bash scripts/complete-task.sh <slug-or-pattern>" >&2
  echo "  예: bash scripts/complete-task.sh sermon-empty-state" >&2
  exit 1
fi

# glob/path 문자 차단 — find -name에 그대로 전달되어 의도치 않은 매치 방지
if [[ "$PATTERN" =~ [^a-zA-Z0-9_.-] ]]; then
  echo "Error: PATTERN은 영숫자·_·.·-만 허용 (slug 또는 그 일부)." >&2
  echo "  입력: $PATTERN" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
ACTIVE_DIR="$REPO_ROOT/docs/exec-plans/active"
COMPLETED_DIR="$REPO_ROOT/docs/exec-plans/completed"

if [[ ! -d "$ACTIVE_DIR" ]]; then
  echo "Error: active/ 디렉토리 없음: $ACTIVE_DIR" >&2
  exit 1
fi

# 패턴에 매칭되는 .md 파일 찾기 (.gitkeep 제외)
mapfile -t MATCHES < <(find "$ACTIVE_DIR" -maxdepth 1 -type f -name "*${PATTERN}*.md" | sort)

if [[ ${#MATCHES[@]} -eq 0 ]]; then
  echo "Error: 매칭되는 EXEC_PLAN 없음: *${PATTERN}*.md" >&2
  echo "" >&2
  echo "현재 active/ 내용:" >&2
  ls -1 "$ACTIVE_DIR"/*.md 2>/dev/null | sed 's|.*/||; s|^|  |' >&2 || echo "  (없음)" >&2
  exit 1
fi

if [[ ${#MATCHES[@]} -gt 1 ]]; then
  echo "Error: 여러 파일이 매칭됨. 더 구체적인 패턴이 필요합니다." >&2
  echo "" >&2
  echo "매칭 결과:" >&2
  printf '  %s\n' "${MATCHES[@]##*/}" >&2
  exit 1
fi

SOURCE="${MATCHES[0]}"
FILENAME="${SOURCE##*/}"
TARGET="$COMPLETED_DIR/$FILENAME"

if [[ -f "$TARGET" ]]; then
  echo "Error: completed/ 에 동일 파일 존재: $FILENAME" >&2
  exit 1
fi

mkdir -p "$COMPLETED_DIR"
mv "$SOURCE" "$TARGET"

REL="${TARGET#$REPO_ROOT/}"
echo "✓ 이동 완료: $REL"
echo ""
echo "다음 단계:"
echo "  1. 파일 열어서 \"회고\" 섹션 작성 (잘된 것 / 다음에 할 것 / 부채)"
echo "  2. 발견된 부채는 docs/tech-debt-tracker.md에 등록"
echo "  3. git add docs/exec-plans/ && 커밋"
