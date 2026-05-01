# 대구동남교회 웹사이트 — Codex 진입점

이 파일은 Codex CLI용 부트스트랩 지도다. 상세 규칙은 복사하지 말고 저장소의 기록 시스템을 로딩한다.

## 시작 절차

1. 먼저 `.codex/skills/context-loader/SKILL.md`를 읽고 작업 유형에 맞는 컨텍스트를 로딩한다.
2. 항상 루트 `CLAUDE.md`, `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/tech-debt-tracker.md`를 기본 컨텍스트로 삼는다.
3. 작업이 다단계이면 `docs/exec-plans/active/`에서 관련 계획을 확인하거나 새 EXEC_PLAN 생성을 제안한다.
4. 기본 출력은 계획 리뷰, 설계 비평, 디버깅 분석, 최종 리뷰다. 구현은 Claude Code가 맡는다.

## 프로젝트 요약

- Stack: Next.js App Router, Supabase, SCSS Modules, Cloudinary, TypeScript
- Data flow: `src/apis/` -> `src/services/` -> `src/actions/` -> `src/app/`
- Content routes: `src/app/(content)/`
- Admin routes: `src/app/(admin)/`

## 필수 규칙

- `app/`은 `apis/`를 직접 호출하지 않는다. 공개 데이터도 `services/` 경유를 우선한다.
- 뮤테이션은 `src/actions/` Server Action에서 처리한다.
- Supabase 클라이언트는 용도별 팩토리를 사용한다. 자세한 규칙은 `.claude/skills/supabase/SKILL.md`.
- SCSS 값은 `src/styles/tokens/` 토큰을 사용한다. 하드코딩 색상·간격·폰트는 추가하지 않는다.
- `className`은 snake_case, 2개 이상 조합은 `clsx`를 사용한다.
- 한 페이지 전용 컴포넌트는 먼저 해당 route의 `_component/`에 둔다.

## Codex 역할

Codex는 Claude Code의 서브 에이전트로 동작한다. 주 역할은 깊은 추론, 설계 판단, 트레이드오프 분석, 막힌 디버깅, 큰 변경 후 객관 리뷰다.

Claude Code 또는 사용자가 Codex에 위임한 경우:

- 질의와 응답은 영어로 정확하게 처리한다.
- 사용자에게 보고할 요약은 한국어로 전달될 수 있게 핵심 결론과 근거를 명확히 남긴다.
- 기본적으로 구현을 직접 수행하지 않는다. 구현은 Claude Code가 오케스트레이션한다.
- 예외적으로 사용자가 명시적으로 Codex 구현을 요청한 경우에만 제한된 파일 범위에서 수정하고, 변경 파일 목록과 검증 결과를 마지막에 적는다.
- 계획 리뷰 시에는 반드시 진행 가능 여부, 수정해야 할 계획, 숨은 리스크, 검증 공백을 구분해서 답한다.

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
yarn verify
```

주의: 현재 `yarn verify`는 기존 기술 부채에 막힐 수 있다. 실패하면 새 회귀인지 기존 부채인지 `docs/tech-debt-tracker.md`와 대조한다.

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
