# mypage-dept-fellowship

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-19
- **브랜치**: feat/my-page
- **Open questions**: none
- **ADR needed**: no

## 목표

프로필에 부서·구역을 붙인다. `departments`·`districts` 마스터 테이블(부서·구역은 **독립** — 구역은 부서에 종속되지 않는 평평한 5개)을 만들고 `profiles`에 FK로 연결한다. 구역장·구역 리더는 프로필 역할(`district_role`)로 저장한다. 마이 페이지 프로필 부제를 이메일 대신 "부서 · 구역"으로 보여주고, 프로필 편집에서 부서·구역을 각각 독립 Select로 고르고 역할을 정한다.

## 검증된 Assumptions

- `departments` 테이블·부서 이름 목록이 코드·DB 어디에도 없음, `profiles.dept_id`는 FK 없는 죽은 int. 확인: `rg "dept_id|departments" src` 0건(generated 타입 제외), `list_tables(public)`.
- 속회 컬럼 없음. 확인: 같은 list_tables.
- 마스터 테이블 RLS 패턴: 공개 읽기 `for select using (true)` + admin만 수정(`worship_schedules` 마이그레이션). 소유·FK 스타일은 `bible_reading` 마이그레이션. 확인: Read.
- 프로필 조회는 `getProfileByIdServer`의 `.from('profiles').select('*')`(`apis/user-server.ts:8`), 저장은 `updateProfileAction`(`actions/profile.action.ts:13`)이 displayName·avatar를 update. 확인: Read.
- 프로필 편집 UI는 `ProfileEditModal`(현재 display_name만), 표시는 `ProfileSection`(현재 email). `Select` 공용 컴포넌트 존재(`components/ui/Select`). 확인: Read/ls.

## Non-goals

- 부서·속회 admin 관리 UI — 시드/SQL로 채우고, 관리 화면은 후속. (Codex 계획 검증에서 필요성 판단)
- `dept_id`를 이름 하드코딩 맵으로 푸는 방식 — 사용자가 테이블+드롭다운 선택.
- 회원가입 시 부서·속회 입력 — 프로필 편집에서만(선택 항목).
- Phase 4(prior-read)·설정 저장.

## Success Criteria

- `departments`·`districts` 테이블 생성, `profiles.dept_id`·새 `district_id`가 각 테이블 FK, `district_role` 컬럼 추가, RLS `authenticated` 읽기 + admin 수정 (yes/no).
- 마이그레이션 apply 전 orphan `dept_id`를 null 처리 — FK 추가가 실패하지 않음 (yes/no).
- 마이 페이지 프로필 부제가 "부서 · 구역"으로 표시(둘 다 있으면), 없으면 빈 값 처리 (yes/no).
- 프로필 편집에서 부서·구역을 각각 독립 Select로 고르고, 구역 역할(일반/구역리더/구역장)을 정해 저장하면 반영 (yes/no).
- `page.tsx`가 `@/apis`를 직접 import하지 않고 `@/services` 경유 — `rg "from '@/apis/" src/app/(content)/mypage` 0건 (yes/no).
- `getProfileByIdServer`의 `.select('*, departments(name), districts(name)')` 호출 에러 0건 (yes/no).
- `yarn generate:types` 후 타입 일치, `verify-task` 신규 회귀 0 (yes/no).

## 영향받는 파일

- `supabase/migrations/<ts>_create_departments_districts.sql` — 신규: 2테이블 + profiles FK 2개 + district_role + orphan null + RLS + 시드
- `src/types/database.types.ts` — `yarn generate:types` 재생성
- `src/apis/user-server.ts` — 프로필 select에 `departments(name), districts(name)` join
- `src/apis/reference.ts`(신규 또는 유사) — 부서+구역 목록 조회 (authenticated 읽기)
- `src/services/reference/index.ts`(신규) — F2: `page.tsx`가 apis 직접 대신 이 service 경유
- `src/actions/profile.action.ts` — update에 `dept_id`·`district_id`·`district_role` 반영 + 검증(값이 마스터에 존재하는지)
- `src/app/(content)/mypage/page.tsx` — service로 부서·구역 목록 조회해 하위로 전달
- `src/app/(content)/mypage/_component/ProfileSection.tsx` — 부제 "부서 · 구역" 표시
- `src/app/(content)/mypage/_component/ProfileEditModal.tsx` — 부서·구역 독립 Select + 역할 Select
- `src/types/common.ts` — join 이름 포함 프로필 타입(필요 시)

