#!/usr/bin/env node
/**
 * commit-msg hook — deterministic 4 룰 강제.
 * SSOT: .claude/skills/harness-workflow/SKILL.md "## 커밋 메시지"
 * ADR: docs/decisions/0009-commit-msg-hook-enforcement.md
 *
 * Usage: node scripts/check-commit-msg.mjs <commit-msg-file>
 * Exit: 0 (pass / auto-skip), 1 (violation), 2 (usage error)
 * Bypass: git commit --no-verify
 */
import { readFileSync } from 'node:fs';

const ALLOWED_PREFIXES = ['Feat', 'Fix', 'Style', 'Refactor', 'Docs', 'Chore'];
const SUBJECT_REGEX = /^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$/;
const SUBJECT_MAX_LENGTH = 80;
const COAUTHOR_REGEX = /^Co-Authored-By:\s/im;
const PLUS_COUNT_LIMIT = 2;
const SKIP_PREFIXES = ['Merge ', 'Revert ', 'fixup!', 'squash!'];

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/check-commit-msg.mjs <commit-msg-file>');
  process.exit(2);
}

let raw;
try {
  raw = readFileSync(file, 'utf8');
} catch (err) {
  console.error(`commit-msg 파일 읽기 실패: ${file}\n${err.message}`);
  process.exit(2);
}

// git이 commit-msg 파일에 # 주석 라인을 추가하므로 제거
const content = raw
  .split('\n')
  .filter((line) => !line.startsWith('#'))
  .join('\n');

const lines = content.split('\n');
const subject = (lines[0] ?? '').trimEnd();

// Auto-skip: merge / revert / fixup / squash commit
if (SKIP_PREFIXES.some((prefix) => subject.startsWith(prefix))) {
  process.exit(0);
}

const errors = [];

// R1: subject 형식 — prefix 6개 + ASCII colon + 공백 1개 + 비공백 시작
if (!SUBJECT_REGEX.test(subject)) {
  errors.push(
    `[R1] subject 형식 위반 — 정규식 \`^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$\` 필요\n` +
      `     허용 prefix: ${ALLOWED_PREFIXES.map((p) => `${p}:`).join(', ')}\n` +
      `     체크 항목: ASCII colon(:), 공백 1개, 비공백 시작\n` +
      `     현재: "${subject}"`
  );
}

// R2: subject 길이 한도 80자
if (subject.length > SUBJECT_MAX_LENGTH) {
  errors.push(
    `[R2] subject 길이 ${subject.length}자 — 한도 ${SUBJECT_MAX_LENGTH}자(권장 50자) 초과\n` +
      `     현재: "${subject}"`
  );
}

// R3: Co-Authored-By trailer 존재 (case-insensitive)
// trailer = 메시지 마지막 paragraph(빈 줄 위로 연속 non-empty 라인)에 위치해야 함
// content 중간의 인용·예시 라인은 trailer 아님 (SSOT: SKILL.md "## 커밋 메시지")
const cleanLines = content.split('\n').map((l) => l.replace(/[\r]+$/, ''));
while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
  cleanLines.pop();
}
const lastParagraph = [];
for (let i = cleanLines.length - 1; i >= 0; i--) {
  if (cleanLines[i].trim() === '') break;
  lastParagraph.unshift(cleanLines[i]);
}
const hasCoAuthorTrailer = lastParagraph.some((line) => COAUTHOR_REGEX.test(line));
if (!hasCoAuthorTrailer) {
  errors.push(
    `[R3] Co-Authored-By: trailer 누락 — message 마지막 paragraph(빈 줄 위)에 footer 필요\n` +
      `     예: Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
  );
}

// R4: subject `+` 2회 이상 차단 (다중 concern 분리 신호)
const plusCount = (subject.match(/\+/g) ?? []).length;
if (plusCount >= PLUS_COUNT_LIMIT) {
  errors.push(
    `[R4] subject \`+\` ${plusCount}회 출현 — 다중 concern 분리 신호\n` +
      `     선택: (a) commit 분리 또는 (b) 단일 상위 의도로 통일+본문 풀어쓰기\n` +
      `     SSOT: .claude/skills/harness-workflow/SKILL.md "## 커밋 메시지" §Subject 규칙\n` +
      `     현재: "${subject}"`
  );
}

if (errors.length > 0) {
  console.error('✗ commit-msg 검증 실패:\n');
  for (const e of errors) console.error(e + '\n');
  console.error('우회: git commit --no-verify (사용 시 PR 리뷰에서 수동 검증)');
  process.exit(1);
}

process.exit(0);
