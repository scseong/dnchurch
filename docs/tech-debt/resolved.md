# Tech Debt — Resolved

해결된 기술 부채 기록. 머지 후 [`active.md`](active.md)에서 옮겨 온다. 회고 검색·과거 회상용. 형식 규칙은 [`../tech-debt-tracker.md`](../tech-debt-tracker.md) 참조.

---

### ✅ 마이페이지가 미완성 — 인증 확인·본문 없음 (2026-07-19 해소, my-page PR #153)

- **부채**: BottomNav 5번째 탭 `/mypage`가 `Mypage` 텍스트만 렌더하고, 인증 확인·로그인 리다이렉트가 없어 상시 노출 탭이 미완성 화면으로 이어졌다 (2026-06-26 PR #132 codex 재리뷰 #C에서 등록).
- **해소**: my-page PR #153에서 실제 회원 페이지를 만들었다. `page.tsx`가 `getMySessionProfile()`로 세션을 확인하고 없으면 `redirect('/login?redirect=/mypage')`로 보낸다(`src/app/(content)/mypage/page.tsx:18-21`). 본문은 프로필 편집·비밀번호 변경·로그아웃, 성경읽기 기록기·기록 공유, 설정 시트, 부서·구역 표시로 채웠다. exec-plan 5개(mypage-design-parity·mypage-settings-sheet·bible-share-actions·bible-share-og-image·mypage-dept-fellowship)로 나눠 진행했다.
- **확인**: `docs/exec-plans/completed/2026-07-18-mypage-design-parity.md` 외 4건 + `src/app/(content)/mypage/page.tsx`의 세션 확인·리다이렉트.

### ✅ FeedContent `.badge_category` mixin 미적용 (2026-06-29 해소 — 대상 소멸)

- **부채**: `src/app/_component/home/FeedContent.module.scss`의 카테고리 뱃지가 caption mixin 없이 직접 토큰을 조합했다. 뱃지의 `line-height: 1` 의도와 `text-caption-strong`의 1.45가 충돌해 mixin을 얹지 못했다 (2026-05-04 design-system-v3 Step 3 발견)
- **해소**: 별도 수정 없이 대상이 사라졌다. 커밋 `a2e0ee3`(2026-06-29, 새가족 등록 공개 폼과 교회 소개·홈 리디자인)이 FeedContent 컴포넌트를 삭제했다
- **확인**: `rg "badge_category" src` → 0 hit, `src/app/_component/home/FeedContent.*` → 파일 없음 (2026-07-02 재확인)

### ✅ `complete-task.mjs` 패턴 매칭 부정확 (2026-06-21 해소, PR #131)

- **부채**: `find -name "*${PATTERN}*.md"` substring 매치라 `phase1` 입력이 `phase1-5`에도 걸려 다중 매칭으로 차단됐고, `phase1.md` 입력은 `*phase1.md*.md`로 깨졌다 (2026-05-01 발견, 수동 mv로 우회)
- **해소**: 파일명에서 날짜 접두사와 `.md`를 뗀 slug를 입력과 정확히 비교하는 방식(`slugFromFilename(name) === pattern`)으로 바꿨다. 매칭이 없으면 현재 active slug 목록을 보여준다 (PR #131 작은 기술 부채 묶음)
- **확인**: `scripts/complete-task.mjs:84-99` — 정확 일치 비교 + 미매칭 시 slug 목록 출력 (2026-07-02 재확인)

### ✅ queueMicrotask 4건 — effect 안 setState 우회 (2026-06-21 해소, PR #131)

- **부채**: `useMediaQuery.ts`·`useListFilters.ts`·`DesktopHeader.tsx`·`NoticeControlBar.tsx`가 effect 안 setState를 `queueMicrotask`로 감싸 `react-hooks/set-state-in-effect` 경고만 껐다. 정작 연쇄 재렌더는 그대로 두었다. 프로젝트 금지 규칙(memory `feedback_no_queue_microtask`) 위반이었다. active.md에 "사용 4건"과 "set-state-in-effect 우회 4건" 두 항목으로 적혀 있었으나 가리키는 대상은 같은 4개 파일이다.
- **해소**: 사이트별로 다른 패턴을 썼다. `useMediaQuery`는 `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot=()=>false)`로 전환해 effect·setState 자체를 없앴다. 나머지 셋은 렌더 중 prev-state 보정(`if (x !== prevX) { setPrevX(x); ... }`)으로 바꿔 외부 값이 바뀔 때만 한 번 보정한다. `useSearchSync`가 쓰던 검증된 패턴이다 (remove-queue-microtask task)
- **확인**: `grep -rn "queueMicrotask" src` → 실제 호출 0건(주석 2건만). verify-task(`20260619-221353`) lint·styles·build 통과, ESLint `set-state-in-effect` 신규 0. Codex는 Windows 샌드박스 오류로 막혀 Claude 직접 검증으로 대체(PASS). PR #131 Gemini의 `useMemo` 메모이즈 제안은 범위 밖 성능 지적이라 받지 않기로 하고(Codex 교차 검증 REJECT) 기각

### ✅ 쓰이지 않는 코드 2건 — SeriesEpisodeList·updatePassword (2026-06-21 해소, PR #131)

- **부채**: `SeriesEpisodeList` 디렉토리(`.tsx`+`.module.scss`)는 import 0건이었다. PR #90 이후 `SermonSeriesSidebar`가 같은 회차 목록 기능을 서버 컴포넌트로 따로 구현해 중복이었다. `apis/auth.ts`의 `updatePassword`는 호출자 0건이고, 실제 비밀번호 변경은 reset-password의 `updatePasswordAndSignOut`이 담당했다. active.md에 "쓰이지 않는 코드 2건"과 "SeriesEpisodeList 컴포넌트 미사용" 두 항목으로 적혀 있었다
- **해소**: 두 코드를 삭제했다 (tech-debt-small-batch task). `apis/auth.ts`의 `getSupabaseBrowserClient`는 남은 함수가 계속 써서 미사용 import가 생기지 않았다
- **확인**: `rg "SeriesEpisodeList" src` → 0 hit, `rg "\bupdatePassword\b" src` → 0 hit. Knip 미사용 목록에서 두 항목이 빠졌다. verify-task(`20260619-213402`) 통과

### ✅ SCSS 네이밍 패턴 위반 (2026-06-21 해소, PR #131)

- **부채**: className이 snake_case가 아닌 5건(`imageBox`·`buttonGroup`·`primaryButton`·`yearList`·`hidden-on-mobile`), SCSS 변수가 kebab-case가 아닌 3건(`icon_box_size`·`modal_padding`·`image_max_width`). active.md는 12건으로 적었으나 stylelint 실측은 8건이었다
- **해소**: className 5건을 snake_case로, 변수 3건을 kebab-case로 바꿨다. className은 scss 정의와 `.tsx` 참조(`styles.x`·class 문자열)를 함께 고쳤다 (tech-debt-small-batch task)
- **확인**: `npx stylelint "src/**/*.scss"`의 selector-class-pattern·dollar-variable-pattern 경고가 8건에서 0건. verify-task(`20260619-213402`) stylelint 통과

### ✅ 알 수 없는 `?preacher=` 값이 전체 설교를 보여줌 (2026-06-21 해소, PR #131)

- **부채**: `/sermons/all?preacher=<없는이름>`은 `resolvePreacherName`이 `undefined`를 반환해 필터가 걸리지 않고 전체 설교가 떴다. 존재하지만 발행 0편인 설교자(빈 결과)와 동작이 어긋났다. 시리즈에는 `isUnknownSeries` 가드가 있었으나 설교자에는 대응 가드가 없었다
- **해소**: `sermons/all/page.tsx`에 `isUnknownPreacher`(원문 `preacher`가 있는데 `allPreachers`에 없음)를 더하고, 기존 `isUnknownSeries` 반환 블록에 `||`로 합쳐 같은 EmptyState로 떨어뜨렸다. series 가드가 먼저 평가돼 `resolveSeriesSlug` 전에 빠져나가던 기존 throw 방지도 유지된다 (tech-debt-small-batch task)
- **확인**: Codex 계획·1차 검증 PASS. verify-task(`20260619-213402`) 통과. 사용자 영향 — 미매칭 설교자 URL이 이제 빈 상태를 보인다

### ✅ 설교 상세 JSON-LD가 `<` 이스케이프 없이 삽입됨 (2026-06-21 해소, PR #131)

- **부채**: `sermons/[id]/page.tsx`의 `buildJsonLd`가 `JSON.stringify(jsonLd)`를 이스케이프 없이 `dangerouslySetInnerHTML`에 넣었다. `sermon.title`·`summary`가 admin 편집값이라 `</script>`가 섞이면 스크립트 태그가 일찍 닫혀 코드가 주입될 여지가 있었다(XSS). church-jsonld(PR #128)는 홈 JSON-LD에 같은 패턴을 막았으나 sermons에는 갭이 남아 있었다
- **해소**: `JSON.stringify(jsonLd).replace(/</g, '\\u003c')`를 적용해 `<` 문자를 이스케이프했다. 홈 `ChurchJsonLd.tsx:62`와 같은 방식이다 (tech-debt-small-batch task)
- **확인**: `dangerouslySetInnerHTML` 3곳 전수 확인 — `ChurchJsonLd`·sermons 둘 다 이스케이프됨, `layout.tsx`는 숫자 상수만 삽입(갭 아님). Codex 1차 검증 PASS

### ✅ 하위 페이지 og:image 소실 — openGraph 부분 선언 (2026-06-19 해소, PR #129)

- **부채**: 하위 페이지가 `generateMetadata`에서 `openGraph`를 부분 선언하면, Next.js가 `openGraph` 객체를 얕게 병합(shallow merge)하면서 root layout의 og:image(기본 배너)가 사라졌다. 공유·검색 미리보기 이미지가 빈 상태였다. about/*는 그 사이 `OPEN_GRAPH_BASE` 펼침으로 고쳐졌고, sermons·news 계열이 남아 있었다
- **해소**: `src/config/seo.ts`에 `OG_FALLBACK_IMAGE` 상수를 두고 `OPEN_GRAPH_BASE`·`CHURCH_INFO.image`가 참조하게 모았다. 정적 목록 4개(`sermons`·`sermons/all`·`sermons/series`·`news/bulletins`)는 `...OPEN_GRAPH_BASE`를 펼쳐 배너를 상속하고, 동적 상세 3개(`sermons/[id]`·`sermons/series/[id]`·`news/bulletins/[id]`)는 콘텐츠 이미지가 없을 때 `[{ url: x || OG_FALLBACK_IMAGE }]`로 배너를 채운다. `openGraph` 미선언 페이지는 root를 상속해 원래 정상이었다
- **확인**: prod 서버(빌드 산출물)에서 목록 4개가 `og:image = .../images/aboutBanner.jpg` 출력, 상세 `/sermons/3`은 Cloudinary 콘텐츠 썸네일 유지. verify-task(`20260619-145827`)·harness-gate 통과. PR 봇은 Gemini 3건 반영·Codex 👍

### ✅ 라우트·영역별 not-found가 모두 루트 404로 떨어짐 (2026-06-17 해소)

- **부채**: 설교·admin의 `notFound()`가 모두 루트 다크 404로 떨어졌고, `news/notices/[id]/page.tsx`는 미구현 스텁(`<div>page</div>`)이라 없는 공지 id에 HTTP 200 "page"가 떴다 (2026-06-10 not-found-page 작업 중 발견)
- **해소**: 세 갈래 모두 후속 커밋으로 처리됐다.
  - 설교·admin: `src/app/(content)/sermons/not-found.tsx`·`src/app/(admin)/not-found.tsx` 추가 — 커밋 `b368478`(2026-06-11)
  - 공지 상세: 커밋 `ce52879`(2026-06-17)가 죽은 스텁을 삭제해, 없는 공지 경로는 라우트가 없어 404로 떨어진다
- **확인**: `src/app/**/not-found.tsx` 5개(root·sermons·admin·bulletins·notices), `src/app/(content)/news/notices/[id]/` 디렉토리 없음 (2026-07-02 재확인). 공지 상세를 다시 구현할 때 조회 실패 시 `notFound()` 호출을 넣어야 한다

### ✅ portal 컴포넌트 하이드레이션 불일치 (2026-06-15 해소, PR #122)

- **부채**: `BottomSheet.tsx`·`Modal.tsx`이 `typeof window` 가드 뒤 `createPortal`을 호출하면서 항상 렌더된다. 서버는 null, 첫 클라는 portal이라 hydration mismatch가 났다. `/sermons/[id]` 공유 BottomSheet에서 React 콘솔 에러로 확인했다(dev 출력, prod도 동일)
- **해소**: 공통 `src/components/ui/ClientPortal`(mounted two-pass)로 서버·첫 클라 렌더를 둘 다 null로 맞춘 뒤 `useEffect` 이후 portal을 만들고, `getElementById('modal-root') ?? document.body` 타깃 해석도 모았다. Modal·BottomSheet를 래핑하고, NoticeDrawer는 `!isOpen`이라 SSR에서 mismatch가 없어 redundant `typeof window`만 제거했다
- **확인**: `/sermons/2` 하드 리로드 시 콘솔 hydration 경고 0(Chrome 실측). 공유 BottomSheet가 정상으로 열린다. verify-task·Codex 계획·1차 모두 PASS

### ✅ 마이그레이션이 DB를 재현하지 못함 (2026-06-12 해소, migration-ssot-recovery)

- **부채**: `supabase/migrations/`만으로 빈 DB를 만들면 실패했다. `profiles`·`bulletins`·`bulletin_images`·`notices`의 `CREATE TABLE`이 어느 마이그레이션에도 없었고(대시보드에서 손으로 생성), `001_sermon_schema.sql`은 실제 스키마와 어긋났다 — `sermons.id`가 파일은 `UUID`인데 실제는 `bigint`, 컬럼명 `date` vs `sermon_date`. `seed.sql`도 `date` 컬럼명을 썼다 (2026-06-11 PR #115에서 Gemini·Codex 리뷰가 동시 지적)
- **해소**: baseline 마이그레이션 추가 + `001` 재작성 + `get_adjacent_bulletins` 추가로 Preview 빈 DB가 dev와 일치한다(테이블·컬럼·enum·RLS·트리거)
- **남은 어긋남**: dev에 `custom_access_token_hook` 함수가 없어 `config.toml:178` 선언·마이그레이션 `20260425000000`과 어긋난다(fresh 빌드는 함수를 만들므로 미래 prod는 정상). 2026-07-02 dev `pg_proc` 실측으로 재확인 — 이후 추적은 active.md "DB 위생 남은 분" 항목의 뿌리 원인 절이 잇는다
- **확인**: Supabase Preview replay 성공. PR #139 `20260702000001_db_hygiene.sql`도 fresh replay 가드를 넣어 통과 (2026-07-02)

### ✅ `supabase` named export deprecated 제거 (2026-06-02 해소, PR #108)

- **부채**: `client.ts`의 deprecated `supabase` named export가 모듈 로드 시 클라이언트를 즉시 만들어 lazy 싱글톤과 인스턴스가 둘로 갈렸다
- **해소**: export를 제거하고 `auth.ts` 6함수·SessionContextProvider를 `getSupabaseBrowserClient()` 호출로 교체했다. CLAUDE.md gotcha도 갱신했다
- **확인**: `rg "import \{ supabase \}" src` → 0 hit

### ✅ focus-ring 패턴 통일 (2026-06-02 해소, PR #108)

- **부채**: `:focus-visible` outline 10곳과 `Pagination.module.scss`의 `:focus` outline 1곳이 색·폭·offset을 직접 선언해 SSOT가 없었다
- **해소**: `focus-ring($variant, $offset)` mixin(`@content`로 추가 속성 수용)과 `$focus-ring-strong-color` 토큰을 도입해 11곳(Notice 8·ListItem·SermonNoteEditor·Pagination)을 교체했다
- **확인**: `rg -n ":focus|outline" src/components/ui/Pagination/Pagination.module.scss` → transition 선언 1건, focus outline 선언 0건. admin box-shadow 패턴은 범위 밖
- **후속 (2026-06-15, focus-ring-unify)**: PR #108이 범위 밖으로 둔 마지막 두 곳을 마무리했다. `ui/Select`의 수동 `outline: 2px`를 `focus-ring` mixin으로 바꾸고(고정 px → 공통 토큰 링), admin focus(`dropdown`·`primitives`·`AdminHeader`)를 admin accent `$primary-soft` + glow `$primary-soft-subtle` 한 recipe로 통일했다. 하드코딩 `rgba(91,107,165,0.08)`도 `$primary-soft-subtle` 토큰으로 바꿨다. content/ui 입력 4개는 이미 `border-color: $border-focus`로 일관해 손대지 않았다.

### ✅ useDrawerHistory 라우트 이동 시 가짜 history 항목 (2026-06-02 해소, PR #108)

- **부채**: 드로어를 열고 메뉴로 이동하면 push한 sentinel 항목이 스택에 남아 뒤로가기를 두 번 눌러야 했다
- **해소**: `MobileNavigation` Link 5개에 `replace`를 붙였다. 드로어가 열린 상태에선 현재 항목이 sentinel이라 그 항목을 목적지로 교체한다. 플랜의 effect cleanup은 라우트 이동 후 발동 불가로 폐기했다(D11)
- **확인**: Chrome 실측 — 이동 후 뒤로가기 1회로 이전 페이지, history.length 불변

### ✅ services/about Supabase silent fallback 로깅 부재 (2026-06-02 해소, PR #108)

- **부채**: `getSiteCollection`·`getSiteSettings`·`getActiveStaff`·`getWorshipGroupsSafe`가 DB error를 삼키고 빈 값으로 fallback해 운영에서 검출이 안 됐다
- **해소**: 네 조회 흐름에서 error를 백틱 `console.error`로 1줄 기록했다. 빈 값 fallback은 유지(ADR 0006 silent fallback)
- **확인**: Vercel 함수 로그에 `[domain] ... 조회 실패` 또는 `[about] getWorshipScheduleGroups 조회 실패`가 출력된다

### ✅ about/serving-people 구분선 #eee (2026-06-02 해소, PR #108)

- **부채**: `serving-people/page.module.scss`의 `.divide`가 `border: 1px solid #eee`로 hex를 하드코딩했다
- **해소**: `$border-subtle`(얕은 구분선 토큰)로 교체했다
- **확인**: about 영역 `.module.scss` hex 0건

### ✅ typography 리터럴 0.8/0.9rem (2026-06-02 해소, PR #108)

- **부채**: font-size 0.9rem 3곳과 0.8rem 7곳이 토큰 없이 박혀 있었다
- **해소**: 0.9rem을 `$font-size-11`(접근성 상향)로, 0.8rem을 `$spacing-8`(반응형: 모바일 0.6rem, 데스크톱 0.8rem)로 바꿨다
- **확인**: 해당 10곳의 0.8/0.9rem 리터럴 0건. Chrome 실측에서 배지 글자 1.1rem 적용

### ✅ `$beige-300` semantic 매핑 부재 (2026-06-02 해소, PR #108)

- **부채**: QuickAccess 배경과 SermonVideoPlayer 그라데이션이 primitive `$beige-300`을 직접 썼다
- **해소**: `$bg-secondary-deep`($beige-300) 시맨틱 토큰을 신설해 두 곳을 치환하고 `.claude/skills/styles/SKILL.md`의 매핑 표에도 추가했다. 플랜의 2토큰 제안은 같은 값·같은 의미라 1개로 통합했다
- **확인**: `rg "\$beige-300" src/app src/components` → 0 hit. `rg "\$beige-300은 미정" .claude/skills/styles/SKILL.md` → 0 hit. 값이 같아 시각 변화 0

### ✅ Cloudinary 업로드 화질 q_85 고정 (2026-06-02 해소, PR #108)

- **부채**: 업로드 로더가 `q_${quality || 85}`로 기본 화질을 85%로 고정했다
- **해소**: `q_${quality || 'auto:good'}`로 바꿨다(Next가 quality 인자를 주면 그 값 우선, 기본은 auto:good). 외부 fetch 경로는 이미 q_auto
- **확인**: `src/utils/cloudinary.ts:90` 로더가 q_auto:good

### ✅ Cloudinary use-case preset 부재 (OG·카카오) (2026-06-02 해소, PR #108)

- **부채**: OG·카카오 공유 이미지가 원본을 그대로 써서 크기·품질 통제가 없었다. 설교 OG는 외부 YouTube URL이라 변환도 안 걸렸다
- **해소**: `getOgImageUrl`(1200x630)·`getKakaoShareUrl`(800x400)을 도입했다. public_id는 image/upload, 외부 URL은 image/fetch로 같은 변환을 건다(D12). sermons·series·bulletins OG와 공유에 연결했다
- **확인**: `/sermons/3` og:image가 fetch 변환 URL로 HTTP 200 image/jpeg. `getThumbnailUrl`은 소비처가 없어 보류

### ✅ bulletin 업로드 부분 실패 시 orphan 이미지 잔존 (2026-05-31 해소, PR #105)

- **부채**: `uploadBulletinImages`가 `Promise.all`로 5장을 병렬 업로드한다. 1장이라도 실패하면 throw로 끝나는데, 이미 올라간 이미지는 Cloudinary에 주인 없이(orphan) 남았다
- **해소**: `Promise.allSettled`로 바꿔, 일부 실패 시 성공한 `public_id`를 `deleteImage`로 모두 청소한 뒤 첫 rejection을 재throw한다. 호출처(create-bulletin·update-bulletin action)의 기존 try/catch cleanup 흐름은 그대로 둔다
- **확인**: `src/actions/_bulletin-helpers.ts:22-42` Read 확인. verify-task(20260531-193838) lint·styles·build 통과
- **참고**: exec-plan `completed/2026-05-31-bulletin-upload-safety`, tech-debt-pre-release Phase 1(G1)

### ✅ bulletin 이미지 filename 충돌로 기존 자산 overwrite (2026-05-31 해소, PR #105)

- **부채**: 업로드 filename이 sanitize만 거쳐서, 같은 날 폴더(`uploads/bulletins/YYYY/MM/DD`)에 같은 이름 파일을 다시 올리면 `public_id`가 겹쳐 기존 이미지를 덮어썼다
- **해소**: filename을 `${orderIndex}-${randomUUID().slice(0,8)}-${sanitized}` 형식으로 바꿨다. orderIndex는 같은 폼 안 순서를 지킨다. 8자리 UUID는 다른 세션이나 같은 날 다시 올려도 충돌을 막는다
- **확인**: `src/actions/_bulletin-helpers.ts:24-27` Read 확인. 같은 이름으로 다시 올려도 public_id 충돌 0
- **참고**: exec-plan `completed/2026-05-31-bulletin-upload-safety`, tech-debt-pre-release Phase 1(G1)

### ✅ nav pathname 매칭이 segment boundary 무시 (2026-05-31 해소)

- **부채**: `isActiveGnb`·`resolveBreadcrumbSegments`·`isActiveBottomNav`·`resolveSiblingTabs`가 그냥 `pathname.startsWith(href)`로 매칭했다 — `/newsroom`이 `/news`에, `/about-us`가 `/about`에 걸리는 형제 prefix 오탐이 생길 수 있었다. resolver마다 경계 규칙(`startsWith` 단독 / `startsWith(href+'/')` / `===`)도 달랐다
- **해소**: `navigation.ts`에 `isRouteMatch(pathname, href) = pathname === href || pathname.startsWith(href + '/')` 함수를 추가해 `isActiveGnb`·`isActiveBottomNav`·`resolveSiblingTabs`·`resolveBreadcrumbSegments`·`resolveMobileHeader` 자식 매칭에 일괄 적용했다. 현재 라우트에는 충돌이 없어 동작이 그대로이고, 앞으로 생길 형제 prefix 오탐을 미리 막는다
- **확인**: `tsc --noEmit` exit 0, verify-task 필수 4단계 통과
- **참고**: sitemap-consistency-fix Codex 유지보수 리뷰가 즉시 수정으로 지목, exec-plan `2026-05-22-sitemap-consistency-fix` 의사결정 로그 D11

### ✅ resolveHeroMeta subtitle comparator 오류 (2026-05-31 해소)

- **부채**: `for (key of HERO_META) if (categoryKey.startsWith(key) && key.length > subtitle.length)` — 경로 키 길이를 직전 최장 키 길이가 아니라 누적 subtitle 텍스트 길이와 비교하는 비교 로직 오류였다. 현재 데이터에선 도달할 수 없었으나 중첩 키를 추가하면 잘못된 subtitle을 표시할 위험이 있었다
- **해소**: `categoryKey`가 항상 2-세그먼트 루트이고 `HERO_META` 키도 전부 2-세그먼트 루트라, 망가진 루프를 `const categoryMeta = HERO_META[categoryKey]` 직접 조회로 바꿨다. 동작은 그대로이고, 비교 로직 자체를 없앴다
- **확인**: `tsc --noEmit` exit 0, `/sermons/all` Hero subtitle이 `/sermons` 카테고리 subtitle과 동일하게 유지됨
- **참고**: sitemap-consistency-fix Codex 유지보수 리뷰가 즉시 수정으로 지목

### ✅ admin 토큰 통합 (ADR 0012) (2026-05-26 해소, PR #102)

- **부채**: `AdminLayout/index.module.scss`의 `.shell` scope에 `--admin-*` 26종 + 레이아웃 3종(`--header-h`·`--sidebar-w`·`--sidebar-w-collapsed`) CSS 커스텀 프로퍼티가 메인 토큰과 분리된 채 admin 13 파일에서 340회 호출됨
- **해소**: ADR 0012(흡수)로 신규 SCSS 토큰 20개(`_color.scss` 17 + `_layout.scss` 3) 추가, 직접 매핑 9개는 기존 토큰 재사용. admin 13 파일 340 사용처를 `$bg-admin`·`$primary-soft`·`$status-*-soft`·`$bg-dark-nav-*` 등으로 치환하고 `.shell` 정의 블록 제거. admin cool 톤은 보존(색 통일 아님)
- **확인**: `rg 'var\(--admin-|var\(--sidebar-w|var\(--header-h' src` → 0 hit. 빌드 PASS
- **참고**: `docs/decisions/0012-admin-token-unification.md`, exec-plan `2026-05-22-admin-token-unification`

### ✅ `verify-task.mjs` 전체 검증이 사전 부채에 항상 막히던 문제 (2026-05-01)

- `verify-task.mjs`는 ESLint/stylelint/build를 필수 통과 조건으로 유지하고, Knip은 현재 부채를 경고로 기록한다.
- 결과는 `logs/<task-id>/<run-id>/`에 증적으로 남고, `enforce-verification.mjs`와 `harness-gate.mjs`가 현재 diff와 PASS 기록의 일치 여부를 확인한다.
- 확인: `node scripts/verify-task.mjs harness-engineering-dogfood` 통과, `node scripts/harness-gate.mjs harness-engineering-dogfood` 통과.

### ✅ ESLint errors 13건 청산 (2026-05-01)

- 청산된 부채: `react-hooks/refs` 10 + `react-hooks/immutability` 1 + `prefer-const` 1 + `@typescript-eslint/no-require-imports` 1 = 13건
- 처리:
  - `react-hooks/refs` 10: ConfirmModal snapshot 패턴 (의도된 디자인) — 라인별 룰 disable + 의도 주석
  - `react-hooks/immutability` 1: useTimer 함수 순서 재정렬 (`stop`을 `tick` 위로, deps 추가)
  - `prefer-const` 1: middleware.ts `let` → `const` (자동 수정)
  - `no-require-imports` 1: next.config.ts `require()` 라인 룰 disable (Next.js 공식 패턴)
- 처리 EXEC_PLAN: `tech-debt-cleanup-phase1`

### ✅ design-system-v3 Step 4 Codex 사후 1차 검증 (2026-05-07)

- **사후 검증 대상**: design-system-v3 Step 4 커밋 3개 — `89f6850` (호출처 22개 alias 치환), `81e5c4c` (미사용 mixin·alias 정의 제거), `a635df8` (검증 기록 docs)
- **검증 항목 3가지 모두 PASS**:
  - (1) boundary 정확도 — `rg '\$[[:alnum:]_-]+[0-9]+%' src` 0건. prefix collision (`$navy/$navy-mid/$navy-light` 등) 모두 canonical token으로 정상 종결.
  - (2) admin diff 범위 — admin 변경은 `$line-height-heading→snug` (1) + `$border-secondary→$border-strong` (2) 단일 토큰 치환만. `var(--admin-*)` 미변경 — 후속 ADR 0004 영역 미침범.
  - (3) gradient 복구 — `Hero.module.scss:29`, `SermonListPage.module.scss:277(원 :330)` 모두 `$navy-950 0%` 정상 형태로 복구.
- **결과 기록**: `docs/exec-plans/completed/2026-05-04-design-system-v3.md` "Codex 1차 검증 → Step 4 (사후)" 섹션

### ✅ design-system-v4 home cleanup — `$bg-section` 토큰화 + Hover Border 6건 (2026-05-07)

- **청산 부채 2건**:
  - (1) `$bg-section: #fdfaf5` 로컬 hex (NewHere.module.scss:2) — `_color.scss`에 `$cream-100: #fdfaf5` primitive + `$bg-cream-subtle: $cream-100` semantic 1쌍 신규 추가, NewHere에서 토큰 참조로 교체.
  - (2) Hover Border 위반 home 6건 — SKILL Hover 3원칙 #3 위반.
    - A 그룹 link underline 5건 (FeedContent `.more_link`, RecentSermons `.header_link`, NewHere `.faq_link`/`.cta_link`, AboutOurChurch `.about_link`): `border-bottom + transition border-color`을 `text-decoration: underline + text-decoration-color + text-underline-offset` 패턴으로 일괄 교체.
    - B 그룹 SermonCard 1건 (`.card:hover .play_btn`): `border-color: $gold-600` hover 라인 + transition list `border-color` 라인 제거. 정적 border는 유지.
- **검증**: Codex 1차 PASS, Claude 2차 PASS, `verify-task.mjs` 필수 검증 통과 (`logs/design-system-v4-home-cleanup/20260507-232034/`).
- **참고**: `feat/common-components-v4` 브랜치에 등록된 "Hover Border 위반 — 디자인 시스템 v4 미완 남은 부분 (10건)" 부채 중 home 5건 + SermonCard 1건 분량을 본 작업으로 정리. admin 5건은 후속 ADR 0004 영역으로 분리 보존.
- **결과 기록**: `docs/exec-plans/completed/2026-05-07-design-system-v4-home-cleanup.md` (머지 후 이동 예정)

### ✅ `serverActions.bodySizeLimit` ↔ bulletin upload 정책 불일치 (2026-05-11)

- **부채**: `bodySizeLimit: '5mb'` vs bulletin UI 5MB × 최대 5장(=25MB). multi-upload 시 Server Action 진입 전 차단 가능 (PR #82 Codex 리뷰에서 등록)
- **해소**: about-page-qa fix에서 `next.config.ts:24` `bodySizeLimit`을 `5mb` → `30mb`로 상향. 25MB 정책 수용
- **확인**: 변경 1줄. 빌드/lint PASS
- **참고**: sermon 자료 단일 50MB 한도(`src/lib/sermon-resource.ts`)는 운영상 차단 사례 미확인 — 발생 시 별도 부채로 등록

### ✅ `allSeriesIncludingInactive` 전제 오류 — 완료축을 is_active로 착각 (Phase 4) (2026-05-16 해소)

- **상태**: ✅ 해결됨 — `allSeriesIncludingInactive`/wrapper/`seriesListAll` 태그 삭제, `series/page.tsx`가 `getAllSeries()` 재사용, `filterSeries`·`SeriesCard` `ended_at` 축 전환. verify PASS·Codex 1차 PASS·Claude 2차 교차 클린. exec-plan "전제 오류 정정" 참조
- **무엇**: `feat/sermons-all-series`(미PR) Phase 4가 "완료 시리즈도 목록 노출" 목적으로 `is_active` 필터를 제거한 `allSeriesIncludingInactive`/`getAllSeriesIncludingInactive` 신설
- **왜 오류**: dnchurch에서 `is_active`=공개 노출 게이트(`worship`/`staff`/`allSeries`/`bySeriesSlug`/`allPreachers` 일관), 완료 판정은 별축 `ended_at`(`page.tsx:45`·`SermonSeriesBanner:23`·`SermonSeriesSidebar:17`). 완료 시리즈는 `is_active=true`+`ended_at!=null`이라 **`allSeries`(is_active=true)가 이미 완료 포함** → `allSeriesIncludingInactive`는 불필요할뿐 아니라 숨김(is_active=false) 시리즈까지 목록 노출(PR #92 #4와 동형 결함). Phase 4 계획 Codex CR-1("getAllSeries가 완료 제외")이 데이터 검증 없이 채택된 게 근인(dev DB 완료 시리즈 0건이라 미검출)
- **마이그레이션 경로**: Phase 4 PR 전 (a) `allSeriesIncludingInactive` 폐기하고 `allSeries` 재사용 가능 여부 확인(완료 시리즈 표시는 ended_at 분기로), (b) 불가 시 `is_active=true` 유지한 채 정렬만 조정
- **영향 범위**: `src/services/sermon/sermon-service.ts`, `src/services/sermon/index.ts`, `feat/sermons-all-series` 브랜치 Phase 4 전반
- **발견일**: 2026-05-15 (PR #92 #4 진단 중 동형 오류 발견)
