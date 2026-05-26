# admin-token-unification

- **상태**: ✅ 완료 (2026-05-26)
- **시작일**: 2026-05-22
- **브랜치**: feat/admin-token-unification (2026-05-25 `develop`에서 분기. admin SCSS는 sermons 콘텐츠 파일과 겹치지 않아 `feat/sermons-publish-ssot` 머지를 기다리지 않음)
- **Open questions**: 없음. Q1(색 통일 vs admin 톤 흡수)은 ADR 0012가 **흡수(Adopt-and-rename)**로 확정. status 토큰은 `-soft` 접미사 신규 semantic으로 값 보존 흡수.
- **ADR needed**: yes — admin 25 토큰을 메인 시스템으로 흡수하는 영구 결정. ADR 0003 References의 placeholder 자리이며 0005는 about-pages-content-model에 이미 할당되었으므로 본 ADR은 **0012**로 신설.

## 목표

`.shell` scope 내 `--admin-*` 26종 + 레이아웃 3종 정의를 제거하고, 13 파일 340 사용처를 모두 메인 SCSS 토큰(`$txt-*`/`$bg-*`/`$border-*`/`$primary`/`$shadow-*`/`$transition-easing-default`) 또는 본 plan에서 메인에 흡수한 신규 semantic으로 치환한다. 결과적으로 admin 영역도 `src/styles/tokens/`만 SSOT로 사용한다.

## 검증된 Assumptions

- `:root --admin-*` 정의는 `src/components/admin/layout/AdminLayout/index.module.scss:1-30` 한 곳에 존재 — `rg ':root|--admin-' src/components/admin/layout/AdminLayout/index.module.scss` (한 파일에서만 29 변수 선언 — `--admin-*` 26 + 레이아웃 3).
- `var(--admin-*)` + `var(--sidebar-w*)` + `var(--header-h)` 사용은 13 파일 340 occurrence — `Grep "var\(--admin-[a-z0-9-]+\)|var\(--sidebar-[a-z0-9-]+\)|var\(--header-h\)"` 카운트. (2026-05-25 분기 시점 재확인. plan 작성 시 335에서 sermons-publish-ssot 작업분 +5 — AdminHeader +1, AdminSidebar +3, SermonForm/index +1.)
- 메인 토큰 SSOT는 `src/styles/tokens/{_color,_layout,_effect,_typography,_spacing,_semantic,_breakpoint}.scss` 7종 — `Read src/styles/tokens/_color.scss` 확인. `additionalData`로 `_variables.scss` 전체 모듈 자동 주입(`.claude/skills/styles/SKILL.md` "자동 주입 동작 방식").
- 메인에 admin 사이드바 다크 hover/active 톤·admin 헤더 높이·cool 페이지 배경 매핑 없음 — `_color.scss`에 `$bg-dark-nav: $navy-950`만 존재(hover/active 미정), `_layout.scss`에 `$header-height: 7.2rem`만 존재(admin은 56px = 5.6rem).
- ADR 0003 References의 placeholder 번호 `0005-admin-token-unification`은 실제 0005가 `about-pages-content-model`로 사용 중 — `ls docs/decisions/` 확인. 최신 ADR은 0011, 다음 가용 번호 0012.
- `--admin-ease: cubic-bezier(0.4, 0, 0.2, 1)`은 메인 `$transition-easing-default`와 완전 일치 — `Read src/styles/tokens/_effect.scss:34`.
- 사용자 메모리 `feedback_portal_tokens.md`: Modal/BottomSheet 등 portal 컴포넌트와 children은 admin 토큰 X — 본 plan은 `.shell` scope 내부만 손대고 portal/shared UI는 손대지 않는다.

## Success Criteria

