# about-page-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-08
- **브랜치**: refactor/about-page-redesign

## 목표

`docs/references/`의 소망교회 교회소개 v2.0 컴포넌트(shared/Hub/Greeting/Vision/Welcome/Worship/Location)를 dnchurch about/ 6 페이지에 적용 — 디자인·레이아웃·스타일은 references에 맞추고 기존 콘텐츠는 보존. 인라인 스타일은 dnchurch 정책(SCSS Modules + 토큰)으로 변환.

## Assumptions

- references는 인라인 스타일 + `C` 토큰 객체. dnchurch는 SCSS Modules + tokens. **변환 필수**.
- 토큰 매핑 거의 1:1 (사용자가 ff1064b에서 미리 추가): `$beige-100/150/200/300`, `$cream-200`, `$accent`($gold-600), `$txt-primary/secondary/tertiary`, `$navy-800/950`, `$bg-dark`. (`_color.scss` 검증 완료)
- "콘텐츠 보존, 디자인만 적용" — vision/worship/location의 기존 텍스트·DB 데이터·Cloudinary 이미지 유지.
- placeholder 페이지(pastor/welcome): references의 데이터(목사 약력·FAQ·Steps)를 사용하되 교회명만 "소망교회"→"대구동남교회"로 교체.
- references jsx 파일은 untracked + 사용자 정책상 commit X(LAYOUT.md와 동일). 본 task는 read-only 참조.
- references의 `v2-*` class·`useChurchAboutSetup` hook·`AboutPagePreview` wrapper는 dnchurch 정책과 충돌 → 도입 X.
- **Hero 충돌**: `(content)/layout.tsx`의 `<Hero />`는 항상 렌더되나 `resolveHeroMeta('/about')`은 GNB leaf 미존재로 `null` 반환 — 안전. 다른 5 페이지(`/about/*`)는 GNB child로 매칭되어 layout Hero가 정상 노출되므로 page 자체에 Hero 추가 X. Hub만 자체 dark Hero 보유. 구현 전 `hero.config.ts`에서 재확인.
- **use client 최소화**: references의 `onClick`/`onNavigate`는 Next.js `Link`로 대체. 'use client'는 필요 시점에만 (예: 인터랙티브 토글이 있는 경우). 6 페이지 모두 가능한 Server Component 기본.
- 1 PR 일괄 머지 (사용자 결정).

## Non-goals

- references jsx 파일 commit
- `AboutPagePreview` wrapper(데모 컨트롤) 도입
- `useChurchAboutSetup` hook(font + hover CSS 인라인 주입) 도입
- `v2-*` class 네이밍 — dnchurch는 snake_case
- `about/serving-people` 변경 — references 없음. **본 PR 머지 후 다른 6 페이지와 시각적으로 일치하지 않는 임시 상태가 됨을 인지·허용** (별도 후속 task)
- references의 `MAIN_NAV/SUB_TABS/BOTTOM_NAV` 등 layout 데이터 도입 — dnchurch는 `src/config/navigation.ts` 사용
- `MobileHeader`/`DesktopHeader` 통합 (이전 PR 결정)
- 인접 코드 정리·포맷·rename

## Success Criteria

- [ ] `about/page.tsx`(Hub): Hub 자체 dark Hero 1개만 렌더. `(content)/layout.tsx`의 자동 Hero는 0개(`resolveHeroMeta('/about') === null` 확인).
- [ ] `/about/pastor`, `/about/vision`, `/about/welcome`, `/about/worship`, `/about/location`: layout 자동 Hero 1개 + 페이지 자체 Hero 0개.
- [ ] `about/pastor`: references Greeting.jsx 구조(좌측 목사 카드 + 우측 인사말 본문) 적용. 콘텐츠는 references 데이터(교회명만 교체).
- [ ] `about/welcome`: references Welcome.jsx 구조(WELCOME 카드 + STEPS + FAQ) 적용. 콘텐츠는 references 데이터.
- [ ] `about/vision`: 기존 5단락 + Cloudinary 이미지 보존. references Vision.jsx의 pillars(3 카드)·history(timeline) 섹션도 placeholder 콘텐츠로 노출 (사용자 결정).
- [ ] `about/worship`: 기존 DB 콘텐츠(WorshipCard·SchoolGrid·AboutWorship) 보존. references Worship.jsx의 섹션·카드 디자인 정합.
- [ ] `about/location`: 기존 지도+주소+대중교통 보존. references Location.jsx의 contact/hours 카드는 site_settings에 없는 필드도 빈 placeholder + TODO로 노출 (사용자 결정).
- [ ] `about/page.tsx`(Hub): STATS/HISTORY 세부 값은 placeholder + TODO 주석. dnchurch가 가진 데이터(1952 설립)는 명시.
- [ ] 인라인 스타일 0건 — 모두 `*.module.scss` + 토큰. SCSS에 매직 색상값 0건.
- [ ] 'use client' directive: 새로 추가된 페이지 중 'use client'가 추가된 파일 ≤ 1개 (구현 후 확인).
- [ ] `verify-task` PASS.

