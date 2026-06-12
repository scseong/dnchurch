# profiles-rls-rpc-guard

- **상태**: ✅ 완료 (2026-06-12)
- **시작일**: 2026-06-11
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — 기존 staff RLS·sermon RPC admin 가드 패턴을 그대로 적용한다. 새 정책 결정 없음. (스키마 SSOT 정책 ADR은 후속 작업)

## 목표

공개 anon 키로 뚫리는 치명적 보안 구멍 2개를 막는다. `profiles` 테이블에 RLS를 켜 PII 전체 조회와 본인 `role` 변경(관리자 권한 탈취)을 차단하고, 가드 없이 anon이 호출하던 `create_bulletin`/`update_bulletin` RPC에 admin 검사와 실행 권한 회수를 넣는다. 코드는 건드리지 않고 SQL 마이그레이션 2개로만 해결한다.

## 검증된 Assumptions

- `profiles` RLS 꺼짐 + anon/authenticated에 전 컬럼 SELECT/INSERT/UPDATE/DELETE — `pg_class.relrowsecurity=false`, `information_schema.column_privileges` 조회로 확인. advisor `rls_disabled_in_public` ERROR.
- `custom_access_token_hook`이 dev DB에 **없음** — `pg_proc` 조회 빈 결과. 따라서 `checkAdminPermission`은 항상 DB fallback(`profiles.role` 직접 SELECT) 경로. 즉 anon이 `role=admin`으로 PATCH하면 **토큰 갱신 없이 다음 요청에서 즉시** admin 인식.
- `handle_new_user` 트리거가 `auth.users` INSERT 시 `profiles`를 생성 — `pg_trigger`에 `on_auth_user_created` 존재, SECURITY DEFINER, owner `postgres`. 따라서 회원가입은 anon의 profiles INSERT 권한이 없어도 동작한다.
- 앱이 `profiles`를 읽는 곳은 본인 행만 — `apis/user.ts:6`(getProfileById, 현재 로그인 사용자 id), `actions/_auth-helpers.ts:16`(fallback, `user.id`). 남의 프로필 조회 0건. `bulletins.author_id`는 프로필 조인 없이 현재 사용자와 비교만(`UserIdMatcher`). → 본인 행 한정 SELECT 정책이 앱을 안 깨뜨린다.
- `create_bulletin`/`update_bulletin`은 owner `postgres`(테이블 owner=superuser)인 SECURITY DEFINER + body에 admin 가드 없음 — `pg_proc` 조회 + 마이그레이션 원문 확인. owner가 postgres라 RLS를 실제로 우회한다.
- sermon RPC는 body에 `IF NOT EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin') THEN RAISE EXCEPTION` 가드 보유 — `20260425000001_create_sermon_rpcs.sql:29-32`. anon(auth.uid()=null)은 차단됨. 이 가드 패턴을 bulletin에 복제한다.

## Success Criteria

- `profiles` RLS가 켜지고(`relrowsecurity=true`), anon이 `/rest/v1/profiles` SELECT로 행을 한 건도 못 가져온다.
- anon·authenticated가 `profiles`의 `role`/`status`를 포함한 어떤 컬럼도 UPDATE/INSERT/DELETE 할 수 없다(권한 회수로 차단).
- authenticated가 본인 행은 SELECT로 읽을 수 있다(앱 로그인·프로필 표시 정상).
- `create_bulletin`/`update_bulletin`을 anon(또는 비admin)이 호출하면 예외로 거부된다. admin이 Server Action으로 호출하면 정상 동작한다.
- `update_bulletin`의 이미지 삭제가 해당 주보(`bulletin_id`) 소속 이미지로만 제한된다.
- Supabase security advisor에서 `rls_disabled_in_public`(profiles) ERROR가 사라진다.
- `node scripts/verify-task.mjs profiles-rls-rpc-guard` 통과(lint·build·knip 회귀 0 — SQL만 바뀌므로 코드 영향 없음).

## 영향받는 파일

