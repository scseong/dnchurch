# sermons-archive-result-header

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — services에 sort 분기 1줄 + 새 URL param, 아키텍처·캐시·라이브러리 변경 없음

## 목표

`/sermons/all` 필터 모드의 결과 그리드 상단에 mockup `ChurchSermonAll.jsx:1711-1725` 형태의 결과 헤더 + 정렬 드롭다운을 추가한다. 좌측 "총/결과 N개 설교" + 우측 정렬 드롭다운(최신순/오래된순). archive 모드(필터 없음, 연도 그리드)에는 미노출.

## 검증된 Assumptions

- mockup `SORT_OPTIONS = ["최신순", "오래된순"]` (`ChurchSermonAll.jsx:159`). 단 2개 — Phase 3-4 동일.
- 현 `sermon-service.ts:55-101` `list()` 메소드는 `order('sermon_date', { ascending: false })` 고정 — sort 분기 없음. 본 task에서 `params.sort` 추가 + ascending boolean 분기.
- URL param `sort`는 필터 4 키(`series, preacher, q, year` — `SERMON_FILTER_KEYS` `utils/sermon.ts:117`)와 **분리** 관리. 필터 reset 시에도 sort는 유지 (사용자가 "오래된순" 보다가 필터 풀어도 정렬 의도 유지).
- `useSermonFilter`(`src/hooks/useSermonFilter.ts:7-34`)는 4 키만 처리. `sort` getter + `setSort` setter 추가.
- 결과 헤더는 mockup 1711-1725에서 query+filter 모두 동일 위치. 우리 구조에서는 `hasFilter === true` 분기(`all/page.tsx:36`)에서만 노출 — archive 모드의 연도 그리드는 결과 수치 의미 모호.
- 페이지 정보(`{page}/{totalPages} 페이지`)는 Phase 3-5(페이지네이션)와 같이 — 본 task는 결과 수 + 정렬만.

## Non-goals

- 페이지네이션 + 페이지 정보 — Phase 3-5
- 모바일 정렬 UI (BottomSheet sort) — Phase 3-6
- archive 모드 결과 헤더 표시 — 의미 모호로 미노출
- ActiveFilterChips/SermonSearchFeedback 변경 — 기존 그대로
- 새 정렬 옵션 추가 ("조회수순" 등) — mockup 2개만

## Success Criteria

1. `hasFilter === true` 시에만 main 컬럼에 `<SermonResultHeader>` 렌더 (`SermonFilteredList` 위). archive 모드는 미노출.
2. 좌측: `<span>` `결과` (검색 `q` 활성 시) 또는 `총` (검색 미활성 + 다른 필터 활성 시) + `<strong>{N}</strong>개 설교`.
3. 우측: `<select>` 정렬 드롭다운. 옵션 2개 — value `recent`(label "정렬: 최신순", default), value `oldest`(label "정렬: 오래된순"). mockup `:1352` label 접두사 그대로.
4. `sort=recent` 또는 미설정 시 `sermon_date desc`. `sort=oldest` 시 `sermon_date asc`. 다른 값은 무시(`recent`로 fallback).
5. 활성 정렬(default 아닌 `oldest`)일 때 select border `$primary` + 배경 `$primary-subtle` + text `$primary` (mockup `:1341-1349` `isActive` 분기 토큰화).
6. 필터 reset(SermonSidebar "초기화") 후에도 URL `sort` param은 유지 (D2).
7. 정렬 변경 시 page 1로 리셋 — 본 task는 page 미구현이므로 무영향. Phase 3-5에서 enforce.
8. `node scripts/verify-task.mjs sermons-archive-result-header` PASS.

## 영향받는 파일

