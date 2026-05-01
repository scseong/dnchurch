# tech-debt-cleanup-phase1

- **상태**: ✅ 구현+검증 완료 (커밋 대기)
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering
- **트리거**: `harness-hooks-orchestration` EXEC_PLAN이 사전 부채에 막혀 일시 보류됨

## 목표

ESLint **errors 23건**을 청산해 `yarn verify`의 lint 단계가 통과되도록 한다. Knip 49건과 ESLint warnings 41건은 별도 Phase로 분리.

## 접근법

본 EXEC_PLAN은 **errors 13건만 청산** (안전·즉시 가능). 나머지 10건(`react-hooks/set-state-in-effect`)은 케이스별 검토가 필요해 `tech-debt-cleanup-phase1.5`로 분리.

errors 분포 재분석 결과 (작성 중 발견된 정정 사항):
- `react-hooks/set-state-in-effect` 10건은 **단일 파일이 아니라 10개 다른 파일에 1건씩 분산** (효과·헤더·필터 등 재사용 컴포넌트들)
- `react-hooks/refs` 10건은 ConfirmModal 한 파일에 집중 (의도된 snapshot 패턴, 룰과 충돌)
- `useTimer`의 `react-hooks/immutability`는 함수 hoisting 의존이지 진짜 버그 아님 — 함수 순서만 재정렬하면 안전

## ESLint errors 정확한 분포

| 룰 | 건수 | 위치 | 본 phase 처리 |
| --- | --- | --- | --- |
| `react-hooks/refs` | 10 | `components/admin/common/ConfirmModal/index.tsx` | ✅ 룰 disable + 의도 주석 |
| `react-hooks/set-state-in-effect` | 10 | 10개 파일 1건씩 | ⏭ phase1.5로 분리 |
| `prefer-const` | 1 | `lib/supabase/middleware.ts` | ✅ 자동 수정 |
| `react-hooks/immutability` | 1 | `hooks/useTimer.tsx` | ✅ 함수 순서 재정렬 |
| `@typescript-eslint/no-require-imports` | 1 | `next.config.ts` | ✅ 룰 disable (Next.js 공식 예제도 require 사용) |
| **본 phase 합계** | **13** | | |

## 영향받는 파일

- `src/lib/supabase/middleware.ts` — `let` → `const` (자동 수정)
- `src/hooks/useTimer.tsx` — `stop` 함수 선언을 `tick`보다 위로 이동 (안전, 동작 변경 없음)
- `next.config.ts` — `require()` 라인에 룰 disable 주석
- `src/components/admin/common/ConfirmModal/index.tsx` — snapshot ref 패턴 의도 주석 + 라인별 룰 disable
- `docs/tech-debt-tracker.md` — 해결된 항목 이동, phase1.5 항목 추가

## 단계별 체크리스트

- [x] 1. **자동 수정**: `yarn lint --fix` (`middleware.ts` prefer-const 1건)
- [x] 2. **`useTimer.tsx`** — `stop`을 `tick` 위로 이동, 의존성 정리
- [x] 3. **`next.config.ts`** — `require()` 위에 disable 주석 + 사유
- [x] 4. **`ConfirmModal`** — snapshot 의도 docstring + 라인별 `eslint-disable-next-line react-hooks/refs`
- [x] 5. **부분 검증**: `yarn lint` errors 23 → 10 (set-state-in-effect만 남음) ✓
- [x] 6. **빌드 확인**: `yarn build` 통과 ✓
- [x] 7. **tech-debt-tracker 갱신**: errors 13건 해결됨 섹션 + 잔여 부채 분리 표기
- [x] 8. **phase1.5 EXEC_PLAN 생성**: `2026-05-01-tech-debt-cleanup-phase1-5.md` 작성 (대기 상태)

## 완료 기준 (DoD)

- [ ] `yarn lint` errors가 23 → **10**으로 감소 (set-state-in-effect만 남음)
- [ ] `yarn build` 통과
- [x] `useTimer` 사용 화면(`/forget-password` 이메일 인증 요청) 동작 검증 (사용자) ✓ 2026-05-01
- [x] `ConfirmModal` 사용 화면(`/admin/sermons` 삭제 확인) 동작 검증 (사용자) ✓ 2026-05-01
- [x] tech-debt-tracker 업데이트 (errors 13건 해결, 잔여 항목 정리)
- [x] phase1.5 EXEC_PLAN 생성
- [ ] 사용자 승인 후 커밋 (대기 중 — feat/harness-engineering 브랜치에서 통합 커밋 예정)

