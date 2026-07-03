# notices-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-03
- **브랜치**: feat/notices-redesign
- **Open questions**: none
- **ADR needed**: yes — 2차 요청으로 공유 레이아웃에서 `<Hero/>`를 제거(모든 콘텐츠 페이지 영향). 구조 변경이라 ADR 판단 필요 → `## ADR 판단` 참조

## 목표

`/news/notices` 목록 페이지를 목업(`docs/references/한빛교회 공지사항.html`, warm 시안) 기준으로 리디자인한다.
검색창 → 카테고리 칩 → 건수+정렬(최신순·조회순) 헤더 → 리스트 행(핀·분류 라벨·제목·본문 미리보기 1줄·날짜·조회수) 구조로 바꾸고, 서비스가 이미 지원하는 `sort`를 UI에 연결한다.

## 2차 요청 (확장 범위)

1차 리디자인 검증 후, 커밋 전에 사용자가 5건을 추가 요청했다.

- **B1. NoticeList 텍스트 색상** — 미리보기·메타가 옅어 안 보인다 → 진한 텍스트(near-black `$home-text` 계열)로.
- **B2. 검색 키워드 label** — 검색했을 때 어떤 키워드로 걸렀는지 제거 가능한 label로 표시(카테고리 active_tag와 같은 패턴).
- **B3. 상세를 Modal→페이지로** — 기존 `NoticeDrawer`(portal modal)를 없애고 `/news/notices/[id]` 라우트로 상세를 구현. 행은 `<Link>`로.
- **B4. 상세 페이지 목업 일치** — 목업 상세 화면: `‹ 공지사항` 헤더 → 분류 칩 + 큰 제목(23px) → 작성자·날짜·조회수 → 본문 → 첨부 카드(파일 아이콘+파일명+"첨부파일 · 탭하여 저장"+다운로드) → 이전 글/다음 글 아코디언.
- **B5. Header 목업 일치 + Hero 제거** — 사용자 선택(AskUserQuestion): **모든 콘텐츠 페이지에서 Hero 제거**. 목업 헤더는 `‹ 제목`(뒤로가기+가운데 제목)인데, 이는 사이트에 이미 있는 `MobileHeader` 패턴(sermons·about에서 사용 중)과 같다.

### B5 발견 — 공유 Hero의 실제 영향 범위

- 공유 `<Hero/>`는 `(content)/layout.tsx`에서 렌더되지만, `SELF_HERO_PATHS`(`src/components/layout/Hero/hero.config.ts:26`)로 about·sermons 계열은 **이미** 꺼져 있고 각자 자체 헤더를 가진다.
- 그래서 지금 공유 Hero를 실제로 쓰는 페이지는 news 계열(`/news`·`/news/notices`·`/news/bulletins`·`/news/gallery`)·`/next-gen`·`/community`뿐이다 — `rg` 확인.
- 확립된 "Hero 제거" 패턴(sermon-views-redesign)은 별도 헤더 컴포넌트를 두지 않고 다음 두 가지다. 근거는 `sermons/all/page.tsx:96`의 `<h1 className={styles.blind_title}>전체 설교</h1>`.
  - 데스크톱: GNB만 두고 sr-only h1(`blind_title`) + 콘텐츠
  - 모바일: `MobileHeader`(뒤로가기·가운데 제목)
- **주의**: `<Hero/>`를 걷어내면 자체 h1이 없는 news·next-gen·community가 데스크톱에서 제목(h1)을 잃는다. 이 페이지들은 목업이 다루지 않으므로, 각 페이지에 최소 `blind_title` h1을 넣어 접근성·제목을 보존한다(시각 배너는 요청대로 제거).

## 검증된 Assumptions

