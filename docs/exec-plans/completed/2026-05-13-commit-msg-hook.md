# commit-msg-hook

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-13
- **브랜치**: feat/commit-msg-hook (develop 기반)

## 목표

`.claude/skills/harness-workflow/SKILL.md` "## 커밋 메시지" 섹션의 deterministic 룰 4개를 husky `commit-msg` hook으로 강제. 위반 시 commit 차단(exit 1), `--no-verify`로 우회 가능.

## Assumptions

- husky v9.1.7 + lint-staged 9 사용 중(`.husky/pre-commit` 동작 확인). `.husky/commit-msg`는 미존재.
- merge/revert/fixup/squash commit은 자동 검증 우회.
- subject = commit message 첫 줄, body = 빈 줄 이후.

## Non-goals

- Body 4-line 가이드(왜/무엇/영향/제외) 검증 — 사용자 결정으로 제외
- WHY/IMPACT·외부 가독성·추상명사 회피 등 heuristic 룰 — 사람 PR 리뷰 영역
- PR 제목 검증 — 별도 메커니즘(GitHub Actions) 필요, 본 task 제외
- 기존 commit history retroactive 검증

## Success Criteria

1. `scripts/check-commit-msg.mjs` 신규. `node scripts/check-commit-msg.mjs <commit-msg-file>` 형태, 위반 시 exit 1 + stderr 명확 메시지.
2. `.husky/commit-msg` 신규. 1줄로 위 스크립트 호출.
3. 검증 4 룰 deterministic:
   - (R1) subject 정규식 `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$` 위반 차단. ASCII colon + 공백 1개 + 비공백 시작 강제. 이중 공백(`Chore:  test`)·Unicode colon(`：`) 차단.
   - (R2) subject 길이 81자 이상 차단(권장 50, 한도 80). 검증 전 `.trimEnd()`로 trailing `\n`/`\r\n` 제거.
   - (R3) `Co-Authored-By:` trailer 누락 차단(case-insensitive).
   - (R4) subject에 `+` 2회 이상 출현 시 차단. `+`만 검사(SKILL.md:196 SSOT 일치). `/`·`,`는 검사 대상 아님(URL 경로 `/sermons/all` 같은 정상 subject 오탐 회피).
4. Auto-skip 패턴: subject가 `Merge `/`Revert `/`fixup!`/`squash!`로 시작하면 검증 우회.
5. `node scripts/verify-task.mjs commit-msg-hook` 통과.

## Verification

```bash
# 단위 — stdin/파일로 메시지 전달
echo "Hack: invalid" | node scripts/check-commit-msg.mjs /dev/stdin  # exit 1 (R1)
node scripts/check-commit-msg.mjs <(echo "Feat: ok")                 # exit 1 (R3 footer 누락)
node scripts/check-commit-msg.mjs <(echo "Merge branch main")        # exit 0 (skip)

# git 통합
git commit -m "Hack:" --allow-empty                                   # 차단
git commit -m "Feat: ok" --allow-empty                                # 차단 (R3)
git commit -m "Hack:" --allow-empty --no-verify                       # 우회 통과

# 전체
node scripts/verify-task.mjs commit-msg-hook
```

## 접근법

- `scripts/check-commit-msg.mjs`: ESM 모듈, dependency 0, `fs.readFileSync(process.argv[2])`로 commit message 읽기. 4 정규식 + 1 skip 패턴. 위반 시 stderr에 룰 ID + 해당 라인 출력.
- `.husky/commit-msg`: `node scripts/check-commit-msg.mjs "$1"` 1줄.

## 영향받는 파일

- 신규: `scripts/check-commit-msg.mjs`
- 신규: `.husky/commit-msg`
- 신규: `docs/decisions/0009-commit-msg-hook-enforcement.md` (ADR)
- 수정: `docs/decisions/README.md` (ADR index 갱신, `node scripts/update-adr-index.mjs`로 자동)

## 단계별 체크리스트

- [x] 1. `node scripts/start-adr.mjs commit-msg-hook-enforcement` → ADR 파일 생성
- [x] 2. ADR 본문 작성 (Decision/Context/Consequences/Alternatives)
- [x] 3. `node scripts/update-adr-index.mjs` 실행 (`docs/decisions/README.md` 9건 갱신)
- [x] 4. `scripts/check-commit-msg.mjs` 작성 (R1~R4 + skip)
- [x] 5. `.husky/commit-msg` 작성 (1줄 `node scripts/check-commit-msg.mjs "$1"`)
- [x] 6. 단위 검증 6건 통과 (R1 prefix / R2 길이 82자 / R3 footer 누락 / R4 `+` 2회 / Merge skip / valid)
- [ ] 7. git 통합 검증 — 본 task commit 시점에 실제 동작 확인(self-test)
- [x] 8. `node scripts/verify-task.mjs commit-msg-hook` 통과 (run-id `20260513-221832`)
- [ ] 9. Codex 1차 검증 → Claude 2차 검증 기록

