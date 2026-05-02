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

if (!/\bnode\b.*verify-task\.mjs/.test(command)) process.exit(0);

const match = command.match(/verify-task\.mjs\s+([a-z0-9-]+)/);
const taskId = match ? match[1] : "<task-id>";

emitContext(
  "[hook:after-verify]\n" +
    `verify-task.mjs 실행이 감지되었습니다 (task: ${taskId}).\n` +
    "VERIFY 단계가 완료됐다면 exec-plan을 업데이트하세요:\n" +
    "  1. 단계별 체크리스트 VERIFY 항목 → [x]\n" +
    "  2. 완료 기준(DoD) 체크박스 — verify-task 통과, queueMicrotask 0건 등 달성된 항목 → [x]\n" +
    "  3. `## Claude 2차 검증` 섹션 — 검토 내용·실행한 검증·최종 판단 기록\n" +
    `파일 위치: docs/exec-plans/active/YYYY-MM-DD-${taskId}.md`,
);
