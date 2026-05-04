# 0003 — design-system-v3 typography hierarchy

- **Status**: Proposed
- **Date**: 2026-05-04
- **Deciders**: 프로젝트 오너
- **Tags**: frontend, design-system, scss, tokens, typography

> **2026-05-04 갱신**: 초안의 admin 토큰 통합 결정은 Codex 계획 검증 결과 본 ADR 범위에서 분리하기로 했다. admin 통합은 후속 ADR(placeholder — `0004-admin-token-unification` 예정)에서 다룬다. 본 ADR은 typography 의미 계층 도입과 미사용 alias 정리에 한정한다.

## Context

페이지 전반의 시각 일관성에 두 가지 결함이 있다. 본 ADR은 (1)만 다루고 (2)는 후속 ADR로 분리한다.

1. **타입 시스템의 의미 계층 부재** — 현재 `_mixins.scss`의 `text-hero/page-title/section-title/sub-section-title/card-title/body/sub/caption/label`은 *역할 명*만 담고 있어, 디자인 의도(헤딩 vs UI 레이블 vs 캡션)와 *시각 레벨*(Display→Title→Heading→Headline→Body→Label→Caption) 간의 매핑이 모호하다. 신규 작업 시마다 어떤 mixin을 골라야 할지 결정 비용이 발생하고, 결과적으로 페이지마다 다른 mixin 사용 패턴이 누적된다.
2. *(분리 — 후속 ADR로 이관)* admin 영역의 별도 토큰 시스템(`var(--admin-*)`).

추가로, 외부 디자인 시스템 레퍼런스(`docs/references/colors_and_type.css` — Wanted Design System)가 같은 시점에 검토 대상으로 올라왔다. Wanted DS는 같은 2-tier(primitive→semantic) 구조와 Pretendard 폰트를 공유하면서, 의미 계층(Display/Title/Heading/Headline/Body/Label/Caption)을 7단계로 분류한 점이 우리의 결함을 정확히 보완한다.

이 결정을 미루면:
- 신규 페이지 작업 시 mixin 선택 가이드가 없어 페이지별 변종이 계속 늘어난다.
- deprecated alias(`$navy`, `$gold`, `$cream`, `$bg-invert`, `$line-height-heading`, `$section-padding-*`, `$overlay-dark-light` 등)가 정리 시점을 잃고 영구 부채로 남는다.

## Decision

다음 세 가지를 결정한다.

### 1. Wanted DS의 의미 계층(Display→...→Caption)을 흡수해 mixin 명명 체계를 도입한다.

**구현 패턴**: SCSS mixin (utility class 미도입). 사유 — 본 프로젝트는 CSS Modules 우선이며 (a) mixin은 mobile/tablet 반응형 페어를 캡슐화 가능, (b) `@include text-sub($color: ...)` 같은 매개변수화로 색·weight override 자유, (c) 컴파일 타임 인라인이라 페이지별 CSS 분리 유지, (d) `next.config.ts:32-36`의 `additionalData`로 자동 주입되는 기존 패턴과 일관. utility class는 디자인 시스템 데모/스토리북 도입 시점에 mixin 위 1줄로 추가 가능 — 현 단계 yagni.

**반응형 페어 캡슐화**: heading 계열 mixin(`text-hero/page-title/section-title/sub-section-title/card-title`)은 mobile→tablet+ 두 사이즈를 한 mixin에 캡슐(예: `text-page-title` = 26↔34px). ADR 표는 desktop 단일 사이즈 기준이지만, 실제 mixin은 반응형 페어를 표현한다.

**mixin 매핑** (Step 1 홈 사용처 분석 후 확정 — 14행):

| mixin 이름 | size (mobile / tablet+) | weight | line-height | 컨텍스트 | 본 task 도입 |
| --- | --- | --- | --- | --- | --- |
| ~~`text-hero`~~ | 32 / 42 | bold | h1 (tight) | 히어로 타이틀 | ✗ 제거됨 — Step 4 (사용처 0) |
| `text-page-title` | 26 / 34 | bold | h2 (tight) | 페이지 타이틀 | (기존 유지) |
| ~~`text-section-title`~~ | 22 / 28 | bold | h3 (snug) | 섹션 타이틀 | ✗ 제거됨 — Step 4 (사용처 0) |
| ~~`text-sub-section-title`~~ | 20 / 24 | semibold | h4 (normal) | 서브 섹션 타이틀 | ✗ 제거됨 — Step 4 (사용처 0) |
| `text-card-title` | 18 / 20 | semibold | h5 (base) | 카드 타이틀 | (기존 유지) |
| ~~`text-body`~~ | 15 | regular | base (1.5) | 본문 기본 | ✗ 제거됨 — Step 4 (사용처 0) |
| **`text-body-emphasis`** | 15 | medium | body-default (1.5) | 본문 강조 | ★ 신규 |
| `text-sub` | 14 | regular | base (1.5) | 보조 본문 | (기존 유지) |
| **`text-sub-emphasis`** | 14 | medium | body-default (1.5) | 보조 본문 강조 | ★ 신규 |
| ~~`text-label`~~ | 13 | medium | base (1.5) | 레이블 기본 | ✗ 제거됨 — Step 4 (사용처 0) |
| **`text-label-emphasis`** | 13 | semibold | body-ui (1.45) | 레이블 강조 | ★ 신규 |
| `text-caption` | 13 | regular | base (1.5) | 캡션 기본 | (기존 유지) |
| **`text-caption-small`** | 12 | medium | body-ui (1.45) | 작은 캡션·메타 | ★ 신규 |
| **`text-caption-strong`** | 11 | semibold | body-ui (1.45) | 강조 캡션·뱃지 | ★ 신규 |

