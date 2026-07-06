# 0020 — 공개 primary 색을 navy에서 warm brown으로 이행

- **Status**: Accepted
- **Date**: 2026-06-30
- **Deciders**: scseong
- **Tags**: frontend, design-system

## Context

설교 페이지 리디자인의 참조 시안이 warm brown(`#5a3f2e`)을 primary로 쓴다. 그런데 사이트의 `$primary`는 navy(`#2c3e50`)였고, accent(gold)·표면(beige)은 이미 warm이라 primary만 cool로 남아 톤이 갈렸다. 설교만 brown으로 바꾸면 같은 페이지의 헤더·링크가 navy로 남아 한 화면에 navy와 brown이 섞인다.

styles SKILL은 그동안 "Warm vs Cool 역할 분리" doctrine을 따랐다 — 정적 면(섹션·카드)은 warm, 인터랙션 피드백(hover/active)과 brand action은 cool(navy). 이 doctrine 아래 `$primary`·`$bg-hover`·`$primary-subtle`이 navy 계열로 묶여 있었다.

`$primary*`는 55개 SCSS가 쓰지만 모두 시맨틱 참조라 hex 하드코딩이 없어, 토큰 한 곳을 바꾸면 전역에 전파된다. 결정을 미루면 설교 리디자인이 navy 위에 올라가 톤이 어긋난 채 굳는다.

## Decision

사이트 전역 `$primary` 계열을 navy에서 warm brown으로 이행한다. 동시에 기존 "interactive = cool" doctrine을 폐기하고 새 doctrine으로 대체한다.

- **새 doctrine**: 공개 영역의 brand action·interactive feedback(`$primary`·`$primary-hover`·`$primary-active`·`$primary-subtle`·`$bg-hover`·`$txt-link`·`$border-focus`)은 **warm brown**으로 표현한다. accent는 gold, 정적 면은 beige를 유지한다.
- **admin cool 표면은 유지, 단 공유 `$primary` 버튼은 brown을 따른다**: ADR 0012가 정한 admin 전용 cool 토큰(`$bg-admin*`·`$primary-soft*`·`$bg-dark-nav*`·`$txt-on-dark-nav-*`)은 바꾸지 않는다. admin은 정보 밀도가 높아 cool 톤을 유지한다. 다만 admin 일부 기본 버튼이 전용 토큰이 아닌 공유 `$primary`를 직접 쓴다(`SermonForm` 제출:577, `PageHeader` CTA:115, `SermonListPage` 액션:92, `table` 선택:398). 이들은 전역 토큰 전파로 brown이 된다 — 개별 repoint 대신 공개 primary와 같은 brown을 쓰기로 한다. admin의 정체성 색(sidebar·badge·focus 링)은 `$primary-soft` cool로 그대로다.
- **brown primitive 5단계 신설**: `$brown-600`(hover) `$brown-800`(기본) `$brown-900`(active·dark 카드) `$brown-950`(ink·공개 헤더) `$brown-975`(가장 깊은 dark).
- **공개 dark 표면도 warm 이행**: `$bg-dark`·`$bg-dark-card`·`$overlay-image`·Hero 그라디언트를 dark-brown으로. 공개 헤더(`.top_bar`)는 새 `$bg-header`(brown-950)로 repoint.
- **공유 토큰 분리**: `$bg-dark-nav`는 공개 헤더와 admin sidebar가 공유했다. 이를 warm으로 바꾸면 admin도 brown이 되므로, `$bg-dark-nav` cool 패밀리는 그대로 두고 공개 헤더만 `$bg-header`로 옮겼다. AdminSidebar는 무수정이다.
- stylelint 금지 목록에 `$brown-*`를 추가해 컴포넌트의 primitive 직접 사용을 막는다(gradient 예외는 navy와 동일하게 warning).

## Consequences

### 긍정적
- 공개 영역 primary·accent·표면이 모두 warm으로 통일된다(brown + gold + beige).
- 시맨틱 토큰 전파라 55개 소비처를 개별 수정하지 않고 `_color.scss` 한 곳에서 끝난다.
- 설교 리디자인이 일관된 warm 색 위에 올라간다.

### 부정적 / 트레이드오프
- 헤더 top bar·Hero·다크 섹션 색이 눈에 띄게 바뀐다(navy→brown).
- admin의 정체성 색(sidebar·badge·focus)은 cool로 남지만, 공유 `$primary`를 쓰던 admin 기본 버튼 4곳은 brown으로 바뀐다 — admin 안에서 cool과 brown이 섞여 코드 리뷰 때 혼동 가능.
- not-found 페이지는 `$bg-dark-nav*` cool 패밀리를 admin과 공유해 이번에 못 바꿨다 — cool로 남아 후속 정리 대상.

### 영향 범위
- 코드: `src/styles/tokens/_color.scss`(primitive·semantic), `_semantic.scss`(overlay), `Hero.module.scss`, `Header.module.scss`, `.stylelintrc.json`.
- 문서: `.claude/skills/styles/SKILL.md`(Warm vs Cool 절·치트시트), `CLAUDE.md`.
- 운영: admin 전용 cool 토큰은 무변경이나, 공유 `$primary`를 쓰던 admin 기본 버튼 4곳(`SermonForm`·`PageHeader`·`SermonListPage`·`table`)은 brown으로 바뀐다. 공개 전 페이지의 링크·버튼·focus 색 변경.

## Alternatives Considered

### A안: 설교 화면 전용 brown 토큰 (전역 navy 유지)
- 사유로 기각: 같은 페이지의 공용 헤더·푸터가 navy로 남아 한 화면에 navy+brown이 섞인다. 사용자가 전역 이행을 선택.

### B안: primary는 navy 유지, 설교 강조색만 brown-gold
- 사유로 기각: 시안과 가장 멀고, 링크·버튼이 여전히 navy라 warm 통일이 안 된다.

### C안: 공유 `$bg-dark-nav`를 warm으로 바꾸고 admin에 새 cool 토큰 신설
- 사유로 기각: AdminSidebar 15곳을 건드려 admin 회귀 위험이 커진다. 공개 헤더 한 곳만 repoint하는 쪽이 외과적.

## References

- 관련 PR: (브라운 마이그레이션 PR — 생성 후 기입)
- 관련 exec-plan: `docs/exec-plans/active/2026-06-30-brown-primary-migration.md`
- 관련 ADR: `0012-admin-token-unification.md` (admin cool 예외 근거)
