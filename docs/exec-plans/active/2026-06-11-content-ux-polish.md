# content-ux-polish

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-11
- **브랜치**: feat/content-ux-polish
- **Open questions**: 연혁·통계 실제 값(사용자 제공 대기). 받기 전엔 DB·통계 카드 채우기 보류.
- **ADR needed**: no — not-found 파일은 패턴 추가, sermon-service 가드는 일회성 구현 판단(레이어·라이브러리·검증 정책 불변). config·의존성 변경 없음.

## 목표

남은 콘텐츠·UX 작업을 한 PR로 묶는다 — 설립연도를 1958로 맞추고, /about의 TODO 표시를 없애고, 설교자 필터에서 0건 항목을 빼고, 설교·admin 전용 404를 더하고, 하위 페이지 og:image를 되살린다.

## 검증된 Assumptions

- 설립연도 출처가 갈렸다 — 홈 `NewHere.tsx:13` `FOUNDING_YEAR=1958`(하드코딩), about 통계 카드는 DB `site_collections` key `church_history`의 `history[0].year`. dev DB 조회 결과 그 값은 `"1952"`, 텍스트(`about/page.tsx:90`·`vision/page.tsx:49`)도 1952 하드코딩.
- DB `church_history` items 5개 중 1개만 실값("대구동남교회 설립"/1952), 4개는 `"TODO: 주요 연혁 입력"`/`"TODO"` — /about·vision 연혁 타임라인에 그대로 노출. (`execute_sql` 조회)
- about 통계 카드 사역/교구/기도일은 `about/page.tsx:64-66`에서 문자열 `'TODO'` 하드코딩.
- **C(설교자 0건 노출)는 가드가 필요**: `allPreachers`(`sermon-service.ts:202`)가 `sermons!inner(count)` 집계에 `is_published`와 `deleted_at` 필터를 걸지만, 이 집계는 PostgREST lateral이라 발행 0편 부모가 `count:0`으로 새어 나올 수 있다(Codex 계획 검증 지적). dev DB에서 박지권은 발행 0편이지만 미발행 sermon 1건을 가져(`total_count=1`) 실제 위험 경우다. → D1에서 `sermon_count > 0` 렌더 가드를 넣는다.
- `notFound()` 호출처 7곳, not-found 파일은 bulletins·notices·root 3개 (`active.md:257`). 설교·admin 전용 없음.
- about 등 하위 페이지가 `openGraph` 부분 선언 → root og:image 소실 (`active.md:235`).

## 사용자 결정 (2026-06-11)

- 설립연도 DB 수정: **dev·prod 동시** `"1952" → "1958"`.
- TODO 자리(연혁 4줄 + 통계 3개): **실제 값으로 채움** — 사용자 제공 대기.

## Success Criteria

- /about·/about/vision 어디에도 "1952"·"TODO" 문자열이 노출되지 않는다.
- 홈·about 모든 설립연도 표기가 1958로 일치한다.
- 설교자 필터에 설교 0건 설교자가 뜨지 않는다.
- 없는 설교 id(`sermons/[id]`)는 설교 전용 404, admin 없는 리소스는 admin 톤 404로 떨어진다.
- `/about` 등 하위 페이지 응답에 og:image가 존재한다(curl 확인).
- `verify-task.mjs content-ux-polish` 통과(lint·styles·build·knip 신규 0).

## 영향받는 파일

- E: `src/app/(content)/about/page.tsx`, `about/vision/page.tsx`, DB `site_collections(church_history)` (dev·prod)
- C: `sermons/_component/SermonSidebar.tsx`·`AdvancedFilterSheet.tsx`·`SeriesFilterSidebar.tsx` 중 해당 + `services/sermon/sermon-service.ts`(필요 시)
- not-found: `sermons/not-found.tsx`(신규), `(admin)/not-found.tsx`(신규)
- og:image: `about/**` 하위 `generateMetadata`/`metadata` openGraph

## 단계별 체크리스트 (= 커밋 경계, 한 commit = 한 의도)

