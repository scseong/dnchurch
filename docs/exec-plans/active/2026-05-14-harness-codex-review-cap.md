# harness-codex-review-cap

- **상태**: 🟡 진행 중 (분석·합의 완료, 구현 대기)
- **시작일**: 2026-05-14
- **브랜치**: 미정 (`feat/harness-codex-review-cap` 또는 `chore/harness-...` 권장 — 확인 필요)
- **선행**: PR #86(Phase 0) 머지 완료, PR #?(sermons-featured, 커밋 `38377a3` `feat/sermons-featured` 브랜치, 푸시는 됐으나 사용자 결정으로 PR 미생성)

---

## 작업 문서

### 1. 목적

dnchurch 하네스 워크플로우(`EXPLORE → PLAN → CODEX_PLAN_REVIEW → WORK → CODEX_FIRST_PASS → VERIFY → COMMIT`)가 단순 feature에서 **12× 오버헤드**를 만든 운영 결함을 시스템적으로 차단한다.

**증거**: Phase 1-1 (sermons-featured, 단일 컴포넌트 1 PR 규모)가 예상 5분 → 실측 ~2시간 소요. CODEX_PLAN_REVIEW 5라운드 중 14건 누적 CHANGE_REQUEST, 11건(79%)이 **plan-text 표현 모순**, 3건만 실질적 코드 영향.

**변경 대상**:
- `.claude/skills/harness-workflow/SKILL.md` (§ EXPLORE / § CODEX_PLAN_REVIEW)
- `docs/exec-plans/_template.md`
- `scripts/harness-gate.mjs`
- `.claude/hooks/check-codex-after-plan.mjs`, `post-implementation-review.mjs`
- `docs/decisions/0010-harness-codex-review-cap.md` (신규 ADR)
- `tests/harness/` (신규 fixture 3개)

---

### 2. 진행 흐름

```
[Phase 1-1 sermons-featured 진행]
  ↓
[증상 발견] 5분 작업 → 2시간 소요 (사용자 보고)
  ↓
[Claude 자가 진단] 4 변경안 제시
  - CODEX_PLAN_REVIEW 1라운드 cap
  - EXPLORE 직접 검증 의무
  - PLAN 1.5 page 압축
  - Hook debounce
  ↓
[사용자 결정] 메모리 저장 X, 시스템 자체에 적용
  ↓
[Codex 메타-리뷰 (fresh thread)]
  - Claude 4안 평가 + 5 추가 발견:
    a) CHANGE_REQUEST 기준 자체가 폭주 원인 (cap만으론 부족)
    b) ADR 0008 single-tier가 reviewer 가치 증명 incentive 유발
    c) 진짜 plan 비대 원인은 `_template.md` (17 섹션)
    d) harness-gate regex가 formatting trap
    e) EXPLORE 검증 대상 일반화 필요
  - 6 변경 + 6 안티패턴 가드 + ADR 0010 Decision 초안
  ↓
[사용자 요청] 보고서 구조 재정리 (문제/원인/해결/대안/결과)
  ↓
[Claude v2 보고서 작성] 근거 파일·라인 인용, KPI 정의, 대안 7건 기각 사유
  ↓
[사용자 결정] 옵션 C (6 fixes 전부 적용) + 위험 분석 병렬 (Claude + Codex)
  ↓
[Claude 자체 위험 분석] R1~R10, Top 5 추출, 4 추가 가드 제안
[Codex 위험 분석 병렬 실행]
  - R1·R2·R3·R7·R10 양측 합의
  - R5(gate placeholder)·R6(hook debounce) Codex가 high로 평가, Claude는 과소평가
  - Codex 신규 가드 7건 (placeholder denylist, section hash 재알림,
    fixture 3개, PASS_WITH_DECISION_LOG 토큰, must-CR 예시 8개 등)
  ↓
[Claude 통합 보고] 9개 통합 가드 + 적용 순서 ~45분
  ↓
[현재 시점] 핸드오프 문서 작성 (이 문서)
  ↓
[다음 단계] 6 fixes + 9 가드 적용 → ADR 0010 commit → 후속 phase에서 KPI 측정
```

