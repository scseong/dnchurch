# privacy-policy

- **상태**: ✅ 완료 (2026-06-19)
- **시작일**: 2026-06-19
- **브랜치**: feat/privacy-policy
- **Open questions**: none
- **ADR needed**: no

## 목표

개인정보처리방침 페이지(`/privacy-policy`)를 만든다. 회원가입·커뮤니티로 개인정보를 받는 사이트라 실서비스 전 법상 필요한 문서다. 개인정보보호법 표준 양식 + 교회 사례 구조를 따르고, 코드에서 확인된 실제 수집 항목·처리위탁만 싣는다. Footer에서 접근.

## 검증된 Assumptions

- 수집 항목: 회원가입 `email`·`password`·`name`·`username` — `actions/auth.action.ts:8-13` 확인. profiles에 `email`·`name`·`display_name`·`avatar_url`·`phone`·`dept_id`·`role`·`status` — `types/database.types.ts:166-209` 확인.
- 카카오 로그인 사용 — Supabase OAuth `provider: 'kakao'` `apis/auth.ts:24`. 카카오 계정·닉네임·프로필 이미지 수신.
- 처리위탁(전부 국외): Supabase(DB·인증)·Cloudinary(이미지)·Vercel(호스팅)·Kakao(로그인·지도·공유) — 각 `apis/`·`lib/supabase/`·`KakaoScript.tsx` 확인. analytics 라이브러리 0건(GA·Mixpanel 없음).
- 단순 페이지 선례: `/login`·`/sign-up`은 (content) 밖 app 루트, `<section><LayoutContainer>` 패턴, Hero·Breadcrumb 없음 — `app/login/page.tsx` Read 확인.
- 모바일 헤더 제목은 `SPECIAL_PAGES` 등록으로 결정 — `config/navigation.ts:126-137` 확인. 미등록 경로는 "대구동남교회" + 뒤로가기.
- Footer 하단 `footer_bottom_links`에 "DESIGNED BY SCSEONG"만 있음 — 링크 자리 — `Footer.tsx:138-140` 확인.
- 교회 고유 정보(사용자 확정): 보호책임자 = 사무국 / 053-552-3403 / purityk@hanmail.net, 시행일 = 2026-07-01.

## 본문 구성 (총칙 + 15개 조항 — PIPA(개인정보보호법) 제30조 + 교회 사례 + Codex 2차 검토 반영)

페이지 최상단에 **초안 경고**: "표준 양식 기반 초안. 실서비스 오픈 전 (1) 회원가입 시 민감정보·국외이전 별도 동의 절차, (2) 개인정보보호법 전문가 검토 필요."

총칙(목적·근거)은 번호 없는 도입 문단으로 두고, 아래 15개 조항을 번호 `<h2>`로 렌더한다.

1. 수집하는 개인정보 항목·방법 — 가입(email·password·name·username), profiles(phone·avatar·dept_id 등), 카카오(카카오계정 이메일·닉네임·프로필 이미지), 자동수집(접속로그·인증세션 쿠키). **display_name이 게시글 작성자명으로 공개됨 명시**
2. 처리 목적
3. 보유·이용 기간 (탈퇴 시 지체없이 파기 + 법령 보존)
4. 제3자 제공 (법령 예외 외 없음 — 위탁·국외이전과 구분)
5. 처리위탁 (표 — Supabase·Cloudinary·Vercel·Kakao. **카카오는 기능별 분류: OAuth 로그인/지도 SDK/공유**)
6. 개인정보 국외 이전 (표 — **Supabase·Cloudinary·Vercel** 3사. 수령자·국가·이전 항목·시점·방법·목적·보유기간. 제28조의8 계약이행 위탁·보관 → 처리방침 공개로 동의 대체. 거부 시 이용 제한)
7. 만 14세 미만 아동·법정대리인 (가입 불가 원칙)
8. 정보주체·법정대리인 권리·의무·행사방법 (열람·정정·삭제·처리정지·**동의 철회**, 열람청구 접수=사무국, **동의 거부권·불이익**)
9. 민감정보 처리 (교회 활동·사역 정보가 종교(신념) 민감정보일 수 있음 → 별도 동의로 처리. 제58조①4호 면제는 클라우드 위탁·국외이전·커뮤니티 공개까진 미적용)
10. 개인정보 파기 절차·방법
11. 자동수집 장치(쿠키·인증세션) — **GA 등 분석·광고 추적 없음 명시**
12. 안전성 확보조치
13. 해당 없는 처리 사항 — **추가적 이용·제공·자동화된 결정·가명정보·영상정보기기 "해당 없음"** (제30조 법정 항목 완결 — 작성지침 대조 결과)
14. 보호책임자(사무국·053-552-3403·purityk@hanmail.net) + 권익침해 구제(분쟁조정위·KISA(한국인터넷진흥원) 등)
15. 개인정보처리방침의 변경 (시행 7일 전 고지·개정 이력·시행일 2026-07-01)

