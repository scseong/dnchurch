# sermons-archive-pagination

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — 기존 services/sermon page param + 기존 `@/components/ui/Pagination` 재사용

## 목표

`/sermons/all` 필터 모드에서 결과가 `FILTER_PAGE_SIZE` (24)를 넘으면 페이지네이션 노출 + 결과 헤더에 "X / Y 페이지" 표기. 기존 `@/components/ui/Pagination`(`Pagination.tsx:17-72`) 재사용 — 신규 페이지네이션 컴포넌트 만들지 않음.

## 검증된 Assumptions

- 기존 `Pagination`(`src/components/ui/Pagination/Pagination.tsx`)은 `totalCount`/`pageSize`/`currentPage`/`maxVisiblePages?` prop, `useQueryParams.createQueryURL('page', value)`로 URL 갱신. `IoIosArrowBack/Forward/More` icons + windowing(`usePagination` hook).
- `useQueryParams`(`src/hooks/useQueryParams.tsx:25-32`)의 `createQueryURL`은 `new URLSearchParams(searchParams.toString())` + `query.set(name, value)` — 다른 키 모두 보존 (sort, series, preacher, q, year). page=1로 다시 가도 URL `?page=1` 유지(미세 — Pagination 컴포넌트가 page 1 link도 만듦. 사용자가 page=1 클릭 시 URL `?page=1`. 불필요한 param 잔류는 별도 정리 미상정).
- 현 `sermon-service.ts:55-92` `list()`는 `page` param 이미 지원 (`from = (page - 1) * pageSize`). 새 함수 추가 X.
- 현 `getFilteredSermons`(`services/sermon/index.ts:61-66`) Pick에 이미 `'page'` 포함.
- `FILTER_PAGE_SIZE = 24` (`services/sermon/index.ts:12`)는 현재 **non-export 내부 const**. `all/page.tsx`에서 totalPages 계산 위해 import 필요 → **`export const`로 1줄 변경**.
- 현 `all/page.tsx`는 `getFilteredSermons` 호출 시 `page` 미전달 → 기본 1.
- 필터 변경 시 `page` 잔류 버그 가능 — 사용자가 page 3에서 필터를 좁히면 totalPages < 3이 되어 빈 결과. 본 task에서 `setFilter`/`setSort` 호출 시 page 자동 reset.

## Non-goals

- archive 모드 페이지네이션 — archive는 최신 12편 + 연도 그리드 구조라 페이지 무의미 (Phase 3-4 D1 동일 분기 유지)
- 새 Pagination 컴포넌트 — 기존 재사용
- mockup의 "모든 페이지 번호 노출" 정책 — 우리는 dnchurch 표준 windowing(`maxVisiblePages = 5`) 채택 (페이지 누적 시 UI 안정성)
- 모바일 BottomSheet 사이드바 — Phase 3-6

## Success Criteria

1. `hasFilter === true` + `totalPages > 1`(`listResult.total > FILTER_PAGE_SIZE`)일 때 `<SermonFilteredList>` **아래**에 `<Pagination>` 노출. `totalPages ≤ 1` 또는 archive 모드는 미노출 (`Pagination.tsx:40` `if (!totalCount || totalPages <= 1) return null` 기존 가드 활용).
2. URL `page` param이 `currentPage` 1-base 정수. 무효(0 이하, 비정수)는 1로 fallback. 초과(`parsedPage > totalPages && totalPages > 0`) 시 SSR `redirect(\`/sermons/all?...&page=\${totalPages}\`)` 수행 (next/navigation `redirect`) — 빈 결과 + "99 / 2 페이지" 혼란 차단.
3. 페이지 클릭 시 URL `?page={n}` 갱신, 다른 param(`sort, series, preacher, q, year`) 보존. SSR 재페치 → 해당 페이지 sermons 표시.
4. `setFilter`/`setSort`(`useSermonFilter`) 호출 시 `page` param **자동 reset** (null로 delete). 필터/정렬 변경 후 page 1 시작.
5. `SermonResultHeader`에 페이지 정보 노출: `totalPages > 1` 시 ` · {currentPage} / {totalPages} 페이지` 추가 (mockup line 1719-1722). totalPages ≤ 1이면 미노출.
6. `node scripts/verify-task.mjs sermons-archive-pagination` PASS.

## 영향받는 파일

