# 대구동남교회 웹사이트 — Codex 진입점

이 파일은 Codex CLI용 부트스트랩 지도다. 상세 규칙은 복사하지 말고 저장소의 기록 시스템을 로딩한다.

## 시작 절차

1. 먼저 `.codex/skills/context-loader/SKILL.md`를 읽고 작업 유형에 맞는 컨텍스트를 로딩한다.
2. 항상 루트 `CLAUDE.md`, `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/tech-debt-tracker.md`를 기본 컨텍스트로 삼는다.
3. 작업이 다단계이면 `docs/exec-plans/active/`에서 관련 계획을 확인하거나 새 EXEC_PLAN 생성을 제안한다.
4. 기본 출력은 계획 리뷰, 설계 비평, 디버깅 분석, 구현 후 1차 리뷰다. 메인 구현과 최종 판단은 Claude Code가 맡는다.

## 프로젝트 요약

- Stack: Next.js App Router, Supabase, SCSS Modules, Cloudinary, TypeScript
- Data flow: `src/apis/` -> `src/services/` -> `src/actions/` -> `src/app/`
- Content routes: `src/app/(content)/`
- Admin routes: `src/app/(admin)/`

## 행동 가드레일 (LLM 공통 실수 방지)

> 모든 작업·검증·국소 수정에 공통 적용. 트레이드오프: 속도보다 정확성 우선. 단순 변경은 자체 판단으로 생략 가능. CLAUDE.md의 동일 섹션과 의도적으로 일치한다.

- **코딩 전 사고**: 가정과 모호성을 명시한다. 해석이 여럿이면 묻거나 채택한 해석을 exec-plan/응답에 기록한다 — 조용히 선택하지 않는다.
- **단순함 우선**: 작업을 만족하는 최소 변경을 선택한다. 추측성 추상화·옵션·"유연성"·요청 외 정리 금지. 200줄로 쓴 것이 50줄로 가능하면 다시 쓴다.
- **외과적 변경**: 변경된 모든 줄은 현재 작업으로 추적되어야 한다. 인접 코드·주석·포맷 "개선" 금지. 로컬 스타일을 따른다. 이번 변경이 만든 unused import/변수만 제거하고, 기존 dead code는 발견 시 보고만 한다.
- **검증 가능한 목표**: 구현 전 성공 기준을 정의하고, 가장 좁은 신뢰 명령으로 먼저 검증한 뒤 `verify-task.mjs`로 마무리한다. "동작하게 만들어" 같은 약한 기준은 시작 전에 구체화한다.

## 필수 규칙

- `app/`은 `apis/`를 직접 호출하지 않는다. 공개 데이터도 `services/` 경유를 우선한다.
- 뮤테이션은 `src/actions/` Server Action에서 처리한다.
- Supabase 클라이언트는 용도별 팩토리를 사용한다. 자세한 규칙은 `.claude/skills/supabase/SKILL.md`.
- SCSS 값은 `src/styles/tokens/` 토큰을 사용한다. 하드코딩 색상·간격·폰트는 추가하지 않는다.
- `className`은 snake_case, 2개 이상 조합은 `clsx`를 사용한다.
- 한 페이지 전용 컴포넌트는 먼저 해당 route의 `_component/`에 둔다.

## Codex 역할

Codex는 Claude Code의 서브 에이전트로 동작한다. 주 역할은 계획 검증, 깊은 추론, 설계 판단, 트레이드오프 분석, 막힌 디버깅, 구현 후 1차 검증이다.

목표 협업 루프:

```text
Claude Code 초기 계획
-> Codex 계획 검증
-> Claude Code 코드 작성
-> Codex 1차 검증 + 제한적 수정
-> Claude Code 2차 검증과 최종 책임
```

Claude Code 또는 사용자가 Codex에 위임한 경우:

- 질의와 응답은 영어로 정확하게 처리한다.
- 사용자에게 보고할 요약은 한국어로 전달될 수 있게 핵심 결론과 근거를 명확히 남긴다.
- 메인 구현은 직접 수행하지 않는다. 구현은 Claude Code가 오케스트레이션한다.
- 구현 후 1차 검증 단계에서는 명백한 버그, 타입 오류, 누락 guard, 테스트 실패 원인의 국소 수정만 직접 수행할 수 있다.
- 계획 변경, 새 라이브러리, 데이터 흐름 변경, 인증/캐시/배포 정책 변경은 직접 수정하지 않고 Claude Code에 반환한다.
- 직접 수정한 경우 변경 파일 목록, 수정 이유, 검증 결과, 남은 리스크를 마지막에 적는다.
- 계획 리뷰 시에는 반드시 `PASS`, `CHANGE_REQUEST`, `BLOCK` 중 하나로 결론을 내리고, 수정해야 할 계획, 숨은 리스크, 검증 공백을 구분해서 답한다.

## 검증

기본 검증 명령:

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip
```

통합 검증:

```bash
node scripts/verify-task.mjs <task-id>
```

주의: `yarn verify`도 같은 Node 검증 하네스를 실행한다. 실패하면 새 회귀인지 기존 부채인지 `docs/tech-debt-tracker.md`와 대조한다.

## 기록 위치

- 문서 인덱스: `docs/README.md`
- 아키텍처: `docs/ARCHITECTURE.md`
- 결정 기록: `docs/decisions/`
- 작업 계획: `docs/exec-plans/active/`
- 완료 기록: `docs/exec-plans/completed/`
- 기술 부채: `docs/tech-debt-tracker.md`
- 작업별 외부 자료: `docs/research/`
- 외부 라이브러리 스냅샷: `docs/references/`

<!-- last-audit: 2026-05-01 -->
