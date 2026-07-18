---
name: writing-style
description: exec-plan·ADR·tech-debt·검증 기록·커밋 메시지·PR 본문·Codex 인용·의사결정 로그 등 모든 repo 문서·메시지 작성/수정 시 자동 로딩. 한국어 평이성·구체화 4원소·추상명사 회피·압축 금지·글 종류별 템플릿을 단일 SSOT로 제공한다. 작성자(claude-code)와 점검자(doc-editor·commit-pr-author) 모두 본 SKILL을 참조한다. 채팅 응답·src 코드 주석은 적용 범위 밖.
---

# writing-style — 한국어 문서·메시지 작성 단일 SSOT

본 SKILL은 작성용 가이드다. "이렇게 쓰라"를 먼저, "이렇게 쓰지 마라"를 뒤에 둔다. 글 종류별 템플릿과 자주 발견된 위반 카탈로그를 같이 제공한다.

## 핵심 원칙 5개

1. **서술어로 끝낸다** — "신호 명확성" 같이 명사로 압축하지 않는다. "신호가 분명해진다"가 맞다. 명사형은 추상명사가 되기 쉽고 다음 문장과 어떻게 이어지는지 가린다.
2. **한 문장에 한 가지, 문장이 여러 개면 나눠 보이게** — 양보·이유·예외를 한 문장에 겹치지 않는다. 두 가지면 bullet으로 쪼갠다. 각각 다른 요점을 담은 문장이 줄줄이 이어져 한눈에 안 들어올 때 — 특히 표 셀, 또는 3개 이상 나열 — bullet이나 줄바꿈으로 나눈다. 각 문장이 독립된 정보면 나누고, 한 흐름이면 그대로 둔다. 짧은 2문장 산문은 그대로 둬도 된다 (마크다운 표 셀은 실제 개행이 안 되므로 `<br>`을 쓴다).
3. **구체화 4원소 2개 이상** — 모든 주장·비판·제안은 다음 중 최소 2개를 포함한다.
   - (a) **실제 도구·규칙·파일·명령** — `eslint.config.mjs:37`, `@typescript-eslint/no-floating-promises`, `tsc --noEmit`
   - (b) **수치 또는 binary 기준** — `위반 23건`, `오탐률 5% 이하`, `3개월 내 3회 이상`
   - (c) **구체 동사 + 결과** — `Tier 정의에 "deterministic + 오탐률 5% 이하" 한 줄 추가`
   - (d) **예시 1개 이상** — 비판 1개당 실제 코드/규칙/파일 예시 1개
4. **평이한 한국어** — 한자어 + 化·하다 명사, 번역투, AI 상투 표현, 영어 직역을 쓰지 않는다.
5. **반복하지 않는다** — 같은 근거를 두 번 적지 않는다. 두 번째는 참조한다. 괄호 보충은 문장 밖 `근거:` 줄로 뺀다.

## 추상 표현 금지 (반드시 제거)

다음 패턴은 작성 시점에서부터 차단한다.

- **추상명사로 끝맺기** — `보강 필요`, `명시 필요`, `통합 필요`, `정합`, `근거 약함`, `커버리지 공백`
- **형용사 정성 표현** — `오탐 낮은`, `많은 부채`, `긴 함수`
- **도구·파일·명령 누락** — `lint 강화`, `타입 안전성 향상`

위 세 유형이 등장하면 구체화 4원소로 풀어쓴다.

## 글 종류별 템플릿

### 의사결정 로그 (`## 의사결정 로그`)

한 항목 = 한 결정. D번호로 분리.

```markdown
- **D{n} — 한 줄 제목 (무엇을 정했나, 평이하게)**
  - 문제: 어떤 제약·상황이 있었나.
  - 해결: 어떤 방법들이 있었고 무엇을 택했나 — **왜 그 방법인가가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 측정 가능한 변화.
```

`해결:`이 "무엇을 했다"로 끝나면 안 된다. 의사결정 맥락(왜)이 빠지면 문서로 복구 불가.

폐기 시 원항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D{n} 참조` 1줄.

### 검증 기록 (`## Codex 계획 검증`·`## Codex 1차 검증`·`## Claude 2차 검증`)

현재 판정만. 3줄 고정.

```markdown
- **결론**: {verdict 토큰 + 짧은 처리 결과}  (2차는 `- **최종 판단**:`)
- **현재 판단**: {5체크/구현 검토의 핵심 요지}
- **다음 행동**: {다음 단계}
```

