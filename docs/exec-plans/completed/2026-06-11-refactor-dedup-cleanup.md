# refactor-dedup-cleanup

- **상태**: ✅ 완료 (2026-06-11)
- **시작일**: 2026-06-11
- **브랜치**: refactor/dedup-cleanup
- **Open questions**: none
- **ADR needed**: no — 동작 보존 리팩토링만 있다. services 내부 mapper 추출이라 공개 API·데이터 흐름·인증/캐시 정책이 바뀌지 않는다

## 목표

사용자에게 보이는 동작은 그대로 두고 중복 코드와 dead code를 줄인다.

- 중복 묶기: sermon count 집계 4중 복제, bulletin 쿼리 중복, admin 페이지네이션 계산 분산을 공용 코드로 모은다.
- 책임 나누기: 234줄 `SermonListPage`와 174줄 `SermonMetaActions`를 hook으로 분리한다.

## 검증된 Assumptions

- `apis/announcement.ts`는 dead code — `getAnnouncement`·`AnnouncementWithProfile` import가 자기 파일 외 0건 (`grep -rn "getAnnouncement|AnnouncementWithProfile" src` 직접 실행)
- sermon count 집계가 4곳 복제 — `sermon-service.ts:120-139`(allSeries)·`207-226`(allPreachers) vs `admin.ts:36-55`·`58-77`. 차이는 `!inner` 유무 + `is_active` 필터 + 클라이언트 생성 방식 3가지 (두 파일 직접 Read)
- `database.types.ts` 최신 — 원격 dev 마지막 마이그레이션 `20260511(drop_bulletin_images_url_and_truncate)`, 타입 파일 마지막 커밋 2026-05-11 같은 날 (`list_migrations` 호출 + `git log`)
- `any` 사용 3건 중 수정 대상은 `apis/cloudinary.ts:52` `catch (error: any)` 1건뿐 — `global.d.ts`(외부 SDK)·`handle-response.ts`(제네릭 constraint)는 정당 (`rg` 전수 조사)
- 공용 `usePagination`+`Pagination` 존재, admin sermons만 독자 구현 — `Math.ceil(total/pageSize)` window 계산이 `SermonListPage/parts/Pagination.tsx:25-33` 등 4곳 (explorer 조사, 5단계 시작 시 재확인)

## Success Criteria

- `tsc --noEmit` 0 에러, `yarn build` 성공 (커밋 단위마다)
- `yarn knip`에서 `apis/announcement.ts` 관련 항목 소멸, 신규 미사용 항목 0건
- count map 집계 블록이 mapper 1곳에만 존재 (`rg "sermon_count: sermons" src` 1건)
- 공개 설교 목록·admin 설교 목록·주보 목록 페이지가 리팩토링 전과 같은 데이터를 렌더 (dev 서버 수동 확인)
- admin 설교 목록 0건 상태에서 `페이지당` select와 시작–끝 항목 범위 표시가 리팩토링 전과 같이 렌더된다 (공용 Pagination은 `totalPages<=1`이면 null 반환 — 교체 금지 근거)
- `catch (error: any)` 0건 (`rg "error: any" src` 0건)

## 영향받는 파일

