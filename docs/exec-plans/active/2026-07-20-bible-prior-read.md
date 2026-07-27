# bible-prior-read

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-20
- **브랜치**: feat/mypage-parity-touchup
- **Open questions**: none
- **ADR needed**: no — ADR 0022의 bible_reading 데이터 모델 확장(read_date nullable)일 뿐 RLS 정책은 불변. src/actions·RPC 변경은 아래 ADR 판단 섹션에 decision-log로 기록 (Codex 계획 검증 판정)

## 목표

트래커 시작 전에 이미 읽은 성경을 "이전에 읽은 기록"으로 표시하는 prior-read 기능을 붙인다. prior-read 장은 통독 진행률에는 더해지고, 오늘·이번 주·연속(streak)에는 들어가지 않는다(목업 문구: "통독 진행에만 반영 · 일간 기록에는 포함되지 않아요").

## 검증된 Assumptions

- `bible_reading_records.read_date`가 NOT NULL이고 `unique (user_id, book_order, chapter, read_date)`에 포함된다 — 날짜 없는 prior 행을 넣을 자리가 없다. 확인: `supabase/migrations/20260717000000_create_bible_reading.sql:16,20`.
- 통독은 날짜를 안 보고, 일간류는 날짜로 세도록 계산이 이미 갈려 있다 — `computePlan`이 `cycleUnionByBook`(cycle만 보고 read_date 무시)로 세고, `computeStreak`·`computeWeek`·`computeMonth`·`computeTodayEntries`는 `counts.get(정확한 날짜)`로 센다. 확인: `src/utils/bible-tracker.ts:83-95,102-205,218-232`.
- 기록 액션은 날짜를 `DATE_RE`로 검증하고 미래를 막는다 — prior(날짜 없음)는 이 검증을 통과 못 한다. 확인: `src/actions/bible-reading.action.ts:8,19-21,29-65`.
- Recorder는 `size="full"` 바텀시트로 날짜바 + 구약/신약 세그먼트 + 책/장 그리드를 그린다. 장 그리드는 `chaptersOnDate`(오늘 읽음)와 `cycleUnion`(이미 읽음)으로 상태를 칠한다. 확인: `src/app/(content)/mypage/_component/tracker/Recorder.tsx:126-292`.

## Non-goals

- 기존 날짜 기반 과거 기록(날짜바로 지난 날짜에 기록) 제거 — 실기능이라 유지한다. prior 모드는 그 위에 얹는다.
- 목업의 "모두 저장됨" 헤더 상태 등 부수 장식 — 핵심(모드 토글·prior 저장·통독 반영)이 먼저. 여유 있으면 추가.
- prior 기록에 회차별 세분 UI — prior는 항상 현재 회차에 붙인다.

## 스키마 (Option A — read_date nullable)

```sql
-- prior-read = 날짜 없이(read_date NULL) 현재 회차에 읽음 표시
alter table public.bible_reading_records alter column read_date drop not null;

-- 기존 unique는 NULL을 서로 다르게 취급해 prior 중복을 못 막는다 →
-- 날짜 없는 행 전용 부분 유니크로 (사용자·책·장·회차) 중복 방지
create unique index bible_reading_records_prior_uniq
  on public.bible_reading_records (user_id, book_order, chapter, cycle)
  where read_date is null;

-- 부분 유니크는 PostgREST onConflict로 타깃 불가(index predicate 전달 문법 없음) →
-- prior insert는 이 RPC로 원자 실행. security invoker라 owner-RLS(insert policy)가 그대로 적용된다.
create or replace function public.record_prior_chapters(
  p_book_order smallint, p_chapters smallint[], p_cycle smallint
) returns void language sql security invoker as $$
  insert into public.bible_reading_records (user_id, book_order, chapter, read_date, cycle)
  select auth.uid(), p_book_order, c, null, p_cycle from unnest(p_chapters) as c
  on conflict (user_id, book_order, chapter, cycle) where read_date is null do nothing;
$$;
```

- 계산 로직: `cycleUnionByBook`이 NULL 행을 그대로 센다(통독 포함), 날짜 함수들은 `=== date` 비교라 NULL을 안 잡는다(일간류 제외). **변경은 `countByDate` 한 곳** — `map.set` 전에 `if (rec.read_date === null) continue;` 가드를 넣어 `Map<string, number>` 타입을 지킨다(Codex material 1). 타입은 `read_date: string | null`로 넓힌다.
- prior 삭제(해제)는 부분 유니크와 무관하니 RPC 없이 액션에서 평범한 delete(`read_date is null and book_order·chapter·cycle` 필터)로 처리한다.

