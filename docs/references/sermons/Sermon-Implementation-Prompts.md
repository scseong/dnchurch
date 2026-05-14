# 소망교회 Sermon 섹션 — 단계별 구현 프롬프트

이 문서는 mockup (`ChurchSermonAll.jsx`)을 실제 코드베이스로 옮기기 위한 단계별 프롬프트 모음입니다. 각 프롬프트는 독립적으로 사용할 수 있고, **UI 구현 (Phase 1-5) → 비즈니스 로직 연결 (Phase 6-8)** 순서로 진행하도록 설계되었습니다.

## 전체 원칙

각 프롬프트를 사용하기 전에 다음을 항상 컨텍스트로 함께 제공:

1. **mockup 파일**: `ChurchSermonAll.jsx` 전체 또는 해당 함수
2. **프로젝트 컨벤션**:
   - 스타일링 도구 (예: SCSS modules / Tailwind / CSS-in-JS)
   - 라우팅 (예: React Router / Next.js App Router)
   - 데이터 페칭 (예: React Query / SWR / Supabase client)
   - 폴더 구조 (예: `pages/`, `components/`, `features/sermon/`)
3. **디자인 토큰** (기존 프로젝트의 색상·간격 변수)
4. **DB 스키마** (`sermons`, `sermon_series`, `sermon_resources`)

각 프롬프트 끝에는 검증 체크리스트가 있습니다. 다음 단계로 넘어가기 전에 확인하세요.

---

## Phase 0: 사전 준비

기존 시스템을 활용할 수 있는 부분을 먼저 확인하고, 부족한 기반만 채우는 단계입니다.

### 0-1: 기존 시스템 점검

```
프로젝트의 현재 상태를 점검해줘. 다음 항목들이 어디에 어떻게 정의되어 있는지 찾아서 정리해줘:

1. 디자인 토큰 (색상/간격/타이포그래피)
   - 특히 mockup의 C 객체에 있는 navy/beige/gold 계열, surface/border 등이
     기존 토큰과 어떻게 매핑되는지

2. 공통 컴포넌트 존재 여부
   - Breadcrumb
   - BottomSheet (모바일 시트)
   - Pagination
   - 캐러셀 (가로 스크롤 + 화살표 + 드래그)
   - Radio/Checkbox option (필터용)
   - 검색 입력 (clear 버튼 포함)
   - Filter Icon Button (active 카운트 뱃지)
   - Dropdown (정렬용)

3. 유틸리티
   - 날짜 포맷팅 (formatDate)
   - 파일 크기 포맷팅
   - 사용자/설교자 풀네임 헬퍼

각 항목별로 "있음 / 부분적 / 없음" + 파일 경로 + 보강이 필요한 부분을 표로 정리.
```

**검증**
- 어느 컴포넌트를 신규 생성하고, 어느 것을 재사용할지 결정됨
- 디자인 토큰 매핑 표 완성

---

### 0-2: 부족한 공통 컴포넌트 보강

```
이전 단계에서 "없음" 또는 "부분적"으로 분류된 공통 컴포넌트들을 만들어줘.
프로젝트 컨벤션 ([스타일링 도구], [폴더 구조])을 따라.

mockup 파일에서 참고할 구현:
- Carousel: ChurchSermonAll.jsx의 useCarousel 훅 + CarouselArrows 컴포넌트
- BottomSheet: FilterBottomSheet 함수 (구조만 참고, 컨텐츠는 제네릭하게)
- Pagination: Pagination 함수
- RadioOption: RadioOption 함수 (필터 라디오 - count 뱃지 포함)
- FilterOption: FilterOption 함수 (BottomSheet 내 선택 옵션)
- PCBreadcrumb: PCBreadcrumb 함수

요구사항:
- 각 컴포넌트는 presentational 하게 (data fetching X)
- props로 모든 상태/콜백 받기
- TypeScript 타입 정의
- Storybook 또는 mock 페이지로 단독 확인 가능하게

특히 캐러셀은 다음 조건:
- 가로 스크롤바 hidden
- PC: 좌우 버튼 + 마우스 드래그
- Mobile: 터치 스와이프 (브라우저 기본)
- 드래그 중 click 이벤트 차단 (의도치 않은 카드 클릭 방지)
- 스크롤 위치에 따라 좌우 버튼 disabled 처리
```

