# sermons-interaction-polish

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-16
- **브랜치**: feat/sermons-interaction-polish
- **Open questions**: none
- **ADR needed**: no

## 목표

Phase 7 인터랙션 잔여 마감: (7-1) 설교/시리즈 검색 입력 300ms 디바운스로 타이핑 중 자동 필터, (7-4) 캐러셀 방향키 스크롤 키보드 접근성. 기능 추가 아닌 인터랙션 완성도.

## 검증된 Assumptions

- `SermonSearchForm`·`SeriesSearchForm`은 구조 동일·submit(enter)만, 디바운스 없음. `setFilter`→`useSermon/SeriesFilter`가 `router.push`로 URL 갱신(이미 URL 동기화됨). (Read 확인)
- `Carousel` 트랙은 `role="region"`+`aria-label`은 있으나 `tabIndex`/`onKeyDown` 없음 — 방향키 스크롤 불가. 카드는 `<Link>`라 이미 탭 가능. 화살표 버튼은 `aria-label`·`disabled` 완비. (Read 확인)
- `scroll(dir)` 헬퍼 존재(`useCarousel`) — 키보드에서 재사용 가능. (Read 확인)
- **`src/hooks/useDebounce.ts` 존재**: `useDebounce<T>(value, delay=300)` 값-디바운스 훅(setTimeout 기반). 신설 불요, 재사용. (Read 확인)

## Success Criteria

- `/sermons/all`·`/sermons/series` 검색 입력 시 타이핑 멈춘 뒤 300ms에 URL `q` 갱신·결과 반영. enter는 즉시. clear는 즉시
- 디바운스 중 빠른 연속 입력은 마지막 1회만 push(중간 history 미적재)
- 캐러셀 트랙 포커스 시 ←/→ 키로 스크롤(`scroll(dir)` 재사용), 화살표 버튼·카드 탭 동작 무회귀
- verify-task PASS (tsc/lint/lint:styles/build 0 error)

## Non-goals (surgical scope)

- 8-2 공유 / 8-3 접근성 전반 점검 / 8-4 성능 점검 — 별도 task
- focus-ring 토큰 통일(기존 tech-debt) 미포함 — 카드는 기존 전역 focus 유지
- 캐러셀 드래그/모바일 스와이프 로직 변경 없음(키보드만 추가)

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonListPage/SermonSearchForm.tsx` — 디바운스
- `src/app/(content)/sermons/_component/SeriesListPage/SeriesSearchForm.tsx` — 디바운스
- `src/hooks/useDebounce.ts` — 기존 재사용(무변경)
- `src/components/ui/Carousel/Carousel.tsx` — 트랙 `tabIndex`+`onKeyDown`(←/→ → `scroll`)

## 단계별 체크리스트

- [ ] 1. 기존 `useDebounce` 재사용 — Sermon/Series SearchForm에 적용
- [ ] 2. URL↔input 동기화 피드백 루프 회피(debounced ≠ 현재 q일 때만 push), enter·clear 즉시 유지
- [ ] 3. Carousel 트랙 키보드(←/→ scroll, tabIndex, 무회귀)
- [ ] 4. verify-task + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-interaction-polish`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → DL-1~3 반영 후 WORK 진입 (3건 전부 expression-level, 재요청 불요)

> Item1: `debounced !== q`만으론 부족 — `debounced.trim()` 기준 비교해야 trailing whitespace 재-push 방지. rapid type→clear는 setInput('')가 타이머 정리해 루프 낮으나 중복 q:null push 기준 명시 필요. Enter 중 pending debounce가 같은 값 재-push 가능 → "immediate 후 trailing no-op" 조건 명시. 다른 필터로 effect 재실행돼도 normalized guard면 loop 차단. mount/StrictMode는 초기 debounced===q면 안전. Item2: track tabIndex=0 가능하나 자식 Link 이미 tab-focusable이라 중복 tab stop 리스크. keydown 버블링으로 자식 focus 중에도 발동 가능 → track 자신 focus 시에만 처리 guard 필요. drag/touch 무변경 범위 적절. Non-goals(focus-ring·공유·perf) 차단 양호.

**풀이**: 방향 PASS, CR 3건은 구현 디테일(비교 정규화·trailing no-op·keydown guard)이라 plan에 결정 박고 WORK. 재검증 불요.

## 의사결정 로그

