# PR 본문을 코드 대신 의도부터 읽게 바꾸기

- **상태**: ✅ 완료 (2026-07-22)
- **시작일**: 2026-07-21
- **브랜치**: docs/pr-intent-first-docs
- **Open questions**: none
- **ADR needed**: yes — PR 문서 정책 변경 (유형별 템플릿 5종 폐기)

## 목표

두 가지를 한다. 하나, PR 본문을 `문제 · 접근 · 변경 범위 · 검증 · 남은 위험` 5섹션 하나로 통일해 리뷰어가 수천 줄 diff 대신 이 작업을 만든 생각부터 읽게 만든다. 둘, plan-first 워크플로우의 세 검증 게이트(계획 검증·Codex 1차·Claude 2차)를 위험도에 맞게 재편해 사소한 변경에 Codex를 세 번 부르던 병목을 없애고, Codex가 멈췄을 때의 신뢰성 구멍을 막는다.

세 게이트를 다시 본 근거는 `## 게이트 재설계` 섹션에 있다. 요지: 계획 검증만 고유 가치가 크고, Codex 1차는 절반이 verify-task와 겹치며, Claude 2차는 verify-task 결과 기록이 사실상 전부다.

## 검증된 Assumptions

- 유형별 템플릿은 5종 + 루트 1종 + README = 7파일. `ls .github/PULL_REQUEST_TEMPLATE/`로 확인 (feature·bugfix·refactor·maintenance·release·README).
- 각 템플릿 분량은 88~142줄. `wc -l .github/PULL_REQUEST_TEMPLATE*/*.md`로 확인.
- EXPLORE 시점의 `harness-gate.mjs`는 `Codex 계획 검증`·`Codex 1차 검증`·`Claude 2차 검증` 3개 섹션 verdict 토큰을 획일로 강제했다 (`scripts/harness-gate.mjs:8-18`). 처음엔 게이트를 그대로 두려 했으나, 세 검증의 비용·중복을 조사한 뒤 tier 재편으로 바꿨다 — D10 참조.
- GitHub Actions `pr-required-fields`가 검사하는 것은 assignee·label 둘뿐이다 (`.github/workflows/pr-required-fields.yml:22-23`). 본문 형식은 검사하지 않으므로 템플릿 교체가 CI를 깨지 않는다.
- `commit-pr-author`의 PR base 분기 근거가 `.github/PULL_REQUEST_TEMPLATE/release.md:6`에 걸려 있다 (`.claude/agents/commit-pr-author.md:35`). 파일을 지우면 이 근거가 끊기므로 판단 기준을 바꿔야 한다.
- `ADR_TRIGGER_PARTS`에 `.github/PULL_REQUEST_TEMPLATE/`·`.github/PULL_REQUEST_TEMPLATE.md`·`CLAUDE.md`·`scripts/`가 들어 있다 (`scripts/_shared-config.mjs:20-29`). ADR 판단이 필요하다.

## Non-goals

- exec-plan을 PR 본문과 한 문서로 합치기. 사용자가 분리 유지를 선택했다.
- 이미 머지된 과거 PR 본문 소급 수정.
- `docs/exec-plans/completed/`·`active/` 기존 계획 문서의 본문 수정.
- 계획 검증(게이트 ①) 자체를 없애기. plan-first의 핵심이라 유지한다. tier에 따라 요구 여부만 달라진다.

> ⚠️ 정정(2026-07-21): 처음엔 "`harness-gate.mjs` 로직 변경"을 Non-goal로 뒀으나(사용자가 게이트 유지 선택), 세 게이트의 비용·중복·신뢰성을 조사한 뒤 사용자가 재편을 결정했다. 게이트 로직 변경을 범위에 넣는다 — D10 참조.

## Success Criteria

- `.github/PULL_REQUEST_TEMPLATE/`에 `release.md` 하나만 남고 나머지 5파일(feature·bugfix·refactor·maintenance·README)이 없다.
- 새 템플릿이 `## 1. 문제`부터 `## 5. 남은 위험`까지 5섹션을 순서대로 담는다.
- 삭제하는 5파일에서 살리기로 한 항목이 새 템플릿에 자리를 갖는다. 확인 대상은 tech-debt 링크, `Issue: #`, 근본 원인, 재현 절차, 의사결정 4열 표, 변경 전후 구조 Mermaid 블록, 스크린샷 표, 사이드 이펙트, 롤백 가능 여부 3지선다와 데이터 영향 — 9개 모두 새 템플릿에서 grep으로 잡힌다.
- 하네스 검증 표가 새 템플릿에 없다. `verify-task` 요약 줄도 없다. 검증 증적은 헤더의 exec-plan 링크로만 닿는다.
- 아래 명령 결과가 0건이다. `--hidden`이 있어야 dot 디렉토리인 `.claude/`가 검색되고, `docs/exec-plans/**` 제외가 있어야 본 계획서 자신이 잡히지 않는다. `release.md`는 남기므로 패턴에서 뺀다 — 그 참조는 위반이 아니다.
  ```bash
  rg --hidden "bugfix\.md|feature\.md|refactor\.md|maintenance\.md" \
    --glob '!docs/exec-plans/**' --glob '!.git/**'
  ```
- `commit-pr-author`의 PR base 판단이 파일 존재가 아닌 병합 방향으로 바뀐다. 규칙은 둘 중 하나로만 갈린다 — compare 브랜치가 `develop`이고 대상이 `main`이면 base는 `main`, 그 밖의 모든 PR은 base가 `develop`. template은 언제나 `.github/PULL_REQUEST_TEMPLATE.md` 하나다.
- `docs/exec-plans/_template.md`가 검증 섹션에서 `Claude 2차 검증`을 없애고 `Codex 계획 검증`·`Codex 1차 검증` 2개만 갖는다. verify 결과는 `Verification` 섹션에 기록한다.

**게이트 재설계 (A·B·C)**

