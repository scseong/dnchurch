# design-system-v4-home-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-07
- **브랜치**: feat/design-system-v3 (필요 시 별도 브랜치 분리)

## 목표

디자인 시스템 v4의 home 영역 잔여 부채 청산 — (1) `NewHere` 로컬 hex 토큰화, (2) home 5건의 hover 시 border 변경(SKILL Hover 3원칙 #3 위반) 일괄 정리.

## Assumptions

- `#fdfaf5`는 cream subtle 톤이며 cream 계층(100/200/300) 확장이 적절함.
- text-decoration underline 패턴은 SKILL Hover 3원칙 #3을 위반하지 않음(border 미사용).
- SermonCard B 그룹의 `.card:hover .play_btn` 강조는 background/color 변경만으로 디자인 의도가 보존됨.

## Non-goals

- admin 영역(`SermonListPage/dropdown.module.scss`, `SermonForm/index.module.scss`, layout admin 모듈) — admin 토큰 ADR 0004 결정 후 일괄 처리.
- sermons/news/about 등 home 외 페이지의 hex/rgba 직접 사용 — `tech-debt-tracker.md` "토큰 부채" 항목으로 분리 보존.
- 다크모드 토큰 도입.
- 신규 mixin 도입(`hover-bg-shift` 등 기존 mixin만 활용).

## Success Criteria

1. `rg -n '#[0-9a-f]{3,6}\b' src/app/_component/home/NewHere.module.scss` → **0건**
2. `rg -n '\$bg-section\s*:' src/app/_component/home/` → **0건** (로컬 변수 제거)
3. `rg -n -C2 'border(-bottom|-color|-bottom-color)?\s*:' src/app/_component/home/` 결과에서 hover 블록(`&:hover` 또는 `:hover .child`) 인접 컨텍스트에 border 변경 라인 **0건** (정적 정의는 유지)
4. `_color.scss`에 `$cream-100: #fdfaf5` primitive + `$bg-cream-subtle: $cream-100` semantic 1쌍 신규 추가
5. `yarn build` PASS, `yarn lint:styles` PASS

## Verification

- `yarn lint:styles` (가장 좁음)
- `yarn build`
- `node scripts/verify-task.mjs design-system-v4-home-cleanup` → `logs/design-system-v4-home-cleanup/<run-id>/`
- 시각 회귀: 홈(`/`) PC(1280)·Mobile(375) 두 viewport에서 NewHere 배경, 5개 link hover, SermonCard hover 비교 (PR description에 첨부)

## 접근법

- **토큰 추가**: cream 계층에 `$cream-100` primitive 추가 + 시맨틱 `$bg-cream-subtle` 1개. `_color.scss` 외 다른 토큰 파일 미변경.
- **A 그룹 (5건) — text-decoration underline**: `border-bottom + transition: border-color`을 `text-decoration-color + text-underline-offset`로 일괄 교체. `transition`도 동기화.
  - **박스 높이 보존 전제**: 기존 정적 `border-bottom: 1px solid …` 제거 시 박스 높이가 1px 줄어들 수 있음. `padding-bottom` 유지 + 필요 시 정적 `text-decoration: underline transparent`로 underline 점유 공간 확보. PR 단계 PC(1280)/Mobile(375) 시각 비교 필수.
- **B 그룹 (1건, SermonCard) — border-color만 제거**: `.card:hover .play_btn`에서 `border-color: $gold-600` 라인만 제거. 정적 `border: 1px solid rgba($gold-600, 0.35)`는 유지(배경 fill과 자연스러운 대비). transition list에서도 `border-color` 제거.

## 영향받는 파일

- `src/styles/tokens/_color.scss` — 토큰 2종 추가
- `src/app/_component/home/NewHere.module.scss` — 로컬 `$bg-section` 제거 + `.faq_link`/`.cta_link` 패턴 변경
- `src/app/_component/home/FeedContent.module.scss` — 117-120 hover 패턴 변경
- `src/app/_component/home/RecentSermons.module.scss` — 54-57 hover 패턴 변경
- `src/app/_component/home/AboutOurChurch.module.scss` — 84-87 hover 패턴 변경
- `src/app/_component/home/SermonCard.module.scss` — 140-144 `.card:hover .play_btn` border-color 제거
- `docs/tech-debt-tracker.md` — "Hover Border 위반(home 5건)" / "home `$bg-section` 로컬 hex" 두 항목 해결됨 이동, "토큰 부채" 항목에서 home 부분 축소

## 단계별 체크리스트

- [ ] 1. `_color.scss`에 `$cream-100`, `$bg-cream-subtle` 추가 (cream primitive 섹션 + Background 시맨틱 섹션)
- [ ] 2. `NewHere.module.scss` 로컬 `$bg-section` 제거 + `.section { background: $bg-cream-subtle }`
- [ ] 3. A 그룹 5건 text-decoration 패턴으로 일괄 교체 (FeedContent, RecentSermons, NewHere×2, AboutOurChurch)
- [ ] 4. SermonCard B 그룹 `border-color` 제거 + transition 정리
- [ ] 5. `yarn lint:styles` + `yarn build` PASS 확인
- [ ] 6. Codex 1차 검증 호출 (구현 diff)
- [ ] 7. `verify-task.mjs` 실행 + `logs/<task-id>/` 증적
- [ ] 8. tech-debt-tracker 갱신 (해결 항목 이동, "토큰 부채" home 부분 축소)
- [ ] 9. 사용자 승인 후 커밋

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs design-system-v4-home-cleanup` 통과
- [ ] 사용자 승인 후 커밋
- [ ] tech-debt-tracker 업데이트 (2건 해결 + 1건 축소)

## 참고 자료

- `.claude/skills/styles/SKILL.md` Hover 3원칙 #3 (line 140-146)
- `docs/tech-debt-tracker.md` "Hover Border 위반 — 디자인 시스템 v4 미완 잔여" / "home `$bg-section: #fdfaf5` 로컬 hex"

## 의사결정 로그

- 2026-05-07: 사용자 결정 — 3번(토큰 추가) **A안** (`$cream-100` primitive + `$bg-cream-subtle` semantic), 4번 A 그룹 (link underline) **A-1** (text-decoration 패턴).
- 2026-05-07: SermonCard B 그룹은 디자이너 의도 보존을 위해 border-color **제거만** 선택 — 정적 border는 유지(배경 fill과의 대비 보존).

## ADR 판단

- **필요 여부**: 불필요
- **사유**: `_shared-config.mjs`의 `ADR_TRIGGER_PARTS`에 `src/styles/` 미포함. 토큰 1쌍 추가는 cream 계층 자연 확장이며 의미 변경 없음. ADR 0003 디자인 시스템 v3 결정과 충돌 없음.

## Codex 계획 검증

### 1차 — CHANGE_REQUEST → 반영 후 PASS

- **요청 시점**: 2026-05-07
- **결론**: **CHANGE_REQUEST** (5개 항목 본질적 PASS, 두 가지 작은 보정)
- **항목별 판단**:
  - 1. Goal/Assumptions/Non-goals/Success Criteria 정합성 — 1·2·4·5 PASS, **3번 grep 패턴 불충분** (`-B1` 컨텍스트 부족, `border-bottom-color` 미검출)
  - 2. 외과적 변경 원칙 — PASS (영향 7+1 파일, 단계별 한 관심사 분리 OK)
  - 3. A-1 패턴 적용 — PASS (대상 5개 라인 실재, transition list 분리 가능). 단 **정적 border 제거 시 박스 높이 1px 변화 가능성** 명시 필요
  - 4. 토큰 안전성 — PASS (`$cream-100` 100→200→300 짙어지는 방향 정합, semantic vs primitive 트레이드오프에서 semantic 권장)
  - 5. 잠재 리스크 — PASS (SermonCard transform/filter/opacity hover는 #3 무관 — 의도적 제외 타당. knip warning은 verify-task 미차단. sermons/news 분리 처리 OK)
- **핵심 지적 2건**:
  - Success Criteria 3 grep을 `rg -n -C2 'border(-bottom|-color|-bottom-color)?\s*:' src/app/_component/home/`로 보강 — hover 인접 컨텍스트 + `border-bottom-color`까지 포함
  - 접근법 A-1에 "기존 정적 border 제거로 박스 높이 1px 변화 가능, padding-bottom 유지 + PR 시각 비교" 전제 명시
- **반영 내용**:
  - Success Criteria 3 grep 패턴 위 권고대로 교체 (line 26 갱신)
  - 접근법 A-1에 "박스 높이 보존 전제" 항목 추가 (PC/Mobile 시각 비교 필수 명시)
- **최종 상태**: 두 보정 모두 plan에 반영 완료 — 구현 진입 가능 판정.

## Codex 1차 검증

### 1차 — PASS

- **요청 시점**: 2026-05-07 (구현 직후, build 통과 후)
- **결론**: **PASS**
- **검토 대상**: 6개 파일 diff만 (`_color.scss`, home 5개 SCSS) — layout 작업 변경은 검토 범위 밖
- **항목별 판단**:
  - 1. 외과적 변경 원칙 — PASS (6개 파일 diff 모두 plan 범위 내, 인접 정리·rename·포맷 드리프트 0)
  - 2. A-1 패턴 정합성 (5건) — PASS (5개 link 모두 `border-bottom + transition border-color` → `text-decoration + transition text-decoration-color`로 동등 교체. `.cta_link inline-flex`는 atomic inline-level flex container이므로 text-decoration 적용 가능)
  - 3. B 그룹 SermonCard — PASS (`.card:hover .play_btn`에서 `border-color: $gold-600`만 제거 + transition list에서 `border-color 0.2s ease,`만 제거. background/color 유지. 정적 `.play_btn` border 유지)
  - 4. 토큰 추가 정합성 — PASS (`$cream-100`이 200/300 위에 추가, `$bg-cream-subtle`이 `$bg-secondary` 다음에 추가, 추가 외 변경 0)
  - 5. 잠재 회귀 / 누락 — 이상 없음 (SermonCard transform/filter hover 의도적 미변경, `.tab_active` active state 의도적 미변경, 5개 link 파일 hover 주변 border-color 잔존 0)
- **수정 파일**: 없음 (Codex 자체 수정 0건)
- **남은 리스크**: 없음. PR 단계에서 PC(1280)/Mobile(375) 시각 비교 권장 (정적 border 1px 제거 → text-decoration underline으로 교체, 박스 높이 미세 차이 가능성 — plan 접근법에 명시됨)

## Claude 2차 검증

### 1차 — PASS

- **검토 내용**:
  - **외과적 변경 교차 확인**: 본 작업 6개 파일 외 변경(Banner, QuickAccess, layout/* 등)은 working tree에 누적된 **별도 layout 작업**의 미커밋 변경. 본 PR/커밋 스테이징은 6개 파일만 추출 예정.
  - **Hover 위반 0건 확인**: home 디렉토리 전체 hover 블록 16개 인벤토리 직접 점검 — `:hover` 안 `border`/`border-color`/`border-bottom-color` 변경 라인 0건. 정적 `border-bottom` 잔존(Banner.module.scss 등)은 본 작업 밖 정적 정의이며 #3 무관.
  - **Codex `inline-flex` 확인 보강**: `.cta_link`은 `display: inline-flex`이지만 children이 `<a>` 텍스트와 SVG 아이콘. `text-decoration`은 inline-flex container 자체가 아닌 텍스트 노드에 적용되므로 underline은 텍스트 부분에만 표시됨 — 본 디자인 의도(텍스트 underline)와 일치.
  - **Plan Success Criteria 1~5 모두 충족**: rg 명령으로 NewHere `#xxxxxx` 0건, `$bg-section` 0건, hover border 변경 0건, 토큰 추가 정합성, build PASS 모두 확인.
- **실행한 검증**:
  - `yarn lint:styles` → 0 errors, 60 warnings (모두 기존 부채 — `tech-debt-tracker.md` 등록 완료)
  - `yarn build` → PASS (48.60s)
  - `node scripts/verify-task.mjs design-system-v4-home-cleanup` → 필수 검증 통과 (knip warning은 기존 부채)
  - 검증 로그: `logs/design-system-v4-home-cleanup/20260507-232034/summary.log`
- **최종 판단**: **PASS** — Codex 1차 PASS와 정합. 외과적 변경 원칙 유지, Hover 3원칙 #3 home 0건. 사용자 승인 + 커밋 진입 가능.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 별도 Claude 세션 또는 `codex:rescue`로 객관적 검토 요청.

## 회고 (머지 후 작성, completed/로 이동 시)

- **잘된 것**: Codex 계획·1차 검증 모두 PASS. text-decoration 패턴 교체로 Hover 3원칙 #3 home 위반 0건 달성. 박스 높이 보존 전제를 plan에 명시해 시각 회귀 리스크 사전 관리.
- **다음에 할 것**: sermons/news/about 등 home 외 Hover Border 위반 영역별 PR로 점진 해소.
- **발견된 부채**: 없음 (기존 tech-debt-tracker 항목 2건 해결로 이동).
