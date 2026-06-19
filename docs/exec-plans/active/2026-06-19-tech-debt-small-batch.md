# tech-debt-small-batch

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-19
- **브랜치**: chore/tech-debt-small-batch
- **Open questions**: none
- **ADR needed**: no — 아래 ## ADR 판단 참조 (scripts/·apis/ 변경은 미사용 삭제·편의 1줄, 영구 결정 아님)

## 목표

작은 기술 부채 4건을 한 번에 닫는다. 설교 상세 JSON-LD의 XSS 갭을 막고, 없는 설교자 이름으로 들어온 URL이 전체 설교를 보여주던 것을 빈 상태로 바로잡고, 미사용 코드 2건을 지우고, `complete-task.mjs`가 `.md`가 붙은 입력도 받게 한다.

## 검증된 Assumptions

- `sermons/[id]/page.tsx:104`는 `JSON.stringify(jsonLd)`를 이스케이프 없이 삽입한다 — Read 확인. 같은 패턴을 `ChurchJsonLd.tsx:62`는 `.replace(/</g, '\\u003c')`로 막았다.
- `sermons/all/page.tsx`에는 `isUnknownSeries` 가드만 있고 `isUnknownPreacher`는 없다 — Read 확인. `resolvePreacherName`(`utils/sermon.ts:58`)은 미매칭 이름에 `undefined`를 반환해 필터가 안 걸린다.
- `SeriesEpisodeList/`는 `.tsx`+`.module.scss` 2파일뿐이고 `src/`에서 import 0건 — Glob + Grep 확인 (참조는 모두 docs).
- `apis/auth.ts:42` `updatePassword`는 호출자 0건 — Grep 확인. 실제 비밀번호 변경은 `app/reset-password/actions.ts`의 `updatePasswordAndSignOut`이 담당한다.
- `complete-task.mjs:88`은 이미 정확 매치(`slugFromFilename(name) === pattern`)다 — Read 확인. tech-debt가 적은 substring(`*phase1*`) 버그는 이미 사라졌고, 남은 건 `.md` suffix 미처리뿐이다.

## Success Criteria

- `sermons/[id]/page.tsx`의 `dangerouslySetInnerHTML`이 `.replace(/</g, '\\u003c')`를 거친다 (ChurchJsonLd와 동일).
- `/sermons/all?preacher=<없는이름>`이 전체 설교 대신 빈 상태(EmptyState)를 보인다. 기존 `isUnknownSeries` 동작과 정렬·시리즈 0편 동작은 그대로다.
- `SeriesEpisodeList/` 디렉토리와 `apis/auth.ts`의 `updatePassword`가 제거되고, `yarn knip` 미사용 카운트가 그만큼 줄거나 같다 (신규 미사용 0).
- `node scripts/complete-task.mjs <slug>.md`가 `<slug>`로 정상 매치된다.
- `verify-task` lint·styles·build 통과, 신규 회귀 0.

## 영향받는 파일

- `src/app/(content)/sermons/[id]/page.tsx` — JSON-LD 이스케이프 (commit 1, Fix)
- `src/app/(content)/sermons/all/page.tsx` — `isUnknownPreacher` 가드 (commit 2, Fix)
- `src/app/(content)/sermons/_component/SeriesEpisodeList/` (삭제), `src/apis/auth.ts` — 미사용 제거 (commit 3, Chore)
- `scripts/complete-task.mjs` — `.md` suffix strip (commit 4, Chore)

## Non-goals

- 설교 외 다른 JSON-LD 파일은 손대지 않는다 (church는 이미 막음, 추가 페이지 없음).
- `resolvePreacherName`·`isUnknownSeries`의 기존 로직은 바꾸지 않는다 — preacher 가드만 같은 모양으로 추가한다.
- `apis/auth.ts`의 다른 함수(signIn·signOut·kakao)는 보존한다.
- `complete-task.mjs`의 매칭 방식(정확 매치)은 그대로 두고 입력 정규화만 한다.

## 단계별 체크리스트

- [x] 1. `sermons/[id]/page.tsx:104` — `JSON.stringify(jsonLd)` 뒤에 `.replace(/</g, '\\u003c')` 추가 → commit (Fix)
- [x] 2. `sermons/all/page.tsx` — `isUnknownPreacher` 계산 + 기존 가드 블록을 `isUnknownSeries || isUnknownPreacher`로 합쳐 EmptyState 문구 분기 → commit (Fix)
- [x] 3. `SeriesEpisodeList/` 디렉토리 삭제 + `apis/auth.ts` `updatePassword` 제거 → commit (Chore)
- [x] 4. `complete-task.mjs` pattern에 `.replace(/\.md$/, '')` 추가 → commit (Chore)
- [ ] 5. VERIFY(✅ 20260619-213402) → COMMIT(승인 후) → PR(develop)

## Verification

