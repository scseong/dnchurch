# tech-debt-tracker-split

- **상태**: ✅ 완료 (2026-05-22)
- **시작일**: 2026-05-21
- **브랜치**: feat/sermons-publish-ssot (커밋 시 sermons 작업과 분리)
- **Open questions**: none
- **ADR needed**: no (D1 — ADR 0001 "docs/ 일원화" 범위 내 docs 구조 분할. 런타임·라이브러리·검증 정책 변경 0. 본 plan ADR 판단 섹션으로 갈음)

## 목표

`docs/tech-debt-tracker.md`(430줄, ~12K 토큰)를 인덱스 + `tech-debt/active.md` + `tech-debt/resolved.md`로 분할해 EXPLORE/verify 시 매번 풀로 읽히는 비용을 줄인다. 모든 활성 참조(스킬·스크립트·CLAUDE.md·PR 템플릿)를 같은 PR에서 갱신해 정합성을 유지한다.

## 검증된 Assumptions

- **부채 카운트** — `Grep "^### (🔴|🟡|🟢)" docs/tech-debt-tracker.md`: **활성 36건** + 해결 6건 (Codex 1차 검증에서 정정 — 당초 33건 카운트는 오류였음)
- **활성 참조 위치 22곳 (명시적 갱신 대상)** — `Grep` 전수 확인 완료
  - CLAUDE.md(2), harness-workflow SKILL(1), complete-task SKILL(4), context-loader SKILL(3), hooks README(1), complete-task.mjs(2), docs/README(2), exec-plan _template(1), PR 템플릿 6건(6 — `.github/PULL_REQUEST_TEMPLATE.md` + feature/bugfix/refactor/maintenance/release)
- **동결 참조 22곳 (index shim 통해 자연 연결, 명시적 갱신 안 함)** — `Grep` 전수 확인 완료(Codex 1차에서 3건 누락 발견 → D11 정정)
  - `eslint.config.mjs:85,93`, `src/**/*.tsx` line-disable 주석 8건, `.stylelintrc.json` 메시지 4건, 루트 `README.md:340`, `docs/references/constraints.md:23`, 진행 중 exec-plan 3건의 본문 텍스트 — cleanup-phase1-5:**43,50,74**, cloudinary-asset-structure:110,**132**,199, sermons-a11y-perf:107,219
- **frozen 참조 50+곳 (불변)** — `docs/decisions/`, `docs/exec-plans/completed/`, `docs/research/` 일체. `docs/tech-debt-tracker.md` 파일을 인덱스로 유지하므로 기존 링크 그대로 동작
- **ADR 0001 References** — `docs/tech-debt-tracker` 명시 (line 71, 101). 인덱스 유지로 표현 변경 불필요

## Success Criteria

- [x] `docs/tech-debt/active.md` 생성, 활성 **36건** 항목 본문 그대로 이전 + 파일 수준 scaffolding(제목·intro 1줄)만 추가 (D8) — 압축·항목 추가 0건. 항목 36건은 분할 직전 audit 작업으로 7건 재분류 후 working tree 상태와 일치(HEAD 기준 baseline은 29건)
- [x] `docs/tech-debt/resolved.md` 생성, 해결 6건 본문 그대로 이전 + 파일 수준 scaffolding만
- [x] `docs/tech-debt-tracker.md` 인덱스(≤40줄)로 재작성 — **상단 첫 줄에 source-of-truth 가드 문구(D2)** + 형식 가이드 + 두 파일 링크
- [x] 활성 참조 **22곳** 갱신 (D4·D7 분류) — 일반 부채 언급 → `active.md`, 검색·과거 회상 맥락 → `resolved.md`
- [x] 동결 참조 **22곳**(D11 정정 — 당초 19곳 → Codex 1차에서 3건 누락 발견 → 22곳)은 갱신 안 함 — 인덱스 shim 통해 자연 연결
- [ ] `node scripts/verify-task.mjs tech-debt-tracker-split` PASS
- [ ] 신규 EXPLORE 시뮬레이션 — `Read docs/tech-debt-tracker.md`가 40줄 이내(인덱스만)

## 영향받는 파일

**신규**:
- `docs/tech-debt/active.md`
- `docs/tech-debt/resolved.md`

**구조 재작성**:
- `docs/tech-debt-tracker.md` (430줄 → 인덱스 40줄)

