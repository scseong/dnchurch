# design-catalog

- **상태**: ✅ 완료 (2026-06-02)
- **시작일**: 2026-06-01
- **브랜치**: feat/design-system-unification
- **Open questions**: none
- **ADR needed**: yes — ADR 0013·0014·0015 신규 작성이 본 작업의 핵심. `docs/decisions/`·`.claude/skills/styles/` 변경 포함이라 CODEX_PLAN_REVIEW 필수

## 목표

audit가 찾아낸 `(content)` 일관성 위반 14건(V1-1~V4-3)을 바탕으로, 페이지 제작 표준을 ADR 3개 + 가이드 문서 1개로 정의한다. 코드는 바꾸지 않고 "앞으로 이렇게 만든다"는 결정과 기각 대안을 남긴다. P3(next-gen)·P4(마이그레이션)가 이 표준을 따른다.

## 검증된 Assumptions

- 기존 ADR은 0012까지 — `ls docs/decisions/`. 신규는 0013부터.
- 페이지 컨테이너 2종: `LayoutContainer` 10곳·`MainContainer` 6곳 — audit.md 컨테이너 분포표(PR #107 리뷰로 5→6 정정).
- 설교 카드 4종: `GridCard`·`SermonCarouselCard`·`SeriesCard`·`SeriesEpisodeCard` — audit.md V1-2.
- hero 처리 3종: 자동 `HeroSection`·자체 hero(`about/page.tsx`)·full-width 섹션(`welcome`·`vision`) — audit.md V2-2.
- `.claude/skills/styles/SKILL.md`에 primitive→semantic 치트시트가 이미 있음 — context.md 자산 목록.

## Success Criteria

- ADR-0013(페이지 골격) 작성 — 컨테이너 선택 기준 + hero 3종 분기를 결정하고 기각 대안을 적는다.
- ADR-0014(카드 통합) 작성 — 설교 카드 4종(V1-2)과 about 번호형 카드(V1-3)를 어떻게 합칠지 함께 결정한다.
- ADR-0015(페이지 상태·SEO) 작성 — 상태 정책(`EmptyState`·`loading`·`error`·`not-found` 최소 요구)과 SEO 정책(디테일 JSON-LD 기준)을 ADR 안에서 별도 결정 항목으로 나눈다.
- `docs/design-system/page-patterns.md` 작성 — 페이지 유형 5종(랜딩·리스트·디테일·정보형·폼)별 골격 가이드, 각 ADR을 참조한다.
- `.claude/skills/styles/SKILL.md`에 토큰·focus-ring 정합 매핑(audit 항목 6)을 보강한다.
- `node scripts/update-adr-index.mjs`로 ADR 인덱스를 갱신한다.
- `node scripts/verify-task.mjs design-catalog` 통과 — 문서 추가만이라 lint/styles/build/knip 신규 위반 0.

## 영향받는 파일

각 산출물이 다루는 audit 위반 번호를 함께 적는다(14건 전수 trace).

- `docs/decisions/0013-*.md` (신규) — 페이지 골격 규약. audit V1-1(컨테이너 2종)·V1-4(`news/page` 위임)·V2-2(hero 3종)
- `docs/decisions/0014-*.md` (신규) — 카드 컴포넌트 통합. audit V1-2(설교 카드 4종)·V1-3(about 번호형 카드)
- `docs/decisions/0015-*.md` (신규) — 페이지 상태·SEO 정책. audit V1-5(빈 상태 비일관)·V4-1(route 상태 파일 편중)·V4-2(`EmptyState` 편중)·V4-3(JSON-LD 1페이지)
- `docs/design-system/page-patterns.md` (신규) — 유형별 골격 가이드. audit V2-1(스켈레톤 17개)에 적용할 골격 제공
- `.claude/skills/styles/SKILL.md` — 토큰·focus-ring 매핑 보강. audit V3-1(primitive 38건)·V3-2(hex 3건)·V3-3(focus 8건)·V3-4(hover warm)
- `docs/decisions/` 인덱스 — `update-adr-index.mjs` 산출

## 단계별 체크리스트

- [x] 1. ADR-0013 페이지 골격 — 5개 결정(컨테이너 단일화·hero 자동/자체 분기·full-width·Breadcrumb·news 랜딩) 작성 완료. `/about` hero 중복 버그는 `fix/about-hero`로 선반영
- [x] 2. ADR-0014 카드 — explorer로 카드 7종 조사 → 전면 통합 부적합 확인 → 공유 부품(SermonThumb·card-surface 믹스인) 추출 결정, ADR 작성 완료
- [x] 3. ADR-0015 페이지 상태·SEO — 상태 파일 유형별 최소 요구 + EmptyState 표준 + news 디테일 JSON-LD 확대 결정, ADR 작성 완료
- [x] 4. `page-patterns.md` — 페이지 유형 5종(랜딩·리스트·디테일·정보형·폼)별 골격 + 신규 페이지 체크리스트, ADR 3개 참조
- [x] 5. styles SKILL — 치트시트에 primitive·focus-ring·Hover 매핑이 이미 충실(V3-1·3·4 커버). hex 대응(V3-2) 1줄만 보강해 백과사전화 회피
- [x] 6. ADR 인덱스 갱신(`README.md` 15건) + `verify-task` PASS(run 20260602-001444)

## Non-goals

- 실제 코드 마이그레이션 — Phase 4. P2는 결정·문서까지.
- next-gen 페이지 구현 — Phase 3.
- 신규 컴포넌트·토큰 실제 작성 — 표준 정의까지, 구현은 P3/P4.
- `audit.md` 수정 — Phase 1 snapshot 보존.

## 의사결정 항목 (각 ADR이 정할 것)

아래 선택지는 각 ADR WORK에서 실제 코드를 확인한 뒤 `AskUserQuestion`으로 확정한다. PLAN 시점의 open question이 아니라 WORK 산출물(ADR)의 결정 대상이다.

- **컨테이너(ADR-0013)**: A) 하나로 단일화 vs B) 선택 기준 분리(제목 자동 표시 vs 자유 배치). 트레이드오프는 마이그레이션 비용 vs 표현 자유도.
- **카드(ADR-0014)**: 설교 카드 4종(V1-2)에 about 번호형 카드(V1-3, INDEX·STEP·PILLAR)를 더해 함께 다룬다. A) `SermonCard` 1종 + variant prop vs B) 콘텐츠형(설교·시리즈)·정보형(번호+라벨) 2종 vs C) 현행 유지. 트레이드오프는 추상화 비용 vs 사용처별 차이.
- **페이지 상태(ADR-0015)**: 페이지 유형별 `loading`·`error`·`not-found` 최소 요구 수준. (SEO는 아래 별도 항목)
- **SEO 정책(ADR-0015)**: 디테일 JSON-LD를 news 디테일(bulletins·notices)에도 적용할지. 현재 sermons 디테일만 VideoObject schema 적용.

