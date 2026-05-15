# sermons-archive-phase3

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — services/sermon에 read-only query helper(`getAllPreachers`/`getAllSeries` sermon_count 확장, sort 분기)·dead 함수 3개 제거·타입 1개 정리. 새 캐시·라이브러리·레이어 경계·인증 정책 변경 없음. ADR_TRIGGER_PARTS(src/services/·src/types/) 포함하나 영구 결정 아님.

> 이 문서는 Phase 3(`/sermons/all` 전체 설교 페이지) sub-task 12개를 단일 phase plan으로 통합한 것이다. 각 sub-task의 목표·검증 verdict는 아래 롤업 표·섹션에 압축 보존했고, 개별 active exec-plan 12개는 본 문서로 대체·삭제했다. 머지 시 harness-gate·complete-task·회고를 본 slug 1회로 처리한다.

## 목표

`/sermons/all`을 mockup `ChurchSermonAll.jsx` `AllSermonsPCPage` 패턴의 단일 모드 전체 설교 탐색 페이지로 구축. 필터 유무 무관 항상 결과 헤더 + 정렬 + GridCard 가로형 그리드 + Pagination. PC 사이드바(검색·시리즈·설교자 통합 필터 카드) / 모바일 BottomSheet(staged 적용). archive(featured + 연도 그리드) 모드 폐기 — `/sermons` 메인 캐러셀과 책임 분리.

## sub-task 롤업 (12)

| slug | 목표 (1줄) | Codex 계획 | Codex 1차 | Claude 2차 |
|---|---|---|---|---|
| sermons-archive-sidebar | PC 사이드바를 검색·시리즈·설교자 통합 필터 카드로 재구성 | PASS_WITH_DECISION_LOG (D5 추가) | PASS +직접수정 2 | PASS |
| sermons-archive-series-meta | 시리즈 배너를 warm soft SeriesMetaCard로 재구성 | PASS_WITH_DECISION_LOG (CR4 반영) | CHANGE_REQUEST→2 반영→PASS | PASS |
| sermons-archive-search-feedback | 검색어 활성 시 검색 결과 피드백 카드 노출 | CHANGE_REQUEST→1 반영→PASS_WITH_DECISION_LOG | PASS 수정0 | PASS |
| sermons-archive-result-header | 결과 그리드 상단 헤더 + 정렬 드롭다운(최신/오래된) | CHANGE_REQUEST→2 반영→PASS_WITH_DECISION_LOG | PASS +직접수정1(타입) | PASS |
| sermons-archive-pagination | 24건 초과 시 Pagination + "X/Y 페이지" (ui/Pagination 재사용) | CHANGE_REQUEST→2 반영→PASS_WITH_DECISION_LOG | PASS +직접수정3 | PASS |
| sermons-archive-mobile-sheet | 모바일 BottomSheet에 시리즈·설교자·정렬 통합 | CHANGE_REQUEST→5 반영→PASS_WITH_DECISION_LOG | PASS 수정0 | PASS |
| sermons-archive-mode-cleanup | archive "최근 말씀" 제거 + GridCard 가로 레이아웃 | 미요청(사용자 명시 결정) | CHANGE_REQUEST→2 반영→PASS | PASS |
| sermons-archive-single-mode | 단일 모드 통합, archive 모드 폐기 + dead 함수 3개 제거 | 미요청(dead code 정리) | PASS 수정0 | PASS |
| sermons-archive-pre-pr-fixes | PR 직전 6 fix(sort cascade·sermon_count·`<Image>`·a11y·시트 staged·EmptyState) | 미요청(fix 사용자 명시) | PASS 수정0 | PASS |
| sermons-archive-sidebar-radio | 사이드바 year 그룹 제거 + dot→radio circle 패턴 | 미요청(UI 작은 변경) | PASS 수정0 | PASS |
| sermons-archive-feedback-pass-2 | 피드백 5건(radio border·설교자 표기·chips 제거·필터 배지·라벨 cascade) | 미요청(사용자 명시 5건) | CHANGE_REQUEST(scope밖 2줄)→D7로 해소→PASS | PASS |
| sermons-archive-feedback-pass-3 | 피드백 3건(SearchFeedback→result_header 통합·notification 배지·play hover) | 미요청(사용자 명시 3건) | PASS 수정0 | PASS |

## 의사결정 로그 (cross-cutting)