---

### 3. 주요 결정

#### 3.1 확정된 결정 (사용자 승인)

| # | 결정 | 사유 |
|---|---|---|
| D1 | **6 fixes 전부 적용** | Claude·Codex 합의. 단일 lever 불충분, 시너지 필요 |
| D2 | 본 변경은 plan/Codex review 생략 | 변경 근거가 본 phase 실패 자체. 메타-리뷰가 review 역할 수행 |
| D3 | ADR 0010 영구 기록 | `.claude/`·`scripts/` 변경은 ADR_TRIGGER_PARTS 포함 |
| D4 | dogfooding fixture 3개 사전 실행 | Codex 신규 발견 — self-validating 회귀 방지 |
| D5 | Override·Rollback 섹션 ADR에 필수 포함 | 대형 task 자동 해제 + 회귀 시 재검토 메커니즘 |

#### 3.2 6 Fixes (확정 내용)

**F1: SKILL.md § CODEX_PLAN_REVIEW**
```
- CHANGE_REQUEST를 material risk 한정
  (정책/데이터/타입/레이어/검증 공백/요청 범위 이탈)
- 표현·문구·label 정합성은 §의사결정 로그 1줄 + WORK 진입
- 3차 자동 호출 금지, 사용자 승인 필요
- BLOCK 기준 cap 무관 유지 (인증/캐시/배포/DB/데이터 손실/보안/컨텍스트)
- 애매하면 material로 승격 (안전 쪽)
- Codex 호출 프롬프트 템플릿 (PASS_WITH_DECISION_LOG 결론 토큰 + 확신도 표기)
```

**must-CR 예시 8개 (확정, inline)** — Codex가 분류 시 참조:
1. DB column 부재로 데이터 흐름 실패 (예: 본 phase의 `is_featured` BLOCK)
2. 타입 불일치로 type-check 실패 (예: `SermonListItem` vs `SermonWithRelations` 필드 누락)
3. 레이어 위반 (app → apis 직접 호출, services bypass)
4. 인증/캐시/배포 정책 변경 누락 (예: `createServerSideClient` vs `createStaticClient` 오용)
5. **Non-goals에 명시한 항목 변경** (예: 본 phase의 `[id]`→`[slug]` 시도 시)
6. **user-visible acceptance criteria 위반** (SEO/UX 영향 metadata 포함, 예: title이 GNB 라벨과 불일치)
7. 검증 명령 부재 또는 부적절 (예: SC가 "동작하게" 같은 약한 기준)
8. **repo policy 위반** (token 하드코딩 / `<Image>` 직접 사용 / `--no-verify` / barrel 반사 등)

**expression-only 예시 5개 (확정, inline)** — §의사결정 로그 1줄 후 WORK 진입:
1. 같은 정보를 N곳에 적어 미세 불일치 (예: 본 phase의 "코드 변경 0" vs "1줄 변경" 표현 충돌)
2. label 표기 차이 ("신규" vs "교체", "이관" vs "분리")
3. 중복 설명·섹션 배치·비차단 명명 제안
4. 문장 품질 (이중부정·길이·어순)
5. SEO·라우팅 영향 없는 표기 오타 (예: 의사결정 로그 내 typo)

**F2: SKILL.md § EXPLORE**
```
- 구현 의존 claim (컬럼/함수/타입/라우트/토큰/mixin/config flag/wrapper 컨벤션)
  은 rg/generated types/migration/SQL로 직접 확인
- 영향 파일 surface only — 전수 검사 금지
- audit/doc은 보조, 코드/DB가 SSOT
- 확인 근거 §검증된 Assumptions 또는 §의사결정 로그에 1줄
- 단순 변경(typo/rename/1줄) 시 claim 없으면 EXPLORE 1-2분 종료
```

