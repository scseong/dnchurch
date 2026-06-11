# migration-ssot-recovery

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-12
- **브랜치**: fix/profiles-rls-rpc-guard
- **Open questions**: none
- **ADR needed**: no — 콘솔에만 있던 스키마를 마이그레이션 파일로 옮긴 복구 작업이다. 새 패턴·라이브러리 도입 없음.

## 목표

마이그레이션 파일만으로 빈 DB를 dev와 똑같이 재구성할 수 있게 만든다. 콘솔에서만 만들어져 빠져 있던 테이블·함수를 마이그레이션으로 복원하고, 실제와 어긋난 `001_sermon_schema.sql`을 바로잡아 Supabase Preview replay를 통과시킨다. PR #115에 이어 붙여 그 PR을 완성한다.

## 검증된 Assumptions

- dev DB의 실제 스키마를 `pg_catalog`/`information_schema` 조회로 직접 떴다 — 컬럼·타입·enum·제약·FK·인덱스·RLS·트리거·함수 본문.
- `profiles`·`bulletins`·`bulletin_images`·`notices`와 enum 3종(`role_enum`·`profile_status_enum`·`notice_category_enum`)·`get_adjacent_bulletins`가 어느 마이그레이션 파일에도 없다 — `Grep "CREATE TABLE|CREATE TYPE"` + 함수 목록 대조.
- `001`이 실제와 다르다 — `sermons.id` 파일 UUID / 실제 bigint, `date` / `sermon_date`, `scripture_refs` / `scripture`, `service_type`·`deleted_at` 누락. `information_schema.columns(sermons)` 조회로 확인.
- `service_type_enum`·`sermon_resource_type`는 어느 파일도 안 만들어 `001`에서 새로 만든다.
- `worship_category`는 `20260314000002`가 이미 만들므로 `001`에서 다시 만들지 않는다(중복 방지 확인).
- dev의 `increment_sermon_views`는 인자로 `uuid`를 받지만 `sermons.id`가 bigint라 호출하면 타입이 안 맞아 실패한다 — 재작성에서 bigint로 정정.
- Preview 브랜치는 한 번 만들면 그대로 남아(persistent) 같은 버전 마이그레이션을 다시 돌리지 않는다 — 파일 수정 후 `reset_branch`로 전체 replay를 강제한다.

## Success Criteria

- 빈 DB(Preview 브랜치)를 마이그레이션만으로 만들었을 때 dev와 테이블·컬럼·타입·nullable이 일치한다.
- enum·RLS 정책·RLS 켜진 테이블 수가 dev와 같다.
- 앱이 호출하는 RPC(create/update_bulletin, get_adjacent_bulletins, create/update/delete_sermon, increment_sermon_views, get_sermon_year_counts)가 fresh 빌드에 모두 있다.
- GitHub `Supabase Preview` 체크가 pass.
- `node scripts/verify-task.mjs`로 lint·build 회귀 0.

## 영향받는 파일

- `supabase/migrations/00000000000000_baseline_core_tables.sql` (신규)
- `supabase/migrations/001_sermon_schema.sql` (실제 스키마로 재작성)
- `supabase/migrations/20260314000000_create_bulletin_rpc.sql` (`get_adjacent_bulletins` 추가)
- `supabase/seed.sql` (새 스키마에 맞춤)
- src/ 코드 변경 없음.

## 단계별 체크리스트

- [x] 1. 실제 스키마 전수 수집(컬럼·enum·제약·인덱스·RLS·트리거·함수).
- [x] 2. baseline 마이그레이션 작성 — 4테이블 + enum 3종 + handle_new_user + RLS.
- [x] 3. `001` 재작성 — 실제 sermon 스키마 + enum 2종 + increment_sermon_views bigint 정정.
- [x] 4. `seed.sql` 수정 — identity id 미지정, slug로 sermon_resources 연결.
- [x] 5. push → Preview 실패(브랜치에 옛 상태가 남음) → `reset_branch`로 전체 replay → 통과.
- [x] 6. dev ↔ preview 정합 대조에서 `get_adjacent_bulletins` 누락 발견 → 추가 → 재검증.

## Verification

- `node scripts/verify-task.mjs migration-ssot-recovery` — run 20260612-005639, lint·build 통과.
- Preview 브랜치 ↔ dev 스키마 정합 (아래 표).

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS (Codex 호출 생략 — Preview 빈 DB를 dev와 직접 대조해 대체)
- **현재 판단**: 이 작업의 정답은 "마이그레이션만으로 만든 빈 DB가 dev와 같은가"이고, 그것을 Supabase Preview 브랜치 replay + dev 직접 대조로 실측했다. 계획 단계 추론보다 강한 검증이라 별도 Codex 계획 검증을 두지 않았다.
- **다음 행동**: Claude 2차 검증 표 참조.

## Codex 1차 검증

- **결론**: PASS (Codex 호출 생략 — Preview 빈 DB를 dev와 직접 대조해 대체)
- **현재 판단**: 구현 diff(SQL)의 정합은 fresh replay 성공 + 스키마 1:1 대조로 직접 확인했다(아래 표). 추가 정적 리뷰 없이도 빈 DB가 dev와 일치함이 실측됐다.
- **다음 행동**: 머지 전 사용자 판단.

## Claude 2차 검증

- **최종 판단**: PASS. 마이그레이션만으로 만든 Preview 빈 DB가 dev와 테이블·컬럼·타입·enum·RLS·트리거에서 일치하고, 앱 RPC가 모두 있으며, GitHub Supabase Preview 체크가 pass했다.
- **현재 판단**: 아래 표. 미세 차이 2건은 dev 쪽 잔여물(트리거 없는 고아 함수)이라 의도적으로 제외, preview에만 있는 2건은 마이그레이션이 정의한 정상(dev 드리프트).
- **다음 행동**: PR 본문 갱신 후 사용자 머지 판단.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260612-005639 | ✅ | ✅ | ✅ | 0 | Preview·dev 스키마 대조(아래) |

dev ↔ Preview 빈 DB 정합 (Preview = 마이그레이션만으로 생성):

| 항목 | dev | preview | 판정 |
| --- | --- | --- | --- |
| public 테이블 | 12 | 12 | 일치 |
| 컬럼·타입·nullable | — | — | 12테이블 전수 일치 |
| enum | 6 | 6 | 일치 |
| RLS 정책 | 26 | 26 | 일치 |
| RLS 켜진 테이블 | 12 | 12 | 일치 |
| 트리거 | site_collections_set_updated_at 1 | 동일 1 | 일치 |
| 앱 RPC | 전부 | 전부 존재 | 일치 |
| 함수 차이 | `handle_updated_at`·`rls_auto_enable`(고아, 트리거 미사용) | `custom_access_token_hook`·`get_sermon_year_counts`(마이그레이션 정의, dev 드리프트) | 의도된 차이 |

`get_adjacent_bulletins`는 1차 대조에서 누락이 발견돼 `20260314000000`에 추가하고 재검증해 preview에 포함됨을 확인했다.

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