- (A) `harness-gate.mjs`가 `Claude 2차 검증` 섹션을 더는 요구하지 않는다. `VERDICT_BY_SECTION`에서 제거하고, verify-task manifest(`assertVerification`)가 lint·build 기록을 담당한다.
- (B) `harness-gate.mjs`가 변경 규모로 tier를 판정하고 tier별로 요구 섹션이 다르다. Tier 0은 verdict 섹션 0개, Tier 1은 계획 검증만, Tier 2는 계획 검증 + Codex 1차. tier 판정과 요구 섹션을 한눈에 보여주는 fixture 3개가 `tests/harness/`에서 각각 통과·차단을 시연한다.
- (C) Codex가 hang·실패로 안 돌 때 쓸 fallback verdict가 SKILL에 한 줄로 정의된다 — `PASS` 위조가 아니라 `CODEX_UNAVAILABLE — <Claude 직접 검증 근거>` 형식. harness-gate가 이 토큰을 tier 2에서 허용하되 근거 30자를 강제한다.
- `node scripts/harness-gate.mjs pr-intent-first-docs`가 재설계 후에도 통과한다 (본 작업 자체가 tier 2 — scripts·CLAUDE.md·ADR 변경).
- `node scripts/verify-task.mjs pr-intent-first-docs`가 PASS한다.

## 게이트 재설계

세 게이트를 조사한 결과와 tier 규칙. 조사 근거는 D10, Codex 검토는 `## Codex 계획 검증`.

**게이트별 고유 가치 (제 조사 + Codex 합의)**

| 게이트 | 고유하게 잡는 것 | verify-task와 중복 | 결정 |
| --- | --- | --- | --- |
| ① 계획 검증 | 범위·Non-goals·성공 기준 위반 (verify-task는 계획 문서를 안 읽음) | 없음 | tier 1+에서 유지 |
| ② Codex 1차 | 외과적 변경 위반 (task 무관 정리·rename 섞임) | 타입·레이어 = ESLint+build가 잡음 (6개 중 2개) | tier 2에서만 |
| ③ Claude 2차 | Codex가 ②에서 고친 경우에만 교차확인 | 그 외엔 verify-task 결과 기록이 전부 | Verification에 병합 |

**tier 판정 규칙** (Codex 계획 검증 CR 6건 반영 후) — `harness-gate.mjs`가 변경 파일에서 계산한다.

| tier | 조건 | 요구 verdict 섹션 |
| --- | --- | --- |
| 0 (사소) | ADR-trigger 미적중 · **`src/` 경로 없음** · 파일 ≤2 · LOC ≤20 | 없음 (verify 기록만) |
| 1 (보통) | ADR-trigger 미적중 · 위 초과 · 파일 ≤5 · LOC ≤100 | 계획 검증 |
| 2 (고위험) | ADR_TRIGGER_PARTS 적중 · 또는 파일 >5 · 또는 LOC >100 · 또는 binary | 계획 검증 + Codex 1차 |

Codex CR 반영:

- **(CR1) Tier 0에서 `src/` 제외.** `ADR_TRIGGER_PARTS`에 `src/app/`이 없어(`scripts/_shared-config.mjs` 확인), 원안은 `src/app/*.tsx` 로직 변경을 무검토로 흘렸다. Tier 0 조건에 "`src/` 경로 파일 0개"를 더한다 — 코드 변경은 최소 Tier 1이라 계획 검증을 받는다.
- **(CR2) tier를 plan 탐색보다 먼저 계산.** 지금은 `findActivePlan`이 먼저 돌아 plan 없으면 실패한다(`harness-gate.mjs:242`). 새 흐름: task-id로 diff부터 계산 → tier 산출 → active plan은 tier 1+에서만 필수 → Tier 0 + plan 없음이면 verdict 섹션 건너뛰고 `assertVerification`만 확인.
- **(CR3) diff 단일 소스 + binary·untracked 정책.** 작업트리와 staged를 따로 더하면 이중 카운트된다. `git diff <merge-base> --numstat` 하나로 센다 — base는 `origin/develop → develop → origin/main → main` 순으로 resolve하고, 어느 것도 없으면 fail-closed(gate 차단). binary(`-`)는 hasBinary → Tier 2. deletion은 add+del 합산. untracked는 파일 수·LOC에 포함하되 읽기 실패는 fail-closed.
- **(CR4) `CODEX_UNAVAILABLE` 남용 억제.** `Codex 계획 검증`은 이 토큰을 아예 허용하지 않는다 — plan-first의 핵심이라 건너뛸 수 없다. `Codex 1차 검증`에서만 허용하고 `오류: / 시도: / Claude 확인:` 3필드를 정규식으로 요구한다. 이는 위조 PASS와 구분되게 하는 deterrent이지 암호적 차단은 아니다(라벨을 무관 텍스트에 심으면 형식은 통과) — 사람·리뷰어가 plan에서 보고 판단한다.
- **(CR5) ADR 0010 개정 명시.** 0010은 "verdict 3섹션"을 기본으로 명시한다(`0010:28,30,37`). 신규 ADR이 0010을 amend/supersede함을 밝히고 0010에 역참조를 넣는다. tier 2(파일>5·LOC>100)는 0010의 STRICT_REVIEW(파일≥20·LOC≥500) 하위 계층으로 nest — 층위가 다르다(전자는 "게이트 ② 요구", 후자는 "full 리뷰 승격").
- **(CR6) 게이트 밖 소비자도 갱신.** `complete-task.mjs:132-153`이 세 섹션을 파싱한다(확인). `Claude 2차 검증` 제거 시 여기도 고쳐야 "섹션 없음" 오탐이 안 난다. `harness-workflow/SKILL.md:144-184`도 검증 기록 요구를 tier에 맞춘다.

**적용 범위 명확화 (CR6):** 이 tier 게이트는 **머지/릴리스 게이트**(`harness-gate` 수동 실행)에만 적용한다. 커밋 게이트(`.husky/pre-commit` → `enforce-verification`, warn-only)는 안 바꾼다. "커밋·머지를 막는다"던 표현을 "머지 전 게이트"로 좁힌다.

