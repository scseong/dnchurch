# sermons-a11y-perf

- **상태**: ✅ 완료 (2026-05-26)
- **시작일**: 2026-05-18
- **브랜치**: feat/sermons-perf
- **Open questions**: none
- **ADR needed**: no — `src/utils/cloudinary.ts`는 ADR_TRIGGER_PARTS 아님. 공유 util이나 `cloudinaryFetchUrl` 소비처가 sermons 7파일뿐이라 비-fetch 이미지 회귀 0. services·config·레이어·정책 불변.

## 목표

sermons 8-4 성능: 7개 영역(초기로딩·번들·이미지·렌더링·네트워크·Core Web Vitals·JS실행)을 SSOT 근거로 감사하고, **측정으로 확인된 결함만** 외과적으로 고친다.

- 8-3 접근성은 #97로 머지 완료(이력은 `## 검증 이력`).
- 채택 해석(사용자가 7영역 전면 점검 요청): "감사 우선 → 결함만 수정". 추측성 최적화·요청 외 리팩터 금지(가드레일 단순함 우선). 정상 영역은 정상으로 기록, 가짜 작업 만들지 않음.
- 새 기능·새 라이브러리 없음(`@next/bundle-analyzer`는 이미 설치·배선).

## 검증된 Assumptions (8-4)

- 모든 설교 카드/히어로가 `src={cloudinaryFetchUrl(getSermonThumbnail(sermon))}` 사용 — `res.cloudinary.com/<cloud>/image/fetch/f_auto,q_auto/<원격 URL>` 고정 문자열. (GridCard·SermonCarouselCard·SeriesCard cover·OtherByPreacher·SeriesEpisodeCard·SermonFeatured·SeriesDetailHero 7파일 grep 확인)
- `createCloudinaryLoader`(`cloudinary.ts:72-85`)는 `if (/^https?:\/\//i.test(src)) return src;`(73행)로 http src를 그대로 반환 → fetch 썸네일에 `w_<width>`·`q_<quality>` 미적용, `srcSet` 단일 URL. `next/image` `sizes`·`deviceSizes` 무력.
- `cloudinaryFetchUrl` 소비처는 sermons 7파일뿐. sermons 밖(about/news 등)은 public_id·`siteAsset`(비-http) src라 loader가 이미 정상 리사이즈. (`git grep -rl cloudinaryFetchUrl -- src` = 8건, 7 sermons + util 정의)
- bundle-analyzer는 `next.config.ts`에 배선됨(`withBundleAnalyzer`, `ANALYZE=true`), `@next/bundle-analyzer ^16.1.6` 설치됨 → 도구 추가 불요, 실행만.
- 페이지네이션 URL 동기화는 #91(Phase 7-1)에서 머지됨. priority는 LCP 후보(`SermonFeatured`·`SeriesDetailHero`)만 — 누수 0.

## Non-goals

- 새 기능 추가, 머지된 #91~#97 재작업, 8-3 접근성 재작업(머지 완료).
- sermons 밖 컴포넌트 수정. loader 분기 수정은 공유 util이나 fetch src 소비처가 sermons뿐이라 실질 sermons 한정.
- ADR_TRIGGER 파일 변경: `next.config.*`·`package.json`·`src/services/`·`scripts/`. 새 라이브러리 도입.
- `cloudinaryFetchUrl` 시그니처·반환 형태 변경. loader 쪽에서만 흡수.
- 추측성 최적화 — 측정으로 결함이 안 보이는 영역에 `memo`/`dynamic()`/캐시 전략을 "혹시 몰라" 넣기. 정상은 정상으로 기록.
- blur placeholder(`blurDataURL`) — LQIP URL 생성 별건. 결함 확인 시 후속 작업.

## Success Criteria (8-4)

영역별 감사 결과를 `## 성능 점검 결과` 표에 **결함/정상/보류 + SSOT 근거(파일:줄·수치)**로 1행씩 기록. 그중:

