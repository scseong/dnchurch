# harness-hooks-orchestration (Phase 1: 글 변경만)

- **상태**: ⏸️ 일시 보류 (verify-task-rework 또는 phase1-5 완료 대기)
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering (Step 1~3는 본 브랜치에 통합 커밋됨)
- **범위**: Step 1~3 + SSOT 동기화 (Hooks 도입은 별도 EXEC_PLAN으로 분리)
- **선행 의존성**: `yarn verify` 통과가 DoD 항목 — phase1.5(set-state-in-effect 10건) 또는 verify-task-rework 중 하나가 완료되면 재개 가능

## 목표

비욘드제로 글(MDRULES.dev)의 핵심 패턴 중 **무위험·고가치 항목(글 변경만)**을 흡수한다.
- 언어 프로토콜 (Codex 영어, 사용자 한국어)
- docs/research/ 신설
- exec-plan에 멀티 세션 리뷰 섹션

Hooks 도입은 "사용자 입력 stream에 끼어드는 동작"이라 신중한 검증이 필요해 별도 EXEC_PLAN으로 분리.

## 접근법

원문의 6개 Python Hook은 별도 EXEC_PLAN. 본 EXEC_PLAN은 **글로만 정수를 흡수**해 즉시 효과를 본다. Gemini·`/checkpointing`은 ROI 낮아 보류.

## 영향받는 파일

- `CLAUDE.md` — 언어 프로토콜 + 멀티 세션 리뷰 권장
- `docs/research/README.md` — 신규 디렉토리
- `docs/research/.gitkeep`
- `docs/README.md` — research/ 항목 추가 + SSOT 표 동기화
- `docs/exec-plans/_template.md` — 리뷰 섹션은 이미 있음, 멀티 세션 리뷰 항목 명시 강화

## 단계별 체크리스트

- [ ] 1. **언어 프로토콜 명시** — CLAUDE.md에 "Codex 호출 시 영어 질의·응답, 사용자에게는 한국어로 보고" 한 줄 추가
- [ ] 2. **docs/research/ 신설** — README.md 작성, references/와 역할 분리(references=라이브러리 스냅샷, research=task-specific 외부 자료)
- [ ] 3. **exec-plan 템플릿의 "리뷰" 섹션 명확화** — 멀티 세션 리뷰 패턴 반영 (자기 세션 외부의 시선)
- [ ] 4. **docs/README.md SSOT 동기화** — research/ 행 추가
- [ ] 5. **CLAUDE.md SSOT 표 동기화** — research/ 행 추가
- [ ] 6. **`yarn verify` 통과 확인**

## 후속 EXEC_PLAN (분리)

- `harness-claude-hooks` — Hooks 2개(`agent-router`, `check-before-write`) 도입. Claude Code 공식 hook 형식 검증 → 셸 스크립트 작성 → settings 등록 → 시연. **별도 EXEC_PLAN으로 진행 예정**.

## 완료 기준 (DoD)

- [ ] `yarn verify` 통과 (lint + lint:styles + build + knip)
- [ ] hooks가 실제 동작 (시연: 의도적 키워드 입력 → 안내 메시지 출력)
- [ ] CLAUDE.md 라인 수 ~120줄 이내 유지 (백과사전화 방지)
- [ ] tech-debt-tracker 갱신 (해결된 부채 없음 / 발견된 부채 추가)
- [ ] 사용자 승인 후 커밋
- [ ] 머지 후 `bash scripts/complete-task.sh harness-hooks-orchestration` 실행 + 회고 작성

## 의사결정 로그

- 2026-05-01: Gemini CLI 통합 보류 — 우리 프로젝트 규모(중간 Next.js)에 과함, WebFetch + skills/references로 충분
- 2026-05-01: `/checkpointing` 스킬 보류 — 작업 패턴 자동 추출은 직접 작성 비용 큼, 수동 회고(exec-plan completed/)로 대체
- 2026-05-01: 6개 Hook → 2개로 압축 — `agent-router`(키워드 라우팅) + `check-before-write`(다파일 변경 감지)만 채택. 나머지 4개(after-plan, gemini-research, post-implementation, post-test)는 ROI 검증 후 추가
- 2026-05-01: **범위 축소** — Hooks 도입(원래 Step 4~9)을 별도 EXEC_PLAN으로 분리. 사유: 사용자 입력 stream에 끼어드는 동작이라 한 번에 다 도입 시 잘못 동작하면 전체 워크플로우가 거슬리게 됨. 글 변경(1·2·3)으로 정수를 먼저 흡수해 즉시 효과를 보고, Hooks는 별개 사이클에서 신중하게.
- 2026-05-01: **일시 보류 — `yarn verify`가 사전 부채에 막힘**. 본 EXEC_PLAN의 변경은 모두 `.md`(코드 무관)이지만 `verify-task.sh`는 전체 ESLint/Knip을 검사함. 부채 청산 후 재개. 새 EXEC_PLAN: `tech-debt-cleanup-phase1` (ESLint errors 23 + Knip 14).

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] (선택) 멀티 세션 리뷰: 별도 Claude 세션 또는 `codex:rescue`로 객관적 검토 (구현 바이어스 제거)
