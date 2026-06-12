# sermons-publish-review-fixes

- **상태**: ✅ 완료 (2026-05-25)
- **시작일**: 2026-05-24
- **브랜치**: feat/sermons-publish-ssot
- **Open questions**: none
- **ADR needed**: no — src/actions/ 포함이나 검증 2단계 분리 + 등록 성공 redirect를 목록으로 바꾼 화면 이동(D4)뿐, 외부 contract·스키마 변화 없음

## 목표

PR #101 봇 리뷰 3건을 고친다 — 비공개 저장이 6필드에 막히는 문제(P1), 저장 중 취소가 이동을 못 막는 문제(P2), `64px` 하드코딩(Gemini-c). 핵심은 "저장 조건"과 "발행 조건"을 갈라 영상·성경구절 준비 전에도 초안 저장이 되게 하는 것.

## 검증된 Assumptions

- `mapFormToDbInsert`(sermon-form-mapper.ts:11-25): `title·sermon_date·preacher_id·service_type`만 `|| null` 없이 매핑 → 이 4개가 DB NOT NULL = 저장 최소 조건. `video_id·scripture`는 `|| null` = nullable → 초안 저장 가능.
- `validateSermonForm`(sermon-form.ts:46-57): `isPublished`를 안 보고 6필드 전부 검사. `createSermonAction`(:128)·`updateSermonAction`(:170) 무조건 호출 → 비공개 저장도 차단 (P1 확인).
- `useUnsavedChanges`(useUnsavedChanges.ts:3-14): `beforeunload` 리스너만 등록. Next soft nav(router.push·서버 redirect)엔 안 뜸 → MISSED(create dirty) 실제 증상 없음.
- `PublishCard`(PublishCard.tsx:33): "비공개 / 임시 저장" 라벨이 이미 있음. A에서는 이 라벨이 정확 → 라벨 변경 불필요.
- `index.module.scss`(:563·590): `.action_bar_submit` 높이 42px, `.preview_overlay` `inset: 0 0 64px 0` 하드코딩(주석에 64=모바일 바 높이 명시).

## Success Criteria

- 비공개(`isPublished=false`)로 영상·성경구절 없이 등록·수정 시 저장 성공 (지금은 차단됨).
- 공개(`isPublished=true`)로 영상·성경구절만 누락 시 "발행하려면 …" 메시지로 차단.
- 저장 4필드(제목·날짜·설교자·예배 종류) 누락 시 공개·비공개 모두 차단.
- 공개인데 저장 4필드 중 하나가 비면 "발행하려면"이 아니라 "저장하려면 …" 메시지 (저장 검증이 먼저 실패 → 우선).
- 저장 요청 중(`isPending`) 취소 버튼 비활성화 + `handleCancel` 즉시 반환.
- `index.module.scss`에서 `64px` 인라인 사용 0건, `$action-bar-height` 로컬 변수 선언 1건으로 치환.
- `verify-task` PASS (lint·styles·build, knip 기존 부채 제외).

## 영향받는 파일

- `src/lib/sermon-form.ts` — `SERMON_SAVE_REQUIRED` 추가, `validateSermonSave` 추가, `validateSermonForm` → `validateSermonPublishReady` 개명
- `src/actions/sermon.action.ts` — 저장·발행 2단계 검증, `buildMissingMessage` 메시지 분기
- `src/components/admin/sermons/SermonForm/Preview/Checklist.tsx` — 함수명 갱신 (발행 준비 = publish-ready)
- `src/app/(admin)/admin/sermons/_components/SermonFormShell.tsx` — `handleCancel`에 `isPending` 가드
- `src/components/admin/sermons/SermonForm/index.tsx` — 취소 버튼 `disabled={isPending}` (구현 시 확인)
- `src/components/admin/sermons/SermonForm/index.module.scss` — `$action-bar-height` 로컬 변수

## 단계별 체크리스트

- [ ] 1. `sermon-form.ts`: `SERMON_SAVE_REQUIRED`(4필드) + `validateSermonSave` 추가, `validateSermonForm` → `validateSermonPublishReady` 개명
- [ ] 2. `sermon.action.ts`: create/update에서 저장 검증 먼저(실패 시 "저장하려면 …" 반환·우선), 통과 후 `isPublished`면 발행 검증("발행하려면 …")
- [ ] 3. `Checklist.tsx`: `validateSermonPublishReady`로 호출 갱신
- [ ] 4. `SermonFormShell.tsx`: `handleCancel` 맨 앞 `if (isPending) return;`
- [ ] 5. `index.tsx`: 취소 버튼 `disabled={isPending}` 확인·적용
- [ ] 6. `index.module.scss`: `$action-bar-height: 64px` 로컬 변수 선언 후 바 높이·overlay inset 양쪽 참조
- [ ] 7. `verify-task` 실행

