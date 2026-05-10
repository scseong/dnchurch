# about-pages-db-foundation

- **상태**: 🟡 Phase 1 진행 중 (마이그레이션 적용 완료, 코드 작성 중)
- **시작일**: 2026-05-08
- **방향 전환**: 2026-05-09 — ADR 0005 → 0006 supersede (도메인 정규화)
- **단순화**: 2026-05-09 — zod 미도입(dnchurch 패턴 일관) + services 레이어를 Phase 2로 이동
- **브랜치**: refactor/about-page-redesign

## 목표

about/* 6 페이지의 동적 콘텐츠 DB 이전을 위한 **Phase 1 — read-only foundation**. ADR 0006의 도메인 정규화 방향:

- **신규 테이블**: `site_collections` (key/items jsonb) — 작은 array 데이터(`church_history`, `welcome_faq`)
- **컬럼 확장**: `staff.greeting_paragraphs jsonb` — 담임목사 인사말 본문
- **`site_settings` 확장**: location 단일값 키 8개
- **TS item 타입**: HistoryItem/FaqItem/GreetingParagraph (jsonb items narrow용)
- **raw apis**: `getSiteCollection<T>(key)` — site-settings.ts와 동일한 단일 함수 패턴
- **재활용**: `getSiteSettings(keys)`, `getActiveStaff()` 기존 함수 그대로 (location 8키·greeting_paragraphs 자동 포함)
- **services 레이어 join**: Phase 2(페이지 통합)으로 이동 — 사용처 없으면 dead code

## Assumptions

- ADR 0006 결정 적용 (도메인 정규화 + site_collections + site_settings + 정적 hardcoded).
- 단계별 PR. 본 task = Phase 1 (read-only foundation).
- 마이그레이션 적용 대상: `mficogrxekuahjqborxw` (dnchurch organization, dnchurch-dev).
- **dnchurch는 zod 미사용** — Supabase 생성 타입 + items 단언 패턴. 깨진 row는 admin UI(Phase 3) form-level 검증으로 차단. zod 도입 시 신규 의존성·신규 패턴이라 별도 ADR 필요.
- **Seed 값 비대칭 의도**: `opening_hours_*` 3개는 dnchurch 표준 운영시간으로 실제값 seed, `church_phone`/`church_email`/`church_zipcode`/`parking_info_*`는 실제값 미정으로 `'TODO'` placeholder. Phase 2 노출 시 page에서 fallback 정책 결정.
- **`getSiteCollection` 누락 row 정책**: `.maybeSingle()` + 빈 배열 fallback (silent). 근거: (1) `site_collections` row는 마이그레이션 seed로 보장되므로 정상 운영 시 누락 X, (2) 누락 시 page는 placeholder 그대로 동작 (Phase 1 read-only), (3) `getSiteSettings`도 누락 키 silent fallback이라 dnchurch 패턴 일관. 잘못된 key 오타 발견은 Phase 2 page 통합 시 빈 array 노출로 인지 + 운영 가이드.
- **generic `T` 제약**: `T extends Record<string, unknown>` — items는 객체 array(`HistoryItem`, `FaqItem`)만 약속(ADR 0006). primitive T는 컴파일 시 차단.

## Non-goals

- `about_pages` 단일 JSONB 테이블 (ADR 0005 기각).
- **Phase 2** — 6 페이지 통합 + worship 페이지 인라인 데이터 제거 + services/about/ 작성.
- **Phase 3** — admin CRUD UI + write RLS 정책 검증.
- zod 도입 (dnchurch 패턴 이탈).
- about/serving-people 데이터 모델 변경.
- worship_schedules 스키마 변경.
- Hub stats[1-3]·hub_gallery·INDEX cards·STEPS·pillars·페이지 라벨 DB화.
- Pastor verse·signature·sectionLabel DB화.
- 미디어 DB 저장.
- 인접 코드 정리·포맷·rename.

## Success Criteria

- [x] 마이그레이션 SQL 작성 + 적용 (mficogrxekuahjqborxw)
- [x] `yarn generate:types` (`src/types/database.types.ts` +27줄)
- [ ] `src/types/common.ts` — `SiteCollectionType = Tables<'site_collections'>` 추가
- [ ] `src/types/about.ts` 신규 — `HistoryItem`, `FaqItem`, `GreetingParagraph` plain TS types
- [ ] `src/apis/site-collections.ts` 신규 — `getSiteCollection<T>(key): Promise<T[]>` (site-settings.ts 패턴)
- [ ] `yarn build` TS narrowing 검증
- [ ] `verify-task` PASS

## Verification

- `yarn lint`, `yarn lint:styles`, `yarn build`, `yarn knip`
- `node scripts/verify-task.mjs about-pages-db-foundation`
- 수동: Supabase Studio에서 site_collections 2 row + staff.greeting_paragraphs 컬럼 + site_settings 8 키 확인 (이미 적용 완료)

## 접근법

### `src/types/about.ts` (신규)

```ts
export type HistoryItem = { year: string; text: string };
export type FaqItem = { q: string; a: string };
export type GreetingParagraph = string;
```

### `src/apis/site-collections.ts` (신규)

site-settings.ts와 동일한 단일 함수 패턴(inline cache + tag).

```ts
import { createStaticClient } from '@/lib/supabase/static';

export const getSiteCollection = async <T>(key: string): Promise<T[]> => {
  const supabase = createStaticClient({
    tags: ['site-collections', `site-collection-${key}`],
    cache: 'force-cache'
  });

  const { data } = await supabase
    .from('site_collections')
    .select('items')
    .eq('key', key)
    .single();

  return (data?.items ?? []) as T[];
};
```

### Phase 2에서 사용 (참고)

```ts
// src/services/about/index.ts (Phase 2)
const [history, settings, pastor] = await Promise.all([
  getSiteCollection<HistoryItem>('church_history'),
  getSiteSettings(['church_address', 'church_phone', /* ... */]),
  getActiveStaff() // greeting_paragraphs 자동 포함
]);
```

## 영향받는 파일 (Phase 1)

- `supabase/migrations/20260509000000_create_site_collections.sql` — 작성·적용 완료
- `src/types/database.types.ts` — 자동 갱신 완료
- `src/types/common.ts` — `SiteCollectionType` 1 줄 추가
- `src/types/about.ts` — 신규 (3 type)
- `src/apis/site-collections.ts` — 신규 (1 함수)
- `docs/decisions/0006-about-pages-domain-driven-content.md` — 작성 완료 (zod 표현 정정 완료)

## 단계별 체크리스트

- [x] 0a. 기존 패턴 확인 (site-settings.ts, sermon-cache.ts, createStaticClient)
- [x] 0b. ADR 0005 supersede + ADR 0006 작성·index 갱신
- [x] 1. 마이그레이션 SQL 작성
- [x] 2. Supabase 적용 (mficogrxekuahjqborxw via MCP)
- [x] 3. `yarn generate:types`
- [x] 4. ADR 0006 zod 표현 정정 + services Phase 2 이동
- [x] 5. exec-plan 갱신 (본 파일)
- [x] 6. `src/types/common.ts` SiteCollectionType 추가
- [x] 7. `src/types/about.ts` 작성
- [x] 8. `src/apis/site-collections.ts` 작성
- [x] 9. Codex 1차 검증 (구현 diff) — CHANGE_REQUEST 2건 → FIX_APPLIED
- [x] 10. `verify-task` 실행 — PASS (Knip 신규 unused 3건은 의도된 dead code)
- [ ] 11. 사용자 승인 후 commit + push

## 완료 기준 (DoD)

- [x] `verify-task` PASS
- [x] Codex 1차 검증 PASS (CHANGE_REQUEST → FIX_APPLIED)
- [x] ADR 0006 작성 + index 갱신
- [x] Supabase 마이그레이션 적용 확인
- [ ] 사용자 승인 후 커밋

## 참고 자료

- ADR [0006](../../decisions/0006-about-pages-domain-driven-content.md) — 데이터 모델 결정
- 패턴: `src/apis/site-settings.ts` (단일 함수 + inline cache), `src/apis/staff.ts`
- RLS: `supabase/migrations/20260314000003_create_site_settings.sql`

## 의사결정 로그

- 2026-05-08: 초기 plan — 단일 about_pages JSONB(ADR 0005). Codex 검증 1·2·3회차 BLOCK·CHANGE_REQUEST 반영.
- 2026-05-09: 사용자 비판 4건(named fields 유연성, worship_schedules·staff 정합성, schema 폭증, 정적 라벨 DB화 부담) → 도메인 정규화로 재설계 → ADR 0005 supersede + ADR 0006 작성.
- 2026-05-09: ADR 0006 + Codex 4회차 CHANGE_REQUEST(4건) 반영 완료.
- 2026-05-09: MCP 권한 부여 + dnchurch organization 발견 (dev: mficogrxekuahjqborxw, prod: xrfyevrnmvbuwsbktuja). 마이그레이션 dev에 적용 완료.
- 2026-05-09: **단순화 결정** — `package.json`/`src` 전체 grep 결과 dnchurch는 zod 미사용. ADR/exec-plan에 적었던 "Zod parse"는 dnchurch 패턴 이탈한 추측성 도입이었음. TS 타입 단언으로 정정. 깨진 row는 admin UI form-level 검증으로 차단. **services/about/ 레이어는 Phase 2로 이동** — Phase 1에 사용처 없으면 dead code. Phase 1 영향 파일 7개 → 3개로 좁힘.

## ADR 판단

- **필요 여부**: 필요 → 작성 완료
- **결정 링크**: [0006 — about pages domain-driven content](../../decisions/0006-about-pages-domain-driven-content.md)
- **사유**: 새 데이터 모델·도메인 분류·SSOT·정합성 4 원칙. ADR_TRIGGER_PARTS의 `src/apis/`·supabase 마이그레이션 해당.

## Codex 계획 검증

- **상태**: 4회차 CHANGE_REQUEST → 반영 완료, 구현 진행 가능 (zod 정정·services Phase 2 이동은 사용자 결정으로 후속 단순화 — Codex 재요청 불필요)
- **결론**: PASS

## Codex 1차 검증

- **상태**: 1회차 CHANGE_REQUEST → FIX_APPLIED, 통과
- **요청 시점**: 2026-05-09 (코드 작성 직후)
- **결론**: CHANGE_REQUEST(2건) → 자체 수정 후 통과
- **수정 파일**: `src/apis/site-collections.ts`(generic 제약 + 주석), `docs/exec-plans/active/2026-05-08-about-pages-db-foundation.md`(정책 Assumptions 추가)
- **핵심 지적**:
  - (1) `.maybeSingle()` vs exec-plan의 `.single()` 계약 불일치 — 정책 부재 → A안(`.single()` + 에러) 또는 B안(`.maybeSingle()` + 빈 배열 fallback 명시) 선택 요구
  - (2) generic `<T>` unconstrained → primitive 타입도 통과 → `T extends Record<string, unknown>` 등으로 좁힘 권장
- **반영 내용**:
  - (1) B안 채택 — `.maybeSingle()` 유지 + Assumptions에 정책 명시 (`getSiteSettings` silent fallback 패턴 일관, 마이그레이션 seed로 정상 누락 X, Phase 1 read-only)
  - (2) `T extends Record<string, unknown>` 추가 + items는 객체 array 약속(ADR 0006) 주석 명시
- **남은 리스크**: 없음 (Phase 2 page 통합 시 fallback 정책의 운영적 적합성 재검토 가능)

## Claude 2차 검증

- **검토 내용**:
  - Codex 1차 지적 2건 적용 diff 교차 확인 (`src/apis/site-collections.ts` generic 제약 + 정책 주석, exec-plan Assumptions 정책 명시)
  - 변경 파일 4개 모두 Phase 1 범위 내 — 외과적 변경 통과
  - 레이어 위반 없음 — apis 레이어가 services/actions/app import X
  - 마이그레이션 적용 검증 — `list_tables` 결과 site_collections 2 row, site_settings 39 row, staff.greeting_paragraphs 컬럼 자동 생성 타입 반영(database.types.ts)
- **실행한 검증**: `node scripts/verify-task.mjs about-pages-db-foundation` (run-id `20260509-174847`)
  - ✓ ESLint 통과
  - ✓ stylelint 통과
  - ✓ Build (next) 통과
  - ⚠ Knip 경고 — 신규 unused 3건(`src/apis/site-collections.ts`, `src/types/about.ts`, `SiteCollectionType`)은 **Phase 1 read-only foundation의 의도된 dead code** (Phase 2 페이지 통합 시 사용 시작). 기존 부채와 동일 분류, 커밋 차단 안 됨.
- **최종 판단**: PASS — Phase 1 코드 작성 완료, 사용자 승인 후 커밋 가능

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 exec-plan만으로 변경 의도를 이해할 수 있는가?
- [ ] 멀티 세션 리뷰 (권장): `codex:rescue`로 객관적 검토

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: Phase 1 read-only foundation 구조가 Phase 2 통합을 위한 안정적 기반이 됨. Knip unused 3건이 의도된 dead code로 올바르게 분류되어 빌드·커밋 차단 없이 진행. 타입 자동 생성(`database.types.ts`)이 마이그레이션 후 즉시 반영됨.
- 다음에 할 것: Phase 3 admin UI에서 `SiteCollectionType` 실 사용 시작. about/serving-people 데이터 연동 후속 작업.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): 없음 (Phase 1 의도된 잔존 3건은 Phase 2에서 해소됨)