- `src/services/sermon/index.ts` — `FILTER_PAGE_SIZE`에 `export` 추가 (1줄)
- `src/utils/sermon.ts` — `parseSermonParams`에 `page: number` 추출 (기존 `getInt` 재사용, 기본 1, 무효 시 1)
- `src/app/(content)/sermons/all/page.tsx` — `page` 추출 + `getFilteredSermons({...,page})` 전달 + `<Pagination totalCount pageSize currentPage />` 렌더 + `SermonResultHeader currentPage totalPages` prop 추가
- `src/hooks/useSermonFilter.ts` — `setFilter`/`setSort` 내부에서 `updateParams` 호출 시 `page: null` 동시 patch (필터·정렬 변경 시 page reset)
- `src/app/(content)/sermons/_component/SermonListPage/SermonResultHeader.tsx` — `currentPage`/`totalPages` prop + "X / Y 페이지" 표기
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.result_page_info` 스타일 추가, `.pagination_wrap` 마진

## 단계별 체크리스트

- [ ] 1. parseSermonParams에 page 추출
- [ ] 2. useSermonFilter `updateParams`에 page reset 로직
- [ ] 3. all/page.tsx page 전달 + Pagination 렌더 + ResultHeader prop
- [ ] 4. SermonResultHeader에 페이지 표시 추가
- [ ] 5. SCSS 마무리
- [ ] 6. Codex 1차 검증
- [ ] 7. verify-task

## 의사결정 로그

- **D1 — `@/components/ui/Pagination` 재사용**. 신규 컴포넌트 비용 0, dnchurch 표준 UX 일관성 유지. mockup의 모든 페이지 번호 노출은 dnchurch 표준 windowing(`maxVisiblePages = 5`, IoIosMore 점 indicator)으로 대체. 사용자에게 더 안정적인 UI.
- **D2 — page reset on filter/sort change**. `setFilter`/`setSort` 호출 시 `page: null` patch 자동 포함. 필터 좁히면서 잔류 page가 totalPages 초과해 빈 결과 노출되는 버그 차단. user가 명시적으로 페이지 클릭한 경우만 page 유지.
- **D3 — 결과 헤더 페이지 표시 조건부**. `totalPages > 1` 시에만 " · X / Y 페이지" 노출. totalPages 1이면 페이지 정보 무의미.
- **D4 — out-of-range page는 SSR redirect**. `parsedPage > totalPages && totalPages > 0`일 때 마지막 페이지로 `redirect()`(next/navigation). clamp만으로는 빈 그리드 + "99/2" 표시 혼란 → URL을 실제 마지막 페이지로 정정해 사용자 멘탈 모델 일치. `parsedPage <= 0` 또는 NaN은 `getInt` `min:1`로 1 fallback.

## ADR 판단

- **불필요** — `services/sermon`은 ADR_TRIGGER_PARTS이지만 본 변경은 page param 활용 + 페이지네이션 UI만, 새 함수·캐시·라이브러리 없음. utils/sermon.ts page 추출, hook page reset 로직은 라우팅 표준 활용.

## Verification

- `node scripts/verify-task.mjs sermons-archive-pagination`
- `yarn dev` → 필터 적용 후 결과 25개 이상 시나리오 확인 (현재 DB 데이터에 따라). 페이지 2 클릭 시 URL 갱신 + 결과 변경
- 필터 변경 시 page 1 reset 확인
- `?page=99` 무효 페이지 진입 시 fallback 동작 확인

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 2건 반영 → PASS_WITH_DECISION_LOG

### Verbatim 요약

> 5체크: 1·2·5 PASS, 3·4 FAIL
> - A BLOCKER — `FILTER_PAGE_SIZE`(`services/sermon/index.ts:12`) non-export. all/page.tsx에서 import 시 컴파일 실패. **export 1줄 추가** 필요
> - B CHANGE_REQUEST — `?page=99` 입력 시 `sermon-service.ts:91-93` range 조회로 빈 결과 + "99/2" 표시. SSR clamp 또는 `redirect(\`?page=\${totalPages}\`)` 필요
> - C/D/E PASS — buildSermonHref가 page 미포함이라 sidebar carry-over 안 됨(정상), ?page=1 잔류 trade-off 명시됨, archive 모드 page 무영향
>
> 권고: A export 1줄, B redirect 또는 clamp

**평이 풀이**: page 상수 export 안 하면 컴파일 안 되고, 무효 page param은 빈 그리드 + 잘못된 페이지 정보 UX 버그. SSR redirect로 URL 정정.

**반영**:
1. 영향받는 파일에 `services/sermon/index.ts` export 1줄 추가
2. SC #2 — out-of-range redirect 명시
3. D4 추가 — out-of-range redirect 사유

## Codex 1차 검증

- **결론**: PASS + 3건 직접 수정

### Verbatim 요약

> Issue 1 — redirect URL rebuild: 수동 URLSearchParams 빌드 → `buildSermonHref` 재사용으로 변경. `SERMON_URL_KEYS`에 page 항상 포함하면 사이드바 링크가 page를 carry-over하는 부작용 → patch에 'page'가 명시된 경우에만 keys 확장.
> Issue 2 — TS: `SermonFilterPatch.page?: string | null` 추가해 buildSermonHref에서 page override 공식 지원.
> Issue 3 — redirect() 이후 누락 연산: filteredTotal/totalPages가 redirect 조건 이전 계산, 이후 렌더링 JSX만 남음. 안전.
>
> 변경: utils/sermon.ts(SermonFilterPatch.page 추가 + buildSermonHref 조건부 keys 확장), all/page.tsx(redirect를 buildSermonHref 호출로 교체).
>
> 최종 판정 PASS.

**평이 풀이**: 수동 URL 조합 중복 + 향후 drift 위험 → `buildSermonHref` 단일 진입점으로 통합. page는 사이드바 필터 링크에서는 무시(필터 변경 시 page reset 의도), 명시 패치 시만 보존.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 수정 1: `utils/sermon.ts:138-144` `buildSermonHref`가 `'page' in patch` 조건부로 keys 확장. 사이드바 `buildSermonHref(params, { series: x })` 호출에는 page 미포함 → carry-over 안 함 → 필터 변경 시 page reset 자동 (D2 일치). redirect 호출 `buildSermonHref(params, { page: String(totalPages) })`에서는 page 포함 → totalPages로 갱신.
- Codex 수정 2: `SermonFilterPatch.page?: string | null` (`utils/sermon.ts:117`) 타입 안전. `setFilter`/`setSort`의 `{...patch, page: null}` 호출도 타입 일치.
- Codex 수정 3: `all/page.tsx:76` `redirect(buildSermonHref(params, { page: String(totalPages) }))` — 한 줄로 정리, 중복 제거.
- verify-task 2회 PASS (`logs/sermons-archive-pagination/20260514-232739/` + `20260514-233256/`).
- 외과적 변경: 6 파일 모두 plan 매핑. SermonResultHeader prop 확장 + Pagination 렌더 + utils 확장 + hook page reset + services export — 인접 슬립 없음.
