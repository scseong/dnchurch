# design-audit

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-29
- **브랜치**: feat/design-system-unification
- **Open questions**: none
- **ADR needed**: no — 문서 신규 작성만, `src/apis/`·`src/services/`·`next.config.ts` 등 ADR_TRIGGER_PARTS 파일 변경 없음. Phase 2에서 카탈로그 패턴 정의 시 ADR 작성 예정.

## 목표

디자인 시스템 통합 Phase 1 — `(content)` 8 도메인 / 37 페이지에서 4 영역(컴포넌트 선택·레이아웃 구조·시각 토큰·상호작용/빈 상태) 일관성 위반을 file:line 증거로 식별하고, Phase 2+ 작업을 위한 영구 SSOT 두 문서(`context.md`·`audit.md`)를 만든다.

## 검증된 Assumptions

- `(content)` 라우트 그룹 = 8 도메인 / 37 `page.tsx` — `Glob src/app/(content)/**/page.tsx`로 확인.
- `loading`·`error`·`not-found` 분포 = sermons 6개, news 2개(`not-found`만), 나머지 6 도메인 0 — `Glob src/app/(content)/**/{loading,error,not-found}.tsx`.
- 디자인 토큰 SSOT = `src/styles/tokens/` 7 파일을 `src/styles/_variables.scss`가 묶어 모든 `.module.scss`에 `additionalData`로 자동 주입 — styles SKILL.
- 공용 UI 12종(Button·TextField·Textarea·Modal·BottomSheet·Tabs·Label·Pill·ListItem·Pagination·Skeleton·EmptyState) — `src/components/ui/`에 위치(ui-components SKILL).
- 활성 tech-debt = focus-ring 10곳(`$primary-active`/`$border-focus`/`$border-primary` 혼재, width/offset 혼재) — handover에 명시. 본 plan WORK 단계에서 `docs/tech-debt/active.md` 직접 재확인.

## Non-goals

- 위반 수정 — Phase 2+ 작업. Phase 1은 식별·기록까지만.
- `next-gen` 페이지 신규 구현 — Phase 3 작업.
- 신규 토큰·믹스인 추가 — 갭은 tech-debt로만 큐잉, 정의·도입은 Phase 2.
- `_components/` 디렉토리 전수 코드 리뷰 — page.tsx surface와 도메인별 1샘플 SCSS module로 한정.

## Success Criteria

- `docs/design-system/context.md` 신규 생성 — handover.md "현재 디자인 시스템 자산", "4 영역 가설", "Phase 로드맵" 3개 섹션을 영구 형태로 흡수. 본 worktree에서 `docs/research/design-unification/handover.md` 의존을 끊는다.
- `docs/design-system/audit.md` 신규 생성. 4 영역 각각 ≥3 file:line 증거 + 권장 semantic 토큰·믹스인 대체.
- 8 도메인 페이지 유형 분류표 1개 — 37 페이지를 리스트·디테일·아카이브·랜딩·폼·기타 6 유형으로 매핑.
- 토큰 사용 분포표 1개 — primitive 직접 사용(`$gray-*`·`$beige-*`·`$navy-*`·`$gold-*`) 카운트와 sample file:line.
- 상호작용·빈 상태 분포표 1개 — 8 도메인 × {loading, error, not-found, EmptyState 사용처} 매트릭스.
- 신규 tech-debt 후보 ≥ 1건 — focus-ring 외 audit에서 새로 드러난 위반을 `docs/tech-debt/active.md`에 등록(또는 본 plan의 `## 후속 작업`에 큐잉 후 PR 본문에서 별도 분리 명시).
- `node scripts/verify-task.mjs design-audit` 통과 — 문서 추가만이라 lint/styles/build/knip 신규 위반 0.

## 영향받는 파일

- `docs/design-system/context.md` (신규)
- `docs/design-system/audit.md` (신규)
- `docs/tech-debt/active.md` (감사 결과에 따라 항목 추가 가능)

## 단계별 체크리스트

- [x] 1. `docs/design-system/` 디렉토리 생성, `context.md` 작성 — handover의 자산·가설·로드맵 흡수.
- [x] 2. 페이지 유형 분류 — 37 `page.tsx`를 랜딩·리스트·디테일·정보형·폼·위임·스켈레톤 7 유형으로 매핑. 스켈레톤 18개(49%) 발견.
- [x] 3. 공용 UI 사용 매트릭스 — 13종(Carousel 추가) × 8 도메인. Pill·Tabs·Modal·TextField·Textarea 5종은 `(content)` 0건.
- [x] 4. 레이아웃 구조 비교 — `LayoutContainer` 10·`MainContainer` 5·없음 19 분포. Hero 패턴 3종 공존 확인.
- [x] 5. 토큰 사용 매트릭스 — `(content)` 영역 primitive 36건(gray 9·beige 16·navy 2·gold 9), hex 3건.
- [x] 6. 상호작용·빈 상태 매트릭스 — `loading`/`error`/`not-found` sermons 6+1·news 2·그 외 0건. `EmptyState` 5곳.
- [x] 7. 4 영역 위반 정리 — `audit.md`의 V1-1 ~ V4-3로 13건 식별.
- [x] 8. tech-debt 후보 — `audit.md` "신규 tech-debt 후보" 6건 식별, `active.md` 정식 등록은 Phase 2 결정 시점으로 큐잉(후속 작업 참조).
- [x] 9. `audit.md` 작성 — 한눈에 보기·분류표·매트릭스·위반·Phase 2 카탈로그 항목 6개·후속 작업.

