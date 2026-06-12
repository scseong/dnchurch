# sermons-finalize-core

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-16
- **브랜치**: feat/sermons-finalize-core
- **Open questions**: none
- **ADR needed**: no

## 목표

Sermon 섹션 마감 핵심 3항목: (1) 5개 라우트 로딩/에러 UI(6-2), (2) 영상 썸네일→클릭 재생+provider 분기(7-2), (3) 시리즈 상세·목록 SEO 메타(8-1). 신규 기능 아닌 완성도 보강.

## 검증된 Assumptions

- 기존 loading/error 컨벤션 존재: `app/(admin)/admin/sermons/{loading,error}.tsx` — error.tsx는 `'use client'`+`reset()`+`console.error`, loading은 로컬 skeleton module. (Read 확인)
- `Skeleton` 공용 UI 존재(`components/ui/Skeleton`, variant rect/text/circle). (Read 확인)
- generateMetadata 컨벤션: `news/bulletins/[id]/page.tsx`·`sermons/[id]/page.tsx`(OG+JSON-LD). 시리즈 상세는 정적 metadata만(OG/canonical/twitter 없음). (Read 확인)
- sermon 라우트 5개: `/sermons`,`/sermons/all`,`/sermons/series`,`/sermons/series/[id]`,`/sermons/[id]`. (find 확인)
- `SermonVideoPlayer`는 videoId iframe 직접 임베드(썸네일/autoplay/provider 분기 없음), props=`{videoId,title}`. sermon에 `video_provider`·`video_id` 존재. (Read 확인)
- `SeriesDetailHero`/`SeriesEpisodeCard`가 `series.cover_image_url`·`getSermonThumbnail` 사용 — OG 이미지 소스 재사용 가능. (Read 확인)

## Success Criteria

- 5개 라우트 각각 데이터 페칭 지연 시 skeleton 노출, throw 시 error.tsx(재시도 버튼)로 폴백 — `loading.tsx`/`error.tsx` 파일 존재 + 빌드 통과
- `/sermons/[id]` 영상: 초기 썸네일+play 버튼, 클릭 시 iframe `autoplay=1` 교체. `video_provider==='youtube'`만 iframe, 그 외 placeholder/링크 분기
- `/sermons/series/[id]` `generateMetadata` 동적 생성(시리즈 title·description·cover_image_url OG). `/sermons/series`·`/sermons/all`·`/sermons` 정적 metadata 정비. canonical(alternates) + twitter card 추가
- verify-task PASS (tsc/lint/lint:styles/build 0 error)

## Non-goals (surgical scope)

- 7-1 검색 디바운스 / 7-4 캐러셀 키보드 / 8-2 공유 / 8-3 접근성 점검 / 8-4 성능 점검 — **별도 후속**. 본 task에서 건드리지 않음
- 영상 vimeo 등 실제 타 provider 임베드 구현 X — youtube 외는 분기 가드(placeholder/원본 링크)까지만
- 인접 컴포넌트 리팩터·토큰 정리 금지

## 영향받는 파일

- `src/app/(content)/sermons/{,, all/, series/, series/[id]/, [id]/}` — `loading.tsx`(5) + 공통 `error.tsx`(sermons 루트 1, 하위 cascade)
- `src/app/(content)/sermons/_component/SermonVideoPlayer/SermonVideoPlayer.tsx`(+module.scss) — 썸네일/play/provider 분기
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — VideoPlayer에 thumbnail/provider props 전달
- `src/app/(content)/sermons/series/[id]/page.tsx` — `generateMetadata` 추가
- `src/app/(content)/sermons/{series,all}/page.tsx`, `sermons/page.tsx` — metadata 정비(canonical/twitter)
- (필요 시 loading 전용 skeleton module scss)

## 단계별 체크리스트

