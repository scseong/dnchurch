# tech-debt-pre-release

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-22
- **브랜치**: phase별 분기 — `feat/sermons-publish-ssot` 머지 후 base branch에서 신설
- **Open questions**:
  - phase별 task-id 부여 방식 — 이 plan 단일 task-id 누적 vs phase별 `start-task.mjs` 호출로 plan 7개 신설 (verify-task 증적 분리 필요성 기준)
  - G4 home Hover Border 재정리 남은 분 — 2026-05-07 home-cleanup 이후 신규 사례 rg 재카운트 후 phase 6 범위 확정
  - G6 home `Banner.tsx`/`AboutOurChurch.tsx` server component 전환 가능 여부 — 현재 client 컴포넌트면 phase 7 대상 아님
- **ADR needed**: no — admin 토큰(부채 17)·`scripts/_shared-config.mjs` 등 `ADR_TRIGGER_PARTS`는 이 plan 대상 아님. `src/styles/_mixins.scss`·`_color.scss` 신설은 design-system v3/v4 framework 내 확장이라 ADR 불필요

## 목표

배포 전에 운영 사고(P0)·사용자 가시성(P1)·유지보수성(P2)에 직접 영향을 주는 부채 7개 그룹을 phase별 PR로 처리한다. 추적값 27건에서 실측으로 줄어든 항목(hex 49→23·`$beige-300` 5→2·`app/→apis` 9→8, 2026-05-26 재측정)을 반영해 작업 범위를 좁힌다. hex 감소분 다수는 #102 admin 토큰 통합이 admin `.module.scss` hex를 토큰으로 흡수한 결과. 배포 후 처리 항목은 후속 작업 섹션에 분리.

## 검증된 Assumptions

- `supabase` named export 사용처 2건 — `src/apis/auth.ts`·`src/context/SessionContextProvider.tsx` (rg `import.*\bsupabase\b.*from.*supabase`)
- `app/ → apis/` 직접 호출 8건 — line-disable 주석 8개 일치 (rg `eslint-disable-next-line no-restricted-imports`)
- `.module.scss` hex 색상 23건 (14 파일, 2026-05-26 재측정) — #102 admin 토큰 통합이 admin hex를 흡수해 44→23으로 추가 감소 (rg `#[0-9a-fA-F]{3,8}`)
- `$beige-300` 사용처 2건 (QuickAccess `:4`·SermonVideoPlayer `:74`, 2026-05-26 재측정) — sermons GridCard/SermonCard는 이미 처리됨 (rg `\$beige-300`)
- `0.8/0.9rem` 사용 10건 (10 파일) — about/news/home/admin 분포. tech-debt 추적값 2건 대비 많이 늘어남 (rg `0\.[89]rem`)
- `:focus-visible` outline 15건 이상 — NoticeControlBar 4·NoticeDrawer 2·NoticeTable 2·Pagination 1·ListItem 1·SermonNoteEditor 1·AdminHeader 1·primitives 2 (rg `:focus-visible`)
- `CloudinaryImage`는 React hook을 쓰지 않음 — loader closure만 반환 (`src/components/common/CloudinaryImage.tsx:12-42`)
- bulletin 업로드는 `Promise.all` 병렬 + sanitize-only filename — orphan/충돌 시나리오 코드 일치 (`src/actions/_bulletin-helpers.ts:18-22`)
- about silent fallback은 `getSiteCollection`/`getSiteSettings`/`getActiveStaff`/`getWorshipScheduleGroups`에서 발생 — `data?.items ?? []` 패턴 (`src/apis/site-collections.ts:19`, `src/services/about/index.ts:44-55`)

## Success Criteria

