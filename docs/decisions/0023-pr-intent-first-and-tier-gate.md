# 0023 — PR 본문을 의도부터 읽게 + 검증 게이트를 위험도 tier로

- **Status**: Accepted
- **Date**: 2026-07-21
- **Deciders**: scseong, Claude Opus 4.8, Codex
- **Tags**: harness, agent-collaboration, workflow, documentation

## Context

두 가지 병목이 겹쳐 있었다.

첫째, PR 본문이 코드 나열이었다. 유형별 템플릿 5종(feature·bugfix·refactor·maintenance·release, 88~142줄)이 `개요 → 배경 → 변경점 → 의사결정 → 검증 → 체크리스트 → 확인 포인트` 골격을 공유했고, 리뷰어는 수천 줄 diff를 훑어야 작업 의도를 짐작했다. 정작 "왜 이 작업이 필요했나 / 왜 이 방법인가"는 본문 어디에도 강조되지 않았다.

둘째, 검증 게이트가 위험도와 무관하게 획일이었다. `harness-gate`가 `Codex 계획 검증`·`Codex 1차 검증`·`Claude 2차 검증` 세 verdict 섹션을 변경 크기와 무관하게 강제했다. 그래서 오타 한 줄을 고쳐도 Codex를 세 번(계획·1차) 불러야 했는데, Codex CLI는 이 Windows 환경에서 느리고(한 번에 4~8분) 가끔 hang한다(memory `project_codex_windows_unavailable`). ADR 0010이 같은 비용 문제로 계획 검증만 손봤으나 Codex 1차·Claude 2차는 남아 있었다.

조사에서 드러난 사실: 세 검증의 강제 지점은 커밋이 아니라 머지 전 `harness-gate` 수동 실행 1회였고(`.husky/pre-commit`의 `enforce-verification`은 verify-task 기록만 warn-only로 본다), 게이트는 Codex가 실제로 돌았는지 검증하지 않아 hang 시 사람이 위조 PASS를 적어도 통과하는 구멍이 있었다.

결정을 안 하면: 문서 작성 병목이 유지되고, 사소한 변경마다 불필요한 Codex 호출이 hang 위험에 노출되며, "검증했다"는 기록이 실제 검증 없이 남을 수 있다.

## Decision

**PR 템플릿을 단일 5섹션으로 통합한다.** `.github/PULL_REQUEST_TEMPLATE.md` 하나에 `1.문제 · 2.접근 · 3.변경 범위 · 4.검증 · 5.남은 위험`을 담는다. 리뷰어는 1·2번(문제·접근)을 먼저 읽고 방향에 동의되면 3번 이하로 내려간다 — 코드 diff는 마지막이다. 유형 차이(버그 재현 조건, 리팩터링 Before/After 등)는 같은 5섹션 안에서 무엇을 적느냐로 흡수한다. `develop → main` 릴리스만 성격이 달라(배포·롤백·머지 전 체크가 안전장치) `release.md`를 남긴다.

**검증 게이트를 변경 위험도(tier)로 재편한다.** `harness-gate`가 `git diff <merge-base> --numstat`로 변경 파일·LOC를 세어 tier를 판정하고, tier별로 요구 verdict 섹션을 강제한다.

| tier | 조건 | 요구 verdict |
| --- | --- | --- |
| 0 (사소) | ADR-trigger 미적중 · `src/` 없음 · 파일 ≤2 · LOC ≤20 | 없음 (verify 기록만) |
| 1 (보통) | ADR-trigger 미적중 · 위 초과 · 파일 ≤5 · LOC ≤100 | Codex 계획 검증 |
| 2 (고위험) | `ADR_TRIGGER_PARTS` 적중 · 또는 파일 >5 · LOC >100 · binary | Codex 계획 검증 + Codex 1차 검증 |

- **`Claude 2차 검증` 섹션을 없앤다.** verify-task manifest(`assertVerification`)가 lint·build 기록을 담당하고, VERIFY 결과는 exec-plan `## Verification`에 남긴다. Codex가 1차 수정한 경우의 교차 확인은 `## Codex 1차 검증` 본문에 함께 적는다.
- **Codex hang용 fallback 토큰 `CODEX_UNAVAILABLE`을 둔다.** `Codex 1차 검증`에서만 허용하고 `오류: / 시도: / Claude 확인:` 3필드를 요구한다 — 위조 PASS와 구분되게 무엇이 실패했고 Claude가 무엇을 직접 확인했는지 남긴다. `Codex 계획 검증`은 이 토큰을 허용하지 않는다(plan-first의 핵심이라 건너뛸 수 없다).
- **base ref를 못 찾거나 git 명령이 실패하면 fail-closed로 차단한다.** 빈 diff를 Tier 0로 오판해 검증을 건너뛰지 않는다.

