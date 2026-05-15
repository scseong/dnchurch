# sermons-archive-single-mode

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — services/sermon 함수 3개 삭제(getSermonArchiveList, getSermonYearCounts, ARCHIVE_FEATURED_COUNT) + 타입 1개 + 유틸 1개 + UI 컴포넌트 3개 제거. 새 함수·캐시·라이브러리·레이어 경계 변경 없음

## 목표

`/sermons/all`을 단일 모드로 통합. 필터 유무 무관 항상 결과 헤더 + sort + GridCard 그리드 + Pagination. mockup `AllSermonsPCPage` 패턴 동일. archive 모드(featured + 연도 그리드) 폐기 — /sermons 메인의 SermonRecentCarousel과 책임 명확 분리.

## 검증된 Assumptions

- 사용자 명시 결정: ① 전체 grid 적용 시 featured + 연도 그리드 모두 제거(2025-05-15 대화), ② PC toolbar의 search/filter 영역은 이미 `.toolbar { display: none }`(Phase 3-1 D5)로 hidden — 본 task 변경 불요. SermonToolbar 자체는 SermonSearchFeedback/SermonSeriesBanner/ActiveFilterChips 컨테이너로 유지, ③ 모바일 피드백 UI 유지 + 필터 BottomSheet — 현 상태 그대로
- 삭제 안전 confirm — `rg "SermonArchive|SermonYearGrid|SermonCard.*sermons/_component"` 결과 본 task에서만 사용:
  - `SermonArchive.tsx` ← `all/page.tsx` 단독 caller
  - `SermonYearGrid.tsx` ← `SermonArchive.tsx` 단독 caller
  - `sermons/_component/SermonCard/SermonCard.tsx` ← `SermonArchive.tsx` 단독 caller (별개 `app/_component/home/SermonCard.tsx`는 RecentSermons에서 사용 — 영향 X)
  - `getSermonArchiveList`, `getSermonYearCounts`, `buildSermonArchive`, `SermonArchiveView`, `ARCHIVE_FEATURED_COUNT` 모두 `all/page.tsx` 단독 caller
- `getFilteredSermons` 시그니처가 모든 필드 옵셔널 — 필터 0건이어도 호출 가능. `getSermons({ pageSize: 24 })` 동작 (모든 sermons 24편씩 paginated).
- `getSermonsTotalCount` — SermonSidebar의 "전체" RadioOption count로 여전히 사용. 유지.
- `sermon-service.ts:yearCounts` 메소드는 본 task에서 dead가 되나, 외과적 변경 — `index.ts` export만 제거하고 내부 메소드는 유지(보수적). 인접 서비스 정리는 별도 작업.

## Non-goals

- SermonToolbar 자체 제거 — 모바일 진입점 컨테이너 유지(PC는 CSS hidden 그대로)
- SermonRecentCarousel 변경(/sermons 메인 페이지) — 책임 분리 결정 부합
- `sermon-service.ts` 내부 yearCounts 메소드 삭제 — index.ts export 제거만
- 사이드바 디자인 변경 — Phase 3-1 결과 유지

## Success Criteria

1. `/sermons/all` 필터 없이 진입 시 SermonResultHeader("총 N개 설교") + GridCard 그리드(최대 24편 페이지네이션) + Pagination 노출. featured/SermonYearGrid 미렌더.
2. 필터 활성 시 동일 구조 + "결과 N개 설교" (hasQuery일 때) 또는 "총 N개 설교" 헤더.
3. `hasFilter` 분기 page.tsx에서 제거(현재 isUnknownSeries 분기만 남음).
4. `getSermonArchiveList`, `getSermonYearCounts`, `buildSermonArchive`, `SermonArchiveView`, `ARCHIVE_FEATURED_COUNT` 5개 심볼 코드베이스에서 제거.
5. `SermonArchive.tsx`, `SermonYearGrid.tsx`, `sermons/_component/SermonCard/` 디렉토리 삭제.
6. `SermonListPage.module.scss`에서 `.featured/.year_section/.year_heading/.past_section/.past_heading/.year_grid/.year_card*` dead 클래스 제거.
7. `node scripts/verify-task.mjs sermons-archive-single-mode` PASS.

## 영향받는 파일

