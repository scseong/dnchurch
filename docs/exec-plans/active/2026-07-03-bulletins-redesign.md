# bulletins-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-03
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — services 층은 `month` 파라미터·파생 집계만 추가(정책·의존성 변화 없음). package.json은 `@tanstack/react-table` 제거만.

## 목표

주보 목록·상세 페이지를 Claude Design 시안(`docs/references/한빛교회 - 주보 (1).html`) 기준으로 리디자인한다. notices-redesign 선례를 그대로 따른다.

- 목록: featured 카드, 지난 주보 리스트, 월별 보기 바텀시트로 바꾼다.
- 상세: 공용 Board 컴포넌트를 주보 전용 컴포넌트로 바꾼다.
- 헤더: `config/navigation.ts`에서 `/news/bulletins`를 '주보' 타이틀로 잡는다.

## Non-goals

- 시안의 휴대폰 프레임·상태바·앱 하단 탭·전체화면 확대 뷰어는 목업용 껍데기 UI라 옮기지 않는다. 확대는 기존 PhotoSwipe로 대체한다.
- 시안에만 있는 데이터(조회수 `views`, 설명 `desc`, 설교 `sermon`)는 실제 컬럼이 없으므로 만들지 않는다.
- 페이지 배경을 시안의 `#f4f0e6`로 바꾸지 않는다(notices 선례와 같이 사이트 공통 배경 유지).
- 관리자 작성·수정 폼(`create`·`[id]/update`)·주보 데이터 모델·RPC는 건드리지 않는다.
- 데스크톱 전용 별도 레이아웃은 만들지 않는다(모바일 퍼스트 단일 컬럼, notices와 동일).

## 검증된 Assumptions

- 주보 데이터 컬럼은 `id, title, sunday_date, created_at, author_id, bulletin_images[]`뿐 — `src/types/bulletin.ts:4` `BulletinWithImages` + `bulletin-service.ts:14` SELECT 대조. 시안의 views/desc/sermon은 없다.
- Hero·Breadcrumb는 이미 전역 제거됨 — commit `8d8e0d0`, `page.tsx:45` 주석. 이번엔 sr-only h1을 유지한다.
- 상세의 `@/components/board/*`는 주보 상세 **한 곳에서만** import — `Grep '@/components/board'` 결과 `bulletins/[id]/page.tsx` 단일. 상세를 교체하면 board 9파일이 전부 쓰이지 않게 된다.
- `@tanstack/react-table`는 `BulletinTable.tsx` **단일 소비처** — `Grep '@tanstack/react-table'` 결과 소스는 그 1파일뿐(나머지는 lockfile·docs).
- MobileHeader 타이틀·형제탭·우측액션은 `config/navigation.ts`의 `resolveMobileHeader`/`resolveSiblingTabs`/`resolveHeaderAction` + `MobileHeader.tsx:22` centeredTitle로 경로별로 나뉜다 — notices에서 쓴 패턴 그대로.
- `BottomSheet`(`src/components/ui/BottomSheet`)는 `{open,onClose,title,children}` 시그니처, PC에서 중앙 모달로 전환 — 월별 보기·공유에 재사용 가능.
- 월별 개수는 이미 `summary`가 가져오는 전체 `sunday_date`(`bulletin-service.ts:77` allDates 쿼리)에서 파생 가능 — 새 쿼리 불필요.
- 관리자 편집 링크는 `UserIdMatcher`(BoardHeader), 작성 버튼은 `CreateBulletinButton`의 `useProfile` role==='admin' 게이트 — 새 상세·목록에서 보존해야 함.
- 기존 상세는 이미지별 다운로드 링크를 렌더한다 — `BoardFooter.tsx:33` `<Link download>` + `[id]/page.tsx:68` `generateFileDownloadList`. 사용자에게 보이는 기능이라 보존 대상.
- 기존 상세의 삭제 아이콘(`BoardHeader.tsx:47` `FiTrash`)은 onClick·onDelete 없이 렌더만 된다 — 호출 0건인 비기능 버튼.

## Success Criteria

