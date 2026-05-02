# worship-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-02
- **브랜치**: feat/about

## 목표

`/about/worship` 페이지를 디자인 시스템 v2(Navy/Gold/Cream)와 레퍼런스 ChurchWorshipPreviewV4 구조에 맞춰 시각적으로 리디자인한다. 단순 테이블 → 카드/그리드 레이아웃, About Worship 인사이트 섹션 추가, DB 스키마에 표시용 부가 필드(description/duration/age_group/is_featured) 확장.

## Assumptions

- (content) 레이아웃의 Hero/Header/Footer/BottomNav를 그대로 재사용한다 — 디자인의 sticky app-header / sticky tabs / footer는 만들지 않는다.
- 4개 서브탭(예배 시간 · 교회학교 · 온라인 예배 · 처음 오신 분) 중 이번 범위는 `예배 시간` 1탭만. 나머지 3탭은 placeholder 상태로 두지 않고 이번 범위에서 제외(별도 작업).
- 레퍼런스 색상은 무시하고 프로젝트 토큰만 사용 (Navy `$primary` / Gold `$accent` / Cream `$bg-secondary,$bg-tertiary`).
- 데이터 페칭은 `services/worship/` 레이어를 신규로 도입하고, `page.tsx`는 그 service만 호출 — 기존 `eslint-disable no-restricted-imports` 우회를 제거해 `tech-debt-tracker.md`의 "app/ → apis/ 직접 호출" 부채 1건을 해소한다.
- 새 컬럼은 nullable + default로 추가하고 기존 9개 row를 UPDATE로 시드 채움. 마이그레이션은 supabase CLI(superuser)로 적용되므로 RLS bypass — `worship_schedules`의 admin-only `FOR ALL` 정책에 영향 없음.
- About Worship 섹션의 인용·3개 항목 텍스트는 정적 카피로 컴포넌트에 둔다 (DB화는 비추천 — 연관 row 1세트만 존재).
- 어드민 UI에서 `worship_schedules`를 직접 편집하는 폼은 현재 없음 (`grep` 확인 — 어드민 라우트에 worship 폼 없음). 새 nullable 컬럼은 어드민 UI 수정 없이 노출 안 됨 → 무관.

## Non-goals

- 4개 서브탭 중 `교회학교 / 온라인 예배 / 처음 오신 분` 탭의 페이지 본문 구현. (탭 UI는 placeholder 상태로도 추가하지 않는다 — 1탭 페이지로만 만든다.)
- `app/(content)/about/worship/page.module.scss` 외 다른 about 페이지(welcome / pastor / location / vision / serving-people)에 대한 디자인 변경.
- 어드민 화면에서 새 필드 편집 UI 추가. (DB 컬럼만 추가하고 시드값으로 채움 — 어드민 폼 확장은 별도 작업.)
- 글로벌 Hero/Header/Footer 구조 변경.
- 새 라이브러리 도입.
- **기존 `apis/worship-schedules.ts` 로직 재작성·중복 금지** — 새 service는 그 함수를 wrapping만.
- **worship data model 전체 재설계 금지** — 이번 컬럼 5개만 추가, 기존 컬럼/enum/RLS 그대로.

## Success Criteria

- `/about/worship` 접속 시 Hero(공통) → 주일예배(2 카드) → 평일예배(3 카드) → 교회학교(2×2 그리드 + 이동 배너) → 우리가 드리는 예배(다크 인용 + 3 항목)가 순서대로 렌더된다.
- 모바일(`< $breakpoint-tablet`)과 PC 양쪽 레이아웃이 의도대로 동작 — 모바일은 단일 컬럼/시간 칼럼 카드, PC는 2/3/4 그리드.
- 주일낮예배 카드는 `featured` 상태로 Gold 좌측 보더 + ● 대표 예배 플래그 표시.
- 모든 색상/간격/폰트 값은 SCSS 토큰 사용 — 하드코딩 0건.
- `node scripts/verify-task.mjs worship-redesign` 통과(lint + lint:styles + build + knip).
- DB 마이그레이션 파일이 추가되고 `yarn generate:types`로 갱신된 `database.types.ts`가 새 필드를 반영한다.

