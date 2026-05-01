#!/usr/bin/env bash
# prevent-main-src-commit.sh — main 브랜치 src/ 직접 커밋 차단
set -euo pipefail

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
[[ "$branch" == "main" ]] || exit 0

src_changes=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E "^src(/|$)" || true)
[[ -n "$src_changes" ]] || exit 0

echo "Error: main 브랜치에서 src/ 직접 수정 커밋은 금지됩니다." >&2
echo "" >&2
echo "감지된 staged src/ 변경:" >&2
while IFS= read -r f; do echo "  - $f" >&2; done <<< "$src_changes"
echo "" >&2
echo "작업 브랜치를 만든 뒤 커밋하세요. 예: git switch -c feat/<slug>" >&2
exit 1
