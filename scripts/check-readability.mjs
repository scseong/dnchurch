#!/usr/bin/env node
// 산출 문서의 가독성을 기계로 잰다. 기본은 warn-only(항상 exit 0), READABILITY_ENFORCE=1이면 위반 시 exit 1.
// 코드 span(백틱)과 fence(```) 안은 검사에서 뺀다 — 식별자·경로·예제 코드는 대상이 아니다.
//
// 잡는 것 (느슨한 임계값으로 최악만):
//   1) 한 문장에 가운뎃점이 너무 많다        — 사실을 기호로 잇는 압축
//   2) 표 셀이 너무 길다                       — 셀 안에 문장을 욱여넣음
//   3) 표 셀 안 사실-구분자가 너무 많다        — 한 셀에 여러 사실을 나열
//
// 병목이 되지 않게: 경계선은 통과시키고 명백한 것만 경고한다. 튜닝은 상수 3개로.

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const enforce = process.env.READABILITY_ENFORCE === "1";

// 임계값 — 실측 없이 정한 초기값. 오탐이 잦으면 올리고, 놓치면 내린다.
const MIDDOT_PER_SENTENCE = 4; // 한 문장에 가운뎃점 이 개수 이상이면 경고
const CELL_MAX_CHARS = 120; // 표 셀(코드 제외) 이 길이 초과면 경고
const CELL_MAX_JOINERS = 4; // 표 셀 안 사실-구분자(가운뎃점·슬래시) 이 개수 이상이면 경고

const MIDDOT = /[·・‧]/g;
const CELL_JOINER = /[·・‧]|\s\/\s/g;

// 백틱 코드 span을 공백으로 지운다. 식별자·경로를 검사에서 빼기 위함.
function stripInlineCode(text) {
  return text.replace(/`[^`]*`/g, " ");
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function isTableRow(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|", 1);
}

// `| --- | :--: |` 같은 구분선은 검사 대상이 아니다.
function isTableSeparator(line) {
  return /^\s*\|(?:\s*:?-{2,}:?\s*\|)+\s*$/.test(line);
}

function splitCells(line) {
  const trimmed = line.trim();
  return trimmed.slice(1, -1).split("|");
}

// 마침표·물음표·느낌표·개행으로 문장을 나눈다. 완벽한 분해는 아니고, 가운뎃점을 셀 단위면 충분하다.
function splitSentences(text) {
  return text
    .split(/(?<=[.?!。])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function checkFile(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (error) {
    return [{ line: 0, message: `파일을 읽지 못했습니다: ${error.message}` }];
  }

  const lines = raw.split(/\r?\n/);
  const warnings = [];
  let inFence = false;

  // YAML frontmatter(맨 앞 `---`부터 다음 `---`까지)는 메타데이터라 검사에서 뺀다.
  let bodyStartIndex = 0;
  if (lines[0]?.trim() === "---") {
    const close = lines.slice(1).findIndex((line) => line.trim() === "---");
    if (close !== -1) bodyStartIndex = close + 2;
  }

  lines.forEach((line, index) => {
    if (index < bodyStartIndex) return;
    const lineNo = index + 1;

    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const clean = stripInlineCode(line);

    if (isTableRow(line)) {
      if (isTableSeparator(line)) return;
      for (const cell of splitCells(clean)) {
        const trimmed = cell.trim();
        if (trimmed.length > CELL_MAX_CHARS) {
          warnings.push({
            line: lineNo,
            message: `표 셀이 ${trimmed.length}자입니다(한도 ${CELL_MAX_CHARS}). 셀 안 문장을 셀 밖 bullet로 풀어쓰세요.`,
          });
        }
        const joiners = countMatches(trimmed, CELL_JOINER);
        if (joiners >= CELL_MAX_JOINERS) {
          warnings.push({
            line: lineNo,
            message: `표 셀에 사실-구분자(가운뎃점·슬래시)가 ${joiners}개입니다(한도 ${CELL_MAX_JOINERS - 1}). 여러 사실을 한 셀에 잇지 말고 나누세요.`,
          });
        }
      }
      return;
    }

    for (const sentence of splitSentences(clean)) {
      const dots = countMatches(sentence, MIDDOT);
      if (dots >= MIDDOT_PER_SENTENCE) {
        warnings.push({
          line: lineNo,
          message: `한 문장에 가운뎃점이 ${dots}개입니다(한도 ${MIDDOT_PER_SENTENCE - 1}). 사실을 기호로 잇지 말고 동사 문장으로 나누세요.`,
        });
      }
    }
  });

  return warnings;
}

const files = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

if (files.length === 0) {
  console.error("Usage: node scripts/check-readability.mjs <file.md> [file2.md ...]");
  console.error("  기본은 경고만(exit 0). READABILITY_ENFORCE=1이면 위반 시 exit 1.");
  process.exit(0);
}

let total = 0;
for (const file of files) {
  const warnings = checkFile(file);
  if (warnings.length === 0) continue;
  total += warnings.length;
  const rel = path.relative(process.cwd(), file).replaceAll("\\", "/") || file;
  for (const warning of warnings) {
    console.error(`${rel}:${warning.line}: [readability] ${warning.message}`);
  }
}

if (total === 0) {
  console.log("✓ 가독성 검사 통과");
  process.exit(0);
}

const mode = enforce ? "차단" : "경고";
console.error(`\n가독성 ${mode}: ${total}건. 문장을 나누고 표 셀을 풀어쓰세요.`);
process.exit(enforce && total > 0 ? 1 : 0);