## Success Criteria

- 마이그레이션 dev 적용 후 `read_date`가 nullable이고 `bible_reading_records_prior_uniq` 부분 유니크가 존재한다 (yes/no).
- "이전에 읽은 기록 불러오기"로 기록기를 열면 상단에 "오늘 읽음 / 이전에 읽은 기록" 모드 토글과 "통독 진행에만 반영 · 일간 기록에는 포함되지 않아요" 설명이 뜬다 (yes/no).
- prior 모드에서 창세기 여러 장을 저장하면 통독 진행률(`computePlan`)이 오르고, 오늘 읽은 곳·이번 주·연속(streak)은 안 오른다 (yes/no).
- 같은 장을 prior로 두 번 저장해도 행이 중복되지 않는다(부분 유니크) (yes/no).
- prior 저장은 `read_date`가 NULL인 행으로만 저장되고, 조작된 입력(미래 날짜 등)은 prior 저장에 안 섞이며 날짜 기반(dated) 경로에서만 걸러진다 (yes/no).
- `yarn generate:types` 후 타입 일치, `verify-task` 신규 회귀 0 (yes/no).

## 영향받는 파일

- `supabase/migrations/<ts>_bible_prior_read.sql` (신규) — read_date drop not null + 부분 유니크 + RPC `record_prior_chapters`
- `src/types/database.types.ts` — `generate:types` 재생성 (read_date nullable + RPC 시그니처)
- `src/utils/bible-tracker.ts` — `ReadingRecord.read_date`를 `string | null`로 + `countByDate`에 null 가드
- `src/actions/bible-reading.action.ts` — prior 기록 액션은 RPC `record_prior_chapters` 호출(원자), prior 해제는 `read_date is null` 필터 delete. cycle=현재. 기존 bible-reading 액션의 직접 supabase 호출 패턴 준용
- `src/app/(content)/mypage/_component/tracker/Recorder.tsx` — 상단 모드 토글(오늘 읽음/이전에 읽은 기록) + 설명, prior 모드는 날짜바 숨김·NULL 저장
- `src/app/(content)/mypage/_component/tracker/TrackerSection.tsx` — prior 낙관적 쓰기: 헬퍼가 `date: string` 고정·cycle 미고려라(`:68-143`) `read_date === null && cycle === 현재` prior 경로 추가 + prior 진입 시 recorder 모드 전달
- `src/app/(content)/mypage/_component/tracker/RecordTabs.tsx`(또는 TrackerSection) — "이전에 읽은 기록 불러오기"가 prior 모드로 recorder를 열게

## ADR 판단

**ADR needed: no** (Codex 계획 검증 판정). prior-read를 "read_date NULL = 날짜 없이 현재 회차에 반영"으로 표현하는 것은 [ADR 0022 user-owned-data-rls](../../decisions/0022-user-owned-data-rls.md)의 bible_reading 데이터 모델을 확장할 뿐, owner-RLS 정책 자체는 그대로다(`supabase/migrations/20260717000000_create_bible_reading.sql:27-42` 정책 불변). `src/actions/`·`src/services`(RPC)가 ADR_TRIGGER지만 새 영구 결정이 아니라 ADR 0022 패턴의 연장이라, 새 ADR 대신 이 decision-log(D1~D4)로 기록한다.

## 단계별 체크리스트

- [x] 1. 마이그레이션 작성 + dev 적용(`apply_migration` success) → `yarn generate:types`. read_date nullable·부분 유니크·RPC 확인
- [x] 2. `bible-tracker.ts` `ReadingRecord.read_date: string | null` + `countByDate` null 가드
- [x] 3. prior 기록(RPC `record_prior_chapters`)·해제(delete) 액션 — read_date NULL·cycle=현재
- [x] 4. Recorder — 모드 토글·prior 노트·날짜바 숨김·NULL 저장. "선택됨/이미 읽음" 범례, priorByBook 배지
- [x] 5. TrackerSection — `matchesSlot` cycle-aware + nullable date 낙관적 쓰기, "이전에 읽은 기록 불러오기"가 prior 모드로
- [~] 6. VERIFY — 라이브 E2E 통과(아래 Claude 2차). Codex 1차 진행 중. `yarn build`/verify-task는 dev 서버 실행 중이라 보류
- [ ] 7. prod 마이그레이션 반영(별도 승인)

## Verification

