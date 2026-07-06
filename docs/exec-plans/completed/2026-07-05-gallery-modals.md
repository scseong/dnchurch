# gallery-modals

- **상태**: ✅ 완료 (2026-07-06)
- **시작일**: 2026-07-05
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — app 컴포넌트 + BottomSheet에 선택 prop 1개 추가. apis/services/actions/DB/config 무변경.

## 목표

gallery-feed(읽기 전용)에서 뺐던 목업의 두 모달을 UI로 구현한다: **나눔글 작성 모달**(3단계 위저드)과 **게시글 상세 모달**. mock 데이터 기반, 실제 제출·저장은 없음(쓰기 연동은 후속). 컴포저 바 탭 → 작성 모달, 카드 탭 → 상세 모달로 연결한다.

## 검증된 Assumptions

- `BottomSheet`(`src/components/ui/BottomSheet/`)가 `useDialog`로 focus trap·ESC·scroll lock·backdrop·`enableHistory`(기기 뒤로가기 닫기)를 제공하고 PC에서 중앙 모달로 전환된다(코드 확인). 단 `max-height: 80vh`로 풀스크린은 아니다.
- 목업 두 모달은 풀스크린 슬라이드업(`position:absolute; inset:0; z-index:58`)이다. 브라우저 실측으로 각 단계·요소 구조를 추출했다.
- 현재 컴포저(`GalleryComposer`)·카드(`GalleryPostCard`)는 정적(비인터랙티브) — 모달을 열려면 client 상태가 필요하다.
- 목업 작성 모달 3단계: ① 사진 선택("대표 사진 추가" + 추가, 최대 10장) → ② 이야기 텍스트(Textarea, 0/500) → ③ 카테고리 chips + 공개 범위(전체 공개/교인만 보기 라디오 카드). 헤더 ✕ + "나눔글 작성" + 진행 세그먼트 3개, 푸터 이전/다음/올리기.
- 목업 상세 모달: 헤더 ‹ + "게시글" + ⋯, 본문(작성자·카테고리 배지·사진·캡션·반응 pill·"댓글 N"·댓글 목록[아바타·이름·시각·본문·공감/답글]), 하단 고정 댓글 입력(나 아바타 + "따뜻한 한마디를 남겨보세요" + 전송 버튼).

## Non-goals (surgical scope)

- 실제 쓰기: 글 저장·사진 업로드·댓글 저장·반응 토글·공개 범위 반영. "올리기"·댓글 "전송"은 mock(토스트 후 닫기), 실제 데이터 변화 없음.
- 게시글 상세 **라우트**(`/news/gallery/[id]`) — 사용자가 "상세 모달"로 요청. 라우트·SEO는 범위 밖.
- 대댓글 스레드 펼침·신고·⋯ 메뉴 동작. ⋯·공감·답글은 정적 표시.
- DB·타입·서비스·인증/RLS 배선. `apis/services/actions`·config 변경.

## Success Criteria

- [ ] 컴포저 바 탭 → 작성 모달이 열리고, 이전/다음으로 3단계(사진·텍스트·카테고리+공개범위)를 오가며 마지막에 "올리기"가 뜬다. 올리기·✕는 토스트/닫기까지만(mock).
- [ ] 카드의 사진·"댓글 N개 모두 보기" 탭 → 상세 모달이 열리고 해당 게시글의 작성자·사진·캡션·반응·댓글 목록·입력이 목업대로 나온다.
- [ ] 두 모달 모두 풀높이(모바일)로 목업과 일치하고, PC에서는 BottomSheet 중앙 모달로 어울린다. 기기 뒤로가기·ESC·backdrop으로 닫힌다(focus trap 포함).
- [ ] 스타일 전부 토큰(`$home-*`·semantic), className snake_case, 2개+ clsx. raw `<button>/<input>` 대신 ui 컴포넌트(Button·Textarea 등) 사용.
- [ ] `node scripts/verify-task.mjs gallery-modals` 통과(lint·stylelint·build, knip 신규 0).

## 접근법 (컴포넌트 맵)

