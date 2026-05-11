# cloudinary-asset-structure

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-11
- **브랜치**: refactor/cloudinary-asset-structure

## 목표

Cloudinary 폴더 구조를 `site/` (정적) + `uploads/{도메인}/` (동적)로 1차 분리하고, DB·코드의 환경 prefix를 제거해 dev/prod 환경 분리를 완성한다. legacy seed 데이터·폴더(`bulletins/`, `bulletin/`, `dnchurch/`)를 정리한다.

## Assumptions

- dev DB의 `bulletins`(7) + `bulletin_images`(11) row는 모두 시드/테스트 — truncate 가능 (사용자 확인 완료)
- prod DB·prod Cloudinary는 이번 작업에서 건드리지 않는다 (별도 후속 작업으로 분리)
- 정적 자산(`site/welcome/`, `site/hero/`, `site/home/*`)의 폴더 재배치는 본 작업에서 **하지 않는다** — 코드 헬퍼 도입 후 점진적으로 옮긴다 (Codex 권장)
- 환경 prefix는 코드에서 합성: DB `cloudinary_id`는 prefix-free (`uploads/bulletins/...`), `getCloudinaryUrl`이 `${ROOT_FOLDER}/${cloudinary_id}` 합성
- `bulletin_images.url`은 `cloudinary_id`로 재생성 가능하므로 컬럼 DROP

## Non-goals

- prod 환경(`dnchurch-prod`) 자산·DB 변경
- 정적 자산 재배치 (`site/welcome/` → `site/about/welcome/`, hero co-location)
- 다른 5개 `*_url` 컬럼(notices/sermons/staff/preachers/sermon_series) 정리 — 이들은 cloudinary 자산이 아님 (YouTube/PDF 파일명/Next.js public)
- Tags 기반 자산 분류 도입
- `public_id` 자체 rename (Cloudinary 마이그레이션 시에는 새 데이터부터 새 컨벤션 적용)

## Success Criteria

1. dev Cloudinary에서 legacy 폴더(`bulletins/`, `bulletin/`, `dnchurch/`)와 `dnchurch-dev/bulletins/*` 자산이 0개
2. dev DB에서 `bulletins` rows = 0, `bulletin_images` rows = 0
3. `bulletin_images.url` 컬럼이 schema에서 제거됨 (`generate:types` 결과 반영)
4. `getCloudinaryUrl(cloudinary_id)`가 `${BASE_URL}/${ROOT_FOLDER}/${cloudinary_id}` 형태를 반환 — DB값에 prefix 없이도 동작 (방어적으로 leading `/` 및 `${ROOT_FOLDER}/` 중복 prefix 1회 strip)
5. `siteAsset(relPath)` 헬퍼가 `${ROOT_FOLDER}/site/${relPath}` (public_id form, full URL 아님) 반환, 코드에서 `dnchurch-dev/` 하드코딩 0건 (`grep -r "dnchurch-dev" src/`)
6. 새 주보를 관리자 UI로 업로드 시 `dnchurch-dev/uploads/bulletins/{YYYY}/{MM}/{DD}/...` 경로에 저장됨
7. `yarn lint && yarn lint:styles && yarn build && yarn knip` 통과
8. 기존 정적 이미지(home banner 등) 페이지 노출 정상 (회귀 없음)
9. 새 bulletin upload 후 `bulletin_images.cloudinary_id` 값이 `uploads/bulletins/...`로 시작 (`dnchurch-dev/`로 시작하지 않음) — Supabase MCP `execute_sql`로 검증
10. `src/`에서 `bulletin_images.url` 또는 `BulletinImageInput.url` 참조 0건 (`grep -rn "\.url" src/services/bulletin/ src/actions/*bulletin* src/types/bulletin.ts src/app/(content)/news/bulletins/`)

## Verification

