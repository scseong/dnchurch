# exec-plan-readability

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-17
- **브랜치**: feat/exec-plan-readability
- **Open questions**: none
- **ADR needed**: yes — `scripts/complete-task.mjs` 동작 변경 + ADR 0008 메커니즘 2(검증 기록 규칙) SSOT 개정. 영구 정책.

## 목표

exec-plan 문서가 압축·기호 누적·약어로 읽기 어려워진 문제를 해결한다.

- 의사결정 로그·검증 기록을 `제목 + 문제/해결/결과` bullet 형식으로 강제한다.
- 완료 문서의 상태가 거짓("🟡 진행 중")으로 남는 것을 스크립트가 자동으로 막는다.
- 사람 의지가 아니라 템플릿 모양과 스크립트로 지속시킨다.

## 검증된 Assumptions

- `start-task.mjs`는 `_template.md`를 복사만 한다(46~58줄, 제목·날짜·브랜치만 치환) → 템플릿을 고치면 신규 문서에 자동 전파. (Read 확인)
- `complete-task.mjs`는 파일을 `renameSync`로 이동만 하고(150줄) `- **상태**:` 줄을 건드리지 않는다 → 완료 후 상태가 "🟡 진행 중"으로 남는 근본 원인. (Read 확인)
- `complete-task.mjs`의 review/회고 체크는 `HARNESS_ENFORCE=1`일 때만 차단, 기본은 경고(9·16~19줄). (Read 확인)
- 검증 기록 규칙 SSOT는 `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙", 템플릿은 짧은 reference만 보유(`_template.md:66`). (Read 확인)
- `harness-gate.mjs`는 active plan의 verdict 토큰·placeholder·본문 30자만 검사 — 형식(bullet 구조)은 미검사. (Read 확인)

## Non-goals

- grep 가드 3종(D 번호 중복 / completed 상태 lint / 폐기 배너 링크 강제) — 이번 범위 제외. 사유는 의사결정 로그 D2.
- 기존 active/completed 문서 일괄 재작성 — 형식은 신규 문서부터 적용, 과거 문서는 건드리지 않음(외과적).
- `HARNESS_ENFORCE` 기본값을 1로 바꾸기 — 별개 정책, 범위 외.
- `harness-gate.mjs`에 형식 검사 추가 — 템플릿 모양으로 자가강제, 별도 lint 미도입.

## 접근법 — complete-task 상태 재기록 명세 (Codex CR 반영)

- 상태 줄 매칭 정규식: `/^- \*\*상태\*\*:.*$/m` (anchored, multiline).
- 분기:
  - 매칭 0개 → `fail("상태 줄을 찾지 못함 — 템플릿 형식 확인")`. 이동 안 함.
  - 매칭 2개 이상 → `fail("상태 줄이 2개 이상 — 수동 확인 필요")`. 이동 안 함.
  - 매칭 1개이고 `🟡` 또는 `진행 중` 포함 → `- **상태**: ✅ 완료 (YYYY-MM-DD)`로 치환.
  - 매칭 1개이고 그 외(이미 `✅ 완료`·`취소`·`폐기`·`대체`/superseded) → 덮어쓰지 않음, 안내만 출력(부분 상태 보존).
- 순서: 이동 전에 `newContent` 계산 → 실패 조건이면 이동 없이 종료 → 통과 시 `writeFileSync(target,newContent)` 성공 후 `rmSync(source)`(원본 우선 보존, write 실패해도 원본 안전). CRLF 종단은 `(\r?)` 캡처로 보존.
- 날짜: `start-task.mjs`의 `localDate()` 동일 로직을 `complete-task.mjs`에 추가(중복 helper, 외부 의존 없음).

## Success Criteria

- `_template.md`에 채워진 의사결정 로그 예시(제목+문제/해결/결과) + 검증 표 한 개 골격 + 약어/기호잇기 금지 한 줄이 들어간다.
- `node scripts/start-task.mjs <slug>` 생성 문서가 그 형식을 그대로 갖는다.
- `node scripts/complete-task.mjs <slug>` 실행 시 진행 중 문서의 `- **상태**:` 줄이 `✅ 완료 (YYYY-MM-DD)`로 재기록된다(경고 아님, 항상). 상태 줄 0개/2개는 이동 차단, 이미 종료 상태는 보존.
- `.claude/skills/harness-workflow/SKILL.md` "검증 결과 기록 규칙"에 의사결정 로그 형식 규칙(6줄 이내 spec + before/after 1쌍)이 추가된다.
- verify-task PASS (lint/styles/build/knip 0 신규).

## 영향받는 파일

- `docs/exec-plans/_template.md` — 의사결정 로그 형식 예시 + 검증 표 골격 + 금지 한 줄 추가
- `scripts/complete-task.mjs` — 이동 시 `- **상태**:` 줄 하드 재기록(renameSync → 내용 수정 후 write)
- `.claude/skills/harness-workflow/SKILL.md` — "검증 결과 기록 규칙"에 의사결정 로그 형식 절 추가
- (신규) `docs/decisions/0011-exec-plan-readability.md` — 정책 ADR

## 단계별 체크리스트

- [x] 1. `_template.md` 형식 개정(의사결정 로그 예시·검증 표·금지 한 줄)
- [x] 2. `complete-task.mjs` 상태 줄 하드 재기록 구현
- [x] 3. SKILL "검증 결과 기록 규칙"에 형식 절 추가
- [x] 4. ADR 0011 작성 + `update-adr-index.mjs`
- [x] 5. D2 후속(grep 가드 2종) tech-debt-tracker 등록
- [x] 6. verify-task + complete-task 엣지케이스 3종 + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs exec-plan-readability` (최종 판단의 필수 신뢰 명령 — 아래 수동 확인은 보조)
- `node scripts/start-task.mjs _fmt-check` 후 생성물 형식 확인 → 파일 삭제
- complete-task 엣지케이스 3종 확인:
  - 진행 중 임시 plan → 이동본 상태 줄 `✅ 완료 (날짜)` 확인 후 되돌림
  - 상태 줄 삭제한 임시 plan → 이동 차단·에러 메시지 확인
  - 이미 `✅ 완료`인 임시 plan → 상태 미변경(보존) 확인
