---
name: context-loader
description: 이 저장소에서 Codex CLI가 계획, 구현, 리뷰, 디버깅을 시작하기 전에 필요한 최소 컨텍스트를 로딩할 때 사용
---

# 컨텍스트 로더

Codex 작업 시작 시 항상 사용. `docs/` 전체 무차별 로딩이 아닌, 작업 유형에 맞는 문서만 선택적으로 읽는다. Codex 역할·협업 원칙은 `AGENTS.md` 참조 (이미 로딩됨).

## 항상 로딩

1. `AGENTS.md` — Codex 진입점·협업 원칙
2. `CLAUDE.md` — 오케스트레이터 워크플로우·프로젝트 지도
3. `docs/README.md` — 문서 인덱스
4. `docs/ARCHITECTURE.md` — 라우트·레이어·외부 의존
5. `docs/tech-debt-tracker.md` — 알려진 부채·baseline

## 작업 유형별 라우팅

| 작업 신호 | 추가 로딩 |
| --- | --- |
| Supabase, auth, cache, `revalidateTag`, Server Action, DB query | `.claude/skills/supabase/SKILL.md` |
| SCSS, layout, className, responsive UI, design token | `.claude/skills/styles/SKILL.md` |
| 새 파일, 파일 이동, 컴포넌트 위치, barrel export | `.claude/skills/file-structure/SKILL.md` |
| 다단계 구현 계획 리뷰 | `docs/exec-plans/active/`의 관련 계획. 없으면 Claude Code에 EXEC_PLAN 작성 요청 |
| 아키텍처 또는 라이브러리 결정 | `docs/decisions/README.md`와 관련 ADR |
| 기존 버그/회귀 | 관련 active/completed exec plan, `docs/tech-debt-tracker.md`, 영향받는 소스 |
| 외부 라이브러리 동작 | `docs/references/` 먼저. 없거나 오래됐으면 공식 문서만 |
| 현재 작업 외부 자료 | `docs/research/`의 관련 노트 |
| 구현 후 1차 검증 | active EXEC_PLAN, 변경 파일, `docs/tech-debt-tracker.md`, 검증 출력 |

## 로딩 예산

인덱스 우선, 현재 결정에 영향 있는 파일만, 긴 문서는 요약, 코드 vs 문서 충돌 시 코드 신뢰.

## 작업 시작 체크

작업 유형 명시 / 로딩 컨텍스트 나열 / 영향 레이어 식별 / EXEC_PLAN 필요 판단 / 구현·리뷰·1차 검증 모드 구분. 구현 또는 1차 검증이 명시되지 않으면 코드 수정 대신 분석·권장 다음 단계만 반환.

## 계획 검증 — 5체크

다단계 작업 계획은 결론 전에 다음 5체크를 수행한다.

1. 가정(Assumptions) 명시 여부
2. 비목표(Non-goals) 명시 여부
3. 변경 범위가 요청과 직접 연결 (창발적 추가 없음)
4. 성공 기준·검증 명령의 구체성
5. 새 추상화·라이브러리·데이터 흐름 변경의 과잉 여부 (없어야 정상)

결론은 다음 중 하나로 명시하고 계획 변경·숨은 리스크·검증 공백을 분리해 적는다.

- `PASS`: 계획대로 구현 가능
- `CHANGE_REQUEST`: 5체크 중 어느 하나라도 미충족이면 기본. 구현 전 계획 수정 필요
- `BLOCK`: 중요 정보·결정이 없어 구현 중단 필요

## 1차 검증

구현 diff 검증 순서.

1. 레이어 경계·데이터 흐름·스타일 토큰·Supabase 클라이언트 사용 확인.
2. **외과적 변경**: 각 파일이 task와 직접 관련 있는가? 인접 정리·포맷·이름 변경 섞임? 이번 변경으로 생긴 unused만 제거되고 기존 dead code 보존? 인접 정리 섞이면 별도 작업 분리 요청.
3. 직접 수정 범위: 명백한 버그, 타입 오류, 누락 guard, 검증 실패의 직접 원인까지.
4. 반환 (직접 수정 금지): 계획 변경, 새 라이브러리, 데이터 흐름, 인증/캐시/배포 정책, 외과적 변경 위반.
5. 수정했다면 변경 파일·수정 이유·검증 결과·남은 리스크를 마지막에 적는다.

## 핸드오프 형식

```text
작업 유형:
로딩한 컨텍스트:
관련 규칙:
예상 파일/레이어:
알려진 부채 또는 리스크:
권장 다음 단계:
```

## 중단 조건

- 비밀값·프로덕션 데이터·파괴적 DB 변경 필요
- 필요한 컨텍스트 부재 또는 모순
- 변경이 `docs/ARCHITECTURE.md` 또는 accepted ADR과 충돌
- 검증 실패를 신규 회귀/기존 부채로 분류 불가
- 1차 검증의 국소 수정 범위를 넘는 코드 수정 요구 감지

<!-- last-audit: 2026-05-04 -->
