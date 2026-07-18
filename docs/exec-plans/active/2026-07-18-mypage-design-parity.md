# mypage-design-parity

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-18
- **브랜치**: feat/my-page
- **Open questions**: 부서/속회 표시의 참조 데이터 방식 (Phase 3, 아래 후속 작업 참조)
- **ADR needed**: no — src/app 컴포넌트·SCSS만 변경. apis/services/actions/config 미변경 (Phase 1 기준)

## 목표

Claude Design 마이페이지 시안(업데이트본)에 맞춰 기록기·기록 공유 시트를 강화하고 시각을 다듬는다. DB가 필요 없는 화면 표현 변경분(기록기 배지·범례·문구, 공유 카드 월 히트맵·오늘 범위, 골드 톤 다듬기)을 Phase 1로 먼저 완성한다. 설정 저장·부서/속회는 스키마가 필요해 후속으로 분리한다.

## 검증된 Assumptions

- 골드 테마 토큰이 이미 존재 — `$gold-600: #93702e`가 시안 `#93702E`와 일치, `$beige-50~300` 크림 배경. 확인: `rg` `src/styles/tokens/_color.scss` (ADR 0020 warm 이행). 새 색 토큰 불필요.
- 공유 카드 강화에 필요한 데이터 전부 존재 — `computeMonth`(MonthView.cells/level), `computeTodayEntries`(범위 문자열)가 유틸에 있음. 확인: Read `src/utils/bible-tracker.ts:117,187`.
- `departments` 테이블 없음, `profiles.dept_id`는 FK·참조 테이블 없이 int만 — 부서명을 "청년2부"로 해석할 수 없다. 확인: `rg -n "departments" supabase/migrations src/types/database.types.ts` 0건, `list_tables(public)`에도 departments 미존재.
- `bible_reading_settings`에 알림/리마인더/번역본 컬럼 없음 — `user_id/weekly_goal/current_cycle/updated_at` 4개뿐. 확인: `src/types/database.types.ts` bible_reading_settings Row + `supabase/migrations/20260717000000_create_bible_reading.sql:46-50`.
- 기록기·기록 탭·공유 시트 컴포넌트가 이미 존재 — Recorder/RecordTabs/ShareSheet/TrackerSection. 확인: Read.

## Non-goals

- 하단 탭바·상태바 등 네이티브 앱 셸 — 반응형 웹 전역 내비와 이중 내비. 별도 과제 (사용자 합의).
- 카카오톡 채팅 미리보기 목업의 앱 내 재현 — 시안의 공유 결과 일러스트일 뿐 실제 카카오 SDK 미연동. 공유 버튼 3종은 현행 "준비 중" 유지.
- 설정 저장 기능·부서/속회 표시 — 스키마 신설 필요. Phase 2·3 후속으로 분리.
- 기존 낙관적 쓰기·액션·유틸 계산 로직 변경. Phase 1은 화면 표현 계층만.
- prior-read 컨텍스트("이전에 읽은 기록" — 통독 진행에만 반영하고 일간 기록에는 넣지 않음). 시안 번들에 `recContext:'prior'` 상태가 있으나 `bible_reading_records.read_date`가 NOT NULL·unique key(`supabase/migrations/20260717000000_create_bible_reading.sql:8-17`)이고 `recordChaptersAction`이 날짜를 필수로 받아(`src/actions/bible-reading.action.ts:29-33`) DB·action 변경이 필요하다. Phase 4로 미룬다. "이전에 읽은 기록 불러오기" relabel도 같은 뜻을 담아 함께 미루고, 두 번째 CTA는 현재 문구와 동작(지난 날짜 기록)을 유지한다.

## Success Criteria