- `BottomSheet`에 선택 prop `size?: 'default' | 'full'` 추가(기본 default = 현재 80vh, full = 100dvh 근접·모바일 풀스크린). 콜러 영향 없는 확장. focus trap 동작 불변.
- `page.tsx`(server): `GALLERY_POSTS`를 client 래퍼 `GalleryBoard`에 넘긴다(mock라 직렬화 OK). 컴포저·피드·모달을 client에서 관리.
- `_component/GalleryBoard.tsx`(client): `composeOpen`·`detailPost` 상태. `GalleryComposer`를 버튼화해 open, 카드에 `onOpenDetail(post)` 전달, 두 시트를 렌더.
- `_component/GalleryComposeSheet.tsx`(client): 3단계 위저드. `useState` 단계 + 세그먼트, `Textarea`(0/500), 카테고리 chips(`Pill`), 공개 범위 라디오 카드. 푸터 `Button`(이전/다음/올리기). 사진은 mock 플레이스홀더 타일(업로드 없음).
- `_component/GalleryPostSheet.tsx`(client): 상세 — 작성자·카테고리·`GalleryPhotos`(라이트박스 재사용)·캡션·반응·댓글 목록·하단 입력(`Textarea` + 전송 `Button`, 비제출).
- `GalleryPostCard`: client로 전환(사진·"모두 보기" 탭 → `onOpenDetail`). `GalleryFeed`도 client 경유.
- 스타일: 기존 `gallery.module.scss`에 모달 관련 클래스 통합(상위 1개 유지).

## 의사결정 로그

- **D1 — BottomSheet에 `size="full"` 변형 추가(신규 풀스크린 모달 자작 대신)**
  - 문제: 목업 모달은 풀스크린인데 BottomSheet는 80vh다. 새 풀스크린 오버레이를 자작하면 focus trap·scroll lock·기기 뒤로가기(`enableHistory`)를 다시 구현해야 하고 ui-components 금지 패턴(portal 자작)에 걸린다.
  - 해결: BottomSheet에 선택 prop `size`를 더해 full일 때 `100dvh` 근접 높이로 둔다. 기존 콜러는 기본값이라 무영향, a11y 훅은 그대로 재사용.
  - 결과: 목업 풀스크린을 재현하면서 focus trap·기기 뒤로가기·PC 중앙 모달 전환을 그대로 얻는다.
- **D2 — 작성 "올리기"·댓글 "전송"은 mock(비제출)**
  - 문제: 읽기 전용/UI 단계라 실제 저장·업로드 경로가 없다.
  - 해결: 올리기 → 토스트 후 시트 닫기, 댓글 입력은 화면 표시만 둔다. 실제 mutation은 후속(Server Action + `createServerSideClient`).
  - 결과: 목업 흐름(단계 이동·작성 UI)을 다 보여주되 데이터는 안 바뀐다.
- **D3 — 공용 `Textarea` 기본 font-size를 16px→13px로 낮춤(사용자 결정, iOS 확대 감수)**
  - 문제: 사용자가 댓글 placeholder를 더 작게 원해 `Textarea.module.scss` base를 13px로 직접 바꿨다. 원래 16px은 iOS Safari 포커스 확대(font-size<16px) 방지용이었다.
  - 해결: 16px 강제는 iOS 하나 때문에 전 기기에 건 무딘 회피책이라 확대가 필수 문제는 아님을 확인했다. 사용자가 "13px 전역 + iOS 확대 감수"를 택해, base 13px·placeholder inherit를 커밋하고 갤러리 댓글의 scoped 14px override를 지워 전역 13px을 상속하게 했다.
  - 결과: 모든 textarea가 13px로 맞춰졌다. iOS 모바일 포커스 시 경미한 확대는 감수한다(데스크톱·안드로이드는 영향 없음).

## 영향받는 파일

- `src/components/ui/BottomSheet/BottomSheet.tsx`·`BottomSheet.module.scss` (수정: `size` prop)
- `src/app/(content)/news/gallery/page.tsx` (수정: GalleryBoard 위임)
- `src/app/(content)/news/gallery/_component/{GalleryBoard,GalleryComposeSheet,GalleryPostSheet}.tsx` (신규)
- `src/app/(content)/news/gallery/_component/{GalleryComposer,GalleryFeed,GalleryPostCard}.tsx` (수정: 인터랙션 연결·client 전환)
- `src/app/(content)/news/gallery/_component/gallery.module.scss` (모달 스타일 추가)
- `src/app/(content)/news/gallery/_data/posts.ts`·`_types.ts` (댓글 목록 mock 확장)

