# sermons-all-series

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — 신규 라우트 페이지 + UI 컴포넌트 + URL 헬퍼. services/sermon는 기존 `getAllSeries` 재사용(신규 쿼리·캐시·레이어 변경 없음). 신규 util은 app 레이어 보조.

## 목표

`/sermons/series`(현재 스켈레톤)를 mockup `AllSeriesPCPage`/`AllSeriesMPage` 패턴의 모든 시리즈 목록 페이지로 구현 — **상태(전체/진행중/완료)·연도·검색** 필터 + 3열 그리드(PC)/세로 리스트+BottomSheet(모바일). 설교자 축은 데이터 모델 미지원으로 제외(Non-goals). Phase 3 `/sermons/all` 구조를 시리즈 축으로 복제.

> **개정 이력**: Option C(하이브리드) 채택 — Codex 계획 검증 CHANGE_REQUEST(CR-1·2·3) 반영. 설교자 필터 제외, 전체 시리즈 조회용 신규 서비스 함수 추가(getAllSeries 불변), year는 컬럼 직접, SeriesCard 완료 상태 분기.

## 검증된 Assumptions

- `src/app/(content)/sermons/series/page.tsx` 스켈레톤(제목+LayoutContainer만) — Explore Read 확인
- `allSeries()`(=`getAllSeries`)는 `.eq('is_active', true)` 적용 — **활성 시리즈만 반환, 완료 시리즈 제외** — `sermon-service.ts:125` 확인 (CR-1)
- `sermon_series` Row에 preacher 컬럼·relationship 0개 (`Relationships: []`) — **시리즈→설교자 직접 불가** — `database.types.ts` 확인 (CR-2)
- `sermon_series.year`(number|null) 컬럼 존재 — 연도 필터는 overlap 계산 불요, 컬럼 직접 사용 — `database.types.ts` 확인
- `SeriesCard`(`SermonSeriesCarousel/SeriesCard.tsx`)는 "ON-GOING"/"진행 중" 하드코딩(`:27,:35`) — 완료 표시 분기 필요 (CR-3). 캐러셀은 진행중만 전달하므로 분기 추가는 후방호환
- `buildFilterHref`(`utils/search-params.ts:26`)는 basePath·keys 범용 — 재사용 가능
- `buildSermonHref`/`SERMON_FILTER_KEYS`는 `/sermons/all` 고정 — 시리즈 재사용 불가

## Non-goals

- **설교자 필터·검색** — `sermon_series`에 preacher 없음. 시리즈→설교자는 sermons join 데이터모델 작업 필요 → **후속 task 분리** (tech-debt-tracker 등록)
- 시리즈 상세 `/sermons/series/[id]` — **Phase 5**
- 데이터 페칭 캐시·로딩/에러 UI — Phase 6 / 검색 디바운스·URL 정교화 — Phase 7
- 정렬 드롭다운 — `is_active desc → started_at desc` 고정, sort param 없음
- `getAllSeries` 동작·select 변경 — 공유 함수(캐러셀·admin·`/sermons/all`) 회귀 방지, 신규 함수로 분리

## 의사결정 로그