**F3: `docs/exec-plans/_template.md`**
```
- 17 섹션 → 5 섹션 기본 (목표/검증된 Assumptions/SC/영향 파일/체크리스트/Verification)
- §감사·§Open Questions·§ADR은 해당 시만 추가
- mandatory 1줄 필드 (섹션 optional이어도 항상 채움):
  Open questions: none | <list>
  ADR needed: no | yes + reason
```

**F4: `scripts/harness-gate.mjs`**
```js
// same-line regex 제거
// + placeholder denylist (TBD/미요청/미작성/N/A/none/- 차단)
// + verdict token 강제 (최종 판단만: PASS/FAIL/PASS_WITH_DECISION_LOG/BLOCK)
// + 최소 30자 비-placeholder 내용
// + ADR_TRIGGER_PARTS 파일 변경 시 §ADR 판단·mandatory 1줄 필드 강제
```

**F5: `.claude/hooks/check-codex-after-plan.mjs` + `post-implementation-review.mjs`**
```js
// debounce key = hash(plan §목표 + §SC + §영향 파일 + §Verification)
// 이전 hash와 다르면 1회 재알림 (Codex 검증 미요청 상태에서만)
// once-only 금지 — section hash 변경 시 재알림 허용
// 수동 Codex 호출 가능 문구는 SKILL.md에 유지
```

**F6: `docs/decisions/0010-harness-codex-review-cap.md`**
```md
## Decision (Codex verbatim — 사용자 검토 후 조정 가능)
CODEX_PLAN_REVIEW는 material implementation risk만 CHANGE_REQUEST로 분류하고,
문서 표현·plan-text consistency는 구현 판단을 바꾸지 않는 한 의사결정 로그에
기록한 뒤 WORK로 진행한다. 단일 컴포넌트/작은 PR은 compact exec-plan 형식을
기본으로 하며, 구현 의존 claim은 EXPLORE에서 코드/DB/generated source로 직접
확인한다. Hook은 plan 최초 작성 후 1회와 WORK 종료 후보 1회만 알림을 보내도록
debounce(section hash 기반)하고, harness-gate는 검증 섹션의 의미 있는 내용 존재만
확인하며 label same-line formatting은 강제하지 않는다.

## Override (필수 섹션)
다음 조건 1건 이상 hit 시 본 ADR cap·compact·debounce 자동 해제:
- 변경 파일 ≥ 20 또는 LOC ≥ 500
- ADR_TRIGGER_PARTS 다중 영역 (services + scripts + .claude/ 등)
- 라이브러리 마이그레이션 (package.json deps 신규/제거)
- 인증/캐시/배포/DB schema 변경
- 사용자 명시 STRICT_REVIEW 요청
해제 시: full template + Codex review 무제한 라운드 + 기존 hook 빈도.
exec-plan §의사결정 로그에 "Override 적용 사유" 1줄 기록.

## Rollback Triggers (필수 섹션)
3 sub-phase 누적 후 측정. 1건 이상 hit 시 ADR 재검토:
- 평균 phase 시간 본 ADR 적용 전(120분) 대비 50% 미만 개선
- 1차 검증·PR review에서 material 사후 발견 2× 증가
- harness-gate placeholder 통과 사례 1건
- 사용자 "검토 부족" 피드백 1건
```

#### 3.3 9개 통합 가드 (Claude + Codex 합의)

| # | 영역 | 가드 |
|---|---|---|
| 가1 | F1 | must-CR 예시 8개 + expression 5개 + "애매하면 material" 룰 |
| 가2 | F1 | `PASS_WITH_DECISION_LOG` 비차단 결론 토큰 신규 도입 |
| 가3 | F2 | "implementation-dependent claim 있을 때만" 조건 + surface only |
| 가4 | F3 | `Open questions`·`ADR needed` 1줄 필드 mandatory |
| 가5 | F4 | placeholder denylist + verdict token + 최소 30자 |
| 가6 | F5 | plan section hash 기반 debounce key |
| 가7 | F6 | `Override` 섹션 (조건/승인자/exec-plan 기록 방식) |
| 가8 | F6 | `Rollback Triggers` 섹션 (3 sub-phase KPI 측정) |
| 가9 | dogfooding | fixture 3개 (valid/placeholder/revised-after-review) + `node --check` + dry-run |

