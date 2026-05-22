# sermons-publish-ssot

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-21
- **브랜치**: feat/sermons-publish-ssot
- **Open questions**: none
- **ADR needed**: no (D4 참조)

## 목표

어드민 설교 폼의 발행 흐름을 정합화한다. 한 문장으로: 발행 필수 조건을 한곳(`validateSermonForm`)에서 정의하고, Server Action·체크리스트·발행 안내가 같은 결과를 참조한다. 추가로 미리보기 설교자 UUID 노출을 name 매핑으로 바로잡는다. (모바일 미리보기 BottomSheet 교체는 D3 폐기 → D5 참조, 후속 plan으로 분리.)

## 검증된 Assumptions

- `src/lib/sermon-form.ts`가 이미 존재. `applyPatch`만 들어 있고 `validateSermonForm`은 없음 — Read 확인.
- `src/components/ui/BottomSheet/BottomSheet.tsx`가 named export로 존재. `useDialog` 훅 내장(ESC·focus trap·trigger 포커스 복귀 자동) — Read 확인.
- `src/lib/sermon-form-mapper.ts:17,37`이 `video_provider: 'youtube'`를 하드코딩 → Vimeo는 어디서도 실 처리 안 됨. Checklist의 "YouTube/Vimeo" 라벨은 거짓 안내 — Grep 확인.
- 현재 4곳의 발행 조건 (도메인 리뷰 항목 P 표 그대로):
  - `createSermonAction`/`updateSermonAction`: title·sermonDate·preacherId·serviceType — 4필드
  - `Checklist`: 위 4 + scripture — 5필드 + 영상 optional
  - `PublishCard` 안내: 위 4 + 영상 — 5필드(영상 필수)
  - `SermonVideoPlayer`: youtube 외 placeholder
- `SermonForm`이 이미 `preachers` prop을 받음(`SermonForm/index.tsx:29`) → PreviewCard에 prop만 전달 추가로 해결 가능.

## Success Criteria

- 필수 6필드(title·sermonDate·preacherId·serviceType·scripture·videoId) 누락 시 Server Action·Checklist·PublishCard 안내가 같은 missing 키 목록을 사용한다.
- PreviewCard meta 칸에 `formatPreacherLabel(preacher)` 결과("김성규 목사" 형식)가 출력된다. 미선택이면 빈 칸.
- 화면 어디에도 "Vimeo" 문자열이 남지 않는다. `rg -n "Vimeo" src` 0건.
- PublishCard main 라벨이 "비공개/공개"로 표시되고 새 설교 등록 페이지가 default로 "공개" 선택 상태로 마운트된다(D7).
- PageHeader에 publish 버튼이 없다(D8). 하단 `action_bar`가 PC + 모바일 양쪽에서 fixed로 visible. 미리보기 트리거는 모바일 전용.
- `action_bar` 안에 `취소`·`공개로 등록 / 공개로 저장 / 비공개로 저장` 버튼이 우측 정렬로 보인다.
- Checklist optional이 `설교 요약`·`첨부 자료` 2건(D9). "썸네일 업로드" 사라짐.
- 어드민 폼 input placeholder가 본체 텍스트와 동일한 13px로 보인다(D10).
- `yarn lint` / `yarn lint:styles` / `yarn build` PASS, `yarn knip` 신규 항목 0건.
- 모바일 미리보기 자체 dialog는 그대로 유지(D5 — D3 폐기). 후속 plan에서 처리.
- 모바일 미리보기 트리거가 토글로 동작하고 시트가 열린 상태에서 action_bar가 그대로 노출됨(D14).

## 영향받는 파일

