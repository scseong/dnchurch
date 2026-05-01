# 대구동남교회 웹사이트

풀스택 Next.js 앱 — 교회 정보 / 주보 관리 / 성도 커뮤니티

> **이 파일은 지도다.** 작업 절차·규칙·금지 사항만 담는다. 상세 how-to는 `.claude/skills/`, 결정·계획·기술 부채는 `docs/`. 백과사전화 금지.

## WHAT

- **Stack**: Next.js (App Router), Supabase, SCSS Modules, Cloudinary, TypeScript
- **Route Groups**: `(content)/` — HeroSection + Breadcrumb 포함 (about, news, fellowship, sermons, community, next-gen, notifications, search)
- **Data Flow**: `apis/` (DB 쿼리) → `services/` (비즈니스 로직) → `actions/` (뮤테이션) → `app/` (페이지)

## Workflow (필수 순서: EXPLORE → PLAN → WORK → COMMIT)

어느 단계도 건너뛰지 않는다. 단순 변경(typo, 한 줄 수정, rename)은 PLAN을 생략할 수 있으나 **EXPLORE/COMMIT은 항상 필수**.

### 1. EXPLORE — 컨텍스트 수집
- 순서: `CLAUDE.md` → 관련 skill (`.claude/skills/`) → 관련 기존 코드
- 작업 영역의 기존 패턴, 의존 방향(`apis → services → actions → app`), 토큰/믹스인 사용 확인
- 새 파일을 만들기 전에 비슷한 위치·네이밍이 이미 있는지 검색
- **컨텍스트 수집 없이 코드를 쓰지 않는다.**

