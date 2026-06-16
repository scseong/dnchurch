# harness-pr-review-step

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: chore/harness-pr-review-step
- **Open questions**: none
- **ADR needed**: no — `.claude/`·`CLAUDE.md` 변경이나 새 정책 도입이 아니라 기존 수동 절차의 문서화. history row로 충분 (Codex Q5 동의)

## 목표

PR 생성 이후 리뷰 대응(수집 → 코드 대조 검증 → 수정/기각 → 답글)을 harness-workflow에 표준 절차로 박는다. 핵심은 봇 지적을 코드 확인 없이 중계하지 못하게 막는 것 — 실제로 #118 `dryRun`, #119 React 19 ref 두 건이 코드 미확인 중계로 오탐이었다.

## 검증된 Assumptions

- harness-workflow SKILL은 `### 7. COMMIT / GATE`(186행)에서 끝나고 PR 리뷰 대응 절차가 없다 — `Read SKILL.md` 확인.
- `commit-pr-author`는 "PR 본문 최종 문구"와 exec-plan 검증표 인용을 소유한다(D1) — `Read commit-pr-author.md:16,35-36` 확인. 리뷰 답글은 별도 산출물이라 충돌 없음.
- `agent-router` hook이 "객관 리뷰" 신호에 발화한다 — `.claude/hooks/agent-router.mjs` 존재, `.claude/settings.json:8`에 `UserPromptSubmit`로 등록 확인.
- Git Bash(MINGW)에 `jq` 미설치 — handoff 66행 기록. 답글 본문은 PowerShell `ConvertTo-Json`으로 생성.

## Success Criteria

- [ ] SKILL.md에 `### 8. PR_REVIEW` 절이 있다. 진입 조건을 본문에 명시한다 — "PR에 리뷰·CI·인라인 코멘트가 달렸을 때" **AND** "사용자가 리뷰 대응을 요청했을 때"(둘 다 충족 시 진입, 백그라운드 자동 실행 없음).
- [ ] 답글마다 Evidence block 3줄(`Claim` / `Checked with` / `Result`)을 요구하고, "명령·file:line 근거 없으면 답글 금지" hard rule이 있다.
- [ ] SKILL에 Windows gotcha 3건이 명시된다 — ① `jq` 미설치로 `| jq` 실패(gh 내장 `--jq`만 사용) ② PowerShell `Remove-Item`이 replies URL을 삭제 경로로 오인 차단(임시파일 정리는 별도 실행 또는 Git Bash `rm`) ③ 답글 엔드포인트 `POST /repos/{owner}/{repo}/pulls/{pr}/comments/{commentId}/replies`.
- [ ] CLAUDE.md Workflow 절에 포인터 1줄 + "하네스 변경 이력" 표 1행이 추가된다.
- [ ] `node scripts/verify-task.mjs harness-pr-review-step` 통과(문서만 변경 — lint/build 회귀 0).

## Non-goals

- 헬퍼 스크립트 `scripts/pr-review.mjs` 신규 생성 안 함 (D3 — 승격 기준 충족 전까지 레시피만).
- 새 hook 신규 추가 안 함 (리뷰는 GitHub 외부 비동기 이벤트라 결정적 hook 타이밍 없음 — Codex Q5 동의).
- 새 ADR 신규 작성 안 함 (기존 절차 문서화 — history row로 추적).
- 최상단 워크플로우 문자열 `EXPLORE→…→COMMIT` 변경 안 함 (PR_REVIEW는 항상 도는 단계가 아님).
- `commit-pr-author`·`doc-editor` 에이전트 정의 파일 변경 안 함 (D4 — 답글 owner는 claude-code, 기존 경계 유지).

## 영향받는 파일

- `.claude/skills/harness-workflow/SKILL.md` — `### 8. PR_REVIEW` + 명령 레시피
- `CLAUDE.md` — Workflow 포인터 1줄 + 이력 표 1행

## 단계별 체크리스트

