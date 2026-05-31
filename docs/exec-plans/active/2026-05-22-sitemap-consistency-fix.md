# sitemap-consistency-fix

- **상태**: 🟢 구현 완료 — 검증 통과(verify-task run 20260531-212130), 사용자 dev 수동 검증·커밋 승인 대기 (2026-05-31)
- **시작일**: 2026-05-22
- **브랜치**: feat/sitemap-consistency-fix (따로 브랜치 권장 — 스캐폴드는 현재 브랜치 `feat/sermons-publish-ssot`로 잡혔음)
- **Open questions**: ✅ 4건 모두 결정 완료 (2026-05-26 — §의사결정 로그 D1~D4)
- **ADR needed**: no (데이터·라벨 정정 위주, 새 의존성·아키텍처 변화 없음)
- **참고**: `docs/research/2026-05-22-navigation-sitemap-audit.md` — 진단 보고서·옵션 비교

## 목표

사이트맵 채널(Header·Drawer·Breadcrumb·Hero·BottomNav·MobileHeader·AdminHeader·AdminSidebar) 간 라벨·경로 불일치를 사실 단위로 정정한다. 진단 문서 옵션 A — 추상화 변경 없이 `GNB_ITEMS`·`BOTTOM_NAV_ITEMS`·`ADMIN_NAV_SECTIONS`·`HERO_META`의 데이터 결함만 고친다. 단일 매니페스트(`SITE_MAP`) 통합과 매트릭스 회귀 도구는 후속 plan으로 분리.

## 검증된 Assumptions

- `GNB_ITEMS`의 "다음세대"/"교제"/"교회 소식" 부모 href가 각각 `/next-gen/kindergarten`·`/community/prayer`·`/news/notices`로 잡혀 있음 — `src/config/navigation.ts:33,44,53` Read 확인.
- `/next-gen`·`/community`·`/news` 카테고리 `page.tsx` 모두 존재 — Glob `src/app/(content)/**/page.tsx`.
- `HERO_META`의 `/sermons/all`·`/sermons/series`(`hero.config.ts:15-16`)는 `GNB_ITEMS`에 자식으로 없음. `resolveHeroMeta`가 direct match 우선 분기(`hero.config.ts:31`)로 처리.
- `BOTTOM_NAV_ITEMS`에 라벨 "소식"(`navigation.ts:65`) 존재. GNB는 "교회 소식".
- `{ label: '전체', href: '/menu' }`(`navigation.ts:67`) 대상 `src/app/**/menu/page.tsx` 0건 — Glob 확인.
- Admin Sidebar 5개 항목 중 4개(`/admin/sermons/series`, `/admin/sermons/speakers`, `/admin/members`, `/admin/settings`)에 `page.tsx` 부재 — Glob `src/app/(admin)/**/page.tsx` 결과 4건만 존재.
- `ADMIN_NAV_SECTIONS`에 badge "128"·"24" 하드코딩 — `adminNavigation.ts:29-30`.
- `resolveAdminBreadcrumbs`에 `/admin/sermons/series`·`/admin/sermons/speakers` 분기가 있음 — `adminNavigation.ts:75-76`. page 부재인데 라벨 매핑은 살아 있음.

## Open questions — ✅ 결정 완료 (2026-05-26)

아래 4건 결정. 상세는 §의사결정 로그 D1~D4.

- **Q1 `/fellowship`** → 디렉토리 삭제 (D1)
- **Q2 `/about/serving-people`** → GNB '교회 소개' 자식 노출 (D2)
- **Q3 bulletins create/update 이동** → 따로 plan으로 분리 (D3 — 이 plan 범위 밖, Non-goals)
- **Q4 `/menu`** → '전체' 클릭 시 Drawer 토글 + 뒤로가기 시 페이지 이동 없이 Drawer 닫힘 (D4)

## Success Criteria

