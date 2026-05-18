# 0011 — exec-plan 가독성 표준

- **Status**: Accepted
- **Date**: 2026-05-17
- **Deciders**: noreason0824
- **Tags**: harness, docs, process

## Context

exec-plan 문서가 읽기 어려워졌다.

- 한 줄에 사유·구현·토큰·근거·링크를 `·`·`→`·`+`로 누적해 사람이 파싱 못 함.
- 의사결정 로그가 비순차로 무한 append되고 검증 결과 단락이 복붙 반복됨.
- completed로 옮긴 문서가 헤더에 "🟡 진행 중"으로 남아 상태가 거짓.

ADR 0008 메커니즘 2가 "추상명사 금지·구체화 4원소"는 강제했지만 **구조(스캔 가능성)는 강제하지 않아** 구체성이 기호 압축 run-on으로 변질됐다. 방치 시 compaction/handoff 복구 가치가 사라지고 작성자(1인) 본인도 맥락을 못 읽는다.

## Decision

exec-plan 의사결정 로그·검증 기록에 가독성 형식을 강제한다.

- **의사결정 로그**: 항목 = `**Dn — 한 줄 제목**` + `문제:`/`해결:`/`결과:` bullet. `해결:`은 "왜 그 방법인가(이유·대안 대비 근거)"가 핵심 — "무엇을 했다"로 끝내지 않음. `결과:`는 성과. 한 항목 = 한 결정. 기호 잇기·약어·한 항목 다결정 금지. 폐기는 원항목 끝 `⚠️ 정정` 한 줄.
- **검증 기록**: 공통 결과(lint/styles/build/knip)는 표 1행. 단락 재서술·`(a)~(g)` 재나열 금지.
- **상태 진실성**: `complete-task.mjs`가 completed 이동 시 진행 중 상태 줄을 `✅ 완료 (날짜)`로 자동 재기록. 상태 줄 0개/2개는 이동 차단, 이미 종료 상태는 보존.
- **강제 위치**: 규칙 SSOT는 `harness-workflow` SKILL "검증 결과 기록 규칙", 채워진 예시는 `_template.md`(start-task가 복사 → 자가강제). SKILL/harness-gate에 lint는 미추가.

## Consequences

### 긍정적
- 작성자·미래 독자가 의사결정 맥락(문제→해결→결과)을 빠르게 복구.
- 완료 문서 상태가 항상 사실 — stale "진행 중" 제거.
- 신규 문서는 템플릿 모양만 따라도 형식 충족(사람 의지 비의존).

### 부정적 / 트레이드오프
- 짧은 결정도 최소 3줄(문제/해결/결과)로 늘어 미세하게 길어짐 — 한 항목 다결정 금지로 상쇄.
- grep 가드(D 번호 중복·폐기 링크 강제)는 이번 범위 제외 → 그 2건은 여전히 사람 의존(tech-debt 등록).

### 영향 범위
- 코드: `scripts/complete-task.mjs`(상태 재기록), `docs/exec-plans/_template.md`(형식 예시), `.claude/skills/harness-workflow/SKILL.md`(형식 절).
- 운영: 신규 exec-plan부터 적용. 기존 문서 일괄 재작성은 안 함(외과적).

## Alternatives Considered

### A안: 톤 규칙 1줄만 추가(코드 변경 0)
- 사유로 기각: 기존 `feedback_concise_plans` 지침이 있었는데도 문서가 망가짐 — 사람 의지만으론 재발.

### B안: 고정 4필드 양식 + 커스텀 markdown lint
- 사유로 기각: 짧은 결정을 1→5줄로 부풀려 `feedback_concise_plans` 위반. 테스트 환경 없는 저장소에 lint 인프라는 speculative. (Claude·Codex 서브에이전트 비평 합의)

## References

- 관련 PR: (이 작업 PR)
- 관련 exec-plan: `docs/exec-plans/active/2026-05-17-exec-plan-readability.md`
- 관련 ADR: `0008-code-quality-harness.md`(메커니즘 2 개정), `0001-codex-orchestration-strategy.md`
