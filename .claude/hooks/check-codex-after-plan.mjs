#!/usr/bin/env node
import { readFileSync } from "node:fs";
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

function getFilePath(payload) {
  const toolInput = payload.tool_input ?? {};
  const rawPath = toolInput.file_path ?? toolInput.path;
  return rawPath ? String(rawPath).replaceAll("\\", "/") : null;
}

function isActiveExecPlan(path) {
  return path.includes("/docs/exec-plans/active/") || path.startsWith("docs/exec-plans/active/");
}

function scorePlan(content) {
  let score = 0;
  const reasons = [];

  const checklistCount = [...content.matchAll(/^\s*-\s+\[[ xX]\]/gm)].length;
  if (checklistCount >= 4) {
    score += 1;
    reasons.push(`체크리스트 ${checklistCount}개`);
  }

  const layerHits = ["apis", "services", "actions", "app"].filter((layer) =>
    new RegExp(`\\b${layer}\\b`).test(content),
  );
  if (layerHits.length >= 2) {
    score += 1;
    reasons.push("여러 레이어 영향");
  }

  const lower = content.toLowerCase();
  const riskTerms = ["adr", "아키텍처", "architecture", "migration", "마이그레이션", "supabase", "auth", "cache", "리팩터", "refactor"];
  if (riskTerms.some((term) => lower.includes(term.toLowerCase()))) {
    score += 1;
    reasons.push("설계/마이그레이션 키워드 포함");
  }

  const affectedFiles = [...content.matchAll(/`([^`]+\.(?:ts|tsx|scss|mjs|json|md))`/g)].map((match) => match[1]);
  if (new Set(affectedFiles).size >= 3) {
    score += 1;
    reasons.push(`영향 파일 ${new Set(affectedFiles).size}개 이상`);
  }

  return { score, reasons };
}

const payload = await readInput();
const filePath = getFilePath(payload);
if (filePath && isActiveExecPlan(filePath)) {
  let content = "";
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    content = "";
  }

  if (content.includes("## 단계별 체크리스트") && content.includes("## 접근법")) {
    const { score, reasons } = scorePlan(content);
    if (score > 0) {
      emitContext(
        "[hook:check-codex-after-plan]\n" +
          `EXEC_PLAN \`${filePath}\` 작성/수정이 감지되었습니다. 감지 사유: ${reasons.join(", ")}.\n` +
          "구현 전에 Codex 계획 리뷰를 검토하세요. 권장 질문: " +
          "\"Please review this implementation plan before coding. Focus on architecture boundaries, step order, scope split, hidden risks, and verification gaps.\"",
      );
    }
  }
}