## Verification

- `yarn lint`, `yarn lint:styles`, `yarn build`, `yarn knip`
- `node scripts/verify-task.mjs about-page-redesign`
- 수동 (사용자):
  - [ ] `/about` 모바일/PC: Hub 자체 dark Hero 1개만, layout Hero 0개
  - [ ] 다른 5 페이지: layout 자동 Hero 1개만, 페이지 자체 Hero 0개
  - [ ] 6 페이지 시각이 references와 일관
  - [ ] Hub의 4 카드(Greetings/Vision/Worship/Welcome) 클릭 시 해당 페이지로 이동
  - [ ] Hub의 STATS/HISTORY/GALLERY placeholder 노출 확인
  - [ ] vision의 pillars/history placeholder 노출, 5단락+이미지 보존 확인
  - [ ] location의 contact/hours placeholder 노출, 지도+대중교통 보존 확인
  - [ ] worship의 3 섹션(Sunday/Weekday/School) DB 데이터 보존 + 카드 디자인 정합 확인
  - [ ] pastor의 좌측 카드 + 우측 본문 + 교회명 "대구동남교회" 표시
  - [ ] welcome의 STEPS·FAQ 표시

## 접근법

### 페이지별 SCSS Modules + page.tsx
각 `about/{slug}/page.tsx`에 references 구조 도입, 인라인 스타일을 `page.module.scss`로 옮김. 데이터 객체(STATS·HISTORY·HUB_ITEM_CARDS·PASTOR·WELCOME_FAQ·STEPS 등)는 page.tsx 상단 상수 또는 `_component/` 분리. Hub의 4 카드처럼 큰 단위는 `_component/`로 분리.

### Server / Client 결정
- **Server Component 기본**: 모든 about 페이지는 'use client' 없이 시작.
- references의 `onClick={() => onNavigate(targetTab)}`는 `<Link href="/about/{slug}">`로 대체 → Server Component 유지.
- 'use client' 후보 (필요 시):
  - Hub의 GALLERY 가로 스크롤 인터랙션이 단순 CSS overflow면 Server, JS 인터랙션이면 Client.
  - Vision/Welcome의 pillars/FAQ가 toggle 펼치기면 Client. 단순 표시면 Server.
- **위 결정은 구현 시점 재검증** — 가능한 Server 유지.

### Hub Hero 충돌 회피
- `(content)/layout.tsx`에서 `<Hero />`는 항상 렌더, 내부의 `resolveHeroMeta(pathname)`이 null 반환 시 컴포넌트가 `return null`.
- `hero.config.ts` 확인: `/about`은 GNB leaf 미존재 → null 반환 (이전 task 검증).
- 따라서 Hub 자체 Hero를 page 안에 그려도 layout Hero와 충돌 X.
- 다른 5 페이지(`/about/pastor` 등)는 GNB child라 layout Hero가 활성 → page 자체에 Hero 추가 X.

### 토큰 매핑표

| references C | dnchurch 토큰 |
|---|---|
| `C.bg` | `$bg-primary` |
| `C.surface` | `$white` |
| `C.surfaceAlt` | `$beige-100` |
| `C.bgCard` | `$cream-200` |
| `C.darkDeep` | `$bg-dark` |
| `C.dark` | `$navy-950` |
| `C.primary` | `$primary` |
| `C.primaryLight` | `$beige-200` |
| `C.gold` | `$accent` |
| `C.goldLight` | `$accent-subtle` |
| `C.text/textSec/textTer` | `$txt-primary/secondary/tertiary` |
| `C.border` | `$beige-200` |
| `C.borderLight` | `$beige-150` |

