#!/usr/bin/env node
// PR 생성 전 commit-pr-author 호출 reminder.
// PreToolUse:Bash matcher에서 command가 `gh pr create`를 포함하면 발화.
// 한계: 사용자가 직접 터미널에서 실행하는 경우는 본 hook 작동 안 함 (인간 행동 영역).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

const PR_CREATE_RE = /\bgh\s+pr\s+create\b/i;
const CWD_KEY = createHash("sha1").update(process.cwd()).digest("hex").slice(0, 8);
const STATE_FILE = path.join(os.tmpdir(), `dnchurch-check-pr-before-create.${CWD_KEY}.state.json`);
const DEBOUNCE_MS = 5 * 60 * 1000; // 5분 내 같은 세션 재발화 안 함

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
      hookEventName: "PreToolUse",
      additionalContext: message,
    },
  }));
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
const command = String(input.command ?? "");

if (!PR_CREATE_RE.test(command)) process.exit(0);

const sessionId = String(payload.session_id ?? payload.sessionId ?? "default");
const state = readState();
const lastFired = state[sessionId] ?? 0;
const now = Date.now();

if (now - lastFired < DEBOUNCE_MS) process.exit(0);

state[sessionId] = now;
writeState(state);

emitContext(
  "[hook:check-pr-before-create]\n" +
    "gh pr create 실행 감지. commit-pr-author 호출로 PR 본문·label·assignee·template draft 먼저 검토 권장.\n" +
    "본문 SSOT: `.claude/skills/writing-style/SKILL.md`. 메타데이터 정책: `--assignee \"@me\"`·`--label` 필수, base는 develop.\n" +
    "claude-code 워크플로우: doc-editor → exec-plan 정리 → commit-pr-author → gh pr create.",
);