- `noticeService.list()`가 `sort: 'latest'|'oldest'|'views'`를 이미 지원하나 `page.tsx`가 안 넘김 — `src/services/notice/notice-service.ts:27-38` Read.
- `notices.content`는 plain string (TipTap JSON 아님) — `src/types/database.types.ts:132` `content: string`, `NoticeDrawer.tsx:82`가 `<p>{notice.content}</p>`로 그대로 렌더.
- 작성자 이름 데이터 없음 — `notices` Row에 `author_id: string | null`(uuid)만 있고 목록 쿼리에 profiles join 없음. 목업의 "사무간사" 자리는 조회수로 대체.
- 카테고리는 enum 9종(예배·행사·교육·모집·교인소식·선교·행정·긴급·기타) — `src/constants/notice.ts` `NOTICE_CATEGORIES`.
- 목업 active 칩 배경 `rgb(147,112,46)` = `#93702e` = 전역 `$accent`(`$gold-600`)와 동일 — 브라우저 getComputedStyle 실측.
- warm 톤 토큰 `$home-*`(card/border/text/tint 등)이 `src/styles/tokens/_home.scss`에 존재 — 설교 리디자인에서 사용 중.
- 검색은 현재 title만 ilike — `notice-service.ts:22`. 목업 placeholder는 "공지 제목·내용 검색".

## Success Criteria