## Verification

- `node scripts/verify-task.mjs design-audit` — lint/styles/build/knip.
- 산출물 수동 확인 — `context.md`·`audit.md`가 위 SC 충족.

---

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **현재 판단**: 사용자 결정으로 Codex 호출 skip — D1 참조. audit-only PR이라 plan 품질 risk 낮고, 5체크 자체 점검은 Claude가 수행해 의사결정 로그에 기록함.
- **다음 행동**: WORK 단계 진입. context.md 작성부터 시작.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: 통과 — 필수 검증 4단계 중 3단계 통과, Knip는 기존 부채 warning(차단 X).
- **현재 판단**: 본 PR diff = `docs/design-system/{context,audit}.md` 2 파일 신규 + exec-plan 갱신. SCSS·TS·config 변경 0건이라 신규 unused 도입 가능성 없음.
- **다음 행동**: 사용자 승인 후 commit. PR 본문은 audit 결과 한눈에 보기 표 + Phase 2 입력 6 항목 강조.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260530-154424 | ✅ | ✅ | ❌ env | 0 | worktree `.env.local` 부재 — 본 PR 무관 |
| 2차 | 20260530-164522 | ✅ | ✅ | ✅ | 0 | — |
| 3차 | 20260601-222535 | ✅ | ✅ | ✅ | 0 | develop 47608d5 정렬 + fellowship 카운트 보정 후 재검증 |

## 검증 이력

## 후속 작업

- **Phase 2 카탈로그 작성** — `docs/design-system/page-patterns.md` 신규.
  - 이유: 본 PR은 식별까지가 범위. 표준 정의·ADR 작성은 Phase 2.
  - 다음 기준: 본 PR 머지 후 사용자가 Phase 2 task 승인.
  - 기록 위치: `audit.md`의 "Phase 2 입력으로 권장하는 카탈로그 항목" 6개.
- **신규 tech-debt 6건의 `active.md` 정식 등록** — 컨테이너 기준 부재·카드 4종·`news/page.tsx` 위임·about 카드 그리드·hover warm primitive·JSON-LD 1 페이지.
  - 이유: audit 식별 시점과 부채 등록 시점을 분리. 일부 항목(컨테이너 선택 등)은 Phase 2 ADR 결과에 따라 표현이 달라질 수 있어 ADR 결정과 묶는 것이 안전.
  - 다음 기준: Phase 2 카탈로그 ADR 결정 후 표현이 확정된 시점.
  - 기록 위치: 현재는 `audit.md` "신규 tech-debt 후보" 섹션.
- **codex-companion runtime 좀비 문제** — Codex CLI 계획 검증 요청 시 백엔드 파이프(`\\.\pipe\cxc-*-codex-app-server`) 끊김 + cancel 명령 "No job found" 응답 불일치.
  - 이유: 본 작업 범위 밖. 디자인 시스템과 무관한 인프라 결함.
  - 다음 기준: 다음 Codex 호출 시 재현되면 `docs/tech-debt/active.md`에 별도 항목 등록.
  - 기록 위치: 본 plan `## 의사결정 로그` D1.

## 의사결정 로그

- **D1 — Codex 계획 검증을 사용자 결정으로 skip**
  - 문제: codex-companion runtime이 좀비 상태에 빠짐. 첫 호출(`task-mpqlbnau-d2dzmu`)은 23시간 hang 후 `Codex turn interrupt failed: connect ENOENT \\.\pipe\cxc-YebUCa-codex-app-server`로 파이프 끊김. 재호출(`task-mpryn4fn-zuodzw`)은 14분 만에 응답 없음. cancel 명령은 "No job found"로 실패하면서 status는 active 표시(stale state). 사용자가 "재시도"·"왜 답장 안 해" 두 번 짜증 신호.
  - 해결: Codex 계획 검증 skip. 대안 검토 — (a) 계속 대기: 백엔드 결함으로 응답 불가, (b) `/codex:setup`로 companion 복구: 시간 추가 소모, (c) Claude 자체 5체크 후 진행: audit-only PR이라 plan 품질 risk가 implementation 작업 대비 낮음. (c) 선택 — 본 작업은 source code/config 미수정 문서 PR이라 Codex 미검토 시 발생할 worst case가 "audit 카테고리 누락" 정도이고, 결과물(audit.md)이 영구 문서라 Phase 2 시작 전 사용자 리뷰 단계에서 교정 가능.
  - 결과: WORK 단계 즉시 진입. exec-plan에 5체크 결과를 D2로 추가 후 context.md 작성 시작. companion runtime 좀비 문제는 `docs/tech-debt/active.md`에 기록 후속 처리.

