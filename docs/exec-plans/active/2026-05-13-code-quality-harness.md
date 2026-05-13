# code-quality-harness — ADR 0008 작성

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-13
- **브랜치**: chore/code-quality-harness

## 목표

ADR 0008을 작성해 **코드 품질 강제를 에이전트 리뷰(Tier 3) 단일 tier + 사전 지침으로 채택**하고, Tier 1(mechanical lint 신규 규칙)·Tier 2(report-only 스크립트) 도입은 **6개월 후(2026-11-13 경) 운영 데이터 기반 재평가**로 유보한다.

방향 전환 이력: 초안은 3-tier 풀스택. Codex Plan Review 4 finding과 "1인 + feature 진행 우선" 운영 제약을 검토한 결과 단일 tier로 단순화 결정 (2026-05-13).

PR 범위 확장 (2026-05-13): 사용자가 검증 결과 추상 표현 문제를 본 PR에서 강제 해결 요청. ADR 0008 메커니즘 2(Detection)와 직접 연관이므로 외과적 변경 원칙 충족. 본 PR에 `## 검증 결과 기록 규칙` 명문화 추가 — `.claude/skills/harness-workflow/SKILL.md`(SSOT), `docs/exec-plans/_template.md`(reference).

## Assumptions

- ADR 0002(게이트 운영 2단계: warn / hard)가 유지되고, 본 ADR은 그 위에 "무엇을 강제할지" 분류 레이어를 얹는다.
- Codex가 5체크 + ADR 본문 비판을 수행할 수 있다.
- 후속 Phase 1/2/3은 별도 exec-plan으로 분리해 진행한다.
- README 인덱스(`docs/decisions/README.md`)는 `update-adr-index.mjs`로 자동 갱신된다.

## Non-goals

- Tier 1 lint 규칙 즉시 추가 (Phase 1 후속 exec-plan)
- 신규 리포트 스크립트 작성 (Phase 2 후속 exec-plan)
- 테스트 러너 도입 (별도 결정)
- `docs/HARNESS_ENGINEERING.md` 본문 갱신 (후속 Phase에서)
- Knip 운영 모드 변경 (현재 warning-only 유지)

## Success Criteria

- `docs/decisions/0008-code-quality-harness.md`가 Accepted 상태로 머지된다.
- `docs/decisions/README.md` 인덱스에 0008 행이 추가된다.
- Codex Plan Review 결론이 PASS 또는 CHANGE_REQUEST 반영 후 PASS다.
- ADR References에 후속 Phase exec-plan slug 3개가 명시되어 있다.

## Verification

- `node scripts/verify-task.mjs code-quality-harness` — lint / lint:styles / build / knip 통과 (문서 변경만이라 영향 적음)
- `node scripts/update-adr-index.mjs` — 인덱스 자동 갱신 확인
- `node scripts/harness-gate.mjs code-quality-harness` — 머지 전 게이트 통과
- 사용자 승인 후 커밋

## 접근법

Codex 진단(현재 conversation에서 수행 — 현재 하네스는 형식·빌드·레이어·토큰까지만 강제, 의미 품질 공백)을 기반으로 3-tier 분류를 명문화한다. 본 ADR은 즉시 도구 변경 없이 정책만 채택, 후속 Phase는 별도 exec-plan으로 분리해 점진 도입한다.

## 영향받는 파일

- `docs/decisions/0008-code-quality-harness.md` (new)
- `docs/decisions/README.md` (인덱스 갱신, `update-adr-index.mjs`로 자동)
- `docs/exec-plans/active/2026-05-13-code-quality-harness.md` (본 plan)
- `.claude/skills/harness-workflow/SKILL.md` (`## 검증 결과 기록 규칙` 섹션 신설 — ADR 0008 메커니즘 2 SSOT)
- `docs/exec-plans/_template.md` (동일 규칙의 짧은 reference 섹션 신설)

## 단계별 체크리스트

