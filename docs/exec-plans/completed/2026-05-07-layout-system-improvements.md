# layout-system-improvements

- **상태**: 🟢 완료 (PR #80 머지 대기)
- **시작일**: 2026-05-07
- **완료일**: 2026-05-08
- **브랜치**: feat/design-system-v3 → develop
- **PR**: https://github.com/scseong/dnchurch/pull/80

## 목표

외부 참조(소망교회 디자인 시스템 v2.0, workspace-local 자료) 기준으로 dnchurch 레이아웃 5개 갭을 채운다 — 모바일 Footer 노출, 모바일 Hero 컴팩트 노출, z-index 토큰화, Hero eyebrow 라벨, 인라인 스크립트 분리.

## Assumptions

- LAYOUT.md는 외부(소망교회) 참조 문서이며, 컴포넌트 네이밍을 그대로 도입하지 않는다. 우리 기존 `Header/Hero/Footer/BottomNav` 구조를 유지하면서 누락된 행동·요소만 보강한다.
- PC·Mobile 분기는 별도 컴포넌트가 아닌 단일 컴포넌트 + `respond-up` SCSS 분기로 처리한다. (사용자 가이드: 컴포넌트 중복 금지)
- 기존 `MobileHeader`/`DesktopHeader` 분리 컴포넌트는 통합 비용이 커서 본 작업에서 유지 — 신규 분기만 단일 컴포넌트로.
- ADR 트리거(`scripts/_shared-config.mjs::ADR_TRIGGER_PARTS`)에 layout SCSS·`public/`·`src/components/` 모두 없음 → ADR 불필요.
- Codex 검증 확인: `/about /community /news /next-gen`은 GNB hub의 href가 자식 경로(`/about/pastor` 등)이므로 `resolveHeroMeta`가 이미 `null` 반환. `/sermons`만 Hero 표시 상태. → Hub 옵트아웃 인프라 추가 불필요.
- `globals.scss`의 `.overlay`(z-index:9999) 클래스는 사용처 0건(grep 확인) → 본 작업에서 토큰 매핑 제외.
- `<Script src=... strategy="afterInteractive">` 시점에 `<div id="root">`는 항상 DOM에 존재(루트 layout이 SSR로 렌더링). 다만 안전망으로 외부 스크립트에 null guard 포함.

## Non-goals

- LAYOUT.md 컴포넌트 명(PCNav, MBanner, MSubTabs 등) 도입
- Hero 그라디언트 카테고리별 색 다양화
- BottomNav `fixed` → `sticky` 변환
- Breadcrumb 분리/독립화 — 사용처가 Hero 안 단일 → 외과적 변경 원칙
- Hub 페이지 Hero 옵트아웃 — Codex 검증 결과 `/about` 등은 이미 null. `/sermons` 페이지는 자체 hub 여부 검증 후 별도 작업으로 분리.
- `MobileHeader`/`DesktopHeader` 단일 컴포넌트로 통합
- `.overlay`(globals) z-index 토큰화 — 사용처 없음
- Footer SNS placeholder href 정리
- 새 페이지·라우트·데이터 흐름 변경
- 인접 코드 정리·포맷·rename

## Success Criteria

- [x] 모바일(390px)에서 Footer가 노출되고 PC 동일 콘텐츠를 단일 컬럼 세로 스택으로 보여준다
- [x] 모바일에서 Hero가 컴팩트(min-height ≤ 14rem) 형태로 노출되고, Hero 내부 Breadcrumb은 모바일에서 숨김
- [x] `Header.module.scss`, `BottomNav.module.scss`, `Drawer.module.scss`에서 z-index 매직 넘버가 토큰 변수로 교체된다
- [x] Hero에 카테고리별 eyebrow 라벨(예: "ABOUT")이 노출된다
- [x] `(content)/layout.tsx`의 인라인 IIFE가 `public/scripts/scroll-reveal-observer.js` 외부 파일로 이동, `<Script src=...>`로 로드되며 외부 스크립트는 `document.getElementById('root')` null guard를 포함한다
- [ ] `node scripts/verify-task.mjs layout-system-improvements` 통과 (lint + lint:styles + build + knip)

## Verification

- `yarn lint` — ESLint
- `yarn lint:styles` — stylelint (토큰·네이밍)
- `yarn build` — Next 빌드 + 타입 검증
- `yarn knip` — unused export 검사 (인라인 상수 SCROLL_REVEAL_OBSERVER_SCRIPT 제거 확인)
- `node scripts/verify-task.mjs layout-system-improvements` — 위 4개 + logs/ 증적
- 수동(사용자): dev server에서 모바일(390px) / 태블릿(768px) / PC(1280px) 뷰포트로 Header/Hero/Footer/BottomNav 시각 확인 — Claude는 시각 확인 불가, 사용자 검수 요청

## 접근법

**반응형 통합 우선**: 새 컴포넌트 추가 없이 기존 컴포넌트의 SCSS만 모바일 표시 분기로 확장. `display:none` 가드를 제거하고 모바일 컴팩트 사양을 기본값으로, `respond-up`로 데스크톱 사양 추가.

### z-index 토큰 매핑표

`_layout.scss`에 다음 5개 토큰 추가:

| 토큰 | 값 | 매핑 위치 |
|------|---|---|
| `$z-header` | 100 | `Header.module.scss` `.mobile_header`, `.main_header` |
| `$z-bottom-nav` | 100 | `BottomNav.module.scss` `.tab_bar` |
| `$z-mega-menu` | 200 | `Header.module.scss` `.gnb_mega` |
| `$z-drawer-backdrop` | 200 | `BottomNav.module.scss` `.drawer_overlay` |
| `$z-drawer` | 201 | `Drawer.module.scss` `.drawer` |

`globals.scss` `.overlay`(9999)는 사용처 없음 → 매핑 제외. 추후 Modal 작업 시 `$z-modal-overlay`로 별도 도입.

### Hero eyebrow

`HeroMeta`에 `eyebrow?: string` 필드 추가. `HERO_META`에 카테고리별 라벨 하드코딩(`'/about': eyebrow:'ABOUT'`, `'/sermons':'SERMONS'`, `'/community':'COMMUNITY'`, `'/news':'NEWS'`, `'/next-gen':'NEXT GEN'`). `Hero.tsx`에서 `meta.eyebrow && <span class="hero_eyebrow">{meta.eyebrow}</span>` 조건부 렌더. 색상은 `$accent`($gold-600 매핑).

### 모바일 Hero 표시

`Hero.module.scss`:
- 모바일 기본값: `display: flex` + `min-height: 14rem` + `padding: $spacing-32 $container-padding $spacing-24` + `text-align: left`
- `.hero_title`: 모바일 26px, 태블릿+ 34px, PC+ 42px
- `.breadcrumb`: 모바일 `display: none`, `respond-up($header-breakpoint)`부터 표시 — `MobileHeader.mobile_tabs`가 위치 정보를 제공하므로 중복 회피
- `.hero_eyebrow` 신규: 11px(모바일) / 13px(태블릿+), `letter-spacing: $letter-spacing-wide`, `$accent`

### 모바일 Footer 표시

`Footer.module.scss`:
- 모바일 기본값: `display: block`, padding `$spacing-48 $container-padding $spacing-32`
- `.footer_grid`: 모바일 1열, gap `$spacing-32`. 태블릿+ 기존 `1.5fr repeat(3, 1fr)`
- `.footer_bottom_links` 모바일 wrap 허용(`flex-wrap: wrap`)
- 기존 `.footer_bottom`의 `respond($breakpoint-pc-sm)` column 분기는 그대로 활용

### 인라인 스크립트 외부화

- 새 파일: `public/scripts/scroll-reveal-observer.js` — IIFE 그대로 이동 + `MutationObserver` 호출에 `var rootEl = document.getElementById('root'); if (rootEl) {...}` null guard.
- `(content)/layout.tsx`: `SCROLL_REVEAL_OBSERVER_SCRIPT` 상수 + `<Script ... dangerouslySetInnerHTML>` 제거 → `<Script src="/scripts/scroll-reveal-observer.js" strategy="afterInteractive" />` 한 줄로 교체.

## 영향받는 파일

- `src/styles/tokens/_layout.scss` — z-index 토큰 5개 추가
- `src/components/layout/Hero/Hero.tsx` — eyebrow 렌더
- `src/components/layout/Hero/hero.config.ts` — `eyebrow` 필드 + HERO_META에 라벨 추가
- `src/components/layout/Hero/Hero.module.scss` — 모바일 표시, eyebrow 스타일, Breadcrumb 모바일 숨김
- `src/components/layout/Header/Header.module.scss` — z-index 토큰 치환
- `src/components/layout/BottomNav/BottomNav.module.scss` — z-index 토큰 치환
- `src/components/layout/Header/Drawer.module.scss` — z-index 토큰 치환
- `src/components/layout/Footer/Footer.module.scss` — 모바일 표시 + 단일 컬럼 + flex-wrap
- `src/app/(content)/layout.tsx` — 인라인 스크립트 제거, Script src 사용
- `public/scripts/scroll-reveal-observer.js` — 신규 (인라인 IIFE 이동 + null guard)

## 단계별 체크리스트

- [x] 1. `_layout.scss`에 z-index 토큰 5개 추가
- [x] 2. `Header.module.scss`, `BottomNav.module.scss`, `Drawer.module.scss`에서 z-index 매직 넘버 → 토큰 치환
- [x] 3. `hero.config.ts`에 `eyebrow` 필드 + 5개 카테고리 라벨 추가
- [x] 4. `Hero.tsx`에 eyebrow 조건부 렌더 추가
- [x] 5. `Hero.module.scss` 모바일 표시 + eyebrow 스타일 + Breadcrumb 모바일 숨김
- [x] 6. `Footer.module.scss` 모바일 표시 + 단일 컬럼 + flex-wrap
- [x] 7. `public/scripts/scroll-reveal-observer.js` 신규 작성 (null guard 포함)
- [x] 8. `(content)/layout.tsx` 인라인 IIFE 제거 + Script src 교체
- [x] 9. Codex 1차 검증 요청 → CHANGE_REQUEST 반영
- [x] 10. `verify-task.mjs` 실행 및 결과 기록 (run-id 20260507-230402, 모두 PASS, knip은 기존 부채)
- [ ] 11. 사용자 승인 후 커밋

## 완료 기준 (DoD)

- [x] `node scripts/verify-task.mjs layout-system-improvements` 통과
- [x] Codex 1차 검증 — CHANGE_REQUEST → 수정 적용
- [ ] 사용자 승인 후 커밋
- [x] ADR 불필요 — 본 plan에 사유 기록

## 참고 자료

- 소망교회 디자인 시스템 v2.0 외부 참조 (`docs/references/LAYOUT.md` — workspace-local, untracked) — 네이밍은 도입 X

## 의사결정 로그

- 2026-05-07: Breadcrumb 분리는 본 작업에서 제외 — 사용처 단일이라 외과적 변경 원칙 위반
- 2026-05-07: PR 분할은 단일 PR — 작업 단위가 작고 한 PR이 LAYOUT.md 갭을 한 번에 닫는 게 맥락 유지에 유리
- 2026-05-07: 컴포넌트 신규 생성 없음 — SCSS 반응형 분기만으로 처리
- 2026-05-07: Codex CHANGE_REQUEST(plan) 반영 — Hub 페이지 Hero 옵트아웃은 `/sermons` 페이지 구조 검증 후 별도 작업으로 분리(현재는 `/about` 등이 이미 null이라 인프라 추가 불필요). `.overlay` 9999는 사용처 없어 토큰 매핑 제외. Hero 모바일 Breadcrumb은 `mobile_tabs` 중복 회피 위해 숨김. External script에 `#root` null guard 추가.
- 2026-05-07: Codex CHANGE_REQUEST(impl) 반영 — Footer.module.scss `// ── 컬럼 그리드 ──`는 외과적 churn으로 `// ── 4컬럼 그리드 ──` 원복. hero.config.ts 주석 원본 복원(코드만 변경). Footer 헤더 주석은 모바일 노출 의의 표현으로 유지(task 직접 연관). untracked 문서 2개는 본 task 외 — 커밋 staging 제외.
- 2026-05-07: 사용자 요청으로 LAYOUT.md 시각 미세 정합 5건 추가 — Hero.module.scss만 수정(콘텐츠 손실 0). 그라디언트 단순화(radial+linear → linear 180deg), padding LAYOUT.md 비율 정합(40/32 모바일·40/48 PC), min-height PC 32rem→24rem(자연 높이 근사), subtitle 색상 `$txt-image-subtle`(0.7)→`$txt-dark-muted`(0.6) + line-height base→relaxed. Header top_bar·Footer 4컬럼은 콘텐츠 풍부도 유지를 위해 적용 안 함(사용자 결정). Codex 1차 검증(incremental) PASS, verify-task 재실행 PASS(run-id 20260507-233556).
- 2026-05-07: 사용자 요청으로 모바일 Hero 텍스트 중앙 정렬 — `.hero_inner`에 모바일 `text-align: center`, tablet+에서 `text-align: left`로 복귀. LAYOUT.md MBanner 사양과 일치. plan 초안의 `text-align: left` 결정 번복.
- 2026-05-08: PR #80 Gemini Code Assist + Codex 객관 리뷰 반영 — (1) `scroll-reveal-observer.js`에 `history.replaceState` wrap + `popstate` listener 추가(SPA back/forward 일관성, Codex 추가 권장), (2) `_color.scss` beige 4단계에 미사용 명시 주석(Codex: dead token intent 표시), (3) README line 11에서 untracked `PROJECT_GUIDE.md` 링크 제거, (4) exec-plan line 9·131에서 `LAYOUT.md` path 형식을 외부 참조 표기로, (5) ADR 0003 line 152의 깨진 `active/` 경로를 `completed/`로 정정. Gemini #2 (`#root`) false positive 확정 — `src/app/layout.tsx:40` 존재 + null guard.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: -
- **사유**: ADR 트리거 파일(`ADR_TRIGGER_PARTS`)에 `src/components/`, `src/styles/`, `public/`, `src/app/(content)/` 모두 미포함. 영구 결정·라이브러리 변경·데이터 흐름 변경 없음. 신규 파일 `public/scripts/scroll-reveal-observer.js`는 인라인 IIFE 외부화로 라이브러리·정책 변경 없음. 기존 토큰·반응형 정책 안에서의 누락 보강.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-07 (plan 초안 직후)
- **결론**: CHANGE_REQUEST → 반영 완료, 재요청 생략(BLOCK 아님)
- **핵심 지적**:
  1. Hub 옵트아웃 중복 가능성 — `/about` 등 이미 null
  2. z-index 매핑표 누락 (`.overlay` 9999, drawer/backdrop 분리)
  3. Footer mobile 그리드/SNS/링크 사양 구체화 필요
  4. Hero mobile에서 Breadcrumb 처리 방침 부재
  5. External script `#root` null guard / afterInteractive 타이밍 리스크 미기록
- **반영 내용**:
  1. Hub 옵트아웃을 Non-goals로 이동 (별도 작업으로 분리)
  2. z-index 매핑표를 접근법에 명시(5개 토큰), `.overlay`는 사용처 없어 매핑 제외
  3. Footer mobile: 단일 컬럼 + padding/SNS/links 구체 사양 명시
  4. Hero mobile에서 Breadcrumb `display:none`(mobile_tabs 중복 회피) 명시
  5. external script에 `document.getElementById('root')` null guard + 타이밍 리스크 기록

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-07 (구현 완료 직후)
- **결론**: CHANGE_REQUEST → 수정 적용
- **수정 파일**:
  - `src/components/layout/Footer/Footer.module.scss` — `// ── 컬럼 그리드 ──` → `// ── 4컬럼 그리드 ──` 원복(외과적 churn 회피)
  - `src/components/layout/Hero/hero.config.ts` — 주석 원본 복원("subtitle 소스/조회" 표현, eyebrow는 코드에만 반영)
- **핵심 지적**:
  1. 동작 버그·타입·레이어 위반 없음 (CLEAN)
  2. Footer.module.scss `// ── 4컬럼 그리드 ──` → `// ── 컬럼 그리드 ──`는 외과적 원칙 위반(comment churn)
  3. hero.config.ts 주석에 "subtitle·eyebrow" 추가는 외과적 strict 적용 시 churn
  4. untracked 문서(`docs/PROJECT_GUIDE.md`, `docs/references/LAYOUT.md`)는 본 task 범위 밖 → 커밋 staging 제외 확인
  5. z-index migration·plan 충실도 모두 PASS
- **남은 리스크**:
  - Footer.module.scss 헤더 주석은 모바일 노출 의의 표현으로 유지 — Codex strict 관점에서 churn 가능성 있으나 plan 의도에 부합
  - 동작 회귀 위험 없음, verify-task.mjs로 lint/build/knip 확인 예정

## Claude 2차 검증

- **검토 내용**: Codex 1차 CHANGE_REQUEST(comment churn 2건) 수정 + PR #80 등록 후 Gemini 자동 리뷰 + Codex 객관 리뷰 추가 처리. Gemini #1(replaceState wrap)·Codex 추가(popstate)·Codex 발견 4건(beige 미사용·README/exec-plan/ADR 깨진 링크) 모두 fix 적용. Gemini #2(#root)는 false positive 확정 — `src/app/layout.tsx:40` 존재 + null guard.
- **실행한 검증**: verify-task.mjs 4회 모두 PASS — ESLint·stylelint·Build 전 회차 통과, Knip은 기존 부채만.
  - 1회차 run-id: `20260507-230402` — PASS
  - 2회차 (Hero LAYOUT.md 미세 정합 후) run-id: `20260507-233556` — PASS
  - 3회차 (모바일 텍스트 중앙 정렬 후) run-id: `20260507-234116` — PASS
  - 4회차 (PR #80 fix 적용 후) run-id: `20260508-002651` — PASS
- **최종 판단**: 머지 가능 (base develop). PR #80에 8 commits 묶음으로 진행.

## 리뷰 (완료 직전)

- [x] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [x] 멀티 세션 리뷰: `codex:rescue` 객관 리뷰 완료 — PR fix 4건 반영 후 PASS

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
  - 컴포넌트 중복 0 — 단일 컴포넌트 + `respond-up` SCSS 분기로 모바일 Footer/Hero 노출 (사용자 가이드 "컴포넌트 중복 금지" 정확 반영)
  - LAYOUT.md 시각 정합 + 콘텐츠 풍부도 유지 (Header top_bar·Footer 4컬럼 보존, 사용자 결정)
  - z-index 5개 토큰화로 매직 넘버 제거, 인라인 IIFE 90줄 → 외부 파일 분리 (`#root` null guard + `replaceState`/`popstate` wrap 보강)
  - 다단계 검증 모두 통과 — Codex 계획·1차·객관 리뷰 + Gemini 자동 리뷰 + verify-task 4회 PASS
- 다음에 할 것:
  - `/sermons` hub 여부 검증 후 Hero 옵트아웃
  - Breadcrumb 분리 (Hub/Detail 페이지에서도 활용)
  - Footer SNS placeholder href 정리
  - `MobileHeader`/`DesktopHeader` 단일 컴포넌트 통합 (반응형)
  - `.overlay`(globals z-index:9999) dead style 제거
  - `PROJECT_GUIDE.md` 별도 작업 머지 시 README plain text 참조도 함께 정리
- 발견된 부채 (→ tech-debt-tracker.md):
  - `$beige-50/100/150/300` 4단계 미사용 — `ff1064b`에서 추가, 사용처 0건. 미래 사용 명시 주석 적용했으나 사용자 정책(`feedback_design_tokens` "토큰 단순화 선호")과 충돌 가능성. 미래 사용처 발생 시까지 모니터.
  - `HeroMeta` export 미사용 (knip 기존 부채)
