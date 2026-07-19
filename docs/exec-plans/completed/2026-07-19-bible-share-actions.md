# bible-share-actions

- **상태**: ✅ 완료 (2026-07-19)
- **시작일**: 2026-07-19
- **브랜치**: feat/my-page
- **Open questions**: none
- **ADR needed**: no

## 목표

트래커 기록 공유 시트의 3버튼(카카오톡·이미지 저장·링크 복사)을 "준비 중"에서 실기능으로 바꾼다. **저장소 없이** 공개 공유 페이지 `/share/reading`를 만들어 통계를 URL 파라미터로 받고 `generateMetadata`로 OG(제목·설명=통계, 이미지=교회 배너) + `robots: { index: false }`를 낸다. 이 페이지는 링크 복사·카카오 카드의 목적지다. 카카오톡은 `Kakao.Share.sendDefault`로 제목·통계를 직접 넘겨 공유하고(카드 이미지=교회 배너, 링크=공유 페이지), 링크 복사도 같은 페이지 URL을 복사한다. 이미지 저장은 카드를 PNG로 내려받는다(html-to-image). (당초 카카오는 `sendScrap` 스크랩 방식이었으나 dev 실측에서 빈 카드가 나와 `sendDefault`로 바꿨다 — D4.)

## 검증된 Assumptions

- `Kakao.Share.sendScrap({requestUrl})`가 URL의 OG 태그를 긁어 카드를 구성 — 공식 문서 확인(kakaotalk-share/js-link). 스크랩 대상 도메인은 카카오 콘솔 Web 도메인 등록 필요(외부, 기존 tech-debt).
- `useKakaoShare` 훅이 이미 동작 — 주보 공유 `BulletinShareCard`가 `sendDefault` 실사용. Kakao SDK는 `(content)` 레이아웃의 `KakaoScript`가 로드. 스크랩용 `sendScrap`은 훅에 추가 필요. 확인: Read.
- 이미지 생성 라이브러리 없음 → 카드(DOM)를 PNG로 렌더하려면 신규 의존성 필요. 확인: `grep html2canvas|html-to-image package.json` 0건.
- 앱 OG 이미지 `OG_FALLBACK_IMAGE = '/images/aboutBanner.jpg'`(`src/config/seo.ts`). Kakao imageUrl은 절대경로 필요 → `${NEXT_PUBLIC_SITE_URL}${OG_FALLBACK_IMAGE}`.
- `NEXT_PUBLIC_SITE_URL`은 클라이언트에서 접근 가능(빌드 시 인라인). 확인: 여러 소비처.
- 마이 페이지는 비공개라 마이페이지 URL 공유는 무의미 → 링크 복사·카카오 링크는 앱 URL(`NEXT_PUBLIC_SITE_URL`).
- 구절 폰트 Noto Serif KR은 원격 Google Fonts가 아니라 `next/font/google`로 셀프호스팅(`src/app/layout.tsx:37-43,56`) — CORS 위험 낮음. 확인: Read.
- `NEXT_PUBLIC_SITE_URL`은 dev에서 `http://localhost:3000`(`.env.local:6`) — Kakao는 이 이미지에 접근 못 해 dev는 이미지 실표시 불가(prod는 정상).

## Non-goals

- E-full(카카오 카드에 `next/og`로 만든 비주얼 카드 이미지) — og:image를 나중에 라우트로 바꾸면 되는 업그레이드. 이번엔 og:image를 교회 배너로 두고 통계는 OG 텍스트로.
- B(Cloudinary 업로드) — 사용자가 스토리지 부담을 이유로 스크랩 방식을 택함. 기각.
- 공유 페이지에 개인정보 노출 — 이름 없이 통계 숫자만 URL 파라미터로(민감정보 아님).
- Kakao Developers 콘솔 도메인 등록(외부 설정) — 코드 밖. tech-debt에 이미 있음.
- 공유 카드 시각·기간별 본문 변경(Phase 1에서 완료).

## Success Criteria

