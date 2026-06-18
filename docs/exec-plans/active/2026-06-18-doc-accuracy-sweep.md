# doc-accuracy-sweep

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-18
- **브랜치**: develop
- **Open questions**: none
- **ADR needed**: no — 문서 표현·표를 코드·파일과 맞추는 정정이다. CLAUDE.md·docs/ARCHITECTURE.md·.claude/skills가 ADR_TRIGGER_PARTS에 걸리나 레이어 의존 규칙·캐시 정책 자체는 안 바뀐다.

## 목표

CLAUDE.md와 supabase 스킬이 `services`를 읽기 전용처럼 보이게 하는 표현을 고친다. 코드와 어긋난 `revalidateTag` 예시(실제는 `updateTag`)와 하네스 표의 `complete-task` 누락·오래된 audit 마커를 실제 상태와 맞춘다. 코드 동작은 바꾸지 않는다.

## 검증된 Assumptions

- `services`는 읽기·쓰기를 모두 가진다 — `src/services/sermon/sermon-service.ts`에 `list`·`detailBySlug`(읽기)와 `createSermon`·`updateSermon`·`softDeleteSermon` RPC(277-311줄)가 함께 있다 (Read 확인).
- `actions`는 `services`를 호출하고 `apis`는 거치지 않는다 — `src/actions/sermon.action.ts:8`이 `sermonService` import (Read 확인).
- `apis/`에 도메인 파일이 없다 — `Glob src/apis/*.ts` = `auth`·`auth-server`·`user`·`staff`·`cloudinary`·`site-collections`·`site-settings` 7개뿐.
- 코드는 `updateTag`를 쓴다 — `Grep "updateTag|revalidateTag" src/actions` = 액션 5곳(`sermon.action.ts:177·230·254`, `create-bulletin:46`, `update-bulletin:92`) 모두 `updateTag`, 액션 코드에 `revalidateTag` 0건.
- `complete-task` 스킬이 실재한다 — `.claude/skills/complete-task/SKILL.md` 존재 (Glob). CLAUDE.md:156·162-168 표 2곳에서 빠짐.
- 하네스 인프라는 실제와 일치한다 — 에이전트 5(`.claude/agents/*.md`)·훅 7(`.claude/hooks/`)·스크립트 10(`scripts/*.mjs`)·ADR 0001·`docs/README.md` 모두 존재 (감사 확인).

## Success Criteria

- CLAUDE.md:11이 화살표를 "import 서열"로 부르고 `services`의 읽기·쓰기 공존을 명시한다 (단일 책임 라벨 제거).
- supabase 스킬 레이어 설명에 `services` 뮤테이션과 `actions` 진입점 역할이 들어간다.
- `Grep "revalidateTag|revalidatePath" .claude/skills/supabase/SKILL.md` = 0 hits (모두 `updateTag`로 교체).
- `docs/ARCHITECTURE.md:22-26` 다이어그램이 `services`의 읽기·쓰기 공존을 드러낸다 (`apis`=read·`actions`=write 단일 라벨 제거).
- `README.md`의 레이어 라벨(163·164·176 디렉토리 트리·200-205 다이어그램)이 `services` 읽기·쓰기를 반영한다.
- CLAUDE.md 스킬 트리거 표와 지식 시스템 표에 `complete-task` 행이 있다.
- CLAUDE.md·ARCHITECTURE.md `last-audit` 마커 = `2026-06-18`.
- `node scripts/verify-task.mjs doc-accuracy-sweep` 통과 — 신규 lint/build/knip 회귀 0.

## 영향받는 파일

- `CLAUDE.md` — 11(데이터 흐름), 156·162-168(스킬 표), 163(트리거 키워드), 81-88(변경 이력), 170(마커)
- `docs/ARCHITECTURE.md` — 22-26(데이터 흐름 다이어그램 라벨), 61(마커) — Codex 계획 검증 변경요청(CR)으로 추가
- `.claude/skills/supabase/SKILL.md` — 50-54(레이어 역할), 39·45·56·62-64(revalidateTag 예시), 3(frontmatter 키워드)
- `README.md` — 163·164·176(디렉토리 트리 라벨), 200-205(데이터 흐름 다이어그램)

## Non-goals

- `docs/decisions/0016-server-action-conventions.md` 편집 안 함 — Accepted ADR은 소급 수정하지 않는다. 본문은 이미 `updateTag`를 써 코드와 맞는다.
- `src/` 코드 변경 없음 — 문서만 손댄다.
- 레이어 의존 규칙·캐시 정책 변경 없음 — ESLint 규칙과 `updateTag` 동작은 그대로다.

## 단계별 체크리스트