- **D1 — 시리즈 전용 URL 헬퍼 신설**: `utils/sermon.ts`에 `SERIES_FILTER_KEYS`(`status`/`year`/`q`) + `buildSeriesHref`/`parseSeriesParams` 추가, 범용 `buildFilterHref('/sermons/series', …)` 위임. 기존 `SERMON_*`와 별도 네이밍.
- **D2(개정) — 전체 시리즈 조회 신규 함수 추가, getAllSeries 불변**: `allSeries()`는 `is_active=true` 고정이라 완료 미반환(CR-1). 공유 함수 변경은 캐러셀·admin 회귀(#6 교훈) → `getAllSeriesIncludingInactive()`(가칭) 신규: `.eq('is_active')` 제거 + sermon_count, `createStaticClient` 캐시 동일 패턴. `/sermons/series` 전용. status/year/q 필터·카운트는 결과셋에서 JS 계산.
- **D3(개정) — SeriesCard 완료 상태 분기**: "ON-GOING"/"진행 중" 하드코딩을 `is_active` 분기로("진행 중"/"종료", 배지 동일). 캐러셀(진행중만 전달)에 후방호환. 신규 카드 안 만듦.
- **D4 — 사이드바/시트 신규(패턴만 복제)**: 필터축(status/year)이 달라 `SermonSidebar`/`AdvancedFilterSheet` prop 재사용 불가 → `SeriesFilterSidebar`/`SeriesFilterBottomSheet` 신규. SCSS는 `SermonListPage.module.scss` `.radio`/`.option`/`.body` 패턴 복제한 `SeriesListPage.module.scss` 1개 통합.
- **D5 — 연도 필터는 `sermon_series.year` 컬럼 직접**: mockup의 started~ended overlap 계산 불요(실 DB에 `year` 컬럼 존재). year 옵션·카운트는 결과셋 distinct year로 생성.
- **DL-1(정합)**: status/year/q 필터 로직 위치는 `utils/sermon.ts`의 `filterSeries()` (page.tsx에서 호출). "page.tsx JS 계산" 표현을 util 함수 호출로 통일.
- **DL-2 — 신규 캐시 tag 분리 명시** (Codex 재검증 decision-log): `getAllSeriesIncludingInactive()`는 `sermonCache.seriesListIncludingInactive()`(가칭) 신규 helper로 별도 tag `sermon-series-list-all` 사용 — 기존 `seriesList()` tag `[ROOT,'sermon-series-list']`와 분리해 캐시 혼선 차단.
- **DL-3 — `sermon_series.year` 실 DB 검증**: dev(`mficogrxekuahjqborxw`) `execute_sql` 결과 시리즈 2건 모두 `year` non-null, `year == extract(year from started_at)` 100% 일치 → year 컬럼 직접 사용 확정. 단 **연도 필터 의미 = 시리즈당 단일 연도**(mockup started~ended overlap과 의도적 분기 — 실 DB는 단일 `year` 모델).
- **DL-4 — dev 완료 시리즈 0건**: dev에 `is_active=false` 시리즈 0건. "완료" 필터 로직(`getAllSeriesIncludingInactive` 활성+완료 반환 + status 분기)은 정상이나 dev 데이터로는 빈 결과 — 검증은 로직·타입 기준, 완료 시드 시 표시 별도 확인.

## Success Criteria

- `/sermons/series` PC: 좌 사이드바(상태/연도 라디오 + 검색) + 우 3열 SeriesCard 그리드 + 결과 헤더("총 N개 시리즈")
- 모바일: 검색 + 필터 아이콘(활성 카운트 배지) + BottomSheet(상태/연도, staged 적용) + 1열 리스트
- 상태=진행중 → `is_active` 시리즈만, 완료 → `!is_active`만 (신규 함수가 활성+완료 모두 반환)
- 연도=Y → `sermon_series.year === Y`, 검색어 → title·description 매칭
- 미존재 필터값 URL 안전(throw 없음), 초기화 링크 동작
- SeriesCard가 완료 시리즈를 "종료"로 정확 표시 / 캐러셀(진행중) 회귀 없음
- `node scripts/verify-task.mjs sermons-all-series` PASS

## 영향받는 파일

- `src/app/(content)/sermons/series/page.tsx` — 스켈레톤 → 구현
- `src/app/(content)/sermons/_component/SeriesListPage/` — SeriesFilterSidebar·SeriesFilterBottomSheet·SeriesResultHeader·SeriesGrid + `SeriesListPage.module.scss` (신규, 통합 1 scss)
- `src/utils/sermon.ts` — `SERIES_FILTER_KEYS`·`buildSeriesHref`·`parseSeriesParams`·`filterSeries`(status/year/q) 추가
- `src/services/sermon/sermon-service.ts` + `index.ts` — `getAllSeriesIncludingInactive()` 신규(읽기 전용, `getAllSeries` 불변)
- `src/app/(content)/sermons/_component/SermonSeriesCarousel/SeriesCard.tsx` — `is_active` 완료 분기 (CR-3)
- 재사용(무변경): `getAllPreachers` 미사용, `buildFilterHref`

## 단계별 체크리스트

- [ ] 1. `sermon-service.ts`+`index.ts` `getAllSeriesIncludingInactive()` (active+완료, sermon_count)
- [ ] 2. `utils/sermon.ts` 시리즈 헬퍼(`SERIES_FILTER_KEYS`/`buildSeriesHref`/`parseSeriesParams`/`filterSeries`)
- [ ] 3. `SeriesCard.tsx` `is_active` 완료 분기 (CR-3)
- [ ] 4. `SeriesListPage.module.scss` (전체설교 패턴 복제 + 3열 그리드)
- [ ] 5. SeriesFilterSidebar (PC, 상태/연도 라디오 + 검색)
- [ ] 6. SeriesFilterBottomSheet (모바일 staged)
- [ ] 7. SeriesResultHeader + SeriesGrid(SeriesCard 재사용)
- [ ] 8. `series/page.tsx` 조립 (신규 함수 → filterSeries → 렌더, 미존재값 가드)
- [ ] 9. verify-task

## Verification

- `node scripts/verify-task.mjs sermons-all-series`
- `/sermons/series` PC: 상태(진행중/완료)/연도 필터 토글 → 그리드·카운트 갱신, 초기화 동작
- `/sermons/series?status=ended&year=2025&q=...` 직접 진입 일관, 미존재값 throw 없음
- 모바일: 필터 아이콘 배지·BottomSheet staged 적용 → 리스트 갱신
- `/sermons`(진행중 시리즈 캐러셀) SeriesCard 표기 회귀 없음

## ADR 판단

- **불필요** — `getAllSeriesIncludingInactive()`는 기존 `allSeries` 패턴(읽기 전용 select + `createStaticClient` 캐시)을 따르는 신규 함수일 뿐, 캐시·라이브러리·레이어 경계·인증 정책 변경 없음. `getAllSeries` 불변. ADR_TRIGGER_PARTS(`src/services/`) 포함하나 영구 결정 아님. `start-adr` 미실행.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (재검증 confidence high — 1차 CHANGE_REQUEST 3건 반영 후)

### 재검증 (Option C 개정 후)

> CR-1 해소 — `getAllSeriesIncludingInactive()` 신규 함수가 완료 포함 반환, `getAllSeries`(carousel·admin 5곳) 불변. MATERIAL resolved.
> CR-2 해소 — 설교자 Non-goal 분리가 데이터 계약과 일치(`sermon_series` preacher 0개, `sermons`만 `sermons_preacher_id_fkey`). Success Criteria preacher 미참조.
> CR-3 해소 — `SeriesCard` `is_active` 분기 필요·후방안전(`/sermons/page.tsx:45` `ended_at===null`로 carousel엔 진행중만 전달).
> 잔여 decision-log 2건(material 아님): 신규 cache tag 명시(→DL-2), `year` 채움 파일검증 불가(→DL-3 실 DB 검증 완료).

**풀이**: 3개 material CR 모두 닫힘. 신규 회귀 없음. cache tag·year 채움은 의사결정 로그 DL-2/3/4로 고정. WORK 진입 가능(3차 재검증 안 함).

### 1차 (초안) — CHANGE_REQUEST

material CR 3건 (Claude 교차검증 확정):

> CR-1: `완료` 상태 필터가 `getAllSeries()` 재사용 계획으로 불가 — `sermon-service.ts:125` `.eq('is_active', true)`가 완료 시리즈를 제거. `/sermons/series?status=ended`는 항상 0개.
> CR-2: 설교자 필터·검색이 데이터 계약에 없음 — `database.types.ts` `sermon_series` Row에 preacher 컬럼 0개, `Relationships: []`. 시리즈→설교자는 sermons join 필요.
> CR-3: `SeriesCard` 무변경 재사용이 완료 시리즈 오표시 — `SeriesCard.tsx:27/35` "ON-GOING"/"진행 중" 하드코딩.
> DL-1(expression): D2 "page.tsx JS 계산" vs 영향파일 `utils/sermon.ts filterSeries` 위치 불일치 — 한 줄 정합.

**풀이**: Phase 4 mockup은 시리즈가 status·preacher·year를 가진 SERIES_DATA를 가정했으나, 실제 DB는 (a) getAllSeries가 활성만 반환, (b) sermon_series에 preacher 없음. 무서비스변경(D2)·SeriesCard무변경(D3) 전제가 깨짐. `sermon_series.year` 컬럼은 존재 → year 필터는 overlap 불요. 스코프 재결정 필요(서비스 확장 vs 필터 축소).

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (Phase 4 코드는 전 항목 OK — 유일 지적은 무관 아티팩트)

> A 타입/버그 OK · B 레이어 OK(page→service, apis 우회 없음) · C **CR**: `pr90_diff.txt`(루트 untracked, PR #90 아티팩트, Phase 4 무관) 커밋 전 정리 필요 · D SCSS OK(semantic token만, 믹스인 존재, sheet_*/sidebar .option 분리) · E 캐시 OK(별도 tag, createStaticClient) · F 필터정확성 OK(status/year/q + facet count) · G unused: yarn lint sandbox 차단 → Claude verify-task로 확인

**풀이**: Phase 4 신규/변경 코드는 타입·레이어·SCSS·캐시·필터 전부 통과. CR은 코드 결함이 아니라 세션 시작부터 있던 무관 untracked 파일 `pr90_diff.txt` 위생 지적 — 명시적 파일 스테이징으로 커밋 미포함, 사용자 파일이라 임의 삭제 안 함.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex CR(`pr90_diff.txt`)은 Phase 4 산출물 아님 — 세션 시작 git status부터 존재한 PR #90 아티팩트. 커밋은 신규/변경 파일만 명시 스테이징하므로 미포함. 파괴적 액션(임의 삭제) 회피 — 사용자에 gitignore/삭제 위임.
- `node scripts/verify-task.mjs sermons-all-series` PASS — ESLint(G 항목 커버)·build·type·stylelint 통과. Knip 경고는 기존 barrel false-positive.
- Codex 직접수정 0건 — diff 변경 없음. 외과적: 변경 라인 전부 Phase 4 추적(SeriesCard 분기는 D3, 캐러셀 후방안전).
- DB 검증(DL-3) 반영 확인: year 컬럼 직접 사용, dev 완료 0건(DL-4) — "완료" 필터 로직 정상이나 dev 데이터 빈 결과(시드 시 표시 별도 확인).

## 전제 오류 정정 (PR #92 #4 동형 결함)

D2(개정)/DL-2의 `getAllSeriesIncludingInactive` 신설 결정이 **전제 오류**였음. CR-1("`allSeries`가 완료 제외")이 dev 완료 0건(DL-4)으로 미검증 채택된 게 근인.

- **근거**: `is_active`는 전역 공개 노출 게이트(worship/staff/allSeries/bySeriesSlug/allPreachers 일관), 생애주기는 별축 `ended_at`(page.tsx:45·SermonSeriesBanner:23·SermonSeriesSidebar:17). 완료 시리즈 = `is_active=true`+`ended_at!=null` → `allSeries`가 이미 완료 포함. `is_active` 필터 제거는 숨김 시리즈까지 공개 노출(PR #92 #4와 동형).
- **수정 7건**: `allSeriesIncludingInactive` 메서드·`getAllSeriesIncludingInactive` wrapper·`seriesListAll` 태그 삭제 / `series/page.tsx` `getAllSeries()` 재사용 / `filterSeries` status 술어 `is_active`→`ended_at`(active=ended_at===null, ended=ended_at!==null) / `SeriesCard` 뱃지·메타 `ended_at` 축(Phase 5 SeriesDetailHero와 동일 패턴, `~` dot 통합).
- **트레이드오프**: 삭제 함수의 `.order('is_active',desc)` "진행 중 우선" 정렬 소실 — 모든 공개 행이 is_active=true라 무의미했고 status 필터로 대체. 별도 정렬 요구 시 ended_at 기준 후속.
- **검증**: verify-task `20260516-135216` PASS(tsc/lint/lint:styles 0). Codex 1차 **PASS**(의미구조 SOUND·수정 완전·캐시 정합·정렬 수용). Claude 2차 교차: 소스 dangling 0(`grep src`), `sermon-series-list-all` revalidate 참조 0(actions/services), `ended_at: string | null`(undefined 없음 → badge `===null`/meta `?` 타입 정합).
- **ADR 판단(보강)**: 불필요 — 잉여 함수 삭제·기존 `allSeries` 재사용·기존 `ended_at` 컨벤션 준수. 신규 정책 아님, `start-adr` 미실행. tech-debt-tracker 해당 항목 해소 처리 예정.

## 회고

**잘된 것**
- Phase 5 PR #92 #4 진단에서 얻은 `is_active`(발행/공개)↔`ended_at`(완료) 의미축을 Phase 4 전체(service·filterSeries·SeriesCard)에 선제 적용 — 동형 결함을 PR 전에 일괄 정정. 사용자 의미축 확인(2026-05-16)으로 방향 확정 후 메모리화.
- 미머지 단계 이점을 살려 전제 오류를 본체 3커밋에 흡수(reset --soft → 재구성, `-i` 미사용) — 잉여 함수 add+delete가 net-zero로 상쇄돼 service/index/cache가 이력에서 자연 소거, PR이 "처음부터 올바른 Phase 4"로 보임.
- Codex 1차 PASS + Claude 2차 교차(dangling/revalidate/타입)로 삭제형 변경의 잔존 참조 리스크 차단.

**다음에 할 것**
- Phase 4 계획 단계에서 Codex CR-1("getAllSeries가 완료 제외")을 dev 완료 0건(DL-4) 상태로 검증 없이 채택한 게 근인. 데이터 의미축 가정은 실제 호출처 + 사용자 확인으로 교차검증 후 Assumption 등재해야 함.

**부채**
- dev DB 완료/숨김 시리즈 0건 → "완료" 필터·숨김 비노출·COMPLETED 뱃지·종료일 표시는 화면 미검증. 시드(완료 1·숨김 1) 후 표시 확인 필요(코드·타입은 검증됨).
- `getAllSeries`/`getAllPreachers` select 최적화는 기존 tech-debt 유지(별건).

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
