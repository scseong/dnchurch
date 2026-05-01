# 0001 — Codex 오케스트레이션 전략 채택

- **Status**: Accepted
- **Date**: 2026-05-01
- **Deciders**: 프로젝트 오너 (스스로)
- **Tags**: agent-orchestration, codex, harness-engineering

## Context

AI 코딩 에이전트(Claude Code, Codex, Gemini 등)의 활용이 일반화되면서, 단일 에이전트 사용의 한계가 드러났다.

- **Claude Code 단독 사용 시**: 빠른 구현·일상 개발은 강하지만, 복잡한 설계 판단·트레이드오프 분석에서 아쉬움이 있다는 평가가 일반적이다.
- **본 프로젝트 맥락**: 중간 규모 Next.js 앱 (`apis → services → actions → app` 4 레이어, Supabase 연동, admin·content 두 영역). 이 정도 규모에서는 설계 판단·디버깅 분석을 위한 별도 시선이 자주 필요하다.
- **이미 보유한 자산**: Claude Code의 `codex:rescue` 스킬이 설치되어 있어 Codex CLI에 위임 가능. 그러나 **언제 호출해야 하는지**가 명문화되지 않아 일관되게 활용되지 못한다.

이 결정을 미루면 발생하는 비용:
- 설계 판단의 일관성 부재 (같은 사람·세션이 누적 바이어스를 갖고 결정)
- Codex 활용이 즉흥적·산발적이 됨
- 후속 하네스 인프라(Hooks, 자동 제안)의 방향성이 흔들림

## Decision

**Claude Code를 오케스트레이터, Codex를 서브 에이전트로 두는 협업 구조를 채택한다.**

### 역할 분담

| 에이전트 | 책임 | 사용 빈도 |
| --- | --- | --- |
| **Claude Code** (이 에이전트) | 오케스트레이터, 메인 개발 작업, 컨텍스트 통합·기록, 위임 판단 | 항상 (사용자가 직접 대화) |
| **Codex** (`codex:rescue` 스킬 / `.codex/`) | 깊은 추론, 설계 판단, 계획 리뷰, 트레이드오프 분석, 막힌 디버깅, 큰 변경 후 리뷰 | 트리거 충족 시 |

### Codex 위임 트리거 (MUST)

다음 상황에서 Claude Code는 Codex에 위임을 적극 검토한다:
- 설계 판단 — "어떤 구조·패턴이 적합한가"
- 트레이드오프 분석 — "A vs B, 어느 쪽이 나은가"
- 막힌 디버깅 — 원인 불명 또는 첫 수정이 실패한 경우
- 큰 변경 후 객관적 리뷰 — 같은 세션의 구현자는 무의식적 바이어스를 갖는다 (멀티 세션 리뷰 패턴)

### 위임 안 함 (MUST NOT)

- 단순 파일 수정 (오타, 한 줄 변경, rename)
- 표준 작업 (`git commit`, lint, build)
- 답이 명확한 코드 수정
- 명시적 요청 없는 Codex 직접 구현 (기본 구현자는 Claude Code)

### 운영 원칙

- **언어 프로토콜**: Codex 호출 시 영어로 질의·응답해 추론 정확도를 확보, 사용자에게 보고는 한국어로 한다.
- **컨텍스트 일원화**: 모든 영구 지식은 `docs/`에 둔다. Slack·Notion 등 외부 시스템 의존 금지 (에이전트가 못 읽음).
- **Skills 기반**: MCP 기반 통합 대신 `codex:rescue` 스킬을 직접 호출. 이유는 Alternatives Considered 참조.

## Consequences

### 긍정적

- **의사결정 일관성**: 한 오케스트레이터가 전체 흐름을 통제, 설계 결정이 흔들리지 않음
- **컨텍스트 통합**: 사용자가 한 인터페이스(Claude Code)와만 대화 — 인지 부하 감소
- **품질 향상**: 구현 바이어스 제거 (Codex가 다른 시선)
- **Codex 활용 일관화**: 트리거 명문화로 즉흥적 사용 방지

### 부정적 / 트레이드오프

- **Codex 호출 비용·지연**: 매 호출마다 토큰·시간 비용. 트리거를 보수적으로 정의해 균형 필요
- **두 에이전트 학습 곡선**: 사용자가 두 에이전트의 강점·약점을 이해해야 함 (다만 자동 제안 hooks로 완화 가능)
- **컨텍스트 일원화 비용**: docs/에 모든 지식을 적재·갱신해야 — 하네스 인프라(scripts, hooks)로 자동화 보강 필요