- `src/lib/sermon-form.ts` — `validateSermonForm`·`SERMON_REQUIRED_LABELS`·`SERMON_REQUIRED_ORDER`(6필드, D6) 추가
- `src/actions/sermon.action.ts` — create/update validation을 함수 호출로 교체
- `src/components/admin/sermons/SermonForm/Preview/Checklist.tsx` — `validateSermonForm` 결과 기반, 영상이 required로 이동(D6), optional은 요약·첨부 자료(D9)
- `src/components/admin/sermons/SermonForm/Preview/PreviewCard.tsx` — `formatPreacherLabel`로 "김성규 목사" 형식(A + D7 보강)
- `src/components/admin/sermons/SermonForm/sections/PublishCard.tsx` — 안내 자동 갱신, 라벨 비공개/공개(D7)
- `src/components/admin/sermons/SermonForm/index.tsx` — `onCancel` prop 추가, `mobile_bar` → `action_bar` 일반화, 취소 버튼 신설(D8)
- `src/components/admin/sermons/SermonForm/index.module.scss` — `action_bar` 셀렉터 신설(PC visible) + `.wrap` padding-bottom(D8), 기존 `mobile_*` 셀렉터 제거
- `src/components/admin/sermons/SermonForm/primitives/primitives.module.scss` — `.control::placeholder { font-size: inherit }`(D10)
- `src/types/sermon-form.ts` — `INITIAL_SERMON_FORM_DATA.isPublished: true`(D7)
- `src/app/(admin)/admin/sermons/_components/SermonFormShell.tsx` — `PageHeader.actions` 제거, `handleCancel` 추가, `publishLabel`을 D7 라벨과 정합화(D8)

## 의사결정 로그

- **D1 — 필수 5필드로 SSOT 정렬 (Checklist 기준 채택)**
  - 문제: 현재 4곳이 다 다르다. DB는 `scripture: string | null`(database.types.ts:308·330·352)로 null을 허용하고 Server Action 검사도 4필드(title·sermonDate·preacherId·serviceType)뿐이라, 코드 레벨에서 scripture 누락 발행이 가능. Checklist UI만 required `*`로 표시하고 있어 운영자가 안내·동작 차이를 본다.
  - 해결: title·sermonDate·preacherId·serviceType·scripture를 필수로 한다. 본 PR은 의도적 규칙 강화 — 도메인 의미상 설교는 성경 본문을 동반해야 발행 가치를 가진다. 영상은 optional로 둔다 — 일정 선등록·음성 설교·임시 비공개 발행 등 영상 부재 케이스가 있고 mapper의 `video_provider: 'youtube'` 하드코딩이 영상 필수화를 막는다. 대안(Server Action 4필드 기준)은 미공개 정책이 약해진다.
  - 결과: Server Action·Checklist·PublishCard 안내가 같은 5필드를 가리킨다. 기존 row 중 scripture가 null인 게 있으면 발행 상태 그대로 두되 다음 편집 시 채워야 update가 통과한다.

- **D2 — Vimeo 라벨·안내 제거 (UI 한정)**
  - 문제: Checklist 라벨이 "YouTube/Vimeo"인데 mapper가 `'youtube'` 단일값을 강제하고 SermonVideoPlayer는 youtube 외에 "지원하지 않는 영상 형식"을 띄운다. 운영자에게 거짓 옵션.
  - 해결: 라벨을 "영상 연결 (YouTube)"로 좁힌다. Vimeo 실제 지원은 별도 PR(영상 인프라 작업)에서 검토.
  - 결과: 안내와 실제 처리 능력이 일치. `supabase/migrations/001_sermon_schema.sql:38`의 CHECK 제약 `('youtube', 'vimeo')`는 이번 PR 범위 밖으로 두고 의도적으로 그대로 둔다 — DB 마이그가 동반되어야 하고 향후 Vimeo 지원을 다시 검토할 여지를 남긴다.

- **D3 — 모바일 미리보기는 공용 BottomSheet로 교체** ⚠️ 정정(2026-05-21 본 PR 진행 중): 폐기 → D5 참조
  - 문제: `SermonForm/index.tsx:106-134`가 자체 overlay+role=dialog를 구현. ESC 닫기·focus trap·`aria-modal`·trigger 포커스 복귀가 누락.
  - 해결: 이미 검증된 `BottomSheet`(`useDialog` 내장)로 바꾼다. `<BottomSheet open={previewOpen} onClose={...} title="미리보기">` 한 줄. PC는 사이드바로 그대로 노출되고 모바일에서만 시트가 뜬다는 기존 동작은 유지.
  - 결과: 접근성 자동 동작 + 자체 구현 코드·스타일 정리.

- **D4 — ADR 미발급**
  - 문제: `src/actions/sermon.action.ts` 변경이 `ADR_TRIGGER_PARTS`에 해당.
  - 해결: 변경 내용이 validation 로직의 SSOT 추출(extract refactor)이며 새 의존성·아키텍처 변화·외부 contract 변경이 없다. 동작 의미상 scripture를 4필드 → 5필드로 강화하는 의도 변화만 있고 이는 도메인 리뷰 P 항목과 본 plan D1에 기록.
  - 결과: ADR 미발급. Codex 계획 검증에서 재확인 받는다.

