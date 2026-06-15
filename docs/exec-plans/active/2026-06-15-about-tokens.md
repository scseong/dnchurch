# about-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: refactor/about-tokens
- **Open questions**: none
- **ADR needed**: no — 기존 semantic 토큰 적용(신규 토큰 0). primitive를 semantic으로 바꾸는 부채(tech-debt P4)에서 둘째 영역을 맡는다. 방법은 [[2026-06-15-home-tokens]]와 같다.

## 목표

`(content)/about`의 primitive 직접 사용(survey 36건)을 semantic 토큰으로 바꾼다. 값이 같은 semantic 별칭으로 바꿔 화면 색을 그대로 유지하고, 값이 같은 별칭이 없는 곳은 primitive를 두고 주석으로 사유를 적는다([[styles]] SKILL '예외').

## 검증된 Assumptions

(EXPLORE: grep + `_color.scss` Read)

- 매핑 토큰이 값이 같은 별칭이라 화면 색이 안 바뀐다 — `$bg-primary`=`$beige-50`, `$bg-beige-subtle`=`$beige-100`, `$bg-secondary`=`$beige-150`, `$bg-secondary-deep`=`$beige-300`, `$bg-card`=`$white`, `$bg-dark-nav`=`$navy-950`, `$accent`=`$gold-600`, `$accent-hover`=`$gold-400`, `$accent-subtle`=`$gold-100`(`_color.scss` 확인).
- about 36건 ≈ `$white`(면) 다수 + `$beige-50/100/150` + `$gold-400/600/100` + `$navy-950`(gradient·면) + `rgba($gold-600,α)`.
- `$beige-200`은 background용 `$bg` 별칭이 없다 — `$border-card`만 `$beige-200`인데 border 토큰이다. about에서 `$beige-200`은 전부 `background:`(page·welcome·vision 4곳)라 값이 같은 면 토큰이 없어 primitive 유지 + 주석(D2).

## Success Criteria

- about solid primitive(`$white`·`$beige-50/100/150`·`$gold-*`·`$navy-950` 면)가 값 동일 semantic 별칭으로 바뀐다.
- `rgba($gold-600,α)`와 다크 gradient의 `$navy-950`을 각각 `rgba($accent,α)`와 `$bg-dark-nav`로 바꾼다(값이 같고 semantic이라 경고도 없어진다).
- `$beige-200` background 4곳만 primitive 유지 + 주석(값 동일 면 토큰 없음).
- `verify-task` build·stylelint 통과. about primitive 경고가 예외(약 4)만 남게 감소. Chrome으로 화면 무변화 확인.

## 영향받는 파일 (about ~8개 .module.scss)

- `about/page` · `about/welcome/page` · `about/location/page` · `about/worship/page` · `about/vision/page` · `worship/_component/{WorshipCard,SchoolGrid,AboutWorship}`

## Non-goals

- home·news·components 등 다른 영역 — 별도 묶음.
- `$beige-200` background용 신규 `$bg` 토큰 신설 — 추측성이라 안 만든다(발견만, D2).
- `rgba(255,255,255,α)` 같은 하드코딩 색 — primitive가 아니라 별도 부채(범위 밖).

## 단계별 체크리스트

- [x] 1. `$white` 면 → `$bg-card`, `$beige-50/100/150` → `$bg-primary`/`$bg-beige-subtle`/`$bg-secondary`
- [x] 2. `$gold-600/400/100` → `$accent`/`$accent-hover`/`$accent-subtle`, `rgba($gold-600,α)` → `rgba($accent,α)`
- [x] 3. `$navy-950`(면·gradient) → `$bg-dark-nav`
- [x] 4. `$beige-200` background 4곳 → primitive 유지 + 주석(D2)
- [x] 5. stylelint about 36→4(예외) → verify-task PASS → Chrome /about 색 일치

## Verification

- `node scripts/verify-task.mjs about-tokens`
- Chrome 실측: about 페이지(beige 섹션·white 카드·gold 요소·다크 gradient)가 치환 전과 같게 보이는지.

---

## Codex 계획 검증

- **결론**: 생략 (저위험 별칭 치환). [[2026-06-15-home-tokens]]에서 검증한 같은 방법이고 매핑이 값 동일 별칭이라 Codex 대신 build·stylelint·Chrome 실측으로 확인한다.
- **현재 판단**: 판단 케이스는 `$beige-200` background(D2) 하나뿐이다.
- **다음 행동**: WORK 1단계.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: PASS — verify-task ESLint·stylelint·build 통과. 값 동일 별칭이라 화면 색이 안 바뀐다.
- **현재 판단**: about 8파일 primitive 36건 중 32건을 값이 같은 semantic 별칭으로 바꿨다(매핑은 Assumptions 참조). stylelint about primitive 경고는 36→4로 줄었고, 남은 4는 값이 같은 면 토큰이 없는 `$beige-200` background다(주석, D2). `rgba($gold-600,α)`와 다크 gradient의 `$navy-950`도 semantic 별칭으로 바꿔 경고를 없앴다. Chrome `/about` 실측에서 migrated 배경·텍스트가 모두 원래 primitive와 같은 색으로 보였다(white·beige-50·beige-200·navy·gold 일치).
- **다음 행동**: 사용자 승인 후 COMMIT.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260615-194913 | ✅ | ✅ | ✅ | 0(기존 부채만) | about primitive 36→4(beige-200 예외). Chrome `/about` 색 일치로 화면 무변화 확인 |

## 의사결정 로그

- **D2 — `$beige-200` background는 primitive 유지 + 주석**
  - 문제: about의 `background: $beige-200`(page·welcome·vision 4곳)은 값이 같은 `$bg` 토큰이 없다. `$border-card`만 `$beige-200`인데 테두리 토큰이라 면에 쓰면 의미가 어긋난다. `$bg-secondary`(beige-150)·`$bg-secondary-deep`(beige-300)는 값이 달라 별칭이 아니다.
  - 해결: 값을 보존하려 `$beige-200`을 두고 `// semantic 미정` 주석을 단다. 면용 beige-200 토큰을 새로 만들지 않는다(추측성).
  - 결과: 화면 색을 보존한다. beige 면 단계가 정리되면 일괄 토큰화한다.
