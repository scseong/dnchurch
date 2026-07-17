# signup-email-confirm

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-17
- **브랜치**: feat/signup-email-confirm
- **Open questions**: 이메일 링크 클릭 후 착지점 — 기본은 로그인된 채 `redirect`(홈)로. 아래 D2에서 채택 이유 기록
- **ADR needed**: no (기존 인증·트리거 패턴 재사용, 구조 변경 없음)

## 목표

회원가입에 실제 이메일 인증을 넣는다. 지금은 `enable_confirmations=false`라 가입 즉시 세션이 생기고 인증이 없다. 앞으로 signUp 후 Supabase 확인 메일의 링크를 눌러야 계정이 활성화된다. 휴대폰은 인증 없이 선택 연락처로 저장한다.

## 검증된 Assumptions

- 지금 이메일 인증 없음 — `supabase/config.toml:130` `enable_confirmations = false`. signUp이 즉시 세션을 만든다.
- 휴대폰 인증은 목업 — `InfoStep.tsx:47-62` 타이머만 돌 뿐이고, phone은 `signUpAction`에 전달되지 않는다.
- `profiles.phone` 컬럼 존재 + `handle_new_user()` 트리거가 가입 시 profiles 자동 생성 — `database.types.ts` profiles Row에 `phone: string | null`, `migrations/00000000000000_baseline_core_tables.sql:42-52` 트리거가 `COALESCE(NEW.phone, raw_user_meta_data->>'phone_number')`로 phone 채움. **마이그레이션 불필요**.
- `/auth/callback` 라우트가 `exchangeCodeForSession(code)`로 PKCE 링크 처리 — `src/app/auth/callback/route.ts:11`. 리셋 메일도 같은 `code` 링크 패턴을 이미 씀.
- `signUpAction`은 `options: { data: { name } }`만 넘김 — `emailRedirectTo` 미설정 (`src/actions/auth.action.ts:65-71`).

## Success Criteria

- `enable_confirmations` on 상태에서 signUp 후 세션이 안 생기고, 위저드가 "메일을 확인하세요" 안내 화면을 보인다 (기존 "가입 완료" 아님).
- 확인 메일의 링크를 누르면 `/auth/callback`이 세션을 만들고 `redirect`(기본 홈)로 로그인된 채 착지한다.
- 입력한 휴대폰이 `profiles.phone`에 저장된다 (트리거 경유, 마이그레이션 없이).
- 휴대폰 인증 목업(인증받기·코드칸·타이머)이 InfoStep에서 사라지고, 휴대폰은 선택 입력 필드로 남는다.
- `yarn lint`·`yarn build` 통과, knip 신규 0.

## 영향받는 파일

- `src/actions/auth.action.ts` — `signUpAction`에 `emailRedirectTo: ${siteUrl}/auth/callback?next=<redirect>` + `phone_number` 메타(빈 값 제외) 추가
- `src/app/(auth)/sign-up/_component/InfoStep.tsx` — 휴대폰 OTP 목업 제거(인증받기·코드칸·타이머·`secondsLeft`), phone을 signUpAction에 선택 전달
- `src/app/(auth)/sign-up/_component/CompleteStep.tsx` — "가입 완료"에서 "메일 확인 안내"로 문구·동작 변경 (아직 미인증 상태)
- `src/app/auth/confirm/route.ts` (신규) — `verifyOtp({ token_hash, type })`로 이메일 확인 + 세션 생성. type 기본값 'signup'. open-redirect `next` 가드. **code 교환(callback)이 아니라 token_hash를 쓴다 — 아래 D1**
- `src/app/auth/callback/route.ts` — `next` open-redirect 최소 가드 추가 (기존 활성 부채 해소, OAuth 콜백에도 적용 — Codex 지적)
- `supabase/config.toml` — `enable_confirmations = true`, redirect allowlist에 `/auth/callback`·`/auth/confirm` 추가
- (수동) dev Supabase 대시보드 — Confirm email on + Redirect URLs에 `/auth/confirm` + Confirm signup 템플릿을 `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup`(token_hash 링크)로 교체
- `src/app/(auth)/sign-up/complete/page.tsx` (신규, D2) — 인증 성공 후 완료 화면. `next` 재검증(`safeInternalPath`) + 세션에서 이름 조회
- `src/app/(auth)/sign-up/_component/ConfirmedWelcome.tsx` (신규, D2) — 완료 화면 UI. 스텝 3 배지·애니메이션 재사용, 시작하기 버튼이 `next`로 이동
- `src/services/auth/index.ts` (신규, D2) — `getSessionUser()` 연결부(seam). app이 apis를 직접 못 부르는 레이어 규칙 때문에 두 층을 잇는다

