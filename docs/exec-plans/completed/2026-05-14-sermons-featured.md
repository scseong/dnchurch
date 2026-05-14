# sermons-featured

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-featured (develop 기반, PR #86 머지 후)

## 목표

Sermon 섹션 Phase 1-1 (메인 페이지 "이번 주 설교" Featured 카드). 가장 최근 published 설교 1건을 `/sermons` 메인 상단에 mockup 디자인(PC 580/1fr 2열, 모바일 stack)으로 표시. 동시에 OQ-1 해결(기존 `/sermons` archive 뷰를 `/sermons/all`로 이관)·OQ-5 해결(`cloudinaryFetchUrl` helper로 YouTube fallback 썸네일을 `<Image>`에서 안전 표시).

## Assumptions

- **Featured = "최신 published 설교 1건"** (정책 변경, 2026-05-14). Phase 0 audit §4의 "`sermons.is_featured`=yes (`database.types.ts:483`)"는 사실 오류 — dev DB(`mficogrxekuahjqborxw`)·prod DB(`xrfyevrnmvbuwsbktuja`)·`database.types.ts:300-322` 모두 `is_featured` 컬럼 부재(`is_published`만 존재). 코드 전체 `is_featured` 참조 0건. 따라서 mockup의 `is_featured: true` 분기는 dnchurch에서는 "가장 최근 published 1건" 패턴으로 변환한다. 추후 어드민에서 수동 마킹이 필요해지면 별도 task로 컬럼 추가.
- `getRecentSermons(limit)` 기존 service(`services/sermon/index.ts:39-42`)가 최신순 정렬 + 관계 join을 보장하므로 `getFeaturedSermon()`은 `getRecentSermons(1)`의 thin wrapper로 충분(0건이면 `null` 반환).
- `cloudinary.ts:62-63` 커스텀 loader가 `if (/^https?:\/\//i.test(src)) return src;`로 외부 URL을 passthrough — YouTube 도메인 fallback URL이 그대로 next/image에 전달되고 `next.config.ts:14-19 remotePatterns`(`res.cloudinary.com`만 허용)에 막힌다. helper로 명시 변환 필수.
- 1-1 범위에 archive 이관을 포함해야 mockup `/sermons` 메인 구조 시작 가능. archive 이관을 1-4 통합으로 미루면 1-1에서 Featured 카드가 사이드바+아카이브 위에 어색하게 얹히는 임시 상태가 생긴다.

## Non-goals

- Recent 설교 캐러셀 (Phase 1-2)
- 시리즈 미리보기 캐러셀 (Phase 1-3)
- 메인 페이지 통합 (Phase 1-4 — 본 task는 Featured 1개만 표시, Hero는 기존 `resolveHeroMeta` 그대로)
- 영상 재생 인터랙션 (Phase 7-2 — play 버튼은 정적 SVG overlay, click 시 `/sermons/[id]`로 link)
- `is_featured` DB 컬럼 추가 (별도 task — `docs/tech-debt-tracker.md`에 등록)
- 모바일 헤더(`MLabel`) 신규 (mockup 모바일 헤더는 Phase 1-4 통합 시)
- 기존 `_component/SermonListPage/*` 컴포넌트 리팩터 — `/sermons/all` 경로로 이동, 코드 리팩터 없음. 단 `SermonYearGrid.tsx:21` 링크 base path 1줄(`/sermons` → `/sermons/all`)은 archive 이관 필수 동반 변경이라 본 task에 포함
- 상세 페이지(`[id]`) 렌더링 구조·UI 변경 (시리즈 링크 base path 1줄 `/sermons` → `/sermons/all` 교체는 archive 이관에 따른 필수 동반 변경이라 본 task에 포함)
- `series`/`series/[id]` 페이지 변경
- `getSermonThumbnail`/`buildSermonArchive` 동작 변경 (Featured 분리해도 archive는 `/sermons/all`에서 그대로 first-item-as-featured 유지)

## Success Criteria

1. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.tsx` + `.module.scss`. props: `{ sermon: SermonWithRelations | null }`. `null`이면 영역 미렌더(`return null`). PC `grid-template-columns: 580px 1fr`, 모바일 `1fr` stack — `respond-up($breakpoint-tablet)`로 분기.
2. **신규 service wrapper** `getFeaturedSermon()` in `src/services/sermon/index.ts` — 동작은 `getRecentSermons(1).then(arr => arr[0] ?? null)` 또는 동등한 service-layer 호출. 별도 cache key 신설 X (recent와 동일 invalidation 흐름 재사용). 함수 본문은 1줄 wrapper.
3. **신규 helper** `cloudinaryFetchUrl(remoteUrl: string | null): string | null` in `src/utils/cloudinary.ts` — `remoteUrl === null` → `null` passthrough. `remoteUrl`이 이미 `res.cloudinary.com` 도메인이면 그대로 반환. 그 외 외부 URL은 `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(remoteUrl)}`. **caller 정책 (단일 확정)**: `SermonFeatured`에서 `const thumb = cloudinaryFetchUrl(getSermonThumbnail(sermon));`로 호출, `thumb === null`이면 `<Image>` 미렌더 + mockup의 dark gradient placeholder만 표시 (`linear-gradient($bg-dark, $navy-950)` = `$overlay-image` 토큰). non-null assertion 사용 X.
4. **route reshuffle** — `/sermons/all/page.tsx`는 Phase 0 skeleton **교체**(신규 X). 기존 `/sermons/page.tsx` 본문(사이드바+툴바+아카이브/필터)을 그대로 이관. `_component/SermonListPage/`는 디렉토리 위치 유지(`/sermons/_component/`), import 경로는 `./_component/SermonListPage/...` → `../_component/SermonListPage/...`로 1단계 상승. 기존 `/sermons/page.tsx`는 `getFeaturedSermon()` + `<SermonFeatured>` 1개로 축소.
5. **필터 base path 4곳 교체** — archive 이관 후 필터·검색·연도 링크가 `/sermons` (새 hub)로 빠지면 안 됨. 다음 4곳을 `/sermons/all`로 변경:
   - `src/utils/sermon.ts:133` `buildSermonHref('/sermons', ...)` → `'/sermons/all'`
   - `src/hooks/useSermonFilter.ts:28` `router.push('/sermons${qs ...}')` → `'/sermons/all${qs ...}'`
   - `src/app/(content)/sermons/_component/SermonListPage/SermonYearGrid.tsx:21` `href={'/sermons?year='}` → `'/sermons/all?year='`
   - `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx:48` `router.push('/sermons?series=...')` → `'/sermons/all?series=...'`
6. **metadata 통일** — `/sermons` `Metadata.title = '설교'`(현재 '말씀' → '설교'로 통일, Hero `title: '설교'`와 일치, `hero.config.ts:14`). `/sermons/all` `Metadata.title = '전체 설교'`(신규).
7. **검증 통과** — `node scripts/verify-task.mjs sermons-featured` (lint + lint:styles + build + knip) 통과. `yarn dev` → 3 URL 200: `/sermons`(Featured 카드 1개 + Hero), `/sermons/all`(기존 archive 뷰), `/sermons/[id]`(기존 상세). 필터 URL 4곳이 모두 `/sermons/all`로 향함 (Chrome DevTools Network 탭에서 navigation request 확인 + 수동 클릭 테스트 3건: 사이드바 시리즈 선택 / 연도 그리드 클릭 / 상세 페이지 시리즈 링크). Featured 카드의 next/image 요청 URL이 `res.cloudinary.com`으로 시작(DevTools Network 확인).
8. **Codex 계획 검증 2차 PASS** (1차 CHANGE_REQUEST 7건 + 본 plan 자체 발견 BLOCK 1건 모두 반영 완료 후).

## Verification

```bash
# 좁은 신뢰 명령 순
yarn lint          # ESLint (레이어 의존성)
yarn lint:styles   # stylelint (토큰·네이밍)
yarn build         # next build (Image 도메인 검증 + type check)
yarn knip          # 미사용 코드

