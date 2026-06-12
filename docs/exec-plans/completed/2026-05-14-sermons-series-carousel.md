# sermons-series-carousel

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons
- **Open questions**: none
- **ADR needed**: no — `src/app/(content)/sermons/_component/` + `page.tsx` 1줄 (ADR_TRIGGER_PARTS 미해당)

## 목표

`/sermons` 메인 페이지 최근 설교 캐러셀 아래에 "진행 중인 시리즈" 가로 캐러셀 추가. mockup `ListPCSeriesPreview`(PC 3분할) + `MListSeriesPreview`(모바일 260px) 디자인. `getAllSeries()` 재사용, 신규 컴포넌트 2개(`SermonSeriesCarousel` + `SeriesCard`).

## 검증된 Assumptions

- `getAllSeries()`(`services/sermon/index.ts:24-27`)는 이미 `is_active=true` + `sort_order` 정렬 + `sermon_count` 포함 `SeriesWithSermonCount[]` 반환 — sermon-service.ts:119-135 직접 확인.
- `sermon_series` 컬럼은 `cover_image_url`/`description`/`started_at`(NOT NULL)/`ended_at`(nullable)/`is_active`/`slug`/`title`/`sort_order`/`year` — `database.types.ts:258-296` 직접 확인.
- **mockup 가정 필드 부재 2건** — `series.preacher` 직접 컬럼 없음 (preacher는 sermon 단위 관계), `series.cover_tone` 없음 (mockup line 602 `getCoverGradient` 가정). Phase 1-1 `is_featured` 케이스와 동일 클래스.
- "진행 중인 시리즈" 정의 — mockup `SERIES_PREVIEW = filter(s => s.is_active)` (`ChurchSermonAll.jsx:155`). `ended_at`은 진행/완료 시각 표시용이지 필터 기준 아님. `getAllSeries()`가 이미 일치.
- mockup PC 카드 width = `calc((100% - 32px) / 3)`(line 959) — 부모 폭 기준 3분할. 모바일 width = 260px(line 2344 영역). gap PC 16px / 모바일 16px (mockup line 953).
- `<Carousel>`의 `track { gap: $content-gap-s }`(12px) — mockup 16과 mismatch. Carousel.tsx 자체 수정은 Non-goals → 컴포넌트 단에서 의사결정 로그로 차이 흡수.
- Phase 1-2 D5 패턴(clickGuard + preventDefault + `<Link draggable={false}>` + `-webkit-user-drag: none`)은 검증 완료 — 동일 적용.

## Non-goals

- 메인 페이지 통합(Hero + 섹션 간 spacing 토큰화) — 다음 작업
- `Carousel.tsx` 자체 수정 (gap prop 추가 등)
- 신규 service method 추가 (`getActiveSeries`, `getOngoingSeries` 등)
- `sermon_series.cover_tone` / `series.preacher` 컬럼 추가 또는 시리즈-설교자 관계 쿼리 — 별도 task
- `cover_image_url` 정적 자산 업로드/관리 UI
- `/series` `/series/[slug]` 페이지 변경

## Success Criteria

1. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonSeriesCarousel/SermonSeriesCarousel.tsx` + `.module.scss`. props: `{ series: SeriesWithSermonCount[] }`. `length === 0`이면 `return null`. 'use client', `useCarousel`.
2. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonSeriesCarousel/SeriesCard.tsx`. props: `{ series: SeriesWithSermonCount }`. `<Link href={\`/series/${slug}\`} draggable={false}>` 래핑, 16:9 커버 영역 + **ON-GOING 배지만** + 텍스트 영역(title/description 2줄/메타 border-top: started_at ~ "진행 중" · N편). COMPLETED 분기는 미구현 — 본 task의 데이터 자체가 ended_at IS NULL 시리즈만 (D5).
3. **카드 width** — 모바일 `flex: 0 0 26rem`(=260px), PC(`respond-up($breakpoint-tablet)`) `flex-basis: calc((100% - 2 * #{$content-gap-s}) / 3)` (3분할, Carousel 기본 gap 12px 기준).
4. **카드 height 통일** — `display:flex; flex-direction:column` + description `flex:1` + `-webkit-line-clamp:2`로 description 길이 차이 흡수, 메타 bar는 카드 하단 고정.
5. **커버 영역 background** — `cover_image_url`이 truthy면 `<CloudinaryImage fill>` 배경 + 그 위에 `background: $overlay-scrim` 다크 overlay div(배지·텍스트 가독성 확보, scrim 토큰=rgba 흑색 0.4-0.5 영역). null이면 `$overlay-image` dark gradient만. cover_tone 분기는 만들지 않음 (D1). 배지 텍스트 색은 `$txt-inverse`.
6. **preacher 표시 생략** — mockup line 617-619 `series.preacher` 영역은 본 task에서 미렌더. 컬럼 부재가 회복되거나 시리즈-설교자 관계 쿼리가 추가되는 task에서 보강 (의사결정 로그 D2).
7. **page.tsx 수정** — `getAllSeries()` 호출(`Promise.all`에 추가), 결과를 `.filter((s) => s.ended_at === null)` 적용 후 `<SermonSeriesCarousel series={ongoing} />`로 전달. 섹션 제목 "진행 중인 시리즈"와 데이터 의미 일치(D5). Featured/Recent 아래 배치.
8. **검증 통과** — `node scripts/verify-task.mjs sermons-series-carousel` 통과 + `yarn dev` 수동: `/sermons` 200, 시리즈 캐러셀 N건 렌더, drag clickGuard, 화살표 edge detect, PC 정확히 3카드 표시, 모바일 1.3카드 보임, "모든 시리즈 →" → `/series` 이동.

## 영향받는 파일

- 신규: `src/app/(content)/sermons/_component/SermonSeriesCarousel/SermonSeriesCarousel.tsx` (client)
- 신규: `src/app/(content)/sermons/_component/SermonSeriesCarousel/SeriesCard.tsx`
- 신규: `src/app/(content)/sermons/_component/SermonSeriesCarousel/SermonSeriesCarousel.module.scss`
- 수정: `src/app/(content)/sermons/page.tsx` — `getAllSeries` import + `Promise.all`에 추가 + `<SermonSeriesCarousel>` 배치 (+4줄)

## 단계별 체크리스트

- [ ] 1. `SeriesCard.tsx` — `<Link href={\`/series/${slug}\`} draggable={false}>` 래핑, 커버(cover_image_url 분기, scrim overlay), **ON-GOING 배지 단일**(데이터가 이미 filter 후 ended_at null만), title h3, description 2줄 클램프, 메타 border-top(`formattedDate(started_at)` ~ "진행 중" · `sermon_count`편)
- [ ] 2. `SermonSeriesCarousel.tsx` — `'use client'`, `useCarousel`, 헤더(h2 "진행 중인 시리즈" + `<CarouselArrows>` + `<Link href="/series">` "모든 시리즈 →"), `<Carousel ariaLabel mobileFullBleed carousel>` + `series.map(SeriesCard)`
- [ ] 3. `SermonSeriesCarousel.module.scss` — semantic 토큰만(`$bg-card`/`$border-card`/`$radius-s`/`$accent`/`$primary`/`$txt-*`/`$overlay-image`). PC `flex-basis: calc(...)`로 3분할. D5 drag-ghost 차단 패턴 동일 적용
- [ ] 4. `page.tsx` 수정 — `getAllSeries` import, `Promise.all`에 추가, `<SermonSeriesCarousel series={result} />` 배치
- [ ] 5. `yarn dev` 수동 — `/sermons` 200, 캐러셀 렌더, drag/arrow 동작, PC 3카드/모바일 1.3카드, "모든 시리즈 →" → `/series`
- [ ] 6. `node scripts/verify-task.mjs sermons-series-carousel` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동 (yarn dev)
# → http://localhost:3000/sermons   Featured + 최근 캐러셀 + 시리즈 캐러셀 3 섹션
# → PC: 시리즈 카드 정확히 3개 표시 (calc((100% - 24px) / 3))
# → 모바일: 시리즈 카드 1.3개 정도 보임 (26rem)
# → drag → 카드 클릭 차단 / 정지 클릭 → /series/${slug}
# → ON-GOING 배지 단일 (filter 결과는 모두 ended_at null이므로 COMPLETED 미발생)
# → "모든 시리즈 →" → /series