### Hover
dnchurch hover 3원칙 mixin 사용 (`hover-bg-shift`, `hover-color-shift`, `hover-lift`). `transition: all` 금지, `:hover`에서 `border*` 변경 금지.

### Layout 컨테이너
references는 `maxWidth: 1200, margin: 0 auto, padding: 56px 48px 24px` 패턴. dnchurch의 `LayoutContainer`(이미 `$container-max`/`$container-padding` 적용)을 사용.

### 콘텐츠 정책 (사용자 결정)

| 페이지 | 정책 |
|---|---|
| **Hub** | references Hub.jsx 완전 적용. STATS/HISTORY는 placeholder + TODO 주석. 1952(설립) 등 우리 데이터는 명시. NOTICES/FEATURED/GALLERY는 references 더미 데이터 + TODO. |
| **pastor** | references Greeting.jsx 데이터 그대로(목사 약력·인사말 3단락). 교회명만 "대구동남교회". |
| **vision** | 기존 5단락 + Cloudinary 이미지 보존 + references Vision.jsx의 pillars(3 카드)·history(timeline) 섹션을 placeholder 콘텐츠로 노출. references 디자인 엄격 적용. |
| **welcome** | references Welcome.jsx 데이터 그대로(YOU ARE WELCOME HERE 카드 + STEPS 4개 + FAQ 4개). |
| **worship** | 기존 `getWorshipScheduleGroups` + 3 섹션(Sunday/Weekday/School) + AboutWorship 보존. 카드 디자인만 정합. |
| **location** | 기존 site_settings(주소·subway·bus_stop_1/2) + LocationMapClient 보존 + references Location.jsx의 contact/hours 카드는 빈 placeholder + TODO로 노출. |

## 영향받는 파일

- `src/app/(content)/about/page.tsx` — Hub 신규(현재 Vision redirect)
- `src/app/(content)/about/page.module.scss` — 신규
- `src/app/(content)/about/_component/*` — Hub 하위 카드·섹션 (필요 시 분리)
- `src/app/(content)/about/pastor/page.tsx` + `page.module.scss` — Greeting 적용
- `src/app/(content)/about/welcome/page.tsx` + `page.module.scss` — Welcome 적용
- `src/app/(content)/about/vision/page.tsx` + `page.module.scss` — 콘텐츠 보존 + 디자인 정합 + pillars/history placeholder
- `src/app/(content)/about/worship/page.tsx` + `page.module.scss` — 디자인 정합
- `src/app/(content)/about/worship/_component/*.module.scss` — 카드 디자인 정합 (필요 시 한정)
- `src/app/(content)/about/location/page.tsx` + `page.module.scss` — 디자인 정합 + contact/hours placeholder

## 단계별 체크리스트

- [x] 1. references 5개 파일 풀 read (Greeting/Vision/Welcome/Worship/Location)
- [x] 2. `hero.config.ts` 재확인: `resolveHeroMeta('/about') === null` (이전 task 검증 + plan 명시)
- [x] 3. `about/page.tsx`(Hub) 신규 작성 + page.module.scss
- [x] 4. `about/pastor` 작성 + page.module.scss
- [x] 5. `about/welcome` 작성 + page.module.scss
- [x] 6. `about/vision` 디자인 갱신 (5단락+이미지 보존, pillars/history placeholder)
- [x] 7. `about/worship` 디자인 갱신 (page-level만, _component은 후속 task)
- [x] 8. `about/location` 디자인 갱신 (지도+대중교통 보존, contact/hours placeholder)
- [x] 9. 'use client' 추가 0건 — 모두 Server Component (Hub/Location은 async + getSiteSettings, INDEX 카드 onClick → Link로 대체)
- [ ] 10. Codex 1차 검증
- [ ] 11. `verify-task` 실행
- [ ] 12. 사용자 시각 검수 (Verification 체크리스트)
- [ ] 13. 사용자 승인 후 commit + push + PR

## 완료 기준 (DoD)

- [ ] `verify-task` PASS
- [ ] Codex 계획·1차 검증 PASS
- [ ] 사용자 시각 검수 OK
- [ ] 사용자 승인 후 커밋
- [ ] ADR 불필요 — 본 plan에 사유 기록

