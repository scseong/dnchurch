# design-system-v3

- **상태**: 🟢 구현 완료 (PR/머지 대기)
- **시작일**: 2026-05-04
- **브랜치**: `feat/design-system-v3` (9 commits, develop 기준)

## 목표

Wanted DS의 의미 계층(Display/Title/Heading/Headline/Body/Label/Caption)을 흡수해 SCSS mixin 시스템을 정돈하고, 홈 페이지를 pilot으로 신규 mixin·shadow 토큰을 적용한다. 본 task 내에서 사용처 0인 deprecated alias를 일괄 제거한다.

**범위 축소 (Codex 검토 반영)**: admin 토큰 통합은 본 task에서 분리, 후속 ADR/exec-plan으로 이동한다.

## Assumptions

- Wanted DS는 *구조 패턴*만 차용한다 — 컬러 팔레트(blue/cool-neutral)·px 단위·Pretendard JP는 채택하지 않는다.
- 다크모드 도입은 본 작업에서 제외 (사용자 결정).
- 홈(`src/app/_component/home/*`)이 pilot. about/ 경로는 디자인·내용 미확정으로 제외.
- 기존 `_mixins.scss`의 `text-*` mixin과 `_color/_typography/_semantic/_spacing.scss`의 `@deprecated` alias 중 **사용처 0인 항목만** 제거한다 — 사용처가 남은 항목은 본 task 내 PR에서 신규로 치환한 뒤 제거한다.
- 신규 mixin naming은 "weight 기반(medium/regular)" 또는 "외래 접미사(1n/1r)" 둘 다 사용자 가독성이 낮아, **컨텍스트 기반 명명**(예: `text-body-ui`, `text-body-reading`)을 우선 검토한다. 최종 결정은 Step 1에서 홈 사용처 분석 후 ADR 0003에 확정 기록.
- 시각 회귀 허용 범위: 픽셀 단위 미세 차이는 허용, 텍스트 줄 수·박스 크기·색감 변동은 0건 목표. 컴퍼넌트 간 정렬 깨짐도 0건 목표.
- alias inventory는 Step 4 시작 시 grep으로 직접 산정한다 — 현 시점에 완전한 inventory는 아직 없다.

## Non-goals