세부 규칙:
- 이전 판정·재검증 원문·CR 해소 내역은 본 섹션에 쓰지 않는다.
- 이전 판정은 `## 검증 이력`에만 둔다. 거기서는 `**결론**:`·`**최종 판단**:` 대신 `판정:`을 쓰고 `<details>` 본문 3줄 이하(판정/이유/조치).
- 재검증은 결론 3줄을 덮어쓰고, `## 검증 이력`에 `<details>` 1개 append. 인라인 누적 금지.
- 후속 작업은 `## 후속 작업` 한 곳에만. Non-goals·체크리스트에는 중복 기술하지 않는다.
- `## 의사결정 로그`는 결정과 이유만. verdict 토큰을 재서술하지 않는다.
- 공통 검증 결과(lint/styles/build/knip)는 표 1행으로. 단락 재서술·`(a)~(g)` 재나열 금지, 새 위험·수동 미검증만 추가.

```markdown
| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
```

### ADR (`docs/decisions/NNNN-{slug}.md`)

영구 결정 기록. compact 템플릿 frontmatter + Context / Decision / Consequences / Alternatives 4 섹션 표준.

```markdown
# NNNN — 한 줄 결정 제목 (무엇을 정했나)

- **Status**: Proposed | Accepted | Superseded
- **Date**: YYYY-MM-DD
- **Deciders**: {역할/이름}
- **Tags**: {scope-tags}

## Context
{왜 결정이 필요했나 — 제약·트리거 + "결정 미루면 발생하는 비용"}

## Decision
**{한 줄 결정 요약}**
{세부 — 표·하위 결정}

## Consequences
### 긍정적
- {효과 1}
### 부정적 / 트레이드오프
- {비용 1}
### 영향 범위
- 코드 / 문서 / 운영

## Alternatives Considered
### A안: {이름}
- 장점·기각 사유
```

ADR 작성 원칙:
- 제목 = "한 줄 결정 제목"이지 "탐구 주제"가 아니다 ("코드 품질 강화" X / "ESLint 규칙 Tier 1·2 도입" O).
- Context는 **결정 미루면 발생하는 비용**을 명시.
- Decision은 **한 줄 굵게** + 세부.
- Alternatives는 기각 사유가 핵심 — "장점만 적고 왜 안 골랐는지 비움" 금지.
- 본문은 의사결정 로그와 같은 표현 규칙 적용 (서술어 종결·구체화 4원소·평이 한국어).

### tech-debt 항목 (`docs/tech-debt/active.md`·`resolved.md`)

발견 즉시 등록. 해결되면 active → resolved 이동.

```markdown
### {상태 이모지} {한 줄 제목}

- **무엇**: {부채의 실체 — 어떤 코드·어떤 패턴인지}
- **왜**: {왜 부채인가 — 원래 의도와 현 문제}
- **마이그레이션 경로**: {어떻게 해소하나 — 단계·기준}
- **영향 범위** ({N건}):
  - `{file:line}` — {증상}
- **확인**: `{grep 또는 검증 명령}` → {N hits}
- **발견일**: {YYYY-MM-DD}
- **{YYYY-MM-DD}**: {진척 — N건 → N건}
```

상태 이모지: 🔴 차단 / 🟡 작업 중 또는 마이그레이션 필요 / 🟢 모니터링·낮은 우선순위.

tech-debt 작성 원칙:
- "마이그레이션 경로"는 결정적으로 — "검토 필요" 같은 추상 표현 금지.
- "영향 범위"는 binary count + file:line 리스트.
- "확인" 명령은 재실행 가능해야 함 — 다른 작업자가 같은 grep으로 같은 결과 확인.

### Codex 결과 인용

Codex stdout은 verbatim 인용 + 그 아래 평이 한국어 풀이 1줄. 영어 용어·약어를 그대로 옮기면 다음 사람이 못 읽는다.

````markdown
### Codex {계획|1차} 검증 결과 (verbatim)

```
{stdout 원문 그대로}
```

평이 풀이: {핵심을 1줄로}
````

### 커밋 메시지

```
<Prefix>: <subject — WHY/IMPACT 우선, 50자 권장 / 80자 max>

- 왜: motivation (트리거·배경)
- 무엇: 핵심 변경 (파일 단위 또는 동작 단위)
- 영향: 호출부·사용자 변화, breaking 여부
- 제외: 의도적으로 안 한 것 (있을 때만)

Co-Authored-By: {실제 실행 모델명}
```

