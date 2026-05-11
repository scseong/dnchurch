# Codex PR 리뷰 — 첫 dogfooding

- **출처**: `codex:rescue` 스킬 (Claude Code → Codex CLI 위임)
- **수집일**: 2026-05-01
- **관련 EXEC_PLAN**:
  - `harness-hooks-orchestration` (Phase 1: 글 변경) — ADR 0001 명문화의 첫 실행
  - `tech-debt-cleanup-phase1` — 리뷰 대상 변경의 일부
- **트리거**: ADR 0001 위임 트리거 *"큰 변경 후 객관적 리뷰"* — 1500줄 / 4개 커밋 변경 후

## 리뷰 요청 형식 (효과적이었던 부분)

다음 구조가 작동했다:
1. **컨텍스트 프레임** — 브랜치, 커밋 목록, 리포 정보(테스트 환경 없음, 솔로 개발자 등)
2. **우선순위 명시** — 5개 영역 + 영역별 구체 질문
3. **NOT looking for** 명시 — style nits·praise 제외
4. **출력 형식 강제** — severity별(🔴/🟡/🟢/✅) 구조화

→ 미래 위임 시 같은 골격 재사용 권장. 특히 "what I am NOT looking for" 절은 노이즈를 크게 줄였다.

## 발견 사항 분포

| Severity | 건수 | 채택 | 부분 철회 |
| --- | --- | --- | --- |
| 🔴 Must fix | 2 | 2 | 0 |
| 🟡 Should consider | 4 | 3 | 1 |
| 🟢 Nice to have | 1 | 1 | 0 |
| ✅ Confirmed correct | 5 | — | — |

**채택률 88%** (8/9). 1건은 실측 후 부분 철회.

## 핵심 발견 (요약)

### 🔴 Must fix
1. **`.claude/settings.local.json` 추적 누설** — 머신별 권한 파일이 git에 포함됨. 광범위 명령(`Bash(git:*)`, `Bash(rm:*)`) 허용 목록까지 노출
2. **`scripts/verify-task.sh` dead code** — `set -uo pipefail` + `if/else` 조합 때문에 `||` 라인이 절대 실행되지 않음. WARNED 배열은 항상 비어있었음

### 🟡 Should consider
1. **`app/ → apis/` warn은 효과 없음** — `--max-warnings=0` 미설정 시 신규 위반 차단 안 됨. error로 격상 + line-level disable이 정공법
2. **layer 룰 alias 한정** — `@/...`만 검사, `../<layer>/...` 우회 가능 (보강 시도했으나 false positive로 부분 철회 — 아래 참조)
3. **ConfirmModal render-time ref mutation** — React 19 Concurrent Mode에서 버려진 렌더 데이터 누출 위험. `useState` + `useLayoutEffect`로 교체 권장
4. **exec-plan 중복 표** — 한 파일 내 같은 표가 두 번. 두 번째가 첫 번째를 덮어쓰는 형태

### 🟢 Nice to have
1. `complete-task.sh` PATTERN의 glob 안전성

## 우리 프로젝트 적용 시 결정 사항

### 채택
모든 🔴, 🟢 + 🟡의 1·3·4. 단순 적용으로 끝남.

### 부분 철회 — 🟡-2 (layer 룰 상대 경로 보강)

**시도**: `**/<layer>/**` 패턴 추가 → minimatch가 외부 패키지(`next/dist/client/components/redirect-error`)도 매치.

**결과**: actions/ 3개 파일이 새로 위반으로 잡힘 — 모두 false positive (Next.js 내부 모듈).

**철회 후 결정**:
- 알리어스만 검사로 후퇴
- 상대 경로 layer crossing은 현재 0건
- 미래 발생 시 `eslint-plugin-import`의 `no-relative-parent-imports` 또는 `eslint-plugin-boundaries`로 별도 처리

**교훈**: Codex 제안도 적용 단계에서 실측 필요. 단순 "yes-man" 위임 위험 — 멀티 세션 리뷰 ≠ 자동 채택.

## 운영 메모 (다음 위임을 위한 회고)

### 잘된 것
- Codex가 우리가 못 본 진짜 결함 2건 (🔴) 발견 — 인간 + Codex 두 시선의 가치 입증
- 자기 비판적 의견(🟡-2의 false positive 우려)을 미리 명시 — 적용 시 검증 포인트 제공
- ✅ 5건 명시로 "어디까지가 검토 통과 영역"인지 명확

### 개선할 것
- 1500줄은 큰 단위 — 더 작은 단위로 자주 위임이 효과적일 가능성 (주제별 분리)
- "Confirmed correct"의 근거가 얇음 — 단정 vs 실증 구분 필요
- 위임 시 실행 환경 정보(예: ESLint 버전, minimatch 동작) 더 구체적으로 줘야 false positive 사전 인지 가능

### 미래 자동화 방향 (`harness-claude-hooks` 입력)
- 큰 변경(N파일/M줄 임계) 시 자동 codex 리뷰 트리거 — 그러나 사이즈가 클수록 리뷰 정확도가 떨어진다는 본 회고를 반영해, **임계 도달 시 "먼저 변경을 분리하라"는 안내가 우선**
- 위임 응답을 자동 수용하지 않음 — 수정 적용 후 재검증(lint·build) 필수 단계

## References

- ADR 0001: `docs/decisions/0001-codex-orchestration-strategy.md`
- 리뷰 대상 커밋 (이 PR): `095a346`, `a375e4c`, `9a159f6`
- 리뷰 반영 커밋: `e67801b` (Refactor: Codex 객관 리뷰 반영)

<!-- last-audit: 2026-05-01 -->
