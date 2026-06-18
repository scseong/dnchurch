# 대구동남교회 웹사이트

풀스택 Next.js 앱 — 교회 정보 / 주보 관리 / 성도 커뮤니티

> **이 파일은 지도다.** 작업 절차·규칙·금지 사항만 담는다. 상세 how-to는 `.claude/skills/`, 결정·계획·기술 부채는 `docs/`. 백과사전화 금지.

## WHAT

- **Stack**: Next.js (App Router), Supabase, SCSS Modules, Cloudinary, TypeScript
- **Route Groups**: `(content)/` — HeroSection + Breadcrumb 포함 (about, news, fellowship, sermons, community, next-gen, notifications, search)
- **레이어 서열** (ESLint 강제): `apis → services → actions → app`. 각 층은 왼쪽(하위)만 import하고 오른쪽(상위)은 참조하지 못한다. 순차 데이터 파이프라인이 아니다 — `services/`가 도메인 읽기·쓰기(RPC 뮤테이션 포함)를 함께 갖고, `actions/`는 검증·인증·캐시 갱신을 입힌 서버 뮤테이션 진입점, `apis/`는 인증·설정 등 횡단 쿼리다.

## 행동 가드레일 (LLM 공통 실수 방지)

> 모든 워크플로우 단계에 공통 적용. 트레이드오프: 속도보다 정확성 우선. 단순 변경은 자체 판단으로 생략 가능.

- **코딩 전 사고**: 가정과 모호성을 명시한다. 해석이 여럿이면 묻거나 채택한 해석을 exec-plan/응답에 기록한다 — 조용히 선택하지 않는다.
- **단순함 우선**: 작업을 만족하는 최소 변경을 선택한다. 추측성 추상화·옵션·"유연성"·요청 외 정리 금지. 200줄로 쓴 것이 50줄로 가능하면 다시 쓴다.
- **외과적 변경**: 변경된 모든 줄은 현재 작업으로 추적되어야 한다. 인접 코드·주석·포맷 "개선" 금지. 로컬 스타일을 따른다. 내 변경이 만든 unused import/변수만 제거하고, 기존 dead code는 발견 시 보고만 한다.
- **검증 가능한 목표**: 구현 전 성공 기준을 정의하고, 가장 좁은 신뢰 명령으로 먼저 검증한 뒤 `verify-task.mjs`로 마무리한다. "동작하게 만들어" 같은 약한 기준은 시작 전에 구체화한다.

## Workflow (필수 순서: EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT)

어느 단계도 건너뛰지 않는다. 단순 변경(typo, 한 줄 수정, rename)은 PLAN을 생략할 수 있으나 **EXPLORE/VERIFY/COMMIT은 항상 필수**.

### EXPLORE — 컨텍스트 수집

- 순서: `CLAUDE.md` → 작업 트리거에 맞는 skill(`.claude/skills/`) → 관련 코드
- 기능 추가·버그 수정·리팩터링·구조 변경·PLAN Mode·task-id·exec-plan·Codex 검증·verify-task·harness-gate 요청은 `.claude/skills/harness-workflow/`가 자동 로딩됨
- 의존 방향(`apis → services → actions → app`), 토큰/믹스인 사용 확인. 새 파일 전 비슷한 위치·네이밍 검색
- **컨텍스트 수집 없이 코드를 쓰지 않는다.**

### PLAN · CODEX_PLAN_REVIEW · WORK · CODEX_FIRST_PASS · VERIFY

상세 절차·5체크·외과적 변경 체크는 `.claude/skills/harness-workflow/SKILL.md`. 항상 알아야 할 트리거·명령:

- **PLAN**: `node scripts/start-task.mjs <slug>` → `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md`. 다단계 작업 필수
- **CODEX_PLAN_REVIEW** 트리거: 다단계 / 구조 변경 / `scripts/_shared-config.mjs`의 `ADR_TRIGGER_PARTS` 해당 파일. 결론 `PASS` / `CHANGE_REQUEST` / `BLOCK`. 재요청도 BLOCK이면 사용자 에스컬레이션
- **WORK**: 한 번에 한 관심사. 계획 벗어나면 plan부터 갱신
- **CODEX_FIRST_PASS**: 구현 diff 생성 시 Codex에 1차 검증 요청. 결과는 exec-plan `## Codex 1차 검증`에 기록
- **VERIFY**: `node scripts/verify-task.mjs <slug>` → `logs/<task-id>/<run-id>/` (커밋 X). 실패 시 `docs/tech-debt/active.md` 대조. Codex가 1차 수정했으면 diff 교차 확인 후 `## Claude 2차 검증`에 기록

