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

### 🟡 ESLint `react-hooks/set-state-in-effect` (10건)

- **무엇**: useEffect 내 setState 직접 호출 (cascading rerender 가능성)
- **왜**: React Compiler 신규 룰. 일부는 정당한 사용일 수도, 일부는 진짜 안티패턴
- **마이그레이션 경로**: 케이스별 검토 — 이벤트 핸들러로 이동, derived state로 변환, 또는 룰 disable + 사유 주석. `tech-debt-cleanup-phase1.5` EXEC_PLAN에서 처리
- **영향 범위** (10개 파일, 1건씩):
  - `src/app/(content)/news/notices/_component/NoticeControlBar.tsx`
  - `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx`
  - `src/app/(content)/sermons/_component/SeriesBrowserSheet/SeriesBrowserSheet.tsx`
  - `src/app/(content)/sermons/_component/SermonVideoTools/SermonVideoTools.tsx`
  - `src/components/admin/sermons/SermonListPage/hooks/useListFilters.ts`
  - `src/components/admin/sermons/SermonListPage/index.tsx`
  - `src/components/common/Modal.tsx`
  - `src/components/layout/BottomNav/BottomNav.tsx`
  - `src/components/layout/Header/DesktopHeader.tsx`
  - `src/hooks/useMediaQuery.ts`
- **발견일**: 2026-05-01

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

<!-- last-audit: 2026-05-01 -->
