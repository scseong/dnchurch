# gallery-feed

- **상태**: ✅ 완료 (2026-07-05)
- **시작일**: 2026-07-05
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — app 라우트·컴포넌트·mock 데이터만 추가. apis/services/actions/lib/supabase·config·package.json 무변경.

## 목표

`/news/gallery`의 ComingSoon 플레이스홀더를, 목업(`docs/references/gallery`)의 참여형 갤러리 피드를 **읽기 전용 + mock 데이터**로 구현한 화면으로 교체한다. 헤더·형제 탭·바텀 내비는 기존 사이트 크롬(MobileHeader + SectionTabNav + BottomNav)이 이미 처리하므로 **피드 본문만** 만든다.

## 검증된 Assumptions

- 갤러리 DB 스키마는 dev에 **없다** — `list_tables`(public) + 전 스키마 SQL 스캔(`post|photo|categor|reaction|comment|report|member` 정규식) 0건. 따라서 이번 작업은 mock 데이터로 진행(사용자 결정: "UI부터, 스키마 연동은 후속").
- `/news/gallery`는 이미 형제 탭·헤더에 배선돼 있다 — `src/config/navigation.ts`의 `NEWS_TABS`·`isNewsListPath`·`resolveMobileHeader`에 `/news/gallery` 포함(코드 확인). 라우팅·탭 변경이 필요 없다.
- 현재 페이지는 `<ComingSoon title="갤러리" />` 뿐 — `src/app/(content)/news/gallery/page.tsx` 확인.
- 목업 카드 구조·색·간격은 렌더링으로 추출했다(번들 HTML → 인라인 스타일). 색은 전부 warm(cream/brown/gold)이라 `$home-*` + `$accent`로 매핑할 수 있다.
- `react-photoswipe-gallery`·`photoswipe`는 이미 의존성에 있고 `src/components/common/PhotoSwipe.tsx`가 Cloudinary 로더와 함께 쓴다 — 라이트박스 신규 라이브러리가 필요 없다.

## Non-goals (이번 범위 밖 — surgical scope)

- **쓰기 동작 전부**: 글 작성·사진 업로드·반응 토글·댓글 작성. 컴포저 바("은혜의 순간을 나눠보세요")는 사용자 요청으로 **표시용 UI만 넣는다**(비인터랙티브 — 실제 작성 흐름은 후속).
- **카테고리 필터 UI**: 목업에 없어 사용자 요청으로 뺀다(칩 바·개수 줄 제거). 카테고리는 데이터에 남기고, 필터 트리거는 후속(목업의 검색·카테고리 탭 방식).
- 게시글 상세 라우트·전체 댓글 스레드·대댓글. 카드의 "댓글 N개 모두 보기"는 정적 텍스트(비링크).
- 신고/모더레이션, 조회수, 무한 스크롤(mock은 유한), 실제 인증/RLS, DB·타입·서비스 배선.
- `navigation.ts`·`apis/services/actions`·config 변경. 기존 bulletins/notices 코드 수정.

## Success Criteria

- [x] `/news/gallery` 접속 시 ComingSoon 대신 피드가 뜬다(카드 6개, 서로 다른 카테고리·사진 수).
- [x] 피드 상단에 컴포저 바("나" 아바타 + "은혜의 순간을 나눠보세요" + 카메라 버튼)가 목업대로 표시된다(비인터랙티브). 칩 필터·개수 줄은 없다.
- [x] 각 카드에 아바타(이니셜)·이름·부서·상대시각·사진(1장 4/3, 2장 2열, 3장 3열, 4장 2×2 + 개수 배지)·본문·반응 pill 4종(카운트)·댓글 수 + 대표 댓글 미리보기가 목업대로 나온다.
- [x] 사진 탭 시 PhotoSwipe 라이트박스가 열린다("2/4" 카운터 실측).
- [x] 모바일(530px 실측)에서 목업과 일치하고, 데스크톱에서 `MainContainer` 중앙 단일 컬럼(max 62rem)으로 어울린다.
- [x] 스타일 값은 전부 토큰(`$home-*`·semantic). 하드코딩 색/간격 0, primitive 직접 사용 0. className snake_case, 2개+는 clsx.
- [x] `node scripts/verify-task.mjs gallery-feed` 통과(lint·stylelint·build ✅, knip 신규 0).

## 접근법 (컴포넌트 맵)

