# stylelint-primitive-guardrail

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-10
- **브랜치**: refactor/about-page-redesign

## 목표

primitive 토큰(`$gray-*`/`$navy-*`/`$gold-*`/`$beige-*`/`$cream-*`/`$black`/`$white`) 직접 사용을 stylelint warning으로 검출하는 가드레일 1개를 추가한다. 신규 코드는 즉시 lint-staged 단계에서 warning으로 노출되어 추가 유입을 차단하고, 기존 27 파일·104회 부채는 warning으로 가시화하되 빌드·커밋은 막지 않는다(기존 `color-no-hex` 정책과 동일한 운용 방식).

## Assumptions

- stylelint 17.9.1이 `declaration-property-value-disallowed-list` 룰을 정상 지원한다(공식 룰).
- `severity: warning`으로 도입하면 `verify-task.mjs`의 `yarn lint:styles`는 통과한다(현 `color-no-hex` 정책과 동일).
- pre-commit lint-staged의 stylelint는 warning으로는 차단하지 않는다(기존 49건 hex 부채가 차단되지 않는 사실로 검증됨).
- primitive 직접 사용을 의도적으로 허용해야 하는 영역은 토큰 정의 자체(`src/styles/`)뿐이다. 모든 `*.module.scss`는 semantic 토큰을 거쳐야 한다.
- `$beige-300`(2026-05-08 about-page-redesign 도입, semantic 매핑 부재)도 본 룰에 의해 warning으로 잡힌다 — `tech-debt-tracker.md`에 이미 등록된 항목과 정합한다.

## Non-goals

- 27 파일·104회 기존 부채의 실제 치환 — 본 PR은 가드레일만, 청소 PR은 별도(영역별 분리 예정).
- 룰 severity를 `error`로 격상 — 기존 부채를 모두 청소한 뒤 별도 PR.
- admin raw hex(`#fff`, `#ef4444`, `#858585`) 정리 — 기존 `color-no-hex` warning이 이미 잡고 있음. tech-debt-tracker `🟡 SCSS 하드코딩 색상 (49건)`에 등록.
- primitive를 SCSS-level에서 `@error` 또는 `@warn`으로 막는 매크로 도입 — runtime 레이어 변경이라 over-engineered.
- 적용 범위를 `padding`/`margin`/`font-size` 등 비-색상 property로 확장 — 본 PR은 색상·테두리·그림자 계열만. spacing은 `_spacing.scss`의 primitive 사용이 정당한 케이스가 많아 별도 검토.
- `caret-color`, `text-emphasis-color`, `column-rule-color`, `text-shadow`, mask 계열 property — 현재 코드 베이스에서 primitive 사용 증거 없음. 추후 발생 시 룰 확장(별도 PR).

## Success Criteria

- `.stylelintrc.json`에 `declaration-property-value-disallowed-list` 룰 1개 추가, severity warning. 메시지에 *"primitive 토큰 직접 사용 금지"* 명시.
- override에 `src/styles/**` 추가 — 토큰 정의·믹스인·globals는 룰 면제.
- `yarn lint:styles` 실행 시 새 룰로 인한 warning이 노출되며, 기존 module.scss 부채가 warning으로 잡힌다(error 0건).
- `verify-task.mjs` 통과(필수 검증 모두 ✓).
- pre-commit lint-staged가 warning으로 차단되지 않음 — 더미 변경 파일에서 확인 가능하지만 본 PR diff로도 충분(stylelint은 모든 파일에 적용되니 실행시 warning이 노출되어야 정상).

## Verification

- `yarn lint:styles` → 새 룰 warning 노출, error 0건. warning 수 = 27 파일·104회 + `$beige-300` 5건 + 기존 부채 추가 가능.
- `node scripts/verify-task.mjs stylelint-primitive-guardrail` 통과.
- 룰 동작 수동 확인: `src/app/_component/home/QuickAccess.module.scss:4`(`background: $beige-300`) 등 알려진 사용처가 warning으로 잡히는지 stylelint 출력 확인.

## 접근법

`.stylelintrc.json`에 `declaration-property-value-disallowed-list` 룰 1개 추가. 패턴은 색상·테두리·그림자·outline 계열 property 한정, value는 primitive 변수 정규식. **stylelint 룰은 declaration value 전체에 부분 매칭하므로 `linear-gradient($beige-150, $beige-300)` 같은 복합 값 내부도 검출됨**(Codex 1차 검증으로 확인).

