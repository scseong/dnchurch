# 0017 — 디자인 SoT를 Figma로 옮기고 디자인투코드 채택, 무료 경로부터 검증

- **Status**: Accepted
- **Date**: 2026-06-13
- **Deciders**: scseong, Claude Code
- **Tags**: frontend, design-system, tooling

## Context

지난주 코드 기반 SCSS 디자인 시스템(토큰 174개 + `src/components/ui/` 12 컴포넌트)을 Figma로 옮겼다. 그 뒤 "Figma와 코드를 어떻게 일치시키나"를 정해야 했고, 논의가 다음 순서로 흘렀다.

- 처음엔 코드를 SoT(source of truth)로 두자고 권했다. 근거: 무료 Figma는 컬렉션당 모드 1개라 반응형·다크 값을 못 담는다(실제 `addMode`가 "Limited to 1 modes only"로 막힘).
- 사용자가 반론했다. 코드가 더 자주 바뀌고, 색·간격 결정은 Figma에서 보며 하니 Figma가 기준이어야 한다.
- 두 입장을 레이어별 SoT로 갈랐다. 디자인 레이어(토큰값·컴포넌트 시각 스펙)는 Figma, 행위·반응형·믹스인은 코드.
- 사용자가 목표를 분명히 했다. Figma Dev MCP로 코드를 생성하고 GitHub를 거쳐 컴포넌트 기반으로 개발하는 디자인투코드(Figma 디자인을 코드로 생성), 그 전체를 하네스로 굴린다.
- Fast Campus 강의(`Claude Code + Figma MCP 디자인 시스템 자동화`)로 방법론을 대조했다. Figma→코드 + Code Connect가 주류임이 확인됐다. 단 공식 Figma Dev MCP는 Starter에서 월 6회 호출 한도, Code Connect는 Organization 유료 플랜이 필요하다.

결정을 미루면 비용이 쌓인다. 44개 라우트 중 절반이 빈 스텁(community·gallery·next-gen·notifications·search)인데, 규칙 없이 채워지면 페이지마다 제각각 구현돼 일관성이 다시 무너진다. 지금도 폼이 3가지 방식으로 갈리고 `ui/TextField`는 실사용이 0건이라, ui/ 카탈로그가 강제되지 않는 상태가 그대로 굳는다.

## Decision

**디자인 시스템의 SoT를 디자인 레이어 한정으로 Figma에 두고, Figma→코드 디자인투코드를 채택한다. 비용 0인 무료 경로로 PoC를 먼저 돌리고, 효과를 확인한 뒤 유료(Code Connect) 전환을 판단한다.**

| 항목 | 결정 |
|---|---|
| SoT 경계 | 디자인 레이어(토큰값 174개·컴포넌트 시각 스펙) = Figma / 행위·반응형·믹스인·맵·복합 rgba = 코드 |
| 이식 전략 | 기존 ui/ + 구현된 페이지 = 매핑 재사용(브리지로 추출, 하네스가 ui/ 규칙에 맞게 다듬음) / 스텁 페이지·신규 컴포넌트 = 디자인투코드 생성 |
| 경로 | Path Free 먼저 — figma-console/Talk-to-Figma 브리지 + 하네스가 Code Connect 역할 대행. Path Pro(유료 Figma + Code Connect)는 PoC 후 결정 |
| 첫 작업 | 토큰 동기화 파이프라인(exec-plan `ds-token-sync-pipeline`) — "토큰 먼저, 디자인 나중" 순서 |

## Consequences

### 긍정적
- 스텁 페이지를 디자인투코드로 생성하면 일관성이 구현 시점에 강제된다. 빈 페이지라 기존 코드와 충돌하지 않는다.
- 비용 0으로 시작한다. 유료 판단을 추측이 아니라 PoC 결과로 미룬다.
- 하네스(skills·Codex·verify-task)가 생성 코드를 ui/ 규칙·토큰에 맞게 거르는 검증 엔진이 된다.

### 부정적 / 트레이드오프
- Path Free는 Code Connect가 없어, Figma 컴포넌트를 ui/ 컴포넌트로 잇는 매핑을 하네스가 수기로 떠안는다. 생성 코드 품질이 Path Pro보다 낮고 사람 검토가 더 든다.
- 무료 브리지는 Figma 데스크톱 + 플러그인이 켜져 있어야 동작한다(WebSocket). CI에서 자동으로 못 돌리고 로컬에서 손으로 실행한다.
- Figma는 디자인 레이어만 SoT라, 믹스인·반응형·복합 rgba는 코드에만 남는다. "왜 이건 Figma에 없나"는 경계로 둔다.

### 영향 범위
- 코드: `scripts/`(토큰 싱크 보조), `src/components/ui/`(매핑 타겟 정비 — 후속), `tokens.config.json`(신규).
- 문서: 본 ADR, exec-plan `ds-token-sync-pipeline` 외 후속 plan.
- 운영: 토큰 동기화가 로컬 수기 명령이다(Figma 데스크톱 필요).

## Alternatives Considered

### A안: 코드를 SoT로 유지 (코드→Figma 단방향 싱크)
- 기각: 사용자가 디자인 결정을 Figma에서 하고 디자인투코드를 목표로 명시했다. 코드 SoT는 "Figma에서 탐색 → 코드로 구현" 흐름과 어긋난다. 무료 플랜이 전체를 못 담는 한계는 레이어별 SoT로 흡수했다(디자인 레이어만 Figma).

### B안: Path Pro로 바로 시작 (유료 Figma + Code Connect)
- 기각: 효과를 검증하기 전에 Figma Organization 비용을 선지출한다. 디자인투코드가 이 브라운필드(44 라우트·기존 ui/ 12 컴포넌트)에서 실제로 동작하는지 PoC로 확인한 뒤 결정해도 늦지 않다.

### C안: 강의대로 그린필드로 새 디자인 시스템 구축
- 기각: 강의 결과물(미니 디자인 시스템 + Supabase CRUD + 배포)을 이미 더 높은 수준으로 보유한다(44 라우트·ADR 16건·게이트·Codex 오케스트레이션). 빈 조각은 강의 STEP 2~4(Code Connect·디자인투코드·QA)뿐이라, 맨땅이 아니라 기존 시스템에 이식한다.

## References
- 관련 exec-plan: `docs/exec-plans/active/2026-06-13-ds-token-sync-pipeline.md`
- 관련 ADR: 0001(Codex 오케스트레이션 전략), 0004(ui 컴포넌트 토대), 0012(admin 토큰 분리), 0014(카드 전략)
- 관련 연구: `docs/research/figma-ds-build-state.json` (Figma 빌드 원장 — 커밋 제외)
