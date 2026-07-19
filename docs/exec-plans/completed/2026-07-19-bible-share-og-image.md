# bible-share-og-image

- **상태**: ✅ 완료 (2026-07-19)
- **시작일**: 2026-07-19
- **브랜치**: feat/my-page
- **Open questions**: none
- **ADR needed**: no

## 목표

카카오 공유 카드 이미지를 교회 배너에서 '통계 시각 카드'로 바꾼다. `/share/reading/image` 라우트가 next/og(`ImageResponse`)로 "42장 읽음"·기간 라벨·구절을 담은 PNG를 즉석 생성하고, ShareSheet의 sendDefault `imageUrl`과 공유 페이지 og:image가 이 라우트를 가리킨다. 저장소는 쓰지 않는다 — 요청 시 생성하고 CDN이 URL 단위로 캐시한다(bible-share-actions Non-goal이던 E-full).

## 검증된 Assumptions

- Next 16.0.10이라 `next/og`의 `ImageResponse`를 쓸 수 있다. 확인: `package.json` next `^16.0.10`.
- 저장소에 next/og·opengraph-image 사용처가 0이다 — 이 라우트가 첫 도입이다. 확인: `grep 'next/og|ImageResponse|opengraph-image'` 0건.
- 로컬 폰트 파일이 없다(.ttf/.otf/.woff 0건). 폰트는 `next/font/google`(Noto_Serif_KR·Gowun_Batang)로 빌드 때 받아 온다. Satori는 폰트 버퍼가 필요하므로 런타임에 폰트를 따로 조달해야 한다. 확인: `find public src -iname '*.ttf'` 0건 + `src/app/layout.tsx:2`.
- 카드 문구는 유한 어휘다 — 숫자 0-9 + 모든 고정 문자열(브랜드·eyebrow·통계 문구·`subLine` 세 출력·구절 전문·시편·따옴표). 한글 글자 집합이 한정돼 있어 서브셋 폰트가 수 KB에 그친다. 서브셋 `text=`는 손으로 나열하지 않고 **코드 상수의 합집합 + `0123456789`**로 만들어 두부(□)를 막는다(Codex material-2). 확인: `page.tsx`의 상수·`subLine`, `ShareSheet.tsx`의 `stat`.
- sendDefault의 `imageUrl`은 카카오가 그 주소에서 직접 가져오는 절대 공개 URL이라야 한다. 라우트 주소는 `${NEXT_PUBLIC_SITE_URL}/share/reading/image?p&c&s`. 확인: `useKakaoShare.tsx`의 sendDefault `content.imageUrl`.

## Non-goals

- 스크랩(sendScrap) 복귀 — 카카오는 sendDefault를 유지한다(bible-share-actions D4).
- 이미지 저장 PNG(html-to-image) 변경 — 이미 동작하니 그대로 둔다.
- 통계 파싱 규칙(상한·문구)의 동작 변경 — page.tsx에서 공유 모듈로 추출해 route와 함께 쓰되, 값·문구는 그대로 둔다(동작 보존 리팩터).
- dev에서 카카오 이미지 실표시 — localhost라 카카오가 이미지를 못 가져온다. prod에서만 보인다(D4와 같은 제약).
- Edge 런타임 — 한글 폰트 버퍼·유연성을 위해 nodejs 런타임을 쓴다.

## Success Criteria

- `GET /share/reading/image?p=week&c=42&s=5`가 `content-type: image/png`·HTTP 200으로 PNG를 반환한다 (yes/no).
- 그 이미지에 통계 숫자("42장 읽음")·기간 라벨·구절이 한글 폰트로 렌더된다 — 깨진 글자(두부 □)가 없다 (yes/no).
- 파라미터 조작(음수·비정수·과대·XSS)에도 라우트가 크래시하지 않고 안전 기본값으로 이미지를 만든다 (yes/no).
- ShareSheet 카카오 `imageUrl`과 `/share/reading`의 og:image가 이 라우트를 가리킨다 (yes/no).
- 응답에 장기 `Cache-Control`이 붙어 같은 URL은 CDN이 캐시한다 (yes/no).
- `verify-task` 신규 회귀 0, knip 미사용 경고 없음 (yes/no).