**검증**
- 각 컴포넌트가 단독으로 렌더 가능
- props 인터페이스 명확
- 모바일·데스크톱 양쪽에서 동작 확인

---

### 0-3: 데이터 타입 + Mock 데이터

```
DB 스키마 (sermons, sermon_series, sermon_resources)를 기반으로 TypeScript 타입을 정의해줘.
또한 mockup에서 SERIES_DATA, SERMONS_DATA, RESOURCES를 가져와서
mock data 모듈로 분리해줘 (Phase 1-5에서 UI 단독 작업 시 사용).

요구사항:
- 타입 파일: types/sermon.ts (Sermon, SermonSeries, SermonResource, Preacher)
- mock 파일: mocks/sermon.ts (개발/스토리북용)
- expanded sermon 헬퍼: Sermon에 series 객체를 join한 형태 (mockup의 expandSermon 참고)
- 유틸: formatDate, preacherFullName, getCoverGradient, formatFileSize
```

**검증**
- 타입이 DB 스키마와 일치
- Mock data로 UI 페이지가 렌더링 가능

---

### 0-4: 라우팅 구조 + 네비게이션

```
Sermon 섹션의 라우트를 추가해줘. 다음 5개 페이지:

1. /sermons (또는 /word/sermons) - 메인 (이번 주 설교 + 최근 + 시리즈)
2. /sermons/[slug] - 설교 상세
3. /sermons/all - 전체 설교 목록
4. /sermons/series - 모든 시리즈
5. /sermons/series/[slug] - 시리즈 상세

요구사항:
- breadcrumb은 모든 페이지에서 "홈 > 설교 > ..." 형식 (mockup의 buildBreadcrumb 참고)
- back navigation은 브라우저 history 사용 (또는 referrer 기반)
- 모바일 헤더는 페이지마다 다른 라벨 (mockup의 MLabel 참고)

이 단계에서는 각 페이지 컴포넌트는 빈 스켈레톤으로 두고, 라우팅이 동작하는 것만 확인.
```

**검증**
- 각 URL이 정상 동작
- Breadcrumb 클릭으로 상위로 이동 가능
- 모바일/PC 헤더가 페이지별로 다르게 표시

---

## Phase 1: 메인 페이지 UI

### 1-1: 이번 주 설교 (Featured)

```
메인 페이지의 "이번 주 설교" 섹션을 mockup의 ListPCFeatured + MListFeatured를 참고하여 구현해줘.
Mock data 사용.

구조:
- 섹션 헤더: "이번 주 설교" (h2)
- 카드: 좌측 영상 영역 (16:9, 580px), 우측 메타 영역
- 메타: 시리즈 라벨(있다면) · 날짜 · service_type → 제목 → 본문 말씀 → 요약(3줄) → 설교자

주의:
- 외부 라벨 박스 없이 카드 한 장 (mockup이 이전 디자인에서 정리됨)
- 영상 영역에는 play 버튼 + duration overlay
- 모바일은 영상이 위, 메타가 아래로 stack
- 시리즈 라벨은 gold 색, letterSpacing 강조
```

**검증**
- 시리즈 있는 설교와 없는 설교(단독) 둘 다 자연스럽게 표시
- 모바일에서 카드 폭이 화면에 맞춰짐

---

### 1-2: 최근 설교 캐러셀

```
최근 설교 캐러셀을 mockup의 ListPCRecent + MListRecent + SermonCarouselCard를 참고하여 구현해줘.

구조:
- 섹션 헤더: "최근 설교" + 우측에 [좌우 화살표 버튼] + [더 보기 →]
- 캐러셀: 가로 스크롤, 카드 width 240px (PC) / 210px (모바일), gap 12px
- 카드 내용 (vertical):
  - 썸네일 16:9 (play 버튼 + duration overlay)
  - 시리즈 라벨 또는 service_type (height 통일을 위해 항상 렌더)
  - 제목 (2줄, minHeight 2.8em)
  - 본문 말씀 (primary 색)
  - 메타 (border-top): 설교자 풀네임 · 날짜 (연.월.일)

주의:
- 모바일은 좌우 -16px margin으로 풀폭 스크롤 (좌측 padding은 유지)
- 시리즈 있으면 gold 색, 없으면 textTer 색 (스타일 구분)
- 데이터 8개 정도 (RECENT_SERMONS)
```

