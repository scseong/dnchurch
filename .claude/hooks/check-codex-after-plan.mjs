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
      `active EXEC_PLAN이 작성 또는 수정되었습니다: ${normalizedPath}.\n` +
      "구현 전에 Codex 계획 검증을 요청하세요. 기대 흐름은 `Claude 계획 -> Codex 계획 검증 -> Claude 구현`입니다.\n\n" +
      "권장 Codex 요청:\n" +
      "Please review this implementation plan before coding. Apply the 5-criterion guardrail lens: " +
      "(1) Are assumptions explicit? (2) Are non-goals listed? (3) Does change scope link directly to the request without creeping additions? " +
      "(4) Are success criteria and verification commands concrete? (5) Are new abstractions, libraries, or data-flow changes excessive? " +
      "Also check architecture boundaries, step order, hidden risks, missing verification, and whether the plan should be split. " +
      "Return one of PASS, CHANGE_REQUEST, or BLOCK. Respond in Korean.\n\n" +
      "검증 후 exec-plan의 `## Codex 계획 검증` 섹션에 결론, 핵심 지적, 반영 내용을 기록하세요.",
  );
}
