# mypage-settings-sheet

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-18
- **브랜치**: feat/my-page
- **Open questions**: none
- **ADR needed**: no

## 목표

마이페이지 톱니(⚙)가 여는 설정 BottomSheet를 새로 만든다. 시안 구조(알림·일반·계정·앱 버전)를 화면으로 재현하되, 구동할 인프라가 없는 항목(리마인더·알림·번역본)은 "준비 중"으로 표시하고, 실제로 동작하는 것(로그아웃·계정으로 스크롤)만 연결한다. DB·스키마 변경은 없다.

## 검증된 Assumptions

- 알림·리마인더·번역본을 읽어 동작하는 코드 없음 — `rg`로 reminder·notification·push·translation·개역개정 소비처 0건. 확인: grep.
- 톱니는 `MobileHeader.tsx:78-90`에서 `headerAction==='settings'`일 때 `#mypage-account`로 스크롤만 함. 확인: Read.
- `Header/ShareSheet.tsx` 형제 패턴 존재 — `BottomSheet` + `{open,onClose}` 클라이언트 컴포넌트. 확인: Read.
- Switch/Toggle 공용 UI 컴포넌트 없음 → 비기능 항목은 기존 "준비 중" Label 패턴(AccountMenu)으로 표시. 확인: `ls src/components/ui`.
- `signOutAction` 존재(`src/actions/auth.action.ts:74`), AccountMenu가 이미 소비. 확인: grep.
- 앱 버전 `0.7.0`(`package.json`). 고객센터 전용 라우트 없음(privacy-policy만) → "준비 중". 확인.

## Non-goals

- 알림·리마인더·번역본 값 저장 — 쓰는 곳이 없어 죽은 코드. `bible_reading_settings` 컬럼 추가 안 함 (사용자: UI만).
- 실제 토글 스위치 컴포넌트 신설 — 비기능 항목은 "준비 중" Label로 표시.
- 부서/속회(Phase 3)·prior-read(Phase 4).
- 하단 탭바·모바일 헤더 구조 변경 — 이미 전역에 있음(`BottomNav`·`MobileHeader`).

## Success Criteria

- 마이페이지에서 톱니(⚙)를 누르면 설정 BottomSheet가 열린다 (기존 스크롤 대신) (yes/no).
- 시트에 알림·일반·계정 섹션과 "대구동남교회 앱 버전 0.7.0"이 시안 순서대로 렌더 (yes/no).
- 리마인더·댓글·나눔 알림·주간 리포트·읽기 알림 시간·번역본은 "준비 중" Label + `disabled`(클릭 불가·`aria-disabled`), no-op이 아니라 비활성 (yes/no).
- 로그아웃은 공유 훅 `useSignOut`으로 실행(AccountMenu와 같은 경로), 계정 관리는 시트를 닫고 `#mypage-account`로 스크롤 (yes/no).
- 톱니는 `/mypage`에서만 시트를 연다 — 시트가 mypage에 마운트돼 다른 route엔 애초에 없음 (yes/no).
- semantic 토큰만, `yarn lint:styles` 통과, `verify-task` 신규 회귀 0 (yes/no).

## 영향받는 파일

- `src/store/settingsSheet.store.ts` — 신규 zustand store(`open`/`setOpen`). 전역 톱니↔mypage 시트 브리지 (`toast.store` 패턴)
- `src/app/(content)/mypage/_component/SettingsSheet.tsx` — 신규 설정 시트 (mypage 소유)
- `src/app/(content)/mypage/_component/useSignOut.ts` — 신규 공유 로그아웃 훅 (AccountMenu·시트 공용)
- `src/app/(content)/mypage/_component/AccountMenu.tsx` — 로그아웃을 훅으로 교체, `<SettingsSheet>` 마운트
- `src/app/(content)/mypage/_component/mypage.module.scss` — 설정 시트 스타일 (신규 scss 대신 기존 모듈에 통합)
- `src/components/layout/Header/MobileHeader.tsx` — 톱니 onClick을 store `setOpen(true)`로 (스크롤 대체)

