# sermons-main-layout

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons
- **Open questions**: none
- **ADR needed**: no — `src/app/(content)/sermons/page.tsx` 1줄 + 신규 SCSS 1개 (ADR_TRIGGER_PARTS 미해당)

## 목표

`/sermons` 메인 페이지 3 섹션(Featured / Recent 캐러셀 / Series 캐러셀) 사이에 vertical spacing + page top/bottom padding 적용. mockup `ListPCBody` PC 40-44px / 모바일 22-24px 섹션 간격 + PC 32px top/48px bottom 패딩 의도 반영. Hero는 `(content)` route group이 자동 적용 — 본 task 신규 X.

## 검증된 Assumptions

- `(content)/layout.tsx`(line 1-30)가 `<Hero />`를 자동 렌더 + `resolveHeroMeta('/sermons')` `hero.config.ts:14` 매핑 (`{title: '설교', subtitle: '주일 말씀과 강해 설교를 만나보세요', eyebrow: 'SERMONS'}`) → mockup `ListPCHero`(WORD/설교) `MListBanner` 의도와 동일. 본 task에서 Hero 컴포넌트 신규 X.
- `LayoutContainer.tsx` `LayoutContainer.module.scss`(line 1-5): horizontal padding만 (`$container-padding`) + max-width (`$container-max`). vertical padding/section spacing 없음 — 페이지 단에서 책임.
- `LayoutContainer` props: `{ children, className? }` — `clsx(styles.container, className)` (확인됨). 외부에서 `className` 주입 시 모듈 SCSS 추가 스타일 가능.
- `$section-gap-40`(40px), `$section-gap-64`(64px), `$section-gap-80`(80px) 토큰 존재(styles SKILL). 모바일 22-24px용 토큰은 별도 없음 — `$spacing-24` 또는 `$content-gap-xl`(32px) 또는 `$section-gap-40` 통일 사용.
- 현재 `/sermons/page.tsx`(`191a635` HEAD): `<LayoutContainer>` 직속 자식 `<SermonFeatured>` / `<SermonRecentCarousel>` / `<SermonSeriesCarousel>` 3개. 섹션 간 margin 0.

## Non-goals

- Hero 컴포넌트 신규/수정 (기존 자동 적용 그대로)
- `LayoutContainer` 자체 수정 (page-specific spacing이라 외과적 차단)
- `(content)/layout.tsx` 변경
- Phase 2-8 (상세 페이지·전체 시리즈·시리즈 상세 등)
- 모바일 풀폭 캐러셀 padding 재조정 (`mobileFullBleed` prop은 이미 작동)
- 새 spacing 토큰 추가 (`$section-gap-24` 등 — 기존 토큰 재사용)

## Success Criteria

1. **신규 SCSS** `src/app/(content)/sermons/page.module.scss` (또는 동등 위치) — `.sections { display: flex; flex-direction: column; gap: $section-gap-40; padding-block: $spacing-24 $spacing-40; }` (또는 동등). 모바일/PC 모두 동일 토큰 사용(40 + 24/40 패딩).
2. **page.tsx 수정** — `<LayoutContainer className={styles.sections}>` 한 줄 적용. import `styles from './page.module.scss'` 추가.
3. **vertical layout 결과** — `yarn dev` 수동: Featured ↔ Recent 사이 + Recent ↔ Series 사이 가시적 spacing 발생. 페이지 top(Hero 아래) ↔ 첫 섹션 사이 + 마지막 섹션 ↔ Footer 사이 spacing 발생.
4. **Hero 그대로** — `/sermons` 진입 시 기존 Hero(`설교` / `SERMONS` / `주일 말씀과 강해 설교를 만나보세요`) 정상 표시, 본 task로 영향 0.
5. **모바일/PC 호환** — `<` $breakpoint-tablet (모바일) 진입에서도 섹션 간격 + 패딩 동작. 캐러셀 `mobileFullBleed` 좌우 -16px와 충돌 X (page padding은 vertical만, horizontal은 LayoutContainer 그대로).
6. **검증 통과** — `node scripts/verify-task.mjs sermons-main-layout` (lint + lint:styles + build + knip) 통과.

## 영향받는 파일

