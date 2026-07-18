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
| [0002](0002-node-first-harness-gate.md) | Node-first 하네스 자동화와 merge/release gate 채택 | Accepted | 2026-05-01 |
| [0003](0003-design-system-v3-token-unification.md) | design-system-v3 typography hierarchy | Accepted | 2026-05-04 |
| [0004](0004-ui-component-foundation.md) | UI Component Foundation (디자인 시스템 v4) | Accepted | 2026-05-06 |
| [0005](0005-about-pages-content-model.md) | about pages content model | Superseded by [0006](0006-about-pages-domain-driven-content.md) | 2026-05-09 |
| [0006](0006-about-pages-domain-driven-content.md) | about pages domain-driven content | Accepted | 2026-05-09 |
| [0007](0007-cloudinary-asset-folder-convention.md) | cloudinary asset folder convention | Accepted | 2026-05-11 |
| [0008](0008-code-quality-harness.md) | 코드 품질 강제: 에이전트 리뷰 + 사전 지침 채택 (Tier 1·2 도입 유보) | Accepted | 2026-05-13 |
| [0009](0009-commit-msg-hook-enforcement.md) | commit msg hook enforcement | Accepted | 2026-05-13 |
| [0010](0010-harness-codex-review-cap.md) | Harness CODEX_PLAN_REVIEW 범위 한정 + plan 압축 + EXPLORE 직접 검증 | Accepted | 2026-05-14 |
| [0011](0011-exec-plan-readability.md) | exec-plan 가독성 표준 | Accepted | 2026-05-17 |
| [0012](0012-admin-token-unification.md) | admin token unification | Accepted | 2026-05-22 |
| [0013](0013-page-shell-convention.md) | 페이지 골격 규약: 컨테이너 단일화·자동/자체 hero 분기·news 랜딩 신설 | Accepted | 2026-06-01 |
| [0014](0014-card-component-strategy.md) | 카드 컴포넌트: 전면 통합 대신 공유 부품·스타일 추출 | Accepted | 2026-06-02 |
| [0015](0015-page-state-seo-policy.md) | 페이지 상태·SEO 정책: 유형별 상태 파일 최소 요구 + news 디테일 JSON-LD 확대 | Accepted | 2026-06-02 |
| [0016](0016-server-action-conventions.md) | Server Action 공통 패턴 (위치·검증·반환·revalidate) | Accepted | 2026-06-12 |
| [0017](0017-figma-sot-design-to-code.md) | 디자인 SoT를 Figma로 옮기고 디자인투코드 채택, 무료 경로부터 검증 | Accepted | 2026-06-13 |
| [0018](0018-padding-token-standardization.md) | 카드·면 padding을 대칭 시맨틱 토큰 3단계로 고정 | Accepted | 2026-06-27 |
| [0019](0019-public-anonymous-write-rls.md) | 익명 공개 쓰기를 서버 액션과 anon 전용 RLS로 처리한다 | Accepted | 2026-06-29 |
| [0020](0020-brown-primary-migration.md) | 공개 primary 색을 navy에서 warm brown으로 이행 | Accepted | 2026-06-30 |
| [0021](0021-hero-breadcrumb-removal.md) | 공유 Hero·Breadcrumb 제거, 콘텐츠 페이지 헤더를 MobileHeader + sr-only h1로 통일 | Accepted | 2026-07-03 |
| [0022](0022-user-owned-data-rls.md) | 사용자 소유 데이터는 owner-RLS + 사용자 세션 Server Action | Proposed | 2026-07-17 |

<!-- last-audit: 2026-05-01 -->