- (1) `rg 'var\(--admin-' src` 결과 0 hit.
- (2) `rg 'var\(--sidebar-w(-collapsed)?\)|var\(--header-h\)' src` 결과 0 hit (admin 외 공용 `--header-h` 없는지 사전 확인 — 메인 `$header-height`는 SCSS 토큰, CSS custom property 아님).
- (3) `src/components/admin/layout/AdminLayout/index.module.scss` 1-30행의 `:root --admin-*` 블록 삭제.
- (4) `yarn lint`·`yarn lint:styles`·`yarn build`·`yarn knip` 4종 PASS — `node scripts/verify-task.mjs admin-token-unification`로 일괄.
- (5) 시각 회귀 점검 — admin 5 페이지(`/admin`, `/admin/sermons`, `/admin/sermons/new`, `/admin/sermons/[id]/edit`, `/admin/sermons` loading/error) 모바일·PC 2 viewport에서 사이드바·헤더·테이블·폼 카드·뱃지·status pill의 색/border/shadow가 통일 후 의도된 차이 외 unintended 변화 0건. 의도된 변화는 ADR 0012에 사전 명시.
- (6) `docs/tech-debt-tracker.md` "admin 토큰 통합 (ADR 0005 placeholder)" 항목을 해소(`✅`) 처리하고 본 ADR 번호로 갱신.

## Non-goals

- admin 컴포넌트 React/구조 변경 — SCSS만 손댄다. `SermonForm`·`SermonListPage` 등 logic·markup 무변경.
- 다크모드 도입 — 본 ADR은 라이트 톤 통합만. 다크모드는 후속 ADR(`tech-debt-tracker.md` "design-system-v3 follow-up: 다크모드 토큰 분리"와 묶음).
- admin 브랜드 톤 자체 재설계 — cool→warm 통일·gold 도입·navy 채도 조정 등.
- portal 컴포넌트(Modal/BottomSheet) admin 톤 주입 — `feedback_portal_tokens.md` 위반 위험. portal은 globals 토큰만 사용 유지.
- 사용 중 브랜치 `feat/sermons-publish-ssot`와 합쳐 진행 — 분리 진행(머지 후 새 브랜치). 동일 SCSS 파일 동시 수정 충돌 회피.
- 색이 다른 status 토큰(warn/ok/err) 값 통일 — Q1에 따라 ADR 0012에서 흡수(admin 톤 보존) 채택 시 메인에 신규 semantic 추가만, 색 자체는 유지.

## 감사

- 사용 빈도(파일별, 340 총합, 2026-05-25 재확인):
  - `SermonListPage/table.module.scss` 82 · `SermonForm/index.module.scss` 81 · `SermonListPage/index.module.scss` 46 · `AdminSidebar/index.module.scss` 27 · `AdminHeader/index.module.scss` 20 · `SermonForm/Preview/preview.module.scss` 17 · `PageHeader/index.module.scss` 14 · `SermonListPage/dropdown.module.scss` 14 · `SermonForm/primitives/primitives.module.scss` 13 · `(admin)/admin/sermons/loading.module.scss` 9 · `(admin)/admin/sermons/error.module.scss` 9 · `SermonForm/primitives/Field.module.scss` 5 · `AdminLayout/index.module.scss` 3.
- 토큰별 매핑 후보(상세는 본 plan "## 접근법" 매핑표):
  - A. 직접 매핑 (값/의미 동일·근사): `--admin-bg-card`/`--admin-ease`/`--admin-t1`/`--admin-t2`/`--admin-pri`/`--admin-sidebar-bg`/`--admin-bd-s`/`--admin-sh-s`/`--admin-sidebar-t1` (9건).
  - B. 신규 semantic 흡수 (admin 톤 보존): `--admin-bg`/`--admin-bg-w`/`--admin-bg-hover`/`--admin-bd`/`--admin-t3`/`--admin-accent`/`--admin-accent-bg`/`--admin-warn`/`--admin-warn-bg`/`--admin-ok`/`--admin-ok-bg`/`--admin-err`/`--admin-sidebar-t2`/`--admin-sidebar-t3`/`--admin-sidebar-hover`/`--admin-sidebar-active`/`--admin-sidebar-border` (17건).
  - C. layout 신규 (`_layout.scss`): `--header-h`/`--sidebar-w`/`--sidebar-w-collapsed` (3건).