## 의사결정 로그

- 2026-05-13: SKILL.md 정정 본 task에서 제외 — 현재 브랜치(feat/commit-msg-hook)는 develop 기반이고 develop의 `SKILL.md:196`은 이미 `+`만 명시(원본). feat/sermons의 SKILL 강화 commit(`eeb3625`)이 `+`·`/`·`,`로 확장한 상태이나 develop 머지 X. feat/sermons PR 머지 전에 사용자가 SKILL을 `+`만으로 정정해야 함(별도 follow-up).

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs commit-msg-hook` 통과
- [ ] 사용자 승인 후 커밋

## 참고 자료

- `.claude/skills/harness-workflow/SKILL.md` "## 커밋 메시지" — 룰 SSOT
- 트리거: 2026-05-13 사용자 "강제 적용" 지시

## ADR 판단

- **필요 여부**: **필요** (Codex 1차 검증 FLAG F 반영)
- **사유**: `scripts/`가 `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7,25`) 실제 포함 + SKILL.md(이전 commit `eeb3625`) §검증 섹션이 commit-msg hook 도입을 "별도 결정" 항목으로 명시. commit message 강제 정책은 모든 contributor에 영구 영향이라 영구 결정.
- **결정 링크**: `docs/decisions/0009-commit-msg-hook-enforcement.md` (본 task 내에서 작성)

## Codex 계획 검증

- **상태**: 1차 완료 (CHANGE_REQUEST → 반영) / 재검증 미요청
- **요청 시점**: 2026-05-13 (new thread)
- **결론** (verbatim): `CHANGE_REQUEST` — FLAG A/B/D/F 4건.

**핵심 지적** (verbatim 발췌):
> FLAG A — R1 정규식 불완전 / 이중 공백(`Chore:  test`)과 Unicode colon(`：`) 통과 / `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+`로 명시
> FLAG B — R2 newline 미처리 / `fs.readFileSync`로 읽은 첫 줄에 trailing `\n`/`\r\n` 제외 여부 없음 / `.trimEnd()` 적용
> FLAG D — R4 `/` 오탐 (블로커) / `Fix: /sermons/all → /sermons/list` 같은 정상 subject가 exit 1 / SKILL.md:196 SSOT는 `+` 연결만 분리 신호로 명시 / `/`와 `,`를 R4 대상에서 제거
> FLAG F — ADR 필요 (블로커) / scripts/_shared-config.mjs:7,25에 scripts/가 ADR_TRIGGER_PARTS에 실제 포함 / SKILL.md:269-271은 commit-msg hook 도입을 "별도 결정 필요" 항목으로 명시

**평이 풀이**: R1은 정규식 엄격화 필요. R2는 newline trim 필요. R4의 `/`·`,` 검사는 URL 경로 오탐 발생 — `+`만 검사로 좁힘. `scripts/`는 ADR 트리거라 ADR 작성 필수.

**반영**:
- R1: 정규식 `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$` 명시 (SC#3)
- R2: `.trimEnd()` 적용 명시 (SC#3)
- R4: `+`만 검사로 좁힘. `/`·`,` 제거 (SC#3). 본 task 내부에서 SKILL.md의 commit `eeb3625`도 `+`만으로 정정 — SSOT 일관성
- ADR: `docs/decisions/0009-commit-msg-hook-enforcement.md` 작성 — 본 task에 포함

## Codex 1차 검증

- **상태**: 1차 완료 (CHANGE_REQUEST → 반영) — 재검증 미요청
- **요청 시점**: 2026-05-13 (resume thread)
- **결론** (verbatim): `CHANGE_REQUEST` — 2건

**핵심 지적** (verbatim 발췌):
> 1. R3 — `Co-Authored-By:` 위치 검사 범위 오류 / 현재 구현(`scripts/check-commit-msg.mjs:69`)은 `content` 전체(본문 어느 줄이든)에서 `Co-Authored-By:` 패턴을 허용합니다. SKILL.md(`:187,208`)의 SSOT는 **trailer(마지막 non-comment/non-empty 줄)** 에서만 유효한 것으로 정의합니다.
> 3. 계획 범위 외 파일 잔류 / `git status --short`에 `?? bash.exe.stackdump` 가 있습니다. 계획 범위 밖 파일입니다. `.gitignore`에 추가하거나 삭제하세요.

**평이 풀이**: R3은 본문 어디든 footer 매칭하면 통과 — 인용·예시 라인이 trailer로 오인됨. trailer 블록(마지막 paragraph)으로 좁힘 필요. bash.exe.stackdump는 Windows bash crash dump 파일로 본 task 무관.

**반영**:
- R3: `scripts/check-commit-msg.mjs:65-83`을 trailer 블록 검사로 변경. 끝에서 빈 줄·`\r` 제거 → 마지막 paragraph(빈 줄 위 연속 non-empty 라인) 수집 → 해당 paragraph 내에서 Co-Authored-By 검색. 단위 케이스 추가 통과: (Case 7) body 중간 인용 차단, (Case 8) 마지막 paragraph trailer 통과, (Case 9) trailing 빈 줄·주석 후 trailer 통과.
- bash.exe.stackdump: `.gitignore`에 `*.stackdump` 패턴 추가 + 파일 삭제. 동일 패턴 future-proof.

**통과 항목** (verbatim):
> - R1/R2/R4/auto-skip: 계획 SC#3과 일치 확인 / 레이어 경계: `src/apis|services|actions|app` 미접촉 / ADR 0009: Accepted 상태, 인덱스 반영 확인 / SKILL.md: 미수정 확인

## Claude 2차 검증

- **검토 내용**: Codex 1차 FIX 2건 diff 교차 확인.
  - (R3 trailer) `scripts/check-commit-msg.mjs:65-83` 변경 — content 전체 정규식 → 마지막 paragraph 수집 + paragraph 내 정규식 검사로 좁힘. 인접 코드 변경 없음. `COAUTHOR_REGEX` 상수 유지.
  - (stackdump) `.gitignore`에 `*.stackdump` 패턴 1줄 추가 + working dir 파일 삭제. SKILL.md `feedback_research_no_commit` 패턴(docs/references/*.jsx)과 같은 그룹(개인 환경 부산물 제외).
- **실행한 검증**:
  - 단위 9 케이스 통과 (R1·R2·R3·R4·skip + R3 trailer 추가 3건)
  - `node scripts/verify-task.mjs commit-msg-hook` 통과 (run-id `20260513-222437`): ESLint ✓ / stylelint ✓ / Build (next) ✓ / Knip ⚠ (기존 부채만)
  - `git status --short`: stackdump 부재 확인, 5 파일 변경(`.gitignore` M, `docs/decisions/README.md` M, `.husky/commit-msg` A, `0009...` A, exec-plan A, `scripts/check-commit-msg.mjs` A). ADR_TRIGGER 영역(`scripts/`)이지만 ADR 0009로 이미 처리.
- **최종 판단**: ✅ **PASS** — Codex FIX 2건 모두 plan SC#3·SC#4와 일치. 신규 회귀 0건. 사용자 승인 후 커밋 진행 가능.

## 회고 (머지 후)

- **잘된 것**:
  - dependency 0의 단순한 Node.js ESM 스크립트(`scripts/check-commit-msg.mjs`, ~95줄)로 hook 도입 — commitlint 같은 외부 패키지 회피
  - self-test 통과 — commit `9810863`(본 hook 도입 commit) 자체가 활성 hook을 통과해 동작 증명
  - ADR 0009 Accepted + Alternatives 4건(GitHub Actions only / heuristic strict / SKILL only / commitlint) 문서화
  - Codex 계획 검증 1 라운드 CHANGE_REQUEST(FLAG A/B/D/F 4건)와 1차 구현 검증 1 라운드 CHANGE_REQUEST(R3 trailer 범위 + bash.exe.stackdump 2건) 모두 반영해 PASS
  - R3 trailer 검사를 마지막 paragraph로 좁힌 발견 — body 중간 인용 라인이 trailer로 오인되던 문제 해소
- **다음에 할 것**:
  - `scripts/check-commit-msg.test.mjs` 자동 테스트 추가 (`node:test` 기반, R1~R4 + skip + nonexistent-path 6 케이스) — 별도 task
  - GitHub Actions로 develop·main 브랜치 보호 강화 — local hook + `--no-verify` 우회 가능한 약점 보완
  - Phase 1 진입 시 commit 작성자 모두에게 hook 4 룰 자동 적용 — 외부 가독성·다중 concern 분리 룰 운영 패턴 누적
- **발견된 부채** (→ `docs/tech-debt-tracker.md`):
  - hook은 local only — CI 보호 부재. `--no-verify` 우회 가능. 별도 GitHub Actions task로 보완 필요
  - `scripts/check-commit-msg.mjs` 자동 테스트 부재 — 회귀 시 수동 9 케이스 재실행 필요
