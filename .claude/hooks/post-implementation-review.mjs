#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";

const CRITICAL_PARTS = [
  "eslint.config.",
  "next.config.",
  "package.json",
  "src/lib/supabase/",
  "src/actions/",
  "src/apis/",
  "src/services/",
  "docs/decisions/",
];

const STATE_FILE = path.join(os.tmpdir(), "dnchurch-post-impl-review.state");

async function readInput() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function emitContext(message) {
  stdout.write(JSON.stringify({
    continue: true,
    suppressOutput: true,
    additionalContext: message,
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: message,
    },
  }));
}

function changedFiles(cwd) {
  const names = new Set();
  const commands = [
    ["diff", "--name-only"],
    ["diff", "--cached", "--name-only"],
  ];

  for (const args of commands) {
    try {
      const output = execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      for (const line of output.split(/\r?\n/)) {
        const file = line.trim().replaceAll("\\", "/");
        if (file) names.add(file);
      }
    } catch {
      // Hook suggestions should never block editing.
    }
  }

  return [...names];
}

function changedFilesFromToolInput(input) {
  const raw = String(input.file_path ?? input.path ?? input.filePath ?? "");
  return raw ? [raw.replaceAll("\\", "/")] : [];
}

function collectChangedFiles(cwd, input) {
  const files = new Set([...changedFiles(cwd), ...changedFilesFromToolInput(input)]);
  return [...files];
}

function stateFingerprint(files) {
  return [...files].sort().join(",");
}

function readLastState() {
  try { return readFileSync(STATE_FILE, "utf8").trim(); } catch { return ""; }
}

function writeState(fingerprint) {
  try { writeFileSync(STATE_FILE, fingerprint); } catch {}
}

const payload = await readInput();
const cwd = payload.cwd || process.cwd();
const files = collectChangedFiles(cwd, payload.tool_input ?? payload.toolInput ?? {});
const critical = files.filter((file) => CRITICAL_PARTS.some((part) => file.includes(part)));

if (files.length >= 8 || critical.length >= 2) {
  const fingerprint = stateFingerprint(files);
  const lastState = readLastState();

  if (fingerprint === lastState) {
    // 동일한 diff 상태 — 이미 알림을 보냈으므로 skip
    process.exit(0);
  }

  writeState(fingerprint);

  emitContext(
    "[hook:post-implementation-review]\n" +
      `현재 diff가 넓거나 위험 파일을 포함합니다. 변경 파일 수: ${files.length}, 고위험 파일 수: ${critical.length}.\n` +
      "Claude 구현 이후 Codex 1차 검증을 요청할 타이밍입니다. Codex에는 버그, 레이어 경계, 누락된 검증, 타입/엣지 케이스에 더해 " +
      "**외과적 변경(surgical changes)**을 확인하게 하세요: 변경된 각 파일이 현재 task와 직접 관련 있는가, 인접 코드 정리·포맷·이름 변경이 섞여 있는가, " +
      "이번 변경으로 생긴 unused import/변수만 제거되었고 기존 dead code는 보존되었는가. 인접 정리가 섞여 있으면 별도 작업 분리를 요청하세요.\n" +
      "Codex가 직접 수정할 수 있는 범위는 명백한 버그, 타입 오류, 누락 guard, 테스트 실패 원인의 국소 수정까지입니다. " +
      "계획 변경, 새 라이브러리, 데이터 흐름 변경, 인증/캐시/배포 정책 변경, 외과적 변경 위반은 Claude Code 2차 검증으로 반환해야 합니다.\n" +
      "검증 후 active exec-plan의 `## Codex 1차 검증` 섹션에 결론, 수정 파일, 핵심 지적, 남은 리스크를 기록하세요. " +
      "Claude Code는 이어서 `## Claude 2차 검증` 섹션에 교차 확인과 최종 판단을 남겨야 합니다.",
  );
}
