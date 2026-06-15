# news-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: refactor/news-tokens
- **Open questions**: none
- **ADR needed**: no — 기존 semantic 토큰 적용(신규 토큰 0). primitive→semantic 부채(tech-debt P4)의 셋째 영역. [[2026-06-15-home-tokens]]·[[2026-06-15-about-tokens]]와 같은 트랙이나, news는 값이 그대로 같은 별칭이 없어 DS semantic 규칙에 맞추는 쪽으로 정한다(아래 D1).

## 목표

`(content)/news`의 primitive 직접 사용(survey 11건)을 semantic 토큰으로 바꾼다. news는 대부분 `$gray-200`(divider·hover)이라 값 동일 별칭이 없어, 화면을 그대로 두는 대신 DS에 맞는 semantic으로 바꾼다(시각이 미세하게 바뀐다, 사용자 결정 B).

## 검증된 Assumptions

(EXPLORE: grep + `_color.scss`·파일 Read)

- news 11건 = `$gray-200` divider(`1px solid`) 7곳 + `$gray-200` hover 배경 2곳(`.row:hover`·`.item:hover`) + `$white` 텍스트 2곳.
- `$gray-200`(#e5e7eb)은 값 동일 semantic이 `$label-neutral-bg`(라벨 배경)뿐이라, divider·hover에 쓰면 의미가 어긋난다. `$border-subtle`=rgba(gray-500,0.22)·`$bg-hover`=navy 6% rgba는 값이 달라 별칭이 아니다.
- `$white` 텍스트 2곳은 navy 버튼(`$primary`) 위 글자라 `$txt-inverse`(=`$white`, 값 동일)가 맞다 — `not-found.module.scss:25`·`NoticeCategoryFilter.module.scss:35`.

## Success Criteria

- `$gray-200` divider 7곳 → `$border-subtle`(얕은 구분선 토큰).
- `$gray-200` hover 배경 2곳 → `$bg-hover`(DS Hover 토큰) — hover 배경은 cool navy tint를 쓴다는 Hover 3원칙 #2도 맞춘다.
- `$white` 텍스트 2곳 → `$txt-inverse`(값 동일).
- `verify-task` build·stylelint 통과, news primitive 경고 0. Chrome으로 divider·hover가 새 토큰으로 자연스럽게 보이는지 확인(미세 변화는 의도).

## 영향받는 파일 (news 4개 .module.scss)

- `notices/_component/NoticeTable` · `notices/_component/NoticeDrawer` · `notices/_component/NoticeCategoryFilter` · `bulletins/not-found`

## Non-goals

- 다른 영역(components·sermons 등) — 별도 묶음.
- divider 전용 신규 토큰 신설 — 기존 `$border-subtle`로 충분(추측성 회피).
- `$gray-200` divider를 값 보존(primitive 유지)하는 길 — 사용자 결정 B로 DS semantic 쪽을 택했다.

## 단계별 체크리스트

- [x] 1. `1px solid $gray-200`(divider 7) → `1px solid $border-subtle`
- [x] 2. `background-color: $gray-200`(hover 2) → `$bg-hover`
- [x] 3. `color: $white`(2) → `$txt-inverse`
- [x] 4. stylelint news primitive 0 → verify-task PASS → Chrome 확인

## Verification

- `node scripts/verify-task.mjs news-tokens`
- Chrome 실측: `/news/notices` 테이블·드로어 divider가 `$border-subtle`로, row hover가 navy tint로 자연스럽게 보이는지(의도된 미세 변화).

---

## Codex 계획 검증

- **결론**: 생략 (저위험 + 기존 토큰). 매핑이 `$border-subtle`·`$bg-hover`·`$txt-inverse` 기존 semantic이고 신규 토큰·로직이 없다. 시각 미세 변화는 사용자 결정(B)이라 Codex 대신 build·stylelint·Chrome 실측으로 확인한다.
- **현재 판단**: divider→`$border-subtle`, hover→`$bg-hover` 매핑이 DS Hover·border 정책과 맞는지만 Chrome으로 본다.
- **다음 행동**: WORK 1단계.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: PASS — verify-task ESLint·stylelint·build 통과. news primitive 경고 0. 시각 변화는 사용자 결정(B)대로 의도한 것.
- **현재 판단**: news 4파일 primitive 11건을 전부 semantic으로 바꿨다 — divider 7곳 `$border-subtle`, hover 2곳 `$bg-hover`, 텍스트 2곳 `$txt-inverse`. row hover가 gray에서 navy tint로 바뀌어 같은 페이지의 다른 hover와 맞춰졌다(원래 gray hover는 cool tint를 쓰라는 Hover 3원칙 #2에 어긋났다). Chrome 실측 값은 아래 표 참조.
- **다음 행동**: 사용자 승인 후 COMMIT.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260615-200615 | ✅ | ✅ | ✅ | 0(기존 부채만) | news primitive 11→0. Chrome `/news/notices` divider `$border-subtle`·hover `$bg-hover` 렌더 확인 |

## 의사결정 로그

- **D1 — news `$gray-200`은 값 보존이 아니라 DS 정합으로 바꾼다(사용자 결정 B)**
  - 문제: news 11건 중 9건이 `$gray-200` divider·hover다. `$gray-200`은 값 동일 semantic이 `$label-neutral-bg`(라벨 배경)뿐이라, divider·hover에 쓰면 의미가 어긋난다. 값을 보존하면 9건이 예외로 남아 정리가 안 된다.
  - 해결: divider는 `$border-subtle`, hover는 `$bg-hover`로 바꾼다. 값이 미세하게 달라지지만(얕은 line·navy tint hover) DS border·Hover 정책과 맞고 primitive가 실제로 사라진다. 신규 토큰은 안 만든다. 사용자가 B(시각 미세 변화 허용)를 골랐다.
  - 결과: news primitive가 0이 된다. row hover가 gray에서 navy tint로 바뀌어 Hover 3원칙(#2)도 맞춰진다. home의 gray-200 divider(D3 보류분)도 같은 기준으로 후속 정리할 근거가 생긴다.