### 영향 범위

- **코드**: 직접 영향 없음 (인프라 결정)
- **문서**: `docs/` 일원화 강제, 이미 인프라 구축됨 (README, ARCHITECTURE, exec-plans, tech-debt-tracker)
- **운영**: `codex:rescue` 호출 빈도 증가 예상, hooks 도입으로 자동화 진행

## Alternatives Considered

### A안: Claude Code 단일 에이전트 (현재)
- 장점: 단순함, 학습 곡선 없음, 토큰 비용 최소
- **기각 사유**: 깊은 설계 판단·디버깅에서 한계. 같은 세션 구현자의 바이어스 제거 불가.

### B안: Tab 분리 (Claude·Codex 별도 터미널)
- 장점: 독립 컨텍스트, 비용 분리
- **기각 사유**: 컨텍스트 분절, 정보 전달의 수동화 ("Codex가 이렇게 말했어"를 사람이 복사·전달), 인지 부하 ↑. *"서로 상의하지 않는 부하 직원 둘"* 상태.

### C안: MCP 기반 통합 (Codex MCP 서버 등록)
- 장점: 표준 프로토콜, 자동 호출 가능
- **기각 사유**:
  - 멈춤·지연 등 안정성 우려 보고 (커뮤니티 사례)
  - MCP 출력이 메인 컨텍스트에 그대로 유입 → 컨텍스트 압박
  - MCP 단발 호출 단위라 다단계 워크플로우 추상화 어려움
  - 본 프로젝트는 이미 `codex:rescue` 스킬을 보유 — MCP 도입 ROI 낮음

### D안: Gemini CLI 추가 통합 (3-에이전트 구조)
- 장점: 대규모 컨텍스트(1M 토큰) 활용 가능, 멀티모달 처리
- **기각 사유**: 본 프로젝트 규모(중간 Next.js)에 과함. WebFetch + `docs/references/` (llms.txt 캐시)로 충분. 도구 수가 늘면 운영 복잡도가 비선형 증가.

## 점진적 도입 로드맵

본 ADR은 채택 시점의 결정이며, 실제 구현은 다음 EXEC_PLAN으로 점진 진행:

1. **이미 완료**:
   - `docs/` 일원화 인프라 (README, ARCHITECTURE, exec-plans, decisions, tech-debt-tracker, references, research)
   - `scripts/` 워크플로우 자동화 (start-task, complete-task, verify-task)
   - 언어 프로토콜 명시 (CLAUDE.md)
   - 멀티 세션 리뷰 패턴 (exec-plan 템플릿)
   - Codex 진입점 `AGENTS.md`와 `.codex/skills/context-loader/`
   - Claude Hook 자동 제안 인프라 `.claude/hooks/` + `.claude/settings.json`

2. **다음 EXEC_PLAN**:
   - `verify-task-rework` — 기존 부채와 신규 회귀를 분리해 검증 루프를 안정화
   - `codex-plan-review-dogfood` — 실제 기능 작업에서 "Claude 계획 → Codex 리뷰 → Claude 구현" 루프 검증
   - `harness-hook-threshold-tuning` — Hook 제안 빈도와 임계값 조정

3. **장기**:
   - `/checkpointing` 패턴 — 작업 패턴 분석·재사용 가능 스킬 추출
   - 정기 doc-gardening 자동화

## References

- **OpenAI Harness Engineering** (한글 정리): https://news.hada.io/topic?id=27457
  - 컨텍스트는 희소 자원, 지도가 백과사전을 이긴다
  - 기계적 강제(Architectural Enforcement)의 중요성
- **비욘드제로 — Claude Code 중심 Codex·Gemini 협업 구조**: https://blog.naver.com/beyond-zero/224167178336
  - 본 ADR의 직접 영감원
  - 6 Hooks 자동 제안 패턴 (우리에게 맞게 압축 예정)
  - Skills 기반 vs MCP 기반 비교
- 관련 EXEC_PLAN:
  - `docs/exec-plans/active/2026-05-01-harness-hooks-orchestration.md` (Phase 1: 글 변경)
  - `docs/exec-plans/active/2026-05-01-tech-debt-cleanup-phase1.md` (검사 도구 정상화)
- 관련 스킬: `codex:rescue` (이미 설치됨)
