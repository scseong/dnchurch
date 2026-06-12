# sermons-detail-series-sidebar

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-detail
- **Open questions**: none
- **ADR needed**: no — `_component/` + `SermonDetailPage.tsx/.scss` (ADR_TRIGGER_PARTS 미해당)

## 목표

`/sermons/[id]` 데스크톱 layout을 grid `1fr 360px`로 변경하고 우측에 시리즈 사이드바(`SermonSeriesSidebar`) 신규 컴포넌트를 추가. 사이드바는 mockup `SeriesSidebar`(line 1120-1217) 디자인 — 시리즈 카드(SERIES 라벨 + 제목 + description + 메타 border-top) + 자체 회차 목록(max-h 480 scroll, grid 32/1fr/auto, 현재 회차 강조). 시리즈 있는 설교만 사이드바 표시.

## 검증된 Assumptions

- 현 `SermonDetailPage.tsx`(150줄, Phase 2-1 완료): `.layout`이 flex column 단일. `<SeriesEpisodeList>`로 회차 목록 본문 흐름 끝에 노출.
- 현 `SermonDetailPage.module.scss .layout` line 5-18: `display:flex; flex-direction:column; gap:$content-gap-m`. 데스크톱에서도 stack. 본 task에서 PC grid로 분기.
- mockup `DetailPCBody`(line 1278-1289): `grid-template-columns: 1fr 360px; gap: 32px`. 모바일은 1fr stack 자연.
- mockup `SeriesSidebar`(line 1120-1217): 시리즈 카드 + 회차 목록 (max-h 480 overflow auto). 현재 회차 강조 (gold 번호 / bold 제목 / primary play 원형).
- `sermon.sermon_series` truthy일 때만 사이드바. `seriesEpisodes` prop은 이미 `[id]/page.tsx`(line 71)에서 `getSermonsBySeries` 결과로 전달됨.
- 기존 `<SeriesEpisodeList>`는 본 task에서 SermonDetailPage 사용 제거. 컴포넌트 디렉토리 보존 — Phase 2-4 모바일 회차 목록 재사용 후보.
- `$bg-secondary` `$bg-card` `$border-card` `$accent` `$primary` `$txt-primary` `$txt-secondary` `$txt-tertiary` 토큰 있음 (Phase 1-3 확인).

## Non-goals

- 모바일·tablet 사이드바 위치 변경 (Phase 2-4 — 본 task는 PC `respond-up($breakpoint-pc-sm)`(1024)에서 grid 적용, 1023px 이하는 stack 단순)
- 같은 설교자의 다른 설교 (Phase 2-3 mockup `StandaloneSidebar`)
- `<SeriesEpisodeList>` 자체 수정 또는 삭제 (디렉토리 보존)
- `<SermonVideoPlayer>` / `<SermonVideoTools>` / `<ScriptureBlock>` / `<SermonNoteEditor>` 자체 수정
- `[id]/page.tsx` 로직 변경 (server data fetching 그대로)
- 신규 데이터/service 추가 (`seriesEpisodes`는 이미 prop으로 전달됨)
- 신규 spacing 토큰 추가

## Success Criteria

1. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonSeriesSidebar/SermonSeriesSidebar.tsx` + `.module.scss`. props: `{ series: SermonSeries; episodes: SermonWithRelations[]; currentSermonId: number; onSelect: (s: SermonWithRelations) => void }`. 'use client' (onSelect callback). `episodes.length === 0`이면 `return null`.
2. **시리즈 카드** — "SERIES" eyebrow($accent, letter-spacing wide) + h3 series.title + description(있을 때) + border-top 메타(`formattedDate(started_at)` ~ `ended_at ? formattedDate : "진행 중"` · `episodes.length`편).
3. **회차 목록 카드** — 헤더 "전체 회차 (N편)" + 스크롤 영역 max-h 480px overflow-y auto. 각 row: grid `$spacing-32 1fr auto` (번호/제목+날짜·duration/현재 play 원형). 현재 회차(`ep.id === currentSermonId`): 번호 `$accent`, 제목 `$txt-primary` bold, 우측 `$primary` 원형 play 아이콘. 다른 회차: 번호 `$txt-tertiary`, 제목 `$txt-secondary`.
4. **현재 회차 클릭 disable** — `aria-current="true"` + `onClick` 무동작 (또는 `disabled` attr). mockup line 1175 `isCurrent` 시각 강조만.
5. **layout grid 변경** — `SermonDetailPage.module.scss .layout`에 modifier 클래스 `.layout_with_sidebar` 추가. `respond-up($breakpoint-pc-sm)` (1024px)에서 `display: grid; grid-template-columns: 1fr 360px; gap: $section-gap-40 $content-gap-xl`. 768~1023px 구간(tablet)은 stack — 본문 380px overflow 회피(D5). 모바일 + tablet 모두 flex column.
6. **시리즈 없을 때 PC 그리드 1단** — `sermon.sermon_series` falsy면 modifier 클래스 미부여(`.layout`만). 단일 컬럼. JSX 적용: `<div className={clsx(styles.layout, hasSeries && styles.layout_with_sidebar)}>`. Phase 2-3 standalone sidebar 추가 시 갱신 예정.
7. **`<SeriesEpisodeList>` 사용 제거** — SermonDetailPage에서 import + 렌더 제거. 컴포넌트 파일은 보존(`docs/tech-debt-tracker.md`에 본 task 머지 직후 항목 등록 — Phase 2-4 사용 가능성 + 정리 deadline). Knip warn 1건 신규는 기존 패턴(`✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채, 커밋 차단 안 됨)`)과 동일 — verify-task PASS 차단 안 됨(D6).
8. **검증 통과** — `verify-task.mjs sermons-detail-series-sidebar` PASS + `yarn dev` 수동: 시리즈 있는 설교 → 우측 사이드바(PC) / 본문 아래 stack(모바일). 단독 설교 → 사이드바 미렌더. 회차 클릭 → 다른 설교로 이동. 현재 회차 클릭 비활성.

## 영향받는 파일

- 신규: `src/app/(content)/sermons/_component/SermonSeriesSidebar/SermonSeriesSidebar.tsx` (client)
- 신규: `src/app/(content)/sermons/_component/SermonSeriesSidebar/SermonSeriesSidebar.module.scss`
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — `<SeriesEpisodeList>` import + 사용 제거, `<SermonSeriesSidebar>` import + 우측 배치
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.module.scss` — `.layout`에 PC grid 추가, 시리즈 분기 클래스 또는 `.info_section`/`.sidebar_section` 분리

## 단계별 체크리스트

- [ ] 1. `SermonSeriesSidebar.tsx` — 시리즈 카드 + 회차 목록 단일 컴포넌트. props 위 정의, currentSermonId로 강조 분기
- [ ] 2. `SermonSeriesSidebar.module.scss` — 시리즈 카드(`$bg-secondary`/`$radius-s`/`$padding-card`) + 회차 목록 카드(`$bg-card`/`$radius-s`/scroll) + 현재 회차 강조
- [ ] 3. `SermonDetailPage.tsx` — `<SeriesEpisodeList>` 제거, `<SermonSeriesSidebar series={sermon.sermon_series} episodes={seriesEpisodes} currentSermonId={sermon.id} onSelect={handleEpisodeSelect} />` 추가. `handleViewAllSeries`는 사이드바 내부에서 사용 안 함 — 별도 제공 X
- [ ] 4. `SermonDetailPage.module.scss .layout` — `respond-up($breakpoint-tablet)`에서 grid 1fr 360px (시리즈 있을 때) / 1fr (시리즈 없을 때). 클래스 분기 또는 modifier 클래스 사용
- [ ] 5. `yarn dev` 수동 — 4 케이스 (시리즈+PC / 시리즈+모바일 / 단독+PC / 단독+모바일) + 회차 클릭 + 현재 회차 클릭 비활성
- [ ] 6. `verify-task.mjs sermons-detail-series-sidebar` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동
# → /sermons/[id] 시리즈 있음 PC — 좌 본문 / 우 360px 사이드바(시리즈 카드 + 회차 목록 scroll)
# → /sermons/[id] 시리즈 있음 모바일 — stack (본문 ↓ 사이드바)
# → /sermons/[id] 단독 설교 PC — 사이드바 미렌더, 본문 100% width
# → 회차 row 클릭 → router.push(/sermons/${ep.id})
# → 현재 회차 row — gold 번호 + bold 제목 + primary play 원형, 클릭 비활성(`aria-current` 또는 disabled)
# → 회차 8건 이상 — max-h 480 scroll 작동