- `/next-gen`·`/community`·`/news` 카테고리 페이지 방문 시 Header GNB가 해당 부모를 활성으로 표시한다(`isActiveGnb` true).
- 위 카테고리 페이지에서 Breadcrumb이 "홈 > <카테고리>" 한 단계로 보인다(`resolveBreadcrumbSegments.length === 1`).
- 위 카테고리 페이지에서 MobileHeader가 fallback "대구동남교회"가 아닌 카테고리 라벨을 표시한다.
- `/sermons/all`·`/sermons/series` 방문 시 Breadcrumb이 "홈 > 설교 > 전체 설교" / "홈 > 설교 > 모든 시리즈"로 보이고, Hero 제목과 끝 라벨이 일치한다.
- `HERO_META`의 `/sermons/all`·`/sermons/series` direct entry가 제거되거나, 잔존 시 사유 주석이 호출처에 명시된다.
- `BOTTOM_NAV_ITEMS`의 "소식" 라벨이 "교회 소식"으로 GNB와 일치한다.
- Admin Sidebar에서 `page.tsx` 없는 항목은 클릭 비활성·"준비 중" 시각 표시이며, badge "128"·"24" 하드코딩 가짜 숫자가 제거된다.
- `resolveAdminBreadcrumbs`에서 page 부재 라우트의 라벨 분기가 sidebar 정책과 정합한다(제거 또는 "준비 중" fallback).
- 진단 문서 §3 라우트 매트릭스 기준 P1·P2·P4·P6·P8 모든 행이 △/✗ 표시에서 ✓로 전환된다.
- `/fellowship` 디렉토리가 제거되고 `rg "/fellowship" src` 남은 참조 0건이다(D1).
- `/about/serving-people`가 GNB '교회 소개' 자식으로 노출되고 Breadcrumb이 "홈 > 교회 소개 > 섬기는 사람들"로 표시된다(D2).
- BottomNav '전체' 클릭 시 `/menu`로 이동하지 않고 메뉴 Drawer가 토글되며, Drawer 열린 상태에서 뒤로가기 시 페이지 이동 없이 Drawer만 닫힌다(D4).
- `yarn lint`·`yarn lint:styles`·`yarn build`·`yarn knip` 모두 PASS, knip 신규 항목 0건.

## 영향받는 파일

- `src/config/navigation.ts` — `GNB_ITEMS` 부모 href 3건 정정, '설교' 항목 children 추가, `BOTTOM_NAV_ITEMS` "소식" 라벨 통일. `/menu` 항목은 Q4 결정 반영.
- `src/components/layout/Hero/hero.config.ts` — `/sermons/all`·`/sermons/series` direct entry 정리.
- `src/config/adminNavigation.ts` — `ADMIN_NAV_SECTIONS` 4개 빈 페이지 항목에 `comingSoon` 플래그, badge 가짜 숫자 제거. `resolveAdminBreadcrumbs` 죽은 분기 정리.
- `src/components/admin/layout/AdminSidebar/index.tsx` — `comingSoon` 시각 처리(클릭 비활성·"준비 중" 라벨). `AdminNavItem` 타입 확장.
- `src/app/(content)/fellowship/` — 디렉토리 삭제(D1). 삭제 후 `rg "/fellowship" src` 남은 참조 0건 확인.
- `src/config/navigation.ts` — `GNB_ITEMS` '교회 소개' children에 `{ 섬기는 사람들, /about/serving-people }` 추가(D2). '전체'(`/menu`) 항목은 Drawer 토글로 동작 변경(D4).
- `src/components/layout/BottomNav/BottomNav.tsx` — '전체' 클릭을 Drawer 토글로(D4). `/menu` page 신설 안 함.
- `src/components/layout/MobileNavigation/` — children 있는 항목의 부모 카테고리 Link 노출 (현재 펼침 button만이라 Drawer에서 부모 카테고리 페이지로 직접 이동 불가). 부모를 별도 child로 추가하거나 button/link 구조 split.
- `src/hooks/useDrawerHistory.ts` — **수정 없음(쓰기만 함)**. 훅의 `popstate` 핸들러(`:36-46`)가 이미 뒤로가기 시 Drawer 닫힘을 처리하므로 D4는 BottomNav '전체'를 `drawerOpen ? closeDrawer : openDrawer` 토글 패턴(open + close 양방향 — '전체' 두 번째 탭으로도 닫힘)으로 호출. 라우트 이동 시 history 정리는 tech-debt-pre-release G7(Phase 3)이 맡음.
- `src/config/navigation.ts` `SPECIAL_PAGES` — `/search`·`/notifications` 라벨 정의 (P8). 현재 MobileHeader만 참조하므로 Hero·Breadcrumb도 참조 추가 필요.
- `src/components/layout/Hero/`·`src/components/layout/Breadcrumb/` — `SPECIAL_PAGES` 라벨 참조 추가. `/search`·`/notifications` 진입 시 Hero·Breadcrumb가 라벨 표시 (P8 SC 충족).