- 기록기 권 목록에 오늘 새로 추가한 장이 배지로 보이고, 장 그리드 아래에 "오늘 읽음 / 이미 읽음" 범례가 뜬다 (yes/no).
- 기록 공유 카드에 "오늘 읽은 곳" 범위와 이번 달 히트맵("한 달의 발자취")이 렌더된다 (yes/no).
- 오늘 CTA 문구가 시안과 일치: "읽은 곳 기록하기" (yes/no). (두 번째 CTA "지난 날짜·권별로 기록하기"는 prior-read를 미뤄 현행 유지)
- 스타일 값은 전부 semantic 토큰 — primitive($gold-*/$beige-* 직접)·하드코딩 색/간격 0건. `yarn lint:styles` 통과 (yes/no).
- `node scripts/verify-task.mjs mypage-design-parity` 신규 회귀 0 (yes/no).

## 영향받는 파일

- `src/app/(content)/mypage/_component/tracker/Recorder.tsx` — 권 배지·장 범례·컨텍스트 문구
- `src/app/(content)/mypage/_component/tracker/ShareSheet.tsx` — 오늘 범위·월 히트맵
- `src/app/(content)/mypage/_component/tracker/RecordTabs.tsx` — 버튼 문구
- `src/app/(content)/mypage/_component/tracker/TrackerSection.tsx` — 버튼 문구·공유 시트 props
- `src/app/(content)/mypage/_component/tracker/tracker.module.scss` — 신규 요소 스타일 (토큰)

## 단계별 체크리스트

Phase 1 (이번 PR · DB 무관):

- [x] 1. 시안 구조·팔레트 확인 — 공유 카드는 이미 다크 골드 그라디언트, 골드 토큰이 시안 `#93702E`와 일치
- [x] 2. Recorder — 권 목록 날짜별 배지(✓ N), 장 그리드 범례(오늘 읽음/이미 읽음). prior-read 컨텍스트 문구는 Phase 4로 미룸
- [x] 3. ShareSheet — 기간별 카드 본문: 일=오늘 범위, 주=요일 스트립, 월=한 달의 발자취 히트맵. props todayRanges·weekDays·monthCells 전달
- [x] 4. 오늘 CTA 문구 "읽은 곳 기록하기"로. 두 번째 CTA는 prior-read defer로 유지
- [x] 5. tracker.module.scss — 신규 요소 스타일, semantic 토큰만(rgba는 로컬 주석), 모바일 퍼스트
- [~] 6. VERIFY — tsc/eslint/stylelint 통과 + 라이브 localhost:3000 시각 대조 완료. 전체 verify-task는 커밋 전 실행(dev 서버와 .next 경합 회피)

## Verification

- `node scripts/verify-task.mjs mypage-design-parity`
- `yarn lint:styles` (semantic 토큰만, primitive·하드코딩 0건)
- 라이브 `/mypage` 시각 대조 — 모바일 390px viewport 캡처로 기록기(권 배지·범례)·공유 시트(오늘 범위·월 히트맵)를 시안과 대조. 캡처 기준 1개: DPR=1, width 390

## 의사결정 로그

- **D1 — prior-read 컨텍스트를 Phase 1에서 뺀다**
  - 문제: 시안의 "이전에 읽은 기록 불러오기" 버튼은 통독에만 반영하고 일간 기록엔 넣지 않는 prior-read 모드를 연다. 현재 `bible_reading_records.read_date`는 NOT NULL이고 (user_id, book_order, chapter, read_date, cycle) unique key에 들어가, "날짜 없는 통독 반영"을 저장할 자리가 없다.
  - 해결: prior-read를 Phase 4 후속으로 미루고, Phase 1에서는 라벨도 바꾸지 않는다. 대안(read_date nullable 전환)은 기존 unique key·일간 계산 로직을 흔들어 Phase 1의 "화면 표현 계층만" 범위를 깬다. 그래서 데이터 모델을 따로 정하는 후속으로 분리했다.
  - 결과: Phase 1이 프론트 전용으로 유지된다. 두 번째 CTA는 현재 문구 "지난 날짜·권별로 기록하기"와 동작을 그대로 둔다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 조치 완료 후 WORK 진입
- **현재 판단**: material 1건 타당 — "이전에 읽은 기록 불러오기" relabel이 prior-read 컨텍스트를 함의하나 DB 제약상 프론트 전용 불가. Non-goals에 defer, 성공기준/체크리스트에서 해당 relabel 제거로 조치.
- **다음 행동**: Phase 1 WORK (공유 히트맵·오늘 범위, 기록기 배지·범례, "읽은 곳 기록하기" relabel만)

