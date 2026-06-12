# sermons-video-preconnect

- **상태**: ✅ 완료 (2026-05-18)
- **시작일**: 2026-05-16
- **브랜치**: feat/sermons-video-preconnect
- **Open questions**: none
- **ADR needed**: no

## 목표

상세 페이지 영상 첫 재생 지연 제거: iframe을 **진입 시 즉시 로드**(autoplay 없이 플레이어 사전 부팅)하고 디자인 포스터로 가린 뒤, 클릭 시 포스터 숨김 + `postMessage(playVideo)`로 즉시 재생. 7-2의 포스터 비주얼은 유지, "클릭 후에야 iframe 생성"만 폐기(사용자 결정).

## 검증된 Assumptions

- `SermonVideoPlayer`(develop): 미재생 시 `styles.poster` 버튼, 클릭 → `<iframe ...?autoplay=1>` **생성**(클릭-지연 모델). `'use client'`. (Read 확인)
- `.poster`는 `position:absolute; inset:0`이라 in-flow iframe 위 오버레이로 동작 — scss 변경 불요. (Read 확인)
- 임베드 origin `https://www.youtube.com`. `enablejsapi=1` + `postMessage({event:'command',func:'playVideo'})`는 외부 스크립트 없이 사전 로드된 iframe 재생 가능(YT 임베드 표준). 클릭(사용자 제스처) 내 호출이라 소리 포함 재생 정책 통과.

## 접근법 (사용자 결정 — preconnect만으론 부족)

preconnect는 연결만 데움 — 병목인 **플레이어 JS 다운로드·부팅**은 클릭 후 시작되면 그대로 느림. 사용자 테스트로 재확인. → 옵션 중 **"포스터 뒤 iframe 즉시 로드"** 채택. 상세는 시청 목적 단일영상 페이지라 진입 즉시 임베드 로드 비용 수용 가능. preconnect-only 폐기(즉시 로드면 무의미).

## Non-goals (surgical scope)

- hover-create / YT IFrame Player API 전면 도입 — 불요(enablejsapi postMessage로 충분)
- youtube-nocookie 전환·디자인(포스터/play 버튼) 변경 없음
- 다른 영상 표면(카드 등) 무변경 — 상세 SermonVideoPlayer만

## Success Criteria

