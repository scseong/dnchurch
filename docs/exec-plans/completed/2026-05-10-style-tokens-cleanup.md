# style-tokens-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-10
- **브랜치**: refactor/about-page-redesign

## 목표

디자인 시스템 v3에서 미완료 상태로 남은 토큰 잔재 정리 + SCSS 폴더 안의 docs-only 파일을 docs로 이전.
- (a) 사용처 0건이 확인된 `$navy-blue-900/800/700/100`(deprecated 주석에 "후속 PR에서 제거 예정"이라 본인 명시) 4개를 `_color.scss`에서 삭제.
- (b) `src/styles/_usage-guide.scss`(어디에도 import 안 되는 ASCII docs)를 `docs/references/STYLES_USAGE_GUIDE.md`로 이전. `docs/PROJECT_GUIDE.md:142`의 디렉토리 설명도 함께 갱신.
- (c) `$beige-300` semantic 매핑 부재를 `tech-debt-tracker.md`에 등록(코드 변경 없음).

## Assumptions

- `$navy-blue-*` 4개 토큰의 주석("외부 사용처 0건 확인. 후속 PR에서 정의 자체 제거 예정")이 현재도 유효하다. EXPLORE의 `rg` 결과로 사용처 0건 재확인됨.
- `_usage-guide.scss`는 partial naming(`_*`)이지만 `_variables.scss` 또는 다른 SCSS 파일에서 import되지 않아 컴파일 영향 없음. EXPLORE에서 `@use`/`@import` 0건 확인.
- `$beige-300`은 active plan `2026-05-08-about-page-redesign`에서 사용자 명시 요청으로 `$cream-300 → $beige-300` 매핑되어 도입된 의도적 토큰이다. 사용처 4 모듈 5건(QuickAccess, SermonVideoPlayer, GridCard, SermonCard×2). **본 PR은 이 토큰을 건드리지 않는다** — semantic 매핑 부재는 tech-debt 항목으로 등록만 한다.
- `docs/PROJECT_GUIDE.md:142`에 디렉토리 구조 설명으로 일반어 `usage-guide` 1건 존재 (`├── styles/  # 토큰·믹스인·globals·usage-guide`). 본 PR에서 이전과 함께 갱신한다.
- v3 ADR 0003은 "deprecated alias가 정리 시점을 잃고 영구 부채로 남는다"를 우려로 명시 — 본 PR은 그 우려를 해소하는 후속 청소.

## Non-goals