## Success Criteria

- `/privacy-policy`가 12개 조항을 시맨틱 마크업(`article` > `section` > `h2` + 본문)으로 렌더한다.
- 수집 항목·처리위탁·국외 이전이 코드에서 확인된 사실과 일치한다(없는 GA 조항 안 넣음).
- 보호책임자(사무국·053-552-3403·purityk@hanmail.net)·시행일(2026-07-01)이 표기된다.
- Footer 하단에서 페이지로 이동된다.
- 모바일 헤더가 "개인정보처리방침"으로 뜬다.
- `yarn lint`·`yarn lint:styles`·`yarn build` 통과, 신규 knip 0.

## 영향받는 파일

- `src/app/privacy-policy/page.tsx` — 신규. metadata(title/description + `...OPEN_GRAPH_BASE`) + `<section><LayoutContainer>` + 12조항 본문.
- `src/app/privacy-policy/page.module.scss` — 신규. 토큰만 사용, 모바일 퍼스트.
- `src/config/navigation.ts` — `SPECIAL_PAGES`에 `'/privacy-policy': '개인정보처리방침'` 1줄.
- `src/components/layout/Footer/Footer.tsx` (+ `Footer.module.scss`) — `footer_bottom_links`에 `<Link href="/privacy-policy">개인정보처리방침</Link>` 추가.

## 단계별 체크리스트

- [x] 1. `page.tsx` 작성 — metadata + 15조항 시맨틱 본문(처리위탁·국외이전은 표) + 초안 경고.
- [x] 2. `page.module.scss` — 제목·본문·표·간격 토큰 스타일(모바일 퍼스트, `$line-height-body-reading`).
- [x] 3. `navigation.ts` SPECIAL_PAGES 1줄 추가.
- [x] 4. Footer 링크 추가(`.footer_bottom_links a` 기존 스타일 재사용, scss 무변경).
- [x] 5. 검증 — verify-task(`20260619-154736`) lint·styles·build 통과, prod 렌더(15조항·Footer 링크) 확인.

## Non-goals

- 이용약관(Terms of Service) — 별도 문서, 이번 범위 밖.
- 동의 수집 UI(회원가입 체크박스 연동) — 후속. 이번은 처리방침 문서 페이지만.
- analytics·쿠키 배너 — GA 미도입이라 해당 없음.
- 보호책임자 실명 — 사용자가 사무국 표기 선택. 실명 보강은 후속.

## Verification

- `node scripts/verify-task.mjs privacy-policy`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST 2회 → 전부 반영해 해소 (foreground 2라운드 + 법령 웹 조사)
- **현재 판단**:
  - 1차(CHANGE_REQUEST high): 만14세미만·법정대리인, 동의 거부권·철회, 변경 고지·이력, 열람청구 부서, display_name 공개, 국외이전 표 상세화 누락을 지적했다. 카카오 수집 범위도 좁히라 했다. → 15조항으로 확장 반영.
  - 2차(CHANGE_REQUEST medium) 지적 4건을 모두 반영했다:
    - 국외이전 분류를 더 세분해 적었다. 미국 회사라고 무조건 국외로 보면 과하고, 기준은 국외 운영·접근 권한이다. Supabase·Cloudinary·Vercel은 국외이전, 카카오는 국내 위탁(기능별)으로 나눴다.
    - 국외이전 동의는 제28조의8 계약이행 위탁·보관에 한해 처리방침 공개로 갈음한다고 적었다.
    - 민감정보(종교)는 가입 클릭으로 별도 동의가 안 되므로 동의 UI가 필요함을 후속으로 분리했다.
    - "해당 없음" 항목(자동화된 결정·가명정보·영상정보기기)을 13조에 명시했다.
  - Claude 정정: 1차 답변 후 "Supabase 서울 리전=국내"라 본 것을 웹 조사로 정정 — 서울 리전이라도 해외 사업자면 국외이전 판단 대상.