## 접근법

리뷰 진입점을 코드에서 의도로 옮긴다. 템플릿을 유형별로 나눴던 이유는 유형마다 강조점이 다르다는 것이었는데, 실제로는 5종 모두 `개요 → 배경 → 변경점 → 의사결정 → 검증 → 체크리스트 → 확인 포인트` 골격을 공유하고 세부 항목만 달랐다. 유형 차이는 같은 5섹션 안에서 무엇을 적느냐로 흡수된다 — 버그면 1번에 재현 조건이 들어가고, 릴리스면 3번에 묶인 PR 목록이 들어간다. 그래서 파일을 나누는 대신 하나로 합치고 섹션별 안내 주석으로 유형 차이를 처리한다.

## 영향받는 파일

**템플릿 (핵심 3건)**

- `.github/PULL_REQUEST_TEMPLATE.md` — 5섹션으로 재작성
- `.github/PULL_REQUEST_TEMPLATE/` — 5파일 삭제 (feature·bugfix·refactor·maintenance·README). `release.md`는 남긴다
- `docs/exec-plans/_template.md` — 하단 안내 주석 33줄을 포인터로 축약

**참조 갱신 (8건)**

- `.claude/skills/writing-style/SKILL.md` — PR 메타데이터의 template 매핑, 릴리스 PR 쓰는 법
- `.claude/agents/commit-pr-author.md` — template 매핑 표, base 분기 근거
- `.claude/skills/harness-workflow/SKILL.md` — PR 생성 순서, PR 리뷰 읽는 순서
- `.claude/skills/complete-task/SKILL.md` — 회고 PR 본문 형식 참조
- `.claude/hooks/check-pr-before-create.mjs` — reminder 문구
- `README.md` — prefix별 템플릿 안내
- `CLAUDE.md` — 하네스 변경 이력 1행
- `scripts/_shared-config.mjs` — 삭제된 디렉토리 경로

**게이트 재설계 (A·B·C)**

- `scripts/harness-gate.mjs` — `Claude 2차 검증` 요구 제거(A), tier 판정 로직 신설(B), `CODEX_UNAVAILABLE` 토큰 허용(C)
- `docs/exec-plans/_template.md` — `Claude 2차 검증` 섹션 제거, verify 결과는 `Verification`으로
- `scripts/complete-task.mjs` — 세 섹션 파싱(`:132-153`)을 tier에 맞춰 수정 (CR6, `Claude 2차 검증` 제거 시 오탐 방지)
- `tests/harness/` — fixture 3개 (tier 0 통과 / tier 2 계획+1차 요구 / Codex 미가동 fallback)
- `.claude/skills/harness-workflow/SKILL.md` — tier 규칙·fallback verdict 반영 (참조 갱신과 겹침)

**기록 (2건)**

- `docs/decisions/<번호>-pr-intent-first-template.md` — 신규 ADR (PR 템플릿 통합 + 게이트 tier 재편, ADR 0010과의 관계 명시)
- memory `feedback_pr_templates` — prefix별 템플릿 규칙 폐기 반영

## 단계별 체크리스트

- [x] 1. PR 템플릿 교체 — 5섹션 본문 작성(82줄), 5파일 삭제 (feature·bugfix·refactor·maintenance·README), release.md 존치
- [x] 2. exec-plan `_template.md` 축약 — 검증 3섹션 3-bullet→1줄, 하단 주석 33줄→포인터 4줄 (118→85줄). 게이트 통과·placeholder 차단 실측 확인
- [x] 3. 게이트 재설계 설계 확정 + Codex 계획 검증 — CHANGE_REQUEST 6건 전부 반영 (D11)
- [x] 4. 게이트 재설계 구현 — (A) Claude 2차 제거 · (B) tier 판정 · (C) CODEX_UNAVAILABLE + fixture 3개. sectionBody 버그도 수정(D12). fixture 6경로 + 실제 게이트 tier 판정 실측
- [x] 5. 참조 sweep — 하네스 전체(skill·hook·agent·root·tests) 약 17파일. 삭제 템플릿 매핑 0건, Claude 2차 유효 언급 0건 확인. 두 hook의 sectionBody도 anchor 수정(D12 확대). caveat 2건 반영. fixture 8경로 재검증
- [x] 6. ADR 0023 작성(PR 통합 + tier 재편) + 0008·0010 역참조(개정 명시) + ADR 인덱스 갱신 + memory `feedback_pr_templates` 갱신
- [x] 7. doc-editor 점검(medium 3건 반영) → verify-task PASS → harness-gate 통과 → 커밋 분리 후 사용자 승인 → PR #155
- [x] 8. 가독성 게이트 신설 — `scripts/check-readability.mjs`(warn-only), pre-commit 배선, fixture 3검사, writing-style SKILL 규칙+예시, ADR 0023 반영, PR #155 본문 재작성(linter 통과). frontmatter 오탐 1건 수정. SKILL·exec-plan 기존 밀도 경고는 warn-only 부채로 남김

## Verification

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 최종 | 20260721-214114 | ✅ | ✅ | ✅ | 0 | 없음 |

- `node scripts/verify-task.mjs pr-intent-first-docs` — PASS (ESLint·stylelint·build 통과, Knip 경고는 기존 부채). 새 워크트리라 node_modules·`.env*`를 메인 체크아웃에서 채운 뒤 실행.
- `rg --hidden "bugfix\.md|feature\.md|refactor\.md|maintenance\.md" --glob '!docs/exec-plans/**' --glob '!.git/**'` — 0건 확인.
- `rg --hidden "release\.md" --glob '!docs/exec-plans/**' --glob '!.git/**'` — 남은 참조가 전부 `.github/PULL_REQUEST_TEMPLATE/release.md`를 가리키는지 눈으로 확인.
- harness-gate fixture 8경로 + 실제 task Tier 2 판정 실측.
- `node scripts/harness-gate.mjs pr-intent-first-docs` — verdict 섹션·ADR 판단·verify 기록 모두 통과 확인.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high) — 게이트 재설계 설계 대상 계획 검증
- **현재 판단**: 게이트 재설계 설계를 코드 손대기 전에 검증받았다. Codex가 material 6건을 짚었고 전부 반영했다 — 각 지적과 조치는 아래 D11에 CR1~CR6으로 나눠 적었다. PR 템플릿 관련 앞선 검증 이력은 `## 검증 이력` 참조.
- **다음 행동**: 4단계 게이트 구현 (A→B→C + fixture)

