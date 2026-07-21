# 0008 — 코드 품질 강제: 에이전트 리뷰 + 사전 지침 채택 (Tier 1·2 도입 유보)

- **Status**: Accepted (부분 개정 — ADR 0023)
- **Date**: 2026-05-13
- **Deciders**: 프로젝트 오너
- **Tags**: harness-engineering, code-quality, agent-review, prompt-engineering

> ⚠️ **2026-07-21 ADR 0023이 개정**: 본 ADR이 명시한 "PR마다 Codex 1차 + `Claude 2차 검증`"(아래 § Decision)은 위험도 tier 모델로 대체됐다. `Claude 2차 검증` 섹션은 폐지(verify-task 기록으로 병합)되고, Codex 1차는 Tier 2에서만 요구된다. 14축 점검 대상 정의는 유효하다.

## Context

ADR 0001로 Claude Code · Codex 2-에이전트 협업 모델을, ADR 0002로 검증 운영 2단계(개발 중 warn / 머지·릴리스 전 hard gate)를 결정했다. 그 위에 실제로 게이트가 통과시키는 항목은 다음 네 가지에 한정되어 있다.

- ESLint: 문법, hooks 규칙, 레이어 import 방향(`apis → services → actions → app`)
- stylelint: SCSS 토큰 사용, hex 색상 금지, class/변수 네이밍
- Next build: 타입/번들 실패
- Knip: 미사용 파일·export (warning-only)

즉 현재 게이트는 **"형식·빌드·레이어·토큰 + 미사용 코드"**까지만 강제한다. 가독성·응집도·책임분리·재사용성·상태관리·렌더링·a11y·에러처리·일관성·type safety·security·server/client boundary·data validation·dependency hygiene 같은 의미 품질 14축은 자동 판정 게이트가 없다.

처음 안은 이 공백을 3-tier(Tier 1 mechanical lint · Tier 2 report-only · Tier 3 agent review)로 분리해 점진 도입하는 방향이었다. Codex Plan Review에서 다음 4개 substantive finding이 나왔다.

1. Tier 1과 Tier 2 경계가 모호 — 새 도구 도입마다 어느 tier인지 매번 합의 필요. `complexity`·`max-lines-per-function`은 자동 수정 불가능한데 Tier 1 후보에 들어가 정의가 흔들림.
2. 품질 축 9개에 type safety, security/RLS, server/client boundary, data validation, dependency hygiene 5개 누락. Next.js + Supabase 맥락에서 사고 빈도 높은 영역.
3. Alternatives C(2-tier) 거절이 약하고, 시장 표준 도구·Codex 위임 같은 큰 대안 검토 누락.
4. Tier 2 owner·처리 SLA·tier 승격 기준·audit cadence 같은 운영 control 누락.

이 finding을 검토하면서 더 근본적인 운영 제약이 드러났다.

- 본 프로젝트는 **1인 개발 + 외부 보고** 환경이다.
- Tier 1 도입에는 임계값 조정(예: `complexity` 10? 15? `max-lines-per-function` 200? 300?), 기존 부채 처리(`eslint --rule '@typescript-eslint/no-floating-promises: error'` 1회 실행 시 수십~수백 건 예상), CI 통합 시간이 필요하다. **이 시간이 feature 진행을 정지시킨다.**
- Tier 2 보고서는 owner·처리 SLA·audit cadence가 1인 환경에서 사실상 운영 불가능에 가깝다 — 누가 보고 누가 액션하는가가 항상 같은 사람이다.
- 반면 에이전트(Claude · Codex)는 이미 모든 PR 작성·검증에 관여한다 (ADR 0001). **사전 지침을 에이전트 입력에 끼우면 추가 운영 부담 0**이다.

이 결정을 미루면 발생하는 비용: 3-tier를 강행하면 도구 도입에 수 주가 소요되고 feature 진행이 정지된다. 반대로 의미 품질 강제 자체를 포기하면 ADR 0001 Context의 "1인 바이어스"가 의미 품질에서 재현된다.