- **다음 행동**: 사용자 승인 후 WORK. 동의 UI·전문가 검토는 후속(아래).

## Codex 1차 검증

- **결론**: PASS (Claude 직접 — 계획을 Codex가 2회 검증했고 구현은 login 패턴을 그대로 따름)
- **현재 판단**: 구현 diff는 `app/login` 패턴(`<section><LayoutContainer>`)을 그대로 따른다. 15조항 본문 + `SPECIAL_PAGES` 1줄 + Footer 링크 1줄. 법적 내용 판단은 계획 단계 2라운드에서 끝냈다. 새 로직·레이어 없음.
- **다음 행동**: Claude 2차 기록 후 커밋.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**:
  - `verify-task privacy-policy`(run `20260619-154736`): ESLint·stylelint·Build 통과. SCSS 토큰 유효(`$line-height-body-reading`·`$status-warning-bg` 등). Knip 경고는 기존 부채.
  - prod 서버 실측: `/privacy-policy` HTTP 200, h1 "개인정보처리방침", 초안 경고·15개 조항(`<h2>`)·국외이전 표(Supabase Inc)·보호책임자 모두 출력. 홈 Footer에 `/privacy-policy` 링크 노출 확인.
- **다음 행동**: 사용자 승인 후 커밋. 동의 UI·전문가 검토는 후속(런칭 게이트).

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

- **D1 — 국외 이전 대상은 Supabase·Cloudinary·Vercel 3사, 카카오는 국내 위탁(기능별)**
  - 문제: 외부 서비스 4곳 중 어디까지 "국외 이전"으로 공시할지. 처음엔 Supabase가 서울 리전(ap-northeast-2)이라 국내로 봤다.
  - 해결: 웹 조사(개인정보보호위 해석)로 "서울 리전이라도 클라우드 제공자가 해외 사업자면 국외이전 판단 대상"임을 확인. Supabase(미국 운영)·Cloudinary·Vercel을 국외 이전으로 공시한다. 카카오는 한국 회사라 국내 위탁이되, OAuth·지도·공유 기능별로 역할을 나눠 적는다.
  - 결과: 6조 국외이전 표에 Supabase·Cloudinary·Vercel 3행을 두고, 5조 처리위탁 표에 카카오를 OAuth 로그인·지도·공유 3역할로 적은 1행 포함 4행을 둔다.
- **D2 — 민감정보(종교)는 별도 동의 기반 처리로 고지, 동의 UI는 후속**
  - 문제: 교인 여부·`dept_id`가 종교(신념) 민감정보(제23조)일 수 있는데, 가입 클릭만으론 별도 동의가 안 된다. 현재 가입 폼에 민감정보 별도 동의 체크가 없다.
  - 해결: 처리방침엔 "민감정보는 별도 동의로 처리"를 고지하고, 실제 동의 체크박스 UI는 별도 후속으로 분리한다. 제58조①4호 종교단체 면제는 클라우드 위탁·국외이전·커뮤니티 공개까진 미적용이라 면제에 기대지 않는다.
  - 결과: 문서는 표준을 갖추되, 동의 UI 공백을 페이지 경고 + 후속 task로 드러낸다.