- D2 후속(grep 가드 2종)을 `docs/tech-debt-tracker.md`에 등록했는지 확인

## 의사결정 로그

- **D1 — 형식 규칙을 SKILL SSOT에 추가(템플릿 단독 아님)**
  - 문제: 검증/의사결정 기록 규칙 SSOT는 SKILL "검증 결과 기록 규칙"이고 템플릿은 reference만 보유. 형식 규칙을 템플릿에만 두면 SSOT가 갈라진다.
  - 해결: 형식 spec는 SKILL에 6줄 이내로 추가(기존 규칙과 같은 위치), 채워진 예시는 템플릿에 둔다(템플릿은 SKILL을 이미 참조).
  - 결과: SSOT 단일 유지. SKILL 비대화 우려는 절을 6줄+예시 1쌍으로 제한해 완화.
- **D2 — grep 가드 3종은 이번 범위 제외**
  - 문제: 최종 방법론은 가드 3종(D번호 중복·completed 상태·폐기 링크)을 포함했으나, 테스트 환경이 없고 lint 표면 추가는 surgical 원칙과 충돌.
  - 해결: completed 상태 가드는 단계2(complete-task 하드 재기록)로 이미 무력화되므로 불필요. 나머지 2종은 형식 정착 후 필요성 입증 시 별도 작업.
  - 결과: 이번 변경을 자가강제(템플릿 모양) + 보장 메커니즘 1개(스크립트)로 최소화. 후속은 tech-debt 등록.
