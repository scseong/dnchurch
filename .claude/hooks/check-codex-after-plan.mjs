#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { stdin, stdout } from "node:process";

const PLAN_PATH_RE = /docs[\\/]+exec-plans[\\/]+active[\\/]+.+\.md$/i;

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

function isAlreadyReviewed(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const body = sectionBody(content, "Codex 계획 검증");
    return /\*\*결론\*\*:\s*(PASS|CHANGE_REQUEST|BLOCK)/.test(body);
  } catch {
    return false;
  }
}

const payload = await readInput();
const input = payload.tool_input ?? payload.toolInput ?? {};
const candidatePath = String(input.file_path ?? input.path ?? input.filePath ?? "");
const normalizedPath = candidatePath.replaceAll("\\", "/");

const isActivePlan = PLAN_PATH_RE.test(normalizedPath);

if (isActivePlan && !isAlreadyReviewed(candidatePath)) {
  emitContext(
    "[hook:check-codex-after-plan]\n" +
      `active EXEC_PLAN 작성/수정: ${normalizedPath}.\n` +
      "구현 전 Codex 계획 검증 권장. 결론은 PASS/CHANGE_REQUEST/BLOCK.\n" +
      "기록: exec-plan `## Codex 계획 검증`.",
  );
}
