# harness-output-readability

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-17
- **브랜치**: feat/harness-output-readability (WORK 진입 전 develop 기반 신규 — 현재 feat/exec-plan-readability)
- **Open questions**: none
- **ADR needed**: no — `scripts/verify-task.mjs` 출력 포맷 개선만. 검증 정책·게이트 동작·manifest 스키마 불변(아래 Assumptions로 확인). scripts/ 트리거라 inline 사유 명시.

## 목표

하네스 검증의 개발자 대면 출력을 "한눈에 진행·결과 파악 가능"하게 만든다.

- 터미널에서 통과/실패/진행을 스크롤 없이 즉시 본다.
- `summary.log`가 통짜 덤프가 아니라 실제 요약이 된다.
- 가독성이 최우선 — 정보량보다 신호 명확성.

## 검증된 Assumptions

- `verify-task.mjs:169`이 각 단계 전체 출력을 `summary.log`에 append → summary.log 80KB(eslint 11KB+stylelint 54KB+knip 8KB), per-step `*.log` 중복. (Read 확인)
- `verify-task.mjs:174-178`이 `result.status !== 0`이면 `warningOnly`(knip)도 100줄 tail을 결과 요약 앞에 stdout 출력. (Read 확인)
- 4단계 `spawnSync` blocking·비-verbose 시 무출력. 진행/경과시간 표시 없음. (Read 확인)
- `enforce-verification.mjs`는 `latest.json`/`manifest.json`의 diff hash만 읽음 — `summary.log` 내용을 파싱하지 않음. → summary.log 포맷 변경은 게이트·강제 동작에 영향 0. (Read 확인)
- manifest.json 스키마(taskId/runId/status/hash/failed/warned/log)는 enforce-verification·harness-gate 계약 → 스키마 불변 유지. (Read 확인)
- `logs/` 최상위 40+ task 디렉토리(verify-output-check2 등 일회성 실험 누적). (ls 확인)

## Non-goals

- `logs/` 자동 정리(run 보관 N개 제한·prune) — 디스크 위생은 출력 가독성과 별개. tech-debt 등록 후속.
- manifest.json 스키마 변경 — enforce-verification/harness-gate 계약이라 불변.
- harness-gate·complete-task·start-task 출력 — 개별로는 짧고 OK. 기호 통일은 범위 외(verify-task가 최대 노이즈 표면).
- 검증 정책(무엇을 검사·차단 기준) 변경 — 출력만 손댄다.

## Success Criteria

- knip만 경고인 일반 통과 시 터미널 마지막 화면 = 단계별 결과 + `결과 요약` + 로그 경로. knip 100줄 tail 덤프 0줄.
- knip 신규 회귀 추적 가능 — 경고 1줄에 `knip.log` 경로 + `VERIFY_VERBOSE=1 node scripts/verify-task.mjs <task>` 안내 포함.
- 실패 시 실패한 단계의 tail만 출력(통과·경고 단계 tail 0줄).
- 각 단계 시작 시 `[n/4] <라벨> 실행 중…`, 종료 시 경과초 표시. 마지막에 총 경과시간.
- `summary.log`에 단계 전체 출력 없음 — 헤더 + 단계별 1줄 + 결과 요약만(per-step 전체는 기존 `*.log` 유지). 크기 5KB 미만(현 80KB).
- `enforce-verification.mjs`/`harness-gate.mjs` 동작 무변경(manifest hash 매칭 그대로 통과).
- verify-task PASS, knip 신규 0.

## 영향받는 파일

- `scripts/verify-task.mjs` — `runStep` 출력/요약 로직, `summary.log` 기록 분리, 진행·경과시간 표시

## 단계별 체크리스트

