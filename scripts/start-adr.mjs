#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail("Usage: node scripts/start-adr.mjs <slug>\nslug은 소문자·숫자·하이픈만 허용합니다.");
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const decisionsDir = path.join(repoRoot, "docs", "decisions");
const template = path.join(decisionsDir, "_template.md");

if (!existsSync(template)) fail(`Error: ADR template 없음: ${template}`);

mkdirSync(decisionsDir, { recursive: true });

let maxNum = 0;
for (const name of readdirSync(decisionsDir)) {
  const match = /^(\d{4})-.+\.md$/.exec(name);
  if (!match) continue;
  const num = Number.parseInt(match[1], 10);
  if (num > maxNum) maxNum = num;
}

const next = String(maxNum + 1).padStart(4, "0");
const filename = `${next}-${slug}.md`;
const target = path.join(decisionsDir, filename);

if (existsSync(target)) fail(`Error: 이미 존재함: docs/decisions/${filename}`);

const title = slug.replaceAll("-", " ");
const content = readFileSync(template, "utf8")
  .replace("# NNNN — <결정 제목>", `# ${next} — ${title}`)
  .replace("- **Date**: YYYY-MM-DD", `- **Date**: ${localDate()}`);

writeFileSync(target, content, "utf8");

console.log(`✓ ADR 생성됨: docs/decisions/${filename}`);
console.log("");
console.log("다음 단계:");
console.log("  1. Context / Decision / Consequences를 채우기");
console.log("  2. node scripts/update-adr-index.mjs 실행");
console.log("  3. 관련 EXEC_PLAN References에 ADR 링크 추가");