## 단계별 체크리스트

- [x] 1. `BottomSheet` `size="full"` + `header` prop + scss. 기존 콜러 회귀 없음(기본값 경로 동일: size='default'는 `.full` 미적용, header 미지정은 기존 헤더, labelledby는 `!header`일 때 동일).
- [x] 2. `_types.ts`·`_data/posts.ts`에 댓글 목록(comments[]) mock 확장(topComment 제거, comments[0]로 미리보기). `GALLERY_CATEGORIES`·`GALLERY_SCOPES` export.
- [x] 3. `GalleryComposeSheet` 3단계 위저드(Textarea·Pill·라디오 카드, prevOpen 리셋).
- [x] 4. `GalleryPostSheet` 상세 + 댓글 목록 + 입력(빈 댓글 상태 포함).
- [x] 5. `GalleryBoard` client 상태 + 컴포저 버튼화 + 카드 onOpenDetail(사진·댓글 stat·모두 보기) 배선. `GalleryPhotos`는 피드=상세 열기·상세=라이트박스 2모드.
- [x] 6. 브라우저 실측(모바일 530px): 작성 3단계 이동·상세 열기·ESC 닫기 확인. 토큰/snake_case/clsx 자체 점검.

## 브라우저 실측 결과 (dev live)

- 컴포저 탭 → 작성 모달 3단계(사진 선택·이야기 Textarea 0/500·카테고리 Pills+공개 범위 라디오) 목업대로. 세그먼트 진행·이전/다음/올리기 정상.
- 카드 사진 탭 → 상세 모달: 작성자·카테고리 배지·풀폭 사진·반응·"댓글 3"·댓글 목록(공감/답글)·하단 단일 줄 입력 정상. ESC로 닫혀 피드 복귀.
- Textarea 기본 min-height(≈78px)가 댓글 바엔 과해 `.comment_input textarea`로 4rem으로 낮춤.

## Verification

- `node scripts/verify-task.mjs gallery-modals`
- 브라우저 실측: 컴포저→작성 모달 3단계, 카드→상세 모달, 닫기 경로.

---

## Codex 계획 검증

- **결론**: PASS (Codex 미실행 — Claude 대체 검증)
- **현재 판단**: 사용자가 "진행해"로 계획을 승인했다. 공용 `BottomSheet`를 건드리지만 선택 prop 추가라 기존 콜러 무영향이고, DB·services·actions·config·인증은 그대로다. Claude가 5체크(가정·비목표·범위·성공 기준·과한 추상화 없음)를 직접 확인했다. Windows Codex CLI 불안정은 [[project_codex_windows_unavailable]] 참조.
- **다음 행동**: 없음.

## Codex 1차 검증