## 영향받는 파일

- `src/utils/bible-share.ts` (신규 공유 모듈) — 파싱 헬퍼(`parsePeriod`·`parseCount`·`subLine`)·`PERIOD_LABEL`·상한·렌더 상수를 page.tsx에서 옮긴다. page와 route가 함께 import한다(Codex material-1).
- `src/app/share/reading/page.tsx` — 위 헬퍼를 공유 모듈에서 import하도록 리팩터한다(동작 보존). `generateMetadata`의 og:image를 이미지 라우트로 바꾼다 — `...OPEN_GRAPH_BASE` 뒤에 `images`를 덮어쓴다(얕은 병합, Codex 권고 2).
- `src/app/share/reading/image/route.tsx` (신규) — GET 핸들러다. 공유 모듈로 searchParams를 검증한 뒤 `ImageResponse`를 반환한다. `runtime='nodejs'`로 두고 `Cache-Control`을 길게 건다.
- `src/app/share/reading/image/NotoSerifKR-400.ttf`·`NotoSerifKR-700.ttf` (신규, 커밋) — 코드 어휘로 1회 서브셋한 폰트다(각 ~22KB). route가 `readFileSync(new URL('./…', import.meta.url))`로 읽어 Vercel 파일 트레이싱이 번들에 넣는다.

## ADR 판단

**ADR needed**: no — `next/og`는 Next 16 내장이라 새 의존성이 없다. `src/app` 라우트·`src/utils`는 ADR_TRIGGER_PARTS가 아니다. 레이어·인증·캐시 정책은 그대로다(라우트는 URL 파라미터만 읽는다). 폰트 조달 전략은 의사결정 로그(D2)에 남긴다. Codex 계획 검증에서 재확인한다.

## 위험 / 확인 필요

- 폰트 서브셋이 렌더 글자를 다 담아야 한다 — 빠지면 두부(□). 그래서 `text=`를 손 나열이 아니라 코드 상수 합집합으로 만든다(material-2). 서브셋 생성은 구형 UA로 Google Fonts에서 ttf를 받는다(Satori는 woff2 미지원). 이 fetch는 **1회 오프라인 생성**이라 런타임 임계 경로가 아니다(D2) — 런타임엔 커밋된 ttf를 `readFileSync`만 한다.
- Vercel 서버리스가 폰트 파일을 배포 번들에 포함해야 한다 → `new URL('./NotoSerifKR-subset.ttf', import.meta.url)` 상대 읽기로 Next 파일 트레이싱이 잡게 한다(`process.cwd()` 절대 경로는 트레이싱 누락 위험).
- 카카오 feed 이미지 권장 크기(800x400, 최소 200x200)에 맞춘다.
- Noto Serif KR은 OFL 라이선스라 서브셋과 번들, 배포가 모두 허용된다.

## 단계별 체크리스트

- [x] 1. `src/utils/bible-share.ts` 공유 모듈로 `parsePeriod`·`parseCount`·`subLine`·`PERIOD_LABEL`·상한·렌더 상수 추출 + page.tsx 리팩터 — curl로 동작 보존 확인(문구 동일)
- [x] 2. 폰트 서브셋 생성 — 렌더 상수 합집합 + 숫자로 Google Fonts woff2 서브셋을 받아 wawoff2로 ttf 변환, 2 weight(`NotoSerifKR-400.ttf`·`-700.ttf`, 각 ~22KB) 커밋
- [x] 3. `src/app/share/reading/image/route.tsx` — 공유 모듈로 searchParams 검증, `ImageResponse`(브랜드·기간·42·구절), 800x400·`Cache-Control` immutable, `runtime='nodejs'`, `readFileSync(new URL(...))`. Satori div마다 `display:flex` 명시
- [x] 4. ShareSheet 카카오 `imageUrl` → 이미지 라우트(파라미터 공유)
- [x] 5. `page.tsx` og:image → 이미지 라우트 (`...OPEN_GRAPH_BASE` 뒤 `images` override, 800x400)
- [~] 6. VERIFY — eslint·tsc·knip 0, curl 이미지 200·image/png·cache immutable·파라미터 조작 200, dev 이미지 3기간 육안 두부 0. Codex 1차·Claude 2차 진행 중(카카오 실카드는 prod 몫)

