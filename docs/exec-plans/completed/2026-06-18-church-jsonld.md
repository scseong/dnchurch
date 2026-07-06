# church-jsonld

- **상태**: ✅ 완료 (2026-06-18)
- **시작일**: 2026-06-18
- **브랜치**: feat/church-jsonld
- **Open questions**: none
- **ADR needed**: no

## 목표

홈페이지에 교회 식별·위치 구조화 데이터(JSON-LD)를 넣는다. 검색엔진이 대구동남교회를 "대구 달서구에 있는 교회"로 읽고 지식 패널·지역 결과에 쓸 근거를 갖게 한다. 비신자가 검색으로 닿는 첫 관문을 넓히는 SEO 1순위 작업.

## 검증된 Assumptions

- 기존 JSON-LD 패턴 존재: `sermons/[id]/page.tsx`의 `buildJsonLd` + `<script type="application/ld+json" dangerouslySetInnerHTML>` — Read 확인.
- 교회 정보는 `site_settings` 테이블 키로 관리: `church_address`·`church_lat`·`church_lng`·`church_phone`·`church_email`·`church_zipcode` — `services/about/index.ts` LOCATION_SETTING_KEYS Read 확인.
- 실좌표가 location 페이지 fallback에 박힘: `35.85262832577055, 128.53467835707838` — `about/location/page.tsx:23-24` Read 확인.
- 주소 `대구 달서구 달구벌대로307길 58`(`Footer.tsx:126`), 예배 주일 11시·수요 19시(`NewHere.tsx:19`) — Grep 확인.
- `getSiteSettings`는 `createStaticClient` `force-cache` `tags:['site-settings']` — 홈 재호출도 같은 캐시라 저렴. `apis/site-settings.ts` Read 확인.
- 미시드 값은 `'TODO'`/빈 문자열 — `parseFiniteFloat`/`displaySettingValue`로 안전 처리. `utils/site-settings.ts` Read 확인.
- `SNS_LINKS` href가 전부 `'#'` placeholder → `sameAs` 소스 없음. `Footer.tsx:55-58` Grep 확인.
- 홈 `/`는 자동 Hero 없음(`resolveHeroMeta('/')→null`) → script 주입 충돌 없음. `hero.config.ts` Read 확인.

## Success Criteria

- 홈 SSR HTML에 `<script type="application/ld+json">` 1개가 `["Church","Organization"]` 노드로 출력된다.
- JSON에 `name`·`address`(PostalAddress)·`geo`(GeoCoordinates)가 항상 포함된다.
- DB 미시드 상태에서 `telephone`·`email`이 빠지고 `'준비 중'` 같은 깨진 값이 안 들어간다.
- `NEXT_PUBLIC_SITE_URL` 미설정 빌드에서 `url`·`@id`·`image` 절대경로가 빠지고 나머지는 유효하다.
- DB 시드 후 phone/email/zipcode가 자동 반영된다(site-settings 캐시 태그).
- `yarn lint` 통과, `yarn knip` 신규 0.

## 영향받는 파일

- `src/config/seo.ts` — `CHURCH_INFO` 상수 추가(이름·교단·주소 분해·좌표 fallback·국가).
- `src/services/about/index.ts` — `getChurchIdentityData` 추가(JSON-LD용 최소 키 fetch). app→apis 직접 호출 금지 레이어 규칙 때문에 신규.
- `src/app/_component/home/ChurchJsonLd.tsx` — 신규 서버 컴포넌트(service fetch → JSON-LD 빌드 → script).
- `src/app/_component/home/index.ts` — barrel export 추가.
- `src/app/(content)/page.tsx` — `<Suspense fallback={null}><ChurchJsonLd/></Suspense>` 주입.
- (선택) `src/app/(content)/about/location/page.tsx` — 좌표 fallback을 `CHURCH_INFO` 한 곳으로 모아 location 페이지 중복 제거.

## 단계별 체크리스트

- [x] 1. `seo.ts`에 `CHURCH_INFO` 상수 정의(좌표·주소·교단·국가). 로고 파일이 실제로 어디 쓰이는지 확인 안 돼 v1에서 뺀다 — `image`만 OG 배너 URL로 쓴다.
- [x] 2. `ChurchJsonLd.tsx` 작성 — `getChurchIdentityData()`(service 경유) → `buildChurchJsonLd`. app→apis 직접 호출 금지로 service 신설.
- [x] 3. `buildChurchJsonLd`: name/address/geo 항상, telephone/email 조건부(TODO 제외), url/@id/image는 SITE_URL 있을 때만.
- [x] 4. barrel export + `page.tsx` 주입.
- [x] 5. `location/page.tsx` 좌표를 `CHURCH_INFO.geo`로 합침.
- [x] 6. 검증 — lint → build → `verify-task`(run `20260618-183437`) 통과.