Subject 규칙:
- **prefix 6개만** — `Feat · Fix · Style · Refactor · Docs · Chore`. 다른 prefix(`Enhance`·`Update` 등) 금지.
- **WHY/IMPACT 우선** — "X 채택/적용" 보다 "Y 문제 해소"를 선호. 메커니즘이 아니라 사용자/시스템 영향을 subject에 노출.
- **추상명사 회피** — "정합·통일·정정" 단독 금지. 구체 Before→After 또는 숫자/경로 명시.
  - ❌ `Fix: 라우트 경로 정정`
  - ✅ `Fix: /news/bulletin → /news/bulletins (8건), /about/directions → /about/location` (자연어 열거 `,` 사용 — `+` 0회 원칙 준수)
- **외부 가독성 (코드 미열람자 1회 이해)** — 본 PR/저장소 처음 보는 사람이 코드 안 열고도 "무엇이 어떻게 변했는지" 이해 가능해야 한다. 본 task 내부 약어·축약(`메타 2 키`·`토큰 3종`·`9 영역`)은 본문에서 한 번 풀어쓰지 않으면 금지.
  - ❌ `Chore: Hero 메타 2 키 + 라우트 3 스켈레톤`
  - ✅ `Chore: sermons 자식 페이지 2종 Hero 등록·신규 라우트 3종 스켈레톤 추가` (`·` 한국어 열거 — `+` 0회 원칙 준수)
  - body 첫 등장 시 풀어 설명: "`hero.config.ts`의 `HERO_META` 객체에 `/sermons/all`·`/sermons/series` 두 엔트리(title/subtitle/eyebrow) 추가"
- **Subject `+` 0회를 기본** — `+` 등장 자체가 다중 의도 신호 + commit 분리 트리거. `+` 떠오르면 (a)/(b) 중 택1:
  - (a) **commit 분리** — 각 영역 별도 commit (기본 가정)
  - (b) **단일 의도 통일** — 모든 영역이 단일 상위 의도(`Phase 0 foundation prep` 등)면 subject는 그 상위 의도 하나로, 본문 bullet에서 영역별 풀이
  - (`/`·`,`는 URL 경로·자연어 열거에서 합법 — 분리 신호 아님. hook R4도 `+`만 검사)

### PR 제목·본문

```
[Type] Title — 구체 동사 + 결과 (권장 70자, 80자 max)
```

PR 제목 규칙:
- **형식은 commit과 다름** — commit은 `Fix:` (콜론), PR은 `[Fix]` (브래킷 + 공백 1). 혼동 금지.
- Type 6개는 commit prefix와 동일 (`Feat·Fix·Style·Refactor·Docs·Chore`).
- **유추 가능성 우선** — 제목만 보고 PR 내용 짐작 가능해야 함. 추상 라벨(`v3/v4`·`통일`·`정합`·`리팩터`)만으론 부족.
- **구체 동사 + 결과** — `재설계`·`도입`·`DB 편집화`·`차단`·`해소` 같이 무엇을 어떻게 했는지 드러나는 동사.
- **다중 영역 묶음 OK** — PR은 commit과 달리 본문이 별도 채워지므로 `+` 또는 `·`로 여러 영역 합쳐도 자연스러움.

  ❌ 나쁨: `Chore: develop → main 릴리스 v0.5.0` (Type 형식이 commit 스타일) / `[Refactor] 디자인 시스템 v3/v4 통합` (형식 OK지만 유추 불가)
  ✅ 좋음:
  ```
  [Chore] v0.5.0 — 교회 소개 6 페이지 재설계(DB 편집화) + 디자인 토큰·공용 컴포넌트 통합
  [Refactor] ui/ 12 컴포넌트 export 패턴 통일 (3 outlier 정리)
  [Fix] release v0.5.0 QA 9건 — about/news 경로 + a11y + 공용 UI 정합
  ```

PR 메타데이터:
- 본문 template 매핑 (`.github/PULL_REQUEST_TEMPLATE/README.md` SSOT) — Fix→bugfix.md / Feat→feature.md / Refactor→refactor.md / Chore·Docs·Style→maintenance.md / 릴리스→release.md
- `--assignee "@me"`·`--label` 필수 — GitHub Action `pr-required-fields`가 차단
- base는 `develop`

