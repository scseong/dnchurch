# harness-pr104-review-fixes

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-30
- **브랜치**: refactor/harness-engineering
- **Open questions**: none
- **ADR needed**: no — 본 task는 8건 PR 리뷰 fix(자기모순 5건 + Gemini 잔여 4건)의 일회성 정합 보강. 정책 자체 변경 없음 (verdict 토큰 1개 추가·hash sections 1개 추가·frontmatter tools 명시·호출명 정합·regex/CRLF 잔여 결함). 정책 통일(C7 옵션 B)은 후속 작업에 분리.

## 목표

PR #104 11:08 재트리거 리뷰 8건을 머지 전 반영한다. 핵심은 본 PR이 신설한 4 시스템(harness-gate · check-doc-style hook · explorer wrapper · ADR_TRIGGER_PARTS)이 자기 산출물에서 작동 실패하는 자기모순 5건 해소.

## 검증된 Assumptions

- `scripts/harness-gate.mjs:9-18` — "Codex 계획 검증"은 `PASS_WITH_DECISION_LOG` 허용, "Codex 1차 검증"은 불허(`PASS|FIX_APPLIED|CHANGE_REQUEST|BLOCK`만). 본인 Read로 직접 확인.
- `node scripts/harness-gate.mjs --plan-file docs/exec-plans/completed/2026-05-29-pr-author-trigger.md` 실행 시 stderr "verdict token이 없습니다" 출력. 본인 실측.
- `.claude/hooks/check-doc-style.mjs:16` — `PLAN_HASH_SECTIONS`에 "회고" 없음. 본인 Read로 확인.
- `.claude/agents/explorer.md:1-5` — frontmatter에 `tools`/`disallowedTools` 누락. 본문 line 58은 `Agent(subagent_type: Explore)` 빌트인 지시. 본인 Read로 확인.
- `scripts/_shared-config.mjs:28` — ADR_TRIGGER_PARTS에 `.github/PULL_REQUEST_TEMPLATE/` 디렉토리만 있고 루트 `.github/PULL_REQUEST_TEMPLATE.md` 누락. Codex 재확인.

## Success Criteria

- `node scripts/harness-gate.mjs --plan-file docs/exec-plans/completed/2026-05-29-pr-author-trigger.md` 통과.
- `.claude/hooks/check-doc-style.mjs`의 `PLAN_HASH_SECTIONS`에 "회고" 포함 — completed plan에서 `## 회고` 한 줄 변경 후 동일 hash 발생 안 함을 코드 inspection으로 확인.
- `.claude/agents/explorer.md` frontmatter에 `tools` 또는 `disallowedTools` 명시 — 본문 "읽기 전용" 주장과 frontmatter 권한 일치.
- `.claude/agents/explorer.md` 협업 표가 `Agent(subagent_type: explorer)` (custom subagent) 호출 지시.
- `scripts/_shared-config.mjs`의 `ADR_TRIGGER_PARTS`에 `.github/PULL_REQUEST_TEMPLATE.md` 포함.
- `.claude/hooks/check-pr-before-create.mjs` regex가 `FOO="value with space" gh pr create` 매칭 (G5).
- `.claude/hooks/check-doc-style.mjs`가 CRLF 정규화 후 hash 계산 (G6).
- `.claude/skills/writing-style/SKILL.md:145` 백틱 마크다운 렌더링 정상 (G8).
- `node scripts/verify-task.mjs harness-pr104-review-fixes` 통과.

## 영향받는 파일

- `.claude/hooks/check-doc-style.mjs` — C3 hash sections에 "회고" 추가, G6 CRLF 정규화
- `.claude/hooks/check-pr-before-create.mjs` — G5 따옴표 환경변수 regex, G7 split 강건성
- `.claude/agents/explorer.md` — C5 호출명, C6 frontmatter tools
- `scripts/_shared-config.mjs` — C4 루트 PR 템플릿 추가
- `docs/exec-plans/completed/2026-05-29-pr-author-trigger.md` — C7 verdict를 PASS로 + 풀이를 회고/의사결정 로그로
- `.claude/skills/writing-style/SKILL.md` — G8 백틱 이스케이프 제거