#### 3.4 기각된 대안 (재논의 시 참조)

| 대안 | 기각 사유 |
|---|---|
| A status quo | 누적 손실 20-30시간 / 잔여 phase ≥ 20 |
| B Codex prompt만 수정 | SKILL.md 기본 정의가 그대로면 reviewer incentive 변화 없음 |
| C SKILL만, template 유지 | template 17 섹션이 plan 비대 원인 — 효과 절반 |
| D harness-gate·hook만 | 주 원인(Codex 5라운드)에 미치지 못함 |
| E Codex review 전부 생략 | material risk 누락 — ADR 0001 위반 |
| F ADR 0008 자체 폐기 | 코드 품질 메커니즘 상실. 의도는 정확, 운영이 잘못됨 |

#### 3.5 핸드오프 문서 평가 후 의사결정 7건 (E1~E7)

본 문서 v1 작성 후 Claude + Codex 교차 평가에서 EDIT 7건 발견. 다음과 같이 확정:

**E1 — U2 커밋 prefix 확정: `Refactor`**
- 근거: 본 변경은 (1) 시스템 운영 정책 변경(SKILL.md CR 정의), (2) 스크립트 동작 변경(harness-gate regex), (3) 워크플로우 자동화 변경(hook debounce). CLAUDE.md prefix 6개 중 `Refactor`가 가장 정확 — "기존 동작 개선/재구성".
- 기각: `Chore`(잡일 인상, 운영 정책 변경 무게 부족), `Docs`(SKILL/ADR 신규지만 코드/스크립트 변경 동반).
- 트레이드오프: `Refactor` 사용 시 향후 grep 시 코드 리팩터와 섞일 수 있음. 단 본문에서 ADR 0010 인용으로 식별 가능.

**E2 — sermons-featured PR 즉시 생성 (본 ADR과 분리, 병렬 진행)**
- 근거: §4.4 명시대로 sermons-featured(`feat/sermons-featured` 브랜치 + 커밋 `38377a3`)가 머지되지 않으면 **Phase 1-2(Recent 캐러셀)·1-3(Series 캐러셀)이 차단** (Carousel 컴포넌트와 필터 URL 4곳 의존). 본 ADR 적용은 ~45분, sermons PR은 ~5분 — 직렬 진행 시 ~50분 더 차단.
- 기각: "본 ADR 적용 후 PR" — Phase 1-2 차단 5+ 일 가능.
- 트레이드오프: PR이 본 ADR 머지 전이라 sermons-featured는 **기존 (긴) plan 검증 절차로 작성된 plan**을 그대로 가짐. 본 ADR 머지 후 자동 적용은 안 되지만 후속 phase부터 신 규칙 적용 시작.

**E3 — U2·U3·U6·U8을 default 확정, 미확정 list에서 제거**
- 근거: Codex 지적 — "운영 선택지가 ADR 0010 'plan 압축' 취지와 긴장". 분석 마비(analysis paralysis) 차단. 본 ADR의 §접근법과 일관.
- 확정값:
  - U2 → E1 결정 (`Refactor`)
  - U3 PR 템플릿 → `.github/PULL_REQUEST_TEMPLATE/refactor.md` (memory `feedback_pr_templates` 패턴)
  - U6 fixture 위치 → `tests/harness/` (신규 디렉토리, scripts/와 분리. tests/ 컨벤션 기존 사용 확인 필요 — 없으면 신설)
  - U8 Codex 호출 프롬프트 → SKILL.md § CODEX_PLAN_REVIEW 인라인 (별도 파일 신설 X — 단일 source)
- 트레이드오프: default가 후속 phase에 부적합 시 ADR 0010 Override 섹션으로 opt-out. default를 박지 않으면 매 작업자마다 동일 선택지에서 갈등.