## 의사결정 로그

- **D1 — 이미지를 opengraph-image 규칙 대신 Route Handler로 만든다**
  - 문제: 이미지가 통계 파라미터(`?p&c&s`)마다 달라져야 하는데, Next의 `opengraph-image` 규칙은 searchParams를 받지 못한다(라우트당 정적 이미지 전제).
  - 해결: `src/app/share/reading/image/route.tsx` Route Handler로 만들어 GET searchParams를 읽어 `ImageResponse`를 반환한다. sendDefault `imageUrl`과 og:image가 이 주소를 파라미터와 함께 가리킨다.
  - 결과: 통계별 이미지를 URL로 표현하고 CDN 캐시가 URL 단위로 걸린다.
- **D2 — 폰트는 서브셋 ttf를 1회 생성해 번들한다(런타임 fetch 대신)**
  - 문제: 저장소에 폰트 파일이 없고 한글 Noto Serif KR 전체는 수 MB라 그대로 번들하면 부담이다. Satori는 폰트 버퍼가 있어야 한다. 초안은 런타임에 Google Fonts를 받아 왔으나, 그러면 매 이미지 생성이 외부 fetch에 걸려 실패 시 카드 이미지가 통째로 빠진다.
  - 해결: 카드 문구가 한정된 어휘라 코드 상수 합집합 + `0123456789`로 서브셋을 1회 오프라인 생성한다. modern UA로 woff2 서브셋을 받아 wawoff2로 ttf로 바꾼다(Satori는 woff2 미지원). 결과 ttf(수 KB)를 저장소에 커밋하고 route는 `readFileSync(new URL('./NotoSerifKR-400.ttf', import.meta.url))`로만 읽는다. 서브셋은 빌드 파이프라인이 아니라 1회 작업이라 도구가 없다는 게 번들을 뺄 이유가 되지 않는다.
  - 결과: 런타임 외부 fetch 실패 모드를 없앤다. 한정된 어휘라 서브셋이 작아 번들 부담도 낮다.
  - ⚠️ 정정(Codex 계획검증 권고 1): 초안의 런타임 fetch 방식을 폐기하고 이 항목으로 대체했다.
- **D3 — OG 이미지는 Noto Serif KR 한 폰트로만 그린다**
  - 문제: 화면 카드(share_card)는 라벨에 Pretendard(sans), 브랜드·구절에 Noto Serif KR(serif)를 섞는다. 두 폰트를 서브셋·임베드하면 폰트 버퍼가 둘이고 어휘 관리도 둘로 늘어난다.
  - 해결: OG 이미지는 숫자·라벨·구절을 모두 Noto Serif KR로 그린다. 큰 통계 숫자도 serif가 격조 있고, 폰트가 하나면 서브셋·임베드가 단순하다. 화면 카드와 정확히 같은 폰트 조합은 아니지만 OG 이미지는 별도 산출물이라 serif 통일이 자연스럽다.
  - 결과: 서브셋·임베드가 폰트 1개(굵기 400·700 두 버퍼)로 끝난다. Pretendard 숫자가 필요하면 나중에 두 번째 서브셋을 더한다.
- **D4 — 폰트 읽기 실패는 폴백 없이 500으로 요란히 실패시킨다**
  - 문제: 폰트 파일을 못 읽을 때 대응이 둘뿐이다. try/catch로 `fonts:[]` 폴백을 두면 한글이 두부(□)로 조용히 렌더돼 카카오 카드가 깨진 채 배포된다.
  - 해결: 폴백을 두지 않고 fail-loud로 둔다. 파일 트레이싱이 ttf를 놓치면 라우트가 500으로 요란히 실패한다. "일어나면 안 되는 경로"에 두부 폴백을 심지 않는다(단순함 우선).
  - 결과: 폰트 누락이 prod 스모크 테스트에서 즉시 드러난다. 두부 무증상 배포를 막는다(Codex 1차 권고).