- `/news/bulletins`가 featured '이번 주 주보' 카드(표지 이미지·날짜·제목·이미지 수·펼쳐보기) + '지난 주보' 날짜칩 리스트로 렌더된다. 기존 TanStack 표는 사라진다.
- '월별 보기' 버튼이 BottomSheet를 열고, 연도 칩 + 12개월 그리드(월별 실제 개수)를 보여준다. 월 선택 시 `?year=Y&month=M`로 목록이 해당 월만 필터된다. '전체 주보 보기'로 초기화된다.
- `/news/bulletins/[id]`가 주보 전용 상세(날짜·제목·이미지 갤러리·이전/다음)로 렌더된다. 공유는 헤더 공유 버튼(ShareSheet), 확대는 PhotoSwipe로 동작한다. 관리자 편집 링크가 보존된다.
- 상세에 이미지 다운로드가 보존된다 — 이미지별 '이미지 저장' 링크로, `generateFileDownloadList`를 재사용한다.
- 기존 비기능 삭제 아이콘(FiTrash)은 새 상세로 옮기지 않는다. 관리자 편집 링크만 보존한다.
- 필터가 없으면 '지난 주보'는 최신 1건을 뺀 전체를 10개씩 페이지네이션하고, 중복·개수 어긋남이 0이다. 연·월 필터가 켜지면 featured 카드를 숨기고 해당 기간 전량을 보여준다.
- 모바일 헤더 타이틀이 '주보'(가운데 정렬)로 나오고, 상세에서 우측 액션이 공유로 바뀐다. 형제 탭(공지/주보/갤러리)은 뜨지 않는다.
- 목록·상세 모두 PC(~1456px)에서 레이아웃이 깨지지 않는다.
- 스타일 값은 전부 semantic/`$home-*` 토큰. 하드코딩·primitive 직접 사용 0.
- `verify-task.mjs` lint/styles/build 통과. knip 신규 미사용 = `@tanstack/react-table` 제거로 0.

## 영향받는 파일

**목록**
- `src/app/(content)/news/bulletins/page.tsx` — 재작성(featured + archive, year·month·page 검증)
- 신규 `_component/FeaturedBulletin.tsx` (+scss) — LatestBulletin 대체
- 신규 `_component/BulletinArchive.tsx` (+scss) — 'use client', 지난 주보 리스트 + 월별 보기 pill + Pagination + CreateBulletinButton
- 신규 `_component/MonthPickerSheet.tsx` (+scss) — 'use client', BottomSheet 연·월 피커
- `src/app/(content)/news/bulletins/page.module.scss` — `.wrap` 2컬럼 분기 제거

**상세**
- `src/app/(content)/news/bulletins/[id]/page.tsx` — Board* → BulletinDetail 교체
- 신규 `_component/BulletinDetail.tsx` (+scss) — 날짜·제목·이미지 갤러리(PhotoSwipe)·공유 카드·이전/다음·관리자 편집 링크
- 신규 `_component/BulletinShareCard.tsx` (+scss) — 본문 '이 주보 공유하기' 카드(카카오톡·링크 복사·이미지 저장) (D6)
- `src/components/common/PhotoSwipe.tsx` (+scss), `src/types/photoswipe.ts` — `pageBadge` 옵션 추가(상세 이미지 'i / N'·'확대' 배지). 기본값이 꺼짐이라 설교 등 기존 사용처는 그대로다 (D4·D6)

**헤더**
- `src/config/navigation.ts` — `isBulletinPath` + 3개 resolver 분기
- `src/components/layout/Header/MobileHeader.tsx` — centeredTitle에 `/news/bulletins` 추가

**서비스/타입**
- `src/types/bulletin.ts` — `BulletinParams.month`, `BulletinSummaryResponse.monthBuckets`
- `src/services/bulletin/bulletin-service.ts` — `listQuery` month 필터 + 필터 없을 때 `excludeLatestId`(neq) + `summary` monthBuckets 파생

**유틸**
- `src/utils/date.ts` — `bulletinDateLabel(date)` → "YYYY. M. D · 주일"(일요일이면 '주일', 아니면 요일)

**삭제(교체하면 안 쓰이는 파일)**
- `_component/LatestBulletin.tsx`, `LatestBulletinImages.tsx`, `LastBulletin.module.scss`
- `_component/BulletinTableSection.tsx`(+scss), `BulletinTable.tsx`(+scss), `BulletinYearFilter.tsx`(+scss)
- `src/components/board/*` 9파일 (주보 상세 단일 소비처)
- `package.json` — `@tanstack/react-table` 제거(유일 소비처 삭제)