- [ ] 1. 공통 `error.tsx`(sermons 루트, 'use client'+reset) + 라우트별 `loading.tsx`(5) skeleton
- [ ] 2. `SermonVideoPlayer` 썸네일→클릭 iframe(autoplay) + provider 가드, DetailPage props 연결
- [ ] 3. `series/[id]` generateMetadata(OG=cover_image_url) + 목록/메인 metadata canonical·twitter 정비
- [ ] 4. verify-task + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-finalize-core`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → DL-1~3 반영 후 WORK 진입 (CR 전부 expression-level 구체 보완, 재요청 불요)

> (a) 스코프 PASS_WITH_DECISION_LOG — loading/error·video·metadata 커밋 분리. (b) `(content)/sermons/error.tsx` 1개가 5개 nested route page throw 전부 catch, `notFound()`는 NEXT_HTTP_ERROR_FALLBACK라 error boundary에 안 삼켜짐(layout.tsx 오류만 부모 bubble — 본 task layout 무변경). (c) loading.tsx Suspense fallback 정상, UUID guard처럼 await 전 notFound면 loading 거의 안 보임(정상). (d) VideoPlayer 이미 'use client'라 boundary 무변경, 16:9 wrapper 공유 시 shift 0, 호출부 props 동시 갱신 필요. (e) generateMetadata 이중 fetch는 동일 GET fetch memoization으로 대체로 흡수(신뢰 85%).
> **CR**: ①series/[id] generateMetadata에 UUID_RE guard 누락 시 비-UUID서 500 → guard 필수 ②root metadataBase 없음 → canonical absolute URL 방식 명시 ③VideoPlayer thumbnail/iframe 동일 16:9 wrapper 명시

**풀이**: 구조 판단(error/loading cascade·notFound 안전·boundary)은 전부 PASS, CR 3건은 구현 디테일 보완(guard·canonical·wrapper)이라 plan에 결정 박고 WORK 진입. 재검증 불요.

## 의사결정 로그

- **DL-1 (CR① 해소)**: `series/[id]` `generateMetadata`에 page.tsx와 동일 `UUID_RE` 가드 적용. 비-UUID → `return {}`(page가 notFound 처리, metadata 단계는 Supabase 호출 안 해 500 회피). getSeriesDetail 결과 null도 `return {}`.
- **DL-2 (CR② 해소)**: canonical은 기존 `process.env.NEXT_PUBLIC_SITE_URL`(auth.ts 선례) 기반 **절대 URL을 sermon 페이지 로컬에서 생성**. root `layout.tsx`에 `metadataBase` 추가 안 함 — 전역 OG/canonical 해석에 사이트 전체 blast radius가 생기고 Non-goal(인접 변경 금지)에 위배되므로 로컬 절대 URL이 외과적.
- **DL-3 (CR③ 해소)**: `SermonVideoPlayer`에서 썸네일 poster와 재생 iframe은 **동일한 `aspect-ratio:16/9` wrapper를 공유**(상태만 토글, DOM 구조 동일) → layout shift 0. 호출부 `SermonDetailPage`는 Props 타입과 동시 갱신(`videoProvider`·`thumbnailUrl` 추가).
- **DL-4 (스코프 PASS_WITH_DECISION_LOG)**: 커밋 분리 — (1) loading/error (2) video player (3) SEO metadata (4) play-hint 통일. 롤백 독립성 확보.
- **DL-5 (사용자 테스트 피드백 반영)**: (a) 데스크톱 영상 sticky 미동작·불필요 판단 → `SermonVideoPlayer` sticky 제거, `.sticky_wrap`→`.video_wrap` 리네임(모바일 풀폭만 유지). (b) skeleton이 실제 레이아웃과 불일치 → `SermonsSkeleton` 4 variant를 실 구조로 재작성(Featured 2열·archive 사이드바+가로카드·detail 영상+사이드바·series 헤로+회차그리드). (c) autoplay 소리 정상 확인.
- **DL-6 (play-hint 통일 — 사용자 승인 스코프 추가)**: 썸네일 play가 4종 분기(GridCard·SeriesDetail = white .16 hover-reveal / RecentCarousel = white .14 always-on / Featured = glass big / VideoPlayer = black big)였음. 사용자가 "이번 PR 포함" 선택. **역할 2종** 믹스인 통일: `_mixins.scss`에 `sermon-play-hint-sm`·`-lg` 신규. (1차안: 시각만 캡슐화·동작 보존 → Codex 1차 LGTM)
- **DL-7 (play-hint 재설계 — 사용자 피드백 2차)**: 사용자 요구 — "카드 섹션은 데스크톱 hover에만, 모바일 항상 표시 / 흰 아이콘 + 검정 opacity 배경 / thumbnail 있는 컴포넌트 모두". 믹스인을 위치+시각+동작 단일 소스로 재작성: `position:absolute` 중앙 + `color:$txt-inverse` + `background-color:rgba($black,0.5)`(glass border/blur 폐기, SKILL rgba 예외) + `opacity:0`+`transition`+`@media(hover:none){opacity:1}`. 각 컴포넌트는 `@include`만 + `부모:hover .play{opacity:1}` reveal. 적용: GridCard·SeriesDetail·RecentCarousel·Featured(+`.card:hover` 신규). **사용자 결정 분기**: ①VideoPlayer 상세 포스터는 통일 **제외**(메인 재생 affordance, 항상 표시) → 자체 always-visible 스타일 복원(흰·검정opacity 동일 톤, mixin 미사용) ②`SermonOtherByPreacher`는 play 없었으나 "thumbnail 모두" 지시로 **신규 추가**(IoPlay span + sm 믹스인 + `.card:hover`). 아이콘이 wrapper 대비 작다는 피드백 → sm `$font-size-11→14`, lg `24→28`(tablet `28→32`), VideoPlayer 동일.
- **DL-8 (커밋 분리 갱신)**: (1) loading/error (2) SEO metadata (3) play-hint 통일·재설계(_mixins + 5 컴포넌트, OtherByPreacher 신규 span 포함) (4) video player(7-2 + sticky 제거 + 포스터 자체 스타일) (5) docs. 믹스인이 video보다 먼저 커밋돼야 빌드 정합(VideoPlayer는 mixin 미사용이라 무관하나 순서 유지).
- **DL-9 (아이콘 통일 사각지대 — 사용자 발견)**: SermonCarouselCard·SermonFeatured만 하드코딩 `<svg width=13|24>`라 믹스인 `font-size`가 안 먹어 아이콘 크기가 따로 놀았음(사용자가 CarouselCard 13→16 수동 패치로 포착). 정합: 두 곳을 다른 3곳과 동일하게 `react-icons IoPlay`로 교체 → 5곳 전부 믹스인 font-size 단일 제어, 매직넘버 제거. 6번째 커밋(Fix). 사용자 수동 16은 IoPlay 교체로 대체, `.dot` 줄바꿈(에디터 artifact)은 원형 복원. PR #94 생성(이후 사용자 지시).

## PR #94 자동리뷰 대응

Codex CHANGE_REQUEST + Gemini/Codex 인라인 6건 트리아지. verify `20260516-183435` PASS.

- **[#1 P1 — 적용]** `SermonVideoPlayer` `playing`이 `videoId` 변경과 분리 → next/link 설교 이동 시 client component 재사용으로 새 설교 즉시 autoplay. `SermonDetailPage` 호출부 `key={String(sermon.id)}` 부여(설교 변경 시 리마운트→playing 초기화).
- **[#2·#3 — 적용]** OG/twitter 이미지가 `cloudinaryFetchUrl`(public-id 그대로 반환, 주석 명시) → `<meta>`엔 loader 없어 비-절대 URL이면 카드 미리보기 깨짐. `series/[id]`·`sermons/[id]` 메타 이미지를 `getCloudinaryUrl`로 교체(public-id→절대 res.cloudinary.com, 이미 http면 그대로라 youtube 썸네일 idempotent). dev 데이터: cover_image_url 0건·thumbnail_url youtube 절대 URL이라 현 시점 활성 결함은 아니나 계약상 정정.
- **[#5 — 적용]** skeleton `VCard`/`HCard` 약어 → `VerticalCardSkeleton`/`HorizontalCardSkeleton`.
- **[#4 — 미적용]** `getSeriesDetail` metadata+page 2회 호출. `getSeriesDetail`은 `createStaticClient(sermonCache.seriesDetail(id))` 사용 — Next fetch 메모이제이션으로 동일 요청 dedupe됨. 공유 서비스 함수에 `React.cache` 래핑은 5개 소비처 회귀 리스크 대비 이득 미미. tech-debt 미등록(현 캐시로 충분), reply로 사유 설명.

## Codex 1차 검증

- **결론**: PASS (Codex 1차안 LGTM, 23파일 staged 기준) — **단, play-hint 재설계(DL-7) 이후 최종 상태는 Codex 재검증 미수행**: 재요청이 codex-companion Bash 권한 거부로 실행 불가. 사용자가 "Claude 2차로 진행" 결정(재설계분이 순수 표현 SCSS·로직 무변경, 로직부는 본 LGTM=PASS에서 검증됨).

> (LGTM 1차안) (a) DL-1 series/[id] generateMetadata PASS — UUID_RE 검사 후에만 getSeriesDetail, page는 guard/no-data서 notFound 유지. (b) error.tsx 1개가 5 route cascade·notFound 미삼킴, SermonsSkeleton 'use client' 없음. (c) play-hint mixin reveal 체인 보존, dead var 잔여 0. (d) VideoPlayer poster button+aria-label, click 후에만 autoplay=1. (e) Non-goal leak 0.

**풀이**: 로직·구조부 LGTM. play-hint 재설계(시각/동작/믹스인)는 표현 변경이라 Codex 미재검 → Claude 2차가 최종 검증 대행.

## Claude 2차 검증

- **최종 판단**: PASS (재설계 DL-7 포함 최종 상태 — Codex 미재검분의 최종 검증 대행)

### 교차 확인 (최종 상태, verify `20260516-172924` PASS)

- **dangling 0**: `grep src/app/(content)/sermons --scss`로 `play-overlay-*`/`badge-glass` 잔여 — play 통일 5파일(GridCard·SeriesDetail·RecentCarousel·Featured·OtherByPreacher) 0건. `SermonSeriesCarousel $badge-glass-bg`는 ON-GOING **상태 배지**용 별개 var로 통일 범위 밖(정상 무변경).
- **믹스인 단일 소스**: `_mixins.scss` `sermon-play-hint-sm`(32px·`$font-size-14`)/`-lg`(64→80·`$font-size-28→32`) — `position:absolute` 중앙 + `$txt-inverse` 흰 아이콘 + `rgba($black,0.5)` + `opacity:0`+`transition`+`@media(hover:none){opacity:1}`. SKILL rgba 예외 주석 동반.
- **hover 짝 5/5 일치**: GridCard `.card:hover .play_btn`, SeriesDetail `.episode:hover .ep_play`, RecentCarousel `.card:hover .play_circle`, Featured `.card:hover .play_circle`, OtherByPreacher `.card:hover .play` — 각 부모 클래스가 실제 렌더 Link/wrapper와 일치(tsx 교차 확인). thumb 컨테이너 5종 전부 `position:relative`로 absolute 안착.
- **VideoPlayer 제외 확정**: mixin·제거 var 미참조, 자체 always-visible `.play`(흰·`rgba($black,.5)`·64→80·`$font-size-28→32`) 복원. poster `<button>`+aria-label, click→iframe autoplay 무영향.
- **OtherByPreacher 신규**: `IoPlay` import + `aria-hidden` span을 기존 Link 내부 thumb_box에 추가(중첩·a11y 무회귀). 모바일 list 변형에 적용, 데스크톱은 GridCard 재사용(이미 play 통일됨)이라 일관.
- **Non-goal 무누수**: 7-1/7-4/8-2/8-3/8-4 미구현 유지. 변경은 표현(SCSS/markup)·로직/데이터/레이어 무변경.

## 회고

**잘된 것**
- play-hint를 `_mixins.scss` 단일 소스로 중앙화한 덕에 사용자 2차 피드백(흰 아이콘+검정opacity·hover/모바일 동작 전환)을 믹스인 1곳 수정으로 5컴포넌트 일괄 반영. 분산 로컬 rgba였다면 5+곳 수정 필요했음.
- Codex 계획검증 CR(UUID guard·canonical metadataBase) 구현 전 DL-1~3에 선반영 → 1차안 LGTM. PR #94 #1(설교 이동 autoplay)·#2/#3(메타 이미지 비-절대 URL)도 코드 컨벤션 추적으로 정확 진단·수정.
- squash 머지 후 harness-gate "검증 기록 불일치 → 재verify" 패턴을 Phase 4/5/finalize 3회 반복 숙달, 매끄럽게 처리.

**다음에 할 것**
- play-hint 통일을 "시각만"으로 1차 종결했다가 사용자 피드백으로 동작·범위 2회 확장(DL-6→7→9). EXPLORE에서 **아이콘 렌더 방식(react-icons vs 하드코딩 inline svg)을 전수 확인하지 않아** SermonCarouselCard·Featured 사각지대를 사용자가 13→16 수동 패치로 잡아냄. 표현 통일 작업은 착수 전 "동일 역할 요소의 모든 렌더 변형" 인벤토리부터.
- Codex 1차 LGTM 후 대규모 재설계 발생 → 재검증이 codex-companion Bash 권한 거부로 불가, Claude 2차 대행. 큰 재설계가 예상되면 1차 검증 타이밍을 재설계 합의 이후로 미루는 편이 효율적.

**부채**
- Non-goal 분리분 별도 task 필요: 7-1 검색 디바운스 / 7-4 캐러셀 키보드 a11y / 8-2 공유 / 8-3 접근성 점검 / 8-4 성능 점검.
- PR #94 #4(`getSeriesDetail` metadata+page 2회 호출): `createStaticClient` fetch 메모이제이션으로 dedupe돼 실해 없음 → tech-debt 미등록(현 캐시 충분).

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시
-->

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