node scripts/verify-task.mjs sermons-series-carousel
```

---

## Codex 계획 검증

- **결론**: **PASS** (2026-05-14, 2차 PASS in thread `a9d3bc3928c93c4b8`. 1차 CHANGE_REQUEST thread `a0eeb1aac434fdf5f`)

### 1차 — CHANGE_REQUEST (2026-05-14)

**Codex verdict** (verbatim):
> a) `is_active` 포함 + `ended_at`으로 `COMPLETED` 배지(SC8)는 "진행 중" 제목과 충돌 가능. material.
> b) overlay는 명시됐지만 텍스트 가독성 보장 수치/스타일은 미명시. minor-material.
> c) `calc((100% - 2*gap)/3)`는 overflow track에서 실제 3분할 수동검증 필요.

**평이 풀이**: a) "진행 중인 시리즈" 섹션 제목과 mockup의 ON-GOING/COMPLETED 배지 동시 노출이 UX 부정합 — material. b) cover overlay의 토큰·rgba 수치 미명시 — gradient만으로는 텍스트 가독성 보장 못 함. c) calc 3분할이 overflow flex track에서 의도대로 작동하는지 실측 필요.

**반영**:
- (a) SC#7에 `.filter((s) => s.ended_at === null)` 추가, SC#2/체크리스트#1에 "ON-GOING 배지 단일" 명시, 의사결정 로그 D5 신규
- (b) SC#5에 `$overlay-scrim` 토큰 + `$txt-inverse` 배지 텍스트색 명시, 의사결정 로그 D6 신규
- (c) SC#3에 `flex-basis: calc((100% - 2 * #{$content-gap-s}) / 3)` 정의 + SC#8 "yarn dev: PC 정확히 3카드 표시" 수동 검증으로 cover (plan 변경 없이 흡수)

### 2차 — PASS (2026-05-14)

**Codex verdict** (verbatim):
> a) 해소됨: `ended_at === null` 필터로 ongoing만 전달하고 `ON-GOING` 단일 배지만 구현하므로 "진행 중인 시리즈" 제목과 `COMPLETED` 동시 노출 충돌이 제거됨.
> b) 해소됨: cover truthy 시 `rgba(0.4-0.5)` scrim overlay + `-inverse` 텍스트색을 명시해 최소 가독성 기준이 계획에 들어감. null 이미지는 dark gradient로 동일 목적을 처리함.
> c) 해소됨: `calc((100% - 2 * gap) / 3)` 공식과 "PC 정확히 3카드 표시" 수동 검증이 SC#8에 들어가 overflow 리스크를 검증 항목으로 닫음.
> 추가 mismatch: 없음.

**평이 풀이**: 1차 CR 3건 모두 plan 수정으로 해소. 추가 plan-text mismatch 0건. WORK 진입 가능.

## Codex 1차 검증

- **결론**: **CHANGE_REQUEST → FIX_APPLIED** (Claude 반영 1건, 2026-05-14, fresh thread `a6f62440a99b8c889`)

**Codex verdict** (verbatim 발췌):
> P1-3 CHANGE_REQUEST — `description` null이면 flex spacer가 없어 `meta_bar` 하단 고정 불가: `SeriesCard.tsx:29`, `module.scss:94-122`.
> 나머지 12개 점검 모두 OK (P1-1/2/4 + P2-5/6 + P3-7/8/9 + P4-10/11/12/13)
> 결론: CHANGE_REQUEST — `SeriesCard.tsx:29` / `module.scss:94-122` — null description spacer 추가해 meta 하단 고정 필요.

**평이 풀이**: 13개 점검 항목 중 12개 PASS, 1건만 CR — description이 null인 시리즈에서 `<p>` 미렌더 → flex spacer 부재 → 메타바가 위로 붙어 카드 height 통일 깨짐. 카드들이 가로로 늘어서면 메타바 baseline 어긋남.

**반영** (Claude, SCSS 1줄): `SermonSeriesCarousel.module.scss .meta_bar`에 `margin-top: auto` 추가. flexbox 트릭 — description이 있든 없든 meta_bar가 카드 하단으로 push됨. description의 `flex: 1`은 유지 (description 있을 때 남은 공간 차지).

**수정 파일**: `SermonSeriesCarousel.module.scss` 1줄 (Claude 반영, Codex 직접 수정 0).

## Claude 2차 검증