**E4 — F1 must-CR 8개 + expression 5개 예시를 §3.2에 inline 확정, U9 삭제**
- 근거: Codex 지적 — "F1의 must-CR 예시 8개는 U9와 충돌". 예시가 §3.2에 박혔는데 U9가 "충분성 미확정"이면 후속 작업자가 다시 결정해야 함.
- 트레이드오프: 8+5 예시가 모든 케이스를 커버 못 함. 단 SKILL.md에 "애매하면 material로 승격" 룰이 있어 누락 시 안전 쪽으로 분류. 추가 예시는 ADR 0010 후속 PR에서 보강.

**E5 — §6.2 Step 순서 정정: Step 6(fixture) → Step 4 앞으로 이동**
- 근거: Codex 지적 — "§6.2 Step 4의 숨은 의존성은 Step 3이 아니라 Step 6 fixture다". harness-gate 변경(F4)을 검증하려면 fixture 3개가 선행 필요. fixture 없으면 regex 변경 후 회귀 발견 못 함.
- 새 순서: 1 template → 2 SKILL EXPLORE → 3 SKILL CODEX_PLAN_REVIEW → **4 fixture** → 5 harness-gate → 6 hook → 7 ADR
- 트레이드오프: fixture를 먼저 만들 때 SKILL의 must-CR/expression 정의가 필요할 수 있음. Step 3 후 fixture라 OK.

**E6 — 부록 "확인 필요 사항 종합" 라인 삭제 (§5와 중복)**
- 근거: Codex 지적 — "부록과 §5 미확정 사항 중복, 노이즈".
- 트레이드오프: 없음 (단순 중복 제거).

**E7 — 본 문서 위치 유지 (`docs/exec-plans/active/`)**
- 근거: 3 옵션 비교 — (a) `active/` 유지: 기존 검색 경로 일관, 단 harness-gate가 정상 plan 형식 기대 시 경고. (b) ADR 0010 부록 흡수: ADR 본문 비대 + 머지 후 history되어 후속 phase 접근 불편. (c) `docs/exec-plans/meta/` 신설: 새 디렉토리, 일관성 ↓.
- 결정: (a) **유지**. ADR 0010 적용 후 hook이 본 문서 같은 메타 작업을 인식하도록 보강 (frontmatter `kind: meta` 또는 §"메타 작업 플래그" 추가 — 후속 보강).
- 트레이드오프: harness-gate fail 가능 — 본문 §6.1·부록에 "본 작업은 harness-gate 우회, 사용자 명시 승인" 명시로 해소.

---

### 4. 구현/설계 맥락

#### 4.1 핵심 파일·라인 인용

| 파일 | 라인 | 현재 상태 | 변경 필요 |
|---|---|---|---|
| `.claude/skills/harness-workflow/SKILL.md` | 다수 | 5체크 미충족 = CR 기본값 정의 | F1 (CR 정의 좁힘) + 경계 사례 표 |
| 동일 파일 | § EXPLORE | "기존 코드·문서·패턴 확인" | F2 (직접 검증 의무) |
| 동일 파일 | § 검증 결과 기록 규칙(128-156) | 구체화 4원소 강제 | **유지** (검증 기록만 적용, plan review 적용 X로 명확화) |
| `docs/exec-plans/_template.md` | 전체 17 섹션 | 모든 섹션 기본 노출 | F3 (5 섹션 압축) |
| `scripts/harness-gate.mjs` | 69 | `/검토 내용\*\*:\s*$.../m` | F4 (regex 교체) |
| `.claude/settings.json` | hook 설정 | 모든 Write/Edit/MultiEdit 후 실행 | F5 (section hash debounce) |
| `scripts/_shared-config.mjs` | 7-26 | `ADR_TRIGGER_PARTS` | **유지** (참조용) |
| `docs/decisions/0008-...` | Decision | agent review tier 메커니즘 2 | **유지** (본 ADR 0010이 0008 운영 보완) |
| `docs/decisions/0001-...` | Codex 위임 전략 | 위임 트리거 정의 | **유지** |

