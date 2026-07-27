# 오타 수정 (fixture — Tier 0, verdict 섹션 없이 gate PASS 예상)

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-21
- **브랜치**: docs/typo-fix
- **Open questions**: none
- **ADR needed**: no

## 목표

docs/README.md의 오타 1건을 고친다.

## Success Criteria

- 오타 1건 수정, 다른 변경 없음.

## 영향받는 파일

- `docs/README.md`

## 단계별 체크리스트

- [ ] 1. 오타 수정

## Verification

- `node scripts/verify-task.mjs typo-fix`

---

<!-- Tier 0은 verdict 섹션을 요구하지 않는다. 이 파일에는 검증 섹션이 없고,
     `harness-gate --plan-file tier0-no-verdict.md --tier 0`은 통과해야 한다.
     같은 파일을 `--tier 2`로 돌리면 계획 검증 섹션 부재로 실패해야 한다. -->
