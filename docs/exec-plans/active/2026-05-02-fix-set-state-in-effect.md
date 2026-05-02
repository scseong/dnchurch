# fix-set-state-in-effect

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-02
- **브랜치**: feat/harness-engineering

## 목표

`queueMicrotask`로 우회된 `react-hooks/set-state-in-effect` 경고 8건을 올바른 React 패턴으로 교체한다.
각 케이스의 의도를 보존하면서 불필요한 렌더 지연을 제거한다.

## 접근법

8개 발생을 3가지 패턴으로 분류해 패턴별로 수정한다.

- **패턴 A — 순수 prop-derived state 동기화 (4개)**: React 공식 권장인 렌더 중 상태 업데이트 패턴으로 교체.
  `useEffect` 제거 + `prevProp` state를 두고 렌더 중 비교하여 동기적으로 업데이트.
  - `AdvancedFilterSheet`: guard 조건에 `activePreacher`와 `open` 두 prop을 모두 포함 — 닫힌 채 값이 유지되다 다시 열릴 때 reset 의도가 누락되지 않도록 한다.
  - `SermonListPage`: `prevProp` state를 추가하되 기존 `lastExternalSearchRef` guard는 그대로 유지. ref는 debounce effect의 echo를 막는 핵심 guard이므로 제거하지 않는다.
- **패턴 B — 외부 source/effect-only reset (3개)**: `queueMicrotask` 래퍼만 제거.
  `useEffect` 자체는 유지하고 린트 경고는 사유를 포함한 `eslint-disable-next-line` 주석으로 처리.
  - `SermonVideoTools`: `loadBookmarks()`가 localStorage를 읽으므로 render 중 호출 불가 → Pattern B.
- **패턴 C — SSR 마운트 (1개)**: `queueMicrotask` 래퍼만 제거. `useEffect`는 클라이언트에서만 실행되므로 불필요.

대안 기각: `useMemo`는 사용자가 수정 가능한 draft state에 적합하지 않음. `key` prop 초기화는 컴포넌트 전체 리셋이 발생해 과도함.

## 영향받는 파일

패턴 A:
- `src/app/(content)/news/notices/_component/NoticeControlBar.tsx`
- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx`
- `src/components/admin/sermons/SermonListPage/index.tsx`
- `src/components/layout/Header/DesktopHeader.tsx`

패턴 B:
- `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.tsx`
- `src/app/(content)/sermons/_component/SeriesBrowserSheet/SeriesBrowserSheet.tsx`
- `src/components/layout/BottomNav/BottomNav.tsx`

패턴 C:
- `src/components/common/Modal.tsx`

## 단계별 체크리스트

- [x] 1. Codex 계획 검증 (CODEX_PLAN_REVIEW) — CHANGE_REQUEST 반영 완료
- [x] 2. 패턴 C — Modal.tsx `queueMicrotask` 제거 + eslint-disable
- [x] 3. 패턴 B — SeriesBrowserSheet, BottomNav, SermonVideoTools `queueMicrotask` 제거 + eslint-disable
- [x] 4. 패턴 A — NoticeControlBar 렌더 중 업데이트 패턴 적용
- [x] 5. 패턴 A — AdvancedFilterSheet 렌더 중 업데이트 패턴 적용
- [x] 6. 패턴 A — SermonListPage: React Compiler ref-in-render 오류로 Pattern B 전환 (eslint-disable)
- [x] 7. 패턴 A — DesktopHeader 렌더 중 업데이트 패턴 적용
- [x] 8. CODEX_FIRST_PASS — N/A (사용자 요청으로 skip)
- [x] 9. VERIFY (`node scripts/verify-task.mjs fix-set-state-in-effect`) — pass
- [x] 10. 사용자 승인 후 커밋 — `fix/set-state-in-effect` 브랜치, `7354b9f`

## 완료 기준 (DoD)

- [x] `node scripts/verify-task.mjs fix-set-state-in-effect` 통과 (lint + lint:styles + build + knip)
- [x] `queueMicrotask` 사용 0건 (전체 tsx 검색 기준)
- [x] 사용자 승인 후 커밋

## 참고 자료

- PR #73 Gemini Code Assist 리뷰 — `react-hooks/set-state-in-effect` 8건 지적

## 의사결정 로그

- 2026-05-02: 패턴 A에 렌더 중 업데이트 선택 — React 공식 권장, extra render 없음, 린트 경고 없음
- 2026-05-02: 패턴 B에 eslint-disable 선택 — 초기화 로직 자체는 올바름, 규칙이 과도하게 엄격한 케이스

## ADR 판단

- **필요 여부**: 불필요
- **사유**: 특정 파일 내 패턴 교체이며 레이어 경계·라이브러리·정책 변경 없음

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-02
- **결론**: CHANGE_REQUEST
- **핵심 지적**:
  1. SermonVideoTools는 `localStorage` 읽기(`loadBookmarks`) 포함 — render purity 위반, Pattern B로 이동 필수
  2. SermonListPage의 `lastExternalSearchRef` guard는 debounce echo 방지 핵심 — 제거 없이 `prevProp` state와 공존시킬 것
  3. AdvancedFilterSheet guard 조건에 `open` prop 포함 — 닫힌 채 값 유지 후 재열기 시 reset 누락 방지
- **반영 내용**: 위 3건 모두 반영. SermonVideoTools → Pattern B 이동, AdvancedFilterSheet guard 조건 명시, SermonListPage ref guard 보존 명시

## Codex 1차 검증

- **상태**: N/A
- **결론**: N/A (사용자 요청으로 skip)

## Claude 2차 검증

- **검토 내용**: 패턴 A 3건(렌더 중 업데이트), 패턴 B 5건(eslint-disable) 의도 보존 확인. SermonListPage는 React Compiler ref-in-render 제약으로 Pattern B 전환. queueMicrotask 0건 잔존 확인.
- **실행한 검증**: `node scripts/verify-task.mjs fix-set-state-in-effect` — **pass** (ESLint error 0, Knip warning은 기존 부채)
- **최종 판단**: 머지 가능

## 리뷰 (완료 직전)

- [x] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [x] **멀티 세션 리뷰**: Codex 계획 검증(CHANGE_REQUEST 반영)으로 대체

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
