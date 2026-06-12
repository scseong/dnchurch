# sermons-share-buttons

- **상태**: ✅ 완료 (2026-05-18)
- **시작일**: 2026-05-16
- **브랜치**: feat/sermons-phase7-finish
- **Open questions**: none
- **ADR needed**: no

## 목표

8-2 공유: 설교 상세 SermonMeta 메타 행 우측에 mockup 스타일 pill 클러스터 신설 — **"공유" pill(클릭→복사/카카오/페북/메일 메뉴) + "저장" pill(북마크 토글)**. `SermonVideoTools`의 중복 공유·북마크 제거(공유·저장 affordance를 메타 1곳으로 일원화). **범위 = B (mockup 완전 일치, 사용자 결정 2026-05-16)**.

## 검증된 Assumptions

- `SermonVideoTools`에 이미 `handleShare`(navigator.clipboard + `useToastStore.info('링크가 복사되었습니다')`) + "공유" 버튼(`IoShareOutline`) 존재 — 8-2 그룹 신설 시 복사 중복. (Read 확인)
- `useKakaoShare()` 훅 + `KakaoShareButton` 공용 컴포넌트 존재. `KakaoShareProps {title, description?, imageUrl?, link?}`. (content) layout이 KakaoScript 로드. (Read 확인)
- `useToastStore().info` 토스트 패턴(VideoTools 선례). (Read 확인)
- `SermonDetailPage`(client)의 `info_section`에 `SermonMeta` 위치 — 공유 그룹은 메타 근처(문서 8-2 "메타 영역 근처"). (Read 확인)
- 공유 이미지(카카오)는 절대 URL 필요 → `getCloudinaryUrl`(PR #94 #2 교훈). (기지)

## Non-goals (surgical scope)

- 8-3 접근성 점검 / 8-4 성능 점검 — 별도 후속
- 다른 페이지 공유·KakaoShareButton 공용 컴포넌트 리팩터 없음(상세 SermonShare만)
- VideoTools의 speed/PIP/bookmark 무변경(공유 1버튼만 제거)

## Success Criteria

- `/sermons/[id]` 메타 근처에 아이콘 버튼 그룹: 복사(clipboard+토스트)·카카오(useKakaoShare)·페이스북(sharer window.open)·메일(mailto). 각 동작 정상
- `SermonVideoTools`에서 "공유" 버튼·handleShare·`IoShareOutline` 제거(speed/PIP/bookmark 잔존), 복사 affordance 중복 0
- 카카오 공유 이미지 = `getCloudinaryUrl` 절대 URL
- verify-task PASS (tsc/lint/lint:styles/build 0)

## 영향받는 파일

- (신규) `src/app/(content)/sermons/_component/SermonDetailPage/SermonMetaActions.tsx` — 공유 disclosure + 저장 pill (scss는 신규 모듈 X, 아래 통합)
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — SermonMeta 내 `.meta_bar`(meta_row+actions) 배치, getCloudinaryUrl import
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.module.scss` — `.meta_bar`/pill/popup 스타일 통합(신규 .module.scss 안 만듦)
- `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.tsx` — 공유·북마크 버튼/handler/helper/잔여 import 제거(speed·PIP 잔존)
- `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.module.scss` — grid `repeat(4,1fr)`→`repeat(2,1fr)`

## 단계별 체크리스트

- [ ] 1. `SermonMetaActions`(공유 disclosure: 복사·카카오·페북·메일 + 저장 북마크) + SermonDetailPage.module.scss 스타일
- [ ] 2. SermonMeta에 `.meta_bar`로 배치(title/desc/shareImageUrl/sermonId props)
- [ ] 3. SermonVideoTools 공유·북마크 외과적 제거 + grid 2칸
- [ ] 4. verify-task + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-share-buttons`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (범위 B 확정 plan 재검, 2026-05-16)

> VERDICT: CHANGE_REQUEST
> (a) SSR-safe 방향 적절(window.location.href handler 내부, use client, scss 통합). 단 aria-haspopup="menu" 유지 시 role=menu/menuitem·Escape·focus return·키보드 내비 누락 = a11y 리스크.
> (b) queueMicrotask 제거 안전 — bookmark 초기값을 render에서 localStorage로 안 읽고 useEffect에서만 갱신하면 hydration mismatch 없음.
> (c) try/catch 충분. Facebook sharer·mailto는 handler 내부 encode면 문제 없음.
> (d) 파일 배치(SermonDetailPage 하위)+기존 .module.scss 통합 = 프로젝트 제약과 일치, 맞는 판단.
> (e) 영구 아키텍처/라이브러리/데이터흐름 변경 아님 → DECISION_LOG 불요.
> ACTION_ITEMS: 1) popup a11y — full menu OR disclosure(plain button list, aria-haspopup 제거)로 단순화(후자 권장). 2) loadBookmarks/saveBookmarks malformed JSON·접근실패·비배열 guard(try/catch+Array.isArray). 3) SermonVideoTools 잔여 import 실사용 기준 제거(unused 시 lint 실패+surgical 위반).