## 참고 자료

- `docs/references/{Hub,Greeting,Vision,Welcome,Worship,Location,shared}.jsx` — 외부 참조 (소망교회 디자인 시스템 v2.0, workspace-local untracked, commit X)

## 의사결정 로그

- 2026-05-08: 1 PR 일괄 머지 (사용자 결정) — 6 페이지 동시 변환
- 2026-05-08: Hub 페이지 신규 도입 (현 Vision redirect 대체) — references Hub.jsx 적용 (사용자 결정)
- 2026-05-08: 콘텐츠 보존 정책 — vision/worship/location 기존 콘텐츠 유지, 디자인만 적용 (사용자 결정)
- 2026-05-08: references는 read-only 참조 — commit X (사용자 정책, LAYOUT.md와 동일)
- 2026-05-08: AboutPagePreview wrapper / useChurchAboutSetup hook / v2-* class는 dnchurch와 정책 충돌 → 도입 안 함
- 2026-05-08: Codex CHANGE_REQUEST 반영 — Hero 충돌 명시(layout.tsx auto-Hero vs Hub self-Hero), use client 최소화 정책, Vision pillars/history placeholder 노출(사용자 결정), Location contact/hours placeholder 노출(사용자 결정), Hub STATS/HISTORY placeholder + TODO(사용자 결정), serving-people 임시 시각 불일치 명시.
- 2026-05-08: 사용자가 references/Worship.jsx를 re-design — worship 새 콘텐츠 적용 결정. WORSHIP_STATEMENT(라이트 영역) + WORSHIP_TYPES 3 column 카드 + WELCOME(처음 오신 분께) 새 디자인. **scope 변경**: DB `getWorshipScheduleGroups` 호출 제거 + 인라인 데이터로 교체, `_component/{WorshipCard,SchoolGrid,AboutWorship}` import 제거(파일 자체는 후속 task로 정리, knip 경고로 추적). 회사명 "대구동남교회"로 교체. SCHOOL의 `자세히 보기` CTA는 `/next-gen` Link, WELCOME CTA는 `/about/location`/`/about/welcome` Link + `주차 안내`는 `#` placeholder.
- 2026-05-08: Codex 1차(incremental, worship 만) — token discipline 위반 지적(매직 수치값). statement_underline `width: 2.4rem/3.2rem` → `$spacing-32`(모바일 2.4 / PC 3.2 자동) 통합 fix. card `min-height 24rem/28rem`과 underline `height 0.2rem`은 토큰 매핑 불가 매직값 유지(다른 페이지의 underline·border 패턴과 일관, 사용자 메모 "토큰 추가 단순화 선호"에 부합). _component dead code disposition: ACCEPTABLE (defer to follow-up).
- 2026-05-08: 사용자 요청 — cream 토큰 전체 삭제 + beige 매핑(예배안내 페이지 background 정합 문제). **scope 확장**(home/sermons/_component 영향)이지만 사용자 명시 요청으로 본 task에 포함. Primitive 매핑: `$cream-100→$beige-50`, `$cream-200→$beige-150`, `$cream-300→$beige-300`. Semantic: `$bg-secondary: $cream-200`→`$beige-150`(이름 유지), `$bg-cream-subtle` 삭제+`$bg-beige-subtle: $beige-50` 신규(이름 변경). 사용처 9 파일 갱신(QuickAccess, NewHere, SermonVideoPlayer, SermonCard 2곳, GridCard, vision/page.tsx의 `iconTone:'cream'→'beige'`, vision/page.module.scss의 `data-tone='cream'→'beige'`, worship 2곳). verify-task PASS(run-id 20260508-224455).

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: -
- **사유**: ADR 트리거 파일(`ADR_TRIGGER_PARTS`)에 `src/app/(content)/about/` 미해당. 새 라이브러리·데이터 흐름·인증/캐시/정책 변경 없음. 기존 (content) 그룹의 페이지 콘텐츠·스타일 변경(외과적).

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-08 (plan 초안 직후)
- **결론**: CHANGE_REQUEST → 반영 완료, 재요청 생략 (BLOCK 아님)
- **핵심 지적** (8건):
  1. Hero 충돌 처리 — `(content)/layout.tsx` auto-Hero vs Hub self-Hero
  2. Success Criteria yes/no testable 부족
  3. Vision 데이터 형상 불일치 — 5단락 vs pillars/history
  4. Location 데이터 불완전 — contact/hours 우리 site_settings에 없음
  5. Hub STATS/HISTORY placeholder — production 머지 허용 기준
  6. use client 결정 누락 — references onClick 이벤트
  7. serving-people 시각 불일치 명시 부재
  8. Verification 체크리스트 보강
