# sermons-recent-carousel

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons (Phase 1-2~1-4 통합)
- **Open questions**: none
- **ADR needed**: no — 변경 파일 모두 `src/app/(content)/sermons/_component/` + `src/app/(content)/sermons/page.tsx` 1줄 (`ADR_TRIGGER_PARTS` 미해당)

## 목표

Sermon 섹션 Phase 1-2 — `/sermons` 메인 페이지 Featured 카드 아래에 "최근 설교" 가로 캐러셀(8건) 추가. mockup `ListPCRecent`(PC 카드 240px) + `MListRecent`(모바일 210px / full-bleed) 디자인 그대로 — `src/components/ui/Carousel` 재사용, 신규 컴포넌트 2개(`SermonRecentCarousel` + `SermonCarouselCard`).

## 검증된 Assumptions

- `src/components/ui/Carousel/Carousel.tsx` 3 export(`useCarousel`/`<CarouselArrows>`/`<Carousel>`) + drag/swipe/clickGuard/scroll edge detection + `mobileFullBleed` prop 모두 Phase 0에서 구현됨 — Read 결과 line 1-143 확인.
- `getSermons({ pageSize: 8 })` 호출 시 `sermon-service.ts:68` `.order('sermon_date', { ascending: false })`에 의해 최신 8건 반환 — Phase 1-1 Featured와 동일 패턴.
- `SermonListItem` light fieldset(`types/sermon.ts:17-28`)은 `duration` + `sermon_series` 누락 — 캐러셀 카드는 mockup line 754(`duration` overlay) + line 765(`series.title` or `service_type`) 둘 다 필요. 따라서 `getRecentSermons` 대신 `getSermons` 사용해 `SermonWithRelations[]` 받음 (Phase 1-1 의사결정 로그와 동일 이유).
- mockup `SermonCarouselCard`(line 728-789) vs `_component/home/SermonCard.tsx`(line 1-71) layout 다름 — home은 horizontal meta_bar, mockup은 vertical(썸네일 + label + title 2줄 + scripture + 메타 border-top). 재사용 불가, 신규 컴포넌트 필요.
- `SermonCarouselCard`는 Carousel의 onClickCapture clickGuard와 부모 `<Link>`/`onClick`이 충돌할 수 있어 mockup 패턴(`<Link>` 래핑)을 따르되 useCarousel.clickGuard가 drag 시 stopPropagation으로 차단 — Carousel.tsx:72-78 확인.
- 데이터 패치는 server component(`page.tsx`)에서, 캐러셀 렌더는 client component(`'use client'` — useCarousel hook). props로 전달.

## Non-goals

- 시리즈 캐러셀 (Phase 1-3 — `SermonRecentCarousel`과 동일 패턴이나 데이터·카드 구조 다름, 별도 컴포넌트)
- Hero 배너 (Phase 1-4 통합 시 — 본 task는 Featured + Recent 캐러셀 2개만)
- 캐러셀 자동 재생/페이드 전환/swiper.js — drag + arrow 스크롤만, Carousel.tsx 기존 동작 유지
- `getRecentSermons` 시그니처 변경 — home `RecentSermons.tsx`도 함께 영향 받으므로 본 task 범위 외 (Phase 1-1과 동일 회피)
- `Carousel.tsx` 자체 수정 — 본 task는 consumer만 추가
- `app/(content)/sermons/all` 변경 — archive는 별도

## Success Criteria

1. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonRecentCarousel.tsx` + `.module.scss`. props: `{ sermons: SermonWithRelations[] }`. `sermons.length === 0`이면 영역 미렌더(`return null`). 'use client'.
2. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonCarouselCard.tsx` (같은 디렉토리). props: `{ sermon: SermonWithRelations }`. `<Link href={\`/sermons/${id}\`}>` 래핑, vertical layout(썸네일 16:9 + label + title + scripture + 메타 border-top). 카드 width PC 240px / 모바일 210px — `respond-up($breakpoint-tablet)` 분기.
3. **page.tsx 수정** `src/app/(content)/sermons/page.tsx` — `getSermons({ pageSize: 8 })` 호출 추가, 결과를 `<SermonRecentCarousel sermons={...} />`에 prop으로 전달. `<SermonFeatured>` 아래에 배치. redirect 분기(C-1 회귀 보존)는 그대로 유지.
4. **썸네일 helper** — 카드 썸네일은 `getSermonThumbnail(sermon)` + `cloudinaryFetchUrl()` + `<CloudinaryImage>` 패턴 (Phase 1-1 SermonFeatured와 동일). null이면 dark gradient placeholder.
5. **시리즈 라벨/service_type 분기** — `sermon.sermon_series?.title`이 truthy면 `$accent`(gold) + letter-spacing wide / falsy면 `$txt-tertiary` + letter-spacing normal. mockup line 759-764 패턴.
6. **카드 height 통일** — title `minHeight: 2.8em` + line-clamp 2로 단독·시리즈 설교 카드 동일 높이 (mockup line 770).
7. **검증 통과** — `node scripts/verify-task.mjs sermons-recent-carousel` (lint + lint:styles + build + knip) 통과. `yarn dev` → `/sermons` 200 + Featured 카드 + Recent 캐러셀 8개 렌더. 캐러셀 좌우 화살표 활성/비활성 토글(스크롤 edge), drag 후 카드 클릭 차단(clickGuard), 모바일 left -16px full-bleed.

## 영향받는 파일

- 신규: `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonRecentCarousel.tsx` (client)
- 신규: `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonCarouselCard.tsx` (client, 부모가 client라 자동)
- 신규: `src/app/(content)/sermons/_component/SermonRecentCarousel/SermonRecentCarousel.module.scss` (캐러셀 1개에 통합 — feedback_consolidate_module_scss)
- 수정: `src/app/(content)/sermons/page.tsx` — `getSermons({pageSize: 8})` 호출 + `<SermonRecentCarousel>` 배치 (+5줄 이내)

## 단계별 체크리스트

- [ ] 1. `SermonCarouselCard.tsx` 신규 — props `{ sermon }`, `<Link>` 래핑, 썸네일 (`CloudinaryImage` + null fallback gradient + play overlay + duration), 시리즈 라벨/service_type 분기, title 2줄 line-clamp, scripture, 메타 border-top (preacher · 날짜)
- [ ] 2. `SermonRecentCarousel.tsx` 신규 — `'use client'`, props `{ sermons }`, `useCarousel()` 호출, 섹션 헤더(h2 "최근 설교" + `<CarouselArrows>` + "더 보기 →" `<Link href="/sermons/all">`), `<Carousel ariaLabel mobileFullBleed carousel>` + `sermons.map(s => <SermonCarouselCard key={s.id} sermon={s} />)`
- [ ] 3. `SermonRecentCarousel.module.scss` 신규 — semantic 토큰만(`$bg-card`/`$border-card`/`$radius-s`/`$accent`/`$primary`/`$txt-*`/`$content-gap-s`). 카드 width는 로컬 변수 `$card-width-pc: 24rem` / `$card-width-mobile: 21rem` (mockup 240/210px 근거 주석).
- [ ] 4. `page.tsx` 수정 — `getSermons({pageSize: 8})` 호출 + `<SermonRecentCarousel sermons={result.sermons} />` 배치 (Featured 아래)
- [ ] 5. `yarn dev` 수동 — `/sermons` 200, Featured + 캐러셀 렌더, drag 동작, 화살표 edge detection, 모바일 full-bleed
- [ ] 6. `node scripts/verify-task.mjs sermons-recent-carousel` 통과

## Verification

