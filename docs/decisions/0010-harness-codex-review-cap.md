# 0010 — Harness CODEX_PLAN_REVIEW 범위 한정 + plan 압축 + EXPLORE 직접 검증

- **Status**: Accepted (확장 개정 — ADR 0023)
- **Date**: 2026-05-14
- **Deciders**: scseong, Claude Opus 4.7, Codex
- **Tags**: harness, agent-collaboration, workflow

> ⚠️ **2026-07-21 ADR 0023이 확장·개정**: 본 ADR이 정한 "compact exec-plan = 6섹션 + verdict 3섹션"(아래 § Decision)에서 verdict 3섹션은 위험도 tier 모델로 대체됐다. `Claude 2차 검증`은 폐지(verify-task 기록으로 병합), Codex 1차는 Tier 2에서만 요구. 본 ADR의 CODEX_PLAN_REVIEW material-only cap과 `PASS_WITH_DECISION_LOG`는 계획 검증에서 그대로 유효하다.

## Context

ADR 0008(코드 품질 강제 — 에이전트 리뷰 tier)과 ADR 0001(Codex 위임 전략) 운영 결과, **단일 컴포넌트 한 페이지 작업이 4시간** 걸리는 사례 발생.

phase 1-1(sermons-featured, `docs/exec-plans/active/2026-05-14-sermons-featured.md`)에서 측정된 누적 손실:

- Codex 계획 검증 5라운드 — 14건 CR 중 **11건이 plan-text expression 충돌** (예: "코드 변경 0줄" vs "1줄 변경" 표현 모순, "신규" vs "교체" 라벨 차이, 의사결정 로그 typo)
- Phase 0 audit가 `is_featured` 컬럼 존재를 잘못 claim — EXPLORE에서 직접 SQL 확인 안 함 → Codex 1차에서야 BLOCK 발견
- `<Image>` vs `<CloudinaryImage>` wrapper 컨벤션 누락 → yarn build 실패로 10분 손실
- harness-gate same-line regex가 label-only 라인을 미작성으로 오판 → 5분 정정
- hook이 단순 plan re-save에도 매 Write/Edit마다 알림 발화 (debounce 부재)

5체크가 "5체크 미충족 시 CR 기본"으로 정의되어 있어 Codex가 표현·문장 품질도 CR로 분류 → 5라운드 폭주. 사용자 피드백: **"5분이면 될 작업을 1시간이 넘게 걸렸어. 이건 심각한 문제야."** 잔여 phase ≥ 20 + 누적 손실 20-30시간 risk.

본 ADR을 적용 안 하면: ADR 0008 메커니즘 2(detection: 검증 결과 기록 규칙)는 운영되지만, 메커니즘 1(generation: Codex 1차+Claude 2차)이 비용 곱셈으로 작동해 phase별 30-45분 목표가 120분으로 실측.

## Decision

`CODEX_PLAN_REVIEW`는 **material implementation risk만** `CHANGE_REQUEST`로 분류하고, 문서 표현·plan-text consistency는 구현 판단을 바꾸지 않는 한 `## 의사결정 로그`에 1줄 기록한 뒤 WORK로 진행한다. 새 결론 토큰 `PASS_WITH_DECISION_LOG`를 도입한다.

단일 컴포넌트·작은 PR은 compact exec-plan(목표/검증된 Assumptions/SC/영향 파일/체크리스트/Verification 6 섹션 + verdict 3 섹션)을 기본으로 한다. 구현 의존 claim(컬럼/타입/라우트/토큰/wrapper 컨벤션)은 EXPLORE에서 코드/DB/generated source로 직접 확인한다 — audit·doc은 보조.

Hook은 plan 핵심 섹션(`목표 + Success Criteria + 영향받는 파일 + Verification`) hash가 직전 알림 시점과 다를 때만 재발화하며 (debounce), harness-gate는 검증 섹션의 verdict token + placeholder denylist + 최소 30자 본문을 강제하고 same-line label-only formatting은 강제하지 않는다.

구체 변경(7건):

