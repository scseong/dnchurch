# info-site-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-16
- **브랜치**: feat/info-site-cleanup
- **Open questions**: none
- **ADR needed**: no

## 목표

정보 사이트로 먼저 출시하기 위해 헤더의 로그인·회원가입 진입점을 숨기고, `#`로 걸린 죽은 링크 8개(Footer SNS·정책, 환영 방문등록, 예배 주차안내)를 정리한다. 홈 피드가 공지를 빈 stub 페이지로 링크하던 것도 끊고, 가짜 '은혜 나눔' 데이터와 숨긴 섹션의 직접 URL 스텁 13개도 들어낸다. 방문자가 동작하지 않는 링크나 미완성 화면을 만나지 않게 한다.

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
- 홈 피드에서 공지를 클릭하면 빈 화면이 아니라 공지 목록으로 간다. `/news/notices/[id]` stub 라우트가 없다.
- 홈에 가짜 데이터(은혜 나눔 `SHARING_ITEMS`)·탭이 없고, FeedSection 헤더에 교회 소식만 적혀 있다.
- 숨긴 섹션의 직접 URL 스텁 13개가 없고(→404), 살아있는 링크가 그 경로를 가리키지 않는다.
- `yarn lint`·`yarn build` 통과, knip은 baseline과 동일(신규 0).

## 영향받는 파일

- `src/components/layout/Header/DesktopHeader.tsx` — top bar 로그인 Link 제거.
- `src/components/layout/Header/MobileNavigation.tsx` — `auth_links`(로그인·회원가입) 제거.
- `src/components/layout/Header/MobileNavigation.module.scss` — 제거로 unused 된 `.auth_links`·`.nav_divider` 정리(내 변경이 만든 unused만).
- `src/components/layout/Footer/Footer.tsx` — SNS는 실제 href만 렌더한다(없으면 블록째 숨김). 정책 링크 2개(개인정보처리방침·이용약관)를 제거한다.
- `src/app/(content)/about/welcome/page.tsx` — 방문등록 CTA를 `/about/location`으로 연결, 라벨 조정.
- `src/app/(content)/about/worship/page.tsx` — 죽은 주차안내 CTA 제거.
- `src/app/_component/home/FeedContent.tsx` — 홈 피드 공지 링크를 `/news/notices`로 바꿔 빈 stub으로 가지 않게 한다.
- `src/app/(content)/news/notices/[id]/page.tsx` — 도달 불가한 빈 stub 라우트 제거(드로어가 상세를 담당).
- `src/app/_component/home/FeedContent.tsx` — "은혜 나눔" 탭·가짜 데이터 제거, 단일 교회 소식 피드로 재작성(client→server).
- `src/app/_component/home/FeedSection.tsx` — 헤더 "교회 소식과 은혜 나눔"을 "교회 소식"으로, 부제 갱신.
- `src/app/_component/home/FeedContent.module.scss` — 미사용 된 tab·grid·sharing 규칙 제거.
- `src/app/(content)/{next-gen,community,news/gallery,search,notifications}/**` — 숨긴 섹션 직접 URL 스텁 13개 삭제(→404). 섹션 ComingSoon 페이지 3개(next-gen·community·news/gallery)는 보존.
- `src/config/navigation.ts` — `SPECIAL_PAGES`에서 검색·알림 제거 + 외부 import가 끊겨 `SPECIAL_PAGES`를 un-export(내부 전용).
- `src/components/layout/Hero/hero.config.ts` — 검색·알림 삭제로 사장된 `SPECIAL_HERO_META`·resolveHeroMeta 특수 블록·`SPECIAL_PAGES` import 제거.
- `src/utils/reveal.ts` — 죽은 `REVEAL_STEP` 삭제 + 내부 전용 `REVEAL_STEP_CONTENT` un-export.

## Non-goals

- 개인정보처리방침 페이지 신설 — GA 도입(Wave 2)과 함께 만들고 Footer 링크를 복구한다. 지금은 죽은 링크만 제거한다.
- 인증 시스템·로그인 라우트 삭제 — 진입점만 숨긴다. 페이지·미들웨어는 보존한다.
- `DesktopHeader.tsx:21` `queueMicrotask` 제거 — 기존 코드이고 이번 task와 무관하다. 후속으로 둔다.
- Footer SNS 실제 URL 입력 — 사용자가 제공한다(콘텐츠 숙제). 코드는 받을 준비만 한다.

## 단계별 체크리스트

