#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const taskId = process.argv[2] ?? process.env.TASK_ID ?? "manual";

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

function timestampCompact() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "").replace("T", "-");
}

function isoNow() {
  return new Date().toISOString();
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

function writePatch(args, filePath) {
  const diff = spawnSync("git", args, { encoding: "buffer" });
  writeFileSync(filePath, diff.stdout ?? Buffer.alloc(0));
}

function packageRunner() {
  const candidates = [];

  if (process.env.npm_execpath) candidates.push(process.env.npm_execpath);
  if (process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, "npm", "node_modules", "yarn", "bin", "yarn.js"));
  }

  for (const candidate of candidates) {
    if (candidate && candidate.endsWith(".js") && existsSync(candidate)) {
      return { command: process.execPath, prefixArgs: [candidate] };
    }
  }

  return { command: process.platform === "win32" ? "yarn.cmd" : "yarn", prefixArgs: [] };
}

if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(taskId)) {
  fail(`Error: TASK_ID는 영숫자·_·.·-만 허용합니다. 입력: ${taskId}`);
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
process.chdir(repoRoot);

const runId = timestampCompact();
const logDir = path.join(repoRoot, "logs", taskId);
const runDir = path.join(logDir, runId);
mkdirSync(runDir, { recursive: true });

const summaryLog = path.join(runDir, "summary.log");
const manifestPath = path.join(runDir, "manifest.json");
const latestPath = path.join(logDir, "latest.json");

let currentHash = "";
let stagedHash = "";
try {
  currentHash = diffHash(["diff", "--binary"]);
  stagedHash = diffHash(["diff", "--cached", "--binary"]);
} catch (error) {
  fail(`Error: diff hash 계산 실패: ${error.message}`);
}

writePatch(["diff", "--binary"], path.join(runDir, "current.patch"));
writePatch(["diff", "--cached", "--binary"], path.join(runDir, "staged.patch"));

let headSha = "unknown";
let branch = "unknown";
try {
  headSha = git(["rev-parse", "HEAD"]);
  branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
} catch {
  // Keep unknown metadata.
}

const useColor = process.stdout.isTTY;
const color = {
  red: useColor ? "\u001b[31m" : "",
  green: useColor ? "\u001b[32m" : "",
  yellow: useColor ? "\u001b[33m" : "",
  bold: useColor ? "\u001b[1m" : "",
  reset: useColor ? "\u001b[0m" : "",
};

const VERBOSE = process.env.VERIFY_VERBOSE === "1";
const TAIL_LINES = 100;

function tailLines(text, n) {
  const lines = text.split(/\r?\n/);
  if (lines.length <= n) return text;
  return lines.slice(-n).join("\n");
}

const failed = [];
const warned = [];
const startedAt = isoNow();
const startedMs = Date.now();
const STEPS = [
  { label: "ESLint", args: ["lint"] },
  { label: "stylelint", args: ["lint:styles"] },
  { label: "Build (next)", args: ["build"] },
  { label: "Knip (미사용 코드)", args: ["knip"], warningOnly: true },
];
const TOTAL_STEPS = STEPS.length;
let stepNum = 0;

function appendSummary(text = "") {
  writeFileSync(summaryLog, `${text}\n`, { encoding: "utf8", flag: "a" });
}

function logBoth(text = "") {
  console.log(text);
  appendSummary(text.replace(/\u001b\[[0-9;]*m/g, ""));
}

function writeManifest(status) {
  const manifest = {
    taskId,
    runId,
    status,
    branch,
    head: headSha,
    currentDiffHash: currentHash,
    stagedDiffHash: stagedHash,
    startedAt,
    finishedAt: isoNow(),
    failed,
    warned,
    log: `logs/${taskId}/${runId}/summary.log`,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  copyFileSync(manifestPath, latestPath);
}

function runStep(label, args, warningOnly = false) {
  const logName = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "step";
  const stepLog = path.join(runDir, `${logName}.log`);
  const stepLogRel = `logs/${taskId}/${runId}/${logName}.log`;

  stepNum += 1;
  const stepStartMs = Date.now();

  logBoth("");
  logBoth(`${color.bold}━━━ [${stepNum}/${TOTAL_STEPS}] ${label} ━━━${color.reset}`);
  // 진행 힌트는 터미널에만. summary.log에는 남기지 않는다(전이성 표시).
  if (process.stdout.isTTY) process.stdout.write(`${color.yellow}  실행 중…${color.reset}\r`);

  const runner = packageRunner();
  const result = spawnSync(runner.command, [...runner.prefixArgs, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
  });

  // 진행 힌트 줄을 지운다(\r + 줄 전체 삭제). 안 지우면 짧은 후속 출력 뒤에 잔류 문자가 남는다.
  if (process.stdout.isTTY) process.stdout.write("\r[2K");

  // 단계 전체 출력은 per-step 로그에만 둔다. summary.log는 요약 전용(D1).
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  writeFileSync(stepLog, output, "utf8");

  const elapsed = ((Date.now() - stepStartMs) / 1000).toFixed(1);

  // 실패 단계만 tail을 터미널에 덤프한다. 경고(knip 등)는 1줄로만(D2).
  if (VERBOSE && output) {
    process.stdout.write(output);
  } else if (!VERBOSE && output && !warningOnly && result.status !== 0) {
    const tail = tailLines(output, TAIL_LINES);
    process.stdout.write(`${color.yellow}--- 최근 ${TAIL_LINES}줄 (전체: ${stepLogRel}) ---${color.reset}\n`);
    process.stdout.write(tail.endsWith("\n") ? tail : `${tail}\n`);
  }

  if (result.status === 0) {
    logBoth(`${color.green}✓ ${label} 통과${color.reset} (${elapsed}s)`);
    return;
  }

  if (warningOnly) {
    logBoth(`${color.yellow}⚠ ${label} 경고${color.reset} (${elapsed}s) — ${stepLogRel} · 상세: VERIFY_VERBOSE=1`);
    warned.push(label);
    return;
  }

  logBoth(`${color.red}✗ ${label} 실패${color.reset} (${elapsed}s) — ${stepLogRel}`);
  failed.push(label);
}

writeFileSync(summaryLog, "", "utf8");
logBoth(`TASK_ID=${taskId}`);
logBoth(`RUN_ID=${runId}`);
logBoth(`BRANCH=${branch}`);
logBoth(`HEAD=${headSha}`);
logBoth(`STARTED_AT=${startedAt}`);

for (const step of STEPS) runStep(step.label, step.args, step.warningOnly ?? false);

logBoth("");
logBoth(`${color.bold}━━━ 결과 요약 ━━━${color.reset}`);

const totalElapsed = ((Date.now() - startedMs) / 1000).toFixed(1);
logBoth(`소요: ${totalElapsed}s (${TOTAL_STEPS}단계)`);

const logPath = `logs/${taskId}/${runId}/summary.log`;

if (failed.length === 0) {
  if (warned.length > 0) {
    logBoth(`${color.green}✓ 필수 검증 통과${color.reset} (${color.yellow}⚠ 경고: ${warned.join(", ")} — 기존 부채, 커밋 차단 안 됨${color.reset})`);
  } else {
    logBoth(`${color.green}✓ 모든 검증 통과${color.reset}`);
  }
  writeManifest("pass");
  console.log(`검증 로그: ${logPath}`);
  process.exit(0);
}

logBoth(`${color.red}✗ 실패: ${failed.join(", ")}${color.reset}`);
writeManifest("fail");
console.log(`검증 로그: ${logPath}`);
process.exit(1);
