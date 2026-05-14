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

실패 시 신규 회귀인지 기존 부채인지 `docs/tech-debt-tracker.md`와 대조한다. 원인 불명·반복 실패 시 Codex 분석 검토.

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

`## Codex 계획 검증`, `## Codex 1차 검증`, `## Claude 2차 검증`의 결과를 exec-plan에 기록할 때 다음 규칙을 적용한다 (ADR 0008 Decision 메커니즘 2 운영화). 본 규칙이 SSOT — `docs/exec-plans/_template.md`는 짧은 reference 섹션만 보유한다.

### 추상 표현 금지

기록은 PM·클라이언트가 별도 컨텍스트 없이 읽을 수 있어야 한다. 다음 패턴은 금지한다.

- 추상명사로 끝맺기 — `보강 필요`, `명시 필요`, `통합 필요`, `정합`, `근거 약함`, `커버리지 공백`
- 형용사 정성 표현 — `오탐 낮은`, `많은 부채`, `긴 함수`
- 도구·파일·명령 누락 — `lint 강화`, `타입 안전성 향상`

### 구체화 4원소

모든 비판·제안은 다음 4원소 중 최소 2개를 갖춰야 한다.

1. **실제 도구·규칙·파일·명령** — `eslint.config.mjs:37`, `@typescript-eslint/no-floating-promises`, `tsc --noEmit`
2. **수치 또는 binary 기준** — `위반 23건`, `오탐률 5% 이하`, `3개월 내 3회 이상`
3. **구체 동사 + 결과** — `Tier 정의에 "deterministic + 오탐률 5% 이하" 한 줄 추가`
4. **예시 1개 이상** — 비판 1개당 실제 코드/규칙/파일 예시 1개

### Codex 결과 인용

Codex stdout은 verbatim 인용 + 그 아래 평이 한국어 풀이 1줄 추가. PM이 전문어 그대로면 못 읽힌다.

### 나쁜 예 / 좋은 예

❌ 나쁨 (추상명사·도구 누락·예시 0):

```
Finding 1 — 3-tier 경계 보강 필요. 운영 기준 명시 필요.
```

✅ 좋음 (실제 규칙·구체 동사+결과·예시):

```
Finding 1 — Tier 1 후보에 자동수정 불가 규칙(`complexity`, `max-lines-per-function`)이 들어가 Tier 1/2 구분이 흔들림. 후속 작업자가 새 규칙(예: `unused-import`) 도입 시 어느 Tier인지 매번 토론 필요. → Tier 1 정의에 "deterministic(같은 코드 항상 같은 결과) + 오탐률 5% 이하" 운영 기준 한 줄 추가.
```

### 강제 출처

본 규칙은 ADR 0008 메커니즘 2(Detection) 운영화의 일부. memory `feedback_concrete_records`와 sync 유지. 규칙 위반은 Codex 1차 검증·Claude 2차 검증에서 차단 대상.

## 커밋 메시지

CLAUDE.md prefix 6개(`Feat·Fix·Style·Refactor·Docs·Chore`) + bullet 본문 + Co-Authored-By footer 규칙 위에, 다음 추가 규칙을 따른다.

### Subject 규칙

- **WHY/IMPACT 우선** — "X 채택/적용" 보다 "Y 문제 해소"를 선호. 메커니즘이 아니라 사용자/시스템 영향을 subject에 노출.
- **추상명사 회피** — "정합/통일/정정" 단독 사용 금지. 구체 Before→After 또는 숫자/경로 명시.
  - ❌ `Fix: 라우트 경로 정정`
  - ✅ `Fix: /news/bulletin → /news/bulletins (8건) + /about/directions → /about/location`
- **길이** — 권장 50자, 최대 80자 (한국어 char 기준).
- **외부 가독성 (코드 미열람자 1회 이해)** — subject와 body 모두 본 PR/저장소를 처음 보는 사람이 코드를 열지 않고도 "무엇이 어떻게 변했는지" 이해 가능해야 한다. 본 task 내부에서만 통하는 약어·축약(예: `메타 2 키`, `토큰 3종`, `9 영역`)은 본문에서 한 번 풀어쓰지 않으면 금지.
  - ❌ `Chore: Hero 메타 2 키 + 라우트 3 스켈레톤` — "메타", "키", "스켈레톤" 모두 코드 미열람자가 추측해야 함
  - ✅ `Chore: sermons 자식 페이지 2종 Hero 등록 + 신규 라우트 3종 스켈레톤 추가` — 어떤 페이지/Hero/라우트인지 표면화
  - body에서는 첫 등장 시 풀어 설명: "`hero.config.ts`의 `HERO_META` 객체에 `/sermons/all`·`/sermons/series` 두 엔트리(title/subtitle/eyebrow) 추가"처럼