## 접근법

**매핑 전략 = 흡수(Adopt-and-rename)**. admin 톤 자체를 보존하면서 토큰 정의 위치만 `:root` → `src/styles/tokens/`로 이주. 색 통일은 본 작업 범위 밖.

**매핑표** (admin → 메인 SCSS 토큰):

| Admin (값) | 메인 매핑 | 분류 | 비고 |
| --- | --- | --- | --- |
| `--admin-bg-card` `#fff` | `$bg-card` | A | 완전 일치 |
| `--admin-ease` cubic | `$transition-easing-default` | A | 완전 일치(`_effect.scss:34`) |
| `--admin-t1` `#1a1d23` | `$txt-primary` | A | `$gray-900: #111827`과 시각 차 미미. 통일 |
| `--admin-t2` `#4b5563` | `$txt-secondary` | A | `$gray-700: #374151`과 시각 차 미미. 통일 |
| `--admin-pri` `#2e3440` | `$primary` | A | `$navy-800: #2c3e50`과 시각 차 미미. 통일 |
| `--admin-sidebar-bg` `#1f2329` | `$bg-dark-nav` | A | `$navy-950: #1c2b3a`과 시각 차 미미. 통일 |
| `--admin-bd-s` `#d1d6de` | `$border-primary` | A | `$gray-300: #d1d5db`과 시각 차 미미. 통일 |
| `--admin-sh-s` 0 1px 2px rgba(15,20,30,.06) | `$shadow-sm` 0 1px 3px rgba($gray-900,.06) | A | 시각 차 미미. 통일 |
| `--admin-bg` `#f7f8fa` | **신규 `$bg-admin`** | B | cool light gray. warm `$bg-primary`($beige-50)와 톤 다름 → 메인에 흡수 |
| `--admin-bg-w` `#f1f3f6` | **신규 `$bg-admin-subtle`** | B | admin 보조 면(table row hover 영역 등) |
| `--admin-bg-hover` `#eef0f4` | **신규 `$bg-admin-hover`** | B | 단색 cool hover — 메인 `$bg-hover`(rgba)와 분리 |
| `--admin-bd` `#e5e8ed` | **신규 `$border-admin`** | B | `$border-primary`($gray-300)보다 한 단계 옅음 — admin 표면용 |
| `--admin-t3` `#8a94a3` | **신규 `$txt-admin-tertiary`** | B | `$txt-tertiary`($gray-500)보다 밝고 cool — admin meta용 |
| `--admin-accent` `#5b6ba5` | **신규 `$primary-soft`** | B | navy 밝은 변종(link/badge/active용) |
| `--admin-accent-bg` rgba(91,107,165,.08) | **신규 `$primary-soft-subtle`** | B | accent 8% subtle |
| `--admin-warn` `#d97706` | **신규 `$status-warning-soft`** | B | muted amber. 메인 `$status-warning`(vivid orange)과 별개 — ADR 0012 확정 |
| `--admin-warn-bg` rgba(217,119,6,.08) | **신규 `$status-warning-soft-bg`** | B | `$status-warning-soft` 8% subtle |
| `--admin-ok` `#2e7d5b` | **신규 `$status-positive-soft`** | B | muted forest green |
| `--admin-ok-bg` rgba(46,125,91,.08) | **신규 `$status-positive-soft-bg`** | B | `$status-positive-soft` 8% subtle |
| `--admin-err` `#c0392b` | **신규 `$status-negative-soft`** | B | muted brick red |
| `--admin-sidebar-t1` `#e6e8ec` | `$txt-inverse` | A | `$white`와 시각 차 미미. 통일 |
| `--admin-sidebar-t2` `#9ba2ae` | **신규 `$txt-on-dark-nav-muted`** | B | 단색 cool. 메인 `$txt-dark-muted`(rgba) 대안 검토 후 결정 |
| `--admin-sidebar-t3` `#6b7280` | **신규 `$txt-on-dark-nav-faint`** | B | 위와 동일 |
| `--admin-sidebar-hover` `#2a2f36` | **신규 `$bg-dark-nav-hover`** | B | nav hover 1단 밝음 |
| `--admin-sidebar-active` `#3b434d` | **신규 `$bg-dark-nav-active`** | B | nav active 2단 밝음 |
| `--admin-sidebar-border` `#2a2f36` | **신규 `$border-dark-nav`** | B | hover와 동값. 둘은 별 의미 — 분리 토큰 |
| `--header-h` `56px` | **신규 `$admin-header-height: 5.6rem`** (`_layout.scss`) | C | 공용 헤더 `$header-height: 7.2rem`과 별개 |
| `--sidebar-w` `240px` | **신규 `$admin-sidebar-width: 24rem`** (`_layout.scss`) | C | |
| `--sidebar-w-collapsed` `64px` | **신규 `$admin-sidebar-width-collapsed: 6.4rem`** (`_layout.scss`) | C | |

