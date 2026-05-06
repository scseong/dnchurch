# design-system-v3-components

- **상태**: ✅ 완료 (로컬 커밋 9ca9507, 미머지 — 멀티 Phase 통합 PR 예정)
- **시작일**: 2026-05-06
- **완료일**: 2026-05-06
- **브랜치**: feat/design-system-v3

## 목표

비-admin 컴포넌트 18 파일에서 Hover 3원칙 위반(`:hover { border... }`, `:hover { background: shorthand }`)을 일괄 정리하고 Phase 2 hover-* mixin을 채택. 부수: `Pagination`의 `$primary-active` hover를 `$primary-hover`로 정정(Phase 1 hover 방향성 정합).

## Assumptions / Non-goals

- mixin은 이미 존재(Phase 2). 본 PR은 채택만.
- **`src/components/admin/` 경로 전체 제외** (`--admin-*` 분리 정책).
- `_effect.scss` shorthand·`hover-outline-dark`·opacity-only hover(`Toast`, `Header` 등)·`background: rgba(...)` shorthand 도입/정리는 본 PR 제외.
- **Underline link 패턴 제외** — `border-bottom`이 시각적 underline 역할이고 hover에서 그 색을 바꾸는 케이스는 mechanical 제거 시 affordance 손실. 별도 mixin(`hover-underline-shift` 등) 또는 `text-decoration-color` 전환 정책 결정 후 처리. **deferred 파일/셀렉터**: RecentSermons `.header_link`, NewHere `.cta_link`/`.faq_link`, FeedContent `.more_link`, AboutOurChurch `.about_link`. `SermonListPage .series_banner_close`의 `background: rgba(...)` shorthand도 본 PR 제외.
- **복합 hover 보존**: nested image transform, play 버튼 opacity, color+background 조합 등 affordance를 mixin으로 단순화하면서 잃지 않는다 — mixin은 매핑되는 부분만 적용, 나머지는 명시 transition으로 잔존.
- 시각 변화 의도됨: hover border 흔들림 사라짐 + Pagination hover가 lighter navy로.

## Success Criteria

- [ ] 18 파일 `:hover` 안 `border*` 명시 0건 (단, deferred underline link 패턴 제외 — Non-goals 참조).
- [ ] 18 파일 `:hover` 안 shorthand `background:` 0건.
- [ ] `Pagination.module.scss`: 활성 hover = `$primary-hover`, 활성 `:active` = `$primary-active`(pressed 상태 보존).
- [ ] `.tsx`/`.ts` 변경 0건, admin 파일 변경 0건.
- [ ] `yarn lint:styles` 0 errors / `yarn build` 통과 / `verify-task.mjs` PASS.

## Verification

```bash
yarn lint:styles
yarn build
node scripts/verify-task.mjs design-system-v3-components

# 비-admin 영역 hover 위반 0건 (background shorthand는 $토큰·rgba 모두 포함)
rg -nU --multiline ':hover\s*\{[^}]*?(border|background:\s*(\$|rgba))' src --glob '!**/admin/**'

# 변경 파일 admin 0건 — 매치 없을 때 종료 0이도록 부정 grep
! git diff --name-only HEAD | grep -i admin
```

## 접근법

| 기존 | 신규 |
|---|---|
| `:hover { background: $X }` | `@include hover-bg-shift($X)` 또는 `background-color: $X` |
| `:hover { ...; border-color: $Y }` | border 라인 삭제 |
| `:hover { transform; box-shadow }` | `@include hover-lift(...)` |
| `:hover { color: $X; border-color: $Y }` | `@include hover-color-shift($X)` |
| Pagination `:hover { background: $primary-active }` | `background-color: $primary-hover` |

## 영향받는 파일 (18, 비-admin)