- **D5 — D3 폐기 (BottomSheet 교체 보류), G를 후속 plan으로 분리**
  - 문제: D3를 코드에 적용한 직후 발견 — `BottomSheet`가 `createPortal`로 `modal-root`에 렌더되고, admin 색상 토큰 30+종이 `.shell` selector(`AdminLayout/index.module.scss:1`)에만 정의된다. portal target은 `.shell` 외부라 CSS 변수 cascade가 끊겨 `PreviewCard`·`Checklist`가 색·테두리 전부 깨진다. 사용자 메모리 `feedback_portal_tokens.md`가 정확히 이 경고("portal 컴포넌트와 children은 admin 토큰 X")이고 plan 작성 시 미반영.
  - 해결: 본 PR에서 D3를 reversal한다. 자체 dialog 코드를 그대로 둔다. G(BottomSheet 교체)는 별도 plan `sermons-form-mobile-sheet`로 분리. 그 plan은 선행 결정(`.shell` admin 토큰을 `:root`로 승격할지, PreviewCard·Checklist를 globals 토큰으로 교체할지, BottomSheet 안에 admin-tokens wrapper를 둘지)을 디자인 시스템 차원에서 정한 뒤 진행한다. ADR 후보.
  - 결과: 본 PR 의도는 P(발행 SSOT) + A(설교자 name 표기) 두 축으로 좁아진다. PR scope·회귀 위험 모두 감소. G·토큰 정책은 후속 plan에서 응집 묶음으로 다룬다.

- **D6 — 영상 연결을 필수 6번째 필드로 추가 (사용자 수동 검증 후 강화)**
  - 문제: D1이 영상을 optional로 두었지만 운영 흐름상 영상 없는 설교는 발행 가치가 약하다. 사용자가 dev 서버 수동 검증 후 영상 필수화 요청.
  - 해결: `SermonRequiredField`에 `videoId` 추가, `SERMON_REQUIRED_ORDER` 끝에 `videoId`, `SERMON_REQUIRED_LABELS.videoId = '영상 연결'`. `validateSermonForm`에 `formData.videoId === ''` 검사 추가. Checklist optional에서 영상 항목 제거(자동으로 required로 이동). PublishCard 안내 자동 갱신(SSOT). 대안(Checklist의 optional 그대로 유지 + Server Action만 추가)은 SSOT 의도와 어긋남.
  - 결과: 필수 6필드(title·sermonDate·preacherId·serviceType·scripture·videoId). YouTube 영상 ID 없으면 publish 차단. Vimeo 라벨 제거(D2)와 결합해 "발행에는 YouTube 영상 1개 필수"가 명확한 규칙.

- **D7 — Publish 토글 라벨을 "공개/비공개"로 직관화 + default를 공개로**
  - 문제: 기존 라벨 "초안/발행"은 한눈에 의미 파악이 어렵다. default `isPublished: false`(초안)는 운영자에게 "저장 = 자동 초안"이라는 흐름이지만 사용자가 직관 부족 + 기본 발행 의도 요청.
  - 해결: PublishCard main 라벨을 `초안→비공개`, `발행→공개`로 변경. sub 라벨은 `비공개→임시 저장`, `공개→사이트에 게시`로 부가 설명. `INITIAL_SERMON_FORM_DATA.isPublished`를 `true`로 변경. 운영자가 명시적으로 "비공개"를 선택해야 초안으로 저장됨. validateSermonForm이 6필드 미입력 시 publish 차단하므로 미완성 공개 위험은 차단됨.
  - 결과: 새 설교 등록 페이지가 default로 "공개" 상태로 마운트. 운영자가 6필드 채우고 저장하면 즉시 공개. 의도적 초안 저장은 비공개 라디오 클릭 후 저장.

- **D8 — 발행 액션을 PageHeader에서 떼고 하단 fixed action bar로 통합 + 라벨을 상태 명시형으로**
  - 문제: PC에서도 `PageHeader.actions`로 publish 버튼이 화면 상단에 있어 운영자가 form을 채우다 보면 스크롤이 내려가서 매번 위로 올라가야 한다. 모바일은 별도 `mobile_bar`로 하단 액션이 있지만 PC와 코드·UX가 어긋난다. 또한 `publishLabel`이 `발행 / 발행 저장 / 초안 저장`이라 D7의 `공개/비공개` 라벨과 의도가 어긋남.
  - 해결: `SermonFormShell`의 `PageHeader actions` 제거. `SermonForm`의 `mobile_bar`를 `action_bar`로 일반화하고 `@media (min-width: 1024px) { display: none }` 룰을 제거해 PC에서도 visible. 미리보기 트리거(`action_bar_preview`)만 PC에서 hide. 액션 그룹(`action_bar_actions`)을 `margin-left: auto`로 우측 정렬. `취소` 버튼 신설(`onCancel = () => router.push('/admin/sermons')`). `publishLabel`을 `공개로 등록 / 공개로 저장 / 비공개로 저장`으로 D7 라벨과 정합화. `.wrap`에 `padding-bottom: 80px`로 fixed bar 가림 차단. 대안(PC를 form 끝에 sticky 없이 일반 footer로)은 스크롤을 끝까지 내려야 보여서 사용자 불만 해결 못 함.
  - 결과: 어드민이 화면 어느 위치에 있어도 `취소 / 공개로 등록` 액션이 하단 우측에 항상 보임. mobile_bar 죽은 modifier(`outline`)도 제거.

- **D9 — Checklist optional 항목 "썸네일 업로드" → "첨부 자료"**
  - 문제: YouTube URL 입력 시 mapper가 `thumbnailUrl = https://img.youtube.com/vi/{id}/hqdefault.jpg`를 자동 채우므로(`src/lib/sermon-form.ts` `applyPatch`) "썸네일 업로드"는 사실상 항상 ok 상태이거나 의미가 없다. 반면 첨부 자료(`resources`)는 운영자에게 실제 선택 항목.
  - 해결: optional 배열에서 `썸네일 업로드` 제거, `첨부 자료`(status는 `formData.resources.length > 0`) 추가.
  - 결과: 운영자가 의미 있는 optional 항목만 본다. videoId가 required(D6)이므로 썸네일이 자동 채워지지 않는 경로는 차단됨.

- **D10 — 인풋 placeholder font-size 정렬**
  - 문제: `src/styles/globals.scss:140-145`의 `input::placeholder { font-size: $font-size-14 }` 룰이 SermonForm 인풋의 본체 font-size(`.control { font-size: 13px }`)보다 크게 적용되어 placeholder가 본문보다 큰 시각 어긋남.
  - 해결: `src/components/admin/sermons/SermonForm/primitives/primitives.module.scss`의 `.control::placeholder`에 `font-size: inherit;` 한 줄 추가. `.control`의 13px이 cascade로 적용됨. 대안(globals.scss의 룰을 제거)은 영향 면적이 너무 크고 다른 폼이 의도적으로 14px을 기대할 수 있음.
  - 결과: 어드민 폼 input의 placeholder가 본체 텍스트와 같은 13px로 보임. globals 룰은 그대로 두어 다른 폼은 영향 없음.

- **D11 — 취소 버튼에 dirty confirm 추가 (Codex 1차 CR 대응)**
  - 문제: D8에서 신설한 `handleCancel`이 isDirty 확인 없이 `router.push('/admin/sermons')`를 호출했다. `useUnsavedChanges` 훅은 `window.addEventListener('beforeunload', ...)` 만 등록해 브라우저 종료/새로고침은 잡지만 Next.js App Router의 client-side `router.push`는 가로채지 못한다. 결과적으로 dirty 상태에서 취소 클릭 시 변경 내용이 경고 없이 사라지는 데이터 손실 버그. Codex 1차 검증에서 Q2 CHANGE_REQUEST로 지적.
  - 해결: `handleCancel`에 `if (isDirty && !window.confirm(...)) return;` 한 줄 추가. native confirm dialog를 사용하는 이유는 (1) D5에서 portal 토큰 정책이 미해결이라 Modal/BottomSheet 도입 보류 (2) 데이터 손실 방지가 UX 폴리시보다 우선 (3) 가장 좁은 외과적 수정. 후속 정리(`sermons-cancel-confirm-dialog`)에서 admin 토큰 정책 해결 후 커스텀 confirm으로 교체 가능.
  - 결과: dirty 상태 취소 시 한국어 confirm("저장하지 않은 변경 사항이 있습니다. 목록으로 돌아갈까요?") → 확인 시 navigation, 취소 시 form 유지.

