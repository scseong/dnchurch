# exec-plans/ — 작업 계획

CLAUDE.md의 **Workflow Step 2 (PLAN)** 산출물. 다단계 작업은 코드 작성 전에 여기에 계획을 적는다.

## 라이프사이클

```
PLAN 단계: active/<task>.md 생성 + 채우기
  ↓
WORK 단계: 단계별 체크박스 업데이트, 의사결정 로그 추가
  ↓
COMMIT 머지 후: completed/<task>.md로 이동, 회고 작성
```

## 명명 규칙

- 형식: `<YYYY-MM-DD>-<task-slug>.md`
- 예: `2026-05-01-sermon-empty-state.md`
- slug는 영문 소문자·하이픈 (한글 가능하나 영문 권장)
- 한 작업 = 한 파일. 작업이 분기되면 새 파일로 분리

## 언제 만드는가

- **만든다**: 다단계 작업, 여러 파일에 걸친 변경, 새 기능, 비자명한 리팩터
- **생략 가능**: typo, 한 줄 수정, rename, 단순 prop 추가

## 템플릿

`_template.md`를 복사해서 사용.

## 완료 항목 활용

`completed/`는 git에 영구 보관 — 비슷한 작업 시작 전에 검색하면 과거 의사결정·함정 회수 가능. **EXPLORE 단계에서 grep 우선 대상**.

<!-- last-audit: 2026-05-01 -->