**검증**
- 단독 설교와 시리즈 설교의 카드 height가 동일
- 좌우 버튼이 스크롤 끝에 도달하면 비활성화
- 드래그 후 카드 클릭이 의도치 않게 발생하지 않음
- 모바일 좌측에서 풀폭으로 스크롤됨

---

### 1-3: 시리즈 캐러셀

```
"진행 중인 시리즈" 캐러셀을 mockup의 ListPCSeriesPreview + MListSeriesPreview + SeriesGridCard를 참고하여 구현해줘.

구조:
- 섹션 헤더: "진행 중인 시리즈" + 우측 좌우 화살표 + "모든 시리즈 →"
- 캐러셀: PC는 카드 폭이 calc((100% - 32px) / 3) 으로 정확히 3개 표시. 모바일은 260px 고정 (1.3개 정도 보임)
- 카드 내용:
  - 커버 이미지 16:9 + 우상단 "ON-GOING/COMPLETED" 배지
  - 제목
  - 설교자
  - 설명 (2줄 클램프)
  - 메타 (border-top): `2026.01.12 ~ 진행 중 · 8편` (진행 중은 primary 색, 완료는 textSec)

주의:
- 진행 바 없음 (텍스트만)
- 모바일 풀폭 스크롤 동일 패턴
- 카드 height는 cover_tone에 따른 gradient 사용
```

**검증**
- 진행 중 시리즈 3개와 완료 시리즈가 같은 카드로 일관되게 표시
- 캐러셀 화살표 동작 정상

---

### 1-4: 메인 페이지 통합

```
1-1, 1-2, 1-3 컴포넌트를 메인 페이지에 배치해줘. mockup의 ListPCBody + MListBody 참고.

레이아웃:
- 페이지 max-width 1280px, 좌우 padding 56px
- 섹션 간 marginBottom 40-44px
- 모바일은 padding 16px

순서:
1. 이번 주 설교
2. 최근 설교 캐러셀
3. 진행 중인 시리즈 캐러셀

또한 페이지 진입 시 PCHero (배너) 또는 모바일 배너 표시 (mockup의 ListPCHero / MListBanner).
```

**검증**
- 데스크톱과 모바일 모두 자연스러운 흐름
- 캐러셀의 좌우 풀폭 처리가 페이지 padding과 충돌하지 않음

---

## Phase 2: 설교 상세 페이지 UI

### 2-1: 영상 + 메타 영역

```
설교 상세 페이지의 좌측 메인 컨텐츠 영역을 구현해줘. mockup의 DetailPCBody와 SermonMeta 참고.

구조:
- 영상 영역 (16:9, max 800px)
  - 썸네일 + play 버튼 (클릭 시 YouTube iframe으로 교체, autoplay=1)
- 메타 영역
  - 시리즈 라벨 (있다면): "시리즈명 · 회차" + 시리즈 페이지 링크
  - 제목 (h1)
  - 본문 말씀 (primary 색, bold)
  - 컴팩트 메타: 날짜 · service_type · duration · 설교자 (한 줄)
- 본문 (scripture_text 인용 박스)
- 요약 (summary, paragraphs)
- 첨부 자료 섹션 (resources): 파일 타입 아이콘 + 제목 + 크기 + 다운로드 버튼

주의:
- 모바일은 영상 위, 메타/본문/요약이 아래로 stack
- 메타가 너무 길어지지 않도록 compact 처리 (mockup의 SermonMeta compact prop 참고)
```

**검증**
- 시리즈 없는 설교와 있는 설교 둘 다 자연스러움
- YouTube 재생 동작

---

### 2-2: 시리즈 사이드바

```
설교 상세 페이지 우측 사이드바를 구현해줘. mockup의 SeriesSidebar 참고.

조건: 설교가 시리즈에 속한 경우에만 표시.

구조:
- 시리즈 카드 (toneSoft 배경):
  - "SERIES" 라벨 (gold)
  - 시리즈 제목
  - 설명
  - border-top: `2026.01.12 ~ 진행 중 · 8편` 텍스트
- 회차 목록 카드:
  - 헤더: "전체 회차 (N편)"
  - 각 회차 row: 번호 (01, 02...) · 제목 · 날짜 · duration
  - 현재 보고 있는 회차는 highlight + play 아이콘
  - 최대 height 480px, overflow auto

주의:
- placeholder 회차 ("곧 공개됩니다") 표시하지 않음
- 진행 바 없음
- 현재 회차 클릭은 disable (자기 자신)
```

