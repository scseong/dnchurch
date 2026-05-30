#!/usr/bin/env node
// PR 생성 전 commit-pr-author 호출 reminder.
// PreToolUse:Bash matcher에서 command가 `gh pr create`를 포함하면 발화.
// 한계: 사용자가 직접 터미널에서 실행하는 경우는 본 hook 작동 안 함 (인간 행동 영역).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

// 명령 시작이 `gh pr create`인 경우만 매칭. anchor `^` + 선택 prefix(env·assignment) 허용.
// 한계: regex 기반이라 다음 케이스는 못 잡음 (false negative) — 본인 dogfood 사이클 + Codex 검증으로 인지:
//   - `cd /path && gh pr create ...` (compound)
//   - `$(gh pr create ...)` (subshell)
//   - `echo done; gh pr create` (역순 compound)
//   - `FOO=$(gh pr create ...)` (assignment + subshell)
// 완전 해결은 shell command lexer 필요 — 본 hook 범위 밖. 위 케이스는 사용자가 자발적 commit-pr-author 호출 권장.
// 단순 false positive(commit 메시지 본문에 트리거 문자열 우연 포함)는 본 anchor + firstLine 검사로 차단.
const PR_CREATE_RE = /^\s*(?:env\s+)?(?:\w+=[^\s]+\s+)*gh\s+pr\s+create\b/i;
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
  // PreToolUse:Bash 차단을 위해 permissionDecision: "ask"로 설정 — 사용자에게 명시 확인 요청.
  // additionalContext만으로는 reminder만 출력되고 Bash 실행 그대로 진행되어 의무 강제 X (Codex P2 리뷰 반영).
  stdout.write(JSON.stringify({
    continue: true,
    suppressOutput: true,
    additionalContext: message,
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: message,
      permissionDecision: "ask",
      permissionDecisionReason: message,
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

// 첫 줄만 검사. heredoc 본문(commit 메시지·PR 본문 등)에 "gh pr create" 문자열이 포함된 false positive 차단.
// 명령은 항상 첫 줄에 위치하고, heredoc 본문은 \n 이후라 첫 줄만 보면 실제 명령 의도 확인 가능.
const firstLine = command.split("\n")[0];
if (!PR_CREATE_RE.test(firstLine)) process.exit(0);

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
