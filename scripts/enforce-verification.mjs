#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";

const taskId = process.env.TASK_ID ?? process.argv[2] ?? "";
const enforce = process.env.VERIFY_ENFORCE === "1";
const root = cwd();
const logsRoot = join(root, "logs");

function warn(message) {
  console.error(message);
  if (enforce) exit(1);
}

function gitHashDiff(args) {
  try {
    const diff = execFileSync("git", args, { cwd: root, encoding: "buffer" });
    return execFileSync("git", ["hash-object", "--stdin"], {
      cwd: root,
      input: diff,
      encoding: "utf8",
    }).trim();
  } catch (error) {
    warn(`⚠ git diff hash 계산에 실패했습니다: ${error.message}`);
    exit(0);
  }
}

const currentHash = gitHashDiff(["diff", "--binary"]);
const stagedHash = gitHashDiff(["diff", "--cached", "--binary"]);

function latestPaths() {
  if (taskId) {
    return [join(logsRoot, taskId, "latest.json")];
  }

  if (!existsSync(logsRoot)) return [];
  return readdirSync(logsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(logsRoot, entry.name, "latest.json"))
    .filter((path) => existsSync(path));
}

const manifests = latestPaths()
  .map((path) => {
    try {
      return { path, manifest: JSON.parse(readFileSync(path, "utf8")) };
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .filter(({ manifest }) => manifest.status === "pass");

const match = manifests.find(({ manifest }) =>
  manifest.currentDiffHash === currentHash && manifest.stagedDiffHash === stagedHash,
);

if (!match) {
  const hint = taskId
    ? `TASK_ID=${taskId} bash scripts/verify-task.sh`
    : "TASK_ID=<task-id> bash scripts/verify-task.sh";
  warn(
    "⚠ 현재 diff와 일치하는 통과 검증 기록이 없습니다.\n" +
      `  다시 검증하세요: ${hint}`,
  );
  exit(0);
}

console.log(`✓ 검증 기록 확인: logs/${match.manifest.taskId}/${match.manifest.runId}`);
