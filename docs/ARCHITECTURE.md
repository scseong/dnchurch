# Architecture

대구동남교회 웹사이트의 시스템 아키텍처. CLAUDE.md "WHAT" 섹션의 확장본.

## 라우트 그룹

```
src/app/
├── (content)/   ← 일반 사용자 영역 (HeroSection + Breadcrumb)
│   ├── about, news, fellowship, sermons, community,
│   ├── next-gen, notifications, search
│   └── layout.tsx — HeroSection 자동 적용
└── (admin)/     ← 관리자 영역 (.shell scope, admin 토큰)
    └── layout.tsx — admin 셸 적용
```

**왜 분리됐는가**: 두 그룹이 서로 다른 레이아웃·디자인 토큰·인증 모델을 가짐. URL 네임스페이스는 공유하지만 렌더 경계는 격리.

## 데이터 흐름

```
apis/         ← Supabase 쿼리 (read 중심)
  ↓
services/     ← 비즈니스 로직 / 트랜스폼 / 정렬·필터
  ↓
actions/      ← Server Action (write·뮤테이션, "use server")
  ↓
app/          ← 페이지·레이아웃 (RSC 기본)
```

규칙:

- **페이지는 `apis/`를 직접 호출하지 않는다** — 항상 `services/` 경유
- **뮤테이션은 항상 Server Action** — 클라이언트에서 직접 Supabase write 금지
- **Supabase 클라이언트는 용도별 4종을 사용** — 상세는 `.claude/skills/supabase/`

## Supabase 환경

| 환경 | Project ID | 용도 |
| --- | --- | --- |
| 현재 main | `mficogrxekuahjqborxw` | 마이그레이션 적용 대상 |
| 미래 prod | `ndimreqwgdiwtjonjjzq` | 출시 전 검증용 |

스키마 변경 후 반드시 `yarn generate:types`로 `src/types/database.types.ts` 재생성 — 이 파일은 자동 생성이므로 손으로 수정 금지.

## 외부 의존

- **Cloudinary** — 이미지 호스팅. `<Image>` + 커스텀 로더로 항상 사용
- **Vercel** — 호스팅·ISR
- **Supabase** — DB·Auth·Storage

## 컴포넌트 배치 규칙

| 위치 | 기준 |
| --- | --- |
| `app/[route]/_component/` | 한 페이지에서만 쓰임 |
| `src/components/` | 재사용 가능성이 **확인된** 시점에만 이동 |

상세는 `.claude/skills/file-structure/`.

<!-- last-audit: 2026-05-01 -->
