# p4-rendering-polish

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-02
- **브랜치**: refactor/p3-dead-code-cleanup (P3와 같은 PR로 묶음 — 사용자 결정)
- **Open questions**: none
- **ADR needed**: no — 컴포넌트 4곳 수정 + 죽은 파일 삭제. 레이어·캐시·인증·라이브러리 불변, next/dynamic은 기존 선례(LocationMapClient) 반복

## 목표

refactor-audit P4의 렌더링 폴리시를 적용한다. 홈 설교 썸네일을 저장소 표준(`<CloudinaryImage>`)으로 전환하고, PhotoSwipe 라이브러리를 주보 라우트 초기 청크에서 분리하고, 미메모 리렌더 2건을 잡고, 죽은 UserProfile 컴포넌트 4파일을 삭제한다.

## 검증된 Assumptions

- 홈 `SermonCard.tsx:23`에만 raw `<img>`가 남아 있다 — 같은 일을 하는 GridCard·SeriesEpisodeCard·SermonFeatured·SermonOtherByPreacher 4곳은 이미 `cloudinaryFetchUrl(getSermonThumbnail(...))` + `<CloudinaryImage>` 패턴 (`rg cloudinaryFetchUrl` 확인).
- 이미지 컨벤션은 `<CloudinaryImage>` 래퍼 — 사용처 11곳 vs `<Image>` 직접 1곳(NotFoundBackground, 자체 loader). remotePatterns가 `res.cloudinary.com`만 허용해 YouTube 썸네일은 fetch URL로 감싸야 한다 (`next.config.ts:25-35`).
- photoswipe core는 우리 파일이 아니라 `react-photoswipe-gallery/dist/gallery.js:1`이 정적 import — 지연하려면 PhotoSwipe 컴포넌트 단위로 `next/dynamic`으로 분리해야 한다 (node_modules 직접 확인).
- PhotoSwipe 소비처는 2곳뿐 — `LatestBulletinImages.tsx`(주보 목록), `BoardBody.tsx`(주보 상세, 서버 컴포넌트) (`rg PhotoSwipe` 확인).
- `LatestBulletinImages.tsx:1`의 `'use client'`는 불필요 — 훅·핸들러 0, 분기 렌더만 (파일 12줄 전체 Read).
- `UserProfile.tsx`·`UserProfileModal.tsx`는 죽은 코드 — Modal을 import하는 곳 0, UserProfile은 Modal만 import (`rg` 확인), knip Unused files에도 잡힌다.
- `NoticeDrawerProvider.tsx:57` context value가 매 렌더 새 객체 `{{ openNotice }}` — drawer 열고 닫을 때마다 소비자(행 트리거) 전부 리렌더.
- `BulletinTable.tsx:24` columns가 매 렌더 재생성 — cell이 `total`·`currentPage`에 의존해 `useMemo` 의존성 `[total, currentPage]` 필요.
- serving-people의 raw `<img>`는 legacy `public/` 자산 분기 전용(eslint-disable 의도 표시) — Cloudinary 데이터 이관이 선행이라 코드만으로 정리 불가.
- `/sermons/all` loading.tsx는 커밋 `d9a84e5`가 의도적으로 삭제("스켈레톤 없이 준비되면 렌더") — audit 3-2는 이 결정과 충돌.
- 서버 컴포넌트가 클라이언트 컴포넌트를 `dynamic()` import하면 자동 코드 스플리팅이 지원되지 않는다 — Next.js 공식 Lazy Loading 가이드 명시 (Codex 계획 검증에서 확인, D1 정정의 근거).

## Success Criteria