## 단계별 체크리스트

- [x] 1. `settingsSheet.store.ts` — zustand `{ open, setOpen }` (toast.store 패턴)
- [x] 2. `useSignOut.ts` — 로그아웃 흐름을 훅으로. AccountMenu의 인라인 로그아웃을 이 훅으로 교체(useTransition·signOutAction·error 제거)
- [x] 3. `SettingsSheet` — `BottomSheet` + 섹션(알림/일반/계정) + 앱 버전 0.7.0. 비기능 5항목=`disabled`+"준비 중", 로그아웃=`useSignOut`, 계정관리=닫고 240ms 뒤 `#mypage-account` 스크롤(useScrollLock 복원 이후). store `open` 구독
- [x] 4. `AccountMenu` — `<SettingsSheet>` 마운트 + 로그아웃 훅 사용
- [x] 5. `MobileHeader` — 톱니 onClick을 store `setOpen(true)`로 (스크롤 대체), aria-haspopup/expanded 추가
- [x] 6. `mypage.module.scss` — `.settings`·`.settings_version`, menu_* 재사용, semantic 토큰
- [~] 7. VERIFY — tsc/eslint/stylelint 통과 + 라이브 localhost:3000 확인(톱니→시트, 5항목 disabled=true, 계정관리 스크롤 scrollY 0→796). 전체 verify-task는 커밋 전

## ADR 판단

**ADR needed**: no — `src/components/layout/`만 변경. `ADR_TRIGGER_PARTS`(apis/services/actions/lib/supabase·config·CLAUDE.md 등)에 해당 없음.

## Verification

- `node scripts/verify-task.mjs mypage-settings-sheet`
- `yarn lint:styles`
- 라이브 `localhost:3000/mypage` — 톱니 눌러 시트 열림·섹션·준비중·로그아웃·계정 스크롤 확인

## 의사결정 로그

- **D1 — 설정 시트를 mypage가 소유하고, 전역 톱니와는 store로 잇는다**
  - 문제: 톱니는 전역 `MobileHeader`에 있고 시트는 마이페이지 전용이다. 그런데 `Header`와 페이지는 `ContentLayout`에서 형제로 렌더돼 props로 상태를 넘길 수 없다. 시트를 `Header/`에 두면 모든 `(content)` 페이지에 얹혀 file-structure 규칙을 어긴다.
  - 해결: 시트를 `mypage/_component/`에 두고, `settingsSheet.store`(zustand)로 열림 상태만 공유한다. 톱니가 `setOpen(true)`, 시트가 `open`을 구독한다. DOM 이벤트·context 대신 store를 쓰는 이유는 이 저장소가 이미 `toast.store` 등 zustand로 교차 컴포넌트 상태를 다루기 때문이다.
  - 결과: 시트 소유권이 mypage에 있어 다른 route엔 마운트되지 않고, 톱니는 전역 위치를 유지한다.
- **D2 — 로그아웃을 공유 훅 하나로 모은다**
  - 문제: `AccountMenu`에 이미 `signOutAction`+리다이렉트+에러 toast가 완결돼 있다. 시트가 같은 처리를 또 구현하면 두 경로가 갈라져 나중에 한쪽만 고치면 서로 어긋난다.
  - 해결: `useSignOut` 훅으로 그 흐름을 옮기고 AccountMenu·시트가 함께 쓴다. 대안(시트에서 액션 재구현)은 두 경로가 어긋나 기각했다.
  - 결과: 로그아웃 처리가 한 곳에 모여 두 진입점이 항상 같게 동작한다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 조치 후 WORK 진입
- **현재 판단**: material 3건 타당. 배치 위반·로그아웃 경로가 둘로 갈라짐·disabled 기준 누락을 아래처럼 조치.
- **다음 행동**: 수정한 접근(store 브리지·공유 훅·disabled)으로 WORK