총 신규 SCSS 변수 = `_color.scss` 17 + `_layout.scss` 3 = 20개. 직접 매핑 9개는 기존 토큰 재사용.

## 영향받는 파일

**메인 토큰 (신규 추가)**:
- `src/styles/tokens/_color.scss` — admin cool 표면 14 토큰 추가
- `src/styles/tokens/_layout.scss` — admin layout 3 토큰 추가

**Admin SCSS (13 파일 치환)**:
- `src/components/admin/layout/AdminLayout/index.module.scss` — `.shell` 커스텀 프로퍼티 29행 블록 제거 + 3 치환
- `src/components/admin/layout/AdminSidebar/index.module.scss` — 27 치환
- `src/components/admin/layout/AdminHeader/index.module.scss` — 20 치환
- `src/components/admin/layout/PageHeader/index.module.scss` — 14 치환
- `src/components/admin/sermons/SermonListPage/{table,index,dropdown}.module.scss` — 82+46+14 치환
- `src/components/admin/sermons/SermonForm/{index,primitives/primitives,primitives/Field,Preview/preview}.module.scss` — 81+13+5+17 치환
- `src/app/(admin)/admin/sermons/{loading,error}.module.scss` — 9+9 치환

**문서**:
- `docs/decisions/0012-admin-token-unification.md` (신규 ADR)
- `docs/tech-debt-tracker.md` — 부채 항목 ✅ 해소 갱신
- `.claude/skills/styles/SKILL.md` — admin 표면용 신규 semantic 사용 안내 1단락 추가(Primitive→Semantic 치트시트 옆)

## 단계별 체크리스트

> Phase 1-4는 29개 `var(--X)` → `$token` 1:1 매핑이라 결정적 치환 스크립트 1회로 실행하고 grep·build로 검증했다(340 치환, 잔존 0). 아래 체크는 결과 확인.

- [x] **Phase 0 — 메인 토큰 흡수** (시각 영향 0)
  - [x] `_color.scss`에 17개 추가 — `$bg-admin`/`$bg-admin-subtle`/`$bg-admin-hover`/`$border-admin`/`$txt-admin-tertiary`/`$primary-soft`/`$primary-soft-subtle`/`$status-warning-soft`/`$status-warning-soft-bg`/`$status-positive-soft`/`$status-positive-soft-bg`/`$status-negative-soft`/`$txt-on-dark-nav-muted`/`$txt-on-dark-nav-faint`/`$bg-dark-nav-hover`/`$bg-dark-nav-active`/`$border-dark-nav` (ADR 0012 매핑표)
  - [x] `_layout.scss`에 `$admin-header-height`/`$admin-sidebar-width`/`$admin-sidebar-width-collapsed` 추가
  - [x] `yarn lint:styles`·`yarn build` PASS
- [x] **Phase 1 — Admin 레이아웃 다크 영역** (3 파일, 50 치환)
  - [x] `AdminLayout/index.module.scss` — `.shell` 커스텀 프로퍼티 블록 제거 + 3 치환
  - [x] `AdminSidebar/index.module.scss` — 27 치환
  - [x] `AdminHeader/index.module.scss` — 20 치환
  - [x] `rg "var\(--admin-|var\(--sidebar-|var\(--header-h" src/components/admin/layout` → 0 hit