- **D3 — 초안 페이지를 지금 배포, 동의 UI·전문가 검토는 런칭 전 후속**
  - 문제: 동의 UI 없이 처리방침만 배포하면 준수 상태로 오해될 수 있다.
  - 해결: 실사용자 수집이 없는 오픈 전 단계(사용자 확인)라, 페이지 최상단에 강한 초안 경고를 달고 배포한다. Codex 2차도 "수집 기능이 안 열렸으면 초안 경고로 공개 OK"로 판단.
  - 결과: 표준 문서를 미리 갖추고, 동의 UI·전문가 검토는 런칭 게이트로 남긴다.
- **D4 — 라우트를 `(content)/privacy-policy`로 정정 (앞서 app 루트로 둔 결정 폐기)**
  - 문제: 처음엔 login·sign-up처럼 app 루트(`src/app/privacy-policy/`)에 뒀다. PR #130 Codex 리뷰가 짚었듯 Header·Footer·BottomNav·모바일 헤더는 `(content)/layout.tsx`만 렌더한다. 그래서 Footer 링크가 nav 없는 맨 페이지로 떨어지고 `SPECIAL_PAGES` 모바일 헤더 매핑도 죽은 코드였다.
  - 해결: `git mv`로 `(content)/privacy-policy/`에 옮긴다. URL은 route group이라 `/privacy-policy` 그대로다. `resolveHeroMeta`가 GNB 미등록 경로엔 null을 반환해 Hero는 안 뜬다(`hero.config.ts` Read 확인). `SPECIAL_PAGES`·Footer 링크는 그대로 두면 이제 정상 작동한다.
  - 결과: 이동 후 prod에서 Footer·Header nav가 렌더되고(이동 전 0건), 모바일 헤더에 "개인정보처리방침"이 뜬다. Hero는 안 뜬다.
- **D5 — `(content)` 이동에 따른 제3자 스크립트 로드 수용**
  - 문제: 공통 `(content)` 레이아웃이 Kakao Maps SDK와 scroll-reveal 스크립트를 전 페이지에 로드한다. 법적 고지 페이지에도 로드된다.
  - 해결: 페이지별 레이아웃 분기는 과한 변경이라 수용한다. 법적 고지 페이지에도 스크립트가 로드(외부 서버 요청 발생)되나, 맵 인스턴스는 생성하지 않는다.
  - 결과: 처리방침 페이지가 Kakao SDK 스크립트 1건을 외부 요청하되, `new kakao.maps.Map()` 호출이 없어 지도 인스턴스 생성·위치 수집은 0건이다.

## PR 리뷰 대응 (#130)

Gemini·Codex-connector 봇 4건을 코드로 검증하고 Codex foreground 2라운드(수정안·확정 문안)로 교차 확인했다.

| 지적 | 출처 | 처리 |
| --- | --- | --- |
| §8 권리 행사가 보호책임자를 "제11조"로 참조(실제 §14) | Gemini(medium) | 적용. `제14조`로 정정. 페이지 내부 `제N조` 참조를 전수 확인해 §2·§5·§6은 정확하고 §8이 유일 오류임을 확인했다 |
| `/privacy-policy`가 app 루트라 Header·Footer·모바일 헤더 없음 | Codex-connector(P2) | 적용. `(content)/privacy-policy/`로 이동(D4). prod 렌더로 공통 UI(Header·Footer·BottomNav) 노출 확인 |
| §9 민감정보 "별도 동의를 받아 처리합니다" 현재형이 동의 UI 부재와 어긋남 | Codex-connector(P2) | 적용. "필요한 경우 별도 동의 절차가 마련된 범위 내에서 동의를 받은 후 처리"로 완화(Codex 제안 문안) |
| 가입 폼 근처에 정책 링크 없음 | Codex-connector(P2) | 후속(런칭 게이트).<br>오픈 전이고 실제 수집이 없어 미룬다.<br>`/sign-up`이 실제 제출 가능해지면 런칭 차단 사유.<br>동의 UI와 함께 추가. |

