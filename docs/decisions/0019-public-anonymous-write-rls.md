# 0019 — 익명 공개 쓰기를 서버 액션과 anon 전용 RLS로 처리한다

- **Status**: Accepted
- **Date**: 2026-06-29
- **Deciders**: scseong
- **Tags**: supabase, actions, security

## Context

기존 뮤테이션(notice·bulletin·sermon)은 전부 admin 인증을 거쳤다. 로그인하지 않은 방문자가 DB에 직접 쓰는 경로는 없었다.

새가족 등록(`/about/welcome`)은 비로그인 방문자가 이름·연락처 같은 개인정보(PII)를 제출하는 첫 공개 폼이다. 누구나 제출할 수 있어야 하지만, 제출된 PII를 다른 익명 사용자가 읽으면 안 된다. 이 두 조건을 동시에 만족하는 쓰기 패턴이 저장소에 없어서, 앞으로 생길 다른 공개 폼(기도 요청·문의 등)이 따라갈 기준을 정한다.

## Decision

공개 폼 제출은 **서버 액션 + anon 전용 RLS**로 처리한다.

- **경로**: 클라이언트 폼 → 서버 액션(`createServerSideClient`, 비로그인이라 `anon` 역할) → 서비스 → 테이블 insert.
- **RLS**:
  - INSERT 정책은 `anon`·`authenticated`에 허용하되 `with check (privacy_agreed = true)`로 동의하지 않은 행을 DB에서 막는다.
  - SELECT·UPDATE·DELETE 정책은 두지 않는다. 익명은 읽기·수정이 불가능해 제출된 PII가 외부에 노출되지 않는다.
  - 관리자 조회는 RLS를 우회하는 `service_role`로 한다.
- **이중 방어**: 서버 액션에서도 이름·연락처·동의를 다시 검증한다.
- **금지**: insert 뒤에 `.select()`를 이어 붙이지 않는다. anon은 읽기 권한이 없어 select 단계에서 실패한다.

첫 적용은 `new_family_registrations` 테이블 + `submitNewFamilyRegistration` 액션 + `newFamilyService`다.

## Consequences

### 긍정적
- 비로그인 방문자가 제출할 수 있으면서, 제출된 PII는 익명 읽기에서 차단된다.
- 앞으로 다른 공개 폼이 그대로 따라갈 재사용 패턴이 생겼다.

### 부정적 / 트레이드오프
- 익명 insert가 열려 있어 **스팸 방지가 없다** — captcha나 액션 rate-limit이 따로 필요하다.
- RLS로 읽기를 막아서 **admin 조회 화면은 `service_role` 또는 별도 admin select 정책**을 따로 만들어야 한다.
- 두 항목의 실제 후속 작업은 `docs/exec-plans/active/2026-06-28-about-children-redesign.md`의 `## 후속 작업`에서 추적한다.

### 영향 범위
- 코드: `src/actions/new-family.action.ts`, `src/services/new-family/new-family-service.ts`, `supabase/migrations/20260629000000_create_new_family_registrations.sql`
- 운영: 마이그레이션은 dev(mficogrxekuahjqborxw)에만 적용·검증함. prod는 사용자 승인 시 같은 마이그레이션 적용.

## Alternatives Considered

### A안: `service_role`로 insert(RLS 우회)
- 기각 이유: 액션이 service key를 들고 있어야 하고, RLS라는 DB 차원 방어가 빠져 방어가 약해진다. anon 역할로 두면 DB 정책이 곧 보안 경계가 된다.

### B안: 이메일 발송만(DB 저장 없음)
- 기각 이유: 이메일 인프라가 없고, 부서 배치·관심 영역 같은 구조화 데이터를 잃는다.

## References

- 관련 PR: (작성 시점 미생성 — 브랜치 `style/home-bg-remove-preview`)
- 관련 exec-plan: `docs/exec-plans/active/2026-06-28-about-children-redesign.md` (D7)
- 관련 ADR: -