- `src/app/(content)/sermons/all/page.tsx` — hasFilter 분기 제거, 항상 단일 렌더
- `src/services/sermon/index.ts` — getSermonArchiveList + getSermonYearCounts + ARCHIVE_FEATURED_COUNT 삭제
- `src/utils/sermon.ts` — buildSermonArchive 삭제 + 미사용 type import 정리
- `src/types/sermon.ts` — SermonArchiveView 삭제
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — dead 클래스 9개 제거
- **삭제**: `SermonListPage/SermonArchive.tsx`, `SermonListPage/SermonYearGrid.tsx`, `_component/SermonCard/` (디렉토리)

## 의사결정 로그

- **D1 — single-mode 채택**. /sermons 메인 페이지의 SermonRecentCarousel(최신 캐러셀)과 /sermons/all의 archive 모드(featured + recent + 연도 그리드)가 책임 중첩. 사용자 결정 기반: /sermons/all은 "검색·필터 탐색 전용", featured/연도 그리드는 별도 메인 책임. mockup `AllSermonsPCPage`도 단일 모드.
- **D2 — sermon-service.ts yearCounts 메소드 보존**. index.ts export만 제거. 내부 메소드 삭제는 외과적 변경 원칙으로 별도 — admin/통계 도입 시 재활용 가능성.
- **D3 — PC toolbar 미변경**. CSS `display: none` (Phase 3-1 D5) 이미 적용. SermonToolbar 컨테이너는 SermonSearchFeedback/SermonSeriesBanner/ActiveFilterChips 노출 책임으로 유지.
- **D4 — 모바일 피드백 UI 유지**. 사용자 명시 결정. 별도 SCSS/구조 변경 없음.

## ADR 판단

- **불필요** — `services/sermon/index.ts`는 `ADR_TRIGGER_PARTS` 포함이지만 본 변경은 export 3개 삭제(쓰임 없는 함수). 새 함수·캐시 정책·라이브러리·레이어 경계 변경 없음. 사용자 명시 결정 기반.

## Verification

- `node scripts/verify-task.mjs sermons-archive-single-mode`
- `yarn dev` → `/sermons/all` 진입 시 헤더 + 그리드 + 페이지네이션. featured/연도 카드 미노출
- `?series=<slug>` 진입 시 SermonSeriesBanner 메타 카드 + 그리드 + 페이지네이션
- `?q=word` 진입 시 SermonSearchFeedback + 결과 헤더(결과 N개) + 그리드
- `node scripts/harness-gate.mjs sermons-archive-single-mode` (커밋 전)

---

## Codex 계획 검증

- **결론**: 미요청 (사용자 명시 결정 + 단순 dead code 정리, 계획 검증 생략)

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> page.tsx :47-57 항상 getFilteredSermons, archive 분기 없음. `hasFilter`는 :37/:86 sidebar prop 용도로만 잔류 — 정상.
> out-of-range redirect :72-73 `filteredTotal > 0 && page > totalPages` 단순화 확인.
> services/utils/types — 제거 대상 export/type/function 없음, YearCount 유지 확인.
> 삭제 4 파일 경로 실재 X. src 전체에서 삭제 파일·제거 심볼 import 참조 0건.
> sermon-service.ts list() 필터 가드 모두 undefined 입력 시 쿼리 미추가 확인.

**평이 풀이**: 단일 모드 호환·undefined guard·삭제 후 stale import 0 확인. 5 modifications + 4 deletions 모두 plan 매핑.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 없음 — diff 변경 없음.
- verify-task PASS (`logs/sermons-archive-single-mode/20260515-161657/`).
- 외과적 변경: 5 modifications + 4 deletions 모두 plan 매핑. hasFilter는 SermonSidebar.hasActiveFilter prop 용도로 잔류(reset 버튼 노출 조건) — 의도된 보존.
- sermon-service.ts:yearCounts 메소드는 D2에서 보존 결정(외과적 변경 원칙). 다음 sermon-service 정리 task에서 별도 처리 가능.
- 단일 모드 동작: 필터 0개 진입 시 `getFilteredSermons({sort, page})` → `getSermons({pageSize: 24, sort: 'recent', page: 1})` → 전체 sermons sermon_date desc 24편씩 페이지네이션. 정상.