**참조 갱신 (22곳, D4·D7)** — 진입 문서·스킬·스크립트는 명시적으로 `active.md`/`resolved.md`로 안내:
- `CLAUDE.md:41,130` (VERIFY 절차 + 지식 시스템 표)
- `.claude/skills/harness-workflow/SKILL.md:182`
- `.claude/skills/complete-task/SKILL.md:8,65,73,100`
- `.codex/skills/context-loader/SKILL.md:16,27,30`
- `.claude/hooks/README.md:54`
- `scripts/complete-task.mjs:112,206` (안내 메시지)
- `docs/README.md:10,28`
- `docs/exec-plans/_template.md:81`
- `.github/PULL_REQUEST_TEMPLATE.md` + `feature.md`/`bugfix.md`/`refactor.md`/`maintenance.md`/`release.md` 5건

**갱신 안 함 (22곳, D4·D11)** — 인덱스 shim 통해 자연 연결:
- `eslint.config.mjs:85,93` (주석·메시지) — "tech-debt-tracker"가 SSOT 안내 의미로 충분
- `src/**/*.tsx` line-disable 주석 8건 (UserProfileModal, Banner, AboutOurChurch, SignUpForm, SignInForm, KakaoLoginBtn, EmailVerificationRequestForm, about/serving-people/page) — `(tech-debt-tracker.md)` 표기 그대로
- `.stylelintrc.json:6,23,30,37` 메시지 4건
- `README.md:340` (루트, 링크) — `docs/tech-debt-tracker.md` 링크가 인덱스로 자연 연결
- `docs/references/constraints.md:23` — "tech-debt-tracker.md와 연결한다" 표현 유지
- 진행 중 exec-plan 3건 (`tech-debt-cleanup-phase1-5:43,50,74`, `cloudinary-asset-structure:110,132,199`, `sermons-a11y-perf:107,219`) — 진행 중 본문 텍스트 손대지 않음 (D11)

**손대지 않음 (frozen 50+곳)**:
- `docs/decisions/0001, 0003` (ADR)
- `docs/exec-plans/completed/*` (회고)
- `docs/research/*`
- 본 exec-plan 자체(`docs/exec-plans/active/2026-05-21-tech-debt-tracker-split.md:166`)의 template comment 내 `docs/tech-debt-tracker.md` 표기 — exec-plan _template.md를 갱신해도 이미 생성된 본 plan의 주석은 historical artifact라 grep 결과에 남아도 무방 (D6)

## 단계별 체크리스트

- [x] 1. **EXPLORE 마무리** — 활성 참조 전수 확인 완료. 실제 카운트는 갱신 22곳 + 동결 22곳 (D7 — PR 템플릿 6건, D11 — 누락 동결 3건 추가 발견)
- [x] 2. **Codex 계획 검증 요청** — 1차 CR(D1~D4) + 2차 CR(D5~D6) 반영 완료
- [x] 3. **분할 실행** — `docs/tech-debt/active.md`(활성 36건) + `resolved.md`(해결 6건) 본문 verbatim 이전 완료
- [x] 4. **인덱스 재작성** — `docs/tech-debt-tracker.md` 40줄 인덱스로. 첫 줄 source-of-truth 가드 문구(D2) 포함
- [x] 5. **참조 일괄 갱신** — 22곳 갱신 완료 (CLAUDE.md 2, harness-workflow 1, complete-task SKILL 4, context-loader 3, hooks README 1, complete-task.mjs 2, docs/README 2, _template 1, PR 템플릿 6). 동결 22곳 그대로 유지(D11 보강)
- [ ] 6. **Codex 1차 검증 요청** — 다단계 + 22 참조 갱신은 누락 위험. diff 전수 확인 받기
- [ ] 7. **verify-task** PASS 확인
- [ ] 8. **사용자 승인 → 커밋** — sermons 작업분과 selective add로 분리. 단일 commit (`Docs: tech-debt-tracker 활성/해결 분리 + 참조 22곳 갱신`)
- [ ] 9. **머지 후** `complete-task.mjs`로 completed/ 이동

## Verification

- `node scripts/verify-task.mjs tech-debt-tracker-split`
- 수동: `Read docs/tech-debt-tracker.md`가 40줄 이내
- 수동: 갱신 22곳 확인 — `Grep "tech-debt-tracker"` 결과에서 22 위치가 `tech-debt/active.md` 또는 `tech-debt/resolved.md`로 바뀌었는지
- 수동: 동결 22곳 확인 — 위 grep 결과에서 22 위치는 여전히 `tech-debt-tracker.md` 표기 유지 (의도된 shim 연결)

