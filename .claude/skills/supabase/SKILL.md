---
name: supabase
description: Supabase 클라이언트 생성/선택, 데이터 페칭, 캐싱 전략(revalidateTag/ISR), Server Action 작성, 인증 흐름 작업 시 사용
---

# Supabase 클라이언트 · 캐싱 · 인증

## 클라이언트 선택 규칙

| 팩토리 | 기본 캐시 | 사용처 |
|---|---|---|
| `getSupabaseBrowserClient()` | — (브라우저) | Client Component |
| `createServerSideClient()` | `no-store` | Server Action, 뮤테이션, 인증 필요 Server Component |
| `createStaticClient()` | `force-cache` | 캐시가 필요한 Server Component (인증 불필요) |
| `createAdminServerClient()` | — | `service_role` 키가 필요한 서버 작업 |
| `createMiddlewareClient()` | — | 미들웨어 전용 (세션 갱신) |

**클라이언트 선택 기준**: 로그인 사용자의 세션·쿠키가 필요하면 `createServerSideClient`, 공개 데이터(캐시 대상)이면 `createStaticClient`. Server Action과 뮤테이션은 항상 `createServerSideClient`.

## 데이터 페칭 전략

캐시 옵션은 `NextCacheOptions { tags?, revalidate?, cache? }`로 제어한다.

### 캐싱 패턴 4가지

**1. 캐시 없음** — Server Action, 뮤테이션, 실시간 데이터
```ts
const supabase = await createServerSideClient(); // 기본값: no-store
```

**2. 시간 기반 ISR** — 주기적으로 갱신되는 목록 (주보 목록 등)
```ts
const supabase = createStaticClient({ tags: ['bulletin-list'], revalidate: 86400 });
```

**3. On-demand ISR** — 관리자 액션으로만 변경되는 데이터 (주보 상세 등)
```ts
const supabase = createStaticClient({ tags: ['bulletin-detail', 'bulletin-detail-42'] });
// 뮤테이션 시: revalidateTag('bulletin-detail-42')
```

**4. 영구 캐시** — 거의 변경되지 않는 데이터 (사역자 정보 등)
```ts
const supabase = createStaticClient({ tags: ['staff'], cache: 'force-cache' });
// 관리자 수정 시: revalidateTag('staff')
```

### 레이어별 역할

**`src/apis/`** — 단일 테이블 단순 쿼리. 캐시 전략을 함께 결정하고, 쿼리 결과를 가공 없이 반환.

**`src/services/`** — 여러 쿼리 조합(`Promise.all`), 결과 가공 등 비즈니스 로직. 캐시 전략은 `*-cache.ts`로 분리하고 클라이언트를 주입받아 사용(`bulletinService(supabase)`).

**`src/actions/`** — 폼 제출·뮤테이션 전담. `createServerSideClient()`(캐시 없음) 고정. 성공 후 `revalidateTag`로 관련 캐시 무효화.

### revalidateTag 무효화 책임

뮤테이션이 발생한 Server Action에서 직접 호출. 태그 체계는 `src/services/*/`의 `*-cache.ts`에서 관리.

```ts
// 예시: 주보 수정 후
revalidatePath('/news/bulletin');
revalidateTag('bulletin-detail');      // 전체 상세 무효화
revalidateTag(`bulletin-detail-${id}`); // 특정 건만 무효화
```

## 인증 (Auth)

- `SessionContextProvider` (`src/context/SessionContextProvider.tsx`)가 루트 레이아웃에서 인증 상태 관리
- `useProfile()` hook으로 현재 로그인 사용자의 profile 조회
- `proxy.ts`가 미들웨어 역할 — 세션 갱신 처리
- 로그인 후 리다이렉트는 `localStorage`의 `REDIRECT_AFTER_LOGIN_KEY`를 통해 처리
