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
      hookEventName: "UserPromptSubmit",
      additionalContext: message,
    },
  }));
}

const payload = await readInput();
const prompt = String(payload.prompt ?? payload.message ?? "");
const text = prompt.toLowerCase();

const patterns = [
  [/설계|아키텍처|구조|패턴|책임|레이어|architecture|design|pattern|layer/i, "설계 판단"],
  [/트레이드오프|비교|a\s*vs\s*b|어느 쪽|대안|trade[- ]?off|alternative/i, "트레이드오프 분석"],
  [/막혔|원인.*모르|계속 실패|안\s*돼|디버깅|debug|root cause|stuck/i, "막힌 디버깅"],
  [/리뷰|검토|review|객관|bias|바이어스/i, "객관 리뷰"],
  [/리팩터|마이그레이션|migration|refactor|대규모|큰 변경/i, "큰 변경"],
];

const signals = [];
for (const [pattern, label] of patterns) {
  if (pattern.test(text)) signals.push(label);
}

if (signals.length > 0) {
  const uniqueSignals = [...new Set(signals)].join(", ");
  emitContext(
    "[hook:agent-router]\n" +
      `이 사용자 요청은 Codex 위임 후보입니다. 감지된 신호: ${uniqueSignals}.\n` +
      "ADR 0001 기준으로 구현 전에 `codex:rescue` 상담을 검토하세요. " +
      "Codex에 질의할 때는 영어로 요청하고, 사용자에게는 한국어로 요약하세요.",
  );
}