- `node scripts/verify-task.mjs cloudinary-asset-structure` (lint + lint:styles + build + knip)
- `grep -rn "dnchurch-dev" src/ | grep -v ".test."` → 0 hits
- `yarn dev`에서 홈/주보 페이지 렌더 확인 (수동)
- 관리자 주보 업로드 후 Cloudinary MCP로 `search-assets` → 새 경로 확인
- Supabase MCP `execute_sql`: `SELECT count(*) FROM bulletin_images, bulletins` → 0/0

## 접근법

**4단계 — step 1~3은 하나의 구현 단위로 묶고, step 4는 정리 단계로 분리**:

1. **코드 헬퍼 + 동적 업로드 경로 변경** — `cloudinary.ts`에 `siteAsset()`/`uploadFolder()` 추가, `_bulletin-helpers.ts`의 `folderPath`를 `${ROOT}/uploads/bulletins/...`로 변경, `getCloudinaryUrl`에서 prefix 자동 합성. NewHere 등 하드코딩 제거.
2. **DB 마이그레이션** — `ALTER TABLE bulletin_images DROP COLUMN url` + `TRUNCATE bulletin_images, bulletins RESTART IDENTITY CASCADE`. dev 프로젝트(`mficogrxekuahjqborxw`)에 적용 후 `yarn generate:types`.
3. **코드 정리** — `BulletinImageInput.url` 필드 제거, `bulletin-service.ts`에서 url 저장 로직 제거. `LatestBulletin.tsx`/`bulletins/[id]/page.tsx` 등에서 `getCloudinaryUrl(img.cloudinary_id)` 통해 URL 복원.
4. **Cloudinary 정리** — MCP `delete-asset`로 `dnchurch-dev/bulletins/*` 자산 7개를 먼저 삭제(폴더가 비어야 `delete-folder`가 성공) → `delete-folder`로 legacy 루트 3개(`dnchurch`, `bulletins`, `bulletin`) 삭제. site/* 자산 보존.

**중간 빌드 가정**: step 2(컬럼 drop) 직후 step 3(코드 정리) 완료 전까지는 빌드가 깨질 수 있다. 이는 의도된 중간 상태이며, **검증(`verify-task.mjs`)은 step 3 완료 후 1회만** 실행한다. step 1-3 사이에 중간 commit·push 금지.

**헬퍼 반환 타입 (Codex 검토 반영)**:
- `siteAsset(relPath: string): string` — `public_id` form (`${ROOT}/site/${relPath}`). Next.js `<Image src>` + 커스텀 Cloudinary loader가 src를 public_id로 해석하므로 full URL 아님.
- `uploadFolder(domain: string, ...parts: string[]): string` — public_id form (`${ROOT}/uploads/${domain}/${parts.join('/')}`). 빈 segment·leading slash·중복 slash 거부.
- `getCloudinaryUrl(cloudinary_id: string): string` — full delivery URL. 입력값에서 leading `/`와 `${ROOT}/` 중복 prefix를 1회 방어적으로 strip한 뒤 합성.

**핵심 결정**: 환경 prefix는 DB에 저장하지 않고 코드에서 합성한다 (env 따라 자동 분기). 이는 Codex 권장(folder는 운영 편의, public_id는 delivery contract)과 일관 — 다만 우리는 신규 데이터에만 적용하고 기존은 truncate한다.

## 영향받는 파일

**코드**:
- `src/utils/cloudinary.ts` — `siteAsset()`, `uploadFolder()` 헬퍼 추가, `getCloudinaryUrl` prefix 합성
- `src/apis/cloudinary.ts` — `uploadImage` 호출부 정리 (선택)
- `src/actions/_bulletin-helpers.ts` — folderPath를 `${ROOT}/uploads/bulletins/...`로 변경, return에서 url 제거
- `src/actions/create-bulletin.action.ts` — url 필드 의존 제거
- `src/actions/update-bulletin.action.ts` — url 필드 의존 제거
- `src/services/bulletin/bulletin-service.ts` — url 컬럼 insert 제거
- `src/types/bulletin.ts` — `BulletinImageInput.url` 제거
- `src/types/database.types.ts` — `yarn generate:types`로 재생성
- `src/app/_component/home/NewHere.tsx` — `dnchurch-dev/site/home/sketch` → `siteAsset('home/sketch')`
- `src/app/(content)/news/bulletins/_component/LatestBulletin.tsx` — img.cloudinary_id로 URL 합성
- `src/app/(content)/news/bulletins/[id]/page.tsx` — 동일
- `src/app/(content)/news/bulletins/[id]/update/page.tsx` — 동일
- `src/components/file/ImagePreview.tsx` — cloudinaryId 사용처 검토

**DB**:
- `supabase/migrations/<timestamp>_drop_bulletin_images_url_and_truncate.sql`

**Cloudinary (MCP, 코드 외부)**:
- `delete-folder`: `dnchurch`, `bulletins`, `bulletin`
- `delete-asset` × 7: `dnchurch-dev/bulletins/...` 전체

## 단계별 체크리스트

- [x] 1. CODEX_PLAN_REVIEW 요청 (구조 변경 + DB schema + 다단계 → 필수 트리거) — PASS
- [x] 2. 코드 헬퍼 도입 + 동적 업로드 경로 변경 (4단계 step 1)
- [x] 3. DB 마이그레이션 작성 + dev 적용 + 타입 재생성 (Supabase MCP)
- [x] 4. 코드 url 의존 제거 + cloudinary_id 기반 URL 합성으로 통일
- [x] 5. CODEX_FIRST_PASS — 구현 diff 검증 (CHANGE_REQUEST → 2건 수정 적용 → FIX_APPLIED)
- [x] 6. Cloudinary MCP로 legacy 폴더·자산 정리 — 자산 8개 + 폴더 5개 삭제 (자세한 내역은 의사결정 로그)
- [ ] 7. `yarn dev`에서 홈/주보 페이지 회귀 확인 + 새 주보 업로드 smoke test (사용자 직접)
- [x] 8. `node scripts/verify-task.mjs cloudinary-asset-structure` 통과 (knip warning은 기존 부채)
- [x] 9. Claude 2차 검증 기록
- [x] 10. ADR 0007 작성 (Cloudinary 폴더 컨벤션) — Accepted
- [ ] 11. 사용자 승인 후 커밋 + PR (base: develop, label: refactor)

## 완료 기준 (DoD)

- [ ] `node scripts/verify-task.mjs cloudinary-asset-structure` 통과 (lint + lint:styles + build + knip)
- [ ] 사용자 승인 후 커밋
- [ ] 마이그레이션 적용 (`mficogrxekuahjqborxw` dev only)
- [ ] ADR 0007 작성 (Cloudinary asset 폴더 컨벤션)
- [ ] tech-debt-tracker.md 갱신 — 정적 자산 재배치(site/welcome → site/about/welcome 등) 후속 부채로 기록

## 참고 자료

- Codex 설계 검토 결과 (이 세션 내 codex:rescue 응답): `site/`+`uploads/` 분리, hero는 `hero.jpg`(언더스코어 X), per-row 폴더 유지, asset_folder만 정리·public_id는 보존
- [Cloudinary folder modes](https://cloudinary.com/documentation/folder_modes)
- [Cloudinary invalidate cached assets](https://cloudinary.com/documentation/invalidate_cached_media_assets_on_the_cdn)

## 의사결정 로그

- 2026-05-11: 정적 자산 폴더 재배치(site/welcome → site/about/welcome, hero co-location)는 본 PR에서 제외 — 코드 헬퍼 도입 후 점진 마이그레이션 (Codex 권장 반영)
- 2026-05-11: bulletin* 테이블은 truncate (시드 데이터 확인됨). in-place 자산 이동·UPDATE 회피
- 2026-05-11: 환경 prefix(`dnchurch-dev/`)는 DB 컬럼에서 제거하고 코드에서 합성. 새 cloudinary_id 패턴: `uploads/bulletins/{YYYY}/{MM}/{DD}/{filename}`
- 2026-05-11: hero 자산 컨벤션은 `<page>/hero.jpg` (Codex 권장 — `_hero.jpg` 언더스코어 prefix 채택 안 함)
- 2026-05-11: step 1~3은 단일 구현 단위, 중간 commit 금지. step 2(column drop) 직후 step 3 완료 전까지 빌드 깨짐 허용 (Codex 검토 반영)
- 2026-05-11: Cloudinary 정리 순서 = 자산 삭제 → 폴더 삭제 (빈 폴더만 delete-folder 성공)
- 2026-05-11: `getCloudinaryUrl`에 방어적 prefix strip 추가 (leading `/`, `${ROOT}/` 중복 1회) — truncate 후엔 발생할 수 없으나 helper 안전장치
- 2026-05-11: Cloudinary `delete-folder`가 자동 cascade 안 함이 확인됨 ("Folder is not empty" 에러). 자산을 먼저 모두 `delete-asset`으로 정리한 후 폴더 삭제. 단, 한 번 비워지면 하위 폴더는 cascade됨 (`{deleted: [2026, 2026/03, 2026/03/28, bulletins]}`)
- 2026-05-11: dev cloudinary 정리 결과 — 자산 8개 삭제 (`bulletin/...` 2 + `bulletins/...` 3 + `dnchurch-dev/bulletins/...` 3), 폴더 5개 삭제 (`dnchurch`, `bulletins` + 하위 2개, `dnchurch-dev/bulletins` + 하위 3개). `bulletin` (단수형)은 폴더 등록 안 된 상태 (자산 4개에 path만 박혀있던 형태)
- 2026-05-11: `dnchurch-dev/assets` 빈 폴더는 본 PR 범위 밖이라 보존 — tech-debt 후보
- 2026-05-11: smoke test 회귀 1건 수정 — `LatestBulletin.tsx:28`이 빈 `images`에서 `getCloudinaryUrl(undefined)` 호출하던 기존 버그가 truncate로 노출됨. `imageIds[0] ? getCloudinaryUrl(imageIds[0]) : undefined` guard 추가. `KakaoShareProps.imageUrl`은 optional이라 type-safe
- 2026-05-11: smoke test 회귀 2건 — 본 PR 회귀. `apis/cloudinary.ts:deleteImage`가 ROOT-relative `cloudinary_id`(DB 저장 형식)를 받지만 `cloudinary.uploader.destroy`는 fully-qualified public_id 요구 → 자산 삭제 실패 → orphan 발생. 호출부 4곳 (create 1, update 3) 그대로 두고 `deleteImage` 안에 `toFullyQualifiedPublicId()` 합성 추가 (apis 격리 위해 utils의 normalizePublicId 재사용 안 함, inline 작은 함수). ADR 0007의 "코드 헬퍼가 ROOT 합성" 원칙 그대로 적용 — 새 결정 아님
- 2026-05-11: 담임목사 사진 cloudinary 업로드 (`dnchurch-dev/site/about/pastor/portrait.png`) + `staff.image_url` 갱신. Console 업로드는 dynamic folder mode라 public_id가 파일명만으로 설정됨 → rename 1단계 필요 발견. 또한 rename 직후 자산은 default delivery format 라우팅 지연으로 확장자 명시 필수 → DB값에 `.png` 포함. 후속 부채(tech-debt-tracker): Console 업로드 자동 정정 방안 검토(upload preset `use_asset_folder_as_public_id_prefix`, admin UI 통일, webhook 자동 rename)
- 2026-05-11: pastor 페이지 career 섹션 PC/Mobile UI 통일 — PC 전용 `career_list_pc` 제거, mobile `career_card_mobile`을 `career_card`로 rename + profile_block 안으로 통합. ADR 0007과 별개 작업이지만 같은 PR에 포함 (cloudinary 사진 업로드 흐름과 함께 작업). primitive `$beige-100` → semantic `$bg-beige-subtle` 적용. CloudinaryImage `fill` 모드 동작 fix(`.photo`에 `position: relative` + `overflow: hidden` 추가, CloudinaryImage style override를 fill/non-fill 분기) 포함
- 2026-05-11: vision 페이지 교회 외관 이미지 cloudinary 업로드 (`dnchurch-dev/site/about/vision/exterior.jpg`) + `IMAGE_URL` 하드코딩 교체 (`'dnchurch_nxmttl'` → `'site/about/vision/exterior.jpg'`). 사용자가 console에서 처음부터 fully-qualified Public ID로 업로드 → rename 불필요 + 확장자 유무 무관하게 양쪽 200. portrait의 확장자 quirk는 rename된 자산 한정임을 확인. 후속 부채 우선순위 ↓ — Console 업로드 시 Public ID를 fully-qualified로 입력하는 운영 절차로 충분

## ADR 판단

- **필요 여부**: 필요
- **결정 링크**: [0007-cloudinary-asset-folder-convention.md](../../decisions/0007-cloudinary-asset-folder-convention.md)
- **사유**: ADR 0007은 다음 3가지를 **하나의 통합 결정**으로 다룬다 (Codex 검토 반영) — 모두 "Cloudinary delivery identifier를 어떻게 저장하고 조합할 것인가"라는 단일 계약:
  1. **폴더 구조 컨벤션**: `site/`(정적) + `uploads/{domain}/`(동적), hero는 페이지 폴더 안 `hero.jpg`
  2. **환경 prefix 합성 규칙**: DB는 prefix-free, 코드 헬퍼가 `${ROOT_FOLDER}/` 합성. `asset_folder`는 운영 편의·`public_id`는 delivery contract
  3. **정적/동적 분리 원칙**: 운영 주체(코드 참조 vs DB row 참조)에 따른 1차 축
  4. **범위 제한**: 본 ADR이 수립한 컨벤션의 prod 적용은 별도 후속 plan에서만 수행

## Codex 계획 검증

- **상태**: 완료
- **요청 시점**: 2026-05-11 (이 세션 내)
- **결론**: **PASS**
- **핵심 지적**:
  1. step 1~3은 하나의 구현 단위로 취급, 중간 commit·검증 금지 (step 2 직후 빌드 깨짐 허용)
  2. `getCloudinaryUrl`에 방어적 prefix strip 추가 (leading `/`, `${ROOT}/` 중복)
  3. `siteAsset()`는 full URL이 아닌 public_id form 반환 (loader가 src를 public_id로 해석)
  4. PR 분리 금지 — `cloudinary_id` 계약 변경 하나에 묶여 있어 분리 시 임시 호환 코드 부담 큼
  5. Success Criteria에 2개 추가: 새 cloudinary_id의 prefix 부재 + url 컬럼 참조 0건
  6. ADR 0007은 folder convention + prefix composition + static/dynamic separation을 단일 결정으로 통합
  7. Cloudinary cleanup 순서: 자산 삭제 → 폴더 삭제. helper 입력 규칙(빈 segment·중복 slash 거부) 명시
- **반영 내용**: 위 7건 모두 plan에 반영 — Success Criteria 9·10번 추가, 접근법에 step ordering·헬퍼 시그니처 명시, 의사결정 로그·ADR 판단·체크리스트 갱신

## Codex 1차 검증

- **상태**: 완료 (CHANGE_REQUEST 2건 → FIX_APPLIED)
- **요청 시점**: 2026-05-11 step 1~3 + ADR 작성 직후
- **결론**: **FIX_APPLIED** (Codex 결론은 CHANGE_REQUEST, 모두 수정 적용 후 self-resolved)
- **수정 파일**:
  - `src/utils/cloudinary.ts` — `normalizePublicId`에 `^https?://` guard 추가 (full URL pass-through)
  - `supabase/migrations/20260511000000_drop_bulletin_images_url.sql` — TRUNCATE 제거 + 파일명 rename (`_and_truncate` 제거)
  - `docs/research/2026-05-11-cloudinary-bulletin-cleanup.sql` — TRUNCATE를 one-off SQL로 분리 (replay 금지 명시)
  - `docs/decisions/0007-cloudinary-asset-folder-convention.md` — 본 PR이 실제로 만드는 폴더는 `uploads/bulletins/`만, 나머지는 첫 업로드 시 자동 생성될 미래 컨벤션임을 명확화
- **핵심 지적**:
  1. **BUG**: `normalizePublicId`가 full URL(`https://...`)을 받으면 `dnchurch-dev/https://...`로 망가질 수 있음 → URL guard로 pass-through
  2. **SAFETY**: versioned migration에 `TRUNCATE`가 포함되어 있어 다른 환경 replay 시 데이터 삭제 위험 → migration에서 분리, dev 일회성 작업으로 명시
  3. **NEEDS_VERIFY**: ADR 0007이 community 폴더를 "이번 PR에서 만들어진 것"처럼 서술하는지 확인 → "미래 컨벤션" 명시로 보강
- **남은 리스크**:
  - dev DB의 migration history는 옛 이름(`drop_bulletin_images_url_and_truncate`)으로 등록되어 있으나 파일명은 `drop_bulletin_images_url`. 같은 timestamp이므로 fresh apply에서 idempotent. 운영 영향 없음 (의사결정 로그에 기록)
  - Step 4 (Cloudinary 자산·legacy 폴더 삭제)는 MCP 토큰 만료로 보류. 코드는 self-consistent (truncate된 DB는 legacy 자산을 더 이상 참조 안 함). 사용자 재인증 후 진행 필요

## Claude 2차 검증

- **검토 내용**: Codex CHANGE_REQUEST 2건 적용 후 diff 재확인. URL guard(`^https?://` pass-through)가 `normalizePublicId` 진입점에 1회 적용되어 `siteAsset`/`uploadFolder`/`stripRootPrefix`/`getCloudinaryUrl`/`createCloudinaryLoader` 모두 보호. migration 파일 rename + TRUNCATE 분리 후에도 dev DB는 이미 적용된 상태(`bulletins`/`bulletin_images` rows=0)이므로 정합 유지. ADR 0007에 "본 PR이 만드는 폴더는 `uploads/bulletins/`만" 명시되어 community/sermons는 첫 업로드 시 자동 생성될 미래 컨벤션으로 분리됨.
- **실행한 검증**:
  - `yarn build` (URL guard fix 후 재실행) — pass
  - 시각적 diff 확인: `cloudinary.ts:10` URL guard 라인 진입 위치 정확. `migration` 파일 단일 진실 (column drop + RPC만 포함, TRUNCATE 없음)
  - `grep -rn "dnchurch-dev|dnchurch-prod" src/` → 0 hits 유지
  - `grep -rn "\.url\b" src/services/bulletin/ src/actions/*bulletin* src/types/bulletin.ts src/components/file/` → DB 컬럼 의존 0건 유지
- **최종 판단**: **PASS**. 코드는 self-consistent하며 dev DB와 동기화됨. Step 4(Cloudinary 자산·legacy 폴더 삭제)만 MCP 토큰 만료로 보류 — DB 참조가 truncate된 상태라 legacy 자산 정리는 비차단적 후속 작업. 사용자 재인증 후 진행 가능.

## 리뷰 (완료 직전)

- [ ] 셀프 리뷰: 이 PR을 처음 보는 사람도 EXEC_PLAN만으로 변경 의도를 이해할 수 있는가?
- [ ] **멀티 세션 리뷰** (권장): 같은 세션의 구현자는 무의식적 바이어스가 생긴다.
      별도 Claude 세션 또는 `codex:rescue`로 객관적 검토를 요청해 시선을 분리한다.

## 회고 (머지 후 작성, completed/로 이동 시)

- 잘된 것:
- 다음에 할 것:
- 발견된 부채 (→ tech-debt-tracker.md 옮길 것):
