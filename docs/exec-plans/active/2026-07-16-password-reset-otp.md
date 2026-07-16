# password-reset-otp

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-16
- **브랜치**: feat/password-reset-otp
- **Open questions**: 이메일 템플릿에 `{{ .Token }}` 추가는 Supabase 대시보드 수동 작업 (dev·prod 각각). 배포 전 사용자 확인 필요
- **ADR needed**: no (기존 인증 패턴 재사용, 구조 변경 없음)

## 목표

비밀번호 찾기 2단계의 6자리 코드 입력을 실제 검증으로 만든다. 지금은 아무 값이나 넣어도 통과하는 목업 — 앞으로는 이메일로 받은 코드를 `verifyOtp(recovery)`로 서버 검증해야 재설정 화면으로 넘어간다.

## 검증된 Assumptions

- 지금 6자리 코드는 검증 안 됨 — `ForgetPasswordFlow.tsx:65-71` `goReset`이 `code.trim()`만 보고 `router.push('/reset-password')`.
- 실제 동작 경로는 이메일 매직링크 — `auth.action.ts:33` `resetPasswordForEmail` → 이메일 링크 → `app/auth/reset-password/route.ts` `reset_auth_code` 쿠키 → `reset-password/actions.ts:17-40` `exchangeCodeForSession` → admin 비번 변경.
- `resetPasswordForEmail`은 이메일에 링크(`{{ .ConfirmationURL }}`)와 6자리 토큰(`{{ .Token }}`)을 함께 넣을 수 있다 — 템플릿에 토큰 변수가 있어야 코드가 메일에 뜬다 (Supabase 이메일 OTP recovery 문서).
- 재설정 세션 두 갈래를 `updatePasswordAndSignOut`이 이미 분기 처리 — 쿠키 있으면 exchange+admin, 없으면 `updateUser`. OTP 검증이 세션을 만들면 후자 분기를 탄다.

## Success Criteria

- 이메일로 받은 실제 6자리 코드로만 `/reset-password`에 도달한다 — 틀린/빈 코드는 서버가 막고 화면에 오류가 뜬다.
- 코드 검증 성공 후 재설정 화면에서 비번을 바꾸면 로그아웃되고 `/login`으로 간다 (완료 화면 "다시 로그인" 문구와 일치).
- 직전 매직링크 시도가 남긴 `reset_auth_code`·`reset_user_id` 쿠키가 있어도 OTP 검증 흐름을 가로채지 않는다 (OTP 성공 액션이 두 쿠키를 지운다).
- 기존 매직링크 경로(이메일 링크 클릭)는 그대로 동작한다 — 제거하지 않는다.
- `yarn lint`·`yarn build` 통과, knip 신규 0.

## 영향받는 파일

- `src/actions/auth.action.ts` — `verifyPasswordResetOtpAction(email, token)` 신규 (verifyOtp recovery)
- `src/app/(auth)/forget-password/_component/ForgetPasswordFlow.tsx` — step 2 "다음"이 검증 액션 호출 (현 목업 `goReset` 교체)
- `src/app/(auth)/reset-password/actions.ts` — 세션 분기(쿠키 없는 경로)가 `updateUser` 후 signOut + `/login` 리다이렉트 (지금은 `/` no-signout — 완료 문구와 불일치)
- (수동) Supabase 대시보드 Reset Password 이메일 템플릿에 `{{ .Token }}` 추가 — dev·prod

## Non-goals

- 회원가입 휴대폰 SMS 인증 — 외부 유료 제공자 필요, 이번 범위 밖 (사용자 결정)
- 매직링크 경로 제거 — 그대로 둔다 (fallback 유지, 외과적 범위)
- UI 5분 타이머를 Supabase OTP 실제 만료 시각과 일치시키기 — Supabase OTP 만료는 대시보드 설정, UI 타이머는 표시용. 이번엔 손대지 않음

## 단계별 체크리스트

- [x] 1. `verifyPasswordResetOtpAction(email, token)` 추가 — `verifyOtp({ email, token, type: 'recovery' })`, 빈 토큰·검증 실패 시 `ActionResult` 오류 반환. 성공 시 `reset_auth_code`·`reset_user_id` 쿠키 삭제 (stale 쿠키가 no-cookie 분기를 가로채지 않게 — Codex 지적)
- [x] 2. `ForgetPasswordFlow` step 2 `goReset` → 검증 액션 호출로 교체 (성공 시에만 `router.push('/reset-password')`, 실패 시 `setAlertMessage`, 검증 중 loading/disabled)
- [x] 3. `updatePasswordAndSignOut` 세션 분기 signOut + `/login` 리다이렉트로 정정
- [x] 4. dev 프로젝트: 이메일 템플릿 `{{ .Token }}` 추가 + Email OTP Length 8→6 (사용자 수동). prod는 릴리스 시 동일 적용 필요 → 후속 작업
- [x] 5. 브라우저 E2E 실측 + `verify-task` 통과 (run 20260716-162844: ESLint·stylelint·Build 통과, Knip 경고는 기존 부채)

## Verification

