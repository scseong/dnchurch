# <작업 제목>

- **상태**: 🟡 진행 중
- **시작일**: YYYY-MM-DD
- **브랜치**: feat/...
- **Open questions**: none
- **ADR needed**: no

## 목표

(이 작업이 끝났을 때 무엇이 달라지는가? 1–3줄)

## 검증된 Assumptions

(EXPLORE에서 rg/generated types/SQL/Read로 직접 확인한 사실만. 항목마다 확인 근거 1줄. 예: `is_published`만 존재 — `mcp__claude_ai_Supabase__list_tables(sermons)` 호출.)

-

## Success Criteria

(yes/no 판정 가능한 항목. "동작하게 만들어" 같은 약한 기준 금지.)

-

## 영향받는 파일

- `src/...`

## 단계별 체크리스트

- [ ] 1. ...

## Verification

- `node scripts/verify-task.mjs <task-id>`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청

## Codex 1차 검증

- **결론**: 미요청

## Claude 2차 검증

- **최종 판단**: 미작성

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시
-->

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
