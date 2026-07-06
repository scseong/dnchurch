# remove-queue-microtask

- **상태**: ✅ 완료 (2026-06-21)
- **시작일**: 2026-06-19
- **브랜치**: refactor/remove-queue-microtask
- **Open questions**: none
- **ADR needed**: no — 4개 파일 모두 hooks/components라 ADR_TRIGGER_PARTS 아님. 아래 ## ADR 판단 참조.

## 목표

금지 규칙(`feedback_no_queue_microtask`)을 어긴 `queueMicrotask` 4건을 제거한다. 이들은 effect 안 setState를 microtask로 미뤄 `react-hooks/set-state-in-effect` 경고만 끈다. 연쇄 재렌더는 그대로 남는다. 사이트별로 올바른 React 패턴(useSyncExternalStore 또는 렌더 중 prev-state 보정)으로 바꿔 경고와 연쇄를 함께 없앤다.

## 검증된 Assumptions

- 실제 `queueMicrotask` 호출은 4건이다 — `grep -rn "queueMicrotask" src`. 나머지 2건(`useSearchSync.ts:14`·`ClientPortal.tsx:22`)은 주석이라 대상 아님.
- `useMediaQuery.ts:10`은 effect 안에서 `queueMicrotask(() => setMatches(mediaQuery.matches))`로 초기값을 동기화하고, `change` 리스너로 갱신한다 — Read 확인. matchMedia(브라우저 미디어쿼리 API)는 외부 스토어다.
- `useMediaQuery` 소비처는 admin 2곳뿐(`SermonListPage/index.tsx:53`·`parts/FilterDropdown.tsx:26`), 둘 다 `useMediaQuery('(min-width: 1024px)')`로 `isDesktop` boolean을 받는다 — Grep 확인. 계약(boolean·SSR false·뷰포트 변경 시 갱신)을 보존하면 소비처는 안 바뀐다.
- `useListFilters.ts:27`은 `searchParams` 변경 시 URL→state 동기화, `DesktopHeader.tsx:21`은 `pathname` 변경 시 메뉴 닫기, `NoticeControlBar.tsx:27`은 `currentSearch` prop→`query` state 동기화 — 셋 다 "외부 값 변경 → state 보정"이라 React 표준 "렌더 중 prev-state 보정" 대상이다. Read 확인.
- `useSearchSync.ts`에 같은 "렌더 중 prev-state 보정"(`if (search !== prevSearch) { setPrevSearch(search); ... }`)이 이미 적용된 선례다 — Read 확인 (refactor-dedup-cleanup D3).

## Success Criteria

- `grep -rn "queueMicrotask" src`가 주석 2건만 남고 호출 0건.
- `useMediaQuery`가 `useSyncExternalStore`로 바뀌고, admin 2 소비처의 `isDesktop` 동작(데스크톱에서 true, 모바일 false, 리사이즈 시 전환)이 그대로다.
- 나머지 3건이 effect 없이 렌더 중 보정으로 같은 동기화를 한다. 무한 setState 루프 없음(`prevX` 가드로 조건이 한 번 뒤 false).
- `verify-task` ESLint(`react-hooks/set-state-in-effect` 신규 0)·build 통과, 신규 회귀 0.

## 영향받는 파일

- `src/hooks/useMediaQuery.ts` — useSyncExternalStore 전환
- `src/components/admin/sermons/SermonListPage/hooks/useListFilters.ts` — URL→state 렌더 중 보정
- `src/components/layout/Header/DesktopHeader.tsx` — pathname→메뉴 닫기 렌더 중 보정
- `src/app/(content)/news/notices/_component/NoticeControlBar.tsx` — currentSearch→query 렌더 중 보정

## Non-goals

- 동작을 바꾸지 않는다 — 같은 동기화를 다른 메커니즘으로 한다.
- `useSearchSync.ts`·`ClientPortal.tsx`의 주석은 손대지 않는다(주석 속 "queueMicrotask" 단어는 설명용).
- 4개 사이트의 인접 로직(라우팅·디바운스·필터 파싱)은 그대로 둔다.

## 단계별 체크리스트

- [x] 1. `useMediaQuery.ts` → `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot=()=>false)`
- [x] 2. `useListFilters.ts` → effect 1(URL→state)을 렌더 중 `if (search !== prevSearch)` 보정으로 교체. effect 2(state→URL)는 유지
- [x] 3. `DesktopHeader.tsx` → effect를 렌더 중 `if (pathname !== prevPathname)` 보정으로 교체
- [x] 4. `NoticeControlBar.tsx` → effect를 렌더 중 `if (currentSearch !== prevSearch)` 보정으로 교체
- [ ] 5. VERIFY(✅ 20260619-221353) → COMMIT(승인 후) → PR(develop)

## Verification

- `node scripts/verify-task.mjs remove-queue-microtask`

## ADR 판단

- **필요 여부**: 불필요
- **사유**: 4개 파일 모두 `src/hooks/`·`src/components/`라 ADR_TRIGGER_PARTS(apis/services/actions/lib·config·scripts 등)에 없다. 공유 훅 `useMediaQuery`를 바꾸지만 boolean 계약을 보존해 소비처·데이터 흐름·레이어가 안 바뀐다. 영구 결정이 아니라 금지 규칙 준수 리팩터다.