## ADR 판단

- **ADR_TRIGGER_PARTS 변경 여부**: yes (4곳 — `CLAUDE.md`, `scripts/complete-task.mjs`, `.codex/skills/context-loader/`, `.claude/hooks/README.md`)
- **변경 성격**: 문서 경로 분할에 따른 안내·메시지 갱신 + D13 fix에서 `complete-task.mjs` 정규식 bold 호환 보강. 검증 동작은 더 관대해지는 방향이며 정책 변경 아님
- **결정 (D1·D13)**: 신규 ADR 작성 안 함 — ADR 0001 "docs/ 일원화" 범위 내 docs 구조 분할이며, index+split 패턴이 조직 표준으로 굳지 않았음. D13 정규식 fix는 SKILL.md bold 가이드와의 호환성 보강(false negative 감소)으로 일회성 mechanical 변경
- **재발 시 ADR 승격 기준**: 다른 docs(예: ARCHITECTURE.md, 향후 부채 외 인덱스)에 같은 패턴을 한 번 더 적용하게 되면 그때 `0012-docs-index-split` 같은 ADR로 정리

## 후속 작업

- 활성 항목 본문 3줄 룰 압축 (단계 2 — 다음 audit 시점)
  - 이유: 분할과 압축을 같은 PR에 묶으면 diff·검토 비용↑. 두 결정의 효과를 분리해 측정
  - 다음 기준: 다음 분기 audit(2026-08) 또는 활성 항목이 40건 넘어가는 시점
  - 기록 위치: 본 exec-plan completed로 이동된 뒤 별도 plan으로
- 90일 미진행 🟢 항목 분기 검토 (단계 3)
  - 이유: 정기 정리 사이클 도입은 부채 누적 막는 유일한 방법
  - 다음 기준: 2026 Q3 시작
  - 기록 위치: 분기 audit task로

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST(2차) → D5·D6 반영 후 단계 3~5 착수
- **현재 판단**: 1차·2차 plan CR 모두 반영. 단계 3~5 구현 완료 후 별도 Codex 1차 구현 검증 진행 (아래 `## Codex 1차 검증` 참조)
- **다음 행동**: 구현 검증 결과(CR 잔여 발견 시 D8~D11) 반영 후 verify-task 실행

## Codex 1차 검증

- **결론**: 3차 **PASS_WITH_DECISION_LOG** — 7체크 모두 통과. verify-task PASS 완료 → 사용자 승인 후 커밋 진행 가능
- **검증 환경 진단**: Codex 좀비 broker 10개(2026-05-09~05-21) 누적으로 4회 연속 합성 단계 hang → `Get-CimInstance Win32_Process`로 stale broker/app-server 모두 강제 종료 → 깨끗한 runtime에서 5번째 시도부터 정상(9분, 7분) 완료. 근본 원인은 shared runtime endpoint(`cxc-MWt4pI`)가 dead pipe였고 새 task는 살아 있는 다른 broker에 라우팅되지 못함

- **1차 verdict verbatim**:

  ```
  1. FAIL — docs/tech-debt/active.md:7 제목·카운트 변경 포함
  2. FAIL — cloudinary-asset-structure.md:132 추가 동결 참조
  3. FAIL — docs/tech-debt/active.md:7 HEAD active 29건 vs 신규 36건
  4. FAIL — docs/tech-debt-tracker.md:52 40줄 초과
  5. PASS — regex가 old/new 회고 문구 모두 매치
  6. FAIL — 2026-05-21-tech-debt-tracker-split.md:16 stale 21곳
  7. FAIL — tech-debt-cleanup-phase1-5.md:43 동결 표면 19건 초과
  CHANGE_REQUEST
  D8 — verbatim split인지 재분류 포함 split인지 plan에 명시
  D9 — plan의 stale 21곳/19곳 수치와 검증 기준 정정
  D10 — index를 40줄 이하로 줄이거나 성공 기준 변경
  ```