1. `.claude/skills/harness-workflow/SKILL.md` § CODEX_PLAN_REVIEW — CR 정의(material만) + must-CR 8개 + expression 5개 + `PASS_WITH_DECISION_LOG` 토큰 + 호출 프롬프트 템플릿 inline.
2. 동일 SKILL.md § EXPLORE — 구현 의존 claim 직접 검증 표(DB/타입/라우트/토큰/wrapper) + surface only 명시.
3. `docs/exec-plans/_template.md` — 17 섹션 → 6 필수 + 3 검증, 가이드 주석으로 압축. `Open questions: none | <list>` / `ADR needed: no | yes — <reason>` 1줄 mandatory.
4. `scripts/harness-gate.mjs` — verdict token 매트릭스(섹션별 허용 verdict), placeholder denylist(`TBD/미요청/미작성/N/A/none/-/—`), 최소 30자 본문, `--plan-file <path>` dry-run 옵션.
5. `tests/harness/{valid,placeholder,revised-after-review}.md` — fixture 3개. 각각 PASS / FAIL / PASS_WITH_DECISION_LOG 경로 시연. 신규 디렉토리(`tests/`는 dnchurch에 없음 — 본 harness 검증 용도로 신설).
6. `.claude/hooks/check-codex-after-plan.mjs` — section hash 기반 debounce(`os.tmpdir()/dnchurch-check-codex-after-plan.state.json` per-file map). verdict 토큰 존재 시 skip(기존) 유지.
7. 본 ADR.

## Override (필수)

다음 조건 1건 이상 hit 시 본 ADR cap·compact·debounce 자동 해제하고 ADR 0008 + 0001 원형으로 복귀.

- 변경 파일 ≥ 20 또는 LOC ≥ 500
- ADR_TRIGGER_PARTS 다중 영역 (services + scripts + .claude/ 등)
- 라이브러리 마이그레이션 (package.json deps 신규/제거)
- 인증/캐시/배포/DB schema 변경
- **`.github/workflows/` 변경** (CI/CD 파이프라인 — 머지 후 즉시 모든 PR에 적용)
- **`supabase/migrations/` 신규 파일** (run 안 된 migration 포함 — schema drift 위험)
- **보안 민감 PR** (RLS policy / secret / `src/lib/auth*` / `middleware.ts` / cookie scope)
- 사용자 명시 `STRICT_REVIEW` 요청

해제 시: full template + Codex review 무제한 라운드 + 기존 hook 빈도. exec-plan `## 의사결정 로그`에 "Override 적용 사유" 1줄 기록.

## Rollback Triggers (필수)

3 sub-phase(예: phase 1-2/1-3/1-4) 누적 후 측정. 1건 이상 hit 시 본 ADR 재검토.

- 평균 phase 시간 본 ADR 적용 전(실측 120분) 대비 50% 미만 개선 (즉 60분 초과 유지)
- 1차 검증·PR review에서 material 사후 발견 2× 증가 (phase 1-1 기준)
- harness-gate placeholder 통과 사례 1건 (fixture로 차단됐어야 할 verdict가 main에 머지)
- 사용자 "검토 부족" 피드백 1건

### 측정 방식

KPI는 **completed exec-plan의 회고 섹션**에 mandatory 5필드로 기록한다. 후속 PR에서 `scripts/complete-task.mjs`가 회고 필드를 파싱해 `logs/harness-kpi.jsonl`에 append하도록 보강.

```
## 회고 (필수 5필드)
- KPI / 시작-종료 (분): <int>
- KPI / Codex 라운드: <int>
- KPI / material 사후 발견: <int>
- KPI / harness-gate placeholder fail: <int>
- KPI / 사용자 검토 부족 피드백: <int>
```

측정 책임자: phase 머지 후 `node scripts/complete-task.mjs <slug>`를 실행하는 작업자(보통 본 PR 머지자). `logs/harness-kpi.jsonl`은 commit 대상 아님(`logs/`는 .gitignore 가정 — 본 ADR 머지 시 확인). 3 sub-phase 누적 시 `node scripts/measure-harness.mjs`(후속 추가) 또는 수동 집계로 위 4 트리거 hit 여부 판정.

회고 5필드가 미작성이면 `complete-task.mjs`가 차단(후속 보강 — 본 ADR 머지 후 1주 내 별도 PR).

## Consequences

### 긍정적