### COMMIT — 승인 후 커밋
- 커밋 전 pre-commit 훅이 변경 파일 lint와 최신 검증 기록을 확인한다.
- `VERIFY_ENFORCE=1` 환경에서는 검증 기록이 없거나 diff가 바뀌면 커밋이 차단된다.
- 머지/릴리스 전에는 `node scripts/harness-gate.mjs <slug>`로 검증 증적, Codex/Claude 검증 기록, ADR 판단을 강제 확인한다.
- `--no-verify`로 우회 금지
- **한 commit = 한 의도. 작성 시작 전 분리한다** — 여러 의도가 묶이면 `git add`를 분리해 별도 commit. subject에 `+`가 떠오르는 순간이 분리 누락 신호 (commit-msg hook R4는 사후 안전망).
- **사용자 승인 후 커밋한다. 자동 커밋 금지.**
- prefix는 6개만: Feat · Fix · Style · Refactor · Docs · Chore
- 머지 후 `node scripts/complete-task.mjs <slug>`로 exec-plan을 `completed/`로 이동, 회고 작성
- PR 생성 시 `--assignee "@me"`와 `--label <name>` 은 **항상 필수** — 누락 시 GitHub Actions(`pr-required-fields`) 체크 실패로 머지 차단됨

### PR_REVIEW — 조건부 (COMMIT 이후)
- PR에 리뷰·CI 실패·인라인 코멘트가 달리고 **사용자가 대응을 요청하면** harness-workflow `### 8. PR_REVIEW`로 처리한다. 항상 도는 단계가 아니라 조건부 진입 — 최상단 워크플로우 문자열에 넣지 않는다.
- 루프: 수집 → 검증(코드 직접 확인, **relay 금지**) → 처리 → 답글. 답글은 자연 산문(고정 라벨 금지 — 지적 확인→근거→조치를 한 흐름으로), **게시 전 사용자 승인 필수**. 상세·명령 레시피는 `.claude/skills/harness-workflow/SKILL.md` `### 8`·`## PR 리뷰 명령`

## 에이전트 역할 분담

전략·역할 분담·위임 트리거 SSOT는 [ADR 0001](docs/decisions/0001-codex-orchestration-strategy.md). 이 파일은 요약, `.claude/agents/`는 실행용 정의(에이전트별 입출력 프로토콜·에러 핸들링·협업 매트릭스)로 ADR을 운영화한 파일이다 — 충돌 시 ADR 0001을 우선한다.

| 에이전트 | 정의 파일 | 책임 |
| --- | --- | --- |
| **claude-code** (이 에이전트) | `.claude/agents/claude-code.md` | 오케스트레이터, 초기 계획, 메인 구현, Codex 결과 통합, 2차 검증, 기록·커밋 책임 |
| **codex-reviewer** (`codex:rescue` 스킬) | `.claude/agents/codex-reviewer.md` | 계획 검증, 깊은 추론, 설계 판단, 트레이드오프 분석, 막힌 디버깅, 구현 후 1차 검증, 제한적 수정 |
| **explorer** (`Agent subagent_type: explorer`) | `.claude/agents/explorer.md` | 광역 코드 탐색 위임 래퍼 (3회 이상 검색 예상 / 대용량 결과 / 메인 컨텍스트 보호) |
| **doc-editor** (`Agent subagent_type: doc-editor`) | `.claude/agents/doc-editor.md` | exec-plan·ADR·검증 기록·tech-debt·Codex 인용 표현 점검 (직접 수정 X, file:line + 수정 초안 제안만) |
| **commit-pr-author** (`Agent subagent_type: commit-pr-author`) | `.claude/agents/commit-pr-author.md` | commit 메시지·PR 본문·메타데이터(label·assignee·template) 초안 (직접 실행 X, 사용자 승인 후 명령 실행) |

**Codex 위임 트리거** (다음 시점에 `codex:rescue` 호출 검토):
- 계획 작성 직후 — 구현 전 plan 품질 검증
- 설계 판단 — "어떤 구조·패턴이 적합한가"
- 트레이드오프 분석 — "A vs B, 어느 쪽?"
- 막힌 디버깅 — 원인 불명 또는 첫 수정 실패
- 구현 후 1차 검증 — 큰 diff, 고위험 파일, 레이어 변경, 검증 실패

**위임 안 함**: 단순 수정(typo·rename·한 줄), 표준 작업(commit·lint·build), 답이 명확한 코드.