- 신규: `src/app/(content)/sermons/page.module.scss`
- 수정: `src/app/(content)/sermons/page.tsx` — `styles` import 1줄 + `className={styles.sections}` 1 attr

## 단계별 체크리스트

- [ ] 1. `page.module.scss` 신규 — `.sections { display:flex; flex-direction:column; gap: $section-gap-40; padding-block: $spacing-24 $spacing-40 }` 1 클래스만
- [ ] 2. `page.tsx` 수정 — `import styles from './page.module.scss'` + `<LayoutContainer className={styles.sections}>` 적용
- [ ] 3. `yarn dev` 수동 — `/sermons` Hero + 섹션 spacing 가시적 + 모바일 풀폭 캐러셀 정상
- [ ] 4. `node scripts/verify-task.mjs sermons-main-layout` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동 (yarn dev)
# → http://localhost:3000/sermons   Hero + Featured + Recent + Series, 섹션 간 40px gap, 페이지 top 24px / bottom 40px padding
# → 모바일: 동일 토큰 적용 — 캐러셀 mobileFullBleed 좌우 -16px와 horizontal 충돌 0

node scripts/verify-task.mjs sermons-main-layout
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, fresh thread `a0cff5d12a855dcfd`)
- **5체크**: 1·2·3·4 OK, 5 새 추상화 사실상 없음(`SCSS class 1개 + className 1개`).

**Codex verdict** (verbatim 발췌):
> a) PASS_WITH_DECISION_LOG: fixed 40px가 mobile에서 무거울 수 있어 Phase 1 허용 결정이 필요합니다.
> b) PASS_WITH_DECISION_LOG: 기존 사용례 불명확하므로 `LayoutContainer className` 사용 결정 1줄을 남기면 충분합니다.
> c) PASS: 제공된 관찰 기준상 `page.module.scss` 인접 배치는 일관됩니다.

**평이 풀이**: 5체크 모두 PASS — 새 추상화 0건, 외과적 변경, 검증 가능 SC. 두 expression-only 사항(모바일 40px gap 허용 결정 / `LayoutContainer className` 사용 결정)은 의사결정 로그 분리 + WORK 진입 가능.

## 의사결정 로그

- **2026-05-14 D1 — 모바일/PC gap 단일 토큰 (`$section-gap-40`)**: mockup PC 40-44 / 모바일 22-24로 명시 차이 존재. 본 task는 단일 토큰 채택 — (a) 신규 spacing 토큰 도입 회피(Non-goals), (b) `$section-gap-40`가 _spacing.scss 기준 `var(--spacing-40)` 반응형이라 globals.scss에서 모바일 값이 자동 축소될 가능성. (c) 만약 모바일에서도 고정 40px이면 시각적 부담은 있으나 Phase 1 MVP 허용 범위 — Phase 1 회고 후 사용자 피드백 누적 시 별도 토큰 도입 가능. 운영 트레이드오프 명시.
- **2026-05-14 D2 — `<LayoutContainer className>` 외부 주입 패턴 채택**: `LayoutContainer.tsx:10`이 `clsx(styles.container, className)`로 외부 className을 기본 spec에 합치도록 이미 설계됨. 기존 호출처 대다수가 className 없이 호출하지만, 본 task가 page-specific 섹션 spacing을 LayoutContainer 자체 SCSS에 합치는 대신 page.module.scss에 분리해 LayoutContainer를 page 무관 컴포넌트로 유지. 새 호출 패턴이 아닌 기존 props 활용. 향후 다른 페이지에서도 동일 패턴 가능.

## Codex 1차 검증

- **결론**: 미요청

## Claude 2차 검증

- **최종 판단**: 미작성

---

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 1-4 (line 222-243)
- `docs/references/sermons/ChurchSermonAll.jsx` — `ListPCHero`(line 795-803), `ListPCBody`(line 968-986), `MListBanner`(line 2207-2213), `MListBody`(line 2352-2370)
- `src/components/layout/Hero/hero.config.ts:14` — 기존 `/sermons` HeroMeta 자동 적용
- `src/components/layout/container/LayoutContainer.tsx` + `.module.scss` — horizontal padding/max-width만, vertical은 page 책임