- 공개 페이지 `/share/reading?p=week&c=42&s=5`가 **로그아웃 상태에서도** 렌더되고, 통계를 파라미터에서 읽어 "이번 주 42장 읽음 · 5일 함께한 한 주" 같은 문구를 보여준다 (yes/no).
- 그 페이지의 `generateMetadata`가 og:title·description=통계, og:image=교회 배너(absolute)를 낸다 — 페이지 소스에 해당 og 태그가 있다 (yes/no).
- 그 `generateMetadata`가 `robots: { index: false }`를 낸다 — 통계 숫자가 담긴 공유 URL이 검색엔진에 색인되지 않는다 (yes/no).
- 파라미터가 없거나 이상하면(음수·비정수·범위 밖) 페이지가 안전한 기본값으로 렌더되거나 not-found — 크래시하지 않는다 (yes/no).
- 카카오톡 클릭 → `Kakao.Share.sendDefault({content: {title, description, imageUrl, link}})` 호출, dev에서도 제목·통계 텍스트가 카카오 카드에 뜬다(이미지 표시는 prod에서 채워진다) (yes/no).
- 링크 복사 클릭 → **공유 페이지 URL**이 클립보드에 복사되고 완료 토스트가 뜬다 (yes/no).
- 이미지 저장 클릭 → 카드(`.share_card`)가 PNG로 다운로드된다(카드만). `await document.fonts.ready` 후 캡처해 구절이 Noto Serif KR로 찍힌다 (yes/no).
- `verify-task` 신규 회귀 0, knip에 `html-to-image` 미사용 경고 없음 (yes/no).

## 영향받는 파일

- `package.json` — `html-to-image` 추가 (설치 완료)
- `src/app/share/reading/page.tsx` (신규) — 공개 공유 페이지. `(content)` 밖(전역 헤더/푸터 없이 루트 레이아웃). 파라미터로 통계 렌더 + `generateMetadata`로 OG
- `src/hooks/useKakaoShare.tsx` — `sendScrap(requestUrl)` 함수 추가 (기존 sendDefault 유지)
- `src/app/(content)/mypage/_component/tracker/ShareSheet.tsx` — 카드 ref + 3버튼 실동작(이미지 저장=toPng, 카카오=sendScrap(공유URL), 링크 복사=공유URL)
- 공유 페이지 스타일 (신규 module.scss 또는 인라인) — semantic 토큰

## ADR 판단

**ADR needed**: no — `html-to-image`는 단일 목적 클라이언트 유틸(DOM→PNG)일 뿐 레이어·데이터 흐름·인증·캐시 정책을 바꾸지 않는다. package.json 변경이라 ADR_TRIGGER지만 일회성 판단. Codex 계획 검증에서 재확인.

## 위험 / 확인 필요

- html-to-image + 웹폰트: 구절이 Noto Serif KR(`$font-family-secondary`, Google Fonts). toPng이 폰트를 못 임베드하면 fallback serif로 렌더될 수 있음 → 라이브 캡처 결과를 눈으로 확인. 심하면 옵션 조정.
- 카카오 데스크톱 한계(앱 없음)·prod 도메인 등록은 외부 — tech-debt 유지.

## 단계별 체크리스트

- [x] 1. `html-to-image` 설치 (완료, 1.11.13)
- [x] 2. 공개 페이지 `src/app/share/reading/page.tsx` + `share.module.scss` — 파라미터(p·c·s) 파싱·검증, 통계 렌더, `generateMetadata`로 OG(제목·설명=통계, 이미지=교회 배너) + `robots: { index: false }`, 앱 CTA
- [x] 3. 카카오는 기존 `useKakaoShare`의 `share`(sendDefault) 재사용 — 훅 변경 없음(당초 추가한 `shareScrap`은 전환 후 제거)
- [x] 4. ShareSheet — 공유 URL 빌더(period+통계 → `/share/reading?p&c&s`), 카카오=share(sendDefault, 링크=그 URL), 링크 복사=그 URL
- [x] 5. ShareSheet — 이미지 저장 = `await document.fonts.ready` → `toPng(cardRef, pixelRatio 2)` → `<a download>`
- [x] 6. VERIFY + 라이브 대조 — 공유 페이지 로그아웃 렌더·OG·robots(curl), 카카오 sendDefault 텍스트 표시·이미지 저장 PNG(구절 명조체)·링크 복사(사용자 실측 확인)

## 의사결정 로그

