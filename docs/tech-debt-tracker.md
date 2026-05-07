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

<!-- last-audit: 2026-05-07 -->