- **결론**: PASS (Codex 미실행 — Claude 대체 검증)
- **현재 판단**: 공용 컴포넌트 변경이라 특히 회귀를 확인했다 — `size`/`header`는 선택 prop이고 기본값 경로(handle·body 패딩·labelledby)가 구현상 이전과 동일해, 5개 기존 콜러(ShareSheet·AdvancedFilterSheet·MonthPickerSheet·NewFamilyRegister·FilterDropdown)는 영향받지 않는다. build 통과로 전 콜러 컴파일을 확인했다. a11y(focus trap·inert)는 useDialog 그대로라 바뀌지 않았다. 새 모달 2종은 브라우저로 열기·단계 이동·ESC 닫기를 실측했다.
- **다음 행동**: 없음.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task(run 20260705-211449, `Textarea` 13px 반영본) 필수 검증 통과. knip은 기존 부채만 남고 gallery·BottomSheet 신규 0. 브라우저 실측(모바일 530px): 작성 모달 3단계·상세 모달(사진·반응·댓글 목록·입력·라이트박스 "1/2")·ESC 닫기 모두 목업대로 동작. `react-hooks/set-state-in-effect` lint 오류는 렌더 중 prevOpen 비교 패턴으로 해소.
- **사용자 리뷰 반영(폴리시)**: ① 작성 모달 ✕를 오른쪽으로(헤더 순서 `spacer/title/닫기`) ② 전송 버튼을 32×24 사각형→35×35 원형($home-accent)·17px 아이콘 ③ 댓글 바 정렬 flex-end→center ④ `Textarea` 기본 font-size 16→13px 전역(D3). DOM 실측으로 확인(창 뷰포트 손상으로 스크린샷 대신 getBoundingClientRect).
- **다음 행동**: 커밋·PR 완료(#146). complete-task 시 반영.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260705-211449 | ✅ | ✅ | ✅ | 0 | 사진 라이트박스 "1/2" 실측 완료. `Textarea` 13px는 iOS 포커스 확대 감수(D3) |
| 리뷰반영 | 20260705-214811 | ✅ | ✅ | ✅ | 0 | 라이트박스 Escape 분리·상세 시트 닫힘 유지 실측 |

## PR 리뷰 대응

PR #146, 봇 인라인 3건. 각 코드 직접 확인 후 판정(중계 아님).

| 지적 | 출처 | 대조 | 판정·조치 |
| --- | --- | --- | --- |
| 닫힘 애니메이션 중 상세 내용 즉시 사라짐 | gemini `GalleryPostSheet.tsx:39` | `{post && …}`가 post=null 시 즉시 언마운트 → 빈 시트가 슬라이드다운 | - 수정: 마지막 post를 `activePost`로 유지(open은 `Boolean(post)`)<br>- 커밋 `6f3982a` |
| `.comment_list` ul 패딩/마진 리셋 | gemini `gallery.module.scss:616` | - `* { padding:0; margin:0 }`(`globals.scss:132`)<br>- `ul,li{list-style:none}`(`:161`) — 전역 리셋 이미 있음 | - 기각: 오탐<br>- 전역 리셋으로 렌더 변화 없음(댓글 좌측 정렬 실측 정상) |
| 라이트박스 Escape가 시트까지 닫음 | codex `GalleryPostSheet.tsx:106` | `useDialog.ts:170` document Escape가 조건 없이 onClose → PhotoSwipe Escape와 겹침 | - 수정: 라이트박스 열림 중 Escape를 캡처 단계에서 가로채 라이트박스만 닫음(`GalleryPhotos`)<br>- 커밋 `6f3982a`<br>- 실측: 라이트박스만 닫힘·시트 유지, 라이트박스 없으면 시트 정상 닫힘 |

## 회고

**잘된 것**

- 목업의 두 모달(작성 3단계·상세)을 브라우저에서 컴포저·게시글 탭으로 직접 열어 DOM·인라인 스타일을 뽑고, 카드 구조·색·간격을 그대로 재현했다.
- 공용 `BottomSheet`를 자작하지 않고 `size="full"`·`header` 선택 prop으로 확장해 focus trap·scroll lock·기기 뒤로가기를 재사용하면서, 기존 콜러 5곳은 기본값 경로가 같아 무영향임을 build로 확인했다.
- PR #146 봇 리뷰 3건을 코드로 교차 확인했다 — 닫힘 애니메이션(`activePost`)·라이트박스 Escape 2건은 실제로 고치고 브라우저 실측했고, `.comment_list` 패딩은 `globals.scss`의 전역 리셋을 확인해 오탐으로 기각했다.
- `Textarea` 16px가 iOS 포커스 확대 방지용임을 짚었지만, "iOS 하나 때문에 전 기기 16px을 강제하냐"는 사용자 지적을 받아들여 13px 전역으로 정정했다.

**다음에 할 것**

- 실제 스키마·쓰기 연동(글 작성·사진 업로드·반응 토글·댓글). Server Action + `createServerSideClient`.
- 상대 시간을 게시글 `createdAt`에서 계산(gallery-feed 후속과 공유).
- 게시글 상세를 모달 대신 라우트(`/[id]`)로 둘지 재검토(SEO·공유 링크).

**발견된 부채**

- `Textarea` 13px 전역은 iOS 모바일 포커스 확대를 감수한다 — 폼이 늘면 터치 기기만 16px로 미디어쿼리를 분리한다(D3).
- 라이트박스 Escape 분리를 `GalleryPhotos`의 캡처 단계 stopPropagation으로 처리했다 — 중첩 다이얼로그 Escape가 다른 곳에도 생기면 공용 패턴으로 올린다.