- **D12 — action_bar 반응형 분리 (PC 일반 흐름 / 모바일 fixed 유지)**
  - 문제: D8이 mobile_bar의 PC visible 룰을 일괄 적용해서 PC에서도 fixed bottom에 떠 있게 됨. 사용자 dev 수동 검증에서 (1) PC fixed가 부자연스러운 floating 시각, (2) z-index 30이 다른 요소 위로 떠 레이아웃 충돌, (3) `.wrap padding-bottom: 80px`로 빈 공간 강제, (4) 향후 모달·드롭다운과 z-index 경쟁 위험으로 지적. 동시에 사용자가 모바일은 기존 fixed 패턴이 정답임을 명시 — 모바일 fixed bar는 항상 보이는 액션 노출이 작은 화면에서 필수.
  - 해결: `.action_bar`를 반응형으로 분리. 기본(모바일)은 `position: fixed; bottom: 0; left: 0; right: 0; z-index: 30; background; border-top`(기존 mobile_bar 스타일 복원). `@media (min-width: 1024px)`에서 `position: static; padding: 12px 0; background: none; border-top: 0`으로 일반 흐름. `<div className={styles.action_bar}>`를 form 안 `form_col` 끝(PublishCard 다음)에 두면 PC에서는 그 자리에 보이고 모바일에서는 fixed로 떠올라 viewport 하단에 고정. `.wrap`은 모바일에서 `padding-bottom: 80px`로 fixed 가림 차단, PC에서는 `padding-bottom: 0`.
  - 결과: PC에서는 PublishCard 바로 아래 일반 footer로 자연스럽게 배치(스크롤 끝까지 가야 보이지만 발행 토글 확인 흐름과 자연). 모바일에서는 화면 어느 위치에 있어도 fixed bar로 액션 즉시 접근. JSX는 한 위치에 유지(DOM 단일).

- **D13 — edit 모드 publishLabel 동사 교체 ("저장" → "게시")**
  - 문제: D8의 `edit + isPublished=true → '공개로 저장'` 라벨이 모호. "저장"은 데이터 보존 동사라 "공개"라는 상태와 결합되면 운영자가 "저장만 누름인지 / 공개로 바뀌고 저장인지" 헷갈림. 사용자가 dev 수동 검증 후 직접 지적.
  - 해결: edit + 공개=true 라벨을 `'공개로 저장'` → `'공개로 게시'`로 변경(게시 = 사이트에 올리는 외부 노출 동사). 동시에 new + 비공개=false 라벨도 `'비공개로 저장'` → `'비공개로 등록'`으로 변경해 mode와 일관성 강화. 최종 4개 분기: (new·공개) `공개로 등록` / (new·비공개) `비공개로 등록` / (edit·공개) `공개로 게시` / (edit·비공개) `비공개로 저장`. 대안(단순화 "등록/저장"만 + PublishCard에 책임 전가)은 운영자가 토글 잊을 위험 있어 기각.
  - 결과: edit 모드 액션 의도가 명확. "공개로 게시"는 사이트에 올리는 의미, "비공개로 저장"은 데이터만 보존(외부 비공개).

- **D14 — 모바일 미리보기를 action_bar와 공존시키고 토글 동작 부여**
  - 문제: 기존 모바일 미리보기는 `preview_overlay`가 `inset: 0` + `z-index: 300`이라 action_bar(z-index 30)를 dim으로 덮어 운영자가 미리보기 확인 후 publish/취소를 누르려면 시트를 닫아야 했다. 운영자 의도는 "미리보기로 검토 → 그대로 등록" 한 흐름. 또한 미리보기 버튼이 open-only(`setPreviewOpen(true)`)라 닫으려면 X 버튼이나 backdrop 클릭을 써야 했다.
  - 해결: 두 가지 외과적 변경. (1) JSX 미리보기 버튼 핸들러를 토글로 변경(`setPreviewOpen((open) => !open)`) + `aria-label`을 상태별 동적으로(`previewOpen ? '미리보기 닫기' : '미리보기 열기'`). (2) SCSS `preview_overlay`의 `inset: 0` → `inset: 0 0 64px 0`로 viewport 하단 64px 영역(모바일 action_bar 높이)을 비움. action_bar는 그 영역에 그대로 노출되어 dim·시트와 겹치지 않으므로 z-index 경쟁 없이 publish/취소 클릭 가능. 64px은 모바일 action_bar 높이(padding 10×2 + button 42 + border 1 = 63px)에 1px 여유. 시트의 `align-items: flex-end`가 overlay 새 bottom(viewport - 64px)에 맞춰 자동 정렬.
  - 결과: 미리보기 켠 채로 publish 누르면 즉시 등록. 미리보기 버튼 다시 누르면 닫힘(X 버튼·backdrop 클릭은 여전히 동작). PC는 preview_overlay가 `display: none`이라 영향 없음.

