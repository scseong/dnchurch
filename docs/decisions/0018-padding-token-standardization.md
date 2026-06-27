# 0018 — 카드·면 padding을 대칭 시맨틱 토큰 3단계로 고정

- **Status**: Accepted
- **Date**: 2026-06-27
- **Deciders**: 프로젝트 오너
- **Tags**: frontend, design-system, scss, tokens, spacing

## Context

홈을 모바일 앱 UI로 개편하면서 카드·면 padding이 작성자 감각대로 경우마다 제각각 쌓였다. 세 가지 결함이 있다.

1. **같은 "카드"에 값이 제각각** — `$spacing-16`·`$spacing-20`·`$spacing-24`가 규칙 없이 섞였다. 어떤 카드가 어떤 값을 쓸지 근거가 없다.
2. **시맨틱 토큰이 있는데 거의 안 쓴다** — `_semantic.scss`에 `$padding-card`·`$padding-card-compact`가 정의돼 있는데도 대부분 raw `$spacing-*`로 작성됐다. 게다가 `$padding-card`는 비대칭(`$spacing-16 $spacing-20`, 가로>세로)이라 카드마다 padding 방향마저 뒤섞였다(TodayVerse는 세로>가로).
3. **토큰명 = 데스크톱 px 함정** — `$spacing-N`은 이름의 N이 데스크톱 px이고 모바일은 약 0.75N로 작아진다(`$spacing-16` = 모바일 12px / 데스크톱 16px). 작성자가 "이름=px"로 오인해 모바일 카드가 의도보다 답답해지는 혼란이 반복됐다.

이를 미루면 신규 작업마다 padding 결정 비용이 들고, 페이지별 변종이 계속 늘어 시각 일관성이 무너진다. 실제로 개편 한 세션에서 padding 수정이 10여 회 발생했다.

## Decision

### 1. 카드 padding은 대칭만 쓴다 (가로 = 세로)
비대칭 카드 padding을 금지한다. 방향(가로>세로 또는 세로>가로) 고민을 제거하고, 토큰 한 값으로 표현한다. 컨트롤·배지처럼 본질이 가로형인 면은 예외(기존 비대칭 유지).

### 2. 면 종류 → 토큰 1:1 매핑
면 종류마다 토큰을 하나로 고정한다. 카드는 3단계 스케일을 둔다.

| 토큰 | 값 | 모바일 / 데스크톱 | 면 종류 |
| --- | --- | --- | --- |
| `$padding-card-lg` | `$spacing-24` | 20 / 24px | 대형·피처 카드 (히어로 등) |
| `$padding-card` | `$spacing-20` | 16 / 20px | 표준 카드·패널 ★ 기본 |
| `$padding-card-compact` | `$spacing-16` | 12 / 16px | 컴팩트 카드·카드 내부 타일·콜아웃·리스트 행 |
| `$padding-control` | `$spacing-8 $spacing-12` | (유지) | 버튼·인풋 |
| `$padding-control-wide` | `$spacing-12 $spacing-24` | (유지) | 큰 CTA 링크 |
| `$padding-inline-xs` / `-sm` | (유지) | (유지) | 인라인 배지·칩 |

고정 크기 그래픽 박스(원형/정사각 아이콘 박스)와 섹션 간 리듬(`$content-gap-*`·`$section-gap-*`)은 이 표준 대상이 아니다.

### 3. 기존 시맨틱 토큰을 대칭으로 재정의한다
- `$padding-card`: `$spacing-16 $spacing-20` → `$spacing-20`
- `$padding-card-compact`: `$spacing-12 $spacing-16` → `$spacing-16`
- `$padding-card-lg`: 신규(`$spacing-24`)

두 재정의는 **가로는 그대로, 세로만 +2~4px** 늘어나는 방향이라 기존 소비처가 받는 영향이 작다. 토큰명을 유지해 소비처 코드를 건드리지 않고 값만 바꾼다.

### 4. 점진 마이그레이션
홈을 먼저 raw `$spacing-*` → 토큰으로 옮긴다(phase 1, 본 작업). 이후 sermons·about 등은 실제 손볼 때 페이지별로 raw → 토큰으로 옮긴다. 한 번에 전 페이지를 강제 치환하지 않는다.

## Consequences

### 긍정적
- 면 종류만 정하면 padding 토큰이 자동으로 결정돼 작성·리뷰 비용이 줄어든다.
- 카드 대칭 규칙으로 방향 고민이 사라진다.
- 모바일에서도 표준 카드가 16px 이상을 확보해 답답함이 준다.
- raw `$spacing-*` 카드 padding이 토큰으로 수렴해 페이지별 변종 누적을 막는다.

### 부정적 / 트레이드오프
- `$padding-card` 재정의가 홈 밖 소비처 sermons 4곳(`SermonSeriesSidebar`·`SermonListPage` 2곳·`SeriesListPage`)에도 세로 padding +4px로 적용된다. `$padding-card-compact`는 홈 밖 소비처가 없다. 위험은 작지만, sermons 4곳을 시각으로 확인해야 한다.
- 오늘의 말씀(금색) 카드는 `$padding-card-lg`로 옮기며 데스크톱 세로 padding이 32→24px로 준다(옛 `respond-up` 커스텀 값을 거둠). 모바일은 가로가 +4px 늘어 방향이 반대다 — 시각 확인 대상.
- 점진 마이그레이션이라 raw 값과 토큰이 한동안 섞여 있다.

### 영향 범위
- **코드**:
  - `_semantic.scss` — 토큰 재정의 + `$padding-card-lg` 신규
  - `app/_component/home/*.module.scss` — 홈 마이그레이션
  - `$padding-card` 소비처 sermons 4곳(`SermonSeriesSidebar`·`SermonListPage`·`SeriesListPage`) — 값만 변경. `$padding-card-compact`는 홈 밖 소비처 없음
- **운영**: 시각 회귀 확인은 홈 + sermons 4곳에 한정. 모바일/데스크톱.
- **문서**: 본 ADR. `.claude/skills/styles/SKILL.md`의 Semantic Token 매핑 표에 카드 3단계·대칭 규칙 반영(후속).

## Alternatives Considered

### A안: 기존 비대칭 `$padding-card`(`$spacing-16 $spacing-20`) 유지, 매핑 규칙만 신설
- 장점: 토큰값 무변경이라 소비처 영향 0.
- 사유로 기각: 모바일 카드 세로 12px가 답답하다는 사용자 판단. 비대칭이라 방향 혼란도 그대로.

### B안: 기존 토큰은 두고 새 대칭 토큰만 추가
- 장점: 기존 소비처 무영향.
- 사유로 기각: 비대칭·대칭 두 체계가 영구 공존해 일관성 목표에 미달. 어느 쪽을 쓸지 결정 비용이 오히려 늘어난다.

### C안: 카드도 비대칭(가로>세로) 표준으로 통일
- 장점: 텍스트 카드의 가로 여백 확보에 유리.
- 사유로 기각: 사용자가 대칭을 명시 선택("`$padding-card`는 `$spacing-20`으로, 16/20 안 씀"). 방향 규칙이 하나뿐이라 대칭이 더 단순.

## References

- 관련 ADR: [0003 — design-system-v3 typography hierarchy](0003-design-system-v3-token-unification.md), [0014 — card component strategy](0014-card-component-strategy.md)
- 관련 스킬: `.claude/skills/styles/SKILL.md` (Semantic Token 매핑)