#### 4.2 phase 1-1에서 발견된 실제 사례 (재현 방지)

| 사례 | 현 시스템 어디서 막힘 | 본 ADR 0010 적용 시 |
|---|---|---|
| `is_featured` 컬럼 부재 (Phase 0 audit 오류 인용) | EXPLORE 미발견 → Codex 1차에서 발견 (BLOCK) | F2로 EXPLORE에서 `mcp__claude_ai_Supabase__list_tables` 1회 호출로 사전 발견 |
| 필터 base path 4곳 (`buildSermonHref` / `useSermonFilter` / `SermonYearGrid` / `SermonDetailPage`) | Codex 1차에서 발견 (material) | 동일 — F1의 must-CR #5(Non-goals 위반·scope drift)에 해당 |
| Codex 2~4차 11건 표현 모순 ("코드 0줄" / "신규" vs "교체" / 의사결정 로그 표현 잔존) | 5라운드 폭주 | F1으로 expression 분류 → §의사결정 로그 1줄 + WORK 진입 |
| `<Image>` vs `<CloudinaryImage>` 컨벤션 누락 | yarn build 실패 시 발견 (10분 손실) | F2의 wrapper 컨벤션 직접 검증으로 EXPLORE 단계 발견 |
| harness-gate `**검토 내용**:` label 줄 끝 → 미작성 판정 (5분 정정) | regex formatting trap | F4의 multi-line content check |

#### 4.3 사용자 선호·제약 (memory + 본 대화)

| 선호/제약 | 출처 | 본 작업 적용 |
|---|---|---|
| **간결한 plan/문서** | `feedback_concise_plans` | F3 compact template / 본 핸드오프 문서 압축 |
| **WHY/IMPACT 우선 커밋·PR** | `feedback_commit_message` | ADR 0010 commit 메시지 작성 시 적용 |
| **커밋 prefix 6개만** (Feat·Fix·Style·Refactor·Docs·Chore) | `feedback_commit_convention` | 본 작업은 `Refactor` 또는 `Chore` |
| **추상명사 회피·구체화 4원소** | `feedback_concrete_records` | 본 문서 + ADR 0010 작성 시 |
| **커밋 전 사용자 승인** | `feedback_commit_approval` | F6 ADR 작성 후 사용자 승인 후 커밋 |
| **Co-Authored-By 실제 모델명** | `feedback_commit_coauthor` | "Claude Opus 4.7 (1M context)" |
| **PR base는 develop** | `feedback_pr_base_branch` | base = develop |
| **PR 템플릿 본문 필수** | `feedback_pr_templates` | `Refactor` 시 `refactor.md`, `Chore` 시 `maintenance.md` (확인 필요) |
| **PR --assignee @me --label** | CLAUDE.md | 본 PR 생성 시 필수 |
| **사용자가 "5분 → 1시간"을 "심각한 문제"로 인식** | 본 대화 | 본 ADR의 motivation에 명시 |

#### 4.4 PR #?(sermons-featured) 현재 상태

- 브랜치: `feat/sermons-featured` (origin push 완료)
- 커밋: `38377a3` "Feat: 설교 메인 페이지 Featured 카드 도입 + archive 뷰 /sermons/all 이관"
- PR 생성: **미생성** (사용자 결정 — 본 시스템 변경 우선)
- 사용자 결정 사항: 본 ADR 적용 후 sermons-featured PR 생성 여부 재논의 (확인 필요)
- 영향: develop 머지 안 됨 → Phase 1-2/1-3 진입 차단됨 (Featured 컴포넌트 + 필터 URL 4곳 의존)

---

### 5. 미확정 사항

§3.5 E3 적용으로 U2·U3·U6·U8 default 확정, E4 적용으로 U9 삭제. 남은 미확정 4건:

