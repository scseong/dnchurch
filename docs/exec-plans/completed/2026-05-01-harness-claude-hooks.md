# harness-claude-hooks

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering

## 목표

Claude Code가 사용자 입력, 계획 작성, 고위험 편집, 검증 실패 시점을 감지해 Codex 상담 타이밍을 자동 제안하도록 한다.
초기 버전은 Codex를 직접 실행하지 않고, Claude에게 `codex:rescue` 호출 검토 컨텍스트를 제공한다.

## 접근법

레퍼런스의 6 Hook 구조 중 현재 목표에 직접 필요한 4개를 먼저 도입한다.
`check-codex-after-plan.mjs`를 핵심 루프로 두어 "Claude가 계획 작성 → Codex가 계획 리뷰 → Claude가 구현" 흐름을 만든다.

## 영향받는 파일

- `.claude/settings.json`
- `.claude/hooks/README.md`
- `.claude/hooks/agent-router.mjs`
- `.claude/hooks/check-codex-before-write.mjs`
- `.claude/hooks/check-codex-after-plan.mjs`
- `.claude/hooks/post-implementation-review.mjs`
- `.claude/hooks/check-adr-needed.mjs`
- `.claude/hooks/post-test-analysis.mjs`
- `docs/exec-plans/active/2026-05-01-harness-claude-hooks.md`

## 단계별 체크리스트

- [x] 1. 공유 가능한 `.claude/settings.json`에 Hook 이벤트 연결
- [x] 2. 사용자 입력 라우터 `agent-router.mjs` 추가
- [x] 3. 계획 작성 후 Codex 리뷰 제안 `check-codex-after-plan.mjs` 추가
- [x] 4. 고위험 편집 전 확인 `check-codex-before-write.mjs` 추가
- [x] 5. 구현 후 큰 diff 리뷰 제안 `post-implementation-review.mjs` 추가
- [x] 6. 검증 실패 분석 제안 `post-test-analysis.mjs` 추가
- [x] 7. Node Hook 문법 검증
- [x] 8. Hook 설정 JSON 검증
- [x] 9. 구조·라이브러리·정책 변경 후 ADR 제안 `check-adr-needed.mjs` 추가

## 완료 기준 (DoD)

- [x] Node hook scripts 문법 검증 통과
- [x] `.claude/settings.json` JSON 파싱 통과
- [ ] 사용자 승인 후 커밋

## 참고 자료

- Claude Code Hooks reference: https://code.claude.com/docs/en/hooks
- `docs/decisions/0001-codex-orchestration-strategy.md`

## 의사결정 로그

- 2026-05-01: 초기 Hook은 자동 실행이 아니라 자동 제안으로 제한한다.
- 2026-05-01: `check-codex-after-plan.mjs`는 핵심 Hook으로 1차 도입에 포함한다. Codex가 계획/설계 리뷰에 강점이 있다는 운영 가정을 반영.
- 2026-05-01: `suggest-gemini-research`는 보류한다. 현재 목표는 Claude Code + Codex 협업 루프 구축이다.
- 2026-05-01: 로컬 Python 런타임이 없어 Hook 구현은 Node.js `.mjs`로 전환한다. Python 레퍼런스와 역할은 동일하다.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: Hook이 과도하게 끼어들지 않고, Codex 호출 타이밍만 선명하게 제안하는가?
- [ ] 멀티 세션 리뷰: 실제 Codex 호출 루프는 후속 작업에서 검증한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: 6개 Hook으로 Codex 위임 타이밍(PLAN 후, WRITE 전, 구현 후)을 자동 제안하는 루프 구축. 초기 버전은 자동 실행이 아닌 자동 제안으로 제한해 과개입 방지.
- 다음에 할 것: 운영 중 Hook 발화 빈도 모니터링. false positive가 많은 Hook 트리밍(특히 post-implementation-review, check-codex-after-plan).
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): post-implementation-review가 working-tree 전체 diff 기준이라 exec-plan 회고 작성 같은 비구현 편집에도 발화함. 트리거 조건 정밀화 필요.
