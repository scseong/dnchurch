# not-found-page

- **상태**: ✅ 완료 (2026-06-10)
- **시작일**: 2026-06-10
- **브랜치**: feat/not-found-page
- **Open questions**: none
- **ADR needed**: no

## 목표

Claude Design의 `404 (사진 슬롯)` 디자인을 루트 `not-found.tsx`로 구현한다. 끝나면:

- 매칭되지 않는 모든 URL에 다크 풀블리드 404가 뜬다 — 교회 사진 배경 + "길과 빛"(시편 119:105) 톤, 홈·이전 페이지·빠른 링크로 길을 안내한다.
- 지금 영문 기본 404(또는 `news/notices`의 `<div>not-found</div>` 스텁)가 보이던 자리가 한국어 페이지로 바뀐다.

## 검증된 Assumptions

- 루트 `layout.tsx`는 `{children}`만 렌더하고 Header/Footer가 없다 — `Read(src/app/layout.tsx:42-64)`. 그래서 루트 404는 화면 전체를 덮는 풀블리드(full-bleed) 페이지가 된다.
- 세리프 폰트 보유: `$font-family-secondary = var(--font-notoserifKR)` (Noto Serif KR), `next/font/google`로 로드, 용도가 "교회 로고타입·이름·성경 인용구" — `Read(_typography.scss:5-9, layout.tsx:35-40)`.
- 금색 토큰 정확 일치: `$gold-600 #c4924a = 디자인 --gold-600`, `$gold-400 #d9a96a = --gold-400` — `grep(_color.scss:29-31)`. 시맨틱: `$accent`/`$accent-hover`.
- 다크 표면 텍스트 토큰: `$txt-inverse`(white)·`$txt-on-dark-nav-muted #9ba2ae`·`$txt-on-dark-nav-faint #6b7280` — `grep(_color.scss:64,74,75)`. 디자인의 크림색 다단계 투명도 대응.
- Cloudinary 배경 이미지 `not-found`는 클라우드 **루트**에 있다(`.../image/upload/.../not-found`, 사용자 제공). 그런데 `NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER`가 dev·prod 모두 설정됨 — `grep(.env:9)`. 로더 `normalizePublicId`가 prefix를 붙이므로(`Read(utils/cloudinary.ts:8-13,91-108)`) bare public_id로는 경로가 어긋난다. 로더는 `^https?://` src를 그대로 통과시킨다(line 97).
- `news/bulletins/not-found.tsx`는 한국어·스타일·버튼을 갖춘 in-content 404, `news/notices/not-found.tsx`는 `<div>not-found</div>` 스텁 — `Read` 두 파일.

## Success Criteria

- 임의의 없는 URL(`/zzz`)에서 다크 404가 뜬다: 브랜드 마크+이름, `Error 404` eyebrow, 세리프 제목 "페이지를 찾을 수 없습니다", 안내문, `홈으로 돌아가기`(→`/`) 골드 버튼, `이전 페이지` 버튼, 빠른 링크 4개(실제 라우트), 시편 119:105 인용구.
- 배경: Cloudinary `not-found` 사진이 로드되고 흑백+듀오톤 틴트가 적용된다. 사진 로드 실패 시 SVG "길과 빛" 일러스트가 보인다.
- 404에 `robots: noindex` 메타가 붙는다.
- `/news/notices/<없는경로>`가 영문 스텁이 아니라 한국어 in-content 404를 띄운다(목록으로 가기 버튼 포함).
- 모바일 퍼스트 반응형. `.module.scss`에 색·간격·폰트 하드코딩 0(SVG 일러스트 fill은 art라 예외). `yarn build`·`yarn lint`·`yarn lint:styles` 통과, knip 신규 0.

## Non-goals

- `news/bulletins/not-found.tsx` 손대지 않음(이미 정상 — 외과적 변경 원칙). 단 notices를 그 톤에 맞춤.
- `(content)/not-found.tsx`(라우트 그룹 공용 in-content 404) 신설 — 이번 디자인은 화면 전체를 덮는 방식이라 불필요.
- 설교/시리즈 상세의 `notFound()` 동작 변경 — 그대로 루트 404로 떨어진다.
- Cloudinary 듀오톤을 서버 변환(e_grayscale 등)으로 굽기 — 디자인대로 CSS filter로 처리.

## 접근법

레이어를 디자인 그대로 z-index로 쌓되, 디자인 툴 전용 요소(`<image-slot>`·힌트 칩·`data-filled` 토글)는 뺀다. 사진은 항상 고정이므로 틴트는 상시 적용, SVG는 로드 실패 폴백.

