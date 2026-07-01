# brown-primary-migration

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-30
- **브랜치**: develop
- **Open questions**: none (D2 확정 — 다크 표면도 warm 이행)
- **ADR needed**: yes — `src/styles/tokens/_color.scss` 시맨틱 primary 재정의는 전역 디자인 시스템 변경

## 목표

사이트 전역 primary 색을 navy(`#2c3e50`)에서 warm brown(`#5a3f2e`)으로 이행한다. 설교 리디자인 참조 시안의 warm 톤을 사이트 전체로 확장하는 첫 단계 — 이후 설교 4개 뷰 리디자인이 이 토큰 위에 올라간다.

## 검증된 Assumptions

- `$primary*`는 55개 SCSS가 쓰지만 모두 **시맨틱 참조** — `_color.scss` 재정의로 자동 전파 (확인: `grep -rl '\$primary' src --include=*.scss | wc -l` = 55, 직접 hex 없음).
- navy **primitive 직접 사용**은 2곳뿐 — `Hero.module.scss`(그라디언트), `_semantic.scss`($overlay-image) (확인: `grep -rn '\$navy-' src --include=*.scss`).
- `$primary-soft*`(#5b6ba5)는 `$navy-*` primitive 체인이 아닌 직접 hex이고, 현재 admin이 cool 예외로 쓰는 토큰 — ADR 0012 기준 cool 유지(이번 brown 이행에서 **제외**). styles SKILL상 `-soft`는 admin 전용은 아니나 현 소비처가 admin뿐.
- `$accent`(gold #93702e)는 참조 시안의 badge·scripture-ref gold와 일치 — 유지.

## Success Criteria

- `$primary`·`$primary-hover`·`$primary-active`·`$primary-subtle`·`$txt-link`·`$txt-link-active`·`$border-focus`·`$bg-hover`가 brown 계열로 재정의된다. alias `$focus-ring-color`·`$focus-ring-strong-color`(=`$border-focus`·`$primary-active`)도 따라서 brown이 된다.
- 공개 dark 섹션(`$bg-dark`·`$bg-dark-card`·`$overlay-image`·Hero 그라디언트)이 warm dark-brown으로 바뀌고, Header는 warm dark 토큰으로 repoint된다.
- **admin cool 유지(무수정)**: `$bg-dark-nav`·`$bg-dark-nav-hover`·`$bg-dark-nav-active`·`$border-dark-nav`·`$txt-on-dark-nav-*`·`$primary-soft*`·`$bg-admin*`는 변경하지 않고 AdminSidebar도 손대지 않는다(브라우저로 회귀 0 확인).
- `$accent`(gold)·`$status-*`·beige 표면 토큰은 변경되지 않는다.
- `yarn lint:styles` 통과 (hex 하드코딩 0건 신규).
- 홈·교회 소개·헤더·버튼·폼 focus 링이 brown으로 보이고, admin sidebar는 cool 유지됨(브라우저 실측).
- ADR 1건 작성 — navy→brown 이행 + styles SKILL "Warm vs Cool: interactive=cool" doctrine을 "공개 interactive=warm brown, admin=cool 예외"로 대체.
- `.claude/skills/styles/SKILL.md` Warm vs Cool 절·치트시트가 새 doctrine으로 갱신된다.

## 영향받는 파일

- `src/styles/tokens/_color.scss` — brown primitive 추가 + 시맨틱 primary/link/focus/hover 재정의 + 공개 dark 섹션 토큰(`$bg-dark`·`$bg-dark-card`) warm 이행
- `src/styles/tokens/_semantic.scss` — `$overlay-image` warm 이행
- `src/components/layout/Hero/Hero.module.scss` — 그라디언트 warm 이행 (navy primitive 직접 사용처)
- `src/components/layout/Header/Header.module.scss` — `$bg-dark-nav`(cool, admin과 공유) → warm dark 토큰으로 repoint (D3)
- `docs/decisions/00XX-*.md` — ADR 신규
- `.claude/skills/styles/SKILL.md` — Warm vs Cool doctrine·치트시트 갱신, `CLAUDE.md` 토큰 설명(navy→brown)
- **무수정(검증만)**: `src/components/admin/layout/AdminSidebar/index.module.scss` — `$bg-dark-nav*` cool 유지 (D3)

## 단계별 체크리스트

- [x] 1. brown primitive 추가 (`$brown-600 #71523c` / `$brown-800 #5a3f2e` / `$brown-900 #3c2a1e` / `$brown-950 #2a241d` / `$brown-975 #211711`)
- [x] 2. 시맨틱 재정의: `$primary`→brown-800, `$primary-hover`→brown-600, `$primary-active`→brown-900, `$primary-subtle`→rgba(brown-800,.08), `$txt-link`→brown-800, `$txt-link-active`→brown-900, `$border-focus`→brown-800, `$bg-hover`→rgba(brown-800,.06)
- [x] 3. 공개 dark 섹션 warm 이행 (D2): `$bg-dark`→brown-975·`$bg-dark-card`→brown-900·`$overlay-image`·Hero 그라디언트 → dark-brown. Header `.top_bar`는 새 `$bg-header`(brown-950)로 repoint (D3). `$bg-dark-nav*` cool 패밀리·AdminSidebar 무수정. `.stylelintrc.json`에 `$brown-*` 금지 추가
- [x] 4. ADR 0020 작성(navy→brown + doctrine 대체) + `update-adr-index.mjs`
- [x] 5. styles SKILL Warm vs Cool 절·primitive·Primary Action·치트시트·hover 표 갱신 (CLAUDE.md는 토큰 세부 설명이 없어 변경 불필요 — SSOT는 styles SKILL)
- [x] 6. 브라우저 실측(`$primary`=#5a3f2e, Header=#2a241d, overlay brown, accent gold 유지) + `lint:styles` 0 errors

## Verification

- `yarn lint:styles` (dev 구동 중이라 build/verify-task 보류 — 머지 전 별도 실행)
- 브라우저 실측 (Claude in Chrome, dev 서버)

---

## 의사결정 로그

- **D1 — primary를 navy에서 warm brown으로 전역 이행**
  - 문제: 설교 리디자인 참조 시안이 brown(`#5a3f2e`) primary인데 사이트는 navy primary라, 설교만 brown으로 하면 같은 페이지의 헤더·링크와 톤이 어긋난다.
  - 해결: 사용자가 "사이트 전역 primary를 brown으로" 선택 — 페이지별 부분 적용(navy/brown 공존) 대신 토큰 레벨 전역 이행. 시맨틱 토큰이라 `_color.scss` 한 곳 재정의로 전파되어 외과적이다.
  - 결과: 홈·소개·설교·헤더·푸터·폼이 한 번에 warm primary로 통일된다. accent(gold)·beige 표면은 이미 warm이라 그대로 두고, admin만 cool로 분리해 유지한다.

- **D2 — 다크 구조 표면도 함께 warm 이행 (확정)**
  - 문제: `$bg-dark-nav`(헤더·푸터, navy-950)·`$bg-dark`·`$bg-dark-card`·Hero 그라디언트·`$overlay-image`는 navy 계열. primary만 brown으로 바꾸면 다크 표면은 여전히 cool이라 "완전 warm 이행"이 절반만 된다.
  - 해결: 사용자가 "함께 warm 이행" 선택. 참조 시안의 dark brown(`#2a241d`~`#3c2a1e`)에 맞춰 다크 표면도 이번 PR에서 이행. 헤더·푸터 색이 눈에 띄게 바뀌는 비용을 감수하고 사이트 전체를 한 번에 일관된 warm 팔레트로 맞춘다.
  - 결과: `$bg-dark`·`$bg-dark-card`·`$overlay-image`·Hero 그라디언트가 warm dark-brown으로 바뀐다. dark-nav는 admin과 공유하므로 D3에서 따로 처리한다.

- **D3 — 공유 `$bg-dark-nav`를 건드리지 않고 Header만 warm repoint (admin sidebar 무수정)**
  - 문제: Codex 계획 검증이 짚음 — `$bg-dark-nav`는 공개 Header뿐 아니라 admin sidebar(`AdminSidebar:5` 외 상태 토큰 ~15곳)·not-found가 공유한다. 이 토큰을 warm으로 바꾸면 admin sidebar도 brown이 돼 "admin cool 유지"(ADR 0012)와 정면 충돌한다.
  - 해결: `$bg-dark-nav`·`$bg-dark-nav-hover`·`$bg-dark-nav-active`·`$border-dark-nav`·`$txt-on-dark-nav-*` cool 패밀리를 그대로 두고(admin sidebar 무수정 = 회귀 위험 0), 공개 Header 한 곳만 warm dark 토큰으로 repoint한다. admin에 새 토큰을 신설하는 대안은 sidebar 15줄을 건드려 회귀 위험이 커서 기각.
  - 결과: 공개 Header는 warm으로 바뀌고, admin sidebar는 cool로 그대로 남는다. not-found(공개 에러 페이지)는 cool로 남아 후속에서 정리한다.

- **D4 — ADR이 기존 "Warm vs Cool: interactive=cool" doctrine을 명시적으로 대체**
  - 문제: Codex 계획 검증이 짚음 — styles SKILL은 "인터랙션 피드백(hover/active)·brand action은 cool(navy)"로 못 박는다. `$primary`·`$bg-hover`를 brown으로 바꾸면 이 doctrine과 구현이 어긋나, 문서를 안 고치면 다음 작업이 옛 규칙을 따른다.
  - 해결: 새 ADR이 "공개 영역 brand action·interactive feedback = warm brown, admin은 cool 예외(ADR 0012 유지)"로 doctrine을 대체한다고 명시하고, styles SKILL의 Warm vs Cool 절과 치트시트를 같은 PR에서 고친다.
  - 결과: 토큰·문서·SKILL이 한 PR에서 같은 doctrine을 가리켜 드리프트가 안 생긴다.

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 반영 완료
- **현재 판단**: material 2건(Q3·Q4)을 반영해 PLAN을 보강했다. Q3 = `$bg-dark-nav` 공유로 admin sidebar 충돌 → D3로 "Header만 repoint, admin 무수정" 확정. Q4 = "interactive=cool" doctrine 충돌 → D4로 ADR·SKILL 대체 명시. expression 2건(Q1 focus alias 명시, Q2 `$primary-soft*` 표현 정정)도 SC·Assumptions에 반영했다.
- **다음 행동**: WORK 진입 (사용자 plan 승인 후)

Codex 지적 요약 (아래는 stdout verbatim 아닌 평이 풀이):
- Q1(expression): navy-resolving 토큰 누락 없음. `$focus-ring-color`·`$focus-ring-strong-color`는 alias라 `$border-focus`·`$primary-active` 변경에 따라감 — SC에 이름 명시 권장.
- Q2(expression): `$primary-soft*`는 `$navy-*` primitive 체인이 아닌 직접 hex. "admin 전용"이 아니라 "현재 admin이 cool 예외로 사용"으로 정정 필요.
- Q3(material must-CR): `$bg-dark-nav`가 Header + admin sidebar(`AdminSidebar:5`,`:142`,`:147` 등) 공유. warm 이행 시 admin도 brown → "admin cool 유지"와 충돌. `$bg-dark-nav-hover/active`·`$border-dark-nav`·`$txt-on-dark-nav-*` 상태 토큰도 admin이 ~15곳 소비.
- Q4(material must-CR): styles SKILL이 "interactive feedback·brand action = cool"로 명시. `$primary`·`$bg-hover` brown 이행은 이 doctrine과 충돌 — ADR이 명시적으로 대체하고 SKILL을 고쳐야 함.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high) — surgical 1건 수정 완료
- **현재 판단**: 코드·토큰 마이그레이션 자체는 5항목 모두 통과 — admin cool 보존(`$bg-dark-nav`=navy-950 유지, AdminSidebar diff 빔), 토큰 wiring 정확(`Header:225`→`$bg-header`→`$brown-950`), WCAG AA 통과(brown-800 #5a3f2e on white 9.61:1·on #fafaf8 9.20:1 / brown-600 #71523c 7.06:1·6.76:1), completeness 양호(공개 navy 잔존 없음). 지적 1건 = `docs/decisions/README.md:51`의 ADR 0019 제목이 `update-adr-index.mjs` 재생성으로 동기화돼 마이그레이션과 무관하게 섞임.
- **조치**: README 0019 줄을 원래 텍스트로 되돌려 diff를 0020 추가만으로 surgical 유지. 0020 ADR H1은 한국어 결정 문장으로 바꿔 인덱스 표기를 다른 ADR과 맞춤(doc-editor 지적 동시 반영).
- **다음 행동**: 사용자 승인 후 커밋

## Claude 2차 검증

- **최종 판단**: PASS (dev 구동 중이라 build/verify-task는 머지 전 별도 실행 — lint:styles + 브라우저 실측으로 대체)
- **현재 판단**: `yarn lint:styles` 0 errors / 73 warnings(전부 기존 부채 hex·primitive, 신규 0). 브라우저(dev localhost:3000)에서 computed style 직접 확인 — `.more_link`·`.scripture`·`.ongoing` color = `rgb(90,63,46)`=#5a3f2e($primary brown), Header `.top_bar` bg = `rgb(42,36,29)`=#2a241d($bg-header), 설교 헤더 밴드 overlay warm brown, "SERMONS" eyebrow gold 유지. admin은 토큰·AdminSidebar 무수정이라 cool 보장(코드 확인).
- **다음 행동**: 머지 전 `yarn build`로 prod 확인

| 시점 | 도구 | errors | warnings(신규) | 비고 |
| --- | --- | --- | --- | --- |
| 2차 | lint:styles | 0 | 0(기존 73) | hex·primitive 부채만 |
| 2차 | 브라우저 computed style | — | — | primary #5a3f2e·header #2a241d·accent gold 확인 |

## ADR 판단

`src/styles/tokens/_color.scss` 시맨틱 primary 재정의 = ADR_TRIGGER. 전역 디자인 토큰 변경이라 ADR 필요 — 단계 4에서 작성.

## 후속 작업

- 설교 4개 뷰 리디자인(landing/all/series/detail) — 별도 task. 이 토큰 마이그레이션이 머지된 뒤 진행.
  - 이유: 토큰 기반이 먼저 서야 설교 UI가 일관된 색 위에 올라간다.
  - 기록 위치: 본 PR 머지 후 새 exec-plan
- not-found 페이지 dark-nav cool → warm 정리.
  - 이유: not-found는 `$bg-dark-nav*` cool 패밀리를 admin과 공유해, 이번 PR에서 건드리면 admin 회귀 위험. 저빈도 에러 페이지라 후속으로 분리.
  - 기록 위치: `docs/tech-debt/active.md`