- 진입 시 iframe 즉시 마운트(클릭 전 플레이어 부팅), 포스터가 가림. 클릭 → 포스터 unmount + `postMessage` 재생, 첫 재생 체감 지연 대폭 감소
- provider 가드·placeholder·포스터/play 비주얼 무변경(회귀 0). 소리 포함 재생(클릭 제스처 내)
- verify-task PASS (tsc/lint/lint:styles/build 0)

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonVideoPlayer/SermonVideoPlayer.tsx` — iframe 항상 마운트(enablejsapi)·iframeRef·handlePlay postMessage·포스터 조건부 오버레이

## 단계별 체크리스트

- [x] 1. (폐기) preconnect-only — 사용자 테스트 후 즉시-로드 방식으로 전환
- [x] 2. iframe 즉시 마운트 + enablejsapi + 클릭 postMessage playVideo + 포스터 오버레이
- [ ] 3. verify-task + Codex 1차(접근 변경分 재검) + Claude 2차

## Verification

- `node scripts/verify-task.mjs sermons-video-preconnect`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG — 계획-레벨 Codex 생략 결정(단일 컴포넌트·비구조·ADR_TRIGGER 미해당, 접근은 AskUserQuestion으로 사용자 확정), 구현分은 Codex 1차로 검증.

> **의사결정 로그(supersession)**: 이 슬러그의 구현(eager iframe + `enablejsapi`/`postMessage` 큐)은 이후 `sermons-detail-mockup` D7에서 **모바일 재생 불가 근본원인으로 판명되어 src-swap autoplay 방식으로 대체**됨(Codex 디버깅 검증). 즉 본 슬러그의 Codex 1차/Claude 2차 기록은 당시 코드 기준이며, PR #95 최종 영상 코드의 검증 SSOT는 `2026-05-16-sermons-detail-mockup.md` D7. 본 슬러그는 첫재생 지연 완화 의도(preboot)만 잔존.

## Codex 1차 검증

- **결론**: FIX_APPLIED — (d) a11y 직접 수정, (a)(b)(c)는 수용 결정(lite-youtube 표준 패턴)

> (a) RISK: `origin` param 미지정·raw `{event:'command'}` wire가 비공식. (b) RISK: unready 큐 경로의 deferred play는 클릭 제스처 밖이라 audible autoplay 차단 가능. (c) RISK(degraded, broken 아님): readiness가 비공식 listening/onReady 프로토콜 의존, 큐는 존재. (d) RISK: 포스터 뒤 항상 존재하는 iframe focus/a11y 실브라우저 검증 필요. (e) PASS: 즉시 임베드 로드는 exec-plan 명시 수용 범위, Non-goal 무누수.

**풀이**: (d)만 실결함 → iframe `tabIndex={-1}`·`aria-hidden`(미재생 시) 직접 수정. (a)(b)(c)는 lite-youtube-embed가 실세계에서 쓰는 동일 raw 프로토콜로 functional하게 동작(기능 요건 아닌 권고/이론 리스크): origin 미지정 = lite-youtube 동일, deferred play sound = 클릭의 sticky user-activation(~5s)이 수백 ms 갭 커버, onReady 프로토콜 = de-facto 표준. 완전 무결을 원하면 공식 YT IFrame Player API 도입이 정공법이나(외부 스크립트·복잡도↑) 과설계 판단 — 사용자 결정 사항으로 보고.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- 신고 버그(준비 전 클릭 → 2차 클릭 필요) 재현 경로: `handlePlay`가 `readyRef` false면 `wantPlayRef=true`만 → `message`(onReady/infoDelivery) 수신 시 `sendPlay()` 자동 실행. 단일 클릭으로 항상 재생(준비됨 즉시 / 미준비면 ready 직후 자동). Codex (c)도 "큐 존재·broken 아님" 동의.
- (d) 수정 확인: `!playing` 동안 iframe `tabIndex={-1}`+`aria-hidden` → 키보드 탭 진입·AT 노출 차단, `playing` 시 해제. verify `20260516-211833` PASS.
- 회귀: provider 가드·placeholder·포스터/play 비주얼·`.poster` 절대 오버레이·`.main` 비율 무변경(Codex (d) 일부·(e) 일치). preconnect-only 잔재 없음(폐기).
- 잔여 수용(문서화): (a) origin 미지정 (b) deferred sound 정책 (c) 비공식 프로토콜 — 표준 lite 패턴, 추후 공식 Player API 전환은 별도 결정.

## 의사결정 로그

- **DL-1 (계획-레벨 Codex 생략)**: 단일 컴포넌트·비구조·ADR_TRIGGER 미해당. 접근(즉시 iframe vs preconnect vs Player API)은 AskUserQuestion으로 사용자 확정, 구현分은 Codex 1차(FIX_APPLIED)로 검증. 계획 검증 verdict = PASS_WITH_DECISION_LOG.
- **DL-2 (supersession — 중요)**: 본 슬러그 구현(eager iframe + `enablejsapi`/`postMessage` ready-큐)은 이후 `sermons-detail-mockup` D7에서 **모바일 재생 불가 근본원인으로 판명**, Codex 디버깅 검증을 거쳐 **src-swap autoplay(`?playsinline=1`, 클릭 시 `&autoplay=1`)로 전면 대체**됨. 따라서 위 Codex 1차/Claude 2차 기록은 *당시 코드 기준*이며 PR #95 최종 영상 코드의 검증 SSOT는 `2026-05-16-sermons-detail-mockup.md` D7. 본 슬러그에서 잔존하는 의도는 진입 즉시 iframe 마운트(첫재생 지연 완화)뿐.

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시
-->

## 회고

- **잘된 것**: 첫재생 지연 완화를 위한 eager iframe + 접근(즉시로드 vs preconnect vs Player API)을 AskUserQuestion으로 사용자 확정.
- **다음에 할 것**: 모바일 autoplay 정책(재생은 user-gesture 콜스택 내에서만)을 설계 단계에서 고려했어야 — postMessage ready-큐가 제스처 밖이라 모바일 재생 전무, detail-mockup D7에서야 Codex 디버깅으로 규명. 비공식 lite-youtube wire 의존의 한계.
- **부채**: preboot 효과가 D7 src-swap(클릭 시 iframe navigation)으로 약화됨 — 첫재생 지연 최적화 재설계 시 공식 YT IFrame Player API(외부 스크립트 수용) 검토. `docs/tech-debt-tracker.md` 등록 권장.

<!-- 검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙" 참조. 추상명사 금지, 구체화 4원소 최소 2개, Codex stdout verbatim + 풀이 1줄. -->