- **D1 — 단일 모드 통합**: hasFilter 분기 폐기. 항상 getFilteredSermons + ResultHeader + FilteredList + Pagination. archive(featured+연도) 책임을 `/sermons` 메인으로 이관해 페이지 책임을 "검색·필터 탐색"으로 한정.
- **D2 — 정렬 우선순위 하향**: 시리즈·설교자·검색·연도 변경 시 sort·page 초기화(`setFilter = updateParams({ page:null, sort:null, ...patch })`). 사용자 명시 — 정렬은 보조축.
- **D3 — 설교자 표기 cascade**: `formatPreacherTitle`(endsWith 매핑) → `formatPreacherLabel`. 사이드바·시트·GridCard 전부 "OOO 목사" 단순 표기 단일 출처.
- **D4 — GridCard 가로형 단일 카드**: 13rem 썸네일 + 정보 가로 흐름. /sermons/all·상세 모바일 재사용(SermonOtherByPreacher 768px↓).
- **D5 — sermon_count inner join**: `select('*, sermons!inner(count)')` + published·deleted 필터. draft-only 시리즈 미노출 수용(사용자 명시).
- **D7 — scope밖 SCSS 사용자 IDE 직접 편집분(.sidebar width·.sidebar_section gap·.option_label font-size)은 revert 안 함**. Codex가 작성자를 모를 뿐 회귀 아님 — 의사결정 로그로 명시 처리.

## ADR 판단

- **불필요** — 12 sub-task 모두 ADR needed: no. services/sermon read-only helper·dead code 정리·타입 정리 범위. 영구 결정(아키텍처·캐시·라이브러리·레이어·인증) 변경 없음. `start-adr` 미실행.
- **PR #91 자동리뷰 fix 5건 불필요** — page.tsx는 미존재 시리즈 조기 EmptyState 반환(throw 방지) 흐름 재배치, 나머지는 UI/href call-site·BottomSheet payload 조정. 레이어·캐시·타입 계약 불변. `sermon-service.ts`는 무변경(아래 #6 참조).

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG

sub-task 6개(sidebar/series-meta/search-feedback/result-header/pagination/mobile-sheet)는 Codex 계획 검증 수행 — 전부 CHANGE_REQUEST 1~5건을 plan 반영 후 PASS 또는 PASS_WITH_DECISION_LOG로 종료(예: series-meta 4건 반영, mobile-sheet 5건 반영). 나머지 6개(mode-cleanup/single-mode/pre-pr-fixes/sidebar-radio/feedback-pass-2/3)는 사용자 명시 결정 + 외과적 작은 변경으로 계획 검증 미요청. 미해결 CR·BLOCK 0건.

## Codex 1차 검증

- **결론**: PASS

12개 1차 검증 결과: 8개 PASS(수정 0), 4개 직접수정/CR 반영 후 PASS — pagination 3건·sidebar 2건·result-header 1건(타입 안전성) 직접수정, series-meta 2건·mode-cleanup 2건 CR 반영, feedback-pass-2 scope밖 SCSS 2줄은 D7로 해소. 최종 잔여 CHANGE_REQUEST·BLOCK 0건. feedback-pass-3 1차에서 음수 리터럴 토큰 규칙·position relative·a11y·prop chain·dead 참조 모두 OK 확인.

**PR #91 자동리뷰 fix 6건 Codex 1차** — 결론 CHANGE_REQUEST. fix 1~5(GridCard cloudinaryFetchUrl·page.tsx 미존재 시리즈 조기반환·SermonSidebar resetHref+필터링크 sort:null·AdvancedFilterSheet year:null) OK. fix 6(allSeries/allPreachers select 축소)만 ISSUE — `getAllSeries`는 `/sermons` 캐러셀 `SeriesCard.tsx:13`의 `cover_image_url` 등 공유 소비처(+admin 폼 3곳)가 있어 컬럼 축소가 UI 회귀. **조치: #6 전면 revert** (공유 함수 축소는 별도 전용 쿼리/전수 감사 필요한 perf tech-debt로 분리). 나머지 5건 적용 유지.

## Claude 2차 검증

- **최종 판단**: PASS

12 sub-task 전부 verify-task PASS(Knip 경고는 기존 barrel re-export false positive — 차단 안 됨, `docs/tech-debt-tracker.md` 대조 완료). Codex 직접수정분은 diff 교차 확인 후 의도·범위 일치 검증. 외과적 변경 위반은 D7(사용자 IDE 직접 편집) 외 0건. 커밋은 sub-task별 "한 commit = 한 의도"로 분리 완료(feat/sermons-archive 누적 ~21 commit).

**PR #91 fix 2차** — Codex CHANGE_REQUEST의 #6 cover_image_url 회귀를 전수 grep으로 확인(`getAllSeries`/`getAllPreachers` 소비처 = `/sermons` 캐러셀 + admin 3 + `/sermons/all`). Claude 초기 소비처 감사가 admin·캐러셀을 누락 → #6 revert로 sermon-service.ts 무변경 복귀. fix 1~5는 verify PASS 재확인 예정. #6은 `docs/tech-debt-tracker.md` perf 항목으로 분리(별도 전용 쿼리 필요).