```json
"declaration-property-value-disallowed-list": [
  {
    "/^(color|fill|stroke|background(-color|-image)?|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|box-shadow|text-decoration-color)$/": [
      "/\\$gray-\\d+(?![\\w-])/",
      "/\\$navy-\\d+(?![\\w-])/",
      "/\\$navy-blue-/",
      "/\\$gold-\\d+(?![\\w-])/",
      "/\\$beige-\\d+(?![\\w-])/",
      "/\\$cream-\\d+(?![\\w-])/",
      "/\\$black(?![\\w-])/",
      "/\\$white(?![\\w-])/"
    ]
  },
  {
    "severity": "warning",
    "message": "primitive 토큰 직접 사용 금지: semantic 토큰($txt-*, $bg-*, $border-*, $primary, $accent 등)을 사용하세요. 매핑 표는 .claude/skills/styles/SKILL.md 참조. (tech-debt-tracker)"
  }
]
```

**property regex 커버리지**:
- `color`, `fill`, `stroke`, `text-decoration-color`, `box-shadow` — 기본
- `background(-color|-image)?` — `background-image: linear-gradient(...)` 포함 (about/page.module.scss `.gallery_pattern` 사용처 확보)
- `border(-(top|right|bottom|left))?(-color)?` — shorthand 4종 + base + color suffix 모두 (NoticeTable·NoticeDrawer·FeedContent 등 `border-bottom: ... $gray-200` 사용처 확보)
- `outline(-color)?` — `:focus-visible` 외 직접 사용 케이스

**값 regex 경계**: `(?![\w-])` 부정 전방탐색으로 `$gray-100-rgb`처럼 hyphen suffix가 붙은 변수명 false positive 방지.

override에 `src/styles/**` 추가 — 토큰 정의·믹스인·globals 파일이 자체적으로 primitive를 다룰 권한.

## 영향받는 파일

- `.stylelintrc.json` — 새 룰 + override 추가
- `docs/tech-debt-tracker.md` — `🟡 SCSS primitive 직접 사용 (104건)` 새 항목 추가, 또는 기존 hex 항목과 별도

## 단계별 체크리스트

