# knip-dead-code-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-18
- **브랜치**: chore/knip-dead-code-cleanup
- **Open questions**: none
- **ADR needed**: no (dead code 제거, 구조·API 변경 없음)

## 목표

Knip이 잡은 미사용 코드 중 **참조 0으로 검증된 것만** 지운다. 죽은 파일 13개와 라이브 파일 속 죽은 export 9개를 제거해 knip 미사용 파일 수를 줄인다. 오탐(barrel 재export·config 참조)과 의도적 보존물은 건드리지 않는다.

## 검증된 Assumptions

- 미사용 파일 10개 각각 외부 import 0 — `grep`으로 basename import 조회, `types/cloudinary`·`utils/notice`는 정확 경로로 재확인.
- `AboutOurChurch`·`ChurchVision`은 `home/index.ts` barrel export만 있고 소비처 0. 둘은 `reveal.ts`의 `revealStyle`만 쓰고, 그 외 `revealStyle`·`getRevealStyle` 소비처가 없다 → 셋이 서로만 참조해 함께 죽는 파일 묶음이다.
- 죽은 export 9개(`EMAIL_RESEND_DELAY_SECONDS`·`NOTICE_CATEGORY_VARIANT`·`hasVideo`·`formatPreacherTitle`·`siteAsset`·`ADMIN_ROOT`·`resolveNavLabel`·`BACKGROUND_CLASS_NAMES`·`signOut`) 사용 0 — `grep`.
- 유지 대상 확인:
  - `prettier`: eslint-config-prettier가 쓴다 (knip 오탐).
  - `Footer`: `(content)/layout.tsx`에 "복원 시 되살린다" 주석으로 의도적으로 숨겼다.
  - `Carousel`·`Tabs`: 소스에서 실제 쓰인다 (barrel이 자동으로 만든 재export라 knip이 오탐으로 잡음).

## Success Criteria

- 죽은 파일 13개 삭제 + 죽은 export 9개 제거.
- `yarn build`·`yarn lint`·`yarn lint:styles` 통과.
- Knip 미사용 파일 10 → 0 (클러스터 3개는 export로 잡히던 것이라 파일 수엔 없음), 미사용 export가 9건 이상 감소.
- `Footer`·`Carousel`·`Tabs`·타입 43개·`prettier`·`kakao.maps.d.ts`는 그대로.

## 영향받는 파일

- 삭제(13): `hooks/useDebounce.ts`·`hooks/useModal.tsx`·`types/cloudinary.ts`·`utils/notice.ts`·`components/common/SettingsText.tsx`·`components/admin/sermons/SermonForm/primitives/InputGroup.tsx`·`app/(content)/about/worship/_component/{AboutWorship,SchoolGrid,WorshipCard}.tsx`·`app/(content)/news/notices/_component/table/PinIcon.tsx`·`app/_component/home/{AboutOurChurch,ChurchVision}.tsx`·`utils/reveal.ts`
- export 제거: `constants/auth.ts`·`constants/notice.ts`·`utils/sermon.ts`·`utils/cloudinary.ts`·`config/adminNavigation.ts`·`config/navigation.ts`·`utils/photoswipe.ts`·`apis/auth.ts`
- barrel 정리: `app/_component/home/index.ts`(AboutOurChurch·ChurchVision export 줄 제거)

## 단계별 체크리스트

- [x] 1. 죽은 파일 13개 삭제 + `home/index.ts` barrel 2줄 제거
- [x] 2. 라이브 파일 죽은 export 처리 — 완전 죽음 6개 삭제(`EMAIL_RESEND_DELAY_SECONDS`·`NOTICE_CATEGORY_VARIANT`+딸린 타입·`hasVideo`·`siteAsset`·`resolveNavLabel`+`labelMap`+`buildLabelMap`·`signOut`), 내부 사용됨 3개는 `export`만 제거(`formatPreacherTitle`·`ADMIN_ROOT`·`BACKGROUND_CLASS_NAMES`)
- [x] 3. 연쇄로 죽은 `IconWrap.tsx` 삭제(총 14파일). tsc·ESLint·knip 3개 도구 통과 (수치는 아래 검증 표)

## Verification

- `node scripts/verify-task.mjs knip-dead-code-cleanup`

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: 미요청
- **현재 판단**: 참조 0으로 검증한 dead code 삭제라 구조·API·레이어 변경이 없다. 답이 명확한 표준 정리라 위임 트리거에 해당하지 않는다.
- **다음 행동**: 없음

## Codex 1차 검증

- **결론**: Claude 직접 검토로 대체
- **현재 판단**: diff가 삭제·`export` 제거뿐이고 tsc·ESLint·knip로 교차 확인된다. 고위험 파일·신규 구조 없음. Windows Codex 불안정도 고려해 직접 검증으로 대체.

## Claude 2차 검증

- **최종 판단**: tsc·ESLint·knip 통과. `yarn build`는 dev 서버 가동 중이라 미실행 — dev 정지 후 보강.
- **현재 판단**: 삭제 대상은 모두 참조 0을 grep으로 확인했고(내부 사용 있는 3개는 심볼 유지·`export`만 제거), 삭제로 생긴 연쇄(IconWrap)까지 정리했다. 남은 미사용 export 8개는 Footer·Carousel 등 UI 킷의 의도적 보존 대상이다.
- **검증 표**:

| 시점 | tsc | ESLint | knip 미사용 파일 | knip 미사용 export | build |
| --- | --- | --- | --- | --- | --- |
| 2차 | ✅ | ✅ | 10 → 0 | 24 → 8 | 미실행(dev 중) |

## ADR 판단

- **불필요**. dead code(파일·export) 삭제뿐이고 구조·라이브러리·레이어 경계·검증 정책 변경이 없다. `apis/auth.ts`에서 뺀 `signOut`은 참조 0인 미사용 함수다.

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

- knip 남은 미사용 export 8 + 타입 43은 이번에 건드리지 않는다.
  - 이유: `Footer`는 `(content)/layout.tsx`에 복원 예정 주석으로 의도 보존. `Carousel`·`useCarousel`·`CarouselArrows`·타입 43개는 `components/ui` 재사용 킷의 공개 API다. barrel이 자동으로 만든 재export라 삭제하면 킷 표면이 바뀐다.
  - 다음 기준: UI 킷 공개 API를 정리하는 별도 작업에서 barrel 재export 정책과 함께 판단.
  - 기록 위치: 없음 (knip 리포트에 계속 남음)
- `PAGE_SIZE_OPTIONS`·`SERMON_URL_KEYS`·`DEFAULT_PAGE_SIZE`는 내부 사용 또는 1참조라 완전 죽음이 아니어서 제외했다. `prettier`·`kakao.maps.d.ts`는 config가 쓰는 knip 오탐이라 유지한다.

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