## Decision

**코드 품질 강제는 단일 tier(에이전트 리뷰)로 채택하고, 사전 지침을 에이전트 입력에 명문화한다.** Tier 1(mechanical lint 신규 규칙)과 Tier 2(report-only 스크립트)는 본 ADR로 도입하지 않는다.

### 메커니즘 1 — 사전 지침 (Prevention)

코드 작성 단계에서 에이전트가 품질 축을 고려하도록 입력에 명시한다. 사후 catch보다 사전 prevent.

명문화 위치 (후속 `agent-quality-guidance` exec-plan에서 적용):

- `.claude/skills/harness-workflow/SKILL.md` — Claude Code의 작업 수행 절차에 14축 체크리스트 한 단락 추가
- `docs/exec-plans/_template.md` — `## Codex 1차 검증` 프롬프트 템플릿에 14축 인용
- `AGENTS.md` — Codex 진입점에 동일 14축 인용
- 작업별 `.claude/skills/{styles,supabase,ui-components,file-structure}/SKILL.md` — 해당 도메인에 적합한 축만 발췌. 예: `supabase` skill에 security(RLS)·server/client boundary·data validation 강조, `styles` skill에 a11y·일관성·재사용성 강조.

**14개 품질 축**:

1. 가독성 — 함수 길이, 중첩 깊이, 복잡도
2. 응집도 — 한 모듈이 한 책임만 갖는지
3. 책임분리 — 컴포넌트/훅이 너무 많은 일을 하지 않는지
4. 재사용성 — 동일 패턴 반복 시 추상화
5. 상태관리 — derived state 남용, 불필요한 local state
6. 렌더링 성능 — 과도한 rerender, unstable props
7. 접근성 — semantic HTML, ARIA, 키보드 조작
8. 에러 처리 — async 에러 누락, silent fallback
9. 일관성 — 구조·패턴 일관성
10. **type safety** — TypeScript `any` 남발, 무분별한 타입 단언
11. **security** — Supabase RLS, 인증, 민감 데이터 노출
12. **server/client boundary** — `'use client'` 잘못 두면 서버 시크릿이 브라우저 번들로 흐름
13. **data validation** — 사용자 입력·외부 API 응답 검증
14. **dependency hygiene** — 미사용·낡은·취약 패키지

### 메커니즘 2 — 에이전트 리뷰 (Detection)

PR마다 Codex 1차 검증 + Claude 2차 검증이 위 14축을 자연어로 점검한다. 이미 ADR 0001로 운영 중이며, 본 ADR로 점검 축이 명시된다.

- 운영 위치: `docs/exec-plans/_template.md`의 `## Codex 1차 검증`, `## Claude 2차 검증` 섹션
- **결과 기록 규칙 (본 PR에서 신설)**: `.claude/skills/harness-workflow/SKILL.md`의 `## 검증 결과 기록 규칙` 섹션이 SSOT, `docs/exec-plans/_template.md`는 짧은 reference 섹션 보유. 규칙 핵심:
  - 추상 표현 금지 — `보강 필요`, `근거 약함`, `커버리지 공백` 같은 추상명사로 끝맺지 않는다.
  - 구체화 4원소(실제 도구·파일·명령 / 수치 또는 binary 기준 / 구체 동사+결과 / 예시 1개 이상) 중 최소 2개 갖춤.
  - Codex stdout은 verbatim 인용 + 평이 한국어 풀이 1줄 추가.
  - 규칙 위반은 Codex 1차 검증·Claude 2차 검증에서 차단 대상.
- Codex 호출 프로토콜: 영어 질의, 한국어 응답 (ADR 0001 운영 원칙)