- **G1** bulletin — dev preset에서 5장 중 1장 강제 실패 시 Cloudinary 콘솔에 orphan 0건. 같은 폴더에 동일 sanitize 결과 filename 재업로드 시 기존 자산 overwrite 발생 안 함
- **G2** Supabase error 발생 시 Vercel Functions 로그에 `[<domain>] <op> error: ...` 형식 출력
- **G3** loader가 `f_auto,c_limit,w_W,q_auto:good` URL 생성. `getOgImageUrl`/`getKakaoShareUrl`/`getThumbnailUrl` 세 함수 export
- **G4** outline 정의된 모듈 전수에서 `focus-ring` mixin 호출 또는 토큰 변수 참조 (literal `2px solid $primary-active` 0건). `$beige-300` primitive 직접 사용 0건
- **G5** `.module.scss`에서 `font-size: 0.9rem` 0건. `0.8rem`은 spacing 용도만 남음. about 영역(`serving-people/page.module.scss` `#eee`) hex 0건
- **G6** `about/serving-people/page.tsx`·home `Banner.tsx`·`AboutOurChurch.tsx` 3건의 `@/apis/` 직접 import 0건 (services 경유)
- **G7** `src/lib/supabase/client.ts`의 `export const supabase` 제거. `useDrawerHistory`에서 drawer 열린 채 라우트 이동 → 뒤로가기 1회로 이전 페이지 도달
- **전체** 각 phase에서 `node scripts/verify-task.mjs <task-id>` PASS, `node scripts/harness-gate.mjs <task-id>` PASS

## 영향받는 파일

- **G1**: `src/actions/_bulletin-helpers.ts`, `src/apis/cloudinary.ts`
- **G2**: `src/apis/site-collections.ts`, `src/apis/site-settings.ts`, `src/services/about/index.ts` (worship은 try/catch 보호 — 이 G2 대상 아님)
- **G3**: `src/utils/cloudinary.ts` (loader + preset 함수), OG metadata 사이트(`src/app/**/page.tsx` `generateMetadata`)
- **G4**: `src/styles/tokens/_color.scss`·`src/styles/_mixins.scss`, NoticeControlBar/Drawer/Table·Pagination·ListItem·SermonNoteEditor 등 focus 모듈, QuickAccess·SermonVideoPlayer (`$beige-300` 사용처)
- **G5**: `src/app/(content)/about/page.module.scss`·`about/serving-people/page.module.scss`·`about/vision/page.module.scss`, SermonCard/NoticeTable/NoticeCategoryFilter 등 font-size 0.9rem 사용처
- **G6**: `src/app/(content)/about/serving-people/page.tsx`, `src/app/_component/home/Banner.tsx`/`AboutOurChurch.tsx`, `src/services/staff/` 또는 `src/services/about/` 확장
- **G7**: `src/lib/supabase/client.ts`, `src/apis/auth.ts`, `src/context/SessionContextProvider.tsx`, `src/hooks/useDrawerHistory.ts`, `CLAUDE.md`

## 단계별 체크리스트

- [ ] **Phase 0 — 준비**
  - [ ] `feat/sermons-publish-ssot` 머지 또는 stash 정리 후 base 확정
  - [ ] Open question(task-id 부여 방식) 결정 — phase별 신설로 결정 시 `start-task.mjs` phase 진입마다 호출

- [ ] **Phase 1 — G1: Bulletin 업로드 안전성 (P0)**
  - [ ] `_bulletin-helpers.ts` `Promise.all` → `Promise.allSettled`, fulfilled의 `public_id`를 `deleteImage`로 정리 후 rejection 재throw
  - [ ] filename에 `${orderIndex}-${randomUUID().slice(0,8)}-${sanitized}` prefix 적용
  - [ ] dev preset 1장 강제 실패 수동 검증 — Cloudinary 콘솔 orphan 0건 확인
  - [ ] PR prefix: `Fix`

- [ ] **Phase 2 — G2: Supabase silent fallback 로깅 (P0)**
  - [ ] `getSiteCollection` — **백틱 템플릿 리터럴 필수**: `if (error) console.error(\`[site-collections] ${key}\`, error)` (싱글쿼트 사용 시 `${key}` 치환 안 되고 문자열 그대로 출력)
  - [ ] `getSiteSettings`·`getActiveStaff` — 동일 패턴 (백틱 + `${변수}` 치환)
  - [ ] PR prefix: `Fix`

