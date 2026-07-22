#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ADR_TRIGGER_PARTS } from "./_shared-config.mjs";

// Claude 2차 검증은 별도 verdict 섹션에서 제거됨(A) — verify-task manifest(assertVerification)가
// lint·build 기록을 담당한다. Codex 1차는 Codex 미가동 시 CODEX_UNAVAILABLE을 허용한다(C).
const VERDICT_BY_SECTION = {
  "Codex 계획 검증": /\*\*결론\*\*:\s*(?:\*\*)?(PASS|PASS_WITH_DECISION_LOG|CHANGE_REQUEST|BLOCK)\b(?:\*\*)?/,
  "Codex 1차 검증": /\*\*결론\*\*:\s*(?:\*\*)?(PASS|FIX_APPLIED|CHANGE_REQUEST|BLOCK|CODEX_UNAVAILABLE)\b(?:\*\*)?/,
};

const ALLOWED_VERDICTS = {
  "Codex 계획 검증": ["PASS", "PASS_WITH_DECISION_LOG", "CHANGE_REQUEST", "BLOCK"],
  "Codex 1차 검증": ["PASS", "FIX_APPLIED", "CHANGE_REQUEST", "BLOCK", "CODEX_UNAVAILABLE"],
};

// tier별 요구 verdict 섹션(B). Tier 0은 없음, Tier 1은 계획 검증만, Tier 2는 계획 + Codex 1차.
// 계획 검증은 어느 tier에서도 CODEX_UNAVAILABLE을 허용하지 않는다 — plan-first의 핵심이라 건너뛸 수 없다.
const REQUIRED_SECTIONS_BY_TIER = {
  0: [],
  1: ["Codex 계획 검증"],
  2: ["Codex 계획 검증", "Codex 1차 검증"],
};

// CODEX_UNAVAILABLE 사용 시 요구하는 3필드 — 위조 PASS와 구분되게 오류·시도·Claude 직접 확인을 남긴다(C).
const CODEX_UNAVAILABLE_FORMAT = /오류:\s*\S.*시도:\s*\S.*Claude 확인:\s*\S/s;

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

