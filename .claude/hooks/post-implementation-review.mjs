#!/usr/bin/env node
import { execFileSync } from "node:child_process";
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
  try {
    const output = execFileSync("git", ["diff", "--name-only"], {
      cwd,
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output.split(/\r?\n/).map((line) => line.trim().replaceAll("\\", "/")).filter(Boolean);
  } catch {
    return [];
  }
}

const payload = await readInput();
const cwd = payload.cwd || process.cwd();
const files = changedFiles(cwd);
const critical = files.filter((file) => CRITICAL_PARTS.some((part) => file.includes(part)));

if (files.length >= 8 || critical.length >= 2) {
  emitContext(
    "[hook:post-implementation-review]\n" +
      `현재 diff가 넓거나 위험 파일을 포함합니다. 변경 파일 수: ${files.length}, 고위험 파일 수: ${critical.length}.\n` +
      "구현을 계속 확대하기 전에 Codex 객관 리뷰를 검토하세요. 특히 레이어 경계, 누락된 검증, 범위 분리 가능성을 확인하세요.",
  );
}