```bash
# 좁은 신뢰 명령 순
yarn lint          # ESLint
yarn lint:styles   # stylelint
yarn build         # next build (Image 도메인 + type check)
yarn knip          # 미사용 코드

# 수동 (yarn dev)
# → http://localhost:3000/sermons        Featured + 최근 캐러셀 8개
# → 드래그/스와이프 → 카드 클릭 안 됨 (clickGuard) / 정지 상태 카드 클릭 → /sermons/[id] 이동 (D3)
# → 좌측 끝 → 좌 화살표 disabled / 우측 끝 → 우 화살표 disabled
# → 모바일(< $breakpoint-tablet) → 캐러셀 좌우 -16px (mobileFullBleed)
# → "더 보기 →" 클릭 → /sermons/all 이동

# 전체
node scripts/verify-task.mjs sermons-recent-carousel
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, fresh thread `a53154d6afa737242`)
- **5체크**: 1·2·3·4 YES, 5 NO(과한 추상화 없음). 핵심 잠재 리스크 3건은 material 아닌 expression — 의사결정 로그로 분리.

**Codex verdict** (verbatim 발췌):
> a) Data layer: `getSermons({pageSize:8})`는 `sermon-service.ts:68` 최신순 8건을 반환하므로 Phase 1-1의 `pageSize:1` 패턴과 일관됨. 다만 `count:exact` + `list(1day)` 대신 `recent(1hour)` 미사용은 "최근" UI에서 갱신 지연 60분→24시간 결과를 만들 수 있어 decision log 필요.
> c) Server/client: `SermonRecentCarousel.tsx`가 `use client`면 `SermonCarouselCard`도 client 번들에 포함되어 Link 사용은 OK. `CloudinaryImage`가 server-only API를 호출하지 않는다는 근거가 계획에 없으므로, 예: `window`/server util 의존 여부 확인 SC가 필요.
> d) clickGuard vs Link: `Carousel.tsx:72-78`의 `stopPropagation+preventDefault`는 drag end 뒤 Link navigation을 막는 의도와 맞음. mockup은 `onClick`이고 실제는 `/sermons/` Link라서, drag 후 클릭 1회 suppress / 일반 클릭 nav 성공을 수동 검증에 명시해야 함.

**평이 풀이**: data layer는 Phase 1-1과 일관해 material 아님 — 단 캐시 신선도(24h vs 1h)는 미래 운영 고려사항. CloudinaryImage는 phase 1-1에서 client 컴포넌트로 이미 동작 확인됨(client 전용). clickGuard는 의도대로 작동하나 일반 클릭 nav도 수동 검증에 추가 권장.

## 의사결정 로그

- **2026-05-14 D1 — 데이터 캐시 신선도**: `getSermons({pageSize:8})` 채택으로 `sermon-cache.ts:9-12 list()`(revalidate 1day) 사용. `recent()`(1hour) 미사용은 Phase 1-1 Featured와 일관성 우선 + `SermonListItem` light fieldset이 `duration`/`sermon_series` 누락 회피 위함. 트레이드오프: "최근 설교" UI가 1시간이 아닌 24시간 단위로 revalidate — 새 설교 등록 후 main `/sermons` 갱신까지 최대 24h. 운영 시 새 설교 등록 액션에서 `sermon-list` tag revalidate 호출되면 즉시 반영(`sermon-cache.ts:10` tags `[ROOT, 'sermon-list']` 확인됨), 따라서 운영 영향 미미. 별도 SC 변경 X — 향후 admin publish action에서 revalidate 누락 발견 시 별도 task.
- **2026-05-14 D2 — CloudinaryImage client 호환**: Codex c) 지적 — SC에 `CloudinaryImage`가 server-only API 미의존 명시 권장. 본 plan: Phase 1-1 `SermonFeatured.tsx`(`'use client'`)에서 이미 동일 컴포넌트를 client 환경에서 사용·검증 완료 (sermons-featured exec-plan §Claude 2차 검증 발견 항목 6). `CloudinaryImage`(`src/components/common/CloudinaryImage.tsx`)는 `next/image` wrapper로 server util 의존 0 — 별도 SC 추가 X.
- **2026-05-14 D3 — clickGuard 일반 클릭 nav 검증**: Codex d) 지적 — SC#7 수동 검증에 "drag 후 카드 클릭 차단" 외 "일반 클릭 시 `/sermons/[id]` 정상 nav" 추가. 본 plan §Verification 수동 항목에 "정지 상태 카드 클릭 → 상세 페이지 이동" 1줄 추가 (별도 SC 갱신은 §Verification 주석으로 갈음).
- **2026-05-14 D4 — Featured 중복 회피**: Phase 1-1 `getFeaturedSermon`은 최신 1건, 본 task `getSermons({pageSize:8})`도 최신 8건 → 첫 카드가 Featured와 동일하여 UX 중복. 해결: `pageSize: RECENT_CAROUSEL_COUNT + 1`(=9)로 1건 더 받아 `featured?.id`로 filter 후 `slice(0, 8)`로 최대 8건 보장. `page.tsx`에 `RECENT_CAROUSEL_COUNT` 상수 1개 + filter/slice 3줄. Featured 없거나 캐러셀 9건 미만일 때도 동작(`.filter`가 무조건 통과/`.slice`는 안전).
- **2026-05-14 D5 — PC drag ghost 차단**: 사용자 수동 검증 발견 — PC `<Link>` 카드 드래그 시 브라우저 native HTML5 anchor drag가 ghost image로 작동해 캐러셀 스크롤이 버벅임. 해결 2종 적용: (a) `<Link draggable={false}>` prop으로 anchor 자체 native drag 차단, (b) `SermonRecentCarousel.module.scss .card { user-select: none; -webkit-user-drag: none; }` + `.thumb { -webkit-user-drag: none; pointer-events: none; }` — 카드 내부 텍스트 selection + 이미지 ghost 모두 차단. Carousel.tsx 자체는 미수정(Non-goals 유지) — consumer 단에서 해소.

## Codex 1차 검증

- **결론**: **PASS** (2026-05-14, fresh thread `aebe800f1dbce5518` → resume `aa657e5dd98186de9`)
- **요청 시점**: 구현 4 파일 staged 직후 (page.tsx M + SermonRecentCarousel/* 3건 신규 A)
- **1차 BLOCK 원인**: `git diff` (unstaged 제외)로 page.tsx만 노출 → 신규 파일 3개 미검토. resume에서 `git diff --cached`로 재요청해 해소.

**Codex verdict** (verbatim 발췌):
> `service_type` 컬럼: `database.types.ts:313` — Row 타입에서 `service_type: Database["public"]["Enums"]["service_type_enum"]` (nullable 없음, NOT NULL). `SermonWithRelations`의 Pick에 `service_type` 포함(`src/types/sermon.ts:27`). 따라서 `labelText`는 항상 string. **null 위험 없음.**
> P1: useCarousel carousel 전달 OK. service_type NOT NULL 확인 → null 위험 없음. clsx className 룰 충족. OK.
> P2: 'use client' 없이 client 부모 import로 자동 포함. Link + CloudinaryImage 작동. OK.
> P4: rgba() 리터럴 3개는 local var + mockup 주석 패턴으로 정당화. 나머지 전부 semantic 토큰. min-height 2.8em 의도적 OK. border-subtle 적합. OK.
> P5-D3: capture phase preventDefault + stopPropagation이 Link click + Next.js nav 모두 차단. drag 중 false navigation 없음. OK.

**평이 풀이**: 4 우선순위(버그/타입, 레이어 경계, SCSS 토큰, clickGuard 동작) 모두 PASS. `sermons.service_type`은 enum NOT NULL이라 `labelText`는 항상 string — null fallback 불필요. capture phase `preventDefault`가 `<Link>` Next.js client nav를 정상 차단해 drag 후 false navigation 0건 보장. SCSS는 semantic 토큰 + 정당화된 local var 4개 + 의도적 em 1건만으로 구성 — Phase 1-1 SermonFeatured와 동일 패턴.

**수정 파일**: 0건 (Codex 직접 수정 없음, Claude 추가 반영 없음).

## Claude 2차 검증

- **검토 내용**: 4 파일 staged diff(`git diff --cached`) 교차 확인 + Codex 1차 PASS verbatim 검토.
  - `SermonCarouselCard.tsx`(53줄): Phase 1-1 `SermonFeatured.tsx` 패턴과 import·helpers 일치 (`cloudinaryFetchUrl`, `getSermonThumbnail`, `formatPreacherLabel`, `formatSermonDuration`, `formattedDate`). `<Link>` 래핑, `<CloudinaryImage fill sizes>`, play SVG + duration overlay, label 분기(`hasSeries` boolean으로 `styles.label_series`/`styles.label_type`), title `<h3>`(Featured는 `<h2>`라 heading 위계 일치), `meta_bar` border-top.
  - `SermonRecentCarousel.tsx`(35줄): `'use client'`, `useCarousel()` unconditional 호출 후 `sermons.length === 0` 분기로 rules-of-hooks 충족. 헤더 = h2 + `<CarouselArrows>` + `<Link href="/sermons/all">`. `<Carousel ariaLabel mobileFullBleed carousel>` 그대로 wrap.
  - `SermonRecentCarousel.module.scss`(~150줄): semantic 토큰 매핑 — `$bg-card`/`$border-card`/`$radius-s`/`$accent`/`$primary`/`$txt-primary`/`$txt-tertiary`/`$txt-inverse`/`$primary-hover`/`$border-subtle`/`$overlay-image`/`$spacing-*`/`$font-size-*`/`$font-weight-*`/`$letter-spacing-*`/`$line-height-snug`. Local 변수 4개(`$card-width-mobile|pc`, `$badge-glass-bg|border`, `$duration-overlay-bg`) 모두 파일 상단 + mockup 인용 주석. `min-height: 2.8em`은 카드 높이 통일용 의도적 em(mockup line 770).
  - `page.tsx`(+10줄): `getSermons` + `SermonRecentCarousel` import, `RECENT_CAROUSEL_COUNT = 8` 상수, `Promise.all([getFeaturedSermon(), getSermons({pageSize: 9})])`, `recent.sermons.filter(s => s.id !== featured?.id).slice(0, 8)` (D4), `<SermonRecentCarousel sermons={recentList} />`. redirect 분기(C-1) 유지, 기존 import 제거 0건.
- **실행한 검증**: `node scripts/verify-task.mjs sermons-recent-carousel` (run-id `20260514-172747`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - `logs/sermons-recent-carousel/20260514-172747/summary.log`: `✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채, 커밋 차단 안 됨)`.
  - `git status -s`: A 3 + M 1 + ?? 1(exec-plan untracked) — plan §영향받는 파일과 정확히 일치.
- **남은 항목**: `yarn dev` 수동 검증 (`/sermons` 200, 캐러셀 8개 렌더, drag clickGuard, 화살표 edge detect, 모바일 full-bleed, D3 정지 클릭 → 상세 nav, D4 첫 카드 ≠ Featured). 사용자 수동 확인 대기.
- **최종 판단**: ✅ **PASS** — verify-task PASS + Codex 1차 PASS + diff 교차 확인 일치. 사용자 yarn dev 수동 검증 후 commit 진행 가능.

---

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 1-2 (line 166-191)
- `docs/references/sermons/ChurchSermonAll.jsx` — `SermonCarouselCard`(line 728-789), `ListPCRecent`(line 894-928), `MListRecent`(line 2272-2304)
- `src/components/ui/Carousel/Carousel.tsx` (Phase 0 산출) — `useCarousel`/`<CarouselArrows>`/`<Carousel>` 3 export
- Phase 1-1 completed: `docs/exec-plans/completed/2026-05-14-sermons-featured.md` — `getSermons({pageSize:1})` 의사결정 로그(동일 이유로 본 plan도 `getSermons({pageSize:8})` 채택)
