#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

const CRITICAL_PARTS = [
  "eslint.config.",
  "next.config.",
  "package.json",
  "src/lib/supabase/",
  "src/actions/",
  "src/apis/",
  "src/services/",
  "docs/decisions/",
];

const STATE_FILE = path.join(os.tmpdir(), "dnchurch-post-impl-review.state");

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

function changedFiles(cwd) {
  const names = new Set();
  const commands = [
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
  ];

  for (const args of commands) {
    try {
      const output = execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      for (const line of output.split(/\r?\n/)) {
        const file = line.trim().replaceAll("\\", "/");
        if (file) names.add(file);
      }
    } catch {
      // Hook suggestions should never block editing.
    }
  }

  return [...names];
}

function changedFilesFromToolInput(input) {
  const raw = String(input.file_path ?? input.path ?? input.filePath ?? "");
  return raw ? [raw.replaceAll("\\", "/")] : [];
}

function collectChangedFiles(cwd, input) {
  const files = new Set([...changedFiles(cwd), ...changedFilesFromToolInput(input)]);
  return [...files];
}

function stateFingerprint(files) {
  return [...files].sort().join(",");
}

function readLastState() {
  try { return readFileSync(STATE_FILE, "utf8").trim(); } catch { return ""; }
}

function writeState(fingerprint) {
  try { writeFileSync(STATE_FILE, fingerprint); } catch {}
}

const payload = await readInput();
const cwd = payload.cwd || process.cwd();
const files = collectChangedFiles(cwd, payload.tool_input ?? payload.toolInput ?? {});
const critical = files.filter((file) => CRITICAL_PARTS.some((part) => file.includes(part)));

if (files.length >= 8 || critical.length >= 2) {
  const fingerprint = stateFingerprint(files);
  const lastState = readLastState();

  if (fingerprint === lastState) {
    // 동일한 diff 상태 — 이미 알림을 보냈으므로 skip
    process.exit(0);
  }

  writeState(fingerprint);

  emitContext(
    "[hook:post-implementation-review]\n" +
      `변경 ${files.length}개·고위험 ${critical.length}개. Codex 1차 검증 권장.\n` +
      "확인: 버그·타입·레이어·외과적 변경. 직접 수정은 국소 버그/타입/guard.\n" +
      "기록: active exec-plan `## Codex 1차 검증` / `## Claude 2차 검증`.",
  );
}
