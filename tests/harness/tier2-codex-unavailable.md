# DB 컬럼 추가 (fixture — Tier 2, Codex 미가동 fallback으로 gate PASS 예상)

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

## Codex 1차 검증

- **결론**: CODEX_UNAVAILABLE — 오류: Codex CLI가 Windows에서 3회 연속 stall(응답 없음). 시도: foreground `codex:rescue` 2회 + 프로세스 재시작 1회 모두 5분 초과로 중단. Claude 확인: diff를 직접 읽어 새 컬럼 select만 추가됐고 레이어 위반·인접 정리 0건임을 확인, verify-task도 PASS.

<!-- Codex 1차가 CODEX_UNAVAILABLE이고 오류/시도/Claude 확인 3필드를 갖췄다.
     `harness-gate --plan-file tier2-codex-unavailable.md --tier 2`는 통과해야 한다.
     계획 검증은 CODEX_UNAVAILABLE을 허용하지 않는다 — plan-first의 핵심이라 건너뛸 수 없다. -->
