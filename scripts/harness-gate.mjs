#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ADR_TRIGGER_PARTS } from "./_shared-config.mjs";

const VERDICT_BY_SECTION = {
  "Codex 계획 검증": /\*\*결론\*\*:\s*(?:\*\*)?(PASS|PASS_WITH_DECISION_LOG|CHANGE_REQUEST|BLOCK)\b(?:\*\*)?/,
  "Codex 1차 검증": /\*\*결론\*\*:\s*(?:\*\*)?(PASS|FIX_APPLIED|CHANGE_REQUEST|BLOCK)\b(?:\*\*)?/,
  "Claude 2차 검증": /\*\*최종 판단\*\*:\s*(?:\*\*)?(PASS|FAIL)\b(?:\*\*)?/,
};

const ALLOWED_VERDICTS = {
  "Codex 계획 검증": ["PASS", "PASS_WITH_DECISION_LOG", "CHANGE_REQUEST", "BLOCK"],
  "Codex 1차 검증": ["PASS", "FIX_APPLIED", "CHANGE_REQUEST", "BLOCK"],
  "Claude 2차 검증": ["PASS", "FAIL"],
};

const PLACEHOLDER_LINE = /^\s*(?:[-—–]|TBD|ＴＢＤ|미요청|미작성|N\/A|none)\s*$/i;
const PLACEHOLDER_INLINE = /^\s*[-*]?\s*\*\*[^*]+\*\*:\s*["'`]?(?:TBD|ＴＢＤ|미요청|미작성|N\/A|none|-|—|–)["'`]?\s*$/i;
const VERDICT_LABEL = /^\s*[-*]?\s*\*\*(?:결론|최종 판단)\*\*:\s*(?:\*\*)?\w+(?:\*\*)?\s*/;
const MIN_BODY_CHARS = 30;

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

function slugFromFilename(name) {
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function findActivePlan(repoRoot, pattern) {
  const activeDir = path.join(repoRoot, "docs", "exec-plans", "active");
  if (!existsSync(activeDir)) fail(`active exec-plan 디렉토리가 없습니다: ${activeDir}`);

  const allMd = readdirSync(activeDir).filter((name) => name.endsWith(".md")).sort();
  const matches = allMd.filter((name) => slugFromFilename(name) === pattern);

  if (matches.length === 0) {
    const available = allMd.map(slugFromFilename).join("\n  - ");
    fail(`매칭되는 active exec-plan이 없습니다: ${pattern}\n현재 active slugs:\n  - ${available}`);
  }

  return path.join(activeDir, matches[0]);
}

function assertSectionRich(body, label) {
  const lines = body.split(/\r?\n/);
  let usefulChars = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (PLACEHOLDER_LINE.test(line)) continue;

    if (VERDICT_LABEL.test(line)) {
      const after = line.replace(VERDICT_LABEL, "").trim();
      usefulChars += after.length;
      continue;
    }

    if (PLACEHOLDER_INLINE.test(line)) {
      fail(`${label}: placeholder 라인 발견 — "${line}". 실제 검증 내용을 작성하세요.`);
    }

    usefulChars += line.length;
  }

  if (usefulChars < MIN_BODY_CHARS) {
    fail(
      `${label}: 비-placeholder 본문이 ${usefulChars}자로 부족합니다 (최소 ${MIN_BODY_CHARS}자). ` +
        `verdict + 풀이/실행한 검증/핵심 지적을 채우세요.`,
    );
  }
}

function assertReviewSections(content, filename) {
  for (const [heading, verdictRe] of Object.entries(VERDICT_BY_SECTION)) {
    const body = sectionBody(content, heading);
    if (!body) fail(`${filename}: ## ${heading} 섹션이 없습니다.`);

    const verdictMatch = body.match(verdictRe);
    if (!verdictMatch) {
      const allowed = ALLOWED_VERDICTS[heading].join(" / ");
      fail(
        `${filename}: ## ${heading} verdict token이 없습니다. 허용: ${allowed}. ` +
          `placeholder(미요청/미작성)은 차단됩니다 — Codex/Claude 검증을 실제로 수행하고 결론을 기록하세요.`,
      );
    }

    if (verdictMatch[1] === "BLOCK") {
      fail(
        `${filename}: ## ${heading} 섹션에 BLOCK이 기록되어 있습니다. ` +
          `exec-plan 재작성 + Codex 재요청 후 진행하세요.`,
      );
    }

    if (verdictMatch[1] === "PASS_WITH_DECISION_LOG") {
      const log = sectionBody(content, "의사결정 로그");
      if (!log || log.length < MIN_BODY_CHARS) {
        fail(
          `${filename}: ## ${heading} verdict가 PASS_WITH_DECISION_LOG인데 ` +
            `## 의사결정 로그 섹션이 비어있거나 ${MIN_BODY_CHARS}자 미만입니다. ` +
            `expression-only 지적 N건을 각 1줄로 기록하세요.`,
        );
      }
    }

    assertSectionRich(body, `${filename}: ## ${heading}`);
  }
}

function assertAdrDecision(content, filename) {
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

  if (adrRiskFiles.length === 0 || adrChanged) return;

  const adrLine = /^\s*-\s*\*\*ADR needed\*\*:\s*(no|yes)\b(?<rationale>.*)/im.exec(content);
  const legacyBody = sectionBody(content, "ADR 판단");

  if (!adrLine && !legacyBody) {
    fail(
      `${filename}: ADR 후보 변경이 있지만 frontmatter \`**ADR needed**: no | yes\` 또는 ## ADR 판단 섹션이 없습니다.`,
    );
  }

  if (
    adrLine?.[1].toLowerCase() === "no" &&
    !adrLine.groups?.rationale.trim() &&
    !legacyBody
  ) {
    fail(
      `${filename}: ADR 후보 변경(${adrRiskFiles.slice(0, 3).join(", ")}${adrRiskFiles.length > 3 ? " ..." : ""})이 있는데 ` +
        `\`**ADR needed**: no\`에 사유가 없습니다. ` +
        `한 줄 inline 사유를 추가하세요 (예: \`**ADR needed**: no — scripts/ 오타 수정만 포함\`).`,
    );
  }

  if (legacyBody && /필요 여부\*\*: 미검토/.test(legacyBody)) {
    fail(
      `${filename}: ADR 후보 변경이 있지만 ADR 판단이 미검토 상태입니다.\n` +
        `ADR 후보 파일: ${adrRiskFiles.slice(0, 8).join(", ")}${adrRiskFiles.length > 8 ? " ..." : ""}`,
    );
  }
}

function assertVerification(taskId) {
  const result = spawnSync(process.execPath, ["scripts/enforce-verification.mjs", taskId], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, VERIFY_ENFORCE: "1" },
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function parseArgs(argv) {
  const args = { planFile: null, taskPattern: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--plan-file") {
      args.planFile = argv[i + 1] ?? "";
      i += 1;
    } else if (arg.startsWith("--plan-file=")) {
      args.planFile = arg.slice("--plan-file=".length);
    } else if (!arg.startsWith("-") && !args.taskPattern) {
      args.taskPattern = arg;
    }
  }
  return args;
}

const { planFile, taskPattern } = parseArgs(process.argv.slice(2));
const effectiveTask = taskPattern || process.env.TASK_ID || "";

if (planFile) {
  if (!existsSync(planFile)) fail(`--plan-file 경로가 없습니다: ${planFile}`);
  const content = readFileSync(planFile, "utf8");
  const filename = path.basename(planFile);
  assertReviewSections(content, filename);
  console.log(`✓ 하네스 게이트 통과 (plan-file 모드): ${filename}`);
  process.exit(0);
}

if (!effectiveTask) {
  fail("Usage: node scripts/harness-gate.mjs <task-id-or-active-plan-pattern> | --plan-file <path>");
}

if (/[^a-zA-Z0-9_.-]/.test(effectiveTask)) {
  fail(`task id는 영숫자·_·.·-만 허용합니다. 입력: ${effectiveTask}`);
}

const repoRoot = git(["rev-parse", "--show-toplevel"]);
process.chdir(repoRoot);

const planPath = findActivePlan(repoRoot, effectiveTask);
const filename = path.basename(planPath);
const content = readFileSync(planPath, "utf8");

assertReviewSections(content, filename);
assertAdrDecision(content, filename);
assertVerification(effectiveTask);

console.log(`✓ 하네스 게이트 통과: ${filename}`);
