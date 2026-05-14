# sermons-archive-sidebar

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none (preacher count source 사전 결정 완료 — 의사결정 로그 D1)
- **ADR needed**: no — `services/sermon`에 read-only query helper만 추가 (`getAllPreachers` 반환 타입에 `sermon_count: number` 필드 확장). 아키텍처·캐시·라이브러리·인증 정책 변경 없음. `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7-26`) 포함 디렉토리지만 영구 결정 아님.

## 목표

`/sermons/all` PC 사이드바를 mockup `ChurchSermonAll.jsx:1397-1481` (`PCFilterSidebar`) 디자인에 맞춰 검색·시리즈·설교자 통합 필터 카드로 재구성한다. 현재 시리즈 1축 + Toolbar 분리 구조 → 사이드바 카드 안 (헤더 "필터" + 검색 + 시리즈 ListItem + 설교자 ListItem). 240px 폭 (mockup `:1668` `gridTemplateColumns: "240px 1fr"`).

## 검증된 Assumptions

- 현 SermonSidebar는 PC 전용 (`SermonListPage.module.scss:18-26` `display: none` mobile + `respond-up($breakpoint-pc-sm) display: block; width: 26rem`).
- SermonSearchForm + ToolbarFilterButton은 SermonToolbar 안 (`SermonToolbar.tsx:25-26`). PC에서 둘 다 미렌더, 모바일만 유지 — responsive 분기 필요.
- `getAllPreachers()` 존재 (`all/page.tsx:38-41`, `services/sermon`). 단 preacher별 `sermon_count`는 **미페치** — 본 작업에서 반환 타입 확장.
- ListItem (`src/components/ui/ListItem/ListItem.tsx:29-86`)은 `href`·`selected`·`trailing`·`className` 지원, `selected` 시 `aria-current="true"` 자동 부여. mockup의 RadioOption (dot + label + count + active) 요건을 ListItem 재사용 + 내부 dot span + trailing count로 충족 가능. **새 컴포넌트 생성 불필요**.
- mockup `PCFilterSidebar` placeholder `"제목·본문·설교자"`(line 1436)는 본문/설교자 검색 활성화 전제. 현 `sermon-service.ts:85-86` 검색 범위는 `title, scripture`만 — placeholder를 `"제목·성경구절"`로 조정해 실제 동작과 정합.
- mockup sidebar 폭 240px (`:1668`) = 24rem. 현 26rem → 24rem 변경 시 main column 2rem 확장 효과 (gap·container 영향 없음 — `body` flex 자동 분배).

## Non-goals

- 모바일 사이드바 (BottomSheet) — Phase 3-6
- 본문·설교자 검색 실제 활성화 — placeholder는 현재 검색 범위에 맞춤
- 시리즈 메타 카드 (필터 활성 시 main 영역) — Phase 3-2
- 검색 결과 피드백 (`SermonSeriesBanner`, `ActiveFilterChips` 변경) — Phase 3-3
- 결과 헤더·정렬 — Phase 3-4
- 인접 컴포넌트 리팩터 (`SermonArchive`, `SermonFilteredList`, `SermonSeriesChips`)
- `ToolbarFilterButton` 자체 삭제 (모바일 사이드바 미구현 상태 → 유지)

## Success Criteria

각 항목 yes/no 판정 가능:

1. PC `>= $breakpoint-pc-sm` (1024px)에서 사이드바 카드: `$bg-card` 배경 + `1px solid $border-card` + `$radius-s` + `$padding-card`. mobile에서는 `display: none`.
2. 사이드바 폭 24rem (240px). 현재 26rem에서 -2rem 변경. main column은 flex로 자동 확장.
3. PC에서 SermonToolbar 내 `.toolbar` div(SermonSearchForm + ToolbarFilterButton 컨테이너)는 `display: none` (`respond-up($breakpoint-pc-sm)`). mobile에서는 그대로 노출. binary 기준: PC 화면에서 SermonToolbar 내 search input + filter button 시각적 비표시 (DOM mount는 허용 — `useSermonFilter` URL state 공유로 동기화 비용 0).
4. 카드 헤더: "필터" 텍스트 + 활성 필터 ≥1 일 때 "초기화" 버튼 노출 (`series=null preacher=null search=null year=null` 4 param 동시 reset). 활성 0이면 "초기화" 미렌더.
5. 검색 input: PC 사이드바 카드 최상단. placeholder `"제목·성경구절"` (mockup 그대로 X — 실제 검색 범위 정합).
6. 시리즈 섹션: `<h4>시리즈</h4>` 라벨 + ListItem 리스트. 항목: "전체" / "단독 설교" / 시리즈명 × n. 각 `trailing` slot에 count.
7. 설교자 섹션: `<h4>설교자</h4>` 라벨 + ListItem 리스트. 항목: "전체" / preacher name × n. `trailing` slot에 `sermon_count`.
8. 활성 ListItem: `$primary-subtle` 배경 + `$primary` text + 좌측 dot indicator (`<span className={styles.dot}>` inline). 비활성: `$txt-secondary` text + hover `$bg-hover` (mixin `hover-bg-shift`).
9. URL params 갱신: 시리즈 클릭 → `series=<slug>`, 설교자 클릭 → `preacher=<name>`, "초기화" → 4 param 동시 null.
10. `aria-current="true"` (ListItem 기본 제공) 선택 항목에 자동 부여. 시리즈/설교자 섹션은 `<nav aria-label="시리즈 필터">` / `<nav aria-label="설교자 필터">` 래핑.
11. `node scripts/verify-task.mjs sermons-archive-sidebar` PASS (ESLint, stylelint, build, knip).

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonListPage/SermonSidebar.tsx` — 카드 + 헤더 + 검색 + 시리즈/설교자 ListItem 통합
- `src/app/(content)/sermons/_component/SermonListPage/SermonSearchForm.tsx` — placeholder `"제목·성경구절"` 변경 + 사이드바 폭 스타일 조정
- `src/app/(content)/sermons/_component/SermonListPage/SermonToolbar.tsx` — JSX 변경 없음 (DOM 그대로). CSS로 PC에서 `.toolbar` div만 hide
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.sidebar_card`, `.sidebar_header`, `.sidebar_reset`, `.section_label`, `.dot` 추가. 기존 `.sidebar` width 26rem → 24rem. `.toolbar`에 `@include respond-up($breakpoint-pc-sm) { display: none }` 추가
- `src/app/(content)/sermons/all/page.tsx` — `activePreacher` prop 전달. `getAllPreachers()` 반환 타입 변경에 따라 호출부 무수정 (이름 동일 + 필드 추가만)
- `src/services/sermon/index.ts` 또는 `src/apis/sermon.ts` — `getAllPreachers()` 반환 타입에 `sermon_count: number` 필드 추가 (DB join 또는 별도 count query 통합)
- `src/types/sermon.ts` — `Preacher` 타입에 `sermon_count: number` 필드 추가

## 단계별 체크리스트

- [ ] 1. `getAllPreachers()` 반환에 sermon_count 추가 — Supabase query 작성 (join 또는 별도 count)
- [ ] 2. `Preacher` 타입 갱신 (`types/sermon.ts`)
- [ ] 3. SermonSidebar 재구성 (카드 + 헤더 + 검색 + 시리즈 ListItem + 설교자 ListItem + dot)
- [ ] 4. SermonSearchForm placeholder `"제목·성경구절"` + 사이드바 폭 input 스타일
- [ ] 5. SermonListPage.module.scss `.toolbar` PC `display: none` 추가 (SermonToolbar.tsx JSX 무수정)
- [ ] 6. SermonListPage.module.scss 신규 스타일 (sidebar_card / sidebar_header / sidebar_reset / section_label / dot / 폭 26→24rem)
- [ ] 7. all/page.tsx에 `activePreacher` prop 전달
- [ ] 8. Codex 1차 검증
- [ ] 9. verify-task

## 의사결정 로그

