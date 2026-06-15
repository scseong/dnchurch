# home-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: refactor/home-tokens
- **Open questions**: none
- **ADR needed**: no — 기존 semantic 토큰 적용(신규 토큰 0). primitive를 semantic으로 바꾸는 부채(tech-debt P4)의 첫 영역 묶음(PR).

## 목표

`app/_component/home`의 primitive 직접 사용(survey 45건)을 semantic 토큰으로 바꾼다. solid primitive와 `rgba(...)` 안 primitive는 값이 같은 semantic 별칭으로 바꿔 화면 색을 그대로 유지한다. 값이 같은 별칭이 없는 몇 곳은 primitive를 두고 주석으로 사유를 적어 예외로 남긴다([[styles]] SKILL '예외' 준거).

## 검증된 Assumptions

(EXPLORE: stylelint Node API 집계 + `_color.scss` Read)

- 매핑 토큰은 값이 같은 별칭이라 치환해도 시각이 안 바뀐다 — `$accent`=`$gold-600`(`_color.scss:129`), `$accent-hover`=`$gold-400`(130), `$bg-dark-nav`=`$navy-950`(90), `$txt-inverse`=`$white`(64), `$bg-card`=`$white`(82), `$primary-active`=`$navy-950`.
- home 45건 분포 = `$gold-600` solid 다수(→`$accent`) + `rgba($gold-600,α)` 8(α 0.18~0.8) + `$navy-950` 4 + `$white` 3 + `$gold-400` 1 + `rgba($white,0.5)` 1 + `$gray-200` 1.
- `$gray-200`(`FeedContent:142` border)·`$navy-950`(`SermonCard:48,141` gold 배지 위 텍스트)은 값이 같은 1:1 semantic 별칭이 없어 WORK에서 컨텍스트로 판단한다.

## Success Criteria

- home solid primitive(`$gold-600`·`$gold-400`·`$navy-950` 배경·`$white`)가 semantic 토큰으로 바뀐다.
- `rgba(...)` 안 primitive는 `rgba($accent, α)`처럼 semantic 별칭으로 바꿔 경고까지 없앤다. 값이 같은 별칭이 없는 곳만 주석을 달아 예외로 남긴다.
- 별칭 치환이라 화면 색이 안 바뀐다 — Chrome으로 home 샘플(eyebrow·배지·다크 면)이 치환 전과 같게 보이는지 확인한다.
- `verify-task` build·stylelint 통과. home primitive warning이 사면된 예외 수까지 줄어든다.

## 영향받는 파일 (home 8개 .module.scss)

- `QuickAccess` · `SermonCard` · `FeedContent` · `Banner` · `RecentSermons` · `FeedSection` · `NewHere` (`app/_component/home/*.module.scss`)

## Non-goals

- about·news·components 등 다른 영역 — 별도 chunk(PR).
- rgba 투명도 조합용 신규 토큰 신설 — SKILL이 예외로 사면. 신규 토큰은 추측성 추상화라 안 만든다.
- 컴포넌트 구조·클래스·hover 로직 변경 — 토큰 값 치환만.

## 단계별 체크리스트

- [x] 1. `$gold-600` solid → `$accent`, `$gold-400` → `$accent-hover` (대다수)
- [x] 2. `$navy-950` 배경 → `$bg-dark-nav` / `$white` 텍스트 → `$txt-inverse` · 면 → `$bg-card`
- [x] 3. 판단 케이스 — `$navy-950` 텍스트·`$gray-200` divider는 값 동일 별칭이 없어 primitive 유지 + 주석(D2·D3)
- [x] 4. rgba는 `rgba($accent,α)`로 흡수 — 값 동일 + semantic이라 경고까지 해소(D1, disable 불필요)
- [x] 5. stylelint home primitive 45→3(사면 예외) → verify-task PASS

## Verification

- `node scripts/verify-task.mjs home-tokens`
- stylelint home primitive warning 카운트 감소 확인(잔여 = 사면된 rgba 예외만).
- Chrome 실측: home(eyebrow accent·SermonCard 배지·NewHere 다크 면)이 치환 전과 같게 보이는지.