## ADR 판단

ADR 3개(0013·0014·0015) 신규 작성이 본 작업의 핵심. `docs/decisions/`·`.claude/skills/styles/` 변경 포함이라 ADR_TRIGGER_PARTS 해당 — CODEX_PLAN_REVIEW 필수.

## Verification

- `node scripts/verify-task.mjs design-catalog` — lint/styles/build/knip.
- docs-only 확인 — `git diff --name-only origin/develop...HEAD`가 `docs/`·`.claude/skills/` 경로만 포함, 소스 코드(`.ts`·`.tsx`·`.scss`) 변경 0건.
- 산출물 수동 확인 — ADR 3개·`page-patterns.md`가 위 SC 충족, 각 ADR에 기각 대안 명시.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high)
- **현재 판단**: material 3건 반영 후 WORK 진입한다. (1) 위반 수 13 → 14 정정 — `grep -c '^#### V' docs/design-system/audit.md`가 14를 반환(V1-1~V1-5·V2-1~V2-2·V3-1~V3-4·V4-1~V4-3). (2) 각 ADR·deliverable에 audit V번호 trace를 영향받는 파일에 명시. (3) docs-only 검증 명령(`git diff --name-only`로 결과 경로만 포함) 추가. 입도 권고 2건도 반영 — ADR-0014에 about 번호형 카드(V1-3) 포함, ADR-0015 내부를 상태 정책과 SEO 정책 두 결정 항목으로 분리.
- **다음 행동**: PLAN 수정 완료 후 WORK 1단계(ADR-0013) 진입. CHANGE_REQUEST라 Codex 재요청은 하지 않는다(BLOCK 아님 — exec-plan 수정 후 WORK).

## Codex 1차 검증

- **결론**: PR #107 자동 리뷰(gemini·Codex) 9건 → 코드 + Codex(`--wait`) 교차검증 → 8건 타당. audit·ADR·page-patterns 정정.
- **현재 판단**: 첫 조사가 stylelint occurrence를 라인으로 세고 notices/[id]를 코드 확인 없이 디테일로 분류해 수치·분류 오류가 생겼다. 정정 — notices/[id] 디테일→스켈레톤(디테일 4→3·스켈레톤 16→17), MainContainer 5→6(bulletins/[id] 누락), primitive 36→38(occurrence 기준·SermonVideoPlayer 2건), 컨테이너 분포(없음 20·합계 36), ADR-0013 가로 padding 차이, page-patterns 디테일 hero null·variant 축 분리, ADR-0014 SermonThumb 3종(SeriesCard 제외)+SermonFeatured·SermonOtherByPreacher 포함.
- **다음 행동**: 정정 후 verify-task 재실행 → Claude 2차 검증 갱신.