## Verification

- `yarn lint` (레이어 의존성 포함) — 변경된 페이지/컴포넌트 통과. `app/ → apis/` 위반 0건 (worship/page.tsx에서 disable 주석 제거).
- `yarn lint:styles` — SCSS 토큰·네이밍 통과 (신규 작성분 기준)
- `yarn build` — 타입/빌드 무오류
- `yarn knip` — `tech-debt-tracker.md`의 기존 baseline과 대조. 신규 회귀 0이면 통과 (기존 부채 항목은 그대로 통과로 간주).
- `node scripts/verify-task.mjs worship-redesign` — 최종 게이트, 위 모두 + 증적 기록
- **마이그레이션 적용 검증** (Supabase MCP `execute_sql`, `service_role` / postgres 권한):
  - 컬럼 5개 존재: `SELECT column_name FROM information_schema.columns WHERE table_name='worship_schedules' AND column_name IN ('description','duration','age_group','is_featured','sub_category')` — 5건
  - **CHECK 제약 등록 확인**: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='worship_schedules'::regclass AND contype='c'` — `sub_category` CHECK 1건 이상
  - `SELECT COUNT(*) FROM worship_schedules WHERE is_featured = true` → 1 (주일낮예배만)
  - `SELECT COUNT(*) FROM worship_schedules WHERE category='main' AND sub_category IS NOT NULL` → 5
  - `SELECT COUNT(*) FROM worship_schedules WHERE category='church_school' AND age_group IS NOT NULL` → 4
  - `SELECT name, sub_category, is_featured, age_group, description, duration FROM worship_schedules ORDER BY category, order_index` — 시드 결과 육안 확인
- **Orphan reference 검증** (삭제 단계 직전, 범위 확장):
  - `rg -n "WorshipSchedule|worship_schedules" src docs supabase -S` — 의도된 위치(`apis/worship-schedules.ts`, `services/worship/`, `_component/WorshipSchedule.*` 삭제 대상, types, supabase migrations) 외 참조 0건
- **knip 사전 baseline**: 구현 시작 전 `yarn knip` 1회 실행하여 현재 미사용 export 목록을 캡처. 구현 후 동일 명령 결과와 diff — 새 항목 0이면 통과. (verify-task.mjs 로그에 자동 기록되므로 별도 파일 저장 불필요.)
- 수동 확인: 모바일/태블릿/PC 뷰포트에서 카드 그리드가 1/2/3/4 컬럼으로 변환되는지

## 접근법

레퍼런스 JSX의 구조를 그대로 따르되, 인라인 스타일을 모두 SCSS Module + 프로젝트 토큰으로 치환한다. 페이지 공통 chrome(Header/Hero/Footer/BottomNav)은 (content) 레이아웃에 위임. `WorshipSchedule` (react-table) 컴포넌트는 새 디자인에서 사용하지 않으므로 제거한다.

**스키마 확장** (Codex 검토 반영 — name 패턴 매칭 대신 명시 컬럼 채택):
- `description` text nullable — 카드 본문
- `duration` text nullable — "약 90분" 같은 표시 문자열
- `age_group` text nullable — 교회학교 카드의 연령 태그
- `is_featured` boolean NOT NULL DEFAULT false — Gold 강조 카드
- `sub_category` text nullable — 'sunday' / 'weekday' (category='main' 한정), 'school' 카드는 `category='church_school'`로 식별. enum 대신 text + CHECK 제약으로 두어 향후 'online' 등 확장 자유.

**데이터 흐름** (apis → services → app 경계 명시):
- `apis/worship-schedules.ts`: 그대로 유지. DB 쿼리는 여기에만 존재.
- `services/worship/worship-service.ts` 신규 — `getWorshipSchedules`를 **wrapping**만 (DB query 직접 X). `list()` 메서드는 apis 호출 → `handleResponse` 통과 → 분류된 결과(`{ sunday[], weekday[], school[] }`) 반환. 비즈니스 분류 로직(=sub_category 분기) 위치는 service.
- `services/worship/index.ts` — 외부 익스포트
- `page.tsx`는 `worshipService(...).list()`만 호출. `apis/worship-schedules.ts`의 직접 import + `eslint-disable no-restricted-imports` 우회 제거.
- 캐싱 정책은 기존 `createStaticClient({ tags: ['worship-schedules'], cache: 'force-cache' })` 유지. 마이그레이션 적용 후 production 환경에서는 다음 deploy의 ISR/full rebuild가 캐시를 갱신 — 별도 `revalidateTag` 액션은 불필요(public read-only 데이터, 다음 빌드까지 stale 허용 가능). dev 환경은 서버 재시작으로 충족.

**마이그레이션 SQL** (정확한 형태 — `20260502000000_extend_worship_schedules.sql`):
```sql
ALTER TABLE worship_schedules
  ADD COLUMN description text,
  ADD COLUMN duration text,
  ADD COLUMN age_group text,
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN sub_category text
    CHECK (sub_category IN ('sunday', 'weekday') OR sub_category IS NULL);