- **2차 verdict verbatim** (D8~D11 반영 후):

  ```
  1. PASS — 대상 diff는 14파일 각 1~4줄, 변경은 참조 치환뿐
  2. PASS — 갱신 22곳, 동결 22곳, 인덱스/신규 파일 참조 분리됨
  3. PASS — HEAD 42개, 분할 후 36+6=42개 보존
  4. PASS — index 26줄, 상단 SSOT guard, 36/6 표기 일치
  5. PASS — complete-task.mjs:112 regex가 tracker.md와 active.md 모두 매칭
  6. FAIL — docs/exec-plans/active/2026-05-21-tech-debt-tracker-split.md:59
  7. PASS — 동결 원본 22곳 변경 없음; D11 목록에는 132/43/50 포함
  CHANGE_REQUEST
  D12 — line 59 frozen 목록에 cloudinary-asset-structure:132 누락됨
  ```

- **풀이**: 6 PASS + 1 FAIL. D12는 plan 영향받는 파일 섹션 line 59의 frozen 목록 표기 일관성 — D11 결정에는 `:132` 포함됐으나 line 59 인라인 표기에서 누락. 한 줄 정정으로 끝남
- **D12 반영 완료**: line 59에 `cloudinary-asset-structure:110,132,199` 표기 추가. D11 결정 로그와 일관

- **3차 verdict verbatim** (D12 반영 후):

  ```
  1. PASS — 대상 16개 경로 기준, 참조 치환/D12 hunk는 1~2줄 범위
  2. PASS — 22 갱신 + 22 동결 + 신규 self-ref/index ref 분리 확인
  3. PASS — HEAD 42개 = active.md 36 + resolved.md 6
  4. PASS — docs/tech-debt-tracker.md:39, SSOT guard와 36/6 표기 확인
  5. PASS — scripts/complete-task.mjs:112, old/new 회고 문구 모두 허용
  6. PASS — docs/exec-plans/active/2026-05-21-tech-debt-tracker-split.md:59
  7. PASS — 동결 22곳 원문 유지, cloudinary-asset-structure:132 포함
  PASS_WITH_DECISION_LOG
  ```

- **다음 행동**: Claude 2차 교차 확인 → 사용자 승인 → 커밋 분리

## 의사결정 로그

- **D1 — ADR 신규 작성 안 함, ADR 0001 범위 내로 처리**
  - 문제: 본 split이 ADR_TRIGGER_PARTS 4곳을 건드려 ADR 판단이 필요. 신규 ADR(후보 B)을 쓸 것인가, 본 plan ADR 판단 섹션으로 갈음할 것인가(후보 A)
  - 해결: 후보 A 채택. 이유 — (1) index+split 패턴이 docs 조직 표준으로 굳지 않았고 (2) 런타임·라이브러리·검증 정책 변경 0이며 (3) ADR 0001 "docs/ 일원화" 범위 안의 하위 분할이라 별도 결정 문서가 중복 정보가 된다. 재발 시점에 ADR로 승격하는 게 적정 비용
  - 결과: ADR 디렉토리에 신규 파일 추가 안 함. 본 plan ADR 판단 섹션이 결정 기록의 SSOT
- **D2 — 인덱스 상단에 source-of-truth 가드 문구 추가**
  - 문제: 호환성을 위해 `docs/tech-debt-tracker.md`를 40줄 인덱스로 유지하면, 나중에 누군가 인덱스가 본문인 줄 알고 신규 부채를 거기에 추가할 위험이 있다
  - 해결: 인덱스 상단 첫 줄에 "신규/활성 항목은 `docs/tech-debt/active.md`에만 기록. 이 파일은 인덱스이며 SSOT 아님" 같은 가드 문구를 굵게 명시. 단순 표현 하나로 표류 위험 차단
  - 결과: 단계 4 인덱스 재작성 시 첫 줄로 박는다. Success Criteria에도 명시
- **D3 — 활성 항목 카운트 33 → 36 정정**
  - 문제: 당초 계획에 "활성 33건"으로 적혀 있었으나 Codex 검증에서 실제 `Grep "^### (🔴|🟡|🟢)"` 카운트가 36건임을 지적
  - 해결: 직접 grep으로 재검증(`Grep` 결과 = 36) 후 모든 carry-over 표기를 36으로 정정. 카운트 오차의 원인은 audit 작업 중 다른 의도(오분류 이동 작업)와 셈을 섞으면서 7건 더 옮긴 것을 누락한 것
  - 결과: Success Criteria·검증된 Assumptions·체크리스트 모두 "활성 36건"으로 통일
