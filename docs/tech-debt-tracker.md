# Tech Debt Tracker — 인덱스

> ⚠️ **이 파일은 인덱스입니다. 신규/활성 부채는 [`tech-debt/active.md`](tech-debt/active.md)에 추가합니다. SSOT 아님.**

알려진 기술 부채와 마이그레이션 진행 상황을 두 파일로 나눠 관리한다. 발견 즉시 `active.md`에 추가, 해결되면 `resolved.md`로 옮긴다.

## 위치

| 파일 | 내용 | 항목 수 (2026-05-21) |
| --- | --- | --- |
| [`tech-debt/active.md`](tech-debt/active.md) | 진행 중·미해결 부채 | 36 |
| [`tech-debt/resolved.md`](tech-debt/resolved.md) | 해결된 부채 (회고·검색용) | 6 |

## 형식

각 항목은 다음 필드를 갖는다:

- **상태**: 🔴 시급 / 🟡 진행 중 / 🟢 마이그레이션 가능 / ✅ 해결됨
- **무엇**: 무엇이 부채인가
- **왜**: 왜 부채인가 (당시 결정·제약)
- **마이그레이션 경로**: 어떻게 해결하는가
- **영향 범위**: 어떤 파일/모듈이 관련 있는가
- **발견일** / (있다면) **목표 해결일**·**재확인일**

## 운영

- 신규 부채는 `active.md` 끝에 추가. 형식 위 6필드 모두 기입
- 머지로 해결되면 `complete-task.mjs` 흐름 중 `active.md` → `resolved.md` 이동. 해결 일자·관련 PR을 결과 줄에 명시
- 분기별 audit: 90일 이상 변동 없는 🟢 항목은 (a) 폐기 / (b) ADR 승격 / (c) archive 중 분류
- 인덱스인 이 파일은 항목 본문을 담지 않는다. 본문이 들어가면 SSOT 분기 발생

## 참고

- 분할 결정 근거: `docs/exec-plans/active/2026-05-21-tech-debt-tracker-split.md` D1·D2
- 형식 일관성 가이드: ADR 0011 (의사결정 로그 형식)
- 부채 발견 → 등록 흐름: `.claude/skills/complete-task/SKILL.md`

<!-- last-audit: 2026-05-21 -->
<!-- 변경 이력은 docs/exec-plans/completed/ 또는 git log 참조 -->