## 의사결정 로그

- **D1 — 이메일 확인을 code 교환이 아니라 token_hash로**
  - 문제: 처음엔 `/auth/callback` + `exchangeCodeForSession(code)`(PKCE)로 설계했다. E2E에서 확인 링크가 `/auth/auth-code-error`로 떨어졌다. PKCE code 교환은 **가입을 시작한 브라우저에만 저장된 `code_verifier`**가 있어야 하는데, 확인 메일은 가입 때와 다른 브라우저나 기기에서 열릴 때가 많다. 테스트도 headless로 가입한 뒤 다른 브라우저에서 링크를 눌렀다. Supabase 로그: `user_confirmation_requested` 200이지만 앱 세션 생성 실패. 첫 devseong2는 `email_confirmed_at`이 채워졌는데도(서버 확인됨) 앱은 에러 화면을 보였다.
  - 해결: Supabase가 SSR 이메일 확인용으로 권장하는 **token_hash 방식**으로 바꿨다. `/auth/confirm` 라우트가 `verifyOtp({ token_hash, type })`로 서버에서 직접 검증해 세션까지 만든다. 브라우저에 묶인 값이 없어 **어느 기기에서도** 확인된다. Codex 계획 검증이 이 갈림길(question a)을 미리 짚었다.
  - 결과: 재테스트에서 링크 클릭 → 홈 로그인 착지 + `email_confirmed_at` 채워짐 확인. 템플릿의 `{{ .Type }}`는 표준 변수가 아니라 빈 값으로 나와 한 번 더 실패했고, 라우트 type 기본값을 'signup'으로 둬 방어했다.

- **D2 — 이메일 인증 뒤 홈으로 곧장 보내는 대신 완료 페이지를 거친다**
  - 문제: 인증 도입 전에는 위저드 스텝 3이 "가입 완료" 화면이었다. 인증을 넣으며 스텝 3은 "메일을 확인하세요" 안내로 바뀌었고, `/auth/confirm`은 검증 뒤 곧바로 `next`(기본 홈)로 리다이렉트했다. 사용자가 링크를 눌러도 아무 피드백 없이 홈에 도착해 가입이 됐는지 알 수 없었다(사용자가 직접 확인).
  - 해결: `/auth/confirm`이 검증 성공 시 `next`로 바로 보내지 않고 `/sign-up/complete`(완료 화면)를 거치게 했다. `verifyOtp`가 세션까지 만들어 이미 로그인된 상태이므로, "가입이 완료됐어요 · {이름}님 환영합니다 · 시작하기" 화면을 한 번 보여주고 시작하기 버튼으로 원래 `next`로 이어준다. 이름은 세션에서 읽는다 — URL로 넘기면 개인정보가 쿼리에 노출된다.
  - 결과: 인증 직후 "가입이 완료됐어요" 화면이 떠 가입 성공을 바로 확인한다. 완료 화면은 `(auth)/sign-up/complete`에 둬 `(auth)` 가운데 정렬 레이아웃을 상속한다(`src/app/auth/`는 레이아웃이 없다). 스텝 3과 배지·애니메이션 스타일을 그대로 재사용해 중복이 없다.

## Non-goals

