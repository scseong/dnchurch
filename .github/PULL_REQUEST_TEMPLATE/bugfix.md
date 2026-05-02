<!-- 🐛 Bugfix 템플릿 — 버그 수정. ?template=bugfix.md 로 선택 -->
<!-- PR 제목 형식: [Fix] 명사형으로 작성 -->

## 📋 개요 (Summary)

<!-- 수정한 버그를 한 줄로 요약해 주세요. -->

---

## 🔗 개발 컨텍스트

- **Task ID**: `slug` / N/A
- **Exec Plan**: `docs/exec-plans/active/YYYY-MM-DD-slug.md` / N/A
- **관련 ADR**: `docs/decisions/NNNN-slug.md` / 해당 없음
- **관련 tech debt**: [docs/tech-debt-tracker.md](docs/tech-debt-tracker.md) / 해당 없음
- **작업 범위**: <!-- 수정 범위 -->
- **제외한 범위**: <!-- 의도적으로 뺀 것 -->

---

## 🐛 버그 리포트 (Bug Report)

<!-- 버그의 재현 조건과 원인을 기록해 주세요.
     나중에 유사한 버그를 만났을 때 빠르게 원인을 파악할 수 있는 근거가 됩니다. -->

**재현 조건:**

- 환경:
- 재현 절차:
  1.
  2.
  3.
- 기대 동작:
- 실제 동작:

**근본 원인 (Root Cause):**

-

**관련 이슈:**

- Issue: #

---

## 🔧 수정 내용 (Fix Details)

<!-- 어떻게 수정했는지 기술적으로 요약해 주세요. -->

-
-
-

---

## ⚠️ 영향 범위 (Impact)

<!-- 이 수정이 영향을 미치는 범위를 명확히 파악해 두세요.
     사이드 이펙트 발생 시 빠른 롤백 판단을 위한 중요한 섹션입니다. -->

**변경된 동작:**

-

**영향받는 컴포넌트·모듈:**

-

**사이드 이펙트 가능성:**

> <!-- 없으면 "없음"으로 기재 -->

---

## 🏗️ 의사 결정 기록 (Design Decisions)

<!-- 수정 방식에 비자명한 선택이 있었다면 기록해 주세요. 해당 없으면 삭제하세요. -->

| 결정 항목 | 선택 | 선택 이유 | 제외한 대안 / 버린 이유 |
| --------- | ---- | --------- | ----------------------- |
|           |      |           |                         |

---

## ✅ 하네스 검증 (Harness Verification)

| 항목 | 결과 |
| ---- | ---- |
| N/A 사용 여부 | 없음 / 있음: <사유> |
| `verify-task` | `node scripts/verify-task.mjs <task-id>` — PASS / FAIL, RUN_ID=`...`, HEAD=`<sha>`, failed=0, warned=Knip |
| `harness-gate` | `node scripts/harness-gate.mjs <task-id>` — PASS / N/A |
| Codex 계획 검증 | PASS / CHANGE_REQUEST(반영 링크) / BLOCK(머지 불가) / N/A |
| Codex 1차 검증 | PASS / FIX_APPLIED / N/A |
| Claude 2차 검증 | 완료 / N/A |
| ADR 판단 | 불필요 / `docs/decisions/NNNN-slug.md` |
| 남은 warning | 기존 부채 (ESLint N건 / Knip) / 없음 |

**수동 확인:**

| Before (버그 상태) | After (수정 후) |
| ------------------ | --------------- |
|                    |                 |

---

## 🗂️ 셀프 체크리스트 (Self-Review Checklist)

**버그 수정 완성도**

- [ ] 근본 원인(Root Cause) 해결 여부 (증상만 억제한 것은 아닌지 확인)
- [ ] 동일 패턴의 잠재적 버그 추가 점검 여부
- [ ] 수정 범위가 버그와 무관한 코드를 포함하지 않는지 확인

**코드 품질**

- [ ] 불필요한 코드·디버그 로그 제거 여부

---

## 👀 PM / 리뷰어 확인 포인트

- **사용자에게 달라지는 점**: <!-- 어떤 오류가 사라지는가 -->
- **운영 / 릴리스 주의사항**: <!-- 배포 후 모니터링 포인트 등 -->
- **롤백 시 영향**: <!-- 없으면 "없음" -->
- **먼저 볼 화면 / 흐름**: <!-- 버그 재현 화면 또는 수정 후 스크린샷 -->

---

## 📝 리뷰어를 위한 메모 (Notes for Future Me)

<!-- 같은 버그가 다시 발생했을 때를 위한 힌트, 수정 시 놓친 부분 등 -->
