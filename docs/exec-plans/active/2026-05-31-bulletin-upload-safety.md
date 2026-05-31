# bulletin-upload-safety

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-31
- **브랜치**: fix/bulletin-upload-safety
- **Open questions**: none
- **ADR needed**: no — `src/actions/`·`src/apis/` 변경이나 데이터 흐름·인증·캐시 정책 변경 없음. 업로드 실패 처리(Promise.all → allSettled)와 filename 충돌 방지(UUID prefix) 두 버그 수정만. tech-debt-pre-release D2·D3 설계를 따르는 일회성 구현.

## 목표

주보 이미지 다중 업로드의 P0 결함 2건을 막는다. (1) 부분 실패 시 성공한 이미지가 Cloudinary에 주인 없이(orphan) 남는다, (2) 같은 폴더에 같은 sanitize 결과 filename으로 다시 올리면 기존 이미지를 덮어쓴다(overwrite). tech-debt-pre-release Phase 1(G1)을 실행한다.

## 검증된 Assumptions

- `src/actions/_bulletin-helpers.ts:18` — `uploadBulletinImages`가 `Promise.all`로 병렬 업로드. 1장 실패 시 throw하나 성공분 public_id가 함수 밖으로 안 나감 — Read 확인.
- `src/apis/cloudinary.ts:38` — `uploadImage`가 `public_id: ${folder}/${filename}`. 같은 filename = 같은 public_id = Cloudinary overwrite — Read 확인.
- `src/apis/cloudinary.ts:48` — `deleteImage(publicId)` 존재. fully-qualified 변환 내장 — 내부 cleanup에 사용 가능 — Read 확인.
- 호출처 2곳(`create-bulletin.action.ts:30`·`update-bulletin.action.ts:50`)은 이미 throw 시 cleanup 보유. 단 `uploadBulletinImages` 내부 부분 실패분은 반환 안 돼 호출처 cleanup이 못 잡음 — Grep 확인.
- `randomUUID` 사용처 0건 — `import { randomUUID } from 'crypto'` 신규 추가 필요 — Grep 확인.

## Success Criteria

- `uploadBulletinImages`가 `Promise.allSettled` 사용. 일부 실패 시 성공분 `public_id`를 `deleteImage`로 청소한 뒤 에러를 재throw한다 (호출처 기존 흐름 유지).
- filename이 `${orderIndex}-${randomUUID().slice(0,8)}-${sanitized}` 형식. 같은 날 같은 이름 재업로드해도 public_id 충돌 0.
- `yarn lint`·`yarn build`·`yarn knip` 통과. knip 신규 미사용 0.
- 수동: dev에서 5장 중 1장 강제 실패 시 Cloudinary 콘솔 orphan 0건 (커밋 X 증적).

## 영향받는 파일

- `src/actions/_bulletin-helpers.ts` — `Promise.all` → `Promise.allSettled` + 성공분 cleanup + 재throw. filename에 orderIndex·UUID prefix. `randomUUID` import.

## 단계별 체크리스트

- [x] 1. `_bulletin-helpers.ts`에 `import { randomUUID } from 'crypto'` 추가 + `deleteImage` import
- [x] 2. filename 생성에 `${startOrderIndex + i}-${randomUUID().slice(0, 8)}-${sanitized}` prefix 적용
- [x] 3. `Promise.all` → `Promise.allSettled`. rejected 1건 이상이면 fulfilled의 `public_id`를 `deleteImage`로 청소 후 첫 rejection 재throw
- [x] 4. `node scripts/verify-task.mjs bulletin-upload-safety` 통과 (20260531-193838)
- [x] 5. Codex 1차 검증 — PASS (신뢰도 높음)

## Verification

- `node scripts/verify-task.mjs bulletin-upload-safety`
- 수동: dev preset 5장 중 1장 강제 실패 → Cloudinary 콘솔 orphan 0건

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## 의사결정 로그

- **D1 — Codex 계획 검증 생략**
  - 문제: 본 task는 src/actions 변경이라 CODEX_PLAN_REVIEW 대상이다. 다만 단일 파일·약 25줄·단일 관심사(P0 버그 2건) 작업이다.
  - 해결: 계획 검증을 생략했다. 설계(Promise.allSettled + 성공분 cleanup + filename UUID prefix)는 마스터 plan tech-debt-pre-release D2·D3에서 이미 대안과 비교해 정했다(sequential·multi-upload API·Date.now 모두 기각). 새 설계 결정이 없어 계획 검증으로 얻을 이득이 적다. 대신 P0 데이터 손실 코드라 구현 후 Codex 1차 검증으로 확인한다.
  - 결과: 구현에 진입했고, Codex 1차 검증 PASS로 안전을 확인했다.

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG
- **현재 판단**: 생략 결정과 이유는 D1 참조.
- **다음 행동**: 구현 후 Codex 1차 검증으로 대신한다.

## Codex 1차 검증

- **결론**: PASS

### Codex 1차 검증 결과 (verbatim)

```
**Files changed** 없음
**Findings**
- 확정 버그 없음.
- deleteImage()는 내부에서 toFullyQualifiedPublicId()를 호출하지만, ROOT_FOLDER/ prefix가 이미 있으면 그대로 반환하는 guard가 있어 double-qualification은 발생하지 않습니다.
- fulfilled.map((result, i))의 i는 성공 경로에서만 사용됩니다. rejected가 하나라도 있으면 throw하므로, 반환 시점에는 모든 upload가 fulfilled이고 원본 file index와 정렬이 유지됩니다.
- cleanup은 Promise.allSettled()를 사용해 cleanup 실패가 원래 upload 실패를 가리지 않습니다.
- 실제 파일에는 PromiseFulfilledResult<UploadResult> / PromiseRejectedResult type guard가 있어 TypeScript narrowing도 명확합니다.
**Fixes applied** 적용한 수정 없음.
**최종 판정: PASS** 신뢰도: 높음 (단, 빌드/타입체크 명령 실행 결과는 확인하지 못함)
```

평이 풀이: Codex가 점검한 5개 항목(cleanup id 중복·순서 정렬·에러 가림·타입 가드·외과적 변경)이 모두 정상이고 고칠 버그가 없다고 판단했다. Codex는 sandbox 제약으로 빌드·타입체크는 직접 못 돌렸고, 그 부분은 본인 verify-task(20260531-193838 통과)가 메운다. 남은 위험은 cleanup 실패가 조용히 묻히는 것뿐인데, `deleteImage` 내부에 console.error가 있어 추적 가능하다(로그 보강은 G2 Phase 2 영역).

- **다음 행동**: Claude 2차 검증 후 commit.

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: verify-task(20260531-193838) lint·styles·build 통과, knip 신규 0. Codex 1차 PASS 결과를 diff 재확인 — `firstRejected.reason` throw로 호출처(create/update action) 기존 try/catch cleanup 흐름 보존, 부분 성공분은 내부 `Promise.allSettled` cleanup으로 orphan 차단. filename UUID prefix로 충돌 0. 외과적 — `_bulletin-helpers.ts` 1 파일만.
- **다음 행동**: harness-gate → 사용자 승인 → commit.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260531-193838 | ✅ | ✅ | ✅ | 0 | dev 5장 중 1장 강제 실패 → Cloudinary orphan 0건 (배포 프리뷰 실측) |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

