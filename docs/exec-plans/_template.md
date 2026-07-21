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

<!-- 검증 섹션 — harness-gate가 tier에 따라 요구한다: Tier 0 없음 / Tier 1 계획 검증 / Tier 2 계획 + Codex 1차.
     아래 한 줄을 실제 verdict로 바꾼다. 토큰 + 근거 30자 이상. lint·build 결과는 `## Verification`에 남긴다.
     Codex가 hang·실패로 안 돌면 Codex 1차에 한해 `CODEX_UNAVAILABLE — 오류: … / 시도: … / Claude 확인: …`. -->

## Codex 계획 검증

- **결론**: 미요청 — 계획 검증 후 `PASS·PASS_WITH_DECISION_LOG·CHANGE_REQUEST·BLOCK` + 근거로 교체

## Codex 1차 검증

- **결론**: 미요청 — 구현 diff 검증 후 `PASS·FIX_APPLIED·CHANGE_REQUEST·BLOCK·CODEX_UNAVAILABLE` + 근거로 교체 (Tier 2만 요구)

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 선택 섹션은 해당할 때만 추가: Non-goals · 감사 · 접근법 · 의사결정 로그 · ADR 판단 · 참고 자료 · 리뷰 · 회고.
     의사결정 로그 형식 · 검증 기록 표 · Codex 인용(verbatim + 풀이 1줄) · 한국어 표현 규칙은
     `.claude/skills/writing-style/SKILL.md`가 SSOT다 (문서 작성 시 자동 로딩).
     검증 워크플로우 메타는 `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙". -->

