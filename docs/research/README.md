# research/ — 작업별 외부 리서치 적재

특정 작업(EXEC_PLAN) 진행 중에 수집한 **외부 자료의 발췌·요약**을 보관한다. 다음 세션·다른 에이전트가 같은 조사를 반복하지 않도록.

## 파일명 규칙

- 형식: `<YYYY-MM-DD>-<topic-slug>.md`
- 예: `2026-05-01-naver-blog-harness-engineering.md`
- slug는 영문 소문자·하이픈

## 내용 구조 (권장)

```markdown
# <주제>

- **출처**: <URL>
- **수집일**: YYYY-MM-DD
- **관련 EXEC_PLAN**: docs/exec-plans/active/<...>.md (있다면)

## 핵심 발췌

(원문 인용, 번역, 핵심 요약 — 다음에 같은 페이지를 다시 fetch하지 않아도 되도록)

## 우리 프로젝트 적용 시 결정 사항

(채택/기각/보류, 사유)
```

## references/와의 차이

| 위치 | 무엇을 담는가 | 라이프사이클 |
| --- | --- | --- |
| `docs/references/` | 라이브러리·프레임워크 공식 문서 스냅샷 (llms.txt 등) | 라이브러리 업데이트 시 갱신 |
| `docs/research/` | 특정 작업을 위한 일회성 외부 자료 발췌 | 적재 후 갱신 거의 없음, 시간 지나면 archive 후보 |

## 사용 흐름

1. EXEC_PLAN 진행 중 외부 자료가 필요해 fetch함
2. 핵심 발췌·요약을 `docs/research/<date>-<slug>.md`로 저장
3. EXEC_PLAN의 "참고 자료" 섹션에서 이 파일을 링크
4. 시간이 지나 부적합해지면 archive 또는 decisions/로 승격

## 원칙

- **외부 페이지 통째로 복붙 금지** — 핵심만 발췌, 라이선스 주의
- **출처 URL 필수** — 후속 검증 가능
- **민감 정보 제외** — API key, 인증 토큰 등 절대 포함 금지

<!-- last-audit: 2026-05-01 -->
