# new-family-form-hardening

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-29
- **브랜치**: feat/new-family-form-hardening
- **Open questions**: none
- **ADR needed**: no — ADR 0019(공개 anon write RLS) 패턴을 확장(컬럼·CHECK 추가·정책 범위 축소). 새 결정·라이브러리·레이어 변경 없음.

## 목표

새가족 공개 등록 폼의 입력 검증, 민감정보 동의, 제출 오류 처리를 강화한다. 다음 두 가지를 막는다.

- UI를 우회한 직접 액션 호출로 오염된 데이터가 쌓이는 것
- 종교적 신념 민감정보를 별도 동의 없이 수집해 `/privacy-policy` §9와 어긋나는 것

PR #134 리뷰에서 분리한 폼 항목(gemini·GitHub Codex·codex:rescue 공통 지적)을 처리한다.

## 검증된 Assumptions

- 액션은 현재 `name`·`phone`·`privacyAgreed`만 검증하고 `referralSource`·`interests`·`birthDate`는 그대로 insert — `src/actions/new-family.action.ts:19-38` Read.
- 마이그레이션은 `with check (privacy_agreed = true)`만 두고 길이·배열·허용값 CHECK가 없으며 정책이 `to anon, authenticated` — `supabase/migrations/20260629000000_create_new_family_registrations.sql` Read.
- `/privacy-policy` §9가 "교회 회원 여부·소속 부서·사역 정보는 종교적 신념 관련 민감정보(개인정보보호법 제23조)… 별도 동의 절차가 마련된 범위 내에서 동의를 받은 후 처리"라고 고지 — `src/app/(content)/privacy-policy/page.tsx:217-225` Read.
- `REFERRAL_OPTIONS`·`INTEREST_OPTIONS`는 `NewFamilyRegister.tsx:11-12`에 client 상수로만 존재 — 서버가 같은 목록을 못 본다.
- `handleSubmit`은 try/catch/finally 없이 `await` 뒤 `setSubmitting(false)` — reject 시 로딩·토스트 미복구 (`NewFamilyRegister.tsx:55-65`).
- zod 미사용 (memory `feedback_no_zod`) → 수동 런타임 검증 + TS 단언.

## Success Criteria

- [ ] 직접 액션 호출로 REFERRAL/INTEREST 목록 밖 값·6개 이상 `interests`·과길이 `name`/`phone`을 보내면 서버가 거부한다.
- [ ] 민감정보 동의 없이 `is_new_believer`/`interests`를 보내면 서버가 거부한다.
- [ ] 폼에 동의 체크박스(수집 항목·민감정보·목적·거부권 명시) + `/privacy-policy` 링크가 있다(동의 통합으로 게이팅 없음 — D7).
- [ ] 제출이 reject돼도 버튼이 풀리고 실패 토스트가 뜬다.
- [ ] DB가 빈 `name`/`phone`·과길이·6개 이상 `interests`·목록 밖 referral/interest를 CHECK로 거부한다(anon PostgREST 직접 insert 포함).
- [ ] 로그인한 사용자의 폼 제출도 정상 동작한다(RLS가 anon·authenticated 모두 허용).
- [ ] RLS 정책이 두 role의 insert를 허용하고 주석이 정책과 일치한다.
- [ ] 마이그레이션 적용 전 기존 dev row를 count로 점검하고, 게이트 위반 행이 있으면 정리한 뒤 CHECK를 추가한다.
- [ ] tsc·eslint·stylelint 통과.

## 영향받는 파일