Codex 지적 요지:
- material: 목업 번들(`docs/한빛교회 마이페이지.html:383-396`) gzip 해제 시 `recContext:'prior'`·`priorRead`·"통독 진행에만 반영 · 일간 기록에는 포함되지 않아요" 상태가 존재. 그러나 `read_date`가 NOT NULL·unique key(`supabase/migrations/20260717000000_create_bible_reading.sql:8-17`), `recordChaptersAction`이 날짜 필수(`src/actions/bible-reading.action.ts:29-33`)라 prior-read는 타입/DB/action 변경 필요 → Phase 1에서 defer해야 함.
- expression-only 2건: DB 부재 근거를 MCP 호출 대신 repo 파일(`supabase/migrations`·`src/types/database.types.ts`) grep으로 병기 / 시각 대조에 viewport·캡처 기준 1개 이상 명시.

풀이: prior-read를 Phase 1 Non-goals로 내리고 relabel 범위를 현재 동작과 일치하는 것만 남기면 material 해소. expression-only 2건은 아래 조치 반영.

## Codex 1차 검증

- **결론**: PASS (confidence high)
- **현재 판단**: 구현 diff 5파일 검토 — 직접 수정 대상·반려 대상 모두 0건. 버그·타입·누락 guard·레이어 위반·외과적 변경 위반·토큰 하드코딩 없음.
- **다음 행동**: 전체 verify-task 실행 후 `## Claude 2차 검증`에 기록, 사용자 승인 후 커밋

## Claude 2차 검증

- **최종 판단**: 통과 — 필수 4단계 중 3개 통과, Knip 경고는 기존 부채
- **현재 판단**: `verify-task` 실행 결과 ESLint·stylelint·Build 통과. Knip 경고 항목(useDebounce·sermon utils·UI barrel 등)은 전부 기존 부채로, 내 변경 파일(ShareSheet·Recorder·RecordTabs·TrackerSection·tracker.module.scss)과 무관 — `grep`으로 내 파일 언급 0건 확인.
- **다음 행동**: doc-editor 점검 후 사용자 승인 받아 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260718-232732 | ✅ | ✅ | ✅ | 0 | 없음 (라이브 시각 대조 완료) |

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

- Phase 2 — 설정 시트(⚙ 헤더 진입 + BottomSheet: 알림 토글·읽기 리마인더 시간·번역본)
  - 이유: `bible_reading_settings`에 알림/리마인더/번역본 컬럼이 없어 저장이 불가. 마이그레이션 + 서비스/액션 + 타입 재생성이 선행돼야 함.
  - 다음 기준: Phase 1 머지 후, 저장할 설정 항목 확정 시 착수. 알림은 실제 푸시 인프라가 없어 UI 토글만 저장할지 결정 필요.
  - 기록 위치: 이 exec-plan (Phase 1 머지 시 별도 plan으로 분리)
- Phase 3 — 프로필 부제 부서·속회 표시 + 편집 폼
  - 이유: `departments` 테이블이 없고 `profiles.dept_id`는 참조 대상이 없어 "청년2부"로 해석 불가. 속회는 컬럼 자체가 없음. 참조 데이터 방식(테이블 신설 vs 하드코딩 맵 vs 자유 텍스트 컬럼) 결정이 선행.
  - 다음 기준: 부서/속회 참조 데이터 방식 사용자 결정 후.
  - 기록 위치: 이 exec-plan Open questions
- Phase 4 — prior-read 컨텍스트(이전에 읽은 기록: 통독 진행에만 반영·일간 기록 제외)
  - 이유: `bible_reading_records.read_date`가 NOT NULL·unique key라 날짜 없는 통독 반영을 표현할 수 없음. nullable read_date 또는 별도 컬럼/테이블 + action·타입 변경 필요.
  - 다음 기준: Phase 1 머지 후, prior-read 데이터 모델 결정 시.
  - 기록 위치: 이 exec-plan (Codex 계획 검증 material 지적)

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