> ⚠️ **본 PR 범위 외**: 14축 체크리스트를 `## Codex 1차 검증`/`## Claude 2차 검증` 프롬프트 본문과 `harness-workflow/SKILL.md`의 `CODEX_FIRST_PASS`/`VERIFY` 단락에 실제 인용하는 작업은 후속 `agent-quality-guidance` PR. 본 PR이 신설한 `## 검증 결과 기록 규칙`은 **기록 형식**만 강제(추상 표현 차단)하고, 14축의 실제 점검 텍스트 삽입은 별도. 즉 본 ADR은 점검 대상 SSOT(14축 정의)와 형식 규칙(SSOT 위치)을 결정하고, 점검 호출부 텍스트 변경은 후속에서.

### 명시적으로 채택 안 함

- **Tier 1 신규 도입**: `no-floating-promises`, `complexity`, `max-depth`, `max-lines-per-function` 같은 규칙은 본 ADR로 도입하지 않는다. 현재 운영 중인 ESLint·stylelint 규칙(레이어 방향·토큰·hex 등)은 그대로 유지.
- **Tier 2 신규 도입**: Knip은 현재 warning-only 운영 그대로. 컴포넌트 크기·client 비율·jscpd 같은 신규 리포트는 도입하지 않는다.

## Consequences

### 긍정적

- **도입 비용 0** — 신규 도구·CI 변경·임계값 조정 없음. 텍스트 추가만.
- **즉시 적용 가능** — 후속 `agent-quality-guidance` exec-plan이 짧고 명확 (skill·template 4~5 파일 갱신).
- **feature 흐름 정지 없음** — 1인 개발 환경에서 가장 중요한 제약을 보호.
- **에이전트 활용 일관화** — ADR 0001 협업 모델을 강화. 매 PR 동일 14축 점검.
- **사후 catch보다 사전 prevent** — 작성 단계에서 축 고려, 리뷰 부담 ↓.
- **결과 기록 구체성 강제** — PM·클라이언트가 별도 컨텍스트 없이 검증 기록을 읽을 수 있음. 본 PR이 신설한 `## 검증 결과 기록 규칙` 섹션(skill SSOT + template reference)이 추상명사·도구 누락·예시 0을 차단.

### 부정적 / 트레이드오프

- **자동 차단 없음** — 에이전트가 놓친 회귀는 PR이 머지된다. 코드 품질 보장이 에이전트 신뢰성에 의존.
- **Review fatigue 가능** — 14축을 매 PR 다 보면 Codex/Claude 모두 지친다. 완화책: 작업 도메인에 맞는 축만 발췌(메커니즘 1의 도메인별 skill 분리), Codex 프롬프트에서 "이 PR에서 가장 관련 있는 3축만 깊게 보라"식 명시.
- **객관성 ↓** — 자동 도구는 매번 동일 판정, 에이전트는 응답 편차 있음. 14축 명문화로 편차 일부 흡수.
- **6개월 후 재평가 필요** — 사전 지침 + 리뷰만으로 회귀가 잡히는지 운영 데이터를 보고 Tier 1 도입 ROI 재판단. 측정 지표:
  - 반복 지적률 — 같은 축이 분기당 N회 이상 반복 지적되면 해당 축은 Tier 1 후보 (예: `no-floating-promises` 반복 지적 3회 이상 → Tier 1 ESLint rule 도입)
  - 회귀 빈도 — Codex/Claude가 못 잡은 회귀가 prod에서 발견된 횟수
  - 재평가 시점: **2026-11-13 경 (본 ADR 머지 후 6개월)**

### 영향 범위

- **코드**: 즉시 변경 없음 (정책 결정).
- **운영**: 본 PR에서 `.claude/skills/harness-workflow/SKILL.md`(SSOT)와 `docs/exec-plans/_template.md`(reference)에 `## 검증 결과 기록 규칙` 섹션 신설 — 메커니즘 2(Detection) 운영화. 후속 `agent-quality-guidance` exec-plan에서 동일 두 파일에 14축 체크리스트·인용 추가 + `AGENTS.md`, 도메인별 skill 갱신.
- **문서**: 본 ADR 머지 후 `docs/HARNESS_ENGINEERING.md`에 "단일 tier + 사전 지침" 모델 반영 (후속).

