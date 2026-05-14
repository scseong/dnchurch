# sermons-archive-series-meta

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 컴포넌트 재구성만, 서비스/타입 변경 없음

## 목표

시리즈 필터 활성 시 main 컬럼 상단에 표시되는 `SermonSeriesBanner`(navy gradient + count chip)를 mockup `SeriesMetaCard`(`ChurchSermonAll.jsx:1488-1545`)로 재구성한다. 현재 minimal banner(title+desc+count) → warm soft 카드(eyebrow ON-GOING/COMPLETED · title · desc 1줄 · 기간·편수 meta · "시리즈 상세" CTA).

## 검증된 Assumptions

- `sermon_series` 테이블 컬럼은 `cover_image_url, description, ended_at, started_at, is_active, slug, title, sort_order, year` (`src/types/database.types.ts:258-294`). **`preacher_id` 컬럼 없음** — mockup의 `series.preacher` 표기는 우리 데이터에서 직접 표현 불가.
- 현 `SermonSeriesBanner.tsx`는 `useSermonFilter` 훅으로 active series slug 조회 + `allSeries.find` matching, `'none'`(단독 설교)일 때 별도 banner 분기. **단독 설교 분기는 mockup `SeriesMetaCard`에 대응 없음** — 제거 검토.
- 시리즈 페이지 경로 `/sermons/series/${id}` (route 파일 존재: `src/app/(content)/sermons/series/[id]/page.tsx:9-14` stub, params 미소비 — 본 task 범위 외). 기존 링크는 모두 id 사용 (`SermonSeriesCarousel/SeriesCard.tsx:15`, `SermonDetailPage.tsx:103`).
- ON-GOING/COMPLETED 기준은 `ended_at === null`이 ON-GOING (Phase 1-3 `SermonSeriesCarousel`과 동일 기준). DB `is_active`는 soft delete 의미로 별도.
- 카드 warm soft 톤은 `$bg-secondary`(cream `beige-150`) — styles SKILL "Decorative surface · warm" 매핑.
- 날짜 포맷 유틸: `formattedDate(date, 'YYYY.MM.DD')` 사용 (`src/utils/date.ts:11-12`). 기존 sermons 컴포넌트 동일 사용처 — `SermonSeriesCarousel/SeriesCard.tsx:33`, `SermonSeriesSidebar.tsx:19,31`. 신규 유틸/inline X.
- `standaloneCount`는 `SermonToolbar.tsx:28-33`에서 `SermonSeriesChips`(`:13-17` prop 요구)와 `SermonSeriesBanner` 둘 다에 전달됨. **`SermonSeriesChips`는 본 task 변경 없음** — `standaloneCount` prop chain (Toolbar → SeriesChips → SeriesBrowserSheet) 유지.

## Non-goals

- 시리즈 페이지 자체 변경 — Phase 1-3에서 완성
- 검색 결과 피드백 (`ActiveFilterChips`, "검색어 지우기" 등) — Phase 3-3
- 결과 헤더·정렬 — Phase 3-4
- 페이지네이션 — Phase 3-5
- 모바일 사이드바 BottomSheet — Phase 3-6
- 새 데이터 컬럼 추가 (preacher_id 등)

## Success Criteria

