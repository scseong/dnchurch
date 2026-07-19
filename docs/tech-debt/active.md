# Tech Debt — Active

활성 기술 부채. 신규 부채는 이 파일에 추가한다. 해결되면 [`resolved.md`](resolved.md)로 옮긴다. 형식 규칙은 [`../tech-debt-tracker.md`](../tech-debt-tracker.md) 참조.

---

### 🟢 `setAll`이 cookie options를 버리고 예외를 삼킴 — SSR 클라이언트 쿠키 쓰기 실패를 감춤 (password-reset-otp PR #150)

- **무엇**: `createServerSideClient()`의 `setAll`이 `cookies().set(name, value)`만 호출해 Supabase가 넘긴 cookie options(maxAge·httpOnly·sameSite 등)를 버리고, try-catch로 예외를 삼킨다 (`src/lib/supabase/server.ts:22-25`). 세션 쿠키 쓰기가 실패해도 조용히 지나간다.
- **왜 지금 안 하나**: password-reset-otp 작업 전부터 있던 동작이라 외과적 범위 밖. OTP 흐름은 이 상태에서도 E2E 통과했다.
- **다음 기준**: 쿠키 관련 인증 버그(세션 유실·옵션 누락)가 실제로 재현되면 착수.
- **마이그레이션 경로**: `setAll`에서 각 쿠키에 options를 함께 전달하고, 실패 시 최소 로깅하도록 고친다.
- **확인**: `src/lib/supabase/server.ts`의 `setAll`이 options 인자를 `cookies().set`에 전달하는지.
- **발견일**: 2026-07-16 (password-reset-otp PR #150 — Codex 계획 검증 지적)

---

### 🟢 package-lock.json에 @tanstack/react-table 항목이 남음 — lockfile 이중 관리 (bulletins-redesign PR #143)

- **무엇**: bulletins-redesign에서 유일 소비처(`BulletinTable`)를 지우고 `yarn remove @tanstack/react-table`로 `package.json`·`yarn.lock`에서 뺐으나 `package-lock.json`에는 항목이 남았다. 이 저장소는 yarn을 쓰는데 `package-lock.json`과 `yarn.lock`이 둘 다 커밋돼 있다(기존 상태).
- **왜 지금 안 하나**: `yarn remove`는 `yarn.lock`만 갱신하고 `package-lock.json`은 안 건드린다. `npm`으로 맞추면 의존성 해석 차이로 diff가 크게 번져 이번 변경과 섞인다.
- **다음 기준**: 두 lockfile 공존을 하나로 통일할 때 함께 정리한다. 이번 작업 범위 밖.
- **마이그레이션 경로**: lockfile 전략을 yarn 단일로 정하면 `package-lock.json`을 지우고, npm 단일이면 `yarn.lock`을 지운 뒤 `npm install`로 재생성한다.
- **확인**: `grep -c "@tanstack/react-table" package-lock.json` → 0
- **발견일**: 2026-07-04 (bulletins-redesign PR #143 완료 — TanStack 표 제거)

---

### 🟡 DB 위생 남은 분 — multiple_permissive·unused_index (2026-07-02 감사 P2)

- **상태**: 등록만 (db-hygiene-migration PR #139에서 4카테고리 해소, 이 2개는 분리)
- **해소분 (PR #139, `20260702000001_db_hygiene.sql`)**: RLS 정책 14개 `auth.uid()` 래핑(auth_rls_initplan 14→0), SECURITY DEFINER·트리거 함수 7개 search_path 고정(function_search_path_mutable →0), 중복 인덱스 `idx_sermons_date` 제거(duplicate_index 1→0), FK 인덱스 2개 추가(unindexed_foreign_keys 2→0). dev advisor 실측 0 확인.
- **남은 것**:
  - `multiple_permissive_policies`: "only admins can modify X" FOR ALL 정책이 공개 read SELECT와 중복 평가(staff·worship_schedules·site_settings·site_collections), sermons SELECT 2정책(admin·published) 중복. FOR ALL을 insert/update/delete로 나누거나 sermons SELECT를 `is_published OR admin`로 병합해야 하는데, RLS 명령 커버리지 재구조화라 고위험이고 ≤39행 테이블에서 효과가 없어 미룸.
  - `unused_index`: `idx_sermons_deleted_at`·`idx_sermons_service_type` 미사용(INFO). 미래 필터에서 쓸지 확인 후 판단. (PR #139로 만든 FK 인덱스 2개도 방금 생성돼 unused로 뜨나 이건 워크로드 쌓이면 쓰임)
- **왜 지금 안 하나**: 고위험(RLS 재구조화)·저효과(소테이블). advisor WARN/INFO 레벨.
- **뿌리 원인**: 마이그레이션 파일과 실 DB의 어긋남 — dev가 마이그레이션 추적 시작(2026-06-11) 전에 손으로 만들어져 파일이 실 DB를 재현하지 못한다. 고아 함수(`handle_updated_at`)·누락 인덱스가 그 예이고, PR #139 CI에서 실제 fresh replay가 실패했다(가드로 우회). baseline 복구는 [`resolved.md`](resolved.md) "마이그레이션이 DB를 재현하지 못함"(2026-06-12 해소)이 다뤘고, dev에 `custom_access_token_hook`이 없는 드리프트가 남아 있다(`config.toml:178` 선언과 불일치 — 2026-07-02 dev `pg_proc` 실측).
- **확인**: `mcp__claude_ai_Supabase__get_advisors` (performance·security) 재실행
- **발견일**: 2026-07-02 (리팩토링 감사 — advisor 실 DB 점검), 2026-07-02 4카테고리 해소(PR #139)

### 🟢 섬기는 사람들 — legacy public/ 프로필 이미지를 Cloudinary로 아직 안 옮김 (감사 P4)

- **무엇**: `serving-people/page.tsx:57`이 `staff.image_url`이 `/`로 시작하는 legacy `public/` 자산이면 raw `<img>` 분기를 탄다(eslint-disable로 의도 표시). Cloudinary 자산은 이미 `<CloudinaryImage>`를 쓰므로, 남은 것은 코드가 아니라 데이터다.
- **왜 지금 안 하나**: DB `staff.image_url`의 legacy 행을 Cloudinary로 옮기는 데이터 이관이 먼저라 코드만 바꾸는 P4 범위 밖.
- **마이그레이션 경로**: legacy 행 확인(`select id, image_url from staff where image_url like '/%'`) → Cloudinary 업로드 → `image_url` 교체 → raw `<img>` 분기와 eslint-disable 제거.
- **확인**: 위 SQL 0건 + `rg "no-img-element" src/app/(content)/about/serving-people` 0건
- **발견일**: 2026-07-02 (리팩토링 감사 P4 — explorer 재조사에서 분기 구조 확인)

### 🟡 가입 폼에 민감정보(종교)·국외이전 별도 동의 UI가 없음 (privacy-policy PR #130 — 런칭 게이트)

- **상태**: 등록만 (오픈 전 단계라 실수집 없음 — 런칭 전 필수)
- **무엇**: 개인정보처리방침 페이지(`/privacy-policy`)는 만들었으나, 회원가입 폼(`SignUpForm`)에 (1) 종교 관련 민감정보(교인 여부·소속 부서·사역, 제23조) 별도 동의, (2) 국외이전(Supabase·Cloudinary·Vercel) 고지·동의 체크박스가 없다. 처리방침 §9는 "별도 동의 절차가 마련된 범위 내에서" 처리한다고 고지하나 실제 동의 UI가 없어 문서와 앱이 어긋난다.
- **왜 지금 안 하나**: privacy-policy task는 처리방침 문서 페이지만 범위였다. 동의 UI는 가입 흐름 변경이라 분리했다. 현재 오픈 전 단계로 실사용자 수집이 없어 활성 위반은 아니다.
- **왜 미루면 안 되나(데드라인)**: `/sign-up`이 실제 제출 가능해져 실사용자가 가입하면 제23조 민감정보 별도 동의 공백이 즉시 출시를 막는 사유가 된다. **7/1 런칭 전 반드시 추가한다.**
- **마이그레이션 경로**: `SignUpForm`(또는 가입 Server Action 동의 단계)에 민감정보·국외이전 별도 동의 체크박스 + `/privacy-policy` 링크를 추가하고, 동의 값을 저장·검증한다. `/sign-up`·`/login`은 `(content)` 밖 root라 Footer가 없으므로 폼 안에 링크를 둔다.
- **영향 범위**: `src/app/_component/auth/SignUpForm`, `src/actions/auth.action.ts`, 가입 흐름
- **확인**: 가입 폼에 민감정보·국외이전 별도 동의 체크박스 존재 여부
- **발견일**: 2026-06-19 (privacy-policy PR #130 Codex 리뷰 — 처리방침 문구와 동의 UI 정합성 지적)

### 🟢 새가족 공개 폼 — interests 배열 DB 중복 미차단 (new-family-form-hardening PR #135)

- **무엇**: `new_family_registrations.interests`의 DB CHECK는 허용값(`<@`)과 개수(`<= 5`)만 본다. 서버 액션은 `[...new Set(...)]`로 중복을 제거하지만, anon이 PostgREST로 직접 insert하면 `['예배','예배']` 같은 중복 배열이 그대로 저장된다. 이후 관리자 화면·관심 영역 집계가 같은 신청자를 여러 번 셀 수 있다.
- **왜 지금 안 하나**: 배열 원소 중복 금지는 단순 CHECK로 표현할 수 없고(CHECK에 서브쿼리 불가) immutable 함수나 트리거가 필요하다. interests는 5개 고정 선택지의 부분집합이라 직접 insert 중복은 저위험이라, 함수 추가 대신 서버 dedupe로 두었다.
- **마이그레이션 경로**: `array_has_no_dups(text[])` immutable 함수를 만들고 `check (array_has_no_dups(interests))`를 추가한다. 또는 관리자 집계 단에서 distinct로 정규화한다.
- **영향 범위**: `supabase/migrations/`(new_family_registrations), 관리자 집계
- **발견일**: 2026-06-30 (PR #135 GitHub Codex 리뷰 P2)

### 🟢 새가족 공개 폼 — 스팸 방지(captcha/rate-limit) 없음 (new-family-form-hardening)

- **무엇**: `/about/welcome` 공개 폼이 anon insert를 허용하는데 captcha·rate-limit이 없어, 봇·반복 제출로 등록 큐가 오염될 수 있다. 입력 무결성·동의는 이 task에서 강화했으나 남용 방지는 별개 축이다.
- **왜 지금 안 하나**: 이번 범위는 데이터 무결성·민감정보 동의였다. 남용 방지는 외부 captcha 서비스나 rate-limit 인프라 결정이 필요해 분리했다.
- **다음 기준**: 공개 폼 악용 징후 또는 운영 요청 시.
- **마이그레이션 경로**: Turnstile·hCaptcha 같은 captcha를 폼·Server Action에 붙이거나, IP·세션 기준 rate-limit을 둔다.
- **영향 범위**: `src/app/(content)/about/welcome/_component/NewFamilyRegister.tsx`, `src/actions/new-family.action.ts`
- **발견일**: 2026-06-30 (new-family-form-hardening 후속)

### 🟡 홈 Hero 캐러셀에 자동재생 정지 수단이 없음 (WCAG 2.2.2)

- **상태**: 등록만 (home-gold-redesign PR #132에서 분리)
- **무엇**: `HeroCarousel`이 5.5초 간격 무한 자동재생인데 멈출 버튼이 없다. `stopOnMouseEnter`는 hover에서만 멈추고, `stopOnInteraction: false`라 도트·터치 조작 뒤에도 계속 돈다. 모바일·키보드 사용자나 천천히 읽는 사용자가 움직임을 제어하지 못한다.
- **마이그레이션 경로**: `prefers-reduced-motion`을 존중해 모션 최소화 설정에서 자동재생을 끄고, 정지·재생 토글 버튼을 추가한다.
- **영향 범위**: `src/app/_component/home/HeroCarousel.tsx`
- **발견일**: 2026-06-26 (PR #132 codex 재리뷰 #D)

### 🟢 홈 리디자인으로 생긴 미사용 코드 정리

- **상태**: 등록만 (home-gold-redesign PR #132에서 분리)
- **무엇**: 미사용 코드가 여러 곳에 남았다.
  - 이번 리디자인으로 새로 고아가 된 export: `getRevealStyle`(`src/utils/reveal.ts`), `NOTICE_CATEGORY_VARIANT`(`src/constants/notice.ts`)
  - 이전부터 미사용: `AboutOurChurch`·`ChurchVision`(컴포넌트 파일 + `src/app/_component/home/index.ts` export)
  - 미사용 스타일: `BottomNav.module.scss`의 옛 `drawer_overlay` 클래스
- **왜 지금 안 하나**: 고아 export는 홈 밖 공용 파일이라 외과적 변경 범위를 넘어 분리했다. `reveal.ts`의 `revealStyle`은 `AboutOurChurch`·`ChurchVision`이 아직 써서 함께 묶어 지워야 한다.
- **마이그레이션 경로**: `AboutOurChurch`·`ChurchVision` 삭제 여부를 정하고, 그에 딸린 `revealStyle`·`getRevealStyle`·`NOTICE_CATEGORY_VARIANT`·`drawer_overlay`를 한 번에 제거한다. `yarn knip`으로 확인한다.
- **영향 범위**: `src/utils/reveal.ts`, `src/constants/notice.ts`, `src/app/_component/home/`, `src/components/layout/BottomNav/`
- **발견일**: 2026-06-26 (PR #132 knip + 리뷰)

### 🟢 주보 수정 시 Cloudinary 삭제를 RPC 반환값으로 검증 (profiles-rls-rpc-guard PR #115)

- **상태**: 등록만 (PR #115에서 1차 보강 완료, 더 견고한 방식은 후속)
- **무엇**: `updateBulletinAction`이 폼의 `cloudinaryId`로 Cloudinary 원본을 지우던 교차 삭제 갭은 PR #115에서 "RPC 전에 DB에서 `bulletinId` 소속 `cloudinary_id`를 조회해 그 값만 삭제"로 1차로 막았다. 다만 조회와 RPC 삭제가 분리돼, 그 사이에 값이 바뀔 틈(TOCTOU)이 남는다.
- **마이그레이션 경로**: `update_bulletin` RPC가 실제 삭제한 `cloudinary_id[]`를 반환하게 바꾸고, 액션은 그 반환값만 `deleteImage`에 넘긴다. SQL 함수 반환 타입 + 서비스 타입까지 2-3파일.
- **영향 범위**: `supabase/migrations/`(update_bulletin), `src/services/bulletin/`, `src/actions/update-bulletin.action.ts`
- **발견일**: 2026-06-11 (PR #115 GitHub Codex 리뷰 P2)

### 🟡 가입 닉네임이 어디에도 저장되지 않음 (username → display_name 경로 부재)

- **무엇**: 가입 폼이 닉네임(`username`)을 받아 길이 검증까지 하지만, `supabase.auth.signUp`의 metadata에 넣지 않고 `profiles`에 `username` 컬럼도 없다 (후보는 nullable `display_name`). `user_metadata.username`을 읽는 코드도 `src/`에 0건 — 입력값이 어디에도 저장되지 않는다.
- **왜 지금 안 하나**: PR #116 이전 클라이언트 `signUp`부터 `name`만 전송하던 기존 결함이라, Server Action 전환(PR #116)은 동작을 보존했다. metadata 1줄 추가만으로는 해결되지 않아(소비처 없음) 분리했다.
- **마이그레이션 경로**: ① 프로필 생성 트리거(`handle_new_user`)가 읽는 metadata 키를 DB에서 확인 → ② `signUpAction`의 `options.data`에 `username`을 추가하고 트리거가 `display_name`으로 저장하게 수정 (또는 액션이 가입 직후 `profiles`를 UPDATE)
- **영향 범위**: `src/actions/auth.action.ts`, supabase 프로필 생성 트리거, 가입 폼 안내 문구
- **발견일**: 2026-06-12 (PR #116 Gemini 리뷰 — Codex 교차 검증으로 기존 결함 확인)

### 🟡 `app/ → apis/` 직접 호출 (레이어 위반, 5건)

- **무엇**: 페이지·홈 컴포넌트가 `services/` 경유 없이 `apis/`를 직접 import
- **왜**: 초기 단순 구조에서 services 레이어 도입 전에 작성된 코드
- **현재 상태**: ESLint 룰 `error`로 올림 — 새 위반은 즉시 차단. 기존 항목은 line-level `eslint-disable-next-line no-restricted-imports` + tech-debt 주석으로 마킹
- **마이그레이션 경로**: 각 호출 사이트를 `services/` 또는 Server Component data fetcher 경유로 교체. 모두 해결되면 disable 주석 일괄 제거
- **영향 범위** (5건):
  - `src/app/(content)/about/serving-people/page.tsx` — `getActiveStaff`
  - `src/app/_component/home/AboutOurChurch.tsx` — `getSiteSettings` (knip 미사용 export — "홈 리디자인으로 생긴 미사용 코드 정리" 항목에서 컴포넌트째 지우면 함께 소멸)
  - `src/app/_component/user/UserProfileModal.tsx` — `signOut` (knip 미사용 파일 — 같은 사정)
  - `src/app/_component/auth/{SignInForm,KakaoLoginBtn}.tsx`
  - (auth 2건은 클라이언트 직접 호출이 정당할 수 있어 정책 결정 필요)
- **확인**: `rg "from ['\"]@/apis/" src/app` → 5 hits
- **발견일**: 2026-05-01 (ESLint 레이어 룰 도입 시)
- **2026-05-02**: `worship/page.tsx` 해소 (`services/worship/` 도입) — 10건 → 9건
- **2026-05-21**: `about/location/page.tsx` 해소 (`services/about/getLocationPageData` 경유) — 9건 → 8건
- **2026-07-02 재측정**: 8건 → 5건. `Banner`는 홈 리디자인으로 `getSiteSettings` 호출이 빠졌고, `SignUpForm`·`EmailVerificationRequestForm`은 Server Action 전환으로 `apis/` 직접 import가 사라졌다.

### 🟢 ESLint `react-hooks/set-state-in-effect` (3건, 9건 정리됨)

- **무엇**: useEffect 내 setState 직접 호출 (cascading rerender 가능성)
- **왜**: React Compiler 신규 룰. 9건은 후속 컴포넌트 리팩터(useDialog 통합·SermonListPage 재구조 등) 과정에서 자연스럽게 사라짐. 남은 건은 외부 동기화가 정당한 패턴(Modal portal snapshot, pathname 변경 동기화)으로 line-disable + 사유 주석 유지
- **마이그레이션 경로**:
  - `ConfirmModal/index.tsx:47` — portal transition 중 prop 동기화. `useDialog` 통합 작업 시 재검토
  - `useDrawerHistory.ts:52` — pathname 변경에 따른 외부 상태 동기화. 외부 router 이벤트로 옮길 수 있는지 검토
  - `ClientPortal.tsx:23` — hydration mismatch 방지용 client-only mount 게이트여서 유지가 정당하다. 2026-07-19 인라인 `-- 사유` 주석을 붙여 셋 다 형식을 맞췄다
- **영향 범위** (3건):
  - `src/components/admin/common/ConfirmModal/index.tsx:47`
  - `src/hooks/useDrawerHistory.ts:52`
  - `src/components/ui/ClientPortal/ClientPortal.tsx:23`
- **확인**: `rg "react-hooks/set-state-in-effect" src` → 3 hits
- **발견일**: 2026-05-01
- **재확인일**: 2026-05-21 (1건 → 2건, useDrawerHistory 추가됨)
- **2026-07-02 재확인**: 2건 → 3건 (ClientPortal 추가 — 셋 중 유일하게 disable 사유 주석이 없음)
- **2026-07-19**: ClientPortal에 인라인 사유 주석을 붙여 셋 다 line-disable 주석에 사유를 함께 달았다. 셋 다 외부 동기화가 정당한 패턴이라 유지한다(제거 대상 아님).

### 🟡 ESLint warnings (18건)

- **무엇**: `@next/next/no-img-element` 9, `react-hooks/incompatible-library` 5, `react-hooks/exhaustive-deps` 3, `@typescript-eslint/no-unused-vars` 1
- **왜**: 룰 낮춤 또는 케이스별 정당한 사용 가능. 빌드 차단은 안 됨
- **마이그레이션 경로**: `tech-debt-cleanup-phase2` EXEC_PLAN에서 처리 — 카테고리별 일괄 처리 또는 케이스별 검토
- **확인**: `yarn lint`
- **발견일**: 2026-05-01
- **2026-07-02 재측정**: 40건 → 18건. `no-unused-vars` 10 → 1, `no-restricted-imports`는 line-disable 주석 처리로 경고 목록에서 빠졌다(남은 5건은 별 항목 "app/ → apis/ 직접 호출"이 추적).

### 🟡 Knip 미사용 코드 (86건)

- **무엇**: Unused files 12, Unused exports 28, Unused exported types 44, Unused devDependencies 1, Unresolved import 1(`kakao.maps.d.ts`)
- **왜**: 리팩토링 후 정리 안 됨, 또는 false positive (예: prettier는 eslint-config-prettier에서 사용)
- **마이그레이션 경로**: `tech-debt-cleanup-knip` EXEC_PLAN — 항목별 false positive 검증 후 삭제
- **확인**: `yarn knip`
- **발견일**: 2026-05-01
- **2026-07-02 재측정**: ~50건 → 86건. 미사용 타입 14 → 44 — `src/components/ui/index.ts` barrel이 타입까지 재export해 원본·barrel 양쪽이 같이 잡힌다. 미사용 파일 12에는 회원(`UserProfile`·`UserProfileModal`)·`about/worship` 옛 컴포넌트가 남아 있다.
- **2026-07-19 부분 해소(knip-dead-code-cleanup)**:
  - 지운 것: 미사용 파일 10 → 0(참조 0으로 검증한 파일 13개 + 연쇄로 죽은 `IconWrap`), 죽은 export 6개. 내부에서만 쓰는 3개는 `export`만 뗐다.
  - 유지: 남은 미사용 export 8 + 타입 43. `Footer`(복원 예정)·`Carousel`·`useCarousel`·`CarouselArrows`와 타입 43개는 `components/ui` 재사용 킷의 공개 API이자 barrel이 자동으로 만든 재export라 둔다. `prettier`·`kakao.maps.d.ts`는 config가 쓰는 오탐이다.
  - 다음: UI 킷 공개 API 정리 작업에서 barrel 재export 정책과 함께 판단한다.

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

### 🟢 토큰 부채 — 디자인 시스템 v4 미완 남은 부분 (hex/rgba 직접 사용)

- **무엇**: 시맨틱 토큰을 거치지 않은 hex/rgb 값 직접 사용
- **왜**: v4 마이그레이션이 sermons/news 영역에 한정. about/home/admin은 후속 phase로 분리
- **마이그레이션 경로**:
  - hex: 비-admin 우선 시맨틱 토큰 치환
  - rgba: overlay/scrim은 `$overlay-*`, hover/active는 `$bg-hover`/`$primary-subtle`로 정리
- **영향 범위 (대표 — 2026-07-02 재측정)**:
  - hex: 위 "SCSS 하드코딩 색상" 항목과 같은 대상(33건·17파일)이라 이 항목은 rgba 축만 추적한다. about 페이지 hex는 리디자인으로 사라졌다
  - rgba: `(content)` 18곳/8파일 — `SermonFeatured` 4·`SermonVideoPlayer` 4·`AboutWorship` 3·`NoticeTable` 2·`SermonSeriesCarousel` 2·`NoticeDrawer` 1·`SeriesDetailPage` 1·`GridCard` 1
- **발견일**: 2026-05-07 (Codex 디자인 시스템 audit)

### 🟢 ui/Button disabled가 전용 색 없이 `opacity: 0.5`로만 처리됨 (auth-form-ui-migration)

- **상태**: 등록만 (상태 토큰화는 "완전한 디자인 시스템 구축" 단계에서 진행 — 2026-06-14 사용자 결정)
- **무엇**: `ui/Button`의 disabled가 `Button.module.scss:11-14`에서 `opacity: 0.5`만 건다. variant별 전용 disabled 색이 없어, `.primary`(`$primary` = navy-800)가 비활성일 때 연회색이 아니라 "navy를 50% 투명도로 깐 진한 회색-네이비"로 보인다. 레거시 `FormSubmitButton.module.scss:10-15`는 `background: $gray-200` + `$gray-300` 보더의 전용 disabled 색이라 비활성이 더 분명했다. auth 폼을 ui/로 모으면서 두 버튼의 disabled 모습 차이가 드러났다.
- **왜 지금 안 하나**: opacity 방식은 흔한 관례라 회귀가 아니다. disabled를 전용 색으로 바꾸면 모든 `ui/Button`(전역)의 비활성 모습이 함께 바뀌어 영향이 넓다. 컴포넌트 상태(hover·active·disabled) 스펙을 한 번에 정의하면 세 상태가 같은 토큰 체계를 따른다.
- **마이그레이션 경로**: ① Figma(디자인 값 출처, SoT)에 Button 상태 스펙(hover·active·disabled)을 명시한다 ② `_color.scss`에 disabled 시맨틱 토큰을 정의한다(`$txt-disabled` 재사용 + variant별 disabled 배경 신설 등) ③ `Button.module.scss`의 `opacity: 0.5`를 variant별 `&:disabled` 색 규칙으로 교체한다. hover·active도 같은 단계에서 토큰으로 정의한다.
- **영향 범위**: `src/components/ui/Button/Button.module.scss`(전역 — 모든 Button 소비처), Figma Button 컴포넌트 스펙
- **확인**: `rg -n "opacity|:disabled" src/components/ui/Button/Button.module.scss` → 현재 `opacity: 0.5` 1건, variant별 `&:disabled` 색 규칙 0건
- **발견일**: 2026-06-14 (auth-form-ui-migration BEFORE/AFTER 비교 중 사용자 지적)

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

### 🟢 `getAllSeries`/`getAllPreachers` `select('*')` payload 미최적화 (PR #91 Gemini 리뷰)

- **무엇**: `src/services/sermon/sermon-service.ts:137,216` `allSeries`/`allPreachers`가 `select('*, sermons!inner(count)')`로 전체 컬럼 조회. 사이드바·필터 시트는 일부 필드만 사용
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

### 🟢 figma-console DTCG export — 숫자 scale 이름↔값 불일치 + alias 미해결 (figma-sync PR #118)

- **상태**: 등록만 (figma-console 재연결 후 규명 — Figma 근본 디자인 시스템 개선 → 코드 이식 작업 때)
- **무엇**: `docs/design-system/tokens.tokens.json`(Figma→DTCG 피벗)에 두 가지가 있다. ① 숫자 scale 토큰의 이름과 값이 어긋난다 — `spacing.scale.32`=24, `radius.scale.40`=32 등, spacing·radius 두 컬렉션에서 같이 나타난다. ② `$value`가 `{gold.600}` 형태인데 실제 primitive는 `primitives.gold.600`에 있어 alias 47개가 표준 DTCG resolver에서 미해결로 남는다. PR #118 자동 리뷰(Gemini·Codex)가 지적, Claude 교차 검증으로 확인.
- **왜 지금 안 하나**: 손으로 쓴 `src/styles/tokens/*`는 그대로라 앱이 무관하고, 색 드리프트 점검(raw-hex 41개 0건)도 유효하다. 이 피벗을 정본·재import 원본으로 쓰기 전까지는 막지 않는다. 원인(export 직렬화 문제 vs Figma 변수 값)을 가리려면 figma-console 재연결이 필요한데 지금 끊겨 있다.
- **마이그레이션 경로**:
  - ① figma-console 재연결 후 `figma_get_variables`로 Figma 원본 spacing·radius 값을 직접 읽어 export 결과와 대조한다. export 버그면 도구 쪽을 우회·설정하고, Figma 값 문제면 Figma를 고친다.
  - ② alias는 `figma_import_tokens` 왕복이 `{gold.600}`을 푸는지 확인한다. 외부 resolver를 붙일 거면 `primitives.` 접두 경로로 정규화한다.
- **영향 범위** (2건): `docs/design-system/tokens.tokens.json`(생성물 — 손으로 고치지 말 것) / figma-console export 설정. 앱(`src/`) 무관
- **확인**: `git show feat/ds-figma-sync:docs/design-system/tokens.tokens.json` → spacing.scale(약 1911행)·radius.scale(약 1547행)에서 키↔`$value` 대조
- **발견일**: 2026-06-14 (PR #118 Gemini·Codex 자동 리뷰 + Claude 교차 검증)

### 🟢 ui/Select 반응형(custom listbox) 보류 — native select 유지

- **상태**: 등록만 (2026-06-15 Codex 2라운드 논의로 보류 결정)
- **무엇**: `ui/Select`는 styled native `<select>`라 닫힌 트리거는 일관되지만 열린 옵션 목록은 브라우저·OS마다 외형이 다르다. 모든 뷰포트에서 같게 맞추려면 PC는 custom listbox(`role=listbox/option`·키보드·포커스 복귀·바깥 클릭·포지셔닝)를 직접 구현해야 하고, 모바일은 BottomSheet가 필요하다. 호출부 3곳 중 모바일 시트가 실제 필요한 곳은 `NoticeControlBar`(분류) 하나뿐이다 — 설교 정렬은 `AdvancedFilterSheet` 경로가 따로 있고, admin `Pagination`의 page-size Select는 모바일에 렌더되지 않는다.
- **왜 지금 안 하나**: 현재 native `<select>`는 기능·접근성 결함이 없다. `aria-label`·키보드·option 의미를 브라우저와 보조기술이 처리한다. 차이는 열린목록 외형뿐이라, 결함 없는 native select를 custom listbox로 바꾸면 WAI-ARIA 접근성 계약을 직접 떠안아 회귀 위험만 커진다. 모바일 시트가 필요한 소비처도 하나뿐이라 공유 컴포넌트로 묶을 근거가 약하다.
- **마이그레이션 경로**: "PC 열린목록까지 외형을 같게 맞춘다"가 제품 요구로 확정되면 별도 exec-plan으로 custom listbox를 최소 a11y 범위(트리거 role, `listbox/option`, `aria-selected`, Arrow/Enter/Esc/Home/End, 바깥 클릭 닫기, 포커스 복귀)로 만든다. PC/모바일 분기는 `useMediaQuery` 대신 CSS로 trigger를 숨긴다(`useMediaQuery`는 서버에서 `false`를 반환해 첫 렌더가 모바일로 고정된다). `NoticeControlBar`의 수동 PC select + 모바일 BottomSheet 중복은 그 작업에서 함께 정리한다.
- **영향 범위**: `src/components/ui/Select/`, `src/app/(content)/news/notices/_component/NoticeControlBar.tsx` (현재 코드 변경 없음)
- **발견일**: 2026-06-15 (ui-select-responsive 설계 분석 — Codex 2라운드 논의로 선택지 C(custom listbox) 보류)

### 🟢 하네스 변경 전파 검증 없음, § 8 역할이 에이전트 정의에 안 적힘 (harness-pr-review-step 감사, PR #125)

- **상태**: 등록만 (실행 무해 — 하네스 확장 시 처리)
- **무엇**: 두 가지다. ① `### 8. PR_REVIEW` 신규 절차가 `harness-workflow/SKILL.md` 본문에만 들어가고, 그 역할을 쓰는 에이전트 정의에 전파되지 않았다 — `claude-code.md`에 PR_REVIEW 단계·답글 owner 역할 없음, `commit-pr-author.md`에 "긴·민감 답글 문체 위임" 역할 없음(SKILL `:235`이 위임 지시). ② 하네스 정책을 추가할 때 동기화 대상(에이전트 정의·CLAUDE 변경 이력·hooks README·SSOT 포인터·폐기어)을 강제 점검하는 절차가 없다. 같은 PR에서 D5(답글 산문화)를 6곳에 못 옮겼고, hooks README도 한 달간 옛 내용으로 남았다. 둘 다 같은 원인이다.
- **왜 지금 안 하나**: § 8은 skill 트리거로 로딩돼 실제 실행은 정상이다. 에이전트 정의는 "역할 문서"라, 누락돼도 동작이 깨지지 않고 새 세션이 역할을 재구성할 때만 사각이다. PR #125는 산출물 정합성 최소 수정이 범위라, 역할 전파·체크리스트 신설까지 섞으면 비대해진다.
- **마이그레이션 경로**:
  - ① `claude-code.md`에 "PR 리뷰 대응(조건부)" 절 추가(§ 8 루프·답글 작성 주체), `commit-pr-author.md` 적용 범위표에 "PR 리뷰 공개 답글 문체 위임" 1행 추가. 출처 `harness-workflow/SKILL.md:235`.
  - ② `harness-workflow/SKILL.md` `## 하네스 변경 이력` 부근에 "§ N 변경 시 동기화 대상" 체크리스트 1블록. 폐기어는 `check-doc-style` hook denylist로 강제 검토.
- **다음 기준**: § 9 이상의 새 절차나 에이전트를 추가할 때 함께.
- **영향 범위** (3건): `.claude/agents/claude-code.md`·`.claude/agents/commit-pr-author.md`·`.claude/skills/harness-workflow/SKILL.md` (현재 코드·실행 변경 없음)
- **발견일**: 2026-06-16 (harness-pr-review-step 정합성 감사 — 감사 에이전트 3 + Codex 교차, Codex가 근본 원인 적발)

### 🟡 `/reset-password`에 흐름 가드·현재 비밀번호 재확인이 없음 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (배포 전 손볼 값어치 큼 — high)
- **무엇**: `/reset-password`는 미들웨어 보호 라우트가 아니고, `ResetPasswordFlow`는 진행 중 재설정 흐름(쿠키·세션)이 있는지 확인하지 않고 항상 폼을 보여준다. `updatePasswordAndSignOut`은 쿠키가 없으면 `supabase.auth.updateUser({ password })` 폴백을 탄다(`reset-password/actions.ts:55`). 그래서 로그인된 사용자가 메일 없이 `/reset-password`에 직접 들어가도 현재 비밀번호 확인 없이 비밀번호를 바꿀 수 있다. 세션을 탈취했거나 공용 PC에 남은 로그인 상태에 접근한 사람이 계정을 영구 장악할 수 있다. 재설정 액션에 서버측 `PASSWORD_REGEX` 재검증도 없다(가입은 하는데 재설정만 빠짐).
- **왜**: 6자리 OTP 도입(PR #149)은 "찾기" 단계만 실검증으로 바꿨고, 이 페이지 가드는 범위가 아니었다. 다른 기기 세션 폐기는 `signOut()` 기본 scope가 `global`이라 이미 된다(코드로 재확인).
- **마이그레이션 경로**: (1) `/reset-password`를 진행 중 흐름이 있을 때만 폼 노출, (2) OTP recovery 세션의 `updateUser`로 통일하고 admin·평문 userId 쿠키 경로 제거, (3) 액션 진입부에서 `PASSWORD_REGEX` 재검증, (4) 계정 설정의 "비밀번호 변경"은 재설정과 분리하고 현재 비밀번호 재확인 요구.
- **영향 범위**: `src/app/(auth)/reset-password/{page.tsx,actions.ts,_component/ResetPasswordFlow.tsx}`, `src/lib/supabase/middleware.ts`
- **확인**: `rg "PASSWORD_REGEX" "src/app/(auth)/reset-password/actions.ts"` → 0 hits (서버 재검증 없음). 로그인 상태로 `/reset-password`에 직접 접근했을 때 폼이 그대로 뜨는지 확인.
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 8-1 — `docs/research/2026-07-16-auth-a-to-z.md`)

### 🟡 미들웨어 redirect 시 갱신된 세션 쿠키가 사라짐 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (배포 전 손볼 값어치 큼 — high)
- **무엇**: `getUser()`가 토큰을 리프레시하면 새 쿠키가 `response`에 쌓이는데, 가드 분기가 `NextResponse.redirect(...)`를 새로 만들어 반환할 때(`middleware.ts:26`·`31`) 그 쿠키를 복사하지 않는다. 토큰이 막 리프레시된 요청에서 리다이렉트가 나면 새 토큰이 브라우저로 가지 않아, 만료 직전 사용자가 튕기고 재로그인이 불안정해질 수 있다.
- **왜**: Supabase SSR 문서도 피하라고 적어 둔 패턴이다. 액세스 토큰이 1시간 유효해 리프레시와 가드 리다이렉트가 겹치는 순간이 드물다. 그래서 지금까지 드러나지 않았다.
- **마이그레이션 경로**: 두 리다이렉트 분기에서 `response.cookies.getAll()`을 순회해 새 리다이렉트 응답에 복사한다. 두 분기 공통이라 작은 헬퍼로 묶는다.
- **영향 범위**: `src/lib/supabase/middleware.ts`
- **확인**: `rg "cookies" src/lib/supabase/middleware.ts` → 두 `NextResponse.redirect` 분기(`:26`·`:31`)에 쿠키 복사가 없음을 확인.
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 8-2 — `docs/research/2026-07-16-auth-a-to-z.md`)

### 🟡 open redirect — `auth/callback`의 `next`와 로그인 `redirect`가 검증 없이 쓰임 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (medium)
- **무엇**: 세 진입점이 리다이렉트 값을 검증 없이 그대로 쓴다.
  - `auth/callback/route.ts`가 `next`를 `${origin}${next}`에 문자열로 붙인다. `next=@evil.com`이면 `new URL('https://dnchurch.vercel.app@evil.com')`의 최종 host가 `evil.com`이 된다(userinfo 구문). 코드로 재현해 외부 도메인 이탈이 실제로 됨을 확인했다. `next=//evil.com`은 경로로 붙어 이탈하지 않는다 — 위험한 건 `@` 접두 형태다.
  - `SignInForm`·`SessionContextProvider`가 `redirect`를 검증 없이 쓴다. `SignUpWizard`에만 상대 경로 가드가 있어 비대칭이다.
- **왜**: 2026-06-23 감사에서는 콜백 `next`를 "origin 접두로 완전 이탈은 막힌다"며 low로 판정했으나, 이번에 `@` userinfo 우회를 재현해 medium으로 올렸다. 카카오 OAuth를 거치지만 피싱에 쓸 수 있다.
- **마이그레이션 경로**: `startsWith('/') && !startsWith('//')`인 상대 경로만 허용하는 공용 가드 헬퍼를 만들고, 콜백 `next`·로그인 `redirect` 세 진입점에 함께 적용한다.
- **영향 범위**: `src/app/auth/callback/route.ts`, `src/app/_component/auth/SignInForm.tsx`, `src/context/SessionContextProvider.tsx`
- **확인**: `node -e "console.log(new URL('https://dnchurch.vercel.app'+'@evil.com').host)"` → `evil.com` (외부 이탈 재현). `rg "startsWith\('/'\)" src/app/auth/callback/route.ts src/app/_component/auth/SignInForm.tsx` → 0 hits (가드 없음).
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 8-3·8-6 — `docs/research/2026-07-16-auth-a-to-z.md`)

### 🟡 미들웨어 보호 라우트가 정확 일치라 하위 경로가 가드 밖 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (medium — 마이페이지 본 기능 도입 전 처리)
- **무엇**: 가드가 `exactMatches.includes(path)`라 `/mypage`만 정확히 일치할 때 로그인을 강제한다. `/mypage/[id]` 같은 하위 라우트는 정확 일치에도 동적 패턴에도 안 걸려 통과한다. 지금은 `/mypage`가 placeholder라 노출 피해가 없으나, 마이페이지 본 기능이 붙으면 배열에서 빠진 하위 경로가 비로그인 노출로 이어진다.
- **왜**: 보호 라우트를 라우트 트리가 아니라 손으로 적은 배열로 관리한다. 마이페이지 미완성 항목(같은 파일의 `/mypage` 인증 흐름 부재)과 함께 본다.
- **마이그레이션 경로**: 정확 일치 대신 prefix 매칭(`path === '/mypage' || path.startsWith('/mypage/')`)으로 바꾼다.
- **영향 범위**: `src/lib/supabase/middleware.ts`
- **확인**: `rg "exactMatches|startsWith" src/lib/supabase/middleware.ts` → `exactMatches`는 있고 `/mypage` prefix 매칭은 없음을 확인.
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 8-5 — `docs/research/2026-07-16-auth-a-to-z.md`)

### 🟡 관리자 역할을 부여하는 정식 경로가 없음 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (배포 전 필요 — high)
- **무엇**: `checkAdminPermission`은 `profiles.role === 'admin'`을 보지만, 누군가를 admin으로 만드는 마이그레이션·UI·절차가 코드에 없다. 첫 관리자는 Supabase 대시보드에서 손으로 행을 고쳐야만 생긴다.
- **왜**: 운영 배포 후 관리자가 없는 상태가 되거나, 손수 DB 편집이라는 추적 안 되는 작업에 의존한다. 가입 승인 흐름이 없는 문제와 같은 축이다.
- **마이그레이션 경로**: 초기 admin을 심는 시드 마이그레이션을 두거나, 관리자만 역할을 부여하는 절차·화면을 만든다.
- **영향 범위**: `supabase/migrations/`, `src/actions/_auth-helpers.ts`, 관리자 화면
- **확인**: `rg -i "role.*=.*'admin'|update.*profiles.*set.*role" supabase/migrations` → 역할을 부여·시드하는 마이그레이션 0건 (읽기 가드만 존재).
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 8-4 — `docs/research/2026-07-16-auth-a-to-z.md`)

### 🟢 인증 서버 모듈에 `server-only` 경계 표기가 없음 (2026-07-16 인증 A-to-Z 감사)

- **상태**: 등록만 (낮은 우선순위 — 미래 회귀 방지용)
- **무엇**: `src/lib/supabase/admin.ts`(service_role 키)·`src/apis/auth-server.ts`(서버 세션 조회)에 `import 'server-only'` 가드가 없다. 현재 호출처가 서버 코드뿐이라 안전하나, 실수로 클라이언트 번들에 섞여도 빌드 타임에 막지 못한다.
- **왜**: 초기 작성 시 경계 표기를 안 붙였다. 지금은 결함이 아니라 미래 회귀 방지 장치가 없는 상태다.
- **마이그레이션 경로**: 두 파일 상단에 `import 'server-only';`를 더한다. 함께 `_auth-helpers.ts:8`의 `app_metadata` 런타임 검증 없는 타입 단언도 검토한다.
- **영향 범위**: `src/lib/supabase/admin.ts`, `src/apis/auth-server.ts`
- **확인**: `rg "server-only" src/lib/supabase/admin.ts src/apis/auth-server.ts` → 0 hits.
- **발견일**: 2026-07-16 (인증 A-to-Z 감사 10절 — `docs/research/2026-07-16-auth-a-to-z.md`)


### 🟢 `uploadImage()`가 public_id에 폴더를 두 번 넣음 (2026-07-17 my-page 실측)

- **상태**: 등록만 (낮은 우선순위 — 렌더·삭제는 정상 동작)
- **무엇**: `uploadImage()`가 Cloudinary upload 옵션에 `folder`와, 같은 folder를 앞에 붙인 `public_id`를 동시에 넘긴다. Cloudinary는 folder를 public_id 앞에 다시 붙여 최종 public_id가 `<folder>/<ROOT>/<folder>/<file>`처럼 폴더가 중복된 경로로 저장된다. 주보(`bulletin_images.cloudinary_id`)와 마이페이지 아바타(`profiles.avatar_url`) 모두 이 패턴이다.
- **왜**: DB에는 업로드 응답의 실제 public_id가 저장되므로 URL 합성·렌더·삭제는 전부 맞는 경로를 쓴다. 결함이 아니라 Cloudinary 콘솔에서 자산 경로가 길고 중복돼 보이는 관리 문제다.
- **마이그레이션 경로**: `uploadImage()`에서 `folder` 옵션을 빼고 `public_id`만 넘기거나, `public_id`를 filename만 남긴다. 기존 자산은 경로 그대로 두고 신규 업로드부터 적용한다.
- **영향 범위**: `src/apis/cloudinary.ts`, (선택) 기존 Cloudinary 자산 정리
- **확인**: dev DB `SELECT cloudinary_id FROM bulletin_images ORDER BY created_at DESC LIMIT 1` → `uploads/bulletins/2026/07/05/dnchurch-dev/uploads/bulletins/2026/07/05/...` 중복 경로 확인.
- **발견일**: 2026-07-17 (my-page 아바타 업로드 브라우저 실측 — `docs/exec-plans/active/2026-07-17-my-page.md` 후속 작업)

### 🟡 성경읽기 기록기 낱장 토글이 탭마다 Server Action을 호출 (2026-07-17 bible-reading-tracker)

- **상태**: 등록만 (다음 PR에서 개선 — medium)
- **무엇**: `TrackerSection.toggleChapter`가 낱장 모드에서 장 하나를 누를 때마다 `recordChaptersAction`/`unrecordChaptersAction`을 한 번씩 호출한다. 낱장으로 10장을 하나씩 누르면 서버 왕복이 10번 일어난다(각 호출이 서버에서 `getUser` + settings 조회 + upsert/delete). 범위·모두읽음·해제는 이미 한 번에 묶어 보낸다.
- **왜**: 낙관적 UI로 화면은 즉시 반영되지만 네트워크·DB 요청이 잦다. 또한 같은 장을 아주 빠르게 켰다 껐다 하면 record/unrecord 요청이 순서 보장 없이 각각 날아가 드물게 최종 상태가 어긋날 여지가 있다(rapid-toggle race).
- **마이그레이션 경로**: 탭은 로컬 state에만 반영하고, 300~500ms 디바운스 후(또는 기록기 닫힘·날짜/책 전환 시) 그 책·날짜의 변경분을 모아 `record`/`unrecord`로 한 번에 flush한다. 호출 수가 줄고 rapid-toggle race도 사라진다.
- **영향 범위**: `src/app/(content)/mypage/_component/tracker/TrackerSection.tsx`
- **확인**: 낱장 모드로 여러 장을 연속 탭하며 네트워크 탭에서 Server Action POST가 탭 수만큼 발생하는지 확인.
- **발견일**: 2026-07-17 (bible-reading-tracker 구현 중 사용자 지적)

### 🟡 성경읽기 공유 OG(링크 미리보기) 이미지 라우트가 로그인 없이 열리고 파라미터도 제한하지 않아 렌더 비용이 커질 수 있음 (my-page PR #153)

- **상태**: 등록만 (다음 PR에서 개선)
- **무엇**: `/share/reading/image`가 로그인 없이 열리고 `robots.ts`도 `/share`를 허용한다(`src/app/share/reading/image/route.tsx`). 통계를 `p`·`c`·`s` 파라미터로 받아 요청 시 Satori+resvg로 PNG를 그리는데, `Cache-Control: immutable`은 같은 URL만 캐시한다. 파라미터 조합이 사실상 무제한(`p` 3 × `c` 0~9999 × `s` 0~366 ≈ 1,100만)이라, 값을 바꿔가며 호출하면 매번 캐시 미스로 새 렌더가 Node 서버리스에서 돈다. 누구나 파라미터 루프로 Vercel 함수 호출·CPU 과금을 늘릴 수 있는 구조다.
- **왜 지금 안 하나**: 소규모 교회 사이트라 실제 트래픽 노출은 낮고, `parseCount`가 값을 상한(`CHAPTERS_MAX` 9999·`SECONDARY_MAX` 366)으로 이미 자른다. 구조적 취약점이지 즉시 장애는 아니다.
- **마이그레이션 경로**: `c`·`s` 값을 버킷(예: 10장 단위)으로 반올림해 캐시 가능한 조합 수를 줄이거나, 라우트 앞단에 가벼운 rate-limit을 둔다. 또는 Vercel 기본 방어에 맡기고 수용한다(사용자 판단).
- **영향 범위**: `src/app/share/reading/image/route.tsx`, `src/utils/bible-share.ts`(파라미터 파싱)
- **확인**: `curl`로 `?c=` 값을 바꿔가며 연속 호출 시 매번 `x-vercel-cache: MISS`로 새 렌더가 도는지 확인.
- **발견일**: 2026-07-19 (my-page PR #153 머지 전 위험 점검 — 사용자 지시로 기록)

### 🟡 마이페이지를 열 때마다 부서·구역 참조 데이터를 캐시 없이 다시 조회 (my-page PR #153)

- **상태**: 등록만 (다음 PR에서 개선)
- **무엇**: `getDeptDistrictOptions`가 `createServerSideClient()`(무캐시)로 `departments`·`districts`를 읽는다(`src/apis/reference.ts:11`). 두 테이블은 거의 바뀌지 않는 정적 참조 데이터인데, 마이페이지를 열 때마다 프로필 편집 드롭다운용으로 2쿼리를 새로 친다.
- **왜 지금 안 하나**: 인증된 개인 페이지 컨텍스트라 큰 병목은 아니고, 이번 PR 범위는 기능 구현이었다. 캐시 도입은 별도 판단.
- **마이그레이션 경로**: 두 조회를 `createStaticClient()` + 태그 캐시로 옮기고, 부서·구역 관리 화면에서 값이 바뀔 때 `updateTag`로 무효화한다. RLS는 authenticated 읽기라 정적 클라이언트로도 읽힌다(공개 SELECT 정책 확인 필요).
- **영향 범위**: `src/apis/reference.ts`, (선택) 부서·구역 관리 액션의 캐시 무효화
- **확인**: 마이페이지를 연속 새로고침하며 `departments`·`districts` 쿼리가 매번 DB로 나가는지(캐시 히트 없는지) 확인.
- **발견일**: 2026-07-19 (my-page PR #153 머지 전 위험 점검 — 사용자 지시로 기록)

### 🟡 이미지 저장에만 쓰는 html-to-image가 마이페이지 첫 로드 JS에 늘 포함됨 (my-page PR #153)

- **상태**: 등록만 (다음 PR에서 개선)
- **무엇**: `ShareSheet`가 `import { toPng } from 'html-to-image'`로 정적 import하고(`ShareSheet.tsx:5`), `TrackerSection`이 이 시트를 열림 여부와 상관없이 늘 마운트한다(`TrackerSection.tsx:268`). "이미지 저장" 버튼을 한 번도 누르지 않는 사용자도 이 라이브러리를 마이페이지 첫 진입 JS로 받는다. html-to-image는 이번 PR에서 새로 추가한 의존성이다(`package.json`).
- **왜 지금 안 하나**: 라이브러리가 아주 크지 않고(수십 KB) 기능은 정상 동작한다. 첫 번들에서 빼는 건 동작과 무관한 최적화라 분리했다.
- **마이그레이션 경로**: `handleSaveImage` 안에서 `const { toPng } = await import('html-to-image')`로 동적 import하면 마이페이지 첫 로드 JS에서 빠지고, 버튼을 누른 사용자만 내려받는다.
- **영향 범위** (1건): `src/app/(content)/mypage/_component/tracker/ShareSheet.tsx`
- **확인**: `rg "from 'html-to-image'" src` → 정적 import면 1건(현 상태), 동적 import로 바꾸면 `await import('html-to-image')` 형태만 남고 이 grep은 0건.
- **발견일**: 2026-07-19 (my-page PR #153 머지 전 위험 점검 — 사용자 지시로 기록)
