#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import process from "node:process";

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

let branch = "";
try {
  branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
} catch {
  process.exit(0);
}

if (branch !== "main") process.exit(0);

let staged = "";
try {
  staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
} catch {
  process.exit(0);
}

const srcChanges = staged
  .split(/\r?\n/)
  .map((line) => line.trim().replaceAll("\\", "/"))
  .filter((file) => file === "src" || file.startsWith("src/"));

if (srcChanges.length === 0) process.exit(0);

console.error("Error: main 브랜치에서 src/ 직접 수정 커밋은 금지됩니다.");
console.error("");
console.error("감지된 staged src/ 변경:");
for (const file of srcChanges) console.error(`  - ${file}`);
console.error("");
console.error("작업 브랜치를 만든 뒤 커밋하세요. 예: git switch -c feat/<slug>");
process.exit(1);
