#!/usr/bin/env node
/**
 * ADR 및 구조 변경 트리거 파일 목록 — SSOT.
 * check-adr-needed.mjs / harness-gate.mjs / complete-task.mjs 에서 import해 사용한다.
 * 목록을 변경하면 세 스크립트 동작이 함께 반영된다.
 */
export const ADR_TRIGGER_PARTS = [
  "package.json",
  "package-lock.json",
  "next.config.",
  "eslint.config.",
  "stylelint.config.",
  "tsconfig.json",
  "src/lib/supabase/",
  "src/apis/",
  "src/services/",
  "src/actions/",
  "docs/ARCHITECTURE.md",
  "docs/references/constraints.md",
  "CLAUDE.md",
  "AGENTS.md",
  ".claude/settings.json",
  ".claude/hooks/",
  ".codex/",
  "scripts/",
];