node scripts/verify-task.mjs sermons-detail-series-sidebar
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, 1차 CR thread `afceffdadce0926fa` → 2차 PARTIAL thread `a2f49b544780da1c4`. 2차에서 "수정 후 재검증 없이 구현 진입 가능" 명시 — 잔존 plan-text consistency 본 갱신으로 정리 완료, expression-only로 분류해 PASS_WITH_DECISION_LOG verdict 기록 + WORK 진입)

### 1차 — CHANGE_REQUEST (2026-05-14)

**Codex verdict** (verbatim):
> 1. grid 시작 breakpoint — `$breakpoint-tablet`(768px)은 너무 좁음. 768~1024px 구간에서 사이드바 360px + gap 32px = 본문 376px로 영상/본문 overflow 가능. SC#5에 grid 시작점을 `$breakpoint-pc-sm`(또는 구체 px)으로 명시하거나, `minmax(0, 360px)`로 사이드바를 수축 허용하도록 수정 필요.
> 2. Knip warn 충돌 해소 — SC#8 "verify-task PASS"와 D4 "파일 보존" 사이의 Knip warn 처리 방침을 exec-plan에 명시. 허용 부채로 등록(tech-debt-tracker.md)하거나, Phase 2-4 전까지 더미 import로 경고 0 유지 중 하나를 결정해야 합니다.

**평이 풀이**: a) 1024 미만 PC 폭에서 grid 376~600px 본문이 영상 16:9 + 텍스트와 충돌. b) SeriesEpisodeList unused 파일 보존이 Knip warn을 만들어 verify-task PASS 정의와 충돌.

**반영**:
- (a) SC#5 grid 시작점 `$breakpoint-pc-sm`(1024)로 상향. 의사결정 로그 D5 신규 — 768~1023 stack 유지, 1024+에서 grid.
- (b) SC#7에 `tech-debt-tracker.md` 등록 + Knip warn 허용 PASS 조건 명시. 의사결정 로그 D6 신규.
- SC#6에 `clsx(styles.layout, hasSeries && styles.layout_with_sidebar)` JSX 예시 1줄 추가.

### 2차 — PARTIAL → PASS-level (2026-05-14)

**Codex verdict** (verbatim 발췌):
> c) RESOLVED — SC#7/D6가 파일 보존, `sermons-series-episode-list-unused` post-merge 등록, Knip warn 허용 PASS 조건을 함께 명시해 충돌 해소됐습니다.
> a) PARTIAL — SC#5/D5는 `$breakpoint-pc-sm` 1024px로 수정됐고 토큰 값도 맞지만, Non-goals/체크리스트/D2 등 plan 내 `$breakpoint-tablet` 잔존 문구가 있어 1024px 결정과 모순됩니다.
> b) PARTIAL — `sermon.sermon_series` truthy 기반 modifier 분기는 코드베이스 `clsx(styles.x, cond && styles.y)` 관례와 맞지만, plan 본문에 `clsx` 예시 코드가 실제로 없어 구현자가 패턴을 명확히 파악하기 어렵습니다.
> 두 항목은 plan 텍스트 수정만으로 해소 가능합니다. 수정 후 재검증 없이 구현 진입 가능한 수준입니다.

