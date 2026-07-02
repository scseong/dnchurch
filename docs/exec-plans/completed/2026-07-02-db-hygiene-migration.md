# db-hygiene-migration

- **상태**: ✅ 완료 (2026-07-02)
- **시작일**: 2026-07-02
- **브랜치**: develop (작업 브랜치 분리 예정: chore/db-hygiene-migration)
- **Open questions**: none
- **ADR needed**: no — Supabase advisor 경고를 걷어내는 위생 마이그레이션 1건. 스키마 구조·데이터 흐름·인증 정책의 의미를 바꾸지 않는다(정책 식은 값을 그대로 두는 변환만). 상세 `## ADR 판단`

## 목표

Supabase advisor(dev) 경고 중 안전하고 값이 분명한 4가지를 마이그레이션 1건으로 정리한다: RLS(행 수준 보안) 정책 14건에서 `auth.uid()`를 감싸지 않은 것, SECURITY DEFINER 함수 search_path 미고정, 중복 인덱스, FK(외래키) 인덱스 부재.

## 검증된 Assumptions (실 DB = SSOT, 마이그레이션 drift 있음)

- **auth_rls_initplan 14정책** — `pg_policies` 직접 조회. admin 체크 식이 테이블마다 다름: bulletins·bulletin_images는 `role='admin' AND status='approved'`, sermons·sermon_resources·site_*·staff·worship는 `role='admin'`만, profiles_select_own은 `auth.uid() = id`. 각각 정확히 보존하고 `auth.uid()`만 래핑
- **search_path 미고정 SECURITY DEFINER 5개** — `pg_proc.proconfig` 조회: `create_sermon`·`update_sermon`·`delete_sermon`·`get_adjacent_bulletins`·`handle_new_user`. (`increment_sermon_views`는 P1에서 고침, bulletin RPC 3종·`rls_auto_enable`은 이미 고정)
- **함수 본문이 전부 public qualified 참조** — `pg_get_functiondef` 조회: `public.profiles`·`public.bulletins` 명시, 나머지는 public enum/table. `SET search_path = public, pg_temp`가 본문 재작성 없이 안전
- **트리거 함수 2개** `handle_updated_at`·`set_updated_at`도 advisor `function_search_path_mutable` 대상 — SECURITY INVOKER, `NEW.updated_at = now()`만 실행. now()는 pg_catalog(암묵) 참조라 search_path 추가가 안전
- **중복 인덱스** — `pg_indexes`: `idx_sermons_date`·`idx_sermons_date_desc` 둘 다 `(sermon_date DESC)` 동일. `idx_sermons_date_desc`를 남긴다(마이그레이션 `001`이 만드는 이름)
- **FK 인덱스 부재 2개** — `sermon_resources.sermon_id`(마이그레이션엔 `idx_sermon_resources_sermon` 있으나 실 DB에 없음 — drift), `site_collections.updated_by`
- **소비처 영향 없음** — 정책·함수·인덱스는 앱 코드가 이름으로 참조하지 않는다. RLS·search_path·인덱스는 런타임 결과를 바꾸지 않는다

## Success Criteria

- [x] `auth_rls_initplan` 14 → 0 (advisor performance 재실행)
- [x] `function_search_path_mutable` (SECURITY DEFINER 5 + 트리거 2) → 0 (advisor security 재실행)
- [x] `duplicate_index` 1 → 0
- [x] `unindexed_foreign_keys` 2 → 0
- [x] 정책 semantics 보존 확인 — `truly_unwrapped = 0`, admin 조건 그대로(bulletins `status='approved'`·sermons 미포함·profiles `= id`), `auth.uid()`만 `( SELECT auth.uid() AS uid)`로 바뀜
- [x] `node scripts/verify-task.mjs db-hygiene-migration` 통과 (아래 검증 표)

**부수 관찰(회귀 아님)**: `unused_index`가 2 → 4. 늘어난 2개는 이번에 만든 FK 인덱스(`idx_sermon_resources_sermon`·`idx_site_collections_updated_by`)로, 방금 생성돼 `idx_scan = 0`이라 뜬 것이다. 워크로드가 쌓이면 FK 조인·삭제 시 쓰인다. 기존 2개(`idx_sermons_deleted_at`·`idx_sermons_service_type`)는 이번 범위 밖.

## 접근법

마이그레이션 파일 1건 + MCP `apply_migration`으로 dev 적용. 전부 in-place 변경이라 앱 재시작·재빌드 불필요.