**보존**
- `_component/CreateBulletinButton.tsx` — 관리자 작성 버튼, archive 안으로 이동만

## 접근법 (핵심만)

- **월별 데이터**: `summary`가 이미 가져오는 전체 `sunday_date`에서 `monthBuckets: { [year]: { [month]: count } }`를 파생해 함께 돌려준다. 새 쿼리·새 RPC 없음. `listQuery`는 `month`가 있으면 `year-month` 범위로 좁힌다(month는 year와 함께만 옴).
- **featured 중복 제거(개수 어긋남 방지)**: 필터가 없을 때 archive 목록 쿼리에 `.neq('id', latestId)`를 걸어 최신 1건을 빼고 `count:'exact'`로 센다 — page당 10개, offset·total이 자동으로 맞아 중복·drift가 없다. 연·월 필터가 켜지면 featured 카드를 숨기고 해당 기간 전량을 보여준다(neq 없음). `latestId`는 `summary`가 이미 가진 `latest`에서 넘긴다.
- **상세 이미지 다운로드**: `generateFileDownloadList`를 재사용해 이미지별 '이미지 저장' 다운로드 링크를 렌더한다(기존 BoardFooter 다운로드 기능 보존). 확대는 PhotoSwipe로 처리한다.
- **헤더 공유 액션**: `resolveHeaderAction`은 숫자 id 상세(`/^\/news\/bulletins\/\d+$/`)만 'share' — `create`·`update` 제외. ShareSheet가 페이지 meta(og:image 등)를 읽으므로 상세 generateMetadata만 있으면 자동 동작.

## 단계별 체크리스트

- [x] 1. 헤더: `navigation.ts` `isBulletinPath` + resolver 3분기, `MobileHeader.tsx` centeredTitle
- [x] 2. 서비스/타입: `BulletinParams.month`, `listQuery` month 필터 + `excludeLatestId`(neq), `summary` monthBuckets, `BulletinSummaryResponse` 갱신
- [x] 3. 유틸: `bulletinDateLabel`
- [x] 4. 목록: FeaturedBulletin + BulletinArchive + MonthPickerSheet + page.tsx 재작성 + page.module.scss
- [x] 5. 상세: BulletinDetail(이미지별 다운로드 보존, 삭제 아이콘 미이관) + `[id]/page.tsx` 교체
- [x] 6a. 삭제: 구 목록 컴포넌트 9파일 + board 9파일 (git rm 완료). `/news/page.tsx` month 타입 동기화
- [x] 6b. `@tanstack/react-table` 의존성 제거 — `yarn remove`로 package.json + yarn.lock 갱신 (dev 서버 미실행 확인: :3000 리슨 없음)
- [x] 7. VERIFY 1차: lint/styles/build/knip (run 20260703-201602 통과)
- [x] 8. 목업 근접(D4): PhotoSwipe `pageBadge` + 첫 행 강조 + featured 배지 점. 브라우저 모바일 폭 실측(배지 점·'확대' 배지 확인)
- [x] 9. 목업 충실도 보강(D6): 공유 카드 + 1/N 항상 표시 + 이미지 라운드 + 그림자 제거 + 인접 문구. 모바일 폭 실측(공유 카드·1/1·라운드·인접 문구·링크 복사 토스트 확인)
- [ ] 10. VERIFY 최종: staged 트리로 verify-task 재실행 후 커밋

좁은 검증(dev 무영향): `npx tsc --noEmit` 통과, 변경 파일 `eslint` 통과, 신규 scss `stylelint` 통과(잔여 2건은 PhotoSwipe 기존 `$gray-*` 부채).

## Verification

- `node scripts/verify-task.mjs bulletins-redesign`

## ADR 판단

- **필요 없음**. `services/bulletin`은 `month` 파라미터와 `monthBuckets` 파생 집계만 추가한다 — 인증·캐시·배포 정책, 레이어 방향, 데이터 모델 변화 없음(기존 쿼리 재사용). `package.json`은 삭제한 컴포넌트의 유일 의존성 1개 제거뿐. 둘 다 일회성 판단.

## 의사결정 로그

