# references/ — 외부 라이브러리 스냅샷

외부 문서의 로컬 캐시 (llms.txt 등). 에이전트가 인터넷 없이도 라이브러리 사용법을 참조할 수 있게 한다.

## 후보 (Phase 2에서 추가)

- Next.js App Router
- Supabase JS Client
- Cloudinary Next.js 통합
- (필요 시 추가)

## 현재 정책 문서

- `constraints.md` — 라이브러리·프레임워크별 반복 제약과 ADR 승격 기준

## 원칙

- 외부 문서를 그대로 카피하지 말고, **버전 명시 + 출처 URL**을 파일 상단에 기록
- 라이브러리 업데이트 시 의식적으로 갱신 (자동 갱신 안 됨)
- 큰 파일은 토큰 비용을 고려해 핵심 섹션만 추출
- 반복 제약은 `constraints.md`에 기록하고, 구조적 결정은 ADR로 승격

(현재 placeholder. Phase 2에서 채움)

<!-- last-audit: 2026-05-01 -->
