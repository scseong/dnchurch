# docs/ — 지식 시스템

> **이 디렉토리는 기록 시스템(System of Record)이다.** 사람과 에이전트가 공유하는 영구 지식만 보관한다. Slack·Notion·PR 본문에 흩어진 결정은 여기로 회수한다.

## 무엇이 어디에 있는가

| 위치 | 무엇 | 라이프사이클 |
| --- | --- | --- |
| `ARCHITECTURE.md` | 시스템 아키텍처 (라우트·레이어·외부 의존) | 구조 변경 시 |
| `tech-debt-tracker.md` | 알려진 기술 부채·마이그레이션 항목 | 발견/해결 즉시 |
| `exec-plans/active/` | 진행 중 작업의 EXEC_PLAN | 작업당 1개 |
| `exec-plans/completed/` | 머지 완료된 작업 기록 (회고·검색용) | 머지 직후 이동 |
| `decisions/` | ADR — "왜 이 선택을 했는가" 영구 기록 | 큰 결정 시 |
| `generated/` | 코드·DB·타입에서 자동 생성 (사람 가독) | 생성 스크립트 실행 시 |
| `references/` | 외부 라이브러리 스냅샷과 반복 제약 | 라이브러리 업데이트/정책 변경 시 |
| `research/` | 작업별 외부 자료 발췌 (일회성) | EXEC_PLAN 진행 중 |

## 에이전트 컨텍스트 로딩

Codex CLI는 루트 `AGENTS.md`에서 시작한 뒤 `.codex/skills/context-loader/SKILL.md`를 사용해 필요한 문서만 선택적으로 읽는다.

기본 로딩 세트:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/tech-debt-tracker.md`

작업 유형별 추가 문서는 `context-loader`의 라우팅 표가 결정한다. `docs/` 전체를 무차별 로딩하지 않는다.

Claude Code는 `.claude/settings.json`에 등록된 `.claude/hooks/` 스크립트로 Codex 상담 타이밍을 자동 제안한다. Hook은 Codex를 직접 실행하지 않고, Claude Code가 `codex:rescue` 호출 여부를 판단하도록 컨텍스트를 제공한다.

## 원칙

- **지도, 백과사전 금지** — 각 README.md는 100줄 미만, 상세는 하위 파일이 담당
- **만들 때 README도 함께** — 새 디렉토리는 항상 README.md를 동반한다
- **신선도 마커** — 영구 문서 끝에 `<!-- last-audit: YYYY-MM-DD -->`
- **자동 생성 파일 수정 금지** — `generated/` 하위는 손으로 고치지 않는다
- **큰 결정은 ADR로 승격** — 구조·라이브러리·정책 변경은 `node scripts/start-adr.mjs <slug>`로 기록한다

## 상위 컨텍스트

- 프로젝트 지도: 루트 `CLAUDE.md`
- Codex 진입점: 루트 `AGENTS.md`
- Codex 컨텍스트 로더: `.codex/skills/context-loader/SKILL.md`
- Claude Hook 자동 제안: `.claude/hooks/README.md`
- 작업 절차: `CLAUDE.md` Workflow 섹션 (EXPLORE → PLAN → WORK → COMMIT)
- 작업별 how-to: `.claude/skills/{supabase,styles,file-structure}/`

<!-- last-audit: 2026-05-01 -->