## Claude 2차 검증

- **최종 판단**: 통과 — 필수 검증 4단계 중 3단계 통과, Knip는 기존 부채 warning(차단 X).
- **현재 판단**: PR #107 자동 리뷰 9건을 코드·Codex로 교차검증해 audit·ADR·page-patterns를 정정했다(notices/[id] 스켈레톤·MainContainer 6·primitive 38·가로 padding·디테일 hero null·SermonThumb 3종). doc-editor 점검 3회 지적을 모두 반영했다. 문서만이라 신규 unused 도입 가능성 없다.
- **다음 행동**: 사용자 승인 후 commit.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260602-001444 | ✅ | ✅ | ✅ | 0 | `/about` hero 중복 fix는 별도 브랜치(`fix/about-hero` dfc6f7b) |
| 2차 | 20260602-154032 | ✅ | ✅ | ✅ | 0 | PR 리뷰 9건 정정 후 재검증. hero fix는 본 PR cherry-pick(4637e28)으로 포함 |

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

- **Phase 3 next-gen 페이지 구현** — 본 카탈로그의 첫 적용 사례.
  - 이유: P2는 표준 정의까지가 범위. 실제 페이지·컴포넌트 구현은 P3.
  - 다음 기준: 본 PR 머지 후 사용자가 P3 task 승인.
  - 기록 위치: `docs/design-system/context.md` Phase 로드맵.

## 의사결정 로그

- **D1 — 위반 수 13 → 14 정정 (Codex 계획 검증이 지적)**
  - 문제: 본 PLAN과 Phase 1 산출물(커밋 `344702e` 메시지·`2026-05-29-design-audit.md`)에 "위반 13건"으로 적었으나, `audit.md`의 실제 위반 섹션은 14개다 — `grep -c '^#### V' docs/design-system/audit.md`가 14를 반환(V1-1~V1-5 5개 + V2-1~V2-2 2개 + V3-1~V3-4 4개 + V4-1~V4-3 3개). audit.md 본문에는 총계 숫자가 없어 audit.md 자체는 14개를 정확히 나열하고, 오기는 요약 문구에만 있었다.
  - 해결: 본 PLAN과 앞으로의 문서·PR 본문은 14건으로 적는다. 이미 push된 커밋 `344702e` 메시지와 design-audit exec-plan의 "13건"은 사용자 결정으로 force push 없이 보존한다(브랜치 history를 손대지 않음). PR 본문에 "P1 커밋의 13건은 오기, 본 계획 검증이 14건으로 정정" 한 줄을 적는다.
  - 결과: Phase 2 기록은 14건으로 정확해졌고, 커밋 history는 그대로 남는다.

- **D2 — PR #107 자동 리뷰 9건을 코드·Codex로 교차검증 후 정정**
  - 문제: gemini·Codex 자동 리뷰가 audit·ADR·page-patterns의 수치·사실 오류 9건을 지적했다. 첫 조사가 stylelint occurrence를 라인 수로 세고(primitive 36 vs 실제 38), `news/notices/[id]/page.tsx`를 코드 확인 없이 디테일로 분류하는 등 부실했다.
  - 해결: 9건을 직접 코드(`Read`·`rg --count-matches`)와 Codex `--wait` 교차검증으로 확인했다 — 8건 타당, 2건은 부분 정정($black/$white는 audit 정의 밖, 컨테이너 합산은 위임 처리 방식도 원인). audit(notices/[id] 스켈레톤·MainContainer 6·primitive 38·분포 합계 36)·ADR-0013(가로 padding 차이)·ADR-0014(SermonThumb 3종 + Featured·OtherByPreacher)·page-patterns(variant 축 분리·디테일 hero null)를 정정했다.
  - 결과: Phase 1 snapshot 수치가 코드와 일치한다. Codex 백그라운드 호출이 결과를 회수하지 못해(미종료 프로세스 3개 잔존) `--wait` 동기 호출로 바꿔 처리했다.

## 회고

- **잘된 것**: audit 14건을 ADR 0013·0014·0015 + `page-patterns.md`로 표준화했다. explorer로 카드 7종을 조사해 "전면 통합 부적합 → 공유 부품 추출" 판단을 내려 추측성 추상화를 피했다. PR #107 자동 리뷰 9건을 코드·Codex로 교차검증한 뒤 정정했다.
- **다음에 할 것**: ADR 작성 전 코드를 직접 센다. 본 작업이 audit 수치를 그대로 인용해 라인/occurrence 혼동·MainContainer 5 오류가 ADR로 전파됐고, gemini·Codex 자동 리뷰가 이를 잡았다. occurrence 기준은 문서에 명시한다.
- **발견한 부채**: Phase 4 토큰 정리 큐 — primitive 38·focus-ring 8·hex 3·hover warm 2. codex-companion 미종료 프로세스 3개(D2).

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