- Codex 라운드 수 평균 1-2회로 감소 (phase 1-1: 5라운드 → 목표 1-2)
- plan 라인 수 17 섹션 → 6+3 (검증) — 작성·읽기 비용 60% 감소
- EXPLORE에서 BLOCK 사전 발견 — phase 1-1의 `is_featured` 같은 케이스 100% 차단 목표
- hook 알림 평균 횟수 phase당 12회 → 2-3회 (section hash debounce)
- harness-gate가 verdict + 본문 충실도 강제 — placeholder 통과 0건 (fixture 차단 확인됨)

### 부정적 / 트레이드오프

- `PASS_WITH_DECISION_LOG` 분류 모호 케이스에서 reviewer가 expression으로 잘못 분류해 material risk 누락 가능 — SKILL.md에 "애매하면 material로 승격" 룰로 완화. fixture·실사례 누적 후 SKILL § must-CR 예시 보강 필요.
- compact template이 다단계 구조 변경에는 부적합 — Override 조건으로 자동 해제.
- `tests/` 디렉토리 신설 — dnchurch는 "테스트 환경 없음"(CLAUDE.md) 정책. 본 디렉토리는 단위 테스트가 아닌 fixture 검증 전용이므로 정책과 충돌 없음. README 추가 권장(후속).
- ADR 0008 메커니즘 1(generation) 약화 risk — 단 메커니즘 2(detection: 검증 결과 기록 규칙)는 그대로. harness-gate placeholder denylist로 detection 강화 효과 상쇄.

### 영향 범위

- 코드: `.claude/skills/harness-workflow/SKILL.md`, `.claude/hooks/check-codex-after-plan.mjs`, `scripts/harness-gate.mjs`, `docs/exec-plans/_template.md`, `tests/harness/*` (신규)
- 운영: 모든 후속 phase의 EXPLORE/PLAN/CODEX_PLAN_REVIEW 절차. 직전(phase 1-1) plan은 본 ADR 적용 전 형식이므로 그대로 머지 가능 — 본 ADR 머지 후 phase부터 신 규칙 적용.

## Alternatives Considered

### A안: status quo 유지 — 기각

phase별 누적 손실 20-30시간 / 잔여 phase ≥ 20 → 본 ADR 적용으로 60% 절감 시 12-18시간 회수. status quo 비용이 결정 비용보다 큼.

### B안: Codex 호출 프롬프트만 수정 — 기각

SKILL.md 기본 정의("5체크 미충족 = CR 기본")가 그대로면 reviewer incentive 변화 없음. 한 번 통과한 프롬프트도 다음 작업에서 모델 컨텍스트가 달라지면 재현 안 됨.

### C안: SKILL만 수정, template 유지 — 기각

template 17 섹션이 plan 비대 + 표현 충돌의 원인 — 효과 절반.

### D안: harness-gate·hook만 수정 — 기각

주 원인(Codex 5라운드 폭주)에 직접 작용하지 않음. 보조 도구만 정비해선 phase 시간 50% 절감 어려움.

### E안: Codex review 전부 생략 — 기각

material risk(예: phase 1-1의 `is_featured` BLOCK, 필터 base path 4곳 변경) 누락 시 사후 비용이 review 비용보다 큼. ADR 0001 위반.

### F안: ADR 0008 자체 폐기 — 기각

코드 품질 메커니즘 상실. ADR 0008의 의도는 정확, **운영(reviewer가 5체크를 strict 적용)이 잘못된 것** — 본 ADR이 운영 보완.

## References

- 관련 PR: 본 ADR을 도입하는 PR (TBD — PR 본문에 채움)
- 관련 exec-plan: `docs/exec-plans/active/2026-05-14-harness-codex-review-cap.md` (메타 작업 핸드오프, E1~E7 결정 포함)
- 실측 사례: `docs/exec-plans/active/2026-05-14-sermons-featured.md` (Codex 5라운드 / 11건 expression CR / `is_featured` BLOCK / `<Image>` build 실패 / harness-gate same-line trap)
- 관련 ADR: 0001(Codex 위임 전략), 0008(코드 품질 강제) — 본 ADR이 0008 메커니즘 1 운영을 보완, 0001 위임 트리거는 유지
