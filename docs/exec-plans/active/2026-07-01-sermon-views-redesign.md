# sermon-views-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-01
- **브랜치**: style/brown-primary-migration
- **Open questions**: none (3개 스코프 결정 확정)
- **ADR needed**: no — 설교 하위 뷰 UI 리스타일. navigation/hero.config는 landing과 동일 패턴 확장(디자인 시스템 변경 아님)

## 목표

설교 하위 3개 뷰(전체 설교 `/sermons/all`, 모든 시리즈 `/sermons/series`, 설교 상세 `/sermons/[id]`)와 필터 BottomSheet를 목업 시안에 맞춘다. 목업은 모바일이라 모바일을 목업화하고 데스크톱은 반응형으로 유지한다.

## 확정 결정 (사용자)

- **D1 레이아웃**: 반응형 유지 + 모바일만 목업화. 데스크톱 사이드바(all·series) 유지, 모바일은 단일 컬럼 + 필터 시트. 헤더·Hero 제거는 landing과 동일 패턴.
- **D2 상세 탭**: 목업 3탭으로 축소 — 말씀 구절(scripture)/설교 요약(summary)/설교 자료(resources). **설교 노트 탭 제거**(SermonNoteEditor 미사용화). 탭 순서는 말씀 구절 먼저.
- **D3 필터**: 기존 필터(시리즈/설교자/정렬) 유지 + 목업 pill 스타일로 리스타일. service_type(예배 구분) 신규 추가 안 함, 정렬 보존.

## 목업 핵심 (브라우저 실측)

- **전체 설교**: 헤더 '전체 설교' + 검색 + 필터 아이콘 + "전체 설교 N편" 카운트 + 가로형 카드 세로 리스트.
- **필터 시트**: '필터'+'초기화', 그룹별 pill(선택=brown 채움, 미선택=아웃라인), 하단 '적용하기' 풀버튼.
- **상세**: 영상(시리즈 pill·play·duration) → 제목·meta → 밑줄 탭바 3개 → 흰 카드 serif 성경 본문+'자세히 보기' → 시리즈 섹션(시리즈 헤더 카드 + 번호형 에피소드 리스트, 현재 편 brown 하이라이트).
- **시리즈**: 헤더 '시리즈' + 안내문 + 카드 리스트(카드는 우리 것 유지).

## 커밋 분할 (뷰별)