**평이 풀이**: c material CR은 해소. a/b는 plan 본문에 `$breakpoint-tablet` 잔존 + clsx 예시 부재 — expression-only consistency 문제. Codex가 "재검증 없이 진입 가능" 명시 → 본 갱신으로 (i) Non-goals 문구 `$breakpoint-pc-sm`(1024)로 정정, (ii) D2 표현 정리, (iii) SC#6에 clsx 예시 추가 완료. expression-only로 PASS_WITH_DECISION_LOG verdict 발급 + WORK 진입.

## Codex 1차 검증

- **결론**: **CHANGE_REQUEST → FIX_APPLIED** (Claude 1줄 fix, 2026-05-14, fresh thread `a0365aff5d4c808a9`)
- **검토 범위**: 4 파일 staged diff (`SermonSeriesSidebar.tsx` + `.module.scss` 신규 + `SermonDetailPage.tsx` + `.module.scss` 수정)

**Codex verdict** (verbatim 발췌):
> P1 `SermonSeriesSidebar.tsx:61` `!isCurrent` onClick guard는 `disabled`가 이미 click을 막으므로 **죽은 코드**. 제거 권장.
> P1 `series &&` 이중 guard — `hasSeriesSidebar`만으로 TS narrowing 불충분, series 타입이 null 포함이므로 이중 guard는 필요하고 충분함.
> P2 둘 다 `'use client'`. RSC 경계 위반 없음.
> P3 staged diff 정확히 4개(M 2, A 2). SeriesEpisodeList delete diff 없음(보존).
> P4 hardcoded: `36rem` 1회 사용 local var 선택사항, `1px` border 일반적, `0.4` opacity 하드코딩, max-height local var 사용 확인, align-items: start 의도 명확, D5 `$breakpoint-pc-sm` 사용 확인.

**평이 풀이**: P1·P2·P3 모두 OK. P1 dead code 1건만 material — `<button disabled={isCurrent}>`가 이미 click 차단하므로 `!isCurrent &&` onClick guard는 중복. P4 하드코딩 3건은 expression — `36rem`(1회 사용), `1px border`(SCSS 표준), `0.4 opacity`(기존 SermonDetailPage `.dot` 동일 패턴).

**반영**:
- (P1 material) `SermonSeriesSidebar.tsx:61` onClick `() => !isCurrent && onSelect(ep)` → `() => onSelect(ep)` (1줄)
- (P4 expression) 그대로 유지 — `36rem` 1회 사용 + 기존 `.dot opacity 0.4` 패턴 일관 (의사결정 로그 D7)

## Claude 2차 검증

- **검토 내용**: 5 파일 staged diff(`git diff --cached`) + Codex 1차 결과(P1·P2·P3 PASS + P4 expression-only + dead code 1건 fix 적용) 교차 확인.
  - `SermonSeriesSidebar.tsx`(82줄): `<aside>` 2 카드 구조. summary card (eyebrow SERIES + h2 title + description p + meta border-top 5 span). list card (header "전체 회차 (N편)" + `<ul>` + `<button disabled={isCurrent} aria-current onClick={() => onSelect(ep)}>` 4 child grid). dead code `!isCurrent` 가드 제거 확인.
  - `SermonSeriesSidebar.module.scss`(~180줄): semantic 토큰 + local var 1(`$episode-list-max-height: 48rem`). `.episode_row_current { background-color: $primary-subtle }` 강조. `.order_num`/`.title` nested current 분기로 색·굵기 분기. `hover-bg-shift($bg-hover)` 적용. min-width: 0 + ellipsis로 가로 overflow 회피.
  - `SermonDetailPage.tsx`(+5줄/-9줄): SeriesEpisodeList import + 사용 + handleViewAllSeries 모두 제거. clsx import 추가. layout JSX 재배치 — `<div className={clsx(styles.layout, hasSeriesSidebar && styles.layout_with_sidebar)}>` 안에 `<div className={styles.main_column}>`(video + info) + `<SermonSeriesSidebar>` 자매 배치. series 이중 guard 정합(TS null narrowing).
  - `SermonDetailPage.module.scss`(+18줄): `.layout_with_sidebar { @include respond-up($breakpoint-pc-sm) { display:grid; grid-template-columns: 1fr 36rem; align-items: start; gap: $section-gap-40 $content-gap-xl } }` + `.main_column` 신규. 기존 `.layout` 보존 (모바일/tablet 단일 컬럼).
