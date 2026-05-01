#!/usr/bin/env bash
# update-adr-index.sh — docs/decisions/README.md 인덱스 재생성
# 사용법: bash scripts/update-adr-index.sh
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
DECISIONS_DIR="$REPO_ROOT/docs/decisions"
README="$DECISIONS_DIR/README.md"

if [[ ! -f "$README" ]]; then
  echo "Error: docs/decisions/README.md 없음" >&2
  exit 1
fi

# 테이블 행 생성
table_lines=("| 번호 | 제목 | 상태 | 날짜 |" "| --- | --- | --- | --- |")
count=0
for f in $(ls "$DECISIONS_DIR"/[0-9][0-9][0-9][0-9]-*.md 2>/dev/null | sort); do
  name="$(basename "$f")"
  number="${name:0:4}"
  # 제목: "# NNNN — title" 패턴에서 title 추출
  title=$(grep -m1 "^# [0-9]" "$f" | awk -F' — ' '{print $2}' | tr -d '\r' || true)
  [[ -z "$title" ]] && title="${name%.md}"
  status=$(grep -m1 "\*\*Status\*\*" "$f" | sed 's/.*\*\*Status\*\*:[[:space:]]*//' | tr -d '\r' || echo "Unknown")
  date=$(grep -m1 "\*\*Date\*\*" "$f" | sed 's/.*\*\*Date\*\*:[[:space:]]*//' | tr -d '\r' || echo "Unknown")
  table_lines+=("| [${number}](${name}) | ${title} | ${status} | ${date} |")
  (( count++ ))
done

# README의 ## 인덱스 섹션 교체
tmp="$README.tmp"
if grep -q "^## 인덱스" "$README"; then
  # ## 인덱스 이전 + 새 테이블 + <!-- last-audit: 이후
  awk '/^## 인덱스/{exit} {print}' "$README" > "$tmp"
  {
    printf "## 인덱스\n\n"
    for line in "${table_lines[@]}"; do printf "%s\n" "$line"; done
    printf "\n"
    awk '/^<!-- last-audit:/{found=1} found{print}' "$README"
  } >> "$tmp"
else
  cp "$README" "$tmp"
  {
    printf "\n## 인덱스\n\n"
    for line in "${table_lines[@]}"; do printf "%s\n" "$line"; done
    printf "\n"
  } >> "$tmp"
fi
mv "$tmp" "$README"

echo "✓ ADR 인덱스 갱신됨: docs/decisions/README.md (${count}건)"
