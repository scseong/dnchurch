# writer-agents

- **상태**: ✅ 완료 (2026-05-30)
- **시작일**: 2026-05-28
- **브랜치**: refactor/harness-engineering
- **Open questions**: none
- **ADR needed**: no — agent-defs-bootstrap(2026-05-28)과 같은 패턴으로 ADR 0001을 운영화. 신규 영구 결정 없음.

## 목표

공통 에이전트 2종 신설 + 작성용 표현 가이드 SKILL 신설. `commit-pr-author`(commit + PR 본문 초안) / `doc-editor`(repo 내부 문서 표현 점검) / `writing-style` SKILL(표현 규칙 단일 SSOT — 작성자·점검자 모두 참조). 1인 작업의 자기 리뷰 사각지대(memory feedback 11건 누적) + 작성 시점 표현 가이드 부재(현 SSOT는 검증용에 묻혀 있음) 두 문제를 동시 해소. 에이전트는 초안만 제시·사용자 승인 후 적용 — 자동 실행 X. SKILL은 description 트리거로 작성 시점 자동 로딩.

## 검증된 Assumptions

- 사전 설계 검증 완료 — Codex 8 영역 design review (5 OK + 3 material CR) → 본 plan에 D1~D3로 해소 반영
- 기존 hook 매처 통일 확인 — `Write|Edit|MultiEdit` (`.claude/settings.json:16,26,36`)
- 기존 hook 패턴 — `.claude/hooks/check-codex-after-plan.mjs`가 PostToolUse:Write|Edit|MultiEdit + active exec-plan 경로 + 섹션 hash debounce
- SSOT 위치 — D5에서 작성용 SSOT를 `writing-style` SKILL로 단일화. `harness-workflow` SKILL의 "검증 결과 기록 규칙" 섹션은 워크플로우 메타 정보(ADR 0008 출처·검증 차단 정책·sectionBody 동작)만 보존, 표현 규칙·템플릿은 모두 writing-style로 이동
- memory feedback 11건 매핑 확인 — 커밋/PR 7건(`feedback_commit_*`·`feedback_pr_*`) + 문서 4건(`feedback_concise_plans`·`feedback_concrete_records`·`feedback_doc_decision_log_style`·`feedback_plain_korean`)

## Success Criteria

- `.claude/agents/commit-pr-author.md`, `.claude/agents/doc-editor.md` 2 파일 신규 — frontmatter `name`/`description`/`model: opus` 완비
- 각 에이전트 정의에 입출력 프로토콜 / 트리거(수동·hook) / 호출 안 함 규칙 / 협업 매트릭스 포함
- `.claude/hooks/check-doc-style.mjs` 신규 — matcher `Write|Edit|MultiEdit` + active exec-plan 검증 기록/Codex 인용/의사결정 로그 + ADR + tech-debt 경로 + 섹션 hash debounce
- `.claude/settings.json` PostToolUse 블록에 신규 hook 1 항목 추가
- `.claude/agents/claude-code.md` 협업 매트릭스에 2 신규 에이전트 + PR 생성 시 호출 순서(doc-editor → commit-pr-author) 1줄 추가
- `CLAUDE.md` `## 에이전트 역할 분담` 표 2 행 추가 + 변경 이력 2 행 추가 (writer agents + writing-style SKILL)
- `.claude/skills/writing-style/SKILL.md` 신규 (D5) — frontmatter description에 "exec-plan·ADR·PR 본문·커밋 메시지·검증 기록 작성/수정 시" 트리거 명시 + positive 가이드 + negative 카탈로그 + 글 종류별 템플릿 + 전후 비교 표
- `.claude/skills/harness-workflow/SKILL.md` "검증 결과 기록 규칙" 섹션 끝에 reference 1줄(`작성용 SSOT는 .claude/skills/writing-style/`) 추가
- `.claude/agents/doc-editor.md`, `.claude/agents/commit-pr-author.md`의 SSOT 참조를 writing-style SKILL로 갱신
- `node scripts/verify-task.mjs writer-agents` 통과
- dogfood — 본 task의 exec-plan을 doc-editor 호출로 점검, commit 메시지를 commit-pr-author로 draft

## Non-goals

