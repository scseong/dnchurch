# decisions/ — Architecture Decision Records (ADR)

"왜 이 선택을 했는가"의 영구 기록. 코드는 *무엇을* 하는지 보여주지만, ADR은 *왜* 그렇게 했는지 보존한다.

## 언제 작성하는가

- **작성한다**: 구조 결정, 라이브러리 선택, 패턴 변경(기존 관행을 바꾸는 결정), 환경/배포 모델 변경
- **생략한다**: 일회성 버그 수정, 코스메틱 변경, exec-plan 안에서 끝나는 결정

## 명명 규칙

- 형식: `NNNN-<slug>.md` (예: `0001-supabase-client-separation.md`)
- 번호는 **순차 증가, 절대 재사용 금지** (탈락한 ADR도 번호는 영구 점유)
- slug는 영문 소문자·하이픈

## 상태 (Status)

- **Proposed** → 제안됨, 아직 채택 전
- **Accepted** → 채택, 현재 유효
- **Superseded by NNNN** → 다른 ADR로 대체됨 (이전 결정은 기록 보존)
- **Deprecated** → 더 이상 유효하지 않음 (대체 없이 폐기)

상태 변경 시 새 파일을 만들지 말고 **기존 파일에 상태 라인 갱신 + 변경 사유 추가**.

## 템플릿

`_template.md`를 복사해서 사용.

## 인덱스

| 번호 | 제목 | 상태 | 날짜 |
| --- | --- | --- | --- |
| [0001](0001-codex-orchestration-strategy.md) | Codex 오케스트레이션 전략 채택 | Accepted | 2026-05-01 |

<!-- last-audit: 2026-05-01 -->