- 6자리 코드(verifyOtp) 방식 — 사용자가 링크 방식 선택
- 휴대폰 인증 — 선택 연락처로만 저장, 검증 안 함
- 가입 닉네임(`username`) 미저장 문제 — 이번 작업 전부터 있던 별개 이슈, 범위 밖
- 미확인 로그인 시 "인증 메일 재전송" CTA — `error.ts:9`에 안내 메시지는 이미 있음. 재전송 버튼은 후속

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 반영 완료
- **현재 판단**: 접근(링크·emailRedirectTo=/auth/callback·phone_number 메타·step 3 안내 전환)은 맞다고 확인. 놓친 3건 반영 — (1) redirect allowlist에 `/auth/callback` 추가(config.toml엔 site_url·127.0.0.1만 있어 미설정 시 링크 거부), (2) `/auth/callback` open-redirect 부채를 이번에 이 콜백을 인증 경로로 쓰므로 최소 가드로 함께 닫음, (3) 빈 phone은 metadata에 안 넣음. 미확인 로그인 에러 메시지는 `error.ts:9` `email_not_confirmed`로 이미 있음(재전송 CTA만 후속).
- **다음 행동**: WORK 진입

## 단계별 체크리스트

- [x] 1. `signUpAction`: `emailRedirectTo: ${siteUrl}/auth/callback?next=<redirect>` + phone 비어있지 않을 때만 `data.phone_number` 추가 + siteUrl 미설정 가드
- [x] 2. `InfoStep`: 휴대폰 OTP 목업 제거(타이머·인증받기·코드칸), phone 선택 입력으로 `signUpAction`에 전달. `SignUpWizard`가 `redirect` 전달
- [x] 3. `CompleteStep`(step 3): "이메일을 확인해 주세요" 안내로 재작성 — 받은 주소·스팸함 안내·로그인 버튼. `SignUpWizard`는 email만 전달
- [x] 4. `/auth/confirm/route.ts` 신규 + `/auth/callback` next 가드. emailRedirectTo를 `/auth/confirm`으로 (D1)
- [x] 5. `config.toml`: `enable_confirmations = true` + allowlist에 `/auth/callback`·`/auth/confirm`
- [x] 6. (수동) dev Supabase: Confirm email on + Redirect URLs `/auth/confirm` + Confirm signup 템플릿 token_hash 링크로 교체
- [x] 7. 브라우저 E2E 통과 (아래). `verify-task` 클린 빌드만 dev 정지 후 남음

## Verification

- `node scripts/verify-task.mjs signup-email-confirm`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: Codex 계획 검증 후 갱신

## Codex 1차 검증

- **결론**: Claude 직접 검토로 대체
- **현재 판단**: diff 순 -36줄이 계획 단계에서 Codex가 검증한 메커니즘(emailRedirectTo=/auth/callback·phone_number 메타·step 3 안내 전환·next 가드)을 그대로 옮긴 것. auth 고위험이나 신규 구조 없음. 사용자가 원하면 Codex 1차 재요청 가능.

## Claude 2차 검증

- **최종 판단**: 브라우저 E2E 통과 (verify-task 클린 빌드는 dev 정지 후)
- **현재 판단**: ESLint 0 error(react-hook-form `watch()` 경고 1건은 기존 부채), tsc에서 `/auth/confirm`과 `EmailOtpType` 관련 오류가 없다.
- **브라우저 E2E** (localhost:3000, dev 프로젝트, devseong2@gmail.com):
  - 회원가입 → "이메일을 확인해 주세요" 화면 (세션 없음), 확인 메일 발송(발신자 "대구동남교회").
  - 첫 시도 code 교환 방식은 `/auth/auth-code-error`로 실패 → token_hash로 전환(D1).
  - 재시도: 링크 클릭 → `/auth/confirm` → verifyOtp → **홈 로그인 착지**. `auth.users.email_confirmed_at` 채워짐, `profiles.phone = 010-1234-5678` 저장 확인 (Supabase 실측).
- **다음 행동**: dev 정지 후 verify-task → 커밋 승인 요청

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

## ADR 판단

- **불필요**. `src/services/auth/index.ts`는 새 경로지만 기존 레이어 규칙(app → services → apis)을 따르는 얇은 seam일 뿐이다. 새 라이브러리·패턴·레이어 경계 변경이 없다. `getSessionUser()`는 `apis/auth-server`의 `getUserSession()`을 그대로 전달한다.

## 후속 작업

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