-- main 카테고리: sub_category 채움 + featured + description + duration
UPDATE worship_schedules SET sub_category='sunday',  is_featured=true,  description='온 성도가 함께 드리는 대표 예배입니다.', duration='약 90분' WHERE name='주일낮예배';
UPDATE worship_schedules SET sub_category='sunday',  description='한 주를 정리하며 드리는 저녁 예배입니다.', duration='약 70분' WHERE name='주일저녁예배';
UPDATE worship_schedules SET sub_category='weekday', description='말씀과 기도로 한 주의 중심을 잡습니다.' WHERE name='수요기도회';
UPDATE worship_schedules SET sub_category='weekday', description='통성기도와 중보기도의 시간입니다.' WHERE name='금요기도회';
UPDATE worship_schedules SET sub_category='weekday', description='매일 아침 말씀과 기도로 시작합니다.' WHERE name='새벽기도회';

-- church_school 카테고리: age_group 채움 (sub_category는 NULL 유지)
UPDATE worship_schedules SET age_group='5–7세'   WHERE name='유치부';
UPDATE worship_schedules SET age_group='1–6학년' WHERE name='초등부';
UPDATE worship_schedules SET age_group='중1–고3' WHERE name='중고등부';
UPDATE worship_schedules SET age_group='20–30대' WHERE name='청년부';
```

매칭 실패 처리: 시드 UPDATE 후 `SELECT name FROM worship_schedules WHERE category='main' AND sub_category IS NULL` 결과가 0이어야 통과. 하나라도 남으면 마이그레이션 롤백 (Supabase MCP에서 적용 전 dry-run으로 검증).

## 영향받는 파일

- `supabase/migrations/20260502000000_extend_worship_schedules.sql` (신규)
- `src/types/database.types.ts` (재생성)
- `src/services/worship/worship-service.ts` (신규 — service 레이어)
- `src/services/worship/index.ts` (신규)
- `src/types/common.ts` (변경 없음 예상)
- `src/app/(content)/about/worship/page.tsx` (전면 재작성 + service 호출로 교체)
- `src/app/(content)/about/worship/page.module.scss` (전면 재작성)
- `src/app/(content)/about/worship/_component/WorshipSchedule.tsx` (삭제)
- `src/app/(content)/about/worship/_component/WorshipSchedule.module.scss` (삭제)
- `src/app/(content)/about/worship/_component/WorshipCard.tsx` (신규 — Sunday/Weekday 카드 통합)
- `src/app/(content)/about/worship/_component/WorshipCard.module.scss` (신규)
- `src/app/(content)/about/worship/_component/SchoolGrid.tsx` (신규 — 교회학교 그리드 + 이동 배너)
- `src/app/(content)/about/worship/_component/SchoolGrid.module.scss` (신규)
- `src/app/(content)/about/worship/_component/AboutWorship.tsx` (신규 — 인용 + 3항목)
- `src/app/(content)/about/worship/_component/AboutWorship.module.scss` (신규)
- `docs/tech-debt-tracker.md` (`app/ → apis/ 직접 호출` 영향 범위에서 worship/page.tsx 1건 제거)

> 컴포넌트 분리는 file-structure 스킬 원칙에 맞춰 페이지 전용은 `_component/`. 모듈 SCSS는 컴포넌트당 1개 — 단, 작은 sub-element가 늘어날 경우 `feedback_consolidate_module_scss` 메모리에 따라 상위 1개로 통합 검토.

## 단계별 체크리스트

배포 순서는 반드시 **migration 적용 → 타입 재생성 → service/UI 빌드** 순. 마이그레이션이 적용 안 된 환경에서 새 컬럼 select 시 런타임 에러 발생 → UI 코드는 마이그레이션 검증 통과 후 작성.

- [ ] 1. exec-plan 작성 + Codex 계획 검증 요청 (현재)
- [ ] 2. DB 마이그레이션 SQL 작성 (`20260502000000_extend_worship_schedules.sql`) — ALTER TABLE + 시드 UPDATE
- [ ] 3. **Supabase mficogrxekuahjqborxw 프로젝트에 마이그레이션 적용** (MCP `apply_migration`)
- [ ] 4. **마이그레이션 결과 SQL 검증** (Verification 섹션의 4개 쿼리 모두 통과)
- [ ] 5. `yarn generate:types`로 타입 재생성 — `database.types.ts`에 새 5개 컬럼 반영 확인
- [ ] 6. `services/worship/` 신규 — `worshipService(client).list()` 시그니처
- [ ] 7. WorshipCard / SchoolGrid / AboutWorship 컴포넌트 + SCSS 작성
- [ ] 8. `worship/page.tsx` 재작성 — service 호출 + 새 컴포넌트 조립 + `eslint-disable no-restricted-imports` 제거
- [ ] 9. `worship/page.module.scss` 재작성
- [ ] 10. **Orphan reference 검증** — `rg -n "WorshipSchedule" src docs -S`
- [ ] 11. 기존 `WorshipSchedule.tsx` / `WorshipSchedule.module.scss` 삭제
- [ ] 12. `tech-debt-tracker.md` 업데이트 — worship/page.tsx 항목 제거 (10건 → 9건)
- [ ] 13. Codex 1차 검증 요청 (큰 diff + DB 스키마 변경)
- [ ] 14. `verify-task.mjs worship-redesign` 통과
- [ ] 15. 사용자 승인 후 커밋

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs worship-redesign` 통과
- [ ] 사용자 승인 후 커밋
- [ ] 마이그레이션 적용 (mficogrxekuahjqborxw 프로젝트)
- [ ] ADR 불필요 (기존 디자인 시스템·라이브러리 변경 없음)