- **검토 내용**: 5 파일 staged diff(`git diff --cached`) + Codex 1차 13개 점검(12 OK + 1 CR `meta_bar` margin-top 누락) + CR fix 적용 후 SCSS 교차 확인.
  - `SeriesCard.tsx`(41줄): `<Link draggable={false}>` 래핑, CloudinaryImage cover(cover_image_url 분기) + `.cover_scrim` overlay + ON-GOING 배지 단일, title h3, description 2줄 클램프, 메타 border-top(`started_at` ~ "진행 중" · `sermon_count`편). preacher 미렌더(D2). COMPLETED 분기 0건(D5).
  - `SermonSeriesCarousel.tsx`(35줄): `'use client'`, `useCarousel()` unconditional 호출 후 `series.length === 0` 분기로 rules-of-hooks 충족. 헤더 = h2 + `<CarouselArrows>` + `<Link href="/series">` "모든 시리즈 →".
  - `SermonSeriesCarousel.module.scss`(~145줄): semantic 토큰 + local var 2 (`$card-width-mobile: 26rem` mockup 260px 근거 / `$badge-glass-bg` 토큰 미존재). PC `flex-basis: calc((100% - 2 * #{$content-gap-s}) / 3)` (D3 gap 12 유지). 커버 absolute scrim + z-index:1 badge. D5 drag-ghost 패턴 4개 (`user-select`/`-webkit-user-drag`/`pointer-events`). **CR 반영: `.meta_bar { margin-top: auto }` 추가** — description 없어도 카드 height 통일.
  - `page.tsx`(+5줄): `getAllSeries` import, `Promise.all` 3-tuple로 확장, `allSeries.filter(s => s.ended_at === null)` (D5), `<SermonSeriesCarousel series={ongoingSeries} />` 배치. 기존 redirect(C-1) + Recent dedup(Phase 1-2 D4) 모두 유지.