- **D4 — 참조 표면 재정의: 갱신 21곳 + 동결 19곳 + frozen 50+곳 3분류**
  - 문제: 당초 계획에 "참조 17곳 갱신"으로 기재. Codex 검증에서 실제로는 `eslint.config.mjs(2)`·`src/ line-disable(8)`·`.stylelintrc.json(4)`·루트 `README.md(1)`·`constraints.md(1)`·진행 중 exec-plan(3) 등 19곳이 추가 발견됨. 또한 각 위치를 "갱신할 것"인지 "동결할 것"인지 명시하지 않으면 grep 검증 기준이 모호해진다
  - 해결: `Grep`으로 전수 재확인 후 40곳을 3분류 — (a) 진입 문서·스킬·스크립트는 명시적 `active.md`/`resolved.md` 안내가 가치 있으므로 **갱신 21곳**, (b) 코드 주석·메시지·진행 중 plan 본문 등 인덱스 통해 자연 연결되는 곳은 **동결 19곳**, (c) frozen 50+곳은 불변. 수동 grep 검증 기준도 두 분류 모두 명시해 평가 가능하게 변경
  - 결과: 영향받는 파일 섹션을 재작성. 갱신 21곳 위치를 라인 단위로 명시, 동결 19곳도 라인 단위로 명시. Verification 섹션 grep 기준을 두 카테고리에 맞춰 수정
- **D5 — 체크리스트 stale "17곳" 표현 3개 정정**
  - 문제: D4에서 영향받는 파일·Success Criteria·Verification 표현은 모두 21/19로 갱신했으나, 체크리스트 본문(단계 1·5·6)에 "17곳"·"17 참조" 표현이 남아 일관성 깨짐. Codex 2차 검증 지적
  - 해결: 단계 1·5·6 표현을 D4 분류에 맞춰 정정. 단계 1은 EXPLORE 완료 사실 반영(40곳/21+19), 단계 5는 "갱신 21곳", 단계 6은 "21 참조 갱신"으로 통일
  - 결과: 체크리스트와 다른 섹션 간 카운트 불일치 0
- **D6 — 본 plan template comment `:166`의 tech-debt-tracker 표기 처리 결정**
  - 문제: 본 exec-plan(`2026-05-21-tech-debt-tracker-split.md`) 자체의 `## 후속 작업` 섹션 template comment(line 166)에 `docs/tech-debt-tracker.md`가 등장. 갱신/동결 분류에서 누락된 채로 grep 결과에 남으면 검증 기준 모호. Codex 2차 검증 지적
  - 해결: "손대지 않음(frozen)"으로 분류. 이유 — (1) template comment는 _template.md에서 복사된 것이며 (2) _template.md는 D4 갱신 21곳에 포함돼 있으므로 다음 plan부터는 신경로가 적용됨. (3) 본 plan의 주석은 이미 생성된 historical artifact라 갱신해도 가치가 작음. 영향받는 파일 "frozen" 섹션에 D6 근거를 명시
  - 결과: grep 결과에 본 plan `:166`이 남는 것이 의도된 동작임을 plan에 박아둠. 검증 시 혼동 없음
- **D7 — 참조 카운트 21곳 → 22곳 정정 (PR 템플릿 누락 1건)**
  - 문제: Codex 1·2차에서 "PR 템플릿 5건"으로 셌으나 실제 grep 결과 `.github/PULL_REQUEST_TEMPLATE.md`(루트) + `feature/bugfix/refactor/maintenance/release.md` = 6건. plan과 SC 표현 모두 21곳으로 기재돼 있었음. 구현 단계에서 첫 batch가 read-precondition 실패 → retry 시 루트 PR 템플릿을 빠뜨릴 뻔
  - 해결: 누락한 루트 PULL_REQUEST_TEMPLATE.md를 추가 갱신. 체크리스트·Success Criteria·영향받는 파일 모두 22곳으로 정정. PR 템플릿 6건임을 명시
  - 결과: 실제 갱신 22곳 = CLAUDE 2 + harness-workflow 1 + complete-task SKILL 4 + context-loader 3 + hooks README 1 + complete-task.mjs 2 + docs/README 2 + _template 1 + PR 템플릿 6. grep 검증 통과