- **D15 — edit breadcrumb 동적 라벨 주입 + 모바일 truncate**
  - 문제: `src/config/adminNavigation.ts:69-70`의 `resolveAdminBreadcrumbs`가 edit 경로(`/admin/sermons/:id/edit`)에서 `'(설교 제목)'` 플레이스홀더를 반환했다. 원본 주석에 "실제 설교 제목 주입은 추후 페이지 단에서 컨텍스트/props로 대체한다"고 명시돼 있어 의도된 미완. 운영자에게 어떤 설교를 편집 중인지 안 보임. 동시에 sermon 제목이 길면 모바일 AdminHeader가 overflow로 깨질 위험.
  - 해결: 두 가지 변경. (1) `src/store/admin-breadcrumb.store.ts` 신설(zustand) — `dynamicLabel: string | null` + `setDynamicLabel`. toast.store.ts와 동일 패턴. `resolveAdminBreadcrumbs(pathname, dynamicLabel?)` 시그니처 확장. AdminLayout이 store 구독해서 인자로 전달. SermonFormShell이 `mode === 'edit'`일 때 `useEffect`로 mount 시 `setDynamicLabel(initialTitle)` + cleanup에서 `null` 복원. 대안(React Context)은 layout/page 직접 props drilling 불가 + Provider 위치 결정 부담. 대안(server-side data prop)은 layout/page 독립 segment라 적용 불가. (2) AdminHeader SCSS — `.crumbs_list`·`.group`에 `min-width: 0`, `.separator`에 `flex-shrink: 0`, `.crumb`에 `white-space: nowrap`, `.crumb.current`에 `overflow: hidden; text-overflow: ellipsis`. flex item의 default `min-width: auto`를 풀어 마지막 crumb(현재 페이지)만 ellipsis 처리되도록.
  - 결과: edit 페이지가 mount되면 breadcrumb 마지막에 실제 sermon 제목 표시("관리자 / 설교 관리 / 빌립보서 강해 4편"). 페이지 이탈 시 cleanup으로 store 복원. 다른 dynamic 경로(시리즈/설교자 edit 등)에서도 같은 store로 확장 가능. 모바일에서 제목이 길면 ellipsis로 잘림 — 헤더 우측 bell·menu 가림 없음.

## 단계별 체크리스트

- [x] 1. `validateSermonForm`·`SERMON_REQUIRED_LABELS`·`SERMON_REQUIRED_ORDER`를 `src/lib/sermon-form.ts`에 추가.
- [x] 2. `sermon.action.ts`의 두 곳 validation을 함수 호출로 교체. 누락 메시지는 라벨 join.
- [x] 3. `Checklist.tsx`를 `validateSermonForm` 결과 기반 items로 재작성. "Vimeo" 라벨 제거. optional 항목 그대로.
- [x] 4. `PublishCard.tsx` 안내 문구를 `SERMON_REQUIRED_ORDER`·`SERMON_REQUIRED_LABELS` join으로 갱신.
- [x] 5. `PreviewCard.tsx`에 `preachers: Preacher[]` prop 추가. metaParts에서 UUID 대신 name. `SermonForm/index.tsx`에서 두 곳에 prop 전달.
- [x] 6. ~~`SermonForm/index.tsx`의 `<div preview_overlay>` 블록을 `<BottomSheet>` 교체~~ — D5로 폐기. 자체 dialog 유지.
- [x] 7. ~~`index.module.scss`에서 `preview_overlay`·`preview_sheet*` 셀렉터 제거~~ — D5로 폐기. 셀렉터 유지.
- [ ] 8. `yarn lint && yarn lint:styles && yarn build && yarn knip`. 이어서 `node scripts/verify-task.mjs sermons-publish-ssot`.