- [x] 1. DesktopHeader·MobileNavigation 인증 진입점 제거 + unused SCSS 정리
- [x] 2. Footer SNS 실제 href만 렌더(블록 조건부) + 정책 죽은 링크 제거
- [x] 3. welcome 방문등록 CTA를 오시는 길로 다시 연결 + worship 주차안내 제거
- [x] 4. 홈 피드 공지 링크를 목록으로 + 빈 stub 라우트 제거
- [x] 5. 홈 "은혜 나눔" 가짜 데이터·탭 제거, 단일 교회 소식 피드로 (FeedSection 헤더 포함)
- [x] 6. 숨긴 섹션 직접 URL 스텁 13개 삭제 + navigation·hero.config 정리
- [x] 7. reveal.ts 죽은 export 정리 (REVEAL_STEP 삭제·REVEAL_STEP_CONTENT un-export)
- [x] 8. verify-task — stale .next 1회 정리 후 통과, knip baseline 완전 복귀

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

- **D4 — 홈 피드 공지 링크를 목록으로 돌리고 빈 stub 제거 (상세 페이지는 안 만듦)**
  - 문제: 처음엔 공지 클릭이 빈 화면이라 단정했으나, 확인해 보니 목록 페이지는 드로어(`NoticeDrawer`)로 상세를 정상 렌더한다. 진짜 문제는 홈 피드(`FeedContent.tsx:81`)만 공지를 빈 stub `/news/notices/[id]`로 링크하던 것이다.
  - 해결: 상세 페이지를 새로 만들 수도 있으나, 공지는 회원용이라 비신자 유입과 거리가 멀고 `board` 컴포넌트도 재사용이 안 맞는다(`BoardFooter`는 prev/next가 bulletins URL로 하드코딩). 단순함을 택해 홈 링크를 목록(`/news/notices`)으로 돌리고 도달 불가한 stub 라우트를 지웠다. 사용자가 린 안을 택했다(2026-06-17).
  - 결과: 홈에서 공지를 클릭해도 빈 화면이 없다. `getNoticeById`·`getAllNoticeIds`는 여전히 미사용이나 기존 부채라 보고만 한다(상세 페이지를 만들 때 사용).

- **D5 — 홈 "은혜 나눔" 가짜 데이터·탭 제거 (단일 교회 소식 피드)**
  - 문제: `FeedContent`의 "은혜 나눔" 탭이 지어낸 이름 5건(`SHARING_ITEMS` 하드코딩)을 보여주고 "더 보기"는 숨긴 `/community/sharing`으로 갔다. `FeedSection` 헤더도 "은혜 나눔"을 가리켰다. 홈은 첫인상 지점이라 가짜 간증은 신뢰를 깎는다.
  - 해결: 커뮤니티가 출시 후 과제라 실데이터가 없다. D2처럼 숨기고 나중에 되살리는 길도 있으나, 은혜 나눔은 탭·칼럼·데이터가 한 묶음이라 숨김 분기를 남기면 죽은 토글이 그대로 남는다. 그래서 탭·칼럼·`SHARING_ITEMS`를 지우고 단일 교회 소식 피드로 바꿨다. FeedSection 헤더·부제도 교회 소식만 다루게 고쳤다. 탭 토글이 사라져 `FeedContent`는 client에서 server 컴포넌트가 됐다.
  - 결과: 홈에 가짜 데이터가 없다. 커뮤니티 출시 때 은혜 나눔을 실데이터로 되살린다.

- **D6 — 숨긴 섹션 직접 URL 스텁 13개를 삭제(→404), 검색·알림은 config까지 정리**
  - 문제: hide-unbuilt-menus가 메뉴 진입점만 막아, 서브 스텁(`next-gen/유초등`, `community/groups` 등 13개, `<div>유초등부</div>` 수준)이 직접 URL로는 그대로 열렸다. 검색·알림은 D3에서 페이지가 살아 있어 `SPECIAL_PAGES`·`SPECIAL_HERO_META`를 일부러 보존했다.
  - 해결: 리다이렉트 대신 삭제(→깔끔한 404)를 택했다. 미완성 회원용 화면이라 ComingSoon으로 옮길 가치가 낮고, 삭제가 dead code를 가장 적게 남긴다. 검색·알림은 페이지를 지우며 D3 cascade를 완결 — `SPECIAL_HERO_META`, resolveHeroMeta 특수 블록, `SPECIAL_PAGES`의 두 항목을 함께 지웠다. hero.config가 `SPECIAL_PAGES` import를 끊어 `SPECIAL_PAGES`도 내부 전용으로 un-export.
  - 결과: 직접 URL로 열리던 스텁이 모두 404가 됐다. 검색·알림이 끊겨 사장된 코드(`SPECIAL_HERO_META`·resolveHeroMeta 특수 블록)도 남지 않았다. 섹션 ComingSoon 3개는 보존돼 "준비 중" 예고는 유지된다.