- [ ] **Phase 3 — G7: 잔재 정리 (P3 · 작은 마감)**
  - [ ] `client.ts`의 `export const supabase` 제거, 2 호출처를 `getSupabaseBrowserClient()`로 교체
  - [ ] CLAUDE.md gotcha 1줄 갱신 — `supabase named export deprecated` 항목 삭제
  - [ ] `useDrawerHistory` pathname effect에 guarded cleanup 패턴 도입 — `if (pushed.current && history.state?.__drawer === true) { history.replaceState({ ...history.state, __drawer: undefined }, '', window.location.href); pushed.current = false; }`로 Drawer-pushed history entry의 `__drawer` 키만 제거 + 기존 history.state 다른 키(Next.js router 내부 state) 보존. **`history.back()` 금지** — route commit 직후 effect가 실행되면 방금 이동한 history entry를 되돌려 사용자가 이전 페이지로 튕김 (Drawer 안 Link 사용 시). **`replaceState` guard 필수** — Drawer가 push하지 않은 entry(Next.js router push)는 절대 건드리지 않음. 이 G7이 훅 수정을 맡음. sitemap D4는 BottomNav '전체'를 `openDrawer`에 **연결**해 이 훅을 쓰기만 함(수정 없음).
  - [ ] PR prefix: `Refactor`

- [ ] **Phase 4 — G3: Cloudinary 품질·preset (P1)**
  - [ ] `createCloudinaryLoader`의 `q_${quality || 85}` → `q_auto:good` 일괄 전환
  - [ ] `utils/cloudinary.ts`에 `getOgImageUrl(publicId)`·`getKakaoShareUrl(publicId)`·`getThumbnailUrl(publicId)` 함수 추가 (각 use-case 변환 파라미터 고정)
  - [ ] OG metadata 사이트의 `generateMetadata`에서 신규 함수로 교체
  - [ ] PR prefix: `Feat`

- [ ] **Phase 5 — G5: typography 토큰 + about hex (P1)**
  - [ ] `font-size: 0.9rem` 3건(SermonCard·NoticeTable·NoticeCategoryFilter) → `$font-size-11` 또는 `$font-size-12` 상향
  - [ ] `0.8rem` 7건은 모두 padding/transform 용도(font-size 0건) → `$spacing-*` 토큰 분리
  - [ ] about 영역 hex 1건(`serving-people/page.module.scss` `#eee`) 시맨틱 토큰 매핑
  - [ ] PR prefix: `Style`

- [ ] **Phase 6 — G4: focus-ring + `$beige-300` + home Hover Border (P1)**
  - [ ] home Hover Border 남은 사례 rg 재카운트 — `:hover` 안 `border-color`/`border` 패턴 (Open question 해소)
  - [ ] `$focus-ring-strong` 토큰 신설(`2px solid $primary-active`), `focus-ring($variant)` mixin 도입
  - [ ] NoticeControlBar 4건·NoticeDrawer 2건·NoticeTable 2건 mixin 호출로 교체
  - [ ] Pagination·ListItem·SermonNoteEditor는 변형 그대로 mixin 인자 전달
  - [ ] `$bg-card-warm`·`$bg-gradient-warm-end` semantic 신설, QuickAccess·SermonVideoPlayer 사용처 치환
  - [ ] home Hover Border 남은 사례가 있으면 hover-lift/shadow/text-underline 패턴으로 교체
  - [ ] PR prefix: `Style` 또는 `Refactor`

- [ ] **Phase 7 — G6: `app/→apis` 단계 정리 (P2)**
  - [ ] `about/serving-people/page.tsx`의 `getActiveStaff` 호출을 services 경유로 이동
  - [ ] home `Banner.tsx`/`AboutOurChurch.tsx` server component 전환 가능성 확인 — 가능하면 fetcher 경유, 불가능하면 이 plan 대상 아님으로 분리
  - [ ] auth 4건·UserProfileModal 1건은 이 plan 대상 아님 → 후속 작업 섹션에 기록
  - [ ] PR prefix: `Refactor`

