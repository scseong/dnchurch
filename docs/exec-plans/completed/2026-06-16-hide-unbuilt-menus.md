# hide-unbuilt-menus

- **상태**: ✅ 완료 (2026-06-16)
- **시작일**: 2026-06-16
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no

## 목표

GNB·하단탭·헤더에서 미구현 기능 진입점을 정리한다. 검색·알림은 숨기고, 다음세대·교제·갤러리는 "준비 중" 안내 화면으로 바꾼다. 방문자가 빈 placeholder를 만나지 않게 해 배포 가능 상태로 만든다.

## 검증된 Assumptions

- GNB·하단탭은 데이터 기반 렌더 — `DesktopHeader.tsx:77`·`MobileNavigation.tsx:45`·`BottomNav.tsx:31`이 `GNB_ITEMS`/`BOTTOM_NAV_ITEMS`를 `map`. `navigation.ts` 수정으로 자동 반영.
- 검색·알림 아이콘은 하드코딩 — `DesktopHeader.tsx:124-129`(검색 Link + 알림 button), `MobileHeader.tsx:36-38`(검색 Link).
- `(content)` 레이아웃이 Hero 자동 적용 — `(content)/layout.tsx:21` `<Hero />`. Hero 타이틀은 `hero.config.ts`의 `resolveHeroMeta`가 결정 — next-gen·community는 `HERO_META` 직접 매칭, gallery는 GNB '교회 소식' children 매칭으로 확인. (resolveNavLabel은 미사용 — 기존 부채. ComingSoon은 본문만 담당.)
- placeholder는 단순 stub — `next-gen/page.tsx:8` `<div>다음세대</div>`. community·gallery 동일.
- sitemap은 이미 미구현 경로 제외 — `sitemap.ts:11-30`. 수정 불필요.
- `(content)` 하위 추가 layout 없음 — `(content)/layout.tsx` 하나뿐(Glob 확인). 갤러리도 같은 Hero 적용.

## Success Criteria

- 헤더에서 검색·알림 아이콘이 안 보인다.
- 다음세대·교제는 GNB에 남되 하위 메뉴 없이 단일 링크, 클릭 시 "준비 중" 안내가 뜬다. 갤러리도 교회 소식 하위에서 클릭 시 "준비 중".
- 하단탭 5개 유지, '교제'는 `/community`(준비 중)로 연결.
- ComingSoon이 `(content)` 레이아웃 안에서 Hero 타이틀과 함께 렌더된다.
- `yarn lint`·`yarn build` 통과, 신규 knip 0.

## 영향받는 파일

- `src/config/navigation.ts` — `GNB_ITEMS`(다음세대·교제 children 제거), `BOTTOM_NAV_ITEMS`(교제 href → `/community`). `SPECIAL_PAGES`는 보존(D3).
- `src/components/common/ComingSoon/ComingSoon.tsx`·`ComingSoon.module.scss` (신규)
- `src/components/layout/Header/DesktopHeader.tsx` — 검색·알림 제거 + import 정리
- `src/components/layout/Header/MobileHeader.tsx` — 검색 제거 + import 정리
- `src/components/layout/Header/Header.module.scss` — 검색·알림 제거로 unused 된 `.utility_btn`·`.mobile_actions`·`.mobile_action_btn` 제거
- `src/app/(content)/next-gen/page.tsx`·`community/page.tsx`·`news/gallery/page.tsx` — ComingSoon 렌더

## Non-goals

- 다음세대·교제·갤러리의 하위 라우트(유치부·기도제목 등) placeholder — 메뉴에서 빠져 진입점 없음. 섹션 페이지만 ComingSoon. 직접 URL 차단은 후속.
- `/search`·`/notifications` placeholder 페이지 자체 — 진입점(아이콘)만 제거. 페이지 삭제는 후속.
- 권한 fallback 제거 — 배포 후 4단계.

## 단계별 체크리스트

- [x] 1. ComingSoon 공용 컴포넌트 작성 (tsx + module.scss)
- [x] 2. `navigation.ts` — 검색·알림 제거, 다음세대·교제 children 제거, 하단탭 교제 href 변경
- [x] 3. `DesktopHeader`·`MobileHeader` — 검색·알림 아이콘 + import 제거
- [x] 4. next-gen·community·gallery 페이지 → ComingSoon
- [x] 5. verify-task (lint·build·knip)

## Verification

- `node scripts/verify-task.mjs hide-unbuilt-menus`

## 의사결정 로그

- **D1 — 미완성 메뉴를 전부 숨김 대신 "혼합"(검색·알림 숨김 + 콘텐츠 준비 중)으로 처리**
  - 문제: 미구현 메뉴 5종이 GNB에 노출돼 빈 placeholder로 연결된다. 전부 숨기면 곧(2~3주) 공개할 콘텐츠 섹션의 예고 기회를 잃는다.
  - 해결: 검색·알림은 유틸이라 "준비 중"이 어색하고 완성 시 아이콘 복구가 쉬워 숨김을 택했다. 다음세대·교제·갤러리는 콘텐츠 섹션이라 공용 ComingSoon으로 예고한다. 사용자가 혼합을 선택했다(2026-06-16).
  - 결과: 완성된 기능만 동작하되 곧 올 콘텐츠는 예고한다. 단 2~3주 뒤 실기능으로 교체될 임시 자산이라 ComingSoon은 최소 구현으로 한정한다(과투자 금지).