- [x] **Phase 2 — 공통 헤더/로딩/에러** (3 파일, 32 치환)
  - [x] `PageHeader/index.module.scss` 14
  - [x] `(admin)/admin/sermons/loading.module.scss` 9
  - [x] `(admin)/admin/sermons/error.module.scss` 9
- [x] **Phase 3 — SermonListPage** (3 파일, 142 치환)
  - [x] `SermonListPage/table.module.scss` 82
  - [x] `SermonListPage/index.module.scss` 46
  - [x] `SermonListPage/dropdown.module.scss` 14
- [x] **Phase 4 — SermonForm** (4 파일, 116 치환)
  - [x] `SermonForm/index.module.scss` 81
  - [x] `SermonForm/Preview/preview.module.scss` 17
  - [x] `SermonForm/primitives/primitives.module.scss` 13
  - [x] `SermonForm/primitives/Field.module.scss` 5
- [x] **Phase 5 — 마감**
  - [x] `rg 'var\(--admin-' src` → 0 hit (Success Criteria 1)
  - [x] `rg 'var\(--sidebar-w|var\(--header-h' src` → 0 hit (SC 2)
  - [x] `AdminLayout/index.module.scss`에 잔존 `.shell` 커스텀 프로퍼티(`--admin-*` 등) 정의 없음 재확인 (SC 3)
  - [x] `docs/tech-debt-tracker.md` 부채 항목 ✅ 갱신
  - [x] ADR 0012 `Accepted` 처리·`update-adr-index` 갱신

## ADR 판단

- **ADR needed**: yes
- **경로**: `docs/decisions/0012-admin-token-unification.md` (신규)
- **트리거**: ADR_TRIGGER_PARTS 중 `src/styles/tokens/` 변경(메인 토큰 신규 추가) + 영구 결정(admin 토큰 시스템 통합 방향). ADR 0003 References의 placeholder를 본 ADR이 대체.
- **핵심 결정**: (1) admin 톤 보존 흡수(색 통일 아님) (2) 다크 nav 영역은 메인에 `$bg-dark-nav-{hover,active}` 추가 (3) layout token은 admin 전용 prefix(`$admin-*`)로 분리.

## Verification

- 각 Phase 종료 시 `node scripts/verify-task.mjs admin-token-unification`
- 머지 직전 `node scripts/harness-gate.mjs admin-token-unification`

---

## 의사결정 로그

**D1 — sidebar-t1을 직접 매핑 9번째로 명시(의도된 통일 선언 포함)**
- 문제: ADR section 3 요약은 "8 토큰 의도된 통일"인데 직접 매핑 행은 실제 9개였다. 9번째인 `--admin-sidebar-t1`(`#e6e8ec`)이 `$txt-inverse`(`#fff`)로 가는데, hex 약 25 차이가 그 선언에 드는지 ADR에 분명하지 않았다. Codex가 material로 지적했다.
- 해결: section 3을 "9 토큰"으로 고치고 sidebar-t1 행에 "hex 약 25 차이 — white로 통일, 다크 nav 위 식별 어려움"을 적어 선언에 포함했다. `#e6e8ec`를 신규 토큰으로 보존하는 대안은 기각했다. 이유: 다크 nav 배경 위에서 `#e6e8ec`와 white는 눈으로 구별되지 않아 토큰을 늘릴 값어치가 없다.
- 결과: 직접 매핑 9개가 모두 ADR "의도된 통일" 선언 아래 들어온다. 시각 회귀 점검(SC 5)에서 sidebar-t1 색 변화가 사전 명시된 의도로 처리된다.