1. **정책**: `ALTER POLICY`로 `auth.uid()`만 `(select auth.uid())`로. DROP/CREATE 아님 — 이름·roles·cmd·나머지 조건 보존. FOR ALL 정책은 USING만 바꾸면 WITH CHECK(미설정)가 새 USING을 계속 상속
2. **함수**: `ALTER FUNCTION … SET search_path = public, pg_temp`. 본문 미변경 — `CREATE OR REPLACE`의 본문 전사 오류 위험 회피
3. **인덱스**: `DROP INDEX IF EXISTS idx_sermons_date` + `CREATE INDEX IF NOT EXISTS` 2개

**동작 보존 근거**: `(select auth.uid())`는 `auth.uid()`와 같은 값을 반환하되 쿼리당 1회 평가(InitPlan). ALTER FUNCTION search_path는 qualified 참조 함수의 결과를 바꾸지 않는다. 인덱스는 결과가 아니라 실행 계획만 바꾼다.

## Non-goals

- `multiple_permissive_policies` 정리 — "only admins can modify X" FOR ALL을 INSERT/UPDATE/DELETE로 분리하거나 sermons SELECT 2정책 병합하는 건 RLS 명령 커버리지 재구조화라 고위험이고, ≤39행 테이블에서 효과가 사실상 없다. tech-debt에 남긴다
- `unused_index`(idx_sermons_deleted_at·idx_sermons_service_type) 제거는 미루기 — 미래 필터에서 다시 쓸지 확인해야 하고 advisor INFO 레벨이라 급하지 않다. 별도 tech-debt로 뺀다
- `auth_leaked_password_protection` 등 대시보드 토글 항목 — 코드 아님
- 마이그레이션 drift 근본 정정(baseline 재작성) — 별개 tech-debt

## 영향받는 파일

- `supabase/migrations/<timestamp>_db_hygiene.sql` (신규, 유일)
- 앱 코드(`src/`) 변경 없음

## 단계별 체크리스트

- [x] 1. 마이그레이션 SQL 작성 (정책 14 + 함수 7 + 인덱스 3)
- [x] 2. before 스냅샷 저장 (pg_policies·proconfig·pg_indexes)
- [x] 3. MCP apply_migration으로 dev 적용 (success)
- [x] 4. after 재조회 → semantics 보존 확인 + advisor 4카테고리 0 확인
- [x] 5. verify-task

## Verification

- `node scripts/verify-task.mjs db-hygiene-migration`
- `mcp__claude_ai_Supabase__get_advisors` (performance + security) — 4카테고리 0
- `pg_policies` before/after diff — admin 조건·cmd·roles 불변, auth.uid()만 래핑

## ADR 판단

불필요 — `supabase/migrations/`는 ADR_TRIGGER_PARTS지만 이번은 스키마 구조·인증 정책 의미·데이터 흐름을 바꾸지 않는 advisor 위생 정리다. 정책은 semantics-preserving 변환(값 동일), 함수는 search_path만 추가(본문 불변), 인덱스는 계획 최적화. 영구 결정 없음.

---

<!-- 검증 섹션 -->

## Codex 계획 검증

- **결론**: PASS (confidence: high)
- **현재 판단**: 계획과 최종 SQL을 함께 검토, material·expression 지적 0건. 값 동일·정책 조건 보존·7함수 search_path 안전을 포함한 6개 질문을 확인했고, 적용 후 pg_policies diff와 advisor 재조회를 필수로 남겼다. 질문별 상세는 검증 이력 참조.
- **다음 행동**: WORK — dev 적용 후 before/after diff

## Codex 1차 검증

- **결론**: PASS (계획 검증이 최종 SQL을 그대로 검토 — 별도 1차 불필요)
- **현재 판단**: 구현 diff는 마이그레이션 SQL 1개뿐이고, Codex 계획 검증이 그 파일(`20260702000001_db_hygiene.sql`)을 verbatim으로 이미 검토해 PASS했다(적용본과 동일, 주석 외 차이 없음). 그 위에 dev 적용 후 실측으로 다시 확인했다 — `pg_policies`에서 `auth.uid()`를 안 감싼 정책 0개·admin 조건 보존, 함수 9개 search_path 보유, 인덱스 3건 반영.
- **다음 행동**: Claude 2차 검증

## Claude 2차 검증