- `src/constants/new-family.ts` — 신규. REFERRAL/INTEREST 옵션·길이 한도 공유 SSOT
- `src/actions/new-family.action.ts` — `input: unknown` 런타임 검증·whitelist·민감동의 게이트·try-catch, 반환 `{success, message}`
- `src/app/(content)/about/welcome/_component/NewFamilyRegister.tsx` — RHF + 공통 FormField 재작성, 동의 1개 통합
- `src/app/(content)/about/welcome/_component/NewFamilyRegister.module.scss` — 신규. pill·체크박스 중립 스타일
- `src/app/(content)/about/welcome/page.module.scss` — 죽은 warm 폼 스타일 제거(register_cta만 유지)
- `src/components/form/{FormField,FormSubmitButton,FormAlertMessage}.module.scss` — 공통 폼 치수 통일(4.2rem·1.3rem), FormField margin 제거, `$gray-200`→`$label-neutral-bg`
- `src/app/(content)/news/bulletins/_component/BulletinForm.module.scss` — FormField margin 제거 보정(.group gap)
- `supabase/migrations/20260630000000_harden_new_family_registrations.sql` — 신규. `sensitive_agreed` + CHECK 6종 + RLS 재생성
- `supabase/migrations/20260630000001_add_new_family_status.sql` — 신규. `new_family_status_enum` + `status` 컬럼 + RLS에 `status='pending'` 강제
- `src/types/database.types.ts` — `sensitive_agreed`·`status`·enum 반영

## 단계별 체크리스트

- [ ] 1. REFERRAL/INTEREST 옵션을 `src/constants/new-family.ts`로 추출하고 컴포넌트가 import한다.
- [ ] 2. 마이그레이션:
  - 적용 전 `select count(*)`로 기존 dev row 점검 — 게이트 위반 행(민감 데이터 + 미동의)이 있으면 정리(테스트 데이터라 삭제) 후 진행
  - `sensitive_agreed boolean not null default false` 컬럼 추가
  - CHECK 제약: name/phone·referral 길이, interests 배열 크기, 허용값(interests `<@`·referral `= ANY`), 민감동의 게이트 `NOT (is_new_believer OR coalesce(cardinality(interests), 0) > 0) OR sensitive_agreed`
  - `drop policy if exists` 후 정책 재생성(`to anon, authenticated` 유지, 주석 수정)
  - dev에 적용 → 타입 재생성
- [ ] 3. 액션: `input: unknown` 런타임 검증(이름·연락처·생년월일 형식·referral/interest whitelist·배열 cap·민감동의 게이트) + try-catch.
- [ ] 4. 컴포넌트: `BulletinForm` 패턴으로 재작성 — `useForm`(RHF) + `@/components/form`의 `FormField`/`FormSubmitButton`/`FormAlertMessage`. 이름·연락처·생년월일은 `FormField`(중립 톤), referral·interests pill과 동의·초신자 체크는 RHF에 연결. 민감동의 체크박스+정책 링크, 게이팅(미동의 시 비활성·해제 시 초기화), 제출은 `onSubmit` try/catch + `setError('root')`. 동의 문구에 수집 항목(신앙 상태·관심 영역)·목적·거부권 명시(§23). useState·로컬 옵션 상수 제거.
- [ ] 5. 검증: tsc·eslint·stylelint (+ dev 라우트 실측).

## 접근법

- 검증 위치를 3겹으로 둔다 — 컴포넌트(UX 가드), 서버 액션(허용값 대조·민감동의 게이트로 최종 검증), DB CHECK(구조 방어선). anon이 PostgREST로 액션을 우회해도 DB가 막는다.
- 민감 필드(`is_new_believer`·`interests`)는 동의가 있어야 서버·DB가 저장한다. UI 게이팅(비활성/숨김)은 동의 통합(D7)과 함께 걷어냈다.

## 의사결정 로그

