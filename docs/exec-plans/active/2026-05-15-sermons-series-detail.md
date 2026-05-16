# sermons-series-detail

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-series-detail
- **Open questions**: none
- **ADR needed**: no — services/sermon에 read-only `bySeriesId` 신규(기존 `bySeriesSlug` 패턴 답습, 불변) + UI 페이지·컴포넌트. 캐시·라이브러리·레이어·인증 정책 불변.

## 목표

`/sermons/series/[id]`(현재 스켈레톤)를 mockup `SeriesDetailPCPage` 패턴의 시리즈 상세로 구현 — (5-1) cover 이미지 헤로(상태·기간·편수 메타) + (5-2) 회차 그리드(번호·썸네일·제목·말씀·날짜, PC 2열/모바일 1열). Phase 4 카드(`/sermons/series/${series.id}`)의 도착지.

## 검증된 Assumptions

- `series/[id]/page.tsx` 스켈레톤(제목만), 동적 파라미터 `[id]`(UUID) — Explore Read 확인
- Phase 4 `SeriesCard`는 `/sermons/series/${series.id}` 링크 — 파라미터 계약 = series UUID
- `bySeriesSlug`(`sermon-service.ts:168`)는 slug+`is_active=true` 필터 — **id 기반·완료 포함 단건 함수 부재** → 신규 필요
- `sermon_series`에 **`cover_tone` 컬럼 없음**, `cover_image_url`(string|null) 존재 — `database.types.ts` 확인. mockup의 cover_tone 그라디언트는 실 DB 미지원
- `id`는 UUID 컬럼 — 비-UUID 문자열 `.eq('id', x)`는 Postgres throw (Phase 4 CR-2 동일 리스크)
- 회차=해당 시리즈 sermons, `series_order` ASC → `sermon_date` ASC, `is_published`만 — `bySeriesSlug` 내부 쿼리 패턴 확인
- `SeriesCard`/`GridCard`/`SeriesEpisodeList`/`SermonSeriesSidebar` 모두 레이아웃 상이 — 헤로·회차 카드 재사용 불가, 신규

## Non-goals