## 참고 자료

- `docs/references/ChurchWorshipPreviewV4.jsx` — 레퍼런스 PC + Mobile 구조
- 디자인 핸드오프 번들 — `예배 안내.html` + `예배안내-app.jsx` (모바일 전용 프로토타입)

## 의사결정 로그

- 2026-05-02: app-header / app-tabs / app-foot은 (content) 레이아웃과 충돌하므로 만들지 않는다 (사용자 확인 1).
- 2026-05-02: DB 스키마 확장으로 진행 (사용자 확인 2). 새 필드는 nullable + default — 기존 row 안전.
- 2026-05-02: 4개 서브탭 중 1탭만 구현 — 나머지 3탭(교회학교/온라인/처음)은 별도 작업으로 분리하여 범위 제한.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**:
- **사유**: 기존 디자인 시스템·레이아웃·데이터 흐름을 그대로 따름. 새 라이브러리·구조 변경 없음. DB 스키마는 단순 nullable 컬럼 추가.
  - `eslint.config.mjs`에 `docs/**` ignore 추가는 표준 lint scope 정정 — docs/는 빌드/런타임 대상 아닌 정적 자료(exec-plan, 레퍼런스 jsx). 검증 정책 본질 변경 아님.

## Codex 계획 검증

### 1차 (초안)

