# auth-form-ui-migration

- **상태**: ✅ 완료 (2026-06-14)
- **시작일**: 2026-06-13
- **브랜치**: feat/ds-form-unification
- **Open questions**: none
- **ADR needed**: no — ui/ 변경이지만 ADR 0004 정책(선택적 prop 추가·콜러 영향 0 허용) 범위. 새 결정 없음

## 목표

auth 4폼(SignIn·SignUp·PasswordUpdate·EmailVerificationRequest)을 `components/form/` 레거시에서 `ui/TextField`+`ui/Button`으로 옮긴다. 입력 어휘를 ui/ 하나로 통일해 `ui/TextField`의 실사용을 0건에서 4폼으로 늘린다. 선행으로 `ui/Button`에 `loading`, `ui/TextField`에 `hideLabel`을 더한다.

## 검증된 Assumptions

- `components/form/` 소비처는 6곳 — auth 4폼 + `news/bulletins/_component/BulletinForm.tsx` + `file/ImageUpload.tsx`(FormAlertMessage만). `grep -rn '@/components/form' src` 결과. form/ 완전 제거는 이번 범위 밖이다.
- `ui/TextField`는 구조분해 후 나머지를 `<input {...inputProps}>`에 스프레드한다(TextField.tsx:47,83). react-hook-form `register`의 `ref`·`onChange`·`onBlur`·`name`이 input에 전달돼 RHF가 동작한다.
- `ui/Button`은 `ButtonHTMLAttributes` 확장 + `forwardRef`, `loading` 없음(Button.tsx:10,46).
- `@mixin blind`(sr-only: absolute·1px·clip)가 `_mixins.scss:37`에 있다.
- `common/Loader`는 spinner div를 그린다(Loader.tsx). 단 Loader에 색이 박혀 있어 navy 버튼 위에서 안 보인다. 그래서 currentColor를 따르는 스피너를 Button.module.scss에 따로 정의한다.
- auth 4폼은 `FormAlertMessage`를 폼-레벨 에러/성공에 쓴다(필드 에러 아님). EmailVerification은 success·error 둘 다. 각 폼 읽음.

## Success Criteria

- `ui/Button` `loading`: `loading`이면 스피너(`aria-hidden="true"`)를 보이고 children은 `@include blind`로 시각만 숨겨 accessible name을 유지한다. 버튼에 `disabled`·`aria-busy="true"`. 미지정 콜러는 변화 0(선택적 prop).
- `ui/TextField` `hideLabel`: `hideLabel`이면 `<label>`이 `@include blind`로 시각만 숨고 `htmlFor` 연결은 남는다.
- auth 4폼에서 `FormField`·`FormSubmitButton` import 0건 — `grep -rn "FormField\|FormSubmitButton" src/app/_component/auth` 0 hit. `FormAlertMessage`는 남는다.
- `node scripts/verify-task.mjs` ESLint·stylelint·Build 통과, 신규 회귀 0.
- **Claude in Chrome UI 검증**: `/login`·`/sign-up`·`/forget-password` 3페이지가 렌더되고 — 입력칸이 ui/TextField 모양, 제출이 ui/Button(navy primary, fullWidth), 콘솔 에러 0. 빈 입력 시 제출 비활성, 입력 시 활성. 전후 스크린샷 확보. (`/reset-password`는 Supabase 복구 토큰이 있어야 폼이 떠서 직접 렌더 검증은 비고로 둔다.)

## 영향받는 파일

- `src/components/ui/Button/Button.tsx` + `Button.module.scss` — `loading`
- `src/components/ui/TextField/TextField.tsx` + `TextField.module.scss` — `hideLabel`
- `src/app/_component/auth/SignInForm.tsx`
- `src/app/_component/auth/SignUpForm.tsx`
- `src/app/_component/auth/PasswordUpdateForm.tsx`
- `src/app/_component/auth/EmailVerificationRequestForm.tsx`

## Non-goals

- `BulletinForm`·`ImageUpload` 마이그레이션 — 후속(content 폼).
- `components/form/` 디렉토리 제거 — 위 둘이 남아 불가.
- `ui/Alert`(폼-레벨 알림) 신설 — `FormAlertMessage` 유지.
- ESLint raw-primitive 금지 규칙 — 별도 작업.
- 폼 검증 로직·action 호출 변경 — RHF `register`/`handleSubmit`/`onSubmit`은 그대로. 컴포넌트만 교체.

## 단계별 체크리스트