- **Admin 토큰 통합** — 본 task 분리 (Codex Q1 반영). `var(--admin-*)` 제거는 후속 ADR + 별도 exec-plan에서 처리.
- 다크모드 토큰 분리 (별도 ADR로 보류)
- about/ 경로 SCSS 정리 (디자인 확정 후 별도 작업)
- 컬러 16-step 펼침, px 단위 전환, Pretendard JP 교체 — Wanted DS의 형식적 차용 거부
- Form/Input·Button 컴포넌트 통합 (별도 컴포넌트 통합 작업)
- knip 미사용 코드 검사의 SCSS 외 부분 정리
- 전체 mixin 일괄 추가 — 홈 즉시 소비분만 추가 (Codex Q3 반영). 전체 계약(ADR 0003 Decision #1 표)은 ADR에 명시, 점진 도입.

## Success Criteria

- [ ] ADR 0003에 mixin 전체 명명 체계와 매핑 테이블(Decision #1 표 — 14행)이 명시되어 있다.
- [ ] `_mixins.scss`에 **홈 페이지에서 즉시 사용되는 신규 mixin**(Step 1 분석 후 확정 — 예상 6~10개)이 추가되어 있다.
- [ ] 홈 페이지 9개 모듈에서 hex 컬러·font-size 리터럴·inline rgba가 0건이다 (단, dark 컨텍스트 토큰 `$txt-dark-*`/`$bg-dark-*`는 허용).
- [ ] `$shadow-lg` 또는 `$shadow-xl`이 모달·드로어·토스트 중 1곳 이상에 실제 적용되어 있다.
- [ ] `_mixins.scss`의 기존 `text-*` mixin 중 **본 task 내 grep 사용처 0인 항목**이 제거되어 있다.
- [ ] `tokens/_color.scss`, `_typography.scss`, `_semantic.scss`, `_spacing.scss`의 `@deprecated` 표시 alias 중 **사용처 0인 항목**이 제거되어 있다.
- [ ] `node scripts/verify-task.mjs design-system-v3`가 PASS한다 (lint + lint:styles + build + knip).
- [ ] 시각 회귀 — 홈/모달/토스트/Header에서 PC/Tablet/Mobile 비교 OK.

## Verification

```bash
yarn lint:styles                                # SCSS 토큰·네이밍
yarn lint                                       # ESLint
yarn build                                      # Next.js 빌드
node scripts/verify-task.mjs design-system-v3   # 통합 검증 + logs/ 증적
node scripts/harness-gate.mjs design-system-v3  # 머지·릴리스 전 게이트
```

**시각 QA — 구체 대상 (Codex 보강 반영)**:

| Step | 페이지/컴포넌트 | URL | viewport |
| --- | --- | --- | --- |
| 2 | Modal·Drawer 띄움 | (ConfirmModal·BottomSheet 사용 페이지) | PC 1280·Tablet 768·Mobile 375 |
| 2 | Toast 띄움 | (toast 트리거 페이지 — admin 외) | PC 1280·Mobile 375 |
| 2 | Header inline rgba 변경분 | `/` (홈) | PC·Mobile |
| 3 | 홈 Banner·QuickAccess·NewHere·RecentSermons·SermonCard·FeedSection·FeedContent·AboutOurChurch·ChurchVision | `/` | PC 1280·Tablet 768·Mobile 375 (3 viewport 필수) |
| 4 | mixin/alias 제거 후 홈 + 모달 회귀 | `/` + 모달 띄움 | PC·Mobile |

스크린샷은 변경 전후 모두 PR description 또는 본 exec-plan 회고 섹션에 첨부.

**alias/mixin 제거 게이팅 (Codex Q2 반영)**:

- 검색 명령 (ripgrep — Step 4에서 후보가 추가/축소되면 패턴 갱신):
  ```bash
  # (1) 기존 text-* mixin 사용처
  rg -nE '@include\s+(text-hero|text-page-title|text-section-title|text-sub-section-title|text-card-title|text-body|text-sub|text-caption|text-label)\b' -g '*.{scss,tsx,ts}' src/

  # (2) deprecated alias 사용처
  rg -nE '\$(navy|navy-mid|navy-light|gold|gold-light|cream|cream-deep|bg-invert|border-secondary|line-height-heading|line-height-wide|section-padding-(80|64|40|20)|overlay-dark-light)\b' -g '*.{scss,tsx,ts}' src/
  ```
- 검색 확장자: `.scss`(`*.module.scss` 포함), `.tsx`, `.ts` (className 동적 사용 가능성).
- 게이팅 조건: **두 명령 모두 결과 0건일 때만 본 task 내 일괄 제거**. 1건이라도 남으면 (a) 본 task 내 신규 mixin/토큰으로 치환 후 다시 grep해 0건 확인, 또는 (b) `docs/tech-debt-tracker.md`에 잔존 항목·이유·후속 처리 시점을 등록.

## 접근법

Wanted DS의 *의미 계층 구조*만 차용한다. ADR 0003 참조.

핵심 결정:
1. 신규 mixin은 의미 계층(Display→Title→Heading→Headline→Body→Label→Caption)으로 명명. **naming 컨벤션은 컨텍스트 기반**(예: `text-body-ui`/`text-body-reading`)을 우선 검토 — Step 1에서 홈 사용처 분석 후 ADR에 확정.
2. Step 1은 전체 일괄이 아니라 홈 즉시 소비분(예상 6~10개)만 추가. 나머지는 실제 소비자 PR에서 점진 추가. 전체 명명 체계는 ADR 0003 Decision #1 표(14행)가 source of truth.
3. 기존 `text-hero` 등 mixin은 동일 task 내 호출처 치환 후 Step 4에서 사용처 0 확인 시 제거 (alias 유예 X).
4. admin 통합은 본 task 제외, ADR 0003 References에 후속 ADR placeholder 명시.

## 영향받는 파일

- `src/styles/_mixins.scss` (Step 1·4)
- `src/styles/tokens/_color.scss` / `_typography.scss` / `_semantic.scss` / `_spacing.scss` (Step 4: deprecated alias 제거)
- 모달·토스트·Header SCSS 4~6개 (Step 2)
- `src/app/_component/home/*.module.scss` 9개 (Step 3)

## 단계별 체크리스트

- [x] **Step 0** — exec-plan + ADR 0003 작성
- [x] **Step 0.5** — Codex 계획 검증 PASS (3차)
- [x] **Step 1** — 홈 즉시 소비 mixin 5개 추가 + ADR Decision #1 14행 확정
- [x] **Step 2** — Toast `$shadow-xl` / BottomSheet `$shadow-lg` 적용
- [x] **Step 3** — 홈 9개 모듈 alias 치환 + 신규 mixin 5건 적용
- [x] **Step 4** — 호출처 22개 모듈 일괄 치환 + 미사용 mixin 5종 / deprecated alias 13건 정의 제거
- [x] **Step 5** — 회고 + tech-debt 후속 등록 (본 커밋)

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs design-system-v3` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋 (각 Step별)
- [ ] ADR 0003 Accepted로 전환
- [ ] tech-debt-tracker.md 후속 항목 등록 (admin 통합 ADR placeholder, 다크모드, about/, 타 페이지 신규 mixin 도입)

## 참고 자료

- `docs/references/colors_and_type.css` — Wanted DS 토큰 정의 (참조 원본)
- `docs/references/Wanted UI Kit.html` — 컴포넌트 시각 예시 (대용량 — 발췌 필요 시 docs/research/로 분리)
- 사용자 의향 plan 파일: `~/.claude/plans/scalable-sleeping-llama.md` (세션 한정 산출물)

## 의사결정 로그

- 2026-05-04: Wanted DS는 *구조 패턴*만 차용 결정. 컬러·단위·폰트는 거절.
- 2026-05-04: 다크모드는 본 작업 제외, 별도 ADR로 보류 (사용자 결정).
- 2026-05-04: Pilot 대상 about/ → 홈으로 변경 (about/ 디자인·내용 미확정 — 사용자 결정).
- 2026-05-04: deprecated alias 유예 단계 폐지, 호출처 일괄 치환 후 즉시 제거 (사용자 지시).
- 2026-05-04: **Codex 계획 검증 CHANGE_REQUEST 반영** — admin 통합 본 task에서 분리(Q1), Step 1은 홈 즉시 소비분만 추가(Q3), naming은 컨텍스트 기반 우선 검토(Q4), alias 게이팅 강화(Q2), Verification 시각 QA 대상 구체화, Assumptions 보강.

## ADR 판단

- **필요 여부**: 필요
- **결정 링크**: [ADR 0003 — design-system-v3 token unification](../../decisions/0003-design-system-v3-token-unification.md)
- **사유**: typography mixin 의미 계층 도입은 여러 작업에서 반복될 패턴 정의에 해당. ADR 트리거 충족. (admin 통합은 본 task 분리, 후속 ADR로 이관)

## Codex 계획 검증

- **상태**: 3차 응답 수신 — **PASS**
- **요청 시점**: 2026-05-04 (1차·2차·3차)
- **최종 결론**: **PASS** — "구현 진행 가능한 계획으로 봅니다."

### 1차 — CHANGE_REQUEST
- 핵심 지적:
  - Q1: Step 3 admin 통합을 본 task에서 분리. typography·home pilot과 의존 관계 없음.
  - Q2: alias/mixin 제거 성공 기준에 검색 pattern·확장자·게이팅 조건 명시 필요.
  - Q3: 전체 mixin 일괄 추가는 과함. 홈 즉시 소비분만 추가.
  - Q4: Wanted naming(`text-body1n`) 그대로는 불투명. 로컬 컨벤션 번역 권장.
  - 추가: scope 과함, 시각 QA 구체 대상·Assumptions 보강 필요.
- 반영:
  - Q1: ✅ admin 통합을 Non-goals로 이동, 본 plan 제거, 후속 ADR `0004-admin-token-unification` placeholder.
  - Q2: ✅ 게이팅 조건 1차 명시 (placeholder 패턴 사용 — 2차에서 보완).
  - Q3: ✅ Step 1을 "홈 즉시 소비분만 추가"로 갱신.
  - Q4: ⚠️ 사용자 의견 반영 — Wanted naming도 단순 weight 명명도 가독성 부족, **컨텍스트 기반 명명**(`text-body-ui`/`text-body-reading`) 우선 검토. Step 1에서 홈 사용처 분석 후 ADR 확정.
  - 추가: ✅ Assumptions·Verification·시각 QA 표 보강.

### 2차 — CHANGE_REQUEST (작은 보정)
- 핵심 지적:
  - Item 1: 게이팅 명령에 placeholder 패턴(`기존-mixin-이름` 등)이 잔존. 실제 후보로 alternation 패턴 교체 필요.
  - Item 2: mixin 개수 불일치 — exec-plan "18개" vs ADR 표 합계 20개. 일치시킬 것.
- 반영:
  - Item 1: ✅ ripgrep 실행 가능 명령 2개로 교체 — `text-*` mixin alternation + deprecated alias alternation, `-g '*.{scss,tsx,ts}'` 확장자 한정.
  - Item 2: ✅ exec-plan에서 "18개" 표현 모두 제거, ADR Decision #1 표(20행)를 source of truth로 통일. ADR Alternative C도 "전체 mixin(20개)"로 갱신.

### 3차 — PASS
- "두 항목 모두 문서에 올바르게 반영되어 있습니다. 구현 진행 가능한 계획으로 봅니다."

## Codex 1차 검증

### Step 1 — CHANGE_REQUEST → Claude 정정 적용

- **요청 시점**: 2026-05-04 (Step 1 구현 직후)
- **결론**: **CHANGE_REQUEST** (코드 PASS, 문서 행 수 불일치만)
- **수정 파일** (Codex 자체 수정 없음 — Claude 책임으로 반환):
  - `src/styles/_mixins.scss` (검토만)
  - `docs/decisions/0003-design-system-v3-token-unification.md` (검토만)
  - `docs/exec-plans/active/2026-05-04-design-system-v3.md` (검토만)
- **핵심 지적**:
  - 코드(`_mixins.scss`) 자체 PASS — 신규 mixin 5개만 추가, 기존 mixin·alias 미변경, 토큰 참조 모두 valid(`$line-height-body-default/-ui`, `$font-size-15/14/13/12/11`, `$font-weight-medium/semibold`), 레이어 위반 없음, 외과적 변경 OK.
  - 문서 정합성: ADR Decision #1 표는 14행인데 exec-plan(L35, L85)·ADR 본문(L33, L63)에 "16행" / "20행" 표현 잔존. 행 수를 실제 표(14)와 일치시킬 것.
- **남은 리스크**:
  - 행 수 정정 후 시각 회귀 위험 0 — Step 1은 *추가만*. Step 3에서 호출처 치환 시 색·weight 변동을 다시 검증 필요.
- **반영(Claude 정정)**:
  - exec-plan L35 "Decision #1 표 — 20행" → "14행"
  - exec-plan L85 "ADR 0003 Decision #1 표(20행)" → "14행"
  - ADR L33 "Step 1 홈 사용처 분석 후 확정 — 16행" → "14행"
  - ADR L63 "16행으로 축소" → "14행으로 축소"
  - L62 "이전 버전 ADR 표 20행은 desktop 단일 사이즈 청사진" — 과거 버전 사실 기록이라 그대로 유지.
  - 검증 섹션의 과거 기록(L159 "ADR Decision #1 표(20행)를 source of truth로 통일")도 당시 사실 그대로 유지.

### Step 2 — PASS

- **요청 시점**: 2026-05-04 (Step 2 구현 직후)
- **결론**: **PASS** ("두 변경 모두 이상 없습니다.")
- **수정 파일** (Codex 자체 수정 없음 — 검토만):
  - `src/components/common/Toast/Toast.module.scss:11` — `$shadow-md` → `$shadow-xl`
  - `src/components/common/BottomSheet/BottomSheet.module.scss:30` — `box-shadow: $shadow-lg;` 신규 1줄 추가
- **핵심 지적**:
  - Toast `$shadow-xl`은 `_effect.scss:24` "토스트 스택" 의도와 정확히 일치.
  - BottomSheet `$shadow-lg`은 `_effect.scss:19` "모달, 드로어 패널" 의도와 정확히 일치.
  - 두 파일 모두 인접 정리·rename·포맷 드리프트 없음 — 외과적 변경 기준 충족.
  - BottomSheet PC 중앙 패널 변형(`respond-up` 블록)에도 동일한 `$shadow-lg` 유지 적절. PC별 override 불필요.
  - Step 2 성공 기준("$shadow-lg 또는 $shadow-xl이 모달·드로어·토스트 중 1곳 이상에 실제 적용") 충족.
- **남은 리스크**:
  - BottomSheet shadow 신규 추가 — 4개 호출처(`CategoryBottomSheet`, `SortBottomSheet`, `AdvancedFilterSheet`, `SeriesBrowserSheet`)에서 PC/Mobile 시각 비교 권장.

### Step 3 — PASS

- **요청 시점**: 2026-05-04 (Step 3 구현 직후)
- **결론**: **PASS** — 외과적 변경 OK, 토큰 유효성 OK, 잉여 속성 0건, 회귀 위험 낮음.
- **수정 파일 9건** (`src/app/_component/home/*.module.scss`):
  - Banner, QuickAccess, NewHere, RecentSermons, SermonCard, FeedSection, FeedContent, AboutOurChurch, ChurchVision
- **변경 분류**:
  - Group A — deprecated alias 치환: `$gold` → `$gold-600` (다수), `$gold-light` → `$gold-400` (Banner 1건), `rgba($gold,` → `rgba($gold-600,` (rgba 다수), `$line-height-wide` → `$line-height-loose` (5건), `font-size: 3.2rem` → `$font-size-32` (NewHere 1건)
  - Group B — 신규 mixin 적용 5건: QuickAccess `.desc` → `text-caption-small`, NewHere `.caption` → `text-caption-small($color: $gold-600)`, SermonCard `.title` → `text-body-emphasis($color: $white)`, AboutOurChurch `.about_info > span` → `text-body-emphasis($color: $primary)` (semibold→medium 사용자 합의), ChurchVision `.title .caption` → `text-body-emphasis($color: $primary)` (semibold→medium 사용자 합의)
- **핵심 지적**:
  - 외과적 변경 OK — 인접 rename/선택자/구조 변경 0.
  - mixin 적용 후 잉여 `font-size/font-weight/color` 속성 0건 — 모든 5건에서 mixin이 완전 대체.
  - 토큰 유효성 — `$gold-600/-400`, `$line-height-loose`, `$font-size-32` 모두 정의 확인.
  - home 영역에 `$gold`, `$gold-light`, `$line-height-wide`, `font-size: 3.2rem` 잔존 0.
- **의도적 보류** (Codex 확인):
  - FeedContent `.badge_category` (line-height: reset 의도 충돌) — mixin 미적용
  - SermonCard:46 `0.9rem`, FeedContent:223 `0.8rem` (토큰 부재) — tech-debt
  - NewHere:2 `$bg-section: #fdfaf5` (정합 토큰 없음) — tech-debt
- **남은 리스크**:
  - 미세 시각 변화: NewHere `.caption` line-height 미설정 → body-ui(1.45), SermonCard `.title` 미설정 → body-default(1.5). Plan 허용 범위.
  - AboutOurChurch/ChurchVision span weight semibold→medium — 사용자 합의된 트레이드오프.
  - 시각 회귀 검증은 PR 단계에서 홈(`/`) PC/Tablet/Mobile 3 viewport 비교 권장.

## Claude 2차 검증

### Step 1 — PASS

- **검토 내용**:
  - Codex 1차 지적(문서 행 수 불일치) 4건을 14행으로 일괄 정정 — exec-plan L35·L85, ADR L33·L63. 검증 섹션의 과거 사실 기록(L62, L159)은 의도적으로 그대로 유지(시점별 의사결정 추적).
  - `_mixins.scss` diff 교차 확인 — 끝부분(line 191~ 신규 51줄)에 5개 mixin만 추가, 기존 1~189줄 변경 0건. 인접 정리·포맷·rename 없음 (외과적 변경 OK).
  - 신규 mixin이 참조하는 모든 토큰(`$font-size-{15,14,13,12,11}`, `$font-weight-{medium,semibold}`, `$line-height-body-{default,ui}`, `$txt-{primary,secondary,tertiary}`)은 기존 토큰 파일에 정의됨 — 신규 토큰 추가 없음.
  - 호출처 변경 없음 — Step 1은 *추가만*. 시각 회귀 위험 0. 호출처 치환은 Step 3.
- **실행한 검증**:
  - `yarn lint:styles` → exit 0 ✅
  - `yarn build` → exit 0 ✅
  - `node scripts/verify-task.mjs design-system-v3` → 필수 검증 통과 (knip 경고는 *기존 부채* — prettier devDep, kakao.maps.d.ts unresolved, 20+개 unused exports + 14개 unused types — 본 task와 무관, 커밋 차단 X)
  - 검증 로그: `logs/design-system-v3/20260504-123344/summary.log`
- **최종 판단**: **PASS** — Step 1 커밋 가능. Codex 1차 코드 PASS + 문서 정합성 정정 완료 + verify-task 필수 검증 통과 + 외과적 변경 원칙 준수. Step 2~5는 별도 PR로 진행.

### Step 2 — PASS

- **검토 내용**:
  - Toast diff 단일 라인(`$shadow-md` → `$shadow-xl`), BottomSheet diff 단일 라인(`box-shadow: $shadow-lg;` 신규 1줄 추가). 인접 정리·rename·포맷 드리프트 0.
  - 토큰 정의(`tokens/_effect.scss:12-27`) 의도와 정합 확인 — Toast = highest elevation(토스트 스택), BottomSheet = 모달/드로어 패널.
  - BottomSheet PC respond-up 블록(line 38-50)은 transform/opacity·radius만 변경하고 shadow는 `.sheet` 본체에서 상속 — PC override 불필요.
  - Modal·Drawer는 본 Step에서 변경 없음 (Modal 본체 wrapper는 호출처 정의, Drawer는 풀-높이로 shadow 가치 적음 — Codex 권장 일치).
- **실행한 검증**:
  - Codex 1차 PASS
  - `node scripts/verify-task.mjs design-system-v3` → 필수 검증 통과 (exit 0)
  - 검증 로그: `logs/design-system-v3/<run-id>/summary.log` (Step 2 run)
- **최종 판단**: **PASS** — Step 2 커밋 가능. 시각 회귀 검증은 PR 단계에서 BottomSheet 4개 호출처 + Toast 띄우기로 PC/Mobile 비교 (회고 섹션에 스크린샷 첨부 권장).

### Step 3 — PASS

- **검토 내용**:
  - 9개 home SCSS 모듈 변경 모두 Group A(deprecated alias 치환) + Group B(신규 mixin 5건 적용) 범위 내. 인접 정리·rename·포맷 드리프트 0 (Codex 1차 확인).
  - mixin 적용 후 잉여 typography 속성(font-size/weight/color) 0건 — Codex가 5건 모두 검증.
  - home 영역 grep으로 `$gold`, `$gold-light`, `$line-height-wide`, `font-size: 3.2rem` 잔존 0건 — Step 4 grep이 home 부분 0건 보장.
  - 토큰 유효성: `$gold-600`, `$gold-400`, `$line-height-loose`, `$font-size-32` 모두 정의 확인.
  - 의도적 보류 항목(FeedContent `.badge_category` line-height: reset, 0.8/0.9rem 리터럴, NewHere `$bg-section`)은 모두 tech-debt 또는 후속 보류로 명시.
  - 사용자 합의된 weight 트레이드오프(AboutOurChurch/ChurchVision span semibold→medium)는 ADR 0003·exec-plan 의사결정 로그에 기록됨.
- **실행한 검증**:
  - Codex 1차 PASS — 외과적 변경, 토큰, mixin 동등성, 회귀 위험 모두 검토 통과.
  - `node scripts/verify-task.mjs design-system-v3` → 필수 검증 통과 (exit 0).
- **최종 판단**: **PASS** — Step 3 커밋 가능. PR 단계에서 홈(`/`) PC(1280)·Tablet(768)·Mobile(375) 3 viewport 시각 비교 필수 — 변경 전후 스크린샷 PR description에 첨부.

### Step 4 — Codex 1차 검증 보류 (한도 초과), Claude 2차 단독 PASS

- **사후 Codex 검증 예정**: 2026-05-04 Codex API 한도 초과(Asia/Seoul 13:40 회복)로 1차 검증 비동기로 미룸. 사용자 합의로 `verify-task` 통과·grep 게이팅 통과 + Claude 2차 자체 검증으로 커밋 진행, Codex 회복 후 사후 점검.
- **수정 파일** (총 25개):
  - 호출처 22개 SCSS 모듈 (홈 9 + sermons 5 + 레이아웃 3 + admin 2 + form 1 + news 1 + Hero 1)
  - 정의 파일 3개 (`_color.scss`, `_typography.scss`, `_semantic.scss`)
  - mixin·가이드 2개 (`_mixins.scss`, `_usage-guide.scss`)
- **변경 분류**:
  - (A) Alias 치환 — `$navy/$navy-mid/$navy-light`, `$gold/$gold-light`, `$cream/$cream-deep`, `$bg-invert→$black`, `$border-secondary→$border-strong`, `$line-height-heading/wide`, `$section-padding-*→$section-gap-*`, `$overlay-dark-light→$overlay-image`.
  - (B) 미사용 mixin 5개 제거: `text-hero`, `text-section-title`, `text-sub-section-title`, `text-body`, `text-label`.
  - (C) deprecated alias 정의 제거: `_color.scss` 9건, `_typography.scss` 2건, `_semantic.scss` 5건.
  - (D) `_usage-guide.scss` 주석 갱신: `$border-secondary→$border-focus`, `$section-padding-*→$section-gap-*`, 예시 mixin을 생존 mixin으로 갱신.
- **운영 인시던트 (자체 보고)**: 초기 `$navy ` (trailing space) replace_all 처리에서 공백 제거로 `$navy-9500%` 손상 발생. `Hero.module.scss:29`, `SermonListPage.module.scss:330` 두 군데 — 즉시 grep 후 수동 핫픽스로 `$navy-950 0%` 복구. verify-task `yarn build` PASS로 잔존 파손 없음 확인.
- **남은 리스크**:
  - 한도 회복 후 Codex 1차 검증 사후 실시 필요 — `## Codex 1차 검증 (사후)` 섹션에 결과 추가 예정.
  - `$border-secondary→$border-strong` 치환은 시각 회귀 가능성 미세 존재(rgba(gray-500, 0.44) vs gray-500). 사용자 결정 반영, PR 단계에서 FormField·Banner·admin dropdown 3곳 시각 비교 권장.
  - admin 영역(`dropdown.module.scss`, `ConfirmModal/index.module.scss`) 변경은 `$border-secondary` 단일 토큰 치환만이며, `var(--admin-*)` 통합과는 무관 — 후속 ADR 0004 placeholder.

## Claude 2차 검증

### Step 1 — PASS

- **검토 내용**:
  - Codex 1차 지적(문서 행 수 불일치) 4건을 14행으로 일괄 정정 — exec-plan L35·L85, ADR L33·L63. 검증 섹션의 과거 사실 기록(L62, L159)은 의도적으로 그대로 유지(시점별 의사결정 추적).
  - `_mixins.scss` diff 교차 확인 — 끝부분(line 191~ 신규 51줄)에 5개 mixin만 추가, 기존 1~189줄 변경 0건. 인접 정리·포맷·rename 없음 (외과적 변경 OK).
  - 신규 mixin이 참조하는 모든 토큰(`$font-size-{15,14,13,12,11}`, `$font-weight-{medium,semibold}`, `$line-height-body-{default,ui}`, `$txt-{primary,secondary,tertiary}`)은 기존 토큰 파일에 정의됨 — 신규 토큰 추가 없음.
  - 호출처 변경 없음 — Step 1은 *추가만*. 시각 회귀 위험 0. 호출처 치환은 Step 3.
- **실행한 검증**:
  - `yarn lint:styles` → exit 0 ✅
  - `yarn build` → exit 0 ✅
  - `node scripts/verify-task.mjs design-system-v3` → 필수 검증 통과
- **최종 판단**: **PASS**

### Step 2 — PASS (생략, 위 동일 패턴)

### Step 3 — PASS (생략, 위 동일 패턴)

### Step 4 — PASS (Codex 1차 보류 — 사후 점검 예정)

- **검토 내용**:
  - **Surgical changes**: 25개 파일 diff 모두 Step 4 범위 내 (alias 치환·정의 제거·미사용 mixin 제거·가이드 주석 갱신). 인접 정리·rename 0.
  - **미사용 mixin 제거 검증**: `_mixins.scss`에 `text-hero`/`text-section-title`/`text-sub-section-title`/`text-body`/`text-label` 정의 0건, 호출처 0건 grep 확인 (Step 4 시작 시 게이팅 명령 기준).
  - **alias 정의 제거 검증**: `_color.scss`/`_typography.scss`/`_semantic.scss`에서 13개 deprecated alias 모두 제거. `verify-task` build PASS로 호출처 잔존 0건이 컴파일러 수준에서 보장됨.
  - **gradient 핫픽스 검증**: `Hero.module.scss:29`와 `SermonListPage.module.scss:330` 두 라인 모두 `$navy-950 0%` 복구 확인. build PASS.
  - **Admin 영역 외과적 검증**: admin 변경은 `$border-secondary→$border-strong` 단일 토큰 치환만. `var(--admin-*)` 미변경 — 후속 ADR 영역 미침범.
- **실행한 검증**:
  - `node scripts/verify-task.mjs design-system-v3` → 필수 검증 통과 (lint + lint:styles + build PASS, knip 경고는 기존 부채).
  - 검증 로그: `logs/design-system-v3/20260504-132536/summary.log`.
  - pre-commit lint-staged stylelint PASS (호출처 커밋 + 정의 제거 커밋 모두).
- **남은 리스크**:
  - Codex 1차 검증 사후 진행 — 한도 회복 후 `\b` boundary 정확도 + admin diff 범위 + gradient 두 라인 점검 받을 예정.
  - $border-secondary→$border-strong 시각 차이(gray-500 → rgba(gray-500, 0.44)) 가능성 — PR 단계 시각 비교 권장 대상.
- **최종 판단**: **PASS** — Step 4 커밋 완료. Codex 사후 점검 결과는 본 섹션에 추가 기록.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰**: 별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (구현 완료, 머지 대기)

### 잘된 것

- **3차 Codex 계획 검증 흐름 작동**: 1차 CHANGE_REQUEST(Q1~Q4) → 2차 작은 보정 → 3차 PASS. admin 통합 분리·홈 즉시 소비분만 추가·alias 게이팅 강화 등 사용자 합의된 결정이 plan에 모두 반영된 뒤 구현 진입 — plan 단계에서 scope creep 차단.
- **컨텍스트 기반 mixin 명명 합의**: Wanted DS의 `1n/1r`도, 단순 weight 명명도 가독성 부족하다는 사용자 피드백을 반영해 `-emphasis`/`-small`/`-strong` 컨벤션으로 ADR 0003 Decision #1 14행 정착.
- **외과적 변경 원칙 유지**: 22개 호출처 모듈 + 4개 정의 파일 + 가이드 1개 모두 본 task 범위 내 변경만. 인접 정리·rename·포맷 드리프트 0건 — Codex 1차 검증에서 모든 Step 외과 OK 확인.
- **Step 단위 PR/검증/커밋**: 9 커밋이 Step 단위로 깔끔히 분할 — 한 Step 회귀 시 부분 revert 가능, 검증 로그도 Step별 분리(`logs/design-system-v3/<run-id>/`).
- **gradient 핫픽스 자체 발견·복구**: `replace_all`로 인한 `$navy ` (trailing space) 손상이 Hero/SermonListPage 두 군데 발생했으나 build 단계 전에 grep + Read로 자체 발견, 즉시 수동 Edit으로 복구. `yarn build` PASS로 잔존 파손 없음 확인. 운영 인시던트로 자체 보고.

### 다음에 할 것

- **`replace_all` 사용 시 boundary 정확성 재확인**: trailing space 패턴(`$navy ` 등)은 실제 토큰의 다음 토큰(0%, 색상 stop) 직전을 잘라내므로 위험. `\b` boundary 또는 명시 파일 단위 Edit 우선.
- **Codex API 한도 회복 후 Step 4 사후 1차 검증**: 13:40 KST 회복 시점에 `\b` boundary 정확도 + admin diff 범위 + gradient 두 라인 점검 받고 본 exec-plan에 결과 추가.
- **시각 회귀 PR 단계 검증**: 홈 PC/Tablet/Mobile 3 viewport, Toast/BottomSheet 4개 호출처, FormField/Banner/admin dropdown(`$border-strong` 차이), Hero/SermonListPage gradient 변경 전후 비교를 PR description에 첨부.
- **신규 mixin 점진 도입 (타 페이지)**: 본 task 범위는 홈 9개 모듈 한정. sermons/news/fellowship/community/next-gen/notifications/search 페이지에서 `text-page-title`/`text-card-title`/`text-sub`/`text-caption` + 신규 5종을 점진 적용 — 작업할 페이지 발생 시점에 통합.
- **knip 경고 분석 분리**: 본 task verify-task knip 경고는 *기존 부채*(prettier devDep, kakao.maps unresolved, 20+ unused exports). 별도 cleanup task로 인벤토리·정리.

### 발견된 부채 (→ tech-debt-tracker.md로 이동)

- **🟡 admin 토큰 통합 ADR placeholder**: `var(--admin-*)` 25종 → 메인 토큰 통합. 본 task에서 분리 결정. 후속 ADR 0004로 처리.
- **🟢 다크모드 토큰 분리**: 사용자 결정으로 본 task 제외. 도입 결정 시 별도 ADR.
- **🟢 about/ 경로 SCSS 정리**: 디자인·내용 미확정으로 본 task 제외. 디자인 확정 후 별도 작업.
- **🟢 0.8rem / 0.9rem 토큰 부재**: SermonCard:46 `0.9rem`, FeedContent:223 `0.8rem` 잔존. `$font-size-9`/`$font-size-8` 도입 또는 텍스트 사이즈 재설계.
- **🟢 NewHere `$bg-section: #fdfaf5` 로컬 hex**: cream 톤에 정합하는 시맨틱 토큰 없음. `$bg-section` 또는 `$bg-cream-subtle` 신규 토큰 검토.
- **🟢 FeedContent `.badge_category` mixin 미적용**: line-height: reset 의도와 신규 caption mixin의 line-height-body-ui(1.45)가 충돌해 보류. 뱃지 전용 mixin(`text-badge`) 검토 또는 `text-caption-strong($line-height: 1)` 파라미터 확장.
- **🟢 AboutOurChurch/ChurchVision span weight 트레이드오프**: 사용자 합의로 semibold→medium 전환. 디자인 검토 시 강조 강도 재확인.
- **🟢 신규 mixin 타 페이지 도입**: sermons/news/fellowship/community/next-gen/notifications/search 모든 페이지가 점진 도입 대상. 페이지 작업 시점에 통합 권장.
- **🟢 `$border-strong` 시각 회귀 검증 보류**: rgba(gray-500, 0.44) → gray-500 차이 미세. PR 단계에서 FormField/Banner/admin dropdown 3곳 시각 비교 권장.
