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
- sermons UI는 `src/app/(content)/sermons/_component/` 하위에 모인다. (Glob 확인 예정)
- 새 `complete-task`·`_template`은 develop `f67f523`(#96)에 반영됐다. (git show 확인)

## Non-goals

- 새 기능 추가, 머지된 #91~#95 재작업.
- sermons 밖 전역 접근성·성능.
- 부킹(stash: exec-plan 4건 completed 이동 + tech-debt) — 별개 의도. 같은 브랜치에 실리나 별 커밋으로 분리.

## Success Criteria

- 접근성: 인터랙티브 요소 aria-label 누락 0건. heading 계층 h1>h2>h3 정합. 색 대비 WCAG AA 통과. 키보드만으로 전 기능 도달. focus 표시 보임. 터치 타깃 ≥44px.
- 성능: 이미지 lazy/priority 적정. 페이지네이션 동작. Lighthouse Performance·Accessibility 측정 후 회귀 항목 0.
- verify-task PASS. knip 신규 0.

## 영향받는 파일

- 점검 후 확정. 후보: `src/app/(content)/sermons/_component/` 하위.

## 단계별 체크리스트

- [ ] 1. 접근성 점검(레퍼런스 8항) → 결함 목록 작성
- [ ] 2. 접근성 결함 국소 수정(aria-label·heading·대비·focus·터치)
- [ ] 3. 성능 점검(이미지·페이지네이션·Lighthouse) → 결함 목록
- [ ] 4. 성능 결함 국소 개선
- [ ] 5. verify-task + Codex 1차 + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-a11y-perf`
- 키보드만으로 sermons 5개 라우트 전 기능 도달 확인
- Lighthouse(접근성·성능) 측정값 점검 전후 비교

## ADR 판단

- **불필요** — sermons app 컴포넌트 국소 점검·개선. ADR_TRIGGER(services·config 등) 미포함. `start-adr.mjs` 미실행.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: Codex 계획 검증 후 갱신

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: 미작성
- **현재 판단**: 미작성
- **다음 행동**: verify-task 후 갱신

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
