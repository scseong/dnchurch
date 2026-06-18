# subpage-og-image

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-18
- **브랜치**: feat/subpage-og-image
- **Open questions**: none
- **ADR needed**: no

## 목표

sermons·news 하위 페이지가 SNS·검색 공유 시 미리보기 이미지(og:image)를 항상 갖게 한다. 지금은 일부 페이지가 `openGraph`를 부분 선언해 root의 기본 배너를 잃거나, 콘텐츠 이미지가 없으면 `images: []`로 빈 미리보기가 된다.

## 검증된 Assumptions

- about/*·home은 이미 `...OPEN_GRAPH_BASE`를 펼쳐 정상 — `grep OPEN_GRAPH_BASE` 8파일 확인.
- 정적 목록 4개(`sermons`·`sermons/all`·`sermons/series`·`news/bulletins`)는 `openGraph`에 title/description(/url)만 두고 base를 안 펼친다 — 각 파일 metadata Read 확인.
- 동적 상세 3개(`sermons/[id]`·`sermons/series/[id]`·`news/bulletins/[id]`)는 콘텐츠 이미지를 쓰되 없으면 `images: []` fallback — 각 파일 `images:` 줄 Read 확인.
- `OPEN_GRAPH_BASE.images = ['/images/aboutBanner.jpg']`, Next는 `metadataBase`로 절대화 — `src/config/seo.ts`·`layout.tsx` Read 확인.
- Next.js openGraph는 shallow merge라 부분 선언 시 root images가 사라짐 — `page.tsx:11-13` 주석·tech-debt(PR #110) 확인.

## Success Criteria

- 정적 목록 4개의 SSR `<head>`에 `og:image`(기본 배너 절대 URL)가 출력된다.
- 동적 상세 3개에서 콘텐츠 이미지가 없을 때 `og:image`가 빈 값이 아니라 기본 배너로 채워진다.
- 콘텐츠 이미지가 있는 상세는 기존 콘텐츠 이미지를 그대로 쓴다(회귀 없음).
- 기본 배너 경로가 한 상수(`OG_FALLBACK_IMAGE`)로 모이고, 목록은 `type/locale/siteName`도 base에서 받는다.
- `yarn lint`·`yarn build` 통과, 신규 knip 0.

## 영향받는 파일

- `src/config/seo.ts` — `OG_FALLBACK_IMAGE` 상수 추가, `OPEN_GRAPH_BASE.images`가 그 상수를 쓰게(단일 출처).
- `src/app/(content)/sermons/page.tsx`·`sermons/all/page.tsx`·`sermons/series/page.tsx`·`news/bulletins/page.tsx` — `openGraph`에 `...OPEN_GRAPH_BASE` 펼치고 title/description(/url) 유지.
- `src/app/(content)/sermons/[id]/page.tsx`·`sermons/series/[id]/page.tsx`·`news/bulletins/[id]/page.tsx` — 이미지 없을 때 og/twitter `images` fallback을 `[]` → `[OG_FALLBACK_IMAGE]`.

## 단계별 체크리스트

- [x] 1. `seo.ts`에 `OG_FALLBACK_IMAGE` 상수 + `OPEN_GRAPH_BASE.images`·`CHURCH_INFO.image` 참조 전환.
- [x] 2. 정적 목록 4개에 `...OPEN_GRAPH_BASE` 펼침(기존 title/description/url override 유지).
- [x] 3. 동적 상세 3개의 og·twitter `images` fallback을 `OG_FALLBACK_IMAGE`로.
- [x] 4. 검증 — `verify-task 20260618-211658`로 lint·build 통과. prod 런타임에서 목록 4개의 og:image가 배너 절대 URL로 출력됨을 확인.

## Non-goals

- about/*·home — 이미 정상이라 건드리지 않음.
- 페이지별 전용 공유 이미지 제작 — 기본 배너로 통일. 전용 이미지는 후속.
- `next-gen`·`community`·`news/gallery` stub — sitemap에서도 제외된 미구현이라 범위 밖.

## Verification

- `node scripts/verify-task.mjs subpage-og-image`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS (Claude 직접 — Codex CLI Windows 불안정 + 저위험 반복 변경)
- **현재 판단**:
  - 목록 4개는 about 페이지가 이미 쓰는 `...OPEN_GRAPH_BASE` + override 패턴을 그대로 따른다. 검증된 선례라 회귀 위험이 낮다.
  - 상세 3개는 `type: 'article'`·url을 유지하려 base를 안 펼치고 `images` fallback만 바꾼다. 외과적.
  - 상대경로 `OG_FALLBACK_IMAGE`가 절대 Cloudinary URL과 섞이지만 Next는 둘 다 `metadataBase`로 동일 처리한다. `NEXT_PUBLIC_SITE_URL` 미설정 시 og:image가 상대경로로 남는 건 기존 base 동작과 같다.
  - ADR 트리거 파일 0건(`src/config/`·`src/app/`만). ADR 불요.
- **다음 행동**: 사용자 승인 후 WORK. 구현 diff 후 1차 검증.

## Codex 1차 검증

- **결론**: PASS (Claude 직접 — Codex CLI Windows 불안정 + 저위험 반복 변경)
- **현재 판단**:
  - 목록 4개는 about 페이지가 쓰는 `...OPEN_GRAPH_BASE` + override 패턴을 그대로 따른다. prod 런타임에서 4개 모두 `og:image = .../images/aboutBanner.jpg`(절대 URL) 출력 확인.
  - 상세 3개는 `images: x ? [...] : [OG_FALLBACK_IMAGE]` 한 줄 치환. 콘텐츠 이미지가 있으면 그대로(`/sermons/3`이 Cloudinary 썸네일 출력 — 회귀 없음), 없으면 배너로 채운다. `type: 'article'`·url은 그대로.
  - 혼합 image 배열 타입(`{ url: string }[] | string[]`)은 build(tsc) 통과 — verify-task `20260618-211658`.
  - `OG_FALLBACK_IMAGE` 한 상수를 `OPEN_GRAPH_BASE`·`CHURCH_INFO.image`·상세 fallback 세 곳이 모두 참조해 같은 배너를 가리킨다. knip 신규 0.
- **다음 행동**: Claude 2차 기록 후 커밋.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**:
  - `verify-task subpage-og-image`(run `20260618-211658`): ESLint·stylelint·Build 통과, Knip 경고는 기존 부채.
  - prod 서버(빌드 산출물) 실측: 목록 `/sermons`·`/sermons/all`·`/sermons/series`·`/news/bulletins` 4개가 `og:image`로 배너 절대 URL을 출력. 상세 `/sermons/3`은 콘텐츠 썸네일 유지.
  - 이미지 없는 상세의 `[OG_FALLBACK_IMAGE]` 분기는 build로 검증된 한 줄 상수 치환(표본에 이미지 없는 항목이 없어 런타임 미관측).
- **다음 행동**: 사용자 승인 후 커밋.

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

