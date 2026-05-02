#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ADR_TRIGGER_PARTS } from "./_shared-config.mjs";

const pattern = process.argv[2] ?? "";
const harnessEnforce = process.env.HARNESS_ENFORCE === "1";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function warnOrFail(message) {
  if (harnessEnforce) fail(message);
  console.warn(message);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
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

if (!pattern) {
  fail("Usage: node scripts/complete-task.mjs <slug-or-pattern>\n  예: node scripts/complete-task.mjs sermon-empty-state");
}

if (/[^a-zA-Z0-9_.-]/.test(pattern)) {
  fail(`Error: PATTERN은 영숫자·_·.·-만 허용 (slug 또는 그 일부).\n  입력: ${pattern}`);
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const activeDir = path.join(repoRoot, "docs", "exec-plans", "active");
const completedDir = path.join(repoRoot, "docs", "exec-plans", "completed");

if (!existsSync(activeDir)) fail(`Error: active/ 디렉토리 없음: ${activeDir}`);

function slugFromFilename(name) {
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

const allMd = readdirSync(activeDir).filter((name) => name.endsWith(".md")).sort();
const matches = allMd.filter((name) => slugFromFilename(name) === pattern);

if (matches.length === 0) {
  const available = allMd.map(slugFromFilename);
  console.error(`Error: 매칭되는 EXEC_PLAN 없음: ${pattern}`);
  console.error("");
  console.error("현재 active slugs:");
  if (available.length === 0) console.error("  (없음)");
  for (const slug of available) console.error(`  - ${slug}`);
  process.exit(1);
}

const filename = matches[0];
const source = path.join(activeDir, filename);
const target = path.join(completedDir, filename);
const content = readFileSync(source, "utf8");

if (/^- YYYY-MM-DD: \.\.\.$/m.test(content)) {
  fail(`Error: 의사결정 로그 placeholder가 남아 있습니다.\n       결정이 없었다면 '- 해당 없음'으로 명시하세요: ${filename}`);
}

if (
  /^- 잘된 것:\s*$/m.test(content) ||
  /^- 다음에 할 것:\s*$/m.test(content) ||
  /^- 발견된 부채 \(→ tech-debt-tracker\.md 옮길 것\):\s*$/m.test(content)
) {
  console.warn(`⚠ 회고 섹션이 비어 있습니다: ${filename}`);
  console.warn("  이동 후 바로 completed/ 파일에 회고를 작성하세요.");
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

const planReview = sectionBody(content, "Codex 계획 검증");
const firstPassReview = sectionBody(content, "Codex 1차 검증");
const secondPassReview = sectionBody(content, "Claude 2차 검증");
const adrReview = sectionBody(content, "ADR 판단");

if (!planReview) {
  warnOrFail(`⚠ Codex 계획 검증 섹션이 없습니다: ${filename}\n  새 템플릿 기준으로 ## Codex 계획 검증 섹션을 추가하세요.`);
} else if (/결론\*\*: 미요청|상태\*\*: 미요청/.test(planReview)) {
  warnOrFail(`⚠ Codex 계획 검증 결과가 미작성 상태입니다: ${filename}`);
}

if (!firstPassReview) {
  warnOrFail(`⚠ Codex 1차 검증 섹션이 없습니다: ${filename}\n  새 템플릿 기준으로 ## Codex 1차 검증 섹션을 추가하세요.`);
} else if (/결론\*\*: 미요청|상태\*\*: 미요청/.test(firstPassReview)) {
  warnOrFail(`⚠ Codex 1차 검증 결과가 미작성 상태입니다: ${filename}`);
}

if (!secondPassReview) {
  warnOrFail(`⚠ Claude 2차 검증 섹션이 없습니다: ${filename}\n  새 템플릿 기준으로 ## Claude 2차 검증 섹션을 추가하세요.`);
} else if (/검토 내용\*\*:\s*$|실행한 검증\*\*:\s*$|최종 판단\*\*:\s*$/m.test(secondPassReview)) {
  warnOrFail(`⚠ Claude 2차 검증 결과가 미작성 상태입니다: ${filename}`);
}

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

if (adrRiskFiles.length > 0 && !adrChanged) {
  if (!adrReview) {
    warnOrFail(
      `⚠ ADR 판단 섹션이 없습니다: ${filename}\n` +
        `  ADR 후보 변경: ${adrRiskFiles.slice(0, 8).join(", ")}${adrRiskFiles.length > 8 ? " ..." : ""}\n` +
        "  새 템플릿 기준으로 ## ADR 판단 섹션을 추가하고 필요/불필요와 사유를 기록하세요.",
    );
  } else if (/필요 여부\*\*: 미검토/.test(adrReview)) {
    warnOrFail(
      `⚠ ADR 판단이 미검토 상태입니다: ${filename}\n` +
        `  ADR 후보 변경: ${adrRiskFiles.slice(0, 8).join(", ")}${adrRiskFiles.length > 8 ? " ..." : ""}`,
    );
  }
}

if (existsSync(target)) fail(`Error: completed/ 에 동일 파일 존재: ${filename}`);

mkdirSync(completedDir, { recursive: true });
renameSync(source, target);

const relPath = path.relative(repoRoot, target).replaceAll("\\", "/");
console.log(`✓ 이동 완료: ${relPath}`);
console.log("");
console.log("다음 단계:");
console.log('  1. 파일 열어서 "회고" 섹션 작성 (잘된 것 / 다음에 할 것 / 부채)');
console.log("  2. 발견된 부채는 docs/tech-debt-tracker.md에 등록");
console.log("  3. git add docs/exec-plans/ && 커밋");