- z0 SVG 일러스트(`aria-hidden`, 인라인) → z1 `next/image fill` Cloudinary 사진 → z2 듀오톤 틴트 2겹 → z3 스크림 그라데이션 → z4 콘텐츠.
- 색·간격·폰트는 토큰. 디자인 hex는 토큰으로 치환(D2). SVG fill만 인라인 art.

## 영향받는 파일

- `src/app/not-found.tsx` (신규 — Server Component, `export const metadata` + 레이어/콘텐츠)
- `src/app/_component/NotFoundBackground.tsx` (신규 — `'use client'`, 배경 이미지 + 전용 loader. RSC는 `next/image`에 loader 함수 prop을 못 넘김)
- `src/app/_component/NotFoundBackButton.tsx` (신규 — `'use client'`, 이전 페이지 버튼만 분리)
- `src/app/not-found.module.scss` (신규)
- `src/app/(content)/news/notices/not-found.tsx` (수정 — 스텁 → 한국어 in-content 404)
- `src/app/(content)/news/notices/not-found.module.scss` (신규 — bulletins 패턴 따름)

## 단계별 체크리스트

- [x] 1. `not-found.module.scss` — 레이어 z0~z4, 토큰 매핑(semantic 우선), 모바일 퍼스트(`respond-up`). 디자인 `max-width:760px`를 모바일 기본값으로 뒤집음
- [x] 2. `NotFoundBackButton.tsx` (client) — `history.length>1 ? router.back() : router.push('/')` (D3)
- [x] 3. `not-found.tsx` (server) — 인라인 SVG + 콘텐츠 + `<NotFoundBackground/>`(인라인 loader가 `w_${width}` 반영, `sizes="100vw"`) + `<NotFoundBackButton/>`. 빠른 링크 실제 라우트. `clsx` 2+ className. `metadata.robots.index=false`. (배경 이미지 loader는 RSC에서 함수 prop 전달 불가라 `NotFoundBackground.tsx` client로 추가 분리)
- [x] 4. `news/notices/not-found.tsx` + `.module.scss` — 한국어 메시지 + "공지사항 목록으로"(`/news/notices`). snake_case className
- [x] 5. `node scripts/verify-task.mjs not-found-page` (run-id 20260610-164314 통과) + 런타임 확인

## Verification

- `node scripts/verify-task.mjs not-found-page`
- 수동: dev에서 `/zzz`·`/news/notices/zzz` 접속 → 다크 404·한국어 in-content 404 확인. 배경 사진 로드·SVG 폴백·robots noindex 메타 확인

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (high) — 심각도 큰 지적 3건을 계획에 반영해 해소(D1·D2·D3).
- **현재 판단**: WORK 진입 가능.
- **다음 행동**: 구현 diff로 1차 검증.

조치 요약:

- A (심각): `'use client'`와 `export const metadata` 동시 선언은 App Router 빌드 오류다. `metadata`는 Server Component에서만 export된다 → D2.
- B (심각): 고정 `w_1920` URL을 next/image 커스텀 로더가 그대로 반환하면 srcset 후보가 전부 같은 URL이 돼 뷰포트별 크기 조정이 깨진다. 로더가 `width`를 URL에 반영하고 `sizes="100vw"`를 명시하라 → D1.
- C (심각): `history.back()`은 직접 유입 404에서 아무 동작도 안 하거나 외부 사이트로 나간다. `history.length>1`이면 뒤로, 아니면 홈으로 → D3. (디자인 원본 HTML도 같은 동작.)
- 표현: `fill` 부모는 `position:relative`+실제 높이, 장식 레이어는 `absolute inset-0`, 콘텐츠는 positioned + z-index. 디자인 CSS가 이미 충족(`.frame` relative z4, 레이어 fixed inset:0).

## Codex 1차 검증

- **결론**: PASS (high) — 동작 오류 없음. 2차 확인 권고 2건 반영.
- **현재 판단**: 커밋 가능.
- **다음 행동**: Claude 2차에 권고 반영 결과 기록.

조치 요약:

