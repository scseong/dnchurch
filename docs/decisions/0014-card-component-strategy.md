# 0014 — 카드 컴포넌트: 전면 통합 대신 공유 부품·스타일 추출

- **Status**: Accepted
- **Date**: 2026-06-02
- **Deciders**: scseong, Claude Code
- **Tags**: frontend, design-system, components

## Context

Phase 1 감사가 카드 관련 위반 2건을 확인했다.

- **설교 카드 4종 공존** (V1-2): `GridCard`(리스트)·`SermonCarouselCard`(Recent 캐러셀)·`SeriesCard`(Series 캐러셀)·`SeriesEpisodeCard`(에피소드). 시각은 비슷해 보이나 props·layout이 다르다.
- **about 번호형 카드 3종** (V1-3): `index_card`·`step_card`·`pillar_card`를 페이지 SCSS로 매번 직접 작성. 공통 컴포넌트가 없다.

ADR 작성 전에 explorer로 7종 카드의 props·렌더 구조·layout을 조사했다. 결과 "전면 통합"이 부적합하다는 근거가 드러났다.

- 설교 카드 4종은 데이터 타입이 3종으로 갈린다 — `SermonCardItem`(GridCard), `SermonWithRelations`(Carousel·Episode), `SeriesWithSermonCount`(SeriesCard). 특히 `SeriesCard`는 설교가 아니라 **시리즈** 엔티티다(썸네일 대신 cover, play 버튼 없음, ON-GOING 배지, 기간·편수 메타).
- layout 축이 직교한다 — `GridCard`·`SeriesEpisodeCard`는 가로 grid, `SermonCarouselCard`·`SeriesCard`는 세로 flex 캐러셀.
- about 3종도 구조가 어긋난다 — `index_card`는 화살표 링크 네비(`<Link>`), `step_card`·`pillar_card`는 비링크 리스트(`<li>`)이고 선두 마커가 번호·아이콘으로 갈린다.
- `src/components/`에는 (content)용 공용 Card가 없다(admin 전용 카드만 존재).

전면 통합하면 `variant`·`leading`·`href` 같은 옵션이 붙어 내부가 조건 분기 덩어리가 된다. CLAUDE.md의 "추측성 추상화 금지"·"단순함 우선"과 어긋난다.

## Decision

**카드를 한 컴포넌트로 통합하지 않는다. 중복되는 부품과 표면 스타일만 공유로 뺀다.**

1. **설교 카드 — 공유 부품 추출** — 카드 컴포넌트는 그대로 두고 두 가지만 공유로 뺀다.
   - `SermonThumb` — 썸네일 + 재생 버튼 + duration 오버레이를 공유 부품으로 뺀다.
     - 참조 3종: 재생 버튼이 있는 `GridCard`·`SermonCarouselCard`·`SeriesEpisodeCard`.
     - 제외: `SeriesCard`는 cover 이미지에 재생 버튼이 없다(`IoPlay` 미사용).
     - 포함: 같은 썸네일+재생 마크업을 따로 구현한 `SermonFeatured`·`SermonOtherByPreacher`. 이 둘을 빼면 중복이 남는다.
   - `card-surface` 믹스인 — `$bg-card`·`$border-card`·`$radius-s` 표면 스타일.
2. **about 번호형 3종** — 컴포넌트로 묶지 않는다. "라벨 + 제목 + 설명" 텍스트 블록 스타일만 SCSS 믹스인으로 공유한다. 선두 마커(번호·아이콘)와 링크 여부는 각 페이지가 유지한다.

## Consequences

### 긍정적

- 재생 버튼이 있는 카드 5곳(`GridCard`·`SermonCarouselCard`·`SeriesEpisodeCard`·`SermonFeatured`·`SermonOtherByPreacher`)의 중복 썸네일 마크업을 `SermonThumb` 1곳으로 줄인다.
- 카드 표면 토큰(`$bg-card` 등)을 믹스인 1곳에서 관리해 카드마다 표면이 같아진다.
- 데이터 타입·layout이 다른 카드를 한 컴포넌트로 묶지 않아 조건 분기가 안 생긴다.

### 부정적 / 트레이드오프

- 카드 파일 4종은 그대로 남아 "카드 종류가 많다"는 인상은 유지된다.
- 가로형 2종(`GridCard`·`SeriesEpisodeCard`)은 grid + 썸네일 + 정보 구조가 닮아 묶을 여지가 있으나, 이번에는 부품 추출까지만 하고 Phase 4 마이그레이션 때 다시 판단한다.

### 영향 범위

- 코드: `src/app/(content)/sermons/_component/`(SermonThumb 신설, 재생 버튼 카드 5곳이 참조), `about` 페이지 SCSS(텍스트 블록 믹스인 적용). 실제 작업은 Phase 4.
- 운영: 본 ADR은 결정·문서까지다.

## Alternatives Considered

### A안: `SermonCard` 1종 + variant prop

- 기각: 데이터 타입이 3종으로 다르고 `SeriesCard`는 설교가 아닌 시리즈 엔티티다. 가로 grid와 세로 캐러셀을 variant로 묶으면 layout 전환을 통째로 조건 분기해야 해 내부가 복잡해진다.

### B안: 콘텐츠형·정보형 2종으로 통합

- 기각: 2종으로 줄여도 캐러셀과 그리드의 layout 차이를 prop으로 흡수해야 한다. 부분 통합 이득보다 분기 비용이 크다.

### C안: about `NumberedCard` 컴포넌트 추출

- 기각: `index_card`는 링크 네비, `step_card`·`pillar_card`는 비링크 리스트이고 선두 마커가 번호·아이콘으로 갈린다. 하나로 묶으면 `leading: 'number' | 'icon'`·`href?`·`trailing?` 옵션이 붙어 추측성 추상화가 된다.

## References

- 관련 exec-plan: `docs/exec-plans/active/2026-06-01-design-catalog.md`
- 관련 감사: `docs/design-system/audit.md` (V1-2·V1-3)
- 관련 조사: explorer 카드 7종 props·layout 분석 (전면 통합 부적합 근거)
- 관련 PR: Phase 2 PR에서 채움