- **이미지(확정 결함)**: (결정론적·서버 불요) `createCloudinaryLoader()`를 같은 fetch URL로 width 640·1080 두 번 호출 → 출력이 서로 다르고 각각 `image/fetch/f_auto,q_auto,c_limit,w_640/`·`,w_1080/` 포함, encoded 원격 URL이 마지막 세그먼트, `q_`는 세그먼트당 1개. (현재: 두 호출 동일, `w_` 없음 — Codex CR①②)
- 비-Cloudinary 절대 http URL(`https://example.com/a.jpg`)·public_id·`siteAsset` 입력 loader 출력 불변 — 회귀 0.
- **번들/JS**: `ANALYZE=true yarn build` 산출에서 sermons 청크 상위 의존을 표에 기록. 단일 의존 > sermons-route-청크 30% 또는 명백한 미사용 import만 수정 대상, 그 외 "정상".
- **나머지 5영역(초기로딩·SSR/SSG·렌더링·네트워크·CWV)**: 감사 후 결함이면 별 행에 수정안+근거, 정상이면 "정상" + 근거 1줄, 런타임 의존(LCP/INP/CLS)은 "보류 — Vercel preview 실측" + 측정 절차.
- 각 수정은 `cloudinaryFetchUrl` 시그니처·7 소비처 변경 0. verify-task PASS. knip 신규 0.

## 영향받는 파일 (8-4)

확정 수정 1건(이미지 영역):
- `src/utils/cloudinary.ts` `createCloudinaryLoader`(72-85) — http src 무조건 통과(73행) 대신, src가 `https://res.cloudinary.com/<cloud>/image/fetch/<transforms>/<encoded>` 형태면 `<transforms>`를 `f_auto,q_auto,c_limit,w_<width>`로 **치환**해 반환. `cloudinaryFetchUrl`이 구운 `f_auto,q_auto` 유지, `q_<quality>` 미추가(`q_` 중복 방지 — Codex CR①). `c_limit`으로 업스케일 차단. Cloudinary fetch 아닌 절대 http URL은 종전대로 통과.

추가 수정 파일은 **감사 결과 확정 후** 본 섹션에 append(추측 나열 금지). 검증 산출(커밋 X): `ANALYZE=true yarn build` 번들 리포트.

