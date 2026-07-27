#!/usr/bin/env node
// check-codex-after-plan과 섹션 분리: 본 hook은 검증 기록/Codex 인용/의사결정 로그 + ADR + tech-debt만 본다.
// 같은 PostToolUse:Write|Edit|MultiEdit + active exec-plan 경로에 두 hook이 발화하지만, 서로 다른 섹션 hash를 보므로 동시 발화 없음.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

// N2: completed/ 회고도 writing-style 적용 대상이라 감지 — `(active|completed)`로 확장.
// G1: ADR regex를 `\d+.+\.md` → `\d+.*\.md`로 완화 — slug 없는 0001.md 같은 형식 대비 (defensive).
const PATH_RE = /(docs[\\/]+exec-plans[\\/]+(?:active|completed)[\\/]+.+\.md|docs[\\/]+decisions[\\/]+\d+.*\.md|docs[\\/]+tech-debt[\\/]+(?:active|resolved)\.md)$/i;
const PLAN_PATH_RE = /docs[\\/]+exec-plans[\\/]+(?:active|completed)[\\/]+.+\.md$/i;
const CWD_KEY = createHash("sha1").update(process.cwd()).digest("hex").slice(0, 8);
const STATE_FILE = path.join(os.tmpdir(), `dnchurch-check-doc-style.${CWD_KEY}.state.json`);
const PLAN_HASH_SECTIONS = ["Codex 계획 검증", "Codex 1차 검증", "의사결정 로그", "검증 이력", "회고"];
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
  // 헤딩은 줄 시작에 고정(harness-gate.mjs와 동일) — 인라인 섹션 이름 언급 오인 방지.
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingMatch = new RegExp(`^## ${escaped}\\s*$`, "m").exec(markdown);
  if (!headingMatch) return "";
  const start = headingMatch.index;
  const bodyStart = markdown.indexOf("\n", start);
  if (bodyStart === -1) return "";
  const nextHeading = markdown.slice(bodyStart + 1).search(/^##\s/m);
  const bodyEnd = nextHeading === -1 ? markdown.length : bodyStart + 1 + nextHeading;
  return markdown.slice(bodyStart + 1, bodyEnd).trim();
}

function hashFor(content, isPlan) {
  // exec-plan은 검증 기록/Codex 인용/의사결정 로그 5 섹션만 본다 (check-codex-after-plan과 분리).
  // ADR/tech-debt는 전체 문서를 본다 (해당 파일은 위 5 섹션이 없으므로 분리 불필요).
  if (isPlan) {
    const parts = PLAN_HASH_SECTIONS.map((h) => sectionBody(content, h));
    return createHash("sha1").update(parts.join(SECTION_DELIM)).digest("hex").slice(0, 16);
  }
  return createHash("sha1").update(content).digest("hex").slice(0, 16);
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

if (!PATH_RE.test(normalizedPath)) process.exit(0);
if (!existsSync(candidatePath)) process.exit(0);

// G6: Windows CRLF 정규화 — 동일 내용이 OS 줄바꿈 차이로 hash 다르게 계산되어 불필요 재발화하는 결함 차단.
const content = readFileSync(candidatePath, "utf8").replace(/\r\n/g, "\n");
const isPlan = PLAN_PATH_RE.test(normalizedPath);
const currentHash = hashFor(content, isPlan);
const state = readState();
const previousHash = state[normalizedPath];

if (currentHash === previousHash) process.exit(0);

state[normalizedPath] = currentHash;
writeState(state);

emitContext(
  "[hook:check-doc-style]\n" +
    `문서 표현 점검 대상 변경: ${normalizedPath}.\n` +
    "doc-editor 호출 검토 — 추상명사 회피·구체화 4원소·평이 한국어·의사결정 로그 형식·Codex verbatim+풀이.\n" +
    "SSOT: `.claude/skills/writing-style/SKILL.md` (작성용 단일 SSOT). (debounce: 동일 section hash 재발화 안 함)",
);