Codex 지적 원문 (verbatim):

> **Scope linkage** — [material] `commit-pr-author`의 release PR base 판단 규칙이 아직 새 기준으로 닫히지 않았습니다. 현재 `.claude/agents/commit-pr-author.md:14,35,106,118,138,149`는 `template=release.md → main / 그 외 develop`에 의존하고, `.github/PULL_REQUEST_TEMPLATE/release.md:6-7`은 `Base main`, `Compare develop`를 제공합니다. 계획서 `:19`와 `:53`은 이 근거가 끊긴다고만 말하고, 삭제 후의 binary rule을 쓰지 않습니다.
>
> **Success Criteria + verification** — [material] dangling reference 검증 명령이 자기 자신을 매칭해서 `0건` 기준을 통과할 수 없습니다. 계획서 `:33`과 `:77`은 `rg "bugfix\.md|feature\.md|refactor\.md|maintenance\.md|release\.md" --glob '!docs/exec-plans/completed/**'` 결과 `0건`을 요구하지만, active plan 자체의 `:15`, `:19`, `:33`, `:77`이 같은 문자열을 포함합니다.
>
> **Assumptions** — [expression-only] 계획서의 줄 수 전제가 실제 파일과 맞지 않습니다. `:16`은 `wc -l` 기준 `88~142줄`이라고 쓰지만, 실제 측정 결과는 `bugfix.md 89`, `feature.md 90`, `maintenance.md 56`, `README.md 49`, `refactor.md 87`, `release.md 87`입니다.

풀이: 앞의 두 건은 계획이 실제로 덜 닫혀 있던 부분이라 고쳤다. 세 번째는 Codex가 빈 줄을 뺀 수치를 `wc -l` 결과로 착각한 것이라 계획서를 그대로 뒀다.

## Codex 1차 검증

- **결론**: FIX_APPLIED — Codex가 `resolveBaseRef`의 fail-open 구멍을 직접 고쳤고(base 못 찾으면 `HEAD` fallback → `fail()` 차단, numstat·ls-files 실패도 차단), Claude가 diff를 다시 읽어 수정이 정확·외과적임을 확인했다. 나머지 지적은 문서 모순(PR 템플릿·본 plan의 Claude 2차 잔존)으로 반영 완료, ADR은 6단계.

Codex가 고친 것 (교차 검증 완료):

- `scripts/harness-gate.mjs:227-239` — base ref를 못 찾으면 `HEAD`로 fallback해 커밋 완료 브랜치가 빈 diff → Tier 0 → 검증 전부 skip되던 fail-open. `fail()`로 차단하게 바꿈. 나(Claude)도 코드를 읽어 확인.
- `scripts/harness-gate.mjs:250-274` — `git diff --numstat`·`git ls-files` 실패를 빈 diff처럼 넘기던 것을 `fail()` 차단으로. fixture 8경로·실제 task Tier 2 판정 재검증 통과.

Codex가 반환한 것 (Claude 처리):

- 문서 모순 — PR 템플릿 comment·본 plan의 `## Claude 2차 검증` 잔존 → 제거. Verification 섹션의 `git diff HEAD` 표기를 merge-base로 정정.
- CODEX_UNAVAILABLE 3필드 정규식은 위조 억제책이지 암호적 차단이 아니다 — 사람·리뷰어가 plan에서 보고 판단하는 deterrent로 수용.

8단계 가독성 게이트(D14)는 별도 Codex 라운드 없이 dogfooding으로 검증했다. warn-only라 버그가 나도 경고가 잘못 뜰 뿐 게이트를 깨지 않아 위험이 낮다. 검증: fixture 3검사(문장 가운뎃점·셀 길이·셀 구분자) 각 발화, 재작성한 PR 본문이 자기 게이트 통과, frontmatter 오탐 1건을 실측으로 찾아 수정.

## 검증 이력

<details>
<summary>2026-07-21 doc-editor 표현 점검 (커밋 전)</summary>

- 판정: medium 3건 (ADR 0023은 위반 없음)
- 이유: D11 해결에 CR 6건 run-on 압축, 결론 "3차" 불명확 지시어, 현재 판단에 6건 `·` 나열 중복
- 조치: D11을 CR1~CR6 하위 bullet로 분리, "3차"→"게이트 재설계 대상 계획 검증", 6건 나열→"D11 참조"

</details>

<details>
<summary>2026-07-21 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST (confidence: high)
- 이유: base 분기 대체 규칙 미기재 + dangling 검증 명령이 자기 자신을 매칭
- 조치: Success Criteria에 base 판단 규칙과 `--hidden` 붙인 검색 명령 추가, D1·D2·D3 기록

</details>

<details>
<summary>2026-07-21 Codex 교차검증 2차 (정보 손실 감사 대상)</summary>

- 판정: CHANGE_REQUEST (confidence: high)
- 이유: 갈 곳 없는 항목 3개(QA 후속·먼저 볼 화면·검증 문제 해결 이력)와 README 삭제로 생기는 템플릿 선택 안내 공백
- 조치: D7 기록, 3번·4번·5번에 자리 추가, README 내용은 3단계에서 writing-style SKILL로 옮김

</details>

## 의사결정 로그