## 의사결정 로그

- **D1 — 사이트별로 다른 패턴을 쓴다 (한 가지로 통일하지 않는다)**
  - 문제: 4건이 표면상 같은 "effect 안 setState"이지만 의미가 다르다. 하나(matchMedia)는 외부 스토어 구독이고, 셋은 외부 값 변경에 따른 state 보정이다.
  - 해결: matchMedia는 `useSyncExternalStore`로 바꾼다 — React가 외부 스토어 구독에 권장하는 API라 effect·setState 자체가 사라진다. 나머지 셋은 "렌더 중 prev-state 보정"으로 바꾼다 — 이미 `useSearchSync`에 적용된 검증된 패턴이고, 외부 값이 바뀔 때만 한 번 보정해 연쇄 재렌더가 없다. 한 패턴으로 억지로 통일하면 matchMedia에는 과하고 보정 셋에는 안 맞는다.
  - 결과: 4건 모두 effect 안 setState가 사라져 금지 규칙과 `set-state-in-effect` 경고를 함께 없앤다. 소비처가 받는 값과 갱신 시점은 그대로다 — admin `isDesktop` boolean·뷰포트 변경 시 전환·SSR false.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: Claude 직접 검증 대체 — PASS (신뢰도 high, 2026-06-19). Codex BLOCK은 도구 실패라 계획 반려가 아니다.
- **현재 판단**: 5체크 통과, material 위험 0. `getSnapshot`이 boolean을 반환해 무한루프가 없고 `getServerSnapshot=() => false`가 현재 초기값과 같아 하이드레이션이 맞는다. 렌더 중 보정 3건은 `prevX` 가드로 한 번 뒤 조건이 false다. `useListFilters` 양방향 동기화는 `searchParams.toString()`(문자열) 비교로 객체 참조가 매 렌더 바뀌는 문제를 피하고, state→URL→state 왕복 가드가 현재 effect 버전과 같아 새 루프가 없다. 사이트별 전략은 D1 참조.
- **Codex 상태**: BLOCK. Codex stdout 없음 — Windows 샌드박스 spawn setup refresh 실패로 파일을 0건 읽었다(`project_codex_windows_unavailable`).
- **다음 행동**: WORK.

## Codex 1차 검증

- **결론**: Claude 직접 검증 대체 — Codex 1차 미수행. 계획 검증과 같은 Windows 샌드박스 초기화 오류로 파일을 못 읽는다(`project_codex_windows_unavailable`). 정책대로 Claude 2차 검증으로 통합한다.
- **다음 행동**: Claude 2차 검증.

## Claude 2차 검증

- **최종 판단**: PASS. 신규 회귀 0, 커밋 가능.
- **현재 판단**: diff를 직접 읽어 4건 모두 task에 귀속됨을 확인했다 — 인접 정리·포맷 없음. `useEffect` import는 unused가 된 2곳(`DesktopHeader`·`NoticeControlBar`)만 제거하고, `useListFilters` effect 2(state→URL)는 그대로 뒀다. `grep -rn "queueMicrotask" src` → 실제 호출 0건(주석 2건만).
- **검증 결과** (lint✅ = `set-state-in-effect` 신규 0, build✅ = `useSyncExternalStore` 타입·React Compiler 호환):

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260619-221353 | ✅ | ✅ | ✅ | 0 | admin 데스크톱/모바일 전환·뒤로가기 필터 복원(실기기 권장) |

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

- `useMediaQuery`의 `MediaQueryList`를 `useMemo`로 메모이즈
  - 이유: PR #131에서 Gemini가 제안했으나, 소비처 admin 2곳·고정 쿼리 1개라 `matchMedia` 반복 호출이 병목이라는 근거가 측정으로 없었다. Codex 교차 검증도 범위 밖 성능 지적이라 받지 않기로 했다(REJECT).
  - 다음 기준: 소비처가 늘거나 프로파일링에서 `matchMedia`가 잡힐 때.
  - 기록 위치: 없음 (측정 전까지 부채로 올리지 않음)

## 회고

- **잘된 것**: queueMicrotask 4건을 사이트별 올바른 패턴으로 바꿨다. `useMediaQuery`는 `useSyncExternalStore`로, 나머지 셋은 렌더 중 prev-state 보정으로 옮겨 금지 규칙 위반과 `set-state-in-effect` 경고를 함께 없앴다. Codex가 Windows 샌드박스 오류로 계획·1차 검증을 못 했을 때 Claude 직접 검증으로 대체해 막히지 않고 진행했다. PR #131에서 Gemini가 낸 성능 제안은 코드를 직접 확인하고 Codex로 교차 검증해 범위 밖임을 확인했다. 근거를 남기고 기각했다.
- **다음에 할 것**: `useMediaQuery` 메모이즈는 위 후속 작업으로 분리했다.
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: 없다. 4건 모두 PR #131에서 닫았다. 신규 부채 0.

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

