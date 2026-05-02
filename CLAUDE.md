# 대구동남교회 웹사이트

풀스택 Next.js 앱 — 교회 정보 / 주보 관리 / 성도 커뮤니티

> **이 파일은 지도다.** 작업 절차·규칙·금지 사항만 담는다. 상세 how-to는 `.claude/skills/`, 결정·계획·기술 부채는 `docs/`. 백과사전화 금지.

## WHAT

- **Stack**: Next.js (App Router), Supabase, SCSS Modules, Cloudinary, TypeScript
- **Route Groups**: `(content)/` — HeroSection + Breadcrumb 포함 (about, news, fellowship, sermons, community, next-gen, notifications, search)
- **Data Flow**: `apis/` (DB 쿼리) → `services/` (비즈니스 로직) → `actions/` (뮤테이션) → `app/` (페이지)

## 행동 가드레일 (LLM 공통 실수 방지)

> 모든 워크플로우 단계에 공통 적용. 트레이드오프: 속도보다 정확성 우선. 단순 변경은 자체 판단으로 생략 가능.

- **코딩 전 사고**: 가정과 모호성을 명시한다. 해석이 여럿이면 묻거나 채택한 해석을 exec-plan/응답에 기록한다 — 조용히 선택하지 않는다.
- **단순함 우선**: 작업을 만족하는 최소 변경을 선택한다. 추측성 추상화·옵션·"유연성"·요청 외 정리 금지. 200줄로 쓴 것이 50줄로 가능하면 다시 쓴다.
- **외과적 변경**: 변경된 모든 줄은 현재 작업으로 추적되어야 한다. 인접 코드·주석·포맷 "개선" 금지. 로컬 스타일을 따른다. 내 변경이 만든 unused import/변수만 제거하고, 기존 dead code는 발견 시 보고만 한다.
- **검증 가능한 목표**: 구현 전 성공 기준을 정의하고, 가장 좁은 신뢰 명령으로 먼저 검증한 뒤 `verify-task.mjs`로 마무리한다. "동작하게 만들어" 같은 약한 기준은 시작 전에 구체화한다.

## Workflow (필수 순서: EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT)

어느 단계도 건너뛰지 않는다. 단순 변경(typo, 한 줄 수정, rename)은 PLAN을 생략할 수 있으나 **EXPLORE/VERIFY/COMMIT은 항상 필수**.

### 1. EXPLORE — 컨텍스트 수집
- 순서: `CLAUDE.md` → 관련 skill (`.claude/skills/`) → 관련 기존 코드
- 기능 추가, 버그 수정, 리팩터링, 구조 변경, PLAN Mode, task-id, exec-plan, Codex 검증, verify-task, harness-gate 요청은 `.claude/skills/harness-workflow/`를 먼저 로딩한다.
- 작업 영역의 기존 패턴, 의존 방향(`apis → services → actions → app`), 토큰/믹스인 사용 확인
- 새 파일을 만들기 전에 비슷한 위치·네이밍이 이미 있는지 검색
- **컨텍스트 수집 없이 코드를 쓰지 않는다.**