- `page.tsx` (server): mock 게시글 전체를 `<MainContainer title="갤러리">` + blind h1 + `.wrap`(GalleryComposer + GalleryFeed)로 렌더한다. searchParams·필터 없음.
- `_component/GalleryComposer.tsx`: 작성 입력 바("나" 아바타 + 안내 문구 + 카메라 버튼). 표시용 div/span, 핸들러 없음.
- `_component/GalleryFeed.tsx`: posts.map → GalleryPostCard. 빈 배열이면 "조건에 맞는 순간이 없어요".
- `_component/GalleryPostCard.tsx`: 헤더(아바타·이름·부서·시각)·GalleryPhotos·본문·반응 pill(정적)·댓글 footer + 대표 댓글.
- `_component/GalleryPhotos.tsx` (client): 사진 수별 그리드(1장 4/3, 2장 2열, 3장 3열, 4장 2×2) + 개수 배지, `react-photoswipe-gallery`의 Gallery/Item으로 라이트박스. `CloudinaryImage` + 로더 사용.
- `_component/Avatar.tsx`: 이니셜 + 배경색 아바타(데이터의 avatarColor를 inline으로 적용).
- `_data/posts.ts`: `GalleryPost[]` mock. `_types.ts`: 읽기용 축약 타입(GalleryPost·GalleryPhoto·GalleryComment·GalleryCategory·ReactionType).
- `gallery.module.scss`: 컴포넌트 전체를 상위 1개로 통합(`feedback_consolidate_module_scss`) — 컴포저/카드/pill 스타일. `$home-*`·`$accent`·semantic 토큰.

## 의사결정 로그

- **D1 — mock 사진은 Cloudinary `image/fetch`(원격 스톡 URL)로, 실패 시 그라디언트 플레이스홀더로 폴백**
  - 문제: 라이트박스가 의미 있으려면 실제 이미지 URL이 필요한데, 갤러리 자산이 교회 Cloudinary에 없다. 로컬 `/public` 이미지는 "이미지는 항상 Cloudinary URL + 로더" 관례에 어긋난다.
  - 해결: `cloudinaryFetchUrl('https://<stock>')`로 몇 장을 fetch 전송해 `CloudinaryImage`/로더 관례를 지키며 실사진을 띄운다. WORK 초반에 fetch 전송이 열려 있는지 1장으로 확인하고, 막혀 있으면 warm 그라디언트 타일로 폴백(그때 라이트박스는 실데이터 도입 시로 이관). mock/UI 단계 자산이라 외부 스톡 사용 위험은 낮음.
  - 결과: 목업 그대로의 사진 피드 + 동작하는 라이트박스. 관례 위반 없음.
- **D2 — 컴포저 바·반응·댓글은 표시용(비인터랙티브)으로 둔다**
  - 문제: 목업은 참여형(컴포저·반응 토글·댓글 작성)이지만 phase 1은 읽기 전용. 인터랙션 입구를 살아있게 두면 "되는 척"이 된다.
  - 해결: 처음엔 컴포저를 생략하려 했으나(⚠️ 정정: 사용자 요청 "입력 바도 UI로 넣어둬"로 폐기), 목업 충실도를 위해 컴포저 바를 표시용으로 넣되 비인터랙티브(div/span, 핸들러 없음)로 둔다. 반응 pill·댓글 수·대표 댓글도 같은 방식. 실제 동작은 사진 라이트박스만.
  - 결과: 목업 상단 외형을 그대로 재현하면서 쓰기 동작은 후속으로 분리.
- **D3 — 카테고리 칩 필터·개수 줄 제거(목업에 없음)**
  - 문제: 초기 구현은 notices 패턴을 빌려 카테고리 칩 바 + "전체 순간 N개" 개수 줄을 넣었는데, 사용자가 "filter는 목업에 없다"·"개수 표시 마"라고 지적. 목업 기본 화면은 컴포저 + 피드뿐이다.
  - 해결: `GalleryFilterBar`를 삭제하고 `page.tsx`의 `?category=` 필터·`notFound` 검증도 제거. 카테고리는 데이터·타입에 남겨 스키마 충실도를 지키고, 필터 트리거는 목업 방식(검색·카테고리 탭)으로 후속 처리. `GALLERY_CATEGORIES`는 export를 떼 knip 신규 경고를 막음.
  - 결과: 기본 화면이 목업과 정확히 일치(칩·개수 없음). 필터 기능은 데이터를 남긴 채 후속으로 미룸.

## 영향받는 파일