- **D1 — 이미지 저장에 html-to-image를 쓴다 (html2canvas 대신)**
  - 문제: 기록 카드는 호스팅된 이미지 파일이 아니라 DOM 요소(그라디언트 배경 + 텍스트)라, 저장하려면 DOM을 이미지로 렌더해야 한다. 리포에 그런 라이브러리가 없다.
  - 해결: `html-to-image`를 쓴다. SVG `foreignObject` 방식이라 번들이 작고, 카드 안에 `<img>`·cross-origin 요소가 없어(그라디언트+텍스트뿐) 이 방식이 잘 맞는다. html2canvas는 더 무겁고 이 단순 카드엔 과하다. 폰트는 `next/font`로 셀프호스팅이라 원격 CORS 걱정이 없다.
  - 결과: 의존성 1개로 카드를 PNG로 저장한다. `document.fonts.ready` 대기로 fallback 폰트 캡처만 막으면 된다.
- **D2 — 카카오·링크는 이미지 호스팅 대신 스크랩(동적 공유 페이지) 방식(E-lite)** ⚠️ 정정: 카카오 스크랩 부분은 폐기 → D4 참조 (`/share/reading` 페이지와 링크 복사는 유지)
  - 문제: 카카오 카드에 동적 기록을 넣으려면 공개 이미지 URL이 필요하다. 매번 Cloudinary에 올리면(B) 사용자가 스토리지·비용을 우려했다.
  - 해결: 공개 페이지 `/share/reading?통계`를 만들고 `Kakao.Share.sendScrap`으로 그 페이지 OG를 긁게 한다. og:image는 교회 배너, 통계는 og 텍스트로. **저장소가 0**이고, 링크 복사도 이 페이지 URL이라 수신자가 기록을 본다. 대안 B(Cloudinary)는 저장 누적, E-full(next/og 비주얼 카드)은 Satori 재구현 부담이 있어 지금은 뺐다.
  - 결과: 카카오·링크가 한 동적 페이지로 통일되고 스토리지가 없다. 비주얼 카드가 필요하면 "이미지 저장"으로, 나중에 og:image만 next/og로 바꾸면 E-full로 업그레이드된다.
- **D3 — 공유 페이지를 검색엔진 색인에서 뺀다 (`robots: { index: false }`)**
  - 문제: `/share/reading?p=week&c=42&s=5`는 통계 숫자를 URL에 담은 공개 동적 페이지다. `src/app/robots.ts`가 `/admin`·`/api`만 막고 `/`를 허용해, 이 페이지가 그대로 색인 대상이 된다. 파라미터 조합마다 얇은 중복 페이지가 검색에 뜬다.
  - 해결: 공유 페이지 `generateMetadata`에서 `robots: { index: false }`를 낸다. 이 페이지는 카카오 스크랩·수신자 확인용이지 검색 유입 콘텐츠가 아니라, 개별 URL 색인이 무의미하고 오히려 얇은 페이지로 SEO에 해롭다. `robots.ts` 전역 규칙 대신 페이지 단위 메타로 좁게 막는다.
  - 결과: 공유 URL은 카카오·수신자에겐 열리되 검색엔진엔 안 뜬다. Codex 계획 재검증(CHANGE_REQUEST) Finding 4 반영.
- **D4 — 카카오를 `sendScrap`에서 `sendDefault`로 바꾼다 (dev 실측 결과)**
  - 문제: D2의 `sendScrap`은 카카오 서버가 `requestUrl`(공유 페이지)에 직접 접속해 OG를 긁는 방식이다. dev의 `NEXT_PUBLIC_SITE_URL`이 `http://localhost:3000`이라 카카오 서버가 내 PC에 닿지 못해, 실측 결과 카드가 빈 채로 떴다. 사용자가 "내용이 표시되지 않는다"고 확인했다.
  - 해결: `sendDefault`로 바꾼다. 제목·통계를 값(payload)으로 카카오에 직접 넘기므로 카드 텍스트가 크롤러 없이 즉시 뜬다 — dev에서도 통계가 보인다. 이미지는 교회 배너(`OG_FALLBACK_IMAGE`) 절대 URL, 링크는 `/share/reading`(수신자가 통계를 볼 페이지)로 둔다. 헤더 공유하기가 이미 `sendDefault`로 동작해 dev에서 검증된 경로다. `/share/reading`은 링크 복사·카드 목적지로 그대로 남긴다. 스크랩은 크롤러·캐시(URL별 스크랩 캐시)에 기대야 해 prod에서도 덜 안정적이라 뺐다.
  - 결과: dev에서 카카오 카드에 통계 텍스트가 바로 뜬다. 훅은 원상 복구(추가했던 `shareScrap` 제거)돼 이번 변경이 `useKakaoShare`를 건드리지 않는다. 이미지의 완전한 표시만 prod 몫으로 남는다(배너 URL이 공개여야 함).