- [x] 1. `summary.log` 분리 — 단계 전체 출력 append 제거(per-step `*.log`만 보유), summary는 헤더+단계 1줄+요약
- [x] 2. 터미널 tail 정책 — 실패 단계만 tail, 경고(knip)는 `⚠ <라벨> 경고 (로그경로 · VERBOSE)` 1줄
- [x] 3. 진행 표시 — `[n/4]` + 단계 경과초 + 총 경과시간
- [x] 4. logs/ 정리는 tech-debt 등록(완료, 45a1cf2)
- [x] 5. verify-task 실증 + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs harness-output-readability` (필수 신뢰 명령)
- 통과 케이스: knip만 경고인 상태에서 실행 → 터미널 마지막 화면에 knip tail 0줄, 결과 요약 보임
- knip 회귀 추적 확인: 경고 1줄에 `knip.log` 경로 + `VERIFY_VERBOSE=1` 안내 노출 확인 → `logs/<task>/<run>/knip.log` 열어 `docs/tech-debt-tracker.md:117`의 ~50건 대비 신규 항목 0 확인
- 실패 케이스: 일부러 lint 오류 1개 주입 → ESLint tail만 출력, 통과 단계 tail 없음, 주입 되돌림
- `summary.log` 크기·내용 확인(<5KB, 단계 전체 출력 없음)
- `node scripts/enforce-verification.mjs harness-output-readability` → 기존대로 hash 매칭 통과(포맷 변경 무영향 확인)

## 의사결정 로그

- **D1 — summary.log를 요약 전용으로 분리(전체 출력 제거)**
  - 문제: `runStep`이 단계 전체 출력을 summary.log에 append해 80KB 통짜가 됨. 정작 요약은 knip 벽 뒤에 묻혀 "요약"이라는 이름이 거짓.
  - 해결: 두 가지를 검토했다.
    - (a) summary.log를 없애고 manifest만 남긴다.
    - (b) summary.log를 진짜 요약(헤더 + 단계 1줄 + 결과)만 남긴다.
  - (b)를 택했다. 전체 출력은 이미 per-step 파일에 있어 중복이다. summary.log를 없애면 한 파일로 결과 보는 동선이 사라진다. per-step 파일은 그대로 둬서 정보 손실이 없다.
  - 결과: summary.log가 스캔 가능한 요약(<5KB), 전체 로그는 per-step 파일로 보존.
- **D2 — 경고 단계는 tail 덤프 안 함(실패만 덤프)**
  - 문제: knip은 알려진 영구 비차단 부채인데 매 실행 100줄 tail이 결과 요약 앞에 출력돼 신호가 스크롤 밖으로 밀림.
  - 해결: tail 덤프를 `!warningOnly && status!==0`(실패)만으로 한정. 경고 1줄 형식 = `⚠ <라벨> 경고 (logs/<task>/<run>/knip.log · 상세: VERIFY_VERBOSE=1)`. 이유: 경고=비차단이라 매번 100줄을 볼 필요 없으나, knip은 ~50건 부채 중 신규 1건이 섞일 수 있어(선례: completed/2026-05-14-sermons-detail-series-sidebar.md) 추적 경로를 1줄에 반드시 노출.
  - 결과: 일반 통과 시 터미널 마지막 화면이 결과 요약. knip 신규 회귀는 1줄의 knip.log 경로·VERBOSE 안내로 추적 가능. 실패 시에만 해당 단계 tail.
- **D3 — logs/ 정리는 이번 범위 제외**
  - 문제: 최상위 40+ 일회성 task 디렉토리로 관련 run 찾기 어려움.
  - 해결: 이번 작업에서 제외하고 tech-debt 등록. 이유: 출력 가독성(터미널/summary)이 사용자 최우선이고, 디스크 prune은 삭제 정책·보관 기준 결정이 필요한 별개 관심사. 한 작업에 섞으면 surgical 위반.
  - 결과: 범위를 verify-task.mjs 출력 1파일로 최소화. prune은 후속 tech-debt.
- **D4 — Codex 계획검증 CHANGE_REQUEST 반영**
  - 문제: (a) knip 경고 tail을 숨기면 ~50건 부채 중 신규 회귀 추적 경로가 약함(material). (b) plan이 "50줄"로 썼으나 실제 `verify-task.mjs:111 TAIL_LINES=100`(expression).
  - 해결:
    - (a) 추적 경로를 명문화했다. 경고 1줄에 knip.log 경로와 VERIFY_VERBOSE 안내를 넣는다. Verification에서 knip.log를 열어 신규 0을 확인한다. 대안인 "경고도 tail 유지"는 노이즈 제거 목적과 충돌해 기각했다.
    - (b) "50줄" 표기를 "100줄"로 정정했다. 실제 기준은 `verify-task.mjs:111`의 `TAIL_LINES=100`이다.
  - 결과: material CR 해소(추적 경로 명문화), 표기 정합. BLOCK 아니라 cap 규칙대로 재요청 없이 WORK 가능(단, 본 요청은 plan 생성까지 — 커밋·WORK 미진행).
- **D5 — Codex 재검증 PASS_WITH_DECISION_LOG, 한글 규칙 expression 3건 반영**
  - 문제: 사용자 요청으로 Codex 재검증을 돌렸다. D4 해소는 확인됐고 5체크는 material 0건이다. 다만 산문 3줄이 새 한글 문장 규칙을 어겼다.
  - 해결: Codex가 짚은 3줄을 최소 수정했다.
    - D1 해결 줄: 대안 (a)(b)를 하위 bullet로 쪼개고, 채택 이유를 짧은 문장으로 분리했다.
    - D4 해결 줄: material 해소와 expression 해소를 두 bullet로 나눴다.
    - ADR 판단 줄: `·` 4연결과 명사 압축을 풀어 서술어 종결 문장으로 바꿨다.
  - 결과: 이 plan이 자기 가독성 규칙을 지킨다. 재작성은 없었다. 재검증 verdict는 PASS_WITH_DECISION_LOG다.
- **D6 — WORK 구현 + Codex 1차 CR 2건 반영**
  - 문제: `verify-task.mjs` 3변경(D1·D2·D3)을 구현했다. Codex 1차가 실버그 0건, WARN 2건을 짚었다.
  - 해결: TTY 진행힌트 잔류 문자를 `\r\x1b[2K` 줄삭제로 제거했다. 직접 위치 계산 대신 erase-line ANSI를 쓴 이유 — 후속 출력 길이와 무관하게 항상 깨끗하다. `TOTAL_STEPS=4` 하드코딩을 `STEPS` 배열 길이로 도출해 단계 증감 시 표시 드리프트를 구조적으로 없앴다.
  - 결과: 실측 — summary.log 80KB→719B, knip tail 0줄, per-step 로그 보존, enforce-verification hash 매칭 통과. 게이트 회귀 0.

## ADR 판단

- **불필요** — `verify-task.mjs`의 출력 포맷과 진행 표시만 바꾼다. 검증 대상과 차단 기준은 그대로다. `manifest` 스키마와 게이트 동작도 바꾸지 않는다. 근거: `enforce-verification`은 `summary.log`를 읽지 않는다(Assumptions 참조). `scripts/`가 ADR 트리거라 inline 사유를 남긴다. `start-adr.mjs`는 실행하지 않는다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **현재 판단**: 계획 CR·재검증 expression은 모두 plan에 반영됨. 상세는 검증 이력.
- **다음 행동**: 구현 완료. Codex 1차 검증으로 이동.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST
- **현재 판단**: 실버그 0건. WARN 2건(TTY 잔류 문자·TOTAL_STEPS 하드코딩) 수정 적용. 재검증 통과.
- **다음 행동**: Claude 2차 교차 확인.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: 3변경 실측 통과. summary.log 719B, knip tail 0줄, 게이트 회귀 0.
- **다음 행동**: 사용자 승인 후 커밋.

## 검증 이력

<details>
<summary>2026-05-17 Codex 계획 검증 (1차 → 재검증)</summary>

- 판정: CHANGE_REQUEST → PASS_WITH_DECISION_LOG
- 이유: knip tail 숨김에 신규 회귀 추적 경로 없음. plan "50줄" vs 실제 100줄. 재검증 시 산문 3건.
- 조치: D4(추적 경로 명문화·표기 정정), D5(산문 3줄 최소 수정).

</details>

<details>
<summary>2026-05-18 Codex 1차 검증</summary>

- 판정: CHANGE_REQUEST
- 이유: TTY+VERBOSE에서 `\r` 진행힌트 잔류 문자. `TOTAL_STEPS=4` 하드코딩 드리프트.
- 조치: spawnSync 후 줄삭제(`\r\x1b[2K`). STEPS 배열에서 `TOTAL_STEPS` 도출.

</details>

---

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. 의사결정 로그·검증 기록은 위 "의사결정 로그 항목 형식" 고정 — 압축·기호잇기·약어·한 항목 다결정 금지. -->