### 하네스 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-05-01 | 초기 구성 (ADR 0001 채택) | docs/decisions/0001, .claude/hooks/, scripts/ | Codex 오케스트레이션 전략 도입 |
| 2026-05-28 | 에이전트 정의 파일 분리 | .claude/agents/ (claude-code, codex-reviewer, explorer) | `harness:harness` 메타 스킬 적용 — ADR 0001을 재사용 가능한 정의로 분리 |
| 2026-05-28 | 공통 writer 에이전트 2종 + doc-style hook 추가 | .claude/agents/ (doc-editor, commit-pr-author), .claude/hooks/check-doc-style.mjs | 1인 작업 자기 리뷰 사각지대 보완 — memory feedback 11건(커밋·PR 7 + 문서 4) 누적 패턴 사전 차단 |
| 2026-05-28 | writing-style SKILL 신설 (작성용 단일 SSOT) | .claude/skills/writing-style/, harness-workflow SKILL reference 1줄 | 작성 시점 표현 가이드 부재 해소 — 사후 점검만으로는 같은 위반 반복(본 task dogfood에서 plan 자체에 5건 위반 발견). description 트리거로 작성 시점 자동 로딩 |
| 2026-05-29 | PR 생성 시점 commit-pr-author 호출 의무화 + PreToolUse hook 신설 | .claude/hooks/check-pr-before-create.mjs, .claude/settings.json PreToolUse 블록, claude-code.md, harness-workflow SKILL | gh pr create 시점은 PostToolUse hook 사각지대 — 결정적 reminder + 워크플로우 의무 + COMMIT 단계 명시 3 계층 방어 |
| 2026-06-15 | PR 리뷰 대응을 표준 절차로 명문화 (`### 8. PR_REVIEW` 조건부 단계) | harness-workflow SKILL (§ 8 + `## PR 리뷰 명령`), CLAUDE.md (Workflow 포인터 + 본 표) | PR #118·#119 수동 대응에서 봇 오탐 2건을 코드 미확인 중계로 놓칠 뻔함 — 코드 확인 근거·중계 금지 hard rule로 검증 규율 고정 (hook·스크립트·ADR 없이 문서만) |
| 2026-06-18 | 레이어 설명을 import 서열 + `services` 읽기·쓰기 공존으로 정정, `revalidateTag`→`updateTag` 드리프트 정정, 스킬 표에 `complete-task` 반영, audit 마커 갱신 | CLAUDE.md, docs/ARCHITECTURE.md, .claude/skills/supabase/SKILL.md, README.md | 포트폴리오 점검 중 `services`를 읽기 전용처럼 읽히게 한 표현·코드와 안 맞는 API 이름·표 누락 발견 (Codex 계획 검증 PASS_WITH_DECISION_LOG) |

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
- 모든 산출물은 자연스러운 한국어로 쓴다. 번역투와 외래어 직역을 뺀다.
- AI 상투구·한자어 `-化` 어미(정합화·단일화·직관화)·무생물 주어+사람 동사·추상명사 끝맺음을 쓰지 않는다. 한 문장은 한 가지만 담고 서술어로 끝낸다. 치환표·구조 6항목 체크리스트는 `.claude/skills/writing-style/SKILL.md` '산출 문서 가독성 체크리스트'를 참조한다 (단일 SSOT).

## ⚠️ Gotchas

- 브라우저 클라이언트는 `getSupabaseBrowserClient()` 사용 (구 `supabase` named export는 제거됨)
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
| 기술 부채·마이그레이션 (활성·해결) | `docs/tech-debt/active.md`, `docs/tech-debt/resolved.md` (인덱스: `docs/tech-debt-tracker.md`) | 발견 즉시 |
| 자동 생성 (DB 스키마 등) — **수정 금지** | `docs/generated/` | 스크립트 실행 시만 |
| 외부 라이브러리 참조 (llms.txt) | `docs/references/` | 라이브러리 업데이트 시 |
| 작업별 외부 자료 발췌 (일회성) | `docs/research/` | EXEC_PLAN 진행 중 |
| Codex CLI 진입점 | `AGENTS.md` | Codex 작업 시작 시 |
| Codex 컨텍스트 로더 | `.codex/skills/context-loader/` | 컨텍스트 라우팅 변경 시 |
| Claude Hook 자동 제안 | `.claude/hooks/` + `.claude/settings.json` | 협업 타이밍 변경 시 |
| 워크플로우 자동화 스크립트 | `scripts/` | 스크립트 추가/변경 시 |
| 작업별 how-to (자동 로딩) | `.claude/skills/{supabase,styles,file-structure,ui-components,writing-style,complete-task}/` | 트리거 시 자동 |
| **작성용 SSOT** (한국어 표현·커밋·PR·exec-plan·ADR·tech-debt 템플릿) | `.claude/skills/writing-style/SKILL.md` | 모든 문서·메시지 작성 시 자동 로딩 |

스킬 트리거:

| 트리거                                         | 스킬                             |
| ---------------------------------------------- | -------------------------------- |
| Supabase 클라이언트, 캐싱, updateTag, 인증 | `.claude/skills/supabase/`       |
| SCSS 토큰, 믹스인, 시맨틱 토큰 매핑            | `.claude/skills/styles/`         |
| 새 파일 위치, 디렉토리 구조, barrel export     | `.claude/skills/file-structure/` |
| Button·TextField·Modal·BottomSheet·Tabs 등 공용 UI 사용·확장·신규 추가 | `.claude/skills/ui-components/` |
| 하네스 워크플로우, PLAN Mode, task-id, exec-plan, Codex 검증, harness-gate | `.claude/skills/harness-workflow/` |
| 문서·메시지 작성 (exec-plan, ADR, tech-debt, 검증 기록, commit, PR, Codex 인용) | `.claude/skills/writing-style/` |
| 작업 완료, PR 머지 후, exec-plan completed 이관, 회고, tech-debt 등록 | `.claude/skills/complete-task/` |

<!-- last-audit: 2026-06-18 -->