- `rg "<img" src/app/_component/home` 0건 — 홈 SermonCard가 `<CloudinaryImage fill>`로 렌더.
- 홈에서 YouTube 썸네일 설교 카드가 dev 브라우저에서 깨짐 없이 표시 (fetch URL 경유).
- 주보 목록·상세에서 PhotoSwipe 갤러리가 dev 브라우저에서 열림 (dynamic 전환 후 동작 보존, 하이드레이션 후 첫 클릭 포함).
- 빌드 산출물 검사: `/news/bulletins`·`[id]`의 초기 클라이언트 청크(app-build-manifest 기준)에 photoswipe 코드(`pswp` 문자열)가 없고 별도 비동기 청크에만 존재. First Load JS 감소는 보조 지표.
- `rg "UserProfile" src` 0건 (4파일 삭제).
- `verify-task` PASS — knip Unused files 12→10 (UserProfile 2파일 제거분).

## 영향받는 파일

- `src/app/_component/home/SermonCard.tsx` — img→CloudinaryImage (GridCard 패턴)
- `src/app/_component/user/` 4파일 삭제 (UserProfile·UserProfileModal .tsx/.module.scss)
- `src/components/common/PhotoSwipeLazy.tsx` — 신규: 'use client' + dynamic() 지연 경계 (D4)
- `src/app/(content)/news/bulletins/_component/LatestBulletinImages.tsx` — 'use client' 제거 + PhotoSwipeLazy 사용
- `src/components/board/BoardBody.tsx` — PhotoSwipeLazy 사용
- `src/app/(content)/news/notices/_component/NoticeDrawerProvider.tsx` — value useMemo
- `src/app/(content)/news/bulletins/_component/BulletinTable.tsx` — columns useMemo
- `docs/tech-debt/active.md` — serving-people legacy 자산 이관 등록

## 단계별 체크리스트

- [x] 1. 죽은 UserProfile·UserProfileModal 4파일 삭제 → 커밋 3f1934d
- [x] 2. SermonCard img→CloudinaryImage 전환 → dev 실측(fetch URL 경유 썸네일 렌더) → 커밋 915d274
- [x] 3. PhotoSwipeLazy wrapper 신설(D4) + 두 소비처 교체 + 'use client' 제거 → dev 실측(주보 목록·상세 lightbox 열림) → 커밋 e3b4070
- [x] 4. NoticeDrawerProvider·BulletinTable useMemo 2건 → dev 실측(드로어 열림·내비게이션) → 커밋 f980895
- [x] 5. serving-people legacy 이관 tech-debt 등록
- [x] 6. VERIFY — verify-task PASS (RUN_ID 20260702-211550) + 빌드 산출물 검사 통과

## Verification

- `node scripts/verify-task.mjs p4-rendering-polish`
- dev 실측: 홈 썸네일 렌더, 주보 목록·상세 갤러리 열림 (하이드레이션 후 첫 클릭·재클릭)
- 빌드 산출물 검사: app-build-manifest에서 `/news/bulletins`·`[id]` 초기 청크 목록을 뽑아 `pswp` 문자열 grep — 초기 청크 0건 + 비동기 청크에 존재해야 통과
- First Load JS 비교(보조): before는 전환 커밋 직전 HEAD 빌드

## Non-goals

- `/sermons/all` loading.tsx 재추가 — 커밋 `d9a84e5` 결정 존중 (사용자 확인, 의사결정 로그 D2)
- serving-people raw `<img>` 분기 제거 — 데이터 이관 선행 (tech-debt로)
- PhotoSwipe를 react-photoswipe-gallery 없이 재작성(클릭 시 로드) — 라이브러리 교체급 재설계라 범위 밖, 효과 미달 시 후속
- CloudinaryImage 'use client' boundary 정리 — 기존 tech-debt 별도 항목
- LatestBulletinImages의 no-image 폴백 raw `<img>` — 기존 ESLint 부채, 이번 작업과 무관

## 의사결정 로그