1. `series=<slug>` URL param + 매칭 시리즈 존재 시 main 상단에 메타 카드 렌더. 그 외(`series=none`, `preacher`, `search`, `year` 단독, 필터 0)는 미렌더.
2. 카드 스타일: `$bg-secondary` 배경 + `1px solid $border-card` + `$radius-s` + `$padding-card`. flex row, gap `$content-gap-m`.
3. 좌측 영역: eyebrow `"SERIES · ON-GOING"`(or `COMPLETED`) → title(`$font-size-15` bold) → description(`$txt-secondary`, `ellipsis-multi(1)`, description null이면 element 자체 미렌더) → meta row(`$font-size-11` `$txt-tertiary`).
4. eyebrow active 색: ON-GOING은 `$accent`(gold), COMPLETED는 `$txt-tertiary`.
5. meta row 항목: 시작일(`formattedDate(series.started_at, 'YYYY.MM.DD')`) · `~` · 종료일(`formattedDate(series.ended_at, 'YYYY.MM.DD')`) 또는 "진행 중"(ON-GOING은 `$primary` bold) · 편수(`$txt-primary` bold). preacher 미표기 — DB 컬럼 없음(D1).
6. 우측 영역: `<Link href="/sermons/series/{id}">` "시리즈 상세 →"(chevron). `$primary` 색, `$font-size-12` bold.
7. 단독 설교(`series=none`) 분기 제거 — 메타 카드 미렌더. 단독 설교 라벨 표시는 Phase 3-3(검색/필터 피드백)에서 별도 처리.
8. `node scripts/verify-task.mjs sermons-archive-series-meta` PASS.

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonListPage/SermonSeriesBanner.tsx` — 전면 재구성 (파일명 유지, 책임은 동일)
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.series_banner*` 5 클래스 교체 (`.series_meta`, `.series_meta_eyebrow`, `.series_meta_title`, `.series_meta_desc`, `.series_meta_row`, `.series_meta_link`)
- `src/app/(content)/sermons/_component/SermonListPage/SermonToolbar.tsx` — `<SermonSeriesBanner>` 호출 시 prop 변경 (`standaloneCount` 인자 제거, 자체 useSermonFilter + allSeries로 자족). `standaloneCount` Toolbar prop 자체는 **유지** — `SermonSeriesChips`가 여전히 사용
- 변경 없음(기록만): `SermonSeriesChips.tsx`, `SeriesBrowserSheet.tsx` — `standaloneCount` prop chain 유지

## 단계별 체크리스트

- [x] 1. EXPLORE 완료: `formattedDate` 유틸 `src/utils/date.ts:11` 확인 / `standaloneCount`는 `SermonToolbar` → `SermonSeriesChips` → `SeriesBrowserSheet` chain 사용 → Toolbar prop 유지
- [ ] 2. SermonSeriesBanner 재구성 (파일명 유지 + 내용 교체)
- [ ] 3. SCSS 신규 스타일 + 기존 series_banner_* 제거
- [ ] 4. SermonToolbar / 호출부 prop 정리
- [ ] 5. Codex 1차 검증
- [ ] 6. verify-task

## 의사결정 로그

- **D1 — preacher 표기 제거**. mockup `meta row`의 `{series.preacher}` 표시는 우리 DB(`sermon_series` 컬럼 9개에 preacher_id 없음, `database.types.ts:258-294` 확인)에서 매핑 불가. 대안: ① sermons join distinct (비용 + UI 모호) ② 제거 (단순) → **②**. meta row는 기간 · 편수만.
- **D2 — 단독 설교 분기 제거**. 현 `SermonSeriesBanner`의 `series === 'none'` 분기는 mockup `SeriesMetaCard` 대응 없음. main 컬럼 상단 "단독 설교" 라벨 표시는 Phase 3-3 검색/필터 피드백 영역에서 별도 처리. **임시 fallback 불필요** — `series=none` 선택 상태는 ① 사이드바 `FilterItem` selected + count(`SermonSidebar.tsx:72-75`), ② `ActiveFilterChips`가 이미 "단독 설교"로 표시(`ActiveFilterChips.tsx:17-29`), ③ 모바일 series sheet selected (`SeriesBrowserSheet.tsx:95-102`) — 3중 표시로 시각적 단절 없음.
- **D3 — 컴포넌트명 결정**. 파일명 유지(`SermonSeriesBanner`). 디자인 변경이 의미를 바꾸지만 컴포넌트 책임(시리즈 메타 표시)은 같음 + caller 영향 최소 (외과적 변경).

## Verification

- `node scripts/verify-task.mjs sermons-archive-series-meta`
- `yarn dev` → `/sermons/all?series=<slug>` 진입, 카드 mockup 일치 확인 (ON-GOING/COMPLETED · meta · 시리즈 상세 링크)
- ON-GOING 시리즈 1개·COMPLETED 시리즈 1개 양쪽 색·"진행 중"/종료일 표기 검증
- 시리즈 페이지 이동 동작 확인
- `node scripts/harness-gate.mjs sermons-archive-series-meta` (커밋 전)

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (2차 — 1차 CHANGE_REQUEST 4건 반영 후)

### 1차 — CHANGE_REQUEST (verbatim 요약)