- 삭제: `src/apis/announcement.ts`
- `src/apis/cloudinary.ts`
- `src/services/sermon/sermon-service.ts`, `src/services/sermon/admin.ts`
- `src/services/bulletin/bulletin-service.ts`
- `src/components/admin/sermons/SermonListPage/` (index.tsx, parts/Pagination.tsx, parts/MobileCardList.tsx, hooks/ 신규)
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonMetaActions.tsx` (+ hook 신규)

## 단계별 체크리스트

한 단계 = 한 커밋. 각 단계 완료 시 `tsc --noEmit` → 변경 요약 보고 → 사용자 승인 → 커밋.

- [x] 1. `Refactor: 미사용 announcement API 삭제` — 파일 삭제, knip으로 잔여 참조 확인 (e49eb2d)
- [x] 2. `Refactor: cloudinary catch any를 unknown으로 교체` — bare catch + raw error 로그로 단순화 (2346e8f)
- [x] 3. `Refactor: sermon count 집계 mapper 추출` — 4곳에서 글자 그대로 반복되는 `rows.map` 집계 블록만 공용 mapper 1개로 모은다. 쿼리 함수 4개는 정렬·필터·클라이언트가 서로 달라 그대로 둔다 (913f9e2, Codex 1차 PASS)
- [x] 4. `Refactor: bulletin list/summary 쿼리 중복 통합` — 공통 쿼리 빌더 추출 (`bulletin-service.ts:14-30`·`53-79`) (05d1687, Codex 1차 PASS)
- [x] 5. `Refactor: admin sermons 페이지네이션 계산 유틸 추출` — `Math.ceil` window 계산만 유틸로 모은다. admin Pagination 컴포넌트는 공용으로 교체하지 않는다 (079b3b4, Codex 1차 PASS)
- [x] 6. `Refactor: SermonListPage 검색 동기화 hook 추출` — 디바운스 useEffect 2개와 ref를 별도 hook으로 분리 (daeb7d7, Codex 1차 PASS)
- [x] 7. `Refactor: SermonMetaActions 북마크·공유 hook 분리` — localStorage 북마크 / 공유 4종 각각 hook으로 (f827bd9, Codex 1차 PASS)
- [x] 8. `Refactor: useSearchSync queueMicrotask 제거` — 이벤트 핸들러 디바운스 + 렌더 중 prev-state 보정으로 재설계 (692dd58, 사용자 요청으로 범위 추가, Codex 설계 CR 반영 + 1차 PASS)
- [x] 9. `Fix: 전체 초기화 시 대기 중인 검색 디바운스 타이머 취소` — PR #114 Codex 봇 리뷰 중간 심각도(P2) 항목 반영. search prop이 ''→''로 안 바뀌는 clear-all 경로에서 타이머가 살아남는 경쟁 차단 — 원본 코드에도 있던 기존 버그 (5454e9d)
- [x] 10. `Fix: getTotalPages pageSize 0 이하 방어` — PR #114 Gemini 리뷰 반영. `.gemini/styleguide.md` 범위 검사 정책 준수 (e496577)

## Non-goals

- Carousel.tsx hook 파일 분리 — 응집 양호, 효과 대비 회귀 위험
- BoardBody·LatestBulletinImages 서버 컴포넌트 전환 — 사용처가 client 트리인지 미확인
- `SeriesEpisodeList.formatShortDate` 공용화 — 포맷 토큰이 달라 실익 낮음
- admin `SermonEmptyState` 공용 EmptyState 통합 — 필터 clear·생성 버튼 액션이 달라 의도적 분기
- admin `Pagination` 컴포넌트를 공용 `ui/Pagination`으로 교체 — admin에는 처음/끝 버튼·페이지당 select·항목 범위 표시가 있고, 공용은 `totalPages<=1`이면 null을 반환해 user-visible 차이가 생긴다
- 동작·스타일·마크업은 바꾸지 않는다 — 리팩토링 전후 렌더 결과가 같아야 한다

## Verification

- 단계마다: `npx tsc --noEmit`
- 커밋 전: `node scripts/verify-task.mjs refactor-dedup-cleanup` (lint·stylelint·build·knip)
- 3·5단계는 dev 서버에서 공개/admin 설교 목록, 주보 목록 수동 확인

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high)
- **현재 판단**: material 3건을 모두 plan에 반영했다 — 3단계를 mapper 추출로 축소, 5단계를 계산 유틸 추출로 축소, ADR inline 사유 추가. BLOCK이 아니므로 재검증 없이 WORK 진입 가능
- **다음 행동**: 사용자 승인 후 1단계부터 구현

Codex 지적 (요지 verbatim):

1. "1개 option-heavy helper보다 예: `series`/`preachers` thin wrapper 2개 + `sermon_count` row mapper 1개로 계획을 바꾸는 편이 안전합니다" — series는 `started_at`과 `sort_order`로, preachers는 `sort_order`와 `name`으로 정렬이 달라 파라미터 헬퍼 1개는 과추상화다. 3단계를 map 집계 블록만 추출하는 mapper로 바꿨다.
2. "admin 0건 상태에서 `0–0 / 전체 0개`와 page size select가 사라질 수 있으므로 user-visible 기준으로 must-CR" — 공용 `ui/Pagination`은 `totalPages<=1`이면 null 반환(`Pagination.tsx:40`), admin은 0건에도 범위 표시·select를 렌더한다. → 5단계를 계산 유틸 추출로 한정하고 컴포넌트 교체를 Non-goals에 올렸다.
3. "`src/apis/`, `src/services/` 변경이 `ADR_TRIGGER_PARTS`에 걸리며 bare `no`만 있으면 `harness-gate`가 차단" — → 헤더 `ADR needed`에 inline 사유를 붙였다.

## 의사결정 로그

- **D1 — sermon count 통합은 mapper 추출만, 파라미터 헬퍼는 기각**
  - 문제: 4개 쿼리 함수의 진짜 공통부는 `rows.map` 집계 블록뿐이고, 정렬·필터·클라이언트는 함수마다 다르다.
  - 해결: `!inner`·`is_active`·클라이언트를 옵션으로 받는 헬퍼 1개 안을 기각하고 map 블록만 mapper로 추출한다 — 옵션 3개짜리 헬퍼는 CLAUDE.md "추측성 추상화 금지"에 걸리고 호출부 가독성도 떨어진다.
  - 결과: 쿼리 함수 4개는 각자 명시적으로 남고, 중복은 집계 블록 1곳으로 줄어든다.
- **D2 — admin 페이지네이션은 계산 유틸만 공용화, 컴포넌트 교체 기각**
  - 문제: 공용 `ui/Pagination`은 `totalPages<=1`이면 null을 반환해 admin의 0건 상태 표시(항목 범위·페이지당 select)가 사라진다.
  - 해결: 컴포넌트 교체 대신 `Math.ceil` window 계산만 유틸로 추출한다 — 동작 보존이 이번 작업의 절대 조건이라서다.
  - 결과: 계산 중복은 사라지고 admin UI는 그대로 남는다.
- **D3 — useSearchSync의 queueMicrotask는 우회 제거가 아니라 effect 자체를 없애는 재설계로 푼다**
  - 문제: 커밋 0e8fd31이 `react-hooks/set-state-in-effect` lint를 통과시키려고 setState를 `queueMicrotask`로 감쌌다. 경고만 꺼지고 연쇄 재렌더는 남았고, 상태 갱신 시점도 코드에 안 드러난 채 마이크로태스크 큐로 미뤄졌으며, 이후 queueMicrotask가 사용자 규칙으로 전면 금지됐다.
  - 해결: eslint-disable 주석(우회를 우회로 교체)과 렌더 중 ref 읽기/쓰기(StrictMode 재실행에서 깨짐)를 기각하고, 동기화 effect 2개를 모두 없애는 구조를 택했다 — 입력은 `draft ?? search`로 파생하고, 디바운스는 이벤트 핸들러의 setTimeout으로 옮기고, 외부 변경은 공식 prev-state 패턴으로 렌더 중에 보정한다. Codex 설계 검증이 잡은 stale 타이머 버그(외부 변경 채택 후 남은 타이머가 옛 검색어를 재전송)는 `draft === null` guard를 단 타이머 취소 `useLayoutEffect`로 막았다.
  - 결과: queueMicrotask와 effect 안 setState가 모두 사라졌고, eslint `--max-warnings=0` 통과. 잔여 4곳은 tech-debt로 등록했다.

## Codex 1차 검증

- **결론**: PASS (confidence: high) — 3·4·5·6·7단계 diff 각각 검증 (2026-06-11)
- **현재 판단**: 다섯 diff 모두 발견 사항 없음 — 단계별 핵심 쟁점(캐스트 동등성, 산식 인자 순서, stale closure, client 모듈 그래프)까지 확인했다. 외과적 범위 위반도 없었다
- **다음 행동**: 전체 verify-task 후 Claude 2차 검증 기록

4단계 Codex 결과 (verbatim):

> `listQuery`는 기존 `list()`와 `summary()`의 `select('*, bulletin_images(*)', { count: 'exact' })`, `deleted_at` 필터, `year` 범위 필터, `sunday_date desc` 정렬, `from = (page - 1) * limit`, `to = from + limit - 1` 산식을 그대로 보존합니다. `Promise.all`에서도 첫 번째 요소 평가 시 `listQuery(supabase, params)`가 즉시 query builder를 생성하고 `range`까지 적용하므로 기존 `itemsQuery.range(from, to)`와 실행 순서가 같습니다.

풀이: 추출된 쿼리 빌더가 필터·정렬·페이지 산식과 실행 시점까지 기존과 같다는 확인이다.

5단계 Codex 결과 (verbatim):

> 네 치환 모두 기존 산식의 인자 순서를 그대로 유지했습니다: `filteredTotal/FILTER_PAGE_SIZE`, `total/filters.pageSize`, `total/pageSize` 2곳이 각각 `getTotalPages(total, pageSize)` 형태로 바뀌어 산술 동등합니다. `src/hooks/usePagination.tsx`의 `Math.ceil(totalCount / pageSize)`는 그대로 남아 있어, 빈 목록에서 0 pages를 허용하는 별도 의미도 보존됐습니다.

풀이: 4곳 치환이 계산 결과를 바꾸지 않고, 공용 hook의 빈 목록 동작(D2에서 지킨 부분)도 그대로라는 확인이다.

6단계 Codex 결과 (verbatim):

> `useSearchSync`의 `useState(search)`, `useDebounce(searchInput, 300)`, `useRef(search)`, 두 `useEffect`의 guard와 ref update, `queueMicrotask(() => setSearchInput(search))`, clear 로직이 기존 `filters.search`/`filters.setSearch` 기반 코드와 동등합니다. dependency array도 (중략) 같은 의존성을 전달받는 형태라 stale closure 문제는 보이지 않습니다.

풀이: 옮긴 hook이 디바운스·guard·ref 갱신을 그대로 보존하고, 파라미터로 바뀐 의존성에도 stale closure가 없다는 확인이다.

7단계 Codex 결과 (verbatim):

> `useSermonBookmark`는 기존 `BOOKMARK_STORAGE_KEY`, `JSON.parse` guard, `Array.isArray` + string filter, localStorage write catch, `useEffect` dependency `[sermonId]`, 토글 시 `current.filter`/append, toast 메시지를 그대로 보존했습니다. (중략) 새 hook 파일에 `'use client'`가 없어도 현재 import 경로가 `'use client'` 컴포넌트에서만 시작하므로 client module graph에 포함되어 문제 없습니다.

풀이: 북마크·공유 hook이 원본 로직을 그대로 옮겼고, 'use client' 지시어 없이도 모듈 그래프상 client 번들에 올바르게 포함된다는 확인이다.

8단계 Codex 설계 검증 (verbatim, CHANGE_REQUEST → 반영 완료):

> 제안 C는 거의 맞지만, 외부 검색어 변경 시 기존 입력 debounce 타이머를 취소하지 않아 계약 (4)를 깨뜨릴 수 있습니다. (중략) 이전 타이머가 남아 있다가 나중에 `setSearch('abc')`를 호출해 외부 변경을 다시 되돌릴 수 있음. (중략) `search !== lastSent`일 때 `timerRef`를 clear하는 state 없는 `useLayoutEffect`를 추가하는 쪽이 적절합니다.

풀이: 외부 변경을 받아들인 직후 남아 있던 디바운스 타이머가 옛 검색어를 다시 보내는 버그를 설계 단계에서 잡았다. 타이머 취소 useLayoutEffect에 `draft === null` guard를 더해 반영했다 (guard가 없으면 재입력으로 생긴 새 타이머까지 취소된다).

8단계 Codex 1차 검증 (verbatim, PASS):

> `draft === null && search !== lastSent && timerRef.current` guard가 맞습니다. 외부값 채택 커밋에서만 stale timer를 취소하고, `timer fires -> lastSent 업데이트 -> echo 전 재입력` 케이스에서는 `draft !== null`이라 새 타이머를 취소하지 않습니다. (중략) `queueMicrotask`는 제거됐고, effect 내부 setState도 없습니다. 두 effect는 timeout 정리만 합니다.

풀이: 재설계된 hook이 6개 동작 계약(디바운스·echo 보존·외부 변경 즉시 반영·pending 표시·clear)을 지키면서 queueMicrotask와 effect 안 setState를 모두 없앴다는 확인이다.

PR #114 봇 리뷰 4건 판정 Codex 교차 검증 (verbatim, 전건 AGREE → PASS, confidence: high):

> Item 1: AGREE - `useListFilters`의 `setSearch('')`와 `clearAll()`은 같은 이벤트에서 functional `setState`로 순서대로 큐잉되어 최종 상태가 `clearAll`로 수렴하므로 URL 순서 문제는 없고, clear-all wrapper가 가장 국소적인 fix입니다. (중략) Item 3: AGREE - 로컬 `react-dom@19.2.1` server renderer는 `useLayoutEffect: noop`이고 경고 문자열이 없으며 (중략) `useEffect`와 stale-timer 차단 타이밍은 동등하지 않습니다.

풀이: 봇 리뷰 4건에 대한 수용 2건(clear-all 타이머 취소, pageSize guard)·기각 2건(useEffect 교체, unused import) 판정이 모두 타당하다는 확인이다. 수용분은 9·10단계 커밋, 기각 사유는 PR 답글로 회신했다.

3단계 Codex 결과 (verbatim):

> `PostgrestResponse<unknown>`는 Supabase 타입상 `PostgrestSingleResponse<unknown[]>`라서 네 호출부의 배열 응답과 구조적으로 호환됩니다. `as unknown as T[]`도 기존 각 호출부의 `as unknown as Array<...>` 뒤 동일한 `sermons?.[0]?.count ?? 0` 변환을 수행하므로 런타임 동작 변화는 없습니다. (중략) `handleResponse` import 제거는 실제 unused 제거라 범위 내입니다. `git diff --check` 통과 확인했습니다.

풀이: mapper의 파라미터 타입과 캐스트가 기존 4곳의 동작과 같고, 변경 줄 전부가 이번 task로 추적된다는 확인이다.

## Claude 2차 검증

- **최종 판단**: PASS — 8개 커밋(e49eb2d~692dd58) 모두 verify-task 통과 + Success Criteria 5건 전부 충족
- **현재 판단**: knip 경고는 `docs/tech-debt/active.md:73` 기존 부채(2026-05-01 등록)와 동일 항목, 신규 0건. Codex가 직접 수정한 코드 없음(7회 모두 리뷰만)이라 diff 교차 확인 대상 없음
- **다음 행동**: 사용자 승인 후 PR

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 7단계 커밋 전 | 20260611-195220 | ✅ | ✅ | ✅ | 0 | 아래 |
| 최종 (8단계 커밋 전) | 20260611-201449 | ✅ | ✅ | ✅ | 0 | 아래 admin 검색 브라우저 검증 |

admin 검색 브라우저 검증 (Claude in Chrome, dev 서버, 2026-06-11 — 8단계 커밋 후):

- 타이핑 "열왕" → 300ms 후 URL `?search=열왕` + 목록 1건 필터 ✅
- 추가 타이핑 "기" → URL 왕복(`열왕`→`열왕기`) 후에도 입력값 "열왕기" 유지 (URL에서 돌아온 값이 입력을 덮어쓰지 않음) ✅
- X(clear) 클릭 → 입력 즉시 비움 + URL 파라미터 제거 + 전체 8건 복원 ✅
- "모두 지우기"(외부 변경) → 입력 즉시 동기화, 2초 후에도 검색 안 되살아남 (stale 타이머 없음) ✅
- URL 직접 진입 `?search=샘플` → 입력창 "샘플" 동기화 + 목록 필터 ✅
- admin 페이지네이션(처음/끝·페이지당 select·1–1/전체 1개) 렌더 유지 — 5단계 SC 동시 확인 ✅
- 콘솔 에러·경고 0건 ✅
- dev 오버레이 "2 Issues"는 Trancy 확장이 `<html>`에 주입한 `trancy-version` 속성의 hydration 불일치라 본 작업과 무관
- 뒤로가기 테스트는 해당 없음 — 검색 상태는 `router.replace`로 갱신해 히스토리 스택에 안 쌓인다. 같은 외부 변경 경로인 "모두 지우기"와 URL 직접 진입으로 대체했다

수동 확인 (dev 서버, 2026-06-11):

- `/sermons/all` 200 + "전체 설교" 렌더 — allSeries·allPreachers(mapper)·getTotalPages 경로
- `/sermons/3` 200 — SermonMetaActions(북마크·공유 hook) 경로
- `/news/bulletins`·`?year=2025` 200 — bulletin listQuery 두 경로
- admin 설교 목록은 로그인이 필요해 브라우저 확인 못 함 — 머지 전 사용자 확인 권장 (검색 입력·페이지 이동·0건 표시)

Success Criteria 최종 확인 (grep):

- `rg "error: any" src` 0건 ✅
- `rg "sermon_count: sermons" src` 1건(mapper 내부) ✅
- `src/apis/announcement.ts` 삭제 확인 ✅
- `Math.max(1, Math.ceil` 1건(utils/pagination.ts) ✅

## 검증 이력

<details>
<summary>2026-06-11 Codex 1차 검증 실행 실패 2회 (인프라)</summary>

- 판정: 없음 (리뷰 미수행)
- 이유: Codex 샌드박스 `spawn setup refresh` 오류로 셸 명령 전부 실패. 1회차는 프로세스가 죽고 상태 파일이 `running`으로 남아 좀비화, 2회차는 리뷰 불가 사유 BLOCK 반환
- 조치: PowerShell에서 cancel로 좀비 레코드 정리 후 재실행 → PASS

</details>

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

- ~~`useSearchSync.ts`의 `queueMicrotask` 제거~~ → 8단계에서 해소 (사용자 요청으로 범위 편입, D3)
- 잔여 `queueMicrotask` 4곳 재설계 (`useListFilters`·`NoticeControlBar`·`DesktopHeader`·`useMediaQuery`)
  - 이유: 호출처마다 동기화 구조가 달라(구독·스크롤·URL 파싱) 일괄 치환이 안 된다
  - 다음 기준: useSearchSync 패턴(이벤트 핸들러 + prev-state 보정)을 참고해 별도 작업으로
  - 기록 위치: `docs/tech-debt/active.md` "queueMicrotask로 set-state-in-effect 우회 (4건)"

## 회고

**잘된 것**

- Codex 계획 검증 CR이 구현 전에 설계 결함 2개를 막았다 — 옵션 3개짜리 파라미터 헬퍼(과추상화)와 공용 Pagination 교체(admin 0건 표시 사라짐). 둘 다 코드를 쓴 뒤였으면 되돌리는 비용이 컸다.
- queueMicrotask 제거(8단계)를 설계 검증 → 구현 → 1차 검증 순서로 돌린 것이 맞아떨어졌다. stale 타이머 버그를 코드 작성 전에 잡아서 수정 비용이 프롬프트 1회였다.
- PR 봇 리뷰 4건을 Codex 교차 검증으로 판정했다. 기각 2건(useEffect 교체·unused import)을 react-dom 19.2.1 소스 근거로 회신해 근거 없는 수용을 피했다.
- Claude in Chrome 브라우저 검증으로 admin 검색 동작 계약 5건을 실제 화면에서 확인했다. 로그인 세션이 필요한 페이지라 curl 요청으로는 확인할 수 없던 부분이다.

**다음에 할 것**

- verify-task는 `git add` 뒤에 돌린다. 2단계에서 add 전에 돌려 "diff 불일치" 경고가 떴다. 같은 이유로 머지 직전 harness-gate도 다시 검증해야 했다.
- 봇 리뷰가 기존 버그(clear-all 경쟁)를 찾아줬다. 동작 보존 리팩토링이라도 옮기는 로직의 edge case를 EXPLORE 단계에서 한 번 훑는다 — 기존 버그까지 그대로 보존되기 때문이다.

**부채**

- 잔여 queueMicrotask 4곳 — `docs/tech-debt/active.md`에 등록 완료. 신규 부채 없음.

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

