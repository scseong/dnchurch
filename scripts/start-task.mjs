#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const slug = process.argv[2] ?? "";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function localDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

if (!slug) {
  fail("Usage: node scripts/start-task.mjs <task-slug>\n  예: node scripts/start-task.mjs sermon-empty-state");
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail(`Error: slug은 소문자·숫자·하이픈만 허용 (시작은 영숫자).\n  입력: ${slug}`);
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const template = path.join(repoRoot, "docs", "exec-plans", "_template.md");
const activeDir = path.join(repoRoot, "docs", "exec-plans", "active");
const date = localDate();
const target = path.join(activeDir, `${date}-${slug}.md`);

if (!existsSync(template)) fail(`Error: template 없음: ${template}`);
if (existsSync(target)) {
  fail(`Error: 이미 존재함: ${target}\n       다른 slug을 쓰거나 기존 파일을 사용하세요.`);
}

mkdirSync(activeDir, { recursive: true });

let content = readFileSync(template, "utf8")
  .replace(/^# <작업 제목>$/m, `# ${slug}`)
  .replace(/^- \*\*시작일\*\*: YYYY-MM-DD$/m, `- **시작일**: ${date}`);

try {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch && branch !== "HEAD") {
    content = content.replace(/^- \*\*브랜치\*\*: feat\/\.\.\.$/m, `- **브랜치**: ${branch}`);
  }
} catch {
  // Branch is helpful metadata, not a reason to block plan creation.
}

writeFileSync(target, content, "utf8");

const relPath = path.relative(repoRoot, target).replaceAll("\\", "/");
console.log(`✓ EXEC_PLAN 생성됨: ${relPath}`);
console.log("");
console.log("다음 단계:");
console.log("  1. 파일 열어서 목표·접근법·체크리스트 채우기");
console.log("  2. 구현 전 Codex 계획 검증 요청");
console.log(`  3. 머지 후: node scripts/complete-task.mjs ${slug}`);