- 영상 재생(YouTube iframe) — Phase 7
- 데이터 캐시·로딩/에러 UI 정교화 — Phase 6 (notFound 404만)
- 회차 placeholder("곧 공개") 표시·진행 바 — 설계상 제거(Sermon-Design-Decisions 2-4)
- `cover_tone` 마이그레이션 — DB 변경 회피(D1)
- 표준 Hero 컴포넌트 사용 — 시리즈 상세는 cover-image 커스텀 헤로(D5)
- `bySeriesSlug`·`getSermonsBySeries` 변경 — 공유 함수 불변(#6 교훈), 신규 분리

## 의사결정 로그

- **D1 — 헤로 배경 = `cover_image_url` + scrim, fallback 토큰 그라디언트**: mockup cover_tone 컬럼 미존재. 실 DB의 `cover_image_url`(SeriesCard도 사용)을 배경 이미지로, 없으면 `$overlay-image` 토큰 그라디언트. DB 마이그레이션·ADR 회피. (Phase 4 mockup-vs-DB 교훈)
- **D2 — `bySeriesId(id)` 신규(완료 포함), `bySeriesSlug` 불변**: id 기반·`is_active` 필터 없음(완료 시리즈도 상세 노출). 시리즈 단건 + 회차 + sermon_count 반환. 별도 cache tag. 공유 slug 함수 변경 안 함.
- **D3 — SeriesEpisodeCard·SeriesDetailHero 신규**: mockup 고유 3-col(번호│썸네일│정보)·cover 헤로. GridCard(번호 col 없음)·SeriesEpisodeList(세로 리스트)·SeriesCard(목록 카드) 레이아웃 불일치로 재사용 불가.
- **D4 — 비-UUID/미존재 id → `notFound()`**: `id`는 UUID 컬럼. 잘못된 id가 쿼리에 닿으면 throw(Phase 4 CR-2). 쿼리 전 UUID 형식 가드 + `maybeSingle` null → `notFound()`.
- **D5 — 커스텀 헤로(표준 Hero 미사용)**: 프로젝트 (content) 표준 Hero는 generic(`Hero/Hero.tsx:9-24` pathname config). 시리즈 상세는 cover 이미지 기반 다크 헤로라 별도 컴포넌트.
- **DL-1 — SCSS 토큰 고정** (Codex 보완): 헤로 fallback 배경 = `$overlay-image`(`_semantic.scss:85`, SeriesCard도 사용), scrim = `$overlay-scrim`. rgba 신규 하드코딩 금지.
- **DL-2 — cache tag 문자열 고정** (Codex 보완): 신규 tag `[ROOT, 'sermon-series-detail', \`sermon-series-detail-${id}\`]` — 기존 `sermon-series-list`/`sermon-series-${slug}`와 prefix 분리.
- **DL-3 — UUID 가드 코드 고정** (Codex 보완): `series/[id]/page.tsx`에서 `if (!UUID_RE.test(id)) notFound();`를 `getSeriesDetail(id)` 호출 **이전**에 실행.
- **DL-4 — 시리즈에 preacher 없음** (Codex 보완): `sermon_series`에 preacher 컬럼 없어 mockup의 헤로 메타 "설교자 · 기간 · N편" 중 설교자 제외 → 메타는 `시작 ~ 진행중|종료 · N편`. (Phase 4 동일 데이터 계약)

## Success Criteria

- `/sermons/series/{유효 id}`: cover 헤로(이미지 or fallback 그라디언트 + scrim) + "SERIES · 진행 중/완료" 라벨 + 제목 + 설명 + 메타(`시작 ~ 진행중|종료 · N편`) + 회차 그리드
- 회차 카드: 번호(01..) + 썸네일(play·duration) + 제목 + 말씀 + 날짜, `series_order` 순. PC 2열/모바일 1열
- 완료 시리즈도 정상 노출(is_active 무관), 진행/완료 메타 표기 분기
- 비-UUID·미존재 id → 500 아님 `notFound()`(404)
- `cover_image_url` 없는 시리즈도 fallback 헤로로 깨지지 않음
- `node scripts/verify-task.mjs sermons-series-detail` PASS

## 영향받는 파일

- `src/services/sermon/sermon-service.ts` — `bySeriesId(id)` 신규(시리즈+회차+count, is_active 필터 없음)
- `src/services/sermon/sermon-cache.ts` + `index.ts` — `seriesDetail(id)` cache tag + `getSeriesDetail(id)` wrapper
- `src/app/(content)/sermons/series/[id]/page.tsx` — 스켈레톤 → 조립 + UUID 가드 + notFound
- `src/app/(content)/sermons/_component/SeriesDetailPage/` — SeriesDetailHero·SeriesEpisodeCard·EpisodeGrid + `SeriesDetailPage.module.scss` (통합 1 scss)
- 재사용(무변경): `formattedDate`, `formatSermonDuration`, `getSermonThumbnail`+`cloudinaryFetchUrl`(Phase 3 #1 교훈), `CloudinaryImage`, `EmptyState`/`notFound`

## 단계별 체크리스트

- [ ] 1. `sermon-service.ts` `bySeriesId` + `sermon-cache.ts` tag + `index.ts` `getSeriesDetail`
- [ ] 2. `SeriesDetailPage.module.scss` (헤로 + 2열 회차 그리드, semantic 토큰)
- [ ] 3. SeriesDetailHero (cover_image_url/fallback + scrim + 라벨·메타)
- [ ] 4. SeriesEpisodeCard (번호│썸네일│정보, play·duration)
- [ ] 5. EpisodeGrid + `[id]/page.tsx` 조립 (UUID 가드·notFound)
- [ ] 6. verify-task

## Verification

- `node scripts/verify-task.mjs sermons-series-detail`
- `/sermons/series/{Phase4 카드 id}` 진입: 헤로·회차 그리드 정상, 진행/완료 메타 분기
- `/sermons/series/not-a-uuid` 및 미존재 UUID → 404(notFound), 500 아님
- cover_image_url 없는 시리즈 fallback 헤로 확인
- `/sermons/series`(Phase 4) 카드 → 상세 이동 동선

## ADR 판단

- **불필요** — `bySeriesId`는 기존 `bySeriesSlug` 읽기전용 패턴 답습 신규(공유 함수 불변), 나머지는 app 레이어 페이지·컴포넌트. 캐시·라이브러리·레이어·인증 정책 변경 없음. `start-adr` 미실행.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence high)

material CR 0건, 전부 expression-only. 5체크 전부 PASS — Assumptions(cover_image_url·UUID·bySeriesSlug is_active·SeriesCard id링크 실 코드 라인 확인), Non-goals(Phase7 영상·Phase6 정교화·cover_tone migration 제외), scope linkage, SC/verification 구체, 과한 추상화 없음.

보완 권장 4건 → 의사결정 로그 DL-1~4 반영: SCSS 토큰 고정($overlay-image/$overlay-scrim), cache tag 문자열(sermon-series-detail-${id}), UUID_RE 가드 위치(getSeriesDetail 이전), 시리즈 preacher 컬럼 부재(헤로 메타에서 설교자 제외). WORK 진입(3차 재검증 없음).

## Codex 1차 검증

- **결론**: FIX_APPLIED

> Types/Bugs OK(SeriesDetail·bySeriesId null·async params·UUID 가드 순서·import 경로 — `page.tsx:23-28` UUID 검증이 getSeriesDetail보다 먼저) · Layer/Surgical OK(`@/services/sermon`만, bySeriesSlug 불변) · SCSS OK(rgba 로컬변수 GridCard 선례 주석부 예외, hover 3원칙 위반 0, `.episode:hover .ep_play` opacity만) · Cache OK(`sermon-series-detail-${id}` 미충돌) · **Data Contract FIX_APPLIED**: 완료 시리즈가 `종료`를 안정 표시 안 하던 문제 → SeriesDetailHero inactive branch 항상 렌더 + `.hero_completed` 스타일 추가(Codex 직접수정).
> verify: tsc/lint/lint:styles 0 errors. Next build Google Fonts fetch 실패는 sandbox 네트워크(코드 무관).

**풀이**: 타입·레이어·SCSS·캐시 전부 통과. Codex가 완료 시리즈 메타 누락 가드를 직접 수정(missing-guard 범위 적합).

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접수정(SeriesDetailHero inactive 항상 `종료`) 교차 확인 — null-safe하나 `ended_at` 존재 시 종료일 미표시로 Phase 4 `SeriesCard`(`{start} ~ {ended}`)·design-decisions 2-4와 불일치. **보정**: inactive를 `ended_at ? 종료일 : "종료"`로 재수정 — Codex의 null 가드 의도 유지 + 일관성 회복. `.hero_completed`는 fallback로 여전히 사용(dead 아님).
- verify-task(`b3eoy4a3d`) 필수 검증 PASS — 내 환경 build 통과(Codex sandbox의 Google Fonts fetch 실패는 환경 이슈, 코드 원인 아님). Hero 보정 후 재검증(`btycnq12x`).
- DL-1~4 반영 확인: $overlay-image/$overlay-scrim, cache tag 문자열, UUID_RE 가드 위치, preacher 제외.
- 외과적: bySeriesSlug/getSermonsBySeries 불변, 변경 전부 Phase 5 추적.

## PR #92 자동리뷰 대응

Gemini 3 + Codex 3 코멘트 트리아지. 코드 수정 3건(verify RUN_ID=`20260515-232128` PASS, HEAD 갱신 예정).

- **[Codex #4 P1 — 적용]** `bySeriesId`가 `is_active` 필터를 통째 제거해 숨김(is_active=false) 시리즈가 UUID로 공개 노출. 코드 컨벤션상 `is_active`=공개 게이트(worship/staff/allSeries:126/bySeriesSlug:149/allPreachers:206 전부 `.eq('is_active',true)`), 완료 판정은 별축 `ended_at`(page.tsx:45·SermonSeriesBanner:23·SermonSeriesSidebar:17). → `bySeriesId` 시리즈 조회에 `.eq('is_active', true)` 복원. 완료 시리즈는 is_active=true+ended_at!=null이라 영향 없음, 숨김만 404. **계획의 "is_active 필터 없음" 결정 폐기** — 완료축을 is_active로 착각한 오류 정정.
- **[Codex #5 P2 — 적용]** 헤로 ON-GOING/COMPLETED·메타 분기를 `series.is_active` → `series.ended_at === null`로. Banner/Sidebar/메인과 동일 축. 중복 `~` dot 외과적 통합, 분기 단순화로 dead가 된 `.hero_completed` SCSS 제거.
- **[Codex #6 P2 — 적용]** `EpisodeGrid` 회차 번호 `index+1` → `sermon.series_order ?? index+1`. 비연속 series_order/중간 비공개 시 설교 상세 "제N편"과 번호 일치.
- **[Gemini #3 — 미적용]** `started_at` null 가드 제안 → `database.types.ts:265 started_at: string` (NOT NULL, Insert 필수). 불가능 시나리오 방어 가드레일에 따라 미적용.
- **[Gemini #1 — 미적용]** `Promise.all` 병렬화 제안 → 두 쿼리는 의도적 순차: 시리즈 미존재 시 `return null`로 episodes 쿼리 skip(notFound 경로 최적화). 병렬화 시 항상 둘 다 실행.
- **[Gemini #2 — 미적용]** select narrowing → 공유 상수 `SERMON_WITH_RELATIONS_SELECT` 좁히기는 PR #91 #6과 동일 회귀 리스크. tech-debt 유지(별건 전용 쿼리 필요).

> **Phase 4 파급**: `allSeriesIncludingInactive`(미PR `feat/sermons-all-series`)도 동일 전제(완료=is_active 착각) 오류. 완료는 ended_at 축이라 `allSeries`(is_active=true)가 이미 완료 포함 → Phase 4 PR 시 함수 존치 여부 재검토. 본 PR 범위 외.

**ADR 판단(보강)**: 불필요 — `is_active` 필터 복원은 기존 공개 게이트 컨벤션 준수(신규 정책 아님), 일회성 버그 정정. `start-adr` 미실행.

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