> 5체크: 1·4·5 FAIL, 2·3 PASS
> 1. Assumptions 근거: 라우트 파일 경로 미명시
> 4. SC 날짜 포맷이 `formatDate 또는 동등 유틸`로 모호 — 실제는 `formattedDate`
> 5. `SermonToolbar`의 `standaloneCount` 제거는 `SermonSeriesChips:13-17` prop chain 깨뜨림 (OVERSIGHT)
>
> 4건 수정 요구:
> - standaloneCount 제거 철회, banner 호출 연결만 끊기
> - SermonSeriesChips/SeriesBrowserSheet "변경 없음" 명시
> - 날짜 포맷 `formattedDate(date, 'YYYY.MM.DD')` (`src/utils/date.ts:11`) 고정
> - D2에 `series=none` 시 ActiveFilterChips/sidebar selected로 표시 유지 명시

**평이 풀이**: standaloneCount는 단순 1대1 분기가 아니라 Toolbar에서 두 컴포넌트로 분기되는 prop. SermonSeriesChips가 여전히 쓰므로 Toolbar prop 자체는 유지하고 banner 호출만 끊기. 날짜는 기존 유틸 그대로.

**반영 매핑**:
1. Assumptions에 `formattedDate` 경로 + standaloneCount chain 명시
2. SC #5 `formattedDate(...)` 고정
3. 영향받는 파일 — Toolbar standaloneCount prop **유지**, banner 호출 인자만 제거. SeriesChips/BrowserSheet 변경 없음 기록
4. D2 보강 — sidebar/ActiveFilterChips/SeriesBrowserSheet 3중 표시로 시각 단절 없음

## Codex 1차 검증

- **결론**: CHANGE_REQUEST → 2건 반영 → PASS

### Verbatim 인용

> Verdict: CHANGE_REQUEST
>
> F) `ellipsis-multi(1) word-break 충돌` — `_mixins.scss:66`이 `word-break: break-all` 주입, `.series_meta_desc` keep-all 의도 + mockup `ChurchSermonAll.jsx:1512`의 `wordBreak: "keep-all"` 덮어씀. ellipsis-multi 이후 keep-all 재선언으로 오버라이드.
> B) `.series_banner_close` 잔여 (`SermonListPage.module.scss:420`) — 이번 diff 무관 발견, navy gradient 카드 제거 phase 의도와 묶어 같이 제거하거나 별도 Chore 분리.
>
> A·C·D·E·G PASS — guard 정당(string|null TS), warm/cool 토큰 혼합 mockup 일치, hover layout shift 없음, a11y attrs 정상, eyebrow gold + 진행 중 primary split mockup 충실.

**평이 풀이**: ellipsis-multi mixin이 한글 친화 break-all을 주입해서 description에서 단어 단위로 끊기지 않고 글자 단위로 끊김 — keep-all 보존을 위해 재선언. series_banner_close는 폐기된 navy gradient의 X 버튼 — 같이 정리.

**반영**:
1. `.series_meta_desc`에 `ellipsis-multi(1)` 다음 줄에 `word-break: keep-all` 재선언 (`SermonListPage.module.scss` 369-377 부근)
2. `.series_banner_close` 블록 삭제 (`SermonListPage.module.scss:420-438` 제거)

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 지적 F 적용 — `.series_meta_desc`에서 `@include ellipsis-multi(1)` 다음 줄에 `word-break: keep-all` + 의도 주석 추가. `_mixins.scss:60-67` 검토로 `break-all` 주입 확인했고 키워드 보존 의도 일치.
- Codex 지적 B 적용 — `.series_banner_close` 19줄 제거 + 인접 빈 줄 정리. SermonSeriesBanner에서 close button 사용 없었음 (재구성 후 dead). navy gradient 카드의 X 버튼 잔재로 phase 의도(`.series_banner*` 5 클래스 교체)에 포함됨.
- verify-task 2회 PASS (Codex 수정 전후 — `logs/sermons-archive-series-meta/20260514-221630/` + `20260514-224449/`). Knip 경고는 기존 ui barrel 가짜 unused만, 본 task 무관.
- 외과적 변경 확인: 3 파일 모두 plan `영향받는 파일` 매핑 일치. 본 phase 수정 외 인접 코드 슬립 없음.
