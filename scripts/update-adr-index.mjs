#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function firstMatch(content, regex, fallback) {
  const match = regex.exec(content);
  return match?.[1]?.trim() || fallback;
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const decisionsDir = path.join(repoRoot, "docs", "decisions");
const readme = path.join(decisionsDir, "README.md");

if (!existsSync(readme)) fail("Error: docs/decisions/README.md 없음");

const rows = ["| 번호 | 제목 | 상태 | 날짜 |", "| --- | --- | --- | --- |"];
const adrFiles = readdirSync(decisionsDir)
  .filter((name) => /^\d{4}-.+\.md$/.test(name))
  .sort();

for (const name of adrFiles) {
  const content = readFileSync(path.join(decisionsDir, name), "utf8");
  const number = name.slice(0, 4);
  const title = firstMatch(content, /^# \d{4} — (.+)$/m, name.replace(/\.md$/, ""));
  const status = firstMatch(content, /^\s*- \*\*Status\*\*:\s*(.+)$/m, "Unknown");
  const date = firstMatch(content, /^\s*- \*\*Date\*\*:\s*(.+)$/m, "Unknown");
  rows.push(`| [${number}](${name}) | ${title} | ${status} | ${date} |`);
}

const original = readFileSync(readme, "utf8");
const index = `## 인덱스\n\n${rows.join("\n")}\n\n`;
let nextContent = "";

if (/^## 인덱스/m.test(original)) {
  const before = original.split(/^## 인덱스.*$/m)[0];
  const auditMatch = original.match(/^<!-- last-audit:.*$/ms);
  nextContent = `${before}${index}${auditMatch ? auditMatch[0] : ""}`;
} else {
  nextContent = `${original.trimEnd()}\n\n${index}`;
}

writeFileSync(readme, nextContent, "utf8");
console.log(`✓ ADR 인덱스 갱신됨: docs/decisions/README.md (${adrFiles.length}건)`);