## Non-goals

- i18n 적용 (Gemini-b) — 한국어 단일 사이트, i18n 스택 없음.
- `publishLabel` 중첩 삼항 → 객체 매핑 (Gemini-a) — 동작 동일한 선택적 정리, 이번 범위 밖.
- "비공개 / 임시 저장" 라벨 변경 — A에서 이미 정확.
- MISSED(create `setIsDirty`) — D3 참조.

## 의사결정 로그

- **D1 — 저장 조건과 발행 조건 분리 (P1, A안)**
  - 문제: `validateSermonForm`이 `isPublished`를 무시하고 6필드를 강제 → "비공개 / 임시 저장" 라벨과 달리 영상·성경구절이 없으면 비공개 저장도 막힘. 영상은 예배 직후 업로드 전이라 흔히 비어 있음.
  - 해결: `validateSermonSave`(4필드, DB NOT NULL)와 `validateSermonPublishReady`(6필드)로 나눔. `isPublished=true`일 때만 발행 검증. B(라벨만 보정)도 후보였으나, 영상 준비 전 초안 저장이 실제 운영 흐름이라 A 채택(사용자 결정). PR #101 D6(영상 필수)의 의미를 "발행 필수"로 좁힘.
  - 결과: 비공개 초안 저장 가능. 공개할 때만 6필드 강제. 공개라도 저장 4필드가 비면 저장 검증이 먼저 실패해 "저장하려면" 메시지가 우선. DB 스키마 변경 없음(이미 nullable).
- **D2 — `preview_overlay` 64px 하드코딩을 로컬 변수로 (Gemini-c)**
  - 문제: `index.module.scss:590` `inset: 0 0 64px 0`의 `64px`가 모바일 `action_bar` 높이와 암묵 결합. 리포 하드코딩 금지 규칙 위반.
  - 해결: 토큰에 의미가 맞는 값이 없음 → styles 스킬 규칙대로 파일 상단에 로컬 변수 `$action-bar-height` 선언, 바 높이·overlay inset 양쪽에서 참조.
  - 결과: 값의 의미가 드러나고, 한 곳 수정으로 동기화.
- **D3 — MISSED(create `setIsDirty`) 범위 제외**
  - 문제: Codex가 create 성공 시 잘못된 `beforeunload` 경고 가능성 제기.
  - 해결: `useUnsavedChanges`는 `beforeunload`만 등록(:12). Next soft nav(redirect·router.push)는 `beforeunload`를 띄우지 않음 → 실제 증상 없음. 최소 변경 원칙으로 코드 추가 안 함.
  - 결과: 불필요한 변경 회피, 기존 동작 유지.
- **D4 — 등록·수정 성공 후 모두 목록으로 이동 (사용자 요청, dev 확인 중 발견)**
  - 문제: 등록은 새 설교 edit 화면으로, 수정은 같은 edit 화면으로 보냈음. 작업을 마쳤는데 편집 화면에 머무를 이유가 없어 어색.
  - 해결: 등록은 `createSermonAction`의 server redirect를, 수정은 `SermonFormShell`의 `router.push`를 모두 `/admin/sermons`(목록)로 바꿈.
  - 결과: 등록·수정 둘 다 끝나면 목록에서 결과를 바로 확인. (처음엔 수정만 편집 화면 유지로 뒀으나 사용자 요청으로 목록 통일.)

## ADR 판단

불필요 — `src/actions/sermon.action.ts`가 diff에 들어가지만, (1) 기존 검증을 저장(4필드)·발행(6필드) 두 단계로 나눈 것과 (2) 등록 성공 redirect 대상을 edit에서 목록으로 바꾼 화면 이동(D4)뿐. 새 외부 contract·데이터 흐름·의존성·인증/캐시 정책·DB 스키마 변화 없음.

## Verification