## 위험 / 확인 필요 (추가)

- 공유 페이지는 **로그아웃 공개**라 통계를 URL 파라미터로만 받는다(이름·개인정보 없음). 파라미터는 정수·범위 검증 후 안전 기본값 처리 — 조작된 값에 크래시하지 않게.
- 카카오 카드는 `sendDefault`라 제목·통계 텍스트가 dev에서도 뜬다(D4). 이미지(교회 배너)는 카카오가 URL에서 가져와야 하는데 dev는 localhost라 못 가져와, 이미지 실표시는 prod 몫이다 — dev는 `sendDefault` 호출·payload(제목·통계)·링크 URL 형태까지 확인한다.

## Verification

- `node scripts/verify-task.mjs bible-share-actions`
- `yarn knip` — html-to-image 미사용 경고 없음
- 라이브 `localhost:3000/mypage` 공유 시트 — 이미지 저장(PNG 다운로드)·카카오(호출)·링크 복사(클립보드)

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — Finding 4(noindex) 반영 후 WORK
- **현재 판단**: material 1건(공유 페이지 색인 차단 누락)을 반영했다. 나머지 5건은 expression-only — 레이어·검증 문구를 맞추라는 지적일 뿐, 계획 판단은 그대로다.
- **다음 행동**: D3 반영 완료 → WORK(공유 페이지·sendScrap·ShareSheet 구현)

Codex 지적 요지 + 조치:
- Finding 4 material — `/share/reading?p=week&c=42&s=5`는 통계 숫자를 담은 공개 동적 URL인데 `src/app/robots.ts:6-11`이 `/admin`·`/api`만 막고 `/`를 허용해 색인 대상이 된다. 검색 유입 콘텐츠가 아니라 스크랩·수신자 확인용이라 색인 무의미. → `generateMetadata`에 `robots: { index: false }` 추가(D3). SC·체크리스트 2에 반영.
- expression-only 5건 — (1) 공개 route는 `src/proxy.ts`→`updateSession`이 `/mypage`·`/news/bulletins/create`·`/admin`만 보호해 `/share/*` 통과 확인. (2) 공유 페이지는 `use client` 없으면 Server Component라 DB/action 없이 `apis→services→actions→app` 안 건드림. (3) OG 이미지는 root `metadataBase`(`src/app/layout.tsx:12-15`)로 상대경로 자동 절대화 — 수동 `${SITE_URL}` 대신 기존 helper 패턴 사용 가능. (4) 검증 이력 1줄이 "sendDefault"로 남아 최신 sendScrap 문구와 어긋남 → 문구만 정정. (5) raw HTML 삽입 계획 없음(XSS 무관). 다섯 건 모두 계획 판단을 바꾸지 않아 의사결정 로그와 본 요약에만 남기고 WORK로 넘어간다.

풀이: 색인 차단 1건만 코드에 반영하면 된다(D3). 미들웨어·레이어·metadataBase는 이미 저장소에 갖춰져 있으니 그대로 쓰고, 어긋난 sendScrap 문구 1줄은 아래에서 정정한다.

## Codex 1차 검증

- **결론**: PASS — 버그·레이어 위반·외과적 위반이 0건이다. nit 2건이 남았고, SC 7은 아직 실증하지 못했다.
- **현재 판단**: D1~D3 구현이 SC 1~6을 코드 수준에서 충족. Codex가 직접 수정한 항목 없음(수정 대상 버그 없음).
- **다음 행동**: nit 1 반영 완료 → Claude 2차 검증 + 라이브 PNG 실증(SC 7).