**검증**
- 현재 회차가 시각적으로 강조
- 다른 회차 클릭 시 해당 설교로 이동

---

### 2-3: 같은 설교자의 다른 설교 (Optional)

```
설교 상세 페이지 하단에 같은 설교자의 다른 설교 3개를 보여주는 섹션을 추가해줘.
mockup의 OtherSermons 참고.

구조:
- 섹션 헤더: "{설교자 풀네임}의 다른 설교"
- 가로 row 3개: 작은 썸네일 + 제목 + 날짜
- 현재 설교는 제외

조건: 같은 설교자의 다른 설교가 3개 이상 있을 때만 표시.
```

**검증**
- 시리즈 사이드바가 없는 단독 설교에서도 자연스럽게 표시
- 모바일에서는 별도 섹션으로 표시

---

### 2-4: 모바일 상세 페이지

```
모바일 설교 상세를 구현해줘. mockup의 MDetailBody 참고.

데스크톱과의 차이:
- 사이드바 → 본문 아래 섹션으로 (시리즈 회차 목록 + 같은 설교자 설교)
- 영상 영역 풀폭
- 메타 압축 (작은 폰트, 한 줄)
- 첨부 자료 카드도 풀폭

순서:
1. 영상
2. 시리즈 라벨 + 제목 + 본문 말씀
3. 컴팩트 메타
4. scripture_text 인용
5. summary
6. 첨부 자료
7. 시리즈 회차 목록 (시리즈 있을 때)
8. 같은 설교자의 다른 설교
```

**검증**
- 화면 좁아도 깨지지 않음
- 회차 목록의 스크롤이 페이지 전체 스크롤과 충돌하지 않음

---

## Phase 3: 전체 설교 페이지 UI

### 3-1: 사이드바 (검색 + 필터)

```
전체 설교 페이지의 좌측 사이드바를 구현해줘. mockup의 PCFilterSidebar 참고.

구조:
- 폭 240px, 상단 sticky
- 헤더: "필터" + (활성 필터 있을 때) "초기화" 링크
- 검색 (최상단):
  - 검색 아이콘 + input + clear 버튼
  - placeholder: "제목·본문·설교자"
- 시리즈 섹션:
  - 라벨 "시리즈"
  - RadioOption 리스트 (전체 / 시리즈명들...) + 각 옵션 우측에 count
- 설교자 섹션:
  - 라벨 "설교자"
  - RadioOption 리스트

주의:
- count는 props로 받기 (다른 필터 적용 후의 count)
- 활성 옵션은 primaryLight 배경 + primary 텍스트
```

**검증**
- 라디오 형태 (단일 선택)
- 사이드바 sticky 동작

---

### 3-2: 시리즈 메타 카드 (필터 활성 시)

```
시리즈 필터를 선택한 경우 결과 영역 상단에 시리즈 메타 카드를 표시해줘.
mockup의 SeriesMetaCard 참고.

구조:
- 배경 toneSoft, border, padding 14px 18px
- 좌측 영역 (flex: 1):
  - 라벨 "SERIES · ON-GOING/COMPLETED"
  - 시리즈 제목
  - 설명 (1줄 클램프)
  - 메타: 설교자 · 기간 · N편
- 우측: "시리즈 상세 →" 미니 텍스트 버튼 (배경 없음, primary 색, chevron)

주의:
- 썸네일 없음
- CTA는 작은 텍스트 링크 형태 (배경 있는 큰 버튼 아님)
- 모바일에도 동일하게 표시 (전체 설교 모바일 + 모든 시리즈 모바일)
```

**검증**
- 시리즈 필터 선택/해제 시 자연스럽게 표시/숨김
- CTA 클릭 시 시리즈 상세로 이동

---

### 3-3: 검색 결과 피드백

