# harness-hooks-orchestration (Phase 1: 글 변경만)

- **상태**: ✅ 완료 대기 (검증 통과, 커밋 승인 대기)
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering (Step 1~3는 본 브랜치에 통합 커밋됨)
- **범위**: Step 1~3 + SSOT 동기화 (Hooks 도입은 별도 EXEC_PLAN으로 분리)
- **선행 의존성**: 없음. `verify-task.mjs`는 현재 ESLint/stylelint/build 통과 + Knip 경고 기록 방식으로 하네스 검증을 통과한다.

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

- [x] 1. **언어 프로토콜 명시** — `CLAUDE.md:120` 존재 확인 (dogfood 작업 중 적용)
- [x] 2. **docs/research/ 신설** — `docs/research/README.md` + `.gitkeep` 존재 확인
- [x] 3. **exec-plan 템플릿의 "리뷰" 섹션 명확화** — `_template.md:77-78` 멀티 세션 리뷰 반영 확인
- [x] 4. **docs/README.md SSOT 동기화** — `docs/README.md:16` research/ 행 확인
- [x] 5. **CLAUDE.md SSOT 표 동기화** — `CLAUDE.md:146` research/ 행 확인
- [x] 6. **`node scripts/verify-task.mjs harness-hooks-orchestration` 통과 확인** — RUN_ID: 20260501-213603, ESLint/stylelint/build PASS, Knip 경고(기존 부채)

## 후속 EXEC_PLAN (분리)

- `harness-claude-hooks` — Hooks 2개(`agent-router`, `check-before-write`) 도입. Claude Code 공식 hook 형식 검증 → 셸 스크립트 작성 → settings 등록 → 시연. **별도 EXEC_PLAN으로 진행 예정**.

## 완료 기준 (DoD)

- [x] `node scripts/verify-task.mjs harness-hooks-orchestration` 통과 (lint + lint:styles + build + knip)
- [N/A] hooks가 실제 동작 — 범위 축소로 Hooks 도입은 별도 EXEC_PLAN(`harness-claude-hooks`)으로 분리
- [N/A] CLAUDE.md 라인 수 ~120줄 이내 — 현재 163줄. 실사용 후 압축 여부 결정하기로 사용자와 합의
- [x] tech-debt-tracker 갱신 — 해결된 부채 없음, 발견된 신규 부채 없음
- [ ] 사용자 승인 후 커밋
- [ ] 머지 후 `node scripts/complete-task.mjs harness-hooks-orchestration` 실행 + 회고 작성

## ADR 판단

- **필요 여부**: 불필요
- **사유**: 글(문서·템플릿) 변경만 포함. 구조·라이브러리·레이어 경계·검증 정책 변경 없음.

## Codex 계획 검증

- **상태**: 소급 확인
- **결론**: PASS
- **핵심 지적**: 본 EXEC_PLAN의 5개 항목(언어 프로토콜·research/·템플릿·SSOT)은 harness-engineering-dogfood 작업 중 Codex 계획 검증을 거쳐 적용됨. 별도 검증 불필요.
- **반영 내용**: 해당 없음 (이미 적용 완료)

## Codex 1차 검증

- **상태**: 해당 없음
- **결론**: N/A — 글(문서·체크박스) 변경만이므로 코드 버그·타입 오류·레이어 위반 없음.

## Claude 2차 검증

- **검토 내용**: step 1–6 각 항목을 실제 파일 경로와 대조하여 완료 확인. verify-task RUN_ID 20260501-213603 통과.
- **실행한 검증**: `node scripts/verify-task.mjs harness-hooks-orchestration` — ESLint/stylelint/build PASS, Knip 경고(기존 부채, tech-debt-tracker 등록 항목)
- **최종 판단**: 모든 단계 완료. 커밋 승인 대기 상태.

## 의사결정 로그

- 2026-05-01: Gemini CLI 통합 보류 — 우리 프로젝트 규모(중간 Next.js)에 과함, WebFetch + skills/references로 충분
- 2026-05-01: `/checkpointing` 스킬 보류 — 작업 패턴 자동 추출은 직접 작성 비용 큼, 수동 회고(exec-plan completed/)로 대체
- 2026-05-01: 6개 Hook → 2개로 압축 — `agent-router`(키워드 라우팅) + `check-before-write`(다파일 변경 감지)만 채택. 나머지 4개(after-plan, gemini-research, post-implementation, post-test)는 ROI 검증 후 추가
- 2026-05-01: **범위 축소** — Hooks 도입(원래 Step 4~9)을 별도 EXEC_PLAN으로 분리. 사유: 사용자 입력 stream에 끼어드는 동작이라 한 번에 다 도입 시 잘못 동작하면 전체 워크플로우가 거슬리게 됨. 글 변경(1·2·3)으로 정수를 먼저 흡수해 즉시 효과를 보고, Hooks는 별개 사이클에서 신중하게.
- 2026-05-01: **재개 가능으로 변경**. `verify-task.mjs`는 현재 ESLint/stylelint/build 통과와 Knip 경고 기록을 분리해 하네스 검증을 통과한다. phase1.5는 별도 품질 개선 작업으로 유지한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] (선택) 멀티 세션 리뷰: 별도 Claude 세션 또는 `codex:rescue`로 객관적 검토 (구현 바이어스 제거)
