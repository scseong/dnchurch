# components-tokens

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: refactor/components-tokens
- **Open questions**: none
- **ADR needed**: no — 기존 semantic 토큰으로 바꾸는 작업(신규 토큰 0). primitive→semantic 부채(tech-debt P4)의 넷째 영역. [[2026-06-15-home-tokens]]·[[2026-06-15-about-tokens]]·[[2026-06-15-news-tokens]]와 같은 트랙이고, 이번엔 여러 페이지가 공유하는 layout·form·board·common 컴포넌트가 대상이다.

## 목표

공유 컴포넌트(Header·Footer·BottomNav·MobileNavigation·FormSubmitButton·Loader·Pagination·file·board)의 primitive 직접 사용을 semantic 토큰으로 바꾼다. 값이 그대로 같은 별칭이 있는 19곳만 바꾸고, 별칭이 없는 18곳은 디자인 시스템(DS) 토큰이 비어 있어 건드리지 않는다(아래 D2).

## 검증된 Assumptions

(EXPLORE: stylelint Node API survey + `_color.scss`·각 파일 Read)

- 공유 컴포넌트 survey 37건. 값 동일 별칭이 있는 19건 = `$white`(표면 7·텍스트 5·테두리 1)·`$navy-950` 표면 1·`$gold-600` 3·`$gold-400` 1·`$gray-300` 테두리 1.
- `$white`는 `$bg-card`(표면)·`$txt-inverse`(텍스트)·`$border-inverse`(테두리) 셋 다 `$white`로 정의돼 값이 같다. `$navy-950`=`$bg-dark-nav`, `$gold-600`=`$accent`, `$gold-400`=`$accent-hover`, `$gray-300`=`$border-primary`도 값이 같다(`_color.scss` 확인).
- 나머지 18건은 값 동일 semantic이 없다 — `$black`(MobileNavigation 5·board 4)·`$navy-950` 로고 색 1·`$beige-150` 테두리 3·`$beige-200` 배경 1·`$gray-100`/`$gray-200` 스켈레톤 2·`$gray-200` 비활성 버튼 배경 1·`$navy-900`/`$navy-950` Hero 그라데이션 1.

## Success Criteria

- 값 동일 별칭 19곳을 semantic으로 바꾼다. 공유 컴포넌트 survey 37 → 18(별칭 없는 DS 공백만 남는다).
- `verify-task` build·stylelint·ESLint 통과. 바뀐 19곳은 컴파일된 hex가 그대로라 화면이 안 바뀐다.
- Chrome 실측으로 바뀐 토큰이 기대 hex로 렌더되는지 확인(navy-950·gold-600·white).

## 영향받는 파일 (실제 바뀐 10개 .module.scss — board·PhotoSwipe는 별칭 없는 gap뿐이라 안 건드림)

- `layout/Header/Header` · `layout/Header/MobileNavigation` · `layout/Header/Drawer` · `form/FormSubmitButton` · `common/Loader` · `file/FileSelector` · `file/ImagePreview` · `ui/Pagination/Pagination` · `layout/Footer/Footer` · `layout/BottomNav/BottomNav`

## Non-goals

- 별칭 없는 18건(`$black` 하이라인·`$beige` 테두리/배경·스켈레톤·Hero 그라데이션) — DS 토큰 결정이 필요해 이번 범위 밖(D2, 후속 작업으로 기록).
- 신규 semantic 토큰 신설 — 추측성 회피. 사용자 결정 전에는 안 만든다.
- 콘텐츠 페이지(home·about·news)·admin·sermons — 다른 묶음.

## 단계별 체크리스트

- [x] 1. `$white` 표면 7 → `$bg-card`, 텍스트 5 → `$txt-inverse`, 테두리 1 → `$border-inverse`
- [x] 2. `$navy-950` 표면 1 → `$bg-dark-nav`, `$gold-600` 3 → `$accent`, `$gold-400` 1 → `$accent-hover`, `$gray-300` 테두리 1 → `$border-primary`
- [x] 3. stylelint survey 공유 컴포넌트 37 → 18 → verify-task PASS → Chrome 확인

## Verification

- `node scripts/verify-task.mjs components-tokens`
- Chrome 실측: 홈에서 바뀐 토큰이 기대 hex로 렌더되는지(navy-950 `rgb(28,43,58)`·gold-600 `rgb(196,146,74)`·white `rgb(255,255,255)`).

---

## Codex 계획 검증

- **결론**: PASS — 계획이 단순(값 동일 별칭만 치환, 신규 토큰·로직 0)해 사전 plan 리뷰 대신 머지 직전 Codex 구현 리뷰로 계획의 핵심 전제(무시각 변경)가 지켜졌는지까지 확인했다. 상세는 아래 Codex 1차 검증.
- **현재 판단**: 공유 컴포넌트라 영향 범위는 넓지만 변경은 별칭 치환뿐이라 무시각 변경이다. Codex가 `_color.scss` 정의와 대조해 전제를 확인했다.
- **다음 행동**: Codex 1차 검증 결과 반영.