### 2. PLAN — exec plan 작성
- 다단계 작업은 `bash scripts/start-task.sh <slug>`로 시작 → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` 자동 생성
- 채울 항목: 목표, 접근법, 단계별 체크리스트, 완료 기준, 영향받는 파일
- 단순 변경은 생략 가능
- **다단계 작업에서 계획 없이 코드를 쓰지 않는다.**

### 3. WORK — 구현
- exec plan 단계 순서대로 진행, 각 단계 완료 시 체크박스 업데이트
- 한 번에 한 가지 관심사만 — 무관한 정리·리팩터 섞지 않는다
- 계획을 벗어나는 변경이 필요하면 코드 전에 plan부터 갱신

### 4. COMMIT — 검증 후 커밋
- 검증 필수: `yarn verify` (lint + lint:styles + build + knip 묶음, 모두 통과해야 진행)
- pre-commit 훅이 변경된 파일에 한해 자동으로 ESLint·stylelint 검사 — `--no-verify`로 우회 금지
- **사용자 승인 후 커밋한다. 자동 커밋 금지.**
- prefix는 6개만: Feat · Fix · Style · Refactor · Docs · Chore
- 머지 후 `bash scripts/complete-task.sh <slug>`로 exec-plan을 `completed/`로 이동, 회고 작성

## 에이전트 역할 분담

전략은 [ADR 0001](docs/decisions/0001-codex-orchestration-strategy.md) — 이 파일은 요약.

| 에이전트 | 책임 |
| --- | --- |
| **Claude Code** (이 에이전트) | 오케스트레이터, 메인 개발, 컨텍스트 통합·기록, 위임 판단 |
| **Codex** (`codex:rescue` 스킬) | 깊은 추론, 설계 판단, 트레이드오프 분석, 막힌 디버깅, 큰 변경 후 객관 리뷰 |

**Codex 위임 트리거** (다음 시점에 `codex:rescue` 호출 검토):
- 설계 판단 — "어떤 구조·패턴이 적합한가"
- 트레이드오프 분석 — "A vs B, 어느 쪽?"
- 막힌 디버깅 — 원인 불명 또는 첫 수정 실패
- 큰 변경 후 객관적 리뷰 (멀티 세션 리뷰 패턴)

**위임 안 함**: 단순 수정(typo·rename·한 줄), 표준 작업(commit·lint·build), 답이 명확한 코드.

## HOW (검증 루프)

```bash
yarn dev              # 개발 서버
yarn verify           # 커밋 전 전체 검증 (lint + lint:styles + build + knip)
yarn build            # 빌드만
yarn lint             # ESLint (레이어 의존성 포함)
yarn lint:styles      # stylelint (SCSS 토큰·네이밍)
yarn generate:types   # DB 스키마 변경 후 타입 재생성
yarn knip             # 미사용 코드 검사
```

워크플로우 스크립트:

```bash
bash scripts/start-task.sh <slug>     # PLAN 시작 (exec-plan 생성)
bash scripts/complete-task.sh <slug>  # 머지 후 active → completed 이동
```

pre-commit 훅은 lint-staged로 변경 파일만 자동 검사 — error는 차단, warning(기존 부채)은 통과.

테스트 환경 없음.

## 핵심 규칙

- IMPORTANT: 스타일 값은 반드시 `styles/tokens/` SCSS 변수를 사용 — **하드코딩 절대 금지** (색상, 간격, 폰트, 효과 모두)
- IMPORTANT: Supabase 클라이언트는 용도별로 반드시 구분 (스킬 자동 로딩)
- 이미지: 항상 `<Image>` + Cloudinary URL (커스텀 로더 적용됨)
- `className` 네이밍: **snake_case** (`styles.quick_item`)
- `className` 2개 이상: 반드시 `clsx` 사용
- 스타일 작성: **모바일 퍼스트** — 기본값이 모바일, `respond-up($width)`으로 상위 뷰포트 확장
- 커밋 메시지 본문은 **bullet(`-`)으로 항목 구분**
- 외부 에이전트(Codex 등) 호출 시 **질의·응답은 영어**로 정확도 확보, 사용자에게 보고는 한국어로 한다

## ⚠️ Gotchas

- `supabase` (named export from `client.ts`) deprecated → `getSupabaseBrowserClient()` 사용
- Server Action과 뮤테이션은 **항상** `createServerSideClient()` (캐시 없음)
- 공개 데이터 캐싱은 `createStaticClient()`, `createServerSideClient()` 아님
- `_variables.scss`와 `_mixins.scss`는 `additionalData`로 자동 주입됨 — 각 `.module.scss`에서 `@import` 하지 않음
- `respond($width)` (max-width)는 예외적 상황에만 — 기본은 `respond-up`
- 한 페이지에서만 쓰이는 컴포넌트는 `src/components/`가 아닌 `app/[route]/_component/`에 배치
- 재사용 가능성이 확인된 시점에만 `src/components/`로 이동
- 커밋 prefix는 **Feat · Fix · Style · Refactor · Docs · Chore** 6개만 사용 — `Enhance` 등 임의 prefix 금지

## 지식 시스템 (어떤 정보가 어디에 있는가)

**"이 정보 어디 있지?"는 항상 이 표에서 시작한다.** Slack·Notion·PR 본문에 흩어진 결정은 해당 위치로 회수한다.

| 정보 종류 | 위치 | 갱신 시점 |
| --- | --- | --- |
| 시스템 아키텍처 (라우트·레이어·외부 의존) | `docs/ARCHITECTURE.md` | 구조 변경 시 |
| 진행 중 작업 (EXEC_PLAN) | `docs/exec-plans/active/` | 작업 시작 시 |
| 완료된 작업 (회고·검색) | `docs/exec-plans/completed/` | 머지 후 이동 |
| 영구 결정 (ADR) | `docs/decisions/` | 구조·라이브러리·패턴 변경 시 |
| 기술 부채·마이그레이션 | `docs/tech-debt-tracker.md` | 발견 즉시 |
| 자동 생성 (DB 스키마 등) — **수정 금지** | `docs/generated/` | 스크립트 실행 시만 |
| 외부 라이브러리 참조 (llms.txt) | `docs/references/` | 라이브러리 업데이트 시 |
| 작업별 외부 자료 발췌 (일회성) | `docs/research/` | EXEC_PLAN 진행 중 |
| 워크플로우 자동화 스크립트 | `scripts/` | 스크립트 추가/변경 시 |
| 작업별 how-to (자동 로딩) | `.claude/skills/{supabase,styles,file-structure}/` | 트리거 시 자동 |

스킬 트리거:

| 트리거                                         | 스킬                             |
| ---------------------------------------------- | -------------------------------- |
| Supabase 클라이언트, 캐싱, revalidateTag, 인증 | `.claude/skills/supabase/`       |
| SCSS 토큰, 믹스인, 시맨틱 토큰 매핑            | `.claude/skills/styles/`         |
| 새 파일 위치, 디렉토리 구조, barrel export     | `.claude/skills/file-structure/` |

<!-- last-audit: 2026-05-01 -->

