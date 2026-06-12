# sermons-detail-main

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-detail
- **Open questions**: none
- **ADR needed**: no — `src/app/(content)/sermons/_component/SermonDetailPage/` 리팩터 + `[id]/page.tsx` 변경 없음 (ADR_TRIGGER_PARTS 미해당)

## 목표

설교 상세 페이지(`/sermons/[id]`) 좌측 메인 컨텐츠 영역을 mockup `DetailPCBody` + `SermonMeta` 디자인으로 리팩터. 현 Tabs 4분할(요약/본문/자료/노트) → mockup 순차 layout(scripture_text 인용 → summary → resources). 노트 기능은 본 task 외 별도 task로 분리 (제거 X, 위치만 후속 결정).

## 검증된 Assumptions

- 현 `SermonDetailPage.tsx`(line 1-205): `'use client'`, `useState`로 4-Tab UI. mockup 의도(순차 펼침)와 정면 충돌.
- mockup `Sermon-Implementation-Prompts.md:248-273` 명시 구조 — 영상 / 메타(시리즈 라벨+제목+scripture+컴팩트 메타) / scripture_text 인용 / summary / resources 순차.
- 기존 컴포넌트 그대로 재사용: `<SermonVideoPlayer>`(라인 7) / `<SermonVideoTools>`(라인 8) / `<ScriptureBlock>`(라인 10) / `<SeriesEpisodeList>`(라인 12) — mockup도 동일 영역 존재. `<SermonNoteEditor>`만 본 task 분기.
- `incrementSermonViewCount` 호출 + JSON-LD VideoObject schema는 `[id]/page.tsx`(line 61-83)에서 그대로 유지 — server-only 책임.
- 메타 필드 컴팩트 — 현 `SermonMeta` 인라인 컴포넌트(line 105-131)의 시리즈 라벨/날짜/preacher/serviceType 조합은 mockup과 호환. duration 추가 + 시리즈 페이지 링크 추가만 필요.
- 사용자 결정 — 현 작업 task 4 작업 graph 등록 + 사용자 승인 진행 (auto mode 빠르게 진행 지시).

## Non-goals

- **노트 기능 제거** — `SermonNoteEditor` 컴포넌트·hook 그대로 보존. 단 본 페이지 노출 위치는 본 task에서 미정 (별도 후속 task에서 footer 영역·별도 페이지·collapsible 등 결정).
- 모바일 layout 별도 처리 (Phase 2-4)
- 시리즈 사이드바 우측 배치 (Phase 2-2 — 본 task는 좌측 메인만)
- 같은 설교자 다른 설교 (Phase 2-3)
- `<SermonVideoPlayer>`/`<SermonVideoTools>` 자체 수정 — props 동일, 위치만 영상 직하단 유지
- JSON-LD / `incrementSermonViewCount` / `generateMetadata` 등 `[id]/page.tsx` 로직 변경
- `getSermonsBySeries` / `<SeriesEpisodeList>` 동작 변경

## Success Criteria

1. **Tabs 폐기** — `Tabs` import + `useState('summary')` + `TabContent` sub-component 모두 제거. `'use client'` 유지 (router push 사용).
2. **순차 layout** — 메타 블록 직하 순서: (a) `<ScriptureBlock>` 인용(scripture_text 있을 때만), (b) `summary` paragraphs (paragraphs 분할 렌더), (c) resources 섹션(`active resources.length > 0`이면), (d) `<SeriesEpisodeList>`(시리즈 있으면) — mockup line 248-273 순서와 동일.
3. **메타 컴팩트 + 시리즈 링크** — 현 `SermonMeta`의 시리즈 라벨을 `<Link href={\`/sermons/series/${seriesId}\`}>`로 감싸 클릭 시 시리즈 페이지 이동. duration 추가(메타 한 줄에 날짜·service_type·duration·preacher).
4. **노트 임시 위치** — `<SermonNoteEditor>`는 페이지 최하단(SeriesEpisodeList 아래) collapsible 영역으로 임시 배치. mockup에 없으나 기능 보존 위해. 별도 task 결정 전까지 임시.
5. **SCSS 토큰 정합** — 추가/수정 SCSS는 semantic 토큰만. 신규 local var은 mockup-cite 주석 필수. 하드코딩 0건.
6. **검증 통과** — `node scripts/verify-task.mjs sermons-detail-main` 통과 + `yarn dev` 수동: `/sermons/[id]` 200, 영상 / 메타(컴팩트+시리즈 링크) / scripture_text / summary / resources / SeriesEpisodeList / 노트 영역 순차 렌더, Tab UI 흔적 없음.