- 서버/클라이언트 분리·인라인 이미지 로더·뒤로 가기 버튼 대체 동작 모두 정상으로 확인(빌드·런타임 근거 인용).
- 권고 1: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`이 비면 배경 URL이 `res.cloudinary.com/undefined/...`가 된다 → 2차에서 env 존재 확인.
- 권고 2: 사진 위 흐린 텍스트의 명도 대비(WCAG 4.5:1)를 한 번 더 확인 → 2차에서 스크림 강도로 판단.
- notices not-found가 지금 동작하지 않는(휴면) 상태는 올바른 범위 판단으로 동의(억지로 연결하면 외과적 변경 원칙을 어긴다).

## Claude 2차 검증

- **최종 판단**: PASS — 신규 회귀 0, 커밋 가능.
- **현재 판단**: 정적 검증 4종과 prod 런타임 확인을 충족했고, Codex 1차 권고 2건을 아래대로 확인했다.
- **다음 행동**: 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip 신규 | 런타임 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260610-164314 | ✅ | ✅ | ✅ | 0 | 아래 |

prod 빌드 런타임 확인 (`yarn start`, curl):

- `/zzz` → HTTP 404. `<title>페이지를 찾을 수 없습니다 | 대구동남교회</title>`, `<meta name="robots" content="noindex">`. 본문에 `Error 404`·세리프 제목·`홈으로 돌아가기`·`이전 페이지`·시편 119:105·브랜드 영문명 모두 존재.
- 빠른 링크 4개가 `/about`·`/about/location`·`/about/serving-people`·`/about/worship`로 나간다.
- 배경 Cloudinary URL이 `res.cloudinary.com/dn-church/image/upload/f_auto,q_auto,c_fill,g_auto,w_640/not-found`처럼 뷰포트별 width를 반영한다(srcset에 w_640·w_750…). 클라우드 이름은 `dn-church`다. public_id는 루트의 `not-found`라서 ROOT_FOLDER 접두사가 붙지 않았다.
- notices not-found는 `news/notices/page.tsx`가 잘못된 쿼리에 `notFound()`를 호출할 때 뜬다 — 실측: `/news/notices?page=abc` → HTTP 404 + "공지사항을 찾을 수 없습니다"가 화면에 렌더된다. 다만 `news/notices/[id]`는 미구현 스텁(`<div>page</div>`)이라 없는 공지 id로는 404가 안 난다(별도 문제, tech-debt 등록).
- 브라우저(Chrome) 시각 확인: 데스크톱(1440)은 사진 배경에 좌측 가로 스크림 위 텍스트, 모바일(625)은 세로 스크림에 풀폭 골드 버튼·푸터 스택으로 전환된다. 사진이 흑백 듀오톤(네이비/골드)으로 정규화돼 로드되고, 브랜드 마크·세리프 제목·시편 인용구가 디자인대로 보인다.

Codex 1차 권고 확인:

- env: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`은 `.env`·`.env.local`에 존재(둘 다 `dn-church`로 끝남, grep 확인). 프로젝트 전역(`utils/cloudinary.ts`)이 이미 의존하는 필수 env라 별도 가드는 추가하지 않았다.
- 대비: 모바일 스크림이 navy 0.7→0.96 그라데이션이라 텍스트가 사실상 단색 navy 위에 놓인다. `$txt-on-dark-nav-muted`(#9ba2ae)와 `$txt-inverse`(white)는 navy(#1c2b3a) 위에서 4.5:1을 넘는다. 사진 위 골드 인용구는 장식 텍스트라 본문 가독성과 무관하다.

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

## 의사결정 로그

- **D1 — Cloudinary 배경은 인라인 width-반영 로더로 full URL을 만든다**
  - 문제: 이미지 `not-found`는 클라우드 루트에 있는데, 프로젝트 공용 로더(`createCloudinaryLoader`)는 bare public_id에 `ROOT_FOLDER` prefix를 붙인다. 그대로 `src="not-found"`를 넘기면 `<ROOT>/not-found`로 합성돼 경로가 어긋난다.
  - 해결: `next/image`에 인라인 loader를 줘서 `https://res.cloudinary.com/${env CLOUD_NAME}/image/upload/f_auto,q_${quality},c_fill,g_auto,w_${width}/not-found`를 만든다. `width`를 URL에 반영하므로 Codex가 지적한 srcset 단일화 문제가 없고, `sizes="100vw"`를 명시한다. 공용 로더의 http passthrough(고정 URL)는 responsive를 깨므로 택하지 않았다.
  - 결과: ROOT_FOLDER와 무관하게 루트 public_id를 쓰고, 뷰포트별 크기로 받는다. 흑백·듀오톤은 디자인대로 CSS filter+틴트로 처리(서버 변환 안 함).

- **D2 — not-found.tsx는 Server Component, 이전 페이지 버튼만 client로 분리**
  - 문제: 이전 페이지 버튼은 `history.back()`이 필요해 client여야 하는데, 같은 파일에 `export const metadata`(robots noindex)를 두면 App Router가 빌드 오류를 낸다(`metadata`는 Server Component 전용).
  - 해결: `not-found.tsx`를 server로 두고 metadata를 export한다. 버튼만 `_component/NotFoundBackButton.tsx`(`'use client'`)로 뺀다. 404는 이미 HTTP 404를 반환하므로 noindex는 보조 신호지만 디자인 명세(`<meta robots noindex>`)를 지킨다.
  - 결과: 빌드 경계 충돌 없이 metadata와 인터랙션을 둘 다 살린다. 새 추상화는 client 버튼 1개로 최소.

- **D3 — 이전 페이지는 history가 있을 때만 back, 없으면 홈**
  - 문제: 직접 유입(북마크·외부 링크)으로 404에 오면 `history.back()`이 아무 동작도 안 하거나 외부 사이트로 되돌아간다.
  - 해결: `history.length>1 ? history.back() : router.push('/')`. 디자인 원본 HTML도 같은 분기(`if(history.length>1)... else location.href='index.html'`)를 썼다.
  - 결과: 어느 경로로 와도 버튼이 예측 가능하게 동작한다(최소 홈 복귀 보장).

- **D4 — 디자인의 짙은 네이비(#16222e)는 토큰이 없어 `$navy-950`(#1c2b3a)로 대체**
  - 문제: 디자인은 `--navy-950:#16222e`를 배경·스크림·틴트에 쓰는데 프로젝트 토큰에 그 값이 없다. 하드코딩은 금지(CLAUDE.md).
  - 해결: 가장 가까운 `$navy-950`(#1c2b3a)로 매핑한다. 미세한 색 차이를 받아들이고 토큰 추가는 하지 않는다(토큰 단순화 선호). 단 인라인 SVG 일러스트의 gradient fill은 art라 디자인 hex를 그대로 둔다(.scss 아님 → stylelint 무관).
  - 결과: `.module.scss`는 토큰만 쓰고, 일러스트는 디자인 색을 보존한다.

## 후속 작업

- 라우트별 전용 404가 없어 세 곳이 루트 일반 404로 떨어지거나 아예 안 걸린다.
  - 설교: 없는 설교가 루트 404로 떨어진다(설교 전용 메시지 없음).
  - admin: `notFound()`가 교회 다크 404로 떨어진다(셸 톤 불일치).
  - 공지 상세: `news/notices/[id]` 스텁이라 없는 id로 404가 안 난다.
  - 이유: 이번 작업은 루트 404와 notices 스텁 정리까지가 범위. 라우트별 맞춤 404와 미구현 상세 라우트는 별도 작업이다.
  - 다음 기준: 설교/admin 영역 404를 다듬거나 notices 상세를 구현할 때.
  - 기록 위치: `docs/tech-debt/active.md` "라우트·영역별 not-found 미세분화 부족"에 등록함.
- 폴백 SVG 일러스트는 정적이다(디자인의 별 반짝임·빛 번짐(glow) 애니메이션 제외).
  - 이유: 배경 사진이 항상 있어 SVG는 로드 실패 시에만 잠깐 보인다. 거의 안 보이는 화면에 애니메이션 코드를 들이지 않았다.
  - 다음 기준: 사진을 떼고 SVG를 기본 배경으로 바꿀 때.
  - 기록 위치: 없음.

## 회고

- **잘된 것**: 디자인 파일을 곧이곧대로 옮기지 않고, 디자인 툴 전용 요소(`<image-slot>`·힌트 칩·`data-filled`)는 빼고 프로덕션에 맞는 레이어로 다시 짰다. Codex 계획 검증이 `'use client'`+`metadata` 빌드 오류(D2)와 고정 URL의 반응형 깨짐(D1)을 구현 전에 잡아 손 되돌리는 일을 줄였다. 브라우저로 데스크톱·모바일을 직접 띄워 curl로는 못 보던 요소 쌓임, 색 대비, 반응형 전환 세 가지를 직접 확인했다.
- **다음에 할 것**: `notFound()` 호출처를 먼저 전수 스캔(`grep -rln "notFound()" src/app`)했으면 "없는 설교가 루트로 떨어진다"는 커버리지 지형을 plan 단계에서 알 수 있었다. 다음 404·라우트 작업은 호출처 맵을 먼저 그린다. prod 서버 검증은 포트 3000의 잔존 서버(다른 빌드)를 매번 먼저 죽이고 띄운다 — stale 서버가 옛 빌드를 보여줘 한 번 오판할 뻔했다.
- **발견된 부채**: 라우트별로 not-found를 나누지 못한 부분(설교 전용·admin·notices 상세)을 `docs/tech-debt/active.md`에 등록했다. 봇 리뷰(Gemini G1)가 짚은 공통 환경변수(env) 검증도 다음 작업 후보다.

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