---

## Codex 계획 검증

- **결론**: 생략 (저위험 별칭 치환). 매핑이 전부 값이 같은 semantic 별칭이고 신규 토큰·로직이 없다. 다단계지만 외과적 토큰 치환이라 Codex 대신 verify-task build·stylelint·Chrome 실측으로 대신한다.
- **현재 판단**: 판단 케이스 3종(rgba 사면·`$gray-200` border·`$navy-950` 텍스트)만 WORK에서 컨텍스트로 정하고 의사결정 로그에 남긴다.
- **다음 행동**: WORK 1단계.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: PASS — verify-task ESLint·stylelint·build 통과. 값 동일 별칭 치환이라 시각 변화 0.
- **현재 판단**: home 7파일 primitive 45건 중 42건을 값 동일 semantic 별칭으로 바꿨다(`$accent`=`$gold-600`·`$bg-dark-nav`=`$navy-950`·`$txt-inverse`/`$bg-card`=`$white` — build 통과로 별칭 해석이 맞다고 확인). stylelint home primitive 경고가 45→3으로 줄었고, 남은 3은 의도로 보존한 semantic-미정 예외다(navy 텍스트 2 + gray-200 divider, 주석). rgba는 `rgba($accent,α)`로 흡수해 경고까지 없앴다(D1). Chrome 실측으로도 확정했다 — home의 migrated 요소 7개가 모두 원래 primitive와 같은 색으로 떴다(eyebrow·color_bar·배지 bg `rgb(196,146,74)`=gold-600, icon_box·year_badge·배지 텍스트 `rgb(28,43,58)`=navy-950, list_card `rgb(255,255,255)`=white). 페이지 렌더도 정상이다.
- **다음 행동**: 사용자 승인 후 COMMIT.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260615-192738 | ✅ | ✅ | ✅ | 0(기존 부채만) | home primitive 45→3(예외 주석). Chrome 실측 — migrated 7요소가 원래 primitive와 같은 색으로 떠 화면 무변화 확인 |

## 의사결정 로그

- **D1 — `rgba($gold-600, α)`를 `rgba($accent, α)`로 흡수 (disable 불필요)**
  - 문제: rgba 안 primitive는 알파가 0.18~0.8로 제각각이라 값이 같은 단일 semantic 토큰이 없다. SKILL은 이를 '예외'로 사면하지만 그러면 경고가 그대로 남는다.
  - 해결: `$accent`가 `$gold-600` 별칭이라 `rgba($accent, α)`로 바꾸면 값이 같고, `$accent`는 semantic이라 경고도 사라진다. stylelint-disable 주석을 쓰지 않는다.
  - 결과: rgba 8건이 값을 그대로 둔 채 경고까지 없어졌다.
- **D2 — gold 위 navy 텍스트(SermonCard ×2)는 primitive 유지 + 주석**
  - 문제: gold 배지·재생버튼 위 `color: $navy-950` 텍스트는 값이 같은 text semantic이 없다. `$primary-active`(=navy-950)는 'active 상태' 의미라 정적 텍스트에 쓰면 의미가 어긋난다.
  - 해결: 값을 바꿀 수 없고 맞는 토큰도 없어 `$navy-950`을 두고 `// semantic 미정` 주석을 달았다. 경고는 SKILL '예외'로 둔다.
  - 결과: 시각을 보존했다. text-on-accent 토큰이 필요해지면 그때 만든다.
- **D3 — `$gray-200` divider(FeedContent)는 primitive 유지 + 주석**
  - 문제: `border-bottom: ... $gray-200`(divider)은 `$border-primary`(gray-300)·`$border-subtle`(rgba gray-500 22%)와 값이 달라 별칭으로 못 바꾼다.
  - 해결: 값을 보존하려 `$gray-200`을 두고 주석을 달았다. 다른 border 토큰으로 바꾸면 색이 미세하게 달라진다.
  - 결과: 시각을 보존했다. divider 색 정책이 정해지면 일괄 정리한다.
