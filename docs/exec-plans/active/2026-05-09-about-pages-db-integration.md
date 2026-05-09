# about-pages-db-integration

- **상태**: 🟡 진행 중 (Phase 2 — 페이지 통합)
- **시작일**: 2026-05-09
- **브랜치**: refactor/about-page-redesign (Phase 1과 동일 — about 작업 한 묶음 PR)
- **선행**: [Phase 1 foundation](2026-05-08-about-pages-db-foundation.md) (마이그레이션·apis·types 완료)

## 목표

about/* 6 페이지의 hardcoded 동적 데이터를 Phase 1 foundation(`site_collections`·`staff.greeting_paragraphs`·`site_settings` 8키·`worship_schedules`) DB fetch로 교체. 정적 라벨/구조(ADR 0006 5단계 분류)는 hardcoded 유지.

## Assumptions

- ADR 0006의 SSOT 매핑 그대로 적용. 정적 라벨/슬로건/INDEX cards/STEPS/pillars/verse/sectionLabel 등은 page.tsx hardcoded.
- DB seed 값이 일부 `'TODO'` placeholder(Phase 1 의도된 비대칭) — page는 `'TODO'` 또는 빈 array 시 placeholder 표시 정책으로 안전 노출.
- Phase 2 영향 범위는 페이지 통합·service 작성 한정. admin UI·write RLS는 Phase 3.
- 같은 브랜치(`refactor/about-page-redesign`) 위에 쌓는다 — about 6 페이지 작업 한 묶음 PR.
- **staff 컬럼 확인 결과 (list_tables verbose)**: `staff`에 `role` 컬럼 없음. 컬럼은 `id, name, title, image_url, education[], experience[], contact, order_index, is_active, greeting_paragraphs`. 담임목사 row 식별은 `title='담임목사'` (단일 row 가정 + 다중 hit 시 `order_index` 우선).
- **PASTOR.career SSOT 정정**: ADR 0006이 약력을 staff SSOT로 분류했고 실 컬럼 `staff.education[]`+`staff.experience[]` 존재. 따라서 page의 `PASTOR.career` 배열은 hardcoded 유지가 아니라 두 컬럼을 page-level로 조립. (Codex CHANGE_REQUEST #4 반영)
- **worship_schedules 컬럼명**: `name, time, location, category(enum: main|church_school), sub_category(sunday|weekday|null), age_group, order_index, is_active`. EXPLORE 보고의 `place`는 실제 `location` 컬럼.
- **`getSiteCollection`이 자체 cache tag 보유**(`['site-collections', 'site-collection-${key}']`). 따라서 `services/about/`은 **별도 cache factory 없이 apis 호출만 조립** — `about-cache.ts` 신규 안 함. 기존 함수가 이미 `aboutCache`/`worshipCache`/`siteSettings` tag 가지므로 source별 invalidation 보존. (Codex CHANGE_REQUEST #2 반영)
- **Promise.all 실패 semantics**: `getSiteCollection`/`getSiteSettings`/`getActiveStaff`는 silent fallback. **예외**: `worshipService.list()`는 `handle-response.ts`에서 Supabase error를 throw — silent 아님. 따라서 services/about/index.ts에서 worship 호출만 try/catch로 감싸 빈 array fallback으로 정합. error boundary 불필요. (Codex 라운드 2 #1 반영)

## Non-goals

- admin CRUD UI(Phase 3).
- write RLS 정책 검증(Phase 3).
- prod(`xrfyevrnmvbuwsbktuja`) 마이그레이션 적용.
- 정적 라벨/구조 DB화(eyebrow, INDEX cards 4개, STEPS 4개, pillars, verse, signature, slogan, sectionLabel).
- Hub gallery 동적화 (Cloudinary URL hardcoded 유지).
- VISION_STATEMENT 4단락 DB화 (정적 — 거의 변경 없음).
- worship_schedules 스키마/seed 변경.
- 새 마이그레이션·새 site_collections row 추가.
- TODO seed 값을 실제 값으로 채우는 운영 작업(별도 admin 작업).
- 인접 코드 정리·rename·포맷.

## Success Criteria

- [ ] `src/services/about/index.ts` 신규 — Promise.all 페이지별 join 함수(`getHubPageData`, `getPastorPageData`, `getWelcomePageData`, `getVisionPageData`, `getWorshipPageData`, `getLocationPageData`). 단일 파일 — apis가 이미 cache tag·silent fallback 가짐.
- [ ] 6 page.tsx — hardcoded 동적 데이터를 service 호출로 교체
- [ ] worship page — 기존 `worshipService.list()` 연결, hardcoded `WORSHIP_TYPES` 9개 제거
- [ ] hub stats[0]·history mini, vision history — `getSiteCollection<HistoryItem>('church_history')` 공유 fetch
- [ ] welcome FAQ — `getSiteCollection<FaqItem>('welcome_faq')`
- [ ] pastor 인사말 — `getActiveStaff()` 결과에서 `title='담임목사'` row의 `greeting_paragraphs` 추출
- [ ] pastor 약력(career) — 같은 row의 `education[]`+`experience[]` page-level 조립 (SSOT는 staff)
- [ ] location 8키 — 기존 `getSiteSettings(keys)` 사용 (Phase 1에서 키 추가 완료)
- [ ] `'TODO'`/빈 fallback helper — 단순 함수 1개로 location 8키 ternary 반복 제거 (`displaySettingValue(value, fallback)`)
- [ ] `yarn build` PASS — 타입 통과 확인
- [ ] `verify-task` PASS — Phase 1 unused 3건이 사용 시작으로 knip 목록에서 빠지는지 확인

## Verification

- `yarn lint`, `yarn lint:styles`, `yarn build`, `yarn knip`
- `node scripts/verify-task.mjs about-pages-db-integration`
- 수동 (dev server): `yarn dev` 후 6 페이지 모두 렌더 확인 — 데이터가 DB에서 옴, 정적 라벨 정상, `'TODO'` 값 fallback 동작
- knip: Phase 1의 unused **export 단위** 정정 (파일 단위 표기 부정확):
  - `getSiteCollection` (`src/apis/site-collections.ts:5`) → services/about에서 호출로 해소
  - `HistoryItem`/`FaqItem` (`src/types/about.ts:4-5`) → services/about return 타입·page rendering에 사용으로 해소
  - 파일 단위 unused(`src/apis/site-collections.ts`·`src/types/about.ts`)도 자동 해소
  - **`SiteCollectionType` (`src/types/common.ts:9`)은 Phase 2에서 미사용 잔존** — Phase 3 admin UI에서 row 타입으로 사용 예정. knip 경고 1건은 의도된 잔존, Phase 1과 같은 분류

## 접근법

### services/about 구조 (단일 파일)

`src/services/about/index.ts` 한 파일만:
- 6 페이지별 `getXxxPageData()` 함수 — 필요한 apis를 Promise.all로 묶음
- **신규 cache factory 안 함** — `getSiteCollection<T>(key)`·`getSiteSettings(keys)`·`getActiveStaff()`·`worshipService.list()` 모두 이미 자체 cache tag 보유. service에서 추가 tag 만들면 source별 invalidation 원칙(ADR 0006:65-66) 위반.

근거: ADR 0006의 service join 패턴(`docs/decisions/0006-about-pages-domain-driven-content.md` 50-63 라인) 직접 인용. (참고로 `src/services/sermon/index.ts`는 Promise.all 사용 X — 단일 wrapper만. 본 plan은 ADR 0006의 패턴을 직접 적용)

### 정합성 처리

- Hub stats[0] = `church_history.items[0].year` (page-level 조립, ADR 0006 정합성 4원칙 #4)
- Hub HISTORY_MINI / Vision HISTORY = 같은 `church_history` fetch (Promise.all 단일 호출 + RSC dedupe)
- Pastor greeting_paragraphs / career = staff 결과에서 `title='담임목사'` row 추출 후 `greeting_paragraphs` 그대로, `career = [...education, ...experience]` 또는 둘을 분리 표시 (UI 결정은 구현 시점)

### Fallback 정책

- 모든 apis silent fallback 활용 — Promise.all reject 없음, 페이지 절반 렌더 위험 없음.
- **helper**: `displaySettingValue(value: string | undefined, fallback = '준비 중'): string`. value가 undefined·빈 문자열·`'TODO'` 또는 `'TODO:'` 시작이면 fallback 반환. location 8키에 page-level ternary 반복 차단. 위치는 `src/utils/about.ts` 신규 또는 `src/utils/format.ts` 기존 합류 — 구현 시 결정.
- 빈 array(`getSiteCollection`이 row 없음) → 해당 섹션 placeholder 노출 (히스토리 N/A 같은 안내 1줄). admin UI 안내 메시지는 Phase 3.
- staff 담임목사 row 누락 → null 처리 후 page에 단순 빈 표시 (placeholder 1줄). 운영 메시지는 Phase 3.

## 영향받는 파일

신규:
- `src/services/about/index.ts` (1 파일)
- `src/utils/about.ts` 또는 `src/utils/format.ts` 합류 — `displaySettingValue` helper

> **이번 plan 범위 밖**: `docs/HARNESS_ENGINEERING.md`, `docs/PROJECT_GUIDE.md`, `docs/references/LAYOUT.md`, `docs/research/exec-plan-rewrite-demo.md`는 Phase 2 작업과 무관한 untracked 문서 — 이번 commit·검증 대상 아님.

수정:
- `src/app/(content)/about/page.tsx` (Hub)
- `src/app/(content)/about/pastor/page.tsx`
- `src/app/(content)/about/welcome/page.tsx`
- `src/app/(content)/about/vision/page.tsx`
- `src/app/(content)/about/worship/page.tsx`
- `src/app/(content)/about/location/page.tsx`

수정 가능성(EXPLORE 시 확인):
- `_component/*` 일부 — page.tsx에서 prop 내려주는 형태로 전환 시. 정적 component는 손대지 않음.

## 단계별 체크리스트

- [x] 0. EXPLORE 완료 (6 페이지 hardcoded 위치, worship 미연결, services/about 미존재 확인)
- [x] 1. Codex 계획 검증 — CHANGE_REQUEST 5건 → 반영 완료
- [x] 2. staff 컬럼 확인 (list_tables verbose) — `role` 컬럼 없음, `title`로 식별. `education[]`+`experience[]` 존재
- [x] 3. `displaySettingValue` + `parseFiniteFloat` helper 작성
- [x] 4. `services/about/index.ts` 작성 — 6 페이지 service 함수 (Promise.all)
- [x] 5. page.tsx 6개 통합 (welcome → vision → hub → pastor → worship → location 순)
- [ ] 6. dev server 수동 확인 (6 페이지) — 사용자 검증
- [x] 7. Codex 1차 검증 — CHANGE_REQUEST 4건 → FIX_APPLIED
- [x] 8. verify-task — PASS (Phase 1 unused 3건 해소)
- [ ] 9. 사용자 승인 후 commit + push

## 완료 기준 (DoD)

- [x] `verify-task` PASS (Phase 1 unused 3건 해소)
- [x] Codex 계획·1차 검증 PASS (각 1회차 CHANGE_REQUEST → FIX_APPLIED)
- [ ] dev server 6 페이지 수동 렌더 확인 — 사용자
- [ ] 사용자 승인 후 커밋

## 참고 자료

- ADR [0006](../../decisions/0006-about-pages-domain-driven-content.md) — 데이터 모델·SSOT·정합성 원칙
- 패턴: `src/services/sermon/sermon-cache.ts`·`src/services/sermon/index.ts` (Promise.all 병렬), `src/app/(content)/about/serving-people/page.tsx` (이미 `getActiveStaff()` 사용 중인 같은 패턴)

## 의사결정 로그

- 2026-05-09: Phase 2 시작. 같은 브랜치 위에 쌓음(분할 PR이 아닌 단일 PR로 about 작업 한 묶음). 정적 라벨 hardcoded 유지(ADR 0006 5단계 분류 적용).
- 2026-05-09: services/about에서 `service.ts` 분리 안 함 — apis가 단일 함수라 cache+index 2 파일이면 충분.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: ADR [0006](../../decisions/0006-about-pages-domain-driven-content.md) implementation
- **사유**: Phase 2는 ADR 0006의 service join 패턴·SSOT 매핑·정합성 원칙을 그대로 implementation. 새 영구 결정 없음.

## Codex 계획 검증

- **상태**: 1회차 CHANGE_REQUEST → 반영 완료 → 진행 가능
- **요청 시점**: 2026-05-09
- **결론**: CHANGE_REQUEST(5건) → 반영 후 진행 (재요청 불필요 — 모두 단순 정정)
- **핵심 지적**:
  - (1) `sermon/index.ts` Promise.all 참조 오류 — 실제로 sermon은 단일 wrapper만. 근거를 ADR 0006:50-63으로 교체 필요
  - (2) `about-cache.ts`와 Phase 1 cache tag 결합 정책 부재 — getSiteCollection이 이미 자체 tag 가짐 → 중복 방지 정책 명시 필요
  - (3) Promise.all 실패 정책 부재 — error boundary 위임 vs silent fallback 명시 필요
  - (4) PASTOR.career vs staff.education/experience SSOT 충돌 — ADR이 약력을 staff SSOT로 분류했으므로 Phase 2에서 hardcoded 유지가 ADR 위반
  - (5) TODO fallback helper 기준 부재 — 8 키 ternary 반복 vs helper
- **반영 내용**:
  - (1) 접근법 섹션에서 sermon 참조 → ADR 0006:50-63 직접 인용으로 교체
  - (2) `about-cache.ts` 제거 — services/about는 index.ts 1 파일만. 이유 명시 (apis가 이미 cache tag 가짐, ADR 0006:65-66 source별 invalidation 원칙 보존)
  - (3) Assumptions에 silent fallback 명시 (모든 apis가 silent → reject 없음 → error boundary 불필요)
  - (4) Non-goals에서 PASTOR.career 라인 제거. Success Criteria에 `education[]+experience[]` page-level 조립 추가. Assumptions에 SSOT 정정
  - (5) `displaySettingValue` helper 명시 — `src/utils/` 위치, 8 키에 적용
- **남은 리스크**: 없음 — staff `title='담임목사'` 단일 row 가정이 깨질 경우(같은 title 다중 row) `order_index` 우선 fallback 적용
- **라운드 2 추가 검증**: CHANGE_REQUEST 3건 → 반영
  - (1) `worshipService.list()`가 `handle-response.ts`에서 Supabase error throw — silent 가정 오류 발견. services/about/index.ts에서 try/catch + 빈 array fallback로 정합 (`worshipService` 단독 처리)
  - (2) knip "3 unused" 단위 정정 — 파일 단위 → export/type 단위. `SiteCollectionType`은 Phase 3까지 unused 잔존(의도)
  - (3) untracked 문서 4개(HARNESS_ENGINEERING·PROJECT_GUIDE·references/LAYOUT·research/*)는 이번 plan 범위 밖 — 영향받는 파일 섹션에 명시

## Codex 1차 검증

- **상태**: 1회차 CHANGE_REQUEST → FIX_APPLIED, 통과
- **요청 시점**: 2026-05-09 (구현 직후)
- **결론**: CHANGE_REQUEST(4건) → 자체 수정 후 통과
- **수정 파일**: `src/utils/site-settings.ts`(parseFiniteFloat 추가), `src/app/(content)/about/location/page.tsx`(NaN 방어 + subway/bus displaySettingValue 적용), `src/app/(content)/about/pastor/page.tsx`(career empty fallback), `src/app/(content)/about/page.tsx`(setupYear `'1952'` → `'—'`)
- **핵심 지적**:
  - (1) location `parseFloat(settings.church_lat ?? ...)` — 'TODO'·빈 문자열·잘못된 admin 입력 시 NaN으로 LocationMapClient에 전달 → fallback 미작동
  - (2) location subway/bus 값이 `displaySettingValue` 미적용 → 'TODO' 그대로 노출 가능
  - (3) pastor career empty array 시 빈 `<ul>` 노출
  - (4) Hub `setupYear = history[0]?.year ?? '1952'` — 도메인 연도값('1952')을 page에 hardcoded는 ADR 0006 SSOT 원칙 위반
- **반영 내용**:
  - (1) `parseFiniteFloat(value, fallback)` helper 추가, location에서 사용 (`Number.isFinite` 검사)
  - (2) subway/bus도 `displaySettingValue` 거쳐 빈 string 반환 시 '준비 중' fallback (parking과 동일 패턴)
  - (3) `career = careerSource.length > 0 ? careerSource : ['준비 중']`
  - (4) `setupYear = history[0]?.year ?? '—'` (비도메인 fallback)
- **수용된 항목** (수정 불필요): generic 캐스트 `as StaffType[]`/`as GreetingParagraph[]` 중복이지만 버그 아님, `'cta' in group` discriminant 정상 narrow, layer 경계 정합, 외과적 변경 정합
- **남은 리스크**: 없음 — admin 미입력 시 page는 '준비 중'·'—'로 graceful degrade, NaN으로 지도 깨짐 방지

## Claude 2차 검증

- **검토 내용**:
  - Codex 1차 4건 적용 diff 교차 확인 (`parseFiniteFloat` helper, location subway/bus displaySettingValue, pastor career empty fallback, Hub setupYear `'—'`)
  - 변경 파일 9개 모두 Phase 2 범위 내 — 외과적 변경 통과
  - 레이어 위반 없음 — services/about → apis·services/worship만 import, page.tsx → services/about만 import
  - Phase 1 unused 3건 해소 확인 (knip 결과에서 `getSiteCollection`·`HistoryItem`·`FaqItem` 사라짐)
  - `WorshipScheduleType`도 services/about에서 import → unused 해소
  - `SiteCollectionType`은 plan대로 Phase 3 admin UI까지 의도된 잔존
  - `PastorData` internal type으로 정리 (export 제거)
- **실행한 검증**: `node scripts/verify-task.mjs about-pages-db-integration` (run-id `20260509-192343`)
  - ✓ ESLint 통과
  - ✓ stylelint 통과
  - ✓ Build (next) 통과 (about/* 6 페이지 모두 SSG `○` 정적 prerender)
  - ⚠ Knip 경고 — 신규 회귀 0건, Phase 1 unused 3건 해소, `SiteCollectionType` 1건만 의도된 잔존(Phase 3 admin UI)
- **최종 판단**: PASS — Phase 2 코드 작성 완료, 사용자 승인 후 커밋 가능

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 exec-plan만으로 변경 의도를 이해할 수 있는가?
- [ ] 멀티 세션 리뷰 (권장): `codex:rescue`로 객관적 검토

## 회고 (머지 후 작성)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md):