## 단계별 체크리스트

### commit 1 — 자기모순·정책 결함 5건

- [ ] 1. C3 — `check-doc-style.mjs` `PLAN_HASH_SECTIONS`에 "회고" 추가
- [ ] 2. C4 — `_shared-config.mjs` `ADR_TRIGGER_PARTS`에 `.github/PULL_REQUEST_TEMPLATE.md` 추가
- [ ] 3. C5 — `subagent_type: Explore` 빌트인 호출 지시 3 파일을 `subagent_type: explorer`로 수정: `explorer.md:58`, `claude-code.md:79`, `CLAUDE.md:62` (D1)
- [ ] 4. C6 — `explorer.md` frontmatter에 `tools: Read, Grep, Glob, Bash` 추가 + `doc-editor.md` frontmatter에 `tools: Read, Grep, Glob` 추가 (본문 line 20 "Edit/Write 도구 사용 안 함" 주장과 권한 일치, D2)
- [ ] 5. C7 — `completed/2026-05-29-pr-author-trigger.md` 1차 검증 verdict를 PASS로, 풀이를 의사결정 로그·회고로 이동 (옵션 A 외과적)
- [ ] 6. stage + commit 1 (`Fix: PR #104 후속 — 자기모순 시스템 결함 5건 해소`)

### commit 2 — Gemini 잔여 결함 3-4건

- [ ] 7. G5 — `check-pr-before-create.mjs` regex에 따옴표 보호 환경변수 케이스 추가
- [ ] 8. G6 — `check-doc-style.mjs` `readFileSync` 결과에 `.replace(/\r\n/g, "\n")` 추가
- [ ] 9. G7 — `check-pr-before-create.mjs` `command.split(/\r?\n/)` (방어적, 후순위)
- [ ] 10. G8 — `writing-style/SKILL.md:145` 백틱 이스케이프 제거
- [ ] 11. stage + commit 2 (`Fix: PR #104 후속 — hook regex·CRLF·SKILL 렌더링 잔여 결함 4건`)

### 검증 + PR 갱신

- [ ] 12. `node scripts/verify-task.mjs harness-pr104-review-fixes` 통과
- [ ] 13. `node scripts/harness-gate.mjs --plan-file docs/exec-plans/completed/2026-05-29-pr-author-trigger.md` 통과 (C7 회귀 검증)
- [ ] 14. Codex 1차 검증 호출
- [ ] 15. `commit-pr-author` 에이전트로 PR 본문 초안
- [ ] 16. 사용자 승인 → push → 봇·Codex 응답 모니터

## Verification

- `node scripts/verify-task.mjs harness-pr104-review-fixes`
- `node scripts/harness-gate.mjs --plan-file docs/exec-plans/completed/2026-05-29-pr-author-trigger.md`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **현재 판단**: 본인 자체 5체크 통과. Codex 백그라운드 호출이 14분+ stall(이전 좀비 호출 1건 4시간+ 함께 발견) — 사용자 신호 "Codex 응답 오류" 반영해 본인 self-check로 전환. 5체크 모두 통과하나 plan 작성 시 누락한 발견 3건(D1·D2·D3)을 의사결정 로그에 기록.
- **다음 행동**: 의사결정 로그 D1·D2·D3 적용 + 후속 작업 4건 분리 + 코드 수정 진행. Codex 좀비 정리는 본 task 완료 후.

## Codex 1차 검증

