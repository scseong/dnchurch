# client-portal-hydration

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: fix/client-portal-hydration
- **Open questions**: none (focus-timing 리스크는 호출부 6곳 전부 closed-start 확인으로 해소)
- **ADR needed**: no — 신규 ui/ 유틸은 ADR 0004 범위, 기존 mounted two-pass 패턴 적용이라 구조 결정 없음.

## 목표

Modal·BottomSheet의 hydration mismatch(서버 null vs 첫 클라 portal)를 없앤다. 공통 `ui/ClientPortal`(mounted two-pass)로 첫 client render를 서버와 같은 null로 맞춘 뒤 portal을 생성한다. tech-debt `portal hydration` 항목을 해소한다.

## 검증된 Assumptions

(EXPLORE: Read + Grep로 확인)

- Modal(`Modal.tsx:78,86,123`)·BottomSheet(`BottomSheet.tsx:54,62,100`)는 `typeof window` 가드 뒤 `createPortal`을 하고 **항상 렌더**(open/close는 CSS+aria-hidden/inert). → 서버 null vs 첫 클라 portal로 mismatch (tech-debt 등록분, `/sermons/[id]` BottomSheet 콘솔 에러).
- NoticeDrawer(`NoticeDrawer.tsx:40`)는 `if (!isOpen || typeof window...) return null`, `isOpen = notice !== null`. 초기 notice=null이라 서버·첫 클라 모두 null → mismatch 없음. createPortal은 `!isOpen` 가드 뒤라 서버에서 도달 안 함 → `typeof window`는 redundant.
- `getElementById('modal-root') ?? document.body` 타깃 해석이 3파일에 중복.
- `useDialog.ts:48–91` focus effect는 deps `[open, disableEscape]`, 내부에서 `panelRef.current`가 null이면 focus skip, 이후 panel이 붙어도 재실행 안 함 → initially-open에서만 focus 누락 위험.
- Modal/BottomSheet 호출부 6곳(SermonMetaActions·SeriesFilterBottomSheet·AdvancedFilterSheet·FilterDropdown·CategoryBottomSheet·ConfirmModal) 전부 `open`이 state/prop으로 closed-start → initially-open 없음 → focus 위험 미발생.

## 접근법

- Modal·BottomSheet를 `ClientPortal`로 래핑하고 `typeof window` 가드·수동 `createPortal`·`getElementById`를 제거한다. always-mounted 구조라 두 패스 전환이 앱 mount 시 한 번만 일어나, 다이얼로그를 열 때마다 생기는 지연은 없다.
- NoticeDrawer는 redundant `typeof window` 한 줄만 지운다. 닫히면 컴포넌트가 unmount되는 구조라 ClientPortal로 바꾸면 열 때마다 1프레임 지연이 생기므로 통일하지 않는다.
- 대안 4종을 기각했다 (Codex 분석).
  - `suppressHydrationWarning`: 서버 null과 클라 portal의 구조 차이를 못 덮는다.
  - `useSyncExternalStore`: mount 감지 하나에 과한 추상화다.
  - `dynamic ssr:false`: 컴포넌트 전체를 클라 전용으로 돌려 범위가 너무 넓다.
  - guard 제거: 서버에 `document`가 없어 throw한다.

## Success Criteria

- `src/components/ui/ClientPortal/ClientPortal.tsx` 신설 — mounted two-pass + 타깃 해석. Modal·BottomSheet가 직접 import해 portal 위임.
- Modal·BottomSheet에서 `typeof window` 가드·`createPortal`·`getElementById` 직접 호출 0.
- NoticeDrawer는 `if (!isOpen) return null`로 축소(typeof window 제거), 동작·open timing 불변.
- `verify-task` lint·stylelint·build 통과, knip 신규 0(또는 무해 export만).
- Claude in Chrome: `/sermons/[id]`에서 BottomSheet·Modal 열기 → 콘솔 hydration 경고 0, open 시 focus 정상.

## 영향받는 파일

- 신설: `src/components/ui/ClientPortal/ClientPortal.tsx`
- 수정: `src/components/ui/Modal/Modal.tsx`, `src/components/ui/BottomSheet/BottomSheet.tsx`, `src/app/(content)/news/notices/_component/NoticeDrawer.tsx`

## Non-goals

- NoticeDrawer를 ClientPortal로 통일하지 않는다. 통일하면 열 때마다 1프레임 지연만 더해지고, NoticeDrawer는 이미 서버·첫 클라 모두 null이라 mismatch가 없다.
- useDialog focus effect 리팩터 — 현재 호출부 전부 closed-start라 불필요.
- Modal/BottomSheet의 open/close 메커니즘(항상 렌더+CSS) 변경.