- **D1 — 민감정보 동의를 별도 컬럼(`sensitive_agreed`)으로 기록한다**
  - 문제: `is_new_believer`·`interests`는 종교적 신념 민감정보(개인정보보호법 제23조)인데 폼이 일반 동의 하나만 받아 `/privacy-policy` §9 고지와 어긋난다.
  - 해결: 별도 동의 체크박스를 두고, 동의 사실을 `sensitive_agreed` 컬럼에 남기며, 서버와 DB 양쪽에서 게이트를 건다. 동의 없이는 민감 필드를 저장하지 못한다. 컬럼 없이 UI 게이팅만 두는 대안은 동의 사실을 증적으로 못 남겨 분쟁 시 입증이 안 되므로 택하지 않는다.
  - 결과: 앱이 방침과 일치하고, 민감정보 동의 사실이 행 단위로 남는다.
  - ⚠️ 정정(PR #135): 동의 UI는 D7(통합)·D8(조건부 분리)로 재설계 → D8 참조. 컬럼·CHECK 게이트는 유지.
- **D2 — 허용값을 서버와 DB 양쪽에서 검증한다 (Codex CR-D 반영)**
  - 문제: anon key는 클라이언트 번들에 노출돼 PostgREST 직접 INSERT로 서버 whitelist를 우회할 수 있다. 서버 검증만으로는 목록 밖 referral·interest가 직접 insert로 들어온다.
  - 해결: 서버 액션이 `src/constants/new-family.ts`로 허용값을 대조하고, DB CHECK에도 같은 허용 배열을 둔다(interests `<@` 허용배열, referral_source `= ANY`). 옵션 변경 시 마이그레이션이 한 번 더 필요한 결합은 받아들인다 — 옵션은 거의 안 바뀌고, 직접 insert 방어가 이 작업의 목적이다.
  - 결과: 직접 insert로도 목록 밖 값이 못 들어온다. DB CHECK 옆에 `src/constants/new-family.ts`와 동기화하라는 주석을 단다.
- **D3 — RLS 정책은 `to anon, authenticated`를 유지하고 주석을 고친다 (Codex CR-C 반영)**
  - 문제: 액션이 `createServerSideClient()`(세션 인식)를 쓴다. 로그인한 성도가 공개 welcome 폼을 제출하면 role이 `authenticated`라, 정책을 `to anon`으로 좁히면 그 제출이 막힌다.
  - 해결: 정책을 좁히지 않고 두 role을 유지하되, "anon-only"라던 주석을 "익명·로그인 사용자 모두 insert, 읽기는 service_role/admin 전용"으로 고친다. 원래 불일치는 주석 쪽이 틀린 것이었다.
  - 결과: 비로그인·로그인 제출이 모두 동작하고, 주석이 정책과 맞는다.
- **D4 — 클라이언트 폼을 RHF + 공통 `FormField`로 재작성한다 (사용자 제안)**
  - 문제: 현재 폼은 useState 묶음 + 손수 검증이라 저장소 폼 컨벤션(주보 `BulletinForm`·auth 폼)과 다르고, 제출 예외 처리도 빠져 있다.
  - 해결: `BulletinForm`처럼 `useForm`으로 상태·검증을 잡고 `@/components/form` 공통 UI를 쓴다. 폼 톤은 중립(globals)으로 통일한다 — BottomSheet(portal) children은 globals 토큰이 컨벤션이다(memory `feedback_portal_tokens`). 서버 액션·DB CHECK 검증은 그대로 둔다 — RHF는 클라이언트 UX라 우회할 수 있다.
  - 결과: 폼이 저장소 패턴과 맞고, 제출 예외 처리가 RHF `onSubmit` try/catch로 자연히 풀린다.
- **D5 — 공통 폼 UI 치수를 통일한다 (사용자 요청, 점진 개선)**
  - 문제: 공통 `FormField`의 자체 크기와 새가족 커스텀 컨트롤 크기가 달라 폼 높이가 들쭉날쭉했다. FormField가 `margin-bottom`을 갖고 컨테이너도 `gap`을 줘 여백이 두 배였다.
  - 해결: `FormField`·`FormSubmitButton`·`FormAlertMessage`를 높이 4.2rem·폰트 1.3rem으로 맞추고, FormField의 `margin-bottom`을 빼 간격을 컨테이너 `gap` 하나로 통일했다. `$gray-200`은 `$label-neutral-bg`로 바꿔 primitive 경고를 없앴다. 주보 `.group`은 gap을 줘 margin 제거를 보정했다.
  - 결과: 새가족·auth·주보 폼이 같은 치수를 쓰고 여백 중복이 사라졌다. 주보 폼의 기존 hex 하드코딩은 진행 순서상 그대로 둔다.
- **D6 — 등록 대응 상태(status) 컬럼을 추가한다 (사용자 요청)**
  - 문제: 상태 컬럼이 없으면 관리자가 모든 등록을 한 덩어리로만 봐서 연락·정착 여부를 못 가린다.
  - 해결: `new_family_status_enum`(pending·contacted·completed) + `status` 컬럼(기본 pending)을 별도 마이그레이션으로 추가. 공개 insert는 RLS `with check`에 `status='pending'`을 더해 anon이 직접 completed로 위장 insert하는 것을 막았다. 상태 변경은 service_role(admin) 경로다.
  - 결과: 등록 데이터가 상태와 함께 쌓인다. 조회·변경 관리자 UI는 후속.
- **D7 — 동의를 1개로 통합한다 (사용자 요청)**
  - 문제: privacy·sensitive 동의를 따로 받아 새가족 등록 흐름이 번거로웠다.
  - 해결: 체크박스 1개(consentAll)로 합치고, 제출 시 privacyAgreed·sensitiveAgreed를 모두 그 값으로 보낸다. 문구에 수집 항목·민감정보·목적·거부권을 담는다. "별도 동의"가 "포괄 동의"로 바뀌는 점은 편의 우선 결정이며, DB·서버 게이트는 그대로 강제한다.
  - 결과: 동의가 한 번으로 단순해지고, 민감 데이터 보호는 DB·서버가 유지한다.
  - ⚠️ 정정(PR #135): D7 폐기 → D8 참조. 통합 동의가 §23 위반 위험이라 조건부 필수 분리로 되돌림.
- **D8 — 민감정보 동의를 조건부 필수로 분리한다 (PR #135 리뷰 반영)**
  - 문제: 동의 1개(D7)는 개인정보보호법 §23의 "별도 동의"와 어긋난다. Codex·GitHub봇·`/privacy-policy §9`가 공통으로 지적했다.
  - 해결: 개인정보 동의(항상 필수)와 민감정보 동의(별도 체크박스)로 나눈다. 민감정보 동의는 초신자·관심 영역을 선택했을 때만 필수다(RHF validate + 민감 항목 변경 시 `trigger`). 안 쓰면 동의 없이도 제출된다.
  - 결과: §23 별도 동의를 지키면서 민감 항목을 안 쓰는 사용자는 체크 하나만 한다. 사용자가 통합으로 택했던 편의는 "민감 항목 사용 시에만 추가 체크"로 절충했다.

## ADR 판단

불필요 — ADR 0019(공개 anon write RLS) 패턴 확장(컬럼·CHECK 제약·RLS with-check 보강). 공통 `FormField` 치수 변경은 `src/components`라 ADR 트리거가 아니다. 새 라이브러리·레이어 경계·인증/캐시 정책 변경 없음.

## Verification

- dev 구동 중이면 `npx tsc --noEmit` + `npx eslint` + `npx stylelint` + dev 라우트 실측으로 대체(memory `feedback_no_build_during_dev`). dev 정지 시 `node scripts/verify-task.mjs new-family-form-hardening`.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (신뢰도 high) — material 3건을 계획에 반영해 해소했다.
- **현재 판단**: D3은 정책 유지 + 주석 수정으로 로그인 제출 회귀를 피하고, D2는 DB CHECK에 허용값을 더해 직접 insert를 막고, 마이그레이션은 적용 전 기존 row 점검·정리·`drop policy if exists` 순서를 넣었다. expression 3건(gate를 `coalesce(cardinality)`로, constants leaf 허용, §23 동의 문구)도 반영.
- **다음 행동**: 수정 계획으로 WORK 진입.

## Codex 1차 검증

- **결론**: PASS (신뢰도 high) — 통합 동의·공통 UI·status까지 포함한 최종 diff 재검증, material 0건.
- **현재 판단**: 통합 동의 매핑·status RLS·FormField margin 제거 영향·민감 게이트 네 가지를 확인했고 모두 정상이다(근거는 D1·D5·D6·D7). 마이그레이션 drop/create 사이 정책 공백은 RLS deny-by-default라 위험이 없고, 적용 중 일시 제출 실패 가능성만 있다.
- **다음 행동**: 무관 변경을 빼고 커밋.

## Claude 2차 검증

- **최종 판단**: PASS — tsc·eslint·stylelint 통과, DB CHECK 방어선·status 기본값 실측 통과.
- **현재 판단**: dev 구동 중이라 verify-task 대신 직접 실측했다(명령·결과는 아래 표). 통합 동의·공통 UI·status까지 반영한 최종 diff 기준. eslint 경고 1건(RHF `watch` + React Compiler)은 `BulletinForm`과 같은 패턴이라 에러 아님.
- **다음 행동**: 설교 SCSS·docs 무관 변경을 빼고 커밋한다.

| 시점 | 명령·실측 | 결과 |
| --- | --- | --- |
| 2차 | `npx tsc --noEmit` | ✅ exit 0 |
| 2차 | `npx eslint` (constants·action·component) | ✅ 0 error, 1 warning(RHF watch) |
| 2차 | `npx stylelint` (새가족·공통 폼 scss) | ✅ exit 0 (`$gray-200` 경고 해소) |
| 2차 | dev 직접 insert — 위반 3건<br>- 민감동의 게이트<br>- 허용 밖 interest<br>- 빈 이름 | ✅ 모두 CHECK 거부 |
| 2차 | dev 직접 insert — 정상 값 | ✅ 통과(삽입→삭제) |
| 2차 | dev insert — status 생략 | ✅ 기본값 `pending` |

## 검증 이력

<details>
<summary>2026-06-30 Codex 1차 (게이팅·분리 동의 버전)</summary>

- 판정: CHANGE_REQUEST
- 이유: 작업 트리에 무관 변경(설교 SCSS·docs) 혼입
- 조치: 새가족 파일만 스테이징해 범위 분리

</details>

## PR 리뷰 대응

PR #135 — gemini·GitHub Codex·codex:rescue 리뷰.

| 지적 | 출처 | 판정 | 조치 |
| --- | --- | --- | --- |
| 통합 동의가 §23 별도 동의와 어긋남 | Codex(HIGH)·GitHub봇(P1)·방침 §9 | 타당 | 개인정보 동의 + 민감정보 동의(조건부 필수)로 분리 — D8 |
| 마이그레이션이 기존 민감 행을 정리 안 하고 CHECK 추가 | Codex(HIGH)·GitHub봇(P1) | 대체로 해소 | - dev는 count=0 확인 후 적용 성공<br>- prod는 create→harden으로 빈 테이블에 적용<br>- 이미 적용된 파일은 드리프트 회피로 미수정(답글로 설명) |
| 액션이 파싱·검증·입출력을 한 함수에 담음(단일 책임 원칙 위반) | gemini(high) | 타당 | `validateAndParseNewFamily`로 분리 |
| interests 크기를 dedupe 전 미검증 | Codex(low) | 타당 | `rawInterests.length > max` 조기 거부 |
| onSubmit `data` 네이밍 모호 | gemini(med) | 타당 | `formValues`로 변경 |
| FormField name·phone `required` prop 누락 | gemini(med) | 타당 | `required` 추가(필수 표시) |

## 후속 작업

- 스팸 방지(captcha/rate-limit)
  - 이유: 이번 범위는 데이터 무결성·동의. 남용 방지는 별개 축.
  - 다음 기준: 공개 폼 악용 징후 또는 운영 요청 시.
  - 기록 위치: `docs/tech-debt/active.md`
- admin 새가족 조회 UI
  - 이유: 수집 측 강화가 먼저. 조회는 service_role 읽기 별도 작업.
  - 다음 기준: 등록 데이터가 쌓이기 시작할 때.
  - 기록 위치: 없음
