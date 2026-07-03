# 0021 — 공유 Hero·Breadcrumb 제거, 콘텐츠 페이지 헤더를 MobileHeader + sr-only h1로 통일

- **Status**: Accepted
- **Date**: 2026-07-03
- **Deciders**: scseong
- **Tags**: frontend, layout

## Context

콘텐츠 페이지는 공유 `<Hero/>`(`src/app/(content)/layout.tsx`)가 pathname마다 배너(배경 이미지 + eyebrow + 제목 + 부제 + 브레드크럼)를 렌더했다.
그런데 목업 재설계가 진행되며 about·sermons 계열은 이미 `SELF_HERO_PATHS`(`hero.config.ts`)로 Hero를 끄고 각자 헤더를 갖게 됐다. 그래서 공유 Hero를 실제로 쓰는 페이지는 news·next-gen·community만 남았다.

공지사항 목업(`docs/references/한빛교회 공지사항.html`)은 배너가 없고 헤더가 `‹ 공지사항`(뒤로가기 + 가운데 제목) 하나다. 사용자는 "모든 콘텐츠 페이지에서 Hero 제거"를 골랐다(AskUserQuestion). 남은 공유 Hero를 없애면 배너 전략을 페이지별 헤더로 완전히 옮기게 된다.

## Decision

- `(content)/layout.tsx`에서 `<Hero/>`를 제거하고, `Hero.tsx`·`Breadcrumb.tsx`·`hero.config.ts`·`Hero.module.scss`를 삭제한다.
- 이들만 쓰던 `resolveBreadcrumbSegments`(`navigation.ts`) export도 함께 제거한다.
- 콘텐츠 페이지 헤더는 sermon-views-redesign이 확립한 패턴을 따른다: 모바일은 `MobileHeader`(뒤로가기 + 제목), 데스크톱은 GNB만 + 각 페이지의 `h1`(대개 sr-only `blind_title`).
- Hero가 렌더하던 `h1`이 사라지므로, 자체 `h1`이 없던 페이지(`/news`·`/news/bulletins`·`/news/gallery`·`/next-gen`·`/community`·`/news/notices`)에 sr-only `h1`을 넣어 접근성을 보존한다. 공지 상세는 공지 제목을 실제 `h1`로 둔다.

## Consequences

### 긍정적
- 헤더 전략이 하나로 모인다 — Hero 배너 vs per-page 헤더 두 갈래가 사라진다.
- 공지 목록·상세가 목업(`‹ 공지사항`)과 일치한다.
- 죽은 컴포넌트(about·sermons에서 이미 안 쓰던 Hero 코드)가 정리된다.

### 부정적 / 트레이드오프
- 콘텐츠 페이지에서 시각 브레드크럼(`홈 > 교회 소식 > 공지사항`)이 사라진다. GNB·BottomNav·뒤로가기가 내비게이션을 대신한다.
- news·next-gen·community가 데스크톱에서 큰 배너 대신 콘텐츠만 남아 상단이 가벼워진다(목업이 다루지 않은 페이지라 sr-only h1만 넣는다).

### 영향 범위
- 코드: `(content)/layout.tsx`, `components/layout/Header/MobileHeader.tsx`, `components/layout/index.ts`, 위 6개 페이지.
- 후속: `components/layout/container/MainContainer.module.scss` — Hero가 사라지며 드러난 상단 여백을 전체 설교(`/sermons/all`) `.body`와 동일한 상하 패딩(모바일 top 20·bottom 80, 데스크톱 40)으로 맞춤(공지·주보·섬기는이 공유).
- 삭제: `components/layout/Hero/*`(Hero·Breadcrumb·hero.config·Hero.module.scss), `config/navigation.ts`의 `resolveBreadcrumbSegments`.
- `config/navigation.ts` 수정: `resolveMobileHeader`·`resolveSiblingTabs`에 공지사항 분기 추가.
- 운영: 없음. BreadcrumbList JSON-LD는 애초에 없어 구조화 데이터·SEO 손실 없음(Codex 확인).

## Alternatives Considered

### A안: 공지사항만 Hero 제거, GNB·Hero 나머지 유지
- 사유로 기각: 사용자가 "모든 콘텐츠 페이지 Hero 제거"를 명시적으로 선택했다. 공유 Hero를 남기면 news 안에서 notices만 다른 헤더가 돼 섹션 내 불일치가 생긴다.

### B안: Hero를 sr-only 제목만 남긴 공유 컴포넌트로 축소
- 사유로 기각: 상세 페이지가 이미 공지 제목을 h1로 두므로 공유 sr-only h1과 h1이 둘이 된다. 페이지가 자기 h1을 소유하는 편이 스크린리더에 명확하다.

## References

- 관련 PR: (작성 예정)
- 관련 exec-plan: `docs/exec-plans/active/2026-07-03-notices-redesign.md`
- 관련 ADR: 0020(brown-primary-migration) — 같은 목업 재설계 흐름