- **D1 — 상세 이미지 다운로드를 보존한다**
  - 문제: 새 상세가 공용 `BoardFooter`를 대신하면서 이미지별 다운로드 링크(`BoardFooter.tsx:33`)가 조용히 사라질 수 있었다. 시안에도 '이미지 저장'이 있다.
  - 해결: `generateFileDownloadList`를 그대로 재사용해 이미지마다 '이미지 저장' 링크를 `BulletinDetail`에 넣는다. PhotoSwipe 확대에만 맡기지 않는 이유는, 확대가 다운로드를 대신하지 못하고 기존 기능을 없애면 사용자에게 보이는 변화이기 때문이다.
  - 결과: 이미지별 '이미지 저장' 링크가 상세에 그대로 남는다.

- **D2 — 기존 삭제 아이콘은 새 상세로 옮기지 않는다**
  - 문제: `BoardHeader.tsx:47`의 `FiTrash` 아이콘은 `UserIdMatcher` 아래에 보이지만 `onClick`·`onDelete`가 연결되지 않아 눌러도 아무 일도 없다(호출 0건).
  - 해결: 비기능 버튼을 새 컴포넌트로 복제하지 않는다. 동작하는 관리자 편집 링크(`FiEdit`)만 `UserIdMatcher` 게이트로 보존한다.
  - 결과: 동작 안 하는 버튼이 줄고, 관리자 편집 경로는 그대로 유지된다.

- **D3 — featured 제외를 쿼리 `neq`로 처리한다**
  - 문제: '지난 주보'에서 최신 1건(featured)을 빼되, page 1에서만 클라이언트로 빼면 `total`은 featured를 포함한 채라 페이지 수·offset이 어긋난다(21건이면 20건을 2페이지로 볼지 3페이지로 볼지 불명).
  - 해결: 필터가 없을 때 목록 쿼리에 `.neq('id', latestId)`를 걸고 `count:'exact'`로 센다. Supabase가 offset·count를 함께 맞추므로 중복도 어긋남도 없다. `latestId`는 `summary`가 이미 가진 `latest`에서 넘긴다. 연·월 필터가 켜지면 featured 카드를 숨기고 해당 기간 전량을 보여준다(neq 없음).
  - 결과: featured와 리스트가 겹치지 않고 페이지 개수가 정확하다.

- **D4 — 목업 세부에 더 맞춘 3가지(이미지 배지·첫 행 강조·배지 점)**
  - 문제: 처음엔 데스크톱 폭 스크린샷으로 목업(모바일 폰 뷰)과 비교해 달라 보였다. 모바일 폭으로 다시 띄워 실제 차이를 좁힌 뒤, 사용자가 맞출 항목을 골랐다.
  - 해결: 모바일 폭으로 다시 비교한 뒤 사용자가 아래 3가지를 골랐다.
    - 상세 이미지에 'i / N' 페이지 배지 + '확대' 힌트 오버레이 — `PhotoSwipe`에 `pageBadge` 옵션을 더했다. 기본값이 꺼짐이라 설교 등 기존 사용처는 그대로다.
    - '지난 주보' 맨 위(가장 최근) 행에 골드 날짜칩 + '지난 주' 배지.
    - featured 배지 앞 골드 점.
  - 결과: 목업 세부와 더 가까워졌다. 폰 프레임·상태바·하단 탭은 목업 껍데기라 계속 옮기지 않는다.

- **D5 — 제목 폰트는 Pretendard로 둔다(명조체 안 씀)**
  - 문제: 목업은 제목에 명조체(Gowun Batang)를 쓴다. 코드베이스는 명조($font-family-secondary)를 로고·성경 인용 전용으로 제한한다.
  - 해결: 사용자가 명조 적용을 고르지 않아 Pretendard 볼드를 유지했다. 코드베이스 규칙과 충돌하지 않는다.
  - 결과: 제목 폰트가 사이트의 나머지와 일관된다.

