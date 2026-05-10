# 0005 — about pages content model

- **Status**: Superseded by [0006](0006-about-pages-domain-driven-content.md)
- **Date**: 2026-05-09
- **Deciders**: scseong
- **Tags**: supabase, content-management, frontend, superseded

> ⚠️ **이 ADR은 0006으로 대체됨**. 단일 `about_pages` JSONB 모델을 채택했으나 plan 작성 시 (1) worship_schedules·staff와의 데이터 중복, (2) 정적 라벨까지 DB에 두는 부담, (3) 데이터 개수 적은 array에 페이지 단위 schema 폭증 등의 정합성·과적용 문제가 드러남. 0006에서 도메인 정규화 + 작은 array는 단일 generic 테이블(`site_collections`) + 단일값은 `site_settings` 확장으로 재설계.

## Context

`about/*` 6 페이지(Hub/pastor/welcome/vision/worship/location)는 디자인 적용 후 데이터가 모두 page.tsx 하드코딩 + placeholder/TODO 상태. 관리자가 콘텐츠를 직접 수정할 수 있어야 한다는 요구사항 발생.

데이터 사용 패턴:
- Read: 매우 높음 (모든 방문자, SSG + force-cache)
- Write: 매우 낮음 (인사말 연 단위, 그 외 거의 변경 없음)
- Search/Filter: 없음
- 관계: 페이지 내부 콘텐츠는 닫힌 구조 (상호 참조 없음)

데이터 모델 결정 미루면:
- 관리자 콘텐츠 수정 불가 (코드 수정 + 배포 필요)
- placeholder/TODO 노출 영구화
- Phase 2/3 진행 불가 (페이지 통합·admin UI 모두 데이터 모델에 의존)

## Decision

**`about_pages` 단일 테이블 + JSONB content 컬럼 채택**.

스키마:
```sql
create table about_pages (
  slug text primary key check (slug in ('hub','pastor','welcome','vision','worship','location')),
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
```

- RLS read: 누구나 (`using (true)`)
- RLS write: admin만 (`profiles.role = 'admin'`, site_settings/staff 패턴 일관)
- TypeScript 안전성: 페이지별 Zod schema(`HubContent`, `PastorContent`, ...)로 런타임 parse + `z.infer` 타입 export
- 캐시: `createStaticClient(aboutCache.detail(slug))` + `revalidateTag('about-page-${slug}')` (Phase 3 admin update 시)
- Location 데이터: 기존 site_settings의 `church_address/lat/lng/directions_*`도 about_pages.location.content에 통합 이전 (Phase 2에서 site_settings 키 제거 마이그레이션)

## Consequences

### 긍정적
- 페이지 추가·수정 비용 낮음 (스키마 변경 없이 content 수정)
- 마이그레이션 단순 (1 테이블 + 6 row seed)
- admin UI 단순화 (페이지별 Zod schema → form 자동 생성 가능)
- `revalidateTag` 단위가 페이지(slug) 그대로 일치 — 캐시 무효화 명확
- write 빈도 매우 낮으므로 정규화 transaction 효율 이점 무관

### 부정적 / 트레이드오프
- JSON 내부 부분 update 시 RLS 세밀 제어 불가 (전체 row 단위만)
- 컬럼 단위 인덱스 불가 (search·filter 필요 시 jsonb path 인덱스 필요 — 현재는 미사용)
- TS 타입은 Zod parse 후에만 보장 (raw query 결과는 unknown)
- Phase 2 작업 시 schema와 실제 page.tsx 데이터 shape 드리프트 위험 — 공통 item schemas로 완화

### 영향 범위
- 코드: `src/types/about.ts`(Zod), `src/apis/about/`(raw query factory), `src/services/about/`(parse + cache)
- 운영: Supabase mficogrxekuahjqborxw에 about_pages 테이블 추가, Phase 2에서 site_settings에서 location 키 제거
- 회귀: Phase 2 진행 전까지 페이지는 hardcoded 그대로 동작 (Phase 1은 read-only foundation)

## Alternatives Considered

### A안: 정규화 tables (10+ 페이지·섹션별 테이블)
- 장점: type safety 강함, RLS 세밀, 관계 제약
- 사유로 기각: write 빈도 매우 낮아 정규화 이점 거의 없음. 마이그레이션 비용·admin UI 복잡도가 폐해를 넘어섬. Search·filter 요구 없음.

### B안: site_settings 확장 (key-value)
- 장점: 기존 패턴 그대로 사용
- 사유로 기각: pastor.career 같은 array, vision.pillars 같은 nested object를 string value로 저장하면 직렬화 부담 + admin UI 복잡. JSONB가 같은 방향성에 더 자연.

### C안: 하이브리드 (site_settings + about_pages)
- 장점: 단순 항목·복잡 항목 분리
- 사유로 기각: admin UI에서 두 패턴 혼재 → 일관성 약함. Location ownership 결정 시 사용자가 "전체 about_pages 이전" 선택, 하이브리드 불필요해짐.

## References

- 관련 PR: (Phase 1 PR 머지 시 추가)
- 관련 exec-plan: [2026-05-08-about-pages-db-foundation](../exec-plans/active/2026-05-08-about-pages-db-foundation.md)
- 관련 ADR: [0001 — Codex 오케스트레이션 전략](0001-codex-orchestration-strategy.md), [0003 — design-system-v3 typography hierarchy](0003-design-system-v3-token-unification.md)
- 사용 패턴 근거: `src/services/sermon/sermon-cache.ts`, `supabase/migrations/20260314000003_create_site_settings.sql`(RLS admin 패턴)