- **실행한 검증**: `node scripts/verify-task.mjs sermons-detail-series-sidebar` 재실행(dead code fix 반영 후) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - 첫 run(`20260514-195336`) PASS, fix 후 재실행 PASS — log 별도 run-id.
  - Knip 경고 1건 추가 — `<SeriesEpisodeList>` 사용 제거로 컴포넌트 unused. D6 합의대로 기존 부채 동일 패턴 통과. 별도 `docs/tech-debt-tracker.md` 항목 등록 (Phase 2-4 재사용 또는 정리 deadline).
- **남은 항목**: `yarn dev` 수동 검증 (시리즈 있는 설교 PC 1024+ → grid 1fr 360px / 모바일·tablet → stack / 단독 설교 → 사이드바 미렌더, 회차 클릭 → `/sermons/${ep.id}` / 현재 회차 disabled).
- **최종 판단**: ✅ **PASS** — verify-task PASS + Codex 1차 P1-P4 + dead code 1건 fix + diff 교차 확인 일치. 사용자 yarn dev 수동 검증 후 commit + tech-debt 등록 진행.

---

## 의사결정 로그 (사전 기록)

- **2026-05-14 D1 — `SermonSeriesSidebar` 신규 vs `SeriesEpisodeList` 확장**: 기존 SeriesEpisodeList는 ListItem + 5 visible + "전체 N편 보기" 버튼 패턴(별도 페이지 push). mockup 사이드바는 시리즈 카드 + 자체 회차 목록(scroll) 통합 단일 컴포넌트. 시각·동작 차이 큼 → 신규 컴포넌트로 분리. SeriesEpisodeList 파일은 디렉토리 보존(Phase 2-4 모바일 회차 목록에서 재사용 후보).
- **2026-05-14 D2 — `1fr 360px` 고정 vs `1fr minmax`**: mockup `DetailPCBody` line 1282은 `1fr 360px` 고정. 본 plan 채택. trade-off: 1024px PC 폭에서 본문 width = 1024 - 360 - 32(gap) - $container-padding *2 = 약 520-600px로 영상 16:9 height ~330px OK. grid 진입 시점은 D5에서 `$breakpoint-pc-sm`(1024)로 확정. 부족 시 별도 토큰 도입.
- **2026-05-14 D3 — 회차 목록 max-h 480 + scroll 유지**: mockup line 1173 그대로. trade-off: 회차 30건 이상이면 사이드바 안 scroll 깊어짐 — 사용자 회차 검색 어려움. 본 task는 mockup 디자인 정합 우선, 회차 30+ 시리즈는 별도 검색·필터 UX 후속 결정.
- **2026-05-14 D4 — `<SeriesEpisodeList>` 디렉토리 보존**: SermonDetailPage 사용 제거 후 파일은 unused. Knip warn 1건 추가 가능 — 그러나 Phase 2-4 모바일에서 시리즈 회차 목록(별도 UX, scroll 외)로 재사용 후보. 본 task에서 디렉토리 삭제 X. Phase 2-4 완료 시점에 진짜 unused면 그때 정리.
- **2026-05-14 D5 — grid 시작 breakpoint `$breakpoint-pc-sm`(1024) 채택 (Codex CR-a 반영)**: 1차 plan은 `$breakpoint-tablet`(768)에서 grid 시작. Codex 지적 — 768~1023px 구간에서 본문 width = viewport - 360(사이드바) - 32(gap) - $container-padding *2 = 약 376~600px로 영상 16:9 + 텍스트 padding overflow 위험. 해결: grid 시작점을 `$breakpoint-pc-sm`(1024)로 올림. 1024px에서 본문 ~520-600px 확보(영상 16:9 height ~330px OK). 768~1023 구간은 stack 유지(`mobileFullBleed` 캐러셀 없는 detail page라 stack overflow 0).
- **2026-05-14 D6 — Knip warn 처리 (Codex CR-c 반영)**: 1차 plan SC#7 "파일 보존" + D4 "Knip warn 1건 추가 가능" vs SC#8 "verify-task PASS" 충돌. 해결: (a) 본 task 머지 직후 `docs/tech-debt-tracker.md`에 항목 등록 (slug: `sermons-series-episode-list-unused`, deadline: Phase 2-4 완료 시점) — 추적 명시. (b) verify-task는 Knip warn을 차단 없이 통과(`logs/<task-id>/summary.log` 기존 패턴 동일 — `⚠ 경고: Knip — 기존 부채, 커밋 차단 안 됨`). plan SC#8 "PASS" 조건은 lint·build·stylelint 통과 + Knip warn 부채 허용 의미로 일관 유지.
- **2026-05-14 D7 — Codex 1차 P4 expression 분류**: `36rem`(1회 사용)/`1px border`(SCSS 표준)/`0.4 opacity`(기존 SermonDetailPage `.dot` 동일 패턴) 하드코딩 3건은 expression-only — 신규 토큰 추가 없이 그대로 유지. Codex `align-items: start`·D5 `$breakpoint-pc-sm` 사용 확인.
- **2026-05-14 D8 — 사이드바 톤 통일 (사용자 수동 검증 발견)**: 1차 구현에서 `.summary_card { $bg-secondary }`(warm cream) + `.list_card { $bg-card }`(white) + `.list_header { $bg-secondary }`로 사이드바 안에 warm/white 톤 혼재 — styles SKILL warm vs cool 역할 분리 룰 위반(정적 사이드바는 단일 톤). 해결: `.summary_card`·`.list_header` 모두 `$bg-card`(white)로 통일. 두 카드 시각 분리는 컨테이너 gap(`$spacing-12`) + border 만으로. mockup `C.toneSoft`의 warm bg 의도는 dnchurch warm/cool 룰과 충돌 — dnchurch 룰 우선.

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 2-2 (line 276-303)
- `docs/references/sermons/ChurchSermonAll.jsx` — `SeriesSidebar`(line 1120-1217), `DetailPCBody`(line 1278-1289)
- Phase 2-1 완료: SermonDetailPage 150줄 순차 layout (본 task 위 layout grid 변경)
- Phase 1-3 카드 경로 컨벤션: `/sermons/series/${id}` (의사결정 로그 D7)