- **D1 — preacher count source: Option A 채택**. `getAllPreachers()` 반환 타입에 `sermon_count` 필드 추가 (별도 함수 X). 이유: page에서 Promise.all에 두 query 추가 회피, 단일 함수 응집성 유지. 구현은 Supabase query에서 `sermons` 테이블 left join + count aggregation 또는 별도 count subquery — services 레이어 내부 결정.
- **D2 — RadioOption 신규 X, ListItem 재사용**. `ListItem.tsx:29-86`은 `href + selected + trailing` 지원 + `aria-current="true"` 자동. mockup RadioOption의 dot은 children 안 inline `<span className={styles.dot}>`로 추가, count는 trailing slot. 신규 컴포넌트 비용 0.
- **D3 — placeholder mockup 미준수**. mockup `"제목·본문·설교자"`(line 1436) 그대로 적용하면 본문·설교자 검색 미동작 (`sermon-service.ts:85-86` title/scripture만). UX 거짓말 회피 위해 `"제목·성경구절"`로 조정. 본문·설교자 검색 활성화는 본 Phase 외 별도 작업.
- **D4 — ToolbarFilterButton 유지**. 모바일 사이드바(BottomSheet) 미구현 상태(Phase 3-6)이므로 모바일에서 ToolbarFilterButton이 설교자 필터 유일 진입점. PC에서만 시각적 비표시.
- **D5 — PC 미렌더 = CSS `display: none` 채택**. JSX 조건부 렌더링 대신 CSS hide. 이유: (a) SermonToolbar는 server component, 클라이언트 useMediaQuery 사용 시 hydration mismatch + 'use client' 강제. (b) SermonSearchForm·ToolbarFilterButton 두 instance 동시 mount는 `useSermonFilter` URL state 공유로 동기화 비용 0 (input 로컬 state는 PC에서 미사용). (c) `.toolbar` 한 줄 CSS가 가장 단순.

## ADR 판단

- **불필요** — `services/sermon`은 `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7-26`) 포함이지만 본 변경은 ① 기존 `allPreachers` 메소드의 select clause에 `sermons(count)` join 추가 (allSeries와 동일 패턴), ② 반환 타입에 `sermon_count` 필드 추가 — 새 함수·캐시 정책·레이어 경계·라이브러리 변경 없음. admin 3 페이지(`admin/sermons/{page,new/page,[id]/edit/page}.tsx`) caller는 extra field 무시로 호환.

## Verification

- `node scripts/verify-task.mjs sermons-archive-sidebar`
- `yarn dev` → `/sermons/all` PC ≥1024px 화면 mockup `PCFilterSidebar` 일치 확인 (헤더·검색·ListItem·dot·초기화)
- URL params 시리즈/설교자/초기화 동작 수동 확인
- mobile ≤1023px에서 SermonToolbar 검색·필터 그대로 노출, 사이드바 미렌더
- `node scripts/harness-gate.mjs sermons-archive-sidebar` (커밋 전)

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (2차) — 7/7 PASS + D5 의사결정 로그 추가

### 1차 — CHANGE_REQUEST (verbatim 인용)

> 5-체크
> 1. FAIL — Assumptions의 `ToolbarFilterButton` PC 단일 source 주장은 현재 CSS와 충돌
> 2. PASS — Non-goals 명확
> 3. FAIL — mockup 줄번호 `357-378`은 잘못. 실제 sidebar는 `:1397-1481`, grid는 `:1668`
> 4. FAIL — SC가 yes/no binary 기준 미흡
> 5. FAIL — `ListItem` 이미 `href/selected/trailing` 지원 + 현 SermonSidebar에서 사용 중 → 새 RadioOption 작성 부적절
>
> 개별 검토 A-G: preacher count source 사전 결정, PC ToolbarFilterButton 미렌더 조건 SC, ListItem wrapper, placeholder 정합, a11y radiogroup/aria-current, ADR 면제 사유 구체화, sidebar 26→24rem main column 영향

**평이 풀이**: 계획서가 mockup 잘못된 줄번호 + 신규 컴포넌트 불필요 + preacher count 결정 미루기 + placeholder UX 거짓말. 7개 수정 반영.