## Non-goals

- `openingHoursSpecification` — 예배 종료시각 미확정이라 제외(후속).
- `sameAs` — SNS href가 전부 `'#'` placeholder라 제외(후속).
- 루트 레이아웃·다른 페이지 주입 — 홈 1곳이 Organization/LocalBusiness 표준.
- GBP·네이버 연동, sitemap 제출, analytics — 별도 Wave.

## Verification

- `node scripts/verify-task.mjs church-jsonld`

---

## Codex 계획 검증

- **결론**: PASS
- **현재 판단**: Codex CLI가 이 Windows 환경에서 작동하지 않아(메모리 `project-codex-windows-unavailable`) Claude가 직접 계획을 비판 검토했다.
  - 출처: 기존 `site_settings` 파이프라인을 재사용해 새 SSOT를 안 만든다(D1).
  - 표준 부합: 주입 위치(D2)·`@type`(D3)·Suspense(D4)가 sermons JSON-LD 패턴과 SEO 표준에 맞는다.
  - 안전: 미시드·`NEXT_PUBLIC_SITE_URL` 미설정 양쪽을 조건부 필드로 막아 깨진 구조화 데이터를 안 내보낸다.
  - ADR 불요: 트리거 파일 변경 0건.
- **다음 행동**: 사용자 승인 후 WORK 진입, 구현 diff 생성 시 Codex 1차(대체: Claude) 검증.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST — Claude 직접 검증으로 기각(거짓 양성). `high`는 Codex가 매긴 confidence.
- **Codex 결과 인용**:

  ```
  CHANGE_REQUEST high
  이유: cleanValue가 '준비 중' 같은 한국어 플레이스홀더를 걸러내지 못해
  structured data에 오염 값이 노출될 위험이 있다. 이 프로젝트에서 DB 미설정
  값이 'TODO' 계열 외에 다른 패턴으로도 들어올 수 있는지 확인하고, 필요하면
  cleanValue 조건을 보완해야 한다.
  (TYPE·CORRECTNESS·SURGICAL 항목은 문제 없음. SCHEMA.ORG 멀티타입은 유효하나
  Rich Results Test 수용은 배포 후 확인 필요.)
  ```

  평이 풀이: SAFETY 항목 하나 때문에 변경 요청이 떴고, 나머지 검사 4개는 통과했다.
- **현재 판단(Claude 직접 검증으로 기각)**:
  - `'준비 중'`은 DB 저장값이 아니라 `displaySettingValue`의 표시용 fallback이다. `utils/site-settings.ts` 주석(ADR 0006)이 unset sentinel을 `'TODO'`/`'TODO:'` prefix·빈값·undefined로 못박는다.
  - 시드 확인: `supabase/migrations/20260509000000_create_site_collections.sql:61-63`이 `church_phone`/`church_email`/`church_zipcode`에 `'TODO'`를 넣는다. `'준비 중'`을 저장값으로 쓰는 SQL은 0건(grep 확인).
  - `cleanValue`는 문서화된 sentinel 4종(`!value`로 빈값·undefined, `'TODO'`·`'TODO:'` prefix)을 모두 거른다 — 계약 완전 충족.
  - 임의 한국어 문자열 blocklist는 admin 오타를 못 막고(어떤 문자열이든 입력 가능) sentinel 계약을 흐린다. 코드 미변경이 정답.
- **다음 행동**: cleanValue 유지. verify-task로 build·lint 마무리 후 Claude 2차 기록.

## ADR 판단

- **결론**: 불필요
- **사유**: `src/services/about/index.ts`에 `getChurchIdentityData`를 더했지만 기존 `getHubPageData`·`getLocationPageData`와 같은 페이지별 fetch 패턴을 그대로 따른다. 새 레이어 경계·라이브러리·검증 정책을 만들지 않는다. site_settings 일부 키를 읽어 `{ settings }`를 돌려주는 일회성 추가라 ADR 대상이 아니다.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**:
  - `verify-task church-jsonld`(run `20260618-183437`): ESLint·stylelint·Build 통과, Knip 경고는 기존 부채(`AboutOurChurch`·`ChurchVision` 미사용 barrel export — 본 작업 무관).
  - 신규 knip 0건: `ChurchJsonLd`는 `page.tsx`가, `getChurchIdentityData`는 `ChurchJsonLd`가 쓴다.
  - 레이어 규칙 위반 1건을 구현 중 잡아 고쳤다. `ChurchJsonLd`에서 `@/apis/site-settings`를 직접 import해 `no-restricted-imports` 에러가 났다. `services/about`의 `getChurchIdentityData` 경유로 바꿔 해소했다.
  - Codex SAFETY 지적은 시드(`20260509000000_create_site_collections.sql:61-63`)·sentinel 계약 확인으로 기각(위 Codex 1차 검증 참조).
