#!/usr/bin/env node
import { stdin, stdout } from "node:process";

const ADR_WORTHY_PATTERNS = [
  /(^|\/)docs\/ARCHITECTURE\.md$/,
  /(^|\/)docs\/references\/constraints\.md$/,
  /(^|\/)package(-lock)?\.json$/,
  /(^|\/)next\.config\.(ts|js|mjs)$/,
  /(^|\/)eslint\.config\.mjs$/,
  /(^|\/)src\/lib\/supabase\//,
  /(^|\/)src\/actions\//,
  /(^|\/)src\/services\//,
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

const payload = await readInput();
const filePath = getFilePath(payload);

if (filePath && ADR_WORTHY_PATTERNS.some((pattern) => pattern.test(filePath))) {
  emitContext(
    "[hook:check-adr-needed]\n" +
      `ADR 후보 파일 변경이 감지되었습니다: \`${filePath}\`.\n` +
      "구조 결정, 라이브러리 선택, 패턴 변경, 환경/배포 모델 변경이라면 ADR을 작성하세요. " +
      "명령: `node scripts/start-adr.mjs <decision-slug>` 후 `node scripts/update-adr-index.mjs`.",
  );
}
