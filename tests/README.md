# tests/

dnchurch는 단위 테스트 / e2e 테스트 환경을 두지 않는다 (`CLAUDE.md` "테스트 환경 없음" 정책 명시).

본 디렉토리는 **harness 자체 검증용 fixture**만 보관한다. 테스트 러너(`vitest`, `jest`, `playwright` 등) 없음 — 본 디렉토리에 단위 테스트를 추가하지 말 것.

## harness/

`scripts/harness-gate.mjs`의 verdict matrix · placeholder denylist · `--plan-file` dry-run 동작 회귀 검증용 markdown fixture. ADR 0010 도입과 함께 신설.

| fixture | 의도 | 실행 명령 | 기대 exit |
|---|---|---|---|
| `harness/valid.md` | 6필수+3검증 섹션 모두 정상 PASS 경로 | `node scripts/harness-gate.mjs --plan-file tests/harness/valid.md` | 0 |
| `harness/placeholder.md` | verdict 미요청·TBD 다수 — placeholder denylist 차단 | 동일, path 교체 | 1 |
| `harness/revised-after-review.md` | Codex `PASS_WITH_DECISION_LOG` + `## 의사결정 로그` 기록 → WORK 진입 후 통과 경로 | 동일, path 교체 | 0 |

### 변경 시 절차

`scripts/harness-gate.mjs`의 verdict matrix / placeholder denylist / 본문 임계값을 바꿀 때:

1. fixture 3개를 의도된 exit 코드(0/1/0)에 맞게 동기화.
2. 위 dry-run 명령 3개로 회귀 확인.
3. 변경 사유는 ADR 0010 또는 후속 ADR에 기록.

### 관련 ADR

- `docs/decisions/0010-harness-codex-review-cap.md` — 본 fixture 도입 결정 + Rollback Triggers 측정 기준
