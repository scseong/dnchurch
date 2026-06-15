# focus-ring-unify

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-15
- **브랜치**: style/focus-ring-unify
- **Open questions**: none
- **ADR needed**: no — 기존 토큰·믹스인 적용. docs/decisions·skills 변경 없음. 다단계라 CODEX_PLAN_REVIEW만 수행.

## 목표

content/ui와 admin의 `:focus` 표시를 일관된 토큰·패턴으로 모은다. 마지막 남은 수동 outline 링(`ui/Select`)을 `focus-ring` 믹스인으로 바꾸고, `FormField`의 `!important`를 없앤다. admin focus는 admin accent(`$primary-soft`) border와 glow(`$primary-soft-subtle`)로 맞추고, 하드코딩 rgba도 토큰으로 바꾼다.

## 검증된 Assumptions

(EXPLORE: Read + Grep로 확인)

- `focus-ring` 믹스인·토큰 SSOT 존재 — `_mixins.scss:232` + `_semantic.scss:97-107`($spacing-2=0.2rem·$border-focus·$primary-active). ListItem·Pagination·NoticeTable·NoticeDrawer·NoticeControlBar가 이미 채택.
- content/ui 입력 4개는 이미 `border-color: $border-focus`(링 억제)로 일관 — TextField:52·SearchField:37은 안쪽 input `outline:none` + wrapper `:focus-within` border, Textarea:42·FormField:34는 자기 `outline:none`. → 변경 불필요.
- 수동 outline 링은 `ui/Select`(`Select.module.scss:27` `outline: 2px solid $border-focus`) 1곳만 남음. 루트가 `font-size: 2.777778vw`(globals.scss:112)라 `$spacing-2`=`0.2rem`은 360px 기준 2px이고 다른 폭에선 다른 모든 focus 링처럼 스케일한다 — 고정 2px이던 Select를 사이트 공통 토큰 링에 맞춘다(무변화 아님, 의도된 정렬).
- 하드코딩 `rgba(91,107,165,0.08)`(`primitives:25,70`)은 토큰 `$primary-soft-subtle`(`_color.scss:125`)과 1:1 동일.
- admin accent는 `$primary-soft`(#5b6ba5)로 확립 — active/selected/badge 15곳+(table·PageHeader·AdminSidebar·SermonForm·dropbar 등). dropdown 스타일은 selected를 peri로 두면서(`dropdown:33-49`) focus만 navy(`dropdown:235` `$primary`)라, 한 컴포넌트 안에서 색이 어긋난다.
- `FormField`는 `BulletinForm.tsx` 1곳에서 사용 중(살아있음) — `rg FormField src -g '*.tsx'`.

## Success Criteria

- `ui/Select`가 `@include focus-ring()` 사용, 하드코딩 outline px 0.
- `form/FormField` `:focus`에 `!important` 0.
- admin `primitives`에 하드코딩 rgba 0(`$primary-soft-subtle` 토큰).
- admin `dropdown`·`AdminHeader` focus가 `$primary-soft` border + `$primary-soft-subtle` glow recipe로 통일.
- `AdminHeader`가 `:focus-visible`를 `:hover`와 분리해, 키보드 포커스에서 `$primary-soft` border(+ 보조 glow)가 hover의 gray border와 다르게 보인다.
- `verify-task` lint/styles/build 통과, knip 신규 0.

## 영향받는 파일

- `src/components/ui/Select/Select.module.scss` — 수동 outline → `@include focus-ring()`
- `src/components/form/FormField.module.scss` — `:focus` `!important` 제거
- `src/components/admin/sermons/SermonForm/primitives/primitives.module.scss` — rgba ×2 → `$primary-soft-subtle`
- `src/components/admin/sermons/SermonListPage/dropdown.module.scss` — focus `$primary`/`$primary-subtle` → `$primary-soft`/`$primary-soft-subtle`
- `src/components/admin/layout/AdminHeader/index.module.scss` — `:focus-visible`를 `:hover`와 분리 + admin recipe 적용(`outline:none` 유지. `$primary-soft` border가 포커스 표시 — hover의 gray border와 구분, glow는 보조)
- `docs/tech-debt/resolved.md` — PR #108 focus-ring 항목에 잔여 사이트(Select·admin) 완료 note 추가 / `docs/design-system/context.md` — 활성 부채 발췌의 stale focus-ring 줄을 해소로 정정 (active.md엔 focus-ring 항목 없음 — 이미 PR #108에서 resolved로 이관됨)

## Non-goals

- content/ui 입력 4개(TextField·SearchField·Textarea·FormField)의 border 메커니즘 구조 변경 — 이미 일관, 토큰만 손댄다.
- admin glow를 outline 링으로 교체 — admin은 glow 언어를 의도적으로 유지([[feedback_portal_tokens]]).
- focus 외 admin 토큰 정리(예: `FormField`의 `$red-500` primitive 직접 사용) — 이번 범위에서 빼고, 발견 사실만 적는다.

## 단계별 체크리스트

- [x] 1. `ui/Select` → `@include focus-ring()` (수동 outline 제거)
- [x] 2. `form/FormField` → `!important` 제거
- [x] 3. admin `primitives` → rgba ×2를 `$primary-soft-subtle`로
- [x] 4. admin `dropdown` → focus 색을 peri(`$primary-soft`)로
- [x] 5. admin `AdminHeader` → focus/hover 분리 + peri(`$primary-soft`) glow
- [x] 6. CODEX_FIRST_PASS 생략(저위험) → `verify-task` PASS → tech-debt 갱신(resolved.md·context.md)

## Verification

- `node scripts/verify-task.mjs focus-ring-unify`
- Chrome 수동: admin 폼 입력·dropdown·헤더 검색버튼·`ui/Select`를 키보드로 포커스해 표시(peri glow / outline 링) 확인.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (블로커 2). 안전성·완전성은 통과 — FormField `!important` 제거는 특이도로 안전, dropdown 색 변경은 CSS 충돌 없음, admin accent=`$primary-soft` 결정 타당.
- **현재 판단**: Codex verbatim — (1) "`Select` 변경은 '무시각 변경'이 아닙니다. 계획에 '의도적 rem 기반 미세 변화'로 고치거나 … 재검토해야 합니다." (2) "`AdminHeader`는 glow 단독을 a11y 근거로 쓰면 안 됩니다. … '고대비 `$primary-soft` border + 보조 glow'로 고치고 …" 풀이: 루트가 `font-size: 2.777778vw`(globals.scss:112)라 `0.2rem`은 360px에서만 2px이고 다른 폭에선 다른 모든 링처럼 스케일한다 — Assumptions와 영향 파일을 "고정 2px→공통 토큰 링 정렬(무변화 아님)"로 고쳤다. AdminHeader 포커스 표시 주체를 glow→`$primary-soft` border로 고쳤다. 정정: Codex가 짚었다 — dropdown은 filter active만 peri, item active(`dropdown:142-149,196-198`)는 navy다. 그래서 "자기모순 해소"는 과장이라 D1에서 뺐다.
- **다음 행동**: 계획 수정 완료 → WORK 1단계(Select). CHANGE_REQUEST라 Codex 재요청 안 함.

## Codex 1차 검증

- **결론**: 생략 (저위험 SCSS). CODEX_FIRST_PASS 위임 트리거(큰 diff·고위험 파일·레이어 변경·검증 실패) 어디에도 해당 안 됨. 계획 단계 Codex 검증(CHANGE_REQUEST)을 이미 반영했고, Codex 윈도 런타임이 이번 세션에 3번 멈춰서(hang) 직접 측정으로 대신한다.
- **현재 판단**: 구현 diff는 SCSS 줄 단위 교체뿐(토큰·믹스인 1:1 치환, 신규 로직 0). verify-task build가 `@include focus-ring()`·`$primary-soft`·`$primary-soft-subtle` 해석을 실증한다. Claude 자체 교차 확인 — 5개 diff 모두 토큰/믹스인 치환이고, AdminHeader만 hover/focus 규칙 분리를 더했다.
- **다음 행동**: Claude 2차(verify-task) 기록 → COMMIT.

## Claude 2차 검증

- **최종 판단**: PASS — verify-task 필수 단계 중 ESLint·stylelint·build 통과. Knip는 기존 부채 warning(비차단).
- **현재 판단**: build가 5개 SCSS 변경을 컴파일해 토큰·믹스인 해석을 실증했다. 변경 파일 stylelint도 0 error(경고 4건은 내가 안 건드린 줄의 기존 hex·primitive 부채). admin focus가 dropdown·primitives·AdminHeader에서 `$primary-soft` + `$primary-soft-subtle` 한 recipe로 모였고, `ui/Select`는 공통 `focus-ring` 토큰 링을 쓴다. Chrome 3개 라우트(`/news/notices`·`/admin/sermons`·`/admin/sermons/new`)의 서버 CSS로도 실측했다. `ui/Select`는 globals·ListItem·Pagination과 같은 `outline: rgb(44,62,80) solid 0.2rem`을 썼다. admin 4곳(dropdown·AdminHeader·primitives `control`·`group`)은 전부 `border rgb(91,107,165)`(peri, `$primary-soft`) + `box-shadow rgba(91,107,165,0.08) 3px`로 일치했다. 키보드 Tab으로 폼 입력에 포커스하니 `matchesFocusVisible=true`였고 peri glow가 화면에 떴다.
- **다음 행동**: tech-debt 갱신 완료 → 사용자 승인 후 COMMIT.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260615-181611 | ✅ | ✅ | ✅ | 0(기존 부채만) | Chrome 실측 — admin focus 4곳이 같은 peri recipe로, Select가 공통 링으로 떴다 (키보드 포커스 확인) |

## 의사결정 로그

- **D1 — admin focus accent를 `$primary-soft`(peri)로 통일**
  - 문제: admin focus가 dropdown(`$primary` navy + `$primary-subtle`), primitives(`$primary-soft` peri + 하드코딩 rgba), AdminHeader(`$txt-admin-tertiary`)로 제각각이다. admin 안에서 peri와 navy가 섞여 있다 — dropdown은 filter active를 peri로 두지만(`dropdown:32-40`) 트리거 focus는 navy(`dropdown:235`)다.
  - 해결: navy(`$primary`)와 peri(`$primary-soft`) 중 peri로 모은다. admin accent가 active·selected·badge 15곳+에서 이미 peri라, navy로 가면 focus 하나만 admin accent에서 튄다. peri는 바꿀 사이트도 더 적다(primitives는 토큰화만, dropdown·AdminHeader만 색 변경).
  - 결과: admin focus가 admin의 지배적 accent(peri)와 일치한다. dropdown item active(`dropdown:142-149`)의 navy는 이번 범위 밖이다.

## 후속 작업

- admin focus를 content와 같은 outline 링으로 합칠지 — 이번엔 admin glow 언어를 유지했다.
  - 이유: glow는 admin 폼 컨트롤의 의도된 시각 언어라 outline 링으로 바꾸면 변화가 크다.
  - 다음 기준: admin/content focus 시각을 완전히 한 가지로 통일하기로 결정될 때.
  - 기록 위치: 없음 (본 plan 후속)
