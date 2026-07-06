# Architecture

대구동남교회 웹사이트의 시스템 아키텍처. CLAUDE.md "WHAT" 섹션의 확장본.

## 라우트 그룹

```
src/app/
├── (content)/   ← 일반 사용자 영역
│   ├── about, news, fellowship, sermons, community,
│   ├── next-gen, notifications, search
│   └── layout.tsx — Header(모바일은 뒤로가기+제목) + Footer + BottomNav
└── (admin)/     ← 관리자 영역 (.shell scope, admin 토큰)
    └── layout.tsx — admin 셸 적용
```

> 공유 `<Hero/>` 배너와 브레드크럼은 제거됐다(ADR 0021). 페이지 제목은 모바일 `MobileHeader`(뒤로가기 + 가운데 제목)와 각 페이지의 `h1`(대개 sr-only)이 맡는다.

**왜 분리됐는가**: 두 그룹이 서로 다른 레이아웃·디자인 토큰·인증 모델을 가짐. URL 네임스페이스는 공유하지만 렌더 경계는 격리.

## 데이터 흐름

레이어 의존 서열이다 (위가 하위 레이어). 각 층은 자신보다 위(하위)만 import하고 아래(상위)는 참조하지 못한다 — 순차 데이터 파이프라인이 아니다.

```
apis/         ← 횡단 쿼리 (인증·설정·스태프). 도메인 파일 없음
services/     ← 도메인 읽기·쓰기 (쿼리 조합·정렬·필터 + RPC 뮤테이션)
actions/      ← Server Action 진입점 ("use server" + 검증·인증·캐시 갱신)
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

<!-- last-audit: 2026-06-18 -->
