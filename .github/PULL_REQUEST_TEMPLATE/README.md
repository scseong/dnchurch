# PR 템플릿 사용 가이드

## 디렉토리 구조

```
.github/
├── PULL_REQUEST_TEMPLATE/
│   ├── feature.md    ✨ 새로운 기능 추가
│   ├── bugfix.md     🐛 버그 수정
│   └── refactor.md   🔁 기능 변경 없는 코드 구조 개선
└── pull_request_template.md   (기본 템플릿 — 유형이 모호할 때 사용)
```

## 템플릿 선택 방법

GitHub에서 PR을 생성할 때 URL에 쿼리 파라미터를 추가해 원하는 템플릿을 불러옵니다.

| 유형 | URL 파라미터 | Commit type |
|------|-------------|-------------|
| 기능 추가 | `?template=feature.md` | `feat` |
| 버그 수정 | `?template=bugfix.md` | `fix` |
| 리팩토링 | `?template=refactor.md` | `refactor` |

### 예시

```
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=feature.md
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=bugfix.md
https://github.com/{owner}/{repo}/compare/{base}...{branch}?template=refactor.md
```

## 유형별 핵심 차이

| 섹션 | feature | bugfix | refactor |
|------|---------|--------|----------|
| 변경 배경 | 필요한 기능의 맥락 | 버그 재현 조건 + 근본 원인 | 개선하려는 문제 체크리스트 |
| 설계 결정 | 대안 비교 테이블 | 영향 범위·사이드 이펙트 | Before/After 구조 다이어그램 |
| 특수 섹션 | — | 회귀 방지 테스트 케이스 강조 | 개선 지표 테이블 |
| 체크리스트 | 신규 기능 테스트 추가 여부 포함 | 근본 원인 해결 여부 확인 | 외부 동작 변경 없음 확인 |