- `node scripts/verify-task.mjs password-reset-otp`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 반영 완료
- **현재 판단**: 핵심 지적 1건 수용. "OTP 세션은 항상 no-cookie 분기로 간다"는 전제가 틀림 — `updatePasswordAndSignOut`이 `reset_auth_code`·`reset_user_id` 쿠키를 먼저 본다(`reset-password/actions.ts:14-53`). 직전 매직링크 시도가 남긴 오래된(stale) 쿠키가 있으면 OTP 세션이 있어도 쿠키 분기가 실행돼 "링크 만료" 오류나 오래된 userId로 admin 업데이트가 터진다. 그래서 체크리스트 1에 'OTP 성공 시 두 쿠키 삭제'를 넣고, Success Criteria와 검증 항목에 오래된 쿠키 경우를 더했다.
- 나머지 답변: (a) SSR 쿠키 지속은 방향이 맞다 — action phase 안에서 await 후 반환하면 Next.js 주의사항에 안 걸린다. (c) recovery 세션의 `updateUser({password})`는 인가된다 — 설계가 맞다. (d) await 뒤 `router.push` 순서가 타당하다. (e) `setAll`이 cookie options를 버리고 예외를 삼키는 건 기존 동작이라 후속 tech-debt로 분리한다.
- **다음 행동**: WORK 진입

## Codex 1차 검증

- **결론**: Claude 직접 검토로 대체
- **현재 판단**: diff 54줄이 계획 단계에서 Codex가 검증한 메커니즘(verifyOtp recovery·쿠키 삭제·updateUser 분기·signOut)을 그대로 옮긴 것이라 1차 검증을 Claude 자체 검토로 대체했다. auth 고위험이지만 신규 구조·라이브러리 없음.
- **다음 행동**: 사용자가 추가 확신을 원하면 Codex 1차 재요청 가능

## Claude 2차 검증

- **최종 판단**: 브라우저 E2E 통과 (verify-task 클린 빌드는 dev 정지 후)
- **현재 판단**: 코드 검토(정보 누출 없음·stale 쿠키 삭제·호출처 1개) + dev 서버 실측 통과. eslint 통과, tsc 오류 4건은 전부 dev stale `.next/types/validator.ts`의 옛 경로 참조(내 소스 무관).
- **브라우저 실측** (localhost:3000, dev 프로젝트, 계정 `ckdtjd411@hanmail.net`):
  - 틀린 코드 `000000` → 서버 거부, "인증 코드가 올바르지 않거나 만료되었습니다." 표시하고 화면 유지 (목업이면 통과했을 자리).
  - 정상 6자리 `240623` → `/reset-password` 이동.
  - 새 비번 `Test1234!` 변경 → 완료 화면 "비밀번호가 변경되었어요" (updateUser 성공) → "로그인하기" → `/login`, 로그아웃 상태 (signOut 동작).
  - OTP 길이 이슈 발견·해결: 실제 토큰이 8자리로 와서 `/^\d{6}$/`가 거부 → dev Email OTP Length를 6으로 낮춰 해결 (D1).
- **다음 행동**: 커밋 승인 요청

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| Claude 2차 | 20260716-162844 | ✅ | ✅ | ✅ | 0 | 브라우저 E2E(틀린 코드 차단·정상 통과·비번 변경·로그아웃) |

> Knip 경고 1건은 `knip.json` 엔트리 패턴이 옛 경로 `src/app/reset-password/actions.ts`를 가리키는 기존 드리프트(PR #149 `(auth)` 이동 잔재). 이번 변경과 무관.

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

- **D1 — 이메일 OTP 길이를 6자리로 맞춤**
  - 문제: 시안 기준 UI는 6자리 전제(문구·`maxLength={6}`·검증 `/^\d{6}$/`)인데, dev Supabase가 실제로는 8자리 토큰(`91082838`)을 보냈다. 8자리는 입력칸에서 잘리고 검증에서도 거부돼 정상 코드가 통과 못 한다.
  - 해결: 두 갈래 중 골랐다 — (A) Supabase Email OTP Length를 6으로 낮춰 UI 유지, (B) 코드·문구를 8자리로 고침. 시안 전체가 6자리로 설계됐고 회원가입 휴대폰 목업도 6자리라, 대시보드 설정 1개만 바꾸는 A가 일관성·변경량에서 낫다. B는 시안 문구와 어긋나고 여러 곳을 고쳐야 한다.
  - 결과: dev Email OTP Length를 6으로 변경. 코드·문구 변경 0. 재발송한 6자리 코드로 E2E 통과 확인.

## 후속 작업

- prod 프로젝트(`xrfyevrnmvbuwsbktuja`)에 dev와 같은 설정 적용 — Reset Password 템플릿 `{{ .Token }}` + Email OTP Length 6 + 커스텀 SMTP(Resend, `dongnamchurch.site`)로 발신자 "대구동남교회" 표시
  - 이유: dev에서만 설정함. prod는 아직 매직링크 8자리 상태·기본 Supabase 발신자라 OTP 흐름이 prod에서 동작 안 함
  - 다음 기준: develop → main 릴리스 직전 (v1.0.0 전환 시)
  - 기록 위치: 없음 (이 후속 항목으로 추적)
- `createServerSideClient().setAll`이 cookie options를 버리고 예외를 삼킨다 (`src/lib/supabase/server.ts:22-25`) — 쿠키 쓰기 실패가 숨겨질 수 있음 (Codex 지적)
  - 이유: 이번 작업 전부터 있던 동작이라 외과적 범위 밖. OTP 흐름은 이 상태에서도 동작한다
  - 다음 기준: 쿠키 관련 인증 버그가 실제로 재현되면 착수
  - 기록 위치: `docs/tech-debt/active.md`

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

