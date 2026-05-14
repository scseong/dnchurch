# sermons-archive-search-feedback

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 컴포넌트 추가만, 서비스/타입 변경 없음

## 목표

검색어(`q` param) 활성 시 `/sermons/all` main 컬럼 상단에 "검색 결과 피드백 카드"를 노출한다(mockup `ChurchSermonAll.jsx:1679-1705`). 현재는 ActiveFilterChips만 검색어 칩 표시 → mockup의 search-icon + `"query" 검색 결과 · N개` + 우측 "검색어 지우기" 카드 추가.

## 검증된 Assumptions

- 현 `ActiveFilterChips.tsx:46-52`가 `q` chip을 Pill로 표시 + 닫기 가능. mockup 검색 피드백 카드와 **공존** — 칩은 다중 필터 일괄 확인 UX, 피드백 카드는 검색 결과 강조 UX. 중복 아님.
- mockup 순서(line 1679-1709): ① 검색 피드백(`query.trim()` 활성 시) → ② SeriesMetaCard(`selectedSeries` 시) → ③ 결과 헤더(Phase 3-4). SermonSearchFeedback은 SermonSeriesBanner **위**에 위치.
- `filtered.length` 같은 결과 수치는 page (`all/page.tsx:46-56` `listResult.total`)에서만 알 수 있음 — prop drilling 필요.
- 검색 상태는 `useSermonFilter` 훅의 `q` 값(`ActiveFilterChips.tsx:13`). 동일 훅 재사용.
- `IoSearch`, `IoClose` 아이콘은 `react-icons/io5`에 이미 의존 (`SermonSearchForm.tsx:4`).

## Non-goals

- 결과 헤더(총 개수 + 정렬) — Phase 3-4
- 페이지네이션 — Phase 3-5
- 모바일 사이드바 BottomSheet — Phase 3-6
- ActiveFilterChips 제거 — 다중 필터 칩 + 일괄 해제 UX 가치 유지 (D1)
- 검색 범위 확장 (본문·설교자) — placeholder만 Phase 3-1에서 정합

## Success Criteria

1. `q` URL param 비어있지 않으면(`q.trim().length > 0`) main 컬럼 SermonSeriesBanner **위**에 카드 렌더. 비어있으면 미렌더.
2. 카드 레이아웃: `$bg-card` 배경 + `1px solid $border-subtle` + `$radius-s` + `$spacing-12 $spacing-16` padding. flex row align-center gap `$spacing-10`.
3. 좌측: `<IoSearch>` (`$txt-tertiary`, flex-shrink: 0). 가운데: `<span>`에 `"query"`(`$txt-primary` bold) + `검색 결과 ·`(`$txt-secondary`) + `N개`(`$txt-primary` bold).
4. 우측: `<button>` `<IoClose>` + "검색어 지우기" (`$txt-tertiary`, `$font-size-11.5` mockup → 우리는 `$font-size-12`). 클릭 시 `setFilter({ q: null })`.
5. 결과 0건일 때도 카드는 렌더(`0개`). 빈 결과 자체 메시지는 Phase 3-5에서 처리.
6. `node scripts/verify-task.mjs sermons-archive-search-feedback` PASS.

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonListPage/SermonSearchFeedback.tsx` — 신규 client 컴포넌트
- `src/app/(content)/sermons/_component/SermonListPage/SermonToolbar.tsx` — `<SermonSearchFeedback resultCount={...} />` 추가 (SermonSeriesBanner 위). `resultCount` prop drill.
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.search_feedback*` 신규 스타일 (card, icon, text, query strong, count strong, clear button)
- `src/app/(content)/sermons/all/page.tsx` — `resultCount` prop 추가 (listResult.total 전달)

## 단계별 체크리스트

- [ ] 1. SermonSearchFeedback.tsx 신규 ('use client' + useSermonFilter + IoSearch/IoClose)
- [ ] 2. SCSS 스타일 .search_feedback / .search_feedback_icon / .search_feedback_text / .search_feedback_query / .search_feedback_count / .search_feedback_clear
- [ ] 3. SermonToolbar.tsx에 컴포넌트 + resultCount prop 연결
- [ ] 4. all/page.tsx에서 resultCount 전달
- [ ] 5. Codex 1차 검증
- [ ] 6. verify-task