- `supabase/migrations/20260611000000_profiles_rls_lockdown.sql` (신규)
- `supabase/migrations/20260611000001_harden_bulletin_rpc.sql` (신규)
- `src/actions/update-bulletin.action.ts` (PR #115 리뷰 반영 — Cloudinary 교차 삭제 차단)
- `supabase/config.toml` (PR #115 리뷰 반영 — 이미지 변환 off, Preview 402 해소)
- `.gitignore` (마이그레이션 추적 전환)

## ADR 판단

불필요 — `update-bulletin.action.ts`는 기존 `getBulletinByIdSSR` 재사용으로 삭제 대상을 DB 검증하는 국소 수정이다. 새 레이어·라이브러리·데이터 흐름 변경 없음. `config.toml`은 로컬 CLI 설정값 1줄.

## Non-goals

- `custom_access_token_hook` 적용·활성화 — 현재 dev에 없고, 본 작업은 hook 유무와 무관하게 막는다. hook을 켤 때 `supabase_auth_admin` 전용 SELECT 정책이 필요하므로 그 정책만 미리 넣어 둔다(앞당긴 방어, 활성화는 별도 작업).
- `profiles`/`bulletins`/`notices` 스키마 SSOT 복구(`supabase db diff`) — 후속 작업 #3.
- 나머지 SECURITY DEFINER 함수(sermon RPC·handle_new_user 등)의 `search_path` 일괄 고정 — 후속. 단 이번에 새로 쓰는 bulletin 2함수에는 적용한다.
- `lib/supabase/{admin,server,static}.ts`의 `server-only` 가드(#5) — 별도 작업.
- prod(`xrfyevrnmvbuwsbktuja`, INACTIVE) 적용 — dev 검증 후 활성화 시점에 별도 적용.

## 단계별 체크리스트

- [x] 1. `20260611000000_profiles_rls_lockdown.sql` 작성 — RLS enable + anon 전체 권한 회수 + authenticated 쓰기 권한 회수(SELECT 유지) + 본인행 SELECT 정책 + supabase_auth_admin SELECT 정책.
- [x] 2. `20260611000001_harden_bulletin_rpc.sql` 작성 — 두 함수 `CREATE OR REPLACE`에 admin 가드(role+status) + `author_id`를 `auth.uid()`로 + 이미지 삭제 `bulletin_id` 바인딩 + `SET search_path` + `REVOKE EXECUTE FROM PUBLIC, anon`.
- [x] 3. Codex 계획 검증 — PASS(high).
- [x] 4. dev에 `apply_migration` 적용 — 둘 다 `{success:true}`.
- [x] 5. 적용 후 검증 — anon SELECT/UPDATE/RPC 모두 permission denied, admin 본인행만 조회·RPC 정상, member RPC "admin role required", advisor `rls_disabled_in_public` ERROR 소멸.
- [x] 6. Codex 1차 검증 PASS(high) → `verify-task` 통과 → Claude 2차 검증 기록.

## Verification

- `node scripts/verify-task.mjs profiles-rls-rpc-guard`
- 적용 후 SQL 확인: `relrowsecurity`, `pg_policies`, `role_table_grants`, `get_advisors security`.

---

## Codex 계획 검증

- **결론**: PASS (신뢰도 high)
- **현재 판단**: 예/아니오 3문항을 모두 통과했다.
  - `handle_new_user`가 postgres 소유라 RLS를 우회하고 앱은 본인 행만 읽으므로, RLS를 켜고 쓰기 권한을 회수해도 가입·조회가 안 깨진다.
  - hook 미설치 상태에서 `supabase_auth_admin` SELECT 정책은 쓰이지 않아 무해하다.
  - `PUBLIC`·`anon` EXECUTE를 회수하고 authenticated만 남긴 뒤 내부 `auth.uid()` admin 가드를 두는 범위가 맞다.
- **다음 행동**: 마이그레이션 2개를 작성해 dev에 적용했다.

## Codex 1차 검증

- **결론**: PASS (PR #115 리뷰 반영분 재검증 후)
- **현재 판단**: 1차(두 SQL)는 PASS(high)였다. PR #115 리뷰 반영분(`url` 제거, Cloudinary 교차 삭제 차단, config 402)을 Codex가 재검증해 SQL `url` 제거·config 변경은 "이상 없음", 액션 수정은 의도·순서(RPC 전 fetch) 맞다고 확인했다. CHANGE_REQUEST 사유였던 `img.id` vs `imageId` 타입 비교는 직접 확인 결과 구현 차단 사유가 아니었고(아래 D2), `Number()` 강제 변환으로 한 번 더 막았다.
- **다음 행동**: verify-task 재실행 후 Claude 2차 검증 갱신.

## Claude 2차 검증

- **최종 판단**: PASS. dev DB 실측으로 공격 경로 3개를 차단하고 정상 경로 3개가 동작함을 확인했다. advisor ERROR가 사라졌고 verify-task 필수 4단계를 통과했다.
- **현재 판단**: 아래 표 참조. SQL만 바뀌어 코드 영향 없음(Knip은 기존 부채 경고, 본 작업 무관).
- **다음 행동**: doc-editor 점검 후 사용자 커밋 승인 대기.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260611-220451 | ✅ | ✅ | ✅ | 0 | 보안 마이그레이션 dev 적용 |
| 리뷰반영 | 20260612-001026 | ✅ | ✅ | ✅ | 0 | `url` 제거 후 이미지 포함 create_bulletin dev 재검증(1 image row) — prod는 미사용, MVP 후 일괄 적용 |

dev 실측 검증 결과(`SET LOCAL ROLE`로 anon·authenticated 시뮬레이션):

| 경로 | 기대 | 결과 |
| --- | --- | --- |
| anon → `SELECT profiles` | 차단 | permission denied ✅ |
| anon → `UPDATE profiles SET role='admin'` | 차단 | permission denied ✅ |
| anon → `create_bulletin(...)` | 차단 | permission denied for function ✅ |
| admin(authenticated) → 본인 프로필 조회 | 1행 | 1행 ✅ |
| admin → 전체 프로필 가시 행 | 본인만 | 1행(본인만) ✅ |
| admin → `create_bulletin(...)` | 성공 | 성공(생성 후 정리) ✅ |
| member(authenticated) → `create_bulletin(...)` | 거부 | "admin role required" ✅ |
| advisor `rls_disabled_in_public`(profiles) | 소멸 | ERROR 사라짐 ✅ |

## 의사결정 로그

- **D1 — Codex 계획 검증이 멈춰 짧은 질의로 다시 요청했다**
  - 문제: 1차 호출이 10분간 멈췄다. 로그 라인 138에서 결론을 쓰기 직전 프로세스가 죽었고, 레지스트리에는 running으로 남았다(pid 35676 부재). `docs/tech-debt/active.md`의 "Codex 백그라운드 멈춤(큰 질의 + 다수 rg)" 항목과 같은 증상이다.
  - 해결: 그 tech-debt가 적은 대응책("짧은 질의 + foreground")을 따랐다. 코드 검색을 막고 예/아니오 3문항으로 줄여 한 번만 다시 요청했다. 같은 질의를 무작정 반복하지 않았다.
  - 결과: 다시 요청한 호출이 97초 만에 PASS(신뢰도 high)를 냈다. 1차 멈춤은 도구 문제이지 계획 결함이 아니다.

- **D2 — PR #115 리뷰 3건을 한 PR로 반영하고 baseline 복구는 미뤘다**
  - 문제: Gemini·GitHub Codex 리뷰가 3건을 지적했다. (1) 보안 마이그레이션이 삭제된 `bulletin_images.url`을 재참조해 이미지 있는 주보 생성 시 런타임 오류가 난다, (2) 추적 시작한 레거시 마이그레이션이 baseline 테이블 부재·sermon 스키마 드리프트로 빈 DB를 못 만든다, (3) `update-bulletin.action.ts`가 폼의 `cloudinaryId`로 Cloudinary 원본을 지워 교차 삭제가 된다. Supabase Preview 실패는 별개로 무료 티어 402(이미지 변환)였다.
  - 해결: prod가 비어 있고 MVP 완성 후에야 prod 마이그레이션을 한다는 점을 근거로, 보안 fix만 한 PR로 반영하는 쪽을 택했다. (1) `url`을 제거하고 이미지 포함 케이스를 다시 검증했다. (3) 삭제 대상 `cloudinary_id`를 폼이 아니라 `getBulletinByIdSSR`로 DB에서 `bulletinId` 소속만 추려 지운다. 402는 `config.toml` 이미지 변환을 off로 바꿔 해소했다. (2) baseline 복구는 sermon 스키마까지 걸린 큰 작업이라 보안 PR과 분리해 tech-debt에 "prod 마이그레이션 전 필수"로 등록했다.
  - 결과: 보안 구멍 차단을 한 PR로 마치고, 깨진 baseline을 정식 마이그레이션으로 굳히지 않았다. Codex CR 사유(타입 비교)는 `ExistingImageItem.imageId`가 `number`이고 JSON이 number를 보존함을 확인해 구현 차단 사유가 아니라고 판정했고, `Number()`로 강제 변환해 한 번 더 막았다.

## 검증 이력

<details>
<summary>같은 세션 직전 Codex 호출 — 보안 결함·수정안 심층 검증</summary>

- 판정: 두 결함 CONFIRMED + 수정안 보정 5건
- 보정: 컬럼 단위 role 잠금, `PUBLIC` revoke, `update_bulletin` 이미지 삭제 `bulletin_id` 바인딩, `author_id`를 `auth.uid()`로, `search_path` 고정
- 조치: 본 계획서·마이그레이션에 5건 모두 반영

</details>

<details>
<summary>Codex 1차 검증 stdout (verbatim)</summary>

- **1** 이상 없음. **2** 이상 없음. **3** 이상 없음. **4** 이상 없음. PASS confidence: high

</details>

<details>
<summary>커밋 전 Codex 최종 검증 + 비밀 스캔</summary>

- 판정: PASS(high) — `.gitignore` 부정 패턴 안전, 두 마이그레이션 commit-ready(파괴 SQL·테스트코드 없음), 3분할 커밋 타당
- 비밀 스캔: `config.toml`의 키는 모두 `env(...)` 치환, 마이그레이션·`seed.sql`에 인라인 비밀 0건
- 조치: 옵션 C 채택 — `.gitignore` 수정 + 기존 마이그레이션 추적 시작

</details>

## 후속 작업

- 스키마 SSOT 복구 — `profiles`/`bulletins`/`notices` CREATE TABLE을 마이그레이션으로 추출.
  - 이유: 이번 범위는 보안 구멍 차단까지. 스키마 추출은 dev/prod 동기화 판단이 선행.
  - 다음 기준: 운영 오픈 준비 또는 prod 활성화 시.
  - 기록 위치: `docs/tech-debt/active.md`
- 나머지 DEFINER 함수 `search_path` 고정 + `server-only` 가드(#5).
  - 이유: 회귀 방어용, 이번 치명 구멍과 분리.
  - 기록 위치: `docs/tech-debt/active.md`

## 회고

- **잘된 것**: Supabase advisor와 `pg_catalog` 직접 조회로 코드 리뷰가 못 잡는 DB 설정 구멍 2개(profiles RLS 비활성, 가드 없는 bulletin RPC)를 찾았다. `SET LOCAL ROLE`로 anon·authenticated를 흉내 내 차단을 dev에서 실측했고, Codex가 수정안의 허점(본인행 정책만으로는 role 변경이 안 막힘, `PUBLIC` revoke 누락)을 짚어 보강했다.
- **다음에 할 것**: prod는 비어 있어 MVP 완성 시 이 마이그레이션 세트로 빌드한다. 그때 보안 마이그레이션 2개가 함께 적용되는지 확인한다.
- **부채**: 주보 수정 시 Cloudinary 삭제를 RPC 반환값으로 검증(1차 보강은 했고 더 견고한 방식은 후속), 나머지 SECURITY DEFINER 함수 `search_path` 고정 + `server-only` 가드 — 모두 `docs/tech-debt/active.md`에 등록.
