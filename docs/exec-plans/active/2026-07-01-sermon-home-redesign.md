# sermon-home-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-01
- **브랜치**: style/brown-primary-migration (brown 마이그레이션 위에 이어감)
- **Open questions**: none (D3 확정 — 시리즈는 캐러셀 유지 + warm 리스타일)
- **ADR needed**: no — 설교 홈 UI 리스타일. 레이어·데이터·토큰 시스템 변경 없음(brown 토큰은 직전 커밋에 이미 도입)

## 목표

설교 홈(`/sermons` 랜딩)을 참조 warm 시안으로 리디자인한다. Featured는 오버레이 scrim 히어로로, 최근 설교는 세로 리스트(가로형 카드)로 바꾼다. 추가로 목업에 맞춰 헤더를 '설교' 타이틀 헤더로 바꾸고, Hero 밴드를 제거하고, 상단에 검색 인풋을 넣는다.

## 검증된 Assumptions

- 랜딩은 `SermonFeatured`(이번 주 설교) + `SermonRecentCarousel`(최근 설교) + `SermonSeriesCarousel`(진행 중 시리즈) 3섹션 (확인: `sermons/page.tsx:59-64`).
- Featured 현재 = 흰 카드 + 좌측 미디어(PC 58rem grid) + 우측 body. Recent/Series 현재 = `Carousel` + `useCarousel`로 가로 스크롤 (확인: 각 `*.tsx`·`*.module.scss` Read).
- brown 토큰(`$primary`=#5a3f2e·`$overlay-image` warm 등)은 직전 커밋 `deb9c19`로 사용 가능.
- 데이터 형태 변화 없음 — `SermonWithRelations`·`SeriesWithSermonCount` 그대로. 마크업·스타일만 변경.

## Success Criteria

- **Featured**: 풀블리드 이미지 + 하단 그라디언트 scrim(scripture ref→title→preacher·meta) + 좌상단 pill(최신 설교 gold·시리즈). 데스크톱은 높이·비율을 제한해 과대 확대 방지.
- **Recent**: 캐러셀 제거, 세로 리스트 + 가로형 카드(썸네일 좌측 고정폭·텍스트 우측: title→meta[preacher·scripture·date]). "더 보기" 링크 유지.
- **Series**: (D3 결정 후) — 제안: 캐러셀 유지 + 카드 warm 리스타일.
- 모든 색은 시맨틱 토큰(brown/gold/beige). primitive 하드코딩 0.
- 모바일 퍼스트 + `respond-up` 데스크톱 대응. `yarn lint:styles` 0 errors.
- 브라우저 실측(모바일·데스크톱 폭)으로 3섹션 확인.

## 영향받는 파일

- `SermonFeatured/SermonFeatured.tsx`·`.module.scss` — 오버레이 히어로로 재구성
- `SermonRecentCarousel/` — 리스트로 전환: `SermonRecentCarousel.tsx`(Carousel 제거→`<ul>`), `SermonCarouselCard.tsx`(가로형), `.module.scss`. 컴포넌트/파일명 `...List`로 rename 검토(D2)
- `SermonSeriesCarousel/*.module.scss` — 카드 warm 리스타일(D3에 따라 tsx도)
- `sermons/page.tsx` — import 경로(rename), 숨김 h1 + `SermonHomeSearch` 추가(D5·D6)
- `sermons/page.module.scss` — 검색 spacing·섹션 간격
- `sermons/_component/SermonHomeSearch.tsx` — 검색 client 컴포넌트 신규(D6)
- `src/components/layout/Hero/hero.config.ts` — `/sermons` SELF_HERO 추가(D5)
- `src/config/navigation.ts` — `/sermons` 헤더 케이스 추가(D4)
- `src/components/layout/Header/MobileHeader.tsx` — '설교' centeredTitle(D4)

## 단계별 체크리스트

- [x] 1. Featured 오버레이 히어로 (풀블리드 이미지 + 하단 scrim·좌상단 pill·중앙 play·우상단 duration, 데스크톱 16/9 + max-height 46rem)
- [x] 2. Recent 세로 리스트 + 가로형 카드 (폴더·파일 `SermonRecentList`로 rename, Carousel 제거, `<ul>`·`<li>`, 서버 컴포넌트화, 데스크톱 2열)
- [x] 3. Series — brown 토큰 마이그레이션으로 이미 warm(흰 카드+brown 링크·라벨). 추가 SCSS 변경 없이 D3 충족(surgical)
- [x] 4. 헤더 목업 전환(D4): navigation.ts `/sermons` `showBack:true` + MobileHeader '설교' centeredTitle
- [x] 5. Hero 밴드 제거(D5): hero.config `/sermons` SELF_HERO 추가 + page.tsx 숨김 h1
- [x] 6. 검색 인풋(D6): `SermonHomeSearch`(SearchField 래핑) → `/sermons/all?q=`, page.tsx·page.module.scss 배치
- [x] 7. 브라우저 실측(모바일) + `lint:styles`·`eslint` 0 errors. 데스크톱은 뷰포트 고정으로 미디어쿼리 코드 확인

## Verification

- `yarn lint:styles` (dev 구동 중 build/verify-task 보류)
- 브라우저 실측 (Claude in Chrome)

---

## 의사결정 로그

- **D1 — Featured를 오버레이 scrim 히어로로**
  - 문제: 참조는 풀블리드 이미지 + 하단 scrim에 텍스트를 얹는 히어로인데, 현재는 흰 카드 + 좌우 분할이라 시안과 구조가 다르다.
  - 해결: SermonFeatured를 이미지 위 scrim 오버레이로 재구성. 데스크톱은 참조(모바일)와 달리 화면이 넓어 이미지가 과대해지므로 max-height·aspect로 높이를 묶는다.
  - 결과: 모바일 aspect 4/3, 데스크톱 16/9 + max-height 46rem. 좌상단 "최신 설교" gold pill + 시리즈 glass pill, 하단 warm scrim에 구절(밝은 gold)·제목(흰색)·meta. scrim/pill/duration은 토큰 미존재라 local var(기존 `$duration-overlay-bg` 패턴).

- **D2 — Recent를 캐러셀에서 세로 리스트로 (사용자 결정)**
  - 문제: 참조 최근 설교는 세로 리스트 + 가로형 카드인데 현재는 가로 캐러셀이다.
  - 해결: `Carousel`/`useCarousel`를 걷어내고 `<ul>` 세로 리스트로. 카드는 썸네일 좌측(고정폭)·텍스트 우측. 파일명 `SermonRecentCarousel`→`SermonRecentList`로 rename해 이름과 동작을 맞춘다(import 1곳 갱신).
  - 결과: 폴더·파일 3개 git mv, `SermonRecentList`는 'use client' 제거해 서버 컴포넌트로. 카드는 썸네일 13rem(데스크톱 18rem)·텍스트(라벨·제목 2줄·meta). 데스크톱은 2열 그리드. page.tsx import·사용처 갱신.

- **D3 — Series 섹션은 캐러셀 유지 + warm 리스타일 (사용자 결정)**
  - 문제: 사용자는 "최근 설교"만 세로 리스트로 명시했다. 시리즈는 미정. 참조 랜딩의 시리즈는 카드 나열이다.
  - 해결: 사용자가 "캐러셀 유지 + warm 리스타일" 선택. 시리즈는 여러 개를 가로로 훑어보기 좋고, 리스트 전환은 마크업 변경이 커 이번 홈 범위를 넘는다.
  - 결과: `SermonSeriesCarousel`은 구조 유지, `.module.scss`만 warm 토큰으로 다듬는다.

- **D4 — 헤더를 목업 '설교' 타이틀 헤더로 (사용자 추가 요청)**
  - 문제: 목업 설교 홈 헤더는 뒤로가기 + '설교' 중앙 타이틀 + 햄버거인데, 우리 `/sermons`는 로고 헤더(`showBack:false`라 MobileHeader가 로고를 렌더)였다.
  - 해결: `navigation.ts` `resolveMobileHeader`에 `/sermons` landing 케이스 추가(`showBack:true`, About 재설계와 같은 패턴). `MobileHeader`의 `centeredTitle` 조건에 '설교' 추가. 전역 GNB 규칙(line 155)은 안 건드려 다른 top-level 페이지 영향 없음.
  - 결과: 설교 홈 헤더가 목업과 일치. 뒤로가기는 `router.back()`.

- **D5 — Hero 밴드를 설교 landing에서만 제거 (사용자 추가 요청)**
  - 문제: 목업엔 'SERMONS/설교' 히어로 밴드가 없다. 우리 Hero는 공유 `(content)/layout.tsx`에서 렌더돼 모든 콘텐츠 페이지에 나온다.
  - 해결: `hero.config.ts` `SELF_HERO_PATHS`에 `/sermons` 추가 — `resolveHeroMeta('/sermons')`가 null이 돼 landing만 밴드가 사라진다. `HERO_META['/sermons']`는 자식(/sermons/all·/series)의 subtitle 소스라 남긴다(About과 동일 패턴). Hero의 h1이 사라지므로 page.tsx에 숨김 h1('설교', `@include blind`)로 문서 구조 보전.
  - 결과: 설교 landing만 밴드 제거. /sermons/all·/series는 히어로 유지(브라우저로 확인).

- **D6 — 상단 검색 인풋 추가 (사용자 추가 요청)**
  - 문제: 목업은 헤더 아래에 '제목·본문·설교자 검색' 인풋이 있는데 우리 landing엔 없었다.
  - 해결: 공용 `SearchField`(제어 컴포넌트, form 제출)를 감싼 client 컴포넌트 `SermonHomeSearch` 신설. 제출 시 `/sermons/all?q=`로 push — all 페이지가 q를 읽는 기존 인프라 재사용(새 검색 로직 없음). `<search>` landmark로 감싼다.
  - 결과: landing 상단 검색 → 전체 설교 결과로 이동(브라우저로 '말씀' 검색 1건 확인).

## Codex 계획 검증

- **결론**: 불필요
- **현재 판단**: app-layer UI 리스타일 — 레이어·데이터 흐름·토큰 시스템 변경 없음, ADR_TRIGGER 파일 미포함, 참조 시안이 명확. ADR 0001 "표준 작업·답이 명확한 코드는 위임 안 함" 기준.
- **다음 행동**: 구현 diff 생성 후 Codex 1차 검증으로 대체

## Codex 1차 검증

- **1차 결론**: PASS (confidence 92%) — 콘텐츠 리디자인(Featured·Recent)
- **2차 결론**: BLOCK → 재검증 CHANGE_REQUEST → 수정 완료 (chrome 변경: 헤더·Hero·검색)
- **현재 판단**:
  - 1차(콘텐츠): 5개 항목 모두 이슈 없음 — surgical, 버그/엣지, rename 무결성(잔여 참조 0, `Carousel`은 시리즈가 계속 씀), server/client(`SermonRecentList`·`SermonFeatured` server 컴포넌트 타당), 토큰(local rgba var 외 raw hex 없음).
  - 2차(chrome): 교차 페이지 회귀 없음(SELF_HERO·헤더 early-return 모두 `/sermons` exact match), `@include blind` 존재 확인. 지적 2건 → (a) 모바일 h1 중복: MobileHeader가 showBack 시 `<h1>설교</h1>` 렌더 + 페이지 숨김 h1 → **수정**: 페이지 h1을 `display:none` 후 `respond-up($header-breakpoint)`에서만 노출해 어느 뷰에서도 접근성 h1 1개(브라우저로 모바일 accessible h1=1 확인). (b) `SermonHomeSearch.tsx`가 untracked라 diff에 안 잡힘 → `git add`로 tracked화(파일은 eslint 통과·브라우저 동작 확인).
  - 재검증(CHANGE_REQUEST): `centeredTitle = title === '설교'`가 title 문자열 비교라 `/sermons/all`·`/series`·상세(모두 title '설교')까지 가운데 정렬되는 side-effect → **수정**: `pathname === '/sermons'`로 좁혀 landing만 적용. sub-page는 원래 좌측 정렬 유지.
- **다음 행동**: 사용자 승인 후 커밋

## Claude 2차 검증

- **최종 판단**: PASS — 콘텐츠는 Codex 1차 PASS(92%), chrome은 BLOCK→CR 지적 3건 모두 수정(h1 반응형·검색 tracked·centeredTitle path 스코핑). 브라우저로 헤더 '설교'·Hero 제거·검색 동작·모바일 accessible h1=1 확인
- **현재 판단**: `yarn lint:styles` 0 errors(신규 sermon SCSS warning 0, 토큰만 사용). `eslint` 0 errors. rename 후 `SermonRecentCarousel`·`SermonCarouselCard` 잔여 참조 0(grep). 브라우저(모바일): Featured 히어로(pill·play·scrim·meta), 최근 설교 세로 리스트(썸네일 좌·텍스트 우), 시리즈 캐러셀 warm 정상 렌더. `Carousel` 컴포넌트는 시리즈가 계속 써 orphan 아님.
- **다음 행동**: Codex 1차 결과 반영 후 커밋

| 시점 | 도구 | errors | warnings(신규) | 비고 |
| --- | --- | --- | --- | --- |
| 2차 | lint:styles | 0 | 0 | sermon SCSS 토큰만 |
| 2차 | eslint | 0 | — | 잔여 참조·unused 0 |
| 2차 | 브라우저(모바일) | — | — | 3섹션 정상, 데스크톱은 미디어쿼리 코드 확인 |

## 후속 작업

- 설교 상세(detail) 리디자인 — serif 성경 카드·밑줄 탭바. 별도 task(2-b).
- 전체 설교·시리즈 목록(all·series) 리디자인. 별도 task(2-c).