# 수동 (yarn dev 진입 후)
# → http://localhost:3000/sermons        Featured 카드 1개, PC 2열·모바일 stack
# → http://localhost:3000/sermons/all    기존 archive 뷰 (사이드바·툴바·아카이브)
# → http://localhost:3000/sermons/[id]   상세 페이지 렌더 유지, 시리즈 링크 base path만 /sermons/all로 변경 (SermonDetailPage.tsx:48)
# → 브레드크럼 "홈 > 설교" 표시 (resolveBreadcrumbSegments 자동)
# → Featured 카드 클릭 → /sermons/[id]로 이동

# 필터 base path 4곳 (수동 클릭 3건 + DevTools Network 1건)
# 1. /sermons/all 사이드바 시리즈 라디오 → URL `/sermons/all?series=...`
# 2. /sermons/all 사이드바 연도 그리드(또는 SermonYearGrid 위치) → `/sermons/all?year=2025`
# 3. /sermons/123 상세 페이지의 시리즈 링크 → `/sermons/all?series=...`
# 4. Featured next/image 요청 URL → DevTools Network "res.cloudinary.com" 시작 확인

# 전체 검증
node scripts/verify-task.mjs sermons-featured
```

## 접근법

1. **Featured 분리 first, archive 이관 second** — 신규 컴포넌트·service·helper 먼저 작성 후 page-level route reshuffle. 컴포넌트 단위 변경이 page 단위 변경보다 review·rollback 용이.
2. **archive 이관은 디렉토리 단순 이동** — `_component/SermonListPage/*`는 그대로 두고 page.tsx만 분기. mockup의 `/sermons/all` 디자인(좌측 사이드바 240px + 우측 결과)이 기존 구조와 거의 동일하므로 리팩터 없이 이관. mockup 디테일(사이드바 검색·시리즈 메타 카드·검색 피드백)은 Phase 3에서 단계적 적용.
3. **`getFeaturedSermon()` = thin wrapper** — 기존 `getRecentSermons(1)`이 이미 최신순·관계 join·캐시 처리 완비. 별도 service method/cache key 신설 시 같은 데이터에 2개 캐시 키가 생겨 invalidation 복잡도 증가. `getFeaturedSermon()`은 의미 분리용 alias로만 둠 (향후 `is_featured` 컬럼 추가 시 단일 교체 지점).
4. **`cloudinaryFetchUrl` null-aware** — `getSermonThumbnail`이 `null` 반환 가능하므로 helper도 `string | null` 시그니처. 호출부는 `null` 분기 1회만 — SC#3 확정 정책에 따라 `$overlay-image` dark gradient placeholder 단일 사용 (placeholder SVG 옵션 X).
5. **SermonFeatured는 presentational** — data fetching X, props로 sermon 받음. PC/모바일은 SCSS의 `respond-up($breakpoint-tablet)`으로 분기. 컴포넌트 단일 파일.
6. **Featured 없으면 영역 미렌더** — empty state placeholder는 만들지 않음. 메인 페이지가 비는 건 1-2 Recent / 1-3 Series 추가되며 자연 해소.

## 영향받는 파일

- 수정: `src/services/sermon/index.ts` — `getFeaturedSermon()` export 신규 (1줄 wrapper)
- 수정: `src/utils/cloudinary.ts` — `cloudinaryFetchUrl(remoteUrl)` helper 신규
- 수정: `src/utils/sermon.ts:133` — `buildSermonHref` base path `/sermons` → `/sermons/all`
- 수정: `src/hooks/useSermonFilter.ts:28` — `router.push` base path `/sermons` → `/sermons/all`
- 신규: `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.tsx`
- 신규: `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.module.scss`
- 수정: `src/app/(content)/sermons/all/page.tsx` — Phase 0 skeleton **교체**, 기존 `/sermons/page.tsx` 내용 이관 + metadata title `'전체 설교'`
- 수정: `src/app/(content)/sermons/page.tsx` — Featured 카드 1개로 축소, metadata title `'설교'`(기존 `'말씀'`에서 변경)
- 수정: `src/app/(content)/sermons/_component/SermonListPage/SermonYearGrid.tsx:21` — `href` base path 교체
- 수정: `src/app/(content)/sermons/_component/SermonListPage/`의 import 경로 — `/sermons/all/page.tsx`에서 `./_component/...` → `../_component/...`
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx:48` — `router.push` base path 교체

## 단계별 체크리스트

- [ ] 1. `utils/cloudinary.ts`에 `cloudinaryFetchUrl(remoteUrl: string | null): string | null` helper 신규 — null passthrough + cloudinary 도메인 passthrough + 외부 URL fetch 변환
- [ ] 2. `services/sermon/index.ts`에 `getFeaturedSermon = async () => (await getRecentSermons(1))[0] ?? null` 1줄 wrapper 신규
- [ ] 3. `SermonFeatured/SermonFeatured.tsx` 신규 — props `{ sermon }`, `null` 처리, PC 2열·모바일 stack, play 버튼 SVG + duration overlay, 카드 클릭 시 `/sermons/[id]` link
- [ ] 4. `SermonFeatured/SermonFeatured.module.scss` 신규 — `$bg-card` `$border-card` `$radius-l` `$padding-card` `$txt-primary` `$txt-secondary` `$txt-tertiary` `$accent` `$primary` `$overlay-image` 등 semantic 토큰만 사용. 하드코딩 0
- [ ] 5. `app/(content)/sermons/all/page.tsx` 교체 — 기존 `/sermons/page.tsx` 본문 이관 + metadata `'전체 설교'` + import 경로 `../_component/...`로 상승
- [ ] 6. `app/(content)/sermons/page.tsx` 교체 — `getFeaturedSermon()` 호출 + `<SermonFeatured sermon={...} />` + `LayoutContainer`. metadata title `'설교'`
- [ ] 7. 필터 base path 4곳 교체:
  - `utils/sermon.ts:133` `buildSermonHref('/sermons', ...)` → `'/sermons/all'`
  - `hooks/useSermonFilter.ts:28` `router.push('/sermons${qs}')` → `/sermons/all${qs}`
  - `SermonYearGrid.tsx:21` `href` 교체
  - `SermonDetailPage.tsx:48` `router.push` 교체
- [ ] 8. `yarn dev` 수동 — 3 URL 200 + 필터 4 clickpath 모두 `/sermons/all`로 향함 + Featured `<Image>` 요청 URL `res.cloudinary.com` 시작
- [ ] 9. `node scripts/verify-task.mjs sermons-featured` 통과

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs sermons-featured` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] 마이그레이션 적용 — **없음** (DB 변경 0, `is_featured` 컬럼은 별도 task)
- [ ] `docs/tech-debt-tracker.md` 등록 — (a) `is_featured` 컬럼 미존재 / Phase 0 audit §4 오류 정정 / 어드민 마킹 UI는 향후 task, (b) Phase 0 회고 부채 잔존 항목 sync

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 1-1 (line:142-162)
- `docs/references/sermons/Sermon-Design-Decisions.md` §2-8 (Featured 외부 라벨 박스 제거 결정)
- `docs/references/sermons/ChurchSermonAll.jsx` — `ListPCFeatured`(line:806-875), `MListFeatured`(line:2216-2270)
- Phase 0 exec-plan: `docs/exec-plans/completed/2026-05-13-sermons-phase0-foundation.md` — §감사 §1·§3·§7 (토큰·formatPreacherLabel·OQ-5 컨텍스트)

## 의사결정 로그

- 2026-05-14: 사용자 결정 — Phase 1을 1-1/1-2/1-3/1-4 sub-task 분할, OQ-1 archive `/sermons/all` 이관, OQ-5는 cloudinary loader 확인 후 결정
- 2026-05-14: **OQ-5 해결** — `cloudinary.ts:62-63` loader가 외부 URL(`https?://`)을 `return src;` passthrough 확인. next/image `remotePatterns`에 YouTube 도메인 없으므로 미가공 YouTube URL은 빌드 실패 또는 런타임 거부. → `cloudinaryFetchUrl` helper로 명시 변환 채택. 옵션 A(loader 자동 변환)는 현 코드 동작상 불가
- 2026-05-14: archive 이관을 1-1에 포함 — 1-4 통합으로 미루면 Featured + 기존 사이드바·아카이브가 같은 페이지에 어색 공존. 이관은 `_component/SermonListPage/*` 코드 리팩터 없음 (`SermonYearGrid.tsx:21` base path 1줄 제외), page.tsx 2개 + 필터 URL 4곳(`utils/sermon.ts:133`, `useSermonFilter.ts:28`, `SermonYearGrid.tsx:21`, `SermonDetailPage.tsx:48`) 변경
- 2026-05-14: **Codex 1차 CHANGE_REQUEST 발견 + Plan BLOCK 발견** — Codex 7건 (필터 URL hardcode, helper null 분기, ADR 미확정, metadata 불일치, "skeleton 교체" 표현, 비주얼 회귀 도구, Featured row 검증). Plan 자체 추가 발견: dev/prod DB · `database.types.ts:300-322` 모두 `is_featured` 컬럼 **부재** (Phase 0 audit §4 오류). 사용자 결정으로 **Featured 정책을 "최신 published 1건"으로 변경**, DB 마이그레이션은 별도 task로 deferral
- 2026-05-14: `getFeaturedSermon()` 구현을 thin wrapper로 좁힘 — 처음에는 `getRecentSermons(1)` 재사용 의도였으나 WORK 시작 시점에 `SermonListItem` light fieldset(`sermon-service.ts:33-37`)이 mockup이 사용하는 `summary`/`duration`/`sermon_series` 필드를 누락한 사실 확인. → `getSermons({ pageSize: 1 }).sermons[0] ?? null`로 변경(`SermonWithRelations[]` 반환). cache key 신설 0, service method 신설 0 원칙 유지. SC#1의 `SermonWithRelations | null` 타입과 일치
- 2026-05-14: metadata title `'말씀'` → `'설교'` 통일 — `hero.config.ts:14` Hero title과 일치 (Codex G 지적)

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: —
- **사유**: `src/services/sermon/index.ts` 변경(`ADR_TRIGGER_PARTS` 포함)은 `getFeaturedSermon()` 1줄 wrapper 추가뿐. 기존 public 계약(`getSermons`/`getRecentSermons`/`getAllSeries` 등) 변경 0, 데이터 흐름 신규 추가 0(`getRecentSermons` 재사용), 캐시 정책 변경 0, 인증/배포 정책 변경 0. `_shared-config.mjs:7-26`의 trigger 목적("영구 결정 동반 변경") 미해당. archive 이관은 `src/app/` 영역이라 trigger 미포함. ADR 0009 패턴(`scripts/check-commit-msg.mjs` 도입 + 룰 강제)과 비교해도 본 변경은 정책 결정 수준 아님

## Open Questions

- 없음.

## Codex 계획 검증

- **상태**: ✅ **5차 PASS** — WORK 진입 승인. 1~4차 CHANGE_REQUEST 누적 14건 (1차 7+자체발견 1 / 2차 3 / 3차 2 / 4차 1) 모두 반영 완료
- **요청 시점**: 2026-05-14 1차/2차/3차/4차/5차 (동일 thread resume)

### 1차 (2026-05-14)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 5체크 #3·#4 FAIL, BLOCKING CONCERN 1건 + CONCERN 6건.

**핵심 지적** (verbatim 발췌):
> **F. Archive 이관 import·링크 — BLOCKING CONCERN**
> co-location 규칙 위반은 아님. 그러나 계획 `:35`, `:65`, `:90`이 page import만 언급하고 아래 3곳을 누락함:
> - `src/utils/sermon.ts:130-133` `buildSermonHref('/sermons')`
> - `src/hooks/useSermonFilter.ts:22-24` `router.push('/sermons...')`
> - `SermonYearGrid.tsx:21` `href="/sermons?year="`
> 이 3곳을 `/sermons/all`로 바꾸지 않으면 필터 클릭 시 새 hub로 이탈함.

> **B. OQ-5 helper 선택 — CONCERN**
> 문제는 계획 `:66`의 `cloudinaryFetchUrl(getSermonThumbnail(sermon) ?? '')` — `getSermonThumbnail()`이 null 반환 시 빈 fetch URL이 Cloudinary로 날아감. caller에서 `thumbnail === null → placeholder 또는 미렌더` 분기를 명시하거나, helper 시그니처를 `(url: string | null) => string | null`로 바꿔야 함.

> **D. Featured = null 동작 — CONCERN**
> "prod 이미 있음" 주장은 계획 어디에도 Supabase count 결과나 대시보드 스크린샷이 없음. … `SELECT count(*) FROM sermons WHERE is_featured = true` 결과를 Assumption에 추가하거나, (ii) 0건이면 최신 설교 1건 fallback 동작을 SC에 추가해야 함.

**평이 풀이**: 필터 URL 3곳을 빠뜨려 archive 이관 시 새 hub로 이탈하는 버그가 잠재함. helper 시그니처가 null 처리 없어 빈 fetch URL 날아갈 위험. Featured 데이터 존재가 가정에만 있고 실제 확인 안 됨.

**Plan 자체 추가 발견** (Codex 외): dev DB(`mficogrxekuahjqborxw`) `information_schema.columns` 조회 결과 `sermons` 테이블 20개 컬럼 중 `is_featured` **부재**. prod DB(`xrfyevrnmvbuwsbktuja`) `is_published/is_featured` 필터 조회 결과 `is_published`만 존재. `database.types.ts:300-322` Row 정의도 `is_featured` 없음. Phase 0 audit §4의 `database.types.ts:483` 인용 오류 확정.

**반영**:
- (BLOCKING F) 필터 URL 누락 3곳 + 본 plan 추가 발견 1곳(`SermonDetailPage.tsx:48`) = 총 4곳을 SC#5·체크리스트#7·영향 파일에 추가. base path `/sermons` → `/sermons/all` 명시
- (B) helper 시그니처를 `(remoteUrl: string | null): string | null`로 변경. 호출부 null 분기 1회 명시 (SC#3)
- (D) Plan 자체 BLOCK 발견과 결합 — Featured 정책을 "최신 published 1건"으로 변경 (`getRecentSermons(1)` thin wrapper). `is_featured` row 검증 자체가 불필요해짐. Phase 0 audit 오류는 `docs/tech-debt-tracker.md`에 등록
- (E·기존 3-file 패턴) `featured()` service method + cache key 신설 폐기. service 1줄 wrapper만 — Codex E 자체는 PASS였으나 정책 변경으로 더 단순해짐
- (C ADR) §ADR 판단을 "불필요"로 1줄 확정 + 사유 기재
- (G metadata) `/sermons` title `'말씀'` → `'설교'`로 변경, Hero `hero.config.ts:14`와 통일
- (H Phase 0 정합성) `/sermons/all/page.tsx`를 "신규" → "Phase 0 skeleton **교체**"로 표기
- (Codex #4 비주얼 회귀) "비주얼 회귀 0건" → "DevTools Network + 수동 클릭 3건"으로 도구 명시 (Verification 섹션)

### 2차 (2026-05-14)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 3건.

**핵심 지적** (verbatim 발췌):
> **#2 cloudinaryFetchUrl null 분기 — PARTIAL** … SC#3 호출 예시가 "non-null assertion(`!`)"과 "placeholder/dark gradient 분기" 두 선택지를 동시에 제시함(`:34`). 실제 구현 정책이 어느 쪽인지 AMBIGUOUS.
> **#10 새 불일치 재스캔 — FAIL** Non-goals에 `[id]` 페이지 변경 제외라고 기술(`:27`)되어 있으나, 영향받는 파일·체크리스트에 `SermonDetailPage.tsx:48` 수정이 포함됨(`:92`, `:106`). Verification의 "기존 상세 페이지 영향 0" 주장(`:57`)이 시리즈 링크 URL 변경과 정면 충돌.

**평이 풀이**: helper caller 정책이 2 선택지로 모호. Non-goals와 Verification에서 "상세 페이지 영향 0" 주장이 실제 변경(SermonDetailPage.tsx:48)과 충돌.

**반영**:
- SC#3 helper caller 정책 단일 확정: `thumb === null`이면 `<Image>` 미렌더 + `$overlay-image` dark gradient. non-null assertion 사용 X
- Non-goals 분리: `[id]` 렌더 구조·UI 변경 제외 + 시리즈 링크 base path 1줄은 포함
- Verification "기존 상세 페이지 영향 0" → "상세 페이지 렌더 유지, 시리즈 링크 base path만 /sermons/all로 변경 (SermonDetailPage.tsx:48)"

### 3차 (2026-05-14)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 2건.

**핵심 지적** (verbatim 발췌):
> **CR#1 — `:77` placeholder 정책 재분기** SC#3에서 dark gradient 단일 정책을 확정했는데, 접근법 셀(`:77`)에 "placeholder SVG 또는 dark gradient" 두 선택지가 다시 등장합니다.
> **CR#2 — `:26` "코드 0줄 수정" 과 실제 변경 범위 불일치** "SermonListPage/* 코드 0줄 수정"이라고 했으나, 같은 계획이 `SermonYearGrid.tsx:21` 링크 base path 변경을 요구합니다.

**평이 풀이**: §접근법에 placeholder 2 선택지 재등장 — SC#3 단일 정책과 충돌. Non-goals "코드 0줄" 표현이 실제 1줄 변경과 충돌.

**반영**:
- §접근법 #4 "placeholder SVG 또는 dark gradient" → "`$overlay-image` dark gradient placeholder 단일 사용 (placeholder SVG 옵션 X)"
- Non-goals "SermonListPage/* 코드 0줄 수정" → "코드 리팩터 없음. 단 `SermonYearGrid.tsx:21` 링크 base path 1줄은 archive 이관 필수 동반 변경이라 본 task에 포함"

### 4차 (2026-05-14)

**Codex verdict** (verbatim): `CHANGE_REQUEST`. 잔여 1건.

**핵심 지적** (verbatim 발췌):
> `:129` 의사결정 로그에 여전히 "`_component/SermonListPage/*` 코드 변경 0"이라는 문구가 남아 있고, 이는 `:26`, `:40`, `:91`, `:106`(SermonYearGrid.tsx:21 변경 명시)과 충돌합니다. 과거 기록 섹션이 아니라 현재 이관 설명이므로 수정이 필요합니다.

**평이 풀이**: 의사결정 로그의 "코드 변경 0" 표현이 Non-goals·SC·체크리스트의 1줄 변경 명시와 충돌.

**반영**: §의사결정 로그 archive 이관 항목을 "코드 리팩터 없음 (`SermonYearGrid.tsx:21` base path 1줄 제외), page.tsx 2개 + 필터 URL 4곳(`utils/sermon.ts:133`, `useSermonFilter.ts:28`, `SermonYearGrid.tsx:21`, `SermonDetailPage.tsx:48`) 변경"으로 구체화.

### 5차 (2026-05-14)

**Codex verdict** (verbatim): `PASS`.

**핵심 통과 사유** (verbatim 발췌):
> 4차 지적 해소 여부: 해소됨 — `docs/exec-plans/active/2026-05-14-sermons-featured.md:129`이 `SermonYearGrid.tsx:21` 예외와 필터 URL 4곳(`utils/sermon.ts:133`, `useSermonFilter.ts:28`, `SermonYearGrid.tsx:21`, `SermonDetailPage.tsx:48`)을 파일·라인으로 열거합니다.
> 새 모순/추상 표현: 없음 — 같은 변경 범위가 SC#5(`:37-41`), 영향 파일(`:85-93`), 체크리스트(`:104-107`)와 일치합니다.

**평이 풀이**: 1~4차 누적 14건 CHANGE_REQUEST가 모두 해소되었고, 변경 범위 명세가 SC·영향 파일·체크리스트·의사결정 로그 4 섹션에서 동일한 4곳을 가리켜 모순 0.

**최종 결론**: 계획은 WORK 단계로 진행 가능합니다. (Codex 결론)

## Codex 1차 검증

- **상태**: ✅ 1차 완료 — FIX_APPLIED (Codex 직접 1건) + CHANGE_REQUEST (Claude 반영 5건)
- **요청 시점**: 2026-05-14 1차 (구현 10 파일 diff 직후)
- **결론**: P1·P2·P3·P4 PASS, P5 부분 FAIL → SCSS 하드코딩 5건 + cloudinary helper 견고성 2건

**Codex verdict** (verbatim): `CHANGE_REQUEST (+ FIX_APPLIED 1건)`.

**Codex 직접 수정 (FIX_APPLIED)** — `src/utils/cloudinary.ts:51-57`:
- `CLOUD_NAME` 미설정 시 `res.cloudinary.com/undefined/...` URL 생성 버그 → `if (!CLOUD_NAME) return null;` guard 추가
- `res.cloudinary.com/` passthrough를 case-insensitive regex(`/^https:\/\/res\.cloudinary\.com\//i`)로 교체 — loader 기존 패턴(`/^https?:\/\//i`)과 일관

**CHANGE_REQUEST → Claude 반영** — `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.module.scss`:

| 위치 | Before | After |
| --- | --- | --- |
| grid-template-columns (tablet) | `58rem 1fr` 하드코딩 | 파일 상단 로컬 변수 `$featured-image-col: 58rem` (mockup 580px 근거 주석) |
| `.play_circle svg` margin-left | `0.2rem` | `$spacing-2` |
| `.play_circle` 배경/테두리 | `rgba(255,255,255,0.14)` / `rgba(255,255,255,0.22)` | 로컬 변수 `$badge-glass-bg` / `$badge-glass-border` (토큰 미존재 근거 주석) |
| `.duration` 배경 | `rgba(0,0,0,0.55)` | 로컬 변수 `$duration-overlay-bg` (토큰 미존재 근거 주석) |
| line-height 1.35/1.3/1.7 | 숫자 리터럴 | `$line-height-snug` / `$line-height-tight` / `$line-height-body-reading` |
| letter-spacing -0.015em/-0.02em/0.1em | em 리터럴 | `$letter-spacing-body` / `$letter-spacing-wide` (em → rem 토큰 매핑, 미미한 시각 차이 수용) |

**평이 풀이**: SCSS에 5종 raw 하드코딩(grid col, svg margin, rgba 2건, line-height/letter-spacing 다수). styles SKILL "토큰에 없으면 로컬 변수 선언" 규칙 적용 — rgba 3개는 mockup 고정값 + 토큰 미존재로 로컬 변수, line-height/letter-spacing은 기존 토큰 매핑.

**나머지 검증 항목 PASS** — P1 (타입·`<Image fill priority>`·null 가드) / P2 (레이어 경계) / P3 (외과적 변경 10 파일 모두 SC#1~7 범위) / P4 (SC#3 caller null 정책: `<Image>` 미렌더 + dark gradient placeholder, SVG/non-null assertion 사용 X) / scrutiny 5·6·8·9·10 모두 OK.

- **수정 파일**: `src/utils/cloudinary.ts` (Codex 직접) + `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.module.scss` (Claude 반영) + `src/app/(content)/sermons/_component/SermonFeatured/SermonFeatured.tsx` (Claude verify-task 발견 추가 반영)
- **남은 리스크**: 없음 — verify-task.mjs PASS 후 해소

### 2차 — PR #87 리뷰 fix (2026-05-14)

**컨텍스트**: PR #87 open 후 자동 리뷰 4건 — Gemini 2(medium) + Codex 2(P2). 모두 material/operational, false alarm 1건 포함.

**Codex verdict** (verbatim): `PASS`.

**검토 범위**: working-tree diff 4 파일 (`services/sermon/index.ts`, `utils/cloudinary.ts`, `app/(content)/sermons/page.tsx`, `app/_component/home/RecentSermons.tsx`).

**개별 verdict** (verbatim 발췌):
> **G-1** — PASS. `src/services/sermon/index.ts:44` 주석만 변경됐고, `src/services/sermon/sermon-service.ts:68`의 `.order('sermon_date', { ascending: false })`가 `list()` 기본 쿼리에 무조건 적용됩니다.
> **G-2** — PASS. `src/utils/cloudinary.ts:54`의 `if (remoteUrl === null) return null;`이 `src/utils/cloudinary.ts:55`의 `if (!/^https?:\/\//i.test(remoteUrl)) return remoteUrl;`보다 먼저 있습니다. `https://img.youtube.com/...` 같은 외부 URL은 정규식 통과 후 기존 fetch URL 생성 경로로 진행합니다.
> **C-1** — PASS. `searchParams` 타입은 `Promise<Record<string, string | string[] | undefined>>` (Next.js 15 비동기 형식) … `/sermons/all?${query}` redirect 호출이 `getFeaturedSermon()` await보다 앞에 위치
> **C-2** — PASS. `src/app/_component/home/RecentSermons.tsx:23` `href="/sermons/all"` 한 줄만 변경됐고, `git diff --numstat`도 이 파일을 `1 1`로 표시했습니다.

**평이 풀이**: Gemini 2건은 (a) `getFeaturedSermon` 정렬 의존이 `list()` hardcoded `.order('sermon_date', {ascending: false})`라 false alarm — 주석으로 출처 명시. (b) `cloudinaryFetchUrl`이 public ID 입력 시 잘못된 fetch URL 생성 위험을 `if (!/^https?:\/\//i.test(...)) return remoteUrl;` 가드로 차단. Codex 2건은 archive 이관 후 (c) `/sermons?series=...` 구 URL이 Featured-only로 끊기는 회귀를 `redirect('/sermons/all?...')`로 보존, (d) 홈 `RecentSermons.tsx:23` CTA를 `/sermons/all`로 정정.

**수정 파일**: 4 파일 (위 검토 범위). G-1 주석 1줄, G-2 가드 1줄, C-1 redirect 분기 신규(15줄), C-2 href 1줄.

## Claude 2차 검증

- **검토 내용**: Codex 1차 FIX 1건(cloudinary.ts) + Claude 반영 5건(SermonFeatured.module.scss) + verify-task 추가 발견 1건(`<Image>` → `<CloudinaryImage>`) diff 교차 확인.
  - Codex FIX (`cloudinary.ts:51-57`): `CLOUD_NAME` guard 추가 + case-insensitive regex 모두 정확. helper 시그니처 `(string | null) => string | null` 유지. 인접 코드 변경 0.
  - Claude 반영 (`SermonFeatured.module.scss`): grid col 로컬변수 `$featured-image-col`, svg margin `$spacing-2`, rgba 3종 로컬변수 (`$badge-glass-bg/border`, `$duration-overlay-bg`), line-height `$line-height-snug/tight/body-reading`, letter-spacing `$letter-spacing-body/wide` 모두 styles SKILL "토큰 미존재 시 로컬변수" 규칙 충족.
  - verify-task 추가 발견: 1차 `yarn build` 실패 — `Image with src "..." is missing "loader" prop`. dnchurch는 `<Image>` 직접 사용 X, `<CloudinaryImage>` wrapper(`src/components/common/CloudinaryImage.tsx`) 사용 컨벤션 (`Banner.tsx`/`NewHere.tsx`/`AboutOurChurch.tsx` 등 모든 기존 사용처). `next.config.ts` `loaderFile` 설정만으로는 `<Image>`가 자동으로 cloudinary loader를 받지 못함. → SermonFeatured.tsx에서 `import Image from 'next/image'` → `import CloudinaryImage from '@/components/common/CloudinaryImage'`. `cloudinaryFetchUrl` 결과는 https 시작이라 loader passthrough(`cloudinary.ts:71`)로 그대로 사용됨. plan SC#3 caller 정책(`<Image>` 미렌더 + dark gradient placeholder) 본질 유지.
- **실행한 검증**: `node scripts/verify-task.mjs sermons-featured` 재실행 (run-id `20260514-135059`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - `logs/sermons-featured/20260514-135059/summary.log`: `✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채)`. 신규 unused는 없음, 모든 신규 export가 사용처에 import됨.
  - `git status --short`: M 10 + ?? 1 (SermonFeatured 디렉토리 신규). plan §영향받는 파일 list와 정확히 일치.
  - 사용자 수동 확인 완료 (2026-05-14): 3 URL 200 + 필터 4 clickpath + Featured `<Image>` URL `res.cloudinary.com` 시작 모두 정상.
- **최종 판단**: ✅ **PASS** — Codex 1차 FIX 1건 + Claude 반영 5건 + verify-task 추가 발견 1건 모두 plan SC#1~7과 정합. 사용자 승인 받음. 커밋 진행 가능.

### 2차 — PR #87 리뷰 fix (2026-05-14)

- **검토 내용**: PR #87 자동 리뷰 4건(Gemini medium 2 + Codex P2 2)에 대한 fix diff 4 파일 교차 확인.
  - G-1 (`services/sermon/index.ts:44`): `sermon-service.ts:68`의 `.order('sermon_date', {ascending: false})` 위치 직접 확인 — Gemini의 "정렬 보장 안 됨" 지적은 함수 이름만 보고 list() 본문 미확인한 false alarm. 주석 1줄로 출처 명시(`sermon-service.ts:68 'sermon_date desc' 기본값에 의존`)만 적용, 코드 변경 0줄.
  - G-2 (`utils/cloudinary.ts:54-58`): null guard 다음, `res.cloudinary.com` passthrough 이전 위치에 `if (!/^https?:\/\//i.test(remoteUrl)) return remoteUrl;` 가드 삽입. 기존 YouTube 썸네일(`https://img.youtube.com/...`) 경로는 정규식 통과 후 fetch URL 변환 — 동작 회귀 0. public ID 입력 시 잘못된 fetch URL 생성하던 잠재 버그 차단.
  - C-1 (`app/(content)/sermons/page.tsx`): `searchParams: Promise<Record<string, string | string[] | undefined>>` Next.js 15 비동기 시그니처. `URLSearchParams` + `qs.append` 반복으로 단일·배열 값 모두 보존. `redirect('/sermons/all?${query}')` 호출이 `getFeaturedSermon()` await보다 앞에 위치 — 구 URL 진입 시 DB 쿼리 없이 short-circuit.
  - C-2 (`app/_component/home/RecentSermons.tsx:23`): `href="/sermons"` → `href="/sermons/all"` 1줄, `git diff --numstat`로 `1 1` 확인. 인접 정리 0.
- **실행한 검증**: `node scripts/verify-task.mjs sermons-featured` 재실행 (run-id `20260514-164407`) → ✓ 필수 검증 통과 (ESLint / stylelint / Build (next) / Knip).
  - `logs/sermons-featured/20260514-164407/summary.log`: `✓ 필수 검증 통과 (⚠ 경고: Knip — 기존 부채, 커밋 차단 안 됨)`.
  - Codex 1차 PASS verbatim 인용 — §Codex 1차 검증 2차 섹션 참조.
- **최종 판단**: ✅ **PASS** — PR #87 리뷰 4건 fix 모두 surgical change + plan SC 범위 내. 사용자 승인 받음. 커밋 진행 가능.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다. 별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (필수 5필드)

- KPI / 시작-종료 (분): ~240 (2026-05-14 — Phase 0 머지 직후 시작, PR #87 머지 07:55 UTC; 사용자 피드백 "5분이면 될 작업을 1시간이 넘게 걸렸어"가 본 phase에서 발화 → ADR 0010 도입 트리거가 됨. **본 phase는 ADR 0010 적용 전이라 baseline 측정치**)
- KPI / Codex 라운드: 7 (계획 검증 5라운드 + 구현 1차 검증 1라운드 + PR #87 리뷰 fix 검증 1라운드)
- KPI / material 사후 발견: 3 (PR #87 review G-2 cloudinary public ID 깨짐 잠재 버그, C-1 `/sermons?series=…` 구 URL 회귀, C-2 홈 CTA archive 경로 — Codex 1차 검증에서 잡지 못하고 PR 자동 리뷰 단계에서 검출)
- KPI / harness-gate placeholder fail: 0
- KPI / 사용자 검토 부족 피드백: 0

## 회고

- 잘된 것:
  - EXPLORE 단계에서 `is_featured` 컬럼 부재를 dev/prod DB + `database.types.ts:300-322`로 직접 검증해 Phase 0 audit 오류를 사전 차단 (BLOCK 발견).
  - 1차 Codex 1차 검증에서 cloudinary helper `CLOUD_NAME` guard 부재를 Codex가 직접 수정 (FIX_APPLIED), SCSS 하드코딩 5건은 Claude가 로컬 변수로 반영.
  - PR review 4건을 4 파일 1 commit으로 묶되 subject `+` 0회 / `,` 열거 / 80자 한도 준수 — commit-msg hook R2/R4 통과.

- 다음에 할 것:
  - Phase 1-2(Recent 설교 캐러셀)부터 ADR 0010 적용 — compact exec-plan 6 필수 + 3 검증, 계획 검증 1-2 라운드 목표.
  - Codex 1차 검증 프롬프트에 "archive 이관 후 구 URL 회귀"·"홈/외부 진입점 link 정합성" 항목을 명시 추가 — 본 phase에서 PR review 단계까지 미발견된 C-1·C-2 클래스 차단.

- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
  - `sermons.is_featured` 컬럼 미존재 — 어드민 수동 마킹 UI 필요 시 별도 task (Phase 5 후보).
  - Phase 0 audit §4 인용 오류 (`database.types.ts:483` ← 실제 부재) — Phase 0 회고 부채와 sync.
  - `cloudinaryFetchUrl`의 public ID 입력은 현재 미사용이나 가드 추가로 미래 안전 — 사용처 추가 시 호출부 정책 재확인.
