---
name: harness-workflow
description: 기능 추가, 버그 수정, 리팩터링, 설계/정책 변경, PLAN Mode 시작, task-id/exec-plan/Codex 검증/verify-task/harness-gate 언급 시 이 저장소의 하네스 워크플로우를 적용할 때 사용
---

# 하네스 워크플로우

이 스킬은 작업을 `EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT` 순서로 진행하게 한다.

## 시작 판단

다음 중 하나면 이 스킬을 사용한다.

- 사용자가 기능 추가, 버그 수정, 리팩터링, 구조 변경을 요청한다.
- 사용자가 PLAN Mode, 계획부터, task-id, exec-plan, Codex 검증, verify-task, harness-gate를 언급한다.
- 변경이 여러 파일, 여러 단계, 레이어 경계, 라이브러리/정책, 검증 정책에 영향을 준다.

단순 typo, 한 줄 수정, rename은 PLAN을 생략할 수 있다. 그래도 EXPLORE와 VERIFY는 유지한다.

## 필수 로딩

먼저 다음을 읽는다.

1. `CLAUDE.md`
2. `docs/README.md`
3. 관련 코드
4. 작업 유형별 추가 skill
   - Supabase/cache/auth/action: `.claude/skills/supabase/SKILL.md`
   - SCSS/token/layout: `.claude/skills/styles/SKILL.md`
   - 파일 위치/구조: `.claude/skills/file-structure/SKILL.md`

## task-id

작업 시작 시 task-id를 확보한다.

- 사용자가 주면 그대로 사용한다.
- 없으면 짧은 영문 kebab-case task-id를 제안한다.
- slug 규칙: `^[a-z0-9][a-z0-9-]*$`

## 절차

### 1. EXPLORE

- 기존 코드, 문서, 패턴을 먼저 확인한다.
- 레이어 방향 `apis → services → actions → app`을 확인한다.
- 스타일 작업은 token/mixin 규칙을 확인한다.

**구현 의존 claim 직접 검증 (ADR 0010)** — claim이 있으면 다음을 먼저 SSOT로 확인 (audit/doc은 보조). 확인 결과는 exec-plan `## 검증된 Assumptions` 또는 `## 의사결정 로그`에 1줄 기록.

| claim 유형 | 검증 도구·명령 |
|---|---|
| DB 컬럼·테이블 존재 | `mcp__claude_ai_Supabase__list_tables` 또는 `execute_sql` (migrations와 drift 가능 — 원격 SSOT 우선). 예: phase 1-1에서 `is_featured` 부재 사전 발견 가능 |
| 타입 정의 (Database generated types) | `rg "컬럼명|타입명" src/types/database.types.ts` |
| 라우트·페이지 존재 | `Glob src/app/**/page.tsx` |
| SCSS 토큰·mixin 존재 | `rg "\\$token-name" src/styles/tokens/` 또는 `src/styles/_mixins.scss` |
| config flag·env 변수 | `rg "FLAG_NAME" next.config.ts eslint.config.mjs scripts/ src/lib/supabase/` (`.env.example` 없음 — actual env consumer로 grep) |
| wrapper 컨벤션 (`<Image>` vs `<CloudinaryImage>` 등) | `Grep src/app -l "from 'next/image'"` 0건이면 wrapper 컨벤션. `src/components/common/CloudinaryImage.tsx`가 유일한 직접 import 지점 |

**범위 규칙**:
- 영향 파일 surface only — 전수 검사 금지 (LOC 늘면 plan-text 모순 표현 CR 폭주 원인)
- 단순 변경(typo/rename/1줄) + 구현 의존 claim 없음 → EXPLORE 1–2분 종료 가능
- 다단계 작업이거나 DB/타입/라우트/토큰 의존 claim 있음 → 위 표대로 직접 검증 필수

### 2. PLAN

다단계 작업이면 실행한다.

```bash
node scripts/start-task.mjs <task-id>
```

생성된 `docs/exec-plans/active/<date>-<task-id>.md`에 목표, 접근법, 영향 파일, 체크리스트, DoD를 채운다.

### 3. CODEX_PLAN_REVIEW

구현 전 Codex 계획 검증을 요청한다. 질문은 영어로 작성하고 마지막에 `Respond in Korean.`을 붙인다.

Codex가 결론을 내기 전에 다음 5체크를 수행하도록 프롬프트에 포함한다.

1. 가정(Assumptions)이 명시되어 있는가?
2. 비목표(Non-goals)가 명시되어 있는가?
3. 변경 범위가 요청과 직접 연결되는가? (창발적 추가가 없는가)
4. 성공 기준(Success Criteria)과 검증 명령이 구체적인가?
5. 새 추상화·새 라이브러리·데이터 흐름 변경이 과한가? (없어야 정상)

#### CHANGE_REQUEST는 material implementation risk만 (ADR 0010)