**D2 — 토큰 수 표기를 실측값으로 맞춤**
- 문제: ADR·exec-plan의 토큰 수가 제각각이었다. 프로퍼티 25·28, 사용처 335, 직접 매핑 8, 신규 14·17로 적혀 있었다. 실제는 `--admin-*` 26 + 레이아웃 3 = 29 프로퍼티, 340 사용처, 직접 재사용 9, 신규 색 17 + 레이아웃 3 = 20이다.
- 해결: ADR Context·section 2/3 헤더·영향 범위와 exec-plan 목표·Assumptions·감사·Phase 헤더를 실측값으로 일괄 정정했다. 340은 2026-05-25 분기 시점 `Grep` 재카운트 결과다(plan 작성 시 335에서 sermons-publish-ssot 작업분 +5).
- 결과: 두 문서의 수치가 일치한다. 구속 기준은 수치가 아니라 `rg 'var(--admin-' src` → 0 hit이다.

**D3 — Banner 경로 지적은 문서 수정 대상 아님**
- 문제: Codex가 `styles/Banner.module.scss` 경로 오기를 material로 분류했다.
- 해결: 그 경로는 ADR·exec-plan 어디에도 없다. 검증 프롬프트에서 calc 선례로 든 약식 표기였고, 실제 파일은 `src/app/_component/home/Banner.module.scss:3`이다.
- 결과: 고칠 문서가 없다. calc() SAFE 결론은 유지된다 — `SermonForm/index.module.scss:29`의 `calc(var(--header-h) + 24px)`를 `calc($admin-header-height + 24px)`로 바꿔도 Dart Sass 1.94.0에서 보간 없이 컴파일된다.