- **D1 — PR base는 파일 이름이 아니라 병합 방향으로 판단한다**
  - 문제: `commit-pr-author`가 `template=release.md`인지로 base를 `main`과 `develop` 중에 골랐다 (`.claude/agents/commit-pr-author.md:35`). 템플릿 5종을 지우면 이 판단 근거가 사라진다.
  - 해결: 판단 기준을 병합 방향으로 옮긴다. compare가 `develop`이고 대상이 `main`이면 base는 `main`, 나머지는 전부 `develop`. 템플릿 파일에 기준을 얹어두면 문서 구조를 바꿀 때마다 규칙이 같이 깨지는데, 병합 방향은 PR의 성질 자체라 문서 개편과 무관하게 유지된다.
  - 결과: 릴리스 PR 판별이 템플릿 파일 존재와 분리됐다. memory `feedback_pr_base_branch`(base는 항상 develop)와도 어긋나지 않는다 — 릴리스만 예외라는 뜻이 그대로 살아 있다.

- **D2 — dangling 참조 검색에 `--hidden`을 넣는다**
  - 문제: `rg`는 dot으로 시작하는 디렉토리를 기본으로 건너뛴다. 원래 적어둔 검증 명령으로는 `.claude/` 전체가 검색 대상에서 빠져, 실제로는 `commit-pr-author.md` 8곳·`writing-style/SKILL.md` 1곳·`complete-task/SKILL.md` 1곳이 남아 있는데도 0건으로 통과했다.
  - 해결: `--hidden`을 붙이고 `docs/exec-plans/**`와 `.git/**`을 제외했다. 고친 명령으로 다시 돌리자 살아 있는 참조 5파일(`commit-pr-author.md` 8건, `writing-style` 1건, `complete-task` 1건, 루트 템플릿 1건, `README.md` 1건)이 모두 잡혔다.
  - 결과: 검증 명령이 거짓 통과를 내지 않는다. Codex는 자기 자신 매칭만 짚었고, dot 디렉토리 누락은 명령을 실제로 돌려 보다가 찾았다.

- **D3 — Codex의 줄 수 지적은 기각한다**
  - 문제: Codex가 템플릿 분량을 `bugfix.md 89`·`feature.md 90` 등으로 제시하며 계획서의 `88~142줄`이 틀렸다고 했다.
  - 해결: 이 워크트리에서 `wc -l .github/PULL_REQUEST_TEMPLATE*/*.md`를 직접 돌려 142·140·88·63·136·116을 확인했다. Codex 수치는 빈 줄을 뺀 값이라 `wc -l`과 다르다. 계획서는 측정 명령을 함께 적어 뒀으므로 수정하지 않았다.
  - 결과: 계획서 수치를 그대로 뒀다. 외부 검증 결과라도 명령을 다시 돌려 대조한 뒤에 반영한다는 점을 확인했다.

- **D4 — 삭제할 항목을 머지된 PR 본문으로 가려낸다**
  - 문제: 첫 초안은 셀프 체크리스트·다이어그램·하네스 검증 표·PM 확인 포인트를 한꺼번에 뺐다. 근거는 "리뷰어가 안 읽는다"는 짐작뿐이었다.
  - 해결: 머지된 PR #152 본문을 열어 어떤 섹션이 실제로 채워졌는지 셌다. 셀프 체크리스트와 Mermaid 다이어그램은 작성자가 이미 지우고 올렸고, 의사결정 표는 5행 4열 20칸, 하네스 검증 표는 8행, PM 확인 포인트는 5항목이 모두 실제 내용으로 차 있었다. 안 쓰는 두 개만 빼고 나머지는 새 템플릿에 자리를 만들었다.
  - 결과: 삭제 목록이 짐작에서 실측으로 바뀌었다. 새 템플릿 분량은 45줄 목표에서 75줄로 늘었지만, 배포 사고로 이어질 항목을 빼지 않는다.

- **D5 — 릴리스 템플릿은 남긴다**
  - 문제: 처음에는 6파일을 모두 지우고 릴리스 PR도 5섹션으로 쓰기로 했다.
  - 해결: `release.md` 116줄을 읽어보니 절반이 문서가 아니라 안전장치였다. 배포·운영 체크 7항목(환경변수·DB migration·Supabase 타입 재생성·Cloudinary·배포 순서·배포 후 확인 화면·모니터링), 롤백 계획 4항목, 머지 전 체크리스트 7항목이다. 이건 읽는 글이 아니라 배포 전에 하나씩 짚는 목록이라 5섹션 산문으로 옮기면 기능을 잃는다. 그래서 일반 PR만 5섹션으로 통일하고 `develop → main` 병합은 `release.md`를 계속 쓴다.
  - 결과: 지우는 파일이 6개에서 5개로 줄었다. 템플릿 통합의 목적(일반 PR에서 의도를 먼저 읽게 하기)은 그대로 이루고, 배포 안전장치는 건드리지 않는다.

- **D6 — 하네스 검증 표는 빼고 Mermaid는 되살린다**
  - 문제: D4에서 "PR #152가 하네스 검증 표 8행을 꽉 채웠다"는 이유로 표를 유지하기로 했다. 채워졌다는 것과 읽힌다는 것은 다른데 그 둘을 같게 봤다. 반대로 Mermaid는 본문에 없다는 이유로 뺐는데, 그건 그 PR이 구조를 바꾸지 않아서였다.
  - 해결: 표 전체를 뺀다. 8행 모두 exec-plan 검증 섹션에 같은 내용이 있고 헤더의 exec-plan 링크로 닿는다. 처음에는 `verify-task` 한 줄만 남기려 했으나 D8에서 그 줄도 뺐다. Mermaid는 2번 접근에 조건부 블록으로 넣어, 구조가 바뀐 PR에서 변경 전후를 그림으로 대비하게 한다.
  - 결과: 4번에서 표가 사라졌다. 사용자가 직접 "거의 읽지 않는다"고 한 표를 뺐고, 구조 변경 PR에서 필요하던 그림은 되찾았다.

