# 0022 — 사용자 소유 데이터는 owner-RLS + 사용자 세션 Server Action

- **Status**: Proposed
- **Date**: 2026-07-17
- **Deciders**: scseong
- **Tags**: supabase, auth, frontend

## Context

성경읽기 트래커(exec-plan `bible-reading-tracker`)가 이 앱의 첫 사용자 소유 CRUD 데이터를 도입한다. 지금까지 테이블은 두 부류뿐이었다.

- **admin 소유**: `sermons`·`bulletins`·`notices` 등. RLS가 `EXISTS(profiles WHERE id=auth.uid() AND role='admin')`로 관리자만 쓴다.
- **공개 폼(쓰기 전용)**: `new_family_registrations`. 익명 insert만 허용하고 읽기는 admin 전용.
- **`profiles`**: `role`·`status` 권한 상승 위험 때문에 클라이언트 쓰기를 GRANT 회수로 잠갔다(`20260611000000_profiles_rls_lockdown.sql`). 프로필 수정은 본인 확인 후 admin 클라이언트 Server Action으로만 한다(ADR 0021 계열 결정).

읽기 기록은 이 세 부류 어디에도 안 맞는다. 사용자가 자기 기록을 자주 읽고 쓴다(장 토글). `profiles`식 admin-잠금을 그대로 적용하면 토글마다 admin 경로를 타야 해 과하고, 반대로 아무 정책 없이 클라이언트 직접 쓰기를 열면 `docs/ARCHITECTURE.md:35`("뮤테이션은 항상 Server Action — 클라이언트 직접 write 금지")와 충돌한다. 사용자 소유 데이터의 표준 경계를 정하지 않으면 앞으로 비슷한 기능마다 정책이 제각각이 된다.

## Decision

사용자 소유 데이터 테이블은 다음을 따른다.

1. **owner-RLS 정책**: SELECT/INSERT/UPDATE/DELETE 각각에 `auth.uid() = user_id`를 건다. INSERT·UPDATE에는 `USING`뿐 아니라 **`WITH CHECK (auth.uid() = user_id)`**를 반드시 둬서 남의 `user_id` 행 삽입을 막는다.
2. **뮤테이션은 사용자 세션 Server Action**: 클라이언트 직접 write는 하지 않는다. `actions/*.action.ts`가 `createServerSideClient()`(사용자 세션)로 쓴다. 이 클라이언트는 admin bypass가 아니라 사용자 JWT를 실어 owner-RLS가 실제로 적용된다. `user_id`는 `getUser()`가 준 값으로만 채워 스푸핑을 원천 차단한다.
3. **admin-잠금은 권한 상승 컬럼이 있는 테이블에만**: `profiles`처럼 `role`·`status` 같은 컬럼이 있어 사용자가 자기 행이라도 특정 컬럼을 바꾸면 안 되는 경우에만 GRANT 회수 + admin Server Action을 쓴다.

첫 적용: `bible_reading_records`, `bible_reading_settings`.

## Consequences

### 긍정적
- 사용자별 격리를 DB(RLS)가 보장한다. 액션 코드 버그가 있어도 남의 행을 못 읽거나 못 쓴다.
- 아키텍처 규칙(뮤테이션=Server Action)을 지키면서도, 잦은 토글에 admin 왕복 대신 세션 액션 + 낙관적 UI로 반응성을 확보한다.
- 앞으로 사용자 소유 기능(기도제목·저장한 설교 등)의 정책 기준이 하나로 고정된다.

### 부정적 / 트레이드오프
- 테이블마다 정책 4개(select/insert/update/delete)를 손으로 써야 한다. 누락(특히 `WITH CHECK`) 시 보안 구멍이 생기므로 마이그레이션 리뷰에서 확인한다.
- 낙관적 UI라 액션 실패 시 클라이언트가 롤백해야 한다. 실패 처리를 빠뜨리면 화면과 DB가 어긋난다.

### 영향 범위
- 코드: `supabase/migrations/20260717000000_create_bible_reading.sql`, `src/actions/bible-reading.action.ts`, `src/apis/bible-reading.ts`.
- 운영: dev·prod 두 프로젝트에 같은 마이그레이션을 적용한다.

## Alternatives Considered

### A안: 클라이언트가 owner-RLS 테이블에 직접 write
- 사유로 기각: `ARCHITECTURE.md:35`의 "클라이언트 직접 write 금지"와 eslint `app → apis` 차단 규칙을 어긴다. 규칙 자체를 뒤집는 비용이 이득보다 크다.

### B안: `profiles`처럼 GRANT 회수 + admin 클라이언트 Server Action
- 사유로 기각: 읽기 기록에는 `role`·`status` 같은 권한 상승 컬럼이 없어 admin 우회가 필요 없다. admin 클라이언트는 RLS를 통째로 우회해 오히려 격리가 약해지고, 장 토글마다 admin 경로를 타는 것도 과하다.

## References

- 관련 PR:
- 관련 exec-plan: `docs/exec-plans/active/2026-07-17-bible-reading-tracker.md`
- 관련 ADR: `0011`(profiles 관련), `docs/decisions` 내 admin RLS 결정