- `node scripts/verify-task.mjs bible-prior-read`
- `yarn generate:types` 후 타입 불일치 0
- 라이브 `localhost:3000/mypage` — prior 저장 시 통독 진행률만 오르고 오늘/주/연속 불변

## 의사결정 로그

- **D1 — 데이터 모델은 read_date nullable(Option A), 별도 테이블(C) 대신**
  - 문제: prior-read는 날짜 없이 통독에만 반영돼야 하는데 `read_date`가 NOT NULL·unique key라 넣을 자리가 없다.
  - 해결: `read_date`를 nullable로 열어 prior 행을 NULL로 넣는다. 이 앱은 통독(cycle 기준)과 일간류(날짜 기준) 계산이 이미 분리돼 있어, NULL 행이 통독엔 자동 포함·일간류엔 자동 제외된다. 대안 C(별도 테이블)는 통독 계산에서 두 소스를 합치고 중복 제거해야 해 로직·관리 지점이 늘어 기각했다.
  - 결과: 계산 코드가 거의 그대로 유지되고, 스키마 변경이 컬럼 1개 nullable + 부분 유니크 1개로 좁아진다.
- **D2 — Recorder에 상위 모드 토글을 얹고 날짜바는 유지**
  - 문제: 목업 prior 기록기는 모드 토글(오늘 읽음/이전에 읽은 기록)만 있고 날짜바가 없다. 그런데 현재 빌드는 날짜바로 지난 날짜에 기록하는 실기능을 갖고 있어, 목업을 그대로 따르면 그 기능이 사라진다.
  - 해결: 상단에 모드 토글을 새로 얹되, "오늘 읽음" 모드에서는 기존 날짜바를 유지하고, "이전에 읽은 기록" 모드에서는 날짜바를 숨기고 설명을 띄운 뒤 read_date NULL로 저장한다. 대안(날짜바 제거·목업 완전 일치)은 과거 날짜 기록 회귀라 기각했다.
  - 결과: 과거 날짜 기록을 보존하면서 prior 모드를 더한다. 목업의 모드 토글·설명은 반영하되 날짜바는 남는 차이가 생긴다.
- **D3 — prior 저장은 RPC로 원자 실행(부분 유니크 때문)**
  - 문제: prior 중복 방지 부분 유니크 인덱스는 Supabase/PostgREST `.upsert({onConflict})`로 겨냥할 수 없다(index predicate 전달 문법 없음). check-then-insert는 race, delete-then-insert는 비원자다.
  - 해결: `record_prior_chapters` RPC로 `on conflict (...) where read_date is null do nothing`을 원자 실행한다. bulletin/sermon services가 이미 RPC 패턴을 쓴다. prior 해제는 부분 유니크와 무관해 액션의 평범한 delete로 둔다.
  - 결과: prior 저장이 중복 없이 원자적으로 되고, insert만 RPC·delete는 액션 직접이라 추상화가 최소에 그친다.
- **D4 — TrackerSection 낙관적 헬퍼에 prior 경로를 더한다**
  - 문제: `addRecords`·`removeRecords`·`restoreRecords`가 `date: string` 고정이고 중복 판정이 `read_date + book_order + chapter`만 봐 cycle을 무시한다. prior(read_date NULL, 현재 회차)를 그대로 넣으면 이전 회차의 NULL 행과 섞여 오판한다.
  - 해결: prior 경로는 `read_date === null && cycle === 현재 회차`로 필터하는 분기를 헬퍼에 더한다. 대안(date에 null만 통과)은 회차 구분이 없어 기각했다.
  - 결과: prior 낙관적 쓰기가 현재 회차에만 정확히 반영된다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 심각 지적(material, 구현 차단 사유) 4건 반영 후 WORK
- **현재 판단**: 데이터 모델(Option A)·계산 분리·Non-goals는 유효. material 4건을 스키마·영향파일·의사결정 로그·ADR 판단에 반영했다.
- **다음 행동**: WORK — 마이그레이션(RPC 포함)부터