- `node scripts/verify-task.mjs tech-debt-small-batch`

## ADR 판단

- **필요 여부**: 불필요
- **사유**: ADR_TRIGGER_PARTS에 걸리는 두 파일 모두 영구 결정이 아니다. `scripts/complete-task.mjs`는 입력 정규화 1줄(`.md` strip)이고 매칭 방식은 그대로다. `src/apis/auth.ts`는 호출자 0건인 `updatePassword` export 삭제로, 레이어 계약·데이터 흐름·인증 정책을 바꾸지 않는다.

## 의사결정 로그

- **D1 — preacher 가드를 기존 series 가드 블록에 합친다**
  - 문제: `isUnknownPreacher`를 별도 `if` 블록으로 추가하면 사이드바·툴바 셸 약 20줄을 그대로 복제한다.
  - 해결: 기존 `isUnknownSeries` 반환 블록을 `isUnknownSeries || isUnknownPreacher`로 합치고, EmptyState 제목·설명만 어느 쪽이 매치 안 됐는지로 분기한다. series 가드가 먼저 평가되므로 `resolveSeriesSlug` 전에 빠져나간다. 덕분에 raw slug가 UUID 컬럼에 들어가 throw 나던 기존 보호가 그대로 유지된다.
  - 결과: 셸 복제 없이 두 미매칭 경로가 같은 빈 상태로 떨어진다.

- **D2 — complete-task.mjs tech-debt 항목은 이미 대부분 해결됨**
  - 문제: tech-debt가 적은 substring 매칭 버그(`phase1`이 `phase1-5`에 걸림)는 현재 코드에 없다 — `:88`이 이미 정확 매치다.
  - 해결: 남은 미세한 부분(`phase1.md` 입력 시 suffix 미처리)만 `.replace(/\.md$/, '')` 1줄로 닫는다. 매칭 방식은 바꾸지 않는다.
  - 결과: tech-debt 항목은 완료 시 resolved로 옮긴다. 핵심 버그(substring 오매칭)는 과거 정확 일치를 도입할 때 이미 사라졌고, 이번 1줄은 `.md`가 붙은 입력만 받아준다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS (신뢰도 high, 2026-06-19)
- **현재 판단**: material 0건, expression-only 0건. 4건 모두 5체크(A-E) 통과. Codex가 코드를 직접 열어 확인한 사실:
  - `sermons/[id]/page.tsx:104`는 이스케이프 없이 JSON-LD를 삽입한다.
  - `resolvePreacherName`(`utils/sermon.ts:58,63-64`)은 매치 안 되는 이름에 `undefined`를 반환한다.
  - `SeriesEpisodeList`는 자기 파일 2건 외에 import가 없다.
  - `updatePassword`는 정의 1건·호출 0건이다.
  - `complete-task.mjs:87-88`은 이미 정확 일치 매칭이라, "substring 버그는 이미 해결됐다"는 계획 주장과 코드가 맞는다.
- **다음 행동**: WORK 진행.

## Codex 1차 검증

- **결론**: PASS (신뢰도 high, 2026-06-19). 직접 수정 0건.
- **현재 판단**: 4건과 surgical 점검 모두 PASS. Codex가 코드를 열어 확인:
  - `sermons/[id]/page.tsx`가 `ChurchJsonLd.tsx:62`와 같은 방식으로 이스케이프한다.
  - `isUnknownPreacher` 계산이 `resolveSeriesSlug`(줄 110)보다 앞에 있어, series 가드가 raw slug를 막던 기존 보호가 유지되고 정상 경로에서는 분기가 없다.
  - `SeriesEpisodeList` import가 0건이고, `apis/auth.ts`의 `getSupabaseBrowserClient`는 남은 함수가 계속 써서 미사용 import가 없다 (reset-password의 `updatePasswordAndSignOut`은 이름만 비슷한 별개 함수다).
  - `complete-task.mjs`는 정확 일치 로직을 그대로 두고 입력 정규화 1줄만 더했다.
- **다음 행동**: Claude 2차 검증.

## Claude 2차 검증

- **최종 판단**: PASS. 신규 회귀 0, 커밋 가능.
- **현재 판단**: diff를 직접 읽어 4건 모두 task에 귀속됨을 확인했다 (인접 정리·포맷 없음). Codex 1차가 직접 수정한 부분이 없어 교차 확인 대상도 없다. Knip 경고는 전부 기존 부채다:
  - 내 삭제로 `SeriesEpisodeList`·`updatePassword`가 미사용 목록에서 빠졌다.
  - 목록에 남은 `signOut`(auth.ts:35)은 유일 호출자 `UserProfileModal.tsx`가 이미 미사용 파일이라 생긴 기존 부채다 (내 diff와 무관).
- **검증 결과**:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260619-213402 | ✅ | ✅ | ✅ | 0 | 없음 |

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