**풀이**: CHANGE_REQUEST 3건 모두 수용. (1) full menu 대신 **disclosure 패턴** 채택 — 토글 버튼 `aria-expanded`/`aria-controls`, 메뉴는 plain `<button>` 리스트, Escape·click-outside 닫기, `aria-haspopup="menu"`/`role=menu` 미사용(구현 단순·a11y 충분). (2) 기존 `loadBookmarks`의 try/catch+`Array.isArray` 가드를 이전 시 그대로 보존. (3) SermonVideoTools에서 `useToastStore`(speed/PIP info)·`clsx`·`useRef`는 잔존, `useCallback`·IoBookmark/IoBookmarkOutline/IoShareOutline만 제거. (b)대로 bookmark 초기값은 useEffect에서만(queueMicrotask 제거). DECISION_LOG 불요(Codex (e)).

## Codex 1차 검증

- **결론**: PASS (구현 검증, --resume 동일 스레드, 2026-05-16)

> PASS. ACTION_ITEM 1(팝업 a11y): RESOLVED — disclosure 패턴, aria-haspopup/role=menu 없음, aria-expanded+aria-controls+Escape+click-outside. ACTION_ITEM 2(localStorage 가드): RESOLVED — SSR 가드+read/write try/catch 유지. ACTION_ITEM 3(미사용 import): RESOLVED — useCallback/IoBookmark/IoBookmarkOutline/IoShareOutline 제거, SermonMetaActions import 전부 실사용. 추가 4 useKakaoShare SSR: OK(window.location.href 핸들러 내). 추가 5 img vs next/image: OK(기존 KakaoShareButton과 패턴 일치). 추가 6 BOOKMARK_KEY 잔존참조: OK(구 키 참조 없음, 회귀 0). 추가 7: OK.

**풀이**: verify-task PASS(eslint/stylelint/next build 0, knip은 기존 부채·신규 파일 무관) 위에서 Codex가 CR 3건 해소 + SSR/일관성/회귀 7점 전부 클리어 확인. 실결함 0.

## Claude 2차 검증

- **최종 판단**: PASS (8-2 공유/저장 단위)

### 교차 확인

- verify 로그 `logs/sermons-share-buttons/20260516-221246/`: ESLint·stylelint·next build 통과, tsc는 next build 타입체크 포함. knip.log에 SermonMetaActions/SermonVideoTools/SermonDetailPage 항목 없음(신규 미사용 export 0).
- diff 외과성: SermonVideoTools 제거분이 bookmark/share 정확히 한정(speed·PIP·clsx·useRef·useToastStore.info 잔존), 미사용 `sermonId` prop·호출부 동시 정리. SCSS 토큰만(하드코딩 0), 기존 popup 패턴 미러.
- CR 3건 코드상 반영 확인(disclosure·localStorage 가드 보존·import 정리). queueMicrotask 미사용(메모리 규칙 준수).
- ⚠ 범위 후속: 사용자가 배속/PIP 제거 + 상세 UI mockup 재작성(모바일 탭) 추가 요청 → 별도 후속 작업으로 분리(아래).

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

## 회고

- **잘된 것**: 공유·저장을 SermonMeta로 일원화, 중복 SermonVideoTools 공유 제거. Codex CR(disclosure a11y·localStorage 가드·import 정리) 반영. 이후 드롭다운→BottomSheet로 모바일 디바이스 이탈까지 해소.
- **다음에 할 것**: 8-2가 detail-mockup과 같은 파일(SermonMeta/MetaActions)을 건드려 브랜치 경계가 얽힘 — 상세 페이지 연속 작업은 처음부터 한 작업 스코프로 잡는 게 깔끔(브랜치 스택·단일 통합 PR로 귀결).
- **부채**: 없음(특이). Kakao 동작은 [[sermons-detail-mockup]] D13(콘솔 도메인 등록) 참조.

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
