<!-- Release 템플릿 - develop -> main 병합 PR. ?template=release.md 로 선택 -->
<!-- PR 제목 형식: [Chore] develop -> main 릴리스 YYYY-MM-DD -->

## 릴리스 요약 (Release Summary)

- **Base**: `main`
- **Compare**: `develop`
- **릴리스 목적**:
- **사용자에게 달라지는 점**:
- **이번 릴리스에서 제외한 것**:

---

## 개발 컨텍스트

- **Release Task ID**: `slug`
- **Release Exec Plan**: `docs/exec-plans/active/YYYY-MM-DD-slug.md`
- **포함된 Exec Plan**:
  - `docs/exec-plans/completed/YYYY-MM-DD-slug.md`
- **관련 ADR**:
  - `docs/decisions/NNNN-slug.md` / 해당 없음
- **관련 tech debt**:
  - [docs/tech-debt-tracker.md](docs/tech-debt-tracker.md) / 해당 없음
- **Known Issues / 남은 리스크**:
  - 없음 / ...

---

## 포함된 변경 묶음

| 영역 | 변경 요약 | 관련 PR / Plan / ADR |
| ---- | --------- | -------------------- |
| 기능 | | |
| 버그 수정 | | |
| 리팩토링 | | |
| 문서 / 하네스 / 설정 | | |

---

## 의사 결정 기록

| 결정 항목 | 선택 | 선택 이유 | 제외한 대안 / 트레이드오프 |
| --------- | ---- | --------- | -------------------------- |
| 릴리스 범위 | | | |
| 배포 순서 | | | |
| 제외 항목 | | | |

---

## 릴리스 검증

| 항목 | 결과 |
| ---- | ---- |
| N/A 사용 여부 | 없음 / 있음: `<사유>` |
| `verify-task` | `node scripts/verify-task.mjs <task-id>` - PASS / FAIL, RUN_ID=`...`, HEAD=`...`, failed=0, warned=... |
| `harness-gate` | `node scripts/harness-gate.mjs <task-id>` - PASS / FAIL |
| `build` | PASS / FAIL |
| `lint` | PASS / FAIL |
| `lint:styles` | PASS / FAIL |
| `knip` | clean / warning-only |
| Codex 계획 검증 | PASS / CHANGE_REQUEST 반영 완료 / BLOCK이면 머지 불가 |
| Codex 1차 검증 | PASS / FIX_APPLIED / N/A |
| Claude 2차 검증 | 완료 / N/A |

---

## 배포 / 운영 체크

- **환경변수 변경**: 없음 / 있음:
- **DB migration**: 없음 / 있음:
- **Supabase type 재생성**: N/A / 완료:
- **Cloudinary / 외부 서비스 변경**: 없음 / 있음:
- **배포 순서**:
  1.
  2.
  3.
- **배포 후 확인할 화면 / 흐름**:
  -
- **모니터링 포인트**:
  -

---

## 롤백 계획

- **롤백 가능 여부**: 가능 / 제한 있음 / 불가
- **롤백 방법**:
- **데이터 영향**:
- **롤백 후 확인할 항목**:

---

## PM / 리뷰어 승인 포인트

- **먼저 확인할 사용자 흐름**:
- **스크린샷 / 영상**:
- **릴리스 승인 기준**:
- **승인 전 남은 질문**:

---

## 머지 전 체크리스트

- [ ] `develop`이 최신 상태다.
- [ ] `main`과 충돌이 없다.
- [ ] 포함된 주요 작업의 exec-plan 기록이 완료됐다.
- [ ] 필요한 ADR / tech-debt 기록이 반영됐다.
- [ ] 릴리스 검증이 PASS다.
- [ ] 운영 / 롤백 계획이 작성됐다.
- [ ] PM / 리뷰어 확인 포인트가 비어 있지 않다.

---

## 릴리스 메모

<!-- 다음 릴리스에서 주의할 점, 남은 부채, 운영 중 확인해야 할 이슈 -->