```
검색어가 있을 때 결과 영역 상단에 검색 피드백을 표시해줘.

PC 구조 (시리즈 메타 카드 위):
- 배경 bg, border, padding 12px 16px, borderRadius 8
- 검색 아이콘 + `"검색어" 검색 결과 · N개`
- 우측: "검색어 지우기" 미니 텍스트 버튼

모바일 구조 (Search 영역 아래):
- 동일한 패턴이지만 더 컴팩트 (padding 10px 12px)
- 텍스트가 길면 ellipsis

주의:
- 검색어가 없을 때는 표시하지 않음
- "지우기" 클릭 시 검색어 클리어
- 결과 헤더의 "총 N개"도 검색 활성 시 "결과 N개"로 변경
```

**검증**
- 검색어 입력/지우기 동작
- 결과 0개일 때도 메시지가 자연스러움

---

### 3-4: 결과 헤더 + 정렬 드롭다운

```
사이드바 우측 컨텐츠 영역의 상단에 결과 헤더를 만들어줘.

구조 (가로 flex):
- 좌: "총 N개 설교" (검색 시 "결과 N개") + 페이지네이션 정보
- 우: 정렬 드롭다운 (최신순/오래된순) - mockup의 PCSortDropdown 참고

스타일:
- borderBottom으로 컨텐츠 영역 시작 구분
- fontSize 13
- 모바일은 더 컴팩트 (fontSize 11.5, 정렬은 텍스트만 표시 → 클릭 시 BottomSheet로 변경)
```

**검증**
- 드롭다운 외부 클릭 시 닫힘
- 페이지 변경 시 페이지 정보 업데이트

---

### 3-5: 결과 그리드 + 페이지네이션

```
결과 영역에 설교 카드 그리드를 만들어줘. mockup의 SermonGridCard + Pagination 참고.

구조:
- 그리드: 2열 (PC), 1열 (모바일)
- 카드 (horizontal): 좌측 썸네일 130px + 우측 메타
  - 시리즈 라벨 (있을 때)
  - 제목 (2줄)
  - 본문 말씀
  - 컴팩트 메타: 날짜 · duration · 설교자
- 페이지당 8개 (PC) / 6개 (모바일)
- 페이지네이션: 숫자 버튼 + 좌우 화살표 (PC) / "더 보기" 버튼 (모바일)

빈 상태:
- "검색 결과가 없습니다." + 다른 키워드 시도 메시지
```

**검증**
- 페이지 변경 시 스크롤이 결과 영역 상단으로 이동 (옵션)
- 모바일은 "더 보기"로 누적 표시

---

### 3-6: 모바일 (Search + Filter icon + BottomSheet)

```
모바일 전체 설교 페이지를 구현해줘. mockup의 AllSermonsMPage + FilterBottomSheet 참고.

레이아웃:
1. Hero (다크 배경, "전체 설교" 타이틀)
2. Search input (pill 모양) + 우측 Filter Icon (원형 44x44, active 카운트 뱃지)
3. 검색 결과 피드백 (조건부)
4. 시리즈 메타 카드 (조건부, 시리즈 필터 활성 시)
5. 결과 헤더
6. 결과 카드 리스트 (1열)
7. "더 보기" 버튼

BottomSheet (Filter icon 클릭 시):
- 드래그 핸들 (탑)
- 헤더: "필터" + 초기화 링크
- 섹션: 시리즈 / 설교자 / 정렬 (각 섹션 라벨 + FilterOption 리스트)
- 하단 sticky: "결과 보기" 버튼 (primary)
- 활성 필터 카운트는 Filter Icon에 뱃지로 표시

주의:
- BottomSheet는 transform translateY로 슬라이드
- 오버레이 클릭 시 닫힘
```

**검증**
- BottomSheet 슬라이드 애니메이션 부드러움
- 필터 적용 후 닫혔을 때 결과 즉시 반영
- 뱃지 카운트가 정확

---

## Phase 4: 모든 시리즈 페이지 UI

### 4-1: PC - 사이드바 + 그리드

```
모든 시리즈 페이지 PC 버전을 구현해줘. mockup의 AllSeriesPCPage + PCSeriesFilterSidebar 참고.

레이아웃 (전체 설교와 동일 구조):
- Hero
- 240px 사이드바 + 결과 영역

사이드바 섹션:
1. 상태 (전체 / 진행 중 / 완료)
2. 설교자
3. 연도 (시리즈의 started_at ~ ended_at 범위로 자동 계산)

연도 옵션 계산:
- 모든 시리즈의 시작 연도부터 종료 연도까지 (진행 중이면 현재 연도까지)
- 내림차순 정렬
- count: 해당 연도가 시리즈 기간에 겹치는 시리즈 수

결과 영역:
- 헤더: "총 N개 시리즈"
- 그리드 3열, gap 18px
- 각 카드는 1-3에서 만든 SeriesGridCard 재사용
```