## 영향받는 파일

- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — Tabs 폐기, 순차 layout, 메타 컴팩트, 시리즈 링크, 노트 임시 위치
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.module.scss` — Tab 관련 클래스(`.tab_content`/`.tab_panel`/`.empty`) 제거 + 순차 layout 클래스 추가
- 수정 없음: `[id]/page.tsx` / 모든 sub-component (Video/ScriptureBlock/Series 등)

## 단계별 체크리스트

- [ ] 1. `SermonDetailPage.tsx`에서 `Tabs`/`useState`/`TABS`/`TabContent`/`SermonNoteEditor` import + 사용 정리. Tabs 폐기, scripture/summary/resources를 단순 순차 JSX로 인라인
- [ ] 2. `SermonMeta` 인라인 컴포넌트에 `duration` 메타 한 줄 추가 + 시리즈 라벨 `<Link href={\`/sermons/series/${sermon.sermon_series?.id}\`}>` 감싸기 (sermon_series가 있을 때만 link)
- [ ] 3. summary 렌더 — 기존 SermonDetailPage:144 단일 `<p className={styles.summary_text}>{sermon.summary}</p>` 유지 + SCSS `.summary_text { white-space: pre-wrap }` 추가 (D4)
- [ ] 4. resources 섹션을 Tab content에서 페이지 본문 직속으로 이관 — 기존 `.resource_list`/`.resource_item` SCSS 그대로 사용
- [ ] 5. 페이지 최하단에 `<SermonNoteEditor>` 임시 배치 (collapsible 또는 단순 노출 — 디자인 결정 미루고 단순 노출)
- [ ] 6. `.module.scss`에서 Tab 관련 클래스 정리 + 순차 layout 클래스(`.scripture_section`/`.summary_section`/`.resources_section`) 추가. 토큰 `$content-gap-l`/`$section-gap-40` 등 사용
- [ ] 7. `yarn dev` 수동 — 시리즈 있는 설교 + 단독 설교 + scripture_text 있음/없음 + resources 있음/없음 4 케이스 렌더
- [ ] 8. `node scripts/verify-task.mjs sermons-detail-main` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동 (yarn dev)
# → http://localhost:3000/sermons/[id]  (시리즈 있는 설교)
#    영상 / 메타(컴팩트+시리즈 라벨 링크) / scripture_text 인용 / summary paragraphs / resources / SeriesEpisodeList / 노트 영역
# → http://localhost:3000/sermons/[id]  (단독 설교, scripture_text 없음, resources 없음)
#    영상 / 메타(시리즈 없음) / summary / 노트 영역 — scripture·resources 섹션 미렌더
# → 시리즈 라벨 클릭 → /sermons/series/${seriesId} 이동
# → Tab UI 흔적 0 (tabpanel/role="tab" 등 DOM에 없음)

node scripts/verify-task.mjs sermons-detail-main
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, fresh thread `ae4aa5419f3bd7ef7`)
- **5체크**: 1·2·3·4 YES, 5 새 추상화 0(기존 컴포넌트 5개 재사용).

**Codex verdict** (verbatim 발췌):
> a) D1 Tabs 폐기: mockup `248-273`과 현 Tabs 충돌을 근거로 한 결정은 적절함. 대안 검토는 짧지만, 목표가 mockup 정합이면 충분함.
> b) D2 노트 임시 위치: `SeriesEpisodeList` 아래 노출은 사용자 혼란 hypothesis 있음. 단, 기능 보존과 후속 task 명시가 있어 material blocker는 아님.
> c) `summary split('\n\n')`: plan 본문에는 없음. 구현자가 이 방식을 쓰려 한다면 markdown/HTML 혼재 입력에서 깨질 수 있으므로 SC에 "기존 summary 렌더 보존" 1줄 추가 권장.