### 2. PLAN — exec plan 작성
- 다단계 작업은 `node scripts/start-task.mjs <slug>`로 시작 → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` 자동 생성
- 채울 항목: 목표, 접근법, 단계별 체크리스트, 완료 기준, 영향받는 파일
- 단순 변경은 생략 가능
- **다단계 작업에서 계획 없이 코드를 쓰지 않는다.**

### 3. CODEX_PLAN_REVIEW — 구현 전 계획 검증
- 다단계 작업, 구조 변경, `scripts/_shared-config.mjs`의 `ADR_TRIGGER_PARTS` 해당 파일 변경은 구현 전에 Codex 계획 검증을 요청한다.
- 질문은 영어로 작성하고 마지막에 `Respond in Korean.`을 붙인다.
- Codex 응답은 `PASS`, `CHANGE_REQUEST`, `BLOCK` 중 하나로 해석한다.
- `CHANGE_REQUEST`: exec plan 수정 후 구현 진행.
- `BLOCK`: exec plan 재작성 후 Codex 재요청 필수. 재요청도 BLOCK이면 사용자에게 에스컬레이션 — 최종 판단은 사용자가 내린다.
- Hook: `.claude/hooks/check-codex-after-plan.mjs`가 active exec plan 작성/수정 후 이 단계를 제안한다.
- 결과는 exec plan의 `Codex 계획 검증` 섹션에 기록한다.
- 구조·라이브러리·정책 결정이 포함되면 exec plan의 `ADR 판단` 섹션에 필요 여부와 사유를 기록한다.

### 4. WORK — Claude Code 구현
- exec plan 단계 순서대로 진행, 각 단계 완료 시 체크박스 업데이트
- 한 번에 한 가지 관심사만 — 무관한 정리·리팩터 섞지 않는다
- 계획을 벗어나는 변경이 필요하면 코드 전에 plan부터 갱신

### 5. CODEX_FIRST_PASS — Codex 1차 검증 및 제한적 수정
- 구현 diff가 생기면 Codex에 1차 검증을 요청한다.
- Codex는 버그, 레이어 위반, 누락된 검증, 타입/엣지 케이스를 우선 확인한다.
- Codex가 직접 수정할 수 있는 범위는 명백한 버그, 타입 오류, 누락 guard, 테스트 실패 원인의 국소 수정까지다.
- 계획 변경, 새 라이브러리, 데이터 흐름 변경, 인증/캐시/배포 정책 변경은 Codex가 직접 수정하지 않고 Claude Code에 반환한다.
- Hook: `.claude/hooks/post-implementation-review.mjs`가 큰 diff 또는 위험 파일 변경 후 이 단계를 제안한다.
- 결과는 exec plan의 `Codex 1차 검증` 섹션에 기록한다.

### 6. VERIFY — Claude Code 2차 검증 및 증적 기록
- 필수 명령: `node scripts/verify-task.mjs <slug>`
- 수행 항목: ESLint + stylelint + build + knip
- 모든 결과는 `logs/<task-id>/<run-id>/`에 저장된다. `logs/`는 로컬 증적이며 커밋하지 않는다.
- 실패하면 원인을 해결하거나 기존 부채인지 `docs/tech-debt-tracker.md`와 대조한다. 원인 불명 또는 반복 실패 시 Codex 분석을 검토한다.
- Codex가 1차 수정한 경우 Claude Code는 diff를 다시 읽고 의도·범위·검증 결과를 교차 확인한다.
- 교차 확인 결과는 exec plan의 `Claude 2차 검증` 섹션에 기록한다.

### 7. COMMIT — 승인 후 커밋
- 커밋 전 pre-commit 훅이 변경 파일 lint와 최신 검증 기록을 확인한다.
- `VERIFY_ENFORCE=1` 환경에서는 검증 기록이 없거나 diff가 바뀌면 커밋이 차단된다.
- 머지/릴리스 전에는 `node scripts/harness-gate.mjs <slug>`로 검증 증적, Codex/Claude 검증 기록, ADR 판단을 강제 확인한다.
- `--no-verify`로 우회 금지
- **사용자 승인 후 커밋한다. 자동 커밋 금지.**
- prefix는 6개만: Feat · Fix · Style · Refactor · Docs · Chore
- 머지 후 `node scripts/complete-task.mjs <slug>`로 exec-plan을 `completed/`로 이동, 회고 작성
- PR 생성 시 `--assignee "@me"`와 `--label <name>` 은 **항상 필수** — 누락 시 GitHub Actions(`pr-required-fields`) 체크 실패로 머지 차단됨

## 에이전트 역할 분담

전략은 [ADR 0001](docs/decisions/0001-codex-orchestration-strategy.md) — 이 파일은 요약.

| 에이전트 | 책임 |
| --- | --- |
| **Claude Code** (이 에이전트) | 오케스트레이터, 초기 계획, 메인 구현, Codex 결과 통합, 2차 검증, 기록·커밋 책임 |
| **Codex** (`codex:rescue` 스킬) | 계획 검증, 깊은 추론, 설계 판단, 트레이드오프 분석, 막힌 디버깅, 구현 후 1차 검증, 제한적 수정 |

**Codex 위임 트리거** (다음 시점에 `codex:rescue` 호출 검토):
- 계획 작성 직후 — 구현 전 plan 품질 검증
- 설계 판단 — "어떤 구조·패턴이 적합한가"
- 트레이드오프 분석 — "A vs B, 어느 쪽?"
- 막힌 디버깅 — 원인 불명 또는 첫 수정 실패
- 구현 후 1차 검증 — 큰 diff, 고위험 파일, 레이어 변경, 검증 실패

**위임 안 함**: 단순 수정(typo·rename·한 줄), 표준 작업(commit·lint·build), 답이 명확한 코드.

## HOW (검증 루프)

```bash
yarn dev              # 개발 서버
node scripts/verify-task.mjs <task-id> # 커밋·머지 전 전체 검증 + logs/<task-id>/ 증적 기록
yarn build            # 빌드만
yarn lint             # ESLint (레이어 의존성 포함)
yarn lint:styles      # stylelint (SCSS 토큰·네이밍)
yarn generate:types   # DB 스키마 변경 후 타입 재생성
yarn knip             # 미사용 코드 검사
```

워크플로우 스크립트:

```bash
node scripts/start-task.mjs <slug>     # PLAN 시작 (exec-plan 생성)
node scripts/complete-task.mjs <slug>  # 머지 후 active → completed 이동
node scripts/harness-gate.mjs <slug>   # 머지/릴리스 전 하네스 게이트
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
- 외부 에이전트(Codex 등) 호출 시 **질의는 영어(정확도 확보), 응답은 한국어로 요청** — `codex:rescue`는 stdout을 verbatim 출력하므로 한국어 응답이 곧 사용자 보고가 된다. 위임 프롬프트 말미에 "Respond in Korean." 명시 필수.

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
| Codex CLI 진입점 | `AGENTS.md` | Codex 작업 시작 시 |
| Codex 컨텍스트 로더 | `.codex/skills/context-loader/` | 컨텍스트 라우팅 변경 시 |
| Claude Hook 자동 제안 | `.claude/hooks/` + `.claude/settings.json` | 협업 타이밍 변경 시 |
| 워크플로우 자동화 스크립트 | `scripts/` | 스크립트 추가/변경 시 |
| 작업별 how-to (자동 로딩) | `.claude/skills/{supabase,styles,file-structure}/` | 트리거 시 자동 |

스킬 트리거:

| 트리거                                         | 스킬                             |
| ---------------------------------------------- | -------------------------------- |
| Supabase 클라이언트, 캐싱, revalidateTag, 인증 | `.claude/skills/supabase/`       |
| SCSS 토큰, 믹스인, 시맨틱 토큰 매핑            | `.claude/skills/styles/`         |
| 새 파일 위치, 디렉토리 구조, barrel export     | `.claude/skills/file-structure/` |
| 하네스 워크플로우, PLAN Mode, task-id, exec-plan, Codex 검증, harness-gate | `.claude/skills/harness-workflow/` |

<!-- last-audit: 2026-05-01 -->

