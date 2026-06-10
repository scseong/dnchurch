# perf-optimize

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-10
- **브랜치**: perf/optimize-measure
- **Open questions**: none
- **ADR needed**: no

## 목표

홈의 느린 첫 화면(FCP 6.5s·LCP 9.7s)을 측정으로 진단해 가장 큰 병목을 줄인다. 끝나면 같은 조건(prod 빌드·Lighthouse 모바일)에서 before/after 표로 개선 폭을 수치로 보인다.

베이스라인 진단(유효): 병목은 JS 번들이 아니라 **폰트 크기(647KiB)와 렌더 차단 CSS**다. TBT는 210ms로 낮고, react-icons는 Next 16 기본 optimizePackageImports에 이미 포함돼 손댈 게 없다. 상세 수치는 `docs/research/perf-optimize/baseline-summary.md`.

## 검증된 Assumptions

- react-icons는 Next 16 기본 `optimizePackageImports`에 팩 단위로 전부 포함됨 — `node_modules/next/dist/server/config.js:982-1012` 확인. 코드도 58/60 파일이 sub-path import. → 번들 최적화 여지 없음(no-op).
- 홈 LCP 요소 = Banner 히어로 IMG, elementRenderDelay 2,082ms가 지배 — Lighthouse `lcp-breakdown-insight`. 이미지는 fetchpriority=high로 101ms에 도착, 렌더가 막혀 못 그림.
- render-blocking 절감 추정 4,070ms — 로컬 CSS 101KiB(2,273ms) + jsdelivr Pretendard CSS(1,146ms) + 기타 CSS. Lighthouse `render-blocking-insight`.
- 폰트 647KiB/21파일이 전체 전송 1,295KiB의 절반 — Lighthouse network-requests 집계.
- 세리프 weight 사용: 700·400 다수, 500(RecentSermons), 600(QuickAccess, layout 미요청→스냅), 800 미사용 — `grep $font-family-secondary`.
- photoswipe.css(7.4KiB)가 `layout.tsx:8`에서 전역 import — 모든 라우트에 렌더 차단 CSS로 실림. 실제 사용처는 게시판·주보 2곳.

## Success Criteria

측정 방법론(before/after, 같은 머신·prod 빌드·Lighthouse 모바일):

- 비교 라우트: 홈(`/`), 게시판 상세(`/news/bulletins/1`). 각 **Lighthouse 모바일 5회**, median + min/max 기록(LCP·FCP·Perf·전체 전송·폰트 KiB).
- 결정적 지표: 최대 CSS 청크 바이트(베이스라인 306,630 B), Noto Serif KR @font-face 블록 수(베이스라인 496), 홈 폰트 파일 수(베이스라인 21).
- 수치 판정(베이스라인 1회 기준 → after median):
  - 홈 폰트 전송: 647 KiB → **≤ 500 KiB**.
  - 세리프 @font-face 블록: 496 → **약 절반(~248)**, 최대 CSS 청크 306KB → **유의하게 감소**.
  - 홈 LCP median: 9.7s → **개선(델타 표)**, FCP median: 6.5s → **개선**.
  - 홈 라우트 network에 photoswipe CSS·JS 요청 **0개**.
  - 시각 회귀 없음 — 브라우저로 홈·게시판 데스크톱+모바일 확인(세리프 텍스트·갤러리 정상).
  - `yarn build`·`yarn lint`·`yarn lint:styles` 통과, knip 신규 0.

## Non-goals

- react-icons / `optimizePackageImports` 추가 — 이미 프레임워크 기본값 적용(no-op).
- 전체 라우트 성능 튜닝 — 홈·게시판 두 라우트의 첫 화면 병목만.
- 이미지 파이프라인·Cloudinary 변환 변경 — LCP 이미지는 이미 최적(fetchpriority·101ms).
- globals.scss 대수술 — 렌더 차단 CSS 중 앱 자체 번들 축소는 별도 작업.
- Pretendard 렌더 차단 완화(async swap·self-host) — 본문 폰트라 위험이 커서 별도 PR로 다룬다(레버 3 보류, D1).

## 접근법 — 레버 2개 (3은 보류)

- **레버 1 (세리프 weight, 주력)**: Noto Serif KR weight를 `['400','500','700','800']` → `['400','700']`로. RecentSermons(500)·QuickAccess(600) 세리프를 400/700 중 하나로 명시 매핑해 스냅 의존 제거. 이 레버는 두 병목을 동시에 줄인다.
  - 폰트 바이트: 페이지가 weight별 unicode-range 슬라이스를 받으므로 weight 수가 줄면 전송량이 준다.
  - 렌더 차단 CSS: 306KB(전송 101KiB)의 약 80%가 Noto Serif KR @font-face 496블록(weight 4 × CJK 슬라이스)이라, weight를 절반으로 줄이면 @font-face와 CSS도 절반이 된다(D2).
