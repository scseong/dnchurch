# Tech Debt Tracker

알려진 기술 부채와 마이그레이션 진행 상황. 발견 즉시 추가하고, 해결되면 항목 이동(아카이브)한다.

## 형식

각 항목은 다음 필드를 갖는다:

- **상태**: 🔴 시급 / 🟡 진행 중 / 🟢 마이그레이션 가능 / ✅ 해결됨
- **무엇**: 무엇이 부채인가
- **왜**: 왜 부채인가 (당시 결정·제약)
- **마이그레이션 경로**: 어떻게 해결하는가
- **영향 범위**: 어떤 파일/모듈이 관련 있는가
- **발견일** / (있다면) **목표 해결일**

---

## 활성 항목

### 🟡 `supabase` named export deprecated

- **무엇**: `src/lib/supabase/client.ts`의 `supabase` named export
- **왜**: 초기에 단일 client 인스턴스로 시작했으나, 용도별 분리(browser/server-side/static/admin) 필요해짐
- **마이그레이션 경로**: import 사이트마다 `getSupabaseBrowserClient()`로 교체
- **영향 범위**: `import { supabase } from ...` 검색으로 추적
- **발견일**: 미상 (CLAUDE.md Gotchas에 기존 기록)

### 🟡 `app/ → apis/` 직접 호출 (레이어 위반, 9건)

- **무엇**: 페이지·홈 컴포넌트가 `services/` 경유 없이 `apis/`를 직접 import
- **왜**: 초기 단순 구조에서 services 레이어 도입 전에 작성된 코드
- **현재 상태**: ESLint 룰 `error`로 격상됨 — 신규 위반은 즉시 차단. 기존 항목은 line-level `eslint-disable-next-line no-restricted-imports` + tech-debt 주석으로 마킹
- **마이그레이션 경로**: 각 호출 사이트를 `services/` 또는 Server Component data fetcher 경유로 교체. 모두 해결되면 disable 주석 일괄 제거
- **영향 범위** (9건):
  - `src/app/(content)/about/{serving-people,location}/page.tsx`
  - `src/app/_component/home/{Banner,AboutOurChurch}.tsx`
  - `src/app/_component/user/UserProfileModal.tsx`
  - `src/app/_component/auth/{SignUpForm,SignInForm,KakaoLoginBtn,EmailVerificationRequestForm}.tsx`
  - (auth는 클라이언트 직접 호출이 정당할 수 있어 정책 결정 필요)
- **발견일**: 2026-05-01 (ESLint 레이어 룰 도입 시)
- **2026-05-02**: `worship/page.tsx` 해소 (`services/worship/` 도입, `apis/worship-schedules.ts` 제거) — 10건 → 9건

### 🟢 focus-ring 패턴 통일 (10곳)

- **무엇**: globals 외 10곳의 `:focus-visible` outline이 색·width·offset가 제각각. 색은 `$primary`/`$primary-active`/`$border-focus`/`$border-primary` 4종, width는 `0.2rem`/`2px` 혼재, offset은 양수·음수 혼재
- **왜**: focus-ring 토큰(`$focus-ring-{width,offset,color}`)이 도입되기 전(2026-05-10 이전) 영역별로 자유롭게 작성됨. globals만 본 PR에서 토큰화 완료
- **마이그레이션 경로**: 영역별 분리 PR로 새 토큰(또는 신설 mixin) 적용. 음수 offset(NoticeTable)·`$primary-active` 사용(NoticeDrawer/Table/ControlBar)·`$border-primary` 사용(Pagination)이 의도인지 케이스별 검토 후 통일 또는 토큰 다양성 추가
- **영향 범위** (10곳):
  - `src/components/ui/Pagination/Pagination.module.scss:39-40` — `$border-primary` 사용 (의도 검토 필요)
  - `src/components/ui/ListItem/ListItem.module.scss:25-26` — `$border-focus` + negative offset
  - `src/app/(content)/news/notices/_component/NoticeDrawer.module.scss:127-128, 207-208` — `$primary-active` + 2px
  - `src/app/(content)/news/notices/_component/NoticeTable.module.scss:48-49, 204-205` — `$primary-active` + negative offset
  - `src/app/(content)/news/notices/_component/NoticeControlBar.module.scss:51-52, 82-83, 107-108, 169-170` — `$primary-active` + 2px (4곳 동일 패턴)