## 스키마 (설계 — 사용자 결정 반영)

부서·구역은 **독립**(구역은 부서에 종속되지 않는 평평한 5개). 구역장·리더는 프로필 역할로 저장.

```sql
create table public.departments (
  id integer primary key generated always as identity,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.districts (            -- 구역 (독립, 부서와 무관)
  id integer primary key generated always as identity,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- F1(Codex): 기존 dept_id에 orphan 값이 있으면 FK 추가가 실패 → FK 전에 null 처리.
-- dept_id는 지금까지 죽은 컬럼이라 의미 있는 값이 없다.
update public.profiles set dept_id = null where dept_id is not null;
alter table public.profiles
  add constraint profiles_dept_id_fkey foreign key (dept_id) references public.departments (id);
alter table public.profiles
  add column district_id integer references public.districts (id);
alter table public.profiles
  add column district_role text not null default '일반'
    check (district_role in ('일반', '구역리더', '구역장'));

-- RLS(F3): 로그인 화면 소비 → 공개(using true) 대신 authenticated 읽기 + admin 수정.
alter table public.departments enable row level security;
alter table public.districts enable row level security;
create policy "departments_select_auth" on public.departments
  for select to authenticated using (true);
create policy "districts_select_auth" on public.districts
  for select to authenticated using (true);
-- + admin만 수정 (worship_schedules의 EXISTS profiles role='admin' 패턴)

-- 시드 (사용자 제공):
--   departments: 유치부, 유초등부, 중고등부, 청년부, 마리아, 디모데, 바울, 리브가, 루디아, 한나
--   districts:   믿음, 소망, 사랑, 화평, 희락
```

## ADR 판단

**ADR needed**: no — 새 테이블 2개·profiles FK·조회 join은 기존 owner-RLS·공개 마스터 RLS 패턴(`bible_reading`·`worship_schedules`)을 재사용. 새 라이브러리·인증/캐시 정책 변경 없음. Codex 계획 검증에서 재확인.

## 단계별 체크리스트

- [x] 0. 시드 확보 — 부서 10개·구역 5개 사용자 제공 완료
- [x] 1. 마이그레이션 작성 + dev 적용(`{"success":true}`) → `yarn generate:types`. 타입에 departments·districts·district_id·district_role·FK 반영 확인
- [x] 2. `getProfileByIdServer` select에 `departments(name), districts(name)` join (ProfileWithOrg)
- [x] 3. `apis/reference` + `services/reference` + `page.tsx`가 service 경유(Promise.all)
- [x] 4. `updateProfileAction`에 dept_id·district_id·district_role 명시 literal payload. 존재·역할 유효성은 FK·CHECK가 DB에서 강제
- [x] 5. `ProfileSection` 부제 "부서 · 구역 · 역할(≠일반)", 없으면 이메일
- [x] 6. `ProfileEditModal` 부서·구역·역할 독립 Select, 열림 시 초기화
- [~] 7. VERIFY — tsc/eslint/stylelint 통과 + 라이브 저장 왕복 확인(부제 "청년부 · 사랑 · 구역장"). 전체 verify-task는 커밋 전

## Verification

- `node scripts/verify-task.mjs mypage-dept-fellowship`
- `yarn generate:types` 후 타입 불일치 0
- 라이브 `localhost:3000/mypage` — 부서·속회 선택·저장·표시·부서 변경 초기화

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 조치 완료 후 WORK 진입. (검증은 연동 구조 계획 기준, 이후 사용자 결정으로 독립 구조로 바뀌어 일부 지적은 자동 해소)
- **현재 판단**: material 지적을 구조 변경 + 수정으로 해소. cascading·복합 FK 관련은 독립 구조라 무효, F1/F2/F3는 반영.
- **다음 행동**: 마이그레이션부터 WORK

Codex 지적 요지 + 조치:
- 복합 FK(속회∈부서)·연동 초기화 — **무효**: 사용자가 부서·구역 독립을 택해 구역이 부서에 종속되지 않는다. Select 2개가 서로 무관.
- F1 material — 기존 `profiles.dept_id`(baseline `00000000000000_baseline_core_tables.sql:27`의 FK 없는 int)에 바로 FK 추가 시 orphan 값으로 실패. → 마이그레이션에서 `update profiles set dept_id = null` 후 FK 추가.
- F2 material — `page.tsx`가 `apis` 직접 import는 `apis→services→actions→app` 위반. → `services/reference` 진입점 추가, `page.tsx`는 service만 import.
- F3 material — 로그인 화면 소비인데 `using(true)` 공개는 과함(privacy: 부서·사역은 민감정보). → `to authenticated using(true)` 읽기.
- F5 — nested select는 FK 존재 + PostgREST schema cache 후 동작. → verify에서 `.select('*, departments(name), districts(name)')` 에러 0건 확인 항목 추가.

