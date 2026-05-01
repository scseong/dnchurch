# Claude Hooks

Claude Code와 Codex CLI 협업 타이밍을 제안하는 Hook 모음이다. Hook은 Codex를 직접 실행하지 않는다. Claude Code가 `codex:rescue` 호출 여부를 최종 판단한다.

현재 로컬 환경에 Python 런타임이 없어 Node.js 기반 `.mjs` 스크립트로 구현한다. 역할은 Python 레퍼런스와 동일하다.

## Hook 목록

| 파일 | 이벤트 | 역할 |
| --- | --- | --- |
| `agent-router.mjs` | `UserPromptSubmit` | 사용자 입력에서 Codex 상담 후보 감지 |
| `check-codex-before-write.mjs` | `PreToolUse: Write/Edit/MultiEdit` | 고위험 파일 편집 전 Codex 상담 제안 |
| `check-codex-after-plan.mjs` | `PostToolUse: Write/Edit/MultiEdit` | EXEC_PLAN 작성/수정 후 Codex 계획 리뷰 제안 |
| `post-implementation-review.mjs` | `PostToolUse: Write/Edit/MultiEdit` | 큰 diff 또는 위험 파일 변경 후 Codex 리뷰 제안 |
| `check-adr-needed.mjs` | `PostToolUse: Write/Edit/MultiEdit` | 구조·라이브러리·정책 변경 후 ADR 작성 제안 |
| `post-test-analysis.mjs` | `PostToolUseFailure: Bash` | lint/build/test 실패 후 Codex 분석 제안 |

## 운영 원칙

- 1차 버전은 자동 실행이 아니라 자동 제안이다.
- 사용자 입력/계획/검증 실패처럼 판단 품질이 중요한 순간에만 신호를 준다.
- Codex에 질의할 때는 영어로 질문하고, 사용자 보고는 한국어로 한다.
- 제안이 과도하게 발생하면 각 스크립트의 키워드와 임계값을 조정한다.

## Codex 계획 리뷰 표준 프롬프트

```text
Please review this implementation plan before coding.

Repository context:
- Next.js App Router, Supabase, SCSS Modules, TypeScript
- Required data flow: apis -> services -> actions -> app
- System of record: docs/
- Relevant docs: AGENTS.md, CLAUDE.md, docs/ARCHITECTURE.md, docs/tech-debt-tracker.md

Review focus:
1. Does the plan respect the architecture and layer boundaries?
2. Are the steps ordered safely?
3. Is the scope too large or should it be split?
4. Are there hidden risks, missing verification steps, or missing docs updates?
5. Should any part be handled before implementation?

Return:
- Critical issues
- Suggested plan changes
- Risks
- Whether implementation can proceed
```

<!-- last-audit: 2026-05-01 -->
