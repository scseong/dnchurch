# verify-evidence-enforcement

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering

## 목표

검증을 COMMIT 단계에서 분리해 독립 VERIFY 단계로 승격한다.
`verify-task.sh`가 커밋·머지 전 필수 검증을 수행하고, 모든 결과를 `logs/<task-id>/`에 증적 파일로 남기도록 한다.

## 접근법

`verify-task.sh`는 검증 실행과 증적 기록을 담당한다. `enforce-verification.mjs`는 pre-commit에서 현재 diff와 일치하는 통과 검증 기록이 있는지 확인한다.
초기 운영은 경고 모드이며, `VERIFY_ENFORCE=1`일 때만 차단한다.

## 영향받는 파일

- `CLAUDE.md`
- `.gitignore`
- `.husky/pre-commit`
- `scripts/verify-task.sh`
- `scripts/enforce-verification.mjs`
- `scripts/README.md`
- `docs/exec-plans/active/2026-05-01-verify-evidence-enforcement.md`

## 단계별 체크리스트

- [x] 1. `CLAUDE.md` 워크플로우를 EXPLORE → PLAN → WORK → VERIFY → COMMIT으로 분리
- [x] 2. `verify-task.sh`에 `TASK_ID`와 `logs/<task-id>/<run-id>/` 증적 기록 추가
- [x] 3. 단계별 로그, patch, manifest, latest 기록 추가
- [x] 4. `enforce-verification.mjs` 추가
- [x] 5. pre-commit에서 검증 기록 확인 연결
- [x] 6. `logs/` git ignore 추가
- [x] 7. 스크립트 문법 검증

## 완료 기준 (DoD)

- [x] `bash -n scripts/verify-task.sh scripts/complete-task.sh scripts/start-task.sh` 통과
- [x] `node --check` for `scripts/*.mjs` and `.claude/hooks/*.mjs` 통과
- [ ] 실제 `TASK_ID=<slug> bash scripts/verify-task.sh` 실행은 기존 lint/build 부채 정리 후 수행
- [ ] 사용자 승인 후 커밋

## 참고 자료

- `docs/tech-debt-tracker.md` — 현재 `yarn verify`가 기존 부채에 막힐 수 있음
- `scripts/README.md`

## 의사결정 로그

- 2026-05-01: `yarn verify` 지시 대신 `verify-task.sh`를 검증 하네스로 사용한다.
- 2026-05-01: 검증 결과는 `logs/<task-id>/`에 남기되 git에는 커밋하지 않는다.
- 2026-05-01: pre-commit 강제는 즉시 hard block하지 않고 경고 모드로 시작한다. `VERIFY_ENFORCE=1`로 차단 모드 전환 가능.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 검증 증적이 현재 diff와 연결되는가?
- [ ] 멀티 세션 리뷰: 기존 verify 부채 정리 후 실제 검증 루프 dogfooding

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: VERIFY를 COMMIT에서 분리해 독립 단계로 승격. logs/<task-id>/<run-id>/ 증적으로 어떤 상태에서 커밋됐는지 추적 가능해짐. enforce-verification.mjs가 경고/차단 모드 전환을 지원해 점진적 도입 가능.
- 다음에 할 것: 기존 ESLint/build 부채 정리 후 VERIFY_ENFORCE=1로 전환해 강제 검증 활성화.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): 해당 없음 (기존 부채는 이미 tech-debt-tracker.md에 기록됨)