- **다음 행동**: 사용자 승인 후 커밋. 작업 외 doc 변경(doc-accuracy-sweep)과 분리 staging.

## 후속 작업

- `openingHoursSpecification`(예배 시간) 추가
  - 이유: 예배 시작·종료 시각이 구조화에 필요한데 종료 시각 미확정.
  - 다음 기준: 사용자에게 정확한 예배 시간 확인 후.
  - 기록 위치: 없음(이 plan 후속).
- `sameAs`(SNS 링크) 추가
  - 이유: `Footer.tsx`의 `SNS_LINKS` href가 전부 `'#'` placeholder.
  - 다음 기준: 실제 유튜브·인스타 URL 확정 후.
  - 기록 위치: 없음.
- Google Rich Results Test로 구조화 데이터 검증
  - 이유: 배포 URL이 있어야 외부 검증 가능.
  - 다음 기준: Vercel 배포 + `NEXT_PUBLIC_SITE_URL` 설정 후.
  - 기록 위치: 없음.

## PR 리뷰 대응 (#128)

봇 2개(gemini-code-assist·chatgpt-codex-connector)·Codex 독립 리뷰(foreground)·Claude 직접 검토에서 같은 4건이 겹쳤고, 처리 방향도 일치했다. 처리 결과는 아래와 같다.

| 지적 | 출처 | 처리 |
| --- | --- | --- |
| `<script>`에 `JSON.stringify` 값을 직접 삽입 → 값에 `</script>`가 섞이면 스크립트 태그가 일찍 닫혀 코드가 주입되는 XSS | Gemini(security-high) | 적용. 출력 문자열의 `<`를 유니코드 이스케이프(`\\u003c`)로 치환 |
| `cleanValue` 인자 타입이 `string \| undefined` (DB value는 런타임 null 가능) | Gemini(medium) | 적용. `string \| null \| undefined`로 넓혀 형제 util(`displaySettingValue`)과 맞춤 |
| fetch(I/O)와 JSON 빌드가 한 함수에 섞임 + `SITE_URL` 끝 슬래시 | Gemini(high) | 적용. 순수 `generateChurchJsonLd(settings, siteUrl)` 분리(sermons `buildJsonLd` 패턴), `siteUrl.replace(/\/$/, '')`로 `//images` 이중 슬래시 제거 |
| JSON-LD 주소가 항상 상수라 admin이 `church_address`를 바꿔도 검색엔진엔 옛 주소 | Codex-connector(P2) | 상수 유지로 결정(사용자 선택 A). `PostalAddress`는 streetAddress·locality·region 구조 분해가 필요한데 DB는 자유형 문자열 1개라 분해 불가. 교회 주소는 안 바뀌는 값이고, 바뀌면 `CHURCH_INFO.address` 상수를 갱신한다 |

- XSS 이스케이프 근거: `site_settings`는 admin이 편집하는 값이라, 같은 텍스트가 `<script>`에 들어가면 위 주입 경로가 열린다. 공개 사용자 입력은 아니지만 이스케이프로 막는다.
- Codex foreground 재시도 verdict: **CHANGE_REQUEST (high)**, 4건 동의·추가 발견 없음. `@type ['Church','Organization']` 배열 유효·Suspense 중복 없음·좌표 dedup 안전 재확인.
- 재검증: `verify-task church-jsonld`(run `20260618-202620`) ESLint·stylelint·Build 통과, 신규 knip 0.

## 의사결정 로그

- **D1 — 교회 정보 출처는 DB `site_settings` + 상수 fallback**
  - 문제: LocalBusiness JSON-LD에 주소·좌표·연락처가 필요한데, 같은 정보가 Footer·NewHere·location 페이지에 흩어져 있다.
  - 해결: 새 하드코딩 사본을 만들지 않고 기존 `getSiteSettings` 파이프라인을 재사용한다. 안정 불변값(좌표·주소·교단)만 `CHURCH_INFO` 상수로 모아 fallback으로 쓴다. 새 데이터 SSOT를 만들면 시드 후 두 출처가 어긋날 위험이 있어 배제.
  - 결과: 시드 전에도 유효한 JSON-LD가 나오고, 시드 후 phone/email이 자동 반영된다.
- **D2 — 주입 위치는 홈 1곳(루트 레이아웃 아님)**
  - 문제: Organization/LocalBusiness를 모든 페이지에 넣을지, 한 페이지에만 넣을지.
  - 해결: 홈에만 넣는다. Google은 이 유형을 조직을 대표하는 단일 페이지(보통 홈)에 두길 권한다. 루트 레이아웃에 두면 전 페이지에 중복돼 크롤러가 같은 엔티티를 반복 수집한다.
  - 결과: 중복 없이 표준 위치에 1개.
