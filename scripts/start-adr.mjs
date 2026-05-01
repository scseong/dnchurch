#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const slug = process.argv[2] ?? "";

function fail(message) {
  console.error(message);
  exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail("Usage: node scripts/start-adr.mjs <slug>\nslug은 소문자·숫자·하이픈만 허용합니다.");
}

const root = cwd();
const decisionsDir = join(root, "docs", "decisions");
const templatePath = join(decisionsDir, "_template.md");

if (!existsSync(templatePath)) {
  fail(`ADR template 없음: ${templatePath}`);
}

mkdirSync(decisionsDir, { recursive: true });

const existingNumbers = readdirSync(decisionsDir)
  .map((name) => name.match(/^(\d{4})-/)?.[1])
  .filter(Boolean)
  .map(Number);

const nextNumber = String((existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1).padStart(4, "0");
const filename = `${nextNumber}-${slug}.md`;
const targetPath = join(decisionsDir, filename);

if (existsSync(targetPath)) {
  fail(`이미 존재함: docs/decisions/${filename}`);
}

const date = new Date().toISOString().slice(0, 10);
const title = slug.replaceAll("-", " ");
const content = readFileSync(templatePath, "utf8")
  .replace("# NNNN — <결정 제목>", `# ${nextNumber} — ${title}`)
  .replace("- **Date**: YYYY-MM-DD", `- **Date**: ${date}`);

writeFileSync(targetPath, content, "utf8");

console.log(`✓ ADR 생성됨: docs/decisions/${filename}`);
console.log("");
console.log("다음 단계:");
console.log("  1. Context / Decision / Consequences를 채우기");
console.log("  2. node scripts/update-adr-index.mjs 실행");
console.log("  3. 관련 EXEC_PLAN References에 ADR 링크 추가");