Codex 지적 + 조치:
- material 1 — `read_date: string | null`로 넓히면 `countByDate`의 `map.set(rec.read_date, ...)`가 `Map<string, number>` 타입을 깬다(`src/utils/bible-tracker.ts:67-70`). → `countByDate`에 `if (rec.read_date === null) continue;` 가드 추가(체크리스트 2). 나머지 날짜 함수는 `=== date` 비교라 런타임·타입 모두 안전(prior 자동 제외 확인).
- material 2 — 부분 유니크 인덱스는 Supabase/PostgREST `.upsert({onConflict})`로 타깃 불가(index predicate 전달 문법 없음). → prior insert를 RPC `record_prior_chapters`로 원자 실행(`insert ... on conflict (user_id, book_order, chapter, cycle) where read_date is null do nothing`). bulletin/sermon services의 RPC 패턴 준용. 스키마·영향파일·D3 반영.
- material 3 — `TrackerSection`의 `addRecords`/`removeRecords`/`restoreRecords`가 `date: string` 고정에 중복 판정이 cycle 미고려라 prior(null·현재 회차) 행을 못 다룬다(`TrackerSection.tsx:68-143`). → prior 경로는 `read_date === null && cycle === 현재`로 필터하는 별도 헬퍼. 영향파일·D4 반영.
- material 4 — ADR 판단이 frontmatter "no"와 본문 "보류"로 모순. → Codex 판정대로 "새 ADR 불필요, ADR 0022 확장 decision-log"로 확정. frontmatter·ADR 판단 섹션 정정.
- 확인된 저위험(무변경): `chaptersOnDate`·`computeStreak`·`computeTodayEntries`·`computeWeek`·`computeMonth`는 null 행 자동 제외, `cycleUnionByBook`·`computePlan`은 통독에 자동 포함, `Recorder` 표시는 "이미 읽음"으로 정상.

## Codex 1차 검증

- **결론**: PASS (confidence high) — material 0건, 직접 수정 대상 없음
- **현재 판단**: RPC 소유권(security invoker·`search_path=''`·`auth.uid()`), ON CONFLICT가 부분 유니크와 맞물리는지, `matchesSlot`이 회차별로 다르게 도는지, prior가 통독엔 들어가고 일간엔 빠지는지를 줄 단위 근거로 전수 확인. 외과적 위반·knip 신규 위험 없음.
- **다음 행동**: Claude 2차 확정 → 사용자 승인 후 커밋

Codex 확인 요지:
- `record_prior_chapters`는 user_id를 인자로 안 받고 `auth.uid()`로만 넣어 insert RLS(`auth.uid() = user_id`)를 그대로 통과 — 타 사용자 행 insert 경로가 코드상 없다.
- 다회독 엣지: 1회독의 `read_date=null` 행은 `computePlan(records, 2)`·prior 기록기 배지 모두 `cycle === currentCycle` 필터로 제외돼 회차별 기록이 서로 안 섞인다.
- 외과적 범위: prior-read와 무관한 diff 없음. 새 SCSS(`tracker.module.scss` rec_modebar·rec_prior_note)는 prior UI에 직결, 타입 변경은 nullable read_date + 새 RPC만.

## Claude 2차 검증

- **최종 판단**: PASS — `verify-task`(run-id `20260721-190444`) 필수 4단계 중 ESLint·stylelint·Build 통과, Knip 63줄은 기존 부채(내 변경 파일 언급 0건). 라이브 E2E(prior 저장·해제 왕복, 통독 반영·일간 제외, DB 실측)와 Codex 1차 PASS(심각 지적 0)를 교차 확인했다.
- **현재 판단**: dev(홍길동 세션)에서 레위기 27장을 prior로 표시하니 통독이 75→102(+27)로 오르고 연속·이번 달·오늘은 불변. 해제하니 75로 복구. DB는 prior 행이 read_date=null·cycle=1로 저장됐다가 해제 후 0행.
- **다음 행동**: Codex 1차 결과 반영 → 사용자 승인 후 커밋 → prod 마이그레이션(별도 승인)

| 시점 | 방법 | 결과 |
| --- | --- | --- |
| 2차 | `verify-task` (`20260721-190444`) | ✅ ESLint·stylelint·Build 통과, Knip 경고는 기존 부채(내 파일 0건) |
| 2차 | `tsc --noEmit` | ✅ 0 |
| 2차 | `eslint`(action·util·TrackerSection·Recorder) | ✅ 0 |
| 2차 | `stylelint`(tracker.module.scss) | ✅ 0 |
| 2차 | 라이브 prior 저장 (레위기 27장) | ✅ 통독 75→102, 연속 3·이번 달 3·오늘 0 불변 |
| 2차 | DB 실측 (`read_date is null`) | ✅ 레위기 1–27장·cycle 1·null 27행 |
| 2차 | 라이브 prior 해제 | ✅ 통독 102→75 복구, null 행 0 |
| 후속 | prod 마이그레이션·prod 실호출 | ⏳ 배포/승인 후 |

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

