#!/usr/bin/env node
import { stdin, stdout } from "node:process";
import { ADR_TRIGGER_PARTS } from "../../scripts/_shared-config.mjs";

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

function collectPaths(value, result = []) {
  if (value == null) return result;
  if (typeof value === "string") {
    const normalized = value.replaceAll("\\", "/");
    if (/\.(tsx?|jsx?|mjs|json|md|scss|css)$/.test(normalized)) result.push(normalized);
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, result);
    return result;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) collectPaths(item, result);
  }
  return result;
}

const payload = await readInput();
const input = payload.tool_input ?? payload.toolInput ?? {};
const paths = [...new Set(collectPaths(input))];
const hits = paths.filter((file) => ADR_TRIGGER_PARTS.some((part) => file.includes(part)));

if (hits.length > 0 && !hits.some((file) => file.startsWith("docs/decisions/"))) {
  emitContext(
    "[hook:check-adr-needed]\n" +
      "ADR 후보 변경이 감지되었습니다.\n" +
      `감지 파일: ${hits.slice(0, 8).join(", ")}${hits.length > 8 ? " ..." : ""}\n` +
      "구조, 라이브러리, 레이어 경계, 검증 정책, 에이전트 협업 정책을 바꾸는 변경이면 `node scripts/start-adr.mjs <slug>`로 ADR을 작성하세요.\n" +
      "일회성 구현 판단이면 exec-plan의 `## ADR 판단` 섹션에 `불필요`와 사유를 남기세요.",
  );
}