- [ ] 1. `ui/Button`에 `loading` 추가 — `loading`이면: ① `.spinner`(currentColor·`aria-hidden="true"`) 렌더 ② children을 `.blind_label`(`@include blind`)로 감싸 시각만 숨김(SR은 읽음) ③ `disabled` ④ `aria-busy="true"`. 미지정 콜러 영향 0 확인.
- [ ] 2. `ui/TextField`에 `hideLabel` 추가 — `.label_hidden`에 `@include blind`. 미지정 시 기존과 동일.
- [ ] 3. `SignInForm` 교체 — email·password를 `<TextField hideLabel>`, 제출을 `<Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!isValid}>`. FormAlertMessage 유지.
- [ ] 4. `SignUpForm` 교체 — 5필드 라벨 표시, 동일 버튼 패턴. `watch`/`setError` 로직 유지.
- [ ] 5. `PasswordUpdateForm` 교체 — 2필드, 동일 패턴.
- [ ] 6. `EmailVerificationRequestForm` 교체 — email `hideLabel`, 버튼 `loading` + 동적 label(`getButtonContent`)·`disabled={!isValid || isRunning}`.
- [x] 7. `node scripts/verify-task.mjs auth-form-ui-migration` — ESLint·stylelint·Build ✅ (run-id 20260613-222314). ✅
- [x] 8. **Claude in Chrome UI 검증** — `/login`·`/sign-up`·`/forget-password` 렌더·register 동작·콘솔 확인 완료(앱 에러 0, Trancy 확장 경고만). reset-password는 토큰 필요로 미검증. ✅

## Verification

- `node scripts/verify-task.mjs auth-form-ui-migration`
- Claude in Chrome: dev 서버 띄우고 3페이지 렌더·콘솔 에러 0·전후 스크린샷. a11y 변경(label 숨김·aria-busy)은 Codex 1차 검증에서 교차 확인.

## ADR 판단

- ADR needed: no — `src/components/ui/`는 ADR_TRIGGER_PART이나, ADR 0004 운영 정책 "prop 추가는 콜러 영향 없는 선택적 prop이면 OK, 시그니처 파괴만 ADR 후보"에 해당한다. `loading`·`hideLabel` 둘 다 선택적·기본 미동작이라 기존 콜러 변화 0. 새 ADR 불요. 단 a11y 동작 변경(label 숨김·aria-busy)이라 ui-components SKILL의 "a11y 동작 변경 시 Codex 1차 검증 필수" 적용.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 1건 반영. `ui/Button.loading`이 children을 스피너로 대체하면 버튼 accessible name이 비어 a11y 회귀가 공용 API로 전파됨 → 옵션 A 채택(스피너 `aria-hidden`, children은 `@include blind`로 유지).
- **현재 판단**: 5체크 중 SC만 material(accessible name 보존 누락), 나머지 PASS. hideLabel·레이아웃·스코프 리스크는 Codex가 부재로 확인.
- **다음 행동**: WORK 진입 — step 1 Button loading부터(옵션 A).

## Codex 1차 검증

- **결론**: PASS (confidence high). a11y(loading accessible name 보존·hideLabel htmlFor 유지·`aria-busy`)·RHF register 스프레드·필드 속성 보존·외과적 변경 모두 머지 차단 이슈 0.
- **현재 판단**: 옵션 A 구현이 의도대로 — 스피너 `aria-hidden` + children `@include blind`로 EmailVerification 동적 라벨도 SR이 읽는다. register 덮어쓰기 위험 없음.
- **다음 행동**: VERIFY — verify-task 통과(run-id 20260613-222314), Claude in Chrome UI 검증 진행.

## Claude 2차 검증

- **최종 판단**: 통과 — verify-task(lint·stylelint·build) + Claude in Chrome 3폼 시각·동작 검증 완료. 머지 가능.
- **현재 판단**: 아래 표. `/login`은 타이핑→버튼 navy 활성화로 register 연결까지 확인. 콘솔 에러 1건은 Trancy 확장의 `trancy-version` 하이드레이션 불일치(앱 무관, 에러 메시지가 extension 원인 명시).
- **다음 행동**: 커밋 승인 요청.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260613-222314 | ✅ | ✅ | ✅ | 0 | Chrome `/login`·`/sign-up`·`/forget-password` 렌더·register 동작 ✅ / `/reset-password`는 복구 토큰 필요로 미검증 |

## 회귀 수정 — 폼 필드 세로 간격이 0으로 붙음

