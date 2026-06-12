# 0015 — 페이지 상태·SEO 정책: 유형별 상태 파일 최소 요구 + news 디테일 JSON-LD 확대

- **Status**: Accepted
- **Date**: 2026-06-02
- **Deciders**: scseong, Claude Code
- **Tags**: frontend, design-system, seo

## Context

Phase 1 감사가 페이지 상태와 SEO 위반 4건을 확인했다. 모두 sermons 도메인에 편중돼 있다.

- **빈 상태 처리가 제각각** (V1-5): 같은 "데이터 없음"에 `EmptyState`를 쓰는 페이지와 `<div>데이터를 불러올 수 없습니다.</div>` 날것을 쓰는 페이지가 섞여 있다(예: `news/bulletins/page.tsx:37`).
- **상태 파일 편중** (V4-1): `loading.tsx`·`error.tsx`·`not-found.tsx`가 sermons에 6+1+0건, news에 0+0+2건, 나머지 도메인 0건.
- **EmptyState 편중** (V4-2): `(content)` 5곳 사용 중 4곳이 sermons.
- **JSON-LD 편중** (V4-3): `sermons/[id]`만 VideoObject schema를 렌더하고, news 디테일에는 0건.

상태 기준이 없으면 Phase 3 새 페이지마다 로딩·404·빈 화면 처리가 제각각이 된다. JSON-LD가 sermons에만 있으면 공개 콘텐츠인 주보·공지가 검색에 덜 노출된다.

## Decision

**페이지 유형별 상태 파일 최소 요구를 정하고, 빈 데이터는 `EmptyState`로 통일하며, JSON-LD를 news 디테일까지 확대한다.**

1. **상태 파일 최소 요구**
   - 리스트 페이지: `loading.tsx` 필수.
   - 디테일 페이지: `loading.tsx` + `not-found.tsx` 필수.
   - 도메인 루트: `error.tsx` 권장.
2. **빈 데이터·에러 표시**: `EmptyState`로 통일한다. 날것 `<div>` 빈 상태(예: `news/bulletins/page.tsx:37`)는 금지한다.
3. **SEO(JSON-LD)**: 디테일 페이지에 구조화 데이터를 적용한다. sermons는 VideoObject를 유지하고, news 디테일(`bulletins/[id]`·`notices/[id]`)에 Article schema를 추가한다.

## Consequences

### 긍정적

- Phase 3 새 페이지가 따를 상태 처리 기준이 명확해진다 — 리스트는 로딩, 디테일은 404 처리를 빠뜨리지 않는다.
- 빈 화면 표현이 `EmptyState` 하나로 일관된다.
- 주보·공지가 Article schema로 검색에 노출돼, 공개 콘텐츠의 검색 도달이 늘어난다.

### 부정적 / 트레이드오프

- Phase 4 작업량이 늘어난다 — 상태 파일이 0건인 도메인에 `loading`·`not-found` 신규 작성, `news/bulletins/page.tsx`의 날것 `<div>`를 `EmptyState`로 교체, news 디테일 2곳에 JSON-LD 추가.
- 스켈레톤 16개 도메인(community·next-gen 등)은 페이지 구현 자체가 Phase 3/4라, 상태 파일도 그때 함께 만든다.

### 영향 범위

- 코드: `(content)` 각 도메인의 `loading.tsx`·`error.tsx`·`not-found.tsx`, `news/bulletins/page.tsx`(EmptyState 교체), `news/bulletins/[id]`·`news/notices/[id]`(JSON-LD 추가). 실제 작업은 Phase 3·4.
- 운영: 본 ADR은 결정·문서까지다.

## Alternatives Considered

### A안: 느슨하게 — EmptyState만 표준, 상태 파일은 권장

- 기각: `loading.tsx`가 없으면 데이터 로딩 중 빈 화면이 그대로 보이고, `not-found.tsx`가 없으면 잘못된 id로 들어와도 404가 안 뜬다. 사용자가 보는 화면 품질이 떨어진다.

### B안: JSON-LD를 sermons에만 유지

- 기각: 주보·공지도 공개 콘텐츠라 검색 노출 가치가 있다. Article schema는 표준이라 적용 비용이 낮다.

## References

- 관련 exec-plan: `docs/exec-plans/active/2026-06-01-design-catalog.md`
- 관련 감사: `docs/design-system/audit.md` (V1-5·V4-1·V4-2·V4-3)
- 관련 PR: Phase 2 PR에서 채움
