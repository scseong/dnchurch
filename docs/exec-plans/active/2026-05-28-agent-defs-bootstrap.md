# agent-defs-bootstrap

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-28
- **브랜치**: refactor/harness-engineering
- **Open questions**: none
- **ADR needed**: no — ADR 0001(이미 Accepted)을 에이전트 정의 파일로 옮기는 작업이라 신규 결정 없음. `.claude/agents/` 신설은 harness 메타 스킬 규칙 적용.

## 목표

`harness:harness` 메타 스킬이 요구하는 `.claude/agents/{name}.md` 정의 파일을 만들어 ADR 0001의 Claude/Codex 역할 분담을 재사용 가능한 에이전트 정의로 분리한다. `harness-workflow` 스킬과 5개 hook은 그대로 유지하고, CLAUDE.md에 하네스 포인터 + 변경 이력을 등록한다.

## 검증된 Assumptions

- `.claude/agents/` 디렉토리 부재 확인 — `ls .claude/agents/` → `No such file or directory`
- 기존 스킬 6개 운영 중 — `ls .claude/skills/` → `complete-task`, `file-structure`, `harness-workflow`, `styles`, `supabase`, `ui-components`
- 기존 hook 5개 운영 중 — `ls .claude/hooks/` → `agent-router.mjs`, `check-codex-after-plan.mjs`, `check-adr-needed.mjs`, `post-implementation-review.mjs`, `post-test-analysis.mjs`
- ADR 0001 Status = Accepted (`docs/decisions/0001-codex-orchestration-strategy.md:3`) — 역할 분담 SSOT
- 플러그인 활성화 확인 — `.claude/settings.json:60` `"harness@harness-marketplace": true`

## Success Criteria

- `.claude/agents/` 하위에 `claude-code.md`, `codex-reviewer.md`, `explorer.md` 3 파일 생성 (yaml frontmatter `name`/`description`/`model: opus` 모두 포함)
- 각 정의 파일에 핵심 역할 / 작업 원칙 / 입출력 프로토콜 / 협업 / 위임 트리거 5 섹션 포함
- CLAUDE.md에 `## 하네스: dnchurch web` 섹션 추가 (트리거 규칙 1줄 + 변경 이력 테이블 1행)
- 기존 6 스킬·5 hook·9 script 파일 변경 0건 (외과적 변경 — agents/ 신설과 CLAUDE.md 1 섹션만)
- `node scripts/verify-task.mjs agent-defs-bootstrap` 통과 (lint/styles/build/knip 회귀 0)

## Non-goals

- 기존 6 스킬의 description/본문 수정 — 외과적 변경 위반
- 신규 오케스트레이터 스킬 생성 — `harness-workflow`가 이미 그 역할
- 도메인 전문가 에이전트(sermon/about/admin) 추가 — Phase 0 사용자 선택에서 명시 제외
- hook 동작 변경 — 별도 task

## 영향받는 파일

- `.claude/agents/claude-code.md` (신규)
- `.claude/agents/codex-reviewer.md` (신규)
- `.claude/agents/explorer.md` (신규)
- `CLAUDE.md` (`## 에이전트 역할 분담` 섹션 확장 + 하네스 변경 이력 테이블 추가)
- `.claude/settings.json` (`enabledPlugins.harness@harness-marketplace: true` 1줄 — 사용자의 `/plugin install harness@harness-marketplace`로 추가. 본 task의 메타 스킬 적용 전제이므로 함께 묶음)
- `docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md` (본 문서)

## 단계별 체크리스트

- [x] 1. Phase 0 감사 — 기존 자산 확인 및 분기 결정
- [x] 2. ADR 0001 정독 — 역할 분담 SSOT 확인
- [x] 3. exec-plan 작성
- [x] 4. `.claude/agents/claude-code.md` 작성 — 오케스트레이터·구현·2차 검증·기록·커밋
- [x] 5. `.claude/agents/codex-reviewer.md` 작성 — 계획 검증·1차 검증·깊은 추론·디버깅
- [x] 6. `.claude/agents/explorer.md` 작성 — 빌트인 Explore 래퍼 (컨텍스트 수집·claim 검증)
- [x] 7. CLAUDE.md `## 에이전트 역할 분담` 섹션 확장 + 하네스 변경 이력 테이블 추가 (외과적 변경 — 별도 신규 섹션 대신 기존 섹션 확장)
- [x] 8. 구조 검증 — frontmatter / 에이전트 간 참조 일관성 / 커맨드 0건
- [x] 9. Codex 통합 검증 호출 (D1) → CHANGE_REQUEST 4건 (3 material + 1 expression-only)
- [x] 10. CR 4건 해소 (Finding 1: SSOT 표현 / Finding 2: D1 표현 + 검증 섹션 기록 / Finding 3: 영향 파일 + D2 / Finding 4: codex-reviewer.md `## 위임 트리거` 신설)
- [ ] 11. `node scripts/verify-task.mjs agent-defs-bootstrap` 재실행 (CR 반영 후 회귀 확인)
- [ ] 12. 사용자 승인 → 커밋

