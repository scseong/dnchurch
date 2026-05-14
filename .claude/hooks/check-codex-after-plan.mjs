#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

const PLAN_PATH_RE = /docs[\\/]+exec-plans[\\/]+active[\\/]+.+\.md$/i;
const CWD_KEY = createHash("sha1").update(process.cwd()).digest("hex").slice(0, 8);
const STATE_FILE = path.join(os.tmpdir(), `dnchurch-check-codex-after-plan.${CWD_KEY}.state.json`);
const HASH_SECTIONS = ["목표", "Success Criteria", "영향받는 파일", "Verification"];
const SECTION_DELIM = "||";

async function readInput() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function emitContext(message) {
  stdout.write(JSON.stringify({
    continue: true,
    suppressOutput: true,
    additionalContext: message,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: message,
    },
  }));
}

function sectionBody(markdown, heading) {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  if (start === -1) return "";
  const bodyStart = markdown.indexOf("\n", start);
  if (bodyStart === -1) return "";
  const nextHeading = markdown.slice(bodyStart + 1).search(/^##\s/m);
  const bodyEnd = nextHeading === -1 ? markdown.length : bodyStart + 1 + nextHeading;
  return markdown.slice(bodyStart + 1, bodyEnd).trim();
}

function isAlreadyReviewed(content) {
  const body = sectionBody(content, "Codex 계획 검증");
  return /\*\*결론\*\*:\s*(PASS|PASS_WITH_DECISION_LOG|CHANGE_REQUEST|BLOCK)\b/.test(body);
}

function sectionsHash(content) {
  const parts = HASH_SECTIONS.map((h) => sectionBody(content, h));
  return createHash("sha1").update(parts.join(SECTION_DELIM)).digest("hex").slice(0, 16);
}

function readState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8") || "{}");
  } catch {
    return {};
  }
}

function writeState(map) {
  try { writeFileSync(STATE_FILE, JSON.stringify(map)); } catch {}
}

const payload = await readInput();
const input = payload.tool_input ?? payload.toolInput ?? {};
const candidatePath = String(input.file_path ?? input.path ?? input.filePath ?? "");
const normalizedPath = candidatePath.replaceAll("\\", "/");

if (!PLAN_PATH_RE.test(normalizedPath)) process.exit(0);
if (!existsSync(candidatePath)) process.exit(0);

const content = readFileSync(candidatePath, "utf8");

if (isAlreadyReviewed(content)) process.exit(0);

const currentHash = sectionsHash(content);
const state = readState();
const previousHash = state[normalizedPath];

if (currentHash === previousHash) process.exit(0);

state[normalizedPath] = currentHash;
writeState(state);

emitContext(
  "[hook:check-codex-after-plan]\n" +
    `active EXEC_PLAN 핵심 섹션(목표/SC/영향 파일/Verification) 변경: ${normalizedPath}.\n` +
    "구현 전 Codex 계획 검증 권장. verdict: PASS / PASS_WITH_DECISION_LOG / CHANGE_REQUEST / BLOCK.\n" +
    "기록: exec-plan `## Codex 계획 검증`. (debounce: 동일 section hash 재발화 안 함)",
);
