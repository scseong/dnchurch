# 0006 — about pages domain-driven content

- **Status**: Accepted
- **Date**: 2026-05-09
- **Deciders**: scseong
- **Tags**: supabase, content-management, frontend

## Context

[0005](0005-about-pages-content-model.md)에서 about/* 6 페이지 콘텐츠를 단일 `about_pages` JSONB 테이블에 저장하기로 결정했으나, plan 작성·검토 단계에서 다음 문제가 드러남:

1. **데이터 중복(정합성 위험)**: `worship_schedules`(예배 시간)·`staff`(담임목사 정보) 같은 기존 도메인 테이블이 이미 SSOT인데, `about_pages.worship`/`about_pages.pastor`에 같은 데이터를 또 저장하면 변경 시 두 곳 동기화 필요.
2. **과도한 DB화**: 페이지 라벨(`'ABOUT — 2026'`, `'WELCOME MESSAGE'`), 슬로건, INDEX cards 4개 등 정적 데이터까지 DB에 두면 admin이 절대 만지지 않을 데이터가 schema·admin UI 부담으로 누적.
3. **데이터 개수 적은 array에 페이지 단위 schema 폭증**: history 5 row, FAQ 4 row 같은 작은 array를 페이지마다 named field로 정의하면 schema 6개·admin 폼 6개로 over-engineering.
4. **dnchurch 기존 패턴 이탈**: dnchurch는 staff·worship_schedules·sermon·notice·bulletin 모두 도메인 정규화. `about_pages` JSONB는 외딴섬.

결정 안 하면: Phase 2 페이지 통합 시 정합성 운영 부담 + 의도 모호한 schema가 admin UI에 노출.

## Decision

**도메인 정규화 + 작은 array는 단일 generic 테이블 + 단일값은 site_settings 확장**으로 재설계.

### 데이터 분류 5단계

| 데이터 유형 | 처리 방식 | 사용 예 |
|---|---|---|
| **큰 도메인** (다수 row, 자체 admin UI 가치) | **전용 테이블** (재활용) | `worship_schedules`, `staff`, `sermon`, `notice`, `bulletin` |
| **큰 도메인 컬럼 확장** (1명·1건 한정 nested 데이터) | **기존 테이블에 jsonb 컬럼 추가** | `staff.greeting_paragraphs jsonb` (담임목사 인사말 본문) |
| **작은 array** (5-10 row, 같은 형태 항목) | **`site_collections` 신규 단일 테이블 + key prefix 분류** (items는 jsonb → TS type 단언) | `church_history`, `welcome_faq` (Phase 1 row 2개) |
| **단일값** (string/number, 한 줄로 표시) | **`site_settings` 확장** | `church_phone`, `church_email`, `opening_hours_*`, `parking_info_*`, `church_zipcode` |
| **정적 라벨/구조** (변경 거의 없거나 페이지 디자인) | **page.tsx hardcoded** | eyebrow, sectionLabel, 슬로건, INDEX cards 4개, STEPS 4개, pillars 3개, hub_stats placeholder, hub_gallery placeholder, pastor verse |

### 신규 테이블 — `site_collections`

```sql
create table site_collections (
  key  text primary key,           -- 'church_history', 'welcome_faq' 등
  items jsonb not null,            -- array (TS 타입 단언으로 narrow — `items as HistoryItem[]`)
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
```

- **`site_settings`와 분리 유지**: scalar(text) vs structured array(jsonb), admin UI 분기(input field vs list editor), 타입 분기(string vs per-item type). 통합해도 운용은 결국 분기되므로 컬럼 타입을 명확히 분리.
- **key prefix로 도메인 분류** — `site_settings`의 `directions_*` 패턴 일관.
- **새 collection 추가**는 row insert + TS item 타입 추가(`src/types/about.ts`)로 가능 — 스키마 변경 없음.
- **타입 검증 전략**: dnchurch는 zod 미사용 — Supabase 생성 타입 + items 단언 패턴. 깨진 row는 admin UI(Phase 3) form-level 검증으로 차단. zod 도입 시 신규 의존성·신규 패턴이라 별도 ADR로 결정.

### Service-level join 패턴 (Phase 2 페이지 통합 시 도입)

페이지 렌더 시 여러 source 통합은 **services 레이어에서 `Promise.all` 병렬**. **Phase 1은 raw apis만 작성** — 사용처 없는 service 함수는 dead code이므로 Phase 2(페이지 통합)에 함께 만든다.

```ts
// src/services/about/index.ts (Phase 2)
export async function getHubPageData() {
  const [history, settings] = await Promise.all([
    getSiteCollection<HistoryItem>('church_history'),
    getSiteSettings(['church_address'])
  ]);
  return { history, address: settings.church_address };
}
```

- **API 호출 횟수는 latency 부담 거의 0** — SSG build 시 1회·force-cache + RSC dedupe·Promise.all 병렬.
- **source별 cache tag 유지** — `church_history` 변경 시 그 tag만 invalidate.

### SSOT 매핑

| 데이터 | SSOT | 사용 위치 |
|---|---|---|
| 주소·전화·이메일·운영시간·주차·우편번호·지하철·버스 | `site_settings` | Hub LOCATION mini, Location 페이지, Footer |
| 예배 시간·장소 | `worship_schedules` | Worship 페이지 (Phase 2에서 인라인 → DB 재호출) |
| 담임목사 이름·직책·약력(education·experience) | `staff` (role='담임목사') | Pastor 페이지 + Serving-people 페이지 |
| 담임목사 인사말 본문 (3 단락) | `staff.greeting_paragraphs` | Pastor 페이지 |
| 연혁 (timeline) | `site_collections` key=`church_history` | Hub HISTORY mini + Vision HISTORY |
| FAQ | `site_collections` key=`welcome_faq` | Welcome 페이지 |

### 정합성 4 원칙

1. **하나의 의미 = 하나의 컬럼/키** — 같은 의미 데이터는 한 곳에만. 페이지가 여러 개 사용해도 같은 SSOT read.
2. **하드코딩 허용 조건**: 거의 변경되지 않거나(설립 연도·STEPS) 표시 라벨(`'WELCOME MESSAGE'`)인 경우.
3. **운영 가이드 명시**: 의도된 동기화 필요 중복은 ADR 또는 docs에 "X 변경 시 Y도 갱신" 명시.
4. **page-level dynamic 조립**: 같은 데이터를 다른 형태로 표시(예: Hub stats[0] = `church_history.items[0].year`)는 services 또는 page에서 조립 — DB 중복 회피.

## Consequences

### 긍정적
- **dnchurch 기존 패턴 일관**: staff·worship_schedules·sermon·notice·bulletin과 같은 도메인 정규화.
- **SSOT 명확**: 각 데이터마다 한 출처. 변경 시 한 곳만.
- **Phase 1 scope 작아짐**: 마이그레이션 1개(site_collections + staff 컬럼 + site_settings 키), seed row 2개(history + FAQ).
- **admin UI 점진**: site_settings(이미 있음)·staff(이미 있음)·worship_schedules(이미 있음) 재활용. 신규 admin은 site_collections 한 화면(list editor) 정도.
- **새 collection 추가 비용 낮음**: row insert + Zod schema + page 사용. 스키마 변경 없음.

### 부정적 / 트레이드오프
- **테이블 2개 분리**(`site_settings` + `site_collections`) — 단일 통합 옵션 검토했으나 admin UI·Zod·query 패턴이 결국 분기되어 컬럼 타입 분리가 자연.
- **page에서 조립 책임**: services-level Promise.all 패턴이라 페이지마다 service 함수 1개씩 추가.
- **정적 데이터 변경 시 코드 수정**: hardcoded 영역(INDEX cards·STEPS·pillars 등)은 admin이 수정 못 함 — 변경 발생 시 PR 필요. 사용자 사용 패턴(거의 변경 없음)에 부합한다고 판단.
- **`site_collections` jsonb는 query 인덱스·search 어려움** — 현재 search·filter 요구 없으므로 무관, 미래 발생 시 jsonb path 인덱스 또는 별도 도메인 테이블 분리.

### 영향 범위
- 코드 (Phase 1): `src/types/common.ts`(SiteCollectionType 추가), `src/types/about.ts`(item TS 타입), `src/apis/site-collections.ts`(getSiteCollection<T>) — 3 파일
- 코드 (Phase 2): `src/services/about/`(페이지 join), `src/app/(content)/about/*/page.tsx`(데이터 fetch 통합)
- 운영: Supabase mficogrxekuahjqborxw에 site_collections 테이블 추가, staff 컬럼 추가, site_settings 키 8개 추가 — Phase 1에 적용 완료
- 기존 함수 재활용: `getSiteSettings(keys)` (location 8키 자동 포함), `getActiveStaff()` (greeting_paragraphs 자동 포함, `select('*')`)
- 회귀: Phase 1은 read-only foundation — 페이지는 hardcoded 그대로 동작. Phase 2에서 통합.

## Alternatives Considered

### A. 단일 `about_pages` JSONB ([0005](0005-about-pages-content-model.md))
- 장점: 1 테이블, 마이그레이션 단순
- 사유로 기각: worship_schedules·staff 중복 정합성 위험, 정적 라벨까지 DB에 둠으로써 admin UI가 만지지 않을 데이터로 무거워짐, dnchurch 기존 도메인 정규화 패턴 이탈.

### B. 정규화 tables only (페이지·섹션별 10+ 테이블)
- 장점: type safety 강함, RLS 세밀
- 사유로 기각: write 빈도 매우 낮음·search 없음 → 정규화 이점 거의 없음. 마이그레이션·admin UI 비용이 폐해를 넘어섬. 데이터 5-10 row 도메인을 매번 신규 테이블화는 over-engineering.

### C. 단일 generic 테이블 + 모든 데이터 (site_settings.value를 jsonb로)
- 장점: 1 테이블
- 사유로 기각: 기존 site_settings 사용처 모두 마이그레이션, value text → jsonb 변경 큰 영향, admin UI는 결국 key별 분기. 외형만 통합·운용은 분리되는 셈.

### D. SQL JOIN / view (services 대신 view)
- 장점: 1회 round-trip
- 사유로 기각: cache tag 통합 곤란(한 source 변경 시 view 전체 invalidate), view는 read-only(admin update 불가능 — 결국 base 테이블 update 필요), schema 변경 비용. dnchurch 기존 사용 사례 없음.

### E. Postgres RPC (function) (서비스 레벨 join 대신 RPC)
- 장점: 1회 round-trip, 복잡 계산 SQL에서 처리
- 사유로 기각: cache tag 통합 곤란, function 마이그레이션·유지, Zod parse 단일 결과 분해 필요, 페이지마다 RPC 폭증. dnchurch RPC는 `sermon_year_counts_rpc`처럼 SQL 집계가 압도적으로 효율적인 경우만 — about 단순 read에는 과함.

## References

- 관련 PR: (Phase 1 PR 머지 시 추가)
- 관련 exec-plan: [2026-05-08-about-pages-db-foundation](../exec-plans/active/2026-05-08-about-pages-db-foundation.md) (큰 갱신 예정)
- 대체된 ADR: [0005 — about pages content model (Superseded)](0005-about-pages-content-model.md)
- 관련 ADR: [0001 — Codex 오케스트레이션 전략](0001-codex-orchestration-strategy.md)
- 패턴 근거:
  - `src/services/sermon/sermon-cache.ts` (cache 옵션 패턴)
  - `src/services/sermon/index.ts` (Promise.all 병렬 join)
  - `supabase/migrations/20260314000003_create_site_settings.sql` (RLS admin 패턴)
  - `supabase/migrations/20260425000001_create_sermon_rpcs.sql` (RPC는 집계용 한정)
