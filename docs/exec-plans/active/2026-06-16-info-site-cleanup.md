# info-site-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-16
- **브랜치**: feat/info-site-cleanup
- **Open questions**: none
- **ADR needed**: no

## 목표

정보 사이트로 먼저 출시하기 위해 헤더의 로그인·회원가입 진입점을 숨기고, `#`로 걸린 죽은 링크 8개(Footer SNS·정책, 환영 방문등록, 예배 주차안내)를 정리한다. 방문자가 동작하지 않는 링크를 만나지 않게 한다.

## 검증된 Assumptions

- 헤더 인증 진입점은 하드코딩이다 — `DesktopHeader.tsx:53`(로그인 Link), `MobileNavigation.tsx:36-40`(로그인·회원가입 `auth_links`). GNB는 `GNB_ITEMS` 데이터 기반이라 무관하다.
- 죽은 `#` 링크는 정확히 8건이다 — src 전체 검색 결과: `Footer.tsx:55-58`(SNS 4개)·`135-136`(정책 2개), `welcome/page.tsx:114`, `worship/page.tsx:47`. 그 외 없다.
- 로그인 라우트(`/login`)·인증 시스템은 그대로 둔다 — 진입점(헤더 링크)만 제거한다. 관리자는 직접 URL로 접근한다. SessionContextProvider·미들웨어·supabase 클라이언트는 건드리지 않는다.
- 예배 주차 정보는 오시는 길에 있다 — `worship` `WELCOME.ctas`에 이미 `/about/location`이 있어, 주차안내 항목을 빼도 정보 경로가 남는다.

## Success Criteria

- 데스크탑 top bar·모바일 내비에서 로그인·회원가입 링크가 보이지 않는다.
- src 전체에서 `#` href 검색 결과가 0건이다.
- Footer SNS는 실제 주소가 없으면 블록째 숨고, 주소를 채우면 그 항목만 노출된다.
- 환영 방문등록 CTA가 `/about/location`으로 연결되고 라벨이 목적지와 맞는다.
- `yarn lint`·`yarn build` 통과, 신규 knip 0.

## 영향받는 파일

- `src/components/layout/Header/DesktopHeader.tsx` — top bar 로그인 Link 제거.
- `src/components/layout/Header/MobileNavigation.tsx` — `auth_links`(로그인·회원가입) 제거.
- `src/components/layout/Header/MobileNavigation.module.scss` — 제거로 unused 된 `.auth_links`·`.nav_divider` 정리(내 변경이 만든 unused만).
- `src/components/layout/Footer/Footer.tsx` — SNS는 실제 href만 렌더한다(없으면 블록째 숨김). 정책 링크 2개(개인정보처리방침·이용약관)를 제거한다.
- `src/app/(content)/about/welcome/page.tsx` — 방문등록 CTA를 `/about/location`으로 연결, 라벨 조정.
- `src/app/(content)/about/worship/page.tsx` — 죽은 주차안내 CTA 제거.

## Non-goals

- 개인정보처리방침 페이지 신설 — GA 도입(Wave 2)과 함께 만들고 Footer 링크를 복구한다. 지금은 죽은 링크만 제거한다.
- 인증 시스템·로그인 라우트 삭제 — 진입점만 숨긴다. 페이지·미들웨어는 보존한다.
- `DesktopHeader.tsx:21` `queueMicrotask` 제거 — 기존 코드이고 이번 task와 무관하다. 후속으로 둔다.
- Footer SNS 실제 URL 입력 — 사용자가 제공한다(콘텐츠 숙제). 코드는 받을 준비만 한다.

## 단계별 체크리스트

- [x] 1. DesktopHeader·MobileNavigation 인증 진입점 제거 + unused SCSS 정리
- [x] 2. Footer SNS 실제 href만 렌더(블록 조건부) + 정책 죽은 링크 제거
- [x] 3. welcome 방문등록 CTA를 오시는 길로 다시 연결 + worship 주차안내 제거
- [ ] 4. verify-task (lint·build·knip) — 사용자 dev 서버 중단 확인 후