- [x] 1. 브랜치 분기 + exec-plan / ADR 스켈레톤 생성
- [x] 2. ADR 0008 본문 작성 (Context / Decision / Consequences / Alternatives)
- [x] 3. exec-plan 본문 작성 (본 파일)
- [x] 4. Codex Plan Review 요청 (영어 질의, 한국어 응답) — CHANGE_REQUEST
- [x] 5. Codex 결과 반영 — 4 finding을 단일 tier 단순화로 흡수, ADR 본문 재작성 완료
- [x] 5.5. PR 범위 확장 — `.claude/skills/harness-workflow/SKILL.md`(SSOT)·`docs/exec-plans/_template.md`(reference)에 `## 검증 결과 기록 규칙` 신설. ADR Decision/영향 범위/Consequences 갱신. 현재 exec-plan `## Codex 계획 검증` round 1/2 핵심 지적 풀어쓰기.
- [ ] 6. 사용자 검토 + ADR Status `Proposed → Accepted` 결정
- [ ] 7. `node scripts/update-adr-index.mjs` 실행
- [ ] 8. `node scripts/verify-task.mjs code-quality-harness` → 증적 기록
- [ ] 9. 사용자 승인 후 커밋

## 완료 기준 (DoD)

- [ ] `verify-task.mjs` 통과
- [ ] `update-adr-index.mjs` 적용 — README 인덱스에 0008 행
- [ ] 사용자 승인 후 커밋 (Docs prefix + Co-Authored-By 실제 모델명)
- [ ] ADR Status `Accepted` (사용자 최종 결정)

## 참고 자료

- Codex 진단 결과는 본 작업의 트리거. 원문은 사용자 conversation에 기록되어 있으며 핵심은 본 plan의 `의사결정 로그`에 인용된다.

## 의사결정 로그

- **2026-05-13**: Codex 진단 — 현재 하네스의 코드 품질 강제는 `ESLint + stylelint + Next build + Knip` 4단계, "형식·빌드·레이어·토큰 + 미사용 코드"까지. 가독성·응집도·책임분리·재사용성·상태관리·렌더링·a11y·에러처리·일관성 같은 의미 품질 축은 hard gate 없음. Codex가 3-tier(lint 즉시 / 리포트 / 리뷰 체크리스트) 분리를 제안.
- **2026-05-13**: 사용자가 "ADR로 정책 결정 먼저" 방향 채택. slug는 `code-quality-harness`로 결정 (대안: `code-quality-three-tier`, `meaningful-quality-enforcement`).
- **2026-05-13**: 사용자가 Codex 4 finding 확인 후 방향 전환 결정. 이유 명시 — "코드 퀄리티 검증으로 인한 개발 시간 소요. 차라리 에이전트가 수행될 때 사전에 지침으로 코드 퀄리티를 고려하게끔 문구 삽입". 결정: Tier 3 + 사전 지침 단일 tier 채택, Tier 1·2 도입은 6개월 후 재평가. 후속 작업 `agent-quality-guidance` exec-plan으로 분리.
- **2026-05-13**: 사용자 피드백 — Codex 결과·작업 결과 문서 기록 시 추상 표현 금지. 구체 예시·수치·실제 파일·동사+결과로 작성. memory `feedback_concrete_records`에 저장. 강제 메커니즘(template/skill 명문화)은 본 ADR PR과 분리된 후속 작업으로 진행.
- **2026-05-13**: Codex Round 2 교차 검증 수행. Verdict CHANGE_REQUEST, 4 finding 도착. 분류 — Finding 2(near-zero Tier 1 subset)는 사용자 결정(Tier 1·2 일괄 유예)에 도전, Finding 1/3/4는 결정 보강. dry-run 비용은 1분 수준 (`npx eslint --rule no-floating-promises: error .`). 사용자 결정 대기.
- **2026-05-13**: 사용자가 검증 기록 추상 표현 문제를 본 PR에서 강제 해결 요청. 외과적 변경 원칙은 ADR 0008 메커니즘 2(Detection)와 직접 연관이라 같은 PR 가능. 변경: `.claude/skills/harness-workflow/SKILL.md`에 `## 검증 결과 기록 규칙` 섹션 신설(SSOT — 추상 표현 금지, 구체화 4원소, Codex verbatim+풀이 규칙, 나쁜 예/좋은 예), `docs/exec-plans/_template.md`에 동일 규칙 reference 섹션 신설, ADR 0008 Decision 메커니즘 2/영향 범위 > 운영/Consequences 긍정에 본 규칙 명시. 현재 exec-plan `## Codex 계획 검증` round 1/2 핵심 지적도 새 규칙 적용해 풀어쓰기.
- **2026-05-13**: 사용자 요청으로 `docs/exec-plans/_template.md`의 `## 검증 결과 기록 규칙` 섹션에 "TEMPLATE 안내 — 실제 plan에서는 제거" 표시 추가 (제목·blockquote·HTML 주석 marker 3중 표시). `start-task.mjs` 자동 제거 로직은 외과적 변경 원칙상 별도 후속 작업으로 분리.
- **2026-05-13**: 사용자가 B(바로 진행) 결정. Codex Round 3 sanity check 생략하고 update-adr-index + verify-task → 커밋 승인 단계로.