- **D1 — PhotoSwipe 지연은 `dynamic()` 기본값(ssr 유지)으로 — `ssr: false` 기각**
  - 문제: audit 3-3(PhotoSwipe dynamic)과 3-4(LatestBulletinImages 'use client' 제거)가 충돌해 보였다 — `ssr: false`는 클라이언트 컴포넌트 안에서만 허용되는데 3-4는 그 파일을 서버로 강등하라고 한다. 또 `ssr: false`는 주보 이미지를 SSR HTML에서 지워 LCP·SEO를 후퇴시킨다 (이미지가 곧 본문인 페이지).
  - 해결: `ssr: false` 없이 `dynamic(() => import('@/components/common/PhotoSwipe'))`를 두 소비처(서버 컴포넌트)에서 사용한다. 이미지는 SSR HTML에 남고, photoswipe+react-photoswipe-gallery+CSS는 별도 비동기 청크로 분리된다. 서버 컴포넌트에서 기본 dynamic은 허용되므로 3-4('use client' 제거)와 충돌이 사라진다.
  - 결과: 두 목표를 한 설계로 달성 — 주보 라우트 초기 청크 감소 + 불필요 클라이언트 경계 제거, SSR 회귀 없음. ⚠️ 정정(Codex 계획 검증 CR): 서버 컴포넌트의 dynamic은 코드 스플리팅이 안 됨 → D4 참조.

- **D4 — PhotoSwipe 지연 경계는 'use client' wrapper 1개로 (D1 정정)**
  - 문제: Next.js 공식 Lazy Loading 가이드는 서버 컴포넌트가 클라이언트 컴포넌트를 `dynamic()` import할 때 자동 코드 스플리팅을 지원하지 않는다고 명시한다 — D1의 "서버 소비처에서 직접 dynamic" 설계로는 청크가 분리되지 않는다 (Codex 계획 검증 material 지적, 문서 대조로 확인).
  - 해결: `src/components/common/PhotoSwipeLazy.tsx`('use client' + `dynamic(() => import('./PhotoSwipe'))`, 기본 ssr 유지) 하나를 만들고 두 소비처가 이것을 정적 import한다. dynamic 호출이 클라이언트 컴포넌트 안으로 들어가 스플리팅이 성립하고, 이미지 SSR과 3-4('use client' 제거)는 그대로 유지된다. LocationMapClient의 client-wrapper 선례와 같은 모양이라 새 패턴이 아니다.
  - 결과: 지연 경계가 wrapper 1개로 고정. 부수 트레이드오프 — photoswipe 청크가 늦게 오면 하이드레이션 전 첫 클릭이 무시될 수 있다(기존 client island에도 있던 성질, 창이 조금 길어질 뿐). dev 실측에서 첫 클릭·재클릭을 확인한다.

- **D2 — audit 3-2(loading.tsx 재추가) 제외**
  - 문제: audit는 `/sermons/all`에 loading.tsx가 없다고 지적했지만, 커밋 `d9a84e5`가 5일 내에 바로 그 파일을 포함한 설교 스켈레톤 5개를 의도적으로 삭제했다("스켈레톤 없이 준비되면 렌더").
  - 해결: audit가 이 결정을 모른 채 쓴 항목으로 판단하고 사용자에게 물어 제외를 확정했다. 재추가는 최근 결정의 번복이라 조용히 하지 않는다.
  - 결과: P4 범위에서 3-2 제거. 설교 페이지는 스켈레톤 없는 렌더 정책 유지.

- **D3 — UserProfile 4파일은 이미지 전환 대상이 아니라 삭제 대상**
  - 문제: audit 3-1은 UserProfile.tsx의 raw `<img>`(카카오 아바타)를 `<Image>` 전환 대상으로 꼽았다.
  - 해결: `rg`로 import 그래프를 확인하니 UserProfileModal을 렌더하는 곳이 0곳 — 컴포넌트 쌍 전체가 죽은 코드다(knip Unused files에도 잡힌다). 죽은 코드에 이미지 최적화를 입히는 대신 삭제한다.
  - 결과: 4파일 삭제로 knip 부채 2건 감소. 아바타 이미지 전환 항목 자체가 소멸.

## ADR 판단