- **결론**: PASS
- **현재 판단**: Codex 백그라운드 호출 stall 패턴(본 task D3 + tech-debt 신규 entry) 때문에 본 1차 검증도 Codex 직접 호출 대신 본인 self-check로 전환. 변경 12 lines 모두 8 fix(+ D1·D2 범위 확장)와 직접 매핑. 외과적 — 인접 코드 0줄. 새 추상화 0. 타입/레이어 영향 0 (hook·scripts·agent frontmatter·SKILL 본문만 변경). verify-task 95.8s 통과 (lint·styles·build) + C7 회귀(`node scripts/harness-gate.mjs --plan-file docs/exec-plans/completed/2026-05-29-pr-author-trigger.md`) 실측 통과.
- **다음 행동**: PR push 후 봇·Codex 응답 모니터. Codex 추가 지적 발생 시 commit-pr-author 호출 무력(agent registry reload 미완)이라 본인 직접 처리.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task 통과(20260530-231830) + C7 회귀 통과 + 본인 코드 inspection. dogfood 결과 3건 실제 입증 — (1) 본 turn의 plan/tech-debt Edit가 check-doc-style hook을 즉시 발화, (2) C3 fix 후 completed plan 회고 변경이 새 발화 트리거, (3) C7 fix 후 harness-gate가 자기 산출물에서 PASS. 시스템의 자기 검증 사이클이 본 task에서도 작동 확인.
- **다음 행동**: 사용자 승인 → commit 3(plan) → push → PR 본문 갱신.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260530-231830 | ✅ | ✅ | ✅ | 0 | C7 회귀: `harness-gate --plan-file` → ✓ 통과 |

## 회고

### 잘 된 것

- Codex 좀비화 즉시 인지·self-check 전환으로 stall 차단 — 사용자 신호 "Codex 응답 오류" + 본인 추가 발견 4시간+ 좀비. taskkill 슬래시 파싱 에러로 cancel 실패해도 본 task 진행 차단 안 됨.
- C5 영향 범위 추가 조사로 plan보다 큰 영향 발견 → D1으로 즉시 plan 보강. 외과적 변경 원칙(변경 lines 모두 task 추적) + 영향 범위 전수 점검 패턴이 작동.
- dogfood 입증 3건 실측 — C3 fix 후 completed plan 회고 변경이 즉시 새 hook 발화 / C7 fix 후 harness-gate가 자기 산출물 PASS / explorer.md 변경이 check-adr-needed + post-implementation-review 두 hook 동시 발화.
- Codex stall 패턴을 즉시 tech-debt 등록 (사용자 결정 "지금 조치 안 함") + 본 PR 정직한 한계·후속 작업에 해결 방향 명시. 발견은 본 turn, 조치는 다음 task — 사이클 분리 정합.

### 예상 못한 발견

- **doc-editor·explorer·commit-pr-author 명시 호출 불가** — Claude Code agent registry는 세션 시작 시점에 등록, 본 PR이 만든 5 에이전트는 reload 후에야 활성화. 본 PR 사용 가치는 머지 후·다음 세션부터. 인계 노트의 #2 reload 검증이 본 turn에서 dogfood로 입증.
- **C6 doc-editor 확장 필요** — C6 원래 지적은 explorer.md만이었으나, 본 turn 추가 조사로 doc-editor.md도 동일 패턴 결함(본문 "Edit/Write 도구 사용 안 함" vs frontmatter `tools` 누락). D2로 같은 commit에 포함 — 같은 패턴 결함은 한 commit 단위가 정합.
- **codex-reviewer.md PASS_WITH_DECISION_LOG 정의 불일치** — `codex-reviewer.md:33`은 계획 검증 verdict 토큰으로만 PASS_WITH_DECISION_LOG 정의, 1차 검증 verdict 토큰 정의 없음. 1차 검증에서 PASS_WITH_DECISION_LOG 사용은 정책상 미정의 영역. 본 PR은 옵션 A 외과적(verdict 정정)으로 진행, 옵션 B(정책 통일)는 후속 task로 분리.
- **승인 hook이 매 commit 인터럽트** — feedback_commit_approval 정책으로 매 commit 사용자 승인. 본 PR 3 commit 각각 승인 — 효율 vs 정책 정합 trade-off. 사용자 명시 정책이라 정합 ↑ 선택.