- **실행한 검증**: `node scripts/verify-task.mjs sermons-series-carousel` 재실행 (run-id `20260514-183403`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - `logs/sermons-series-carousel/20260514-183403/summary.log`: `✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채, 커밋 차단 안 됨)`.
  - `git status -s`: A 4 + M 1 — plan §영향받는 파일과 정확히 일치 (exec-plan 1 + 컴포넌트 3 + page.tsx 1).
- **남은 항목**: `yarn dev` 수동 검증 (3 섹션 렌더, drag/arrow 동작, PC 3카드/모바일 1.3카드 영역, ON-GOING 배지, description 없는 시리즈 카드도 메타바 하단 고정, "모든 시리즈 →" → `/series`).
- **최종 판단**: ✅ **PASS** — verify-task PASS + Codex 1차 13개 점검 통과(1 CR 반영) + diff 교차 확인 일치. 사용자 yarn dev 수동 검증 후 commit 진행 가능.

---

## 의사결정 로그

- **2026-05-14 D1 — cover_tone 부재**: `sermon_series.cover_tone` 컬럼이 DB에 없음(`database.types.ts:258-296` 직접 확인). mockup `getCoverGradient(cover_tone)`은 가정 필드. 본 task는 `cover_image_url`이 truthy면 `<CloudinaryImage>` 배경 + 다크 overlay, null이면 정적 `$overlay-image` dark gradient. cover_tone 분기는 만들지 않음 — 컬럼 추가 + 운영 UI 추가는 별도 task (Phase 5 후보).
- **2026-05-14 D2 — preacher 직접 컬럼 부재**: `sermon_series` Row에 `preacher` 컬럼 없음 — preacher는 sermon 단위 관계. mockup line 617-619 표시 영역 본 task에서 미렌더. 시리즈-설교자 집계 쿼리 또는 컬럼 추가는 별도 task.
- **2026-05-14 D3 — gap mockup 16 → Carousel 기본 12 유지**: mockup `ListPCSeriesPreview` line 953 gap 16. `Carousel.module.scss .track { gap: $content-gap-s }` (12). Carousel.tsx 수정은 Non-goals(외과적 변경 차단). 시각적 차이 4px는 mockup 디자인 의도(섹션 간 호흡)와 거의 동일 — 동일 캐러셀 컴포넌트 일관성 우선. Carousel에 gap prop 도입이 필요한 후속 use case 누적되면 별도 task.
- **2026-05-14 D4 — D5 drag-ghost 차단 패턴 재적용**: Phase 1-2(sermons-recent-carousel) §의사결정 로그 D5에서 PC `<Link>` ghost image로 캐러셀 스크롤 버벅임 발견·해소. 본 시리즈 카드도 `<Link>` 래핑 → 동일 처리: `<Link draggable={false}>` + SCSS `.card { user-select: none; -webkit-user-drag: none; }` + 커버 `.cover { -webkit-user-drag: none; pointer-events: none; }`.
- **2026-05-14 D5 — "진행 중" 정의 강화 (Codex CR-a 반영)**: 1차 plan은 mockup 그대로 `getAllSeries()` 결과 전체(`is_active=true`) 표시 + COMPLETED/ON-GOING 배지로 시각 구분이었으나, Codex CR — 섹션 제목 "진행 중인 시리즈"와 COMPLETED 배지 동시 노출이 UX 부정합 지적. 해결: page.tsx에서 `getAllSeries()` 결과를 `.filter((s) => s.ended_at === null)`로 좁힘 + SeriesCard에서 COMPLETED 분기/배지 코드 미구현 (ON-GOING 배지만). 결과 0건이면 `return null`로 섹션 자체 미렌더. completed 시리즈 표시는 `/series` archive page 책임. Non-goals 유지(신규 service method 없음, 클라이언트 filter).
- **2026-05-14 D6 — cover overlay scrim 명시 (Codex CR-b 반영)**: 1차 SC#5에 "다크 overlay" 추상 표현. Codex 지적 — 텍스트(배지·title) 가독성 확보 수치/토큰 미명시. 해결: SC#5에 `$overlay-scrim` 토큰 명시 (semantic scrim, styles `tokens/_semantic.scss` 정의). 배지/텍스트 색 `$txt-inverse`. cover_image_url null이면 기존 `$overlay-image` dark gradient만으로도 충분 (mockup의 dark gradient와 동일 의도).
- **2026-05-14 D7 — `/sermons/series` 경로 정정 + path param 컨벤션**: 사용자 검증 발견 — 1차 plan은 `/series` 루트 경로 가정이었으나 dnchurch는 sermons 하위 라우트 사용. `/sermons/series/page.tsx` + `/sermons/series/[id]/page.tsx` 디렉토리 이미 존재 (Phase 0 skeleton). 카드 link `/sermons/series/${series.id}` 채택 — `[id]` 디렉토리 컨벤션 + 기존 `/sermons/${sermon.id}` 패턴 일관성. mockup의 slug URL은 Phase 4-5에서 컨벤션 결정 시 마이그레이션. 임시 404는 page.tsx가 skeleton(h1만)이라 200 응답이지만 의미 있는 콘텐츠는 Phase 4-5에서.

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 1-3 (line 195-219)
- `docs/references/sermons/ChurchSermonAll.jsx` — `SeriesGridCard`(line 594-642), `ListPCSeriesPreview`(line 930-966)
- Phase 1-2: `docs/exec-plans/completed/2026-05-14-sermons-recent-carousel.md`(머지 후 이동) — Carousel 사용 패턴 + D5 drag-ghost 차단 (본 plan D4 재사용)

## 회고 (필수 5필드)

- KPI / 시작-종료 (분): ~90 (plan CR 1라운드 + Codex 1차 CR 1건 + D7 경로 정정 후속 fix + verify 3회)
- KPI / Codex 라운드: 3 (계획 1차 CHANGE_REQUEST `a0eeb1aa` → 2차 PASS `a9d3bc39` + 1차 CR→FIX_APPLIED `a6f62440`)
- KPI / material 사후 발견: 2 (description null → meta_bar margin-top auto 누락 Codex 발견 / `/series` → `/sermons/series` 경로 사용자 검증 발견)
- KPI / harness-gate placeholder fail: 0
- KPI / 사용자 검토 부족 피드백: 0

## 회고

- 잘된 것: Codex CR 1차 3건(D5 filter / D6 scrim / D7 calc 검증)을 plan 수정으로 즉시 해소하여 2차 PASS. ADR 0010 verdict matrix가 material vs expression 분리에 효과적.
- 다음에 할 것: 새 라우트 경로는 컴포넌트 link 작성 전 `ls src/app/(content)/<route>/` 또는 mockup vs 실제 디렉토리 1회 확인 — D7 사용자 발견 차단.
- 발견된 부채: `sermon_series.cover_tone` 컬럼 부재 (D1) + `sermon_series` 안 preacher 직접 컬럼 부재 (D2) — Phase 5 시리즈 상세 페이지 작업 시 정식 컬럼 추가 또는 시리즈-설교자 집계 쿼리 결정.