**검증**
- 연도 필터가 시리즈 기간 overlap으로 동작
- 사이드바 sticky 동작

---

### 4-2: 모바일 - Search + Filter + BottomSheet

```
모든 시리즈 페이지 모바일을 구현해줘. mockup의 AllSeriesMPage + SeriesFilterBottomSheet 참고.

레이아웃 (전체 설교 모바일과 동일 패턴):
1. Hero
2. Search input + Filter Icon
3. 검색 결과 피드백 (조건부)
4. 결과 헤더
5. 시리즈 카드 리스트 (1열, gap 12px)

BottomSheet 섹션:
- 상태
- 설교자
- 연도

검색 대상: 시리즈 제목 + 설명 + 설교자
```

**검증**
- 전체 설교 모바일과 일관된 UX
- 시리즈 카드가 모바일에서도 잘 보임

---

## Phase 5: 시리즈 상세 페이지 UI

### 5-1: 헤로 영역

```
시리즈 상세 페이지의 헤로를 구현해줘. mockup의 SeriesDetailPCPage 헤로 부분 참고.

구조:
- 배경: 시리즈 cover_tone에 따른 gradient + 어두운 오버레이 (rgba(0,0,0,.25))
- 라벨: "SERIES · ON-GOING/COMPLETED" (gold)
- 제목 (h1, 36px PC / 22px 모바일)
- 설명 (15px, max-width 720px)
- border-top 메타: 설교자 · 기간 · N편

주의:
- 진행 바 없음 (텍스트만)
- 배경이 어두우니 텍스트 색은 white 계열
- 모바일은 더 컴팩트 (padding 28px 20px)
```

**검증**
- cover_tone 별로 그라데이션이 다르게 표시 (warm/cool/earth)
- 진행 중 / 완료 시리즈 모두 자연스럽게

---

### 5-2: 회차 그리드

```
헤로 아래 회차 목록을 그리드로 표시해줘. mockup의 SeriesEpisodeCard + 2열 그리드 참고.

구조:
- 섹션 헤더: "회차 목록" + 우측 "총 N편"
- 그리드 2열 (PC), 1열 (모바일), gap 12px
- 카드 (horizontal): 번호(01, 02...) + 썸네일 + 메타 (제목 / 본문 말씀 / 날짜)

주의:
- placeholder 회차 표시하지 않음
- 카드 클릭 시 설교 상세로 이동
```

**검증**
- 회차 순서대로 정렬 (series_order)
- 카드 호버 인터랙션 자연스러움

---

## Phase 6: 비즈니스 로직 - 데이터 페칭

UI가 mock data로 완성된 후, 실제 데이터 연결로 들어갑니다.

### 6-1: API/Query 레이어

```
sermon 도메인의 데이터 페칭 함수를 만들어줘. 프로젝트의 [Supabase / REST / GraphQL] 컨벤션을 따라.

함수 목록:
1. getFeaturedSermon() - is_featured=true인 가장 최근 published 설교 (with series join)
2. getRecentSermons(limit) - is_featured=false, published, 최신순 (with series join)
3. getActiveSeries() - is_active=true, sort_order 순
4. getSermon(slug) - 단일 설교 (with series + resources join, preacher info)
5. getOtherSermonsByPreacher(preacherId, excludeSermonId, limit) - 같은 설교자
6. getSermonsBySeriesId(seriesId) - 시리즈의 모든 회차
7. searchSermons({ query, seriesId, preacherId, sort, page, pageSize }) - 페이지네이션 포함
8. getAllSeries({ status, preacher, year, query }) - 시리즈 검색/필터
9. getSeries(slug) - 단일 시리즈
10. getPreachers() - 설교자 목록 (필터용)

각 함수는 TypeScript 타입을 가지고, 에러 처리를 포함.
페이지네이션 함수는 { items, total } 형태로 리턴.
```