- **최종 판단**: PASS — advisor 4카테고리 0, 정책 semantics 보존, verify-task 통과.
- **현재 판단**: dev 실측으로 확인 — `auth_rls_initplan` 14→0, `function_search_path_mutable` →0, `duplicate_index` 1→0, `unindexed_foreign_keys` 2→0. `auth.uid()`를 안 감싼 정책 0개, admin 조건은 테이블별로 그대로(bulletins `status='approved'` 포함, sermons 미포함). `unused_index` 2→4는 신규 FK 인덱스가 통계 없어 뜬 것(회귀 아님). 앱 코드 무변경이라 lint·build·knip은 직전 run과 동일.
- **다음 행동**: 사용자 승인 후 커밋

| 시점 | run-id | lint | styles | build | knip신규 | DB 실측 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260702-182148 | ✅ | ✅ | ✅ | 0 | advisor 4카테고리 0, 정책 미래핑 0, 함수 search_path 9/9 |

## 검증 이력

## PR 리뷰 대응 (#139)

| 지적 | 출처 | 대조 | 판정 | 조치 |
| --- | --- | --- | --- | --- |
| Supabase Preview CI 실패 — `handle_updated_at()` 없음 | Supabase 봇 (Migrations task) | 실패 로그 직접 확인 — fresh replay가 고아 함수에서 `ALTER FUNCTION` 실패. dev에만 있고 마이그레이션 체인엔 없음(`set_updated_at`은 `20260509…:10`에 있어 고아 아님, `handle_updated_at` 하나만 고아) | 타당 (내 drift 주의가 실현됨) | 함수 `ALTER`를 `to_regprocedure` 존재 가드(DO 루프)로 감쌈 — fresh DB는 고아 함수 skip. dev에서 전체 idempotent 재실행 `syntax ok` |
| RLS 정책에 `public.` 스키마 명시 권장 (5건) | Gemini | 봇 근거("런타임 search_path로 엉뚱한 스키마 참조")를 검증 — **저장된 RLS 정책은 정의 시점 OID 바인딩이라 세션 search_path에 영향 없음**(적용 후 `pg_policies` deparse로 확인). 근거는 부정확하나 명시는 좋은 관례 | 근거는 오탐, 개선은 채택 | 정책 table·enum에 `public.` 추가(런타임 의미 동일, DDL 견고성 개선). Codex 교차검증 PASS(high) |

Codex 교차검증: 5개 항목(RLS OID 바인딩·명시 영향·가드 정확성·replay 안전성·dev 정합성) 모두 CORRECT, 결론 PASS(high). 사실 보정 1건 반영(고아는 `handle_updated_at` 하나).

## 회고

- **잘된 것**: advisor 경고를 파일이 아니라 실 DB(`pg_policies`·`pg_proc`·`pg_indexes`)로 진단해, "파일엔 있는데 DB엔 없는" drift 2건(`idx_sermon_resources_sermon`·`get_adjacent_bulletins` search_path)을 먼저 잡았다. `ALTER POLICY`·`ALTER FUNCTION`로 값·본문을 안 건드리는 연산만 골라 RLS를 깨지 않고 고쳤고, 적용 후 실측으로 advisor 4카테고리 0을 확인했다. Codex 계획 검증(실제 SQL까지)·교차검증 2회 모두 PASS.
- **다음에 할 것**: `multiple_permissive_policies`·`unused_index` 정리(tech-debt). 근본적으로는 마이그레이션 drift(baseline이 실 DB를 재현 못 함) 해소가 이런 고아 함수·인덱스 문제의 뿌리다.
- **발견된 부채**: 마이그레이션 drift가 PR CI에서 실현됐다 — 고아 함수 `handle_updated_at`을 fresh replay가 `ALTER`하려다 실패. 이번엔 `to_regprocedure` 가드로 우회했으나, drift 자체는 별도 tech-debt(마이그레이션이 DB를 재현 못 함)로 남아 있다.

## PR 리뷰 대응 후속

- 리뷰에서 나온 CI 실패(고아 함수)를 `fb881f1` 가드로 해결, Gemini 스키마 명시 반영(근거는 OID 바인딩으로 오탐 확인). 상세는 위 `## PR 리뷰 대응` 표.

## 후속 작업

- `multiple_permissive_policies` 정리 (tech-debt 유지)
  - 이유: RLS 명령 재구조화 고위험, 소테이블 효과 미미
  - 다음 기준: 테이블 행이 크게 늘거나 정책 정비를 별도로 할 때
  - 기록 위치: `docs/tech-debt/active.md` DB 위생 항목
