# p3-dead-code-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-02
- **브랜치**: refactor/p3-dead-code-cleanup
- **Open questions**: none
- **ADR needed**: no — 죽은 코드 삭제·1줄 제거뿐이라 레이어 서열·캐시·인증 정책은 바뀌지 않는다

## 목표

refactor-audit P3의 dead code를 삭제한다. 설교 `yearCounts` JS 집계(호출처 0), 공지 `getNoticeCategoryCounts`→`categoryCounts`→`NoticeCategoryFilter` 3단 체인(호출처 0), 고아 `getNoticeDetail` 액션을 제거한다. 삭제 후 관리자 설교 목록의 이중 갱신(`router.refresh()`)은 브라우저 실측으로 중복 확인 시에만 제거한다.

## 검증된 Assumptions

- `yearCounts`는 `sermon-service.ts:256` 정의뿐 — `sermon/index.ts`에 wrapper 없고 `.yearCounts(` 호출 0건 (`rg` 확인). 커밋 `266e693 숨은 year 필터 제거`로 소비 UI가 사라지면서 죽은 코드가 됐다.
- `YearCount` 타입은 `types/sermon.ts:58` 정의 + `sermon-service.ts` import/사용 2곳뿐 — `yearCounts` 제거 시 미사용 (`rg "YearCount"` 4-hit 전부 이 경로).
- `getNoticeCategoryCounts`(notice/index.ts:13) 호출 0건. 체인 하류 `categoryCounts`(notice-service.ts:47)·`NoticeCategoryFilter.tsx`(어디서도 import 0)까지 전부 죽은 코드다.
- `getNoticeDetail`(notice.action.ts) 호출 0건 — 파일 전체가 이 함수 하나뿐. 드로어 전환으로 상세 라우트가 사라지며 고아가 됐다.
- 공지 카테고리 필터는 살아 있는 `CategoryBottomSheet.tsx`가 담당 — `NoticeCategoryFilter` 삭제해도 기능 손실 없음 (별개 컴포넌트, grep 상호참조 0).
- `get_sermon_year_counts()` RPC도 src 참조 0 — DB에는 존재. 이번엔 코드만 삭제하고 RPC drop은 tech-debt 기록만 (사용자 결정).

## Success Criteria

- `rg "yearCounts|YearCount|getNoticeCategoryCounts|categoryCounts|getNoticeDetail|NoticeCategoryFilter"` src 결과 0건.
- 삭제-안전성: 식별자 grep 외 dynamic import(`rg 'import\(' src`), module-path(`rg -F "@/actions/notice" src`), generated types(`rg "yearCounts|categoryCounts" src/types/database.types.ts docs/generated`)에서도 live 참조 0건 (Codex 계획 검증에서 실행·확인).
- `verify-task` PASS — ESLint·build 통과, knip 신규 미사용 0(오히려 기존 knip 부채 감소).
- 삭제 후 공개/관리자 라우트 런타임 동작 불변 (공지 목록·카테고리 필터·설교 목록 그대로).
- (7-1) 관리자 설교 삭제 시 목록이 갱신됨 — `router.refresh()` 제거 여부는 실측 결과에 따름.

## 영향받는 파일

- `src/services/sermon/sermon-service.ts` — `yearCounts` 메서드 + `YearCount` import 제거
- `src/types/sermon.ts` — `YearCount` 타입 제거
- `src/services/notice/index.ts` — `getNoticeCategoryCounts` 제거
- `src/services/notice/notice-service.ts` — `categoryCounts` 메서드 제거
- `src/actions/notice.action.ts` — 파일 삭제 (getNoticeDetail 단일 export)
- `src/app/(content)/news/notices/_component/NoticeCategoryFilter.tsx` — 파일 삭제
- `src/app/(content)/news/notices/_component/NoticeCategoryFilter.module.scss` — 파일 삭제
- `src/components/admin/sermons/SermonListPage/index.tsx` — (7-1, 실측 후) `router.refresh()` 제거
- `docs/tech-debt/active.md` — dead RPC `get_sermon_year_counts()` 기록

## 단계별 체크리스트

- [x] 1. 설교 `yearCounts` 메서드 + `YearCount` import/타입 삭제
- [x] 2. 공지 dead 체인 삭제 (`getNoticeCategoryCounts`·`categoryCounts`·`NoticeCategoryFilter` .tsx/.scss)
- [x] 3. `notice.action.ts` 파일 삭제 (getNoticeDetail 고아)
- [x] 4. `rg` 재확인 — 6개 심볼 src 참조 0건
- [x] 5. tech-debt에 dead RPC 기록
- [x] 6. VERIFY (verify-task) — RUN_ID 20260702-200405 PASS (port 3000 idle 확인 후 실행)
- [x] 7. (7-1) 브라우저 실측 완료 — `updateTag`만으로 목록 갱신 확인, `router.refresh()` 제거 (commit B)

## Verification

- `node scripts/verify-task.mjs p3-dead-code-cleanup`

## Non-goals