- **확인**: `rg ':focus|outline' src -g '*.scss'` (focus-state 전반 추적성 — outline-ring 외 :focus·:focus-within·outline:none 패턴도 함께 노출)
- **발견일**: 2026-05-10 (transition-focus-tokens PR EXPLORE)

### 🟢 useDrawerHistory: 라우트 이동 시 drawer history entry 미정리

- **무엇**: `useDrawerHistory.ts`에서 drawer 열린 상태로 링크 클릭 등 라우트 이동이 발생하면, `history.pushState({ __drawer: true }, '')` 엔트리가 스택에서 제거되지 않아 뒤로가기 스택에 중복 URL이 남을 수 있음
- **왜**: 초기 구현에서 `pathname` 변경 시 `setDrawerOpen(false)` 처리만 하고 쌓인 history entry 정리 정책이 미정의
- **마이그레이션 경로**: `pathname` effect 또는 unmount cleanup에서 `history.back()` 또는 `history.replaceState` 호출로 entry 제거 정책 결정 후 적용
- **영향 범위**: `src/hooks/useDrawerHistory.ts`, `src/components/layout/BottomNav/BottomNav.tsx`
- **발견일**: 2026-05-10 (PR #81 Codex 리뷰)

### 🟢 services/about: Supabase error silent fallback 로깅 부재

- **무엇**: `getSiteCollection<T>` 및 `getSiteSettings`가 Supabase `error` 필드를 무시하고 빈 배열/기본값으로 fallback. 운영 중 DB 오류가 발생해도 로그 없이 빈 화면으로 렌더됨
- **왜**: `worshipService`만 try/catch 보호. 나머지 API 호출은 silent fallback 정책으로 작성 (사용자 결정)
- **마이그레이션 경로**: `error && console.error(...)` 최소 로깅 추가. 중요도에 따라 Sentry 등 외부 에러 추적 연동 검토
- **영향 범위**: `src/apis/site-collections.ts`, `src/services/about/index.ts`
- **발견일**: 2026-05-10 (PR #81 Codex 리뷰)

### 🟡 SCSS primitive 토큰 직접 사용 (143건)

- **무엇**: `.module.scss`에서 primitive 토큰(`$gray-*`/`$navy-*`/`$gold-*`/`$beige-*`/`$cream-*`/`$black`/`$white`)을 color/border/background 등에 직접 사용. semantic 토큰(`$txt-*`/`$bg-*`/`$border-*`/`$primary`/`$accent`)을 거치지 않음
- **왜**: ADR 0003(design-system-v3)이 primitive↔semantic 분리를 결정했지만 도구 가시화가 부재했음. 2026-05-10 stylelint guardrail PR에서 `declaration-property-value-disallowed-list` warning 룰 도입으로 가시화됨
- **마이그레이션 경로**: 영역별 분리 PR(home / about / sermons / news / admin)로 점진 치환. `.claude/skills/styles/SKILL.md`의 "Primitive → Semantic 치트시트" 표 참조. 모두 청산 후 별도 PR에서 룰 severity를 `warning` → `error`로 격상
- **영향 범위**: `src/app/**/*.module.scss`, `src/components/**/*.module.scss` 다수
- **확인**: `yarn lint:styles | grep "primitive 토큰 직접 사용"` (현재 143건)
- **발견일**: 2026-05-10 (stylelint-primitive-guardrail PR 도입 시 정확 카운트)

### 🟡 SCSS 하드코딩 색상 (49건)

- **무엇**: `.module.scss` 파일 곳곳에서 hex 색상(`#xxxxxx`) 직접 사용. 토큰 변수가 아님
- **왜**: stylelint 도입 전에 작성된 코드. 신규 작성은 stylelint warn으로 차단됨 (CLAUDE.md "하드코딩 절대 금지" 규칙)
- **마이그레이션 경로**: 각 hex 값을 `src/styles/tokens/_color.scss`의 의미 단위 변수로 매핑 → 모두 해결 시 `.stylelintrc.json`의 `color-no-hex` 룰을 `warning` → 기본(error)로 격상
- **영향 범위**: 약 49건, 주요 발생 위치는 `sermons/_component/`, `news/bulletins/_component/`, `admin/sermons/SermonForm/` 하위
- **확인**: `yarn lint:styles` (warning으로 표시)
- **발견일**: 2026-05-01 (stylelint 도입 시)

### 🟢 SCSS 네이밍 패턴 위반 (12건)

- **무엇**: snake_case 아닌 className 5건, kebab-case 아닌 SCSS 변수 7건
- **왜**: 컨벤션 통일 전에 작성된 코드. 신규 작성은 stylelint warn으로 차단됨
- **마이그레이션 경로**: rename → 모두 해결 시 stylelint 룰 격상
- **확인**: `yarn lint:styles` (warning)
- **발견일**: 2026-05-01

### 🟢 ESLint `react-hooks/set-state-in-effect` (1건, 9건 청산)

- **무엇**: useEffect 내 setState 직접 호출 (cascading rerender 가능성)
- **왜**: React Compiler 신규 룰. 9건은 후속 컴포넌트 리팩터(useDialog 통합·SermonListPage 재구조 등) 과정에서 자연 청산, 1건은 외부 prop 동기화 패턴(Modal portal transition snapshot)으로 line-disable + 사유 주석 유지
- **마이그레이션 경로**: 잔여 1건은 `ConfirmModal/index.tsx:48` — portal transition 중 prop 동기화 표준 패턴. `useDialog` 통합 작업 시 재검토
- **영향 범위** (1개 파일):
  - `src/components/admin/common/ConfirmModal/index.tsx:48` — line-disable 처리됨
- **발견일**: 2026-05-01
- **재확인일**: 2026-05-07

### 🟡 ESLint warnings (40건)

- **무엇**: `@next/next/no-img-element` 11, `@typescript-eslint/no-unused-vars` 10, `no-restricted-imports` 10 (이건 별 항목 "app/ → apis/"와 동일), `react-hooks/incompatible-library` 5, `react-hooks/exhaustive-deps` 4
- **왜**: 룰 격하 또는 케이스별 정당한 사용 가능. 빌드 차단은 안 됨
- **마이그레이션 경로**: `tech-debt-cleanup-phase2` EXEC_PLAN에서 처리 — 카테고리별 일괄 처리 또는 케이스별 검토
- **확인**: `yarn lint`
- **발견일**: 2026-05-01

### 🟡 Knip 미사용 코드 (~50건)

- **무엇**: Unused files 15, Unused exports 20, Unused exported types 14, Unused devDependencies 1
- **왜**: 리팩토링 후 정리 안 됨, 또는 false positive (예: prettier는 eslint-config-prettier에서 사용)
- **마이그레이션 경로**: `tech-debt-cleanup-knip` EXEC_PLAN — 항목별 false positive 검증 후 삭제
- **확인**: `yarn knip`
- **발견일**: 2026-05-01

### 🟢 `complete-task.mjs` 패턴 매칭 부정확

- **무엇**: `phase1` 입력 시 `phase1-5`도 매치되어 다중 매칭 차단됨. `phase1.md` 입력은 `*phase1.md*.md`로 깨짐
- **왜**: `find -name "*${PATTERN}*.md"` 단순 substring 매치
- **마이그레이션 경로**: 정확 매치 모드(끝 anchor) 추가, `.md` suffix 자동 제거, 또는 prefix 매치로 변경
- **확인**: 2026-05-01 phase1 → completed/ 이동 시연 중 발견 (수동 mv로 우회)
- **영향 범위**: `scripts/complete-task.mjs`
- **발견일**: 2026-05-01

### 🟡 admin 토큰 통합 (ADR 0005 placeholder)

- **무엇**: `src/components/admin/layout/AdminLayout/index.module.scss:1-30`의 `:root` `--admin-*` 25종 변수가 메인 토큰 시스템과 분리된 채 admin 영역 전반에서 호출됨
- **왜**: design-system-v3 본 task에서 통합 시도했으나 회귀 위험·범위 과대로 분리됨 (Codex 계획 검증 Q1, ADR 0003 References). 0004는 UI Component Foundation에 사용되어 본 ADR 번호는 0005로 재할당
- **마이그레이션 경로**: 후속 ADR `0005-admin-token-unification` 작성 → 25종 변수 → 메인 토큰 매핑표 → admin 영역 SCSS 모듈 일괄 치환 → `:root` 정의 제거. 사이드바 다크 톤은 별도 시맨틱 토큰(`$bg-dark-nav` 계열) 분리 필요
- **영향 범위**: `src/components/admin/**/*.module.scss` 전체, `src/app/admin/**` 일부
- **확인**: `rg -n 'var\(--admin-'  -g '*.scss' src/`
- **발견일**: 2026-05-04 (design-system-v3 task, Codex Q1)

### 🟢 design-system-v3 follow-up: 다크모드 토큰 분리

- **무엇**: 라이트 토큰만 정의된 현재 `_color.scss` 시맨틱 레이어
- **왜**: design-system-v3 task에서 사용자 결정으로 본 작업 제외 (Wanted DS의 `[data-theme="dark"]` 패턴 차용 보류)
- **마이그레이션 경로**: 도입 결정 시 별도 ADR로 처리 — `_color.scss`에 dark 토큰 추가, `[data-theme="dark"]` 또는 `prefers-color-scheme` 셀렉터로 시맨틱 레이어 오버라이드
- **발견일**: 2026-05-04 (design-system-v3, Tier 2 보류)

### 🟢 about/ 경로 SCSS 정리

- **무엇**: `src/app/(content)/about/page.module.scss` hex 하드코딩(`#eee`, `#f8f8f8`, `#fde5cf`) + font-size 리터럴(2.4rem, 3rem) 잔존
- **왜**: 디자인·내용 미확정으로 design-system-v3 pilot에서 제외
- **마이그레이션 경로**: about/ 디자인 확정 후 hex → 시맨틱 토큰 / font-size 리터럴 → primitive 토큰 또는 mixin
- **영향 범위**: `src/app/(content)/about/**/*.module.scss`
- **발견일**: 2026-05-04 (design-system-v3 Non-goals)

### 🟢 typography 리터럴 0.8rem / 0.9rem 토큰 부재

- **무엇**: `src/app/_component/home/SermonCard.module.scss:46` `0.9rem`, `src/app/_component/home/FeedContent.module.scss:223` `0.8rem` — 8/9px 사이즈가 토큰 체계에 없음
- **왜**: 현재 typography primitive는 `$font-size-11`이 최저. 8/9px 사용처가 발견되어 디자인 의도 확인 필요
- **마이그레이션 경로**: (a) `$font-size-9`/`$font-size-8` 신규 primitive 도입 또는 (b) 디자인 검토 후 `$font-size-11`/`$font-size-12`로 상향 조정
- **확인**: `rg -n '0\.[89]rem' -g '*.module.scss' src/`
- **발견일**: 2026-05-04 (design-system-v3 Step 3)

### 🟢 FeedContent `.badge_category` mixin 미적용

- **무엇**: `src/app/_component/home/FeedContent.module.scss`의 카테고리 뱃지가 신규 caption mixin을 적용받지 않은 채 직접 토큰 조합
- **왜**: 뱃지의 `line-height: 1` (reset) 의도와 신규 `text-caption-strong`의 `$line-height-body-ui` (1.45)가 충돌
- **마이그레이션 경로**: (a) 뱃지 전용 `text-badge` mixin 신규 도입 또는 (b) `text-caption-strong($line-height: 1)`로 파라미터 확장 — Codex 검토 권장
- **발견일**: 2026-05-04 (design-system-v3 Step 3)

### 🟢 신규 mixin 타 페이지 도입 (점진)

- **무엇**: design-system-v3 Step 1·3에서 추가한 5종 mixin(`text-body-emphasis`, `text-sub-emphasis`, `text-label-emphasis`, `text-caption-small`, `text-caption-strong`) + 생존 4종(`text-page-title`, `text-card-title`, `text-sub`, `text-caption`)이 홈 외 페이지에는 미도입
- **왜**: 본 task pilot은 홈 9개 모듈만 대상. 다른 페이지는 작업 시점에 점진 도입 합의
- **마이그레이션 경로**: sermons/news/fellowship/community/next-gen/notifications/search 페이지를 작업할 때 ADR 0003 Decision #1 표 매핑에 따라 자연 적용
- **확인**: 페이지별 `rg -n '@include\s+text-'  -g '*.module.scss' src/app/(content)/<route>/`
- **발견일**: 2026-05-04 (design-system-v3 Step 5 회고)

### 🟢 layer 룰 상대 경로 미커버

- **무엇**: ESLint `no-restricted-imports` 룰이 alias(`@/<layer>/...`)만 검사. 상대 경로(`../<layer>/...`)로 layer 의존성 우회 가능
- **왜**: `**/<layer>/**` 보강 시도했으나 외부 패키지(`next/dist/client/components/...`) false positive로 부분 철회됨
- **현재 상태**: 코드베이스에 상대 경로 layer crossing은 0건. 위험은 미래 방지용
- **마이그레이션 경로**: `eslint-plugin-import`의 `no-relative-parent-imports` 또는 `eslint-plugin-boundaries` 도입 검토 (별도 EXEC_PLAN)
- **발견일**: 2026-05-01 (Codex 리뷰)

### 🟢 Hover Border 위반 — 디자인 시스템 v4 미완 잔여 (10건)

- **무엇**: hover 시 `border-color`/`border` 변경 — `.claude/skills/styles/SKILL.md` Hover 3원칙 #3 위반
- **왜**: v4 마이그레이션이 sermons/news 영역에 한정. home/admin은 후속 phase로 분리
- **마이그레이션 경로**:
  - home(5건): hover에서 border 코드 제거, 필요 시 `hover-lift` 또는 shadow 강조로 대체
  - admin(5건): admin 토큰 ADR 결정 후 일괄
- **영향 범위**:
  - home: `src/app/_component/home/{FeedContent,SermonCard,RecentSermons,NewHere,AboutOurChurch}.module.scss`
  - admin: `src/components/admin/sermons/SermonListPage/{dropdown,table}.module.scss`, `src/components/admin/sermons/SermonForm/index.module.scss`, `src/components/admin/layout/{PageHeader,AdminHeader}/index.module.scss`
- **발견일**: 2026-05-07 (Codex 디자인 시스템 audit)

### 🟢 `$beige-300` semantic 매핑 부재

- **무엇**: `$beige-300: #e8e6e1` primitive가 4 모듈 5건에서 직접 사용 중인데 semantic 토큰 매핑이 부재
- **왜**: 2026-05-08 about-page-redesign에서 사용자 명시 요청으로 `$cream-300 → $beige-300` 매핑되어 도입됐으나, 같은 plan 시점에 semantic 명명까지 짝지을 시간이 없어 SKILL.md에 *"미정"*으로 기록 후 보류
- **마이그레이션 경로**: 사용처 4 모듈 패턴(QuickAccess background, sermons gradient `linear-gradient(135deg, $beige-150, $beige-300)`)에서 의미 도출 → `$bg-secondary-deep` 또는 `$bg-gradient-end-warm` 같은 semantic 신설 → 사용처 일괄 치환 → SKILL.md 갱신
- **영향 범위** (4 파일 5건):
  - `src/app/_component/home/QuickAccess.module.scss:4` — `background: $beige-300`
  - `src/app/(content)/sermons/_component/SermonVideoPlayer/SermonVideoPlayer.module.scss:43` — gradient end
  - `src/app/(content)/sermons/_component/GridCard/GridCard.module.scss:46` — gradient end
  - `src/app/(content)/sermons/_component/SermonCard/SermonCard.module.scss:47, 55` — gradient end (2건)
- **확인**: `rg '\$beige-300' src/app src/components` → 5 hits
- **발견일**: 2026-05-10 (style-tokens-cleanup PR Codex 1차 BLOCK 검증 중 발견)

### 🟢 토큰 부채 — 디자인 시스템 v4 미완 잔여 (hex/rgba 직접 사용)

- **무엇**: 시맨틱 토큰을 거치지 않은 hex/rgb 값 직접 사용
- **왜**: v4 마이그레이션이 sermons/news 영역에 한정. about/home/admin은 후속 phase로 분리
- **마이그레이션 경로**:
  - hex: 비-admin 우선 시맨틱 토큰 치환
  - rgba: overlay/scrim은 `$overlay-*`, hover/active는 `$bg-hover`/`$primary-subtle`로 정리
- **영향 범위 (대표)**:
  - hex: `src/app/(content)/about/page.module.scss:12,54,247`, `about/serving-people/page.module.scss:72`, `news/bulletins/_component/BulletinForm.module.scss:15,17`, home/admin 다수
  - rgba: `news/notices/_component/NoticeDrawer.module.scss:27`, `sermons/_component/{SortBottomSheet:4, GridCard:59,77,93, SermonCard:69,87,109}`
- **발견일**: 2026-05-07 (Codex 디자인 시스템 audit)

### 🟢 Cloudinary `uploadImage()` `folder` + `public_id` 중복 전달

- **무엇**: `src/apis/cloudinary.ts:36-39`에서 `cloudinary.uploader.upload()`에 `folder`와 fully-qualified `public_id`를 동시 전달
- **왜**: dnchurch dev/prod preset의 dynamic folder mode에서 경험적으로 검증된 조합. Cloudinary 공식은 dynamic folder mode에서 `asset_folder` + `public_id_prefix` 또는 `use_asset_folder_as_public_id_prefix`를 권장
- **마이그레이션 경로**: 단순화 시도 전 smoke test 필수 — `folder` 제거 / `asset_folder` 전환 각각 시도 후 결과 `public_id` 형태와 폴더 위치 확인. 검증 통과 시 단순화
- **영향 범위**: `src/apis/cloudinary.ts`
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟡 bulletin 이미지 filename 충돌 위험

- **무엇**: `src/actions/_bulletin-helpers.ts:20`에서 업로드 filename은 sanitize만 수행하고 uniqueness suffix 없음. 같은 날(`uploads/bulletins/YYYY/MM/DD`) 동일 이름 파일 재업로드 시 `public_id` 중복으로 overwrite 가능
- **왜**: 단순 sanitize만으로 충분하다고 판단(날짜별 폴더 분리 가정). 실제로는 같은 날 같은 이름 파일 재업로드 시나리오가 가능
- **마이그레이션 경로**: filename에 `${orderIndex}-${randomUUID().slice(0,8)}-${name}` 같은 prefix 추가. orderIndex만으로도 같은 폼 내 중복은 방지되지만, 다른 세션/같은 날 재업로드는 UUID로 보호
- **영향 범위**: `src/actions/_bulletin-helpers.ts`
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟡 bulletin 업로드 부분실패 orphan asset

- **무엇**: `src/actions/_bulletin-helpers.ts:18` `Promise.all` 병렬 업로드 — 1장이라도 실패하면 throw로 끝나고, 이미 업로드 성공한 자산은 Cloudinary에 orphan으로 남음
- **왜**: 초기 구현에서 happy-path만 고려. cleanup 정책 미정의
- **마이그레이션 경로**: `Promise.allSettled` + fulfilled 결과의 `public_id`를 `deleteImage()`로 cleanup 후 rejection 재throw. sermon 업로드(`actions/sermon.action.ts`의 `removeStorageObjects`) 패턴 참고
- **영향 범위**: `src/actions/_bulletin-helpers.ts`, `src/apis/cloudinary.ts`
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟢 Cloudinary 이미지 품질 `q_85` 고정 → `q_auto` 전환 검토

- **무엇**: `src/utils/cloudinary.ts:72`의 loader가 `q_85` 고정. Cloudinary 공식 권장은 `q_auto` (또는 `q_auto:good`) — 컨텐츠별 최적 품질로 자동 조정
- **왜**: 명시적 품질 관리 의도. 자동화 결과 품질 변동성 우려로 보류
- **마이그레이션 경로**: 일부 use-case(`hero`, `bulletin`)에서 A/B 비교 후 `q_auto:good` 전환. PSNR/SSIM 또는 시각 검토로 품질 회귀 없음 확인 → 전체 전환
- **영향 범위**: `src/utils/cloudinary.ts`, 모든 `<CloudinaryImage>` 사용처
- **참고**: https://cloudinary.com/documentation/image_optimization
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟢 Cloudinary use-case별 preset 부재 (OG/카카오/다운로드)

- **무엇**: `getCloudinaryUrl()`은 변환 없이 원본 URL 생성. OG 이미지·카카오 공유·다운로드 등 각 use-case에 적절한 사이즈/품질 변환이 일괄 적용되지 않음
- **왜**: 초기에는 `<Image>` 컴포넌트만 사용하는 가정. OG/공유 등 외부 use-case 추가 시 case-by-case로 변환 추가
- **마이그레이션 경로**: use-case별 명명된 preset 함수 도입 — 예: `getOgImageUrl(publicId)`, `getKakaoShareUrl(publicId)`, `getThumbnailUrl(publicId)`. 각각 `w`/`c`/`q`/`f` 조합 고정 → derived asset 종류 통제 → bandwidth/transformation 비용 절감
- **영향 범위**: `src/utils/cloudinary.ts`, OG metadata 생성 사이트, 공유 버튼 컴포넌트
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟢 `CloudinaryImage` 불필요한 `'use client'` boundary

- **무엇**: `src/components/common/CloudinaryImage.tsx:1`이 `'use client'`이지만 React 훅을 사용하지 않음. 단순히 `<Image>`에 loader 함수를 넘기는 wrapper
- **왜**: 초기 작성 시 안전하게 client 지정. `loader` prop이 함수라 RSC에서 직접 전달 시 직렬화 문제 우려
- **마이그레이션 경로**: `'use client'` 제거 후 RSC 호환성 검증 — `loader={createCloudinaryLoader(...)}` 패턴이 RSC에서 동작하는지 확인. 안 되면 module-level pre-built loader 인스턴스(cropMode 조합별)로 우회. 통과 시 client JS 번들 감소
- **영향 범위**: `src/components/common/CloudinaryImage.tsx`
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

---

## 해결된 항목

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
- **참고**: `feat/common-components-v4` 브랜치에 등록된 "Hover Border 위반 — 디자인 시스템 v4 미완 잔여 (10건)" 부채 중 home 5건 + SermonCard 1건 분량을 본 작업으로 청산. admin 5건은 후속 ADR 0004 영역으로 분리 보존.
- **결과 기록**: `docs/exec-plans/completed/2026-05-07-design-system-v4-home-cleanup.md` (머지 후 이동 예정)

### ✅ `serverActions.bodySizeLimit` ↔ bulletin upload 정책 불일치 (2026-05-11)

- **부채**: `bodySizeLimit: '5mb'` vs bulletin UI 5MB × 최대 5장(=25MB). multi-upload 시 Server Action 진입 전 차단 가능 (PR #82 Codex 리뷰에서 등록)
- **해소**: about-page-qa fix에서 `next.config.ts:24` `bodySizeLimit`을 `5mb` → `30mb`로 상향. 25MB 정책 수용
- **확인**: 변경 1줄. 빌드/lint PASS
- **참고**: sermon 자료 단일 50MB 한도(`src/lib/sermon-resource.ts`)는 운영상 차단 사례 미확인 — 발생 시 별도 부채로 등록

### 🟢 `<SeriesEpisodeList>` 컴포넌트 unused (sermons-detail-series-sidebar 머지 이후)

- **상태**: 🟢 마이그레이션 가능
- **무엇**: `src/app/(content)/sermons/_component/SeriesEpisodeList/SeriesEpisodeList.tsx` + `.module.scss` — 본 컴포넌트는 PR #90(`feat/sermons-detail`)에서 `SermonDetailPage`의 회차 목록 노출을 `<SermonSeriesSidebar>`로 이관하며 사용처가 사라짐
- **왜**: 1차 의도(sermons-detail-series-sidebar D4 / Codex CR-c)는 Phase 2-4 모바일 회차 목록에서 재사용 후보로 보존이었으나, Phase 2-4 mobile reshuffle도 동일 PR에 흡수되어 `SermonSeriesSidebar`가 모바일 stack에서도 시리즈 회차 책임 → 본 컴포넌트 재사용처 0건 확정
- **마이그레이션 경로**: 별도 task에서 (a) 디렉토리 + module SCSS 삭제 + Knip warn 정리, (b) 다른 use case(예: 어드민 사이드 패널 회차 목록) 발견 시 그 task에서 재사용
- **영향 범위**: `src/app/(content)/sermons/_component/SeriesEpisodeList/` (2 파일, 약 100줄)
- **발견일**: 2026-05-14 (PR #90 Codex 객관 리뷰 발견)

### 🟢 `getAllSeries`/`getAllPreachers` `select('*')` payload 미최적화 (PR #91 Gemini 리뷰)

- **상태**: 🟢 마이그레이션 가능
- **무엇**: `src/services/sermon/sermon-service.ts:124,171` `allSeries`/`allPreachers`가 `select('*, sermons!inner(count)')`로 전체 컬럼 조회. 사이드바·필터 시트는 일부 필드만 사용
- **왜 보류**: 단순 컬럼 축소는 회귀 — `getAllSeries`/`getAllPreachers`는 `/sermons` 캐러셀(`SeriesCard.tsx:13` `cover_image_url`)·admin 설교 폼 3곳(`admin/sermons{,/new,/[id]/edit}`)·`/sermons/all` 공유. PR #91 fix 시도 시 cover_image_url 누락으로 캐러셀 회귀 발견(Codex 1차 CHANGE_REQUEST) → 전면 revert
- **마이그레이션 경로**: 별도 task에서 (a) 사이드바 전용 narrow 쿼리 함수 신설(공유 함수 불변), 또는 (b) 5개 소비처 전수 감사 후 union 컬럼셋으로 축소 + 타입 narrow
- **영향 범위**: `src/services/sermon/sermon-service.ts` (2 쿼리), 소비처 5곳
- **발견일**: 2026-05-15 (PR #91 Gemini 코드리뷰 제안 / Codex 1차에서 회귀 확인)

<!-- last-audit: 2026-05-14 -->