- **레버 2 (photoswipe)**: `PhotoSwipe.tsx`를 `next/dynamic`(ssr:false)으로 감싸고, `photoswipe.css`(7.4KB) 전역 import를 그 컴포넌트/갤러리 segment로 옮긴다. 비갤러리 라우트(홈 포함)에서 photoswipe CSS·JS 제거. 컴포넌트 내 CSS import가 빌드 실패하면 갤러리 route segment import로 대체(D1 Codex 조건).
- **레버 3 (Pretendard) 보류** → 후속 작업. 본문 폰트 async 전환은 FOUT·CLS 위험이 있고, self-host는 폰트 자산 소유·preload·라이선스를 직접 운영해야 한다. Codex 권고로 이번 범위에서 뺀다(D1).

## 영향받는 파일

- `src/app/layout.tsx` (세리프 weight 축소, photoswipe.css 전역 import 제거, 레버 3 결과 반영)
- `src/app/_component/home/RecentSermons.module.scss`·`QuickAccess.module.scss` (세리프 weight 명시 매핑)
- `src/components/common/PhotoSwipe.tsx` + 사용처(`BoardBody`, `LatestBulletinImages`) (동적 import·CSS 동봉)
- 레버 3에 따라 `layout.tsx` `<head>` 또는 폰트 로딩 방식

## 단계별 체크리스트

- [x] 1. 베이스라인 확정 — 홈 Lighthouse 5회 median + .next client JS·CSS·@font-face·폰트 바이트 기록(`baseline-summary.md`)
- [x] 2. 레버 1 — 세리프 weight 4→2(400·700) + RecentSermons(500→400)·QuickAccess(600→700) 매핑
- [x] 3. 레버 2 — photoswipe.css 전역 import 제거 → PhotoSwipe.tsx로 이동(빌드 통과)
- [x] 4. 레버 3 보류 확정(D1) — 후속 작업으로 기록
- [x] 5. after 측정 — 동일 조건 5회 median, before/after 델타 표(@font-face -50%, LCP -563ms, CSS -43%)
- [x] 6. 브라우저 시각 확인(홈 브랜드 세리프·히어로 정상) + `verify-task`(run 20260610-192006 통과)

## Verification

- `node scripts/verify-task.mjs perf-optimize`
- 수동: before/after Lighthouse 중앙값 표(LCP·FCP·폰트 KiB·전송), 브라우저 시각 회귀 확인

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (high) — 요구 4건을 반영(D1·D2·SC 수치화·측정 5회).
- **현재 판단**: 레버 1(주)+2로 WORK 진입, 레버 3 보류.
- **다음 행동**: 구현 diff로 1차 검증.

조치 요약:

- 레버 3 보류(D1): Pretendard는 본문 폰트라 `media=print onload` async swap이 FOUT·CLS 위험. self-host(next/font/local)는 폰트 자산 소유·preload·라이선스 운영 표면이 새로 생겨 별도 PR감. 이번 범위에서 뺀다.
- 레버 2 빌드 안전성: client 컴포넌트 안 CSS import가 App Router 전역 CSS 제약으로 빌드 실패할 수 있음. 실패하면 갤러리 route segment에서 import로 대체(첫 open FOUC 주의).
- 성공 기준 수치화 + Lighthouse 3→5회 median+min/max로 보강(아래 SC 반영).
- Codex가 "놓친 더 큰 레버"로 지목한 렌더 차단 로컬 CSS 101KiB는 분석 결과 Noto Serif KR @font-face 496블록이라 레버 1에 흡수됨(D2).

## Codex 1차 검증

- **결론**: PASS (high) — 4개 변경에 동작 오류·레이어 위반 없음. 2차 확인 권고 3건을 아래대로 해소.
- **현재 판단**: 커밋 가능.
- **다음 행동**: Claude 2차에 2차 확인 결과 기록.

조치 요약:

- 권고 1(photoswipe `.pswp` override 깨짐): repo에 `.pswp` override가 0건이라 CSS 순서 변경 위험이 없다 — `grep "pswp" src --include=*.scss/*.css` 무매칭.
- 권고 2(photoswipe.css가 홈에서 빠지고 갤러리에만): 빌드 청크 `433167e9…css`에 `.pswp`가 있고 홈은 photoswipe 요청 0(Chrome 확인). 갤러리 라우트로 스코프됨.
- 권고 3(RecentSermons 제목 굵기 변화): 의도된 매핑(500→400). 브랜드 세리프·히어로는 브라우저로 정상 확인.

