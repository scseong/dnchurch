#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { exit } from "node:process";

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
  exit(0);
}

if (branch !== "main") {
  exit(0);
}

let stagedFiles = [];
try {
  stagedFiles = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
    .split(/\r?\n/)
    .filter(Boolean);
} catch {
  exit(0);
}

const srcChanges = stagedFiles.filter((file) => file === "src" || file.startsWith("src/"));

if (srcChanges.length === 0) {
  exit(0);
}

console.error("Error: main 브랜치에서 src/ 직접 수정 커밋은 금지됩니다.");
console.error("");
console.error("감지된 staged src/ 변경:");
for (const file of srcChanges) {
  console.error(`  - ${file}`);
}
console.error("");
console.error("작업 브랜치를 만든 뒤 커밋하세요. 예: git switch -c feat/<slug>");
exit(1);