- **D8 — verbatim 정의 명시: "항목 본문 그대로 + 파일 수준 scaffolding 추가". active.md 36건은 working tree 기준(HEAD baseline 29건과 다름)**
  - 문제: Codex 1차에서 (1) `active.md:7` 제목·카운트 변경 포함 = 비verbatim 지적, (3) HEAD active 29건 vs 신규 active.md 36건 불일치 지적. plan은 단순히 "verbatim 이전"으로만 적혀 검증 기준 모호
  - 해결: verbatim 정의를 명확화 — "각 부채 항목 본문은 글자 그대로, 파일 수준 scaffolding(제목 라인 1줄·intro 1줄·SSOT 안내·인덱스 링크)은 신규 추가 허용". 36 vs 29 차이는 split 작업 직전 같은 uncommitted working tree에서 audit 작업으로 `해결된 항목` 섹션의 🟢/🟡 7건을 활성으로 옮긴 결과 — split의 baseline은 HEAD가 아닌 post-audit working tree이며 두 변경이 한 commit/PR로 묶임을 plan에 명시
  - 결과: SC에서 "본문 그대로 이전"을 "항목 본문 그대로 + 파일 수준 scaffolding"으로 정정. 36 vs 29 차이를 의도된 결과로 plan에 박음. verbatim 검증은 `### ` 헤더 본문 라인(항목 시작)만 비교하는 기준으로 좁힘
- **D9 — plan stale 21곳/19곳 표기 일괄 정정 (Codex 1차 D9 권고)**
  - 문제: plan line 16에 "21곳 (명시적 갱신 대상)"이 남아 있었음. line 19 "동결 19곳"도 D11에서 22곳으로 바뀌어야 함. 검증된 Assumptions 섹션과 다른 섹션 간 일관성 깨짐
  - 해결: plan 검증된 Assumptions 섹션 모두 "22곳 갱신 / 22곳 동결"로 정정. PR 템플릿 카운트도 "5건(5)" → "6건(6)"으로 보강
  - 결과: plan 내 모든 카운트가 22/22로 통일됨. grep으로 stale 표기 0건 확인
- **D10 — 인덱스 40줄 이하 강제 (audit notes 14줄 → 1줄 압축)**
  - 문제: Codex 1차에서 `docs/tech-debt-tracker.md:52` 40줄 초과 FAIL. 원인은 파일 끝의 audit notes 주석 블록 14줄(2종 audit 회상). SC가 "≤40줄"이라 위반
  - 해결: audit notes를 1줄 "변경 이력은 docs/exec-plans/completed/ 또는 git log 참조"로 압축. 상세 내용은 split exec-plan과 git log에 이미 있어 인덱스 파일에 중복할 필요 없음
  - 결과: 인덱스 파일 52 → ~40줄. SC 충족. 정보 손실 없음 (exec-plan과 git log가 SSOT)
- **D11 — 동결 참조 19 → 22곳 정정 (3건 누락 발견)**
  - 문제: Codex 1차에서 누락 동결 참조 3건 발견 — `cloudinary-asset-structure.md:132`(자유 텍스트의 "tech-debt-tracker" 언급), `cleanup-phase1-5.md:43,50`(체크리스트 "tech-debt-tracker 갱신" 표기). 모두 진행 중 exec-plan 본문 텍스트
  - 해결: D4 동결 목록에 3건 추가. 진행 중 exec-plan 분류를 "본문 텍스트 손대지 않음"으로 명확화 — 체크리스트 항목·자유 텍스트 모두 동결
  - 결과: 동결 22곳 = eslint.config.mjs(2) + src/ line-disable(8) + .stylelintrc.json(4) + 루트 README(1) + constraints.md(1) + 진행 중 exec-plan 6건(cleanup-phase1-5:43,50,74 / cloudinary-asset-structure:110,132,199 / sermons-a11y-perf:107,219). 합 22곳