5체크 미충족이라도 **구현 판단을 바꾸지 않는 plan-text 표현 모순·label 정합·문장 품질**은 CR 대상 아님. 대신 exec-plan `## 의사결정 로그`에 1줄 기록하고 WORK로 진입한다.

**must-CR (material — 구현/데이터/타입/레이어/사용자 영향)** — 다음 8 케이스는 반드시 CR.

1. DB column·table 부재로 데이터 흐름 실패 (예: phase 1-1의 `is_featured` BLOCK)
2. 타입 불일치로 type-check 실패 (예: `SermonListItem` vs `SermonWithRelations` 필드 누락)
3. 레이어 위반 (app → apis 직접 호출, services bypass)
4. 인증/캐시/배포 정책 변경 누락 (예: `createServerSideClient` vs `createStaticClient` 오용)
5. `## Non-goals`에 명시한 항목을 plan이 변경하려 함 (예: `[id]`→`[slug]` 시도)
6. user-visible acceptance criteria 위반 (SEO/UX 영향 metadata 포함, 예: title이 GNB 라벨과 불일치)
7. 검증 명령 부재·부적절 (SC가 "동작하게" 같은 약한 기준)
8. repo policy 위반 (token 하드코딩 / `<Image>` 직접 사용 / `--no-verify` / barrel 반사 등)

**expression-only (PASS_WITH_DECISION_LOG 처리)** — 다음 5 케이스는 CR 아님. 의사결정 로그 1줄 + WORK 진입.

1. 같은 정보를 N곳에 적어 미세 불일치 (예: "코드 변경 0" vs "1줄 변경" 표현 충돌)
2. label 표기 차이 ("신규" vs "교체", "이관" vs "분리")
3. 중복 설명·섹션 배치·비차단 명명 제안
4. 문장 품질 (이중부정·길이·어순)
5. SEO·라우팅 영향 없는 표기 오타 (의사결정 로그 내 typo)

**애매하면 material로 승격** (안전 쪽).

#### Codex 결론 토큰 (4종)

- `PASS` — 5체크 모두 충족. WORK 진행.
- `PASS_WITH_DECISION_LOG` — material risk 없음 + expression-only 지적 N건. exec-plan `## 의사결정 로그`에 각 1줄 추가 후 WORK 진행. **3차 자동 호출 금지** (재요청은 사용자 명시 승인 시만).
- `CHANGE_REQUEST` — must-CR 1건 이상. exec-plan 수정 후 WORK.
- `BLOCK` — 인증/캐시/배포/DB/데이터 손실/보안/컨텍스트 충돌. exec-plan 재작성 후 Codex 재요청 필수. 재요청도 BLOCK이면 사용자 에스컬레이션 — 최종 판단은 사용자.

`BLOCK` 기준은 본 cap 무관 유지 — material risk + 운영 영향 결합 시 항상 차단.

#### 호출 프롬프트 템플릿

```
Review the planning document at <path>. Apply the 5-check (Assumptions / Non-goals / scope linkage / Success Criteria + verification / new abstractions).

Classify each finding as:
- material — DB/type/layer/auth/cache/deploy/Non-goals violation/user-visible/policy (must-CR)
- expression-only — plan-text inconsistency, label, ordering, typo (decision-log only, NOT CR)

Concrete-records rule: every critique must include ≥2 of {real tool/rule/file/command, numeric or binary criterion, concrete verb+result, ≥1 example}. No abstract nouns like "보강 필요" / "정합" / "근거 약함".

Conclude with exactly one token: PASS / PASS_WITH_DECISION_LOG / CHANGE_REQUEST / BLOCK. Add confidence: low/medium/high.

Respond in Korean.
```

결과는 exec-plan의 `## Codex 계획 검증`에 기록한다 (verdict token + 풀이 1줄 + 핵심 지적).

### 4. WORK

- Claude Code가 구현한다.
- exec-plan 체크리스트를 진행하면서 갱신한다.
- 계획 밖 변경이 필요하면 먼저 exec-plan과 ADR 판단을 갱신한다.

### 5. CODEX_FIRST_PASS

구현 diff가 생기면 Codex 1차 검증을 요청한다.

Codex가 우선 확인할 항목:

- 버그·타입 오류·누락 guard·엣지 케이스
- 레이어 경계 위반
- **외과적 변경 (surgical changes)** — 변경된 각 파일이 현재 task와 직접 관련 있는가? 인접 코드 정리·포맷·이름 변경이 섞여 있는가? 이번 변경으로 생긴 unused import/변수만 제거되었고 기존 dead code는 보존되었는가? (인접 정리가 섞여 있으면 별도 작업 분리 요청)

Codex가 직접 수정 가능한 범위:

- 명백한 버그
- 타입 오류
- 누락 guard
- 검증 실패의 직접 원인인 국소 수정

Codex가 직접 수정하지 않고 Claude Code에 반환해야 하는 범위:

- 계획 변경
- 새 라이브러리
- 데이터 흐름 변경
- 인증/캐시/배포 정책 변경
- 여러 모듈 책임 경계 재설계
- 인접 코드 리팩터·포맷·이름 변경 등 외과적 변경 위반 (Claude Code가 별도 작업으로 처리)