**검증**
- 각 함수가 단위 테스트 또는 콘솔에서 정상 동작
- DB query가 N+1 문제 없이 join 활용

---

### 6-2: 페이지 데이터 연결 + 로딩/에러 UI

```
Phase 1-5에서 mock data로 만든 페이지들을 실제 데이터로 연결해줘.
[React Query / SWR] 컨벤션을 따라.

각 페이지마다:
1. 데이터 hook 호출
2. 로딩 상태: 스켈레톤 또는 spinner (프로젝트 컨벤션 따라)
3. 에러 상태: 에러 메시지 + 재시도 버튼
4. 빈 상태: 적절한 empty state

페이지별 hook 매핑:
- 메인: useFeaturedSermon, useRecentSermons, useActiveSeries (병렬)
- 설교 상세: useSermon(slug), useOtherSermonsByPreacher
- 전체 설교: useSearchSermons (filters)
- 모든 시리즈: useAllSeries (filters)
- 시리즈 상세: useSeries(slug), useSermonsBySeriesId

데이터 캐싱:
- 시리즈, 설교자 목록은 staleTime 길게
- 검색 결과는 짧게 (또는 자동 무효화)
```

**검증**
- 페이지 진입 시 로딩 → 데이터 표시 흐름 자연스러움
- 에러 발생 시 적절한 메시지

---

## Phase 7: 비즈니스 로직 - 상태/인터랙션

### 7-1: URL 쿼리 동기화

```
전체 설교 페이지와 모든 시리즈 페이지의 필터/검색/페이지 상태를 URL 쿼리로 동기화해줘.

쿼리 파라미터:
- 전체 설교: ?q=검색어&series=시리즈명&preacher=설교자명&sort=최신순&page=1
- 모든 시리즈: ?q=검색어&status=진행+중&preacher=설교자명&year=2026

요구사항:
- 페이지 진입 시 URL → 상태 초기화
- 상태 변경 시 URL 업데이트 (브라우저 뒤로가기 동작 지원)
- 페이지 새로고침 후에도 동일한 결과 유지
- 검색은 디바운스 (300ms) 후 URL 업데이트

[Next.js / React Router] 컨벤션 따라.
```

**검증**
- URL 복사 → 새 탭에서 같은 결과
- 뒤로가기로 이전 필터 복원

---

### 7-2: 영상 재생 (YouTube)

```
설교 상세 페이지의 영상 재생을 구현해줘.

요구사항:
- 초기에는 썸네일 + play 버튼 표시
- play 클릭 시 YouTube iframe으로 교체 (autoplay=1)
- 영상 종료 후 다음 회차 추천 (옵션)
- 모바일에서도 동일하게 동작

video_provider가 youtube일 때만 iframe.
다른 provider (vimeo 등)는 분기 처리.
```

**검증**
- 첫 클릭 시 autoplay 동작
- 페이지 이동 시 iframe 정리 (메모리 누수 방지)

---

### 7-3: 첨부 자료 다운로드

```
설교 상세의 첨부 자료 카드에서 다운로드 동작을 구현해줘.

요구사항:
- 파일 타입별 아이콘 (pdf, doc, image, audio)
- 파일 크기 표시
- 다운로드 버튼 클릭 시 file_url로 이동 (새 탭)
- 다운로드 카운트 추적 (옵션, 분석용)
```

**검증**
- 다양한 파일 타입이 정상 표시
- 파일이 없을 때 섹션 자체가 숨김

---

### 7-4: 캐러셀 인터랙션 다듬기

```
캐러셀의 사용자 경험을 다듬어줘.

요구사항:
- 키보드 접근성: 좌우 화살표 키로 스크롤
- 화살표 버튼에 aria-label
- 카드는 keyboard로 탭 가능 (focus 스타일 포함)
- 드래그 중에는 cursor: grabbing
- 스크롤 끝에 도달하면 버튼 disabled (이미 구현됨, 확인)
- 모바일 momentum 스크롤 자연스럽게
```

**검증**
- 스크린 리더로 컨텐츠 접근 가능
- 키보드만으로 탐색 가능

---

## Phase 8: 추가 기능 / 마무리

### 8-1: SEO + Open Graph