**D4 — `$txt-admin-tertiary`의 면·보더 사용은 값 보존 유지 (역할 중첩은 후속)**
- 문제: Codex 1차가 `$txt-admin-tertiary`(텍스트 토큰, #8a94a3)를 background 2곳(`SermonListPage/index.module.scss:68,75`)·border-color 5곳(`AdminHeader:99`·`PageHeader:100`·`SermonForm/index:361,511,539`)에 쓴 것을 material로 지적했다. 원본 `--admin-t3`(#8a94a3)이 텍스트·draft 점·hover 보더 세 역할에 공용이었다.
- 해결: 값 보존을 택했다. Codex 제안대로 `$border-admin`(#e5e8ed)·`$bg-admin-hover`(#eef0f4)로 바꾸면 #8a94a3이 달라져 시각 회귀가 난다. ADR 0012는 값 보존 흡수(색 통일 아님)이고 Non-goals가 디자인 변경을 제외한다. 7곳 모두 `$txt-admin-tertiary`로 두어 #8a94a3을 그대로 유지했다.
- 결과: 시각 회귀 0. 텍스트 토큰을 면·보더에 쓰는 이름 부조화가 남지만, hover 보더 5곳은 이미 "Hover Border 위반 — admin 5건" 부채라 그 작업에서 hover 보더를 없애며 정리한다. draft 점 배경 2곳은 후속 작업에 적었다.

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high, 2026-05-25). material 2건. 둘 다 문서·프롬프트 층위라 매핑과 구현 접근은 바뀌지 않는다.
- **현재 판단**: CR 해소 완료(D1·D2·D3). 실질 검증은 모두 통과 — 29 프로퍼티 매핑 완전(고아 0), 신규 17개 이름 충돌 0, calc() SAFE, 직접 매핑 9개 값 안전. 매핑 로직 무변경이라 재검증은 하지 않는다.
- **다음 행동**: WORK Phase 0(메인 토큰 20개 추가)부터 진행.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high, 2026-05-25). material 1건 — `$txt-admin-tertiary`가 background 2곳·border-color 5곳에 쓰여 텍스트 토큰 역할과 충돌. 매핑 교차(status 오교차 0건)·외과적 변경·신규 20 토큰 값·잔존 토큰 0·배치/이름은 모두 PASS.
- **현재 판단**: 지적 7곳은 원본 `var(--admin-t3)`(#8a94a3)를 값 그대로 옮긴 것(git diff 확인). Codex 제안 fix는 시각 회귀라 미적용 — 근거는 D4.
- **다음 행동**: Claude 2차에서 값 보존 확정 + 역할 중첩 후속 분리.

## Claude 2차 검증

- **최종 판단**: PASS. Codex 1차 CR을 교차 확인 — 치환 7곳 모두 원본 `var(--admin-t3)`로 값(#8a94a3) 보존(git diff 확인). Codex 제안 fix(`$border-admin`/`$bg-admin-hover`)는 #8a94a3 → #e5e8ed/#eef0f4 시각 회귀라 미적용(근거: ADR Adopt-and-rename·Non-goals 디자인 무변경, D4).
- **현재 판단**: 토큰 지역화 목표 달성 — `var(--admin-`/`var(--sidebar-w`/`var(--header-h)` 0건, 신규 20 토큰, 340 치환, `.shell` 정의 제거. verify-task PASS(ESLint·stylelint·build), Knip 경고는 기존 부채. 값 보존이라 시각 회귀 없음.
- **다음 행동**: 사용자 커밋 승인 대기.

## 검증 이력

<!-- 이전 판정·재검증만 여기에. 현재 판정은 위 검증 섹션에 둔다. -->

## 회고

- **잘된 것**: 340곳을 결정적 치환 스크립트 1회로 처리해 수동 오타·누락 0. 닫는 괄호까지 일치시켜 `var(--admin-bg)`가 `var(--admin-bg-card)`를 오염시키지 않게 함.
  - 값 보존을 끝까지 지켜 시각 회귀 0. Codex 1차가 지적한 `$txt-admin-tertiary`의 면·보더 사용도 원본 #8a94a3 보존이라, 시각이 바뀌는 교체 제안은 거절(D4).
  - develop 충돌도 같은 스크립트 재사용(`--theirs` 후 재실행)으로 #101 내용 보존하며 토큰화. 제거 114줄 = 추가 114줄 1:1 무손실 확인.
- **다음에 할 것**: 분기 전 develop의 진행 PR(#100·#101)을 먼저 확인했어야 충돌을 미리 대비할 수 있었다. 다음엔 분기 시점에 곧 머지될 PR을 점검한다.
  - 대규모 기계 치환 스크립트는 처음부터 파일 인자를 받게 설계해 재사용한다(이번엔 충돌 해소 때 다시 만듦).
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: `$txt-admin-tertiary`(#8a94a3) 역할 중첩 — 텍스트 외에 draft 점 배경 2곳·hover 보더 5곳(D4). hover 보더 5곳은 기존 "Hover Border 위반 admin 5건" 항목에서 함께 정리한다. 신규 등록은 불필요.

## 후속 작업

- admin 색 톤 자체 재설계(cool→warm 통일 또는 brand 채도 조정) — 본 ADR은 흡수만, 톤 변경은 후속
  - 이유: 본 작업이 토큰 위치 이주에 집중. 톤 변경은 별도 디자인 의사결정 필요
  - 다음 기준: admin 디자인 시스템 v5 또는 다크모드 도입과 묶음
  - 기록 위치: `docs/tech-debt-tracker.md` 신규 항목으로 등록 예정
- 다크모드 토큰 분리 — `tech-debt-tracker.md` "design-system-v3 follow-up: 다크모드 토큰 분리" 항목과 합류
- admin portal(Modal/BottomSheet) 토큰 사용 가이드 정착 — `feedback_portal_tokens.md` 메모리 SSOT 유지
- `$txt-admin-tertiary`(#8a94a3) 역할 중첩 — 텍스트 외에 draft 점 배경 2곳·hover 보더 5곳에 쓰임
  - 이유: 원본 `--admin-t3`이 세 역할 공용이었고 본 작업은 값 보존이라 그대로 옮김 (D4)
  - 다음 기준: "Hover Border 위반 — admin 5건" 부채 처리 시 hover 보더를 없애고, draft 점 배경 2곳은 면 전용 토큰 분리 검토
  - 기록 위치: 본 exec-plan D4 + `docs/tech-debt-tracker.md` "Hover Border 위반" 항목
