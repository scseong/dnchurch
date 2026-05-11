# 대구동남교회 웹사이트

대구동남교회의 풀스택 웹사이트. 교회 정보 제공·주보 관리·설교 아카이브·성도 커뮤니티가 통합된 단일 Next.js 앱입니다.

- **목표**: 성도들과의 소통 강화 + 교회 활동 지원 + 검색 노출
- **대상**: 교인 + 출석 교회를 찾는 일반인
- **개발 인원**: 1명 (오너)
- **버전**: `0.4.0-beta.1`
- **개시**: 2024-11-01

> 이 README는 레포 진입점입니다. 일상 작업의 지도는 [`CLAUDE.md`](CLAUDE.md)에 있습니다. (백과사전 가이드 `docs/PROJECT_GUIDE.md`는 별도 작업 진행 중)

## 목차

1. [현재 구현 상태](#현재-구현-상태)
2. [기술 스택](#기술-스택)
3. [빠른 시작](#빠른-시작)
4. [프로젝트 구조](#프로젝트-구조)
5. [데이터 레이어](#데이터-레이어)
6. [개발 워크플로우 (하네스)](#개발-워크플로우-하네스)
7. [주요 명령어](#주요-명령어)
8. [핵심 규칙·컨벤션](#핵심-규칙컨벤션)
9. [문서 맵](#문서-맵)
10. [라이선스](#라이선스)

---

## 현재 구현 상태

| 영역 | 기획 | 현재 상태 |
| --- | --- | --- |
| 교회 정보 (about) | 비전·예배·오시는 길·섬기는 이 | 비전·예배·오시는 길·섬기는 이 구현 / welcome·pastor 미구현 |
| 교회 소식 | 공지·주보·갤러리 | 주보 CRUD 완료 / 공지 목록 완료, 상세 미구현 / 갤러리 미구현 |
| 설교 | 아카이브·필터·관리 | 목록·검색·시리즈·관리자 CRUD 완료 |
| 나눔 (community) | 신앙나눔·기도·자료 | 전체 미구현 (placeholder) |
| 다음세대 (next-gen) | 유치/유초등/중고등/청년 | 전체 미구현 |
| 마이페이지 | 프로필·읽은 성경 | 미구현 |
| 인증 | 이메일 + 카카오 OAuth | 구현 완료 |
| 관리자 | 컨텐츠 CMS | 설교 CRUD 완료, 그 외 진행 중 |

상세 라우트·페이지 카탈로그는 `PROJECT_GUIDE.md` §4, 미구현 페이지 목록은 §20 참고.

---

## 기술 스택

### Runtime / 핵심

| 영역 | 기술 |
| --- | --- |
| 프레임워크 | **Next.js 16** (App Router) — RSC + Server Action |
| 언어 | **TypeScript 5** (strict) |
| UI 런타임 | **React 19** |
| 스타일 | **SCSS Modules** + 2단계 토큰 시스템 (Primitive → Semantic) |
| 폼 | **react-hook-form 7** |
| 상태 | **Zustand 5** (토스트 전용, 그 외는 RSC + URL 상태) |
| 테이블 | **@tanstack/react-table 8** (admin 설교 목록) |
| 날짜 | **dayjs 1.11** + ko locale |
| 클래스 결합 | **clsx 2** |
| 아이콘 | **react-icons 5** |
| 갤러리 | **photoswipe 5** + `react-photoswipe-gallery` |

### 백엔드·외부

| 영역 | 기술 |
| --- | --- |
| DB · Auth · Storage | **Supabase** (PostgreSQL 15 / RLS / RPC / Custom Access Token Hook) |
| 이미지 호스팅 | **Cloudinary** (custom Next Image loader) |
| 지도 | **react-kakao-maps-sdk** (`/about/location`만) |
| OAuth | Supabase Auth `kakao` provider |

### 검증·도구

| 영역 | 도구 |
| --- | --- |
| 린팅 | **ESLint 9** + `eslint-config-next` + 레이어 의존성 룰 |
| 스타일 린팅 | **Stylelint 17** + `stylelint-config-standard-scss` |
| 미사용 코드 | **knip 5** |
| 포맷 | **Prettier 3** (tabWidth 2, singleQuote, no-trailing-comma) |
| 번들 분석 | **@next/bundle-analyzer** |
| Git 훅 | **husky 9** + **lint-staged 16** |
| DB CLI | **supabase 2** |

> **2024-11 초기 README는 outdated**: Tailwind / TanStack Query를 적었지만 실제 구현은 **SCSS Modules + RSC + Server Action**으로 변경됐습니다. 새 기능 시작 시 README가 아닌 본 가이드와 `CLAUDE.md`를 신뢰원으로 삼아주세요.

---

## 빠른 시작

### 사전 요구사항

- **Node.js** 20+ (권장)
- **Yarn** (package manager)
- **Windows + PowerShell** 또는 **macOS/Linux** + Bash 모두 지원 (자동화 스크립트는 `.mjs`로 통일됨 — ADR 0002)
- Supabase 프로젝트 액세스 + Cloudinary 계정 + Kakao Developers 키

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# 환경 변수 설정 (아래 참고)
cp .env.local.example .env.local   # 예시 파일이 있다면

# 개발 서버
yarn dev                            # http://localhost:3000

# 빌드
yarn build
yarn start
```

### 환경 변수

`.env.local`에 다음 값을 채워주세요. `.env*` 파일은 **절대 커밋 금지** (`.gitignore`에 등록됨).

| 변수 | 공개? | 사용처 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | Supabase 클라이언트 4종 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 | Supabase 클라이언트 4종 |
| `NEXT_SUPABASE_SERVICE_ROLE` | 비공개 | `lib/supabase/admin.ts` (Storage·RPC) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 공개 | 이미지 변환·로더 |
| `CLOUDINARY_API_KEY` | 비공개 | 이미지 업로드 (Server Action) |
| `CLOUDINARY_API_SECRET` | 비공개 | 이미지 업로드 (Server Action) |
| `NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER` | 공개 | 업로드 폴더 prefix |
| `NEXT_PUBLIC_SITE_URL` | 공개 | 인증 redirect URL |
| `NEXT_PUBLIC_KAKAO_API_KEY` | 공개 | Kakao Maps SDK + 공유 |
| `VERIFY_ENFORCE` | dev | `1` 시 verify 누락 커밋 차단 |
| `HARNESS_ENFORCE` | dev | `1` 시 complete-task 차단 강화 |

전체 목록과 사용처는 `PROJECT_GUIDE.md` §13 참고.

### Supabase 프로젝트

운영 중인 프로젝트 2개:

- **현재 main**: `mficogrxekuahjqborxw` — 마이그레이션 적용 대상
- **미래 prod**: `ndimreqwgdiwtjonjjzq` — 출시 전 검증용

스키마 변경 후 타입 재생성:

```bash
yarn generate:types
```

---

## 프로젝트 구조

```
dnchurch/
├── .claude/                # Claude Code 하네스 (skills, hooks, settings)
├── .codex/                 # Codex 진입점 (context-loader)
├── .github/                # PR template, workflow
├── .husky/                 # pre-commit
├── docs/                   # 영구 지식 시스템 (ARCHITECTURE, ADR, exec-plans, tech-debt)
├── logs/                   # verify-task 증적 (gitignored)
├── public/                 # 정적 자산
├── scripts/                # 워크플로우 자동화 (.mjs)
├── supabase/               # 마이그레이션, seed, config.toml
└── src/
    ├── actions/            # Server Action (mutation)
    ├── apis/               # Supabase 쿼리 (read)
    ├── app/                # App Router 라우트
    │   ├── (admin)/        # 관리자 그룹 (.shell scope)
    │   ├── (content)/      # 일반 사용자 그룹 (Hero + Breadcrumb)
    │   └── auth/, login, sign-up, ...
    ├── components/         # ui / common / layout / admin / board / file / form / lib
    ├── config/             # navigation·adminNavigation
    ├── constants/          # auth·bulletin·file·notice·regex·validation
    ├── context/            # SessionContextProvider
    ├── hooks/              # 12개 커스텀 훅
    ├── lib/                # supabase 클라이언트 4종 + 도메인 유틸
    ├── proxy.ts            # Next 16 미들웨어 (구 middleware.ts)
    ├── services/           # 비즈니스 로직 (bulletin/notice/sermon/worship)
    ├── store/              # zustand (toast)
    ├── styles/             # 토큰·믹스인·globals
    ├── types/              # database.types(자동) + 도메인 타입
    └── utils/              # cloudinary·date·file·photoswipe·sermon 등
```

### 라우트 그룹

`src/app/`은 두 개의 Route Group으로 분리되어 다른 레이아웃·디자인 토큰·인증 모델을 가집니다.

- **`(content)/`** — 공개 컨텐츠. `layout.tsx`에 Hero + Breadcrumb 자동 적용. about, sermons, news, fellowship, community, next-gen, notifications, search.
- **`(admin)/`** — `.shell` 스코프 (admin 토큰), `checkAdminPermission` 진입 가드.
- 그룹 외 — login, sign-up, forget-password, reset-password, mypage, auth/* (인증 라우트).

상세 카탈로그·렌더 모드·데이터 의존은 `PROJECT_GUIDE.md` §4.

---

## 데이터 레이어

### 흐름

```
apis/  →  services/  →  actions/  →  app/
  ↑           ↑           ↑           ↑
Supabase    비즈니스    Server      페이지/
쿼리(read)  로직·RPC   Action      레이아웃
                       (write)
```

레이어 의존 방향은 ESLint로 강제됩니다 (`eslint.config.mjs`):

- `apis/` — 다른 src/ 레이어 import 금지 (가장 하위)
- `services/` — actions/app/components/hooks import 금지
- `actions/` — app/components/hooks import 금지
- `components/` — apis/services 직접 import 금지 (props/hook 주입)
- `app/` — apis/ 직접 호출 금지 (services/ 경유)

### Supabase 클라이언트 4종

`src/lib/supabase/`에 용도별 4종이 있습니다. **반드시 용도별로 구분해서 사용**해주세요.

| 클라이언트 | 사용처 | 캐시 |
| --- | --- | --- |
| **Browser** (`getSupabaseBrowserClient`) | `'use client'` 컴포넌트, OAuth | 메모리 |
| **Server-side** (`createServerSideClient`) | RSC + Server Action (뮤테이션) | `no-store` |
| **Static** (`createStaticClient`) | 공개 데이터 ISR/SSG | `force-cache` + tag/revalidate |
| **Admin** (`createAdminServerClient`) | RPC, Storage, 권한 검증 불필요 작업 | 없음 |

자세한 선택 가이드와 캐시 전략은 `PROJECT_GUIDE.md` §6, 인증 흐름은 §7 참고.

---

## 개발 워크플로우 (하네스)

이 레포는 **하네스 워크플로우**라는 8단계 파이프라인으로 작업을 관리합니다. 어느 단계도 건너뛰지 않습니다 (단순 변경은 PLAN 생략 가능, EXPLORE/VERIFY/COMMIT은 항상 필수).

```
EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → (HARNESS_GATE) → COMMIT
```

| 단계 | 산출물 | 명령 |
| --- | --- | --- |
| **EXPLORE** | 컨텍스트 수집 (CLAUDE.md → 트리거 skill → 코드) | (사람 판단) |
| **PLAN** | `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` | `node scripts/start-task.mjs <slug>` |
| **CODEX_PLAN_REVIEW** | exec-plan에 `## Codex 계획 검증` (PASS/CHANGE_REQUEST/BLOCK) | 다단계·구조 변경 시 필수 |
| **WORK** | 외과적 코드 변경 (한 번에 한 관심사) | ESLint 레이어 룰이 차단 |
| **CODEX_FIRST_PASS** | exec-plan에 `## Codex 1차 검증` | 큰 diff·고위험 파일 시 권장 |
| **VERIFY** | `logs/<task-id>/<run-id>/` 증적 | `node scripts/verify-task.mjs <slug>` |
| **HARNESS_GATE** | (머지·릴리스 전) 게이트 | `node scripts/harness-gate.mjs <slug>` |
| **COMMIT** | 사용자 승인 후 커밋 | pre-commit 훅이 검증 |

**에이전트 분업** (ADR 0001): Claude Code는 오케스트레이터·메인 구현, Codex는 깊은 추론·계획 리뷰·1차 검증. 자세한 트리거는 `CLAUDE.md` "에이전트 역할 분담" 또는 `PROJECT_GUIDE.md` §16.

---

## 주요 명령어

```bash
# 개발
yarn dev                                  # 개발 서버
yarn build                                # 빌드만
yarn start                                # production 서버

# 검증
yarn lint                                 # ESLint + 레이어 룰
yarn lint:strict                          # max-warnings=0
yarn lint:styles                          # Stylelint (SCSS 토큰·네이밍)
yarn knip                                 # 미사용 코드 (경고)
yarn analyze                              # bundle analyzer

# 타입
yarn generate:types                       # DB 스키마 → src/types/database.types.ts

# 워크플로우 (하네스)
node scripts/start-task.mjs <slug>        # PLAN 시작 (exec-plan 생성)
node scripts/verify-task.mjs <slug>       # 통합 검증 + 증적 기록
node scripts/harness-gate.mjs <slug>      # 머지/릴리스 전 게이트
node scripts/complete-task.mjs <slug>     # 머지 후 active → completed 이동
node scripts/start-adr.mjs <slug>         # ADR 시작
```

**테스트 환경 없음** — 빌드·lint가 사실상의 검증입니다. pre-commit 훅(`lint-staged`)이 변경 파일만 자동 검사하며, error는 차단·warning(기존 부채)은 통과합니다.

---

## 핵심 규칙·컨벤션

CLAUDE.md "핵심 규칙"의 요약. 자세한 배경은 ADR과 메모리 참조.

### 스타일

- 색상·간격·폰트·효과는 **반드시 `styles/tokens/` SCSS 변수** — 하드코딩 절대 금지
- 모바일 퍼스트 — 기본값이 모바일, `respond-up($width)`으로 상위 뷰포트 확장
- `_variables.scss`/`_mixins.scss`는 자동 주입 — 각 `.module.scss`에서 `@import` 안 함
- className 네이밍은 **snake_case** (`styles.quick_item`), 컴포넌트 접두사 없이 의미 단위 짧은 이름
- className 2개 이상이면 **`clsx` 필수**
- 레이아웃에 `position: absolute` 금지 → flexbox 사용
- 음수 변수는 `calc(-1 * $var)` (NOT `-$var`)
- portal(Modal/BottomSheet)에서 `var(--admin-...)` 사용 금지 → globals 토큰만

### 컴포넌트 위치

- 한 페이지에서만 쓰이면 **`app/[route]/_component/`**
- 재사용 가능성이 확인된 시점에만 `src/components/`로 이동
- 컴포넌트 폴더마다 반사적 `index.ts` 배럴 만들지 않음

### Supabase 클라이언트

- 뮤테이션은 **항상** `createServerSideClient()` (캐시 없음)
- 공개 데이터 캐싱은 `createStaticClient()`
- `supabase` named export from `client.ts` deprecated → `getSupabaseBrowserClient()`

### 커밋·PR

- prefix는 6개만: **Feat · Fix · Style · Refactor · Docs · Chore** (`Enhance` 등 임의 prefix 금지)
- 본문은 `-` 불릿
- `--no-verify` 우회 금지
- 사용자 승인 후 커밋
- PR base는 항상 **`develop`** (feature → develop → main 전략)
- PR 생성 시 `--assignee "@me"`와 `--label <name>` 필수 (없으면 GitHub Action이 차단)
- prefix별 PR 템플릿: Fix→bugfix.md, Feat→feature.md, Refactor→refactor.md, Chore→maintenance.md

### Next 16 변경

- `middleware.ts` → `proxy.ts` (이름 변경)
- App Router에서 `searchParams`는 Promise (`await` 필요)

---

## 문서 맵

"이 정보 어디 있지?"는 항상 이 표에서 시작합니다.

| 정보 종류 | 위치 |
| --- | --- |
| **A to Z 종합 가이드** (백과사전) | [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md) |
| 일상 작업의 지도·규칙·금지사항 | [`CLAUDE.md`](CLAUDE.md) |
| Codex 진입점 | [`AGENTS.md`](AGENTS.md) |
| 시스템 아키텍처 (라우트·레이어·외부 의존) | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| 영구 결정 (ADR) | [`docs/decisions/`](docs/decisions/) |
| 진행 중 작업 plan | [`docs/exec-plans/active/`](docs/exec-plans/active/) |
| 완료 작업 (회고·검색용) | [`docs/exec-plans/completed/`](docs/exec-plans/completed/) |
| 기술 부채·마이그레이션 | [`docs/tech-debt-tracker.md`](docs/tech-debt-tracker.md) |
| 자동 생성 (DB 스키마 등) — 수정 금지 | [`docs/generated/`](docs/generated/) |
| 외부 라이브러리 참조 | [`docs/references/`](docs/references/) |
| 작업별 외부 자료 발췌 (일회성, 미커밋) | `docs/research/` |
| 작업별 how-to (자동 로딩) | [`.claude/skills/`](.claude/skills/) |

### 주요 ADR

| 번호 | 제목 | 상태 |
| --- | --- | --- |
| 0001 | Codex 오케스트레이션 전략 | Accepted (2026-05-01) |
| 0002 | Node-first 하네스 자동화 | Accepted (2026-05-01) |
| 0003 | design-system-v3 typography hierarchy | Proposed (2026-05-04) |
| 0004 | UI Component Foundation (v4) | Accepted (2026-05-06) |

### Claude Code 스킬 트리거

| 트리거 | 자동 로딩 스킬 |
| --- | --- |
| Supabase 클라이언트, 캐싱, revalidateTag, 인증 | `.claude/skills/supabase/` |
| SCSS 토큰, 믹스인, 시맨틱 매핑 | `.claude/skills/styles/` |
| 새 파일 위치, 디렉토리 구조, barrel export | `.claude/skills/file-structure/` |
| 하네스 워크플로우, plan/exec-plan, Codex 검증 | `.claude/skills/harness-workflow/` |

---

## 라이선스

비공개 (대구동남교회 자체 운영). 외부 기여는 받지 않습니다.

---

<sub>레포 진입점입니다. 깊이 있는 안내는 [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md)를 참고하세요. 마지막 업데이트: 2026-05-07.</sub>