## 단계별 체크리스트

- [x] 1. Q1~Q4 사용자 결정 완료(2026-05-26) — D1~D4 기록.
- [x] 2. `GNB_ITEMS` 부모 href 정정 — 다음세대 `/next-gen`·교제 `/community`·교회 소식 `/news`. 카테고리 `page.tsx`가 모두 실제 hub라 `redirect()` 불필요(EXPLORE 확인).
- [x] 3. `GNB_ITEMS` '설교' 항목에 children 추가 — `{전체 설교, /sermons/all}`, `{모든 시리즈, /sermons/series}`.
- [x] 3b. MobileNavigation 부모 카테고리 노출 — children 항목을 `Link`(부모 이동)+펼침 `button`으로 split(D8). 실제 경로는 `Header/MobileNavigation.tsx`(plan의 `MobileNavigation/` 표기와 다름).
- [x] 4. `HERO_META`의 `/sermons/all`·`/sermons/series` direct entry 제거. direct-match 주석을 "direct 전용 의존 0건"으로 갱신. subtitle 일반화는 D6.
- [x] 5. `BOTTOM_NAV_ITEMS` "소식" → "교회 소식". '전체'(`/menu`)는 Drawer 토글(D4) — `page.tsx` 신설 안 함.
- [x] 6. `ADMIN_NAV_SECTIONS` 가짜 badge(`128`·`24`) 제거. 4개 빈 항목에 `comingSoon: true`.
- [x] 7. `AdminNavItem`에 `comingSoon?: boolean` 추가. `AdminSidebar`에서 `comingSoon` 항목은 `Link` 대신 `div` + `aria-disabled` + `tabIndex={-1}` + 회색(`$txt-on-dark-nav-faint`) + "준비 중" pill.
- [x] 8. `resolveAdminBreadcrumbs` 죽은 분기 제거(series/speakers/members/settings) — 4개 라우트 `page.tsx` 부재 확인(D10).
- [x] 8b. P8 — `SPECIAL_PAGES` export → `resolveHeroMeta`·`resolveBreadcrumbSegments`가 참조. `/search`·`/notifications` Hero 제목·Breadcrumb 단일 세그먼트 표시. subtitle 카피 신규 작성(D7).
- [x] 9a. D1 — `/fellowship` 디렉토리 삭제 + `grep "/fellowship" src` 0건. FeedContent 참조 2곳 `/community/sharing`로 재연결(D9).
- [x] 9b. D2 — `GNB_ITEMS` '교회 소개' children에 `섬기는 사람들`(`/about/serving-people`) 추가.
- [x] 9c. D4 — BottomNav '전체' 클릭 → `drawerOpen ? closeDrawer : openDrawer` 토글. 뒤로가기-Drawer 닫힘은 훅 기존 `popstate` 핸들러가 처리 — 훅 수정 없음.
- [ ] 10. 사용자 dev 수동 검증 — 매트릭스 §3 P1·P2·P4·P6·P8 행. (사용자 진행)
- [x] 11. ESLint·stylelint·build·knip PASS, knip 신규 항목 0건.
- [x] 12. `node scripts/verify-task.mjs sitemap-consistency-fix` — 필수 4단계 통과(run 20260531-212130).

## Verification

- `node scripts/verify-task.mjs sitemap-consistency-fix`
- 수동: `/next-gen`·`/community`·`/news` 각 방문 → Header 해당 카테고리 활성, Breadcrumb "홈 > <카테고리>" 표시, MobileHeader 카테고리 라벨 표시.
- 수동: `/sermons/all` → Hero "전체 설교", Breadcrumb "홈 > 설교 > 전체 설교" 일치. `/sermons/series` 동일 패턴.
- 수동: BottomNav 라벨 "교회 소식" 표시 확인.
- 수동: Admin Sidebar 빈 페이지 4개 항목이 클릭 불가·"준비 중" 표시. 가짜 badge 사라짐.
- 수동: Q1~Q4 결정별 동작 확인(결정 시점에 D번호로 정의).

