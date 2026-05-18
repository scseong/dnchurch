# sermons-a11y-perf

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-18
- **브랜치**: feat/sermons-a11y-perf
- **Open questions**: none
- **ADR needed**: no — sermons app 컴포넌트 국소 점검·개선만. services·config·레이어·정책 불변.

## 목표

sermons 섹션의 마지막 미구현인 접근성(8-3)·성능(8-4)을 점검하고 국소 개선한다.

- 새 기능은 없다. 머지된 #91~#95 결과물의 품질 보강이다.
- 점검에서 나온 결함만 외과적으로 고친다.

## 검증된 Assumptions

- 레퍼런스 미구현은 8-3·8-4뿐이다. Phase 0~7·8-1·8-2는 #91~#95로 머지됐다. (`Sermon-Implementation-Prompts.md:803-832`, develop log 확인)
- sermons UI = `src/app/(content)/sermons/_component/` 하위 16개 컴포넌트 디렉토리. 라우트 5개: `/sermons`·`/sermons/all`·`/sermons/series`·`/sermons/series/[id]`·`/sermons/[id]`. (Glob·find 확인)
- 새 `complete-task`·`_template`은 develop `f67f523`(#96)에 반영됐다. (git show 확인)

## Non-goals

- 새 기능 추가, 머지된 #91~#95 재작업.
- sermons 밖 전역 접근성·성능.
- ADR_TRIGGER 파일 변경: `next.config.*`·`package.json`·`src/services/`·`scripts/`. 새 a11y/perf 라이브러리(axe-core 등) 도입. 그런 결함이 나오면 별도 plan/ADR로 분리한다.
- 부킹(이미 커밋된 exec-plan 5건 이관 + tech-debt) — 별개 의도. 같은 브랜치에 있으나 별 커밋. PR 시점에 분리 결정(의사결정 로그 D1).

## Success Criteria

- 접근성(axe DevTools 또는 Lighthouse Accessibility로 5라우트 측정):
  - 인터랙티브 요소 aria-label/접근명 누락 0건.
  - heading 계층 h1→h2→h3 건너뜀 0건.
  - 색 대비 위반 0건(본문 4.5:1·큰 텍스트 3:1).
  - 키보드만으로 5라우트 전 기능 도달, focus 링 보임.
  - 터치 타깃 ≥44×44px.
- 성능(Lighthouse mobile, 5라우트):
  - hero/featured 이미지만 `priority`, 목록·캐러셀은 lazy.
  - `/sermons/all` 페이지네이션: page 파라미터 변경 시 URL·목록·포커스 갱신.
  - Lighthouse Performance·Accessibility 점수가 점검 전 대비 하락 0.
- verify-task PASS. knip 신규 0.
- 측정 결과(axe/Lighthouse 전후)는 `## 검증 이력` 또는 `logs/sermons-a11y-perf/<run>/`에 표로 기록.

## 영향받는 파일

- 감사 전 미확정(audit-then-scope). 후보: `src/app/(content)/sermons/_component/` 하위 16개. 체크리스트 1·3 완료 시 결함 목록 + 확정 파일 목록을 본 plan에 기록한다.

## 단계별 체크리스트

- [ ] 1. 접근성 점검(레퍼런스 8항, 5라우트) → 결함 + 영향 파일 목록을 plan에 기록
- [ ] 2. 접근성 결함 국소 수정(aria-label·heading·대비·focus·터치)
- [ ] 3. 성능 점검(이미지·페이지네이션·Lighthouse 5라우트) → 결함 + 영향 파일 목록을 plan에 기록
- [ ] 4. 성능 결함 국소 개선
- [ ] 5. verify-task + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-a11y-perf`
- 키보드만으로 sermons 5개 라우트 전 기능 도달 확인
- axe/Lighthouse 점검 전후 측정값을 표로 비교(저장 위치 명시)

## ADR 판단

- **불필요** — sermons app 컴포넌트 국소 점검·개선만. ADR_TRIGGER(`next.config`·`package.json`·`src/services`·`scripts`)와 새 라이브러리는 Non-goals로 명시 배제. 그 범위 결함은 별도 plan/ADR. `start-adr.mjs` 미실행.

## 의사결정 로그

- **D1 — Codex 계획검증 CHANGE_REQUEST 반영**
  - 문제: SC 6개 중 4개가 도구·라우트·임계값 미명시로 약했다. Non-goals에 ADR_TRIGGER·라이브러리 배제가 없어 `ADR: no`가 조건부였다. Assumptions에 미확인 항목("Glob 확인 예정")이 있었다.
  - 해결: SC를 도구(axe/Lighthouse)·5라우트·임계값(4.5:1·44px·점수하락 0)·결과 저장 위치로 구체화했다. Non-goals에 ADR_TRIGGER 파일·새 라이브러리 배제를 명시했다. Assumptions를 Glob·find 실측(16 디렉토리·5 라우트)으로 교체했다. 8-3·8-4 분리 대신 한 task 유지(관련 closeout), 커밋만 a11y/perf 분리.
  - 결과: material CR 해소. weak 기준 0, 범위 경계 명확. BLOCK 아니라 재요청 없이 WORK 진입.
- **D2 — 부킹 5건과 a11y-perf를 한 브랜치, 별 커밋**
  - 문제: `feat/sermons-a11y-perf`에 부킹 커밋(`17488f6`·`b3d3f90`)이 a11y-perf 작업과 섞인다. Codex가 PR 오염 지적.
  - 해결: 사용자가 한 브랜치를 선택했다. 의도별로 커밋을 분리해 두고, PR 시점에 (a) 부킹만 develop 선머지 또는 (b) PR 본문에 분리 표기 + squash 중 택한다. 부킹은 순수 Docs라 분리·선머지가 쉽다.
  - 결과: 커밋 단위로는 의도 분리 유지. 최종 PR 전략은 PR 생성 시 사용자 결정.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST
- **현재 판단**: material 2건(SC 4개 weak·Non-goals ADR/라이브러리 배제 누락) D1로 해소. expression(Assumptions 미확인·기록 조건)도 반영.
- **다음 행동**: WORK 진입 — 체크리스트 1(접근성 점검)부터.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: 미작성
- **현재 판단**: 미작성
- **다음 행동**: verify-task 후 갱신

## 검증 이력

<details>
<summary>2026-05-18 Codex 계획 검증</summary>

- 판정: CHANGE_REQUEST (confidence high)
- 이유: SC 4개 도구·임계값 미명시, Non-goals ADR_TRIGGER·라이브러리 배제 누락, Assumptions 미확인 항목.
- 조치: D1(SC 구체화·Non-goals 배제·Assumptions 실측), D2(브랜치 오염 PR 전략).

</details>

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt-tracker.md` 또는 없음 -->

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
