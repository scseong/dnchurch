# tech-debt-cleanup-phase1-5

- **상태**: 📋 대기 (phase1 머지 후 시작)
- **시작일**: 2026-05-01 (생성), 시작 미정
- **브랜치**: 미정 (phase1 머지 후 결정)
- **선행**: `tech-debt-cleanup-phase1` 머지 완료

## 목표

`react-hooks/set-state-in-effect` 룰 위반 10건을 케이스별로 검토·해결한다. ESLint errors를 0으로 만들어 `yarn lint` exit 0을 달성한다.

## 접근법

각 위반은 다음 중 하나로 분류한다:
1. **진짜 안티패턴** → 이벤트 핸들러 또는 derived state로 리팩터
2. **정당한 사용** (외부 prop 동기화, 비동기 result 반영 등) → 룰 disable + 주석으로 의도 명시
3. **재구조화 가능** → 부모로 상태 끌어올림, 또는 useReducer로 변환

10개 파일이 컴포넌트별로 다른 맥락이므로 일괄 처리 위험. 한 번에 1~2개씩 PR을 작게 분할하는 것이 안전.

## 영향받는 파일 (10건, 각 1건)

1. `src/app/(content)/news/notices/_component/NoticeControlBar.tsx`
2. `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx`
3. `src/app/(content)/sermons/_component/SeriesBrowserSheet/SeriesBrowserSheet.tsx`
4. `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.tsx`
5. `src/components/admin/sermons/SermonListPage/hooks/useListFilters.ts`
6. `src/components/admin/sermons/SermonListPage/index.tsx`
7. `src/components/common/Modal.tsx`
8. `src/components/layout/BottomNav/BottomNav.tsx`
9. `src/components/layout/Header/DesktopHeader.tsx`
10. `src/hooks/useMediaQuery.ts`

## 단계별 체크리스트

- [ ] 1. 각 파일의 위반 라인을 정확히 파악 (`yarn lint`)
- [ ] 2. 케이스별 분류 (안티패턴 / 정당 / 재구조화)
- [ ] 3. 분류 결과를 본 EXEC_PLAN에 기록 (10개 파일 × 분류 + 처리 방향)
- [ ] 4. 사용자 검토 후 진행 (분류 동의)
- [ ] 5. 케이스별 수정 (작은 단위 PR로 분할 가능)
- [ ] 6. 사용자 동작 검증 (수정한 컴포넌트마다 해당 화면)
- [ ] 7. `yarn lint` errors=0 확인
- [ ] 8. tech-debt-tracker 갱신

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs tech-debt-cleanup-phase1-5` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] (필요 시) 마이그레이션 적용
- [ ] (필요 시) ADR 또는 tech-debt-tracker 업데이트

## 참고 자료

(외부 자료를 발췌해 `docs/research/`에 저장한 경우 여기에 링크)

- `docs/research/<date>-<slug>.md` — ...

## 의사결정 로그

(중간에 plan을 벗어나거나 새 결정이 생기면 여기에 추가. 날짜 + 한 줄 사유)

- YYYY-MM-DD: ...

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