- **Layout (2)**: `components/layout/{Footer/Footer, Pagination}.module.scss`
- **Home (6)**: `app/_component/home/{RecentSermons, QuickAccess, NewHere, FeedContent, Banner, AboutOurChurch}.module.scss`
- **Sermons (8)**: `app/(content)/sermons/_component/{SermonListPage, SermonDetailPage, SermonCard, GridCard, SermonVideoTools, SeriesEpisodeList, SeriesBrowserSheet, AdvancedFilterSheet}/*.module.scss`
- **News (2)**: `app/(content)/news/notices/_component/{NoticeDrawer, CategoryBottomSheet}.module.scss`

## 단계별 체크리스트

- [x] 1. Layout 2 (Footer + Pagination 의미 정정 포함)
- [x] 2. Home 6 (3 fixed + 3 deferred underline)
- [x] 3. Sermons 8
- [x] 4. News 2
- [x] 5. lint:styles + build 통과
- [x] 6. 검증 grep — 잔여 hover 위반은 모두 deferred 카테고리 (underline 5 + rgba 1)
- [x] 7. Codex 1차 검증 — PASS
- [x] 8. verify-task.mjs 증적 — `logs/design-system-v3-components/20260506-220422/`
- [x] 9. Claude 2차 검증 완료 → **사용자 승인 대기** → 커밋

## 완료 기준 (DoD)

- [ ] verify-task.mjs 통과
- [ ] 사용자 승인 후 커밋
- [ ] admin scope 0건 변경

## 의사결정 로그

- 2026-05-06: scope를 비-admin 18 파일로 한정 — admin은 portal_tokens 정책 따라 분리.
- 2026-05-06: `_effect.scss` shorthand·`hover-outline-dark` 보류 — 본 PR 트리거 없음.

## ADR 판단

- **필요 여부**: 불필요
- **사유**: ADR_TRIGGER_PARTS 0건. v3 통합 ADR에 본 단계도 포함 예정.

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06
- **결론**: CHANGE_REQUEST → 5개 보강 후 진행
- **핵심 지적**:
  - admin 제외 기준이 "5 files using `--admin-*`" + 경로 기준 혼용 → 경로 단일화 필요.
  - opacity-only hover/`background: rgba(...)` shorthand 처리 미명시.
  - 복합 hover(GridCard 등 nested image transform/opacity affordance) 보존 규칙 누락.
  - Verification grep이 `background:\s*\$`만 잡아 rgba shorthand 누락 + `grep -i admin`은 매치 없을 때 exit 1 → 검증 실패처럼 보임.
  - Pagination `$primary-active` 제거 시 `:active` pressed 상태 처리 여부 불명확.
- **반영 내용**:
  - Assumptions: admin 제외 기준을 `src/components/admin/` 경로 단일화. opacity-only/rgba shorthand 도 본 PR 제외 명시. 복합 hover affordance 보존 규칙 추가.
  - Success Criteria: Pagination `:active = $primary-active` (pressed 보존) 명시.
  - Verification: hover 위반 grep을 `(\$|rgba)`로 확장. admin grep은 부정형(`!`)으로 수정.
- **재요청 여부**: 불필요. 5개 모두 국소 수정이며 BLOCK 수준 아님. WORK 진행.

## Codex 1차 검증

- **상태**: 완료
- **요청 시점**: 2026-05-06 (post-implementation diff review)
- **결론**: PASS
- **수정 파일**: 없음
- **핵심 지적**:
  - 외과적 변경 PASS — 모든 변경 라인이 hover 3원칙 정리·explicit transition 채택·Pagination 의미 정정에 직결, unrelated cleanup 없음.
  - Affordance 보존 PASS — SermonCard/GridCard nested image scale + play btn opacity, QuickAccess `.arrow` translate 모두 보존.
  - Pagination semantic 정정 OK — Phase 1 hover direction policy(navy primary는 hover에서 lighter)와 일치, `:active`로 pressed 분리 명확.
  - **UX 판단 (non-blocking)**:
    - Banner `.btn_secondary` hover에서 border-color 제거 후 텍스트 색만 바뀜 — dark hero 위 secondary 버튼의 시각 강도가 약할 수 있음. 향후 base border를 `$border-primary`로 승격하는 옵션 검토 가치 있음.
    - SermonListPage `.year_card` hover가 `translateY(-2px)`만 남아 affordance가 약함. 필터 선택 가능성을 더 강하게 표현하려면 base/selected 스타일 강화 검토.