## 범위 밖 (별도 EXEC_PLAN)

- **`tech-debt-cleanup-phase2`** (예정): ESLint warnings 41건 — `@next/next/no-img-element` 11, `@typescript-eslint/no-unused-vars` 10, `react-hooks/incompatible-library` 5, `react-hooks/exhaustive-deps` 5
- **`tech-debt-cleanup-knip`** (예정): Knip 미사용 코드 ~50건 (files 15 + exports 20 + types 14 + devDependencies 1) — false positive 검증 필요
- **`verify-task-rework`** (예정): `verify-task.sh`가 부채에 항상 막히는 결함 — 변경 파일만 검사하는 모드 또는 baseline 인정

## 참고 자료

- 정밀 분포 분석: 본 EXEC_PLAN 작성 시 `eslint . --format=json` 출력 기반
- 관련 부채 항목: `docs/tech-debt-tracker.md`의 "ESLint 9 / Next 16 신규 룰 위반"

## 의사결정 로그

- 2026-05-01: warnings 41건은 Phase 2로 분리 — errors가 빌드 차단 핵심이고, warnings는 verify 통과를 막지 않음. 한 EXEC_PLAN에 너무 많이 묶으면 머지 단위가 커짐.
- 2026-05-01: Knip은 별도 EXEC_PLAN — false positive 가능성(예: prettier는 eslint-config-prettier에서 사용)이 있어 단순 일괄 삭제 위험. 사용자와 항목별 확인 필요.
- 2026-05-01: `useTimer` 수정은 사용자 확인 후 — 동작이 미묘하게 바뀔 수 있는 잠재 버그라 동작 검증 필수.
- 2026-05-01: **분석 정정** — set-state-in-effect 10건이 ConfirmModal 한 파일이 아니라 10개 별도 파일에 분산. `react-hooks/refs` 10건이 ConfirmModal에 집중. 작업 분포 변경.
- 2026-05-01: **set-state-in-effect 10건은 phase1.5로 분리** — 케이스별 검토 필요(정당한 사용일 수도). 본 phase는 안전·즉시 가능한 13건만.
- 2026-05-01: ConfirmModal `react-hooks/refs`는 **룰 disable + 주석으로 의도 명시** — snapshot 패턴이 의도된 디자인(transition 중 깜빡임 방지). useState로 바꾸면 set-state-in-effect 룰을 다시 위반하는 함정.
- 2026-05-01: `useTimer`는 진짜 버그가 아닌 **함수 hoisting 의존**으로 확인 — 함수 순서 재정렬만으로 안전 수정 가능, 동작 변경 없음.
- 2026-05-01: **Codex 리뷰 반영** — ConfirmModal을 `useState` + `useLayoutEffect` 패턴으로 재구현. 사유: ref render-time mutation은 React 19 Concurrent Mode에서 버려진 렌더 데이터가 누출될 수 있음. 한 프레임 지연 비용은 모달 사용 패턴(props가 거의 변하지 않음)에서 무시 가능.
- 2026-05-01: **Codex 리뷰 일부 철회** — layer 룰 상대 경로 보강(`**/<layer>/**`)은 `next/dist/client/components/...` 등 외부 패키지 false positive 발생. alias만 유지로 후퇴. 상대 경로 보강은 `eslint-plugin-import`의 `no-relative-parent-imports` 등으로 별도 처리 후보.
- 2026-05-01: **app/ → apis/ 룰 격상** — `warn` → `error`. 기존 위반 10건은 line-level disable + tech-debt-tracker 등록. 신규 위반은 즉시 차단됨.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: ConfirmModal 수정이 기존 동작을 그대로 유지하는가? (회귀 테스트 없음, 수동 검증 필수)
- [ ] **멀티 세션 리뷰** (권장): `useTimer`·`ConfirmModal`은 동작 변경 가능성이 있어 별도 세션 또는 `codex:rescue`로 객관적 검토 권장.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
