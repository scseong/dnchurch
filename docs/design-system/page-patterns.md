# 디자인 시스템 — 페이지 유형별 골격 가이드

> ADR-0013·0014·0015 결정을 페이지 유형별로 묶은 실무 가이드다. `(content)` 새 페이지를 만들 때 이 문서를 보고 골격을 맞춘다.
>
> - **작성**: 2026-06-02 (design-catalog Phase 2)
> - **근거 ADR**: [0013 페이지 골격](../decisions/0013-page-shell-convention.md) · [0014 카드](../decisions/0014-card-component-strategy.md) · [0015 상태·SEO](../decisions/0015-page-state-seo-policy.md)
> - **갱신 정책**: ADR이 바뀌면 본 문서를 함께 고친다.

## 공통 규약

모든 `(content)` 페이지에 적용한다.

- **컨테이너**: `PageContainer` 1종을 쓴다. 상하 여백은 variant로 고른다 — `flush`(여백 0) / `padded`(`$spacing-64`) / `fullBleed`(전폭 섹션). (ADR-0013)
- **hero**: layout 자동 `Hero`가 기본이다. 자체 hero를 그리는 페이지는 `resolveHeroMeta`의 `SELF_HERO_PATHS`에 등록해 자동 Hero를 끈다. (ADR-0013)
- **빈 데이터·에러 표시**: `EmptyState`로 통일한다. 날것 `<div>` 빈 상태는 금지한다. (ADR-0015)
- **카드 표면**: `card-surface` 믹스인(`$bg-card`·`$border-card`·`$radius-s`)을 쓴다. 카드는 한 컴포넌트로 통합하지 않고 공유 부품만 쓴다. (ADR-0014)
- **토큰**: 색·간격·폰트는 `styles/tokens/`의 semantic 토큰만 쓴다. primitive 직접 사용·hex 하드코딩 금지.

## 유형별 골격

### 1. 랜딩 (도메인 hub)

예: 홈(`/`), `/about`, `/sermons`, `/news`(신규 예정)

- **hero**: 자체 hero(다크·stats 등 특수 디자인) 또는 자동 hero. 자체면 `SELF_HERO_PATHS` 등록 + Breadcrumb 생략.
- **컨테이너**: `PageContainer flush`. 전폭 구역은 `fullBleed`.
- **콘텐츠**: 하위 영역을 요약하는 카드·섹션.
- **상태**: `error.tsx` 권장.

### 2. 리스트

예: `/sermons/all`, `/sermons/series`, `/news/bulletins`, `/news/notices`

- **hero**: 자동 hero.
- **컨테이너**: `PageContainer padded`.
- **콘텐츠**: 카드 그리드 + `Pagination`.
- **빈 데이터**: `EmptyState` 필수.
- **상태**: `loading.tsx` 필수.

### 3. 디테일

예: `/sermons/[id]`, `/sermons/series/[id]`, `/news/bulletins/[id]`, `/news/notices/[id]`

- **hero**: 자동 hero.
- **컨테이너**: `PageContainer padded`.
- **상태**: `loading.tsx` + `not-found.tsx` 필수.
- **SEO**: JSON-LD 필수 — sermons는 VideoObject, news는 Article schema. (ADR-0015)

### 4. 정보형 (정적 콘텐츠)

예: `/about/welcome`, `/about/vision`, `/about/worship`, `/about/pastor`, `/about/location`

- **hero**: 자동 hero.
- **컨테이너**: `PageContainer`. 전폭 섹션(FAQ·연혁 등)은 `fullBleed` variant로 만든다(컨테이너 우회 금지).
- **카드**: 번호형 텍스트 블록(라벨+제목+설명)은 공유 SCSS 믹스인을 쓴다. 컴포넌트로 묶지 않는다. (ADR-0014)

### 5. 폼

예: `/news/bulletins/create`, `/news/bulletins/[id]/update`

- **컨테이너**: `PageContainer padded`.
- **공용 UI**: `TextField`·`Textarea`·`Button` 등 `components/ui/`를 쓴다.

## 신규 페이지 체크리스트

새 페이지를 만들 때 확인한다.

- [ ] `PageContainer` + 유형에 맞는 variant를 골랐는가.
- [ ] hero를 자동으로 둘지 자체로 그릴지 정했는가. 자체면 `SELF_HERO_PATHS`에 등록했는가.
- [ ] 리스트면 `loading.tsx`, 디테일이면 `loading.tsx` + `not-found.tsx`를 만들었는가.
- [ ] 빈 데이터·에러를 `EmptyState`로 표시하는가.
- [ ] 디테일이면 JSON-LD를 넣었는가.
- [ ] semantic 토큰만 썼는가(primitive·hex 직접 사용 금지).

## 참고

- 근거 ADR: `docs/decisions/0013`·`0014`·`0015`.
- Phase 1 감사: `docs/design-system/audit.md`.
- 토큰·믹스인 규칙: `.claude/skills/styles/SKILL.md`.
- 공용 UI: `.claude/skills/ui-components/SKILL.md`.