## ADR 판단

- **필요 여부**: 필요 (본 작업 자체가 ADR 작성)
- **결정 링크**: `docs/decisions/0008-code-quality-harness.md`
- **사유**: 하네스 운영 정책(코드 품질 강제 분류)의 영구 결정. ADR 0002 위에 "무엇을 강제할지" 레이어를 추가하는 정책 SSOT 확장.

## Codex 계획 검증

- **상태**: 완료 (1차 grep stall로 cancel → 2차 단축 prompt로 성공)
- **요청 시점**: 2026-05-13
- **결론**: CHANGE_REQUEST
- **핵심 지적**:
  - PART 1 5체크: 5개 모두 PASS (Assumptions / Non-goals / Scope / Success Criteria / 추상화 모두 명시·최소).
  - PART 2 (1) **Tier 1과 Tier 2 구분이 흔들린다** — 초안 Tier 1 후보에 자동수정 불가 규칙(`complexity`, `max-depth`, `max-lines-per-function`)이 들어가 후속 작업자가 새 규칙(예: `unused-import`) 도입 시 어느 Tier인지 매번 토론 필요. Tier 2 cutoff 수치도 없음. **수정 제안**: Tier 1 정의에 "deterministic(같은 코드 항상 같은 결과) + 오탐률 5% 이하" 운영 기준, Tier 2 정의에 "오탐률 5% 초과 또는 추세/metric 영역" 한 줄 추가.
  - PART 2 (2) **Next.js + Supabase + SCSS 맥락에서 누락된 품질 축 5개를 식별** — type safety(`tsc --noEmit` 영역), security(Supabase RLS·인증·데이터 노출), server/client boundary(`'use client'` 잘못 두면 서버 시크릿이 브라우저 번들로 흐름), input/data validation(사용자 입력·외부 API 응답 검증), dependency hygiene(`knip`·`npm audit`). **수정 제안**: ADR Context 9축 → 14축 확장, server/client boundary는 "렌더링 성능"에서 분리해 독립 축으로.
  - PART 2 (3) **Alternatives C(2-tier) 거절 사유가 한 문장이라 약하다** — "report 신호가 결국 3-tier로 자라남" 정도라 handwavy. 검토 안 된 큰 대안 2개: E안 SonarQube/CodeClimate 같은 시장 표준 도구, F안 Tier 1을 Codex prompt로 위임(ESLint 없이 Codex가 lint). **수정 제안**: C 거절 사유 보강 — "report-only는 산출물 위치·추세 비교·승격 후보 식별 제공" + E/F 안 추가·기각.
  - PART 2 (4) **Consequences 부정 트레이드오프에 운영 control 3개가 빠짐** — (a) Tier 3 리뷰 14축 매번 다 보면 Codex/Claude 피로(→ 도메인별 skill 발췌), (b) Tier 2 보고서 주인·처리 SLA(누가 며칠 안에 액션), (c) Tier 승격/강등 기준 + 분기 audit cadence. "is-this-working metric"은 `quality-report` 추세·반복 지적률로 정의.
  - Closing: docs-only 범위와 0002 위 3-tier 얹는 큰 구조는 적절.