## Non-goals

- `GNB_ITEMS`·`HERO_META`·`BOTTOM_NAV_ITEMS`·`ADMIN_NAV_SECTIONS` 단일 매니페스트(`SITE_MAP`) 통합 — 옵션 B. 따로 plan.
- `AdminHeader` Breadcrumb 자료형 변경(`string[]` → `{label, href}[]`) — 옵션 B 묶음.
- 매트릭스 회귀 테스트 도구 — 옵션 B 진입 전 따로 plan.
- 페이지 콜로케이션(옵션 C) — 보류.
- `Hero/Breadcrumb.tsx` "홈" 하드코딩 정리 — 옵션 B 묶음에서 자연 해소.
- `/news/bulletins/create`·`/[id]/update`의 `(admin)` 이동 — D3. 라우트 이동·접근제어 변경이라 옵션 A(라벨·데이터 정정) 범위 밖. 따로 plan으로 분리.

## 의사결정 로그

- **D1 — `/fellowship` 삭제**
  - 문제: 페이지는 있으나 어떤 메뉴에서도 링크되지 않는다. `/community`(교제)가 이미 GNB에 있어 역할이 겹친다.
  - 해결: GNB 추가·유지 대신 디렉토리를 삭제한다. 교제 콘텐츠는 `/community`가 담당하고, 링크 없는 페이지는 사이트맵을 흐린다. (사용자 결정 — 고유 콘텐츠 아님)
  - 결과: 삭제 후 `rg "/fellowship" src` 0건. 공개 라우트 1개 감소.
- **D2 — `/about/serving-people` GNB '교회 소개' 자식 노출**
  - 문제: 실제 콘텐츠 페이지인데 GNB·Drawer·Breadcrumb 어디에도 없어 사용자가 도달할 수 없다.
  - 해결: 삭제 대신 `GNB_ITEMS` '교회 소개' children에 추가한다. 실 콘텐츠라 접근 경로 부여가 맞다.
  - 결과: 메뉴에서 도달 가능, Breadcrumb "홈 > 교회 소개 > 섬기는 사람들" 정상화.
- **D3 — bulletins create/update의 (admin) 이동은 따로 plan**
  - 문제: public 그룹에 어드민성 페이지(`/news/bulletins/create`·`/[id]/update`)가 있다.
  - 해결: 이 plan(옵션 A — 라벨·데이터 정정)에서 제외하고 따로 plan으로 분리한다. 라우트 이동·접근제어 변경은 회귀 위험이 커 외과적 범위를 벗어난다.
  - 결과: 이 plan scope 불변. Non-goals에 기록, 후속 plan `bulletins-admin-route-move` 후보.
- **D4 — `/menu`는 Drawer 토글 + 뒤로가기 시 Drawer 닫힘**
  - 문제: BottomNav '전체'가 `/menu`를 가리키나 `page.tsx`가 없다. 전용 페이지 신설은 과하다.
  - 해결: '전체' 클릭 시 기존 메뉴 Drawer를 토글한다(page 신설 안 함). 더해 Drawer가 열린 상태에서 뒤로가기를 누르면 페이지가 이동하지 않고 Drawer만 닫히도록 `useDrawerHistory`를 처리한다. 모바일 '전체 메뉴' 패턴 + 뒤로가기 직관에 맞다.
  - 결과: `/menu` 페이지 불필요. 역할 분리: `useDrawerHistory`의 `popstate` 핸들러(`:36-46`)가 이미 뒤로가기-Drawer 닫힘을 처리하므로 D4는 훅 수정 없음(BottomNav '전체'를 `openDrawer`에 **연결**만 함). 라우트 이동 시 history 정리는 tech-debt-pre-release G7(Phase 3)이 맡음.
