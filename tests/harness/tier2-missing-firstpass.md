# DB 컬럼 추가 (fixture — Tier 2, Codex 1차 누락으로 gate FAIL 예상)

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-21
- **브랜치**: feat/add-column
- **Open questions**: none
- **ADR needed**: yes — src/services 변경

## 목표

sermons 테이블에 요약 컬럼을 추가하고 services 읽기에 반영한다.

## Success Criteria

- 새 컬럼이 목록 응답에 포함된다.

## 영향받는 파일

- `src/services/sermon.ts`

## Verification

- `node scripts/verify-task.mjs add-column`

---

## Codex 계획 검증

- **결론**: PASS — Assumptions·Non-goals 명시되고 새 추상화 없이 컬럼 하나만 추가한다.

<!-- Codex 1차 검증 섹션이 일부러 빠져 있다.
     `harness-gate --plan-file tier2-missing-firstpass.md --tier 2`는 이 부재로 실패해야 한다. -->