PR 본문 가독성 (GitHub 렌더 기준 — 문장 구분이 되게 쓴다):
- **긴 설명은 문단으로 뭉치지 말고 주장별 하위 bullet로 쪼갠다.** GitHub은 문단 안의 단일 줄바꿈을 무시해 3문장+ 문단이 벽처럼 렌더된다. 한 줄 = 한 주장.
- **"문제 → 해결" 이력은 항목마다 `- 문제:` / `- 해결:` 두 줄로 분리한다.** 한 항목을 한 문단에 `—`로 이어붙이지 않는다.
- **항목이 여럿인 설명(보안 계층·검증 이력 등)은 각 항목을 굵은 소제목 + 하위 bullet로 편다.** 예: `**1. RLS (DB 계층)**` 아래에 근거 bullet 3~4개.
- **스크린샷 섹션은 표 행을 비워두지 말고 첨부할 화면을 구체적으로 나열한다.** 각 행 = 화면 하나(예: `(a) 마이 페이지 전체`), 열은 데스크톱·모바일, 이미지 셀에는 "여기에 드래그&드롭" 안내. 개인 데이터 화면은 작성자가 캡처하지 않고 사용자가 붙인다.

  ❌ 나쁨: 보안 설명 4문장을 한 문단에, 문제 해결 9건을 각 항목 한 문단(`문제 …, 해결 …`)에 뭉침
  ✅ 좋음: 계층별 소제목 + 주장 bullet, 항목별 `- 문제:`/`- 해결:` 두 줄 (예시 PR #152)

### 출처 표기

QA / Codex / Gemini / 자체 발견 등 변경 트리거를 일관되게 표시한다.

- ✅ `Fix: <subject> (QA #6)` 또는 `(Codex P1 review)`
- ❌ 출처 없음 — self-initiated인지 외부 피드백인지 모호

### 커밋 메시지 좋은 예 / 나쁜 예

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

### 검증 정책 (참조)

Local `commit-msg` hook이 R1~R4 4개 deterministic 룰을 자동 강제 — `scripts/check-commit-msg.mjs` + `.husky/commit-msg`. 위반 시 commit 차단(exit 1). 강제 룰: R1 prefix 정규식 / R2 subject 80자 / R3 Co-Authored-By trailer 위치 / R4 subject `+` 2회 이상 차단. PR 리뷰에서 수동 확인하는 영역(WHY/IMPACT·외부 가독성·추상명사 회피)은 사람 영역.

## 자주 발견된 위반 카탈로그

본 저장소에서 실제 발견된 위반과 권장 대체. 신뢰도 high(거의 항상 위반) / medium(맥락 확인) / low(스타일 판단).

| 자주 쓰는 위반 표현 | 권장 대체 | 신뢰도 |
| --- | --- | --- |
| "감지 누락" | "reminder가 안 뜬다" / "변경을 못 잡는다" | high |
| "외과적 변경 원칙 위반" | "현재 task와 무관한 변경이 섞임" | high |
| "material로 지적" | "심각도 큰 위반으로 분류" / "구현 차단 사유로 판정" | high |
| "신뢰성 ↓" | "믿기 어렵다" / "hook을 신뢰 못 함" | high |
| "정합" | "한 곳에 정의해 N곳을 맞춤" | high |
| "보강 필요" | (구체 동사 + 결과로 풀어쓰기) | high |
| "통합" | "한 파일로 합침" / "한 함수로 묶음" / "한 섹션으로 합침" | high |
| "정합화한다" | "한 곳에 정의해 네 곳을 맞춤" | high |
| "false positive 다발" | "오탐이 많이 난다" / "잘못된 차단 사례가 잦음" | high |
| "근거 약함" | (구체 부족 부분을 지목 + 보강 방향) | high |
| "drift 위험" | "두 곳이 어긋날 위험" / "동기화 안 됨" | medium |
| "dead spot" | "점검 안 되는 영역" / "검사 누락 영역" | medium |
| "binary 기준" | "yes/no 기준" / "둘 중 하나로 판정" | medium |
| 추상명사 끝맺기 (`...명확성`·`...일관성`·`...신뢰성`) | 서술어로 풀어쓰기 (`...분명해진다`·`...일관되게 동작`) | high |
| 한자어 + 化 (`정합화`·`체계화`·`모듈화`) | 동사로 풂 (`...한 곳에 정의`·`...단계를 정함`) | high |
| 무생물 주어 + 사람 동사 ("안내가 …말했다") | 사람·대상을 주어로 ("안내 문구에 …적힘") | medium |
| 한 문장 비교 2개+ | bullet으로 쪼갬 | medium |
| 약어·내부 기호 (`SSOT`·`D6`·`R4`) | 첫 등장 한 번 풀기 (이후 약어 OK) | medium |
| `·`·`→`·`+` 적층 (3개+) | bullet으로 쪼갬 또는 풀어쓰기 | medium |
| `→` 인과 짧은 표현 | 보존 가능 (자연스러우면) — 두 문장이 되면 풀어쓰기 | low |
| AI 상투 표현 (`결론적으로`·`살펴보겠습니다`·`~라고 할 수 있습니다`·`~에 대해 알아보았습니다`·`~하는 것이 중요합니다`) | 직접 결론 서술 | high |
| 비유·관용구 (`못박아 두다`·`녹여내다`·`짚고 넘어가다`) | 가리키는 동작을 직접 서술 (`file:line으로 기록`·`한 파일에 합침`·`이번에 결정함`) | high |
| 외래어 동사 직역 (`큐잉`·`핸들링`) | 한국어 (`다음 단계로 미룸`·`처리`) — 단 `트리거`처럼 저장소에 정착한 기술 용어는 예외 | medium |

## 산출 문서 가독성 체크리스트 (작성 직전·직후 적용)

| # | 신호 | 고치는 법 |
| --- | --- | --- |
| ① 한자어 + 化·하다 명사 | 동사로 풂 — "정합화한다" → "한 곳에 정의해 네 곳을 맞춤" |
| ② 무생물 주어 + 사람 동사 | 사람·대상을 주어로 — "안내가 …말했다" → "안내 문구에 …적힘" |
| ③ 한 문장에 비교 2개+ | bullet으로 쪼갬 |
| ④ 약어·내부 기호 | 첫 등장 한 번 풀기 |
| ⑤ 추상명사로 끝맺기 | 동사+결과·숫자로 |
| ⑥ 추상명사 갈음(`흐름`·`약속`·`측면`) | 가리키는 구체 대상 2개 못 대면 풀어 나열 — "외부 약속 변화 없음" → "함수 입출력 형태·DB 구조 변화 없음" |
| ⑦ 요점 다른 문장이 줄줄이 (단락·표 셀·3개+ 나열) | bullet/줄바꿈으로 분리. 단락은 각 문장이 독립 정보면 나누고 한 흐름이면 그대로(짧은 2문장 예외). **표 셀은 2문장 또는 항목 2개 이상이면 반드시 줄바꿈 — 각 항목을 `<br>`로 띄우고 앞에 `- `를 붙인다**(마크다운 셀은 실제 개행이 안 되므로 `<br>` 사용). 셀 안 한 문장이면 그대로 둔다 |

한 줄 규칙 — 코드 안 본 동료가 이 문장만 읽고 "무엇이 어떻게 바뀌는지" 말할 수 있나? 못 하면 고침.

## 전후 비교 예시

### 의사결정 로그 (좋은 예 / 나쁜 예)

❌ 나쁨 (압축·기호 잇기·약어):
```
D6: duration 제거 → prop·import 삭제·조건블록 제거, BottomSheet로 교체(드롭다운 이탈)
```

✅ 좋음 (왜·대안·성과가 드러남):
```markdown
**D6 — 모바일 공유 메뉴를 BottomSheet로 교체**
- 문제: 드롭다운이 모바일에서 화면 밖으로 잘려 항목을 못 눌렀다.
- 해결: 위치를 직접 계산해 고치는 대신 공용 BottomSheet로 교체. 이유 — 위치 계산은 기기·뷰포트마다 깨지는 회귀가 반복됐고, BottomSheet는 모바일 시트/PC 모달 전환·focus trap이 이미 검증돼 재발 위험이 없음. 직접 만든 바깥클릭·ESC 핸들러는 중복이라 제거.
- 결과: 모바일에서 메뉴가 항상 화면 안에 뜬다. 기기별 회귀 0.
```

### 검증 기록 (좋은 예 / 나쁜 예)

❌ 나쁨 (추상명사·도구 누락):
```
Finding 1 — 3-tier 경계 보강 필요. 운영 기준 명시 필요.
```

✅ 좋음 (실제 규칙·구체 동사+결과·예시):
```
Finding 1 — Tier 1 후보에 자동수정 불가 규칙(`complexity`, `max-lines-per-function`)이 들어가 Tier 1/2 구분이 흔들림. 후속 작업자가 새 규칙(예: `unused-import`) 도입 시 어느 Tier인지 매번 토론 필요. → Tier 1 정의에 "deterministic(같은 코드 항상 같은 결과) + 오탐률 5% 이하" 운영 기준 한 줄 추가.
```

### 커밋 메시지 (좋은 예 / 나쁜 예)

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
- 제외: 'use client' 정리는 별도 tech-debt 항목 (#7)
```

### 한글 문장 (좋은 예 / 나쁜 예)

❌ 나쁨 (명사 압축·`·`적층·괄호 보충):
```
검증 정책·게이트 동작·manifest 스키마 불변. (Assumptions에서 enforce-verification이 summary.log 미파싱 확인)
```

✅ 좋음 (서술어 종결·한 문장 한 가지·근거 분리):
```
검증 정책과 게이트 동작은 그대로다. manifest 스키마도 바꾸지 않는다.
근거: enforce-verification은 summary.log를 읽지 않는다 (Assumptions 참조).
```

### 연속 문장 나열 — 단락·표 셀 (좋은 예 / 나쁜 예)

❌ 나쁨 (문장 4개를 한 단락에 이어 붙여 한눈에 안 들어옴):
```
이 PR은 리뷰 대응 절차를 추가한다. 봇 지적을 코드 확인 없이 옮기면 틀린다. #118·#119에서 오탐이 두 건 나왔다. 그래서 답글마다 코드 확인 근거를 요구한다.
```

✅ 좋음 (한 문장은 단락으로, 나머지는 bullet로 분리):
```
이 PR은 리뷰 대응 절차를 추가한다.

- 문제: 봇 지적을 코드 확인 없이 옮기면 틀린다 — #118·#119에서 오탐 2건.
- 해결: 답글마다 코드 확인 근거를 요구한다.
```

❌ 나쁨 (표 셀에 문장 2개를 이어 붙임):
```
| 선택 이유 | 리뷰는 비동기로 온다. 그래서 결정적 타이밍이 없다. |
```

✅ 좋음 (표 셀에 2항목 이상이면 `<br>`로 줄바꿈하고 각 항목 앞에 `- `):
```
| 선택 이유 | - 리뷰가 비동기로 와 결정적 타이밍이 없다<br>- 그래서 조건부 진입으로만 처리한다 |
```

한 항목이면 bullet 없이 그대로 둔다 — `| 선택 이유 | 리뷰가 비동기로 와 결정적 타이밍이 없다 |`.

## 적용 범위와 범위 밖

| 대상 | 적용 |
| --- | --- |
| `docs/exec-plans/active/*.md` | ✅ |
| `docs/exec-plans/completed/*.md` | ✅ (회고 작성 시) |
| `docs/decisions/*.md` (ADR) | ✅ |
| `docs/tech-debt/active.md`·`resolved.md` | ✅ |
| 커밋 메시지 (commit subject + body) | ✅ |
| PR 제목·본문 | ✅ |
| Codex/외부 도구 결과 인용 (어디든) | ✅ — verbatim 보존 + 풀이 1줄 |
| `CLAUDE.md`·`harness-workflow` SKILL 본문 | ✅ 규칙 적용 의무 — 단 SKILL 본문 직접 수정 시만 (rare). **doc-editor 점검 대상은 아님** (SSOT 자체 점검은 메타-순환이라 doc-editor가 거부 — `.claude/agents/doc-editor.md` 에러 핸들링 참조). 작성자(claude-code)가 직접 규칙 적용 |
| **사용자와의 채팅 응답** | ❌ — claude-code의 기본 한국어 규칙 적용 |
| **src/ 코드 주석** | ❌ — 코드 주석 규칙은 별도 |
| **자동 생성 문서** (`docs/generated/`) | ❌ — 수정 금지 영역 |

## 참조

- 본 SKILL이 모든 작성·점검의 단일 SSOT — 표현 규칙·글 종류별 템플릿·전후 비교·위반 카탈로그가 한 곳에 통합되어 있다.
- 워크플로우 메타 정보(검증 차단 정책·hook R1~R4 강제·ADR 0008 sectionBody 동작 등) 참조: `.claude/skills/harness-workflow/SKILL.md` `## 검증 결과 기록 규칙` + `## 커밋 메시지 / ### 검증 정책` — 본 SKILL이 master, 그쪽은 워크플로우 메타로만 reference.
- 관련 memory: `feedback_plain_korean`·`feedback_concrete_records`·`feedback_doc_decision_log_style`·`feedback_concise_plans`·`feedback_commit_message`·`feedback_pr_templates`·`feedback_pr_granularity`
- 관련 에이전트: `claude-code`(작성자) / `doc-editor`(점검자) / `commit-pr-author`(작성자)