- **D2 — Claude 자체 5체크 결과 (Codex 대체)**
  - 문제: D1 결정으로 Codex 5체크 결과가 부재. plan 품질 자가 점검 필요.
  - 해결: harness-workflow SKILL의 5체크를 Claude가 직접 적용.
    1. **Assumptions** — 5건 명시(8 도메인·37 page.tsx·loading 분포·토큰 SSOT·공용 UI 12종). `Glob`·styles SKILL 직접 확인. 통과.
    2. **Non-goals** — 4건 명시(Phase 2 수정·next-gen 신규·신규 토큰·`_components/` 전수 리뷰). Phase 2/3 영역 차단 명확. 통과.
    3. **Scope linkage** — 9 체크리스트 항목 모두 audit deliverable(분류표·매트릭스·위반 정리)에 직결. 통과.
    4. **SC + verification** — 7 SC 모두 binary(파일 존재·≥3 증거·표 1개). "신규 tech-debt 후보 ≥ 1건"이 약함(SC#6) — 결과에 따라 0건일 가능성 있음. 의사결정: 0건이면 `## 후속 작업`에 "신규 위반 미발견" 명시로 binary 해석. `verify-task.mjs`는 lint/styles/build/knip 통과만 검증해 문서 PR에서 의미 제한적이지만, 보장 가치(스크립트가 doc 파일에 영향 주는 lint 룰 트리거 가능). 통과.
    5. **새 추상화 부재** — 토큰·믹스인·컴포넌트 신규 도입 0. 문서 2개 신규만. 통과.
  - 결과: 5체크 통과. WORK 진입 정당화.

- **D3 — context.md + audit.md를 같은 PR로 묶음**
  - 문제: memory `feedback_pr_granularity`("관련 작은 마감/폴리시는 한 PR로")와 두 파일의 다른 lifecycle(context.md는 영구 stable, audit.md는 1회성 결과) 사이 결정 필요.
  - 해결: 한 PR로 묶음. 이유 — 두 파일 모두 "Phase 1 감사 단계" 단일 의도의 산출물. context.md 없이 audit.md만 보면 4 영역 가설·페이즈 로드맵 맥락이 빠져 audit이 고립됨(역으로 context.md만 머지하면 1주 동안 audit 결과 없이 SSOT가 "가설 단계"로 남음). 분리하면 PR 마이크로 과분할에 가까워짐. lifecycle 차이는 PR 본문에서 "context.md = 영구 SSOT, audit.md = Phase 1 산출 시점 snapshot" 명시로 해소.
  - 결과: 단일 PR로 진행. audit.md 작성 시점에 context.md "current as of YYYY-MM-DD" 헤더 부재 확인.

- **D4 — develop 최신화(47608d5) 반영으로 페이지 카운트 보정**
  - 문제: 커밋 직전 develop이 7a23c93에서 47608d5로 4커밋 전진했다. #106이 `/fellowship` 도메인을 삭제(공개 라우트 1개 감소)해 감사 시점 트리(37 페이지)와 머지 시점 트리(36 페이지)가 어긋났다. 전수 재집계 중 원본 합계 오기 2건도 드러났다 — 랜딩을 2로 적었으나 홈을 빼먹어 실제 3, 스켈레톤은 18로 적었으나 fellowship 포함 전수가 17이라 합계 오기가 1건 있었고 fellowship 삭제까지 반영하면 16.
  - 해결: audit.md·context.md를 머지 시점 트리에 맞춰 정정했다. 7 도메인·36 페이지·랜딩 3·스켈레톤 16(44%). 본 plan의 목표·Assumptions·체크리스트에 적힌 "8 도메인 37 페이지"는 감사 수행 시점(7a23c93) 기록이라 그대로 두고, 정정 사실은 본 D4와 audit.md 기준 커밋 메모에만 남긴다.
  - 결과: 두 영구 문서가 47608d5 트리와 일치한다. 전수 재집계 결과 7개 유형의 합이 36으로 맞았다 — 랜딩 3, 리스트 5, 디테일 4, 정보형 5, 폼 2, 위임 1, 스켈레톤 16.