## Codex 1차 검증

- **결론**: PASS — 머지 직전(PR #123) Codex가 home·about·news·공유 컴포넌트 4영역 SCSS diff를 `_color.scss`와 대조 검증했다. Codex verbatim: "non-news 치환은 모두 value-identical, news 값 변경은 명시된 예외 범위, border 제거도 렌더링 변화 없는 중복 제거입니다."
- **현재 판단**: Codex가 (1) non-news 치환 전부 값 동일(`_color.scss` 11개 별칭 대조), (2) 잘못된 컨텍스트 치환 없음, (3) FormSubmitButton `.disabled_button` border 제거는 값 동일 중복(`$border-primary`=`$gray-300`=#d1d5db), (4) 깨진 셀렉터·문법 없음을 확인했다. news는 결정 B의 의도된 값 변경으로 확인.
- **다음 행동**: Claude 2차 검증으로 마무리(완료).

## Claude 2차 검증

- **최종 판단**: PASS — verify-task ESLint·stylelint·build 통과. 공유 컴포넌트 primitive 37 → 18(별칭 없는 DS 공백만 남음). Chrome 실측으로 바뀐 토큰이 기대 hex로 렌더됨.
- **현재 판단**: 값 동일 별칭 19곳을 semantic으로 바꿔 무시각 변경을 Chrome 실측으로 확인했다(치환 상세는 D1, 렌더 hex는 아래 표).
- **다음 행동**: 사용자 승인 후 COMMIT.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| Codex 1차 | — | — | — | — | — | PASS — 4영역 치환 non-news 값 동일·news 결정 B·FormSubmitButton border 중복 제거 확인 (verbatim 위) |
| Claude 2차 | 20260615-212205 | ✅ | ✅ | ✅ | 0(기존 부채만) | 공유 컴포넌트 primitive 37→18. Chrome 홈에서 navy-950 9곳·gold-600 100곳·white 64곳이 기대 hex 그대로 렌더(`mobile_header` 배경 `rgb(255,255,255)`) |

## 의사결정 로그

- **D1 — 값이 같은 별칭만 바꾸고 나머지는 두는 원칙을 공유 컴포넌트에도 그대로 적용한다**
  - 문제: 공유 컴포넌트 37건 중 일부는 값이 같은 semantic이 있고, 일부는 없다. 별칭 없는 것까지 비슷한 토큰으로 바꾸면 화면이 미세하게 달라진다.
  - 해결: home·about과 같은 기준을 쓴다 — `_color.scss`에서 값이 그대로 같은 별칭(19곳)만 바꾼다. SCSS 변수는 컴파일 시점에 같은 hex로 풀리므로 무시각 변경이 보장된다. 별칭이 없는 18곳은 그대로 둔다.
  - 결과: 19곳에서 primitive가 사라지고 화면은 안 바뀐다. 공유 컴포넌트라 영향 범위가 넓어도 안전하다.

- **D2 — 별칭 없는 18곳은 DS 토큰 공백이라 두고, 신규 토큰은 사용자 결정 전까지 안 만든다**
  - 문제: 18곳은 값이 같은 semantic이 없다. `$black` 하이라인(MobileNavigation·board의 굵은 검정 테두리 9), 로고 브랜드 색 `$navy-950` 1, `$beige-150` 헤더·하단탭 테두리 3, `$beige-200` 활성 메뉴 배경 1, `$gray-100`/`$gray-200` 스켈레톤 2, 비활성 버튼 배경 `$gray-200` 1, Hero 그라데이션 `$navy-900`/`$navy-950` 1.
  - 해결: 두 갈래뿐이다 — (가) news처럼 값이 다른 semantic으로 바꿔 시각을 미세하게 바꾼다, (나) 신규 토큰을 만든다. 둘 다 사용자 결정이 필요하다(news 결정 B는 news 한정). 토큰 추가보다 단순화를 선호한다는 기준상 지금은 안 만들고 `docs/tech-debt/active.md`에 공백 종류별로 모아 적는다.
  - 결과: 18곳은 primitive로 남되 부채 문서에 "값 동일 별칭 없음, DS 결정 필요"로 분류된다. 다음에 사용자가 검정 하이라인·스켈레톤·로고 색을 어떻게 토큰화할지 정하면 후속 정리한다.

## 후속 작업

- 공유 컴포넌트 잔여 18건(별칭 없는 DS 공백)
  - 이유: 값이 같은 semantic이 없어 시각 변경 또는 신규 토큰 결정이 필요하다.
  - 다음 기준: 사용자가 검정 하이라인·스켈레톤·로고 색·beige 테두리의 토큰화 방향을 정하면.
  - 기록 위치: `docs/tech-debt/active.md` primitive 항목