- **D7 — reveal.ts 죽은 export 정리를 이번 PR에서 완료 (PR A에 묶어 안전해짐)**
  - 문제: commit 3에서 FeedContent의 미사용 import를 제거하자 `REVEAL_STEP`(미사용)·`REVEAL_STEP_CONTENT`(내부 전용 export)가 knip에 +2로 표면화됐다. develop 기준이면 옛 FeedContent가 `REVEAL_STEP`을 import해 reveal.ts를 고치면 빌드가 깨져, 처음엔 후속으로 미뤘다.
  - 해결: B(차단·reveal)를 별도 PR이 아니라 PR A 브랜치에 묶기로 했다(사용자 제안). 이 브랜치엔 정리된 FeedContent가 이미 있어 `REVEAL_STEP` 삭제·`REVEAL_STEP_CONTENT` un-export가 안전하다. 같은 패턴인 `SPECIAL_PAGES` over-export도 함께 정리했다.
  - 결과: knip이 baseline으로 완전 복귀(신규 0). reveal.ts 후속이 해소됐다.

## ADR 판단

- **ADR needed**: no — UI 링크 제거·repoint·미완성 스텁 라우트 삭제와 그에 딸린 config 정리(navigation·hero.config·reveal.ts)다. ADR 트리거 파일(apis/services/actions/lib/supabase, next.config 등)을 건드리지 않고, 인증 시스템·미들웨어·라우팅 정책이 그대로다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS (Codex 계획 검증 생략 — D1, Claude 자체 판단으로 plan 통과)
- **현재 판단**: UI 링크 제거·repoint·미완성 스텁 삭제라 답이 명확하고 회귀 위험이 낮다. 새 추상화·라이브러리·데이터 흐름 변경이 없고 git으로 즉시 복구된다. hide-unbuilt-menus와 같은 성격이라 Codex 계획 검증을 생략하고 Claude가 plan을 직접 판단했다.
- **다음 행동**: 구현 diff를 보고 CODEX_FIRST_PASS 여부를 판단했다(commit 4에서 시도 → 환경 실패 → Claude 직접 검증).

## Codex 1차 검증

- **결론**: PASS — commit 1-3은 생략(D1). commit 4는 Codex 1차 검증을 시도했으나 Windows 샌드박스 실행 실패로, Claude가 직접 검증해 통과했다.
- **현재 판단**: commit 4(스텁 13개 삭제 + navigation·hero.config·reveal.ts 정리)는 라우팅 config 로직이 바뀌어 Codex 1차 검증을 요청했다. 그러나 Codex CLI가 이 Windows 환경에서 파일 접근 단계부터 실패했다(`windows sandbox: spawn setup` 오류 — 환경 문제이지 BLOCK이 아니다). Claude가 직접 확인했다: eslint·build 통과, `REVEAL_STEP`·`SPECIAL_HERO_META` grep 0건. hero.config 특수 블록이 사장된 근거는, 검색·알림이 유일한 (content) `SPECIAL_PAGES` 항목이고 mypage·login·sign-up은 app-root라 resolveHeroMeta가 호출되지 않기 때문이다.
- **다음 행동**: 머지 전 harness-gate에서 재확인. Codex 환경 복구되면 재요청 가능.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: 필수 검증(ESLint·stylelint·build) 통과. 스텁 13개 삭제 + navigation·hero.config·reveal.ts 정리까지 재검증했다(run 20260617-160558). 첫 빌드는 실패했다 — 이전 dev 서버가 남긴 `.next/dev/types`가 삭제된 라우트(`community/groups/[id]`)를 참조했다. `.next`를 비우고 다시 빌드하니 통과했고, 코드 문제가 아니었다. Knip은 baseline(run 20260617-140046)과 완전 동일하다 — reveal.ts와 `SPECIAL_PAGES` over-export까지 정리해 신규 0이다.
- **다음 행동**: 사용자 승인 후 commit 4·5 커밋.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 최종 | 20260617-160558 | ✅ | ✅ | ✅ | 0 | 스텁 13개 삭제·config 정리 포함 · knip baseline 완전 복귀 · stale .next 1회 정리 |

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

- reveal.ts 죽은 export 정리는 commit 5로 **이번 PR에서 완료**했다(D7). B를 PR A에 묶어 안전해진 덕이다.
- 이번 PR 범위 밖 후속은 실서비스 MVP 로드맵에서 추적한다 — 은혜 나눔 실데이터(커뮤니티 출시 시), `DesktopHeader.tsx:21` `queueMicrotask` 제거.

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

