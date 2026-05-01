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
| `references/` | 외부 라이브러리 llms.txt 스냅샷 | 라이브러리 업데이트 시 |
| `research/` | 작업별 외부 자료 발췌 (일회성) | EXEC_PLAN 진행 중 |

## 원칙

- **지도, 백과사전 금지** — 각 README.md는 100줄 미만, 상세는 하위 파일이 담당
- **만들 때 README도 함께** — 새 디렉토리는 항상 README.md를 동반한다
- **신선도 마커** — 영구 문서 끝에 `<!-- last-audit: YYYY-MM-DD -->`
- **자동 생성 파일 수정 금지** — `generated/` 하위는 손으로 고치지 않는다

## 상위 컨텍스트

- 프로젝트 지도: 루트 `CLAUDE.md`
- 작업 절차: `CLAUDE.md` Workflow 섹션 (EXPLORE → PLAN → WORK → COMMIT)
- 작업별 how-to: `.claude/skills/{supabase,styles,file-structure}/`

<!-- last-audit: 2026-05-01 -->