## 회고 (필수 5필드)

- KPI / 시작-종료 (분): ~120 (CR 2건 plan + 1차 CR 1건 + D8 톤 정정 + 객관 리뷰 fix 4건)
- KPI / Codex 라운드: 4 (계획 1차 CR `afceffda` → 2차 PARTIAL `a2f49b54` + 1차 CR→FIX_APPLIED `a0365aff` + PR 객관 리뷰 `ab6e22da`)
- KPI / material 사후 발견: 2 (사용자 톤 정정 D8 — warm/cool 혼재 / Codex 객관 리뷰 button→Link 시맨틱 — a11y 위반)
- KPI / harness-gate placeholder fail: 0
- KPI / 사용자 검토 부족 피드백: 0

## 회고

- 잘된 것: 1차 CR 2건(grid breakpoint 768→1024 / Knip warn 처리)을 plan 수정으로 즉시 흡수. 객관 리뷰의 button→Link 정합도 PR 머지 전 반영.
- 다음에 할 것: 클릭 시 navigation하는 row는 처음부터 `<Link>`로. `<button onClick={router.push}>` 패턴 검토 단계에서 차단. 사이드바·카드 톤은 styles SKILL warm vs cool 표 사전 확인.
- 발견된 부채: opacity 0.4 토큰화 미정 — 본 task + Phase 1-3 모두 `.dot` 패턴에 inline 사용. 일관성 위해 `$opacity-muted` 등 토큰 신규 검토 별도 task.