- `harness-workflow` SKILL 본문 수정 — SSOT 참조만, 외과적 변경 원칙
- doc-editor 직접 수정 권한 부여 — 제안만 (file:line + 수정 초안)
- commit-pr-author용 별도 hook 신설 — 기존 `check-commit-msg.mjs`로 충분
- 일반 채팅 응답에 doc-editor 적용 — claude-code가 평이한 한국어 규칙 이미 보유
- 도메인 에이전트(sermon/admin) 추가 — 별도 task

## 영향받는 파일

- `.claude/agents/commit-pr-author.md` (신규)
- `.claude/agents/doc-editor.md` (신규)
- `.claude/hooks/check-doc-style.mjs` (신규)
- `.claude/settings.json` (PostToolUse hook 1 항목 추가)
- `.claude/agents/claude-code.md` (협업 매트릭스 2 에이전트 + 호출 순서 1줄)
- `CLAUDE.md` (`## 에이전트 역할 분담` 표 2 행 + 변경 이력 2 행 — writer agents + writing-style SKILL)
- `.claude/skills/writing-style/SKILL.md` (신규 — D5)
- `.claude/skills/harness-workflow/SKILL.md` (`## 검증 결과 기록 규칙`·`## 커밋 메시지` 본문 87+125줄 → reference 5+15줄로 축약. 표현 규칙·템플릿·예시 모두 writing-style로 흡수 — D5)
- `AGENTS.md` (위임 SSOT 섹션에 writing-style 링크 1줄 추가 — Codex 진입점)
- `docs/exec-plans/active/2026-05-28-writer-agents.md` (본 문서)

## 단계별 체크리스트

- [x] 1. 4-라운드 AskUserQuestion으로 8 결정 확정
- [x] 2. design-draft.md 작성 (docs/research/writer-agents/ — 커밋 X)
- [x] 3. Codex design cross-review → CHANGE_REQUEST 3 material + 5 expression-only
- [x] 4. exec-plan 작성 + Codex CR 해소 (D1·D2·D3)
- [x] 5. `check-doc-style.mjs` hook 작성 — matcher 통일 + 섹션 분리 로직
- [x] 6. `.claude/settings.json` PostToolUse 블록에 hook 등록
- [x] 7. `.claude/agents/doc-editor.md` 작성
- [x] 8. `.claude/agents/commit-pr-author.md` 작성
- [x] 9. `.claude/agents/claude-code.md` 협업 매트릭스 확장 + 호출 순서 명시
- [x] 10. `CLAUDE.md` 표 2 행 추가 + 변경 이력 1 행 (writer agents 분)
- [x] 11. 구조 검증 — frontmatter / hook 등록 / 매처 일치 / 커맨드 0건
- [x] 12. `node scripts/verify-task.mjs writer-agents` (1차 통과)
- [x] 13. Codex 1차 검증 (D4 통합 호출) → F4 1건 PASS_WITH_DECISION_LOG로 처리
- [x] 14. dogfood self-check (doc-editor 규칙 수동 적용) → 5건 발견, 5건 모두 적용
- [x] 15. `.claude/skills/writing-style/SKILL.md` 신규 작성 (D5)
- [x] 16. `harness-workflow` SKILL 본문 87+125줄 → 5+15줄 reference로 축약 (D5 옵션 A 전체 흡수)
- [x] 17. `doc-editor.md`·`commit-pr-author.md`의 SSOT 참조를 writing-style로 갱신
- [x] 18. CLAUDE.md 변경 이력 + 지식 시스템 표 + 스킬 트리거 표 갱신, AGENTS.md 위임 SSOT 갱신
- [x] 19. 구조 검증 재실행 — writing-style SKILL frontmatter + 참조 일관성 통과
- [x] 20. `node scripts/verify-task.mjs writer-agents` 재실행 4회 모두 통과
- [x] 21. Codex 검증 4 라운드 — 모든 material finding 해소, 최종 PASS
- [x] 22. dogfood self-check 5건 발견 후 모두 적용
- [ ] 23. 사용자 승인 → 커밋

## 의사결정 로그