- **Subject `+` 0회를 기본값으로 작성** — `+` 등장 자체가 다중 concern 신호이자 commit 분리 검토 트리거다. hook R4은 `+` 2회부터 차단하지만, **작성 단계에서 0회를 목표**로 한다. `+`를 쓰고 싶어지면 (a)/(b) 중 택1:
  - (a) **commit 분리** — 각 영역을 별도 commit으로. 기본 가정.
  - (b) **단일 의도 통일** — 모든 영역이 단일 상위 의도(예: "Phase 0 foundation prep") 하에 묶이는 경우, subject는 그 상위 의도 하나로 표현하고 본문 bullet에서 영역별로 풀어쓴다. 같은 파일·같은 모듈 변경 묶음은 `(N concerns 동일 파일)` 표기.

  (`/`·`,`는 URL 경로(`/sermons/all`)·자연어 열거에서 합법 등장하므로 분리 신호 대상이 아니다 — commit-msg-hook task Codex 1차 FLAG D 반영, hook R4 검사도 `+`만.)
  - ❌ `Chore: sermons Phase 0 — 9-영역 감사 + Carousel 공용 + 3 라우트 + Hero 메타 2 키` — subject `+` 3회 → commit 분리 신호로 오해. 약어 다발.
  - ✅ `Chore: sermons 섹션 Phase 0 foundation — Phase 1 진입 전 사전 준비 완료` + 본문 4 영역 bullet — 단일 의도 통일
  - ✅ `Fix: /news/bulletin → /news/bulletins (8건) + /about/directions → /about/location` — `/`는 URL 경로, `+`는 1회로 분리 신호 아님

### Body 4-line 가이드

```
<Prefix>: <subject>

- 왜: motivation (트리거/배경)
- 무엇: 핵심 변경 (파일 단위 또는 동작 단위)
- 영향: 호출부·사용자 변화, breaking 여부
- 제외: 의도적으로 안 한 것 (있을 때만)

Co-Authored-By: <실제 모델명> <noreply@anthropic.com>
```

라벨(`왜/무엇/영향/제외`)을 그대로 적지 않아도 OK. 핵심은 **WHY와 IMPACT가 본문에 노출**되어야 함.

### 출처 표기

QA / Codex / Gemini / 자체 발견 등 변경 트리거를 일관되게 표시한다.

- ✅ `Fix: <subject> (QA #6)` 또는 `(Codex P1 review)`
- ❌ 출처 없음 — self-initiated인지 외부 피드백인지 모호

### 좋은 예 / 나쁜 예

❌ 나쁨 (subject가 추상, body가 WHAT만 반복):

```
Refactor: ui/ named export 통일

- Modal/BottomSheet/Pagination을 default → named로 변경
- ui/index.ts barrel 갱신
```

✅ 좋음 (WHY 우선, 트레이드오프·제외 명시):

```
Refactor: ui/ 12 컴포넌트 export 패턴 통일 (3 outlier 정리)

- 왜: 9 named + 3 default 혼재 → 파일 열 때 인지 부하, grep/refactor 어려움
- 무엇: Modal/BottomSheet/Pagination을 named export로 변경, barrel re-export 3줄 갱신
- 영향: consumer 모두 barrel 경유라 import 형태 변화 0건 (grep 검증)
- 제외: `'use client'` 정리는 별도 tech-debt 항목 (#7)
```

### PR 제목

위 commit subject의 WHY/IMPACT 원칙을 PR 제목에도 동일 적용. **단 형식은 commit과 다름**:

- **형식**: `[Type] Title` — bracket(`[]`) + 공백 1개. `.github/PULL_REQUEST_TEMPLATE/*.md`에 명시된 컨벤션.
  - Type 6개는 commit prefix와 동일 (`Feat·Fix·Style·Refactor·Docs·Chore`).
  - commit은 `Fix: ...` (콜론), PR은 `[Fix] ...` (브래킷) — **혼동 금지**.
- **유추 가능성 우선** — 제목만 보고 PR 내용을 짐작할 수 있어야 함. 추상 라벨("v3/v4", "통일", "정합", "리팩터")만으로는 부족.
- **구체 동사 + 결과 명시** — "재설계", "도입", "DB 편집화", "차단", "해소" 같이 무엇을 어떻게 했는지 드러나는 동사 사용.
- **길이** — 권장 70자, GitHub UI 가시성 한도 80자 정도.
- **다중 영역 묶음 OK** — PR은 commit과 달리 본문이 별도 채워지므로 `+` 또는 `·`로 여러 영역을 잇는 게 자연스러움.

❌ 나쁨 (잘못된 형식 + 유추 불가):

```
Chore: develop → main 릴리스 v0.5.0 (2026-05-11)   ← Type 형식이 commit 스타일(콜론)
[Refactor] 디자인 시스템 v3/v4 통합                 ← 형식 OK지만 무슨 변경인지 유추 불가
```

✅ 좋음 ([Type] 형식 + 영역 + 동사 + 결과):

```
[Chore] v0.5.0 — 교회 소개 6 페이지 재설계(DB 편집화) + 디자인 토큰·공용 컴포넌트 통합
[Refactor] ui/ 12 컴포넌트 export 패턴 통일 (3 outlier 정리)
[Fix] release v0.5.0 QA 9건 — about/news 경로 + a11y + 공용 UI 정합
```

### 검증

**Local `commit-msg` hook이 R1~R4 4개 deterministic 룰을 자동 강제** (2026-05-13~) — `scripts/check-commit-msg.mjs` + `.husky/commit-msg`. 위반 시 commit 차단(exit 1), `--no-verify` 명시 우회 허용. 관련 ADR: `docs/decisions/0009-commit-msg-hook-enforcement.md` (Accepted).

강제되는 룰:
- (R1) subject 정규식 `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$`
- (R2) subject 길이 80자 한도 (`.trimEnd()` 후)
- (R3) `Co-Authored-By:` trailer가 메시지 마지막 paragraph에 위치 (case-insensitive)
- (R4) subject `+` 2회 이상 차단 (다중 concern 분리 신호)

PR 리뷰에서 수동 확인하는 영역 (hook 검증 X):
- WHY/IMPACT 우선·추상명사 회피·외부 가독성 — heuristic 룰, 사람 리뷰 영역
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