## 의사결정 로그

- **D1 — ActiveFilterChips 유지**. mockup엔 없지만 다중 필터 일괄 확인 + 칩별 해제 + "전체 해제" 버튼 UX 가치 유지. 검색 피드백 카드는 검색 결과 강조, 칩은 필터 상태 navigation — 책임 분리.
- **D2 — 검색 피드백 카드 위치**. mockup line 1679-1705 순서 따라 SermonSeriesBanner 위. `<SermonSearchFeedback />` 다음 `<SermonSeriesBanner />` `<ActiveFilterChips />` 순서로 SermonToolbar 안 배치.
- **D3 — resultCount prop drilling**. `useSermonFilter`는 URL state만 — 결과 수는 page에서 페치 결과로만 알 수 있음. SermonToolbar → SermonSearchFeedback prop 전달. context 도입 안 함 (단일 사용처).

## Verification

- `node scripts/verify-task.mjs sermons-archive-search-feedback`
- `yarn dev` → `/sermons/all?q=요한` 등 검색어 진입 시 카드 mockup 일치 + 결과 수 정확
- 결과 0건 케이스 확인 (`/sermons/all?q=zzzzzzzzz`)
- "검색어 지우기" 클릭 → q=null URL 갱신 + 카드 사라짐
- 검색 + 시리즈 동시 활성 시 카드 두 개 순서대로 노출

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 1건 반영 → PASS_WITH_DECISION_LOG

### Verbatim 인용

> [A] FAIL — 페이지네이션 버그 확정
> `getFilteredSermons`(`src/services/sermon/index.ts:60-66`)는 `FILTER_PAGE_SIZE=24` 슬라이스만 반환. 총 카운트는 `sermon-service.ts:90-101`에서 별도 `total` 필드. plan의 `listResult.sermons.length`는 "N개 = 총 필터 결과" 충족 못함. `listResult.total` 사용 필요.
> [B] WARN — `useSermonFilter.ts:19-29`는 `router.push` (race 없음, plan 표현 정정 권장)
> [C/D/E] PASS — query.trim 매치, SermonSeriesBanner null 반환으로 빈 간격 X, react-icons io5 의존 충족

**평이 풀이**: 페이지네이션 적용 시 카드의 "N개"는 현재 페이지 수가 아닌 총 검색 결과 수가 맞음. `listResult` 시그니처에 `total` 필드 존재.

**반영**: 영향받는 파일·SC·Verification 전반에서 `listResult.sermons.length` → `listResult.total` (1건 replace_all 적용).

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> 10 항목 전부 이상 없음:
> 1. `useSermonFilter`의 q는 `sp.get(qKey) ?? ''`라 항상 string, trim 안전
> 2. resultCount=0 → "0개" 정상 렌더
> 3. `q='   '` → trim.length===0으로 null 반환
> 4. `&ldquo;/&rdquo;` curly quote 렌더 OK
> 5. A11y aria-hidden·button type·section aria-label 모두 존재
> 6. 스타일 토큰·hover mixin·radius 모두 검증
> 7. 외과적 변경: 4 파일 모두 Phase 3-3 범위
> 8. listResult.total 필드 실재
> 9. 배치 순서 SermonSeriesChips → SermonSearchFeedback → SermonSeriesBanner mockup 일치
> 10. inline 텍스트 baseline same font-size로 문제 없음
>
> 수정 사항 없음. ESLint·stylelint 통과.

**평이 풀이**: query 빈 문자열·공백만·0개 결과 등 엣지 케이스 + a11y + 토큰 + 배치 순서 + total 필드 존재까지 10건 통과. 직접 수정 0건.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 없음 — diff 변경 없음.
- verify-task PASS (`logs/sermons-archive-search-feedback/20260514-225619/`).
- 외과적 변경: 4 파일(신규 SermonSearchFeedback.tsx + SermonToolbar.tsx prop·import 추가 + all/page.tsx prop 전달 1줄 + SCSS `.search_feedback*` 신규 블록) — 모두 plan `영향받는 파일` 매핑 일치. 인접 코드 슬립 없음.
- listResult.total은 `sermon-service.ts:90-101` list 메소드 반환 `{ sermons, total, hasMore }` 시그니처에서 보장 — archive 모드와 filter 모드 모두 동일 시그니처 반환.
