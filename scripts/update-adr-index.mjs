#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const root = cwd();
const decisionsDir = join(root, "docs", "decisions");
const readmePath = join(decisionsDir, "README.md");

const rows = readdirSync(decisionsDir)
  .filter((name) => /^\d{4}-.+\.md$/.test(name))
  .sort()
  .map((name) => {
    const content = readFileSync(join(decisionsDir, name), "utf8");
    const number = name.slice(0, 4);
    const title = content.match(/^#\s+\d{4}\s+—\s+(.+)$/m)?.[1]?.trim() ?? name.replace(/^\d{4}-/, "").replace(/\.md$/, "");
    const status = content.match(/^- \*\*Status\*\*:\s*(.+)$/m)?.[1]?.trim() ?? "Unknown";
    const date = content.match(/^- \*\*Date\*\*:\s*(.+)$/m)?.[1]?.trim() ?? "Unknown";
    return `| [${number}](${name}) | ${title} | ${status} | ${date} |`;
  });

let readme = readFileSync(readmePath, "utf8");
const table = [
  "| 번호 | 제목 | 상태 | 날짜 |",
  "| --- | --- | --- | --- |",
  ...rows,
].join("\n");

if (/## 인덱스[\s\S]*?<!-- last-audit:/.test(readme)) {
  readme = readme.replace(/## 인덱스[\s\S]*?<!-- last-audit:/, `## 인덱스\n\n${table}\n\n<!-- last-audit:`);
} else {
  readme = `${readme.trim()}\n\n## 인덱스\n\n${table}\n`;
}

writeFileSync(readmePath, readme, "utf8");
console.log(`✓ ADR 인덱스 갱신됨: docs/decisions/README.md (${rows.length}건)`);
