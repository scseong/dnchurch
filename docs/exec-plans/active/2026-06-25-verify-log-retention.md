# verify-log-retention

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-25
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — scripts/verify-task.mjs에 로그 보존 동작(작업당 최근 N개 유지)만 추가. 외부 계약·데이터 흐름·라이브러리 변화 없음

## 목표

`verify-task.mjs`는 실행마다 새 run 디렉토리를 만들지만 옛 것을 지우지 않아 로그가 무한 누적된다(5월부터 336개 run dir·44MB까지 쌓였다가 방금 비움). 작업당 최근 N개 run dir만 남기고 나머지를 자동 삭제해 재발을 막는다.

## 검증된 Assumptions

- run dir 이름은 `YYYYMMDD-HHMMSS` 형식 — `verify-task.mjs:21-25 timestampCompact`, `:71-74`에서 `logs/<taskId>/<runId>/` 생성 확인.
- `latest.json`은 run dir이 아니라 task 디렉토리(`logDir`) 바로 아래 파일 — `:78`, `:157 copyFileSync`. run dir만 지우면 보존됨.
- `logs/`는 gitignore(`/logs/`) — `git ls-files logs/` 0건. 삭제해도 git·배포 영향 없음.
- `scripts/`는 ADR_TRIGGER_PARTS 포함 — `scripts/_shared-config.mjs:7-29`. CODEX_PLAN_REVIEW + ADR 판단 대상.

## Success Criteria

- `node --check scripts/verify-task.mjs` 통과(구문 오류 0).
- 가짜 run dir 12개 + `latest.json`을 만든 뒤 prune 실행 → 최신 10개만 남고 오래된 2개 삭제, `latest.json` 보존(yes/no).
- **현재 run 보존**: 미래 이름 dir(예: `20990101-000000`) 10개 + 현재 run 1개가 있을 때 현재 run 삭제 0건(Codex 변경 요청(CR) 대응 — D1).
- `verify-task.mjs` 실제 1회 실행 시 에러 없이 끝나고 새 run dir 생성 + prune 동작(dev 미가동 확인 후).

## 영향받는 파일

- `scripts/verify-task.mjs` — `readdirSync`·`rmSync` import 추가, `pruneOldRuns(dir, keep, currentRunId)` 함수 추가, 단계 루프 직후 호출.

## 단계별 체크리스트

- [x] 1. `node:fs` import에 `readdirSync`·`rmSync` 추가
- [x] 2. `KEEP_RUNS` 상수 + `pruneOldRuns(logDir, KEEP_RUNS, runId)` 함수 작성. 삭제 후보 조건은 `Dirent.isDirectory()` AND `/^\d{8}-\d{6}$/` 둘 다 충족. **현재 `runId`는 후보에서 제외**하고, 나머지를 lexical 정렬해 최신 `KEEP_RUNS - 1`개만 남긴 뒤 그 앞을 `rmSync(force:true)`로 삭제 (D1)
- [x] 3. 단계 루프(`:220`) 직후·결과 요약 전에 `pruneOldRuns(logDir, KEEP_RUNS, runId)` 호출 (pass·fail 양쪽 공통 경로)
- [x] 4. 가짜 dir 시뮬레이션(미래 이름 dir 포함) + `node --check`로 prune 로직 검증 — 현재 run 보존·`latest.json` 보존 확인
- [x] 5. dev 미가동 확인 후 `verify-task.mjs` 실제 1회 실행

## Verification

- `node scripts/verify-task.mjs verify-log-retention`

## Non-goals

- 스테일 task 폴더 일괄 삭제 안 함 — 현재 실행 중인 task의 `logDir`만 prune한다(다른 task 증적 보존).
- 보존 개수를 환경변수(`VERIFY_KEEP`)로 노출하지 않음 — `KEEP_RUNS` 하드코딩 상수. 값 조정이 필요하면 그 상수 한 줄만 고친다.
- 단계(ESLint·stylelint·build·knip) 로직·검증 정책 변경 안 함.

## ADR 판단

- **불필요** — `scripts/`는 ADR_TRIGGER_PARTS지만, 이 변경은 기존 스크립트에 로그 보존 동작을 더하는 것뿐이다. 아키텍처·라이브러리·레이어·외부 계약·데이터 흐름을 바꾸지 않는다. 영구 결정이 아니라 로그 청소 동작이라 ADR을 만들지 않는다.

## 의사결정 로그

- **D1 — prune 후보에서 현재 run을 빼고 나머지 최신 `KEEP_RUNS - 1`개만 유지**
  - 문제: `pruneOldRuns(logDir, keep)`가 이름 lexical 정렬로 최신 N개만 남기면, 미래 이름 dir(`20990101-000000`)이 이미 N개 있거나 시계가 어긋난 경우 방금 만든 현재 run이 "오래된 항목"으로 분류돼 삭제될 수 있다(Codex CHANGE_REQUEST, high).
  - 해결: 시그니처에 `runId`를 받아 후보에서 현재 run을 먼저 제외한다. 그 뒤 나머지를 정렬해 최신 `keep - 1`개만 남긴다 — 현재 run이 한 칸을 차지하므로 총 보존은 `keep`개다. 대안(현재 run을 keep set에 무조건 add)도 가능하나, 후보에서 빼는 쪽이 "현재 run은 절대 삭제 대상이 아니다"를 코드로 더 분명히 한다.
  - 결과: 미래 이름 dir이 있어도 현재 run 삭제 0건. Success Criteria에 해당 테스트를 추가했다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (high) — 현재 run dir 보호 누락 1건(material). 시그니처에 `runId`를 추가해 현재 run을 후보에서 제외하는 방식으로 해소(D1). 표현 지적 1건(삭제 조건 `isDirectory()` AND 정규식 둘 다 명시)도 체크리스트 2번에 반영.
- **현재 판단**: lexical 정렬(zero-padded라 chronological 일치)·`latest.json` 보존(파일+패턴 불일치)·호출 위치(`writeManifest` 전, pass·fail 공통)는 PASS. "현재 run이 항상 최신 N개에 든다"는 숨은 가정만 깨지면 현재 run이 삭제될 수 있다는 지적이 타당.
- **다음 행동**: 계획 수정 완료(D1 + SC 현재 run 보존 테스트 추가). CHANGE_REQUEST는 재요청 불필요 — WORK 진입.

## Codex 1차 검증

- **결론**: 생략 — diff 약 30줄, 레이어·데이터·타입·라이브러리 변화 없음. Codex 계획 검증이 지적한 단 하나의 material 위험(현재 run 삭제)을 그 시나리오로 직접 실측해 막은 것을 확인했다.
- **현재 판단**: ADR 0001 위임 기준상 단순·저위험 + 검증 통과 + 엣지 케이스 실측 완료라 1차 위임을 생략한다. 필요 시 사용자 요청으로 추가 가능.
- **다음 행동**: 없음.

## Claude 2차 검증

- **최종 판단**: PASS — `verify-task.mjs verify-log-retention` 통과(ESLint·stylelint·Build 통과, Knip은 기존 부채 경고). prune 동작과 D1 엣지 케이스를 실측 확인했다.
- **현재 판단**: 가짜 미래 이름 dir 11개에 현재 run 1개를 더해 실행했다. 현재 run(`20260625-211944`)은 사전순 최소인데도 보존됐다 — D1 미적용이면 삭제됐을 케이스다. 세부 결과는 아래 표.
- **다음 행동**: 사용자 커밋 승인 요청.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260625-211944 | ✅ | ✅ | ✅ | 0 (기존 부채만) | prune 결과 5항목 실측 — 전부 통과 |

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

## 후속 작업

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