```
각 페이지의 메타 태그를 설정해줘.

- 설교 상세: 제목, 본문 말씀, 요약 일부를 OG로
- 시리즈 상세: 시리즈 제목, 설명
- 메인/목록 페이지: 일반 페이지 메타
- 정규 URL (canonical)
- 트위터 카드

[Next.js metadata / react-helmet] 컨벤션 따라.
```

---

### 8-2: 공유 기능 (Optional)

```
설교 상세 페이지에 공유 버튼을 추가해줘.

- URL 복사
- 카카오톡 (Kakao SDK 있는 경우)
- 페이스북
- 이메일 (mailto)

UI는 작은 아이콘 버튼 그룹으로 메타 영역 근처에 배치.
```

---

### 8-3: 접근성 점검

```
Sermon 섹션 전체의 접근성을 점검해줘.

체크리스트:
- 모든 인터랙티브 요소에 aria-label / aria-describedby
- 헤딩 계층 (h1 > h2 > h3) 올바름
- 색상 대비 (WCAG AA 이상)
- 키보드만으로 모든 기능 접근 가능
- focus 표시 명확
- skip-to-content 링크
- 스크린 리더 테스트 (NVDA / VoiceOver)
- 모바일 터치 타겟 최소 44x44px
```

---

### 8-4: 성능 점검

```
다음 항목을 점검하고 개선해줘.

- 이미지 lazy loading
- 첫 화면에 필요한 데이터만 SSR (해당 시)
- 무한 스크롤 또는 페이지네이션 (전체 설교)
- 캐러셀 카드의 이미지 priority
- Bundle size 분석 (어떤 라이브러리가 큰지)
- Lighthouse 점수 (Performance, Accessibility, Best Practices, SEO)
```

---

## 부록: 트러블슈팅 가이드

### 캐러셀 관련

- **카드 클릭이 드래그 직후에도 발생함**: useCarousel의 clickGuard가 onClickCapture로 등록되어야 함. dragMoved 임계값 (3-5px) 조정.
- **모바일에서 가로 스크롤이 페이지 전체 스크롤과 충돌**: 캐러셀 컨테이너에 `touch-action: pan-x` 또는 React onTouchMove 처리.
- **화살표가 깜빡임**: scroll 이벤트가 너무 자주 발생할 때. throttle 또는 IntersectionObserver 검토.

### 필터/검색 관련

- **검색어 입력 시 즉시 쿼리 발생**: 디바운스 (300ms 권장).
- **필터 카운트가 부정확**: count는 다른 필터를 모두 적용한 후의 데이터에서 계산 (mockup의 baseFiltered 패턴 참고).
- **시리즈 메타 카드와 검색 피드백이 같이 표시되는 경우 순서**: 검색 피드백 → 시리즈 메타 → 결과 헤더 (mockup 순서 따라).

### BottomSheet 관련

- **iOS에서 배경 스크롤됨**: body에 `overflow: hidden` 또는 `position: fixed` 적용 (시트 열렸을 때).
- **시트 안의 스크롤 안 됨**: 시트 내부에 별도 overflow auto 영역 + 외부 컨테이너는 height 고정.

---

## 작업 진행 체크리스트

각 단계 완료 후 체크.

### Phase 0: 사전 준비
- [ ] 0-1: 기존 시스템 점검 완료
- [ ] 0-2: 공통 컴포넌트 보강
- [ ] 0-3: 데이터 타입 + Mock 데이터
- [ ] 0-4: 라우팅 구조

### Phase 1-5: UI 구현
- [ ] Phase 1: 메인 페이지 (Featured + Recent 캐러셀 + 시리즈 캐러셀)
- [ ] Phase 2: 설교 상세 (영상 + 시리즈 사이드바 + 다른 설교)
- [ ] Phase 3: 전체 설교 (사이드바 + 검색 피드백 + 시리즈 메타 + 그리드)
- [ ] Phase 4: 모든 시리즈 (사이드바 + 그리드, 모바일 BottomSheet)
- [ ] Phase 5: 시리즈 상세 (헤로 + 회차 그리드)

### Phase 6-8: 비즈니스 로직 / 마무리
- [ ] Phase 6: 데이터 페칭 + 로딩/에러 UI
- [ ] Phase 7: URL 동기화 + 영상 재생 + 첨부 + 캐러셀 인터랙션
- [ ] Phase 8: SEO + 공유 + 접근성 + 성능