- [x] 1. SKILL.md `### 7` 뒤에 `### 8. PR_REVIEW` 추가 (수집→검증→처리→답글 루프 + Evidence block + hard rule)
- [x] 2. SKILL.md에 `## PR 리뷰 명령` 레시피 블록 추가 (수집 필드 고정 + gh/PowerShell + gotcha 3건 + 승격 기준)
- [x] 3. CLAUDE.md Workflow 절 포인터 1줄 + 이력 표 1행
- [x] 4. doc-editor 점검 → verify-task → 승인 후 커밋

## Verification

- `node scripts/verify-task.mjs harness-pr-review-step`

## ADR 판단

ADR 불필요. `.claude/`·`CLAUDE.md`는 ADR_TRIGGER_PARTS이나, 이번 변경은 새 구조·라이브러리·정책 도입이 아니라 이미 손으로 하던 절차를 문서로 옮기는 것이다. hook·스크립트·데이터 흐름 변경 없음. "하네스 변경 이력" 표 1행으로 추적 충분.

## 의사결정 로그

- **D1 — PR_REVIEW를 고정 단계가 아니라 조건부 event-driven 루프로 둔다**
  - 문제: 현 워크플로우는 `EXPLORE→…→COMMIT` 7단계로 닫혀 있다. 리뷰는 PR 생성 이후 비동기로 와서 결정적 타이밍이 없다. "8단계"로 번호를 매기면 리뷰 없는 PR에서도 빈 단계가 도는 것처럼 읽힌다.
  - 해결: 최상단 워크플로우 문자열은 그대로 두고, `### 8. PR_REVIEW`를 COMMIT 이후 "리뷰가 달렸을 때만" 진입하는 루프로 적는다. 진입 트리거는 사용자 발화. Codex도 같은 지적(Q1) — "event-driven loop"로 명명 권고. 번호 `### 8.`은 SKILL 본문 `### 1. EXPLORE`~`### 7. COMMIT / GATE` 일련번호의 다음 순번일 뿐 파이프라인 8번째 필수 단계가 아니다 — 오인을 막으려 CLAUDE.md 최상단 문자열에는 PR_REVIEW를 넣지 않고, 절 제목에 `(조건부 — event-driven)`을 병기한다 (Codex F4 근거 반영).
  - 결과: 리뷰 없는 PR에서 빈 단계가 안 돈다. 절차가 비동기 현실과 맞는다.

- **D2 — 답글마다 Evidence block 3줄을 강제하고 근거 없으면 답글을 금지한다**
  - 문제: 체크리스트만 추가하면 "확인했다" 한 줄로 퇴화한다. #118·#119 오탐 두 건은 모두 코드·라이브러리 확인 없이 봇 지적을 중계한 결과였다.
  - 해결: 답글 초안마다 `Claim` / `Checked with <명령 or file:line>` / `Result` 3줄을 요구하고, "명령·file:line 근거 없는 봇 지적엔 답글 금지"를 hard rule로 둔다. hook 없이 텍스트 규칙으로 도장 찍듯 통과하는 것을 막는다. Codex Q4 권고.
  - 결과: 코드를 짚지 않으면 답글이 안 나온다. 중계 금지(relay) 교훈이 형식으로 박힌다.

- **D3 — 헬퍼 스크립트 `pr-review.mjs`를 지금 만들지 않는다 (문서만)**
  - 문제: 스크립트를 처음부터 만들면 GitHub API shape·shell quoting·thread 상태 처리를 한 번에 고정해야 한다. Windows + jq 부재 환경에서 위험이 크다.
  - 해결: 검증된 명령을 레시피로만 남긴다. 승격 기준 명시 — PR 2건 이상에서 같은 PowerShell 레시피를 반복하거나 thread 상태 필터가 필요해지면 그때 스크립트로. Codex Q2 동의 + 수집 필드가 어긋나지 않게 5개 필드 고정.
  - 결과: 유지보수 파일 0. "재사용 확인 시점에만 추상화" 가드레일과 맞는다.