**본 ADR은 0008·0010의 "verdict 3섹션 기본"을 개정(supersede)한다.** 0008이 명시한 `Codex 1차 + Claude 2차` 운영과 0010의 "compact exec-plan = 6섹션 + verdict 3섹션"은 이 tier 모델로 대체된다. 두 ADR 상단에 역참조를 남긴다.

## Consequences

### 긍정적
- 오타·문서 한 줄은 Codex 0회(Tier 0), 보통 변경은 계획 검증 1회(Tier 1), 고위험만 계획+1차(Tier 2). 사소한 변경의 병목이 사라진다.
- 강제 Codex 호출이 줄어 hang 위험이 준다. 고위험 변경에 검증이 집중된다.
- PR을 코드가 아니라 사고 과정으로 승인한다. 리뷰어가 1·2번에서 방향을 되돌릴 수 있어 수천 줄 diff를 다 안 봐도 된다.
- Codex hang이 위조 PASS가 아니라 `CODEX_UNAVAILABLE` 기록으로 드러난다.

### 부정적 / 트레이드오프
- `harness-gate`에 tier 판정 로직(numstat 파싱·merge-base resolve·binary·untracked)이 추가돼 유지 대상이 늘었다. fixture 6개로 회귀를 방어한다.
- `CODEX_UNAVAILABLE` 3필드 정규식은 위조 억제책이지 암호적 차단이 아니다 — 라벨을 무관 텍스트에 심으면 형식은 통과한다. 사람·리뷰어가 plan에서 보고 판단하는 deterrent로 둔다.
- tier 경계값(파일 2/5, LOC 20/100)은 실측 없이 정한 초기값이다. 운영하며 조정할 수 있다.

### 영향 범위
- 코드: `scripts/harness-gate.mjs`(tier 판정·CODEX_UNAVAILABLE·fail-closed), `scripts/complete-task.mjs`(세 섹션 파싱→tier 대응), `.claude/hooks/`(check-doc-style `PLAN_HASH_SECTIONS`, post-implementation-review 넛지), `sectionBody` 헤딩 오인 버그 수정(4파일).
- 문서: 단일 PR 템플릿, `docs/exec-plans/_template.md`, harness-workflow·writing-style·complete-task SKILL, CLAUDE.md, 에이전트 정의 등 약 17파일.
- 운영: 머지 전 `harness-gate`가 tier에 맞는 검증만 요구한다. 커밋 게이트(`enforce-verification`)는 안 바꾼다.

## Alternatives Considered

### A안: 게이트는 그대로 두고 문서만 축소
- 처음 채택했던 방향(Non-goal에 "게이트 유지"로 명시). 세 검증의 비용·중복을 조사한 뒤 뒤집었다.
- 기각: 사용자가 지목한 진짜 병목은 "단계별 기록"이었고, 그 정체가 세 verdict 섹션이었다. 문서만 줄이면 병목이 남는다.

### B안: PR 템플릿 6종을 전부 삭제(릴리스도 5섹션)
- 기각: `release.md` 116줄 중 절반이 배포·운영 체크 7항목·롤백 계획·머지 전 체크리스트다. 이건 읽는 글이 아니라 배포 전에 하나씩 짚는 안전장치라 5섹션 산문으로 옮기면 기능을 잃는다.

### C안: 위험도 무관하게 계획 검증만 남기고 1차·2차는 폐지
- 기각: Codex 1차의 고유 가치(외과적 변경 점검)는 diff가 클 때 실재한다. 고위험 변경까지 계획 검증만 하면 인접 정리·레이어 위반이 든 대규모 diff를 놓친다. tier 2에서만 1차를 요구해 이 가치는 지킨다.

### D안: PR 본문에 `verify-task` 결과를 한 줄로 유지
- 기각: `logs/`는 `.gitignore`라 PR에 적은 RUN_ID를 리뷰어가 대조할 수 없다 — 믿어야 하는 문자열이다. 같은 정보가 exec-plan 링크로 닿는다. 기계 검증 신호는 후속 `verify.yml`(CI)로 만드는 편이 낫다.

## References

- 관련 PR: 본 ADR을 도입하는 PR (TBD — PR 본문에 채움)
- 관련 exec-plan: `docs/exec-plans/active/2026-07-21-pr-intent-first-docs.md`
- 관련 ADR: 0008(코드 품질 harness — 본 ADR이 verdict 3섹션 부분 개정), 0010(Codex 리뷰 cap — 본 ADR이 tier로 확장·개정)
- 후속: `.github/workflows/verify.yml` 신설(PR에서 lint·build → GitHub Checks) — exec-plan `## 후속 작업`