- **DL-1 (CR①②)**: SearchForm no-op guard = `debounced.trim() === (q ?? '')`이면 push 생략. trailing whitespace·동일값 재-push·Enter 후 trailing debounce 재발 모두 이 정규화 guard 1개로 해소(중복 q:null도 q===''이면 skip). enter(submit)·clear는 guard 무관 즉시 `setFilter`.
- **DL-2 (CR②)**: Enter 즉시 push 후 pending debounce가 같은 값으로 trailing 실행돼도 그 시점 `debounced.trim() === q`라 no-op skip → 별도 타이머 취소 로직 불요(useDebounce 내부 cleanup + guard로 충분).
- **DL-3 (CR③)**: Carousel `onKeyDown`에 `if (e.currentTarget !== e.target) return;` guard — 트랙 자신 focus 시에만 ←/→ 처리, 자식 Link/미래 interactive child focus 중 버블링 hijack 방지. `tabIndex={0}`는 키보드 스크롤 진입점으로 유지(중복 tab stop은 region 표준 패턴이라 수용, 카드 탭 무회귀).
- **DL-4 (사용자 지시 — useCarousel 서술적 네이밍)**: 약어 회피 요구. `useCarousel` API·내부 변수 일괄 개명 — `ref→trackRef`, `scroll→scrollByDirection`, `canL→canScrollLeft`, `canR→canScrollRight`, `dir→direction`, `el→track`, `dx→dragDeltaX`, `drag→dragState`, `update→updateScrollBounds`, 핸들러 `e→event`. `UseCarouselReturn`·`CarouselArrows` props·소비처 2곳(`SermonRecentCarousel`·`SermonSeriesCarousel`) 동기 갱신. 순수 rename(동작·구조 무변경)이라 ADR 불필요·Codex 재검불요, verify `20260516-193720` PASS로 타입 정합 확인. 별도 커밋(Refactor).
- **ADR 판단**: 불필요 — 7-1/7-4 인터랙션 + useCarousel rename 모두 동작·레이어·캐시·라이브러리 무변경. `start-adr` 미실행.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (item1 BUG) → 직접 수정 후 PASS. item2(Carousel) PASS.

> (a)(b)(e) BUG: `debounced.trim()===q.trim()` guard는 mount/StrictMode는 막으나, Enter/clear가 즉시 URL 변경 → `q`·`setFilter`(sp 의존) 변경으로 effect 재실행 시 그 시점 `debounced`가 아직 stale(이전 값)이라 이전 검색어를 재-push. clear 후 "abc" 재적용 등 실동작 버그. 최소수정: `debounced`가 현재 `input`과 일치할 때만 push(또는 ref). (c) Carousel PASS — `e.currentTarget!==e.target` guard로 트랙 자신 focus만 ←/→ 처리, tabIndex=0 region 수용·자식 탭 hijack 없음, edge 조건부 preventDefault 불요. (d) PASS — drag/clickGuard/scroll 버튼 무회귀(가산 keyboard만).

**풀이**: 캐러셀 PASS. 디바운스는 stale debounced 재-push 경쟁조건 실버그 — Codex 제안대로 `if (debounced !== input) return;`(디바운스 정착 시에만 push) guard 추가로 정정.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- **BUG fix 적용·검증**: 양 SearchForm effect에 `if (debounced !== input) return;` 선행 guard + deps에 `input` 추가. 트레이스 — type→push→q갱신→setInput(동일)→effect: debounced!==input? 정착 후 동일→통과, 정규화 guard로 종료. clear: setInput('')→input='', debounced='abc'≠input→skip; setFilter(null)→q='', effect 재실행 debounced('abc')≠input('')→skip; 300ms 후 debounced=''=input, ''.trim()===q.trim()('')→skip(중복 없음). Enter(stale): handleSubmit push→q='abc def'; effect debounced('abc')≠input('abc def')→skip(stale 재-push 차단); 정착 후 debounced===input, trim===q→skip. 전 케이스 stale/중복/loop 차단 확인. verify `20260516-193102` PASS.
- Carousel: `Carousel.tsx` `e.currentTarget!==e.target` + `tabIndex=0`/`onKeyDown` 가산, `scroll` 재사용, drag/click 핸들러 위치 무변경 — Codex (c)(d) PASS와 일치 교차 확인.
- Non-goal(share/perf/focus-ring) 무누수.

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시
-->

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
