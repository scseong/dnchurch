# sermons-detail-mockup

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-16
- **브랜치**: feat/sermons-detail-mockup
- **Open questions**: none
- **ADR needed**: no

## 목표

설교 상세 페이지를 mockup(`ChurchSermonAll.jsx`) 기준으로 재작성: 설교요약·본문말씀·함께보기 섹션을 mockup 비주얼로, **모바일은 4탭(요약·본문·함께보기·노트) sticky 인라인 탭 / PC는 전부 스택**. 비기능 SermonVideoTools(배속·PIP) 전체 제거. (사용자 결정 2026-05-16, PR #90 "Tabs 폐기" 되돌림)

## 검증된 Assumptions

- mockup 상세 구조: PC `DetailPCBody`(L1278) = VideoPlayer→SermonMeta→설교요약→본문말씀→함께보기 전부 스택+우측 사이드바, **탭 없음**. 모바일 `MDetailBody`(L2406)+`MobileTabs`(L2373) = VideoPlayer→SermonMeta→3탭(summary/scripture/resources, sticky top:47)→사이드바. (Read 확인)
- `sermon_resources.file_size_bytes: number | null` 존재 → mockup 함께보기 카드의 파일 크기 표시 가능. `src/utils/file.ts` 존재(formatFileSize 추가 위치). (database.types Read 확인)
- SermonVideoTools 코드 소비처 = `SermonDetailPage.tsx` 1곳뿐(나머지는 exec-plan 문서). 클린 제거 가능. (Grep 확인)
- mockup 색상 토큰 매핑: C.gold→`$accent`($gold-600), C.toneSoft(#FAF6EE)→`$primary-subtle`(기존 scripture_tag/resource_item에서 동일 용도 사용 중), C.surface→`$bg-card`, C.border→`$border-card`, C.borderLight→`$border-subtle`, text/sec/ter→`$txt-primary/secondary/tertiary`, primary→`$primary`. (`_color.scss` Read 확인)
- ScriptureBlock은 별도 컴포넌트(expand/collapse 보유). SermonNoteEditor는 localStorage 노트(props sermonId). (Read 확인)

## Non-goals (surgical scope)

- SeriesSidebar/StandaloneSidebar·SermonOtherByPreacher·VideoPlayer·SermonMetaActions(8-2 완료) 무변경
- 검색·필터·캐러셀 등 상세 외 표면 무변경
- DB/타입/admin UI 무변경 (읽기 표시만)
- ScriptureBlock의 expand/collapse 기능 제거 안 함 (mockup엔 없으나 긴 본문 오버플로 회귀 방지 — 의사결정 로그 D1)

## Success Criteria

- 설교요약/본문말씀/함께보기가 mockup 비주얼(SectionHeader uppercase, 본문말씀 gold 좌측보더 박스, 함께보기 카드+file_type 배지+크기) 토큰만으로 재현, 하드코딩 0
- 모바일(`<768`): 4탭 sticky 인라인 탭, 선택 섹션만 표시, 노트=4번째 탭. PC(`≥768`): 4섹션 전부 스택(노트 최하단), 탭 UI 없음
- SermonVideoTools(.tsx/.module.scss) 삭제 + SermonDetailPage import/사용 제거, 영상 도구 바 비노출, 잔존 참조 0
- 함께보기 다운로드 링크 기능 유지(`<a download>` file_url), file_size_bytes 있으면 크기 표시·없으면 생략
- verify-task PASS (tsc/lint/lint:styles/build 0), knip 신규 미사용 0

## 영향받는 파일

- (신규) `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailSections.tsx` — SectionHeader + 요약/본문/함께보기 + 모바일 탭 컨테이너(반응형: 모바일 탭/PC 스택)
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — info_section을 SermonDetailSections로 교체, SermonVideoTools·ScriptureBlock 직접 배치·summary/resource 인라인 제거, SermonNoteEditor를 탭/스택에 통합
- `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.module.scss` — section_header/scripture_box/resource_card/tab_bar 등 mockup 스타일 통합(신규 .module.scss 안 만듦)
- `src/app/(content)/sermons/_component/ScriptureBlock/ScriptureBlock.module.scss` — mockup 박스(gold 좌측보더·primary-subtle bg) 재스타일 (expand/collapse 로직 유지)
- `src/utils/file.ts` — `formatFileSize(bytes)` 추가
- (삭제) `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.tsx` + `.module.scss`

## 단계별 체크리스트

- [x] 1. 파일 크기 표시 — 신규 util 불필요, 기존 `convertBytesToFileSize`(file.ts) 재사용
- [x] 2. SermonVideoTools(.tsx/.scss) 삭제 + SermonDetailPage import/사용 제거
- [x] 3. SermonDetailSections: SectionHeader·요약·함께보기 카드(badge+size)·빈상태, ScriptureBlock mockup 박스(gold) 재스타일, SCSS 토큰 통합
- [x] 4. 반응형: 모바일 4탭 sticky(요약·본문·함께보기·노트)/PC 전 패널 스택+구분선, SermonDetailPage 배선
- [ ] 5. verify-task + Codex 1차 + Claude 2차

## 의사결정 로그

- **D1**: ScriptureBlock expand/collapse 유지(mockup엔 없음). 사유: 긴 본문 텍스트 모바일 오버플로 회귀 방지 — mockup은 짧은 mock 데이터 전제. 비주얼만 mockup 일치.
- **D2**: 모바일 탭은 공용 Tabs 미사용·경량 인라인(사용자 결정). PC는 탭 없이 전부 스택(mockup `DetailPCBody`).
- **D3**: SermonNoteEditor는 mockup 3탭에 없으나 4번째 탭("노트")으로 추가(사용자 결정), PC는 함께보기 다음 스택.
- **D4**: WAI-ARIA tablist/tab/tabpanel 패턴 미사용(Codex Q-a). PC가 전 패널 노출이라 진짜 탭이 아님 → 모바일 탭 컨트롤은 plain `<button>` 그룹+`aria-controls`, 각 패널은 `<section>`+SectionHeader. PC(≥768)는 CSS로 컨트롤 숨김·전 패널 스택. viewport 판별 JS 미사용·activeTab 고정 초기값(SSR-safe).
- **D6** (사용자 피드백 2026-05-17, 2차 폴리시): (1) **meta에서 duration 제거** — `formatSermonDuration(sermon.duration)`이 null이면 미표시라 설교별 불일치 발생, 타임스탬프는 썸네일에 있어 meta에서 제거(prop·import·조건블록 삭제). (2) **본문 말씀/뱃지 warm 배경** — toneSoft를 cool `$primary-subtle`로 매핑했던 게 회색으로 보임. styles 스킬상 warm 정적 면=`$bg-accent-subtle`(gold 12% tint, $accent 보더·라벨과 동일 온도) → ScriptureBlock `.block`/`.fade`·`.resource_badge` 변경. (3) **탭 밑줄 텍스트 폭으로 축소** — `.tab` border-bottom 제거, 라벨을 `.tab_label`(inline-block) span으로 감싸 active 시 텍스트 폭만큼만 밑줄. (4) **공유 드롭다운→BottomSheet** — 모바일 드롭다운이 디바이스 이탈. `@/components/ui` `BottomSheet`(모바일 시트/PC 중앙 모달 자동 전환·portal·focus trap·ESC/backdrop dismiss)로 교체, click-outside/Escape 직접 핸들러·`.share_wrap`/`.share_menu` 폐기. SermonMetaActions/ScriptureBlock(8-2·이전 커밋 요소)은 detail-mockup PR로 묶음(상세 마감 한 의도, [[feedback_pr_granularity]]).
- **D11** (PR #95 자동 리뷰 분류, 2026-05-17 — gemini-code-assist·chatgpt-codex-connector):
  - **#5 수정 (Codex P2, 실버그)**: `.tab_bar top:0`가 sticky 모바일 헤더(`z-header`)와 충돌해 탭바가 헤더 뒤로 가려짐. 앞선 "부모 박스 한정" 판단 오류 정정. `top:$mobile-header-offset(5.4rem)` 로컬 변수(Header `.mobile_top` 높이·하위 sticky top:5.4rem 관례 일치).
  - **#4 수정 (Codex P2, 실버그) — 최종**: 원인 = `useEffect(()=>setInput(q),[q])` 미러가 디바운스 navigation 지연 도착 시 최신 입력을 덮어씀. 1차 시도(effect/렌더에 lastPushedRef 가드)는 React Compiler 규칙 `set-state-in-effect`·`Cannot access refs during render`에 막힘(bare 미러만 통과). **최종: sync effect 자체 제거**("you might not need an effect" — 미러가 곧 버그원인, 입력은 사용자 소유, 초기값만 `useState(q)`. 외부 q는 라우트 전환 재마운트로 반영). SermonSearchForm·SeriesSearchForm 동일. verify PASS(eslint 0 errors).
  - **#6 수용(Codex P2, 트레이드오프)**: src-swap이 preboot iframe 폐기 = 사실. 그러나 postMessage 경로가 모바일 재생 불가 근본원인(D7 Codex 검증) → 모바일 재생 정확성 > 첫재생 지연. 코드 변경 없음, reply로 사유.
  - **won't-fix(reply 사유)**: gemini#1 next/image — 기존 `KakaoShareButton`과 동일 plain `<img>` 의도(전역 Cloudinary 로더가 로컬 자산 오처리, Codex 1차 확인). gemini#2 useMemo — `sermon_resources` 소규모, 추측성 최적화 금지(CLAUDE.md). gemini#3 로컬변수 vs 토큰 — styles 스킬이 "토큰 없는 값=파일 상단 로컬 변수" 명시, 규칙 준수.
- **D12** (사용자 피드백 2026-05-17, sticky 버그 — Codex 디버깅 검증): 모바일 탭바가 일정 스크롤 뒤 sticky 풀림. Codex 근본원인 = `position:sticky`는 부모 containing block(`.sections`) 높이로 핀 범위 제한 — 모바일은 `.sections`에 tab_bar+활성 패널(min-height 10rem) 하나뿐이라 곧 끝남(video·sidebar·다른설교는 `.sections` 밖). globals `body{overflow-x:hidden}`은 y축 sticky 무관(주원인 아님). **수정**: `.sections { min-height: calc(100svh - #{$mobile-header-offset}) }` 모바일, PC `min-height:0` 리셋 — 콘텐츠가 더 길면 콘텐츠 우선.
- **D13** (사용자 보고 2026-05-17, Kakao 공유 실패 — 진단, 코드 변경 없음): 데스크톱(Win32/localhost) `intent://...kakaolink` "no registered handler". 원인 = Kakao `sendDefault`가 KakaoTalk 앱을 스킴으로 호출 — PC에 앱/핸들러 없으면 실패(데스크톱 한계). `useKakaoShare`/`KakaoScript`(JS SDK 2.7.4·`NEXT_PUBLIC_KAKAO_API_KEY`) 코드 결함 아님. 조치=실기기(폰+KakaoTalk) 검증 + Kakao Developers 콘솔에 서빙 도메인(localhost:3000·dnchurch.vercel.app) Web 플랫폼 등록 및 메시지/Link 활성 확인(외부 설정).
- **D9** (사용자 피드백 2026-05-17, 4차 폴리시): **Skeleton shimmer 지연** — `src/components/ui/Skeleton/Skeleton.module.scss` `animation: shimmer 1.5s` → `2.4s`. ⚠ **전역 UI 컴포넌트** — 설교뿐 아니라 모든 스켈레톤 사용처에 적용(일관성상 의도된 전역 변경, 1값·저위험·surgical). [[feedback_pr_granularity]] 묶음 폴리시로 detail-mockup PR에 포함하되 전역 영향 명시.
- **D10** (동 피드백): **공유 BottomSheet 항목 터치 영역 확대** — `.share_item` `padding $spacing-8 $spacing-12` → `$spacing-12 $spacing-16` + `min-height` 로컬 변수 `$share-item-min-height:4.8rem`(≈48px, 모바일 a11y 권장 타깃, 토큰 없음·파일 상단 선언 — styles 스킬 규칙). 사용자 수동 변경 `$tab-panel-min-height` 24rem→10rem 유지(D8-2 값 조정).
- **D8** (사용자 피드백 2026-05-17, 3차 폴리시): (1) **탭 활성=bold만** — 밑줄(`.tab_label` border-bottom) 기계 전부 제거, `.tab_active`는 색·굵기만(라벨 span도 원복). (2) **탭 패널 최소 높이** — 콘텐츠 없는 탭에서 영역 붕괴·탭 전환 점프 → 로컬 변수 `$tab-panel-min-height:24rem`(토큰 없음, 파일 상단 선언 — styles 스킬 규칙) `.panel_active` 모바일 적용, PC(`respond-up`)는 `min-height:0` 리셋(스택이라 불요). (3) **meta 3개로 축소(범위 B, 사용자 결정)** — mockup SermonMeta와 일치하게 `본문 · 설교자 · 날짜`만, **`service_type` 제거**(한 줄 4개 과밀 해소, 예배유형 정보는 의도적 손실 수용). 순서도 mockup대로 scripture→preacher→date.
- **D7 (해소 — Codex 디버깅 검증, 2026-05-17)**: 증상 정정 = 모바일에서 **재생·정지 둘 다 안 됨**(PC 정상). 사용자가 Codex 검증 요청.

  > Codex: (1) 근본원인 — `sendPlay()`가 `message` 리스너에서 나중 실행 → user gesture stack 밖, 모바일(iOS Safari/Android Chrome) autoplay policy 차단. 데스크탑은 MEI·완화 정책으로 통과. `playsinline=1`·`origin=` 누락 보조 원인. eager iframe+queued postMessage는 모바일에서 근본 불안정. (2) 첫 탭 시 `readyRef` 거의 항상 false → 항상 큐 경로 → gesture 밖 → 모바일 사실상 항상 재생 실패. (3) 권고 A안: 탭 시 iframe `src`를 `autoplay=1&playsinline=1` 포함으로 교체(navigation이 gesture에 묶임), eager mount 유지. (4) `infoDelivery`는 readiness로 약함, `onReady` 우선.

  **풀이·구현**: Codex A안 채택하되 simplicity 가드로 **postMessage/enablejsapi/readyRef/wantPlayRef/message useEffect/handleIframeLoad 전부 제거**(모바일 무용·타 용도 없음, Codex의 "큐 fallback 잔존 무방"은 dead code라 미채택). `baseSrc=embed/${videoId}?playsinline=1&rel=0`, `iframeSrc = playing ? base+'&autoplay=1' : base`, `handlePlay=()=>setPlaying(true)`. iframe navigation이 탭 핸들러 동기 스택 내 → 모바일 단일 탭 재생, 재생 후 네이티브 컨트롤로 정지 가능. enablejsapi 미사용이므로 `origin=` 불요(window 접근 0 → 하이드레이션 mismatch 없음). eager preboot 유지(첫 재생 지연 완화 효과 보존). a11y tabIndex/aria-hidden 토글 유지. 이 변경은 phase7-finish의 video-preconnect 접근(postMessage)을 일부 대체 — detail-mockup PR로 묶음([[feedback_pr_granularity]]).
- **D5** (사용자 피드백 2026-05-17, 모바일 답답함 폴리시): (1) 탭 바 풀폭 — 컨테이너 패딩을 `calc(-1 * $container-padding)` 음수 마진으로 상쇄해 화면 가장자리까지(여백 0). (2) `.section_header` 모바일 숨김·PC만 노출 — 모바일은 탭 라벨이 섹션명을 대신하므로 패널 내 중복 헤더 제거. (3) **메타 압축(모호 해석 채택)**: "본문 말씀과 meta 줄바꿈으로 height↑" → 별도 `.scripture_tag` pill(한 줄 추가·본문 말씀 섹션과 중복)을 제거하고 scripture를 `.meta_row` 인라인 첫 항목(`$primary` 굵게, mockup L1008 동일)으로 통합. service_type·duration 데이터는 유지(콘텐츠 무손실). `.meta_block` gap `xs→s`, 탭 하단 여백 `m→l`로 호흡 추가.

## Verification

- `node scripts/verify-task.mjs sermons-detail-mockup`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (2026-05-16, fresh)

> Q-a: 접근 sound. PC가 전 패널 노출이면 WAI-ARIA tablist/tab/tabpanel 패턴 회피 권장 — 모바일 컨트롤은 단순 button 그룹+aria-controls만, 각 패널은 자체 SectionHeader 가진 section 구조.
> Q-b: SSR/hydration 리스크 낮음 — 초기 activeTab 고정값·viewport 판별 JS 미사용 시 서버/클라 트리 동일, 모바일/PC 차이는 CSS media query.
> Q-c: ScriptureBlock expand/collapse 유지 OK — 기존 접근성/긴 본문 UX 보존하는 국소 재사용, 제거 시 범위↑.
> Q-d: SermonVideoTools 삭제 리스크 낮음 — 단일 import 확인, barrel 없으면 knip/타입체크/lint로 충분.
> Q-e: formatFileSize → file.ts 적절(순수 util).
> Q-f: DECISION_LOG 기록 권장: 모바일 inline tabs/PC stacked, 노트 mockup 외 보존, dead SermonVideoTools 삭제, ARIA tabs 패턴 미사용.
> PASS_WITH_DECISION_LOG — 구현 전 위 4결정 DECISION_LOG 기록.

**풀이**: 계획 골격 승인. 구현 전 조치 = (1) ARIA tabs 패턴 미사용으로 확정(D4 추가): 모바일 탭 컨트롤은 plain `<button>` 그룹+`aria-controls`, 패널은 `<section>`+SectionHeader, PC는 CSS로 컨트롤 숨김·전 패널 노출. (2) D1·D2·D3·D4가 Codex 권고 4항(스크립트 collapse 보존·모바일탭/PC스택·노트 보존·ARIA 회피)을 커버 — 추가 DECISION_LOG 불요. viewport JS 미사용·activeTab 고정 초기값으로 SSR-safe.

## Codex 1차 검증

- **결론**: PASS (재요청 — diff 인라인 제공으로 fast-path, 2026-05-17)

> PASS. (a) CSS cascade: `.panel`(none)→`.panel_active`(block) source-order 우선, 모바일 활성만 노출 정상. PC 미디어 `.panel{block}` 4개 전체+adjacent divider, tab_bar 동일 미디어 display:none — 특이성 버그 없음. (b) useState('summary') 고정·window/matchMedia 미사용 → 하이드레이션 안전. (c) aria-controls→display:none 패널: role=tablist 의도적 포기(D4) 범위 내 수용, aria-expanded로 상태 전달 — 실질 위반 아님. (d) 항상 4섹션 렌더+빈상태, a[download target=_blank] 보존 — 기능 회귀 없음. (e) ScriptureBlock .text/.text_collapsed/.fade/.toggle 미변경 collapse 유지, .fade 끝색=.block bg=$primary-subtle 일치, 단일 소비자 — blast radius 없음(D1). (f) SermonVideoTools import/JSX/파일·폴더 삭제 grep 0 refs — 완전 외과적. (g) 결함/범위누수 없음. summary_text 클래스 누락 의심은 권고(빌드/동작 결함 아님).
> 종합: PASS. 커밋 진행 무방.

**풀이**: Codex 1차 재요청(이전 task 30분 과지연 → 사용자 취소 후 재시도, diff 전량 인라인으로 파일 재탐색 제거해 ~3분 내 응답). (a)~(g) 전부 PASS, 실결함 0. **summary_text 권고는 오탐** — Codex에 SCSS "추가 블록"만 발췌 전달해 기존 보존된 `.summary_text`(SermonDetailPage.module.scss:309, 원본 유지·미변경)를 못 본 것. grep으로 사용 클래스(.sections/.tab*/.panel*/.section_header/.empty/.summary_text/.resource_*) 전부 정의 확인, stylelint/next build 통과로 교차 입증. 별도 외부검증 미완 잔여 해소(Codex 1차 PASS 확보).

## Claude 2차 검증

- **최종 판단**: PASS (Codex 1차 대행 — 직접 교차 검증)

### 교차 확인 (구현 diff·verify 로그 기준)

- **verify `logs/sermons-detail-mockup/20260517-112223`**: ESLint 통과·stylelint 통과·next build 통과(tsc 포함). knip.log에 SermonDetailSections/SermonVideoTools/SermonDetailPage/ScriptureBlock/convertBytesToFileSize 항목 0(신규 미사용 0). `grep SermonVideoTools src/` = 0 refs(삭제 완전).
- **(a) 반응형 CSS 정합**: 컴파일 캐스케이드 `.panel{display:none}` → `@media(≥768){.panel{display:block}}` → `.panel_active{display:block}`. 모바일: 활성만 `.panel_active`(소스 후순위·동일 specificity) block, 나머지 none ✓. PC: 미디어 `.panel{block}`로 4개 전부 노출, `.tab_bar{display:none}` ✓. `.panel + .panel` 미디어 한정 → summary는 `.tab_bar + .panel`이라 상단 구분선 없음, scripture/resources/note만 구분선(mockup: 첫 섹션 무경계) ✓. specificity 충돌 없음.
- **(b) SSR/hydration**: `useState('summary')` 상수 초기값, init에 window/viewport/localStorage 접근 없음 → 서버/클라 트리 동일, 불일치 0 ✓.
- **(c) a11y(D4)**: WAI-ARIA tablist 미사용, role=group+aria-label, 버튼 aria-controls/aria-expanded, 패널=`<section>`+`<h3>`. 비활성 패널 display:none = disclosure 표준(AT 비노출=시각 일치). PC는 버튼 숨김·전 섹션 heading 노출 → 접근 가능 ✓.
- **(d) 동작 변경**: 섹션 조건부 생략 → 항상 렌더+빈상태 문구(mockup이 섹션 상시 노출 전제, 4탭 일관). `<a download target=_blank rel=noopener noreferrer href=file_url>` 보존, `file_size_bytes != null` 가드(0 byte는 convertBytesToFileSize가 '0 Bytes' 처리) ✓ 기능 회귀 0.
- **(e) ScriptureBlock(D1)**: collapse 로직(.text_collapsed/.fade/.toggle) 무변경, `.fade` 그라데이션 종단색=`$primary-subtle`=`.block` bg 유지로 페이드 정상. 소비처 grep=SermonDetailSections 1곳뿐 → 재스타일 영향 상세 한정, 타 표면 회귀 0.
- **(f) surgical**: 제거 import(IoDocumentText/DownloadOutline·SermonResource type·activeResources)는 ResourceList 제거의 직접 귀결, SermonMeta/SermonMetaActions(8-2) 무변경, 인접 정리 없음 ✓. 토큰만(letter-spacing 0.08em/0.18em·3.6rem box는 비-토큰 카테고리, 동일 파일 `.dot` literal rem 선례 일치).
- **외부 교차검증**: Codex 1차 재요청 = PASS(위 섹션) 확보 — 잔여 해소. Codex의 summary_text 누락 권고는 오탐(발췌 전달 탓), `.summary_text` 원본 보존(line 309) grep 확인.
- **D9·D10 델타 재검증**: verify(skeleton/touch 폴리시) ESLint·stylelint·next build 통과, knip 신규 0. (D9) Skeleton `shimmer` duration 1.5s→2.4s 단일 값, prefers-reduced-motion 분기·gradient 무변경 — 전역 적용 의도. (D10) `.share_item` `min-height:$share-item-min-height(4.8rem)`+padding `$spacing-12 $spacing-16`, 로컬 변수 파일 상단 선언(스킬 규칙), BottomSheet 내 리스트 행 터치 타깃 ≈48px 확보. 사용자 수동 `$tab-panel-min-height` 24→10rem 유지. 런타임 디바이스 확인은 누적 잔여와 동일(Vercel preview).
- **D8 델타 재검증**: verify `logs/sermons-detail-mockup/20260517-161639` ESLint·stylelint·next build 통과, knip 신규 0, `grep tab_label|service_type`(SermonDetailPage 디렉터리)=0 orphan. 교차확인 — (D8-1) `.tab_label` JSX span·SCSS 블록·`.tab_active .tab_label` 전부 제거, `.tab_active`=색+굵기만(밑줄 0). (D8-2) 로컬 `$tab-panel-min-height:24rem` 파일 상단 선언(styles 스킬: 토큰 없는 값 로컬 변수 규칙 준수), `.panel_active` 모바일 min-height·PC `respond-up` min-height:0 리셋(스택 영향 0). (D8-3) `service_type` span+Dot 제거, 순서 scripture→preacher→date(mockup 일치), `sermon.service_type` 잔존 참조 0(타입/lint 통과). 사용자 수동 변경 `.tab` padding `$spacing-12`→`$spacing-20`(탭 탭타깃 확대) 유효 토큰·stylelint 통과·유지. 런타임(모바일 영상/BottomSheet/탭) 디바이스 확인은 D6·D7 잔여와 동일.
- **D6·D7 델타 재검증**: verify `logs/sermons-detail-mockup/20260517-153003` ESLint·stylelint·next build 통과, knip 신규 0, `grep -r share_menu|share_wrap|formatSermonDuration` (SermonDetailPage 디렉터리) = 0 orphan. 교차확인 — (D6-1) duration prop/import/조건블록·SermonMetaProps 동시 제거(tsc 통과=시그니처 정합), `formatSermonDuration` util 자체 미삭제(타 소비처 영향 0, surgical). (D6-2) `$bg-accent-subtle`=styles 스킬 warm 정적 면 정규 semantic($accent 보더·라벨과 동일 온도), primitive 직접사용 0, `.fade` 그라데이션 끝색=`.block` bg 동기화 유지. (D6-3) `.tab` border-bottom 제거+`.tab_label`(inline-block) span, `.tab_active .tab_label`(0,2,0)>`.tab_label`(0,1,0)로 active 밑줄 텍스트폭 한정. (D6-4) BottomSheet(`@/components/ui`)로 교체 — `.share_wrap`/`.share_menu`/click-outside·Escape effect/`shareWrapRef`/`useRef` 제거, 포털·focus trap·ESC/backdrop·모바일시트/PC모달 자동, SSR null-guard로 hydration 안전, dialog 시맨틱으로 a11y 개선. (D7) Codex 근본원인 검증대로 src-swap, postMessage/enablejsapi/readyRef/wantPlayRef/message effect/handleIframeLoad 전부 제거, window 접근 0=hydration mismatch 없음, eager preboot·tabIndex/aria-hidden 유지. **런타임 미검증(자동검증 불가)**: 실제 모바일 단일탭 재생·정지는 디바이스 확인 필요(로직은 Codex 검증 접근과 일치).
- **D5 폴리시 델타 재검증**: verify `logs/sermons-detail-mockup/20260517-151124` ESLint·stylelint·next build 통과, knip 신규 0. 델타 교차확인 — (1) `.scripture_tag` 소비처·정의 동시 제거(orphan 0, stylelint pass), `.meta_scripture` 정의·인라인 렌더 정합, scripture 1줄 축소로 height↓. (2) `.tab_bar` `calc(-1 * $container-padding)` 풀폭(메모리 calc 음수 규칙 준수), PC display:none·sticky·border-bottom 무영향, 패널은 컨테이너 패딩 유지로 정렬 정상. (3) `.section_header` 모바일 display:none(탭 라벨이 대체·AT는 탭 버튼+aria-expanded로 컨텍스트)/PC block — 빈 헤딩·회귀 없음. 로직/ SSR 무변경.

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
