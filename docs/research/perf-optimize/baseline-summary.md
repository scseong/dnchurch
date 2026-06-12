# perf-optimize 베이스라인 (before) — 2026-06-10

측정: develop 74524c8 깨끗 상태, prod 빌드(`yarn build`), Lighthouse 모바일, 홈 1회(병목 식별용).

## 홈 런타임 (Lighthouse mobile, 1회)
- Perf score: 55
- FCP: 6,467 ms
- LCP: 9,752 ms (LCP 요소 = Banner 히어로 IMG)
- TBT: 210 ms (낮음 — JS 실행 병목 아님)
- CLS: 0
- 전체 전송: 1,295 KiB

## 자원 분해 (홈, transfer)
- Font: 647 KiB / 21 파일  ← 최대
- Script: 291 KiB
- Stylesheet: 144 KiB
- Image: 110 KiB
- 폰트 내역: Noto Serif KR(next/font, 4 weight) self-host + Pretendard(jsdelivr dynamic-subset) 12+ 파일

## LCP 분해 (홈)
- TTFB 37ms / resourceLoadDelay 21ms / resourceLoadDuration 101ms / **elementRenderDelay 2,082ms**
- 즉 이미지는 빨리 도착(fetchpriority=high 적용), 렌더가 막혀 못 그림.

## render-blocking (홈, est savings 4,070ms)
- 로컬 CSS 103,792 B (2,273ms)
- jsdelivr Pretendard CSS 12,959 B (1,146ms)
- 로컬 CSS 15,458 B (773ms) + 소형 2개(323ms×2)

## 결정적 번들 지표
- .next/static/chunks 전체 client JS: 1,529.9 KiB (50 파일)

## 세리프 weight 사용 현황
- 700: brand·title·verse·Footer / 400: Banner h1·NewHere / 500: RecentSermons / 600: QuickAccess(요청 안 됨→스냅) / 800: 미사용

## 홈 — Lighthouse 모바일 5회 median (정확한 before)
| 지표 | median | min–max |
| --- | --- | --- |
| Perf | 61 | 60–66 |
| LCP | 6,653 ms | 5,748–7,672 |
| FCP | 4,405 ms | 3,948–5,859 |
| TBT | 220 ms | 0–254 |

## 홈 — Claude in Chrome 실측 (localhost 무throttle, 412px, encodedBodySize)
- LCP 2,336 ms / FCP 2,336 ms
- 폰트 10파일 / 360.9 KiB · CSS 143 KiB · JS 237.9 KiB

---

# AFTER (레버 1+2 적용) — 2026-06-10

레버 1(Noto Serif KR weight 4→2: 400·700, RecentSermons 500→400·QuickAccess 600→700 매핑) + 레버 2(photoswipe.css 전역 import → PhotoSwipe.tsx). 레버 3(Pretendard) 보류.

## 결정적 빌드 지표 (캐시·노이즈 무관)
| 지표 | before | after | 델타 |
| --- | --- | --- | --- |
| 세리프 @font-face 블록 (최대 CSS 청크) | 496 | 250 | -50% |
| 최대 CSS 청크(원본 바이트) | 306,630 | 153,510 | -153,120 B (-50%) |
| unicode-range 선언 바이트 | 247,217 | 123,613 | -50% |
| 전체 client JS | 1,529.9 KiB | 1,529.9 KiB | 0 (예상 — JS 아님) |

## 홈 Lighthouse 모바일 5회 median (throttled)
| 지표 | before median | after median | 델타 |
| --- | --- | --- | --- |
| Perf | 61 (60–66) | 67 (63–70) | +6 |
| LCP | 6,653 ms (5,748–7,672) | 6,090 ms (5,489–6,253) | -563 ms |
| FCP | 4,405 ms (3,948–5,859) | 4,245 ms (3,859–4,700) | -160 ms |
| TBT | 220 ms | 118 ms | -102 ms |

## 홈 Claude in Chrome 실측 (localhost, encodedBodySize)
| 지표 | before | after | 델타 |
| --- | --- | --- | --- |
| CSS encoded | 143 KiB | 82 KiB | -61 KiB (-43%) |
| 폰트 woff2 | 360.9 KiB / 10 | 360.9 KiB / 10 | 0 (같은 글리프 렌더 — 줄어든 건 @font-face CSS) |
| photoswipe 요청(홈) | — | 0 | 홈에서 제거 |

## 해석
- 병목이던 렌더 차단 세리프 @font-face CSS가 절반(306→153KB, 전송 ~101→~50KiB). Lighthouse median LCP -563ms·Perf +6·TBT -102ms로 일관 개선(after max LCP 6,253 < before max 7,672).
- woff2 폰트 바이트는 동일 — 같은 한글 글리프를 렌더하므로 weight만 줄어든 효과는 woff2가 아니라 @font-face CSS에서 나타남.
- 빌드: photoswipe.css를 client 컴포넌트에 둬도 App Router 빌드 통과(Codex 우려 미발생).