- **D4 — 리뷰 답글 초안 소유자를 claude-code로 둔다**
  - 문제: 답글 owner를 commit-pr-author에 통째로 넘기면 코드 검증 맥락이 끊긴다. 그렇다고 D1(파생 PR 문구 = commit-pr-author) 경계를 깨면 안 된다.
  - 해결: 답글 내용은 검증에서 나온 판단이라 claude-code가 초안. 긴·민감한 답글만 commit-pr-author에 문체 다듬기를 위임. 게시는 사용자 승인 후. Codex Q3 — "split 명확, D1 충돌 없음" 확인.
  - 결과: 검증 맥락 보존 + 기존 D1 경계 유지.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST 5건(material 3 + expression 2) → 5건 모두 반영 완료
- **현재 판단**: material 3건 수정 끝 — F2 `## Non-goals` 섹션 신설, F3 SC 3에 gotcha 3건 내용 인라인(jq 미설치 / `Remove-Item` 오인 차단 / replies 엔드포인트), F4 D1에 `### 8.` 번호 유지 근거 추가(SKILL 내부 일련번호일 뿐 파이프라인 단계 아님). expression 2건도 반영 — F1 A3에 `.claude/hooks/agent-router.mjs`·`settings.json:8` 근거 추가(코드로 확인), F5 SC 1 트리거를 "리뷰 존재 AND 사용자 요청" 두 조건으로 명시.
- **다음 행동**: WORK 진입 — SKILL.md `### 8` + 레시피 + CLAUDE.md 작성

핵심 지적(Codex F4, 가장 무거움) — Codex stdout verbatim:

> [material] — D1-`### 8.` 충돌. D1이 event-driven loop 문제를 인식하고도 번호 유지 근거 없음 + SC 1 grep이 `### 8. PR_REVIEW`로 고정 → 구현자 혼동. (…) `### 8.`을 추가하면 (a) 독자가 7단계 뒤의 8번째 필수 단계로 오인할 수 있고, (b) 이후 하네스 절 번호를 추가할 때 충돌이 납니다. (…) SC 1은 `grep "### 8. PR_REVIEW"`로 고정되어 있어 비번호 제목을 쓰면 SC가 실패합니다.

풀이: 번호는 SKILL 내부 순번으로 유지하되 그 근거를 D1에 한 줄 박고, CLAUDE.md 최상단 문자열에는 PR_REVIEW를 넣지 않아 "항상 도는 단계" 오인을 막는다.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high) — material 4건 주장. 단, 주요 근거 A-2가 오탐(Claude 2차에서 반박).
- **현재 판단**: Codex 샌드박스가 두 차례 spawn 오류로 파일을 못 읽어 깨진 텍스트로 검토함(응답에 "인코딩 깨짐" 명시, 인용한 SKILL 문장이 실제와 불일치). 그 위에서 4건 material 주장.
- **다음 행동**: Claude 2차에서 건별 교차 확인 — 오탐 기각, 타당 건만 반영

Codex stdout verbatim (verdict 근거 핵심):

> **판정**: CHANGE_REQUEST / 신뢰도: high
> **주요 근거**: GitHub API 경로 버그(`pulls/<PR#>/comments/<id>/replies`가 아닌 `pulls/comments/<id>/replies`)는 실행하면 404가 납니다.

풀이: Codex는 답글 엔드포인트에 PR 번호가 없어야 한다고 주장했다. 이 주장이 verdict의 가장 무거운 근거다 — 2차에서 GitHub 문서로 직접 검증했다.

## Claude 2차 검증

- **최종 판단**: PASS — Codex CR 6건 중 2건 오탐 기각, 2건 반영, 2건 후속. verify-task `20260615-221839` 통과(lint·styles·build ✅, Knip ⚠ 기존 부채).
- **현재 판단**: 아래 표대로 건별 교차 확인. 핵심은 A-2 오탐 기각 — 우리가 codify하는 "중계 금지" 규율을 reviewer 지적에 그대로 적용해 출처로 반박했다.
- **다음 행동**: 사용자 승인 후 커밋