- [x] 1. `.stylelintrc.json`에 `declaration-property-value-disallowed-list` 룰 추가 (Codex 정정 반영 패턴).
- [x] 2. override에 `src/styles/**` 진입 — 룰 면제.
- [x] 3. `yarn lint:styles` 실행 — 197 warnings / 0 errors. 143건이 새 룰로 검출. linear-gradient 안의 `$beige-300` 등 복합 값까지 정상 검출 확인.
- [x] 4. false positive 미검출 — `(?![\\w-])` 부정 전방탐색 정상 작동.
- [x] 5. `tech-debt-tracker.md`에 `🟡 SCSS primitive 토큰 직접 사용 (143건)` 항목 추가.
- [x] 6. `node scripts/verify-task.mjs stylelint-primitive-guardrail` 실행 → ESLint·stylelint·Build 통과, Knip은 기존 부채.

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs stylelint-primitive-guardrail` 통과
- [ ] 사용자 승인 후 커밋
- [ ] ADR 불필요 (사유: lint config 1줄 추가, 정책 격상이 아닌 가시화. 정책 격상은 별도 PR에서 ADR 검토)

## 참고 자료

- `docs/decisions/0003-design-system-v3-token-unification.md` — primitive ↔ semantic 분리 ADR
- `docs/exec-plans/active/2026-05-10-style-tokens-doc-sync.md` — PR 1
- `docs/exec-plans/active/2026-05-10-style-tokens-cleanup.md` — PR 2
- stylelint `declaration-property-value-disallowed-list` 룰: https://stylelint.io/user-guide/rules/declaration-property-value-disallowed-list/

## 의사결정 로그

- 2026-05-10: 적용 범위를 색상·테두리·그림자·outline 계열 property로 한정. spacing primitive(`$spacing-*`)는 _spacing.scss에서 reasonable한 직접 사용처가 있어 본 PR에서는 제외.
- 2026-05-10: severity를 `warning`으로 시작 — 기존 27 파일·104회 부채를 일시 차단하지 않기 위함. 청소 완료 후 별도 PR에서 `error` 격상 검토.
- 2026-05-10: lint-staged 안전성 — `package.json`의 lint-staged는 `stylelint` 명령을 `--fix` 없이 실행. `declaration-property-value-disallowed-list` 룰의 stylelint meta에는 `fixable` 없음(non-fixable). 따라서 본 룰 도입이 lint-staged 자동 수정 동작을 트리거하지 않음 (Codex 1차 검증 항목).

## ADR 판단

- **필요 여부**: 불필요
- **결정 링크**: `docs/decisions/0003-design-system-v3-token-unification.md` (기존 ADR)
- **사유**: ADR 0003이 명시한 primitive ↔ semantic 분리를 lint 가드레일로 운용 가시화. 새 정책·구조·라이브러리 도입 없음. severity 격상 시점에 별도 ADR 검토.

## Codex 계획 검증

- **상태**: 1차 CHANGE_REQUEST → 반영 완료
- **요청 시점**: 2026-05-10
- **결론**: CHANGE_REQUEST → 반영 후 진행
- **핵심 지적**:
  1. **`border-{top,right,bottom,left}` shorthand 누락**: 실제 NoticeTable/NoticeDrawer/FeedContent 등에 `border-bottom: ... $gray-200` 형태 사용처 확인됨. property regex 확장 필요.
  2. **`background-image` 누락**: `about/page.module.scss .gallery_pattern`이 `background-image: linear-gradient(..., $beige-150)` 사용. property regex에 포함 필요.
  3. **값 regex 경계 약함**: `/\$gray-\d/`는 `$gray-100-rgb` 같은 hyphen suffix까지 false positive 가능. 부정 전방탐색 `(?![\w-])` 추가 필요.
  4. **`caret-color`/`text-emphasis-color`/`column-rule-color`/`text-shadow`/mask 계열**은 현재 코드에 primitive 사용 증거 없음. Non-goal로 명시 필요.
  5. **lint-staged 안전성 근거 명시**: `declaration-property-value-disallowed-list`는 non-fixable + lint-staged no `--fix` 조합으로 자동 수정 트리거 없음. 의사결정 로그에 한 줄 추가.
  6. **stylelint 메커닉 확인**: 룰이 declaration value 전체에 부분 매칭하므로 `linear-gradient(...)` 같은 복합 값 내부도 검출됨 (검증 완료).
- **반영 내용**:
  - property regex를 `^(color|fill|stroke|background(-color|-image)?|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|box-shadow|text-decoration-color)$`로 확장.
  - 값 regex에 `(?![\w-])` 부정 전방탐색 추가 (8개 패턴 모두).
  - Non-goals에 미커버 property 5종(caret-color/text-emphasis-color/column-rule-color/text-shadow/mask) 명시.
  - 의사결정 로그에 lint-staged 안전성 근거 한 줄 추가.
  - 접근법 본문에 property 커버리지·값 경계·stylelint 메커닉 설명 추가.

## Codex 1차 검증

- **상태**: 생략
- **요청 시점**: —
- **결론**: 생략 (사유: diff 총 2 파일·35줄 — `.stylelintrc.json` 룰 1개 + override 1개, `tech-debt-tracker.md` 항목 1개. 코드 변경 0줄. CLAUDE.md 트리거(큰 diff·고위험 파일·레이어 변경·검증 실패) 모두 해당 없음. 계획 검증에서 이미 룰 메커닉·패턴·override 범위 확정)
- **수정 파일**: —
- **핵심 지적**: —
- **남은 리스크**: 새 룰 도입으로 lint:styles warnings 총수가 49→197로 증가. severity warning이라 빌드·커밋 차단 없음. 후속 청소 PR이 영역별로 진행되며 점진 감소.

## Claude 2차 검증

- **검토 내용**:
  - `.stylelintrc.json` 변경: 룰 1개 + override 1개. 인접 정리·포맷 변경 없음(외과적). 기존 룰(`color-no-hex`·`selector-class-pattern`·`scss/dollar-variable-pattern`)과 동일한 warning 정책.
  - 룰 동작 확인: `linear-gradient(135deg, $beige-150, $beige-300)` 같은 복합 값에서 두 primitive 모두 검출(SermonCard 47:17, GridCard 46:17, SermonVideoPlayer 43:15). border shorthand(`border-bottom: ... $gray-200`) 검출(NoticeTable·NoticeDrawer 등).
  - override 확인: `src/styles/_mixins.scss`의 `rgba($gray-900, 0.06)` 같은 토큰 합성은 warning 미발생(정상). `_color.scss`도 면제 정상.
  - tech-debt-tracker 항목: 형식(상태/무엇/왜/마이그레이션 경로/영향 범위/확인/발견일) 일관. 마이그레이션 경로에 영역별 분리 PR + severity error 격상 시점 명시.
- **실행한 검증**:
  - `yarn lint:styles` → 197 warnings / 0 errors. 새 룰 검출 143건.
  - `node scripts/verify-task.mjs stylelint-primitive-guardrail` → ESLint ✓, stylelint ✓, Build ✓. Knip 경고는 기존 부채.
- **최종 판단**: 사용자 승인 후 커밋 진행 가능. 본 PR 커밋 staging은 3개 파일(`.stylelintrc.json`, `docs/tech-debt-tracker.md`, exec-plan).

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