- **D3 — Codex 계획검증 CHANGE_REQUEST 반영**
  - 문제: Codex가 (a) 브랜치/작업트리 오염, (b) complete-task 재기록 명세 부족, (c) tech-debt 후속·최종 판단 분산을 지적.
  - 해결: (a) 이전 세션 sermons 완료 처리를 `git stash@{0}`로 분리하고 `feat/exec-plan-readability` 신규 브랜치 생성(사용자 결정). (b) `## 접근법` 절에 정규식·엣지케이스 4분기·write 순서 명시. (c) Verification에 엣지케이스 3종 + tech-debt 등록 확인 추가, verify-task를 필수 신뢰 명령으로 명시.
  - 결과: material CR 3건 해소. 후속 검증 재요청은 cap 규칙상 생략(CR, BLOCK 아님), WORK 진입.
- **D4 — Codex 1차 검증 CHANGE_REQUEST 반영 (실버그 2건)**
  - 문제: (a) 상태 줄 정규식 `.*$`가 `\r`를 먹어 CRLF 저장소에서 치환 후 그 줄만 LF → diff 노이즈. (b) `renameSync` 후 `writeFileSync` 순서라 write 실패 시 원본 소실 + target 손상.
  - 해결: (a) 정규식을 `[^\r\n]*(\r?)$`로 바꿔 CRLF 종단을 캡처·보존(콜백 치환에서 `${cr}` 복원). LF만 보존하는 대안은 저장소 CRLF 정책과 불일치라 기각. (b) `renameSync`를 `writeFileSync(target)`→`rmSync(source)` 순서로 교체. 이유: write가 실패해도 원본이 남아 데이터 무손실(rename-then-write는 실패 시 복구 불가). git은 내용 유사도로 여전히 rename 인식.
  - 결과: CRLF 저장소에서 줄바꿈 노이즈 0, write 실패 시에도 원본 보존. 엣지케이스 3종 재검증 통과.
- **D5 — 한글 문장 규칙 추가 (사용자 지시, ADR 0011 연장)**
  - 문제: 형식 규칙은 무엇을 어디에 쓸지만 잡고, 문장을 어떻게 쓰는지는 못 잡았다. 밀도·반복·번역투는 생성 단계의 한글 표현 습관에서 나온다.
  - 해결: 문장 규칙을 범위별로 나눠 배치했다. 전역 규칙(자연스러운 한국어, 상투적 AI 표현 금지, 한 문장 한 가지)은 항상 로드되는 `CLAUDE.md` 핵심 규칙에 2줄로 넣었다. 상세 규칙과 before→after 예시는 `harness-workflow` SKILL "한글 문장 규칙"과 memory에 두었다. SKILL은 트리거 시에만 로드돼 전역을 못 덮으므로 CLAUDE.md가 필요했다.
  - 결과: 일반 응답·커밋·문서 전부에 문장 규칙이 적용된다. CLAUDE.md는 짧게 유지하고 상세는 SKILL로 분담해 지도 비대화를 피했다.

## ADR 판단

- **필요** — `scripts/complete-task.mjs` 동작 변경(상태 자동 재기록)은 harness 스크립트 정책 변경이고, 의사결정 로그 형식 강제는 ADR 0008 메커니즘 2(검증 기록 규칙) 운영 표준을 개정한다. 영구 정책이므로 `docs/decisions/0011-exec-plan-readability.md` 작성. CLAUDE.md·SKILL의 한글 문장 규칙 추가(D5)는 ADR 0011 연장이라 새 ADR 불필요 — 본 섹션 기록으로 갈음.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high, 2026-05-17) → D3로 전건 해소 후 WORK 진입

