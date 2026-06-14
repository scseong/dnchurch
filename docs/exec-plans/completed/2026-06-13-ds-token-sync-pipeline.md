# ds-token-sync-pipeline

- **상태**: ✅ 완료 (2026-06-14, PR #118 머지)
- **시작일**: 2026-06-13
- **브랜치**: feat/ds-figma-sync
- **Open questions**: 유료 Code Connect 전환은 PoC 후 판단 (ADR 0017)
- **ADR needed**: no — 방향 결정은 ADR 0017, 본 task는 그 첫 실행(토큰 싱크)만

## 목표

Figma와 코드 토큰을 명령 한 번으로 맞추는 파이프라인을 만든다. figma-console MCP의 `figma_export_tokens`로 Figma 변수를 DTCG(Design Tokens Community Group 표준 JSON) 피벗으로 뽑고, 같은 도구의 dry-run으로 두 곳 차이를 건수로 본다. 손으로 쓴 `src/styles/tokens/*`는 건드리지 않는다.

## 검증된 Assumptions

- figma-console MCP가 `figma_export_tokens`(출력 `dtcg`·`scss`·`css-vars`)와 `figma_import_tokens`(입력 `dtcg` 완전 지원, `scss` 입력은 NotImplementedError)를 제공한다 — ToolSearch로 두 도구 스키마 확인.
- Figma 파일에 변수 174개가 5개 컬렉션(Primitives 28·Color 61·Spacing 30·Radius 21·Typography 34)에 있고 컬렉션마다 모드 1개다 — `figma_get_variables(format=summary)` 호출 결과.
- `src/styles/tokens/*`는 손으로 쓴 파일이고 믹스인·heading 맵·반응형 vw 맵·`rgba()` 합성을 담는다. 이들은 Figma 변수로 표현되지 않는다 — `.claude/skills/styles/SKILL.md` 읽음.
- figma-console 브리지는 Figma 데스크톱 + 플러그인이 켜져 있어야 동작한다(WebSocket port 9224) — `figma_get_status(probe=true)` 응답 `success:true`.

> probe 결과(2026-06-13 step 1·4): `figma_export_tokens` 무인자·dry-run 호출은 `src/styles/tokens/`를 안 쓴다 — `git diff` 0줄, 루트 `tokens.tokens.json` 미생성으로 확인. `strategy:dry-run`+`format:scss` 조합도 작동(Codex CR #2 해소). 토큰 174개는 응답 collections 합으로 확정.

## Success Criteria

- `figma_export_tokens` 무인자 호출이 `src/styles/tokens/*`를 안 쓴다 — `git status` 깨끗. ✅
- `tokens.config.json`이 레포 루트에 있고, 무인자 export가 `docs/design-system/tokens.tokens.json`(도구 기본 파일명)을 실제 생성한다. ✅
- DTCG 산출물에 토큰 174개가 전부 들어간다 — `grep -c '"$value"'` = 174. ✅
- 드리프트 건수를 얻어 `docs/references/figma-token-sync.md`에 적는다 — 비교 41개 중 값 드리프트 0건(40 일치 + `$white` `#fff`=`#FFFFFF` 1 값-동일). ✅
- 동기화 절차 + SoT 경계 문서가 "Figma 소유 174 vs SCSS 전용(믹스인·맵·반응형·rgba)"을 목록으로 적는다. ✅
- 모든 단계 뒤 `git diff --stat src/styles/tokens/`가 빈 결과. ✅

## 영향받는 파일

- `tokens.config.json` (신규 — export/import config)
- `docs/design-system/tokens.tokens.json` (신규 — Figma에서 뽑은 DTCG 피벗, 생성물 78KB)
- `docs/references/figma-token-sync.md` (신규 — 동기화 절차 + SoT 경계 + 드리프트 베이스라인 + 텍스트·이펙트 스타일 스펙)
- `.gitignore` (수정 — Codex 1차 검증 후 `docs/research/figma-ds-*` 커밋 차단 1줄)

## Non-goals

- `src/styles/tokens/*` 재생성·덮어쓰기 — 손으로 쓴 SCSS를 보존한다.
- ui/ 컴포넌트 변경, Button `loading` prop·MetaList·SectionHeader·Toast 승격 — 후속 task.
- 디자인투코드(Figma 디자인을 코드로 생성) 생성 PoC — 후속(스텁 페이지 1곳).
- 유료 Code Connect 설정 — ADR 0017 open question.

## 단계별 체크리스트

- [x] 1. **쓰기 안전성 probe** — `figma_export_tokens` 무인자 호출. `suggestedScaffold` 반환 + 파일 미작성 확인. ✅ 2026-06-13
- [x] 2. `tokens.config.json` 작성 — `source`/`generated.dir` 둘 다 `docs/design-system`(비파괴), `formats:[dtcg]`, mode `Value`. ✅
- [x] 3. `figma_export_tokens`(무인자, config 읽음) → `docs/design-system/tokens.tokens.json` 생성. `$value` 174개 확인. `git diff src/styles/tokens/` 0줄. ✅
- [x] 4. **드리프트 점검** — `figma_export_tokens(strategy:dry-run, format:scss)` 작동 확인. scss를 임시 파일로 뽑아 소스와 같은 이름 raw-hex 41개 비교 → 값 드리프트 0건. 임시 파일 제거. ✅
- [x] 5. `docs/references/figma-token-sync.md`에 드리프트 베이스라인 + 동기화 절차 + SoT 경계 작성. ✅
- [x] 6. `node scripts/verify-task.mjs` + `git diff --stat src/styles/tokens/` 빈 결과. ✅

## Verification

- `node scripts/verify-task.mjs ds-token-sync-pipeline` — run-id `20260613-210708`. ESLint·stylelint·Build 통과. Knip 경고는 기존 부채(15 unused files 등)이고 신규 파일은 미포함.
- 드리프트 건수는 `docs/references/figma-token-sync.md`에 수기 기록. verify-task는 그 숫자를 검사하지 않는다.

## ADR 판단

- ADR needed: no — Figma-SoT 디자인투코드 방향 결정은 ADR 0017에 기록함. 본 task는 `tokens.config.json`·`docs/` 신규 파일만 추가하는 그 실행 단계다.

## 의사결정 로그

- **D1 — DTCG 피벗을 `docs/design-system/`에 두고 도구 기본 파일명을 받아들임**
  - 문제: figma-console가 제안한 scaffold는 `source.dir`을 `src/styles/tokens`(손으로 쓴 SCSS 자리)로, 출력 파일명을 `tokens.tokens.json`으로 잡는다. 그대로 쓰면 SCSS를 덮어쓸 위험이 있고, 계획서엔 `tokens.dtcg.json`으로 적었다.
  - 해결: `source.dir`·`generated.dir`을 둘 다 `docs/design-system`으로 돌려 비파괴를 보장했다. 파일명은 도구 기본값 `tokens.tokens.json`을 받아들였다 — 이유: 무인자 export가 같은 이름으로 재생성하므로 도구와 싸우지 않는 편이 재동기화가 단순하다. 계획서 표기를 실제 파일명으로 맞췄다.
  - 결과: `docs/design-system/tokens.tokens.json` 1개가 정본. `git diff src/styles/tokens/` 0줄로 비파괴 확인.
- **D2 — `docs/research/figma-ds-*`를 `.gitignore`에 추가 (Codex 1차 검증 지적)**
  - 문제: Figma 빌드 메모 2개가 `.gitignore`에 없어 `git add -A` 한 번에 커밋될 위험. 커밋 금지 규칙이 메모리에만 있고 기계로 안 막혔다.
  - 해결: `docs/research/` 전체 차단은 이미 추적 중인 9개(README·perf-optimize 등)와 충돌이라 불가 → `docs/research/figma-ds-*`만 차단. 이유: 추적 파일은 그대로 두고 figma 빌드 메모 2개만 막아야 한다.
  - 결과: `git check-ignore`로 2개 차단 확인, 추적 파일 9개 영향 0. git status가 task 파일만 남음.
- **D3 — 텍스트·이펙트 스타일 스펙을 로컬 메모에서 버전 관리 문서로 옮김 (사용자 요청)**
  - 문제: 텍스트 스타일 12·이펙트 스타일 4 스펙이 `docs/research/figma-ds-token-mapping.md`(커밋 제외)에만 있었다. DTCG export는 변수만 담아 이 스타일들을 안 잡는다.
  - 해결: 스펙 표를 `docs/references/figma-token-sync.md`로 옮겨 버전 관리에 넣었다. 이유: 변수가 아닌 Figma 자산이라 토큰 피벗으로는 다시 뽑을 수 없다 — repo에 남겨야 한다. `docs/research` 메모는 gitignore 유지.
  - 결과: 스타일 스펙이 버전 관리 문서에 남음. `docs/research` 메모는 로컬 스크래치로만 둔다.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 4건 반영 후 WORK 진입. dry-run 쓰기 안전성을 step 1 probe로 확인, `dry-run`+`scss` 폴백 명시(step 4), 드리프트 기록을 `docs/references/figma-token-sync.md`로 지정, `tokens.config.json` 출력 경로 명시.
- **현재 판단**: 4건 모두 실측으로 해소됨 — probe·드리프트 점검이 가정 아닌 실제 호출로 통과.
- **다음 행동**: 없음 (WORK·VERIFY 완료).

## Codex 1차 검증

- **결론**: CHANGE_REQUEST → 1건 해소. `docs/research/figma-ds-*` 2개가 `.gitignore`에 없어 `git add -A`로 커밋될 위험 → 특정 패턴으로 차단(`git check-ignore` 확인). config·생성물 커밋·외과적 변경은 통과.
- **현재 판단**: 앱 코드 변경 0건이라 버그·타입·레이어 지적은 없음. 유일한 material은 커밋 위생(research 파일)이었고 해소함.
- **다음 행동**: 없음 (커밋 승인 대기).

## Claude 2차 검증

- **최종 판단**: 통과 — 신규 파일만 추가, `src/styles/tokens/` 0줄, 필수 검증 회귀 0.
- **현재 판단**: 아래 표. Knip 경고는 기존 부채이고 본 task 파일은 미포함(`grep tokens.config|design-system` 0 hit).
- **다음 행동**: 커밋 승인 요청.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260613-210708 | ✅ | ✅ | ✅ | 0 | — |

## 검증 이력

<details>
<summary>2026-06-13 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST (confidence high)
- 이유: `figma_export_tokens` 동작(dry-run 무쓰기·`dry-run`+`scss` 조합·드리프트 산출물 위치·config 출력 경로)이 가정만 있고 미확인.
- 조치: 체크리스트 1·4 재구성(probe+폴백), SC·Verification에 기록 위치·검증 범위 명시. WORK에서 4건 모두 실측 해소.

</details>

<details>
<summary>2026-06-13 Codex 1차 검증 (구현)</summary>

- 판정: CHANGE_REQUEST (confidence high)
- 이유: `docs/research/figma-ds-*` 2개가 `.gitignore` 미등록 — `git add -A` 시 커밋 위험.
- 조치: `.gitignore`에 `docs/research/figma-ds-*` 추가. config·생성물 커밋·외과적 변경은 통과 판정.

</details>

## 후속 작업

- ui/ 카탈로그 정비 (C-1 폼 단일화 · C-2 SearchField/Select 신설 · C-3 ADR 0014 부품 추출)
  - 이유: 토큰 파이프라인을 먼저 깔아야 토큰 변경이 Figma에 흘러간다.
  - 다음 기준: 본 task 머지 후 `start-task.mjs`로 `ds-ui-catalog-refit` slug 생성.
  - 기록 위치: ADR 0017 ## Decision 이식 전략 행
- 디자인투코드 PoC (스텁 페이지 1곳, 예: community 게시판)
  - 이유: ui/ 카탈로그가 매핑 타겟으로 정비된 뒤에 의미가 있다.
  - 다음 기준: C-1~C-3 일부 완료 후.
  - 기록 위치: ADR 0017 ## Decision 이식 전략 행
- semantic 토큰 이름 매핑 자동 드리프트 비교 (Figma resolved-hex ↔ 소스 alias)
  - 이유: 이번엔 raw-hex 41개만 자동 비교. semantic 16개는 소스가 alias라 빠짐.
  - 다음 기준: 드리프트가 실제로 생기기 시작할 때(Phase C 토큰 추가 후).
  - 기록 위치: 없음

## 회고

- **잘된 것**: 비파괴를 probe로 먼저 확인했다. 무인자 export가 `src/styles/tokens/`를 0줄 건드리는 것을 보고 진행해 손으로 쓴 SCSS를 보존했다. 색 드리프트도 raw-hex 41개 0건으로 실측했고, Codex 계획·1차 지적(probe·gitignore)을 가정이 아니라 실제 호출로 해소했다.
- **다음에 할 것**: export 검증을 색에만 한정하지 않는다. 숫자 scale(spacing·radius)의 이름과 값이 어긋나는지를 색만 비교해 놓쳐서 PR #118 리뷰가 뒤늦게 잡았다. figma-console 재연결 때 `figma_get_variables`로 Figma 원본 spacing·radius를 직접 대조해 export 버그 여부를 가린다.
- **발견된 부채 (→ tech-debt/active.md 옮길 것)**: 등록 완료. DTCG export가 숫자 scale(spacing·radius)의 이름과 값을 어긋나게 뽑는다. alias 47개는 아직 안 풀린다. semantic 토큰 16개는 소스가 alias라 자동 드리프트 비교에서 빠진다.