- **반영 내용**: 4 finding을 ADR 본문 단순화로 흡수.
  - Finding 1 (3-tier 경계 모호) → Tier 1·2 도입 자체를 6개월 유보. 단일 tier(Tier 3 에이전트 리뷰)만 채택해 경계 문제 해소.
  - Finding 2 (품질 축 5개 누락) → ADR Decision의 14축 목록에 type safety, security, server/client boundary, data validation, dependency hygiene 모두 명시(server/client boundary는 독립 축으로 분리).
  - Finding 3 (Alternatives C 약함, E/F 누락) → Alternatives Considered에 A(3-tier 풀스택), B(Tier 1만), C(Tier 1+3), E(SonarQube 같은 시장 도구), F(Tier 1을 Codex 완전 위임) 5개 기각 사유와 D(채택) 명시.
  - Finding 4 (운영 control 누락) → Consequences에 review fatigue 완화책(도메인별 skill 발췌, "관련 3축만 깊게 보라" 프롬프트), 측정 지표(반복 지적률, 회귀 빈도), 재평가 시점(2026-11-13 경) 명시.

### Codex Round 2 (방향 전환 후)

- **상태**: 완료 — 2026-05-13, 짧은 prompt + grep 금지 명시, stall 없음
- **결론**: CHANGE_REQUEST (PART 1 5체크 PASS, PART 2 4 finding)
- **핵심 지적**:
  1. **Prompt만으로는 14축 중 4축이 반복 누락된다** — `no-floating-promises`(`await` 누락된 Promise), `tsc --noEmit`(TypeScript 타입 오류), `knip`(미사용 export), `npm audit`(취약 패키지)는 컴파일러·린터가 deterministic하게 잡는 영역인데 ADR은 prompt로만 처리. **수정 제안**: ADR Consequences에 "cheap catch 후보 = 위 4개 도구" 한 단락 추가 — 예방 실패 시 첫 보완 후보임을 명시.
  2. **Threshold 필요 규칙과 deterministic 규칙을 같은 비용으로 묶음** — Alternatives C가 `complexity`(임계값 사람이 정해야 함)와 `no-floating-promises`(threshold 0, 즉시 적용 가능)를 같은 "Tier 1 도입 비용 ↑"로 처리. dry-run 안 해보고 일괄 유예라 근거 약함. **수정 제안**: Alternative C'(near-zero Tier 1 subset) 추가. `@typescript-eslint/no-floating-promises`, `no-misused-promises`, `tsc --noEmit` 3개에 dry-run 실행 후 결과 분기 — 위반 0~소수면 즉시 채택, 많으면(>50건) 6개월 유예 그대로.
  3. **6개월 재평가 기준이 추상** — "반복 지적률"이 axis 단위인지 rule 단위인지 file 단위인지 불명. 기록 주체·위치도 미정. **수정 제안**: `docs/exec-plans/_template.md`에 `## Quality axis hit: axis / rule / file / repeat?` 한 줄 추가, ADR에 "3개월 내 동일 axis 3회 이상 또는 prod leak 1회 이상 → Tier 1 승격 후보" 기준 명시.
  4. **14축을 4곳에 분산 주입하면 sync 깨질 위험** — `.claude/skills/harness-workflow/SKILL.md`, `docs/exec-plans/_template.md`, `AGENTS.md`, 도메인별 skill에 각각 14축을 두면 축 변경 시 일부만 갱신될 가능성. **수정 제안**: canonical 파일 `docs/decisions/quality-axes.md` 하나 + 나머지 4곳은 그 파일 링크/요약만 참조. 또는 drift 수용 시 분기 sync cadence 명시.
  - Closing: 방향 전환(단일 Tier 3)·docs-only 범위·1인 제약 반영은 as-is 타당.
- **반영 내용**: 사용자 결정 대기 (Finding 2는 결정 도전, Finding 1/3/4는 결정 보강).

## Codex 1차 검증

- **상태**: 미요청 (본 작업은 코드 변경 없음 — ADR 본문 비판으로 대체)
- **요청 시점**:
- **결론**: 미요청 / PASS / FIX_APPLIED / CHANGE_REQUEST / BLOCK
- **수정 파일**:
- **핵심 지적**:
- **남은 리스크**:

## Claude 2차 검증

- **검토 내용**:
- **실행한 검증**:
- **최종 판단**:

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: ADR만 읽고 후속 Phase 작업자가 Tier 분류 기준을 이해할 수 있는가?
- [ ] **멀티 세션 리뷰**: Codex Plan Review로 객관 검토 완료

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