- **D6 — 상세를 목업에 더 충실하게 고침(사용자 지적 반영)**
  - 문제: notices 패턴을 따라 옮기다 보니 목업에서 임의로 뺀 게 드러났다 — 상세 본문의 '이 주보 공유하기' 카드를 안 만들었고(공유를 헤더 ShareSheet로만 처리), 이미지 'i / N' 배지를 2장 이상일 때만 띄웠고, 인접 주보 빈 문구를 '없음'으로 줄였다. 그림자도 사용자가 전부 빼길 원했다.
  - 해결:
    - 상세 본문에 `BulletinShareCard`(카카오톡·링크 복사·이미지 저장)를 추가했다. 목업처럼 헤더 공유 버튼과 본문 카드를 둘 다 둔다. 기존 단독 '이미지 저장' 줄은 이 카드가 대신한다.
    - 이미지 'i / N' 배지를 1장이어도 항상 띄운다(목업이 이미지마다 표시).
    - 상세 이미지 모서리를 `$radius-m`로 둥글게 클립한다(`overflow: hidden`).
    - featured 카드의 box-shadow를 없애고, hover는 그림자 없이 translateY만 준다.
    - 인접 주보 빈 문구를 '이전 주보가 없습니다'·'다음 주보가 없습니다'로 되돌린다(목업 문구).
  - 결과: 상세가 목업과 거의 같아졌다. 카카오 버튼은 브랜드 옐로를 로컬 변수로 뒀다(토큰 없음, stylelint 예외 주석). 아이콘은 인라인 SVG를 써 `<img>` 경고를 피했다. 모바일 폭 브라우저로 공유 카드·1/1 배지·라운드 모서리·인접 문구를 확인했고, '링크 복사'는 토스트까지 떴다.

- **D7 — 폰트 굵기·카카오 버튼·상세 제목·Footer 다듬기(사용자 요청)**
  - 문제: 카카오 버튼의 노란 배경이 카드와 안 어울렸다. 굵기 700이 버튼·pill·배지까지 퍼져 무거웠다. 상세 제목 크기와 Footer 노출도 조정을 원했다.
  - 해결:
    - 카카오 버튼에서 브랜드 옐로 배경을 빼고 나머지 두 버튼과 같은 옅은 면으로 맞췄다. 쓰지 않게 된 브랜드 색 로컬 변수도 지웠다(D6에서 넣은 것).
    - font-weight 700은 제목(`.title`)에만 남기고 버튼·링크·pill·칩·배지·날짜는 600으로 낮췄다.
    - 상세 제목을 2rem(`$font-size-20`)로 맞췄다.
    - 콘텐츠 레이아웃 Footer를 임시로 주석처리했다 — 전역(모든 콘텐츠 페이지) 변경이라 주보 Feat와 섞지 않게 별도 Chore 커밋으로 분리한다.
  - 결과: 카드 톤이 차분해지고 위계가 제목 중심으로 정리됐다. 정적 검증(`tsc`·`eslint`·`stylelint`)은 통과했고, 이 라운드는 사용자가 커밋·푸시를 바로 요청해 시각 재확인 없이 진행한다.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 2026-07-03 1차
- **현재 판단**: 구현을 막을 지적 3건을 plan에 반영했다. (1) 상세 이미지 다운로드를 "구현 중 판단"에서 "보존"으로 확정(D1), (2) 동작 안 하는 삭제 아이콘 미이관을 명시(D2), (3) featured 제외를 page-1 클라이언트 필터에서 `.neq('id', latestId)` + `count:'exact'` 쿼리로 바꿔 개수 어긋남을 없앰(D3). 레이어·캐시·삭제 안전성은 Codex가 소스로 PASS 확인.
- **다음 행동**: WORK 진행. 재검증 불필요(CHANGE_REQUEST는 plan 수정 후 진행).

Codex 핵심 지적(요약):
- 다운로드 링크를 보존할지 제거할지 기준이 없었다 — `BoardFooter.tsx:33` `<Link download>`, `[id]/page.tsx:68` `generateFileDownloadList`가 실제로 렌더 중. → D1.
- 관리자 삭제 아이콘 `BoardHeader.tsx:47` `FiTrash`가 `UserIdMatcher` 아래 노출(단 onDelete 미연결, 호출 0건) — 제거할지 유지할지 정해야 함. → D2.
- page 1 latest 제외 + `total: itemsRes.count`(featured 포함) 조합에서 페이지 개수가 어긋난다(21건 예시에서 20건을 2/3페이지 어느 쪽으로 셀지 불명) — `usePagination.tsx:14` `Math.ceil(totalCount/pageSize)` 기준. → D3.
- 레이어·캐시 PASS: `getBulletinSummary`가 `createStaticClient(bulletinCache.summary())`, 쓰기는 `updateTag('bulletin')` 유지 — 정책 변화 없음.
- 삭제 안전 PASS: `rg "@/components/board" src` 1건, `rg "@tanstack/react-table" src` 1건 확인.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high) — 2026-07-03 1차
- **현재 판단**: 구현을 막을 지적 2건 중 코드 버그 1건을 고쳤다. `/news/bulletins?month=7`처럼 month만 있고 year가 없으면 `excludeLatestId`(`!year && !month`)가 false라 최신 글을 안 빼고, `hasFilter`(`Boolean(year)`)도 false라 featured가 떠 목록·featured에 최신이 중복됐다. `page.tsx`에서 `month !== undefined && year === undefined`이면 `notFound()`로 막았다. 나머지 1건(`@tanstack/react-table`가 아직 남아 있음)은 6b 단계로 VERIFY에서 제거한다.
- **다음 행동**: `@tanstack/react-table` 제거 후 verify-task.

