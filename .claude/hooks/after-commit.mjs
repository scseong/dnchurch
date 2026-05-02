#!/usr/bin/env node
import { stdin, stdout } from "node:process";

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

const payload = await readInput();
const command = String((payload.tool_input ?? {}).command ?? "");

if (!command.includes("git commit")) process.exit(0);

const match = command.match(/git commit/);
if (!match) process.exit(0);

emitContext(
  "[hook:after-commit]\n" +
    "git commit 실행이 감지되었습니다.\n" +
    "커밋 완료 후 exec-plan을 업데이트하세요:\n" +
    "  1. 단계별 체크리스트 커밋 항목 → [x] (커밋 SHA 기록)\n" +
    "  2. 문서 상단 `- **상태**: 🟡 진행 중` → `✅ 완료`로 변경 (머지 후 complete-task 전까지는 유지)\n" +
    "  3. 머지 후에는 `node scripts/complete-task.mjs <task-id>` 실행 → active → completed 이동 + 회고 작성",
);