| # | 항목 | 결정 필요 시점 | 결정자 |
|---|---|---|---|
| U1 | 본 작업 브랜치명 — `feat/harness-codex-review-cap` 권장 (default), 또는 `refactor/harness-...` | 작업 시작 시 | 사용자 (1초 결정) |
| U4 | sermons-featured PR 머지 시점 (E2로 PR 생성은 즉시 확정) | PR review 완료 시 | 사용자 |
| U5 | `.claude/hooks/` 파일 실제 경로·내용 — `.claude/settings.json` 설정 vs `.claude/hooks/*.mjs` 스크립트 분리 여부 | F5 구현 시 | Glob/Read로 점검 (작업자가 자체 해결) |
| U7 | KPI 측정 자동화 — 수동 보고 vs `scripts/measure-phase.mjs` 신규 | Rollback Triggers 첫 측정 시 (3 sub-phase 후) | 사용자 |

---

### 6. TODO (다음 작업자가 즉시 실행)

#### 6.1 사전 점검 (5분)

```bash
# U5 확인 — hook 파일 실제 구조
ls -la .claude/hooks/ 2>/dev/null
cat .claude/settings.json | grep -A 3 hooks

# 현재 SKILL.md 라인 수 확인 (변경 전후 비교용)
wc -l .claude/skills/harness-workflow/SKILL.md
wc -l docs/exec-plans/_template.md

# 본 작업 시작 — task-id 결정
node scripts/start-task.mjs harness-codex-review-cap
# 단 D2에 따라 plan은 본 핸드오프 문서로 대체 — start-task가 새 plan 만들면 삭제 또는 link
```

#### 6.2 변경 적용 순서 (~45분, E5로 Step 순서 정정 적용됨)

| Step | 작업 | 파일 | 검증 |
|---|---|---|---|
| 1 | `_template.md` 5 섹션 압축 + Open questions/ADR needed mandatory 1줄 | `docs/exec-plans/_template.md` | `wc -l` 비교 (17 섹션 → 5 섹션) |
| 2 | SKILL.md § EXPLORE 직접 검증 의무 (claim 있을 때만) | `.claude/skills/harness-workflow/SKILL.md` | 단순 변경(typo) 시 EXPLORE 1-2분 종료 가능 명시 확인 |
| 3 | SKILL.md § CODEX_PLAN_REVIEW (CR 정의 + must-CR 8개 + expression 5개 + 프롬프트 템플릿) | 동일 | must-CR/expression 예시 13개 모두 dnchurch 실사례 인용 (§3.2 F1 inline 참조) |
| **4** (E5로 5→4 이동) | **fixture 3개 작성** — valid / placeholder / revised-after-review | `tests/harness/` (E3 default) | 각 fixture에 대해 `harness-gate` 통과/실패 예상값 확인. Step 5의 dry-run 검증 의존성 선행 |
| 5 (E5로 4→5 이동) | `harness-gate.mjs` placeholder denylist + verdict token | `scripts/harness-gate.mjs` | Step 4 fixture 3개로 dry-run (의존 해소) |
| 6 | `.claude/hooks/` section hash debounce | `.claude/hooks/check-codex-after-plan.mjs` + `post-implementation-review.mjs` (또는 settings.json — U5 점검 후) | 본 핸드오프 문서 수정으로 hook 발화 확인 |
| 7 | ADR 0010 작성 (Decision + Override + Rollback + Consequences + 본 핸드오프 문서 링크) | `docs/decisions/0010-harness-codex-review-cap.md` | `node scripts/update-adr-index.mjs` 실행 |

#### 6.3 검증 (자체 dogfooding)

```bash
# Step 6 fixture로 harness-gate dry-run
node --check scripts/harness-gate.mjs
# 본 핸드오프 문서를 valid fixture로 사용 가능 — 단 본 문서는 일반 exec-plan 형식 아님
# 별도 fixture 디렉토리 권장

# Hook section hash 변경 시 재알림 확인
# (테스트 어려움 — settings.json 일시 변경 후 더미 plan edit으로 발화 확인)
```

#### 6.4 커밋·PR (사용자 승인 후)

