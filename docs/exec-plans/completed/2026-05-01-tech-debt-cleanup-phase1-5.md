# tech-debt-cleanup-phase1-5

- **상태**: ⚠️ 폐기 (2026-06-01) — 전제로 잡은 위반 10건이 다른 작업으로 2건까지 줄었다. 남은 2건은 정당한 패턴이라 별도 작업이 필요 없다. 아래 폐기 사유 참조.
- **시작일**: 2026-05-01 (생성), 시작하지 않음
- **브랜치**: 없음 (착수 전 폐기)
- **선행**: `tech-debt-cleanup-phase1` 머지 완료

## 폐기 사유

- **무엇이 바뀌었나**: 이 계획서는 `react-hooks/set-state-in-effect` 위반 10건(NoticeControlBar·AdvancedFilterSheet·SeriesBrowserSheet·SermonVideoTools·useListFilters·SermonListPage·Modal·BottomNav·DesktopHeader·useMediaQuery)을 고치려 만들었다. 2026-06-01 기준 이 10개 파일에는 위반이 남아 있지 않다.
- **왜 사라졌나**: 위반 9건은 그 사이 진행한 컴포넌트 리팩터(useDialog 통합·SermonListPage 재구조 등) 과정에서 자연스럽게 없어졌다. active.md "ESLint `react-hooks/set-state-in-effect` (2건, 9건 정리됨)" 항목이 같은 내용을 추적한다.
- **남은 2건은 다른 파일**: 지금 남은 위반은 `ConfirmModal/index.tsx:48`·`useDrawerHistory.ts:52` 두 곳뿐이고, 둘 다 외부 동기화가 정당한 패턴이라 line-disable + 사유 주석으로 유지한다. 이 계획서가 노린 10개 파일과 겹치지 않는다.
- **확인**: `rg "react-hooks/set-state-in-effect" src -l` → 2 hits(ConfirmModal·useDrawerHistory). 이 계획서의 10개 대상 파일은 0 hit.
- **남은 추적**: 위 2건은 active.md 항목과 tech-debt-pre-release Phase 3(G7, useDrawerHistory 정리)에서 다룬다.

## 목표 (폐기됨)

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