- **문제**: ui/ 이관 후 auth 4폼의 입력칸·버튼이 세로 간격 0으로 붙었다. 레거시 `FormField`가 갖던 `margin-bottom: $spacing-12`가 사라졌다. `ui/TextField`는 외부 margin을 두지 않는데(컴포넌트가 외부 간격을 소유하지 않는 설계), `<form>`도 그 간격을 대신 주지 않았다.
- **발견**: Claude in Chrome으로 BEFORE(`develop`)/AFTER 헤드리스 캡처를 비교하던 중 사용자가 패딩이 깨졌다고 지적했다.
- **해결**: auth 4폼 공용 `src/app/_component/auth/authForm.module.scss`를 새로 만들어 `.form { display: flex; flex-direction: column; gap: $content-gap-s }`(12px — 레거시 값과 동일)을 정의하고, 4폼의 `<form>`에 `className`을 붙였다. RHF·제출 동작은 그대로다.
- **결과**: 헤드리스 재캡처로 `/login`(hideLabel)·`/sign-up`(라벨 5필드) 간격이 복원됐다(라벨↔입력 8px < 필드↔필드 12px). stylelint PASS, eslint 0 error(경고 4건은 기존 `watch()`·exhaustive-deps 부채), tsc 0 error. production build는 사용자 dev 서버의 `.next` 충돌을 피하려고 보류했다.

## PR #119 리뷰 대응 (2026-06-14)

자동 리뷰(Gemini·Codex) 4건을 Codex 교차 검증과 브라우저 실측으로 판정했다.

- **TextField ref 전달 (Gemini HIGH) — 오탐**: React 19에선 `ref`가 일반 prop이라 `...inputProps`를 타고 `<input>`까지 흘러간다. 무효 폼을 강제 제출하니 email 칸에 포커스가 잡혔고, 이로써 React Hook Form(RHF)의 ref 전달을 실측 확인했다(`activeElement.id === 'email'`). 동작은 정상이나 ref가 드러나지 않게 전달돼서, 공용 컴포넌트의 안전을 위해 `forwardRef`로 직접 연결했다(`Button`과 같은 패턴). 호출부 영향 0.
- **noValidate 누락 (Gemini) — 타당**: `required`가 input에 네이티브 `required`를 걸어 브라우저 검증 말풍선이 RHF 커스텀 에러보다 먼저 뜬다. auth 4폼 `<form>`에 `noValidate`를 더했다. 실측 `form.noValidate === true`.
- **필드 에러 a11y (Codex) — 타당**: ui/TextField 에러 `<p>`에 `role={error ? 'alert' : undefined}`를 더해, onChange 에러가 스크린리더에 즉시 읽힌다. 실측 에러 `<p>` 2개 모두 `role="alert"`.
- **필드 간격 collapse (Codex)**: 위 "회귀 수정"(6992b9a)에서 이미 해결.

검증: eslint 0 error, tsc 0 error, 브라우저 실측 3건(ref 포커스·noValidate·role) 모두 통과.

## 검증 이력

<details>
<summary>2026-06-13 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST (confidence high)
- 이유: `ui/Button.loading`이 children을 스피너로 대체 → 버튼 accessible name이 비어 a11y 회귀가 공용 API로 전파.
- 조치: 옵션 A 채택 — 스피너 `aria-hidden`, children은 `@include blind`로 유지. SC·체크리스트 1 반영.

</details>

## 후속 작업

- `BulletinForm`(news/bulletins) → ui/TextField·Textarea·Button 마이그레이션
  - 이유: content 폼이라 auth와 분리. 파일 업로드 필드가 섞여 범위가 다르다.
  - 다음 기준: 본 task 머지 + BulletinForm 파일 업로드 필드 설계가 정리된 뒤 별도 exec-plan.
  - 기록 위치: 없음 (본 exec-plan 후속 작업)
- `ui/Alert` 신설 + `FormAlertMessage`·`ImageUpload` 이관 → `components/form/` 제거
  - 이유: 폼-레벨 알림은 필드와 다른 관심사. ui/ 알림 컴포넌트가 선행돼야 한다.
  - 다음 기준: 폼-레벨 알림이 3곳 이상에서 필요해질 때.
  - 기록 위치: 없음

## 회고

- **잘된 것**: `ui/TextField` 실사용을 0에서 4폼으로 늘려 입력 어휘를 ui/ 하나로 모았다. Button `loading`은 옵션 A(스피너 `aria-hidden` + children `@include blind`)로 accessible name을 보존했고(Codex 계획 검증 반영), Claude in Chrome으로 렌더·register·a11y·ref·noValidate를 실측했다.
- **다음에 할 것**: 컴포넌트를 교체할 때 "기존 외형을 누가 책임지나(margin/gap)"를 먼저 본다. 이번에 `FormField`의 `margin-bottom` 간격 손실을 놓쳐 폼이 붙었다. 그리고 가정은 실측으로 확인한다 — TextField ref가 spread로 전달된다고 exec-plan에 적었으나 React 19 의미를 검증하지 않았다.
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: 등록 완료. `ui/Button` disabled를 opacity로만 흐리게 해서 navy가 진해 비활성 구분이 약하다. `form/` 디렉토리가 남아 있다 — `BulletinForm`·`ImageUpload` 2개가 아직 ui/로 안 옮겨졌다.
