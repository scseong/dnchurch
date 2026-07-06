# 0009 — commit msg hook enforcement

- **Status**: Accepted
- **Date**: 2026-05-13
- **Deciders**: scseong
- **Tags**: infra, harness, git-hooks
- **개정**: 2026-06-29 — R5(커밋 메시지 이메일 주소 금지) 추가

## Context

`.claude/skills/harness-workflow/SKILL.md` "## 커밋 메시지" 섹션은 commit subject·body 규칙을 정의해 왔지만 강제 메커니즘은 PR 리뷰뿐이었다. 2026-05-11 release v0.5.0 QA round에서 다수 commit이 추상 subject + WHAT만 나열로 의도 불명이었고, 2026-05-13 sermons Phase 0 commit 작성 중 "Hero 메타 2 키" 약어와 subject `+` 4회 나열이 발생해 사용자가 "강제" 적용을 지시했다.

강제하지 않을 때 발생 비용: (a) grep/blame 추적성 저하 — subject만 보고 PR 의도 파악 불가, (b) 신규 contributor onboarding 시 commit 컨벤션 학습 부담 매번 반복, (c) 추후 release note 자동 생성 시 commit prefix 기반 분류 정확도 저하.

## Decision

husky `commit-msg` hook을 도입해 deterministic 룰을 강제한다 (R1~R4는 2026-05-13, R5는 2026-06-29 추가).

- (R1) subject 정규식 `^(Feat|Fix|Style|Refactor|Docs|Chore): [^ ].+$` 위반 차단
- (R2) subject 길이 81자 이상 차단 (`.trimEnd()` 후)
- (R3) `Co-Authored-By:` trailer 누락 차단 (case-insensitive)
- (R4) subject에 `+` 2회 이상 출현 시 차단 (다중 concern 분리 신호 강제)
- (R5) 커밋 메시지에 이메일 주소(`x@y.z`) 출현 시 차단 — Co-Authored-By trailer도 이름만 적고 이메일은 뺀다 (사용자 지시, Co-Authored-By에 사용자 이메일이 들어가던 것을 막음)

위반 시 commit 차단(exit 1). `--no-verify`로 사용자 명시 우회 허용. merge/revert/fixup!/squash! 자동 우회.

구현: `scripts/check-commit-msg.mjs`(Node.js ESM, dependency 0) + `.husky/commit-msg`(1줄 호출). 룰 SSOT는 SKILL.md, hook은 그 SSOT를 자동 검증.

## Consequences

### 긍정적
- commit subject prefix·길이·footer·다중 concern·이메일 5 룰이 모든 commit에 자동 적용
- PR 리뷰어가 5 룰 수동 검증 부담 해소
- 신규 contributor도 컨벤션 위반 시 즉시 피드백
- release note·changelog 자동 생성 시 prefix 분류 신뢰

### 부정적 / 트레이드오프
- WIP·실험 commit도 footer 강제 → 사용자 메모리 `feedback_commit_approval`과 별개로 `--no-verify`로 우회 허용 결정
- R4 `+` 검사는 SSOT(SKILL.md:196) 일치. `+`·`/`·`,` 확장은 URL 경로 오탐 위험으로 제외(Codex 1차 검증 FLAG D)
- husky hook은 local only — CI에서 별도 검증 없으면 우회된 commit이 develop·main에 머지 가능. GitHub Actions 보완은 별도 task

### 영향 범위
- 코드: `scripts/check-commit-msg.mjs` 신규, `.husky/commit-msg` 신규
- 정책: develop의 `SKILL.md:196`이 이미 `+`만 명시(원본). 별도 브랜치(feat/sermons)의 SKILL 강화 commit(`eeb3625`)이 `+`·`/`·`,`로 확장했으나 develop 미머지 — 그 PR 머지 전 사용자가 `+`만으로 정정 필요(follow-up commit). 본 task는 develop 기준 SSOT와 일치.
- 운영: 모든 contributor의 다음 commit부터 5 룰(R1~R5) 강제. `--no-verify` 사용 시 PR 리뷰에서 수동 확인

## Alternatives Considered

### A안: GitHub Actions로만 검증
- 사유로 기각: PR 단위 피드백이라 commit 작성자가 즉시 인지 X. local hook이 더 빠른 feedback loop.

### B안: heuristic strict mode(WHY/IMPACT·외부 가독성·추상명사 회피)
- 사유로 기각: heuristic 검증은 false positive 위험 큼. PR 리뷰 영역으로 분리.

### C안: hook 도입 없이 SKILL 룰만 강화
- 사유로 기각: 사용자 "강제 적용" 지시. SKILL만으로는 자동 검증 메커니즘 부재.

### D안: commitlint + @commitlint/config-conventional 패키지 도입
- 사유로 기각: dependency 추가. dnchurch는 6개 prefix가 conventional commit과 다름(Style 대문자, Chore 등). 별도 config 필요. dependency 0의 자체 스크립트가 단순.

## References

- 관련 PR: (본 task PR — 작성 예정)
- 관련 exec-plan: `docs/exec-plans/active/2026-05-13-commit-msg-hook.md`
- 관련 commit: `eeb3625` (SKILL.md commit message 룰 2종 강화)
- SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 커밋 메시지"