Codex 확인(PASS): D1/D2/D3 해결됨.
- 다운로드: BulletinDetail이 `generateFileDownloadList` + `download` 링크를 렌더한다.
- 삭제 아이콘: `UserIdMatcher` 아래 편집 링크만 두고 옮기지 않았다.
- featured 제외: 목록 쿼리가 latest 선조회 후 필터 없을 때만 `.neq('id', excludeId)` + 같은 쿼리 `count:'exact'`.
- 월 범위: 반개구간 `[YYYY-MM-01, 다음달-01)`, 12월 이월 경계까지 정확하다.
- monthBuckets: `sunday_date.split('-')` 방식이 기존 `new Date().getFullYear()`보다 timezone 영향이 적다.
- 헤더: 숫자 상세에만 공유 액션이 붙는다.

## Claude 2차 검증

- **최종 판단**: 통과. ESLint·stylelint·build 통과, knip 신규 미사용 0(잔여는 기존 부채).
- **현재 판단**: Codex 1차 수정(month 단독 URL guard)을 diff로 다시 읽어 의도·범위를 확인했다. 삭제로 새로 생긴 미사용 2건(`KakaoShareButton.tsx`·`getKakaoShareUrl`)을 마저 지워 knip 신규를 0으로 맞췄다 — 둘 다 삭제한 `BoardHeader`·`LatestBulletin`·구 상세 page가 유일 소비처였다. `KakaoShareProps`는 `useKakaoShare.tsx`가 계속 쓰므로 미사용이 아니다.
- **다음 행동**: `git add` 후 최종 verify-task, 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260703-201602 | ✅ | ✅ | ✅ | 0 | 브라우저 실측(선택) |

- run 20260703-201602은 KakaoShareButton·getKakaoShareUrl 제거 직전 기록이라 knip 파일이 11개, export가 26개로 나왔다. 두 파일 제거 후 `yarn knip` 재실행에서 파일 10개·export 25개로 줄어 새로 생긴 미사용이 사라졌고, `npx tsc --noEmit`·`eslint`도 통과했다. 잔여 knip(파일 10·export 25·type 43)은 전부 bulletins와 무관한 기존 부채다(예: `notices/_component/table/PinIcon.tsx`, UI barrel 미사용 export). 커밋 직전 staged 트리로 verify-task를 한 번 더 돌려 게이트 기록을 남긴다.
- D4(목업 근접) 추가분 검증:
  - `tsc --noEmit`·`eslint`·`stylelint` 통과. 모바일 폭 브라우저로 featured 배지 점·상세 '확대' 배지를 눈으로 확인했다.
  - `PhotoSwipe`는 `pageBadge` 기본값이 꺼짐이라 설교 사용처가 그대로다.
  - stylelint 경고 2건은 D4가 아니라 PhotoSwipe의 기존 `$gray-100/200`(라인 4·22) 부채다.
  - 첫 행 강조는 dev DB에 주보가 1건뿐이라 눈으로는 못 봤고 로직만 확인했다.

## 후속 작업

- `package-lock.json`에 남은 `@tanstack/react-table` 항목 정리
  - 이유: 이 저장소는 yarn을 쓰는데 `package-lock.json`과 `yarn.lock`이 둘 다 커밋돼 있다(기존 상태). `yarn remove`는 `yarn.lock`만 갱신하고 `package-lock.json`은 손대지 않는다. `npm`으로 맞추면 해석 차이로 diff가 크게 번져 이번 변경과 섞인다.
  - 다음 기준: 두 lockfile 공존을 하나로 통일할 때. 이번 작업 범위 밖.
  - 기록 위치: 없음 (이 항목으로 남김)