- **D7 — 갈 곳 없던 항목 3개를 Codex 교차검증에서 더 찾았다**
  - 문제: D4에서 "PM 확인 포인트 5항목은 1번과 5번으로 흡수된다"고 적었다. Codex에 감사 결과를 교차검증시키자 5항목 중 **QA 후속**과 **먼저 볼 화면·흐름**은 갈 곳이 없다고 짚었다. 대조해 보니 맞았다 — 사용자에게 달라지는 점은 1번, 롤백 시 영향은 5번, 운영 리스크는 5번에 닿지만 나머지 둘은 어디에도 없다. PR #152는 그 둘을 실제로 채웠다 (QA 후속에 "낱장 모드로 연속 탭하며 네트워크 탭에서 Server Action POST 확인", 먼저 볼 화면에 "`/mypage` → 프로필 수정 → 기록기 → 일·주·월 탭").
  - 해결: **먼저 볼 화면·흐름**을 3번 변경 범위에 넣는다. 리뷰어에게 어디부터 보라고 알려주는 항목이라 "바꾼 영역"과 같은 자리에 있어야 한다. **QA 후속**은 5번 남은 위험에 넣는다. 머지 후에 할 일이라 "배포 후 지켜볼 것"과 성격이 같다. 셋째로 Codex가 짚은 author-invented 섹션(`## 문제 해결 과정` — Codex 계획 검증 6건과 1차 3건의 지적·조치 이력)은 4번 검증에 자리를 만든다.
  - 결과: 갈 곳 없는 항목이 3개에서 0개가 됐다. 첫 감사를 혼자 했을 때 "흡수된다"고 뭉갠 것을 교차검증이 걸러냈다.

- **D8 — verify-task 요약 줄도 뺀다**
  - 문제: D6에서 표는 빼되 `verify-task` 한 줄은 "유일한 실측치"라며 남기려 했다. 이 판단이 맞는지 Codex에 물었더니 근거 두 개가 다 틀렸다.
  - 해결: 직접 확인했다. 첫째, `logs/`는 `.gitignore:33`으로 커밋되지 않고 `git ls-files logs/`가 0건이라, PR에 적은 `RUN_ID=20260721-093012`를 리뷰어가 대조할 수 없다 — `enforce-verification.mjs`도 PR 본문이 아니라 로컬 `logs/*/latest.json`의 diff 해시만 본다. 그냥 믿어야 하는 문자열이다. 둘째, "유일한 신호"도 아니다. `docs/exec-plans/completed/2026-07-19-mypage-dept-fellowship.md:165`가 `run-id·lint·styles·build·knip` 표로 같은 값을 이미 담고, 헤더 exec-plan 링크로 닿는다. 그래서 이 줄도 뺐다.
  - 결과: 4번은 수기 확인 서술과 검증에서 드러난 문제만 남는다. 기계로 검증되는 신호는 후속 작업으로 옮긴다 — PR에서 `yarn lint·lint:styles·build`를 돌려 GitHub Checks 탭에 초록 체크를 만드는 `verify.yml`. 손으로 적은 못 믿을 문자열을 남기느니, 위조 안 되는 신호를 CI로 만드는 편이 낫다.

- **D9 — 검증 3섹션을 3-bullet에서 1줄로 접는다**
  - 문제: 사용자가 지목한 진짜 병목은 "각 단계별로 기록하는 단계"였다. exec-plan 템플릿이 검증 3섹션을 각각 `결론·현재 판단·다음 행동` 3-bullet으로 잡아, 작업마다 채울 칸이 많았다. 하지만 게이트는 유지하기로 했다.
  - 해결: 게이트가 실제로 요구하는 건 섹션마다 verdict 토큰 + 30자 본문뿐이다 (`scripts/harness-gate.mjs:115-121, 102-105`). `현재 판단`·`다음 행동`은 게이트 요구가 아니라 템플릿 관습이었다 — 이 두 라벨을 파싱하는 스크립트·훅이 없음을 grep으로 확인했다. 그래서 각 섹션을 `- **결론**: <토큰> — <근거 30자>` 한 줄로 접었다. 채운 형식은 게이트를 통과하고(exit 0), 안 채운 `미요청` 줄은 verdict 토큰이 없어 차단된다(exit 1) — 둘 다 `--plan-file`로 실측했다.
  - 결과: 섹션당 채울 칸이 3개에서 1개로 줄었다. placeholder 방어는 `PLACEHOLDER_INLINE`이 아니라 verdict 토큰 검사가 담당하므로(그게 먼저 돈다) 1줄로 접어도 fail-closed가 유지된다.

- **D10 — 세 검증 게이트를 위험도 tier로 재편한다 (범위 확장)**
  - 문제: 사용자가 검증 3섹션(계획·Codex 1차·Claude 2차)이 적절한지, 중복·과비용은 아닌지 다시 보자고 했다. 조사해 보니 `harness-gate.mjs`는 변경 크기와 무관하게 세 verdict를 획일로 요구하는데(`:8-12, :110-121`), CLAUDE.md는 typo·한 줄은 PLAN 생략 가능이라 한다(`:24`) — 모순이다. 게다가 `enforce-verification`은 커밋 때 세 verdict를 안 보고(verify 기록만, warn-only), `harness-gate`는 자동 실행되지 않아(CI·훅 어디에도 없음) 세 verdict는 머지 전 수동 게이트에서만 강제된다. 즉 병목은 "PR당 세 칸 채우기"였다.
  - 해결: 세 게이트의 고유 가치를 코드로 판정했다. 계획 검증은 verify-task가 못 읽는 계획-레벨 실패(범위·Non-goals)를 잡아 고유하다. Codex 1차의 "타입·레이어"는 ESLint(레이어 규칙)+build(tsc)와 겹쳐 6개 중 2개가 중복이고, 고유 가치는 외과적 변경 하나뿐이다. Claude 2차는 Codex가 고친 경우에만 교차확인 가치가 있고 그 외엔 verify 기록이 전부다. 그래서 (A) Claude 2차를 Verification에 병합, (B) tier 판정으로 Codex 1차를 고위험에만, (C) Codex hang용 fallback 토큰을 도입한다. 계획 검증은 유지한다 — plan-first의 핵심이라 없애지 않는다.
  - 결과: 처음의 Non-goal("게이트 유지")을 뒤집었다. 사소한 변경은 verdict 0개(tier 0), 보통은 계획 검증만(tier 1), 고위험만 계획+Codex 1차(tier 2)를 요구한다. 강제 Codex 호출이 줄어 병목과 hang 위험이 함께 준다. 게이트 로직을 손대는 tier 2 작업이라, 코드 수정 전 Codex 계획 검증을 거친다. ADR 0010(리뷰 cap)을 잇는 결정이라 신규 ADR로 관계를 명시한다.
  - 근거 조사 산출물: `.husky/pre-commit`(3줄, harness-gate 없음), `scripts/enforce-verification.mjs:8-13, 95-96`(warn-only), `scripts/harness-gate.mjs:147-151`(changed files 수집 — tier 재료), `scripts/_shared-config.mjs:7-30`(ADR_TRIGGER_PARTS).