- **상태**: 완료
- **요청 시점**: 2026-05-02
- **결론**: CHANGE_REQUEST
- **핵심 지적**:
  1. `getWorshipSchedules`를 page에서 직접 호출 — apis→services 경계 위반
  2. 마이그레이션 단계가 "작성+적용+UPDATE"로 묶여 적용 검증 누락
  3. Sunday/Weekday를 `name` 패턴 매칭으로 분리 — 취약. 명시 컬럼 검토
  4. `knip 미사용 0` 기준이 기존 부채 baseline과 충돌 가능
  5. `WorshipSchedule.tsx` 삭제 전 orphan reference 검증 절차 없음
  6. RLS `FOR ALL` 정책 하에서 seed UPDATE 실행 경로 미명시
  7. 마이그레이션 → 타입 → UI 배포 순서 명시 필요
- **반영 내용**:
  1. `services/worship/` 레이어 신규, `page.tsx`는 service만 호출. tech-debt-tracker의 app→apis 항목 1건 해소 명시
  2. 단계 분리: "마이그레이션 작성" → "Supabase 적용" → "SQL 검증" 3단계로 분할 (체크리스트 step 2-4)
  3. `sub_category` text + CHECK 컬럼 추가 — name 매칭 폐기
  4. Verification에 "tech-debt baseline 대조 — 신규 회귀 0이면 통과" 명시
  5. 체크리스트 step 10에 `rg -n "WorshipSchedule" src docs -S` 추가
  6. Assumptions에 "supabase CLI superuser → RLS bypass" 명시
  7. 단계별 체크리스트 상단에 "migration → type → UI" 배포 순서 명시 + UI 코드는 마이그레이션 검증 통과 후 작성

### 2차 (수정안 검토)

- **상태**: 완료
- **요청 시점**: 2026-05-02
- **결론**: CHANGE_REQUEST (수정 후 구현 진행 가능 — CLAUDE.md 워크플로우 정책)
- **핵심 지적** (9건):
  1. services 레이어 — apis 함수 wrapping vs DB 직접 query 경계 불명확
  2. CHECK 제약 등록 검증 누락 (`pg_constraint` 조회 없음)
  3. CHECK 제약 정확한 SQL 미명시
  4. 9개 row 시드 매핑 구체값 누락
  5. knip 사전 baseline 기록 단계 누락
  6. orphan reference 범위 협소 (`worship_schedules` 미포함)
  7. RLS bypass 시 사용 role(service_role/postgres) 불명시
  8. static cache `revalidateTag('worship-schedules')` 필요 여부 판단 누락
  9. Non-goals에 "기존 apis 로직 중복 금지", "data model 재설계 금지" 누락
- **반영 내용**:
  1. 접근법에 "apis는 DB query 전용, services는 wrapping + 분류 로직" 명시 + service `list()` 반환 형태 `{ sunday, weekday, school }` 명시
  2. Verification에 `pg_constraint` 조회 쿼리 추가
  3. 접근법에 마이그레이션 SQL 전문 코드블록으로 첨부
  4. 9개 row UPDATE 문 모두 SQL 코드블록에 명시
  5. Verification에 "knip 사전 baseline" 단계 추가
  6. orphan check를 `rg -n "WorshipSchedule|worship_schedules" src docs supabase -S`로 확장
  7. Verification에 "service_role / postgres 권한" 명시
  8. 접근법에 "public read-only + 다음 deploy의 ISR/full rebuild로 갱신, 별도 revalidateTag 불필요" 판단 명시
  9. Non-goals에 두 항목 추가