> material 3건: ① Assumptions 브랜치(plan=feat/exec-plan-readability vs 실제 develop) 불일치 + 작업트리에 무관 sermons rename 4건+tech-debt 혼입 → 커밋 오염. ② complete-task 상태 재기록 정규식·엣지케이스(상태 줄 0/2개·이미 취소·대체)·write→rename 순서 미정의. ③ Success Criteria의 hard rewrite 실패 조건 검증 부재.
> expression: D2 "후속 tech-debt 등록"이 Verification에 확인 줄 없음 / verify-task PASS와 수동 확인 분산.
> 토큰: CHANGE_REQUEST.

**풀이**: ①은 stash@{0} 분리 + feat/exec-plan-readability 브랜치 생성으로 해소(사용자 결정). ②③은 `## 접근법` 절에 정규식 `/^- \*\*상태\*\*:.*$/m` + 4분기(0개 fail / 2개+ fail / 진행중 치환 / 종료상태 보존) + write 순서 명시, Verification에 엣지케이스 3종 + tech-debt 등록 확인 추가. expression 2건도 같은 Verification 갱신으로 흡수. CR(BLOCK 아님)이라 cap 규칙대로 재요청 없이 WORK 진입.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence medium, 2026-05-17) → 실버그 2건 Claude 수정 적용

> 1. BUG — `statusRe = /^- \*\*상태\*\*:.*$/gm`의 `.*`가 `\r`까지 먹고 치환문은 `\r` 미복원 → CRLF 파일에서 그 줄만 LF, diff/후속편집 줄바꿈 노이즈. 수정 권고: `[^\r\n]*(\r?)$` + `$1`.
> 2. BUG — `renameSync`(L183) 뒤 `writeFileSync`(L184) 실패 시 active 소실 + completed 손상. 권고: completed 먼저 쓰고 성공 후 원본 제거.
> regex 카운트·제어흐름·surgical·ADR 0011/index = OK. 결론 CHANGE_REQUEST.

**풀이**: 2건 모두 실버그라 즉시 수정. (1) `/^- \*\*상태\*\*:[^\r\n]*(\r?)$/gm` + 콜백 치환 `${cr}` 복원 → CRLF 종단 보존. (2) `writeFileSync(target)` 성공 후 `rmSync(source)` 순서로 교체 → write 실패해도 원본 무손실. 엣지케이스 3종 + CRLF 보존 재검증 통과(아래 표).

## Claude 2차 검증

- **최종 판단**: PASS (Codex 1차 CR 2건 수정 후 교차검증)

### 검증 표

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차(CR 전) | 20260517-201816 | ✅ | ✅ | ✅ | 0 | 엣지 3종 PASS |
| 2차(CR 수정 후) | 20260517-202755 | ✅ | ✅ | ✅ | 0 | 엣지 3종 + CRLF 보존 PASS |

### 교차 확인

- **CRLF 수정**: CRLF 임시 plan 완료 처리 → lone-LF 0건·CRLF 7건·상태 줄 `✅ 완료` 정상(`node -e` 측정). 회귀 없음.
- **순서 수정**: `writeFileSync`→`rmSync` 교체로 `renameSync` import 제거(내 변경이 만든 unused라 surgical 제거). git은 내용 유사도로 rename 인식.
- **엣지케이스 3종**: 진행중→✅완료 / 상태줄 0개→이동 차단·active 유지 / 종료상태(취소됨)→보존. 전부 재현 통과.
- **surgical**: 변경 7파일 전부 plan 영향 파일과 일치. `complete-task.mjs`는 helper 2개 추가 + 이동 블록 3줄 교체만, 기존 검증 로직(decision-log placeholder·review section warnOrFail) 무변경.
- **knip 경고**: 신규 코드 심볼 0(helper는 동일 모듈 내부 사용). 목록은 기존 ~50건 부채(`feedback`/tech-debt 기등록), 비차단.
- **형식 보완(사용자 WHY 지시)**: 템플릿·SKILL·메모리·ADR 4곳에 "`해결:`의 핵심=왜 그 방법인가" 반영. 본 plan의 D1~D4가 그 형식을 dogfood.

---

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