- 불필요 — 컴포넌트 폴리시와 죽은 파일 삭제뿐. next/dynamic은 LocationMapClient 선례를 따르는 반복이고, 레이어·캐시·인증·데이터 흐름·라이브러리 변경 없음.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (신뢰도 high) → 반영 완료
- **현재 판단**: material(심각도 큰 지적) 1건 — 서버 컴포넌트에서 dynamic()은 코드 스플리팅을 지원하지 않아(Next.js 공식 Lazy Loading 가이드) D1 설계로는 photoswipe 청크가 분리되지 않는다. D4('use client' wrapper 1개)로 정정하고, Success Criteria를 First Load JS 단독에서 빌드 산출물 검사(초기 청크 `pswp` 문자열 0건)로 강화했다. 나머지 5건은 expression-only(표현 지적):
  - CLS 없음 — 16:9 wrapper가 높이를 예약한다.
  - `loading="lazy"` 제거는 next/image 기본값과 같아 동작이 바뀌지 않는다.
  - useMemo deps `[total, currentPage]`가 완전하다.
  - UserProfile 삭제를 막는 살아 있는 참조가 없다.
  - fallback raw img는 기존 부채로 유지한다.
- **다음 행동**: WORK 진입 (체크리스트 1부터)

## Codex 1차 검증

- **결론**: PASS (신뢰도 high)
- **현재 판단**: 4커밋 diff(3f1934d·915d274·e3b4070·f980895) 파일별 검토에서 지적 0건. null guard 유지(`{thumbnail && ...}` + `.thumb` position:relative), PhotoSwipeLazy props 직렬화 가능, useMemo deps가 완전함, UserProfile 참조 0을 각각 확인. `tsc --noEmit` exit 0, ESLint error 0 (warning 2건은 기존 부채 — fallback img·useReactTable React Compiler). 레이어 위반·외과적 변경 일탈 없음.
- **다음 행동**: VERIFY (dev 서버 정지 후 verify-task + 빌드 산출물 검사)

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task 필수 3단계 통과, knip은 기존 부채 경고(비차단)이며 Unused files 12→10 (UserProfile 2파일 감소분과 일치). 빌드 산출물 검사 — photoswipe JS(70.8KB, `404c128e99c948af.js`)가 주보 상세 초기 `<script>` 세트에서 빠지고 `rel="preload" fetchPriority="low"` 힌트로만 참조된다(실행은 dynamic import 시점). 홈 HTML은 photoswipe 파일 참조 0건이라 라우트 스코프도 유지. dev 실측 4건(홈 썸네일·주보 목록/상세 lightbox·공지 드로어) 통과.
- **알게 된 것**: photoswipe CSS(5.4KB)는 지연 청크의 스타일이라도 Next가 FOUC 방지를 위해 일반 stylesheet로 즉시 싣는다 — 회귀는 아니고(전에도 로드됨) "CSS까지 분리" 기대와 다른 부분이라 기록.
- **다음 행동**: 문서 커밋 후 P3+P4 묶음 PR (사용자 지시 대기)

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260702-211550 | ✅ | ✅ | ✅ | 0 (12→10 감소) | dev 실측 4건 완료 |

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

## PR 리뷰 대응

PR #140 — Gemini 인라인 2건 (모두 medium 성능 제안). 코드 직접 확인 후 판정, 답글 게시(사용자 승인).

| 지적 | 출처 | 대조 | 판정 |
| --- | --- | --- | --- |
| BulletinTable columns를 `meta` 옵션으로 완전 정적화 | gemini r3513137319 | `total`·`currentPage`는 페이지네이션으로 `bulletins` 데이터와 함께만 바뀜 — columns 참조 유지의 실익 0, 타입 단언·간접 참조만 추가 (2컬럼·10행) | 기각 — 답글 r3513213785 |
| NoticeDrawerProvider를 `noticesRef`로 완전 정적화 | gemini r3513137325 | `notices` prop 변경 경로는 서버 재렌더뿐(`notices/page.tsx:59`) — 그때 children(행)이 통째로 교체되어 막을 리렌더 없음. 렌더 중 ref 쓰기는 React 공식 문서가 피하라는 패턴 | 기각 — 답글 r3513214015 |

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

