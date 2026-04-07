# 대구동남교회 웹사이트

풀스택 Next.js 앱 — 교회 정보 / 주보 관리 / 성도 커뮤니티

## WHAT

- **Stack**: Next.js (App Router), Supabase, SCSS Modules, Cloudinary, TypeScript
- **Route Groups**: `(content)/` — HeroSection + Breadcrumb 포함 (about, news, fellowship, sermons, community, next-gen, notifications, search)
- **Data Flow**: `apis/` (DB 쿼리) → `services/` (비즈니스 로직) → `actions/` (뮤테이션) → `app/` (페이지)

## HOW (검증 루프)

```bash
yarn dev              # 개발 서버
yarn build            # 빌드 확인 (PR 전 필수)
yarn lint             # ESLint
yarn generate:types   # DB 스키마 변경 후 타입 재생성
yarn knip             # 미사용 코드 검사
```

테스트 환경 없음.

## 핵심 규칙

- IMPORTANT: 스타일 값은 반드시 `styles/tokens/` SCSS 변수를 사용 — **하드코딩 절대 금지** (색상, 간격, 폰트, 효과 모두)
- IMPORTANT: Supabase 클라이언트는 용도별로 반드시 구분 (스킬 자동 로딩)
- 이미지: 항상 `<Image>` + Cloudinary URL (커스텀 로더 적용됨)
- `className` 네이밍: **snake_case** (`styles.quick_item`)
- `className` 2개 이상: 반드시 `clsx` 사용
- 스타일 작성: **모바일 퍼스트** — 기본값이 모바일, `respond-up($width)`으로 상위 뷰포트 확장
- 커밋 메시지 본문은 **bullet(`-`)으로 항목 구분**

## ⚠️ Gotchas

- `supabase` (named export from `client.ts`) deprecated → `getSupabaseBrowserClient()` 사용
- Server Action과 뮤테이션은 **항상** `createServerSideClient()` (캐시 없음)
- 공개 데이터 캐싱은 `createStaticClient()`, `createServerSideClient()` 아님
- `_variables.scss`와 `_mixins.scss`는 `additionalData`로 자동 주입됨 — 각 `.module.scss`에서 `@import` 하지 않음
- `respond($width)` (max-width)는 예외적 상황에만 — 기본은 `respond-up`
- 한 페이지에서만 쓰이는 컴포넌트는 `src/components/`가 아닌 `app/[route]/_component/`에 배치
- 재사용 가능성이 확인된 시점에만 `src/components/`로 이동
- 커밋 prefix는 **Feat · Fix · Style · Refactor · Docs · Chore** 6개만 사용 — `Enhance` 등 임의 prefix 금지

## 상세 문서 (스킬 — 해당 작업 시 자동 로딩)

| 트리거                                         | 스킬                             |
| ---------------------------------------------- | -------------------------------- |
| Supabase 클라이언트, 캐싱, revalidateTag, 인증 | `.claude/skills/supabase/`       |
| SCSS 토큰, 믹스인, 시맨틱 토큰 매핑            | `.claude/skills/styles/`         |
| 새 파일 위치, 디렉토리 구조, barrel export     | `.claude/skills/file-structure/` |