**최종 mixin 9종** — 생존 4 (`text-page-title`, `text-card-title`, `text-sub`, `text-caption`) + 신규 5 (`text-body-emphasis`, `text-sub-emphasis`, `text-label-emphasis`, `text-caption-small`, `text-caption-strong`). 제거된 5종은 Step 4 grep 게이팅으로 사용처 0건 확인 후 정의 제거.

**naming 컨벤션**:
- `-emphasis` — 같은 사이즈에서 weight 강조 (regular→medium 또는 medium→semibold)
- `-small` — 같은 컨텍스트에서 한 단계 작은 사이즈
- `-strong` — 가장 강한 강조 (작고 굵음)

**거절된 명명 후보**:
- Wanted `1n/1r/2n/2r` 접미사 — 사용 시점에 의미가 즉시 읽히지 않음.
- 단순 weight 명명 (`-medium/-regular`) — 어느 컨텍스트에 어떤 weight를 써야 할지 표현 불가.
- 컨텍스트 명명(`-ui/-reading/-prose`) — 일부 가치 있으나 본 단계 즉시 소비분이 없어 후속 도입.

**ADR 표(20행 desktop 기준)와의 차이**:
이전 버전 ADR 표 20행은 desktop 단일 사이즈 청사진이었으나 실제 mixin은 반응형 페어 + 코드베이스 즉시 소비 기준으로 14행으로 축소. Wanted DS의 Body Reading/Prose, Label Soft, Body Small Reading 등은 즉시 소비처 부재로 후속 PR에서 추가.

### 2. mixin은 점진 도입한다.

전체 계약을 한 번에 mixin으로 구현하지 않는다. 홈 페이지 pilot에서 즉시 소비되는 mixin(예상 6~10개)만 1차로 추가하고, 나머지는 실제 소비자가 생기는 후속 PR에서 점진 추가한다.

### 3. 본 작업 내에서 사용처 0인 deprecated alias·mixin을 일괄 제거한다.

대상 후보 (작업 시점 grep으로 사용처 0 확인 후 제거 — 1건이라도 남으면 본 task 내 신규 토큰으로 치환 후 0건 확인 또는 tech-debt 등록):

- `_color.scss`: `$navy`, `$navy-mid`, `$navy-light`, `$gold`, `$gold-light`, `$cream`, `$cream-deep`, `$bg-invert`, `$border-secondary`
- `_typography.scss`: `$line-height-heading`, `$line-height-wide`
- `_semantic.scss`: `$section-padding-80/64/40/20`, `$overlay-dark-light`
- `_mixins.scss`: 사용처 0인 기존 `text-*` mixin

### 거절·이관한 결정

**Wanted DS의 형식적 차용 거절**:
- **컬러 팔레트 교체** — Wanted의 `#0066FF` blue + cool-neutral 23-step은 교회 브랜드 정체성(navy/gold/cream)을 손상시킨다.
- **컬러 16-step 펼침** — 현 navy 3단·gold 3단·cream 2단으로 충분.
- **px 단위 전환** — `1rem = 10px` + 8단계 viewport별 fluid scaling이 깨진다.
- **Pretendard JP 교체** — 현 Pretendard Variable과 시각적 차이 미미.
- **다크 모드 토큰 분리** — 본 작업에서 보류. 도입 결정 시 별도 ADR.

**다른 ADR로 이관**:
- **admin 영역 별도 토큰 시스템 통합** — 본 ADR 초안에 포함했으나 Codex 계획 검증 결과 분리. typography 도입과 의존 관계 없고 admin 회귀 검증 범위가 비대해짐. 후속 ADR `0004-admin-token-unification` (placeholder)에서 다룬다.

## Consequences

### 긍정적