function sectionBody(markdown, heading) {
  // 헤딩은 줄 시작에 고정해서 찾는다. 예전엔 indexOf라 본문에 인라인으로 적힌
  // 섹션 이름(예: "검토는 `## Codex 계획 검증`")을 헤딩으로 오인해 엉뚱한 본문을 반환했다.
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headingMatch = new RegExp(`^## ${escaped}\\s*$`, "m").exec(markdown);
  if (!headingMatch) return "";
  const start = headingMatch.index;

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

function assertReviewSections(content, filename, requiredSections) {
  for (const heading of requiredSections) {
    const verdictRe = VERDICT_BY_SECTION[heading];
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

    if (verdictMatch[1] === "CODEX_UNAVAILABLE") {
      if (!CODEX_UNAVAILABLE_FORMAT.test(body)) {
        fail(
          `${filename}: ## ${heading} verdict가 CODEX_UNAVAILABLE인데 '오류: … / 시도: … / Claude 확인: …' ` +
            `3필드가 없습니다. Codex 미가동을 위조 PASS로 대체하지 말고, 무엇이 실패했고 Claude가 무엇을 직접 확인했는지 남기세요.`,
        );
      }
    }

    assertSectionRich(body, `${filename}: ## ${heading}`);
  }
}

// changedFiles는 tier 계산과 같은 branch diff(computeChangeStats().files)를 받는다.
// 예전엔 uncommitted diff만 봐서, 커밋 후 clean 트리에서는 ADR-trigger 변경이 있어도 검사를 건너뛰었다.
function assertAdrDecision(content, filename, changedFiles) {
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

// 변경 규모를 계산할 기준 ref. 브랜치 delta(base…HEAD)를 봐야 커밋된 변경까지 잡힌다.
// origin/develop → develop → origin/main → main 순으로 시도한다.
// merge-base가 HEAD와 같은 ref는 건너뛴다 — 그 base로는 branch delta가 비어(예: develop→main 릴리스를
// develop 위에서 돌릴 때 origin/develop) Tier 0로 오판된다. 다음 ref(main 계열)로 넘어간다.
// 어느 ref도 유효한 delta를 못 주면 규모를 알 수 없으므로 fail-closed로 차단한다(검토 생략 금지).
function resolveBaseRef() {
  const headResult = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const headSha = headResult.status === 0 ? headResult.stdout.trim() : "";

  for (const ref of ["origin/develop", "develop", "origin/main", "main"]) {
    const result = spawnSync("git", ["merge-base", "HEAD", ref], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    if (result.status !== 0) continue;
    const base = result.stdout.trim();
    if (!base) continue;
    if (base === headSha) continue; // HEAD와 같은 base → 빈 delta → 다음 ref로.
    return base;
  }
  fail(
    "변경 규모를 계산할 기준 브랜치를 찾지 못했습니다. " +
      "origin/develop, develop, origin/main, main이 모두 HEAD와 같거나(빈 delta) 존재하지 않습니다. " +
      "브랜치 상태를 확인하고 다시 실행하세요.",
  );
}

// tier 판정 재료를 모은다: 변경 파일 목록·LOC 합·binary 여부.
// diff는 base 단일 소스로 센다(작업트리+staged를 따로 더하면 이중 카운트 — CR3).
// binary(numstat `-`)와 읽기 실패는 fail-closed로 hasBinary 처리한다.
function computeChangeStats() {
  const base = resolveBaseRef();
  const files = new Set();
  let loc = 0;
  let hasBinary = false;

  // --no-renames: rename을 삭제+추가로 쪼갠다. rename 감지가 켜지면 `{old => new}` 경로 문자열이라
  // src/·ADR-trigger 매칭이 깨지고, 큰 파일 이동이 0줄로 잡혀 Tier 0로 오판된다.
  const numstat = spawnSync("git", ["diff", base, "--numstat", "--no-renames"], { encoding: "utf8" });
  if (numstat.status !== 0) {
    fail(`git diff --numstat 실패: base=${base}. 변경 규모를 알 수 없어 gate를 차단합니다.`);
  }
  for (const line of (numstat.stdout ?? "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    const [added, deleted] = parts;
    const filePath = parts.slice(2).join("\t").replaceAll("\\", "/");
    files.add(filePath);
    if (added === "-" || deleted === "-") {
      hasBinary = true;
      continue;
    }
    loc += (Number.parseInt(added, 10) || 0) + (Number.parseInt(deleted, 10) || 0);
  }

  // git diff는 untracked를 안 잡는다. 파일 수·LOC에 포함하고, 읽기 실패는 fail-closed.
  const untracked = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], {
    encoding: "utf8",
  });
  if (untracked.status !== 0) {
    fail("git ls-files --others 실패: untracked 변경 여부를 알 수 없어 gate를 차단합니다.");
  }
  for (const raw of (untracked.stdout ?? "").split(/\r?\n/)) {
    const rel = raw.trim();
    if (!rel) continue;
    files.add(rel.replaceAll("\\", "/"));
    try {
      loc += readFileSync(path.join(process.cwd(), rel), "utf8").split(/\r?\n/).length;
    } catch {
      hasBinary = true;
    }
  }

  return { base, files: [...files], loc, hasBinary };
}

// 변경 규모 → tier. ADR-trigger 적중·binary·규모 초과는 Tier 2, src 코드나 중간 규모는 Tier 1,
// 그 아래 사소한 비-src 변경만 Tier 0. 경계는 어느 입력도 두 tier에 겹치지 않게 배타적으로 둔다.
function computeTier({ files, loc, hasBinary }) {
  const adrHit = files.some((file) => ADR_TRIGGER_PARTS.some((part) => file.includes(part)));
  const srcHit = files.some((file) => file.startsWith("src/"));
  if (adrHit || hasBinary || files.length > 5 || loc > 100) return 2;
  if (srcHit || files.length > 2 || loc > 20) return 1;
  return 0;
}

function parseArgs(argv) {
  const args = { planFile: null, taskPattern: "", tierOverride: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--plan-file") {
      args.planFile = argv[i + 1] ?? "";
      i += 1;
    } else if (arg.startsWith("--plan-file=")) {
      args.planFile = arg.slice("--plan-file=".length);
    } else if (arg === "--tier") {
      args.tierOverride = Number.parseInt(argv[i + 1] ?? "", 10);
      i += 1;
    } else if (arg.startsWith("--tier=")) {
      args.tierOverride = Number.parseInt(arg.slice("--tier=".length), 10);
    } else if (!arg.startsWith("-") && !args.taskPattern) {
      args.taskPattern = arg;
    }
  }
  if (args.tierOverride !== null && ![0, 1, 2].includes(args.tierOverride)) {
    fail(`--tier는 0·1·2만 허용합니다. 입력: ${args.tierOverride}`);
  }
  return args;
}

const { planFile, taskPattern, tierOverride } = parseArgs(process.argv.slice(2));
const effectiveTask = taskPattern || process.env.TASK_ID || "";

if (planFile) {
  // dry-run: 지정 tier의 요구 섹션만 검사한다. tier 미지정이면 가장 엄격한 2(계획 + Codex 1차).
  if (!existsSync(planFile)) fail(`--plan-file 경로가 없습니다: ${planFile}`);
  const content = readFileSync(planFile, "utf8");
  const filename = path.basename(planFile);
  const tier = tierOverride ?? 2;
  assertReviewSections(content, filename, REQUIRED_SECTIONS_BY_TIER[tier]);
  console.log(
    `✓ verdict 섹션 검증 통과 (--plan-file tier=${tier}: verification/ADR는 검사 안 함): ${filename}`,
  );
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

// tier를 plan 탐색보다 먼저 계산한다(CR2). Tier 0은 verdict 섹션을 요구하지 않으므로
// active plan이 없어도(PLAN 생략) 통과하되, verify 기록은 어느 tier에서도 확인한다.
const stats = computeChangeStats();
const tier = tierOverride ?? computeTier(stats);
const required = REQUIRED_SECTIONS_BY_TIER[tier];
console.log(
  `변경 규모: 파일 ${stats.files.length} · LOC ${stats.loc}${stats.hasBinary ? " · binary" : ""} → Tier ${tier} ` +
    `(요구 verdict: ${required.length ? required.join(", ") : "없음"})`,
);

if (tier >= 1) {
  const planPath = findActivePlan(repoRoot, effectiveTask);
  const filename = path.basename(planPath);
  const content = readFileSync(planPath, "utf8");

  assertReviewSections(content, filename, required);
  assertAdrDecision(content, filename, stats.files);
}

assertVerification(effectiveTask);

console.log(`✓ 하네스 게이트 통과 (Tier ${tier})`);