- [x] `/news/notices`가 목업 구조(검색창 → 칩 → 건수+정렬 → 리스트)로 렌더된다 — 브라우저 실측 (모바일 390px·PC ~1456px 스크린샷 확인).
- [x] 칩 클릭 시 `?category=`로 필터되고 active 칩이 `$accent` 배경으로 표시된다 — 예배 클릭 → "예배 공지 4개", sort 유지, active 칩 gold 확인.
- [x] 정렬 세그먼트(최신순·조회순)가 `?sort=views` 전환 시 조회수 내림차순으로 재조회한다 — 핀 그룹·비핀 그룹 각각 조회수 내림차순 확인(1240/862/541 then 674/521/430).
- [x] 검색이 제목+내용 모두 매칭한다 (`or(title.ilike, content.ilike)`, OR 토큰 특수문자 `(),`는 sermon-service `escapeOrToken()`과 동일한 로컬 함수로 공백 치환) — `성전,냉난방`(쉼표) 검색이 에러 없이 1건 반환.
- [x] `?sort=oldest` 같은 UI 밖 값은 404 (숨은 필터 금지 — PR #136 year 사례 재발 방지) — not-found UI("공지사항을 찾을 수 없습니다") 렌더 확인. `NOTICE_SORT_OPTIONS`를 `latest·views` 2종으로 축소.
- [x] 핀 고정 행이 리스트 최상단 + 핀 아이콘 표시, 첨부 있는 행에 클립 아이콘 표시 — 핀 3행 cream 배경·★, 클립 아이콘 확인.
- [x] 행 클릭 시 기존 NoticeDrawer가 그대로 열린다 — 행 클릭 → 같은 제목 dialog 렌더 확인.
- [x] PC(~1456px)에서도 동일 리스트 레이아웃이 깨지지 않는다 — 테이블 제거 후 실측, 겹침 없음. (창 최소폭 제약으로 정확히 1280px는 아니나 그보다 넓은 폭에서 검증 — 단일 컬럼 유동 레이아웃이라 좁은 폭은 더 낮은 위험.)
- [x] `node scripts/verify-task.mjs notices-redesign` 통과 (run 20260703-132518: ESLint·stylelint·build ✓, Knip 경고는 전부 기존 부채, 신규 0).

## 영향받는 파일

- `src/app/(content)/news/notices/page.tsx` — sort 파싱·전달, 새 컴포넌트 조립
- `src/app/(content)/news/notices/page.module.scss`
- `src/app/(content)/news/notices/_component/NoticeControlBar.tsx` + `.module.scss` — 검색창+칩+정렬 헤더로 재작성
- `src/app/(content)/news/notices/_component/NoticeTable.tsx` + `.module.scss` → `NoticeList.tsx`로 교체 (PC 테이블 제거, 단일 리스트)
- `src/app/(content)/news/notices/_component/NoticeRowTrigger.tsx` — 테이블용 trigger 정리
- `src/app/(content)/news/notices/_component/CategoryBottomSheet.tsx` + 관련 스타일 — 삭제 (칩으로 대체)
- `src/app/(content)/news/notices/_component/table/PinIcon.tsx` — 사용처 확인 후 정리
- `src/services/notice/notice-service.ts` — search를 title+content or-ilike로 확장(escapeOrToken 동일 로컬 함수), sort switch에서 `oldest` case 제거
- `src/constants/notice.ts` — `NOTICE_SORT_OPTIONS`를 `latest·views` 2종으로 축소

## 단계별 체크리스트

- [x] 1. Feat — `NOTICE_SORT_OPTIONS` 2종 축소, 서비스 search 확장(title+content, escapeOrToken)·`oldest` case 제거, page.tsx sort 파싱(`validate.within(NOTICE_SORT_OPTIONS)`)·전달
- [x] 2. Style — NoticeList 신규(목업 행 구조: 핀/분류 라벨/제목/클립 + 미리보기 1줄 + 날짜·조회수 + chevron), PC 테이블 삭제
- [x] 3. Style — NoticeControlBar 재작성: SearchField + 카테고리 칩 가로 스크롤 + "전체 공지 N개"·정렬 세그먼트
- [x] 4. CategoryBottomSheet·NoticeTable 삭제, NoticeRowTrigger 단일 버튼으로 정리, drawer 연결 유지 확인
- [x] 5. 브라우저 실측(모바일 390px + PC) 완료 → verify-task 진행 중

## Non-goals

- NoticeDrawer(상세) 리디자인 — 목업에 상세 화면 없음, 기존 유지
- admin 공지 관리 화면 — 미변경
- 작성자 이름 표시 — 데이터 없음 (profiles join 추가 안 함)
- `oldest` 정렬 UI 노출 — 목업에 없음. ⚠️ 정정(Codex CR): 상수 축소로 서비스 `oldest` case도 함께 제거 → 의사결정 로그 D1 참조
- Pagination 제거 — 목업엔 없지만 데이터량 대비 유지

## 2차 요청 체크리스트 (B1~B5)

- [x] B1 — NoticeList 미리보기를 near-black(`$home-text`)으로, 메타는 `$home-text-sub`. 브라우저 실측: 미리보기 가독성 개선 확인.
- [x] B2 — 검색 활성 시 `'키워드' 검색` 제거 가능한 label을 건수 옆에 표시(`$primary-subtle` 칩 + X 버튼).
- [x] B3 — `NoticeDrawer`(portal modal) 4파일 삭제, 행을 `<Link href=/news/notices/${id}>`로. 실측: 행 클릭 → `/news/notices/1` 페이지 이동(모달 아님).
- [x] B4 — `NoticeDetail` + `[id]/page.tsx`. 실측: 분류 라벨·제목·날짜·조회수·본문·첨부 카드(`공사안내문.pdf` · 다운로드)·이전 글(인접 공지 제목)·다음 글(없음) 목업 일치. 이전 글 클릭 → `/news/notices/2` 이동.
- [x] B5 — 공유 `<Hero/>` 제거 + `Hero`·`Breadcrumb`·`hero.config` 삭제, `resolveBreadcrumbSegments` 제거. `resolveMobileHeader`/`resolveSiblingTabs`에 notices 분기, MobileHeader 가운데 정렬. 실측: 목록·상세가 `‹ 공지사항`(뒤로가기+가운데) 헤더, Hero·형제탭 없음. bulletins·next-gen·community·gallery는 200 + sr-only h1 보존, Hero 없음.
- [x] B6 — Hero 제거 후 상하 패딩 불일치 정정(사용자 지적). `MainContainer`가 `$spacing-64` 고정이라 헤더 아래 공백이 설교 페이지보다 컸다. 사용자 요청대로 **전체 설교(`/sermons/all`) `.body`와 동일한 값**으로 맞춤 — 모바일 `padding: $spacing-20 … $section-gap-80`(top 20·bottom 80), 데스크톱(pc-sm+) top·bottom `$section-gap-40`. 좌우는 기존 `$spacing-20` 유지. 공유 사용처 공지·주보·섬기는이 함께 적용. (초기엔 LayoutContainer.body 28/64로 맞췄으나, 설교와 정확히 동일 요청으로 위 값으로 정정.)
- [x] B7 — Skeleton UI 제거(사용자 지적). `src/app/(content)/news/loading.tsx`(+ scss)가 `/news` 세그먼트 로딩 스켈레톤이라 공지·주보·갤러리에 공통 적용됐다 — 파일 삭제(설교 스켈레톤 제거와 같은 방식). 공용 `Skeleton` 컴포넌트는 admin `loading.tsx`가 계속 써서 유지. **스코프: 공지 외 주보·갤러리도 스켈레톤이 함께 사라짐.**
- [x] B8 — 첨부 클립 위치 정정(사용자 지적). `.title`이 `flex:1`이라 클립이 행 오른쪽으로 밀렸다 → 제목+클립을 `.title_wrap`(flex:0 1 auto)으로 묶어 클립이 제목 텍스트 바로 뒤(간격 `$spacing-2`)에 붙게 함. 실측: 제목 우측 271px·클립 273px(간격 2px), 행 우측 끝(313px) 아님.

## 접근법

- 디자인 값은 목업 실측치를 `$home-*`·전역 semantic 토큰으로 매핑한다 (하드코딩 금지). 페이지 배경은 목업의 `#f4f0e6` 대신 사이트 공통 배경 유지 — 한 페이지만 배경을 바꾸지 않는다.
- NEW 라벨·긴급 강조는 목업에 없지만 기존 기능이라 유지하고 warm 톤으로 다시 입힌다.
- B5 상세 Hero·Breadcrumb 제거 결정은 [ADR 0021](../../decisions/0021-hero-breadcrumb-removal.md).

## Verification

- `node scripts/verify-task.mjs notices-redesign`
- 브라우저 실측 — dev 서버에서 모바일 뷰포트(390px)와 PC 1280px 각각 `/news/notices`를 열어 Success Criteria의 렌더 항목(칩 필터·정렬 전환·핀·클립·drawer 열림·레이아웃 겹침 없음)을 스크린샷으로 확인

## ADR 판단

- **1차(서비스·상수)**: 불필요 — `notice-service.ts`·`constants/notice.ts`가 ADR_TRIGGER_PARTS에 들지만, 변경은 `list()` 검색을 title→title+content로 넓히고 안 쓰는 `oldest` 정렬을 뺀 일회성 구현이다. 레이어·클라이언트·캐시 정책은 그대로다.
- **2차(B5 Hero 제거)**: 필요 → [ADR 0021](../../decisions/0021-hero-breadcrumb-removal.md) 작성(Accepted). 공유 `<Hero/>`·`Breadcrumb` 삭제로 콘텐츠 페이지 헤더 전략이 바뀌므로 결정을 남긴다. Codex 확인: `resolveHeroMeta`·`resolveBreadcrumbSegments`·`<Hero/>` 각각 단일 사용처, BreadcrumbList JSON-LD 없음(SEO 손실 없음).

## Codex 계획 검증 (B5 확장 범위)

- **결론**: CHANGE_REQUEST → material 3건 반영 후 구현 (confidence: high). resolveHeroMeta·resolveBreadcrumbSegments·`<Hero/>` 단일 사용처 확인, BreadcrumbList JSON-LD 없음(SEO 손실 없음).
- **현재 판단**: material 3건.
  - ① `detailById`·`allIds`에 `deleted_at is null` 필터 부재 → 공개 상세 라우트가 삭제된 공지를 직접 URL로 노출 → D4(필터 추가)
  - ② MobileHeader 가운데 정렬 조건이 `교회 소개 || /sermons`뿐 + resolver가 `/news/notices`를 부모 라벨 "교회 소식"·showBack:false로 반환 → 목업 "공지사항 가운데+뒤로가기" 미완성 → D5(분기 추가)
  - ③ `/news/notices` 목록 페이지에 h1 없음(`MainContainer title` 미렌더) → Hero 제거 시 접근성 회귀 → D6(sr-only h1). 상세는 공지 제목을 h1로 두면 별도 불필요.
- **다음 행동**: 3건 반영해 구현. ADR 0021 작성(Hero·Breadcrumb 제거).

Codex 계획 검증 결과 (verbatim, 핵심 지적):

> - MATERIAL: `/news/notices/[id]`를 공개 라우트로 만들 때 `getNoticeById()`를 그대로 쓰면 soft-delete 공지가 직접 URL로 노출될 수 있습니다. `detailById`는 `eq('id', …).single()`만 하며 `deleted_at is null` 필터가 없습니다. `allIds()`도 마찬가지입니다.
> - MATERIAL: B5의 "공지사항 centered + showBack"은 `resolveMobileHeader`만 바꿔서는 완성되지 않습니다. `MobileHeader.tsx`의 중앙 정렬 조건은 `title === '교회 소개' || pathname.startsWith('/sermons')`라 `/news/notices` 계열을 추가해야 합니다.
> - MATERIAL: `/news/notices/page.tsx`도 현재 `h1`이 없습니다. 새 detail route는 공지 제목을 실제 `h1`로 두면 별도 blind h1은 필요 없습니다.
>
> CHANGE_REQUEST / Confidence: high

풀이: 세 지적(삭제된 공지 노출·MobileHeader 가운데 정렬 조건·목록 h1 부재)은 모두 계획 문구가 아니라 Hero를 걷어낸 뒤 실제로 깨지는 지점이라 CHANGE_REQUEST다.

## 의사결정 로그

- **D1 — sort 허용 목록을 상수 축소로 강제한다**
  - 문제: plan은 `latest·views` 2종만 허용한다고 했지만 `NOTICE_SORT_OPTIONS`에 `oldest`가 남아 있어, `validate.within(NOTICE_SORT_OPTIONS)`을 그대로 쓰면 `?sort=oldest`가 통과한다 (Codex가 material(구현이 실제로 깨지는 심각도 큰 지적)로 분류).
  - 해결: 별도 허용 상수를 만드는 대신 `NOTICE_SORT_OPTIONS` 자체를 2종으로 줄인다. 소비처가 없는 상수라(정의 외 사용처 0건, rg 확인) 축소가 안전하고, `NoticeSortOption` 타입이 좁아지면서 서비스 switch의 `oldest` case가 타입 오류로 드러나 함께 제거된다 — 검증 로직과 상수가 어긋날 여지가 없다.
  - 결과: UI·검증·서비스가 같은 2종 목록을 함께 쓴다. Non-goals의 "서비스 코드는 유지" 항목은 폐기했다.
- **D2 — 검색 OR 토큰은 sermon과 동일한 이스케이프를 쓴다**
  - 문제: `or(title.ilike, content.ilike)`에 검색어를 그대로 보간하면 `(),` 문자가 PostgREST 구분자로 해석돼 검색이 깨진다 (Codex material 지적, 예: `창립,예배`).
  - 해결: sermon-service의 `escapeOrToken()`(`[(),]` → 공백)과 동일한 2줄 로컬 함수를 notice-service에 둔다. export 공유는 서비스 간 결합을 만들어 2줄 중복이 더 싸다.
  - 결과: 특수문자 검색어도 OR 검색이 깨지지 않는다.
- **D3 — 시각 검증을 Verification에 명시한다**
  - 문제: Success Criteria는 1280px 실측을 요구하는데 Verification에 verify-task만 있어 검증 수단이 빠졌다 (Codex material 지적).
  - 해결: 브라우저 실측(390px·1280px) 단계를 Verification에 추가.
  - 결과: 렌더 항목 판정 경로가 명령으로 고정됐다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 3건 모두 plan 반영 완료 (confidence: high)
- **현재 판단**: material 3건, expression-only 0건.
  - ① sort 허용 목록과 `NOTICE_SORT_OPTIONS`(3종)가 어긋나 `validate.within()`이 `oldest`를 통과시킨다 → D1(상수 2종 축소)
  - ② Success Criteria의 1280px 실측에 대응하는 검증 수단이 Verification에 없다 → D3(브라우저 실측 추가)
  - ③ `.or()` 보간 시 `(),` 특수문자 이스케이프가 없다(예: `창립,예배`가 PostgREST 구분자로 해석) → D2(escapeOrToken 동일 함수)
- **다음 행동**: WORK 진입 (CR 3건 반영됨, 재검증은 사용자 요청 시)

Codex 계획 검증 결과 (핵심 지적 verbatim):

> - [material — Sort 범위 불일치] `validate.within(NOTICE_SORT_OPTIONS)`를 그대로 쓰면 `oldest`가 통과해 Non-goal과 404 기준을 동시에 깨뜨린다. → 허용 목록을 plan과 일치하는 2개 상수로 줄이는 방법을 plan에 명시해야 한다.
> - [material — Success Criteria 검증 수단 누락] verify-task는 lint/styles/build/knip 체크용이라 1280px에서 행 제목·날짜·조회수가 겹쳐 렌더링돼도 잡지 못한다. → 브라우저 1280px 직접 확인 단계를 Verification에 추가해야 한다.
> - [material — OR 검색 시 특수문자 이스케이프 미정의] 검색어 `창립,예배`를 그대로 OR 문자열에 보간하면 쉼표가 PostgREST 조건 구분자로 작동해 검색이 깨진다. → `escapeOrToken()` 사용 또는 동등한 이스케이프 처리를 명시해야 한다.
>
> **CHANGE_REQUEST** / Confidence: high

풀이: 세 지적 모두 plan 문구가 아니라 구현이 실제로 깨지는 지점이라 CHANGE_REQUEST다.

## Codex 1차 검증

- **결론**: PASS — material 없음 (confidence: high). 5개 확인 지점 모두 문제 없음.
- **현재 판단**: OR 검색은 escapeOrToken 적용 뒤 switch가 `views` 외 `latest/default`로 정상 수렴, `NOTICE_SORT_OPTIONS` 축소로 깨지는 소비자 없음(소비처 page.tsx·NoticeControlBar·NoticeListParams 3곳), `NoticeRowTrigger`의 `<button>` 안은 span·Label(span)·SVG만이라 block/중첩 button 없음(아이콘 aria-hidden), 매핑 핸들러 stale closure 없음.
- **다음 행동**: 커밋 승인 요청.

Codex 1차 검증 결과 (verbatim):

> 발견 사항: material 없음.
>
> | 체크 | 분류 | 판단 |
> |---|---:|---|
> | `notice-service.ts` OR 검색/정렬 switch | 문제 없음 | `escapeOrToken()` 적용 후 `title/content` OR 문자열은 기존 지적 범위가 반영됐고, `oldest` 제거 뒤 switch는 `views` 외 `latest/default`로 정상 수렴합니다. |
> | `NOTICE_SORT_OPTIONS` 축소 | 문제 없음 | `rg` 기준 공지 정렬 소비자는 `page.tsx`, `NoticeControlBar.tsx`, `NoticeListParams`뿐이라 `latest/views` 축소로 깨지는 소비자는 보이지 않습니다. |
> | `page.tsx` `validate.within` 타입 | 문제 없음 | `sort`는 `NOTICE_SORT_OPTIONS`로 런타임 검증되고 이후 `NoticeSortOption` 경로로 전달됩니다. 기존 `category`와 같은 패턴입니다. |
> | `NoticeList.tsx` button nesting / a11y | 문제 없음 | `NoticeRowTrigger`의 `<button>` 내부는 `span`, `Label(span)`, SVG만 포함해 block/nested button 문제가 없습니다. 아이콘은 `aria-hidden` 처리되어 있습니다. |
> | `NoticeControlBar.tsx` mapped handlers / key / delete ordering | 문제 없음 | map key는 모두 있고, handler는 loop stale closure 문제가 없습니다. `params.delete('page')`는 필터/정렬 변경 후 페이지 리셋 의도와 맞습니다. |
>
> 종합 판정: PASS — 신뢰도: high

### 2차 first-pass (B1~B5 확장 diff)

- **결론**: CHANGE_REQUEST → material 2건 반영 후 재검증 예정 (confidence: high). 수술적 변경·레이어 준수 확인.
- **현재 판단**: material 2건.
  - ① `adjacent`가 `.lt/.gt('created_at')`만 써서 같은 `created_at` 형제 글을 건너뛴다 → `(created_at, id)` 복합 keyset(`.or(created_at.lt.X,and(created_at.eq.X,id.lt.N))` + `id` 보조 정렬)으로 수정. 브라우저 실측: id 3(1.9)에서 이전=id 4(1.8)·다음=id 2(1.10) 정확.
  - ② `adjacent`가 `maybeSingle` error를 안 보고 data만 반환 → `handleResponse(prev/next).data`로 오류 처리 일관성 맞춤.
  - expression-only: `docs/decisions/README.md`의 ADR 0019 문구 변경은 `update-adr-index.mjs`가 인덱스를 ADR 0019 실제 제목에 재동기화한 것(스크립트 정상 동작). `docs/ARCHITECTURE.md`의 Hero/Breadcrumb 설명은 이번에 갱신했다.
- **다음 행동**: material 2건 반영 완료, verify-task 재실행 후 커밋 승인 요청.

Codex 1차 검증 결과 (verbatim, 핵심 지적):

> 1. `notice-service.ts` adjacent — 같은 `created_at`를 가진 공지가 2개 이상이면 이전/다음 탐색이 형제 글을 모두 건너뛴다. `.lt('created_at')`/`.gt('created_at')`만 쓰고 `id`를 보조 정렬·조건으로 쓰지 않는다. → `(created_at, id)` 복합 keyset을 추가한다.
> 2. `notice-service.ts` adjacent — `maybeSingle()`의 `error`를 확인하지 않고 `prev.data`/`next.data`만 반환한다. 다른 함수는 `handleResponse`로 오류를 throw하는데 adjacent만 silent하게 `null`을 반환한다. → `handleResponse`를 통과시킨다.
>
> 최종 판정: CHANGE_REQUEST — 신뢰도 high

풀이: 두 지적 모두 adjacent 쿼리의 정확성·오류 처리 일관성 문제라 CHANGE_REQUEST다. 반영 후 확인했다.

## Claude 2차 검증

- **최종 판단**: PASS — 자동 검증(verify-task 20260703-153541) + 브라우저 실측(원본 8항목 + B1~B8) 모두 확인. Codex 3라운드 지적 전부 반영.
- **현재 판단**: 브라우저 실측으로 Codex가 계획 단계에서 지적한 3건이 실제로 막혔음을 확인했다.
  - `성전,냉난방`(쉼표) 검색이 에러 없이 1건 반환(escapeOrToken)
  - `?sort=oldest`가 not-found UI 렌더
  - PC·모바일 모두 행 요소 겹침 없음
  - 정렬은 핀이 먼저 뜨고 그 안에서 조회수 내림차순(핀 그룹 1240·862·541, 비핀 그룹 674·521·430)
- **다음 행동**: 커밋 승인 요청.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차(원본) | 20260703-132518 | ✅ | ✅ | ✅ | 0 | 브라우저 실측 8/8 통과 |
| 2차(B1~B8) | 20260703-153541 | ✅ | ✅ | ✅ | 0 | 아래 B-실측 통과 (설교 padding 일치 포함) |

### B1~B5 브라우저 실측 (2차 요청)

- B1: 목록 미리보기 텍스트가 near-black으로 진해져 가독성 개선.
- B2: 검색 시 `'키워드' 검색` label 표시.
- B3: 행 클릭 → `/news/notices/1` 페이지 이동(모달 아님).
- B4: 상세가 목업 일치(분류 라벨·제목·날짜·조회수·본문·첨부 카드·이전/다음 글). 이전 글 클릭 → `/news/notices/2` 이동.
- B4 adjacent keyset(material #1 수정 후): id 3(1.9)에서 이전=id 4(1.8)·다음=id 2(1.10) 정확 — `.or()` 타임스탬프 인코딩 정상.
- B5: 목록·상세가 `‹ 공지사항`(뒤로가기+가운데) 헤더, Hero·형제탭 없음. bulletins·next-gen·community·gallery 200 + sr-only h1(`주보`·`다음세대`·`교제`·`갤러리`) 보존, Hero 없음.
- 데스크톱: `DesktopHeader`(GNB) DOM 존재·미변경(이 환경은 뷰포트가 366px 이상으로 안 넓어져 시각 실측은 불가, Hero만 제거·GNB 경로 무변경).

### 발견한 기존 dead code (보고만, 이번 범위 밖)

- `src/app/(content)/news/notices/_component/table/PinIcon.tsx` — 이번 변경 전부터 어느 곳도 import하지 않는 죽은 파일. NoticeTable 삭제와 무관하게 이미 죽어 있었다(knip 기존 부채). `table/` 폴더째 남는다.
- `NOTICE_CATEGORY_VARIANT` (`src/constants/notice.ts:24`) — 정의만 있고 사용처 0. 목업이 분류 라벨을 중립 회색으로 통일해 이번에도 살리지 않았다.

## 검증 이력

<details>
<summary>2026-07-03 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: sort 허용 목록 불일치·1280px 검증 수단 누락·OR 이스케이프 미정의 (material 3건)
- 조치: D1·D2·D3

</details>

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만. -->
