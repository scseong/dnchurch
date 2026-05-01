#!/usr/bin/env bash
# start-adr.sh — 다음 ADR 번호 계산 후 docs/decisions/NNNN-<slug>.md 생성
# 사용법: bash scripts/start-adr.sh <slug>
set -euo pipefail

slug="${1:-}"
if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Usage: bash scripts/start-adr.sh <slug>" >&2
  echo "slug은 소문자·숫자·하이픈만 허용합니다." >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
DECISIONS_DIR="$REPO_ROOT/docs/decisions"
TEMPLATE="$DECISIONS_DIR/_template.md"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Error: ADR template 없음: $TEMPLATE" >&2
  exit 1
fi

mkdir -p "$DECISIONS_DIR"

# 기존 ADR 번호 중 최대값 탐색
max_num=0
for f in "$DECISIONS_DIR"/[0-9][0-9][0-9][0-9]-*.md; do
  [[ -f "$f" ]] || continue
  num="${f##*/}"
  num=$((10#${num:0:4}))
  (( num > max_num )) && max_num=$num
done

next_padded=$(printf "%04d" $(( max_num + 1 )))
filename="${next_padded}-${slug}.md"
target="$DECISIONS_DIR/$filename"

if [[ -f "$target" ]]; then
  echo "Error: 이미 존재함: docs/decisions/$filename" >&2
  exit 1
fi

date=$(date +%Y-%m-%d)
title="${slug//-/ }"

sed \
  -e "s/# NNNN — <결정 제목>/# ${next_padded} — ${title}/" \
  -e "s/- \*\*Date\*\*: YYYY-MM-DD/- \*\*Date\*\*: ${date}/" \
  "$TEMPLATE" > "$target"

echo "✓ ADR 생성됨: docs/decisions/$filename"
echo ""
echo "다음 단계:"
echo "  1. Context / Decision / Consequences를 채우기"
echo "  2. bash scripts/update-adr-index.sh 실행"
echo "  3. 관련 EXEC_PLAN References에 ADR 링크 추가"
