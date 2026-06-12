# 0016 — Server Action 공통 패턴 (위치·검증·반환·revalidate)

- **Status**: Accepted
- **Date**: 2026-06-12
- **Deciders**: scseong
- **Tags**: supabase, frontend, actions

## Context

mutation은 Server Action으로 통일하는 방향인데, 패턴이 도메인마다 달랐다.

- 액션 파일 위치가 두 가지였다: 도메인별 `src/actions/<domain>.action.ts`(주보·설교·공지)와 라우트 로컬 `app/reset-password/actions.ts`.
- 갱신 방식도 두 가지였다: sermon은 `updateTag('sermon')` 1줄, bulletin은 `revalidatePath` 2개 + 서브태그 `updateTag` 병행. bulletin의 `updateTag('bulletin-detail-nav')`는 캐시 키에 없는 태그라 효과 없는 호출이었다.
- auth 호출 6건은 `src/apis/auth.ts`가 브라우저 클라이언트로 직접 호출해 레이어 규칙(`apis → services → actions → app`)을 벗어나 있었고, 서버 검증 지점이 없었다.

패턴을 정하지 않으면 새 액션을 쓸 때마다 위치·검증·갱신을 다시 고민하고, 갱신 누락으로 오래된 화면이 그대로 남는 사고가 쌓인다. 근거: Codex 계획 검증에서 `bulletin-nav`만 갱신하면 목록·요약이 86400초(24시간) 동안 옛 데이터로 남는 사례를 확인했다.

## Decision

1. **위치**: Server Action은 도메인별 `src/actions/<domain>.action.ts`에 둔다. 레이어 흐름은 `actions → services → apis`를 따른다.
2. **입력 검증**: zod 없이 액션 진입부 수동 검증 + 도메인 헬퍼(`checkAdminPermission`·`validateFiles`·`validateSermonAction` 패턴)로 한다. 클라이언트 폼 검증은 UX 보조일 뿐, 액션이 항상 서버에서 다시 검증한다.
3. **반환 형식**: `{ success: boolean; message: string }`을 `ActionResult` 공유 타입으로 두고 모든 액션이 사용한다. 데이터 반환이 필요해지면 제네릭(`ActionResult<T>`)으로 확장한다.
4. **갱신(revalidate)**: 태그 기본. 모든 도메인 캐시 키가 ROOT 태그(`bulletin`·`sermon`·`notice`·`worship`)를 포함하므로, mutation 후 `updateTag('<domain-root>')` 1줄로 갱신한다. `revalidatePath`는 태그가 못 덮는 예외(태그 없는 라우트 캐시 등)에만 쓴다.

## Consequences

### 긍정적
- 새 액션 작성 시 위치·검증·반환·갱신 고민이 사라진다 — 기존 sermon 액션이 동작 증명(태그 1줄로 홈·목록·상세·시리즈 5개 라우트 커버).
- 화면이 추가돼도 액션 수정이 필요 없다 — 경로를 직접 나열하다 빠뜨려 생기는 사고를 막는다.

### 부정적 / 트레이드오프
- ROOT 태그 무효화는 도메인 전체 캐시를 비운다 — 상세 페이지만 따로 비우는 세분화된 무효화보다 캐시 적중률이 일시 하락한다. 이 규모(주보·설교 수백 건)에서는 허용 가능.
- 태그는 경로보다 간접적이라 처음 보는 사람은 캐시 키 파일(`*-cache.ts`)을 함께 봐야 한다.

### 영향 범위
- 코드: `src/actions/*` 전체, 신규 `auth.action.ts`, bulletin 액션의 revalidatePath·서브태그 제거
- 운영: 없음 (배포·환경 변수 변경 없음)

## Alternatives Considered

### A안: revalidatePath 기본
- 기각 사유: 같은 데이터가 여러 라우트에 나타나는 구조(설교 5곳)에서 경로 나열은 화면 추가 때마다 액션 수정을 강제하고 누락 시 조용히 stale로 남는다.

### B안: 경로 + 태그 병행 (기존 bulletin 방식)
- 기각 사유: 어느 쪽이 실제로 일하는지 불명확하고, sermon과 bulletin이 서로 다르게 굳어진 원인이 이 모호함이었다. 효과 없는 태그 호출(`bulletin-detail-nav`)도 이 방식에서 나왔다.

### C안: zod 도입 (검증)
- 기각 사유: 프로젝트가 zod 미사용 정책을 유지 중이고, 현행 수동 검증 + 헬퍼 패턴이 5개 액션에서 검증돼 있다. 의존성 추가 비용 대비 이득 없음.

## References

- 관련 PR: (커밋 6~8 포함 PR에서 기입)
- 관련 exec-plan: `docs/exec-plans/active/2026-06-11-server-client-boundary.md` (D2~D7)
- 관련 ADR: 0001 (Codex 오케스트레이션)