결과는 exec-plan의 `## Codex 1차 검증`에 기록한다.

### 6. VERIFY

Claude Code가 2차 검증을 수행한다. 수행 항목: ESLint, stylelint, build, knip.

```bash
node scripts/verify-task.mjs <task-id>
```

결과는 `logs/<task-id>/<run-id>/`에 저장된다 (커밋 X — 로컬 증적).

실패 시 신규 회귀인지 기존 부채인지 `docs/tech-debt/active.md`와 대조한다. 원인 불명·반복 실패 시 Codex 분석 검토.

Codex가 1차 수정한 경우 Claude Code는 diff를 다시 읽고 의도·범위·검증 결과를 교차 확인한다. 결과는 exec-plan의 `## Claude 2차 검증`에 기록.

### 7. COMMIT / GATE

커밋 전 또는 merge/release 전에는 실행한다.

```bash
node scripts/harness-gate.mjs <task-id>
```

사용자 승인 없이 자동 커밋하지 않는다.

머지 후에는 실행한다.

```bash
node scripts/complete-task.mjs <task-id>
```

## 검증 결과 기록 규칙

`## Codex 계획 검증`, `## Codex 1차 검증`, `## Claude 2차 검증`의 결과를 exec-plan에 기록할 때 작성용 SSOT는 `.claude/skills/writing-style/SKILL.md`다. 본 SKILL은 검증 워크플로우 메타 정보만 담고, 표현 규칙(추상 표현 금지·구체화 4원소·Codex 결과 인용·나쁜/좋은 예·의사결정 로그 형식·한글 문장 규칙·검증 섹션 구조·검증 결과 표)은 모두 그쪽에 통합되어 있다.

본 규칙은 ADR 0008 메커니즘 2(Detection) 운영화의 일부다. memory `feedback_concrete_records`·`feedback_doc_decision_log_style`와 sync 유지. 규칙 위반은 Codex 1차 검증·Claude 2차 검증에서 차단 대상.

`## 검증 이력`은 별도 top-level 섹션이라 `sectionBody()`가 다음 `##`에서 끊긴다. 게이트 코드 변경 없이 동작한다.

## 커밋 메시지

commit subject·body 작성 규칙·PR 제목·산출 문서 가독성 체크리스트는 작성용 단일 SSOT인 `.claude/skills/writing-style/SKILL.md`를 참조한다. 본 SKILL은 검증 정책(R1~R4 hook 강제)만 워크플로우 메타로 보존.

### 검증

**Local `commit-msg` hook이 R1~R4 4개 deterministic 룰을 자동 강제** (2026-05-13~) — `scripts/check-commit-msg.mjs` + `.husky/commit-msg`. 위반 시 commit 차단(exit 1), `--no-verify` 명시 우회 허용. 관련 ADR: `docs/decisions/0009-commit-msg-hook-enforcement.md` (Accepted).

강제되는 룰:
- (R1) subject 정규식 `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$`
- (R2) subject 길이 80자 한도 (`.trimEnd()` 후)
- (R3) `Co-Authored-By:` trailer가 메시지 마지막 paragraph에 위치 (case-insensitive)
- (R4) subject `+` 2회 이상 차단 (다중 concern 분리 신호)

PR 리뷰에서 수동 확인하는 영역 (hook 검증 X):
- WHY/IMPACT 우선·추상명사 회피·외부 가독성 — heuristic 룰, 사람 리뷰 영역 (writing-style SKILL이 SSOT)
- PR 제목 — 별도 GitHub Actions task에서 도입 예정

## ADR 판단

다음 변경은 exec-plan의 `## ADR 판단`에 필요 여부와 사유를 기록한다.

- `package.json`, `next.config.*`, `eslint.config.*`, `stylelint.config.*`, `tsconfig.json`
- `src/apis/`, `src/services/`, `src/actions/`, `src/lib/supabase/`
- `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.codex/`, `scripts/`
- `docs/ARCHITECTURE.md`, `docs/references/constraints.md`

영구 결정이면 실행한다.

```bash
node scripts/start-adr.mjs <slug>
node scripts/update-adr-index.mjs
```

일회성 판단이면 `ADR 판단`에 `불필요`와 사유를 남긴다.

compact 템플릿(ADR 0010)의 frontmatter 1줄 필드를 쓸 때는 **`**ADR needed**: no — <한 줄 사유>`** 형식으로 inline 사유를 같이 적는다. ADR_TRIGGER_PARTS 파일이 diff에 포함된 경우 bare `no` 만으로는 `harness-gate`가 차단한다 (예: `**ADR needed**: no — scripts/ 오타 수정만 포함`).

## 최소 사용자 프롬프트 예시

```text
PLAN Mode로 <작업 내용> 진행해줘. task-id는 <slug>.
```

task-id가 없으면 먼저 제안하고 진행한다.