- **D11 — 게이트 재설계 설계를 Codex 계획 검증으로 6곳 고쳤다**
  - 문제: tier 설계 초안을 코드 손대기 전에 Codex에 검증받았더니 CHANGE_REQUEST 6건이 나왔다. harness-gate는 커밋·머지를 막는 스크립트라 설계 구멍을 코딩 전에 닫아야 한다.
  - 해결: 6건을 직접 확인하고 전부 반영했다.
    - CR1 — Tier 0가 `src/` 코드를 무검토로 흘렸다. `ADR_TRIGGER_PARTS`에 `src/app/`이 없어서다. Tier 0 조건에 "`src/` 경로 0개"를 더했다.
    - CR2 — `findActivePlan`이 tier 계산보다 먼저 돌아 Tier 0에 plan이 없으면 실패했다. tier를 먼저 계산하고 plan은 tier 1+에서만 요구하도록 흐름을 뒤집었다.
    - CR3 — 작업트리와 staged를 따로 더하면 이중카운트다. `git diff <merge-base> --numstat` 단일 소스로 바꿨다. binary(`-`)와 읽기 실패는 fail-closed Tier 2로 둔다.
    - CR4 — `CODEX_UNAVAILABLE`을 `Codex 1차 검증`에서만 허용하고 3필드 정규식을 요구한다. 계획 검증은 이 토큰을 아예 안 받는다.
    - CR5 — 신규 ADR이 0010을 amend·supersede함을 명시하기로 했다.
    - CR6 — `complete-task.mjs`도 세 섹션을 파싱해 영향 파일에 추가했다.
  - 결과: 설계가 6곳에서 닫혔다. Tier 0가 코드 변경을 흘리지 않고, tier 계산이 plan 부재와 충돌하지 않으며, LOC 카운트가 이중집계·binary·untracked를 정확히 다룬다. fixture 3개로 각 경로를 시연한 뒤 구현한다.

- **D12 — `sectionBody`가 인라인 섹션 이름을 헤딩으로 오인하던 버그를 고쳤다**
  - 문제: 게이트 구현을 실측하다, 이 계획서의 `## 게이트 재설계`에 "Codex 검토는 `## Codex 계획 검증`"이라고 섹션 이름을 인용한 곳에서 게이트가 계획 검증을 못 읽고 "verdict 없음"으로 차단했다. `sectionBody`가 `markdown.indexOf("## " + heading)`로 첫 등장을 찾는데, 본문 인라인 인용이 실제 헤딩보다 앞서 잡혔다.
  - 해결: `harness-gate.mjs`와 `complete-task.mjs`의 `sectionBody`를 `new RegExp('^## ' + escaped + '\\s*$', 'm')`로 바꿔 줄 시작에 정확히 놓인 헤딩만 찾게 했다. 인라인 인용(`` `## …` ``)이나 문장 중간 언급은 이제 헤딩으로 오인되지 않는다. 수정 후 실제 게이트가 계획 검증을 제대로 읽고 Codex 1차 placeholder에서만 막혔다.
  - 결과: 이번 재설계와 무관하게 존재하던 신뢰성 결함을 닫았다 — 누가 계획서에 섹션 이름을 인용해도 게이트가 엉뚱한 본문을 읽어 잘못 통과·차단하지 않는다. fixture 6경로 재검증에서 회귀 0.

- **D14 — 가독성은 규칙이 아니라 기계 게이트로 강제한다 (warn-only 시작)**
  - 문제: 사용자가 모든 문서에서 같은 표현 문제가 반복된다고 지적했다. `·` 나열, 키워드 명사 더미, 영어 토큰 혼입, 문장 구분 없음. writing-style SKILL이 이미 이걸 금지하는데도 안 고쳐진다. Codex 교차 검증 결과: 규칙은 있으나 생성 경로와 게이트에 안 붙어 있다 — doc-editor는 PR 본문을 안 보고 exec-plan도 일부 섹션만 본다. SKILL 자신도 규칙 본문에서 영어 토큰을 쓰고, `·` 금지를 "3개 이상"으로 느슨히 두며 PR 제목에선 `·`를 허용해 스스로 모순된다.
  - 해결: advisory(문서 가이드)가 아니라 deterministic 기계 검사를 둔다. `scripts/check-readability.mjs`가 코드 span 밖 산문에서 문장당 `·` 개수·표 셀 길이·표 셀 사실-구분자 개수를 잰다. 병목을 피하려고 세 가지를 지킨다 — 느슨한 임계값(최악만), 한 지점만 hard-block(PR 본문), 나머지는 경고. 처음엔 전부 warn-only로 내고 오탐을 재본 뒤 PR 본문만 승격한다. SKILL의 자기모순(영어 토큰·느슨한 `·` 규칙·좋은 예의 `·` 나열)도 정정하고 키워드더미→산문 나쁜/좋은 예를 더한다.
  - 결과: 문장 품질을 보는 게이트가 처음 생긴다. 지금은 prefix·길이·label만 검사했다. warn-only라 아무도 안 막히니 되돌리기 위험이 없고, 오탐이 적으면 PR 본문 한 지점만 조인다.