## 의사결정 로그

- **D1 — Codex 계획 검증과 1차 검증을 단일 호출로 통합 수행**
  - 문제: 다단계 작업이지만 코드 변경 0건(문서·정의 파일만)이라 plan 검증과 구현 검증을 분리할 실익이 적음. 그러나 ADR_TRIGGER_PARTS(`CLAUDE.md`, `.claude/`)에 해당하는 변경이라 무검증은 정책 위반.
  - 해결: 두 단계를 단일 Codex 호출에서 함께 수행한다 — 프롬프트에 5체크(plan)와 구현 리뷰(diff)를 동시 요청. 이유 — 변경 단위가 "ADR 0001 → 정의 파일 이동"이라 plan-text와 구현이 사실상 같은 산출물이고, 통합 호출 1회가 분리 2회보다 토큰·시간 모두 절약. 대안인 "두 단계 별도 호출"은 같은 파일을 두 번 보게 됨.
  - 결과: Codex 호출 1회로 두 검증 정책 충족. 결과 토큰은 `## Codex 계획 검증`·`## Codex 1차 검증` 양쪽에 동일 verdict로 기록.

- **D2 — `.claude/settings.json`을 본 task 스코프에 합침 (별도 분리 안 함)**
  - 문제: 사용자의 `/plugin install harness@harness-marketplace`로 `enabledPlugins` 1줄이 자동 추가됨. 외과적 변경 원칙상 본 task와 무관한 변경은 분리해야 함.
  - 해결: 본 task 스코프에 포함시킨다. 이유 — `harness@harness-marketplace` 플러그인 활성화가 본 task(`harness:harness` 메타 스킬 적용)의 직접 전제. 분리하면 두 commit의 의도가 같아져 의미 없음. 대안인 "별도 commit"은 의도 분리 가치가 없고 history만 늘림.
  - 결과: 1 commit에 메타 스킬 적용 = 플러그인 활성화 + 에이전트 정의 파일 신설 + CLAUDE.md 포인터 등록이 응집됨 (memory `feedback_pr_granularity` — "관련 작은 마감/폴리시는 한 PR로 묶기").

## 접근법

`harness:harness` 메타 스킬 Phase 매트릭스에서 "에이전트 추가" 행을 따른다.

| Phase | 적용 여부 | 본 작업 |
|---|---|---|
| 1 (도메인 분석) | 건너뜀 | Phase 0 감사 결과 활용 |
| 2 (아키텍처 설계) | 배치 결정만 | 서브 에이전트 패턴(기존 `codex:rescue` 위임 구조 유지). 팀 모드 부적합 — 단일 메인 에이전트 + 위임 |
| 3 (에이전트 정의) | 필수 | 3 파일 신규 작성 |
| 4 (스킬 생성) | 건너뜀 | 기존 6 스킬로 충분 |
| 5 (오케스트레이션) | 부분 — CLAUDE.md 포인터만 | `harness-workflow`가 이미 오케스트레이터 |
| 6 (검증) | 필수 | 구조 검증 + verify-task |

## ADR 판단

`.claude/` 신규 디렉토리와 `CLAUDE.md` 섹션 추가 — ADR_TRIGGER_PARTS 해당. 그러나 ADR 0001(Accepted)을 정의 파일로 옮기는 작업이라 신규 영구 결정 없음. 일회성 운영 정비로 처리 — 신규 ADR 불필요.

## Verification

- `node scripts/verify-task.mjs agent-defs-bootstrap`
- 수동: 새 셸에서 `Skill harness:harness` 호출 시 Phase 0이 신규 에이전트 정의를 인식하는지 1회 확인

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 4건 모두 반영 후 PASS (재호출 없이 Claude가 적용)
- **현재 판단**: D1에 따라 1차 검증과 통합 호출. 5체크 결과 — Assumptions/Non-goals/SC는 충족, scope linkage에서 `.claude/settings.json` 누락(Finding 3) 지적, new abstractions 0건 확인.
- **다음 행동**: verify-task 재실행 + 사용자 승인 후 커밋

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (D1 통합 호출 — 계획 검증과 동일 결과) → 4건 반영 완료
- **현재 판단**: 구현 리뷰 — 에이전트 간 상호 참조 일관, ADR 0001 충실. 단 SSOT 표현 모순(Finding 1)·codex-reviewer.md `## 위임 트리거` heading 부재(Finding 4) 지적.
- **다음 행동**: verify-task 재실행 + 사용자 승인 후 커밋

