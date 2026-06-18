---
name: supabase
description: Supabase 클라이언트 생성/선택, 데이터 페칭, 캐싱 전략(updateTag/ISR), Server Action 작성, 인증 흐름 작업 시 사용
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
const supabase = createStaticClient({ tags: ['bulletin', 'bulletin-detail', 'bulletin-detail-42'] });
// 뮤테이션 시: updateTag('bulletin') — 모든 키가 ROOT 'bulletin'을 포함해 한 번에 무효화 (ADR 0016)
```

**4. 영구 캐시** — 거의 변경되지 않는 데이터 (사역자 정보 등)
```ts
const supabase = createStaticClient({ tags: ['staff'], cache: 'force-cache' });
// 관리자 수정 시: updateTag('staff')
```

### 레이어별 역할

**`src/apis/`** — 인증·설정·스태프 등 횡단(cross-cutting) 단순 쿼리. 도메인(sermon·bulletin 등) 파일은 없다. 캐시 전략을 함께 결정하고, 쿼리 결과를 가공 없이 반환.

**`src/services/`** — 도메인 읽기·쓰기를 모두 가진다. 여러 쿼리 조합(`Promise.all`)·결과 가공 같은 읽기 로직과 RPC 뮤테이션(`createSermon`·`updateSermon` 등)이 한 팩토리에 함께 있다. 캐시 전략은 `*-cache.ts`로 분리하고 클라이언트를 주입받아 사용(`bulletinService(supabase)`).

**`src/actions/`** — 폼 제출·뮤테이션의 서버 진입점. `'use server'` + 검증·인증을 입혀 `services/` 뮤테이션을 호출한다. `createServerSideClient()`(캐시 없음) 고정. 성공 후 `updateTag`로 관련 캐시 무효화.

### updateTag 무효화 책임

뮤테이션이 발생한 Server Action에서 직접 호출. 태그 체계는 `src/services/*/`의 `*-cache.ts`에서 관리. 모든 도메인 캐시 키가 ROOT 태그를 포함하므로 ROOT 하나로 목록·요약·상세·nav를 한 번에 갱신한다 (ADR 0016).

```ts
import { updateTag } from 'next/cache';

// 예시: 주보 수정 후
updateTag('bulletin'); // ROOT 태그 — 주보 관련 캐시 전체 무효화
```

## 인증 (Auth)

- `SessionContextProvider` (`src/context/SessionContextProvider.tsx`)가 루트 레이아웃에서 인증 상태 관리
- `useProfile()` hook으로 현재 로그인 사용자의 profile 조회
- `proxy.ts`가 미들웨어 역할 — 세션 갱신 처리
- 로그인 후 리다이렉트는 `localStorage`의 `REDIRECT_AFTER_LOGIN_KEY`를 통해 처리