| Codex 지적 | 분류 | 판정 | 근거 |
| --- | --- | --- | --- |
| A-2/E-4 답글 API 경로에 PR 번호 빼라 | material 주장 | **오탐 기각** | GitHub 공식 문서: `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies` — pull_number 포함이 정답(`docs.github.com/en/rest/pulls/comments` WebFetch 확인). handoff 기준 #118·#119에서 이 명령으로 실제 답글 게시 성공 |
| A-1 `--jq` 표현 혼란 | expression | **오탐 기각** | 깨진 텍스트 오독. 실제 SKILL 문장은 "gh 내장 `--jq`만 사용 — `\| jq`는 jq 미설치라 안 됨"으로 정확 |
| A-3/E-1 `$replyFile` 미정의 | material | **반영** | 레시피에 `$replyFile = "reply.md"` 한 줄 + 주석 추가 |
| C `Checked with:` 빌 때 동작 모호 | material | **반영** | hard rule을 "검증 단계로 돌아가 코드 재확인 — 무시·근거 없는 기각 아님"으로 명료화 |
| A-5 issue 코멘트 수집 누락 | material | **후속** | 인라인 스레드 답글이 #118·#119 실제 케이스. 범위 경계 1줄 명시 + 후속 등록 |
| E-2 새 리뷰 제출 구분 없음 | material | **후속** | 위와 같음 — 필요해지면 추가 |
| B 번호 / D 모순 | — | 이상 없음 | Codex도 동의 |

## 검증 이력

<details>
<summary>2026-06-15 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: material 3건 — Non-goals 섹션 부재(F2), SC 3 gotcha 내용 비고정(F3), D1-`### 8.` 번호 충돌(F4)
- 조치: F2 `## Non-goals` 신설 / F3 SC 3 인라인 / F4 D1 근거 추가 + F1·F5 expression 반영

</details>

## PR 리뷰 대응

PR #125 리뷰를 § 8 절차로 처리했다 (수집 → 코드/문서 대조 검증 → 반영). 봇 2 + Codex 1, 고유 6건.

| 지적 | 출처 | Checked with | 판정 | 반영 |
| --- | --- | --- | --- | --- |
| `--paginate` 없으면 코멘트 30개 초과 누락 | PR 봇 + Codex | GitHub 문서: 기본 per_page=30·최대 100 | 타당 | 수집 2줄에 `--paginate` |
| 답글은 최상위 comment id만 | PR 봇 + Codex | GitHub 문서: "replies to replies not supported" | 타당 | `select(.in_reply_to_id==null)` + gotcha 1줄 |
| CI 실패 로그 수집 필요 | PR 봇 | `gh pr checks`는 상태만, 로그는 `gh run view --log-failed`(Actions 한정) | 타당 | 레시피 2줄 + 외부 CI 주석 |
| Evidence `Checked with:`에 수집 명령만 적어도 통과 | Codex Q3 | 규칙 문구 직접 확인 | 타당 | hard rule을 "수집 명령은 근거 아님"으로 강화 |
| 새 writing 규칙이 기존 예시와 충돌 | Codex Q4 | writing-style `:335-338` 짧은 2문장 | 타당 | "표 셀·3개+, 짧은 2문장 예외"로 한정 |
| `GetTempFileName` 임시파일 누적 | Codex 보조 | gotcha #2가 이미 정리 안내 | 중복 | 안 함 |

오탐: gemini는 API 경로 지적을 스스로 오탐 처리(우리 판정에 동의). 최종 검증에서 Codex가 FIX ③↔④ 충돌(④가 ③의 CI 로그·문서 인용까지 배제)을 잡아, ④ 허용 목록을 넓혀 해소.

## 후속 작업

- PR 리뷰 수집·답글 범위 확장 (issue 코멘트 + 새 리뷰 제출)
  - 이유: 이번 레시피는 인라인 리뷰 코멘트 스레드 답글만 다룬다 (#118·#119의 실제 케이스). PR 일반 코멘트(`issues/{PR#}/comments`)·승인/변경요청 리뷰 제출(`pulls/{PR#}/reviews`)은 아직 쓸 일이 없었다.
  - 다음 기준: 인라인 외 코멘트에 답해야 하는 PR이 실제로 나오면 레시피에 추가.
  - 기록 위치: 본 exec-plan (tech-debt 미등록 — 절차 누락이 아니라 범위 경계)