- `src/types/sermon.ts` — `SermonListParams`에 `sort?: SermonSortKey` 추가 + `SermonSortKey = 'recent' | 'oldest'` export
- `src/services/sermon/sermon-service.ts` — `list()`에서 `params.sort === 'oldest'` 시 `ascending: true` 분기
- `src/services/sermon/index.ts` — `getFilteredSermons` 시그니처에 `sort` 포함
- `src/utils/sermon.ts` — `parseSermonParams`에 `sort` 추출 + inline 검증(`getString(...) === 'oldest' ? 'oldest' : 'recent'`). `buildSermonHref` 호출 시 keys 배열을 `[...SERMON_FILTER_KEYS, 'sort']`로 확장 — `buildFilterHref`(`search-params.ts:34-37`)가 keys 안 명시된 키를 patch 미존재 시 기존 sp 값으로 carry-over 하므로 reset 시 sort 보존
- `src/hooks/useSermonFilter.ts` — `sort` getter + `setSort(value)` setter 추가 (`SERMON_FILTER_KEYS`는 변경 없음, 필터 reset 시 sort 유지)
- `src/app/(content)/sermons/all/page.tsx` — `parseSermonParams` 결과 `sort` 추출 + `getFilteredSermons({...,sort})` 전달
- 신규 `src/app/(content)/sermons/_component/SermonListPage/SermonResultHeader.tsx` — 결과 카운트 + 정렬 드롭다운
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.result_header*`, `.sort_select*` 스타일

## 단계별 체크리스트

- [ ] 1. types/sermon.ts에 SermonSortKey + SermonListParams.sort 추가
- [ ] 2. sermon-service.ts list() ascending 분기
- [ ] 3. utils/sermon.ts parseSermonParams sort 추출
- [ ] 4. useSermonFilter sort/setSort 추가
- [ ] 5. all/page.tsx sort 전달 + ResultHeader prop 연결
- [ ] 6. SermonResultHeader.tsx 신규
- [ ] 7. SCSS .result_header/.sort_select 스타일
- [ ] 8. Codex 1차 검증
- [ ] 9. verify-task

## 의사결정 로그

- **D1 — archive 모드 결과 헤더 미노출**. SermonArchive는 최신 12편 캐러셀 + 연도별 그리드 구조라 "총 N개 설교" 단일 카운트가 의미 모호. 필터 모드(`hasFilter === true`)에서만 노출. mockup은 단일 모드라 항상 노출하지만 우리 dual-mode 특성상 분기 정당.
- **D2 — sort URL param 필터 분리**. `SERMON_FILTER_KEYS`에 sort 포함 X, `SermonFilterPatch`에도 포함 X. 필터 4 키와 별개 — 사용자가 "오래된순" 선택 후 필터 해제 시에도 정렬 의도 유지. `useSermonFilter`에 `sort` + `setSort` 별도 노출.
- **D3 — 정렬 옵션 2개로 고정**. mockup `SORT_OPTIONS = ["최신순", "오래된순"]` 그대로. "조회수순" 등 확장은 별도 작업.
- **D4 — 모바일 sort UI 보류**. 본 phase 결과 헤더는 데스크톱·모바일 공통 노출하되, sort 드롭다운은 native `<select>`이라 모바일에서도 동작 가능. 별도 BottomSheet sort UI는 Phase 3-6.
- **D5 — `useSermonFilter` 내부 shared updater**. `setFilter`와 `setSort`가 둘 다 `new URLSearchParams(sp)` 생성 + `router.push` 흐름을 공유. 중복 회피 위해 hook 내부에 작은 helper 클로저(`updateParams(patch)`)를 두고 두 setter가 호출. 외부 API는 두 setter 분리 유지 (필터/정렬 의미 분리).
- **D6 — archive 모드에서 sort param 무시**. `getSermonArchiveList()`는 `getSermons({pageSize: 12})`만 호출, sort 미전달 → `list()` 기본 `sermon_date desc` 유지. archive 모드에서 결과 헤더 미노출이므로 sort UI 진입점 없음 + URL에 sort 잔존해도 carry-over만 됨. archive에서 oldest를 명시 reset하지는 않음.

## ADR 판단

- **불필요** — `services/sermon`은 `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7-26`) 포함이지만 본 변경은 ① `list()`에 `ascending` boolean 분기 1줄 추가, ② `SermonListParams`에 `sort?: 'recent' | 'oldest'` 옵셔널 필드 추가뿐. 새 함수·새 캐시 정책·새 라이브러리·새 레이어 경계 없음. URL param 1개 추가는 라우팅 표준 사용.

## Verification

- `node scripts/verify-task.mjs sermons-archive-result-header`
- `yarn dev` → `/sermons/all?series=<slug>` 진입 시 결과 헤더 + 정렬 드롭다운 노출. archive 모드 `/sermons/all` 미노출.
- `?sort=oldest` 진입 시 ascending=true 적용, 드롭다운 활성 스타일.
- 필터 reset(사이드바 "초기화") 후 URL `sort` param 유지 확인.
- `node scripts/harness-gate.mjs sermons-archive-result-header` (커밋 전)

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 2건 반영 → PASS_WITH_DECISION_LOG

### Verbatim 요약

> 6 항목 검토:
> - D1 PASS — archive 모드 분기 정당 (SermonArchive 연도 그리드 구조상 단일 count 의미 약함)
> - D2 CHANGE_REQUEST — `buildFilterHref(search-params.ts:34-37)`가 keys 명시 키만 보존. `SERMON_FILTER_KEYS`가 4개뿐이면 sidebar reset(`SermonSidebar.tsx:32-37`)에서 sort 삭제됨. buildSermonHref에 sort 키 보존 경로 명시 필요.
> - D3 PASS — inline `sort === 'oldest' ? 'oldest' : 'recent'` validation OK
> - D4 PASS — `useSermonFilter` 내부 shared updater 권장
> - D5 PASS — `getSermonArchiveList`은 sort 미전달이라 desc 유지
> - D6 CHANGE_REQUEST — `<option>` 텍스트는 mockup `:1352` 그대로 `정렬: 최신순/오래된순` 접두사 포함 필요
> - SC#5 활성 스타일 토큰 PASS
>
> 필수 수정 2: D2 sort carry-over, D6 option label 접두사

**평이 풀이**: ① buildSermonHref가 sort 키도 보존하도록 keys 배열 확장 ② select option text mockup label 그대로 ("정렬: " 접두사).

**반영**:
1. SC #3 — option label `정렬: 최신순`/`정렬: 오래된순` 명시
2. 영향받는 파일 utils/sermon.ts — `buildSermonHref` keys `[...SERMON_FILTER_KEYS, 'sort']` 확장 명시 (carry-over)
3. D5 shared updater 추가
4. D6 archive 모드 sort 무시 추가

## Codex 1차 검증

- **결론**: PASS + 1건 직접 수정 (타입 안전성)

### Verbatim 요약

> 10 체크 항목:
> 1 PASS — `SermonFilterPatch.sort`를 `string | null` → `SermonSortKey | null`로 직접 좁힘 (Codex 수정)
> 2 WARN — sort가 SermonFilterPatch에 남아 명명 혼동 가능, 동작 차단 X
> 3 PASS — `setSort('recent')` null로 URL 정리, 'oldest' set
> 4 PASS — SERMON_URL_KEYS reset carry-over 확인
> 5 WARN — `?q=` 빈 문자열 edge case, 차단 X
> 6 PASS — ResultHeader hasFilter 분기 내에서만 렌더
> 7 PASS — hover transition:all 위반 없음
> 8 PASS — select aria-label + 결과 카운트 의미론적 `<p>` + `<strong>`
> 9 PASS — ESLint hooks deps 정상, leaked render 없음
> 10 PASS — 토큰 사용 + SVG data-uri 색 예외 적정
>
> 검증: `yarn lint` exit 0, `yarn lint:styles` exit 0, `tsc --noEmit` PASS
> 최종 판정 PASS

**평이 풀이**: 임의 문자열이 sort 패치로 통과되던 타입 구멍을 SermonSortKey union으로 좁힘. URL carry-over + select 동작 + a11y 모두 통과.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 — `utils/sermon.ts:116` `SermonFilterPatch.sort: SermonSortKey | null`. `SermonSortKey | null`은 `string | null` 서브타입이라 `buildFilterHref FilterPatch` 시그니처(`search-params.ts:2`) 호환. setSort 호출 시 `SermonSortKey` value 또는 null만 전달 가능 — 타입 안전.
- verify-task 2회 PASS (Codex 수정 전후, `logs/sermons-archive-result-header/20260514-231142/` + `20260514-231718/`).
- WARN 2건은 plan D2(`SermonFilterPatch`에 sort 포함 명명)·plan SC #2(`!!search` 검증) 알려진 트레이드오프 — phase blocker 아님.
- 외과적 변경: 8 파일 모두 plan `영향받는 파일` 매핑 일치. SermonResultHeader 신규 + 7 기존 파일에 sort 추가 분기.
