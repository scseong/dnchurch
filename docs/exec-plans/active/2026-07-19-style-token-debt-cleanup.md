# style-token-debt-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-19
- **브랜치**: chore/knip-dead-code-cleanup
- **Open questions**: none
- **ADR needed**: no

## 목표

stylelint의 primitive 토큰 직접 사용 경고 14건과 하드코딩 hex 경고 49건을 없앤다. 값이 같은 곳은 semantic으로 치환하고, 토큰 정의 파일은 lint 예외로 돌리고, 값 동일 semantic이 없는 곳은 가까운 semantic으로 바꾸거나(사용자 결정) 사유 주석을 단다.

## 검증된 Assumptions

- `color-no-hex` 예외가 `_color.scss`에만 걸려 있어 `_home.scss`(토큰 정의 파일) hex 22개가 샌다 — `.stylelintrc.json:88-92` overrides 확인.
- `$overlay-scrim: rgba(0,0,0,0.5)`가 `SermonVideoPlayer:99` `rgba($black,0.5)`와 정확히 같다 — `_semantic.scss:86`.
- `$txt-inverse=$white(#fff)`·`$bg-card=$white`·`$status-negative=$red-500(#ef4444)` — `_color.scss:74,92,148,56`. 그래서 admin `#fff`·`$white`·`#ef4444`는 값 동일 치환.
- 스켈레톤(`PhotoSwipe`)·영상 레터박스(`SermonVideoPlayer` `$black`)·풍경 그라디언트(`HeroCarousel`)는 값 동일 semantic이 없다.

## 결정 (사용자 확인)

- **값 동일 semantic이 없는 자리(MobileNav `$black`, Header `$beige-150`과 `$beige-200`)**: 가까운 semantic으로 바꾸고 미세한 시각 변화를 감수한다 (사용자 선택 2026-07-19). 신규 토큰은 안 만든다 — 한두 곳 때문에 토큰을 늘리기보다 기존 semantic 재사용이 단순하다.

## 처리 분류

- **A. config**: `color-no-hex` 예외를 `_color.scss` → `src/styles/tokens/**`로 확장 → `_home.scss` hex 22 해소.
- **B. 값 동일 치환**: `color: #fff` → `$txt-inverse`, dropdown `$white` → `$bg-card`, `rgba($black,0.5)` → `$overlay-scrim`, `#ef4444` → `$status-negative`, `#ccc` → `$border-primary`, `color.mix(#fff, …)` → `$txt-inverse`.
- **C. 사유 주석**(값 동일 semantic 없음, 신규 토큰 안 만듦): 영상 레터박스 `$black`, 스켈레톤 `$gray`, HeroCarousel 풍경 그라디언트.
- **D. 가까운 semantic 치환**(미세 시각 변화): MobileNav `$black` → `$txt-primary`, Header `$beige-150` 보더 → `$border-card`·`$beige-200` 면 → `$bg-secondary`, `#aaa` 아웃라인 → `$border-strong`.

## Success Criteria

- `yarn lint:styles` primitive 토큰 경고 0건.
- hex 경고는 토큰 정의 파일과 사유 주석으로 처리한 곳을 빼면 0건.
- `yarn build` 통과.
- 신규 토큰 0개. 화면은 MobileNav와 Header에서만 미세하게 바뀐다.

## 단계별 체크리스트

- [x] 1. A: stylelint config 예외를 `src/styles/tokens/**`로 확장 → `_home.scss` hex 22 해소
- [x] 2. B: 값 동일 치환 — `color: #fff`→`$txt-inverse`, `$white`→`$bg-card`, `rgba($black,0.5)`→`$overlay-scrim`, `#ef4444`→`$status-negative`, `#ccc`→`$border-primary`, `color.mix(#fff,…)`→`$txt-inverse`
- [x] 3. C: 사유 주석 — 영상 레터박스 `$black`, 스켈레톤 `$gray`, HeroCarousel 풍경 그라디언트(블록 disable)
- [x] 4. D: 가까운 semantic — MobileNav `$black`→`$txt-primary`, Header `$beige-150`→`$border-card`·`$beige-200`→`$bg-secondary`, `#aaa`→`$border-strong`
- [x] 5. `lint:styles` 색 경고 63→0, `yarn build` 통과

## Verification

- `node scripts/verify-task.mjs style-token-debt-cleanup`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 값·역할이 정해진 토큰 치환과 lint 예외 확장이라 답이 명확하다. 시각 판단(MobileNav·Header)은 사용자가 직접 정했다. 위임 트리거에 해당하지 않는다.
- **다음 행동**: 없음

## Codex 1차 검증

- **결론**: Claude 직접 검토로 대체
- **현재 판단**: diff가 토큰 치환·주석·config 한 줄이고 `lint:styles`·`build`로 교차 확인된다. 로직 변경 없음. Windows Codex 불안정도 고려해 직접 검증.

## Claude 2차 검증

- **최종 판단**: `lint:styles` 색 경고 63→0, `yarn build` 통과.
- **현재 판단**: 값 동일 치환(#fff·$white·rgba·#ef4444·#ccc·color.mix)은 semantic 값이 원본과 같음을 `_color.scss`·`_semantic.scss`로 확인했다. 값 동일 semantic이 없는 곳은 가까운 semantic으로 바꾸거나(MobileNav·Header, 미세 시각 변화) 사유 주석을 달았다(영상·스켈레톤·그라디언트). `_home.scss` hex는 토큰 정의라 config 예외로 돌렸다.
- **검증 표**:

| 시점 | lint:styles 색 경고 | build | 신규 토큰 |
| --- | --- | --- | --- |
| 2차 | 63 → 0 | ✅ 통과 | 0개 |

## ADR 판단

- **불필요**. `.stylelintrc.json` 변경은 기존 `color-no-hex` 예외를 `_color.scss` 한 파일에서 토큰 폴더 전체(`src/styles/tokens/**`)로 넓힌 것뿐이다. 검증 정책의 방향(토큰 정의 파일은 hex 허용)은 그대로고 대상 범위만 일관되게 맞췄다. 새 규칙·도구·레이어 변경 없음.

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