- **D2 — Codex 계획 검증 생략**
  - 문제: 다단계라 하네스상 CODEX_PLAN_REVIEW 트리거에 해당한다.
  - 해결: UI 항목 제거 + 안내 컴포넌트 추가라 답이 명확하고 회귀 위험이 낮으며 git으로 즉시 복구된다(프로젝트 "위임 안 함: 답이 명확한 코드" 기준). 구현 후 diff 크기를 보고 CODEX_FIRST_PASS 여부를 판단한다.
  - 결과: 계획 검증을 생략하고 WORK로 진입한다. 머지 전 harness-gate에서 이 판단을 재확인한다.

- **D3 — 검색·알림의 `SPECIAL_PAGES`·hero.config 메타는 제거하지 않고 보존**
  - 문제: 처음엔 `SPECIAL_PAGES`에서 검색·알림을 지웠는데, `hero.config.ts`의 `resolveHeroMeta`가 `SPECIAL_PAGES[pathname]`로 검색·알림을 조회하므로(`hero.config.ts:46-49`) 검색·알림 전용 `SPECIAL_HERO_META`가 도달 불가 dead code가 됐다.
  - 해결: 검색·알림 "숨김"은 헤더 아이콘(진입점) 제거로 이미 달성된다. placeholder 페이지(`/search`·`/notifications`)는 Non-goal로 남으므로 그 라우팅 메타도 함께 보존해 `SPECIAL_PAGES`와 hero.config가 어긋나지 않게 한다. `SPECIAL_PAGES` 검색·알림 제거를 원복했다.
  - 결과: dead code 0. 검색·알림은 메뉴·아이콘에서 사라지되, 직접 URL 접근 시 Hero 타이틀은 정상. 페이지째 정리는 후속.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 생략 (의사결정 로그 D2)
- **현재 판단**: UI 항목 제거 + 안내 컴포넌트 추가라 답이 명확하고 회귀 위험이 낮다. 단순·가역이라 계획 검증을 생략했다.
- **다음 행동**: 머지 전 harness-gate에서 생략 판단을 재확인한다.

## Codex 1차 검증

- **결론**: 생략 (의사결정 로그 D2)
- **현재 판단**: diff 8파일이 모두 UI 항목 제거·ComingSoon 추가다. Claude가 직접 검토했다 — Hero 타이틀을 next-gen·community·gallery 세 경로로 추적해 정상 확인, `SPECIAL_PAGES` 원복으로 dead code 0(D3), 인접 정리 없음.
- **다음 행동**: 머지 전 harness-gate 재확인.

## Claude 2차 검증

- **최종 판단**: 통과
- **현재 판단**: 필수 검증(ESLint·stylelint·build) 통과. Knip 경고는 기존 부채만(신규 0) — `resolveNavLabel` 등은 `completed/2026-05-22-sitemap-consistency-fix.md`에 변경 전 부채로 명시.
- **다음 행동**: 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260616-193256 | ✅ | ✅ | ✅ | 0 | Hero 타이틀 3페이지 정상 · dead code 0 |

## 검증 이력

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

## 회고

- **잘된 것**: 미구현 진입점을 전부 숨기는 대신, 유틸(검색·알림)은 숨기고 콘텐츠 섹션(다음세대·교제·갤러리)은 준비 중 안내로 나눴다(D1). 곧 공개할 섹션의 예고 기회를 지키면서 빈 placeholder 노출은 막았다. Hero 타이틀이 ComingSoon 안에서도 뜨는지 next-gen·community·gallery 세 경로로 직접 추적해 회귀 없이 확인했다.
- **다음에 할 것**: 숨긴 경로는 진입점만 막혔고 직접 URL로는 아직 열린다. 처리 방향은 아래 후속에 적었다.
- **발견된 부채**: `resolveNavLabel`는 이번에도 미사용으로 남았다. 기존 부채이고 `completed/2026-05-22-sitemap-consistency-fix.md`에 변경 전 부채로 기록돼 있어, 이번 범위와 무관하므로 보고만 한다.

## 후속 작업

- 숨긴 섹션 5종(다음세대, 교제, news/gallery, search, notifications)의 직접 URL 접근 처리
  - 이유: 이번 범위는 GNB·하단탭·헤더의 진입점 제거만 했다. 직접 URL 차단은 Non-goal로 뒀다.
  - 다음 기준: 각 섹션의 실기능을 구현하거나, 실서비스 배포 점검에서 직접 URL 노출을 막을 때.
  - 기록 위치: 실서비스 MVP 로드맵(Wave 1·후속)에서 추적. 별도 tech-debt 등록은 보류한다.

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

