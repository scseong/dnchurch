<!-- 🔧 Maintenance 템플릿 — 인프라·스크립트·문서·설정 변경. ?template=maintenance.md 로 선택 -->
<!-- PR 제목 형식: [Chore] / [Docs] / [Style] 명사형으로 작성 -->

## 📋 개요 (Summary)

<!-- 목적을 한 문장으로, 범위는 bullet 2~3개. 한 문장에 여러 주제를 묶지 마세요. -->

**목적**:

**범위**:

-

---

## 🔗 개발 컨텍스트

- **Task ID**: `<slug>` / N/A
- **Exec Plan**: `docs/exec-plans/active/<YYYY-MM-DD>-<slug>.md` / N/A
- **관련 ADR**: `docs/decisions/<ADR-file.md>` / 해당 없음
- **관련 tech debt**: `docs/tech-debt/active.md#<섹션>` / 해당 없음
- **작업 범위**: <!-- 포함한 것 -->
- **제외한 범위**: <!-- 의도적으로 뺀 것 -->

---

## 💡 변경 배경 (Motivation)

<!-- 왜 이 변경이 필요했나요? -->

**해결하려는 문제 / 목적:**

**관련 이슈:**

- Issue: #

---

## 🔧 주요 변경점 (Key Changes)

<!-- bullet 하나에 변경 하나만 적으세요. 파일 묶음은 대표 경로를 최소 1개 적습니다. phase 번호나 D-라벨 같은 내부 약어는 처음 나올 때 풀어 쓰세요. -->

-
-
-

---

## 🏗️ 의사 결정 기록 (Design Decisions)

<!-- 비자명한 선택이 있었다면 기록해 주세요. 해당 없으면 삭제하세요. -->

| 결정 항목 | 선택 | 선택 이유 | 제외한 대안 / 버린 이유 |
| --------- | ---- | --------- | ----------------------- |
|           |      |           |                         |

---

## ✅ 하네스 검증 (Harness Verification)

<!-- task-id가 여러 개면 task-id별로 행을 나누세요. 한 셀에는 판정 하나만 적습니다. "PASS / CHANGE_REQUEST"처럼 나열하지 마세요. 결과는 머지 시점 실측만 적고 "예정" 같은 미래 표현을 쓰지 마세요. -->

| 항목 | 결과 |
| ---- | ---- |
| N/A 사용 여부 | 없음 / 있음: <사유> |
| `verify-task` | `node scripts/verify-task.mjs <task-id>` — PASS / FAIL, RUN_ID=`...`, HEAD=`<sha>`, failed=0, warned=Knip |
| `harness-gate` | `node scripts/harness-gate.mjs <task-id>` — PASS / N/A |
| Codex 계획 검증 | PASS / CHANGE_REQUEST(반영 링크) / BLOCK(머지 불가) / N/A |
| Codex 1차 검증 | PASS / FIX_APPLIED / N/A |
| Claude 2차 검증 | 완료 / N/A |
| ADR 판단 | 불필요 / `docs/decisions/…` |
| 남은 warning | 기존 부채 (ESLint N건 / Knip) / 없음 |

---

## 👀 PM / 리뷰어 확인 포인트

- **사용자에게 달라지는 점**: <!-- 내부 변경이면 "없음" -->
- **운영 리스크**: <!-- 배포 순서·환경변수·스크립트 실행 필요 여부 등. 없으면 "없음" -->
- **QA 후속**: <!-- 머지 후 확인할 것. 없으면 "없음" -->
- **롤백 시 영향**: <!-- 없으면 "없음" -->
- **먼저 볼 화면 / 흐름**: <!-- 해당 없으면 삭제 -->

---

## 📝 리뷰어를 위한 메모 (Notes for Future Me)

<!-- 이 변경의 배경, 다음에 건드릴 때 주의할 점 등 -->
