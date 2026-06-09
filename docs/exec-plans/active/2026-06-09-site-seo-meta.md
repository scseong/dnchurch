# site-seo-meta

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-09
- **브랜치**: chore/site-audit-followup
- **Open questions**: none
- **ADR needed**: no — app 레벨 메타·라우트만 추가, apis/services/config 미변경

## 목표

홈/사이트 레벨의 SEO·메타 기반을 마련한다. 종합검토리포트가 P0로 분류한 SEO·모바일 항목을 처리한다. 끝나면:

- robots·sitemap이 생겨 새 설교가 검색에 색인된다.
- 홈 OG(Open Graph 공유 메타)·canonical로 카카오톡 공유 시 미리보기가 제대로 뜬다.
- viewport-fit으로 iPhone 노치 아래 영역까지 화면이 채워진다.

## 검증된 Assumptions

- `NEXT_PUBLIC_SITE_URL`이 base URL SSOT — `auth.ts:62`, `sermons/all/page.tsx:26`, `sermons/[id]/page.tsx:28` 등에서 canonical 조합에 사용 (grep 확인).
- `getOgImageUrl(cloudinary id) → URL | null` 존재 — `utils/cloudinary.ts:61`.
- `robots.ts`·`sitemap.ts` 부재 — `git ls-tree origin/develop -- src/app`에 없음 (news not-found.tsx만).
- OG 공유용 기본 이미지 파일이 아직 없다 — `public/images`에 og-default 없음. 교회 전경 `aboutBanner.jpg` 존재.
- sitemap 데이터원: `getSermons`(페이지네이션)·`getAllSeries` — `services/sermon/index.ts:11,21`.

## Success Criteria

- `/robots.txt` 200 응답 + `Sitemap:` 지시 포함, `/admin`·`/api` disallow.
- `/sitemap.xml` 200 + 홈·설교 상세 URL 포함.
- 홈 HTML에 `og:image`(절대 URL)·`og:url`·`og:locale`·`og:site_name`·`canonical`·`twitter:card=summary_large_image`·meta `description` 존재.
- 홈 `viewport` meta에 `viewport-fit=cover` 포함.
- 홈 `<head>`에 `cdn.jsdelivr.net`·`res.cloudinary.com` preconnect 링크 존재.
- `yarn build`·`yarn lint`·`yarn lint:styles` 통과, knip 신규 0.

## 영향받는 파일

- `src/app/robots.ts` (신규)
- `src/app/sitemap.ts` (신규)
- `src/app/layout.tsx` (수정 — metadata 확장 + viewport export + preconnect)

## Non-goals

- react-icons 정리·`optimizePackageImports` (작업 D)
- 기존 설교/시리즈 페이지의 절대 canonical을 metadataBase 상대경로로 리팩터 (범위 외)
- 전용 1200×630 OG 이미지 신규 제작 (기존 `aboutBanner.jpg` 재사용, 추후 교체)
- sitemap에 공지/주보 포함 (후속)
- `/about` TODO·설립연도 1958↔1952 (작업 C·E)

## 단계별 체크리스트

- [x] 1. `robots.ts` — `userAgent: '*'`, `allow: '/'`, `disallow: ['/admin', '/api']`, `sitemap: <SITE_URL>/sitemap.xml`
- [x] 2. `sitemap.ts` — 정적 라우트(홈·about+하위·sermons·sermons/all·sermons/series·next-gen·community·news/notices·news/gallery) + 동적(설교 상세 `getSermons`, 시리즈 상세 `getAllSeries`). `export const revalidate = 86400`로 ISR — build 시점 고정 방지, 새 설교가 하루 내 반영. 데이터는 기존 `getSermons`(createStaticClient 캐시) 경로 그대로 사용 (별도 client 신설 안 함).
- [x] 3. `layout.tsx` metadata — `metadataBase: SITE_URL ? new URL(SITE_URL) : undefined` (undefined면 Next.js localhost fallback, `new URL(undefined)` throw 방지), top-level `description`, `openGraph{url, locale: 'ko_KR', siteName, images:['/images/aboutBanner.jpg'], type:'website'}`, `twitter{card:'summary_large_image'}`, `alternates.canonical`
- [x] 4. `layout.tsx` `viewport` export — `width:'device-width', initialScale:1, viewportFit:'cover'`
- [x] 5. `layout.tsx` `<head>` preconnect — `cdn.jsdelivr.net`·`res.cloudinary.com`
- [x] 6. `node scripts/verify-task.mjs site-seo-meta` (run-id 20260609-194747 통과) + 런타임 확인