**평이 풀이**: 5체크 + a/b PASS, c는 expression-only. summary 렌더 방식은 SC#3 "paragraphs 분할" 표현이 모호 → 기존 단일 `<p>` 렌더를 유지하고 SCSS `white-space: pre-wrap`로 줄바꿈 처리 결정(D4).

## Codex 1차 검증

- **결론**: **PASS** (2026-05-14, fresh thread `a90ff12d3433231f2`)
- **검토 범위**: 2 파일 staged diff (`SermonDetailPage.tsx` + `.module.scss`)

**Codex verdict** (verbatim 발췌):
> P1 `use client` 유지 OK: `useRouter` line 4, `router.push` callbacks line 32-39.
> P1 `ScriptureBlock` 조건 OK: `sermon.scripture && sermon.scripture_text` line 57.
> P1 `SermonMeta` 타입 OK: 호출 line 51-55, props type line 90-94 일치.
> P2 `Link` OK / `SermonNoteEditor` OK: client parent.
> P3 sub-components 미수정 / `[id]/page.tsx` 변경 0 / 노트·시리즈 보존.
> P4 token OK: 하드코딩 0건.
> D1 OK: `Tabs|TABS|activeTab|useState|tab_` 0건.
> D2 OK: 주석 line 80, 노트 line 81.
> D3 OK: `/sermons/series/${series.id}` line 103.
> D4 OK: `white-space: pre-wrap` line 105.

**평이 풀이**: 13개 점검(P1-P4 + D1-D4) 모두 PASS. Tabs/useState/TABS/tab_ 클래스 모두 제거 확인(`grep` 0건), `<Link>` 시리즈 라벨 + `pre-wrap` summary + 노트 임시 노출 주석 + ScriptureBlock null-safe 조건 모두 plan과 정합.

## Claude 2차 검증

- **검토 내용**: 2 파일 staged diff(`git diff --cached`) 교차 확인 + Codex 1차 PASS 13개 항목 검증.
  - `SermonDetailPage.tsx`(약 150줄, 기존 205줄에서 축소): `useState`/`TABS`/`TabContent`/`Tabs` import + 사용 모두 제거 확인 (`grep`). `SermonMeta`는 sermon 객체 prop으로 통합(개별 8 props → 3 props로 단순화). `<Link href={\`/sermons/series/${series.id}\`}>` 감싸기 — `series` truthy 분기, plain text fallback "단독 설교". `ResourceList` sub-component 분리(현 메인 함수 75줄). `SermonNoteEditor` 페이지 최하단 임시 노출 + 주석으로 D2 의도 명시.
  - `SermonDetailPage.module.scss`: `.tab_content`/`.tab_panel`/`.empty` 3 클래스 제거. `.summary_text { white-space: pre-line → pre-wrap }` (D4). `.series_tag`에 `align-self: flex-start` + `text-decoration: none` + `hover-color-shift($primary-hover)` 추가. `.series_tag_plain` 신규(단독 설교용 $txt-tertiary).