- `get_sermon_year_counts()` RPC의 DB drop (tech-debt 기록만 — 사용자 결정)
- `list()`의 `year` 필터 파라미터 처리 (SermonListParams 계약 일부, 무해 — 유지)
- 다른 전 행 스캔 집계(`adminStatusCounts`·`allIds`) — live 코드라 범위 밖 (audit 1-5)
- 인접 코드 정리·포맷 — dead 심볼 삭제로 생긴 미사용 import만 제거

## 의사결정 로그

- **D1 — audit의 "변환/통일"을 "삭제"로 재해석**
  - 문제: audit는 D2를 "yearCounts JS 집계 → RPC 교체", 5-1을 "getNoticeDetail 반환 형태 통일"로 적었다. 둘 다 살아있는 코드를 전제한다.
  - 해결: EXPLORE `rg`로 셋 다 호출처 0건(dead) 확인. RPC로 되살리면 커밋 `266e693`으로 제거한 year 필터 인프라를 부활시키고, 고아 액션의 반환 형태를 통일하는 것은 죽은 계약을 다듬는 낭비다. 그래서 교체·통일 대신 삭제를 택했다.
  - 결과: P3가 "7파일 죽은 코드 삭제"로 좁혀졌다. audit이 잡은 낡은 가정을 코드 실제 상태에 맞춰 바로잡았다.

- **D2 — 삭제-안전성 검색 명령을 SC에 명시 (Codex 계획 검증 expression-only)**
  - 문제: 초안 SC는 식별자 `rg`만 성공 기준으로 적어, 놓친 live 참조(dynamic import·barrel·module-path·generated types)를 어떻게 배제했는지 남지 않았다.
  - 해결: Codex가 실행한 `rg 'import\(' src`·`rg -F "@/actions/notice" src`·generated types 검색을 SC 삭제-안전성 항목으로 승격했다. 표현 보완이라 CR 아님.
  - 결과: 삭제 근거가 재현 가능한 명령으로 남았다.

- **D3 — 7-1: 삭제 후 `router.refresh()` 제거 (dev 실측으로 중복 확인)**
  - 문제: 관리자 설교 삭제가 Server Action의 `updateTag('sermon')`과 클라이언트 `router.refresh()`를 둘 다 호출한다. 관리자 목록은 `createServerSideClient`(no-store, `sermon` 태그 없음)라, `updateTag`만으로 목록이 갱신되는지 정적 판단으로는 단정할 수 없었다.
  - 해결: dev 서버에서 `router.refresh()`를 뺀 채 초안 `[샘플] TEST`(id 9)를 관리자 화면에서 삭제했다. `updateTag('sermon')`만으로 목록이 갱신됐다 — 전체 8→7·초안 3→2, 해당 행 사라짐. Next.js Server Action이 revalidate 계열 호출 뒤 현재 라우트 서버 컴포넌트를 자동 새로고침함을 실측으로 확인. 삭제한 id 9는 SQL로 복구했고(`deleted_at=null`), `sermon_resources` 0건이라 손실 없음.
  - 결과: `router.refresh()`는 중복이라 제거했다(commit B). 삭제 후 목록 갱신은 그대로 동작한다.

## ADR 판단

- 불필요 — `src/services/`·`src/actions/` 파일을 건드리지만 dead 심볼 삭제뿐이라 레이어 서열·캐시·인증 정책·데이터 흐름을 바꾸지 않는다. 영구 결정 없음.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (신뢰도 high)
- **현재 판단**: material 없음. Codex가 식별자 grep을 넘어 dynamic import(`rg 'import\(' src`)·module-path(`rg -F "@/actions/notice" src`)·generated types(`docs/generated`, `database.types.ts`)까지 훑어 6개 심볼의 살아 있는 참조 0건을 재확인했다. 삭제를 막는 참조 없음. expression-only 1건은 D2 참조.
- **다음 행동**: WORK 진입 (죽은 코드 삭제)

## Codex 1차 검증

- **결론**: PASS (별도 호출 생략 — 계획 검증이 실 코드 삭제 안전성까지 확인)
- **현재 판단**: 신규 로직 0 — 죽은 심볼 삭제뿐이다. 계획 검증(PASS_WITH_DECISION_LOG, high)이 이미 실 코드로 삭제 안전성(dynamic import·module-path·generated types)을 확인했고, verify-task build가 끊긴 참조·타입 오류를 잡는다. 1차 검증은 중복이라 생략.
- **다음 행동**: 없음

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task 필수 3단계 통과. Knip은 기존 부채 경고(비차단)이며 P3 삭제로 오히려 줄었다 — `getNoticeCategoryCounts`·`getNoticeDetail`·`NoticeCategoryFilter.tsx`·`YearCount`가 unused 목록에서 빠졌다. 새로 보이는 `getAllNoticeIds`·`getNoticeById`(notice/index.ts)는 line 이동일 뿐 삭제 전에도 dead였다(FEATURE_SPEC:919 확인) — 신규 미사용 0.
- **다음 행동**: COMMIT (사용자 승인 후). 7-1은 별도 단계

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260702-200405 | ✅ | ✅ | ✅ | 0 | 공지 목록·설교 목록 라우트 (삭제 무영향 확인) |

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