- **반영 내용**:
  1. Assumptions에 Hero 충돌 + `resolveHeroMeta('/about') === null` 명시
  2. Success Criteria를 yes/no testable로 재작성 (Hero 1개·placeholder 노출 등 명시)
  3. 콘텐츠 정책 표에 Vision: 5단락+이미지+pillars/history placeholder 명시 (사용자 결정)
  4. 콘텐츠 정책 표에 Location: 지도+대중교통+contact/hours placeholder 명시 (사용자 결정)
  5. 콘텐츠 정책 표에 Hub: STATS/HISTORY placeholder+TODO 명시 (사용자 결정)
  6. 접근법에 Server/Client 결정 정책 추가 (`onClick` → Link, 'use client' 최소화)
  7. Non-goals에 serving-people 임시 불일치 인정 명시
  8. Verification에 8개 체크리스트 항목 추가

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-08 (6 페이지 작성 + verify PASS 직후)
- **결론**: CHANGE_REQUEST(2건) → 수정 적용
- **수정 파일**:
  - `src/app/(content)/about/vision/page.tsx` — VISION_STATEMENT에 누락된 첫 단락 "동남교회에 오신 것을 환영합니다." 복원, statement_title 제거(첫 단락이 lead 역할로 흡수)
  - `src/app/(content)/about/vision/page.module.scss` — `.statement_title` 제거 + `.statement_lead` 추가(첫 단락 강조)
  - `src/app/(content)/news/notices/_component/CategoryBottomSheet.tsx` — origin/develop으로 revert (본 task drift)
- **핵심 지적**:
  1. vision VISION_STATEMENT가 4개 단락만 — 원본 5단락(환영 문구 포함) 보존 위반 → 복원
  2. CategoryBottomSheet.tsx 포맷 변경이 본 task 외 drift → revert
  3. worship _component 디자인 정합 후속 task 분리는 ACCEPTABLE (원 plan "필요 시"에 부합)
- **추가 회차** (worship redesign): CHANGE_REQUEST(token discipline) → `statement_underline width 2.4rem/3.2rem` → `$spacing-32` fix. _component dead code 후속으로 ACCEPTABLE.
- **추가 회차** (cream→beige): PASS — cream 참조 0건, 토큰 정의 정리, 호출부 마이그레이션, 타입/시각 안전성 모두 통과.
- **남은 리스크**:
  - 동작 버그·타입·레이어 위반 0건 (CLEAN)
  - 토큰 매핑·use client 0건·Hero 충돌 회피 모두 OK
  - worship _component(WorshipCard/SchoolGrid/AboutWorship) dead code — 후속 task로 정리 예정

## Claude 2차 검증

- **검토 내용**: 6 페이지 작성 완료 (Hub/pastor/welcome/vision/worship/location) — references 디자인 적용, 콘텐츠 보존, placeholder + TODO 정책. 'use client' 추가 0건 (모두 Server Component). worship _component은 page-level만 정합, 디자인 정합은 후속 task. Codex 1차 검증 CHANGE_REQUEST 2건(vision 5단락 복원, CategoryBottomSheet drift revert) 반영 후 재검증.
- **실행한 검증**: verify-task.mjs 2회 모두 PASS — ESLint·stylelint·Build 통과, Knip은 기존 부채만(본 task 무관).
  - 1회차 (6 페이지 작성 후) run-id: `20260508-145206` — PASS
  - 2회차 (Codex CR fix 후) run-id: `20260508-151605` — PASS
- **최종 판단**: 머지 가능. 사용자 시각 검수(6 페이지 모바일/태블릿/PC) 후 commit + push + PR 진행.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] 멀티 세션 리뷰 (권장): `codex:rescue`로 객관적 검토 요청

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
