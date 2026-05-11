# PR 템플릿 사용 가이드

## 디렉토리 구조

```
.github/
├── PULL_REQUEST_TEMPLATE/
│   ├── feature.md       ✨ 새로운 기능 추가
│   ├── bugfix.md        🐛 버그 수정
│   ├── refactor.md      🔁 기능 변경 없는 코드 구조 개선
│   ├── maintenance.md   🔧 인프라·스크립트·문서·설정 변경 (Chore / Docs / Style)
│   └── release.md       🚀 develop → main 릴리스 병합
└── PULL_REQUEST_TEMPLATE.md   (기본 템플릿 — 유형이 모호할 때 사용)
```

## 템플릿 선택 방법

GitHub에서 PR을 생성할 때 URL에 쿼리 파라미터를 추가해 원하는 템플릿을 불러옵니다.

| 유형 | URL 파라미터 | Commit prefix |
|------|-------------|---------------|
| 기능 추가 | `?template=feature.md` | `Feat` |
| 버그 수정 | `?template=bugfix.md` | `Fix` |
| 리팩토링 | `?template=refactor.md` | `Refactor` |
| 인프라·문서·설정 | `?template=maintenance.md` | `Chore` / `Docs` / `Style` |
| develop → main 릴리스 | `?template=release.md` | `Chore` |

### 예시

```
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=feature.md
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=bugfix.md
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=refactor.md
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=maintenance.md
https://github.com/{owner}/{repo}/compare/main...develop?template=release.md
```

## 모든 템플릿 공통 섹션

| 섹션 | 목적 |
|------|------|
| **개발 컨텍스트** | task-id, exec-plan 링크, ADR, tech-debt — 하네스 추적 인덱스 |
| **의사 결정 기록** | 선택 이유 + 제외한 대안·버린 이유 — 결정 과정 보존 |
| **하네스 검증** | verify-task, harness-gate, 3단 AI 검증 결론 — 증거 연결 |
| **PM / 리뷰어 확인** | 사용자 영향, 운영 주의사항, 롤백 — 비개발 관점 요약 |

## 유형별 핵심 차이

| 섹션 | feature | bugfix | refactor | maintenance | release |
|------|---------|--------|----------|-------------|---------|
| 변경 배경 | 필요한 기능의 맥락 | 버그 재현 조건 + 근본 원인 | 개선하려는 문제 체크리스트 | 변경 목적 | 릴리스 목적 + 사용자 영향 |
| 특수 섹션 | 다이어그램 | 영향 범위·사이드 이펙트 | Before/After 구조 + 개선 지표 | — | 변경 묶음·배포 체크·롤백 계획 |
| 체크리스트 | 요구사항·엣지 케이스·보안 | 근본 원인 해결·패턴 점검 | 외부 동작 변경 없음 확인 | 없음 (경량) | develop 최신화·충돌·릴리스 검증·운영 승인 |

## 릴리스 PR 원칙

`release.md`는 `develop`에서 `main`으로 병합할 때 사용합니다. 개별 구현 설명보다 다음 항목을 우선합니다.

- 무엇이 포함됐는가
- 무엇이 제외됐는가
- 어떤 검증 증거가 있는가
- 배포와 롤백이 가능한가
- PM / 리뷰어가 어떤 사용자 흐름을 승인해야 하는가
