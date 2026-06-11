# 트러블슈팅 — 홈 첫 화면이 느리다 (LCP/FCP)

> 2026-06-10 · 작업 `perf-optimize` (PR #112) · 관련: [exec-plan](../../exec-plans/active/2026-06-10-perf-optimize.md), [baseline-summary](./baseline-summary.md)

홈 LCP/FCP가 느려 최적화한 과정을 남긴다. **추정 원인을 잘못 짚었다가 측정으로 바로잡은 기록**이라, 다음 성능 작업에서 같은 함정을 피하려고 정리했다.

## 증상

- 홈 Lighthouse(모바일): FCP 약 6.5s, LCP 약 9.7s(콜드 1회). Perf 55.
- 백로그에 적힌 추정 원인: "react-icons 번들 / `optimizePackageImports` / unused JS 68KiB".

## 결론부터

- 진짜 병목은 **JS 번들이 아니라 폰트 관련 렌더 차단**이었다.
- 효과가 있던 건 **레버 3(Pretendard self-host)** 하나뿐 — 홈 LCP 중앙값을 약 575ms 줄였다.
- 처음 손댄 **레버 1(세리프 weight 축소)은 CSS 페이로드를 절반으로 줄였지만 LCP는 못 움직였다**. 페이로드 절감과 LCP 개선은 다른 문제다.

### 한눈에 — BEFORE → AFTER

| 레버 | 지표 | BEFORE | AFTER | 변화 |
| --- | --- | --- | --- | --- |
| **3. Pretendard self-host** | **홈 LCP 중앙값** (Vercel·6회) | **8,040 ms** | **7,465 ms** | **-575 ms (실제 개선)** |
| 3. Pretendard self-host | jsdelivr 렌더 차단 등장 | 6/6회 | 0/6회 | 외부 렌더 차단 제거 |
| 1. 세리프 weight 4→2 | 세리프 `@font-face` 블록 | 496 | 250 | -50% (페이로드만) |
| 1. 세리프 weight 4→2 | 최대 CSS 청크(원본) | 306,630 B | 153,510 B | -50% |
| 1. 세리프 weight 4→2 | 홈 LCP 중앙값 | 3,220 ms | 3,256 ms | **무변화** (LCP 병목 아님) |
| 2. photoswipe 격리 | 홈 photoswipe 요청 | 전역 로드 | 0 | 비갤러리에서 제거 |

> 핵심 대비: **같은 "CSS/폰트 줄이기"라도, 레버 3(외부 렌더 차단 제거)은 LCP를 -575ms 줄였고 레버 1(세리프 CSS 절반)은 LCP를 못 줄였다.** 무엇을 줄이느냐가 아니라 **임계 경로의 long pole을 줄였느냐**가 갈랐다.

## 진단 순서와 막힌 곳

### 1. 백로그 추정(react-icons)은 이미 해결돼 있었다

- 코드: react-icons import 58/60 파일이 이미 `react-icons/io5` 같은 sub-path named import — barrel bloat 없음.
- 프레임워크: **Next 16 기본 `optimizePackageImports` 목록에 react-icons 팩이 전부 들어 있다** — `node_modules/next/dist/server/config.js`의 `react-icons/ai·bs·fa·hi·io5·pi …`.
- → `optimizePackageImports`에 react-icons를 넣어도 아무 효과가 없다(no-op). 백로그 추정을 그대로 믿지 말고 먼저 확인할 것.

### 2. TBT가 낮다 = JS 실행이 병목이 아니다

- 베이스라인 TBT 210ms(낮음). LCP 분해에서 **elementRenderDelay 2,082ms**가 지배.
- LCP 요소 = 홈 히어로 이미지. `fetchpriority=high`로 이미지는 101ms에 도착하는데 **렌더가 막혀** 못 그린다.
- → 병목은 "JS 실행"이 아니라 "첫 렌더를 막는 것(render-blocking)". 자원을 종류별로 나눠 보니 폰트가 647KiB, 21개 파일로 전송량의 절반을 차지했다.

### 3. 첫 시도(레버 1)는 엉뚱한 곳을 고쳤다

- 렌더 차단 CSS 청크가 306KB(전송 101KiB)였는데, 까보니 **Noto Serif KR `@font-face`가 496블록**(weight 4 × CJK unicode-range 슬라이스), unicode-range 선언만 247KB로 ~80%.
- 그래서 세리프 weight를 4→2(400·700)로 줄였다 → @font-face 496→250, CSS 청크 306→153KB(-50%).
- **그런데 Vercel preview로 재니 홈 LCP가 안 움직였다**(BEFORE 3,220ms / AFTER 3,256ms). 이유:
  - LCP = 히어로 이미지 = FCP 시점. FCP는 **렌더 차단 임계 경로의 가장 느린 것(long pole)**에 묶인다.
  - 줄인 세리프 CSS는 같은 출처에서 병렬로 빨리 받는 쪽이라 long pole이 아니었다.

### 4. 측정 노이즈에 속을 뻔했다

- localhost Lighthouse는 LCP 편차가 ±2~3초로 컸다. 운 좋은 한 세션 median(LCP -563ms)을 개선으로 착각했다.
- 두 서버를 동시에 띄우고 Lighthouse를 돌리니 CPU 경합으로 값이 뒤집혔다. **JS를 안 건드렸는데 TBT가 움직이면 = 측정값이 머신 상태에 따라 달라진다는 신호.**
- 교훈: 시간 지표는 한 머신·한 세션으로 단정하지 말 것. 표본을 늘려 median+분포로 보거나, 결정적 지표(바이트·@font-face 수)로 판단할 것.

### 5. 진짜 병목 = 외부 Pretendard 렌더 차단 스타일시트

- 본문 폰트 Pretendard를 jsdelivr `<link rel=stylesheet>`(dynamic-subset)로 받고 있었다. Lighthouse render-blocking 약 1,146ms — 별도 도메인이라 DNS 조회·TLS 핸드셰이크까지 든다.
- 이게 FCP의 long pole이었다. 세리프(레버 1)는 곁가지였다.

### 6. 고친 방법(레버 3, A2)

- Codex 설계 검증으로 셋을 비교:
  - **A1**: `next/font/local` 단일 variable woff2 — 비차단이지만 ~1.3MB 폰트가 히어로 이미지(LCP)와 대역폭을 다툰다.
  - **A2(채택)**: 같은 dynamic-subset CSS·woff2를 우리 출처에서 self-host — 외부 도메인 비용 제거, unicode-range subset 효율 유지, FOUT(폰트가 늦게 떠 글자가 한 번 바뀌는 현상) 위험 최소.
  - **B**: jsdelivr를 `media=print onload`로 비차단 — 본문 폰트라 FOUT(글자가 한 번 바뀜).
- 구현: `pretendard` npm 의존성 추가 + dynamic-subset CSS import, jsdelivr `<link>`·preconnect 제거. **woff2는 Turbopack이 같은 출처 자산으로 emit**해 커밋되는 바이너리는 0.
- 결과(Vercel preview Lighthouse 6회): jsdelivr 렌더 차단 6/6회 → 0/6회 제거, **홈 LCP 중앙값 8,040 → 7,465ms(약 -575ms, 두 분포 거의 분리)**. 폭은 작지만 실제로 개선됐다.

## 다음에 쓸 체크리스트

1. **백로그 추정을 먼저 검증한다.** 프레임워크 기본값(Next `optimizePackageImports` 등)이 이미 처리했는지 `node_modules` 설정을 확인.
2. **TBT부터 본다.** 낮으면 JS가 아니라 렌더 차단·자원 로딩이 병목.
3. **LCP 요소가 무엇인지 확인한다.** 이미지면 폰트/CSS 축소로는 잘 안 움직인다. 텍스트면 폰트가 직접 영향.
4. **render-blocking long pole을 찾는다.** 특히 외부 도메인 스타일시트(폰트 CDN)는 DNS·TLS까지 더해 가장 느린 경우가 많다.
5. **페이로드 절감 ≠ LCP 개선**을 구분한다. CSS/바이트를 줄여도 LCP가 안 변할 수 있다(느린 망·대역폭엔 여전히 도움).
6. **측정은 결정적 지표 + 표본 다수.** 시간 지표(LCP)는 노이즈가 크다 — Vercel preview에 올려 PageSpeed Insights(구글 서버, 머신 독립)나 Lighthouse 다회 median으로 본다. localhost 단발은 신뢰 불가.

## 측정 도구 모음 (이 작업에서 쓴 것)

| 목적 | 방법 |
| --- | --- |
| 라우트별 번들(Next 16) | `next build`는 크기 컬럼이 없음 → `.next/static/chunks` 파일 크기 합산, 또는 `next build --experimental-analyze`(Turbopack 전용) |
| @font-face·CSS 분해 | 최대 CSS 청크에서 `grep -c "@font-face"`, `unicode-range` 바이트 |
| 실제 전송 바이트(캐시 무관) | 브라우저에서 `performance.getEntriesByType('resource')`의 `encodedBodySize` |
| LCP(실측) | `PerformanceObserver({type:'largest-contentful-paint', buffered:true})` + `takeRecords()` (동기). 단 같은 URL 반복은 bfcache로 안 잡힐 수 있어 쿼리로 캐시버스팅 |
| 시간 지표(머신 독립) | Vercel preview URL + PageSpeed Insights(pagespeed.web.dev). API는 무키 quota 주의 |
| 편차 대응 | 한 번에 한 서버만 켜고 Lighthouse 다회 → median + min/max. 두 서버 동시 측정은 경합으로 무효 |

## 함정 기록

- **localhost LCP는 못 믿는다.** 네트워크가 즉시라 렌더 차단 CSS 크기 차이가 안 드러나고, 머신 부하로 세션마다 뒤집힌다.
- **Vercel preview는 기본적으로 인증 보호(401)**라 외부 도구(PSI)가 못 들어간다. 보호를 끄거나 운영 URL(공개)로 비교.
- **운영 `dnchurch.vercel.app`은 main**이라 develop과 콘텐츠가 다를 수 있다(이 시점엔 #110·#111 미반영). before는 `dnchurch-git-develop-...vercel.app`(develop preview)로 잡는 게 정확.
- **세리프 weight를 줄일 땐 전 페이지를 스캔**한다. 홈만 보면 다른 페이지(예배 안내·공지)의 같은 폰트 사용처를 놓친다(Codex 봇 P2가 잡음).