- `src/app/(content)/news/gallery/page.tsx` (수정: ComingSoon → 컴포저 + 피드)
- `src/app/(content)/news/gallery/page.module.scss` (신규: blind h1 + wrap)
- `src/app/(content)/news/gallery/_component/{GalleryComposer,GalleryFeed,GalleryPostCard,GalleryPhotos,Avatar}.tsx` (신규)
- `src/app/(content)/news/gallery/_component/gallery.module.scss` (신규, 통합 1개)
- `src/app/(content)/news/gallery/_data/posts.ts`, `_types.ts` (신규 mock·타입)

## 단계별 체크리스트

- [x] 1. `_types.ts` + `_data/posts.ts` mock 작성(카테고리·사진 수·반응·댓글 다양화). D1 이미지 소스 fetch 200 확인(12개 중 11개, 404 1개 제외).
- [x] 2. `GalleryPhotos` — 그리드(1/2/3/4)+배지+PhotoSwipe 라이트박스. 라이브 실측: 라이트박스 "2/4" 카운터·prev/next·close 동작.
- [x] 3. `Avatar` + `GalleryPostCard`(헤더·본문·반응·댓글).
- [x] 4. `GalleryComposer` + `GalleryFeed` + 빈 상태.
- [x] 5. `page.tsx` 교체(컴포저 + 피드 + MainContainer). 스타일 통합 module.scss 1개.
- [x] 6. 데스크톱·모바일(530px) 실측: 컴포저 · 1/2/3/4장 그리드 · 반응 pill(active tint) · 댓글 미리보기 · 라이트박스 모두 목업대로. 모바일 크롬은 기존 공용(MobileHeader·SectionTabNav·BottomNav)이 /news/gallery를 처리(navigation.ts `isNewsListPath`).

## 브라우저 실측 결과 (dev live)

- 데스크톱·모바일(530px)에서 컴포저 바 → 피드 순서로 목업과 일치했다. 칩 필터·개수 줄은 없다.
- 카드·사진 그리드(1/2/3/4장)·반응 pill·댓글 미리보기·PhotoSwipe 라이트박스("2/4")가 모두 동작했다. `?category=봉사`로 서버 필터를 먼저 확인한 뒤 D3로 필터 UI를 걷어냈다.
- mock 스톡 사진 일부(다음세대 DJ 데크)가 캡션과 덜 어울린다 — 후속 큐레이션 후보. placeholder라 차단 아님(사용자 "이미지는 그대로 둬도 돼").

## Verification

- `node scripts/verify-task.mjs gallery-feed`
- 브라우저 실측: `/news/gallery` 모바일·데스크톱 뷰포트, 카테고리 필터, 라이트박스.

---

## Codex 계획 검증

- **결론**: PASS (Codex 미실행 — Claude 대체 검증)
- **현재 판단**: app 라우트·컴포넌트·mock 데이터만 손대고 DB·services·actions·config를 안 건드리는 저위험 작업이라 사용자가 "바로 진행해"로 Codex 계획 검증 생략을 승인했다. Claude가 5체크(가정·비목표·범위·성공 기준·과한 추상화 없음)를 직접 확인했고, 창발적 추가·레이어 위반·정책 변경이 없음을 확인했다. Windows Codex CLI 불안정은 [[project_codex_windows_unavailable]] 참조.
- **다음 행동**: 없음.

## Codex 1차 검증

- **결론**: PASS (Codex 미실행 — Claude 대체 검증)
- **현재 판단**: 레이어·DB·인증·캐시 변경이 없고 diff가 `news/gallery` 하위 신규 파일에 한정돼, Claude가 버그·타입·누락 guard·외과적 변경을 직접 점검하고 브라우저 실측으로 대체했다. PR #145 봇 리뷰 4건도 코드로 교차 확인해 1건(포커스 링) 수정, 3건은 근거와 함께 기각·유지했다.
- **다음 행동**: 없음.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task(run 20260705-175518, HEAD `50c4c20`) 필수 검증 통과. knip은 기존 부채만 남고 gallery 신규 0 — 초기 `GALLERY_CATEGORIES` unused export를 export 제거로 해소했다. 브라우저 실측: 데스크톱·모바일(530px)에서 컴포저 바·카드·사진 그리드(1/2/3/4장)·반응 pill·댓글 미리보기·PhotoSwipe 라이트박스("2/4") 모두 목업대로 동작했고, PR 리뷰 반영한 포커스 링 안쪽 offset(`-1.6px`)도 Tab 포커스로 확인했다.
- **다음 행동**: 머지.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차(피드) | 20260705-162741 | ✅ | ✅ | ✅ | 0 | mock 사진 일부가 캡션과 덜 어울림(placeholder — 사용자 "이미지는 그대로 둬도 돼") |
| 2차(리뷰 반영) | 20260705-175518 | ✅ | ✅ | ✅ | 0 | 포커스 링 안쪽 offset 수정 반영 (커밋 `50c4c20`) |

