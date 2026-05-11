# codex-context-loader

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-01
- **브랜치**: feat/harness-engineering

## 목표

Codex CLI가 작업 시작 시 저장소의 System of Record를 선택적으로 로딩할 수 있게 한다.
루트 `AGENTS.md`는 짧은 부트스트랩으로 유지하고, `.codex/skills/context-loader/`가 작업 유형별 문서 라우터 역할을 맡는다.

## 접근법

레퍼런스의 "AGENTS.md는 지도, docs는 기록 시스템" 원칙을 따른다. `AGENTS.md`에는 Codex용 최소 규칙만 두고, 상세 컨텍스트 선택은 `context-loader` 스킬에 위임한다.

## 영향받는 파일

- `AGENTS.md`
- `.codex/skills/context-loader/SKILL.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/exec-plans/active/2026-05-01-codex-context-loader.md`

## 단계별 체크리스트

- [x] 1. Codex용 루트 진입점 `AGENTS.md` 추가
- [x] 2. 프로젝트 로컬 `context-loader` 스킬 추가
- [x] 3. `docs/README.md`에 Codex 컨텍스트 로딩 경로 추가
- [x] 4. 문서 길이와 링크, 중복 규칙 검토
- [x] 5. 변경 파일 검토 및 가능한 문서 검증 수행
- [x] 6. Codex 기본 책임을 구현이 아닌 설계·디버깅·리뷰 전담으로 명확화

## 완료 기준 (DoD)

- [x] 문서 변경이므로 전체 `yarn verify` 대신 파일 검토와 git diff 확인
- [ ] 사용자 승인 후 커밋
- [ ] 필요 시 ADR 또는 tech-debt-tracker 업데이트

## 참고 자료

- OpenAI Harness Engineering: https://openai.com/ko-KR/index/harness-engineering/
- `docs/decisions/0001-codex-orchestration-strategy.md`

## 의사결정 로그

- 2026-05-01: `AGENTS.md`를 상세 매뉴얼이 아니라 Codex 부트스트랩으로 제한. 상세 로딩은 `.codex/skills/context-loader/SKILL.md`가 담당.
- 2026-05-01: `context-loader`는 `.codex/skills/`에 둔다. Claude 전용 `.claude/skills/`와 분리해 Codex CLI 책임을 명확히 한다.
- 2026-05-01: Codex는 기본 구현자가 아니라 계획 리뷰·설계 비평·디버깅 분석·객관 리뷰 전담으로 제한한다. 직접 구현은 사용자 명시 요청이 있을 때만 예외로 둔다.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것: AGENTS.md를 최소 부트스트랩으로 유지하고 context-loader 스킬로 작업 유형별 문서 라우팅 분리. Claude/Codex 컨텍스트 경계가 명확해짐. Codex 역할을 설계·리뷰·디버깅으로 제한해 ADR 0001과 정합성 확보.
- 다음에 할 것: 실제 Codex 위임 세션에서 context-loader 경로가 올바르게 로딩되는지 dogfooding.
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것): 해당 없음