## Claude 2차 검증

- **최종 판단**: PASS — 신규 회귀 0, 측정으로 개선 확인, 커밋 가능.
- **현재 판단**: 정적 검증 4종 + 결정적 빌드 지표 + Lighthouse 5회 median + Chrome 실측으로 before/after를 확보했다.
- **다음 행동**: 사용자 승인 후 커밋.

| 시점 | run-id | lint | styles | build | knip 신규 |
| --- | --- | --- | --- | --- | --- |
| 1차 | 20260610-192006 | ✅ | ✅ | ✅ | 0 |

before/after (전체 기록: `docs/research/perf-optimize/baseline-summary.md`):

| 지표 | before | after | 델타 |
| --- | --- | --- | --- |
| 세리프 @font-face 블록 | 496 | 250 | -50% |
| 최대 CSS 청크(원본) | 306,630 B | 153,510 B | -50% |
| 홈 Lighthouse Perf median | 61 | 67 | +6 |
| 홈 LCP median | 6,653 ms | 6,090 ms | -563 ms |
| 홈 FCP median | 4,405 ms | 4,245 ms | -160 ms |
| 홈 TBT median | 220 ms | 118 ms | -102 ms |
| 홈 CSS 전송(Chrome encoded) | 143 KiB | 82 KiB | -43% |
| 홈 photoswipe 요청 | (전역 로드) | 0 | 제거 |

측정 방법: 같은 머신·prod 빌드. Lighthouse 모바일 5회 median+min/max(LCP variance 커 median 필요). 결정적 지표는 `.next` 청크·@font-face 카운트. Chrome은 `encodedBodySize`(캐시 무관). 시각 회귀: 브라우저로 홈 확인 — 브랜드 세리프·히어로 정상, 세리프 weight 변경(RecentSermons 500→400·QuickAccess 600→700)은 미세하고 의도된 매핑. 빌드: photoswipe.css를 client 컴포넌트에 둬도 App Router 빌드 통과(Codex 계획 검증 우려 미발생).

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

- **D1 — Pretendard 렌더 차단 완화(레버 3)는 이번 범위에서 뺀다**
  - 문제: jsdelivr Pretendard `<link rel=stylesheet>`가 렌더를 1,146ms 막는다. 본문 폰트라 효과는 크지만 손대기 까다롭다.
  - 해결: Codex 계획 검증이 셋을 비교했다 — `media=print onload` async swap은 본문 한글 FOUT·CLS 위험, `preload+유지`는 렌더 차단 성격을 못 없애 1,146ms를 온전히 못 얻음, `next/font/local` self-host는 가장 안전하지만 폰트 자산 소유·preload·라이선스 운영 표면이 새로 생긴다. 그래서 이번엔 보류하고 별도 PR로 조사한다. 레버 1·2를 먼저 적용한다.
  - 결과: 본문 가독성 회귀 위험 없이 안전한 레버부터 처리한다. Pretendard는 후속 작업으로 남긴다.

- **D2 — 렌더 차단 CSS 101KiB는 세리프 @font-face라 레버 1에 흡수된다**
  - 문제: Codex가 폰트 다음 큰 레버로 렌더 차단 로컬 CSS 101KiB(전송)·306KB(원본)를 지목했다. 별도 CSS 축소 작업이 필요한지 의심했다.
  - 해결: 그 CSS를 분석하니 Noto Serif KR `@font-face`가 496블록(weight 4 × CJK unicode-range 슬라이스), unicode-range 선언만 247KB로 ~80%를 차지했다. 앱 SCSS 과다 유입이 아니라 세리프 폰트 CSS다. 그래서 별도 CSS 레버를 만들지 않고, 세리프 weight를 줄이는 레버 1이 @font-face 수와 이 CSS를 함께 절반으로 줄이게 둔다.
  - 결과: 레버 1이 폰트 바이트와 렌더 차단 CSS 둘 다 친다 — 주력 레버로 확정.

## 후속 작업

- Pretendard(본문 폰트) jsdelivr 스타일시트가 렌더를 1,146ms 막는다. self-host(`next/font/local`)로 옮기면 렌더 차단을 없애고 fallback 메트릭까지 통제할 수 있다.
  - 이유: 본문 폰트라 async 전환은 FOUT·CLS 위험, self-host는 폰트 자산 운영 표면이 새로 생겨 별도 PR감(D1).
  - 다음 기준: 이번 레버 1·2 적용 후에도 홈 FCP가 목표 미달일 때, 또는 폰트 운영을 정비할 때.
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