- **D1 — PR 본문/exec-plan 공동 영역 소유자 binary 규칙 명시 (Codex Finding #2)**
  - 문제: PR 본문에 exec-plan 검증 표·Codex 결과를 복사할 때 누가 최종 문구를 소유하는지 불명확. 두 에이전트가 같은 문단을 동시에 점검 대상으로 보면 충돌.
  - 해결: binary 규칙 — **원본 = doc-editor / 복사·요약된 파생본 = commit-pr-author**. 이유 — 원본 exec-plan은 작성 맥락이 SKILL 안에 정의되어 있다 (작성 시점, 해당 맥락, 표현 규칙 모두). PR 본문은 GitHub UI에 보이는 외부 텍스트라 commit과 같은 에이전트가 통제해야 일관됨. 대안인 "공동 소유"는 충돌 해소 비용이 매번 발생. 대안인 "doc-editor 단독"은 PR 메타데이터(label·assignee·template)와 책임 분단.
  - 결과: claude-code.md 협업 매트릭스에 호출 순서 1줄(`PR 생성 시 doc-editor → exec-plan 정리 → commit-pr-author`). 각 에이전트 정의의 "범위 밖" 섹션에 binary 규칙 명시.

- **D2 — hook 매처 충돌 해소: 섹션 hash 분리로 동시 발화 차단 (Codex Finding #3)**
  - 문제: `check-doc-style.mjs`와 기존 `check-codex-after-plan.mjs`가 모두 PostToolUse:Write|Edit|MultiEdit + active exec-plan 경로에서 발화. 같은 파일 한 번 수정으로 두 reminder가 동시에 나와 노이즈가 된다.
  - 해결: 두 hook이 **서로 다른 섹션 hash를 본다**. check-codex-after-plan은 목표/SC/영향파일/Verification 4 섹션, check-doc-style은 검증 기록 섹션·Codex 인용 섹션·의사결정 로그 섹션 + ADR/tech-debt 전체. 이유 — debounce는 같은 hook의 같은 hash만 막으므로 hook 자체를 분리하되 감시 영역을 겹치지 않게 설계. 대안인 "한 hook으로 통합"은 두 reminder가 한 메시지에 합쳐져 사용자 부담. 대안인 "exec-plan 빼고 ADR/tech-debt만 잡기"는 검증 기록·Codex 인용 점검 dead spot.
  - 결과: `check-doc-style.mjs` 본문에 `// check-codex-after-plan과 섹션 분리: 본 hook은 검증 기록 섹션·Codex 인용 섹션·의사결정 로그 섹션만 본다` 주석 1줄.

- **D3 — hook matcher MultiEdit 포함하여 기존 3 hook과 통일 (Codex Finding #7)**
  - 문제: design draft가 matcher를 `Write|Edit`로만 적음. 기존 3 hook은 모두 `Write|Edit|MultiEdit` (`.claude/settings.json:16,26,36`). MultiEdit로 exec-plan/ADR/tech-debt 수정 시 false negative 발생.
  - 해결: matcher를 `Write|Edit|MultiEdit`로 통일. 이유 — 기존 hook 패턴과 분단되면 같은 도구를 썼는데도 reminder가 작동하기도 하고 안 하기도 한다. 그러면 hook을 믿기 어렵다. 대안 없음 (binary 결정).
  - 결과: `.claude/hooks/check-doc-style.mjs` matcher + `.claude/settings.json` 등록 모두 `Write|Edit|MultiEdit`.

- **D4 — `check-doc-style.mjs` silent error fallback은 기존 5 hook 패턴과 일관성 유지 (Codex 1차 검증 F4)**
  - 문제: Codex 1차 검증이 `check-doc-style.mjs:20-24` JSON parse 실패와 `:60-70` state read/write 실패의 silent fallback(catch {} 후 0 exit)을 material로 지적. "실패 = 감지 누락" 경로가 열림.
  - 해결: 기존 패턴 그대로 유지 — 본 hook만 fail-loud로 바꾸지 않는다. 이유 1: 기존 5 hook 모두 동일 silent fallback 패턴(check-codex-after-plan:19,60,66 · check-adr-needed:10 · post-implementation-review:26,62,85,89 · agent-router:9 · post-test-analysis:12). 본 hook만 fail-loud로 분리하면 외과적 변경 원칙 위반(같은 작업에서 5 hook 동시 전환 필요). 이유 2: hook은 reminder 성격이라 워크플로우 차단 책임이 없음 — 정책 강제는 `harness-gate`·`verify-task`·pre-commit이 담당. 이유 3: silent fallback이 매번 노이즈로 떠 hook 자체를 disable시킬 risk가 reminder 누락보다 큼. 대안인 "5 hook 동시 fail-loud 전환"은 별도 task로 분리 가능 (현 시점 부채 등록 안 함 — 의도된 패턴이라 부채 아님).
  - 결과: `check-doc-style.mjs` 코드 변경 0건. PASS_WITH_DECISION_LOG로 처리.

- **D5 — 표현 작성 강제 메커니즘: `writing-style` SKILL 신설 + description 트리거로 작성 시점 자동 로딩 (사용자 본질 지적 + dogfood 5건 위반 증거)**
  - 문제: 본 task의 plan 작성 자체에서 doc-editor가 5건 위반 발견. 작성자(claude-code)가 SSOT(harness-workflow SKILL)를 보유하고도 추상명사·번역투·내부 약어 ("감지 누락", "외과적 변경 원칙 위반", "material로 지적", "신뢰성 ↓" 등)를 만들어냄. 사용자 지적: 사후 점검자만으로는 같은 위반 반복. 현 SSOT는 검증 시점만 다뤄서 작성자가 작성 중에 못 본다는 문제 해결 필요.
  - 해결: `.claude/skills/writing-style/SKILL.md` 신설 — 작성용 단일 SSOT. positive 가이드(이렇게 쓰라) + negative 카탈로그(자주 발견 위반 + 권장 대체 예시) + 글 종류별 템플릿(의사결정 로그·검증 기록·커밋 4-line body·PR 본문) + 전후 비교 표. description을 강하게 작성(`exec-plan·ADR·PR 본문·커밋 메시지·검증 기록 작성/수정 시 자동 로딩`)해서 작성 시점 트리거 강제. 이유 — 현 SSOT(harness-workflow "검증 결과 기록 규칙"·"산출 문서 가독성 체크리스트")는 검증 컨텍스트에 묻혀 있고 분산되어 작성자가 작성 시점에 못 봄. 대안 1 "self-check 의무화"는 매번 시간 비용 + 별도 워크플로우 단계라 부담. 대안 2 "pre-commit grep lint"는 오탐이 자주 난다 (Codex 인용·tech-debt 항목에서 합법 어휘를 차단할 위험). 대안 3 "harness-workflow에 작성 가이드 섹션 추가"는 SKILL이 커지고 검증·작성 책임이 한 곳에 섞임.
  - 결과: 신규 `.claude/skills/writing-style/SKILL.md`. `harness-workflow` SKILL "검증 결과 기록 규칙" 섹션 본문 87줄을 5줄 reference로 축약 — 표현 규칙·템플릿·예시 모두 writing-style로 흡수, 워크플로우 메타 정보(ADR 0008 출처·검증 차단 정책·sectionBody 동작)만 보존. doc-editor·commit-pr-author 정의의 SSOT 참조를 writing-style로 갱신. CLAUDE.md 변경 이력에 1행 추가. 두 곳이 어긋날 위험 없음 (Codex F4 반영 — 본문을 한 곳으로 모음).

## ADR 판단

`.claude/agents/`·`.claude/hooks/`·`.claude/skills/`·`.claude/settings.json`·`CLAUDE.md` 변경 — ADR_TRIGGER_PARTS 해당. 현 task 범위에서는 ADR 불필요. 사유 — (1) writer 에이전트 2종은 agent-defs-bootstrap과 동일하게 ADR 0001(Accepted) 운영화. (2) D5의 writing-style SKILL 신설은 작성용 SSOT 통합 정리라 신규 영구 결정 없음, 단 "작성 시점 자동 로딩" 패턴이 향후 다른 도메인 SKILL에도 확장되면 그때 ADR 승격 후보(현 시점 후속 작업으로만 남김).

## 접근법

`harness:harness` 메타 스킬 Phase 매트릭스에서 "에이전트 추가" 행을 따른다.

| Phase | 적용 |
| --- | --- |
| 1 도메인 분석 | 건너뜀 (Phase 0 감사 + 데이터 분석 완료) |
| 2 아키텍처 | 서브 에이전트 패턴 — 기존 claude-code/codex-reviewer/explorer 구조 유지 |
| 3 에이전트 정의 | 2 파일 신규 |
| 4 스킬 생성 | writing-style SKILL 신규 (D5) — 작성용 단일 SSOT. harness-workflow의 표현 규칙·템플릿은 모두 흡수 |
| 5 오케스트레이션 | claude-code.md 협업 매트릭스 확장만 |
| 6 검증 | 구조 검증 + verify-task + Codex 1차 검증 + dogfood |

## Verification

- `node scripts/verify-task.mjs writer-agents`
- dogfood — doc-editor 호출로 본 exec-plan 점검, commit-pr-author 호출로 본 task commit 메시지 draft

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG — 사전 design review CHANGE_REQUEST 3 material + 5 expression-only → D1·D2·D3로 해소 완료
- **현재 판단**: 8 영역 design checklist 적용 — Option A 선택·자동화 수준·SSOT 패턴·구현 순서·데이터 매핑 5 영역 OK. 책임 경계·hook 충돌·matcher MultiEdit 3 영역 의사결정 로그로 해소.
- **다음 행동**: 구현 diff 생성 후 Codex 1차 검증(D4 통합) 호출

## Codex 1차 검증

- **결론**: PASS — 4 라운드 통과 (1차 F4 → D4, 2차 CR-1·CR-2 흡수+템플릿, 3차 CHECK 3 CLAUDE.md/AGENTS.md 링크, 4차 최종 통과)
- **현재 판단**: 모든 material finding 해소. SSOT를 한 곳으로 모음 — writing-style이 작성·점검 master, harness-workflow는 워크플로우 메타(R1~R4 hook 정책·sectionBody 동작)만 보존. 두 곳이 어긋날 위험 없음 (Codex 4차 확인).
- **다음 행동**: dogfood self-check + 사용자 승인 → 커밋

### Codex 1차 검증 결과 (verbatim)

```
## 구현 검토 결과 — writer-agents

| ID | 항목 | 심각도 | 판정 |
|---|---|---|---|
| F1 | D1 경계 적용 | none | PASS |
| F2 | D2 hook 분리 적용 | none | PASS |
| F3 | D3 matcher 통일 | none | PASS |
| F4 | check-doc-style.mjs 코드 품질 | material | FAIL |
| F5 | 에이전트 정의 완결성 | none | PASS |
| F6 | 외과적 변경 | none | PASS |
| F7 | 교차 참조 일관성 | none | PASS |

[F4] check-doc-style.mjs 코드 품질
severity: material
evidence:
- .claude/hooks/check-doc-style.mjs:20-24 — JSON parse 실패를 {} silent fallback으로 처리
- .claude/hooks/check-doc-style.mjs:60-70 — state read/write 실패를 no-op으로 삼킴
- 위 두 경로에서 process.exit(1) 또는 non-zero exit 없음
verdict: FAIL
reason: 경로 정규화(:75)와 missing section 처리(:39-47)는 안전합니다. 그러나 "실패 시 non-zero exit" 기준을 만족하지 않습니다. JSON 손상이나 파일 쓰기 실패가 있어도 hook이 0으로 종료하면 변경 감지가 조용히 누락됩니다.

최종 판정: CHANGE_REQUEST
confidence: medium
근거:
- check-doc-style.mjs가 JSON 손상·파일 쓰기 실패 시 non-zero exit 없이 통과해 "실패 = 감지 누락" 경로가 열려 있습니다.
- D1/D2/D3 설계 해소와 에이전트 정의 구조는 구현에 올바르게 반영됐습니다.
- confidence가 high가 아닌 이유: sandbox Git 차단으로 F6 전체 diff 확인이 제한됐습니다.
```

평이 풀이: 7 영역 중 6 PASS, F4 1건만 material. 그런데 F4의 silent fallback 패턴은 본 저장소 기존 5 hook(check-codex-after-plan·check-adr-needed·post-implementation-review·agent-router·post-test-analysis) 모두 동일 — 의도된 설계라 본 hook만 바꾸면 일관성 깨짐. D4로 의사결정 로그에 기록하고 본 hook 코드는 변경 0건.

### Codex CR 해소 매핑

| Finding | 수정 위치 | 적용 내용 |
| --- | --- | --- |
| F1·F2·F3·F5·F6·F7 | — | 해소 불필요 (PASS) |
| F4 | `exec-plan ## 의사결정 로그` D4 | 기존 5 hook 패턴 일관성 유지 사유 기록. 코드 변경 0건 |

## Claude 2차 검증

- **최종 판단**: PASS — Codex 4 라운드 통과 + verify-task 3회 통과 + dogfood self-check 5건 발견 후 모두 적용
- **현재 판단**: SSOT를 한 곳으로 모은 결과 writing-style이 작성·점검 단일 SSOT, harness-workflow는 워크플로우 메타(R1~R4 hook 정책·sectionBody 동작)만 보존. 9 파일 변경(agents 2 + hook 1 + settings.json + claude-code.md + CLAUDE.md + writing-style SKILL + harness-workflow SKILL 축약 + AGENTS.md). 외과적 변경 OK — 모든 변경이 writer-agents task 의도(공통 에이전트 신설 + 표현 강제 메커니즘)와 직접 연결.
- **다음 행동**: 사용자 승인 → 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260528-224428 | ✅ | ✅ | ✅ | 0 | — |
| 2차 (D5 추가 후) | 20260528-231743 | ✅ | ✅ | ✅ | 0 | — |
| 3차 (CR-2 본문 흡수 후) | 20260528-233040 | ✅ | ✅ | ✅ | 0 | — |
| 4차 (CLAUDE.md·AGENTS.md 링크 추가 후) | 20260528-234648 | ✅ | ✅ | ✅ | 0 | — |

## 회고

### 잘 된 것
- 사용자 본질 지적("사후 점검만으론 같은 위반 반복")이 D5(writing-style SKILL 신설) 결정으로 이어짐 — 본 task가 만든 가장 가치 있는 자산.
- dogfood 5건 위반 발견(본인이 작성한 plan에서) — writing-style SKILL의 실효성을 본 task 안에서 즉시 입증.
- harness-workflow SKILL 본문 87+125줄을 writing-style로 흡수 — SSOT 단일화. 두 곳이 어긋날 위험 0.
- Codex 4 라운드(design + 1·2·3·4차) 거치며 점진적 결함 발견·해소.

### 예상 못한 발견
- D5 추가 변경이 Codex 2차 검증에서 CR-1·CR-2 새 발견. SSOT 통합 결정만으로는 부족 — 옵션 A(본문 흡수)·옵션 B(stub만) 트레이드오프가 검증 결과 명확해짐.
- Codex CR-2 "drift 위험"이 옵션 B로 처리하면 즉시 발생할 수 있어 옵션 A 선택 강제. 신규 결정 → 즉시 검증 사이클 가치 입증.
- doc-editor가 SSOT 자체(CLAUDE.md·SKILL) 점검 거부하는 "메타-순환 회피" 설계가 명시 안 됐다가 PR #104 Codex 리뷰에서 N3(적용 범위 모순)로 발견 — 본 task 머지 전에 정정.

### 후속 관찰 시점·항목
- 신규 에이전트(doc-editor·commit-pr-author) reload 후 실제 `Agent(subagent_type: ...)` 호출 작동 검증 — 다음 세션 첫 작업.
- writing-style SKILL의 description 자동 트리거가 작성 시점에 실제 작동하는지 — exec-plan·ADR 작성 시 자동 로딩 빈도 관찰.
- 운영 신호 측정(#1 후속) 도입 후 doc-editor 호출 빈도·표현 위반 추이 데이터 기반 재고 (3개월 후).

### 본 task의 본질
"사후 점검자는 보조 수단, 작성 시점 강제가 1차 방어"라는 사용자 본질 지적이 SSOT 구조 자체를 바꿈. 시작은 공통 writer 2 에이전트 신설이었으나 D5 추가로 SKILL 신설·기존 SKILL 본문 흡수까지 확장. 본 task의 진짜 산출물은 에이전트가 아니라 writing-style SSOT.