- **남은 리스크**: 없음 (correctness 이슈 0). UX 코멘트 2건은 후속 디자인 검토 후 별도 PR 가치 — 본 PR 차단 사유 아님.

## Claude 2차 검증

- **검토 내용**: `git diff --stat` 15 파일 +39 / -63. 모든 변경이 hover 3원칙 정리·explicit transition·Pagination 의미 정정에 직결. Codex 1차 PASS와 일치 — UX 코멘트 2건(Banner.btn_secondary 시각 강도, year_card affordance 약화)은 후속 디자인 검토 사안이며 본 PR correctness 차단 사유 아님. 18 파일 중 deferred 3 + 수정 15. 잔여 grep 매치 6건은 모두 Non-goals 카테고리(underline link 5 + rgba shorthand 1).
- **실행한 검증**: `yarn lint:styles` 0 errors ✅. `yarn build` PASS ✅. `node scripts/verify-task.mjs design-system-v3-components` PASS (Knip 기존 부채). 로그 `logs/design-system-v3-components/20260506-220422/`. Grep 검증으로 admin scope 0 변경 + 비-admin hover 위반 잔여는 deferred만.
- **최종 판단**: PASS — 커밋 가능. 사용자 승인 대기.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰
- [ ] 멀티 세션 리뷰(권장) — `codex:rescue`로 시선 분리

## 회고 (2026-05-06 작성)

- 잘된 것:
  - **외과적 변경 일관성** — 15 파일 전부 hover 정리만 변경, unrelated cleanup 0건 (Codex 1차 PASS).
  - **Affordance 보존** — SermonCard/GridCard nested image scale·play btn opacity, QuickAccess `.arrow` translate 모두 유지.
  - **Pagination 의미 정정** — Phase 1 hover direction(navy primary lighter on hover)을 가장 명백하게 위반하던 패턴을 hover/active 분리로 깔끔하게 수정.
  - **Deferred 카테고리 명확화** — 작업 중 발견된 underline link 패턴(5건)과 rgba shorthand(1건)를 임시 처리하지 않고 Non-goals에 명시 → 후속 PR로 분리.
  - **Codex 2-pass 효과** — CHANGE_REQUEST 5건(admin 기준 단일화/non-goal 보강/affordance 보존/grep 보강/active 처리) 즉시 반영, 1차 검증은 PASS 일발 통과.

- 다음에 할 것 (Phase 4 이후 후보):
  - **Underline link 처리** — `hover-underline-shift` mixin 또는 `text-decoration-color` 전환 정책 결정 후 5 파일 일괄 정리. 예: RecentSermons `.header_link`, NewHere `.cta_link`/`.faq_link`, FeedContent `.more_link`, AboutOurChurch `.about_link`.
  - **Admin scope hover 정리** — `--admin-*` 토큰 정책 확인 후 admin 5 파일 (dropdown, table, ConfirmModal, SermonForm, PageHeader) 검토.
  - **Phase 4 — 페이지/인라인 hex 정리** — `notice.ts` 카테고리 뱃지(의도) vs `app/(content)/about/page.module.scss` `#fde5cf` 등 일반 영역 정리.
  - **`_effect.scss` shorthand `all`** — SchoolGrid 1건 정합화와 함께 Phase 4 또는 별도 PR.
  - **UX 강화 검토 (Codex non-blocking 코멘트)** — Banner.btn_secondary 시각 강도 / SermonListPage.year_card affordance.

- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
  - **Underline link 5 파일** — Phase 4 또는 별도 PR.
  - **rgba shorthand 1건** (SermonListPage `.series_banner_close`) — Phase 4 검토.
  - **Banner.btn_secondary 시각 강도** — base border 승격 가능성 검토.
  - **SermonListPage.year_card affordance** — selected/hover 디자인 강화 여부 검토.

