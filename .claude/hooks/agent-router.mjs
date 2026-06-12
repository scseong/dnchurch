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

const codexSignals = [];
for (const [pattern, label] of patterns) {
  if (pattern.test(text)) codexSignals.push(label);
}

const styleKeywords = /scss|module\.scss|스타일|색상|컬러|배경|폰트|토큰|token|믹스인|mixin|반응형|레이아웃|border|padding|margin|className|클래스|디자인|UI|ui/i;
const needsStyleSkill = styleKeywords.test(text);

// 신규 writer 에이전트 위임 키워드 — 구체적 패턴만 (모호한 "검토"·"리뷰"는 codex 위임 패턴과 겹쳐 제외).
const writerAgentPatterns = [
  [/plan\s*검토|이\s*plan|exec-plan\s*검토|ADR\s*검토|문서\s*점검|codex\s*결과\s*정리|tech-debt\s*형식|의사결정\s*로그\s*검토/i, "doc-editor (문서 표현 점검)"],
  [/커밋\s*도와|commit\s*도와|commit\s*message\s*(draft|작성)|커밋\s*메시지\s*(draft|작성)|PR\s*만들어|PR\s*생성|PR\s*본문|풀\s*리퀘스트|pull\s*request\s*(만들|생성|작성)/i, "commit-pr-author (commit/PR 초안)"],
];

const writerSignals = [];
for (const [pattern, label] of writerAgentPatterns) {
  if (pattern.test(text)) writerSignals.push(label);
}

const messages = [];

if (codexSignals.length > 0) {
  const uniqueSignals = [...new Set(codexSignals)].join(", ");
  messages.push(
    "[hook:agent-router]\n" +
      `이 사용자 요청은 Codex 위임 후보입니다. 감지된 신호: ${uniqueSignals}.\n` +
      "ADR 0001 기준으로 구현 전에 `codex:rescue` 상담을 검토하세요. " +
      "Codex에 질의할 때는 영어로 요청하고, 사용자에게는 한국어로 요약하세요."
  );
}

if (writerSignals.length > 0) {
  const uniqueSignals = [...new Set(writerSignals)].join(", ");
  messages.push(
    "[hook:agent-router]\n" +
      `신규 writer 에이전트 위임 후보: ${uniqueSignals}.\n` +
      "claude-code가 Agent 도구로 호출 — `Agent(subagent_type: \"doc-editor\")` 또는 `Agent(subagent_type: \"commit-pr-author\")`. " +
      "SSOT: `.claude/skills/writing-style/SKILL.md` (작성용 단일 SSOT). " +
      "commit-pr-author는 PreToolUse:Bash hook(check-pr-before-create)이 `gh pr create` 직전 추가 reminder."
  );
}

if (needsStyleSkill) {
  messages.push(
    "[hook:agent-router]\n" +
      "SCSS/스타일 작업이 감지되었습니다. 구현 전 `.claude/skills/styles/SKILL.md`를 반드시 읽으세요.\n" +
      "primitive 토큰($beige-*, $gray-*, $gold-*, $navy-*) 직접 사용 금지 — 반드시 semantic 토큰으로 참조하세요."
  );
}

if (messages.length > 0) {
  emitContext(messages.join("\n\n"));
}
