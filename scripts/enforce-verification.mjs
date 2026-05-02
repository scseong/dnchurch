#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const taskId = process.argv[2] ?? process.env.TASK_ID ?? "";
const enforce = process.env.VERIFY_ENFORCE === "1";

function warn(message) {
  console.error(message);
  if (enforce) process.exit(1);
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: options.encoding ?? "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function diffHash(args) {
  const diff = spawnSync("git", args, { encoding: "buffer" });
  if (diff.status !== 0) throw new Error("git diff 실패");
  const hash = spawnSync("git", ["hash-object", "--stdin"], {
    input: diff.stdout,
    encoding: "utf8",
  });
  if (hash.status !== 0) throw new Error("git hash-object 실패");
  return hash.stdout.trim();
}

function latestCandidates(logsRoot) {
  if (!existsSync(logsRoot)) return [];
  const result = [];
  for (const entry of readdirSync(logsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (taskId && entry.name !== taskId && !entry.name.endsWith(`-${taskId}`)) continue;
    const latest = path.join(logsRoot, entry.name, "latest.json");
    if (existsSync(latest)) result.push(latest);
  }
  return result.sort();
}

let repoRoot;
try {
  repoRoot = String(git(["rev-parse", "--show-toplevel"])).trim();
} catch {
  warn("[UNKNOWN] git 저장소 루트를 확인할 수 없어 검증 기록을 확인하지 못했습니다.");
  process.exit(0);
}

let currentHash = "";
let stagedHash = "";
try {
  currentHash = diffHash(["diff", "--binary"]);
  stagedHash = diffHash(["diff", "--cached", "--binary"]);
} catch (error) {
  warn(`[UNKNOWN] diff hash 계산에 실패했습니다: ${error.message}`);
  process.exit(0);
}

let headSha = "";
try {
  headSha = String(git(["rev-parse", "HEAD"])).trim();
} catch { /* HEAD 없는 빈 저장소 등 예외 상황 */ }

const EMPTY_HASH = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391";
const isCleanTree = currentHash === EMPTY_HASH && stagedHash === EMPTY_HASH;

const logsRoot = path.join(repoRoot, "logs");
const candidates = latestCandidates(logsRoot);

for (const manifestPath of candidates) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.status !== "pass") continue;
    if (manifest.currentDiffHash === currentHash && manifest.stagedDiffHash === stagedHash) {
      console.log(`✓ 검증 기록 확인: ${manifest.log ?? manifestPath}`);
      process.exit(0);
    }
    if (isCleanTree && headSha && manifest.head === headSha) {
      console.log(`✓ 검증 기록 확인 (clean tree, HEAD ${headSha.slice(0, 8)}): ${manifest.log ?? manifestPath}`);
      process.exit(0);
    }
  } catch {
    // Ignore malformed local evidence files.
  }
}

const hint = taskId
  ? `node scripts/verify-task.mjs ${taskId}`
  : "node scripts/verify-task.mjs <task-id>";

warn(`⚠ 현재 diff와 일치하는 통과 검증 기록이 없습니다.\n  다시 검증하세요: ${hint}`);
process.exit(0);