- **미반영 / 판단 보류**: 없음. CHANGE_REQUEST 정책상 수정 후 구현 진행. 사용자 최종 승인 시점에 추가 우려가 있으면 에스컬레이션.

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-02
- **결론**: CHANGE_REQUEST → Claude Code 자체 수정 완료
- **수정 파일** (Claude Code가 처리):
  - `src/app/(content)/about/worship/_component/WorshipCard.module.scss` — 하드코딩 값(`1.6rem`, `0.6rem`, `-0.05rem` 등)을 토큰(`$radius-m`, `$spacing-6`, `$letter-spacing-tight`/`body`)으로 교체. SF Mono 폰트 제거 (단순화 — `feedback_design_tokens` 메모리 적용)
  - `src/app/(content)/about/worship/_component/SchoolGrid.module.scss` — `999px` → `$radius-circle`, `4rem` → `$icon-button-size`, transition cubic-bezier 인라인 → `$transition-base`, padding `0.4rem 0.8rem` → `$padding-inline-sm`
  - `src/app/(content)/about/worship/_component/AboutWorship.module.scss` — `1.6rem` → `$radius-m`, `max-width: 88rem` 제거(불필요), letter-spacing 리터럴 → 토큰. SF Mono 폰트 제거
  - `src/app/(content)/about/worship/_component/WorshipCard.tsx` — `WEEKDAY_LABELS[name] ?? ''` → 조건부 렌더링으로 빈 `<span>` 노드 회피
- **핵심 지적**:
  1. SCSS 토큰 규칙 위반 (`border-radius: 1.6rem`, `width: 4rem`, `999px`, SF Mono 폰트, `max-width: 88rem` 등 다수)
  2. WEEKDAY_LABELS 미일치 시 빈 `<span>` 렌더 가드 부재
- **확인 완료** (Codex가 PASS로 분류):
  - `page.tsx` 직접 `apis/` import 없음
  - 삭제된 `apis/worship-schedules.ts` 잔존 참조 없음
  - 서비스 분류 필터(`main + sub_category sunday/weekday`, `church_school`)가 마이그레이션 스키마와 일치
  - 삭제 범위(apis 파일 + WorshipSchedule 컴포넌트)는 이 태스크에서만 사용됨 — 외과적 변경 적합
- **남은 리스크**: 없음 (지적 2건 모두 반영). 다음 단계는 Claude 2차 검증(verify-task) + 빌드 통과 확인.

## Claude 2차 검증

- **검토 내용**:
  - Codex 1차 지적 2건 모두 반영 확인 — WorshipCard/SchoolGrid/AboutWorship 모듈 SCSS의 하드코딩 값이 토큰으로 교체됨 (`$radius-m`, `$radius-circle`, `$icon-button-size`, `$transition-base`, `$letter-spacing-*` 등). SF Mono 폰트 제거하여 Pretendard로 통일 (단순화).
  - WorshipCard.tsx의 WEEKDAY_LABELS 미일치 시 빈 `<span>` → 조건부 렌더링으로 회피.
  - 신규 unused export 1건(`WorshipScheduleGroups` type) → internal type으로 변경하여 knip 신규 회귀 0건 달성.
  - lint 추가 작업: `eslint.config.mjs`에 `docs/**` ignore 추가 (정적 자료 디렉토리, 빌드/런타임 대상 아님).
- **실행한 검증**:
  - `node scripts/verify-task.mjs worship-redesign` → "필수 검증 통과" (ESLint 0 오류, stylelint 0 오류, Next build 통과)
  - Knip 경고는 기존 tech-debt baseline 그대로 — 신규 파일 introduce된 미사용 export 0건
  - DB 마이그레이션 적용 확인: `yarn generate:types` 결과 새 5개 컬럼(`description`, `duration`, `age_group`, `is_featured`, `sub_category`) 반영됨 (database.types.ts 라인 450-499).
  - Orphan reference: `rg "WorshipSchedule|worship_schedules"` 결과 의도된 위치만 매칭 (services/worship/, components, types, migrations).
- **최종 판단**: ✅ 머지 가능. 사용자 승인 후 커밋.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