Codex 지적 + 조치:
- Nit 1 (반영) — 공유 페이지 openGraph가 `OPEN_GRAPH_BASE`(`src/config/seo.ts:12-18`)를 안 펼쳐 `og:site_name`·`og:locale`이 빠졌다. 카카오 카드에 출처("대구동남교회")가 안 뜬다. → `...OPEN_GRAPH_BASE`를 펼치고 title·description만 통계로 덮었다(`page.tsx`). curl 재확인: `og:site_name=대구동남교회`·`og:locale=ko_KR`이 붙었고, `og:image` 절대·`robots noindex`는 그대로다.
- Nit 2 (무시) — `window.Kakao: any`(`src/types/global.d.ts:5`)라 `sendScrap` 오타를 tsc가 못 잡는다(`useKakaoShare.tsx:50`). 기존 `sendDefault`도 같은 구조라 이번 회귀는 아니다. 참고용으로만 남긴다.
- 남은 리스크 — (1) SC 7(이미지 저장 PNG 다운로드)은 아직 라이브로 실증하지 못했다. 카드가 BottomSheet 포털 안이라 `toPng`가 클리핑 없이 잡는지, 구절이 Noto Serif KR로 찍히는지 눈으로 확인해야 한다. (2) `NEXT_PUBLIC_SITE_URL`이 비면 `undefined/share/...`가 복사·스크랩된다 — dev·prod 모두 설정된 기존 전제라 새 회귀는 아니다.

풀이: Codex는 버그·레이어·외과 규율에서 차단 사유를 못 찾았다. 출처 라벨 누락 nit 1만 반영했고, 남은 확인은 PNG 실다운로드 한 건이다.

## Claude 2차 검증

- **최종 판단**: PASS — SC 1~7을 모두 충족했다. 정적 검증(eslint·stylelint·tsc 0) + 공유 페이지 curl + 3버튼 사용자 실측이 통과했다. 카카오 카드 이미지 실표시만 prod 몫이다(dev는 localhost라 카카오가 이미지를 못 가져온다 — D4).
- **현재 판단**: dev 서버가 이 워크트리에서 실행 중이라 `yarn build`·`verify-task`는 dev 청크 손상 위험으로 보류했다(memory `feedback_no_build_during_dev`). `.next` 미접근 명령(eslint·stylelint·tsc)으로 대체했다.
- **다음 행동**: 사용자 승인 후 baseline 커밋 → 카카오 카드 이미지를 통계 시각 카드로 만드는 E-full(next/og)은 별도 task로.

| 시점 | 방법 | 결과 |
| --- | --- | --- |
| 2차 | `eslint` (ShareSheet·share page) | ✅ 0 |
| 2차 | `stylelint` (share.module.scss) | ✅ 0 |
| 2차 | `tsc --noEmit` | ✅ 0 |
| 2차 | curl `/share/reading` 로그아웃 | ✅ HTTP 200, 통계·og:title/description/site_name/image(절대)·robots noindex |
| 2차 | curl 파라미터 조작(음수·비정수·XSS·과대) | ✅ 전부 200, 안전 기본값 클램프 |
| 2차 | 사용자 실측 — 카카오 텍스트·이미지 저장 PNG(명조체)·링크 복사 | ✅ 3버튼 정상 |

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
- 저장소 0으로 공유 3버튼을 실기능으로 바꿨다 — 공개 페이지 `/share/reading`가 통계를 URL 파라미터로 받고, 카카오는 `sendDefault`로 제목·통계를 직접 넘긴다. Cloudinary 업로드(B)를 스토리지 부담으로 기각한 사용자 결정을 지켰다.
- dev 실측에서 `sendScrap`이 빈 카드로 뜨는 것을 발견해(카카오 서버가 localhost에 못 닿음) `sendDefault`로 바꿨다(D4). 덕분에 dev에서도 카드 텍스트가 뜨고 훅이 원상 복구됐다. `robots: { index: false }`로 통계 담긴 얇은 중복 URL의 색인을 막았다(D3).

**다음에 할 것**
- 카카오 카드 이미지 실표시는 prod 몫이다 — localhost는 카카오가 이미지를 가져오지 못한다. Kakao Developers 콘솔 도메인 등록도 필요하다(기존 tech-debt).
- 카카오 카드 이미지를 통계 시각 카드로 바꾸는 E-full은 후속 bible-share-og-image plan에서 이어 구현·머지했다.

**발견된 부채**
- `html-to-image`가 `ShareSheet`에 정적 import돼 이미지 저장을 안 쓰는 사용자도 마이페이지 첫 로드 JS로 받는다 — 이번 머지 전 점검에서 tech-debt로 등록(다음 PR에서 동적 import).
- `NEXT_PUBLIC_SITE_URL`에 trailing slash가 있으면 `//share` 이중 슬래시가 된다(Codex nit, 기존 `shareUrl`과 같은 패턴이라 이번 회귀는 아님).

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