- [x] 1. E-텍스트: `about/page.tsx:90`·`vision/page.tsx:49` 1952 → 1958 (완료)
- [x] 2. C(D1): `allPreachers`·`allSeries` 반환에 `sermon_count > 0` 가드 (완료)
- [x] 3. og:image: about 하위 7개 page `openGraph`에 `OPEN_GRAPH_BASE` 펼침 (완료)
- [x] 4. E-안전망(D2): 통계 카드 `num==='TODO'` + 연혁 `year==='TODO'` 렌더 숨김 (완료)
- [x] 5. not-found: `(content)/sermons/not-found.tsx`(+module) (완료)
- [x] 6. not-found: `(admin)/not-found.tsx`(+module) — build 그룹 충돌 없음 확인 (완료)
- [x] 7. D3 메타 title 정비: 중복 2건(`/about`·`/about/vision`) + 누락 11건(next-gen·community·news·gallery) title 통일 (완료)
- [ ] 8. E-데이터(사용자 값 도착 후): DB `church_history` dev·prod 1952→1958 + TODO 4줄 실값, 통계 카드 실값 (대기)

## 의사결정 로그

- **D1 — 설교자/시리즈 필터에 `sermon_count > 0` 렌더 가드 추가**
  - 문제: `allPreachers`/`allSeries`가 `sermons!inner(count)`로 0편 항목을 거른다고 봤으나, 이 집계는 PostgREST lateral 서브쿼리라 자식 0건이어도 부모가 `count:0`으로 반환될 수 있다. 박지권은 발행 0편이지만 미발행 sermon 1건을 가져(`total_count=1`) 실제로 새어 나올 수 있는 경우다. plain SQL inner-join으로 재현한 결과는 PostgREST 실제 동작과 달라, 항목을 빼도 된다는 근거가 되지 못한다(Codex 계획 검증 지적).
  - 해결: 쿼리 동작에 기대지 않고 서비스 반환 직전 `filter(x => x.sermon_count > 0)`를 넣는다. 1줄이고 PostgREST 버전에 비의존적이라 검증 비용 대비 가장 싸다. 쿼리 자체 수정(필터 푸시다운 재작성)은 회귀 위험이 더 크다.
  - 결과: 0편 설교자·시리즈가 필터에서 사라진다. "전체" 카운트는 별도 `totalCount`라 영향 없다.

- **D2 — 설립연도·연혁은 DB 수동 UPDATE(dev·prod), TODO는 머지 안전 가드로 가린다**
  - 문제: 설립연도(1952→1958)·연혁 실값은 `site_collections` 데이터라 코드 diff에 안 남는다. 실제 값은 사용자 제공 대기. 값 없이 머지하면 "TODO" 행이 사용자에게 노출된다.
  - 해결: 값이 도착하면 dev·prod 양쪽에 수동 UPDATE를 실행한다(마이그레이션이 아니므로 재구축 시 다시 실행해야 하고, 그 사실을 이 로그에 남긴다). 값이 도착하기 전에도 머지할 수 있도록 `year==='TODO'`/`num==='TODO'` 항목을 렌더에서 거르는 가드를 코드에 넣는다.
  - 결과: 빈 placeholder가 화면에 안 뜬다. 실값이 들어오면 가드는 자연히 통과(전부 실값이라 거를 게 없음)된다.
  - 캐시 주의(브라우저 검증에서 확인): `getSiteCollection('church_history')`는 `force-cache` + `revalidate:false`다.
    - 관찰: dev DB를 1958로 고쳐도 `.next/cache`만 지우고 서버를 재시작했을 때는 화면이 1952 그대로였다. `.next`를 통째로 지우고 재시작하니 stat·history가 1958로 바뀌었다.
    - 원인: 캐시가 무기한이라 DB만 고쳐서는 반영되지 않는다.
    - 대응: `revalidateTag('site-collection-church_history')`를 부르거나 재배포가 있어야 한다. 빌드가 데이터 캐시를 비우기 때문이다. prod 설립연도 UPDATE는 머지 시점에 하면 Vercel 배포가 캐시를 비워 자연히 반영된다.