Codex 지적 요지:
- (a) material — 마이페이지 전용 시트를 전역 `Header/`에 두면 `ContentLayout`(`src/app/(content)/layout.tsx:26`)이 모든 페이지에서 렌더하는 `Header`에 묶임. file-structure 규칙은 한 페이지 전용을 `app/[route]/_component/`에 두라 함. → 시트를 `mypage/_component/`로 옮기고, 전역 톱니는 store로 open 상태만 넘김.
- (b) material — `AccountMenu.handleSignOut`(`AccountMenu.tsx:18-23`)가 이미 `signOutAction`+`window.location.replace('/')`+에러 toast를 완결. 시트가 따로 구현하면 클라이언트 로그아웃 경로가 2개로 갈라짐. → 공유 훅으로 묶어 AccountMenu·시트가 같은 경로 사용.
- (c) material — 비기능 항목 SC가 "저장 없음"까지만 규정해 클릭 가능한 no-op을 허용. → `disabled`/`aria-disabled`(클릭 가능/불가 둘 중 하나) 기준 추가.
- expression-only 1건 — grep 근거를 실행 가능한 패턴으로 바꿈(반영).

풀이: 시트 소유권을 mypage로 옮기고(store가 헤더↔페이지 형제 사이를 잇는다), 로그아웃을 공유 훅 하나로 모으고, 비기능 항목을 disabled로 두면 3건 해소.

## Codex 1차 검증

- **결론**: PASS_WITH_NITS (confidence high)
- **현재 판단**: 차단 없음. 레이어 위반·타입·외과적 변경 문제 없음, SCSS 토큰 정상. nit 2건 중 unmount 잔존은 반영, 타이밍 계약은 주석으로 남김.
- **다음 행동**: verify-task 후 `## Claude 2차 검증` 기록, 사용자 승인 후 커밋

Codex 지적 요지:
- nit1 — `SettingsSheet.tsx`의 `SHEET_CLOSE_MS=240`은 `BottomSheet` 전환 0.22s(`BottomSheet.module.scss:10,33`)에 맞춘 우회. `useScrollLock` cleanup이 `open=false`에서 즉시 `scrollTo`(`useScrollLock.tsx:36`)라 지금은 동작하나, 전환 시간·reduced-motion·effect 지연에는 계약이 없음 → `BottomSheet`에 `onAfterClose` 콜백이 더 견고.
- nit2 — 시트가 열린 채 `/mypage` 이탈로 `SettingsSheet` unmount 시 global `open=true`가 잔존, 복귀 시 즉시 재열림 가능 → unmount cleanup에서 `setOpen(false)`.
- 레이어: `useSignOut`의 app→actions import는 `apis→services→actions→app` 방향상 허용. 위반 없음.
- 외과적: AccountMenu에서 뺀 `useTransition`·`signOutAction`·`error`에 dangling 참조 없음(`rg` 확인).

풀이: nit2(unmount 잔존)는 `useEffect(()=>()=>setOpen(false),[setOpen])`로 반영. nit1(타이밍)은 공유 `BottomSheet`에 콜백을 더하는 게 정석이나 이번 범위 밖이라 주석으로 남기고 후속으로 둔다.

## Claude 2차 검증

- **최종 판단**: 통과 — 필수 4단계 중 3개 통과, Knip 경고는 기존 부채
- **현재 판단**: `verify-task` 결과 ESLint·stylelint·Build 통과. Knip 경고는 전부 기존 부채로, 신규 파일(settingsSheet.store·useSignOut·SettingsSheet) 언급 0건 — `grep`으로 확인. 라이브에서 톱니→시트·disabled·계정 관리 스크롤도 확인.
- **다음 행동**: doc-editor 점검 후 사용자 승인 받아 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260719-002839 | ✅ | ✅ | ✅ | 0 | 없음 (라이브 시각 대조 완료) |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

