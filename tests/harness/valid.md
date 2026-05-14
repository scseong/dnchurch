# Sermon Featured 토큰 정리 (fixture — gate PASS 예상)

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: refactor/sermon-featured-token-clean
- **Open questions**: none
- **ADR needed**: no

## 목표

SermonFeatured.module.scss의 rgba 하드코딩 3건을 local var로 교체한다.

## 검증된 Assumptions

- `$badge-glass-bg`, `$badge-glass-border`, `$duration-overlay-bg`는 styles/tokens/에 없음 — `rg "badge-glass" styles/tokens/` 0건 확인. 따라서 module-local var로 선언.

## Success Criteria

- SermonFeatured.module.scss에 hex/rgba 리터럴 0건 (`rg "#[0-9a-f]{3,6}|rgba\(" SermonFeatured.module.scss` 0건)
- yarn build 통과

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.module.scss`

## 단계별 체크리스트

- [ ] 1. local var 3종 선언
- [ ] 2. rgba 리터럴 → local var 치환

## Verification

- `node scripts/verify-task.mjs sermon-featured-token-clean`

---

## Codex 계획 검증

- **결론**: PASS
- **풀이**: 5체크 모두 충족. token 미존재 시 module-local var는 styles/SKILL.md 명시 패턴. 영향 파일 1건·LOC 8 — material risk 없음. confidence: high.

## Codex 1차 검증

- **결론**: PASS
- **풀이**: rgba 리터럴 0건 확인. 변경 외과적, 인접 정리 0건.

## Claude 2차 검증

- **최종 판단**: PASS — verify-task.mjs 통과 (lint 0 warning + stylelint 0 + build success + knip 0). visual regression 수동 확인 완료.