- **D3 — sitemap 모든 페이지의 메타 title을 전수 확인하고 바로잡음 (사용자 요청 추가)**
  - 문제: sitemap 24개 정적 경로의 `<title>`을 curl로 전수 확인하니 두 부류가 어긋났다. (1) `/about`·`/about/vision`은 title이 이미 ` - 대구동남교회`를 담고 있어 루트 템플릿(`%s | 대구동남교회`)이 한 번 더 붙어 "교회 소개 - 대구동남교회 | 대구동남교회"로 중복됐다. (2) next-gen 5개·community 4개·news·news/gallery 합 11개는 metadata가 아예 없어 루트 기본값 "대구동남교회"만 떴다(섹션 layout에도 title이 없음).
  - 해결: (1) 두 페이지의 `metadata.title`·`openGraph.title`에서 ` - 대구동남교회`를 떼 '교회 소개'·'교회의 비전'으로 바꿔 템플릿이 suffix를 한 번만 붙이게 했다. (2) 누락 11개(전부 server 컴포넌트 stub)에 nav 라벨 기준 `metadata.title`을 추가했다(다음세대·유치부·유초등부·중고등부·청년부·교제·소모임·기도제목·은혜 나눔·교회 소식·갤러리).
  - 결과: sitemap 전 경로가 "메인 제목 | 대구동남교회" 한 형태로 통일된다. 동적 상세(`/sermons/[id]`·`/sermons/series/[id]`)는 본래 설교·시리즈 제목을 써 이미 정상이라 손대지 않았다.
  - 관찰(후속 아님, 기록만): 11개 누락 페이지는 `<div>다음세대</div>` 같은 미구현 stub이다. sitemap에 넣을지와 실제 구현은 별도 작업으로 남긴다.

## Verification

- `node scripts/verify-task.mjs content-ux-polish`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (반영 완료)
- **현재 판단**: 두 지적을 받아들였다. (1) C를 "그냥 빼도 된다"고 본 것은 근거가 부족하다 — `sermons!inner(count)`는 집계 lateral이라 자식이 0건이어도 부모가 `count:0`으로 새어 나올 수 있고, 박지권은 미발행 sermon 1건을 가진 실제 위험 경우다. plain SQL inner-join 재현은 PostgREST 동작과 다를 수 있다. 그래서 렌더 전에 `sermon_count > 0` 가드로 처리한다(버전에 무관하고 1줄이다). (2) TODO 값이 도착하기 전에 머지하면 사용자에게 "TODO"가 노출되므로, 통계 카드와 연혁 타임라인 양쪽에 렌더 가드를 넣는다.
- **다음 행동**: D1·D2 반영 후 구현. og spread·not-found 메커니즘은 PASS 수준(주의점만 점검).

## Codex 1차 검증

- **결론**: PASS
- **현재 판단**: diff만으로 검토. (A) `sermon_count > 0` 가드 — map이 필드를 부여한 뒤 filter가 읽으므로 순서가 안전하다. count는 집계 number라 타입 문제가 없다. (B) og spread — BASE에 title 키가 없어 페이지 리터럴 title이 최종값이 되고 중복 og:title이 없다. (C) admin not-found 글로벌 토큰 — 컴파일타임 SCSS 변수라 `.shell` CSS custom property scope와 무관해 누수 위험이 없다. material CR은 없다.
- **다음 행동**: Claude 2차 검증. 남은 점검 3건(아래)은 diff 범위 밖이거나 시각 확인 수준.

## Claude 2차 검증

- **최종 판단**: 통과 (verify-task green + Codex PASS 교차 확인)
- **현재 판단**: verify-task 4단계가 통과했다(Knip 경고는 기존 부채). Codex 1차 PASS와 diff를 교차 확인했고 가드 순서·og 키 순서·SCSS 변수 성격이 모두 일치한다. 남은 점검: (1) DB `church_history`를 수정하기 전까지는 /about 연혁·통계 항목 수가 줄어든 것처럼 보인다 — D2가 의도한 임시 상태다. (2) about 7개 페이지가 og 이미지 `aboutBanner.jpg`를 공유한다 — 페이지별로 다른 이미지가 필요 없다는 전제이고, 지금 root og와 같다. (3) admin not-found는 admin primary 색조와 시각이 맞는지만 실화면에서 확인하면 된다.
- **다음 행동**: 사용자 커밋 승인 → E-데이터(연혁·통계 실값) 도착 시 DB dev·prod 갱신.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260611-135724 | ✅ | ✅ | ✅ | 0 | 브라우저 검증 완료(아래) — admin 404 색조만 admin 로그인 필요로 미확인 |

브라우저 검증(localhost, dev DB):

- `/about`: 1958 표시, TODO 0건, og:image 정상.
- `/sermons/all`: 설교자 필터에서 박지권(0편)이 빠지고 전체·김성규만 노출.
- `/sermons/999999`: 설교 전용 404 노출.
- `/admin/{임의경로}`: 매칭이 안 돼 루트 404로 떨어진다. 그룹 not-found는 admin 내부에서 `notFound()`를 부를 때만 잡으므로 설계대로다.
- 비숫자 설교 id는 `Number()`가 `NaN`이 되는 기존 에러 상태라 이번 변경과 무관하다.

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