풀이: 구조가 독립으로 바뀌어 CR의 절반(복합 FK·연동)은 사라졌고, 남은 F1(orphan null)·F2(service 경유)·F3(authenticated RLS)는 스키마·영향 파일·SC에 반영했다.

## 의사결정 로그

- **D1 — 부서와 구역을 독립 테이블로 둔다 (연동 아님)**
  - 문제: 처음엔 시안 "부서 · 속회"를 보고 속회가 부서 하위(연동 드롭다운)라고 설계했다. 그런데 사용자가 준 구역은 믿음·소망·사랑·화평·희락 평평한 5개로, 부서마다 다르지 않다.
  - 해결: 구역을 부서에 종속시키지 않고 독립 `districts` 테이블로 둔다. 프로필은 부서 하나·구역 하나를 각각 고른다. 대안(부서별 구역 50행)은 같은 구역이 부서마다 중복되고 시드가 커져 기각했다.
  - 결과: 스키마·UI가 단순해지고, Codex가 지적한 복합 FK 무결성 문제도 사라진다.
- **D2 — 구역장·리더를 프로필 역할(`district_role`)로 저장한다**
  - 문제: "구역장·구역 리더 필요". 구역 테이블에 장·리더 프로필을 지정하는 방식과, 사람마다 구역 내 역할을 두는 방식이 있다.
  - 해결: `profiles.district_role`(일반/구역리더/구역장, 기본 일반)로 둔다. 사용자가 자기 프로필에서 고른다. 대안(구역 테이블에 장·리더 FK)은 admin 지정 절차가 필요해 이번 프로필 편집 범위와 안 맞아 미뤘다.
  - 결과: 프로필 편집만으로 역할이 정해지고, admin 관리 UI는 후속으로 분리된다.

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (confidence high) → 2건 조치 완료
- **현재 판단**: 레이어·마이그레이션·join cast·외과적 변경은 clean. material 2건(역할/구역 불일치, 조용한 삭제)을 수정하고 라이브 재확인.
- **다음 행동**: verify-task 후 `## Claude 2차 검증` 기록, 사용자 승인 후 커밋

Codex 지적 요지 + 조치:
- F1 material — 구역이 없어도(`district_id` null) 역할을 구역장/리더로 저장 가능해, 부제에 "구역장"만 뜨는 프로필이 생김. → 액션에서 `district_id`가 null이면 역할을 '일반'으로 강제(`profile.action.ts`), 표시에서도 구역 있을 때만 역할 노출(`ProfileSection`), DB에 `check (district_id is not null or district_role = '일반')` 추가(마이그레이션 + dev 적용). 라이브 확인: 구역 없애자 부제가 "청년부"로 정리.
- F2 material — `parseOptionalId`가 invalid id를 조용히 null로 강등해, 조작된 폼이 기존 소속을 지울 수 있음. → 반환을 `{ok, value}`로 바꿔 invalid면 "소속 정보가 올바르지 않습니다"로 에러 반환.
- clean 확인: layer(page→services→apis), 마이그레이션(orphan null·authenticated RLS·admin FOR ALL USING 상속), join cast(단일 forward FK라 to-one embed), 외과적 변경.

풀이: 두 material은 "구역 없는 역할" 불일치와 "invalid 입력의 조용한 삭제"였고, 액션 검증 강화 + DB CHECK + 표시 가드로 막았다. 나머지 항목은 지적 없이 통과.

## Claude 2차 검증

- **최종 판단**: 통과 — 필수 4단계 중 3개 통과, Knip 경고는 기존 부채
- **현재 판단**: `verify-task` 결과 ESLint·stylelint·Build 통과. Knip 경고는 전부 기존 부채로, 신규 파일(reference·services/reference·ProfileWithOrg 등) 언급 0건 — `grep` 확인. 라이브에서 편집·저장·표시·F1 강제(구역 없애자 "청년부")까지 확인.
- **다음 행동**: doc-editor 점검 후 사용자 승인 받아 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260719-020524 | ✅ | ✅ | ✅ | 0 | 없음 (라이브 저장 왕복·F1 확인) |

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