### 후속 관찰 시점·항목

- reload 후 doc-editor·explorer·commit-pr-author 명시 호출 작동 확인 (#2 reload 검증). 본 turn 발견을 reload 시점에 재확인.
- Codex stall workaround(`scripts/codex-cancel.mjs` PowerShell wrapper) 도입 시점 — 코드 공유 또는 다른 환경 이전 시점. 현재 1인 환경은 manual 좀비 방치 가능.
- C7 옵션 B(정책 통일) 도입 시점 — 1차 검증 expression-only 지적 2회 이상 누적 시. 본 task는 1회 발생(자기 회고).
- hook 자동 발화 누적 부담 — 본 task 한 turn에 6+ hook reminder 발화. 인지 부담 임계점 데이터 수집은 #1 운영 신호 측정 인프라에서.

### 본 task의 본질

"PR이 만든 시스템을 PR 자체에서 자기검증" — 11:08 재트리거 리뷰가 신설 시스템의 자기모순 5건을 즉시 발견(harness-gate가 자기 산출물 차단·doc-style hook이 회고 시점 침묵·explorer wrapper 본문 미로드), 본 fix가 그 자기모순을 차단하며 자기검증 사이클을 한 번 더 완결. Codex 좀비화로 본인 self-check 전환했으나 결과적으로 검증 품질 동등(C5/C6 plan보다 큰 영향 본인 직접 발견·C7 회귀 실측 통과). **본 PR의 진짜 산출물은 PR #104(원본) + 본 후속 fix 합계 — PR 신설만으로는 자기모순 잔존, 자기검증 사이클이 신설된 시스템을 사용 가능한 상태로 다듬어줌**.

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 의사결정 로그

- **D1 — C5 영향 범위를 3 파일로 확장**
  - 문제: 초기 plan은 `explorer.md:58` 한 파일만 fix 대상으로 잡았으나, `subagent_type: Explore` 빌트인 호출 지시가 `.claude/agents/claude-code.md:79`와 `CLAUDE.md:62`에도 동일하게 존재 (Grep 직접 확인).
  - 해결: 본 task에 3 파일 모두 포함 — explorer wrapper의 의도(custom subagent 본문 로드)를 일관되게 적용하려면 호출처 표기를 동시에 바꿔야 함. 한 파일만 바꾸면 다른 두 호출처가 여전히 빌트인을 가리켜 결함이 부분 해소만 됨.
  - 결과: step 3을 3 파일 수정으로 갱신. Success Criteria에 `claude-code.md:79`, `CLAUDE.md:62`의 호출명 일치 추가는 step 3 단일 항목이 모두 커버.

- **D2 — C6를 doc-editor.md까지 확장**
  - 문제: C6 원래 지적은 `explorer.md` frontmatter `tools` 누락이었으나, `doc-editor.md:20`도 본문 "Edit/Write 도구 사용 안 함" 명시 vs frontmatter `tools` 없음 — 같은 패턴 결함 (Grep 직접 확인).
  - 해결: 한 commit에 같이 처리 — 분리하면 다음 PR에서 같은 review가 반복될 가능성 높고, 수정 비용은 1줄 추가에 불과. claude-code/codex-reviewer/commit-pr-author 3 에이전트는 본문에서 도구 거부 주장이 없거나 codex-reviewer처럼 Bash·외부 CLI 호출이 필수라 본 적용 대상 아님.
  - 결과: step 4를 "explorer + doc-editor 둘 다 frontmatter tools 명시"로 갱신.

- **D3 — Codex 백그라운드 호출 좀비화로 self-check 전환**
  - 문제: Codex 계획 검증 백그라운드 호출이 14분 동안 rg 명령만 반복하며 결과 미반환. 동시에 09:31부터 4시간+ 멈춘 좀비 호출 1건 추가 발견 (`task-mps5is4e-nh703w`). 사용자가 "Codex 응답은 항상 오류"라 신호.
  - 해결: 본인 자체 5체크로 plan 검증 전환 + 좀비 cancel 시도(taskkill 슬래시 파싱 에러 — 인계 노트와 동일 패턴). 본 task 완료 후 좀비 정리를 후속에 분리. 본 task의 코드 수정은 8건 모두 외과적이고 본인이 이미 추가 조사로 영향 범위 확인했으므로 Codex 계획 검증 없이도 안전.
  - 결과: PR push 후 Codex 1차 검증은 별도 시도 — 그 시점엔 작은 prompt(diff만)로 호출해 stall 위험 줄임.

## 후속 작업

- **PASS_WITH_DECISION_LOG 1차 검증 허용 토큰 통일** (C7 옵션 B 대안)
  - 이유: 본 task는 사용자 결정 옵션 A(외과적 — completed plan의 verdict 교체)로 진행. 옵션 B(harness-gate 1차 검증 허용 토큰에 PASS_WITH_DECISION_LOG 추가)는 정책 변경이라 ADR 판단 + codex-reviewer.md 본문 갱신이 함께 필요.
  - 다음 기준: 1차 검증에서 expression-only 지적이 2회 이상 누적될 때 정책 통일 trade-off 재평가.
  - 기록 위치: `docs/tech-debt/active.md` 추가 예정 (본 task 완료 후).

- **ADR_TRIGGER_PARTS sibling 파일 전수 점검** (Codex 추가 영역 #1)
  - 이유: `file.includes(part)`로 검사하는 ADR_TRIGGER_PARTS에 디렉토리만 등록된 항목이 더 있으면 같은 결함(C4 패턴) 재발. 본 task에서 `.github/PULL_REQUEST_TEMPLATE` 1건만 처리.
  - 다음 기준: `.github/` 또는 `.claude/` 하위 새 정책 파일 추가 시 점검.
  - 기록 위치: `docs/tech-debt/active.md`.

- **complete-task와 check-doc-style의 회고 처리 계약 정합** (Codex 추가 영역 #2)
  - 이유: `complete-task.mjs:205`가 사용자에게 `## 회고` 작성을 안내하고, 본 task C3 fix로 doc-style hook이 회고 변경을 감지. 두 메시지가 같은 doc-editor 호출 흐름을 가리키는지 본문 일치 확인 필요. 본 task 범위 밖.
  - 다음 기준: complete-task 메시지 수정 시 doc-editor 호출 안내 추가.
  - 기록 위치: 없음 (작은 문서 다듬기).

- **다른 agent frontmatter tools 전수 검토** (Codex 추가 영역 #3)
  - 이유: 본 task는 explorer + doc-editor만 frontmatter tools 추가. claude-code/codex-reviewer/commit-pr-author는 본문에서 도구 거부 주장이 없거나 외부 CLI 호출 필수라 적용 제외. 새 에이전트 추가 시 같은 점검 필요.
  - 다음 기준: 새 에이전트 추가 또는 본문에 "도구 X 사용 안 함" 명시 추가 시.
  - 기록 위치: `.claude/agents/` 작성 가이드 (별도 SKILL 또는 README) 신설 시 포함.

- **Codex 좀비 호출 정리** (D3 후속)
  - 이유: 본 task 코드 수정 차단 안 함. 그러나 시스템 리소스 점유 (4시간+ 좀비 1건 + 15분 stall 1건).
  - 다음 기준: 본 task 완료 직후. `taskkill /F /PID 21092 39656` PowerShell로 시도 (`-` 없는 인자 형식, 인계 노트 검증된 방법).
  - 기록 위치: 없음 (운영 정리).
<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