- [x] C1. 전체 설교 — 목업과 종합 일치: Hero 제거+헤더 '전체 설교'(hero.config·navigation), 형제 탭 제거(resolveSiblingTabs), 필터 시트 pill(초기화 상단·적용하기 footer), GridCard 보더리스+성경구절 eyebrow(제목 위), 카운트 "전체 설교 N편", Hero 대체 반응형 숨김 h1. 브라우저: 목업 일치 확인·lint 0. (트랩: `$spacing-14` 미존재 → `$spacing-12`, dev 빌드에러였음)
- [x] C1b. warm 색 정합 — 사용자 지적("font-size·색상이 목업과 다름"). 원인: brown 마이그레이션이 interactive/dark 토큰만 warm으로 바꾸고 텍스트 3종은 cool gray 유지 → 설교 텍스트가 차갑게 렌더. 목업 실측 색을 `_home.scss` warm 팔레트로 매핑: 카드 제목 `$home-text`(#2a241d), 성경 eyebrow `$home-text-muted`(#9a826d)·11px, 메타 `$home-text-sub`(#70665a), 카운트 tan, 필터 pill·초기화·섹션 라벨 warm. 브라우저 computed style로 hex 정확 일치 확인(카드·카운트·시트).
- [x] C1c. 폰트/weight 조정 (사용자 지적). 폰트: 설교 검색 입력·placeholder를 13px로(globals `input::placeholder{14}`가 상속을 덮어 pseudo 명시 오버라이드). weight: 제목 외 bold 미사용 — 카운트·초기화·섹션 라벨·선택 pill·eyebrow를 semibold로, strong(숫자)만 black(`$home-text`). (사용자가 제목·메타도 추가로 낮춰 반영)
- [x] C1d. 검색 재설계 (사용자 지적: "디바운스 빼고 Enter로만, 너무 불안정"). 디바운스 자동 검색 제거 → `SermonSearchForm`은 Enter(submit)·clear로만 `q` 변경. 무한 루프 원인이던 push-on-type effect 자체가 사라짐(루프 근본 제거). 대신 외부 q→input 미러(`useEffect setInput(q)`)를 되살려 검색 칩·초기화가 입력창까지 비운다(디바운스 없으니 PR #95 되돌림 재발 없음). 브라우저 검증: 타이핑만 하면 URL 그대로, Enter 시 `?q=산상`.
- [x] C1e. 검색 결과 칩 + 검색·필터 분리 (사용자 지적). 칩: 목업 실측(warm sand `$home-tint` pill + brown `$primary` 텍스트 + 닫기 아이콘)대로 `SermonResultHeader`에 추가 — 클릭 시 `q` 해제해 전체 설교로 복귀(검색 후 되돌아가는 수단). 카운트 문구 "검색 결과 N편"으로. 분리: `useSermonFilter.activeFilterCount`에서 `q` 제외 → 검색해도 필터 badge 미활성. 브라우저 검증: 칩 클릭 시 URL 빈 값·입력창 빔·칩 사라짐, 검색 시 badge 없음.
- [x] C1f. 전체 설교 로딩 스켈레톤 제거 (사용자 지적). `all/loading.tsx`를 `null` 반환으로 — 파일 삭제 시 부모 `sermons/loading`(main 스켈레톤)이 대신 뜨므로 null로 둔다.
- [x] C1g. 필터 적용 칩 (사용자 지적: 목업이 적용 필터를 칩으로 표시). 검색 칩과 동일 스타일(`.filter_chip`)로 일반화. `all/page`가 시리즈 title·설교자 라벨을 해석해 `SermonResultHeader`에 넘기고, 칩 클릭 시 `setFilter({series|preacher: null})`로 해당 조건만 해제. 카운트는 검색·필터 걸리면 "검색 결과 N편". 브라우저 검증: 시리즈+설교자 동시 → 칩 2개(산상수훈·김성규 목사, warm pill), badge "2"(q 제외).
- [x] C1h. 설교 카드 컴포넌트 통합 (사용자 지적: /sermons와 /sermons/all 카드 색·크기 불일치). `/sermons/all`의 `GridCard`를 기준으로 통합 — `SermonRecentList`가 `SermonListCard` 대신 `GridCard` 사용, `SermonListCard` 삭제, `SermonRecentList.module.scss`는 카드 스타일 제거(레이아웃만). 타입: `SermonWithRelations`는 `SermonCardItem`에 구조적 할당 가능. 브라우저 검증: 홈 카드가 /sermons/all과 동일(scripture #9a826d·title #2a241d semibold·meta #70665a).
- [x] C2. 모든 시리즈 — 목업 정합: Hero 제거+헤더 '시리즈'(hero.config·navigation), 검색·필터 제거(사용자: 시리즈엔 불필요), 페이지는 헤더+전체 시리즈 그리드만. SeriesCard 유지. 정리: orphan된 필터 클러스터 7파일 삭제(SeriesFilterSidebar·Toolbar·ResultHeader·SearchForm·FilterButton·FilterBottomSheet + useSeriesFilter 훅) + `utils/sermon.ts`의 series-filter 블록(filterSeries·parseSeriesParams·buildSeriesHref·SERIES_* 등) 제거. knip: series orphan 0. 브라우저: 헤더 '시리즈'·Hero 없음·카드 유지 확인.
- [ ] C3. 설교 상세 — 3탭 축소 + serif 성경 카드 + 시리즈/에피소드 warm + 헤더

## 공통 (C1~C3 진입 시)

- `hero.config.ts` SELF_HERO_PATHS에 `/sermons/all`·`/sermons/series` 추가(상세는 GNB에 없어 이미 hero 없음 확인 필요)
- `navigation.ts` 헤더 타이틀: /sermons/all→'전체 설교', /sermons/series→'시리즈', /sermons/[id]→'설교 상세' (현재는 카테고리 '설교' 반환)

## Verification

- `yarn lint:styles`·`eslint` (dev 중 build 보류)
- 브라우저 실측(모바일) — 목업 대비

## Codex 계획 검증

- **결론**: 불필요 (뷰별 구현 후 Codex 1차로 대체)
- **현재 판단**: app-layer UI 리스타일, ADR_TRIGGER 없음. navigation/hero.config는 landing 검증된 패턴 확장. 뷰별 diff에 Codex 1차 검증.
- **다음 행동**: C1부터 구현

## Codex 1차 검증

- **결론**: 미요청
- **다음 행동**: 뷰별 diff 생성 후 갱신

## 의사결정 로그

- **warm 텍스트 팔레트 스코프를 설교로 확장**: 목업의 텍스트 색은 홈과 같은 warm 팔레트(`$home-text`/`$home-text-sub`/`$home-text-muted`)다. 새 토큰을 만들지 않고 `_home.scss`를 설교 컴포넌트에서 재사용하도록 스코프 주석을 넓혔다. 대안(전역 `$txt-primary`를 warm으로 재지정)은 admin·미리디자인 cool 페이지까지 번져 blast radius가 크므로 배제. news·community는 아직 cool globals 유지.

## Claude 2차 검증

- **최종 판단**: C1b(warm 색 정합) PASS. 브라우저 computed style로 카드(제목 #2a241d·eyebrow #9a826d·메타 #70665a)·카운트(#9a826d, 숫자 #2a241d)·필터 시트 pill이 목업 실측값과 hex 일치. `stylelint` 0 error(설교 SCSS 3종 warning 0, `_home.scss` warning 22건은 전부 기존 primitive hex 정의).
- **남은 차이**: 목업 제목/헤더 weight 800(extrabold)은 토큰 상한(700 bold) 밖이라 700 유지. 색·크기는 일치, weight만 한 단계 차이 — 필요 시 `$font-weight-extrabold` 토큰 추가로 후속.
- **다음 행동**: C2(시리즈)·C3(상세)도 같은 warm 팔레트로 진행

## 후속 작업

- 설교 노트 기능 제거 판단 — 탭만 빼면 SermonNoteEditor·useSermonBookmark 등 미사용. 컴포넌트 삭제 여부는 C3에서 결정(dead code 보고 후).
