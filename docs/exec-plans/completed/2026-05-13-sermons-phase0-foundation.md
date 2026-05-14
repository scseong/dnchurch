# sermons-phase0-foundation

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-13
- **브랜치**: feat/sermons (develop 기반)

## 목표

Sermon 섹션 5 페이지 재설계(`docs/references/sermons/`)의 Phase 0 사전 준비 — 디자인 토큰·공용 컴포넌트·유틸·DB 컬럼·네비게이션/Hero/Cloudinary/video provider/metadata 9개 영역 감사 보고서 작성 + 공용 `Carousel` 컴포넌트 신규 + 3 신규 라우트 스켈레톤(`all`, `series`, `series/[id]`). Phase 1 진입 시 "있는지 없는지" 점검 없이 바로 UI 구현 가능 상태.

## Assumptions

- 레퍼런스 mockup 3 파일(`Sermon-Design-Decisions.md`, `Sermon-Implementation-Prompts.md`, `ChurchSermonAll.jsx`)은 **UI/UX 패턴의 SSOT**이지만 **URL 구조의 SSOT가 아니다**. mockup이 `/sermons/[slug]` 패턴이어도 dnchurch는 [PR #68](https://github.com/scseong/dnchurch/pull/68) 결정으로 `[id]` 기반을 유지한다.
- PR #68 핵심 결정: 한글 slug 이중 인코딩(`%EC%...` → `%25EC%...`) + Server Action `redirect()` `x-action-redirect` 헤더 ASCII-only 충돌로 `[slug]` → `[id]` (BIGINT IDENTITY) 마이그레이션 완료. `sermons.slug` 컬럼은 유지하되 URL 미사용(dead code, "차후 정리 시 삭제 가능"). 본 task는 이 정책을 일관 적용.
- DB 컬럼 사전 확인: `sermons.is_featured`(boolean) 존재, `sermon_series.{cover_image_url, description, started_at, ended_at}` 모두 존재(`src/types/database.types.ts:258-297, 483`). `sermon_series.cover_tone` 부재 — **본 task에서 단일 그라데이션 정책으로 확정**(아래 OQ-3 해결).
- 실제 토큰명: `_color.scss`는 primitive(`$navy-800` 등) + semantic(`$txt-primary`, `$bg-primary` 등) 두 단계를 모두 담는다. `_semantic.scss`는 spacing·radius·overlay·focus 담당. mockup의 `navy/beige/gold/textSec/border` 어휘는 `$primary`(navy-800), `$bg-secondary`(beige-150), `$accent`(gold-600), `$txt-secondary`, `$border-card`로 매핑된다(아래 §감사 §1 표).

## Non-goals

- 실제 페이지 UI 구현 (Phase 1~5)
- 데이터 페칭 함수 신규/수정 (Phase 6) — `src/services/sermon/sermon-service.ts`에 손대지 않는다
- DB 마이그레이션 — `cover_tone` 컬럼은 추가하지 않는다(OQ-3: 단일 그라데이션 채택)
- archive(연도별 그룹) 패턴 폐기/이관 결정 — Phase 1 진입 전 별도 사용자 결정 (OQ-1, 본 task 결정 X)
- mock data 모듈(`mocks/sermon.ts`) 생성 — dnchurch는 dev DB(`mficogrxekuahjqborxw`) 기반, mock 단계 불필요
- `[id]` → `[slug]` 라우트 변경 — PR #68 결정 유지. mockup의 `/sermons/[slug]` URL은 채택하지 않는다
- 기존 `_component/SermonListPage/*`, `_component/SermonDetailPage/*` 구조 변경 (Phase 1~2 범위)
- `[slug]` 또는 `[slug]/page.tsx` 신규 — 생성하지 않는다 (PR #68 정책)
- 기존 `[id]/page.tsx` 변경

## Success Criteria

1. exec-plan 본 문서의 §"Phase 0 감사 결과" 섹션에 9 표 작성 완료: (1) 디자인 토큰 매핑(mockup 어휘 → 실제 `$txt-*`/`$bg-*`/`$primary`/`$accent`/`$border-card`), (2) 공용 컴포넌트 13종(BottomSheet/Button/EmptyState/Label/ListItem/Modal/Pagination/Pill/Skeleton/Tabs/Textarea/TextField + Carousel) 매핑 yes/no, (3) 유틸(formatDate/preacherFullName/formatFileSize/getCoverGradient) → `src/utils/` 매핑, (4) DB 컬럼 점검 yes/no, (5) breadcrumb 메커니즘(`src/config/navigation.ts`에 sermons 자식 라우트 4개 등록 필요 여부 결정), (6) Hero child route(`src/components/layout/Hero/hero.config.ts`에 4 페이지 hero meta 등록 필요 여부 결정), (7) 썸네일 호환(`next.config.ts:images.loaderFile` Cloudinary 로더 + YouTube 도메인 허용 여부), (8) 영상 provider(`SermonVideoPlayer.tsx`의 YouTube 전용 여부 + Phase 2 진입 전 분기 추가 필요 여부), (9) metadata+JSON-LD 패턴(`src/app/(content)/sermons/[id]/page.tsx:12-58`의 `generateMetadata`+VideoObject 패턴을 **신규 3 라우트(`all`/`series`/`series/[id]`)**에 동일 적용 가능 여부 — 기존 `[id]` 라우트는 본 task에서 변경 없음). 각 표는 binary(yes/no) 또는 "있음/부분/없음" 판정 가능.
2. `src/components/ui/Carousel/Carousel.tsx` + `.module.scss` 신규. props 인터페이스(mockup `Sermon-Implementation-Prompts.md:74-85` 0-2 요구사항 + WORK 중 발견): `{ children: ReactNode; ariaLabel: string; mobileFullBleed?: boolean; carousel: UseCarouselReturn }` — 4번째 prop `carousel`은 사용처가 `useCarousel()` hook을 호출하고 결과를 `<Carousel>`과 `<CarouselArrows>` 양쪽에 전달하는 mockup 패턴(`ChurchSermonAll.jsx:648-726`)을 그대로 따르기 위함. 화살표가 섹션 헤더 우측에 배치되는 사용자 결정(`Sermon-Design-Decisions.md §2-2`)을 충족하려면 hook을 외부 주입해야 한다. 동작 4 항목: (i) PC 좌우 화살표 클릭 + 마우스 드래그, (ii) 모바일 터치 스와이프, (iii) 드래그 후 click 차단(`dragMoved > 3px`), (iv) 스크롤 끝 도달 시 화살표 disabled. `src/components/ui/index.ts`에 `Carousel`/`useCarousel`/`CarouselArrows` + `UseCarouselReturn` type 4 named export. **사용처 본 task에서 확정** — mockup `Sermon-Implementation-Prompts.md:166-220`이 Phase 1-2(최근 설교 캐러셀) + Phase 1-3(시리즈 미리보기 캐러셀) 사용을 명시하므로 추측성 사전 제작이 아님(CLAUDE.md "단순함 우선" 위배 아님). Phase 1-2/1-3 exec-plan은 본 컴포넌트를 import해 사용만 하고 신규 작성하지 않는다.
3. 3 라우트 스켈레톤 신규: `src/app/(content)/sermons/all/page.tsx`, `src/app/(content)/sermons/series/page.tsx`, `src/app/(content)/sermons/series/[id]/page.tsx`. 각 파일: `LayoutContainer` + h1(한국어 페이지명 1줄) + `metadata`(title/description) 만 포함. `yarn dev` 진입 시 200 응답 + 빈 페이지 + breadcrumb이 표시되면 통과.
4. `node scripts/verify-task.mjs sermons-phase0-foundation` 통과 (lint + lint:styles + build + knip 4 단계).
5. Codex 계획 검증 결과가 `PASS` 또는 `CHANGE_REQUEST → 반영 완료` (본 exec-plan `## Codex 계획 검증`에 기록).

## Verification

```bash
# 단위 검증 (좁은 신뢰 명령부터)
yarn lint          # ESLint (레이어 의존성)
yarn lint:styles   # stylelint (토큰·네이밍)
yarn build         # next build
yarn knip          # 미사용 코드

# 라우트 스켈레톤 수동
yarn dev
# → http://localhost:3000/sermons/all      (200, h1 "전체 설교")
# → http://localhost:3000/sermons/series   (200, h1 "모든 시리즈")
# → http://localhost:3000/sermons/series/test-id (200, h1 "시리즈 상세")

# Carousel 수동 동작 검증은 Phase 1-2(최근 설교) / Phase 1-3(시리즈 미리보기) 사용처 통합 시 수행
# Phase 0에서는 build/type-check 통과로 인터페이스 호환성만 보장 (스토리북 미보유 + 사용처 0)

# 토큰명 검증 (Codex 지적 반영)
rg -n "\\\$txt-primary|\\\$bg-primary|\\\$primary|\\\$accent" src/styles/tokens/_color.scss

# breadcrumb/hero 메커니즘 점검
rg -n "navigation|hero" src/config src/components/layout/Hero -l

# 전체 검증
node scripts/verify-task.mjs sermons-phase0-foundation
```

## 접근법

1. **감사 먼저, 코드 나중.** §Phase 0 감사 결과 9 표를 1순위로 작성. 표를 채우는 과정에서 발견된 결정사항은 의사결정 로그에 1줄로 추가.
2. **Carousel은 mockup 검증 패턴 그대로** — `useCarousel` 훅(scroll 추적/dragGuard/disabled state) + `<Carousel>` presentational(좌우 버튼/스크롤 컨테이너/모바일 full-bleed). data fetching 없음, props 수직 전달.
3. **3 라우트 스켈레톤만** (`all/`, `series/`, `series/[id]/`) — `[slug]` 신규는 생성 안 함(PR #68). 기존 `[id]/page.tsx`는 손대지 않음.
4. **감사 보고서는 본 exec-plan에 인라인** — Codex 지적: `docs/research/`는 "외부 자료 발췌" 용도(`docs/README.md` 정의), `docs/decisions/`는 영구 결정. 9 표 감사는 1회성 + Phase 1~5에서 자연스럽게 archive되므로 별도 파일 X.
5. **OQ-3 단일 그라데이션 채택** — `_semantic.scss:86 $overlay-image`(= `linear-gradient($bg-dark, $navy-950)`) 재사용. **신규 토큰 추가 없음** (§감사 §1 결론 확정).

## 영향받는 파일

- 수정: `docs/exec-plans/active/2026-05-13-sermons-phase0-foundation.md` (감사 결과 9 표 인라인)
- 신규: `src/components/ui/Carousel/Carousel.tsx`
- 신규: `src/components/ui/Carousel/Carousel.module.scss`
- 수정: `src/components/ui/index.ts` (Carousel/useCarousel/CarouselArrows + UseCarouselReturn type export 3줄)
- 신규: `src/app/(content)/sermons/all/page.tsx`
- 신규: `src/app/(content)/sermons/series/page.tsx`
- 신규: `src/app/(content)/sermons/series/[id]/page.tsx`
- 잠재 수정 (감사 결과에 따라): `src/components/layout/Hero/hero.config.ts` (`HERO_META`에 `/sermons/all`, `/sermons/series` 키 2개 추가 — §감사 §6 결정). `src/config/navigation.ts`는 본 task **미변경** (§감사 §5에서 자동 breadcrumb으로 충분, GNB children 추가는 BottomNav·sibling tabs 영향). `src/styles/tokens/_color.scss`는 본 task **미변경** (§감사 §1 결론: `$overlay-image` 재사용, 신규 토큰 없음).

## 단계별 체크리스트

- [x] 1. **§감사 §1** 디자인 토큰 매핑 표 — 12행 채움
- [x] 2. **§감사 §2** 공용 컴포넌트 13종 표 — 13행 binary 채움 (Carousel만 "없음(신규)")
- [x] 3. **§감사 §3** 유틸 매핑 — 6행 채움 (`formatPreacherLabel` 발견 정정)
- [x] 4. **§감사 §4** DB 컬럼 — 8행 binary 채움 (`cover_tone` 부재 → OQ-3 단일 그라데이션)
- [x] 5. **§감사 §5** breadcrumb 메커니즘 — `resolveBreadcrumbSegments` 자동 해석으로 GNB 수정 불필요 결정
- [x] 6. **§감사 §6** Hero child route — `HERO_META`에 `/sermons/all`·`/sermons/series` 2 키 추가 + `resolveHeroMeta` direct-match 1단계 추가
- [x] 7. **§감사 §7** 썸네일 호환 — YouTube 도메인 미허용 발견 → OQ-5 신설(Phase 1-1 entry blocker)
- [x] 8. **§감사 §8** 영상 provider — `SermonVideoPlayer.tsx:25` YouTube 전용 확인 → OQ-4 (Phase 2 entry blocker)
- [x] 9. **§감사 §9** metadata+JSON-LD — 5행 채움 (신규 3 라우트는 정적 metadata만, dynamic은 Phase 3-5)
- [x] 10. `src/components/ui/Carousel/` 2 파일(`Carousel.tsx` + `.module.scss`) + `src/components/ui/index.ts` 3 export 라인. `Carousel/index.ts`는 dnchurch 컨벤션상 미생성
- [x] 11. 라우트 3개 스켈레톤(`all`/`series`/`series/[id]`) — `LayoutContainer` + h1 + metadata만
- [x] 12. `src/components/layout/Hero/hero.config.ts` 등록 갱신 (`navigation.ts`는 미변경)
- [x] 13. Carousel 수동 동작 확인 — **Phase 1-2/1-3 사용처 통합 시 검증**으로 격하. Phase 0에서는 사용처가 없어 단독 동작 검증 불가능(스토리북 미보유). build/type-check 통과로 인터페이스 호환성만 보장.
- [x] 14. 3 라우트 200 응답 + Hero 표시 사용자 수동 확인 완료 (2026-05-13). `/sermons/all`·`/sermons/series`·`/sermons/series/[id]` 모두 정상 렌더.
- [x] 15. `node scripts/verify-task.mjs sermons-phase0-foundation` 통과 (run-id `20260513-213907`)
- [x] 16. Codex 1차 검증 요청 (CHANGE_REQUEST 3건) → Claude 반영 → Claude 2차 검증 PASS 기록

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs sermons-phase0-foundation` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] (필요 시) 마이그레이션 적용 — **본 task에서는 마이그레이션 없음** (OQ-3 단일 그라데이션 채택)
- [ ] (필요 시) ADR 또는 tech-debt-tracker 업데이트 — Phase 2 진입 전 결정 항목 1건(영상 provider 분기 필요 여부)을 `docs/tech-debt-tracker.md`에 "Phase 2 진입 전 결정" 으로 등록

## Phase 0 감사 결과

> ⚠️ **본 섹션의 9 표는 plan 작성 시점에 모두 채워졌다** (Codex 3차 검증 시점 기준). WORK 단계가 남긴 작업은 코드 변경만 — Carousel 신규 3 파일 + 라우트 스켈레톤 3 파일 + 잠재 수정(`navigation.ts` GNB 등록 보류 / `hero.config.ts` `HERO_META` 키 2개 추가 / `_color.scss` 토큰 추가 없음). 표 본문이 갱신되어야 하는 경우(예: WORK 중 새 코드 발견)에는 해당 §의 행을 직접 수정한다.

### §1 디자인 토큰 매핑 (mockup → 실제)

| mockup 어휘 | 실제 토큰 (`src/styles/tokens/_color.scss`) | 비고 |
| --- | --- | --- |
| navy (primary) | `$primary` (= `$navy-800`) | line:99 |
| navy hover | `$primary-hover` (= `$navy-600`) | line:100 |
| beige (page bg) | `$bg-primary` (= `$beige-50`) | line:75 |
| beige (section bg) | `$bg-secondary` (= `$beige-150`) | line:77 |
| gold (accent) | `$accent` (= `$gold-600`) | line:109 |
| gold subtle | `$accent-subtle` (= `$gold-100`) | line:111 |
| textPrimary | `$txt-primary` | line:58 |
| textSec | `$txt-secondary` | line:59 |
| textTer | `$txt-tertiary` | line:60 |
| border (card) | `$border-card` | line:92 |
| border (subtle) | `$border-subtle` | line:88 |
| series hero gradient (mockup `cover_tone`) | `$overlay-image` 재사용 (= `linear-gradient($bg-dark, $navy-950)`) | `_semantic.scss:86` — OQ-3 단일 그라데이션 채택, 신규 토큰 추가 불필요 |

### §2 공용 컴포넌트 13종 매핑

| mockup 컴포넌트 | dnchurch ui/ | 상태 | mockup 사용처 |
| --- | --- | --- | --- |
| BottomSheet | `src/components/ui/BottomSheet/` | 있음 | FilterBottomSheet (전체 설교·모든 시리즈 모바일 필터) |
| Button | `src/components/ui/Button/` | 있음 | "결과 보기" / "더 보기" CTA, "시리즈 상세 →" 텍스트 링크 |
| EmptyState | `src/components/ui/EmptyState/` | 있음 | "검색 결과가 없습니다" 빈 상태 |
| Label | `src/components/ui/Label/` | 있음 | SERIES · ON-GOING / COMPLETED 라벨 (시리즈 헤로·메타) |
| ListItem | `src/components/ui/ListItem/` | 있음 | 시리즈 사이드바 회차 row, 첨부 자료 목록 row |
| Modal | `src/components/ui/Modal/` | 있음 | 본 sermon mockup 직접 사용처 없음 (재사용 후보) |
| Pagination | `src/components/ui/Pagination/` | 있음 | 전체 설교 페이지 PC 페이지네이션 |
| Pill | `src/components/ui/Pill/` | 있음 | 사이드바 RadioOption count 뱃지, Filter Icon 활성 카운트 뱃지 |
| Skeleton | `src/components/ui/Skeleton/` | 있음 | 데이터 로딩 (Phase 6) |
| Tabs | `src/components/ui/Tabs/` | 있음 | PC 정렬 드롭다운(`PCSortDropdown`), 상세 페이지 underline 탭(현행 `SermonDetailPage` 유지) |
| Textarea | `src/components/ui/Textarea/` | 있음 | 본 sermon mockup 직접 사용처 없음 (어드민 폼 재사용) |
| TextField | `src/components/ui/TextField/` | 있음 | 사이드바 검색 input + 모바일 Search input |
| **Carousel** | `src/components/ui/Carousel/` | **없음 (본 task 신규)** | 최근 설교 캐러셀, 시리즈 미리보기 캐러셀 (Phase 1-2 / 1-3) |

### §3 유틸 매핑

| mockup 유틸 | dnchurch | 상태 |
| --- | --- | --- |
| `formatDate` | `src/utils/date.ts:11 formattedDate(date, format)` | 있음 (재사용) |
| `preacherFullName` | `src/utils/sermon.ts:100 formatPreacherLabel(preacher)` | 있음 (이름만 다름, 재사용) — `SermonDetailPage.tsx:34-36`은 인라인 처리 중이라 Phase 2 진입 시 helper로 일관 교체 권장 |
| `formatFileSize` | `src/utils/file.ts:9 convertBytesToFileSize(bytes, decimals)` | 있음 (이름만 다름, 재사용) |
| `formatSermonDuration` | `src/utils/sermon.ts:28` | 있음 (재사용) |
| `getSermonThumbnail` | `src/utils/sermon.ts:18` | 있음 (재사용) |
| `getCoverGradient` | **불필요** | 제외 — OQ-3 단일 그라데이션 채택, mockup의 cover_tone 분기 함수 자체 미작성 |

### §4 DB 컬럼 점검

| 컬럼 | 존재 | 위치 |
| --- | --- | --- |
| `sermons.is_featured` | yes | `database.types.ts:483` |
| `sermons.slug` | yes (dead code, PR #68 — URL 미사용) | `database.types.ts:314` |
| `sermons.series_order` | yes | `database.types.ts:311` |
| `sermon_series.cover_image_url` | yes | `:260` |
| `sermon_series.description` | yes | `:262` |
| `sermon_series.started_at` | yes | `:268` |
| `sermon_series.ended_at` | yes | `:263` |
| `sermon_series.cover_tone` | **no** | — |

### §5 breadcrumb 메커니즘

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| breadcrumb 구현 | `src/config/navigation.ts:171-191 resolveBreadcrumbSegments(pathname)` | GNB_ITEMS(`:19-60`) 기반 자동 해석. 자식 라우트 등록 불필요 — 부모 prefix(`/sermons`) 매칭으로 동작 |
| sermons GNB 등록 | `:41` `{ label: '설교', href: '/sermons' }` (children 없음) | 현행 GNB는 children 없는 단일 항목 |
| `/sermons/all` breadcrumb | 자동 — `홈 > 설교` (자식 라벨 없음, last segment는 표시 안 됨) | 신규 라우트의 자식 라벨이 필요하면 GNB_ITEMS에 children 추가, 그러나 children 추가 시 BottomNav·sibling tabs도 영향 — **본 task에서는 GNB_ITEMS 미변경**, 자동 breadcrumb으로 동작 확인 |
| `/sermons/series` / `/sermons/series/[id]` | 자동 — `홈 > 설교` | 동일. 페이지 내부에 별도 page-level title(`<h1>`)로 위치 표시 |

### §6 Hero child route

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| Hero 메타 해석 | `src/components/layout/Hero/hero.config.ts:25-61 resolveHeroMeta(pathname)` | GNB_ITEMS의 정확 매칭만 hero 표시 — 자식 라우트나 `[id]` 상세 페이지는 `null` 반환(line:48) |
| `/sermons` Hero meta | `:14` `{ title: '설교', subtitle: '주일 말씀과 강해 설교를 만나보세요', eyebrow: 'SERMONS' }` | 카테고리 prefix 매칭으로 동작 |
| `/sermons/all` | 현재는 Hero 표시 안 됨 (`null`) | mockup은 `/sermons/all`도 다크 Hero 사용 → **`HERO_META`에 자체 항목 추가 필요** 또는 GNB children 등록 + hero meta 분기 추가. 본 task §감사 결과로 결정: `HERO_META`에 `/sermons/all`, `/sermons/series` 직접 키 추가하는 방식이 GNB 영향 0이라 권장 |
| `/sermons/series` | 동일 — null | 동일 처리 |
| `/sermons/series/[id]` | 동일 — null. mockup은 시리즈 헤로(다크 그라데이션 + 라벨/제목/메타) 별도 디자인 | Phase 5에서 시리즈 헤로 컴포넌트를 페이지 내부에 직접 작성(`hero.config.ts` 불사용). 본 task에서는 빈 페이지 |

### §7 썸네일 호환

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| `next.config.ts` images.loader | `custom` (line:11), loaderFile `./src/utils/cloudinary.ts` (line:12) | Cloudinary 커스텀 loader가 모든 `<Image>` src를 처리 |
| `remotePatterns` | `res.cloudinary.com` 만 허용 (line:14-19) | YouTube 도메인(`img.youtube.com`/`i.ytimg.com`) **미허용** |
| `getSermonThumbnail` 반환 | `thumbnail_url` 우선, fallback으로 `https://img.youtube.com/vi/{video_id}/maxresdefault.jpg` (`src/utils/sermon.ts:18-26`) | YouTube fallback이 동작하면 next/image가 외부 URL 처리 시 fetch 실패 가능 |
| 결정 | **Phase 1-1(이번 주 설교 카드) 진입 전 검증 필수** — 가장 먼저 썸네일을 렌더하는 단계. `src/utils/cloudinary.ts` 전체 읽어 외부 URL을 fetch URL로 감싸는지(`f_auto` 옵션) 또는 통과시키는지 확정 후 분기 결정 | 본 task §감사 §7에서는 점검만. 분기 추가(직접 `<img>` 사용 또는 Cloudinary fetch URL 변환 또는 `remotePatterns`에 YouTube 도메인 등록)는 Phase 1-1 exec-plan에서 결정 |

### §8 영상 provider

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| `SermonVideoPlayer.tsx` | YouTube 전용 (line:25 `iframe src=https://www.youtube.com/embed/${videoId}`) | `video_provider` 분기 없음, `video_id`만 사용 |
| DB 컬럼 `sermons.video_provider` | 존재 (`youtube` enum 사용 중) | 분기 위한 데이터 기반은 있음 |
| 결정 | 본 task **점검만**, 분기 추가는 OQ-4로 Phase 2 진입 전 결정 | mockup `Sermon-Implementation-Prompts.md:719-725`는 vimeo 등 분기를 Phase 7-2 후속 작업으로 명시. 현재 DB 데이터는 100% youtube로 추정되므로 OQ-4 결정은 "분기 추가" 또는 "youtube 가정 유지+vimeo 발생 시 추가" 양자택일 |

### §9 metadata+JSON-LD

| 라우트 | metadata 패턴 | JSON-LD | revalidate |
| --- | --- | --- | --- |
| 기존 `/sermons/[id]` | `src/app/(content)/sermons/[id]/page.tsx:12-34 generateMetadata`(title=설교 제목, description=summary, OG image=thumbnail, type=`article`) | `:38-58 buildJsonLd`(VideoObject) | `:36` 86400 (유지) |
| 신규 `/sermons/all` | 정적 `export const metadata = { title: '전체 설교', description: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요' }` | 불필요 (목록 페이지) | 본 task 미설정, Phase 3 결정 |
| 신규 `/sermons/series` | 정적 `export const metadata = { title: '모든 시리즈', description: '대구동남교회 강해 설교 시리즈 목록' }` | 불필요 | 본 task 미설정, Phase 4 결정 |
| 신규 `/sermons/series/[id]` | `generateMetadata`(title=시리즈 제목, description=시리즈 설명, OG image=`cover_image_url`, type=`article`) | (옵션) Phase 5에서 ItemList 검토 — **본 task X** | 본 task 미설정, Phase 5 결정 |
| 결정 | 본 task 신규 3 라우트는 **정적 metadata만** 부착(스켈레톤 단계). dynamic `generateMetadata`는 Phase 3-5에서 데이터 페칭과 함께 추가 | — | — |

## 참고 자료

- `docs/references/sermons/Sermon-Design-Decisions.md` — 의사결정 사유 (§1-§2)
- `docs/references/sermons/Sermon-Implementation-Prompts.md` — Phase 0-1~0-4 프롬프트
- `docs/references/sermons/ChurchSermonAll.jsx` — mockup (본 Phase 0에서는 `useCarousel`/`CarouselArrows`만 참조)
- [PR #68](https://github.com/scseong/dnchurch/pull/68) — `[slug]` → `[id]` 마이그레이션 결정 사유 (한글 인코딩 + Server Action redirect 헤더 ASCII-only)

## 의사결정 로그

- 2026-05-13: 범위·분할 정책 사용자 확정 — Phase 단위 분할, Phase 0(사전 준비)만 단일 PLAN
- 2026-05-13: DB 점검은 Phase 0에 포함, 마이그레이션은 별도 task — `cover_tone` 부재 1건 발견
- 2026-05-13: archive(연도별 그룹) 처리 결정은 Phase 1 진입 전 별도 논의 — OQ-1로 유지
- 2026-05-13: mock data 모듈 미생성 — dnchurch는 dev DB 기반
- 2026-05-13: **OQ-2 해결** — PR #68 결정 인용. 모든 신규 sermons 라우트는 `[id]` 기반. `[slug]` 라우트는 생성하지 않음. 시리즈 상세도 `/sermons/series/[id]`. mockup의 `[slug]` URL 패턴은 채택하지 않음(UI/UX 패턴만 채택). `sermons.slug` / `sermon_series.slug` 컬럼은 dead code 정책 유지
- 2026-05-13: **OQ-3 해결** — 단일 그라데이션 채택. `cover_tone` DB 컬럼 추가 안 함. 시리즈 헤로는 `_semantic.scss:86 $overlay-image`(= `linear-gradient($bg-dark, $navy-950)`) 재사용. **신규 토큰 추가 없음** — `_color.scss` 미변경. mockup의 5가지 다양성은 포기
- 2026-05-13: **Codex 계획 검증 1차 CHANGE_REQUEST 반영** — (a) `[slug]` 스켈레톤 제거(라우트 3개로 축소), (b) 토큰명 실제 이름으로 수정(`$txt-primary` 등), (c) `system-audit.md` 별도 파일 → exec-plan 본문 인라인, (d) Phase 0 누락 5종(breadcrumb/Hero/Cloudinary/video provider/metadata) 체크리스트에 추가
- 2026-05-13: **Codex 계획 검증 2차 CHANGE_REQUEST 반영** — (a) SC#1 (9) "신규 4 라우트" → "신규 3 라우트" 수정, (b) SC#2 Carousel 사용처를 "후속 plan에서 결정"으로 격하, (c) §감사 안내문 "WORK에서 채움 + SC#1 완료 기준" 자기모순 정정
- 2026-05-13: **Codex 계획 검증 3차 CHANGE_REQUEST 반영** — (a) §감사 안내문을 "9 표 모두 채워짐"으로 통일, (b) §4 `sermons.slug`/`series_order` placeholder `…` → 실제 file:line(`database.types.ts:314`/`:311`), (c) Carousel SC#2를 "사용처 본 task에서 확정"으로 변경(mockup 명시 근거), (d) §7 Cloudinary-YouTube 결정 시점을 "Phase 2 진입 전" + "Phase 1-1/1-2 작업 시" 이중 표현 → "Phase 1-1 진입 전" 단일화. 추가 발견: `formatPreacherLabel` 함수 이미 존재(`src/utils/sermon.ts:100`), Cloudinary-YouTube 도메인 미허용(`next.config.ts:14-19`)이 Phase 1-1 entry blocker
- 2026-05-13: **Codex 계획 검증 4차 CHANGE_REQUEST 반영** — (a) 접근법·영향 파일·의사결정 로그 3곳의 `$series-hero-bg` 신규 검토 문구를 "§1 결론 = `$overlay-image` 재사용, 신규 토큰 없음"으로 통일, (b) OQ-5 옵션 C(`<Image>` 대신 `<img>` 직접 사용) 제거 — `CLAUDE.md:99` "이미지: 항상 `<Image>` + Cloudinary URL" 위반 명시, (c) `## Codex 계획 검증` 섹션을 1~4차 verdict+핵심 지적 verbatim 인용 + 평이 풀이 + 반영 결과 inline 기록으로 확장(`.claude/skills/harness-workflow/SKILL.md:163-165` 인용 규칙 충족)
- 2026-05-13: **Codex 계획 검증 5차 CHANGE_REQUEST 반영** — (a) OQ-5 옵션 B(`img.youtube.com`을 `remotePatterns`에 추가) 제외 — `<Image>` 태그 유지해도 URL이 YouTube 도메인이라 `CLAUDE.md:99` "Cloudinary URL" 요건 미충족(Codex 5차 발견). 신규 옵션 B로 "Cloudinary `type=fetch` URL 명시적 변환"(helper 추가) 채택 — 결과 URL이 `res.cloudinary.com` 도메인이라 규칙 충족. (b) `CLAUDE.md:106` 잘못된 line ref를 `:99`로 정정 (의사결정 로그 4차 항목·OQ-5 본문 2곳)
- 2026-05-13: **Codex 계획 검증 6차 PASS** — 5개 체크 모두 통과. 1~5차 누적 CHANGE_REQUEST 13건 전부 해소. WORK 단계 진입 승인. 6차는 추가 변경 없음 — plan은 이 시점에 "구현 직전" freeze 상태.
- 2026-05-13: **WORK 중 발견 — `resolveHeroMeta` 함수 수정 필요** — §감사 §6는 "HERO_META 키 2개 추가만으로 Hero 표시" 가정이었으나, 함수 로직(`hero.config.ts:29-46`)이 GNB_ITEMS의 children 매칭만 처리한다. GNB sermons 항목은 children 없음(`navigation.ts:41`)이라 `/sermons/all`/`/sermons/series` 매칭 X → `null` 반환. 수정: 함수 첫 단계로 `const direct = HERO_META[pathname]; if (direct) return direct;` 추가. 기존 GNB-based fallback 보존. 영향 0건 (`/about/pastor` 등 자식 라우트는 HERO_META에 없으니 fallback 진입, 기존 동작 유지).
- 2026-05-13: **WORK 중 발견 — `Carousel/index.ts` 미생성** — 기존 ui/ 컨벤션(`Button/`, `BottomSheet/`, `Modal/` 등)이 폴더별 `index.ts` barrel 없이 `src/components/ui/index.ts`에서 직접 컴포넌트 파일을 import한다. 메모리 `feedback_no_reflex_barrels`와 일치. Carousel도 동일 컨벤션 적용 — `Carousel/index.ts` 생성하지 않고 `src/components/ui/index.ts`에 3 export 라인 추가. plan 영향받는 파일 list에서 `Carousel/index.ts` 제거.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: —
- **사유**: 변경 대상이 (a) `src/components/ui/Carousel/`(신규 공용 UI 패턴, `ADR_TRIGGER_PARTS` 미포함), (b) `src/app/(content)/sermons/...`(라우트 추가, 미포함), (c) `docs/exec-plans/active/...`(작업 산출물, 미포함), (d) `src/components/ui/index.ts` barrel 1줄(미포함), (e) 잠재적으로 `src/config/navigation.ts` 및 `src/components/layout/Hero/hero.config.ts`(미포함 — `src/config/`는 트리거 리스트에 없음, `_shared-config.mjs:7-26` 확인), (f) `src/styles/tokens/_color.scss` 1줄(미포함 — `src/styles/`는 트리거 리스트에 없음). `src/services/`, `src/apis/`, `package.json`, `eslint.config.*`, `next.config.*` 등 ADR 트리거 영역 미변경. PR #68 정책의 일관 적용은 기존 결정의 재확인이므로 새 ADR 불필요. OQ-3 단일 그라데이션은 1회성 토큰 결정으로 ADR 비대상.

## Open Questions (Phase 1 진입 전 결정 필요)

- **OQ-1**: archive(연도별 그룹) 패턴 — `/sermons/all`로 이관 vs 폐기. 결정자: 사용자. Phase 1 PLAN 작성 시 답이 필요.
- ~~**OQ-2**: `[id]` → `[slug]` 전환 방식~~ — **해결**(2026-05-13): PR #68 결정 유지, 모든 sermons 라우트는 `[id]` 기반.
- ~~**OQ-3**: `sermon_series.cover_tone` 부재 처리~~ — **해결**(2026-05-13): 단일 그라데이션 채택.
- **OQ-4**: 영상 provider 분기(YouTube 외) — Phase 2 진입 전 결정. 결정자: 사용자. 본 task §감사 §8에서 점검만, 분기 추가는 Phase 2.
- **OQ-5** (Codex 3차 발견): Cloudinary-YouTube 썸네일 호환 — `next.config.ts:14-19 remotePatterns`가 `res.cloudinary.com`만 허용. `getSermonThumbnail` fallback이 `img.youtube.com/vi/{id}/maxresdefault.jpg` 반환. **Phase 1-1(이번 주 설교 카드) 진입 전 결정 필수** — 2 옵션 중 택일: (A) `src/utils/cloudinary.ts` 커스텀 loader가 외부 URL을 Cloudinary fetch URL로 감싸는지(`type=fetch`/`f_auto`) 확인. 감싸면 sermon card는 그대로 `<Image src={youtubeThumbnailUrl}>` 사용 가능(loader가 변환). (B) **Cloudinary `type=fetch` URL 명시적 변환** — `src/utils/cloudinary.ts`에 helper 추가(예: `cloudinaryFetchUrl(remoteUrl)` → `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(remoteUrl)}`), sermon card는 `<Image src={cloudinaryFetchUrl(youtubeThumbnailUrl)}>`. 결과 URL이 `res.cloudinary.com` 도메인이라 `remotePatterns` 만족 + `CLAUDE.md:99` "이미지: 항상 `<Image>` + Cloudinary URL" 요건 충족. **옵션 C(`<Image>` 대신 `<img>` 직접 사용) 제외** — `CLAUDE.md:99` 규칙 위반. **이전 옵션 B(`img.youtube.com`을 `remotePatterns`에 추가)도 제외** — `<Image>` 태그 사용하더라도 URL이 YouTube 도메인이라 "Cloudinary URL" 요건 미충족(Codex 5차 발견).

## Codex 계획 검증

- **상태**: ✅ **6차 PASS** — WORK 단계 진행 승인. 1~5차 CHANGE_REQUEST 모두 반영 완료.
- **요청 시점**: 2026-05-13 1차/2차/3차/4차/5차/6차 (동일 thread resume)

### 1차 (2026-05-13)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 5체크 #2/#3/#4/#5 FAIL.

**핵심 지적** (verbatim 발췌):
> A) Carousel 범위 — CHANGE_REQUEST … `ChurchSermonAll.jsx:648,701`에서 mockup이 사용하는 것은 `useCarousel`/`CarouselArrows`뿐이다. Phase 0에 drag guard까지 구현하면 CLAUDE.md "단순함 우선" 위반.
> D) system-audit.md 위치 — `docs/research/README.md:1-4`와 `docs/README.md:16`은 "외부 자료 발췌" 용도로 명시. `system-audit.md`는 내부 표 4개로 구성된 구조적 감사 결과물이다.

**평이 풀이**: Carousel 구현 범위가 너무 넓고, 감사 결과물 위치(`docs/research/`)가 외부 자료 발췌용이라 부적합.

**반영**: (a) `[slug]` 스켈레톤 제거, (b) 토큰명 수정, (c) `system-audit.md` → exec-plan 본문 인라인, (d) 누락 5종 체크리스트 추가, (e) `cover_tone` Phase 0 결정.

### 2차 (2026-05-13)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 5체크 중 라우트 일관성/토큰명/Carousel/감사 테이블 4개 영역에서 잔존 모순.

**핵심 지적** (verbatim 발췌):
> CHECK 1 — [id] 일관성 / FAIL 근거: … Success Criteria `:32`가 "metadata+JSON-LD 패턴을 신규 4 라우트에"라고 써서 `:34`의 "3 라우트 스켈레톤"과 충돌한다.
> CHECK 4 — 인라인 감사 테이블 완성도 / FAIL … 플랜 단계 스텁 허용 여부 판단: 불허. exec-plan `:32`는 "9 표 작성 완료"를 Success Criteria로 두고, `:113`도 "빈 상태로 두면 본 task는 미완료"라고 명시한다.

**평이 풀이**: SC#1의 "신규 4 라우트" 표현이 실제 3 라우트와 불일치. 감사 표가 placeholder로 비어있는데 plan 자체가 "빈 상태=미완료"라고 적어 자기모순.

**반영**: (a) SC#1 (9) "신규 3 라우트" 수정, (b) SC#2 Carousel 사용처 격하, (c) §감사 안내문 자기모순 정정.

### 3차 (2026-05-13)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 모순 4건.

**핵심 지적** (verbatim 발췌):
> `:166` — §4 표 `sermons.slug` 위치가 `…` placeholder (file:line 없음)
> `:33` — Carousel 사용처 결정을 후속 Phase로 미루면서 Phase 0에서 공용 구현 3파일 + 동작 4개 생성 → 단순함 우선 위반
> `:200` — Cloudinary-YouTube 결정 시점이 "Phase 1-1/1-2"로 적혀 있어 "Phase 2 entry blocker" 범위와 불일치

**평이 풀이**: §4 표에 file:line placeholder가 남았고, Carousel 사용처 결정 격하가 오히려 "추측성 사전 빌드" 의심을 키움. §7 결정 시점 표현이 두 가지 섞임.

**반영**: (a) §감사 안내문 "9표 완료"로 통일, (b) §4 file:line 채움(`database.types.ts:314`/`:311`), (c) Carousel SC#2를 "사용처 본 task에서 확정"으로 강화(mockup 명시 근거 인용), (d) §7 → "Phase 1-1 진입 전" 단일화 + OQ-5 신설.

### 4차 (2026-05-13)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 3건.

**핵심 지적** (verbatim 발췌):
> 1. `$series-hero-bg` 잠재 수정 문구 vs §1 결론 충돌 (`:71`, `:83`, `:234`) … §1 결론에 맞춰 3곳 모두 "신규 토큰 없음"으로 단일화하거나, 반대로 §1 결론을 바꾸고 검증 기준을 추가.
> 2. OQ-5 옵션 C(`<img>` 직접 분기)가 `CLAUDE.md:106` 이미지 규칙과 충돌 … 제거하거나, 예외 승인 조건과 검증 명령(예: `yarn lint` 통과 확인, PR 리뷰어 명시)을 추가해야 함.
> 3. `## Codex 계획 검증` collapsed header — verbatim 인용 규칙 미충족 … `.claude/skills/harness-workflow/SKILL.md:163-165`는 "Codex stdout verbatim 인용 + 평이 한국어 풀이 1줄"을 요구함.

**평이 풀이**: `$series-hero-bg` 신규 토큰 관련 3곳이 §1 결론과 어긋남. OQ-5에 `<img>` 분기 옵션이 CLAUDE.md 위반. 본 섹션이 cross-link만 두고 verbatim 인용 누락.

**반영**: (a) 접근법·영향 파일·의사결정 로그 3곳을 "$overlay-image 재사용, 신규 토큰 없음"으로 통일, (b) OQ-5 옵션 C 제거 + 규칙 인용 명시, (c) 본 섹션을 1차/2차/3차/4차 verdict+핵심 지적 verbatim + 평이 풀이 + 반영 결과 inline 기록으로 확장(현재 본문).

### 5차 (2026-05-13)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 2건 (1 SHIP-BLOCKING + 1 POLISH).

**핵심 지적** (verbatim 발췌):
> CHECK 2 — OQ-5 adequacy / FAIL. 옵션 B(`img.youtube.com` remotePatterns 추가)는 YouTube 원본 URL을 `<Image>`에 직접 넣는 구조이므로 "항상 `<Image>` + Cloudinary URL" 규칙(`CLAUDE.md:99`)과 충돌합니다. `<Image>` 태그를 유지한다는 점만으로는 규칙 준수가 불충분합니다.
> (SHIP-BLOCKING) `:252` — OQ-5 옵션 B를 제거하거나, "YouTube URL을 Cloudinary fetch URL로 변환해 `<Image>`에 Cloudinary URL만 전달"하는 구조로 교체.
> (POLISH) `:238`, `:252` — `CLAUDE.md:106` 인용을 실제 line인 `CLAUDE.md:99`로 수정.

**평이 풀이**: `<Image>` 태그만 유지해도 안 됨 — URL 자체도 Cloudinary 도메인이어야 함. 4차 잘못된 line ref(`:106`)는 실제 `:99`. Codex 4차 stdout 자체에 `:106` 오기가 있었으나 verbatim 보존을 위해 stdout은 그대로 두고 5차 발견으로 정정.

**반영**: (a) OQ-5 옵션 B를 "Cloudinary `type=fetch` URL 명시적 변환"으로 교체 — helper(`src/utils/cloudinary.ts`에 `cloudinaryFetchUrl(remoteUrl)`)를 sermon card에서 사용해 모든 URL이 `res.cloudinary.com` 도메인이 되도록. (b) 의사결정 로그 4차 항목의 `CLAUDE.md:106` → `:99` 정정. OQ-5 본문 규칙 인용도 `:99`로 통일.

### 6차 (2026-05-13)

**Codex verdict** (verbatim): `PASS`. 5개 체크 모두 통과.

**핵심 통과 사유** (verbatim 발췌):
> CHECK 1 — OQ-5 새 옵션 B는 `cloudinaryFetchUrl()` 헬퍼로 `res.cloudinary.com/…/image/fetch/…` URL을 생성하므로 `CLAUDE.md:99` "Cloudinary URL" 요건을 충족합니다.
> CHECK 2 — 4차 Codex stdout의 `:106` verbatim 인용은 보존됐고, 5차 항목이 `:99`로 정정 사유를 명시해 `SKILL.md:163-165` verbatim 보존 규칙과 충돌 없습니다.
> CHECK 5 — concrete-records 기준 충족: 실제 파일/라인(`next.config.ts:14-19`, `src/utils/cloudinary.ts`, `CLAUDE.md:99`), 선택지 2개, 결과 도메인(`res.cloudinary.com`), 헬퍼 시그니처와 호출 예시가 모두 포함됩니다.

**평이 풀이**: 1~5차 CHANGE_REQUEST 누적 13건이 모두 해소되었고, 4차 stdout 내부의 잘못된 line ref도 5차 정정으로 추적 가능하게 처리되어 PASS.

**최종 결론**: > 계획은 WORK 단계로 진행 가능합니다. (Codex 결론 verbatim)

### 외부 발견 (구현 시 반영 필요)

- **OQ-5 신설** (3차 발견): Cloudinary-YouTube 호환 — `next.config.ts:14-19 remotePatterns` YouTube 도메인 미허용 + `getSermonThumbnail` fallback YouTube URL 반환. Phase 1-1 진입 전 결정 필수.
- **§3 정정** (3차 발견): `formatPreacherLabel`은 `src/utils/sermon.ts:100`에 이미 존재. 1차 지적의 "preacherFullName 없음"은 오류였음 (`SermonDetailPage.tsx:34-36` 인라인 처리는 별개의 기존 코드 부채).

## Codex 1차 검증

- **상태**: 1차 완료 (CHANGE_REQUEST → Claude 반영) / 재검증 요청 예정
- **요청 시점**: 2026-05-13
- **결론**: CHANGE_REQUEST → Claude 측 수정 3건 적용 (FIX_APPLIED)
- **수정 파일**: `src/components/ui/Carousel/Carousel.module.scss`, `src/app/(content)/sermons/series/[id]/page.tsx`, `docs/exec-plans/active/2026-05-13-sermons-phase0-foundation.md`

**Codex verdict** (verbatim): `CHANGE_REQUEST`. P1(버그/타입/가드)·P2(레이어)·P3(외과적 변경)·P5(dnchurch 규칙 일부) PASS. P4(계획 정합성) FAIL.

**핵심 지적** (verbatim 발췌):
> FINDING 1 — `Carousel` prop API 불일치 (`src/components/ui/Carousel/Carousel.tsx:118-123`) / 계획: `{ children; ariaLabel; mobileFullBleed? }` 3-prop API / 실제: `carousel: UseCarouselReturn`이 추가 prop으로 존재
> FINDING 2 — `series/[id]` skeleton 범위 초과 (`src/app/(content)/sermons/series/[id]/page.tsx:13-18`) / 계획: metadata + LayoutContainer + h1 only / 실제: `const { id } = await params;` + `<p>id: {id}</p>` 추가
> FINDING 3 — 직접 size 값 (`Carousel.module.scss:32-33`) / `3.2rem` 하드코딩 → `$spacing-32` 교체 권장

**평이 풀이**: Carousel props가 plan 3개에서 4개로 늘어남(mockup 패턴 따라 hook 외부 주입). `[id]` 스켈레톤이 plan보다 한 줄 더 들어감(`<p>id: {id}</p>`). 토큰 대신 직접값 한 곳.

**반영**:
- (FINDING 1) plan SC#2의 props 인터페이스를 4-prop으로 갱신, `carousel: UseCarouselReturn` 추가가 mockup 패턴(헤더 우측 화살표 + 캐러셀 본체가 동일 hook 결과 공유) 충족을 위함임을 명시. Carousel 구현은 변경 없음.
- (FINDING 2) `series/[id]/page.tsx`에서 `params` import 및 `<p>` 제거. async function → sync function. 빈 스켈레톤으로 복원.
- (FINDING 3) `Carousel.module.scss:32-33`의 `3.2rem` → `$spacing-32` (semantic token) 교체.

- **남은 리스크**: 재검증 후 확인 — verify-task.mjs 재실행 필요(SCSS 토큰 교체 + page.tsx async 제거 후 build 안정성).

## Claude 2차 검증

- **검토 내용**: Codex 1차 FIX 3건 diff 교차 확인.
  - (FINDING 3) `src/components/ui/Carousel/Carousel.module.scss:32-33`: `3.2rem` → `$spacing-32` 1회만 교체. 인접 코드 변경 없음. semantic 토큰 (`_spacing.scss`의 `$spacing-{px값}` 패턴) 정확히 사용.
  - (FINDING 2) `src/app/(content)/sermons/series/[id]/page.tsx`: `params` import / `await params` / `<p>id: {id}</p>` 3건 제거. `async function` → `function` 전환. plan SC#3의 "LayoutContainer + h1 + metadata only"와 정확히 일치하는 스켈레톤으로 복원.
  - (FINDING 1) plan SC#2의 props 인터페이스를 `{ children; ariaLabel; mobileFullBleed?; carousel: UseCarouselReturn }` 4-prop으로 갱신. 구현(Carousel.tsx)은 변경 없음 — plan을 구현 현실에 맞춤. mockup `ChurchSermonAll.jsx:648-726`의 외부 hook 주입 패턴 + 사용자 결정(`Sermon-Design-Decisions.md §2-2` 헤더 우측 화살표) 근거 명시.
- **실행한 검증**:
  - `node scripts/verify-task.mjs sermons-phase0-foundation` 재실행: ESLint ✓ / stylelint ✓ / Build (next) ✓ / Knip ⚠ 경고 (Carousel/useCarousel/CarouselArrows/UseCarouselReturn unused — Phase 1-2/1-3에서 import 예정. 기존 패턴(Skeleton/Textarea/TextField 등 5건도 unused exports)과 일치).
  - 로그: `logs/sermons-phase0-foundation/20260513-213907/summary.log` — "✓ 필수 검증 통과 (⚠ 경고: Knip (미사용 코드) — 기존 부채, 커밋 차단 안 됨)".
  - `git status --short` 차이: M `hero.config.ts`, M `ui/index.ts`, ?? `Carousel/`, ?? `sermons/all/`, ?? `sermons/series/`, ?? `sermons/series/[id]/`, ?? `docs/exec-plans/active/...md`. ADR_TRIGGER_PARTS(`scripts/_shared-config.mjs:7-26`) 영역 무관.
- **최종 판단**: ✅ **PASS** — Codex 1차 FIX 3건 모두 plan SC#2/SC#3와 일치. 신규 회귀 0건. verify-task 통과(Knip은 기존 부채 + 본 task 신규 unused는 Phase 1 사용 예정). 사용자 승인 후 커밋 진행 가능.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- **잘된 것**:
  - Codex 계획 검증 6 라운드를 단일 thread resume으로 누적 진행 — 1차 누적 13건 CHANGE_REQUEST가 6차 PASS까지 모순 0으로 수렴
  - mockup `ChurchSermonAll.jsx:648-726`의 `useCarousel` 훅 + `CarouselArrows` 패턴을 TypeScript로 정확히 이식. props 4개(`children`/`ariaLabel`/`mobileFullBleed`/`carousel`)로 좁힘. 화살표 헤더 우측 배치(`Sermon-Design-Decisions.md §2-2`) 충족
  - 감사 보고서 9 표를 exec-plan에 인라인 — 별도 `system-audit.md` 없이 plan 자체가 audit 산출물
  - PR #68 결정 인용으로 `[id]` 유지 일관성. mockup `[slug]` URL 패턴 채택하지 않고 dnchurch 정책 우선
  - OQ-3 `cover_tone` 부재를 단일 그라데이션(`$overlay-image` 재사용)으로 해결 — DB 마이그레이션 회피
  - `resolveHeroMeta` direct-match 1단계 추가로 GNB_ITEMS 미변경 + 자식 라우트 Hero 표시 동시 충족
- **다음에 할 것**:
  - Phase 1 진입 전 결정 3건: OQ-1 archive 처리 / OQ-4 video provider 분기 / OQ-5 Cloudinary-YouTube 호환
  - Carousel 4 named export(`Carousel`/`useCarousel`/`CarouselArrows`/`UseCarouselReturn`)는 Phase 1-2(최근 설교)·Phase 1-3(시리즈 미리보기) exec-plan에서 import 사용 — knip warning 자동 해소
  - `SermonDetailPage.tsx:34-36`의 인라인 preacher 라벨을 `formatPreacherLabel`(`src/utils/sermon.ts:100`) helper로 교체 (Phase 2)
- **발견된 부채** (→ `docs/tech-debt-tracker.md`):
  - `docs/references/sermons/ChurchSermonAll.jsx`가 `.gitignore` `docs/references/**/*.jsx` 패턴 추가 후에도 git 추적 유지. 향후 정리 시 `git rm --cached` 검토
  - `SermonDetailPage.tsx:34-36` 인라인 preacher 라벨 vs `formatPreacherLabel` helper 중복 — Phase 2 교체 시 일관성 회복