- **D5 — `resolveMobileHeader`에 카테고리 하위 fallback 추가**
  - 문제: '설교'에 children을 넣자 `/sermons/[id]` 상세에서 자식 매칭이 실패해 모바일 헤더 제목이 fallback "대구동남교회"로 떨어진다(매트릭스 Mh ✓ → 회귀).
  - 해결: children 분기 안에서 자식 매칭 실패 시 `pathname.startsWith(item.href + '/')`이면 카테고리 라벨을 유지한다.
  - 결과: `/sermons/[id]`·`/sermons/series/[id]` 제목이 "설교"로 복원. GNB 부모 href(`/about`·`/next-gen`·`/sermons`·`/community`·`/news`)가 서로 접두사 관계가 아니라 형제 카테고리 오매칭 없음(Codex 1차 확인).
- **D6 — sermons 자식 subtitle 일반화 수용**
  - 문제: `HERO_META` direct entry 제거로 `/sermons/all`·`/sermons/series`의 subtitle이 전용 문구("…검색·필터로 찾아보세요")에서 카테고리 `/sermons` subtitle("주일 말씀과 강해 설교를 만나보세요")로 바뀐다.
  - 해결: SC가 제목·끝 라벨 일치만 요구하므로 일반화를 수용한다. 전용 subtitle 복원은 SSOT를 다시 둘로 가르는 일이라 옵션 A 범위 밖.
  - 결과: 제목 "전체 설교"·"모든 시리즈"는 Breadcrumb 끝 라벨과 일치. subtitle만 카테고리 공통 문구.
- **D7 — 검색·알림 Hero subtitle 신규 작성**
  - 문제: P8 충족에 Hero subtitle이 필요하나 plan에 문구가 없다.
  - 해결: `/search`="교회 콘텐츠를 한 곳에서 찾아보세요", `/notifications`="새로운 소식과 알림을 확인하세요"로 채택. title은 `SPECIAL_PAGES`(navigation.ts)가 SSOT.
  - 결과: 두 페이지에서 Hero 제목·부제·Breadcrumb 표시. 추후 디자인 카피 확정 시 `SPECIAL_HERO_META`만 교체.
- **D8 — MobileNavigation 부모를 button/link split**
  - 문제: 부모를 별도 child로 추가하면 desktop mega·Breadcrumb까지 오염된다.
  - 해결: drawer 컴포넌트에만 국한해 부모를 `Link`(카테고리 이동)+펼침 `button`으로 분리한다. desktop GNB의 부모 클릭 이동과 동작이 일치한다.
  - 결과: drawer에서 부모 카테고리 페이지 직접 이동 가능. `aria-expanded`·`aria-label`로 펼침 버튼 a11y 보강.
- **D9 — FeedContent `/fellowship` 참조 재연결**
  - 문제: D1로 `/fellowship`을 삭제하면 home FeedContent의 '은혜 나눔' 링크 2곳이 깨진다(plan 미기재).
  - 해결: GNB '교제 > 은혜 나눔'(`/community/sharing`)으로 재연결한다. D1의 "교제 콘텐츠는 `/community`가 담당" 방침과 일치.
  - 결과: `grep "/fellowship" src` 0건. 홈 '은혜 나눔 더 보기'가 `/community/sharing`로 이동.
- **D10 — admin breadcrumb 죽은 분기 제거 근거**
  - 문제: `resolveAdminBreadcrumbs`의 series/speakers/members/settings 분기가 sidebar comingSoon 정책과 어긋난다.
  - 해결: 4개 라우트 모두 `page.tsx` 부재(find로 확인)라 도달 시 404 — 분기를 제거한다. 라우트 신설 시 sidebar comingSoon 해제와 함께 복원하라는 주석을 남긴다.
  - 결과: 사이드바(비활성)와 breadcrumb 정책 일치. 죽은 분기 4개 제거.

## 참고 자료

- `docs/research/2026-05-22-navigation-sitemap-audit.md`
  - §2 P1~P10 발견된 문제(증상·근거·영향)
  - §3 라우트 매트릭스(채널별 정상·어긋남 표)
  - §4 옵션 A/B/C 비교

## ADR 판단