## Non-goals

- `video_provider` 컬럼 enum/check 강제 — DB 마이그가 필요한 별도 작업.
- Vimeo 실제 지원 추가.
- `SermonResourceInput` discriminated union 도입(L 항목).
- 어드민 리스트 행/`<th>` 접근성(E 항목) — `sermons-admin-interaction` plan에서 별도 진행.

## Verification

- `node scripts/verify-task.mjs sermons-publish-ssot`
- 수동: 어드민 새 설교 등록 페이지에서 필수 6필드 누락 토글 → Server Action 에러 메시지 / Checklist `err` 표시 / PublishCard 안내가 같은 누락 항목(영상 연결 포함)을 가리키는지 확인.
- 수동: 설교자 선택 → PreviewCard meta 칸에 "이름 직분"(예: "김성규 목사") 표시 확인.
- 수동: 새 설교 등록 페이지 진입 시 PublishCard가 "공개" 라디오로 마운트, default publishLabel이 "공개로 등록"인지 확인.
- 수동: PC 뷰포트에서 PageHeader에 publish 버튼이 없고, 하단 `action_bar`가 fixed로 보이며 우측에 `취소`·`공개로 등록` 버튼 정렬되는지 확인. 스크롤 끝까지 콘텐츠가 가려지지 않는지(`.wrap padding-bottom` 작동) 확인.
- 수동: 모바일 뷰포트에서 미리보기 트리거 버튼이 보이고, PC에서는 보이지 않는지 확인.
- 수동: `취소` 클릭 → `/admin/sermons` 목록 페이지로 이동. dirty 상태에서 `useUnsavedChanges` 경고 떠야 함.
- 수동: 폼 input에 placeholder 상태로 두고 본체 텍스트 입력 시 두 텍스트의 font-size가 동일한지 확인.
- 수동: Checklist에 "썸네일 업로드"가 사라지고 "첨부 자료"가 나타나는지, resources 추가 시 status가 ok로 바뀌는지 확인.

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **현재 판단**: D1·D2·D3·D4 모두 SAFE. 보강 권장 2건을 D1·D2 결과 단락에 반영 완료.
- **다음 행동**: 구현 단계(WORK) 진행. 1차 검증은 diff 생성 후 별도 요청.

### Codex stdout (verbatim)

> 최종 판정: PASS_WITH_DECISION_LOG
> 구현은 진행 가능. 단 아래 두 항목을 exec-plan 결정 로그에 추가 명시 권장.
> 1. D1 — `scripture` publish 필수화: DB null 허용과 action 기존 4-field 검사 간 의도적 규칙 강화임을 명시.
> 2. Cross-cutting — `supabase/migrations/001_sermon_schema.sql:38`의 `('youtube', 'vimeo')` CHECK는 이번 PR 범위 밖이며 의도적으로 남김을 명시.

평이 풀이: D1·D2·D3·D4는 그대로 통과. 코드 변경은 시작해도 좋고, 다만 plan 문서의 D1·D2 본문에 "DB 상태와의 거리"·"마이그 제외 범위" 두 줄을 더 박아 둬야 한다는 권고. 즉시 반영.

## Codex 1차 검증

- **결론**: PASS (D11로 CR 대응 완료)
- **현재 판단**: D8·D9·D10 추가 검증에서 Codex가 Q2(취소 버튼 dirty 손실)를 CHANGE_REQUEST로 지적 → D11로 `handleCancel`에 isDirty confirm 추가. 나머지 Q1(action_bar JSX/SCSS 일관성)·Q3(resources reactive)·Q4(placeholder cascade)는 모두 PASS. CR 처리 후 자체 점검으로 단일 분기 코드 검증 완료.
- **다음 행동**: Claude 2차 재검증 후 사용자 승인 → 커밋.

### Codex stdout (verbatim, D8·D9·D10 + CR)