**반영 매핑**:
1. mockup 줄번호 → `1397-1481` (목표·Verification) + `1668` (Assumptions)
2. D1 의사결정 로그 — preacher count Option A 채택
3. D2 의사결정 로그 — RadioOption X, ListItem 재사용
4. SC #3 + Verification PC 미렌더 binary 기준 (CSS `display: none` 단일 방식)
5. D3 의사결정 로그 — placeholder `"제목·성경구절"`
6. ADR needed 사유 구체화 (`read-only query helper, no arch/cache/lib change`)
7. SC #2 sidebar 24rem + main column 자동 확장 명시

### 2차 — PASS_WITH_DECISION_LOG (verbatim 인용)

> 7개 항목 중 6개(1,2,3,5,6,7)와 추가 확인(A,B)은 모두 PASS. 1건 남음 — `영향받는 파일` 섹션에서 `.toolbar { respond-up(...) { display: none } }` 방식을 허용하는 문장이 SC #3의 "미렌더(binary non-render)" 요구와 충돌. JSX 조건부 렌더링만 허용 명시 OR CSS hide 방식을 SC에서 binary 정의 보정.
>
> 최종 Verdict: CHANGE_REQUEST

**평이 풀이**: CSS hide와 JSX 조건부 둘 중 하나 단일 방식으로 SC를 보정하라는 지적. D5 추가 + SC #3 "DOM mount 허용, 시각적 비표시 = binary 기준" 보정 + 영향받는 파일에서 SermonToolbar.tsx JSX 무수정 명시. CSS 단일 방식 채택 사유는 server component + state sync 비용 0.

## Codex 1차 검증

- **결론**: PASS + 2건 직접 수정

### Verbatim (요약 인용)

> 체크 결과 11개 항목 전부 확인:
> [A]–[H] PASS — admin 호환·레이어·외과적 변경·ListItem 재사용·warm/cool 토큰·a11y·overflow·DOM 일치
> [I] NOTE — 초기화 `Link` 사용 허용
> [J] PASS — placeholder 변경 q param 계약 불변
> [K] NOTE — `allPreachers/allSeries` count published 필터 미적용 (기존 일관 tech debt, blocker 아님)
>
> 직접 수정 2건:
> 1. `SermonSidebar.tsx:64` — 시리즈 "전체" 링크 reset href를 전역 초기화 → `{ series: null }`만으로 축소. 설교자·검색·연도와 독립 동작.
> 2. `SermonListPage.module.scss:69` — 초기화 링크 hover color `$txt-primary` → `$primary`로 변경 (sidebar_reset 스타일 일관성).
>
> ESLint·stylelint·`git diff --check` 전부 PASS. 최종 verdict: PASS.

**평이 풀이**: 11개 체크 통과 + Codex가 "시리즈 전체" 클릭 시 다른 필터까지 같이 풀리던 버그 + reset hover 색 톤 두 가지 직접 고침. 모두 mockup의 "축 독립 필터" 의도 + 일관성에 맞는 수정.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 수정 1 — `SermonSidebar.tsx:62-68` 시리즈 "전체" href가 `buildSermonHref(params, { series: null })`로 변경됨 (verify by current file state line 64). 설교자 "전체"(`buildSermonHref(params, { preacher: null })`, line 102)와 대칭 — 축 독립성 확보. resetHref(line 32-37)는 헤더 "초기화" 버튼 전용으로 유지 (4 param 동시 reset 의도 보존).
- Codex 수정 2 — `SermonListPage.module.scss:69` `hover-color-shift($primary)` 적용. `.sidebar_reset` base color는 `$txt-tertiary` (line 66), hover 시 cool brand color로 강조 — Hover 시스템 #2 "interactive feedback = cool" 일치.
- `node scripts/verify-task.mjs sermons-archive-sidebar` 2회 PASS (Codex 수정 전후 모두 — 로그 `logs/sermons-archive-sidebar/20260514-215047/` + `20260514-215903/`). Knip 경고는 기존 ui/index.ts barrel re-export 가짜 unused (Carousel/ListItemProps 등 본 task 무관).
- 외과적 변경 검증: 변경 6 파일 모두 plan `영향받는 파일` 매핑 일치. Codex 직접 수정 2건도 동일 파일 내 국소 변경 — 인접 코드 정리/포맷 슬립 없음.