- [ ] 1. CLAUDE.md:11 — import 서열 + 레이어 책임(`services` 읽기·쓰기)으로 재서술
- [ ] 2. `docs/ARCHITECTURE.md` 22-26 — 다이어그램 라벨을 import 서열 + `services` 읽기·쓰기로, 마커(61) 갱신
- [ ] 3. supabase 스킬 50-54 — `apis` 횡단 쿼리·`services` 읽기/쓰기·`actions` 진입점으로
- [ ] 4. supabase 스킬 — `revalidateTag`/`revalidatePath` 예시를 `updateTag` ROOT 태그 패턴으로 (전체 grep 0)
- [ ] 5. `README.md` 163·164·176·200-205 — 레이어 라벨에 `services` 읽기·쓰기 반영
- [ ] 6. CLAUDE.md 스킬 트리거 표·지식 시스템 표 — `complete-task` 행 추가
- [ ] 7. CLAUDE.md — `last-audit` 마커 갱신 + 하네스 변경 이력 1행
- [ ] 8. doc-editor(exec-plan 대상) → `verify-task` → 커밋 승인

## Verification

- `node scripts/verify-task.mjs doc-accuracy-sweep`
- `Grep "revalidateTag" .claude/skills/supabase/SKILL.md` → 0 hits
- `Grep "complete-task" CLAUDE.md` → 스킬 트리거 표·지식 표에 존재

## 의사결정 로그

- **D1 — 데이터 흐름 표현 정정 범위에 `docs/ARCHITECTURE.md`·`README.md` 포함**
  - 문제: 초안은 `CLAUDE.md`·supabase 스킬만 잡고, 아키텍처 SSOT인 `docs/ARCHITECTURE.md:22-26`과 `README.md:163-164`·`200-205`의 같은 `apis`=read·`actions`=write 라벨을 빠뜨렸다. Codex 계획 검증(CHANGE_REQUEST)이 짚었고 직접 Read로 확인했다.
  - 해결: 네 문서를 한 기준(import 서열 + `services` 읽기·쓰기 공존)으로 함께 고친다. SSOT만 빼면 문서끼리 반대 설명이 남기 때문이다.
  - 결과: 레이어 설명이 한 기준으로 일치하고, `last-audit` 마커도 `ARCHITECTURE.md:61`·`CLAUDE.md:170` 둘 다 갱신한다.
- **D2 — `README.md` 레이어 라벨 줄번호를 163·164·176으로 잡음**
  - 문제: 초안은 "163-164 디렉토리 트리"로만 적었으나 `services/`는 `README.md:176`("비즈니스 로직")에 따로 있어 빠졌다. Codex 재검증(expression-only)이 짚었다.
  - 해결: 영향 파일·Success Criteria·체크리스트 step 5의 README 줄번호에 176을 더한다.
  - 결과: 디렉토리 트리에서 `actions`(163)·`apis`(164)·`services`(176) 라벨을 함께 고친다.
- **D3 — ADR 판단 사유에 `docs/ARCHITECTURE.md` 명시**
  - 문제: frontmatter `ADR needed: no` 사유가 "CLAUDE.md·.claude/skills"만 들어, 범위에 추가된 `docs/ARCHITECTURE.md`(ADR_TRIGGER_PARTS 포함)를 빠뜨렸다. Codex 재검증(expression-only)이 짚었다.
  - 해결: 사유 줄의 트리거 파일 목록에 `docs/ARCHITECTURE.md`를 더한다. ADR 불필요 판단 자체는 그대로다.
  - 결과: harness-gate가 보는 ADR_TRIGGER_PARTS 파일이 사유에 모두 적힌다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence high) — material 0건. expression-only 2건은 D2·D3에 기록 후 WORK 진입.
- **현재 판단**: 1차 material 지적(`docs/ARCHITECTURE.md` 누락)은 범위 추가로 해소. 남은 2건은 plan 본문의 정확도 문제다 — README 줄번호 176 누락과 ADR 사유의 파일 목록 빠짐.
- **다음 행동**: D2·D3 반영 완료. 8단계 체크리스트대로 문서 4개 편집.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: 미요청
- **다음 행동**: 구현 diff 생성 후 갱신

## Claude 2차 검증

- **최종 판단**: PASS — doc-only 변경(`.md` 4개). 좁은 검증으로 Success Criteria 충족 확인.
- **현재 판단**: supabase 스킬 `revalidateTag`/`revalidatePath` 0건(grep), CLAUDE.md 스킬 표 2곳에 `complete-task` 존재, 오해 라벨("read 중심"·"쿼리 (read)" 등) 전 저장소 0건. build·knip은 `.md`에 무관(`yarn dev` 가동 가능성으로 build 생략), doc-editor는 exec-plan 표현 5건(경미)만 지적.
- **다음 행동**: doc 4파일 + 본 exec-plan만 stage 후 Docs 커밋 (church-jsonld WIP 제외).

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

<details>
<summary>2026-06-18 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST (medium)
- 이유: `docs/ARCHITECTURE.md:22-26`(아키텍처 SSOT)이 범위에서 빠져 같은 read/write 오해가 남음
- 조치: ARCHITECTURE.md·README를 범위에 추가 (D1)

</details>

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