## Verification

- `node scripts/verify-task.mjs bible-share-og-image`
- `yarn knip` — 신규 유틸 미사용 경고 없음
- 라이브 `curl -I localhost:3000/share/reading/image?p=week&c=42&s=5` — `image/png`·200, 파라미터 조작 시 크래시 없음

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence medium) — material 2건 반영 후 WORK
- **현재 판단**: 설계 골격(Route Handler·nodejs·캐싱·레이어·ADR 없음)은 유효 판정. material 2건과 권고 2건을 계획에 반영했다.
- **다음 행동**: WORK — 공유 모듈 추출부터.

Codex 지적 + 조치:
- material-1 (반영) — page.tsx의 `parsePeriod`·`parseCount`·`subLine`·`PERIOD_LABEL`·`PERIODS`가 모듈 비공개라 route가 import할 대상이 없다. 복제하면 clamp 상한(9999·366)과 문구가 두 곳으로 갈라져 OG 이미지와 랜딩 페이지에 서로 다른 숫자·문구가 나온다. → `src/utils/bible-share.ts`로 추출, page·route 공유. 영향파일·Non-goals·체크리스트 1 반영.
- material-2 (반영) — Assumptions의 서브셋 어휘 나열이 구절 전문(발·등·길·빛)·subLine 세 출력·시편·따옴표를 빠뜨려 두부(□) 위험. → `text=`를 코드 상수 합집합 + 숫자로 생성. Assumptions·체크리스트 2 반영.
- 권고 1 (반영, D2 정정) — 런타임 Google Fonts fetch가 임계 경로라 실패 시 이미지가 통째로 빠진다. → 서브셋 ttf 1회 생성·커밋·`readFileSync`로 전환. 런타임 네트워크 의존 제거.
- 권고 2 (반영) — og:image는 `...OPEN_GRAPH_BASE`(images 포함)를 얕은 병합하므로 spread 뒤 `images` override라야 배너를 대체한다. 체크리스트 5·영향파일 반영.

풀이: 설계는 통과했고, 파싱 헬퍼 공유와 폰트 서브셋 완전성 두 가지가 사용자에게 보이는 값 어긋남과 두부(□)를 막는 핵심이라 먼저 손봤다. 폰트는 런타임 fetch에서 번들 서브셋으로 바꿔 실패 모드를 없앴다.

## Codex 1차 검증

- **결론**: PASS — material 0건, nit 4건 (confidence high), 직접 수정할 국소 버그 없음.
- **현재 판단**: 레이어·외과적 변경 위반 없음. 설계·구현 견고. 로컬에서 가능한 축은 모두 통과.
- **다음 행동**: nit 1(D2 fail-loud 기록) 반영 완료 → Claude 2차 검증 + prod 스모크 테스트를 후속으로.

Codex 답변 + 조치:
- 파일 트레이싱 — `new URL('./NotoSerifKR-400.ttf', import.meta.url)`이 순수 리터럴이라 `@vercel/nft`가 정적 분석으로 함수 번들에 폰트를 포함한다. 폰트 매직 `00 01 00 00`(유효 ttf) 확인. `process.cwd()` join을 뺀 선택이 맞다. 남는 리스크는 prod 배포 후 이미지 URL 1회 실호출뿐(로컬 불가).
- 모듈 스코프 `readFileSync` — 콜드스타트당 1회, 46KB 동기 읽기라 비용 무시. Vercel next/og 관용 패턴. 문제 없음.
- `Cache-Control immutable` — 이미지가 (p·c·s)+상수·폰트의 순수 함수라 URL 단위 불변, 정확. 상수·폰트를 바꾸면 최대 1년 stale이나 `bible-share.ts:37-38` 주석이 결합을 명시해 감수할 만하다.
- 폰트 읽기 guard — 넣지 말 것을 권고. try/catch·`fonts:[]` 폴백은 두부 무증상 배포를 만들어 500 fail-loud보다 나쁘다. D4에 결정 1줄로 기록했다.
- nit 4 (`ShareSheet.tsx:63` 이중 슬래시) — `NEXT_PUBLIC_SITE_URL` trailing slash 시 `//share`가 되나 바로 위 `shareUrl`과 같은 기존 패턴이라 이번 회귀 아님. 별개 부채로만.