- 27개 module.scss의 primitive 직접 사용 정리 (별도 PR — stylelint 규칙 추가가 선행).
- `$beige-300` **삭제·이동·rename** — 사용처 4 파일 5건이 active plan의 의도된 매핑 결과. 본 PR 범위 밖.
- `$beige-300`에 새 semantic 매핑 부여 — `_usage-guide.scss` 이전·`$navy-blue-*` 삭제·tech-debt 등록만으로 본 PR 범위 한정. semantic 매핑 결정은 후속 PR.
- `_usage-guide.scss` 내용을 markdown 형식으로 재작성 — 본 PR은 위치 이동만, 텍스트는 fenced code block으로 보존.
- SCSS 파일에 `@deprecated` JSDoc 같은 새 주석 컨벤션 도입.
- 다른 8개 디자인 시스템 개선안(#1·#2·#3·#4·#5·#8·#9·#10) — 이미 완료된 PR 1과 별도.

## Success Criteria

- `rg '\$navy-blue-' src .claude` → 0 hits (현재 `_color.scss` 정의 + SKILL.md 언급 외 없음 → 두 곳 제거 후 0).
- `src/styles/_usage-guide.scss` 파일 부재. `docs/references/STYLES_USAGE_GUIDE.md` 신규 존재. SKILL.md의 *"상세 매핑은 `src/styles/_usage-guide.scss` 참조"* 문장과 PROJECT_GUIDE.md:142 디렉토리 설명이 새 경로 또는 제거된 형태로 갱신됨.
- `tech-debt-tracker.md`에 `$beige-300 semantic 매핑 부재` 항목이 형식(상태/무엇/왜/마이그레이션 경로/영향 범위/발견일)에 맞게 추가됨.
- `yarn lint:styles` 통과, `yarn build` 통과.
- `git mv`로 이동했으므로 git history 유지.
- `$beige-300` 사용처 변화 0건 (`src/app`·`src/components`에서 4 파일 5건 그대로).

## Verification

- `rg '\$navy-blue-' src .claude` → 0 hits
- `rg '_usage-guide' -g '!docs/exec-plans/**'` → 0 hits (이동 후 SKILL.md·PROJECT_GUIDE.md 모두 새 경로로 갱신됐음)
- `rg '\$beige-300' src/app src/components` → 5 hits (정의 파일 제외, 4 파일 5건 그대로)
- `node scripts/verify-task.mjs style-tokens-cleanup`

## 접근법

세 영역의 외과적 변경. 각 영역 독립 — 하나가 실패해도 나머지에 영향 없음.

- **#6a `$navy-blue-*` 삭제**: `_color.scss:27-34` 주석 블록(`// ── Navy-Blue ── @deprecated` 3줄) + 변수 정의 4줄 통째로 제거. SKILL.md primitive 목록(line ~67)의 navy-blue 그룹 줄 제거.
- **#6b `$beige-300` 삭제 → tech-debt 등록으로 변경**: 사용처 4 모듈 5건이 활성 plan의 의도된 매핑이므로 코드 변경 안 함. `tech-debt-tracker.md` 활성 항목에 *"`$beige-300` semantic 매핑 부재"* 신규 등록. SKILL.md의 *"미정"* 표현은 본 PR에서 손대지 않음(별도 PR).
- **#7 `_usage-guide.scss` 이전**: `git mv src/styles/_usage-guide.scss docs/references/STYLES_USAGE_GUIDE.md` 후, .md 헤더 추가하고 기존 ASCII 주석 블록은 fenced code block(```text)으로 감싸 보존. SKILL.md 마지막 줄("상세 매핑은 `src/styles/_usage-guide.scss` 참조.") 경로 갱신. `docs/PROJECT_GUIDE.md:142` 디렉토리 설명에서 `usage-guide` 단어 제거(파일이 더 이상 `src/styles/`에 없음).

## 영향받는 파일

- `src/styles/tokens/_color.scss` — `$navy-blue-*` 4줄 + 주석 3줄 제거
- `.claude/skills/styles/SKILL.md` — primitive 목록에서 navy-blue 그룹 제거 + usage-guide 경로 갱신
- `src/styles/_usage-guide.scss` → `docs/references/STYLES_USAGE_GUIDE.md` (git mv + 마크다운 래핑)
- `docs/PROJECT_GUIDE.md` — line 142 디렉토리 설명에서 `usage-guide` 단어 제거
- `docs/tech-debt-tracker.md` — `$beige-300 semantic 매핑 부재` 활성 항목 추가

## 단계별 체크리스트

- [x] 1. `_color.scss`에서 `$navy-blue-*` 4개 정의와 deprecated 주석 블록(line 27-34) 제거.
- [x] 2. SKILL.md Primitive 목록에서 navy-blue 그룹 줄 제거. (`$beige-300` 줄은 손대지 않음)
- [x] 3. `git mv src/styles/_usage-guide.scss docs/references/STYLES_USAGE_GUIDE.md`.
- [x] 4. 새 위치 파일 상단에 `# Styles Usage Guide` 헤더 + 한 줄 출처 주석 추가. 기존 SCSS 코멘트 본문은 fenced code block으로 감쌈.
- [x] 5. SKILL.md 마지막 부분 *"상세 매핑은 `src/styles/_usage-guide.scss` 참조"* → `docs/references/STYLES_USAGE_GUIDE.md`.
- [x] 6. `docs/PROJECT_GUIDE.md:142` 디렉토리 설명에서 `usage-guide` 단어 제거.
- [x] 7. `tech-debt-tracker.md`에 `$beige-300 semantic 매핑 부재` 항목 추가 (활성 항목 섹션).
- [x] 8. `rg '\$navy-blue-' src .claude` 0 / `rg '_usage-guide'` src 0 + exec-plan 이력만 / `rg '\$beige-300' src/app` 5 → 모두 PASS.
- [ ] 9. `node scripts/verify-task.mjs style-tokens-cleanup` 실행.

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs style-tokens-cleanup` 통과
- [ ] 사용자 승인 후 커밋
- [ ] ADR 불필요 (사유: ADR 0003에 명시된 "deprecated alias 정리" 후속 청소. 정책·구조 변경 없음)

## 참고 자료

- `docs/exec-plans/completed/2026-05-04-design-system-v3.md` — v3 마이그레이션 본 PR
- `docs/decisions/0003-design-system-v3-token-unification.md` — deprecated alias 우려 명시 ADR
- `docs/exec-plans/active/2026-05-08-about-page-redesign.md:168` — `$cream-300 → $beige-300` 매핑 도입 기록
- `docs/exec-plans/active/2026-05-10-style-tokens-doc-sync.md` — PR 1 (직전 docs 정합화)

## 의사결정 로그

- 2026-05-10: `_usage-guide.scss` 변환 방식 — markdown 재작성(scope creep) 대신 fenced code block으로 텍스트 보존하는 옵션 선택. 향후 별도 PR에서 markdown 정식화 가능.
- 2026-05-10: `$beige-300` 처리 — 초기 plan은 "사용처 0건이라 삭제" 전략이었으나 Codex 1차 BLOCK으로 사용처 4 파일 5건 발견. 2026-05-08 about-page-redesign plan이 `$cream-300 → $beige-300` 매핑을 사용자 명시 요청으로 의도적으로 도입한 토큰임을 확인 → 본 PR에서 삭제·매핑 부여 모두 제외. tech-debt-tracker에 semantic 매핑 부재만 등록.
- 2026-05-10: `docs/PROJECT_GUIDE.md` 처리 — 세션 시작 시점부터 untracked인 사용자 미커밋 작업 파일. 본 PR이 line 142(`├── styles/  # 토큰·믹스인·globals` ← `usage-guide` 제거)를 수정했으나 사용자 결정으로 **본 PR 커밋에서 제외** — 사용자가 PROJECT_GUIDE.md를 처음 커밋할 때 함께 들어가도록 untracked 상태 보존. 본 PR 커밋 staging에는 포함하지 않음.

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: `docs/decisions/0003-design-system-v3-token-unification.md` (기존 ADR)
- **사유**: 본 PR은 ADR 0003이 명시한 "deprecated alias가 정리 시점을 잃지 않게 한다"의 직접 후속. 새 정책·구조·라이브러리 도입 없음.

## Codex 계획 검증

- **상태**: 1차 BLOCK → 2차 CHANGE_REQUEST → 반영 완료, 진행
- **요청 시점**: 2026-05-10 (1차·2차)
- **결론**: 1차 BLOCK → 2차 CHANGE_REQUEST → 반영 후 진행
- **핵심 지적** (1차 BLOCK):
  1. **`$beige-300` 사용처 0건 주장이 거짓**: `rg '\$beige-300' src` 결과 4 파일 5건(QuickAccess, SermonVideoPlayer, GridCard, SermonCard×2). 삭제 시 SCSS 빌드 영향.
  2. **`$beige-300`이 active plan과 연관**: `2026-05-08-about-page-redesign`에 `$cream-300 → $beige-300` 매핑이 사용자 명시 요청으로 9 파일 갱신 완료된 의도적 토큰.
  3. **`PROJECT_GUIDE.md` 갱신 검토 필요**: `_usage-guide.scss` 참조 확인 필요.
  4. **`$navy-blue-*` 삭제는 ADR 0003·v3 회고 기준 보존 이유 없음**: 진행 안전.
  5. **fenced code block 보존 동의**: 현행 판단 유지.
- **핵심 지적** (2차 CHANGE_REQUEST):
  1. **`rg 'usage-guide'` 검증 패턴이 PROJECT_GUIDE.md:142의 일반어 `usage-guide`와 충돌** → 검색 패턴을 `_usage-guide`로 좁히거나 PROJECT_GUIDE 갱신을 plan에 명시.
  2. **`rg '\$navy-blue-'`가 active plan 내부 텍스트를 false positive 매치** → 검색 범위를 `src .claude`로 좁힘.
  3. **`rg '\$beige-300' src`가 정의 파일 포함 6 hits** → 정의 제외 위해 `src/app src/components`로 범위 한정.
- **반영 내용**:
  - `$beige-300` 삭제 시도 전부 제거 (1차 BLOCK 반영). Non-goals 명시 + tech-debt 등록만.
  - PROJECT_GUIDE.md:142 직접 확인 → 일반어 `usage-guide` 1건 존재. 갱신 항목으로 추가(2차 반영).
  - 검증 명령 3건 모두 정확도 정정: `rg '\$navy-blue-' src .claude`, `rg '_usage-guide' -g '!docs/exec-plans/**'`, `rg '\$beige-300' src/app src/components` (2차 반영).
  - 목표·Assumptions·Success Criteria·Verification·접근법·영향파일·체크리스트에 PROJECT_GUIDE.md 갱신 항목 추가.

## Codex 1차 검증

- **상태**: 미요청
- **요청 시점**:
- **결론**: 미요청 / PASS / FIX_APPLIED / CHANGE_REQUEST / BLOCK
- **수정 파일**:
- **핵심 지적**:
- **남은 리스크**:

## Claude 2차 검증

- **검토 내용**:
  - 5개 영역 변경 모두 plan 범위와 일치. 인접 정리·포맷 변경 없음(외과적).
  - `_color.scss`: navy-blue 그룹 8줄(주석 3 + 정의 4 + 빈줄) 제거. 정확.
  - `SKILL.md`: navy-blue 줄 + usage-guide 경로 갱신. `$beige-300 — 미정` 표현은 손대지 않음(plan Non-goal).
  - `_usage-guide.scss → STYLES_USAGE_GUIDE.md`: git rename으로 history 유지. md 헤더 + fenced code block 추가, 본문 텍스트 그대로 보존.
  - `PROJECT_GUIDE.md:142`: line 1줄 수정 완료. 단 사용자 결정으로 본 PR 커밋 staging 제외(의사결정 로그 기록).
  - `tech-debt-tracker.md`: `$beige-300 semantic 매핑 부재` 항목이 형식(상태/무엇/왜/마이그레이션/영향/확인/발견일)에 맞게 추가됨.
- **실행한 검증**:
  - `node scripts/verify-task.mjs style-tokens-cleanup` → ESLint ✓, stylelint ✓, Build ✓. Knip 경고는 기존 부채(본 PR 무관).
  - `rg '\$navy-blue-' src .claude` → 0 hits ✓
  - `rg '_usage-guide'` → src 0건, exec-plan 이력만 ✓
  - `rg '\$beige-300' src/app` → 4 파일 5건 그대로 ✓
- **최종 판단**: 사용자 승인 후 커밋 진행 가능. 본 PR 커밋 staging은 5개 파일(`_color.scss`, `SKILL.md`, `STYLES_USAGE_GUIDE.md` rename+modified, `tech-debt-tracker.md`, exec-plan).

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: Codex 1차 BLOCK이 `$beige-300` 사용처 오판을 차단 — scope creep 없이 tech-debt 등록으로 전환. `git mv`로 history 유지하며 `_usage-guide.scss → STYLES_USAGE_GUIDE.md` 이전. Codex 2차 CHANGE_REQUEST로 검증 명령 3건 정확도 개선.
- 다음에 할 것: `$beige-300` semantic 매핑 부여 (후속 PR). `docs/PROJECT_GUIDE.md:142` 갱신은 사용자 커밋 시 함께 반영.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): `$beige-300 semantic 매핑 부재` — tech-debt-tracker 등록 완료