### Codex 통합 검증 결과 (verbatim)

```
Finding 1 — material
- 파일:줄: CLAUDE.md:56, docs/decisions/0001-codex-orchestration-strategy.md:32, .claude/agents/codex-reviewer.md:106
- 위반 기준: ADR 0001은 위임 트리거 SSOT를 자신으로 정의하고, codex-reviewer.md:106도 ADR 0001을 SSOT로 가리키는데, CLAUDE.md:56은 트리거·입출력·위임 프로토콜 SSOT를 .claude/agents/로 바꿉니다.
- 수정: CLAUDE.md:56을 "ADR 0001이 역할·위임 트리거 SSOT이고, .claude/agents/는 실행용 에이전트 정의 파일"이라고 고치세요.

Finding 2 — material
- 파일:줄: docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md:60, :91, CLAUDE.md:22, CLAUDE.md:38
- 위반 기준: CLAUDE.md:22는 CODEX_PLAN_REVIEW를 필수 순서로 명시하고, CLAUDE.md:38은 ADR_TRIGGER_PARTS 해당 파일 변경 시 계획 검증 트리거를 요구하는데, exec-plan D1은 계획 검증을 "생략"으로 기록했습니다.
- 수정: 이번 통합 리뷰 결과를 exec-plan ## Codex 계획 검증에 PASS / CHANGE_REQUEST / BLOCK 토큰으로 기록하고, D1의 "생략" 표현을 "통합 수행"으로 바꾸세요.

Finding 3 — material
- 파일:줄: .claude/settings.json:59–60, docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md:36–42
- 위반 기준: 외과적 변경 원칙("변경된 모든 줄은 현재 task로 추적되어야 한다"). git status가 .claude/settings.json 수정(enabledPlugins.harness@harness-marketplace 추가)을 보고했으나 exec-plan 영향 파일 목록에 없습니다.
- 수정: .claude/settings.json 변경을 별도 task로 분리하거나, 이 task의 영향 파일·Success Criteria·검증 기준에 명시하세요.

Finding 4 — expression-only
- 파일:줄: docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md:24, .claude/agents/codex-reviewer.md:11, :104
- 기준: exec-plan Success Criteria는 "위임 트리거 섹션 포함"을 binary 기준으로 두지만, codex-reviewer.md에 ## 위임 트리거 heading이 없고 ADR 참조만 있습니다.
- 수정: 기준을 "위임 트리거 또는 ADR 트리거 참조 포함"으로 수정하거나 codex-reviewer.md에 짧은 ## 위임 트리거 섹션을 추가하세요.

CHANGE_REQUEST
Confidence: high
```

평이 풀이: SSOT 한 줄이 어긋났고(Finding 1), exec-plan에 통합 호출이 "생략"으로 잘못 기록됐고(Finding 2), 사용자가 플러그인 설치로 만든 settings.json 변경이 영향 파일에 누락됐고(Finding 3), 수신자 관점이라 생략한 위임 트리거 섹션이 Success Criteria binary 기준을 깼다(Finding 4). 4건 모두 코드 영향 없는 문서·정의 수정으로 해소.

### Codex CR 해소 매핑

| Finding | 수정 위치 | 적용 내용 |
| --- | --- | --- |
| 1 | `CLAUDE.md:56` | "ADR 0001이 SSOT, `.claude/agents/`는 실행용 정의" 위계 명시 |
| 2 | `docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md` D1 | "생략" → "통합 수행"으로 변경, 본 섹션에 verdict 기록 |
| 3 | `docs/exec-plans/active/2026-05-28-agent-defs-bootstrap.md` 영향 파일 + D2 | `.claude/settings.json` 추가 + 합침 사유 D2로 기록 |
| 4 | `.claude/agents/codex-reviewer.md` | `## 위임 트리거 (수신자 관점)` 섹션 신설 (ADR 0001 동일 5 트리거) |

## Claude 2차 검증

- **최종 판단**: PASS — Codex CR 4건 모두 반영, verify-task 재실행 통과
- **현재 판단**: 외과적 변경 OK (변경 6 파일 모두 task 스코프 내). 에이전트 간 상호 참조 일관(`claude-code` ↔ `codex-reviewer` ↔ `explorer` 명칭 통일). SSOT 위계 명확(ADR 0001 > `.claude/agents/`).
- **다음 행동**: 사용자 승인 → 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260528-212629 | ✅ | ✅ | ✅ | 0 | — |
| 2차 (CR 반영 후) | 20260528-213634 | ✅ | ✅ | ✅ | 0 | — |