- **D13 — PR #100 리뷰 반영: 정규식 bold 라벨 + 헤더 아이콘 + plan 중복 섹션 (Gemini + Codex 합의 3건)**
  - 문제: PR #100 머지 전 리뷰에서 Gemini bot 2건(G1: 정규식 bold 미인식, G2: active.md:315 아이콘 불일치)과 Codex 독립 리뷰 1건(GAP: plan에 stale `## Codex 1차 검증` 섹션 중복) 발견. G1·G2는 Codex가 VALID로 교차 검증, GAP는 Gemini가 놓친 단독 발견
  - 해결: (1) `complete-task.mjs:110-112` 3개 regex 모두 `(\*\*)?...\1` 추가 — Node 엔진 직접 테스트로 bold·plain·new·old 4조합 모두 매칭, asymmetric·filled은 정상 미매칭 확인. PowerShell(.NET)에서는 `(X)?` 미매칭 시 `\1` 백레퍼런스 거동 다르나 실제 실행 환경은 Node이므로 무관. (2) `active.md:315` 헤더 🟡 → 🟢 (본문 "마이그레이션 가능"과 일관). HEAD pre-existing 결함이었으나 verbatim 원칙(D8)보다 내부 일관성 우선. (3) plan line 214의 중복 `## Codex 1차 검증` 템플릿 skeleton 삭제 — line 114의 실제 PASS_WITH_DECISION_LOG 섹션이 SSOT
  - 결과: ADR 추가 없음 — 검증 정책 변경 아니라 SKILL.md bold 가이드와의 호환성 보강. 정규식이 더 관대해지는 방향(false negative 줄어듦). D8 verbatim 원칙은 "항목 본문 그대로 + 파일 수준 scaffolding"이라 헤더 아이콘 일관성 수정은 scaffolding 범주

## Claude 2차 검증

- **최종 판단**: PASS — Codex 1차 PASS_WITH_DECISION_LOG + verify-task PASS + diff 교차 확인 클린
- **현재 판단**:
  - Codex가 3차에 걸쳐 짚은 7 위험(외과적 변경/카운트/verbatim/index/regex/plan 일관성/동결) 모두 PASS
  - 좀비 broker 정리(10개) → 재검증 환경 복구 → 안정적 verdict 확보. 근본 원인 진단·해결까지 plan에 기록
  - verify-task 증적 `logs/tech-debt-tracker-split/20260521-224324/` — ESLint·stylelint·build PASS, Knip은 기존 부채 베이스라인
  - 영향 파일 16개 modified + 2 new + 1 rewrite. 모두 path-swap 또는 의도된 재작성. sermons-publish-ssot 작업과 같은 working tree에 섞여 있으나 selective add로 커밋 분리 예정 (D8 작업 분리 원칙)
- **다음 행동**: 사용자 승인 → tech-debt 범위만 `git add` → `Docs: tech-debt-tracker 활성/해결 분리 + 참조 22곳 갱신` commit

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

## 회고

- **잘된 것**: 좀비 broker 진단·정리로 Codex 합성 hang 근본 원인 해결, 검증 정확도 확보.
  - 좀비 broker 10개(2026-05-09~05-21 누적)가 shared runtime endpoint `cxc-MWt4pI` dead pipe로 합성 IPC 차단. `Get-CimInstance Win32_Process`로 확인 후 종료. 깨끗한 런타임에서 9분·7분에 안정 완료(4회 hang → 5회차부터 정상)
  - Codex 1차 3라운드(CR→CR→PASS_WITH_DECISION_LOG) + Claude 2차 PASS + Gemini bot 인라인 리뷰 + Codex 독립 리뷰 cross-check로 결함 3건 추가 발견(G1·G2·GAP) → D13으로 모두 반영. 단일 리뷰어보다 정확도 ↑
  - D1~D13 결정 로그가 plan에 모두 박혀 있어 검증 history 추적성 유지. 좀비 broker 진단 과정도 plan에 기록
  - 분할 후 인덱스 39줄로 정착 — EXPLORE 시 토큰 비용 12K → ~1K (개념상 92% 절감 가능)
- **다음에 할 것**: 본 task 범위 밖이지만 가까운 시점에 다룰 일.
  - 항목 본문 3줄 룰 압축 — 다음 분기 audit(2026 Q3) 또는 활성 항목 40건 초과 시점에 별도 task
  - 분기별 90일 이상 미진행 🟢 항목 archive 정책 도입 — 2026 Q3 첫 실행. `docs/tech-debt/archive/<year>-Q<n>.md` 디렉토리 패턴 후보
  - `docs/tech-debt/active.md` 다른 항목 헤더 아이콘 일관성 audit — 이번에 1건(설교 첫재생 지연) 발견했지만 다른 항목도 점검 가치 있음
  - 다음 PR부터 commit-msg hook R4 룰(subject `+` 다중 concern 차단) 의식 — subject는 단일 의도로 통일하고 본문에 분해
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: 없음 — 본 PR 자체가 tech-debt-tracker 운영 비용 개선 작업이며 신규 부채 발견 0건

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