## PR 리뷰 대응

PR #145, 봇 인라인 4건. 각 코드 직접 확인 후 판정(중계 아님).

| 지적 | 출처 | 대조 | 판정·조치 |
| --- | --- | --- | --- |
| `GalleryPhotos` options `useMemo` | gemini `GalleryPhotos.tsx:38` | - repo 기존 `PhotoSwipe.tsx:41`도 인라인 options<br>- 정적 피드라 리렌더 경로 없음(내부 `useRef`뿐) | 기각 — 기존 패턴과 일관성 유지, GC 이득 미미 |
| `post.reactions[type] ?? 0` | gemini `GalleryPostCard.tsx:45` | 타입 `Record<ReactionType, number>`가 4키 보장 + mock 6건 다 채워 undefined 불가 | 기각 — 실 API 부분 데이터가 오면 타입이 가드를 강제할 때 추가 |
| 정적 상대 시간 안 갱신 | codex `posts.ts:19` | - `createdLabel` 고정 문자열<br>- mock/preview·develop 대상이라 prod 아님 | 유지 — 실데이터 연동 때 실제 timestamp로 계산(후속) |
| 포커스 링 카드에 잘림 | codex `gallery.module.scss:126` | - `.card` overflow:hidden + 타일 flush → 바깥 outline 좌우 잘림<br>- mixin 문서·`SectionTabNav` 문서에 안쪽 offset이 적혀 있음 | - 수정: 안쪽 offset(`calc(-1 * $focus-ring-offset)`)<br>- Tab 포커스 시 `-1.6px`·solid 실측, 커밋 `50c4c20` |

## 후속 작업

- 상대 시간을 실제 timestamp에서 계산 (codex #3)
  - 이유: mock `createdLabel` 고정 문자열은 배포 후 안 갱신돼 실제 소식으로 오해받을 수 있다
  - 다음 기준: 스키마·DB 연동으로 게시글 `createdAt`이 생길 때
  - 기록 위치: 이 항목 (실서비스 공개 전 필수)
- mock 사진 큐레이션 — 일부(다음세대 등)가 캡션과 덜 어울린다. 실데이터 도입 때 `posts.ts`를 교체하며 함께 고친다.

## 회고

**잘된 것**

- 목업이 자체 압축 번들이라 JSX를 못 읽었는데, `__bundler/template`의 인라인 스타일·DOM을 뽑고 브라우저로 렌더해 카드 구조·색·간격을 그대로 재현했다.
- "스키마를 적용했다"는 말과 달리 dev DB에 갤러리 테이블이 0건인 걸 [[project_supabase_environments]] 조회로 먼저 확인해, 없는 스키마 위에 헛구현하는 걸 막고 UI-first로 방향을 잡았다.
- 헤더·형제 탭·바텀 내비를 기존 공용 컴포넌트로 재사용하고 피드 본문만 신규로 만들어, 다른 news 페이지와 UI가 어긋나지 않았다.
- PR #145 봇 리뷰 4건을 코드로 교차 확인해 포커스 링 잘림(a11y) 1건을 실제로 고치고, 나머지 3건은 타입·기존 패턴·단계 근거로 기각·유지했다. 중계로 넘겼으면 오탐(반응 `?? 0`)을 그대로 반영할 뻔했다.

**다음에 할 것**

- 실제 스키마·DB 연동과 쓰기 동작(작성·사진 업로드·반응 토글·댓글). Server Action + `createServerSideClient` 경로.
- 상대 시간을 게시글 `createdAt`에서 계산 (codex #3). 실서비스 공개 전 필수.
- 카테고리 필터 트리거(검색·카테고리 탭) 추가 + `GALLERY_CATEGORIES` export 복원.

**발견된 부채**

- mock `createdLabel` 정적 문자열이 배포 후 안 갱신된다 — `## 후속 작업`에 기록(공개 전 필수). tech-debt 별도 등록은 안 한다(실데이터 연동 task에 흡수).
- mock 사진이 캡션과 안 맞는다 — 실데이터 교체 때 함께 고친다.