- `node scripts/verify-task.mjs sermons-publish-review-fixes`

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence high) — 고쳐야 할 지적 2건, 계획 수정으로 해소한 뒤 작업 진입
- **현재 판단**: 두 지적 모두 반영함.
  - 첫째, 공개로 저장하는데 저장 필수 4필드도 비어 있을 때 어느 안내가 나오는지가 성공 기준에 빠져 있었다. 저장 검증이 먼저 실패하므로 "저장하려면 …"이 우선이라는, 판정 가능한 기준을 더했다.
  - 둘째, 성공 기준의 "64px 하드코딩 0건"과 계획 본문의 "`$action-bar-height: 64px` 선언"이 글자 그대로 어긋났다. "인라인 사용 0건 + 로컬 변수 선언 1건"으로 고쳤다.
  - 나머지는 통과 — 저장 4필드 구성, 검증 실행 순서, 함수 이름 변경 범위, 새 설교 등록 뒤 변경 표시 초기화 생략(D3), ADR 불필요.
- **다음 행동**: 작업 진행 (재검증 불필요 — 지적 2건 계획에 반영 완료)

## Codex 1차 검증

- **결론**: PASS (confidence medium) — 6개 기준 모두 충족. 다만 tsc가 정책으로 막혀 저장소 전체에 옛 함수 이름(`validateSermonForm`)이 남았는지는 타입 검사로 못 봄 → VERIFY의 lint·build로 확인
- **현재 판단**: 검증 순서(저장 먼저 → 저장 필드 누락 시 "저장하려면" 우선), `collectMissing` 필드 판정(제목·성경 구절만 trim, 나머지 4개는 빈 문자열 비교 — 원래 함수와 동일), 취소 3중 차단(핸들러 가드 + `disabled` 속성 + CSS `:disabled`), scss 64px 인라인 0건·로컬 변수 1건, 변경 6파일 모두 P1/P2/Gemini-c에 직결 — 전부 통과.
- **다음 행동**: verify-task로 lint·build 확인 (옛 함수 이름 잔재 없음을 eslint unused-import로 교차)

## Claude 2차 검증

- **최종 판단**: PASS — verify-task 통과(lint·styles·build), knip 신규 0. Codex 1차 PASS와 교차 일치.
- **현재 판단**: Codex가 타입 검사로 못 본 옛 함수 이름 잔재는 ESLint·Build 통과로 해소(`validateSermonForm` 0건). 첫 검증에서 knip이 잡은 `SERMON_SAVE_REQUIRED` export(내 변경이 만든 부채)를 export 제거로 정리 → 재검증에서 신규 0 확인.
- **다음 행동**: 사용자 승인 후 커밋. dev에서 비공개 초안 저장·공개 차단 메시지·저장 중 취소를 실기기로 확인.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260524-225314 | ✅ | ✅ | ✅ | 1 (SERMON_SAVE_REQUIRED export) | — |
| 재검증 | 20260524-225516 | ✅ | ✅ | ✅ | 0 | dev에서 비공개 초안 저장·공개 차단 메시지·취소 가드 |
| 최종(등록·수정 후 목록 이동 포함) | 20260525-215119 | ✅ | ✅ | ✅ | 0 | — |

## 회고

**잘된 것**
- 봇 P1을 곧장 적용하지 않고 두 Codex 의견을 교차 검증 → "미완성 초안 저장이 필요한가"라는 제품 결정으로 환원했고, 사용자가 A(저장/발행 검증 분리)를 골랐다. 가정 대신 사용자 판단으로 방향을 정함.
- 검증을 저장(4필드)·발행(6필드)으로 나눠 영상 준비 전 초안 저장이라는 실제 운영 흐름을 살렸다. A 방향에서 라벨은 이미 맞아 변경 0.
- dev에서 직접 눌러보며 나온 후속(등록·수정 후 목록 이동)을 같은 PR에서 마감.

**다음에 할 것 / 배운 것**
- 가독성 체크리스트를 만든 직후 검증 기록에서 영어·약어("rename surgical", "D3 dismiss")를 그대로 써서 사용자가 지적했다. 요약 자리가 가장 자주 새는 곳 — 요약도 번역한다. SKILL "산출 문서 가독성 체크리스트"로 범위를 문서 전체로 넓힘.
- 커밋마다 verify 기록의 manifest가 어긋나 harness-gate 직전 verify를 다시 돌려야 했다. 다음엔 문서 편집까지 끝낸 뒤 마지막에 한 번만 verify.

**부채**
- 신규 부채 없음. 등록·수정 후 목록 이동이 조용한 것(저장 토스트 없음)은 의도된 선택 — create는 server redirect라 토스트가 어려워 update도 일관되게 생략. 필요해지면 update에 성공 토스트 추가 검토(추적 항목 아님).
- knip 기존 부채 97건은 이번 범위 밖.