```bash
# 변경 파일 명시 stage (-A 금지)
git add .claude/skills/harness-workflow/SKILL.md \
        docs/exec-plans/_template.md \
        scripts/harness-gate.mjs \
        .claude/hooks/ \
        .claude/settings.json \
        docs/decisions/0010-harness-codex-review-cap.md \
        docs/decisions/README.md \
        tests/harness/

# 커밋 메시지 (U2 결정 후) — 권장:
# Refactor: 하네스 CODEX_PLAN_REVIEW cap + plan 압축 + EXPLORE 직접 검증 의무화 (ADR 0010)
# 본문 4-line (WHY: 5분 작업 → 2시간 / 무엇: 6 fixes + 9 가드 / 영향: ... / 제외: ...)
# Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

# PR 생성 (U3 템플릿 결정 후)
gh pr create --base develop --assignee "@me" --label <label> --title "[Refactor] ..." --body "..."
```

#### 6.5 후속 측정 (3 sub-phase 후 — Phase 1-2 / 1-3 / 1-4)

```bash
# 각 sub-phase 종료 시 KPI 기록
# - 평균 phase 시간 (목표 30-45분)
# - Codex 라운드 수 (목표 1-2)
# - CR 표현 비율 (목표 <30%)
# - Plan 라인 수 (목표 80-100)
# - EXPLORE BLOCK 발견율 (목표 100%)
# - harness-gate format 실패 (목표 0)
# - hook 알림 횟수 (목표 2-3)

# Rollback Triggers 1건 이상 hit 시 ADR 0010 재검토
```

#### 6.6 참고 자료 (다음 작업자가 맥락 파악용)

| 자료 | 위치 |
|---|---|
| Phase 1-1 exec-plan (실패 사례) | `docs/exec-plans/active/2026-05-14-sermons-featured.md` |
| Phase 0 회고 (audit 오류 발견 부채 등록 필요) | `docs/exec-plans/completed/2026-05-13-sermons-phase0-foundation.md` |
| ADR 0001 (Codex 위임 전략) | `docs/decisions/0001-codex-orchestration-strategy.md` |
| ADR 0008 (코드 품질 강제) | `docs/decisions/0008-...` |
| 현행 SKILL | `.claude/skills/harness-workflow/SKILL.md` |
| 현행 template | `docs/exec-plans/_template.md` |
| 현행 harness-gate | `scripts/harness-gate.mjs` |
| 본 핸드오프 문서 자체 | `docs/exec-plans/active/2026-05-14-harness-codex-review-cap.md` |

#### 6.7 Codex thread 참조 (재요청 시)

- **메타 진단 thread**: `agentId: acd81e5266775b43c` (5 추가 발견 + ADR Decision 초안)
- **위험 분석 thread**: `agentId: a62c7b301fd6ccab3` (R1~R10 + Top 7 + 6 가드 modifications)
- 재요청 시: `Agent(codex:codex-rescue, "--resume", to: <agentId>)` 또는 SKILL의 `codex-companion.mjs task-resume-candidate` 흐름

---

## 부록: 본 핸드오프 문서 자체에 대한 메모

- 본 문서는 **일반 exec-plan 형식이 아님** (메타-작업 핸드오프). 정상 절차의 `## Codex 계획 검증` / `## Codex 1차 검증` / `## Claude 2차 검증` 섹션 없음.
- 본 문서로 `node scripts/harness-gate.mjs harness-codex-review-cap` 실행 시 검증 섹션 부재로 fail 예상 — D2에 따라 본 작업은 harness-gate 우회 (사용자 명시 승인 필요).
- 완료 후 `node scripts/complete-task.mjs harness-codex-review-cap`로 `completed/`로 이동. 회고 작성 시 KPI 측정 결과 첨부.
- E7 결정: 본 문서 위치 `docs/exec-plans/active/` **유지**. 후속 보강으로 hook이 메타 작업 인식하도록 frontmatter `kind: meta` 또는 §"메타 작업 플래그" 추가 검토.