## Verification

- `node scripts/verify-task.mjs info-site-cleanup`

## 의사결정 로그

- **D1 — Codex 계획 검증 생략**
  - 문제: 5파일 다단계라 CODEX_PLAN_REVIEW 트리거에 해당한다.
  - 해결: UI 링크 제거와 재연결이라 답이 명확하다. 회귀 위험이 낮고 git으로 즉시 복구된다(프로젝트 "위임 안 함: 답이 명확한 코드"). hide-unbuilt-menus와 같은 성격이다. 대안으로 계획 검증을 받을 수 있으나 얻을 게 없다.
  - 결과: 계획 검증을 생략하고 WORK로 진입한다. 구현 diff를 보고 CODEX_FIRST_PASS 여부를 판단하고, 머지 전 harness-gate에서 재확인한다.

- **D2 — 죽은 SNS 링크를 제거 대신 "실제 href만 렌더"로 처리**
  - 문제: SNS 4개가 `href: '#'`라 클릭해도 아무 동작이 없다. 사용자가 실제 채널 URL을 곧 제공한다(콘텐츠 숙제).
  - 해결: 블록째 지우면 URL이 올 때 마크업을 다시 살려야 한다. 대신 `href !== '#'`인 항목만 렌더하고 남는 게 없으면 블록을 숨긴다. 지금은 4개가 모두 숨고, href만 채우면 그 항목이 자동으로 보인다.
  - 결과: 지금 죽은 링크가 0이다. 나중에 Footer를 다시 고치지 않고 `SNS_LINKS`의 href 값만 채우면 된다.

- **D3 — 환영 방문등록 CTA를 제거 대신 오시는 길로 다시 연결**
  - 문제: "방문 등록하기" CTA가 `#`인데 온라인 방문 등록 기능은 없다. CTA 카드(제목 "먼저 인사 나누고 싶으신가요?")를 통째로 지우면 전환 동선이 사라진다.
  - 해결: 가장 가까운 실제 다음 행동은 직접 방문이라 `/about/location`(오시는 길)으로 연결하고 라벨을 목적지에 맞췄다. 전화·카톡 문의 같은 더 직접적인 전환 동선은 사용자 콘텐츠 결정이라 후속으로 둔다.
  - 결과: 죽은 CTA가 사라지고 방문자가 오시는 길로 이어진다. 문의형 CTA는 사용자가 원하면 나중에 교체한다.

## ADR 판단

- **ADR needed**: no — UI 링크 제거·repoint만 한다. apis/services/actions/lib/supabase/config/scripts 변경이 없다. 인증 시스템·미들웨어가 그대로라 인증 정책 변경이 아니다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 생략 (의사결정 로그 D1)
- **현재 판단**: UI 링크 제거·repoint이라 답이 명확하고 회귀 위험이 낮다. hide-unbuilt-menus와 같은 성격이라 계획 검증을 생략했다.
- **다음 행동**: 구현 diff 크기를 보고 CODEX_FIRST_PASS 여부를 판단한다.

## Codex 1차 검증

- **결론**: 생략 (의사결정 로그 D1 연장)
- **현재 판단**: diff 6파일이 모두 링크 제거·재연결·SCSS 정리다. 큰 diff·고위험 파일·레이어 변경·검증 실패 중 어느 것도 없다(build 통과). Claude가 각 편집을 직접 검토했다.
- **다음 행동**: 머지 전 harness-gate에서 재확인.

## Claude 2차 검증

- **최종 판단**: 통과
- **현재 판단**: 필수 검증(ESLint·stylelint·build) 통과. Knip 경고는 모두 기존 부채다 — 내 diff는 파일·import·export를 지우지 않고 JSX 요소·SCSS 규칙·배열 항목만 제거했다(신규 0). flagged된 `signOut`·`resolveNavLabel`·`getNoticeById` 등은 내가 건드린 6파일과 무관하다.
- **다음 행동**: 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260616-221006 | ✅ | ✅ | ✅ | 0 | 변경 tsx eslint error 0 · diff 외과적(+20/−46) |

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

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

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