풀이: 로컬에서 가능한 검증은 다 통과했고, 유일한 미검증 축은 prod 이미지 실호출이다. 폰트 실패는 guard 없이 요란히 실패하도록 두는 편이 두부 무증상 배포보다 낫다.

## Claude 2차 검증

- **최종 판단**: PASS — 정적 검증(eslint·tsc·knip 0) + 라이브 이미지 3기간 육안 확인을 통과했다. 카카오 실카드·prod 이미지 실호출만 배포 후 몫이다.
- **현재 판단**: dev 서버가 이 워크트리에서 돌아 `verify-task`(빌드 포함)는 dev 청크 손상 위험으로 보류했다(memory `feedback_no_build_during_dev`). `.next` 미접근 명령으로 대체했다.
- **다음 행동**: 사용자 승인 후 커밋 → prod 배포 시 `GET /share/reading/image?...` 200·카카오 실카드 스모크 테스트.

| 시점 | 방법 | 결과 |
| --- | --- | --- |
| 2차 | `eslint`(util·route·page·ShareSheet) | ✅ 0 |
| 2차 | `tsc --noEmit` | ✅ 0 |
| 2차 | `knip` (내 파일 미사용 export) | ✅ 0 |
| 2차 | curl 이미지 `?p=week&c=42&s=5` | ✅ 200·image/png·76KB·PNG 매직·`Cache-Control immutable` |
| 2차 | 이미지 육안 day·week·month | ✅ 두부 0, 브랜드·통계·구절 명조 렌더 |
| 2차 | curl 파라미터 조작(p=xxx·c 음수·과대·XSS) | ✅ 전부 200·image/png, 크래시 없음 |
| 2차 | 페이지 og:image | ✅ 동적 라우트 절대 URL·800x400 |
| 후속 | prod 이미지 실호출·카카오 실카드 | ⏳ 배포 후 |

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

## 회고

**잘된 것**
- 동적 OG 카드(E-full)를 완성했다 — `/share/reading/image` Route Handler(D1)가 통계 파라미터마다 "42장 읽음"·기간 라벨·구절을 담은 PNG를 즉석 생성하고, CDN이 URL 단위로 캐시한다. Vercel 프리뷰 실배포에서 200·image/png·두부(□) 0을 확인했다.
- 폰트를 런타임 Google Fonts fetch에서 서브셋 ttf 번들로 바꿔(D2) 외부 fetch 실패 모드를 없앴다. 카드 어휘가 한정돼 코드 상수 합집합으로 서브셋을 만들어 두부를 막았다. 파싱 헬퍼를 `bible-share.ts`로 추출해(material-1) page와 route가 같은 상한·문구를 쓰게 했다. 폰트 읽기 실패는 폴백 없이 500으로 곧장 실패하게 해(D4) 두부 무증상 배포를 막았다.

**다음에 할 것**
- prod 배포 후 `GET /share/reading/image?...` 실호출 200과 카카오 실카드 스모크 테스트가 남았다.
- `Cache-Control: immutable`이라 렌더 상수·폰트를 바꾸면 같은 URL이 최대 1년 stale이다 — 상수·폰트 변경 시 URL 무효화(파라미터·경로 변경)를 함께 고려한다.

**발견된 부채**
- OG 이미지 라우트가 로그인 없이 열리고 파라미터를 제한하지 않아 조합마다 새 렌더가 돌 수 있다 — 이번 머지 전 점검에서 tech-debt로 등록(다음 PR에서 버킷팅·rate-limit).

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