## Alternatives Considered

### A안: 원안 — 3-tier 풀스택 채택 (Codex Plan Review 1차 안)

- 장점: 의미 품질 자동 강제 영역 ↑. 도구·보고서·리뷰 분리로 운영 모델 완비.
- **기각 사유**: 1인 + feature 진행 우선 환경에서 Tier 1 임계값 조정·기존 부채 처리에 수 주 소요. Tier 2 owner·SLA 운영은 1인 환경 부적합 — 누가 보고 누가 액션할지 항상 같은 사람. 본 ADR이 풀스택 채택 시 feature 정지 위험이 의미 품질 강제 이득을 상회.

### B안: Tier 1만 도입 (lint 강화만)

- 장점: 자동 차단 영역 확보. Codex 호출 비용 ↓.
- **기각 사유**: `complexity`·`max-depth`·`max-lines-per-function` 같은 규칙은 임계값 사람이 정해야 하고 기존 부채 처리 비용 큰 데 비해, 잡히는 회귀가 의미 품질 핵심(응집도·책임분리·상태 모델)을 못 잡는다. 도입 비용이 효용 대비 큼.

### C안: Tier 1 + Tier 3 (Tier 2 생략)

- 장점: 자동 + 에이전트 두 layer 확보.
- **기각 사유**: Tier 1 도입 비용이 큰 데 비해, 본 프로젝트 현재 의미 품질 회귀 빈도는 에이전트 리뷰로 충분 대응 가능 추정. 6개월 후 재평가 시 도입 ROI 재판단.

### E안: 시장 표준 품질 플랫폼 (SonarQube, CodeClimate)

- 장점: 자체 분류·규칙 작성 0. 검증된 도구.
- **기각 사유**: 비용·러닝커브·SaaS 의존. 1인 운영 프로젝트에 ROI 낮음. 자체 14축 명문화 + 에이전트 리뷰가 같은 효용을 0 비용으로.

### F안: Tier 1을 Codex prompt에 완전 위임 (현재 lint도 폐기)

- 장점: 도구 운영 부담 0.
- **기각 사유**: Codex 응답 일관성 편차·속도·토큰 비용 ↑. 현재 운영 중인 ESLint·stylelint(레이어 방향·토큰)도 폐기되면 회귀 위험 ↑. 자동 도구가 강한 영역(레이어 방향)은 자동 도구 유지가 합리적.

### D안: Tier 3 + 사전 지침 (채택)

- 본 ADR이 채택한 안. 두 메커니즘(Prevention + Detection)으로 의미 품질 14축을 cover하면서 도입 비용 0. Tier 1/2는 6개월 후 운영 데이터 기반 재평가.

## References

- 관련 ADR: [0001 — Codex 오케스트레이션 전략](0001-codex-orchestration-strategy.md), [0002 — Node-first 하네스 자동화와 merge/release gate](0002-node-first-harness-gate.md)
- 관련 exec-plan: [code-quality-harness](../exec-plans/active/2026-05-13-code-quality-harness.md)
- Codex Plan Review 결과: 2026-05-13 — exec-plan `## Codex 계획 검증`에 4 finding 원문 기록. 본 ADR이 그 비판을 단일 tier 단순화로 흡수.
- 후속 작업 권장 slug: `agent-quality-guidance` — 14축 사전 지침을 `.claude/skills/`, `docs/exec-plans/_template.md`, `AGENTS.md`에 명문화.
- 6개월 후 재평가: 2026-11-13 경. 반복 지적률 + 회귀 빈도 측정 후 Tier 1 도입 ROI 재판단.
