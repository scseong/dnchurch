#!/usr/bin/env node
import { stdin, stdout } from "node:process";

const HIGH_RISK_PATTERNS = [
  /(^|\/)eslint\.config\.mjs$/,
  /(^|\/)next\.config\.(ts|js|mjs)$/,
  /(^|\/)package(-lock)?\.json$/,
  /(^|\/)middleware\.ts$/,
  /(^|\/)proxy\.ts$/,
  /(^|\/)src\/lib\/supabase\//,
  /(^|\/)src\/actions\//,
  /(^|\/)src\/apis\//,
  /(^|\/)src\/services\//,
  /(^|\/)docs\/decisions\//,
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

function getFilePath(payload) {
  const toolInput = payload.tool_input ?? {};
  const rawPath = toolInput.file_path ?? toolInput.path;
  return rawPath ? String(rawPath).replaceAll("\\", "/") : null;
}

function isHighRisk(path) {
  if (path.includes("/docs/exec-plans/active/") || path.startsWith("docs/exec-plans/active/")) {
    return false;
  }
  return HIGH_RISK_PATTERNS.some((pattern) => pattern.test(path));
}

const payload = await readInput();
const filePath = getFilePath(payload);

if (filePath && isHighRisk(filePath)) {
  const reason =
    `고위험 파일 \`${filePath}\` 편집 전입니다. ` +
    "레이어 경계, 설정, Supabase, ADR에 영향을 줄 수 있으므로 Codex 상담 또는 계획 리뷰가 적절한지 확인하세요.";

  stdout.write(JSON.stringify({
    continue: true,
    suppressOutput: false,
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
    },
  }));
}