## PR 리뷰 대응

PR #155에 봇 2종(gemini·codex)이 인라인 4건을 달았다. §8대로 중계하지 않고 각 지적을 코드로 직접 확인했다. 4건 다 실제 결함이었다(오탐 0). Codex 재검증도 4건 CONFIRMED(confidence high)로 확증했다.

| 지적 | 출처 | 코드 확인 | 판정 | 조치 |
| --- | --- | --- | --- | --- |
| F1 frontmatter ADR 미인식 | gemini | `complete-task.mjs:139,161` 섹션만 봄 | 실제 | `adrReview`가 frontmatter `ADR needed`도 인정 |
| F2 rename 경로·LOC 오판 | gemini | `{docs => src}/x.md` LOC 0 실측 | 실제 | `git diff`에 `--no-renames` |
| F3 릴리스 base 빈 diff | codex | `merge-base(develop,origin/develop)`=HEAD | 실제 | merge-base=HEAD ref 건너뜀, 다 같으면 fail-closed |
| F4 ADR 검사 branch diff 미사용 | codex | `assertAdrDecision`이 uncommitted diff만 봄 | 실제 | `stats.files`(branch diff) 전달 |

F4는 이 PR의 마지막 게이트 통과가 ADR 검사를 건너뛴 것이었으나, `docs/decisions/` 변경이 있어 고친 게이트로도 통과한다(누락 ADR을 숨긴 사례 아님). 고친 게이트로 재실행하니 ADR을 branch diff로 실제 검사하고 통과했다.

2차 리뷰(codex가 수정 커밋 `0adf965` 재검토): 인라인 2건 추가. 코드로 확인하니 둘 다 실제 결함.

| 지적 | 출처 | 코드 확인 | 판정 | 조치 |
| --- | --- | --- | --- | --- |
| New1 `--tier` 우회 | codex | 실측: 38파일 Tier 2가 `--tier 0`으로 verdict 0개 통과 | 실제 | 실제 task 경로에서 `--tier` 거부(dry-run 전용) |
| New2 Tier 0·1 완료 차단 | codex | `complete-task.mjs:148` 미요청에 warnOrFail | 실제 | 미요청 검사를 경고로 낮춤(강제는 harness-gate가 pre-merge) |

New1이 심각했다 — dry-run용 `--tier`가 실제 게이트에서도 먹혀 고위험 변경이 verdict·ADR 검사를 전부 건너뛰는 백도어였다.

## ADR 판단

- **필요 여부**: 필요. PR 문서 정책을 바꾸는 영구 결정이고, `.github/PULL_REQUEST_TEMPLATE*`·`CLAUDE.md`·`scripts/`가 ADR 후보 파일이다.
- **작성 위치**: 4단계에서 `node scripts/start-adr.mjs pr-intent-first-template`으로 생성한다.

## 후속 작업

- PR에서 lint·build를 돌리는 `.github/workflows/verify.yml` 신설 (D8에서 갈라져 나옴)
  - 이유: 이번에 PR 본문의 `verify-task` 요약 줄을 뺐다. 그 자리를 GitHub Checks 탭의 기계 검증 신호로 메운다 — `yarn lint`·`lint:styles`·`build`를 PR에서 돌리고, `knip`은 warning-only라 `continue-on-error`로 둔다. 지금은 PR에서 코드를 빌드하는 CI가 하나도 없다 (`.github/workflows/`에 `pr-required-fields.yml`·`release-drafter.yml` 둘뿐).
  - 다음 기준: 본 PR 머지 직후 바로 착수. 문서 개편과 CI 신설은 성격이 달라 PR을 나눈다.
  - 기록 위치: 없음 (후속 PR에서 exec-plan 신규 생성)

- PR 제목 형식(`[Type] Title`)을 GitHub Actions로 검사하기
  - 이유: 이번 범위는 본문 구조 교체이고 제목 검사는 별도 워크플로우 파일이 필요하다.
  - 다음 기준: 새 템플릿으로 PR을 3건 이상 만든 뒤 제목 품질이 흔들리면 착수한다.
  - 기록 위치: 없음

## 회고

### 잘된 것

- 우리가 만든 tier 게이트로 이 작업 자체를 검증했다. 커밋 6개가 매번 harness-gate Tier 2를 통과했고, Codex가 13시간 동안 멈췄을 때 새로 만든 `CODEX_UNAVAILABLE` fallback을 실전에서 처음 썼다.
- PR 리뷰 루프가 게이트의 결함 6건을 잡았고 코드로 검증한 결과 오탐이 없었다. 특히 New1은 dry-run용 `--tier` 플래그가 실제 경로에서도 먹혀 고위험 변경이 verdict·ADR 검사를 통째로 건너뛰는 백도어였다.

### 다음에 할 것

- 게이트에 dry-run 플래그를 넣을 때 실제 판정 경로에서 못 먹게 처음부터 막는다. 이번엔 `--tier`를 넣고 나서 봇 리뷰가 백도어를 찾아냈다 — 격리를 나중에 붙이면 그 사이가 구멍이다.
- 스크립트를 고칠 때 `sectionBody` 같은 파서는 인라인 언급을 헤딩으로 오인하지 않게 앵커 정규식을 먼저 쓴다. 이번에 4개 파일에서 같은 버그를 뒤늦게 고쳤다.

### 발견된 부채 (→ tech-debt/active.md 등록함)

- `complete-task.mjs`의 ADR-trigger 감지가 uncommitted diff만 봐서 `harness-gate`의 branch-diff 기반 tier 판정과 어긋난다 (F4 계열, 이번 범위 밖).

---

<!--
작성 규칙 SSOT: `.claude/skills/writing-style/SKILL.md`.
선택 섹션(Non-goals·감사·접근법·의사결정 로그·ADR 판단·참고 자료·리뷰·회고)은 해당할 때만 추가한다.
-->
