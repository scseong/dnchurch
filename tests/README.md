# tests/

dnchurch는 단위 테스트 / e2e 테스트 환경을 두지 않는다 (`CLAUDE.md` "테스트 환경 없음" 정책 명시).

본 디렉토리는 **harness 자체 검증용 fixture**만 보관한다. 테스트 러너(`vitest`, `jest`, `playwright` 등) 없음 — 본 디렉토리에 단위 테스트를 추가하지 말 것.

## harness/

`scripts/harness-gate.mjs`의 verdict matrix · placeholder denylist · tier별 요구 섹션 · `--plan-file` dry-run 동작 회귀 검증용 markdown fixture. `--tier N`으로 tier별 요구 섹션을 독립 검증한다(실제 tier는 git diff로 계산되므로 fixture는 override로 시연).

| fixture | 의도 | 실행 명령 | 기대 exit |
|---|---|---|---|
| `harness/valid.md` | 계획 검증 + Codex 1차 정상 → Tier 2 PASS | `node scripts/harness-gate.mjs --plan-file tests/harness/valid.md` | 0 |
| `harness/placeholder.md` | verdict 미요청·TBD 다수 — placeholder denylist 차단 | 동일, path 교체 | 1 |
| `harness/revised-after-review.md` | Codex `PASS_WITH_DECISION_LOG` + `## 의사결정 로그` 기록 → 통과 경로 | 동일, path 교체 | 0 |
| `harness/tier0-no-verdict.md` | Tier 0은 verdict 섹션 0개로 통과 / `--tier 2`면 계획 검증 부재로 차단 | `--plan-file tests/harness/tier0-no-verdict.md --tier 0` (그리고 `--tier 2`) | 0 (그리고 1) |
| `harness/tier2-missing-firstpass.md` | Tier 2인데 Codex 1차 누락 → 차단 / `--tier 1`이면 계획 검증만이라 통과 | `--plan-file … --tier 2` (그리고 `--tier 1`) | 1 (그리고 0) |
| `harness/tier2-codex-unavailable.md` | Codex hang fallback — `CODEX_UNAVAILABLE` 3필드 갖춰 Tier 2 통과 | `--plan-file … --tier 2` | 0 |

`--plan-file`은 `--tier` 미지정 시 가장 엄격한 Tier 2(계획 검증 + Codex 1차)로 검사한다.

### 변경 시 절차

`scripts/harness-gate.mjs`의 verdict matrix / tier 판정 / placeholder denylist / 본문 임계값을 바꿀 때:

1. fixture 6개를 의도된 exit 코드에 맞게 동기화.
2. 위 dry-run 명령들로 회귀 확인.
3. 변경 사유는 ADR 0010 또는 후속 ADR(PR-intent-first)에 기록.

### 관련 ADR

- `docs/decisions/0010-harness-codex-review-cap.md` — 본 fixture 도입 결정 + Rollback Triggers 측정 기준
- PR-intent-first ADR — tier 재편(A·B·C) + tier fixture 3개 도입