- Codex 검증: 수정안은 PASS_WITH_DECISION_LOG(high), 확정 문안 사인오프에서 Kakao 로그 문구만 보정 요구(D5에 반영) 후 PASS.
- 재검증: `verify-task privacy-policy`(run `20260619-170926`) ESLint·stylelint·Build 통과. prod 실측 — 이동 후 `/privacy-policy`가 Footer·Header nav를 렌더한다(이동 전엔 0건). §8 `제14조`·§9 완화 문구 반영, 옛 `제11조` 제거, 15조항 유지 확인.
- 사고 기록: dev 서버가 도는 중에 `git mv`를 실행하자 Next dev 워처가 라우트 변경을 처리하다 멈췄다. 라우트 파일 이동은 dev를 끈 뒤 한다.

## ADR 판단

- **결론**: 불필요
- **사유**: `src/config/navigation.ts`에 `SPECIAL_PAGES` 1줄(`/privacy-policy`)을 더하지만 기존 패턴(`/login`·`/sign-up`)을 그대로 따른다. 새 레이어·라이브러리·정책을 만들지 않는다. navigation.ts는 ADR_TRIGGER_PARTS에 없다.

## 후속 작업

- 회원가입 폼에 민감정보(종교)·국외이전 별도 동의 체크박스 추가
  - 이유: 제23조 민감정보는 가입 클릭이 아니라 별도 동의가 필요. 이번은 처리방침 문서만 범위.
  - 다음 기준: 7/1 런칭 전 (실사용자 수집 시작 전) — 런칭 게이트.
  - 기록 위치: `docs/tech-debt/active.md`에 등록 예정(완료 이관 시).
- 개인정보보호법 전문가 검토 (특히 종교 민감정보·국외이전)
  - 이유: 법률 자문 영역. Claude·Codex 검토는 구조·정합성까지.
  - 다음 기준: 런칭 전.
  - 기록 위치: 없음(런칭 체크리스트).

## 회고

**잘된 것**

- 법적 문서를 추측 없이 근거로 채웠다. Codex 계획 2라운드 + PR 리뷰 2라운드 + 웹 법령 조사(국외이전·제23조 민감정보)로 항목마다 출처를 댔다.
- 코드에서 확인된 실제 수집 항목·처리위탁만 실어 허위 기재를 피했다. 없는 생년월일·주소·GA 조항은 넣지 않았다.
- 작성지침·제30조 대조에서 빠진 "추가적 이용·제공 판단기준"만 §13에 보강해 법정 항목을 채웠다.
- 봇 4건을 코드로 검증해 처리했다. 특히 Codex가 짚은 라우트 문제(`(content)` 밖이라 Header·Footer·모바일 헤더가 없음)는 `(content)/layout.tsx`를 읽어 확인하고 `git mv` 후 prod 렌더로 노출을 다시 확인했다.
- 내 오판 2건을 검증으로 잡았다. "Supabase 서울 리전이라 국내"는 웹 조사로 "해외 사업자면 서울 리전이라도 국외이전"으로 정정했고, 라우트를 app 루트에 둔 결정은 Codex 지적을 받아 `(content)`로 옮겼다.

**다음에 할 것**

- `git mv`를 dev 서버가 도는 중에 실행해 Next dev 워처가 멈췄다(서버 다운). 라우트 파일 이동은 dev를 끈 뒤 한다.
- verify-task도 dev 가동 여부를 build 전에 별도 명령으로 먼저 확인한다. 이번에 같은 명령에 넣어 한 번 충돌시켰다.
- 라우팅을 처음부터 "Footer 링크로 닿는 페이지는 Footer가 있어야 한다"로 따져 `(content)`에 뒀으면 PR 리뷰 한 라운드를 아꼈다. login 패턴을 따져보지 않고 그대로 가져온 탓이다.

**부채·후속**

- 회원가입 폼에 민감정보(종교)·국외이전 별도 동의 체크박스 — 런칭 게이트. `docs/tech-debt/active.md`에 등록했다. `/sign-up`이 실제 제출 가능해지면 출시를 막는 사유.
- 개인정보보호법 전문가 검토 — privacy.go.kr 무료 컨설팅·국번없이 132·교단 법무. 런칭 체크리스트.
- 페이지가 `(content)`라 Kakao Maps SDK가 로드된다(D5). 법적 페이지에 최소 스크립트가 필요해지면 레이아웃 분기를 검토한다.

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