(8-3 접근성 수정 4건은 #97 머지 완료 — `## 검증 이력` 참조)

## 접근성 점검 결과 (체크리스트 1)

정적 감사(16 컴포넌트·5 라우트). 결함 8건 중 4건 수정, 4건 비결함.

- **수정(고)**: NoteEditor textarea 라벨 부재(체크5), NoteEditor `outline:none` focus-visible 부재(체크6).
- **수정(중)**: `/sermons/[id]` 중복 h1 + h3 스킵(체크3) — SermonDetailPage가 유일하게 자체 h1 방출. `news/bulletins/[id]` 등 타 (content) 상세는 Hero h1만 쓰는 게 컨벤션이라 h2로 정합. search_clear 탭타깃 ~32px(체크8).
- **비결함**: 탭 `role="tab"` 부재(체크7) — detail-mockup D4에서 Codex 검증 후 ARIA tablist 의도적 회피(PC 전 패널 노출=disclosure 패턴). main/all/series h1 누락(체크3) — 오탐. `(content)/layout.tsx`의 공유 `Hero`가 h1(`Hero.tsx:22`) 제공. page 추가 시 중복 h1.

## 단계별 체크리스트 (8-4)

- [x] 1. 접근성 8-3 — #97 머지 완료
- [x] 2. 이미지 영역 근본원인 점검 → fetch 썸네일 리사이즈 우회 결함 1건 확정
- [x] 3. 7영역 감사 — 🔴 1(이미지)·🟢 5·🟡 3, 매트릭스 근거 채움
- [x] 4. 확정 결함 외과 수정 — loader 1건만(추가 🔴 없음, 추측 수정 0)
- [x] 5. 번들: analyzer Turbopack 비호환 확인 → escape·tech-debt 등록. loader 전/후 출력 단언 PASS(640/1080 상이·q_ 1개·비-fetch 불변)
- [x] 6. verify-task PASS + Codex 1차 + Claude 2차

## 성능 점검 결과

### 1차 정적 점검 (#97, superseded)

priority/lazy·페이지네이션 정상, "정적 결함 0"으로 종결했었다. loader fetch-URL 통과 분기를 놓쳐 이미지 리사이즈 우회를 못 잡음. 아래 감사 매트릭스가 SSOT.

### 감사 매트릭스 (7영역)

판정: 🔴 결함(수정) · 🟢 정상(근거) · 🟡 보류(런타임 실측 필요). 근거 = 파일:줄·수치.

| 영역 | 점검 항목 | 판정 | 근거 / 조치 |
| --- | --- | --- | --- |
| 이미지 | 적절한 크기 (responsive resize) | 🔴→수정 | `cloudinary.ts:73` http passthrough로 fetch 썸네일이 `w_`·srcSet 없이 YouTube 원본을 ~210px 카드에 전송. → loader fetch 분기 치환(`f_auto,q_auto,c_limit,w_<width>`). 단언: width 640/1080 출력 상이·`q_` 1개·비-fetch 불변 = PASS. |
| 이미지 | WebP/AVIF · lazy · LCP priority | 🟢 | `f_auto`(`cloudinary.ts:58`,`:74`)가 포맷 자동. priority는 `SermonFeatured:38`·`SeriesDetailHero:23`만, 나머지 Next 기본 lazy — 누수 0. |
| 초기로딩/번들 | 청크 크기·미사용 JS | 🟡 escape | `@next/bundle-analyzer`가 Turbopack 빌드와 비호환(빌드 로그: "not compatible with Turbopack builds, no report") → byte-% 측정 불가. knip 신규 미사용 sermons 0(변경=util 1함수). 측정 복구는 `next.config.ts` 수정=ADR_TRIGGER → tech-debt 등록·미수정(escape). |
| Code Splitting | 무거운 클라 컴포넌트 dynamic 후보 | 🟡 escape | `BottomSheet`가 `@/components/ui`에서 정적 import(`AdvancedFilterSheet.tsx:6`·`SeriesFilterBottomSheet.tsx:6`·`SermonMetaActions.tsx:13`). off-viewport이나 ≥10% 판정에 번들 byte 필요(위 analyzer 비호환). 추측 `dynamic()` 금지(Non-goal) → 동일 escape, byte 측정 복구 후 재판정. |
| SSR/SSG | 라우트 렌더 전략·페칭 | 🟢 | 공개 reads 전부 `createStaticClient(sermonCache.*)`(`sermon/index.ts:12,17,22,27,33,38,43`), `static.ts:12` force-cache+tags. `force-dynamic`·`cookies()`·`createServerSideClient` 오용 0(grep). `[id]/page.tsx:50` revalidate=86400 ISR. 라우트 `ƒ`는 news/community와 동일 앱 전역 패턴(데이터는 캐시) — D6 이진기준 미충족, 결함 아님. |
| 렌더링 | 불필요 리렌더·list key·hydration | 🟢 | 데이터 리스트 key 전부 안정 id(`sermon.id`·`item.id`·`option.label`·`ep.id`·`res.id`). `key={index}`는 `SermonsSkeleton.tsx`(고정 길이 정적 placeholder, 데이터 아님)만 — 재조정 위험 0. |
| 네트워크 | 요청 수·중복·캐싱 | 🟢 | `[id]/page.tsx`가 `getSermonById`를 generateMetadata(20)+page(76) 2회 호출하나 동일 Supabase fetch URL → Next request memoization + `static.ts:12` force-cache 디둡, cache tag 존재 → 실 DB 1회. 동일 URL ≥2 실호출 0. |
| Core Web Vitals | LCP·INP·CLS | 🟡 | 이 환경 브라우저 없음. **기준**: Vercel preview Lighthouse mobile LCP ≤2.5s·CLS ≤0.1·INP ≤200ms. 미달 항목만 후속 plan. tech-debt 등록. |
| JS 실행 | Long Task·무거운 연산 | 🟢 | 필터/정렬은 DB측(`all/page.tsx:98 getFilteredSermons`), 검색 debounce #94 머지. `SermonFilteredList.tsx:24`는 server-provided 배열 `.map`만 — 렌더경로 O(n²)·비메모 전체정렬 0. |

판정 완료. 🔴 1건(이미지)만 수정, 🟢 5건은 근거와 함께 정상, 🟡 3건은 escape/런타임 후속(tech-debt 등록).

### 실측 — 카드 썸네일 전송 바이트 (전/후)

실제 Cloudinary CDN에 동일 YouTube 썸네일(1280×720 maxresdefault)을 전/후 변환 URL로 GET, `Content-Length` 비교:

| 변환 | 전송 | 감소 |
| --- | --- | --- |
| BEFORE — `f_auto,q_auto`만(loader 통과, 폭 미적용) | 58,017 B | 기준 |
| AFTER — `f_auto,q_auto,c_limit,w_256`(모바일 카드 폭) | 8,668 B | **−85.1%** |
| AFTER — `…,w_384` | 15,351 B | −73.5% |
| AFTER — `…,w_640`(태블릿/PC 카드) | 31,648 B | −45.5% |

목록·캐러셀 카드 다수(예 그리드 ~12장) 기준 이미지 페이로드가 모바일에서 약 700KB→100KB 수준으로 감소. LCP/INP/CLS 종합 수치는 브라우저 부재로 미측정 — Vercel preview Lighthouse 후속(tech-debt 등록). 본 표가 8-4 "수치 측정" 요구의 직접 근거.

**ADR / Non-goal escape hatch**: SSR/SSG·네트워크 감사에서 결함의 수정 지점이 ADR_TRIGGER 파일(`src/services/`·`src/actions/`·`next.config.*`·`package.json`)이면 — **이번에 고치지 않는다**. 매트릭스 행에 🔴 + "범위 밖 — 후속" 표기, `docs/tech-debt-tracker.md`에 1줄 등록, 작업 중단·사용자 보고. `src/utils/cloudinary.ts`(현 확정 1건)·`src/app/(content)/sermons/` 내부 결함만 이번 범위.

## Verification

- `node scripts/verify-task.mjs sermons-a11y-perf`
- 이미지: `createCloudinaryLoader()` fetch URL을 width 640·1080 호출 → 출력 상이·`w_` 포함·`q_` 1개 단언. 비-fetch/public_id/siteAsset 출력 불변.
- 번들: `ANALYZE=true yarn build` 리포트에서 sermons 청크 상위 의존 캡처.
- CWV: Vercel preview URL에 Lighthouse mobile 1회 — LCP/INP/CLS 수치를 표에 기록(미달 시 후속).

## ADR 판단

- **불필요** — 수정 파일 `src/utils/cloudinary.ts`는 ADR_TRIGGER_PARTS(`next.config`·`package.json`·`src/services`·`scripts`·`src/lib/supabase` 등)에 없음. 공유 util이나 동작 변경은 `image/fetch` URL 1분기에 국한, 소비처가 sermons 7파일뿐이라 영구 결정 아님. `start-adr.mjs` 미실행.

## 의사결정 로그

- **D1 — Codex 계획검증 CHANGE_REQUEST 반영**
  - 문제: SC 6개 중 4개가 도구·라우트·임계값 미명시로 약했다. Non-goals에 ADR_TRIGGER·라이브러리 배제가 없어 `ADR: no`가 조건부였다. Assumptions에 미확인 항목("Glob 확인 예정")이 있었다.
  - 해결: SC를 도구(axe/Lighthouse)·5라우트·임계값(4.5:1·44px·점수하락 0)·결과 저장 위치로 구체화했다. Non-goals에 ADR_TRIGGER 파일·새 라이브러리 배제를 명시했다. Assumptions를 Glob·find 실측(16 디렉토리·5 라우트)으로 교체했다. 8-3·8-4 분리 대신 한 task 유지(관련 closeout), 커밋만 a11y/perf 분리.
  - 결과: material CR 해소. weak 기준 0, 범위 경계 명확. BLOCK 아니라 재요청 없이 WORK 진입.
- **D2 — 부킹 5건과 a11y-perf를 한 브랜치, 별 커밋**
  - 문제: `feat/sermons-a11y-perf`에 부킹 커밋(`17488f6`·`b3d3f90`)이 a11y-perf 작업과 섞인다. Codex가 PR 오염 지적.
  - 해결: 사용자가 한 브랜치를 선택했다. 의도별로 커밋을 분리해 두고, PR 시점에 (a) 부킹만 develop 선머지 또는 (b) PR 본문에 분리 표기 + squash 중 택한다. 부킹은 순수 Docs라 분리·선머지가 쉽다.
  - 결과: 커밋 단위로는 의도 분리 유지. 최종 PR 전략은 PR 생성 시 사용자 결정.
- **D3 — 8-4를 loader fetch-resize 1수정으로 한정**
  - 문제: 8-4 레퍼런스 항목(blur·번들·priority·페이지네이션)을 다 손대면 범위 팽창. priority·페이지네이션은 이미 정상, 번들 도구도 배선됨. 진짜 결함은 fetch 썸네일 리사이즈 우회 1건.
  - 해결: 수정은 loader fetch 분기 1개로 한정. blur placeholder는 LQIP URL 생성 별건이라 후속 작업으로 분리. 번들은 실행·기록만(범위 축소 근거). loader가 공유 util이나 fetch src 소비처가 sermons뿐이라 Non-goal "sermons 밖 수정" 위반 아님 — 채택 해석으로 기록.
  - 결과: 1파일 외과적 수정. blast radius sermons 한정, 비-fetch 이미지 회귀 0(SC로 검증).
- **D4 — Codex 8-4 계획검증 CHANGE_REQUEST 반영**
  - 문제: ① `cloudinaryFetchUrl`이 이미 `f_auto,q_auto`를 굽는데(`cloudinary.ts:58`) loader가 같은 세그먼트에 `q_<quality>`를 또 주입하면 `q_` 2개 → Cloudinary 동작 미정의. ② SC "빌드 산출 HTML srcset"은 `/sermons`가 런타임 렌더면 정적 산출물이 없어 검증 불가. ③ non-Cloudinary 절대 http passthrough SC 예시 부족.
  - 해결: ① loader가 `q_auto` 유지하고 `w_<width>`(+`c_limit`)만 치환, `q_<quality>` 미추가로 명시. ② SC를 "loader를 width 640·1080 두 번 호출해 출력 상이·`w_` 포함" 결정론적 단언으로 교체, 런타임 srcset은 Vercel preview 선택 검증으로 강등. ③ SC에 `https://example.com/a.jpg` passthrough 불변 예시 추가.
  - 결과: material ①② 해소, ③ expression 반영. CR이라 재요청 의무 없음 — 단 범위가 7영역으로 확대돼 plan 재검증을 1회 요청한다.
- **D5 — 8-4 범위를 1수정에서 7영역 감사로 확대 (사용자 지시)**
  - 문제: 사용자가 초기로딩·번들·code splitting·SSR/SSG·이미지·렌더링·네트워크·CWV·JS실행 전면 점검을 요청. D3의 "loader 1수정 한정"과 충돌.
  - 해결: 채택 해석 = "감사 우선 → 측정된 결함만 외과 수정". 7영역 감사 매트릭스를 SC·`## 성능 점검 결과`에 도입, ⬜ 행을 SSOT 근거로 🔴/🟢/🟡 판정. 🔴만 수정, 🟢은 정상 기록, 🟡(LCP/INP/CLS)은 Vercel preview 실측. 추측성 최적화는 Non-goal로 명시.
  - 결과: D3의 "1수정 한정"은 D5로 supersede. blast radius는 여전히 sermons(loader는 fetch 소비처가 sermons뿐). 가짜 작업 0 — 정상 영역은 근거와 함께 정상으로 남긴다.
- **D6 — Codex 2차 계획검증 CHANGE_REQUEST 반영 (D5 매트릭스)**
  - 문제: ⬜ 행(초기로딩/번들·Code Splitting·SSR/SSG·렌더링·네트워크·JS실행)이 🔴 이진 기준 없이 열려 감사가 무한 탐색이 됨(Codex material 2건). SSR/SSG·네트워크 결함이 `src/services/` 수정을 요구하면 Non-goal(:29)과 감사목표(:66)가 충돌, escape hatch 부재(material 1건).
  - 해결: 매트릭스 각 ⬜ 행에 이진 🔴 기준 명시 — 번들 "단일 의존 ≥ route First Load JS 30%", Code Splitting "초기 뷰포트 밖 + ≥10%", SSR/SSG "공개 라우트가 의도외 dynamic/`createStaticClient` 미사용", 렌더링 "list key index/비안정", 네트워크 "동일 URL ≥2회/캐시 태그 전무", JS "렌더 경로 O(n²)/비메모 전체정렬". escape hatch 추가 — ADR_TRIGGER(`src/services`·`actions`·`next.config`·`package.json`) 수정 필요 결함은 안 고치고 tech-debt 등록·중단·보고.
  - 결과: 모든 감사 행이 pass/fail 닫힘. Non-goal·escape hatch 정합. CR이라 재요청 의무 없음 — 두 material 직접 해소라 3차 Codex 호출 없이 WORK 진입.
- **D7 — 7영역 감사 실측 결과**
  - 문제: 사용자 우려("성능 최적화 제대로 안 됨")가 7영역 전반인지, 특정 결함인지 측정 전 불명.
  - 해결: D6 이진기준으로 감사. 🔴 1건만 실재 — 이미지 리사이즈 우회(`cloudinary.ts:73`), loader 치환으로 수정·단언 PASS. SSR/SSG·렌더링·네트워크·JS실행은 SSOT 근거로 🟢(가짜 작업 안 만듦). 번들·Code Splitting은 `@next/bundle-analyzer`의 Turbopack 비호환으로 byte 측정 불가 → escape(tech-debt 2건 등록), config 미수정. CWV는 런타임이라 Vercel preview 후속.
  - 결과: 코드 수정은 loader 1파일로 확정. 사용자 체감 결함의 정체 = 이미지 리사이즈 우회 단일 결함. 나머지는 정상이거나 측정 도구·런타임 제약(후속 추적).

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (2회, confidence high) — D4·D6로 전건 해소 후 WORK 진입
- **현재 판단**: 1차 CR(loader `q_` 중복·SC 검증불가)는 D4로 해소·Codex 2차에서 expression-only로 재확인. 2차 CR은 D5 매트릭스 ⬜ 행 이진기준 부재 + ADR escape hatch 부재 → D6로 각 행에 🔴 임계값 명시·escape hatch 추가. 2 material 모두 직접 해소.
- **다음 행동**: WORK·VERIFY 완료. Codex 1차 PASS·Claude 2차 PASS. 커밋 승인 대기.

## Codex 1차 검증

- **결론**: PASS (confidence high)
- **현재 판단**: loader fetch 분기 1파일 diff 검증. regex group1이 `/image/fetch/`까지 캡처·`[^/]+`가 slash 없는 `f_auto,q_auto`만 소비·`(.+)$`가 `%2F` 인코딩으로 mis-split 0(`cloudinary.ts:76`). 출력 `f_auto,q_auto,c_limit,w_<width>/<encoded>` 유효, `quality` 무시는 설계대로(q_auto 1회). 회귀 0 — `example.com/a.jpg`·public_id·`/image/upload/` 절대 URL 모두 passthrough 불변. unused var 0, util 레이어, ADR_TRIGGER 미해당.
- **다음 행동**: Claude 2차 교차 → 커밋 승인 요청.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: diff 재독 — 추가 블록은 passthrough 바로 앞 1곳, 인접 변경 0(surgical). 결정론 단언 PASS(width 640/1080 출력 상이·`q_` 1개·비-fetch/public_id 불변)와 Codex 1차 PASS가 독립 일치. verify-task PASS(`20260518-205029`, Knip 기존 부채). 7영역 감사: 🔴 1(이미지·수정·단언 검증)·🟢 5(SSR/SSG·렌더링·네트워크·JS·이미지포맷, SSOT 근거)·🟡 3(번들·CodeSplit는 analyzer Turbopack 비호환 escape, CWV 런타임 — tech-debt 2건 등록). 추측 수정 0.
- **다음 행동**: 커밋 승인 대기 — 의도별 2커밋(코드/문서) 제안.

## 검증 이력

<details>
<summary>2026-05-18 Codex 계획 검증</summary>

- 판정: CHANGE_REQUEST (confidence high)
- 이유: SC 4개 도구·임계값 미명시, Non-goals ADR_TRIGGER·라이브러리 배제 누락, Assumptions 미확인 항목.
- 조치: D1(SC 구체화·Non-goals 배제·Assumptions 실측), D2(브랜치 오염 PR 전략).

</details>

<details>
<summary>2026-05-18 Codex 1차 검증 (과지연 취소 → Claude 대행)</summary>

- 판정: FIX_APPLIED — Codex task 15분+ grep 루프 미수렴, 프로세스 종료. Claude가 4 a11y diff 직접 교차검증.
- 이유: fix#4가 `min-width:$spacing-48`+center로 X 아이콘을 ~20px 좌측 이동(비주얼 회귀).
- 조치: `::before` 48px 히트영역으로 교체 — 아이콘 위치 불변, 탭타깃 ≥48px. 재verify PASS.

</details>

<details>
<summary>2026-05-18 Codex 1차 재검증 (bounded, --fresh)</summary>

- 판정: PASS (confidence medium)
- 이유: 사용자 요청으로 교정본 독립 교차검증. 범위를 4파일로 한정해 과지연 재발 방지.
- 조치: 변경 없음 — h1→h2·focus-visible·::before·surgical 전부 확인. Claude 대행 결과 독립 재확인.
- 한계: bounded 프롬프트에 "`(content)/layout.tsx`가 모든 sermons 라우트에 Hero h1 렌더" 전제를 줬다. 이 전제가 거짓이라 h1→h2 회귀를 못 잡았다.

</details>

<details>
<summary>2026-05-18 PR #97 외부 리뷰 (Codex GitHub bot · Gemini)</summary>

- 판정: 지적 2건 전부 유효 — 반영 완료.
- Codex P2 (`SermonDetailPage.tsx:94`): `/sermons/[id]`는 Hero가 안 떠 자체 h1이 페이지 유일 h1. h2 변경은 h1 소실 회귀. → h1으로 환원.
- Gemini medium (`2026-05-18-sermons-a11y-perf.md:27`): 부킹 분리 결정 참조가 `D1`인데 실제는 `D2`(94행). → `D2`로 정정.
- 교훈: 내부 bounded 교차검증에 거짓 전제를 주입하면 PASS가 무의미. SSOT(`hero.config.ts`) 직접 확인이 audit/전제보다 우선(ADR 0010).

</details>

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt-tracker.md` 또는 없음 -->

## 회고 (머지 후 작성)

- 잘된 것: 7영역 성능 감사를 이진 기준으로 닫아 실재 결함 1건만 남겼다. 이미지 fetch 리사이즈 우회(`cloudinary.ts:73` http passthrough)를 loader 분기 치환으로 고쳐 모바일 카드 썸네일을 58KB→8.6KB(−85%)로 줄였다. 정상 영역 5개는 근거와 함께 정상으로 남겨 가짜 작업을 만들지 않았다. a11y 4건(#97)을 수정했고 PR 외부 리뷰(Codex bot·Gemini) 2건을 반영했다.
- 다음에 할 것: CWV(LCP/INP/CLS)는 Vercel preview Lighthouse로 실측한다. blur placeholder(LQIP URL)는 별건 후속.
- 발견된 부채: `@next/bundle-analyzer`가 Turbopack 빌드와 비호환이라 번들 byte 측정 불가 — tech-debt 2건(번들·CWV) 등록 완료.

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