- 디자인 의도와 코드 mixin이 동일 어휘(Display/Title/Heading/Headline/Body/Label/Caption)로 통일되어 신규 작업의 mixin 선택 비용이 감소한다.
- 컨텍스트 기반 명명(`text-body-ui` 등)으로 사용 시점에 의도가 즉시 읽힌다.
- `@deprecated` alias가 코드베이스에서 사라져 신규 사용을 구조적으로 차단한다.
- 점진 도입 방식이라 미사용 mixin 누적이 발생하지 않는다.

### 부정적 / 트레이드오프

- mixin 이름이 Wanted DS와 1:1 일치하지 않아 외부 레퍼런스 매핑 시 ADR 표를 거쳐야 한다.
- 기존 `text-hero` 등 mixin 호출처를 동일 task 내에서 모두 고쳐야 하므로 홈 영역 회귀 검증이 필수.
- 의미 계층(Display1·2 등)에 익숙해지기까지 작성자에게 짧은 학습 비용이 발생한다.

### 영향 범위

- **코드**:
  - `src/styles/_mixins.scss` — 신규 mixin 점진 추가, 사용처 0인 기존 mixin 제거
  - `src/styles/tokens/_color.scss` / `_typography.scss` / `_semantic.scss` / `_spacing.scss` — deprecated alias 제거
  - 모달·토스트·Header SCSS 4~6개 — `$shadow-lg/xl`, inline rgba 토큰화
  - `src/app/_component/home/*.module.scss` 9개 — pilot 적용
- **운영**: 시각 회귀 검증은 홈·모달·토스트·Header에 한정. PC/Tablet/Mobile 3 viewport.
- **문서**: 본 ADR + exec-plan + tech-debt-tracker 후속 등록 (admin 통합 ADR placeholder, 다크모드, about/, 타 페이지 신규 mixin 도입).

## Alternatives Considered

### A안: Wanted DS를 원본 그대로 채택 (컬러·타입·단위 모두)

- 장점: 외부 시스템과 완전 호환, 향후 디자인 자료 재사용 쉬움.
- 사유로 기각: navy/gold/cream 교회 브랜드 손상, fluid font scaling 손실, 운영 부담만 늘어나고 가치는 미미.

### B안: typography·admin 통합·alias 정리를 한 ADR/한 task로 진행

- 장점: 한 번에 시각 일관성을 끌어올림.
- 사유로 기각: Codex 계획 검증에서 admin 회귀 범위가 비대하다는 지적. typography·home pilot과 admin 통합은 의존 관계가 없어 독립 진행 가능. admin은 후속 ADR로 분리.

### C안: 전체 mixin(20개)을 Step 1에서 일괄 추가

- 장점: 전체 계층을 한 번에 정의.
- 사유로 기각: 즉시 소비자가 없는 mixin이 코드에 추가되면 미사용 표면이 늘어 검증 부담만 증가. 점진 도입(실제 소비자 PR에서 추가)이 더 단순하고 검증 가능.

### D안: mixin 이름을 Wanted DS와 1:1 일치(`text-body1n` 등)

- 장점: 외부 레퍼런스 매핑이 쉬움.
- 사유로 기각: `1n/1r/2n/2r` 접미사가 사용 시점에 무엇을 의미하는지(weight·context) 즉시 읽히지 않음. 사용자도 가독성 부족 지적. 컨텍스트 기반 명명이 로컬 코드베이스에 더 적합.

### E안: 단순 weight 기반 명명 (`text-body-1-medium` 등)

- 장점: weight가 명시되어 직관적.
- 사유로 기각: medium/regular 중 어느 것을 써야 할지 컨텍스트에 따라 다른데 이름이 컨텍스트를 노출하지 않아 결정 비용은 그대로. `_typography.scss`가 이미 컨텍스트 별칭(`$line-height-body-ui/default/reading/prose`)을 사용하므로 컨벤션 일관성 측면에서도 컨텍스트 명명이 우월.

### F안: deprecated alias 유예 (2 release 후 제거)

- 장점: 단계적 회귀 분산.
- 사유로 기각: 사용자 지시 — alias 유예 단계 폐지. 현 코드베이스에 이미 다수 alias가 정리 시점을 잃은 채 누적된 상태이며 본 작업에 함께 정리.

## References

- 관련 PR: (Step별 생성 시점에 추가)
- 관련 exec-plan: [2026-05-04-design-system-v3](../exec-plans/active/2026-05-04-design-system-v3.md)
- 관련 ADR: [0001 — Codex 오케스트레이션 전략](0001-codex-orchestration-strategy.md)
- 후속 ADR: `0004-admin-token-unification` (placeholder — admin 토큰 통합 분리)
- 외부 레퍼런스: `docs/references/colors_and_type.css` (Wanted Design System 토큰 정의)
- Codex 계획 검증: 2026-05-04 CHANGE_REQUEST 응답 — exec-plan `## Codex 계획 검증` 섹션 참조