## 단계별 체크리스트

- [ ] 1. `ui/ClientPortal` 신설 (mounted two-pass + 타깃, closed-start 주석).
- [ ] 2. Modal → ClientPortal 래핑, typeof window·createPortal·getElementById 제거.
- [ ] 3. BottomSheet → 동일.
- [ ] 4. NoticeDrawer → `typeof window` 한 줄 제거.
- [ ] 5. CODEX_FIRST_PASS → verify-task → Chrome hydration 0 실측.
- [ ] 6. tech-debt portal hydration 항목 → resolved.

## Verification

- `node scripts/verify-task.mjs client-portal-hydration`
- Claude in Chrome: `/sermons/[id]` BottomSheet·Modal 열기 → 콘솔 hydration 경고 0, focus 정상.

---

## Codex 계획 검증

- **결론**: PASS — ClientPortal mounted two-pass(Modal·BottomSheet) + NoticeDrawer MINIMAL 채택. 대안 4종(suppressHydrationWarning·useSyncExternalStore·dynamic ssr:false·guard 제거) 기각 근거 확인.
- **현재 판단**: Codex가 focus-timing(initially-open일 때 panelRef가 null이라 focus가 skip되는 경로)을 검증 필수 항목으로 짚었다. EXPLORE에서 호출부 6곳이 전부 closed-start임을 확인해 해소했다. useDialog 수정은 필요 없다.
- **다음 행동**: WORK — step 1 ClientPortal부터.

## Codex 1차 검증

- **결론**: PASS — 5항목(ClientPortal SSR 안전·Modal/BottomSheet 동작 유지·NoticeDrawer 제거 안전·import/순환 무관·eslint-disable 정당) 모두 통과. blocker 0.
- **현재 판단**: closed-start라 open 시 focus trap 정상(initially-open만 보정 필요, 현재 없음). eslint-disable는 `useDrawerHistory.ts`·`ConfirmModal` 선례와 동일 규칙. Codex 권고 — NoticeDrawer `notice`가 SSR 시점 non-null이 될 변경이 생기면 `typeof window` 제거를 재검토(현재 `drawerNotice` 초기값 null이라 안전).
- **다음 행동**: Claude 2차(완료) → COMMIT.

## Claude 2차 검증

- **최종 판단**: PASS — verify-task(ESLint·stylelint·build) 통과 + Chrome 실측으로 hydration 경고 0·BottomSheet 동작 확인.
- **현재 판단**: `/sermons/2` 하드 리로드 시 콘솔 hydration mismatch 0(유일 메시지는 무관한 locatorjs 확장 로그). 공유 BottomSheet가 ClientPortal 통해 PC 중앙 모달로 정상 open(타이틀·옵션·백드롭·close). closed-start라 open 시점엔 mounted=true이고 panel이 존재해 focus가 정상 동작한다. ESLint `set-state-in-effect` 경고는 mount 게이트가 effect에서 state를 한 번 바꾸는 구조에서 나온다. 다른 방법으로는 못 없애므로 line-disable에 사유 주석을 붙여 뒀다(queueMicrotask 금지 규칙 준수).
- **다음 행동**: tech-debt portal hydration → resolved(머지 후), COMMIT 승인.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260615-150615 | ✅ | ✅ | ✅ | 0(기존 부채만) | Chrome `/sermons/2` hydration 0·BottomSheet open |

## 검증 이력

<details>
<summary>2026-06-15 Codex 트레이드오프 분석</summary>

- 판정: ClientPortal two-pass(Modal/BottomSheet) + NoticeDrawer MINIMAL 권장
- 이유: hydration contract 충족, 대안은 숨김·과추상·범위과대·SSR throw로 열위
- 조치: focus-timing은 호출부 closed-start 확인으로 해소

</details>

<details>
<summary>2026-06-15 Codex 1차 검증 1차 시도</summary>

- 판정: BLOCK (Codex 샌드박스 spawn 오류로 파일 미검증 — 환경 문제, 코드 무관)
- 이유: 실행 환경 오류라 5항목 모두 미검증
- 조치: 환경 복구 후 재시도 → 실파일 검증 PASS

</details>

## 후속 작업

- initially-open 다이얼로그가 필요해지면 useDialog focus를 portal mount 트리거로 재실행하도록 보정
  - 이유: ClientPortal 첫 패스가 null이라 그 시점 focus effect가 panel 부재로 skip.
  - 다음 기준: open=true로 mount하는 호출부가 생길 때.
  - 기록 위치: 없음 (본 plan 후속)
