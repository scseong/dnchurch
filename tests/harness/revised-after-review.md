# 검색 결과 칩 라벨 GNB 정합 (fixture — gate PASS 예상, PASS_WITH_DECISION_LOG 경로)

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: fix/search-chip-label-gnb
- **Open questions**: none
- **ADR needed**: no

## 목표

검색 결과 페이지의 "전체" 칩 라벨을 GNB의 "통합검색"과 일치시킨다.

## 검증된 Assumptions

- `src/app/(content)/search/page.tsx:42`에 "전체" 하드코딩 — `Grep "전체" src/app/(content)/search/` 1건 확인.
- GNB nav 항목은 `src/data/navigation.ts:8` "통합검색" — `Grep "통합검색" src/data/navigation.ts` 1건 확인.

## Success Criteria

- 검색 페이지 칩 텍스트가 브라우저에서 "통합검색"으로 표시 (수동 확인)
- 다른 라벨·라우트 변경 0건 (`git diff` 검토)

## 영향받는 파일

- `src/app/(content)/search/page.tsx`

## 단계별 체크리스트

- [ ] 1. "전체" → "통합검색" 한 줄 변경
- [ ] 2. yarn build 확인

## Verification

- `node scripts/verify-task.mjs search-chip-label-gnb`

## 의사결정 로그

- 2026-05-14: Codex 계획 검증 `PASS_WITH_DECISION_LOG` — expression 1건 — "라벨 정정"이라는 plan 표현이 실제로는 "다른 라벨 표기와의 정합"이라 더 정확. WORK 진입 후 본 plan에 별도 수정 없이 진행. material risk 없음.

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **풀이**: 5체크 모두 충족. material risk 없음. expression 1건은 의사결정 로그에 기록 완료 — WORK 진입 가능. confidence: high.

## Codex 1차 검증

- **결론**: PASS
- **풀이**: 변경 1줄·영향 파일 1건. 인접 정리 0건, 외과적 변경 위반 없음.

## Verification

- `node scripts/verify-task.mjs <task-id>` — PASS (lint·stylelint·build·knip 0 신규). GNB와 검색 칩 라벨이 브라우저에서 동일 문자열로 표시됨을 수동 확인.