> Q1 — PASS. action_bar 계열 5개 클래스 JSX↔SCSS 일치. mobile_* 셀렉터·.outline·.primary 검색 0건.
> Q2 — BUG. `handleCancel`이 isDirty 확인 없이 `router.push`. `useUnsavedChanges`는 beforeunload만 잡고 SPA route push는 못 막음. dirty 상태에서 변경 손실.
> Q3 — PASS. `resources`는 setData spread/filter로 state 갱신. Checklist가 formData.resources.length를 읽어 재렌더.
> Q4 — PASS. `.control::placeholder { font-size: inherit }` (0,1,1) > `input::placeholder` (0,0,1). admin scope의 다른 `::placeholder`는 font-size override 없음.
> 최종 판정 — CHANGE_REQUEST. handleCancel에 isDirty 확인/confirm 필요.

평이 풀이: Codex가 실제 데이터 손실 버그를 잡았다(Q2). 한 줄 가드로 외과적 수정. native `window.confirm`은 D5의 portal 토큰 미해결로 인한 임시 선택 — admin scope confirm UI는 후속.

## Claude 2차 검증

- **최종 판단**: PASS (D12 반응형 분리 정정 후 최종)
- **현재 판단**: verify-task run `20260521-231018` 4단계 PASS. D12 첫 적용(fixed 일괄 제거)을 사용자 지적에 따라 반응형 분리로 정정 — 모바일은 기존 fixed bottom 복원, PC는 form_col 안 일반 흐름. SCSS `@media (min-width: 1024px)` 분기로 한 JSX 위치에서 양 뷰포트 동작 다르게. `.wrap padding-bottom`도 모바일만 80px·PC 0. 단일 미디어 쿼리 분기·DOM 변경 없음.
- **다음 행동**: 사용자 dev 수동 재확인(PC 일반 흐름·모바일 fixed) 후 커밋.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260521-211315 | ✅ | ✅ | ✅ | 0 | 5필드 누락 토글 / PreviewCard name 표시 |
| 2차 (D6·D7) | 20260521-221306 | ✅ | ✅ | ✅ | 0 | 6필드 누락 토글 / "김성규 목사" 표시 / default "공개" 마운트 |
| 3차 (D8·D9·D10) | 20260521-223743 | ✅ | ✅ | ✅ | 0 | action_bar PC visible / Checklist 첨부 자료 / placeholder 13px |
| 4차 (D11 CR 대응) | 20260521-224628 | ✅ | ✅ | ✅ | 0 | dirty 상태에서 취소 클릭 → confirm dialog 노출 확인 |
| 5차 (D12·D13 초안) | 20260521-230241 | ✅ | ✅ | ✅ | 0 | action_bar form_col 끝 일반 흐름 / edit 라벨 "공개로 게시" |
| 6차 (D12 정정) | 20260521-231018 | ✅ | ✅ | ✅ | 0 | PC: form_col 끝 일반 흐름 / 모바일: fixed bottom 복원 |
| 7차 (D14) | 20260521-231939 | ✅ | ✅ | ✅ | 0 | 모바일 미리보기 토글 / 시트 열린 채 action_bar 노출 / publish 즉시 가능 |
| 8차 (D15) | 20260521-232950 | ✅ | ✅ | ✅ | 0 | edit breadcrumb 실제 sermon 제목 표시 / 모바일 길면 ellipsis |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.
-->

## 후속 작업

- **G 항목(모바일 미리보기 BottomSheet)** — `sermons-form-mobile-sheet` plan으로 분리. 선행: portal admin 토큰 정책 결정(`.shell` → `:root` 승격 또는 globals 교체 또는 admin-tokens wrapper). ADR 후보. 기록 위치: 본 plan D5 + `docs/tech-debt-tracker.md`에 신규 항목 추가 검토.
- E 항목(어드민 행·`<th>` 키보드) — `sermons-admin-interaction` plan에서 진행
- O 항목(view count + RPC overload) — `sermons-view-count-side-effect` plan에서 진행
- B 항목(`queueMicrotask` 5건) — 전역 `queue-microtask-cleanup` task
- J·K 항목(`select('*')`·단언 정리) — PR #99 D4 후속, 공개·어드민 동시 정리 약속분

## ADR 판단

- 변경 파일에 `src/actions/sermon.action.ts` 포함(ADR_TRIGGER_PARTS 해당).
- 변경 내용은 validation 로직 SSOT 추출. 새 의존성·새 외부 contract·아키텍처 축 변화 없음. scripture 필수화는 도메인 규칙 강화로 도메인 리뷰 P + D1에 기록.
- 판단: ADR 미발급. Codex 계획 검증에서 재확인.