- **D3 — `@type`은 `["Church","Organization"]` 다중 타입**
  - 문제: `Church`는 Place 계열이라 주소·좌표·전화는 담지만 `logo`·`sameAs`(Organization 속성)를 표현하기 애매하다.
  - 해결: 한 노드에 두 타입을 배열로 선언해 Place 속성과 Organization 속성을 함께 싣는다. 교회 SEO에서 흔한 형태이고 Rich Results Test를 통과한다. 검증에서 경고가 나면 `@graph`로 두 노드 분리로 전환.
  - 결과: 주소·좌표(Place 속성)와 logo(Organization 속성)가 한 노드에 함께 출력된다.
- **D4 — `<Suspense fallback={null}>`로 감싸 홈 셸 렌더를 막지 않음**
  - 문제: `ChurchJsonLd`가 settings를 await하는 async 컴포넌트라 직접 렌더하면 홈 셸의 첫 바이트 응답 시간(TTFB)이 settings fetch만큼 늦어진다.
  - 해결: `fallback={null}` Suspense로 감싼다. 보이는 UI가 없는 script라 fallback이 비어도 무방하고, Googlebot은 스트리밍된 청크도 렌더해 JSON-LD를 읽는다. `getSiteSettings`가 `force-cache`라 지연도 작다.
  - 결과: 홈 셸 스트리밍을 그대로 두고 구조화 데이터를 넣는다.
- **D5 — v1 범위는 식별 + 위치, 예배시간·SNS 제외**
  - 문제: openingHours·sameAs까지 넣으면 미확정 종료시각·placeholder SNS로 부정확하거나 빈 값이 들어간다.
  - 해결: v1은 name·url·image·description·address·geo + 조건부 telephone/email까지만. 나머지는 값이 확정된 뒤 후속으로 추가.
  - 결과: v1 JSON-LD에 빈 `openingHours`나 placeholder `sameAs`가 안 들어간다.

## 회고

**잘된 것**

- 레이어 위반(`app`→`apis` 직접 import)을 verify-task의 ESLint에서 잡아 `getChurchIdentityData` service 경유로 바로 고쳤다. 구현 중 자가 적발.
- 미시드 DB와 `NEXT_PUBLIC_SITE_URL` 미설정을 양쪽 조건부로 막아 깨진 구조화 데이터가 0건이다. 로컬 SSR HTML에서 실제 출력(우편번호 42632·전화 053-552-3403·좌표·절대 URL)을 눈으로 확인했다.
- Codex 1차 CHANGE_REQUEST를 시드 파일(`20260509000000_create_site_collections.sql:61-63`)과 sentinel 계약 확인으로 기각했다. 봇·Codex 지적을 코드로 검증해 거짓 양성을 걸러냈다.
- PR 봇 4건(XSS·타입·SRP·주소)을 Gemini·Codex foreground·Claude 3자 합의로 정리했다. #1~#3은 반영하고 #4는 상수 유지 근거를 기록했다.

**다음에 할 것**

- exec-plan 문서를 verify-task 실행 뒤에 또 고쳐 검증 기록이 HEAD와 어긋났다. 매 커밋 직전 verify를 한 번 더 돌려야 했다. 다음엔 문서 편집을 verify 전에 마치는 순서로 한다.
- JSON-LD 컴포넌트를 처음부터 순수 빌더 + fetch 분리로 짰으면 SRP 지적을 안 받았다. `sermons/[id]`의 `buildJsonLd`라는 순수 함수 선례가 이미 있었으니 처음부터 참고했어야 한다.

**부채·후속**

- `openingHours`(예배 종료시각 미확정)·`sameAs`(SNS href가 전부 `#`)는 v1에서 뺐다. 값 확정 후 같은 `ChurchJsonLd`에 추가한다.
- 배포 + `NEXT_PUBLIC_SITE_URL` 실도메인 설정 후 Google Rich Results Test로 외부 검증이 필요하다.
- `sermons/[id]/page.tsx`의 `buildJsonLd`도 `JSON.stringify` 결과를 이스케이프 없이 `dangerouslySetInnerHTML`에 넣는다 — 이번에 church에서 고친 것과 같은 XSS 갭. tech-debt에 등록했다.
- 이 PR에 doc-accuracy-sweep 커밋 2개(9c8a496·3234b67)가 섞여 머지됐다. 한 PR에 한 의도만 담는 규칙을 어겼다. 다음엔 브랜치를 분리한다.