## Verification

- `node scripts/verify-task.mjs site-seo-meta`
- 수동: dev에서 `/robots.txt`·`/sitemap.xml` fetch 200, 홈 메타 태그 DOM 확인 — `og:image`가 `https://...` 절대 URL로 emit되는지(상대 경로가 metadataBase로 해석됐는지) 확인 포함

## 의사결정 로그

- **D1 — 기존 페이지의 절대 canonical은 metadataBase 영향을 받지 않는다**
  - 문제: root `layout.tsx`에 `metadataBase`를 추가하면 `sermons/all/page.tsx`·`sermons/[id]/page.tsx:28`의 기존 canonical이 재해석돼 회귀할 수 있다고 의심했다.
  - 해결: Next.js는 metadata의 절대 URL은 그대로 두고 상대 URL만 `metadataBase`로 해석한다. 기존 페이지는 `${SITE_URL}/...` 절대 문자열이라 영향이 없다. 그래서 "기존 canonical을 상대경로로 리팩터"를 Non-goal로 유지한다.
  - 결과: 기존 설교·시리즈 페이지 canonical은 그대로 두고, 이번 작업은 root layout만 건드린다.

- **D2 — canonical은 홈 페이지에서만 선언한다 (커밋 후 정정)**
  - 문제: root `layout.tsx`에 `alternates.canonical: '/'`를 두니, 자체 canonical이 없는 하위 페이지(about·community·news·next-gen 등)가 전부 canonical=홈으로 상속받아 "홈의 중복 페이지"로 오선언됐다. 전체 라우트를 Lighthouse(SEO)로 측정하니 about·next-gen이 canonical 항목에서 실패로 떴다. 단일 홈 측정의 SEO 100은 홈에선 canonical=홈이 맞아 이 버그를 못 잡았다.
  - 해결: root에서 `alternates.canonical`과 `openGraph.url`을 빼고, 홈 `(content)/page.tsx`에 `alternates.canonical: '/'`만 두었다. 설교 페이지는 이미 자체 canonical을 set하므로 그대로다. 하위 페이지는 canonical을 비워 각자 URL로 자기참조된다(Next.js·구글 기본 동작).
  - 결과: curl 실측 — `/`는 canonical=홈, `/about`·`/next-gen`은 canonical 없음(자기참조), `/sermons/all`은 자체 canonical 유지. D1에서 "root만 건드린다"로 좁게 본 것이 이 버그를 놓친 원인이다. 단일 페이지만 보던 검증을 전체 라우트 측정으로 바꿔 잡아냈다.

- **D3 — 홈에서 openGraph를 부분 선언하지 않는다 (Codex 교차검증이 잡음)**
  - 문제: D2 1차 수정 때 홈에 `openGraph: { url: '/' }`도 같이 넣었다. 그런데 Next.js metadata는 openGraph를 shallow merge한다 — 자식이 openGraph를 부분 선언하면 root의 openGraph(og:image·locale·siteName)를 통째로 대체한다. curl 실측에서 홈의 og:image가 사라졌다(카카오톡 공유 카드 이미지 소실). Codex 인라인 교차검증이 이 위험을 지적했고 실측으로 확인했다.
  - 해결: 홈 metadata에서 openGraph를 빼고 `alternates.canonical`만 남겼다. 홈은 root의 openGraph를 그대로 상속한다.
  - 결과: curl 실측 — 홈에 og:image(aboutBanner.jpg)·og:locale(ko_KR)·og:site_name 복귀. og:url은 홈에서 비웠다(스크레이퍼가 페이지 URL을 쓰므로 허용). canonical은 D2대로 유지.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (high) — material 2건(B·E)을 계획에 반영해 해소.
- **현재 판단**: WORK 진입 가능.
- **다음 행동**: 구현 diff로 1차 검증.

조치 요약:

- B (material): `sitemap.ts`에 캐시·revalidate가 빠져 build 시점에 정적으로 굳으면 새 설교가 sitemap에서 누락된다. 체크리스트 2에 `revalidate = 86400`과 기존 `getSermons` 경로를 명시했다.
- E (material): env가 비면 `new URL(NEXT_PUBLIC_SITE_URL)`가 `TypeError`를 던져 `yarn build`가 실패한다. 체크리스트 3에 `SITE_URL ? new URL(SITE_URL) : undefined` 가드를 넣었다(실제 `.env`·`.env.local`에 값 존재).
- A·C·D (expression):
  - 절대 canonical은 metadataBase로 재해석되지 않는다 → D1에 기록.
  - og:image 절대 URL 확인을 Success Criteria와 Verification에 추가.
  - `viewportFit` casing은 그대로 둔다.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (86%) — 실질 지적 1건(trailing slash)만 반영. 나머지 3건은 오탐 1건·미발생 1건·수용 1건.
- **현재 판단**: VERIFY 재실행 통과 → 커밋 가능.
- **다음 행동**: Claude 2차에 재검증 결과 기록.

조치 요약:

- trailing slash (반영): env 끝에 `/`가 붙으면 `${siteUrl}/sitemap.xml`·`/sermons/1`이 `//` 이중 슬래시가 된다. 실제 env(`http://localhost:3000`·`https://dnchurch.vercel.app`)는 끝 슬래시가 없어 지금은 안 나지만, 실수를 부르는 패턴이라 `robots.ts`·`sitemap.ts`에 `.replace(/\/$/, '')`를 1줄씩 넣었다. 기존 `sermons/all/page.tsx` 등 같은 패턴은 외과적 변경 원칙상 이번 범위 밖이라 보고만 한다.
- Q1 타입 오탐:
  - 우려: `changeFrequency` 리터럴이 `string`으로 넓혀진다.
  - 실제: 각 const에 `: MetadataRoute.Sitemap`를 달아 막았고 `yarn build`도 통과한다.
  - 오해 원인: 인라인 축약본에서 그 주석을 뺐다.
- 빈 문자열 가드: env가 비면 sitemap URL이 상대경로가 된다. `.env`·`.env.local` 양쪽에 커밋돼 항상 존재하므로 안 난다. robots는 이미 falsy 가드가 있다.
- Q3 캐시: `createStaticClient`는 `sermonCache.list()` 태그 캐시 + 발행 시 `revalidateTag`로 갱신되고, route `revalidate=86400`과 함께 동작한다(계획 B에서 수용).

## Claude 2차 검증

- **최종 판단**: 통과 — 신규 회귀 0, 커밋 가능.
- **현재 판단**: 정적 검증 4종(lint·styles·build·knip 신규 0)과 런타임 DOM 확인을 모두 충족했고, Codex 1차의 trailing slash 가드도 교차 확인했다.
- **다음 행동**: 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip 신규 | 런타임 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260609-192024 | ✅ | ✅ | ✅ | 0 | — |
| 2차(가드 추가 후) | 20260609-194747 | ✅ | ✅ | ✅ | 0 | 아래 |

런타임 확인 (localhost:3000, dev):

- `/robots.txt` 200 — `Disallow /admin`·`/api` + `Sitemap: …/sitemap.xml`.
- `/sitemap.xml` 200 — 유효 XML, 홈·설교·시리즈 `<loc>`가 절대 URL이고 이중 슬래시가 없다.
- 홈 `og:image`가 `http://localhost:3000/images/aboutBanner.jpg` 절대 URL로 나온다(metadataBase가 상대 경로를 해석함). `canonical`·`og:url`·`og:locale ko_KR`·`og:site_name`·`twitter summary_large_image`·`description`도 모두 있다.
- 홈 `viewport`가 `width=device-width, initial-scale=1, viewport-fit=cover`로 나온다.
- preconnect는 jsdelivr·cloudinary 두 도메인에 걸린다.

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

- 하위 페이지(about 등)가 자체 `openGraph`를 부분 선언한다. 그러면 root의 og:image가 shallow merge로 사라진다. `/about`은 og:image가 없다(curl 확인). task A 이전부터 있던 문제라 이번 범위 밖.
  - 이유: 페이지별 generateMetadata 정비는 별도 작업(작업 A Non-goal).
  - 다음 기준: 페이지별 공유 카드가 필요할 때(공유 유입 점검 시).
  - 기록 위치: `docs/tech-debt/active.md` 등록 후보.

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