- 변경 파일이 `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs`)에 해당하지 않음 — 데이터 상수·UI 컴포넌트만.
- 변경 내용은 데이터 정정·시각 비활성 처리·라벨 통일. 새 의존성·아키텍처 축 변화 없음.
- 판단: ADR 미발급.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS — PR #103 봇·Codex 리뷰에서 계획 결함을 정정하고 Q1~Q4를 D1~D4로 확정. 사용자가 본 세션 재검증을 생략하고 구현 진입을 지시.
- **현재 판단**: 정정된 plan으로 구현. 구현 단계 검증은 Codex 1차 + Claude 2차로 대체(아래 두 섹션).
- **다음 행동**: 구현 후 Codex 1차 검증 수행 — 완료.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence medium)
- **현재 판단**: 요약 diff 기반 지적 2건(타입·죽은 분기) 모두 실제 코드·파일 확인 후 무변경 해소. 상세는 검증 이력.
- **다음 행동**: Claude 2차 검증에서 교차 확인 완료.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: Codex CR 2건 근거 확인 후 코드 변경 없음. verify-task 필수 4단계 통과(아래 검증 결과 표), knip 신규 항목 0건.
- **다음 행동**: 사용자 dev 수동 검증(체크리스트 10)·커밋 승인 대기.

## 검증 이력

검증 결과:

| 시점 | run-id | ESLint | stylelint | build(next) | knip 신규 |
| --- | --- | --- | --- | --- | --- |
| 2026-05-31 Claude 2차 | 20260531-212130 | ✓ | ✓ | ✓ | 0건 |

knip이 잡은 항목(`resolveNavLabel`·`ADMIN_ROOT` 미사용 export 등)은 변경 전부터 있던 부채다. `SPECIAL_PAGES`는 hero.config가 import해 knip이 잡지 않는다. worktree 빌드가 처음 실패한 원인은 node_modules junction을 Turbopack이 거부한 것이라, 실제 `yarn install`과 main의 `.env*` 복사로 해소했다(코드 무관).

<details>
<summary>2026-05-31 Codex 1차 검증</summary>

- 판정: CHANGE_REQUEST (medium)
- 이유: 요약 diff 기반 지적 2건 — `SPECIAL_HERO_META` index signature 타입 오류, `resolveAdminBreadcrumbs` 죽은 분기 제거 안전성.
- 조치: hero.config.ts:20 `Record<string,…>` annotate + `tsc --noEmit` exit 0 / 4개 라우트 page.tsx 부재 `find` 확인 — 둘 다 무변경.

</details>

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

- **옵션 B 단일 매니페스트(`SITE_MAP`)** — `sitemap-manifest-migration` plan으로 분리.
  - 이유: 채널 간 SSOT 통합은 모든 nav 컴포넌트 시그니처를 동시에 손대므로 회귀 위험이 크다. 매트릭스 회귀 도구로 검증 자동화가 선행돼야 한다.
  - 통합 시 함께 해소: segment-boundary 매칭 단일화(tech-debt `nav pathname 매칭이 segment boundary 무시`), `resolveHeroMeta` subtitle comparator(tech-debt `resolveHeroMeta subtitle comparator…`), resolver별 trailing-slash 정책 차이·분기 중복.
  - 다음 기준: 이 plan 머지 + 매트릭스 도구 plan 머지 후.
  - 기록 위치: `docs/research/2026-05-22-navigation-sitemap-audit.md` §4 옵션 B.
- **매트릭스 회귀 테스트 도구** — `sitemap-matrix-regression` plan으로 분리.
  - 이유: 옵션 B 진입 전 안전망. 이 plan 범위에서는 진단 문서 매트릭스를 수동 체크리스트로 사용.
  - 다음 기준: 이 plan 머지 직후.
  - 기록 위치: 진단 문서 §4 권장 경로 2번.
- **`Hero/Breadcrumb.tsx` "홈" 하드코딩 정리** — 옵션 B 묶음에서 자연 해소.
  - 이유: SSOT 통합 시 한 곳에서 처리. 이 plan 단독 정리는 SSOT 분리 한 단계만 더 늘림.
  - 다음 기준: 옵션 B 진입.
- **옵션 C 페이지 콜로케이션** — 보류.
  - 이유: 현재 라우트 규모(~35) 대비 빌드 파이프라인 신설 비용 과함.
  - 다음 기준: 라우트 70~80개 초과 시 재고.

---

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->