- **실행한 검증**: `node scripts/verify-task.mjs sermons-detail-main` (run-id `20260514-192907`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - `logs/sermons-detail-main/20260514-192907/summary.log`: `✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채)`.
  - `git status -s`: M 2 + A 1 — plan §영향받는 파일과 일치 (SermonDetailPage 2 파일 + exec-plan).
- **남은 항목**: `yarn dev` 수동 검증 (`/sermons/[id]` 진입: 4 케이스 — 시리즈 있음+scripture+resources / 시리즈 없음+scripture / scripture_text 없음 / resources 없음. Tab UI 흔적 0, 시리즈 라벨 클릭 → `/sermons/series/${id}`, summary 줄바꿈 보존, 노트 영역 최하단 노출).
- **최종 판단**: ✅ **PASS** — verify-task PASS + Codex 1차 PASS + diff 교차 확인 일치. 사용자 yarn dev 수동 검증 후 commit 진행 가능.

---

## 의사결정 로그 (사전 기록)

- **2026-05-14 D1 — Tabs 4분할 폐기 + 순차 layout**: mockup `Sermon-Implementation-Prompts.md:248-273`은 4 영역(scripture/summary/resources/노트) 순차 펼침. 현 dnchurch는 Tabs UI로 4분할 — 모바일에서 1 탭만 보이고 콘텐츠 발견성 ↓. UX 통일 위해 Tabs 폐기. 트레이드오프: 페이지 길이 ↑, 스크롤 부담. mockup 디자인 의도 우선.
- **2026-05-14 D2 — `<SermonNoteEditor>` 임시 위치**: mockup에 노트 영역 없음. 본 task에서 노트 기능 제거하면 dnchurch 자체 기능 손실. 보존 전략: SeriesEpisodeList 아래 단순 노출 (임시). 별도 task에서 collapsible / 우측 사이드바 / 별도 페이지 중 결정. 본 task는 "기능 보존 + 위치 후속"으로 좁힘.
- **2026-05-14 D3 — 시리즈 라벨 → 페이지 링크**: mockup 명시 "시리즈명 · 회차 + 시리즈 페이지 링크". 현 `SermonMeta` 라벨은 plain text. `<Link href={\`/sermons/series/${sermon.sermon_series?.id}\`}>`로 감싸 클릭 가능. Phase 1-3 시리즈 카드 link와 동일 경로 컨벤션(`[id]` 디렉토리).
- **2026-05-14 D4 — summary 렌더 (Codex CR-c expression 반영)**: 1차 plan SC#3 "summary paragraphs 분할" 표현이 `summary.split('\n\n')` 가정으로 읽힘 — Codex 지적: admin UI가 markdown/HTML 혼재 입력 시 raw split이 깨짐. 해결: 기존 SermonDetailPage:144-148 단일 `<p className={styles.summary_text}>{sermon.summary}</p>` 렌더 유지 + SCSS `.summary_text { white-space: pre-wrap }` 추가로 줄바꿈 보존. 시각적으로 "paragraphs"처럼 보이되 입력 형식과 무관. 향후 markdown 렌더링 도입은 별도 task (mdx 또는 react-markdown 등).

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 2-1 (line 246-273)
- `docs/references/sermons/ChurchSermonAll.jsx` — `SermonMeta`(line 992-1015), `DetailPCBody` (영역 line 별도 mockup)
- 기존 자산: `SermonDetailPage.tsx`(205줄), `SermonVideoPlayer` / `SermonVideoTools` / `ScriptureBlock` / `SeriesEpisodeList` / `SermonNoteEditor`
- Phase 1-3 시리즈 link 컨벤션: `/sermons/series/${id}` (의사결정 로그 D7)

## 회고 (필수 5필드)

- KPI / 시작-종료 (분): ~60 (Tabs 폐기 + 순차 layout + SermonMeta 통합 + summary white-space + 시리즈 라벨 Link)
- KPI / Codex 라운드: 2 (계획 PASS_WITH_DECISION_LOG `ae4aa541` + 1차 PASS `a90ff12d`)
- KPI / material 사후 발견: 1 (PR #90 Gemini medium — preacher 결합 inline 중복. formatPreacherLabel을 import만 추가하고 실제 사용은 inline 결합 — 직접 작성과 import 활용 분리 검토 안 함)
- KPI / harness-gate placeholder fail: 0
- KPI / 사용자 검토 부족 피드백: 0

## 회고

- 잘된 것: Tabs UI 폐기를 의사결정 로그 D1-D4로 명시. 큰 리팩터(205→150줄)임에도 외과적(2 파일) + 컴포넌트 5개 재사용으로 Codex 양 라운드 PASS.
- 다음에 할 것: utils 함수가 있으면 import 즉시 활용. preacher 결합 같은 흔한 패턴은 inline 작성 전 `utils/{도메인}.ts` 빠르게 grep 습관.
- 발견된 부채: SermonNoteEditor 위치 임시 — main_column 끝 단순 노출, Phase 2-2/2-3/2-4 누적 후에도 미해결. 별도 task에서 collapsible / 우측 사이드바 / 별도 페이지 중 결정 필요.
