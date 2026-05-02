#!/usr/bin/env node
import { stdin, stdout } from "node:process";

const VERIFY_COMMAND_RE =
  /(yarn|npm|pnpm|npx)\s+(run\s+)?(verify|build|lint|test|typecheck|knip)|(next\s+build|eslint|stylelint|tsc|vitest|jest|playwright)/i;

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
      hookEventName: "PostToolUseFailure",
      additionalContext: message,
    },
  }));
}

const payload = await readInput();
const command = String((payload.tool_input ?? {}).command ?? "");

if (VERIFY_COMMAND_RE.test(command)) {
  emitContext(
    "[hook:post-test-analysis]\n" +
      `검증 명령 실패가 감지되었습니다: \`${command}\`.\n` +
      "원인이 즉시 명확하지 않거나 첫 수정 후에도 실패하면 Codex에 실패 로그 분석을 맡길 타이밍입니다. " +
      "요청 시 실패 명령, 핵심 로그, 관련 변경 파일, 기존 tech-debt 여부를 함께 전달하세요.",
  );
}
