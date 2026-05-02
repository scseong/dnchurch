#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ADR_TRIGGER_PARTS } from "./_shared-config.mjs";

const taskPattern = process.argv[2] ?? process.env.TASK_ID ?? "";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function gitLines(args) {
  try {
    return git(args)
      .split(/\r?\n/)
      .map((line) => line.trim().replaceAll("\\", "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
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

function findActivePlan(repoRoot, pattern) {
  const activeDir = path.join(repoRoot, "docs", "exec-plans", "active");
  if (!existsSync(activeDir)) fail(`active exec-plan 디렉토리가 없습니다: ${activeDir}`);

  const matches = readdirSync(activeDir)
    .filter((name) => name.endsWith(".md") && name.includes(pattern))
    .sort();

  if (matches.length === 0) fail(`매칭되는 active exec-plan이 없습니다: *${pattern}*.md`);
  if (matches.length > 1) {
    fail(`여러 active exec-plan이 매칭됩니다. 더 구체적인 task id를 사용하세요:\n${matches.map((name) => `  - ${name}`).join("\n")}`);
  }

  return path.join(activeDir, matches[0]);
}

function assertReviewSections(content, filename) {
  const required = [
    ["Codex 계획 검증", /결론\*\*: 미요청|상태\*\*: 미요청/],
    ["Codex 1차 검증", /결론\*\*: 미요청|상태\*\*: 미요청/],
    ["Claude 2차 검증", /검토 내용\*\*:\s*$|실행한 검증\*\*:\s*$|최종 판단\*\*:\s*$/m],
  ];

  for (const [heading, pendingPattern] of required) {
    const body = sectionBody(content, heading);
    if (!body) fail(`${filename}: ## ${heading} 섹션이 없습니다.`);
    if (pendingPattern.test(body)) fail(`${filename}: ## ${heading} 섹션이 미작성 상태입니다.`);
  }
}

function assertAdrDecision(content, filename) {
  const changedFiles = [
    ...new Set([
      ...gitLines(["diff", "--name-only"]),
      ...gitLines(["diff", "--cached", "--name-only"]),
    ]),
  ];
  const adrRiskFiles = changedFiles.filter((file) =>
    ADR_TRIGGER_PARTS.some((part) => file.includes(part))
  );
  const adrChanged = changedFiles.some((file) => file.startsWith("docs/decisions/"));

  if (adrRiskFiles.length === 0 || adrChanged) return;

  const body = sectionBody(content, "ADR 판단");
  if (!body) fail(`${filename}: ADR 후보 변경이 있지만 ## ADR 판단 섹션이 없습니다.`);
  if (/필요 여부\*\*: 미검토/.test(body)) {
    fail(`${filename}: ADR 후보 변경이 있지만 ADR 판단이 미검토 상태입니다.\nADR 후보 파일: ${adrRiskFiles.slice(0, 8).join(", ")}${adrRiskFiles.length > 8 ? " ..." : ""}`);
  }
}

function assertVerification(taskId) {
  const result = spawnSync(process.execPath, ["scripts/enforce-verification.mjs", taskId], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, VERIFY_ENFORCE: "1" },
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!taskPattern) {
  fail("Usage: node scripts/harness-gate.mjs <task-id-or-active-plan-pattern>");
}

if (/[^a-zA-Z0-9_.-]/.test(taskPattern)) {
  fail(`task id는 영숫자·_·.·-만 허용합니다. 입력: ${taskPattern}`);
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
process.chdir(repoRoot);

const planPath = findActivePlan(repoRoot, taskPattern);
const filename = path.basename(planPath);
const content = readFileSync(planPath, "utf8");

assertReviewSections(content, filename);
assertAdrDecision(content, filename);
assertVerification(taskPattern);

console.log(`✓ 하네스 게이트 통과: ${filename}`);
