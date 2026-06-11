# Tech Debt — Active

활성 기술 부채. 신규 부채는 이 파일에 추가한다. 해결되면 [`resolved.md`](resolved.md)로 옮긴다. 형식 규칙은 [`../tech-debt-tracker.md`](../tech-debt-tracker.md) 참조.

---

### 🔴 마이그레이션이 DB를 재현하지 못함 — prod 마이그레이션 전 필수 (profiles-rls-rpc-guard PR #115)

- **상태**: 등록만 (PR #115 범위 밖, MVP 완성 후 prod 올리기 직전에 처리)
- **무엇**: `supabase/migrations/`만으로 빈 DB를 만들면 실패한다. `profiles`·`bulletins`·`bulletin_images`·`notices`의 `CREATE TABLE`이 어느 마이그레이션에도 없다(대시보드에서 손으로 생성). `20260314000000_create_bulletin_rpc.sql`이 `bulletins`에 INSERT하지만 그 테이블을 만드는 마이그레이션이 앞에 없어 `supabase db reset`·Preview replay가 깨진다. 더해 `001_sermon_schema.sql`이 실제 스키마와 어긋난다 — `sermons.id`가 파일은 `UUID`인데 실제는 `bigint`, 컬럼명 `date` vs `sermon_date`. `seed.sql`도 `date` 컬럼명을 쓴다.
- **왜 지금 안 하나**: prod가 비어 있고 사용 안 함. dev에는 실제 스키마가 이미 있어 동작에 지장 없다. PR #115는 보안 구멍 차단이 범위라 baseline 복구(sermon 스키마까지)를 섞으면 비대해진다.
- **왜 미루면 안 되나(데드라인)**: 계획이 "MVP 완성 후 마이그레이션으로 prod 구축"인데, 지금 세트로는 그 prod 구축이 실패한다. **prod 마이그레이션 직전에 반드시 해소해야 한다.**
- **함께 있는 드리프트**: `custom_access_token_hook`이 `config.toml:174`엔 선언됐으나 dev에는 함수가 없다.
- **마이그레이션 경로**:
  1. dev DB에서 `supabase db dump`(또는 `db diff`)로 `profiles`·`bulletins`·`bulletin_images`·`notices` 정의(컬럼 + enum `role_enum`/`profile_status_enum` + 인덱스 + RLS + 트리거 `handle_new_user`)를 baseline 마이그레이션으로 추출한다.
  2. `001_sermon_schema.sql`을 실제 스키마와 맞추고 `seed.sql`의 `date` 컬럼명을 `sermon_date`로 고친다.
  3. 빈 DB에 `supabase db reset`을 돌려 dev와 같은지 확인한다. prod가 비어 있어 prod 대조는 불필요하고 위험이 낮다.
  4. `custom_access_token_hook` 함수를 dev에 적용해 config 선언과 맞춘다.
- **영향 범위**: `supabase/migrations/*`, `supabase/seed.sql`
- **확인**: `supabase db reset` 또는 Supabase Preview replay 성공 여부
- **발견일**: 2026-06-11 (PR #115에서 마이그레이션 추적 시작 시 Gemini·Codex 리뷰가 동시 지적)

### 🟢 주보 수정 시 Cloudinary 삭제를 RPC 반환값으로 검증 (profiles-rls-rpc-guard PR #115)

- **상태**: 등록만 (PR #115에서 1차 보강 완료, 더 견고한 방식은 후속)
- **무엇**: `updateBulletinAction`이 폼의 `cloudinaryId`로 Cloudinary 원본을 지우던 교차 삭제 갭은 PR #115에서 "RPC 전에 DB에서 `bulletinId` 소속 `cloudinary_id`를 조회해 그 값만 삭제"로 1차로 막았다. 다만 조회와 RPC 삭제가 분리돼, 그 사이에 값이 바뀔 틈(TOCTOU)이 남는다.
- **마이그레이션 경로**: `update_bulletin` RPC가 실제 삭제한 `cloudinary_id[]`를 반환하게 바꾸고, 액션은 그 반환값만 `deleteImage`에 넘긴다. SQL 함수 반환 타입 + 서비스 타입까지 2-3파일.
- **영향 범위**: `supabase/migrations/`(update_bulletin), `src/services/bulletin/`, `src/actions/update-bulletin.action.ts`
- **발견일**: 2026-06-11 (PR #115 GitHub Codex 리뷰 P2)

---

### 🟡 `app/ → apis/` 직접 호출 (레이어 위반, 8건)

- **무엇**: 페이지·홈 컴포넌트가 `services/` 경유 없이 `apis/`를 직접 import
- **왜**: 초기 단순 구조에서 services 레이어 도입 전에 작성된 코드
- **현재 상태**: ESLint 룰 `error`로 올림 — 새 위반은 즉시 차단. 기존 항목은 line-level `eslint-disable-next-line no-restricted-imports` + tech-debt 주석으로 마킹
- **마이그레이션 경로**: 각 호출 사이트를 `services/` 또는 Server Component data fetcher 경유로 교체. 모두 해결되면 disable 주석 일괄 제거
- **영향 범위** (8건):
  - `src/app/(content)/about/serving-people/page.tsx` — `getActiveStaff`
  - `src/app/_component/home/{Banner,AboutOurChurch}.tsx` — `getSiteSettings`
  - `src/app/_component/user/UserProfileModal.tsx` — `signOut`
  - `src/app/_component/auth/{SignUpForm,SignInForm,KakaoLoginBtn,EmailVerificationRequestForm}.tsx`
  - (auth 4건은 클라이언트 직접 호출이 정당할 수 있어 정책 결정 필요)
- **확인**: `rg "from ['\"]@/apis/" src/app` → 8 hits
- **발견일**: 2026-05-01 (ESLint 레이어 룰 도입 시)
- **2026-05-02**: `worship/page.tsx` 해소 (`services/worship/` 도입) — 10건 → 9건
- **2026-05-21**: `about/location/page.tsx` 해소 (`services/about/getLocationPageData` 경유) — 9건 → 8건

### 🟡 SCSS primitive 토큰 직접 사용 (143건)

- **무엇**: `.module.scss`에서 primitive 토큰(`$gray-*`/`$navy-*`/`$gold-*`/`$beige-*`/`$cream-*`/`$black`/`$white`)을 color/border/background 등에 직접 사용. semantic 토큰(`$txt-*`/`$bg-*`/`$border-*`/`$primary`/`$accent`)을 거치지 않음
- **왜**: ADR 0003(design-system-v3)이 primitive↔semantic 분리를 결정했지만 도구 가시화가 부재했음. 2026-05-10 stylelint guardrail PR에서 `declaration-property-value-disallowed-list` warning 룰 도입으로 가시화됨
- **마이그레이션 경로**: 영역별 분리 PR(home / about / sermons / news / admin)로 점진 치환. `.claude/skills/styles/SKILL.md`의 "Primitive → Semantic 치트시트" 표 참조. 모두 정리한 뒤 별도 PR에서 룰 severity를 `warning` → `error`로 올림
- **영향 범위**: `src/app/**/*.module.scss`, `src/components/**/*.module.scss` 다수
- **확인**: `yarn lint:styles | grep "primitive 토큰 직접 사용"` (현재 143건)
- **발견일**: 2026-05-10 (stylelint-primitive-guardrail PR 도입 시 정확 카운트)

### 🟡 SCSS 하드코딩 색상 (23건)

- **무엇**: `.module.scss` 파일 곳곳에서 hex 색상(`#xxxxxx`) 직접 사용. 토큰 변수가 아님
- **왜**: stylelint 도입 전에 작성된 코드. 신규 작성은 stylelint warn으로 차단됨 (CLAUDE.md "하드코딩 절대 금지" 규칙)
- **마이그레이션 경로**: 각 hex 값을 `src/styles/tokens/_color.scss`의 의미 단위 변수로 매핑 → 모두 해결 시 `.stylelintrc.json`의 `color-no-hex` 룰을 `warning` → 기본(error)로 올림
- **영향 범위**: 23건 (14 파일), 주요 발생 위치는 `sermons/_component/`, `news/bulletins/_component/` 하위
- **확인**: `rg "#[0-9a-fA-F]{3,8}" -g "*.module.scss" src` → 23 hits
- **발견일**: 2026-05-01 (stylelint 도입 시)
- **2026-06-01 재확인**: #102 admin 토큰 통합 작업으로 admin hex가 토큰에 흡수돼 49건에서 23건(14 파일)으로 줄었다. tech-debt-pre-release plan의 5월 26일 재측정값과 일치한다.

### 🟢 SCSS 네이밍 패턴 위반 (12건)

- **무엇**: snake_case 아닌 className 5건, kebab-case 아닌 SCSS 변수 7건
- **왜**: 컨벤션 통일 전에 작성된 코드. 신규 작성은 stylelint warn으로 차단됨
- **마이그레이션 경로**: rename → 모두 해결 시 stylelint 룰을 error로 올림
- **확인**: `yarn lint:styles` (warning)
- **발견일**: 2026-05-01

### 🟢 ESLint `react-hooks/set-state-in-effect` (2건, 9건 정리됨)

- **무엇**: useEffect 내 setState 직접 호출 (cascading rerender 가능성)
- **왜**: React Compiler 신규 룰. 9건은 후속 컴포넌트 리팩터(useDialog 통합·SermonListPage 재구조 등) 과정에서 자연스럽게 사라짐. 남은 2건은 외부 동기화가 정당한 패턴(Modal portal snapshot, pathname 변경 동기화)으로 line-disable + 사유 주석 유지
- **마이그레이션 경로**:
  - `ConfirmModal/index.tsx:48` — portal transition 중 prop 동기화. `useDialog` 통합 작업 시 재검토
  - `useDrawerHistory.ts:52` — pathname 변경에 따른 외부 상태 동기화. 외부 router 이벤트로 옮길 수 있는지 검토
- **영향 범위** (2건):
  - `src/components/admin/common/ConfirmModal/index.tsx:48`
  - `src/hooks/useDrawerHistory.ts:52`
- **확인**: `rg "react-hooks/set-state-in-effect" src` → 2 hits
- **발견일**: 2026-05-01
- **재확인일**: 2026-05-21 (1건 → 2건, useDrawerHistory 추가됨)

### 🟡 ESLint warnings (40건)

- **무엇**: `@next/next/no-img-element` 11, `@typescript-eslint/no-unused-vars` 10, `no-restricted-imports` 10 (이건 별 항목 "app/ → apis/"와 동일), `react-hooks/incompatible-library` 5, `react-hooks/exhaustive-deps` 4
- **왜**: 룰 낮춤 또는 케이스별 정당한 사용 가능. 빌드 차단은 안 됨
- **마이그레이션 경로**: `tech-debt-cleanup-phase2` EXEC_PLAN에서 처리 — 카테고리별 일괄 처리 또는 케이스별 검토
- **확인**: `yarn lint`
- **발견일**: 2026-05-01

### 🟡 Knip 미사용 코드 (~50건)

- **무엇**: Unused files 15, Unused exports 20, Unused exported types 14, Unused devDependencies 1
- **왜**: 리팩토링 후 정리 안 됨, 또는 false positive (예: prettier는 eslint-config-prettier에서 사용)
- **마이그레이션 경로**: `tech-debt-cleanup-knip` EXEC_PLAN — 항목별 false positive 검증 후 삭제
- **확인**: `yarn knip`
- **발견일**: 2026-05-01

### 🟡 queueMicrotask로 set-state-in-effect 우회 (4건)

- **무엇**: effect 안 setState를 `queueMicrotask`로 감싸 `react-hooks/set-state-in-effect` 경고만 끄고 연쇄 재렌더는 그대로 남긴 코드. `useListFilters.ts:27`, `NoticeControlBar.tsx:26`, `DesktopHeader.tsx:21`, `useMediaQuery.ts:10`
- **왜**: 커밋 0e8fd31(2026-05-02)이 React Compiler 룰 격상에 대응하며 10곳을 일괄 우회했고, 이후 queueMicrotask 전면 금지가 사용자 규칙으로 정해짐
- **마이그레이션 경로**: `useSearchSync` 사례(refactor-dedup-cleanup 8단계 — 이벤트 핸들러 디바운스 + 렌더 중 prev-state 보정)처럼 호출처별 재설계. `useMediaQuery`는 `useSyncExternalStore` 전환 후보
- **확인**: `rg "queueMicrotask" src` → 4 hits
- **발견일**: 2026-06-11 (refactor-dedup-cleanup 8단계에서 useSearchSync 1건 해소하며 잔여분 등록)

### 🟢 `complete-task.mjs` 패턴 매칭 부정확

- **무엇**: `phase1` 입력 시 `phase1-5`도 매치되어 다중 매칭 차단됨. `phase1.md` 입력은 `*phase1.md*.md`로 깨짐
- **왜**: `find -name "*${PATTERN}*.md"` 단순 substring 매치
- **마이그레이션 경로**: 정확 매치 모드(끝 anchor) 추가, `.md` suffix 자동 제거, 또는 prefix 매치로 변경
- **확인**: 2026-05-01 phase1 → completed/ 이동 시연 중 발견 (수동 mv로 우회)
- **영향 범위**: `scripts/complete-task.mjs`
- **발견일**: 2026-05-01

### 🟢 exec-plan 형식 grep 가드 2종 (ADR 0011 D2 후속)

- **무엇**: 의사결정 로그 D 번호 중복 금지 / 폐기 배너 있으면 대체 링크 필수 — 자동 검사 미구현
- **왜**: ADR 0011에서 가독성 형식을 도입하되, 테스트 환경 없는 저장소에 lint 인프라 추가는 surgical 원칙과 충돌해 이번 범위 제외. 형식 정착 후 필요성 입증 시 도입
- **마이그레이션 경로**: 형식을 지키지 않은 사례가 새 문서에서 다시 보이면 `harness-gate.mjs`에 정규식 2종 추가(별도 markdown linter 없이)
- **영향 범위**: `scripts/harness-gate.mjs`, `docs/exec-plans/`
- **발견일**: 2026-05-17

### 🟢 design-system-v3 follow-up: 다크모드 토큰 분리

- **무엇**: 라이트 토큰만 정의된 현재 `_color.scss` 시맨틱 레이어
- **왜**: design-system-v3 task에서 사용자 결정으로 본 작업 제외 (Wanted DS의 `[data-theme="dark"]` 패턴 차용 보류)
- **마이그레이션 경로**: 도입 결정 시 별도 ADR로 처리 — `_color.scss`에 dark 토큰 추가, `[data-theme="dark"]` 또는 `prefers-color-scheme` 셀렉터로 시맨틱 레이어 오버라이드
- **발견일**: 2026-05-04 (design-system-v3, Tier 2 보류)

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

### 🟢 Hover Border 위반 — admin 영역 남은 분 (5건)

- **무엇**: hover 시 `border-color`/`border` 변경 — `.claude/skills/styles/SKILL.md` Hover 3원칙 #3 위반. admin 5건만 남음
- **왜**: v4 마이그레이션이 sermons/news 영역에 한정됐다. home은 2026-05-07 home cleanup에서 해소(resolved.md), admin은 admin 토큰 ADR 결정 후로 분리
- **마이그레이션 경로**: admin 5건은 admin 토큰 통합(ADR 0012)이 끝났으니 hover border를 제거하고 `hover-lift`/shadow로 대체
- **영향 범위** (admin 5건):
  - `src/components/admin/sermons/SermonListPage/{dropdown,table}.module.scss`, `src/components/admin/sermons/SermonForm/index.module.scss`, `src/components/admin/layout/{PageHeader,AdminHeader}/index.module.scss`
- **2026-06-02 갱신**: home 5건은 2026-05-07 home cleanup에서 이미 해소 확인(FeedContent transition은 탭 상태 전환이라 위반 아님). 10건 → admin 5건으로 축소
- **발견일**: 2026-05-07 (Codex 디자인 시스템 audit)

### 🟢 토큰 부채 — 디자인 시스템 v4 미완 남은 부분 (hex/rgba 직접 사용)

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

### 🟢 `CloudinaryImage` 불필요한 `'use client'` boundary

- **무엇**: `src/components/common/CloudinaryImage.tsx:1`이 `'use client'`이지만 React 훅을 사용하지 않음. 단순히 `<Image>`에 loader 함수를 넘기는 wrapper
- **왜**: 초기 작성 시 안전하게 client 지정. `loader` prop이 함수라 RSC에서 직접 전달 시 직렬화 문제 우려
- **마이그레이션 경로**: `'use client'` 제거 후 RSC 호환성 검증 — `loader={createCloudinaryLoader(...)}` 패턴이 RSC에서 동작하는지 확인. 안 되면 module-level pre-built loader 인스턴스(cropMode 조합별)로 우회. 통과 시 client JS 번들 감소
- **영향 범위**: `src/components/common/CloudinaryImage.tsx`
- **발견일**: 2026-05-11 (PR #82 Codex 리뷰)

### 🟢 `<SeriesEpisodeList>` 컴포넌트 미사용 (sermons-detail-series-sidebar 머지 이후)

- **무엇**: `src/app/(content)/sermons/_component/SeriesEpisodeList/SeriesEpisodeList.tsx` + `.module.scss` — 이 컴포넌트는 PR #90(`feat/sermons-detail`)에서 `SermonDetailPage`의 회차 목록 노출을 `<SermonSeriesSidebar>`로 옮기며 사용처가 사라짐
- **왜**: 1차 의도(sermons-detail-series-sidebar D4 / Codex CR-c)는 Phase 2-4 모바일 회차 목록에서 재사용 후보로 남기는 것이었으나, Phase 2-4 mobile reshuffle도 같은 PR에 흡수돼 `SermonSeriesSidebar`가 모바일 stack에서도 시리즈 회차 책임 → 이 컴포넌트 재사용처 0건 확정
- **마이그레이션 경로**: 별도 task에서 (a) 디렉토리 + module SCSS 삭제 + Knip warn 정리, (b) 다른 use case(예: 어드민 사이드 패널 회차 목록) 발견 시 그 task에서 재사용
- **영향 범위**: `src/app/(content)/sermons/_component/SeriesEpisodeList/` (2 파일, 약 100줄)
- **발견일**: 2026-05-14 (PR #90 Codex 객관 리뷰 발견)

### 🟢 `getAllSeries`/`getAllPreachers` `select('*')` payload 미최적화 (PR #91 Gemini 리뷰)

- **무엇**: `src/services/sermon/sermon-service.ts:124,171` `allSeries`/`allPreachers`가 `select('*, sermons!inner(count)')`로 전체 컬럼 조회. 사이드바·필터 시트는 일부 필드만 사용
- **왜 보류**: 단순 컬럼 축소는 회귀 — `getAllSeries`/`getAllPreachers`는 `/sermons` 캐러셀(`SeriesCard.tsx:13` `cover_image_url`)·admin 설교 폼 3곳(`admin/sermons{,/new,/[id]/edit}`)·`/sermons/all` 공유. PR #91 fix 시도 시 cover_image_url 누락으로 캐러셀 회귀 발견(Codex 1차 CHANGE_REQUEST) → 전면 revert
- **마이그레이션 경로**: 별도 task에서 (a) 사이드바 전용 narrow 쿼리 함수 신설(공유 함수 그대로 유지), 또는 (b) 5개 소비처 전수 확인 후 union 컬럼셋으로 축소 + 타입 narrow
- **영향 범위**: `src/services/sermon/sermon-service.ts` (2 쿼리), 소비처 5곳
- **발견일**: 2026-05-15 (PR #91 Gemini 코드리뷰 제안 / Codex 1차에서 회귀 확인)

### 🟡 Kakao 공유 — 운영 도메인 Kakao Developers 콘솔 미등록 (PR #95 D13)

- **상태**: 외부 설정 필요 (코드 변경 아님)
- **무엇**: 설교 상세 공유의 KakaoTalk 항목(`useKakaoShare`)이 데스크톱에서 `intent://...kakaolink` "no registered handler"로 실패. 데스크톱은 KakaoTalk 앱이 없어 본질적 한계지만, 실기기에서도 동작하려면 Kakao Developers 콘솔에 운영 도메인 등록 필요
- **조치**: Kakao Developers > 앱 > 플랫폼 > Web 사이트 도메인에 `http://localhost:3000`·`https://dnchurch.vercel.app`(및 운영 도메인) 등록 + 카카오 메시지/Link 활성, `NEXT_PUBLIC_KAKAO_API_KEY`가 그 앱 JS 키인지 확인
- **영향 범위**: `src/hooks/useKakaoShare.tsx`·`src/components/lib/KakaoScript.tsx`는 정상 — 콘솔 설정만
- **발견일**: 2026-05-17 (PR #95 사용자 보고)

### 🟢 설교 상세 영상 첫재생 지연 — preboot 효과 약화 (PR #95 D7)

- **상태**: 마이그레이션 가능 (받아들인 트레이드오프)
- **무엇**: 모바일 재생 불가 수정으로 `enablejsapi`/postMessage 큐 → 클릭 시 `src` autoplay swap 방식으로 바뀜. iframe이 클릭 시 navigation되므로 진입-시 preboot 효과(첫재생 지연 완화)가 대부분 무효화됨
- **왜 받아들였나**: postMessage ready-큐가 user-gesture 스택 밖이라 모바일 재생 자체가 안 됨(Codex 검증) — 정확성 > 지연 최적화
- **마이그레이션 경로**: 첫재생 지연을 다시 최적화하려면 공식 YouTube IFrame Player API(외부 스크립트 받아들임) 도입 검토 — gesture 내 `playVideo` 호출로 preboot + 모바일 재생 양립
- **영향 범위**: `src/app/(content)/sermons/_component/SermonVideoPlayer/SermonVideoPlayer.tsx`
- **발견일**: 2026-05-17 (PR #95, completed/2026-05-16-sermons-video-preconnect 회고)

### 🟡 설교 섹션 모바일 실기기 QA 미완 (PR #95)

- **상태**: 검증 필요 (자동검증 불가 항목)
- **무엇**: 모바일 영상 단일탭 재생/정지, 탭바 sticky(헤더 오프셋·containing block), 공유 BottomSheet 터치, 스켈레톤 속도, Kakao(폰+KakaoTalk)는 tsc/lint/build로 확인 불가. Chrome 모바일 에뮬레이션도 autoplay 정책을 그대로 재현하지 못함
- **조치**: develop Vercel preview를 실기기에서 점검, 회귀가 보이면 후속 폴리시
- **영향 범위**: `/sermons/[id]` 모바일
- **발견일**: 2026-05-17 (PR #95 머지, 실기기 검증을 머지 뒤로 미룸)

### 🟡 @next/bundle-analyzer가 Turbopack 빌드와 비호환 (sermons-a11y-perf 8-4)

- **상태**: 진행 중 (측정 도구 무력 — 런타임 동작은 정상)
- **무엇**: `next.config.ts`에 `withBundleAnalyzer`(`ANALYZE=true`)가 배선돼 있으나 Next 16 기본 Turbopack 빌드에서 "The Next Bundle Analyzer is not compatible with Turbopack builds, no report will be generated"로 리포트가 안 나옴. sermons 8-4 감사의 번들 byte-% 기준(단일 의존 ≥ route First Load JS 30%)·Code Splitting ≥10% 판정을 측정할 수 없음
- **왜**: 복구는 `next.config.ts` 수정(webpack 빌드 전환 또는 analyzer 교체) = ADR_TRIGGER_PARTS. 8-4 Non-goal·escape hatch라 이 범위에서 제외
- **마이그레이션 경로**: `next build --webpack` 한 번 측정, 또는 `next build --experimental-analyze` 산출(`.next/diagnostics/analyze/<route>/analyze.data`) 파서 도입, 또는 analyzer를 Turbopack 호환 도구로 교체 — 별도 plan + ADR 판단
- **영향 범위**: `next.config.ts`(측정만 — 런타임 번들 자체 정상, knip 신규 미사용 0)
- **발견일**: 2026-05-18 (sermons-a11y-perf 8-4 감사)

### 🟡 sermons Core Web Vitals 런타임 미측정 (sermons-a11y-perf 8-4)

- **상태**: 진행 중 (자동검증 불가 항목)
- **무엇**: LCP/INP/CLS는 headless 빌드 환경에 브라우저가 없어 측정 불가. 정적 감사로 이미지 리사이즈 결함(loader)은 고쳤으나 실측 수치 없음
- **왜**: 빌드 환경에 브라우저 없음. 런타임 메트릭은 배포 프리뷰에서만 측정 가능
- **마이그레이션 경로**: Vercel preview URL에 Lighthouse mobile 1회 — 기준 LCP ≤2.5s·CLS ≤0.1·INP ≤200ms. 미달 항목만 후속 plan
- **영향 범위**: `/sermons`·`/sermons/all`·`/sermons/[id]`·`/sermons/series`·`/sermons/series/[id]`
- **발견일**: 2026-05-18 (sermons-a11y-perf 8-4 감사)

### 🟡 Codex 백그라운드 호출 stall + cancel 슬래시 파싱 에러

- **상태**: 등록만 (활성 조치 미수행 — 2026-05-30 사용자 결정 "지금 조치 안 함")
- **무엇**: `codex:rescue` 백그라운드 호출이 큰 prompt + 다수 rg 호출 시 stall. 본 세션에서 14분+ 1건·4시간+ 좀비 1건 동시 관측. companion cancel(`node codex-companion.mjs cancel <job-id>`)은 Git Bash가 `taskkill /PID`의 슬래시를 `C:/Program Files/Git/PID` 경로로 변환 → 좀비 잔존
- **왜**: companion script가 `{ shell: true }`로 spawn — Git Bash가 슬래시 인자를 경로로 해석. companion 외부 의존(Claude Code 플러그인)이라 본 저장소에서 직접 수정 불가
- **마이그레이션 경로**: (a) 본 저장소 `scripts/codex-cancel.mjs` wrapper 신설 — PowerShell `Stop-Process -Id <PID> -Force` 직접 호출 (b) `AGENTS.md`·`codex-reviewer.md`에 "foreground only + 짧은 prompt" 가이드 1줄 명시 (c) companion plugin upstream 패치 요청
- **영향 범위**: 본 저장소 `codex:rescue` 모든 백그라운드 호출. Windows 환경 직접 영향. Linux/macOS는 미확인
- **확인**: `node "<plugin-path>/codex-companion.mjs" status --all --json` 후 `running` 배열의 `elapsed` 비정상치(30분+) 검출
- **발견일**: 2026-05-30 (PR #104 후속 fix 진행 중 stall 2건 동시 관측, 인계 노트와 동일 패턴)

### 🟢 하위 페이지 og:image 소실 — openGraph 부분 선언 (PR #110 site-seo-meta)

- **상태**: 등록만 (site-seo-meta 범위 밖)
- **무엇**: about 등 하위 페이지가 `generateMetadata`에서 `openGraph`를 부분 선언하면, Next.js의 shallow merge로 root layout의 og:image가 사라진다. `/about`은 현재 og:image가 없다(curl 확인)
- **왜**: 이 문제는 site-seo-meta(작업 A) 이전부터 있었고, 페이지별 메타 정비는 작업 A의 Non-goal. 홈은 공유 상수 `OPEN_GRAPH_BASE`(`src/config/seo.ts`)를 펼쳐 이 문제를 피했다. 하위 페이지에는 아직 적용하지 않았다
- **마이그레이션 경로**: og:image가 필요한 하위 페이지의 `openGraph`를 `OPEN_GRAPH_BASE` 펼침으로 바꾸거나, 페이지별 전용 공유 이미지를 set. 공유 유입 점검 시 우선순위 결정
- **영향 범위**: `src/app/(content)/about/**` 등 자체 `openGraph`를 선언하는 하위 페이지
- **발견일**: 2026-06-09 (PR #110 site-seo-meta, 전체 라우트 curl 확인)

### 🟢 라우트·영역별 not-found 미세분화 부족 (not-found-page 후속)

- **상태**: 등록만 (not-found-page 범위 밖)
- **무엇**: 루트 다크 404가 모든 `notFound()`를 받지만 일부는 맥락에 안 맞거나 아예 안 걸린다.
  - 설교: `sermons/[id]`·`sermons/series/[id]`의 `notFound()`가 루트의 일반 "페이지를 찾을 수 없습니다"로 떨어진다. "설교를 찾을 수 없습니다 + 전체 설교 보기" 같은 전용 안내가 없다.
  - admin: `admin/sermons/[id]/edit`의 `notFound()`도 루트의 교회 다크 화면으로 떨어진다. admin 셸과 톤이 안 맞는다.
  - 공지 상세: `news/notices/[id]/page.tsx`가 미구현 스텁(`<div>page</div>`)이라 없는 공지 id로 가도 `notFound()`를 안 불러 HTTP 200 "page"가 뜬다. notices not-found는 리스트의 잘못된 쿼리(`/news/notices?page=abc`)로는 404가 뜨지만, 없는 공지 id 경로에선 `notFound()`가 안 불린다.
- **왜**: not-found-page는 루트 404와 notices 스텁 정리까지만 범위. 라우트별 맞춤 404와 미구현 상세 라우트는 별도 작업이다.
- **마이그레이션 경로**:
  - 설교: `src/app/(content)/sermons/not-found.tsx` 추가 — 설교 맥락 메시지 + 전체 설교 링크.
  - admin: `src/app/(admin)/not-found.tsx` 추가 — admin 셸 톤의 미니멀 404.
  - 공지 상세: `news/notices/[id]/page.tsx`를 구현할 때 조회 결과가 없으면 `notFound()` 호출.
- **영향 범위**: `src/app/(content)/sermons/`, `src/app/(admin)/`, `src/app/(content)/news/notices/[id]/`
- **확인**: `grep -rln "notFound()" src/app` (호출처 7곳, not-found 파일은 bulletins·notices·root 3개)
- **발견일**: 2026-06-10 (not-found-page 작업 중 `notFound()` 호출처 스캔)

### 🟢 알 수 없는 `?preacher=` 값이 필터 없이 전체 설교를 보여준다 (content-ux-polish PR #113)

- **상태**: 등록만 (PR #113 범위 밖)
- **무엇**: `/sermons/all?preacher=zzz`처럼 매칭되는 설교자가 없는 값은 `resolvePreacherName`이 `undefined`를 반환해 필터가 안 걸리고 전체 설교가 뜬다. 존재하지만 발행 0편인 설교자(`?preacher=박지권`)는 정상 해석돼 빈 결과를 보이는 것과 동작이 어긋난다.
- **왜**: 시리즈에는 `isUnknownSeries` 가드(미매칭 slug → 빈 상태)가 있으나 설교자에는 대응 가드가 없다. PR #113은 0편 필터 표시·회귀 해소까지만 범위.
- **마이그레이션 경로**: `sermons/all/page.tsx`에 `isUnknownPreacher`(원문 `preacher`가 있는데 `allPreachers`에 없음) 가드를 추가해 `isUnknownSeries`와 같은 EmptyState로 떨어뜨린다.
- **영향 범위**: `src/app/(content)/sermons/all/page.tsx`, `src/utils/sermon.ts`
- **발견일**: 2026-06-11 (PR #113 Codex 1차 검증)
