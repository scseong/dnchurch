# 0013 — 페이지 골격 규약: 컨테이너 단일화·자동/자체 hero 분기·news 랜딩 신설

- **Status**: Accepted
- **Date**: 2026-06-01
- **Deciders**: scseong, Claude Code
- **Tags**: frontend, design-system, layout

## Context

`(content)` 라우트 그룹의 페이지 골격(바깥 틀과 hero, 도메인 진입점)이 페이지마다 다르게 만들어져 있다. Phase 1 감사가 file:line으로 확인한 위반은 다음과 같다.

- **컨테이너 2종 혼재** (V1-1): `LayoutContainer` 10곳·`MainContainer` 5곳. 선택 기준이 없어 같은 about 도메인 안에서도 갈린다. 실측 차이는 상하 여백뿐이고(`LayoutContainer` 0·`MainContainer` `$spacing-64`), `MainContainer`의 `title` prop은 렌더가 주석 처리돼 화면에 안 나오는 dead prop이다.
- **hero 3종 공존** (V2-2): layout 자동 `Hero`, `about/page.tsx`의 자체 다크 hero, `welcome`·`vision`의 컨테이너 밖 full-width 섹션.
- **news 위임** (V1-4): `/news`가 `/news/bulletins`를 그대로 렌더해 URL과 콘텐츠가 어긋난다.

next-gen 신규 도메인(Phase 3)을 짓기 전에 골격 표준이 없으면 새 페이지도 같은 식으로 갈린다. 또한 감사 후속으로 `/about`에서 자동 hero와 자체 hero가 세로로 2개 겹쳐 렌더되는 버그를 확인했다(`fix/about-hero` 브랜치에서 선반영).

## Decision

**`(content)` 페이지 골격을 단일 `PageContainer` + 자동 hero 기본 + 자체 hero 예외 규약으로 통일한다.**

1. **컨테이너 단일화** — `LayoutContainer`·`MainContainer`를 `PageContainer` 1종으로 합친다. 상하 여백은 variant prop으로 고른다(`flush` = 0, `padded` = `$spacing-64`). `MainContainer`의 dead `title` prop과 미사용 `.title` 스타일은 제거한다.
2. **full-width 섹션** — `PageContainer`에 `fullBleed` variant를 둔다. 페이지가 컨테이너를 우회하지 않고 prop으로 전폭 섹션을 만든다.
3. **hero 분기** — layout 자동 `Hero`가 기본이다. 자체 hero를 직접 그리는 페이지는 `resolveHeroMeta`의 `SELF_HERO_PATHS`에 등록해 자동 Hero를 끈다(중복 렌더 방지). 현재 `/about`만 해당한다.
4. **Breadcrumb** — 자체 hero 페이지(랜딩 성격)는 Breadcrumb을 생략한다. 자동 Hero 페이지는 `Hero` 내부 Breadcrumb을 그대로 둔다.
5. **news 진입점** — `/news`는 위임 대신 소식 요약 랜딩(주보·공지·갤러리 모아보기)을 신설한다.

## Consequences

### 긍정적

- 컨테이너 import와 선택 기준이 1가지로 좁혀진다. Phase 3 새 페이지가 `PageContainer` + variant로 일관되게 시작한다.
- `/about` hero 중복 같은 버그를 `SELF_HERO_PATHS` 등록 규약으로 미리 막는다.
- `/news` URL과 화면 콘텐츠가 일치한다.

### 부정적 / 트레이드오프

- Phase 4 마이그레이션 비용이 생긴다 — 컨테이너를 쓰는 15곳(`LayoutContainer` 10·`MainContainer` 5)의 import 교체, `welcome`·`vision` full-width 전환, news 랜딩 신규 구현.
- 자체 hero 페이지를 새로 만들 때 `SELF_HERO_PATHS` 등록을 잊으면 자동 Hero가 또 겹친다. 등록 규약을 `page-patterns.md`에 적어 둔다.

### 영향 범위

- 코드: `src/components/layout/container/`(PageContainer 신설), `Hero/hero.config.ts`(`SELF_HERO_PATHS`), `(content)` 컨테이너 사용처 15곳(Phase 4), `news/page.tsx`(랜딩 신규).
- 운영: 코드 변경은 Phase 3·4에서 한다. 본 ADR은 결정·문서까지다.

## Alternatives Considered

### A안: 컨테이너 2종 유지 + 선택 기준만 명문화

- 기각: `title` dead prop 정리는 어차피 필요하고, 2종 중 무엇을 쓸지 페이지마다 판단해야 한다. 토큰·컴포넌트를 늘리기보다 줄이려는 방향과 맞지 않는다.

### B안: 자체 hero를 없애고 자동 Hero로 통일

- 기각: `about` 자체 hero는 다크 배경·설립 연도 stats 등 특수 랜딩 디자인이다. 표준 이미지 hero인 자동 Hero로 바꾸면 그 디자인을 잃는다.

### C안: `/news` → `/news/bulletins` redirect

- 기각: news 도메인에는 주보·공지·갤러리 3개 영역이 있다. 게시판으로 바로 보내면 나머지 두 영역의 진입점이 사라진다. 요약 랜딩이 도메인 입구로 맞다.

## References

- 관련 exec-plan: `docs/exec-plans/active/2026-06-01-design-catalog.md`
- 관련 감사: `docs/design-system/audit.md` (V1-1·V1-4·V2-2)
- 관련 fix: 커밋 `4637e28` (본 PR에 cherry-pick) — `SELF_HERO_PATHS`로 `/about` hero 중복 제거
- 관련 PR: Phase 2 PR에서 채움
