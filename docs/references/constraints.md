# 라이브러리·프레임워크 제약

반복되는 기술 선택과 금지 패턴을 에이전트가 빠르게 참조하도록 모은다. 큰 변경은 ADR로 승격한다.

## Next.js App Router

- Server Component를 기본값으로 둔다. 클라이언트 상태, 브라우저 API, 이벤트 핸들러가 필요한 경우에만 Client Component를 사용한다.
- 페이지는 `apis/`를 직접 호출하지 않고 `services/`를 경유한다.
- 이미지 렌더링은 기본적으로 Next `<Image>`와 Cloudinary URL을 사용한다.

## Supabase

- Client Component: `getSupabaseBrowserClient()`
- Server Action, 뮤테이션, 인증 필요 Server Component: `createServerSideClient()`
- 공개 데이터 캐싱: `createStaticClient()`
- service role 필요 서버 작업: `createAdminServerClient()`
- 스키마 변경 후 `yarn generate:types`로 `src/types/database.types.ts`를 재생성한다.

## React

- React Hooks 관련 lint error는 우회 전에 의도를 검토한다.
- `useEffect` 내부 `setState`는 derived state, 이벤트 핸들러, 외부 동기화 중 어떤 케이스인지 분류한다.
- 룰 disable이 필요한 경우 라인별 주석에 의도를 적고 `docs/tech-debt-tracker.md`와 연결한다.

## SCSS Modules

- 색상, 간격, 폰트, radius, shadow는 `src/styles/tokens/` 토큰을 우선 사용한다.
- `className`은 snake_case로 작성한다.
- class 조합은 `clsx`를 사용한다.
- 모바일 퍼스트로 작성하고, 상위 뷰포트 확장은 `respond-up($width)`를 사용한다.

## Cloudinary

- 공개 이미지 렌더링은 Cloudinary URL과 Next `<Image>` 조합을 기본으로 한다.
- 임시 `<img>` 사용은 tech-debt로 추적하고, 신규 추가는 피한다.

## ADR 승격 기준

다음 중 하나에 해당하면 `docs/decisions/`에 ADR을 작성한다.

- 레이어 경계나 데이터 흐름을 바꾼다.
- 새 라이브러리를 추가하거나 기존 라이브러리를 제거한다.
- 캐싱, 인증, 배포, 빌드, lint 정책을 바꾼다.
- 여러 작업에서 반복될 패턴을 새로 정한다.

<!-- last-audit: 2026-05-01 -->
