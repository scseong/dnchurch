# sermons-detail-mobile

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-detail
- **Open questions**: none
- **ADR needed**: no — `SermonDetailPage.tsx/.scss` 모바일 reshuffle만 (ADR_TRIGGER_PARTS 미해당)

## 목표

`/sermons/[id]` 모바일/tablet 순서를 mockup `MDetailBody`(line 327-351) 정합으로 reshuffle. 현재 모바일 stack 순서가 mockup 7(시리즈 회차)→8(같은 설교자)과 다름 — SermonOtherByPreacher가 사이드바 위에 있음. 본 task로 OtherByPreacher를 `main_column` 밖으로 이동 + sidebar 뒤에 배치. 메타 row 모바일 컴팩트.

## 검증된 Assumptions

- 현 `SermonDetailPage.tsx`(Phase 2-3 완료, line 1-160 정도): JSX 구조 `<div layout>` 안 `<div main_column>` (video + info_section incl. OtherByPreacher + Note) + `<SermonSeriesSidebar>` sibling. 모바일 stack 시 순서: video → SermonMeta → Scripture → summary → Resources → **OtherByPreacher** → Note → **Sidebar(회차)**. mockup 순서와 OtherByPreacher/Sidebar 위치 어긋남.
- mockup `MDetailBody` 8단계 순서(line 338-346): 영상 / 메타 헤더 / 컴팩트 메타 / scripture / summary / 자료 / 시리즈 회차 / 같은 설교자.
- 현 `.layout_with_sidebar` PC 1024+ grid `1fr 36rem` (Phase 2-2). 본 task 모바일/tablet에서는 stack 유지하되 자식 자매 순서로 mockup 정합.
- 현 `.meta_row` (`SermonDetailPage.module.scss:60-67`) `flex-wrap: wrap; font-size: $font-size-13`. 모바일 표시 시 두 줄 빈도 — 컴팩트 처리(폰트 11/12로 축소 또는 gap 축소).
- `SermonNoteEditor`는 mockup 외 자체 기능. 본 task에서도 임시 위치 — `main_column` 끝 그대로 유지 (별도 task로 위치 확정 예정).

## Non-goals

- `<SermonVideoPlayer>` / `<SermonVideoTools>` / `<ScriptureBlock>` / `<SermonSeriesSidebar>` / `<SermonOtherByPreacher>` 자체 수정 — 위치/SCSS 외 props 변경 X
- 새 모바일 전용 컴포넌트 추가
- 영상 영역 풀폭 — 이미 LayoutContainer 안 100% width로 풀폭 (mockup 334 자연 충족)
- 첨부 자료 풀폭 — 이미 `.resource_item` width 100% (mockup 336 자연 충족)
- `SermonNoteEditor` 위치 결정 (별도 task)
- PC grid 자체 변경 (Phase 2-2 결과 유지)
- `[id]/page.tsx` 데이터/server 로직 변경

## Success Criteria

1. **JSX 재배치** — `SermonOtherByPreacher`를 `main_column` 안에서 제거하고 `<div className={styles.layout}>` 안 `<SermonSeriesSidebar>` 다음 sibling으로 이동. 시리즈 없을 때도 동일 위치.
2. **PC grid 정합** — `.layout_with_sidebar` PC 1024+에서 OtherByPreacher는 `grid-column: 1 / -1`로 row 2 full-width. main_column(row1 col1) + sidebar(row1 col2) + OtherByPreacher(row2 fullwidth).
3. **시리즈 없을 때 PC** — `.layout` 단일 컬럼 flex(현행). OtherByPreacher는 stack 마지막. grid 미적용.
4. **모바일/tablet 순서** — stack 자식 순서: video → SermonMeta → Scripture → summary → Resources → SermonNoteEditor(main_column 끝) → SermonSeriesSidebar(있을 때) → SermonOtherByPreacher. mockup 1-6 + 7-8 정합. SermonNoteEditor가 6과 7 사이에 위치하나 mockup 외 기능이라 trade-off(D3).
5. **메타 row 모바일 컴팩트** — `.meta_row`에 모바일 `font-size: $font-size-12` 또는 `gap: $spacing-4` 축소. 한 줄 우선이되 4-5 span(날짜+service_type+duration+preacher) 시 자연 wrap 허용. mockup line 335 "작은 폰트, 한 줄" 의도.
6. **검증 통과** — `verify-task.mjs sermons-detail-mobile` PASS + `yarn dev` 수동: PC 1024+ (시리즈 있음) → row1 main+sidebar / row2 OtherByPreacher fullwidth. 모바일 (시리즈 있음) → 1-8 + Note 끼임. 단독 설교 → sidebar 미렌더, OtherByPreacher 그 자리에 표시.

## 영향받는 파일

- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — JSX reshuffle (`<SermonOtherByPreacher>` main_column 밖으로 이동)
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.module.scss` — `.layout_with_sidebar`에 `grid-template-columns 1fr 36rem` + `grid-auto-flow: row` 유지 + OtherByPreacher 모듈 클래스에 `grid-column: 1 / -1`. `.meta_row` 모바일 컴팩트.
- 수정 없음: `SermonOtherByPreacher.tsx/.scss` (위치만 이동, prop 동일) / `SermonSeriesSidebar` / `[id]/page.tsx` / 그 외

## 단계별 체크리스트

- [ ] 1. `SermonDetailPage.tsx`: `<SermonOtherByPreacher>` 컴포넌트를 `main_column` 안 `<SermonNoteEditor>` 위에서 제거하고 `<div className={styles.layout}>` 안 `<SermonSeriesSidebar>` 다음 sibling으로 이동
- [ ] 2. `SermonDetailPage.module.scss .layout_with_sidebar`: 기존 `grid-template-columns: 1fr 36rem` 유지. row 2에서 OtherByPreacher full-width — `.layout_with_sidebar > :nth-child(3)` 또는 OtherByPreacher 모듈에 modifier 추가 또는 새 클래스 `.other_full_width { grid-column: 1 / -1 }` 추가
- [ ] 3. `SermonDetailPage.module.scss .meta_row`: 모바일에서 `font-size: $font-size-12; gap: $spacing-4` (`respond-up($breakpoint-tablet)`에서 `font-size: $font-size-13; gap: $spacing-8`로 복귀)
- [ ] 4. `yarn dev` 수동: PC 1024+ 시리즈 있는 설교 + 시리즈 없는 설교 / 모바일 동일 4 케이스 + 메타 컴팩트 확인
- [ ] 5. `verify-task.mjs sermons-detail-mobile` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동 (yarn dev)
# → PC 1024+ 시리즈 있음 — row1: main_column / sidebar / row2: OtherByPreacher full-width 3 카드
# → PC 1024+ 단독 설교 — 단일 컬럼 stack, OtherByPreacher 본문 아래 3 카드 (PC repeat(3,1fr) 그대로)
# → 모바일 시리즈 있음 — stack: video / SermonMeta / Scripture / summary / Resources / SermonNoteEditor / SermonSeriesSidebar / SermonOtherByPreacher
# → 모바일 단독 설교 — stack에서 sidebar 미렌더, OtherByPreacher 그 자리
# → 모바일 메타 row 한 줄 또는 2 줄 (font 작아짐, gap 좁아짐)
# → 회차 목록 max-h 480 scroll — 페이지 전체 스크롤과 충돌 0

node scripts/verify-task.mjs sermons-detail-mobile
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, fresh thread `ae0962aec5dc785b9`)

**Codex verdict** (verbatim 발췌):
> a) Note는 mockup에 없다는 증거가 plan에 있으므로 차단은 아니지만, summary와 scrutiny의 위치 설명이 서로 달라 decision log가 필요합니다.
> b) PC series grid에서 `.other_full_width { grid-column: 1 / -1 }`는 plan의 `main_column / sidebar / OtherByPreacher` 구조에 맞고, no-series flex에서는 inert라는 설명도 CSS 동작상 타당합니다.
> c) `meta_row`는 plan이 `nowrap`을 추가하지 않으므로 4-5개 span에서 줄바꿈이 남고, 한 줄 mockup 의도는 증명되지 않아 overflow를 감수할 근거가 없습니다.

**평이 풀이**: a) Note D3 기록 충분, b) `.other_full_width` 구현 패턴 정합, c) wrap 유지로 mockup "한 줄" 100% 보장 아님 — 모바일 폰트 12 + gap 4 축소만 적용, wrap는 overflow 회피.

## Codex 1차 검증

- **결론**: **PASS** (생략 — Codex 계획 검증 PASS_WITH_DECISION_LOG + 본 task scope = JSX 1줄 위치 swap + SCSS 2 modifier 추가/수정, ADR 0010 위임 트리거 미해당. Claude 2차에서 cover)

## Claude 2차 검증

- **검토 내용**: 2 파일 staged diff(`git diff --cached`) 교차 확인.
  - `SermonDetailPage.tsx`: `<SermonOtherByPreacher>` 컴포넌트를 `info_section` 안 `<SermonNoteEditor>` 위에서 제거 + `<SermonSeriesSidebar>` 다음 sibling에 `<div className={styles.other_full_width}>` wrapping 후 배치. JSX 자식 순서: main_column / sidebar(시리즈 있을 때) / other_full_width. 노트 주석은 단일 라인으로 정리.
  - `SermonDetailPage.module.scss`: `.other_full_width { @include respond-up($breakpoint-pc-sm) { grid-column: 1 / -1 } }` 신규 — `.layout_with_sidebar` grid에서 row 2 full-width, 단독 설교 `.layout` flex에서는 inert. `.meta_row` 모바일 기본 `gap: $spacing-4; font-size: $font-size-12`, `respond-up($breakpoint-tablet)`에서 `gap: $spacing-8; font-size: $font-size-13`로 확대 (D4).
- **실행한 검증**: `node scripts/verify-task.mjs sermons-detail-mobile` (run-id `20260514-203420`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - Knip warn은 SeriesEpisodeList unused 기존 부채(D6, sermons-detail-series-sidebar). 신규 unused 0건.
- **남은 항목**: `yarn dev` 수동 검증 (PC 1024+ 시리즈 있음 → row1 main+sidebar / row2 OtherByPreacher full-width 3 카드 / 모바일 stack 순서 — video/Meta/Scripture/summary/Resources/Note/Sidebar/OtherByPreacher / 모바일 메타 row 폰트 12·gap 4 컴팩트).
- **최종 판단**: ✅ **PASS** — verify-task PASS + Codex 계획 검증 PASS_WITH_DECISION_LOG + diff 교차 확인 일치. 사용자 yarn dev 수동 검증 후 commit 진행.

---

## 의사결정 로그 (사전 기록)

- **2026-05-14 D1 — `SermonOtherByPreacher` `main_column` 밖으로 이동**: 현 위치(`main_column` 안 SermonNoteEditor 위)는 모바일 stack에서 mockup 8(같은 설교자)이 7(회차 목록=사이드바) 위에 와서 mockup 순서 어긋남. 해결: `<div className={styles.layout}>` 안 `<SermonSeriesSidebar>` 다음 sibling으로 이동. PC에서는 `grid-column: 1 / -1`로 row 2 full-width — 단일 grid 안에서 3 자식(main_column / sidebar / OtherByPreacher) 자연 배치.
- **2026-05-14 D2 — PC OtherByPreacher full-width 처리**: `.layout_with_sidebar`가 grid `1fr 36rem`인데 OtherByPreacher만 row 2 full-width 필요. 옵션: (a) `grid-column: 1 / -1` 명시 클래스 `.other_full_width`를 OtherByPreacher 컴포넌트에 추가, (b) `.layout_with_sidebar > :last-child` selector. (a) 채택 — selector 의존도 ↓, 명시적. 컴포넌트 자체에 `<section className={clsx(styles.section, externalClass)}>` 형태로 외부 클래스 받기보다 SermonDetailPage SCSS에 wrapping `<div className={styles.other_full_width}>` 추가.
- **2026-05-14 D3 — `SermonNoteEditor` 위치 모바일에서 6과 7 사이**: mockup 외 자체 기능. 본 task에서 main_column 끝 유지 — 모바일 stack에서 Resources(6) 뒤 → SermonNoteEditor → Sidebar(7) → OtherByPreacher(8). 노트가 mockup 7-8 사이에 끼임. trade-off: mockup 정합 100%는 노트 별도 위치 결정 후. 본 task는 mockup 7-8 순서 정합 우선, 노트 위치는 별도 후속.
- **2026-05-14 D4 — 메타 row 모바일 폰트 축소 + gap 축소**: 현 `.meta_row { font-size: $font-size-13; gap: $spacing-8 }` 모바일에서 4-5 span(날짜+service_type+duration+preacher) 두 줄 가능. 모바일 기본 `font-size: $font-size-12; gap: $spacing-4`로 시작 + `respond-up($breakpoint-tablet)`에서 13/8로 확대. 모바일 한 줄 우선이되 wrap 유지.
- **2026-05-14 D5 — 메타 row `nowrap` 미적용 (Codex CR-c 반영)**: mockup line 335 "작은 폰트, 한 줄" 의도는 `flex-wrap: nowrap`을 함의하나 본 plan은 wrap 유지. 이유: 4-5 span(날짜·service_type·duration·preacher 최대 4) + 한국어 텍스트 길이가 viewport 360px 이하 모바일에서 한 줄 보장 불가, `nowrap` 적용 시 horizontal overflow 위험. trade-off: mockup "한 줄" 100% 미보장 대신 가독성·overflow 회피 우선. 폰트·gap 축소(D4)로 한 줄 발생 확률만 ↑.

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 2-4 (line 327-351)
- `docs/references/sermons/ChurchSermonAll.jsx` — `MDetailBody`(line 2360+에서 별도 정의)
- Phase 2-1·2-2·2-3 완료 후 누적 layout 위에서 reshuffle 진행 (`docs/exec-plans/active/2026-05-14-sermons-detail-*.md`)

## 회고 (필수 5필드)

- KPI / 시작-종료 (분): ~30 (JSX 위치 swap + SCSS modifier 2개 + 메타 row 컴팩트)
- KPI / Codex 라운드: 1 (계획 PASS_WITH_DECISION_LOG `ae0962ae`. 1차 검증 생략)
- KPI / material 사후 발견: 0
- KPI / harness-gate placeholder fail: 0
- KPI / 사용자 검토 부족 피드백: 0

## 회고

- 잘된 것: ADR 0010 적용 4 task 연속 완료 — 본 task가 가장 작은 변경(2 파일). compact plan의 효과 확인.
- 다음에 할 것: mockup 순서 정합 검토를 sub-task 분할 단계에서 미리 — Phase 2-2(사이드바 신규) 시점에 OtherByPreacher 위치까지 합쳤다면 reshuffle 별 task 분리 불필요.
- 발견된 부채: SermonNoteEditor가 mockup 7-8 사이에 끼임 — Phase 2-1 D2 + 본 task D3 모두 미해결. 노트 위치 별도 task 우선순위 ↑.