- [ ] **Phase 8 — 마무리**
  - [ ] `docs/tech-debt-tracker.md`에서 처리 항목을 활성 → 해결됨으로 이동, 일부 처리 항목은 카운트만 갱신
  - [ ] last-audit 날짜 갱신

## Verification

- 각 phase 머지 전: `node scripts/verify-task.mjs tech-debt-pre-release` (또는 phase별 task-id 결정 시 해당 slug)
- 머지 전 게이트: `node scripts/harness-gate.mjs <task-id>`
- 이 plan은 7개 PR로 나뉘므로 phase별 task-id 부여 여부는 Open question — Phase 0에서 결정

## 접근법

7개 그룹의 우선순위는 사용자 영향 기반 — P0 운영 사고 → P1 UX → P2 유지보수. phase 순서는 의존성 없으므로 P0(G1·G2)·P3 작은 마감(G7)을 먼저 묶어 추진력 확보, 이후 P1·P2 진행. 한 phase = 한 PR = 한 commit prefix. 이 plan은 마스터 트래커 역할이며 phase 머지 시 체크박스만 갱신.

## Non-goals

- admin 토큰 통합 (부채 17) — 이미 완료 (ADR 0012 / PR #102, 2026-05-26 해소). 이 plan 범위 아님
- design-system-v4 admin Hover Border 5건 (부채 6 admin 분량) — admin 토큰 통합(ADR 0012) 완료됨, 따로 후속 phase
- SCSS primitive 토큰 143건 (부채 7) — 영역별 점진 마이그. 한 PR에 안 들어감
- Cloudinary `uploadImage` folder+public_id 단순화 (부채 20) — smoke test 필수
- `CloudinaryImage` 'use client' 제거 (부채 24) — loader closure RSC 직렬화 비호환
- 다크모드 토큰 (부채 8)·도구류 `complete-task.mjs`·`harness-gate.mjs` (부채 18·21)·layer 룰 상대 경로 (부채 2) — 배포 대상 아님
- ESLint warnings 40건·Knip 50건·SCSS 네이밍 12건 — 노이즈 청소는 `tech-debt-cleanup-phase2` 따로 task

## 의사결정 로그

- **D1 — 통합 plan 1개에 phase 7개(따로 plan 7개 아님)**
  - 문제: 27개 부채를 한 PR로 묶으면 리뷰 단위가 너무 커 회귀 추적 불가. 부채마다 plan 별도면 active/가 7개로 부풀어 추적 흐려짐. 마스터 plan 없이 분산되면 우선순위·후속 작업 가시성 손실.
  - 해결: 통합 plan 1개에 phase 1~7을 두고 phase 단위로 PR 분할. PR 도메인은 bulletin·Supabase·잔재·Cloudinary·typography·focus/색·layer로 한 PR = 한 의도 원칙 유지. 이 plan은 트래커이며 phase 머지 시 체크박스 갱신.
  - 결과: PR 7개로 압축, 도메인별 회귀 격리, 진행 상황 단일 plan에서 추적.

- **D2 — G1 bulletin orphan asset: `Promise.allSettled` + cleanup**
  - 문제: 5장 병렬 업로드 중 1장 실패 시 성공한 자산이 Cloudinary에 남음. 거두는 정책 없음.
  - 해결: sequential 업로드(latency 5배)·Cloudinary multi-upload API(비공식·진행률 UI 어려움) 대신 `Promise.allSettled` + 성공분 `deleteImage` 후 rejection 재throw. sermon `removeStorageObjects` 패턴과 일관해 향후 공통 helper 추출 여지 확보.
  - 결과: 동시성 유지 + atomic 시도. cleanup 자체 실패는 console.error로 추적.

- **D3 — G1 bulletin filename: `orderIndex + UUID8` prefix**
  - 문제: `sanitize`만 거치는 현재 구조는 같은 폴더에 동일 이름 재업로드 시 `public_id` 충돌로 기존 자산 overwrite.
  - 해결: `${Date.now()}-${name}`(시계 의존)·Cloudinary 자동 public_id(DB 저장값이 hash → admin 검색성 ↓) 대신 `${orderIndex}-${randomUUID().slice(0,8)}-${sanitized}`. orderIndex가 폼 내 순서, UUID가 충돌 방지. Cloudinary 콘솔은 시간순 정렬이라 가독성 영향 미미.
  - 결과: 동시·재업로드 충돌 확률 사실상 0.

- **D4 — G2 silent fallback 로깅: 1라인 console.error**
  - 문제: Supabase error 시 무음 fallback으로 빈 화면 렌더 — 운영에서 검출 불가. ADR 0006 silent fallback 원칙은 사용자 경험 우선이라 유지해야 함.
  - 해결: shared logger 추상화(본 부채에 과잉)·throw 전환(ADR 0006 번복) 대신 사이트별 1라인 `if (error) console.error('[<domain>] <op>', error)`. Vercel Functions 로그로 검출. 향후 Sentry 도입 시 logger로 일괄 교체.
  - 결과: ADR 0006 유지 + 운영 가시성 마련.

- **D5 — G3 Cloudinary 품질: `q_auto:good` 일괄 전환**
  - 문제: `q_85` 고정으로 bandwidth 최적화 여지 손실.
  - 해결: A/B 측정 선행(시간·도구 비용)·use-case별 분기(컴포넌트 prop 비용) 대신 `q_auto:good` 일괄 전환. `q_auto` 시리즈는 컨텐츠 분석 기반이라 시각 회귀 거의 없음. 1줄 변경, 문제 시 즉시 rollback.
  - 결과: bandwidth 약 -20% (Cloudinary 공식 통계), 모바일 LCP 부수 효과.

- **D6 — G3 use-case preset: 명명 함수 3개**
  - 문제: OG·Kakao·다운로드 등 각 use-case 변환 파라미터 일괄 적용 부재.
  - 해결: 단일 함수 + preset 옵션(호출부에서 키 기억 부담)·case-by-case 유지(부채 누적) 대신 `getOgImageUrl`(1200x630 c_fill)·`getKakaoShareUrl`(800x400)·`getThumbnailUrl`(300x300) 세 함수 분리. IDE autocomplete 활용·호출부 의도 자명.
  - 결과: derived asset 종류 통제, transformation 비용 감소.

- **D7 — G4 focus-ring: variant mixin + 토큰 신설**
  - 문제: 15+ 모듈의 outline이 색·width·offset 제각각. NoticeControlBar/Drawer/Table 8건은 같은 패턴(`2px solid $primary-active`)인데 SSOT 없음.
  - 해결: 단일 mixin 일괄(다양성 손실)·case-by-case(디자이너 협의 비용) 대신 `$focus-ring-strong` 토큰 신설 + `focus-ring($variant)` mixin. 동일 패턴 8건 일괄 + 변형(negative offset·`$border-primary`)은 mixin 인자로 수용.
  - 결과: SSOT 마련, 토큰 변경 시 일괄 반영.

- **D8 — G4 `$beige-300` semantic: card·gradient 분리 신설**
  - 문제: 2 모듈 2건. QuickAccess는 카드 배경, SermonVideoPlayer는 gradient end — 의미가 다름. SKILL.md "미정" 보류 상태.
  - 해결: primitive 직접 유지(부채 남음)·`$cream-300` 기존 매핑(디자인 의도 손실) 대신 `$bg-card-warm`·`$bg-gradient-warm-end` 분리 신설. 두 의미를 토큰 이름으로 명시.
  - 결과: SKILL.md "미정" 해소, 향후 cream/beige 계열 의미 분기 가능.

- **D9 — G5 typography: 11/12 상향 일괄**
  - 문제: 0.8/0.9rem 10건 — primitive `$font-size-11`이 최저. 8/9px 사용 의도 미확인.
  - 해결: `$font-size-8`/`$font-size-9` 신규 primitive(WCAG 권장 외 — 12px 이하 본문 비권장)·case-by-case(시간 비용) 대신 font-size 용도는 11/12 보수적 상향. padding/transform 용도 0.8rem은 spacing 토큰 분리.
  - **컨텍스트 (1rem ≈ 10px)**: 본 프로젝트는 fluid typography(`html { font-size: 2.777778vw }`, `src/styles/globals.scss:112`) 적용 — 360px viewport 기준 `1rem ≈ 10px`. 따라서 `0.9rem = 9px → $font-size-11 = 1.1rem = 11px`은 **모든 viewport에서 상향**(viewport 커지면 둘 다 같은 비율로 ↑). 일반 `1rem = 16px` 가정 시 false positive(축소·WCAG 위반) 발생 — 본 plan 검토 시 fluid typography 컨텍스트 우선.
  - 결과: 접근성 손실 없음, primitive 추가 없이 해소.

- **D10 — G6 `app/→apis` 단계 분리(3건 이 plan, 5건 후속)**
  - 문제: 8건 일괄 정리 시 auth 정책(client 직접 호출 정당성)·home server component 전환 확인이 묶여 PR 비대화.
  - 해결: 일괄(정책 결정 부담)·현상 유지(부채 남음) 대신 단계 분리. about/serving-people 1건 즉시 services 경유, home Banner/AboutOurChurch 2건은 server component 전환 가능 시 fetcher로(불가능 시 후속), auth 4건은 따로 task에서 정책 결정, UserProfileModal 1건은 client signOut 정당화로 disable 주석 유지.
  - 결과: 이 phase에서 3건 정리(8→5), 남은 건 후속 작업 섹션에 기록.

## 후속 작업

- **admin 토큰 통합** (부채 17) — ✅ 완료 (ADR 0012 / PR #102, 2026-05-26 해소). SCSS 토큰 20개 신설 후 admin 13파일 340 사용처를 시맨틱 토큰으로 치환.
  - 기록 위치: `docs/tech-debt/resolved.md`
- **design-system-v4 admin Hover Border 5건** — admin 토큰 ADR(0012)이 결정돼 선행 조건 충족. 따로 후속 phase에서 진행.
  - 기록 위치: `docs/tech-debt/active.md` (admin 5건)
- **SCSS primitive 토큰 143건** — 영역별 분리 PR(home/about/sermons/news/admin). 모두 정리 후 stylelint warning → error 격상.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 7
- **Cloudinary `uploadImage` 단순화** (부채 20) — dev/prod preset smoke test 후. `asset_folder` + `public_id_prefix` 전환 vs 단순화 비교.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 20
- **`CloudinaryImage` 'use client' 제거** (부채 24) — loader closure RSC 직렬화 비호환. cropMode 조합 prebuild 가능성 평가 후 결정. 미해소 유지 가능.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 24
- **auth 4건 client services 추출 또는 정책 예외** — `services/auth/index.client.ts` 신설 vs ESLint 룰 override. 따로 task에서 정책 결정.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 16 auth 분량
- **ESLint warnings·Knip·SCSS naming 노이즈** — `tech-debt-cleanup-phase2` 따로 task와 묶음 검토.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 14·15·16
- **다크모드 토큰**·도구류 `complete-task.mjs`/`harness-gate.mjs`·layer 룰 상대 경로 — 배포 대상 아님, 기존 부채 tracker 그대로 남김.
  - 기록 위치: `docs/tech-debt-tracker.md` 부채 8·18·21·2

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: Codex 계획 검증 후 갱신

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: 미작성
- **현재 판단**: 미작성
- **다음 행동**: verify-task 후 갱신

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

---

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->
