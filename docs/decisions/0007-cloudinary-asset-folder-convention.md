# 0007 — cloudinary asset folder convention

- **Status**: Accepted
- **Date**: 2026-05-11
- **Deciders**: scseong
- **Tags**: cloudinary, asset-management, env-separation

## Context

dnchurch는 모든 이미지·미디어를 Cloudinary로 서빙하지만, 폴더 구조·환경 분리·DB 참조 방식에 다음 문제가 누적되어 있었음:

1. **정적/동적 자산이 같은 prefix에 혼재** — `dnchurch-dev/site/`(코드 참조 정적)와 `dnchurch-dev/bulletins/`(DB row 동적)가 평행. 운영 주체·생명주기가 다른 자산이 같은 레벨에 섞여 신규 페이지·신규 도메인 추가 시 어디에 둘지 매번 판단 필요.
2. **환경 prefix가 DB에 박혀 있음** — `bulletin_images.cloudinary_id`에 `dnchurch-dev/bulletins/...` 형태로 저장. dev DB row를 prod에 dump-restore 시 cloudinary 경로가 dev를 가리켜 broken. 의도한 dev/prod 분리가 데이터 레이어에서 깨짐.
3. **정적 자산 경로가 코드에 하드코딩** — `NewHere.tsx`에 `src="dnchurch-dev/site/home/sketch"` 직접 박힘. 동적 업로드는 `NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER` env로 분리되는데 정적은 안 됨.
4. **legacy 루트 폴더 3개** (`bulletins/`, `bulletin/`, `dnchurch/`) — 초기 테스트 잔존. dev DB row 11개 중 6개가 이 legacy 폴더를 참조 중이라 단순 삭제 시 broken image.
5. **`bulletin_images.url` 컬럼 redundant 저장** — `cloudinary_id`만으로 URL 재생성 가능한데 두 값을 동시 저장. 한쪽만 갱신하면 정합성 깨짐.

결정 안 하면: 신규 페이지·신규 도메인 추가 시 폴더 위치·prefix 처리·DB 참조 형식이 매번 ad-hoc하게 결정되어 컨벤션 분산. prod 환경 분리 미완성 상태로 누적.

Codex 검토(2026-05-11): static/dynamic 1차 분리·`asset_folder`는 운영 편의·`public_id`는 delivery contract·hero는 페이지 폴더 내부 권장.

## Decision

세 가지를 **하나의 통합 계약**으로 결정한다 — 모두 "Cloudinary delivery identifier를 어떻게 저장하고 조합할 것인가"라는 단일 질문에 대한 답:

### 1. 폴더 구조 (asset_folder)

```
dnchurch-{env}/                  ← env prefix는 운영 편의 (Cloudinary Console 분리만 담당)
├── site/                        ← 정적: 코드에서 직접 참조, 관리자 수동 업로드
│   ├── home/
│   ├── about/
│   │   ├── hero.jpg             ← 페이지 hero는 페이지 폴더 안에 직접 (`hero.jpg`)
│   │   ├── welcome/
│   │   ├── worship/
│   │   ├── vision/
│   │   ├── location/
│   │   ├── pastor/
│   │   └── serving-people/
│   ├── fellowship/
│   ├── next-gen/{elementary,kindergarten,young-adult,youth}/
│   └── shared/                  ← 로고, og-image, favicon 등 페이지 횡단 자산
│
└── uploads/                     ← 동적: DB row가 참조, 관리자/사용자 업로드
    ├── bulletins/{YYYY}/{MM}/{DD}/
    ├── sermons/{YYYY}/{MM}/
    ├── gallery/{YYYY}/{MM}/
    ├── notices/{notice-id}/
    └── community/{prayer,sharing,groups}/{post-id}/
```

**원칙**:
- **1차 축 = 정적/동적** (운영 주체가 다름 — 코드 참조 vs DB row 참조)
- **정적 = 라우트 트리 미러링** (페이지 path == 폴더 path. 페이지 추가 = 같은 이름의 폴더)
- **동적 = DB 도메인 미러링** (테이블 단위 폴더, 날짜 또는 row id로 하위 분기)
- **hero는 페이지 폴더 내부** (`<page>/hero.jpg`. `_hero.jpg` 언더스코어 prefix·별도 `hero/` 폴더 모두 채택 안 함)
- **재사용 정적 자산은 `site/shared/`** (로고·og-image 등 여러 페이지에서 사용)

### 2. 환경 prefix 합성 규칙 (delivery identifier)

| 위치 | 저장 형식 | 예 |
|---|---|---|
| **Cloudinary `public_id`** (실제 자산) | env prefix 포함 fully qualified | `dnchurch-dev/uploads/bulletins/2026/03/28/주보_001` |
| **DB `cloudinary_id`** | env prefix 제거된 ROOT-relative | `uploads/bulletins/2026/03/28/주보_001` |
| **코드 helper 합성 결과** | 호출 컨텍스트에 따라 합성/분해 | — |

**핵심**: `asset_folder`는 운영 편의 도구(Cloudinary Console 탐색·필터)이고, `public_id`는 delivery contract(URL 안정성). 환경 prefix는 코드에서 합성하여 DB는 환경 독립.

**헬퍼 계약** (`src/utils/cloudinary.ts`):
- `siteAsset(relPath)` → `${ROOT}/site/${relPath}` — 정적 자산용 fully qualified public_id 반환
- `uploadFolder(domain, ...parts)` → `${ROOT}/uploads/${domain}/${parts.join('/')}` — 동적 업로드 folder path
- `stripRootPrefix(publicId)` → ROOT 제거 — 업로드 응답을 DB에 저장할 때
- `getCloudinaryUrl(publicId)`·`createCloudinaryLoader` → 입력값에 ROOT가 누락이면 자동 합성, 이미 있으면 그대로 (`normalizePublicId` 방어 로직)
- 모든 헬퍼는 빈 segment·중복 slash·leading slash를 거부

### 3. 마이그레이션·범위 정책

- **새 데이터부터 컨벤션 적용** — `public_id` 자체 rename은 URL 계약·CDN 캐시·DB 동시 변경 위험. 기존 데이터는 truncate(시드일 때) 또는 점진 정리(운영 데이터일 때)
- **본 PR이 실제로 만드는 폴더는 `dnchurch-dev/uploads/bulletins/...`만** — `uploads/sermons/`, `uploads/gallery/`, `uploads/notices/`, `uploads/community/*`는 **첫 업로드 시점에 자동 생성될 미래 컨벤션**. 본 PR에서 폴더만 미리 만들지 않음
- **prod 적용은 별도 plan** — 본 ADR이 정한 컨벤션을 prod에 적용하려면 운영 데이터 마이그레이션 plan 필요. 본 PR은 dev only
- **정적 자산 재배치는 후속 PR** — `site/welcome/` → `site/about/welcome/`, `site/hero/about` → `site/about/hero` 같은 기존 자산 이동은 코드 헬퍼 도입 후 점진적으로
- **다른 5개 `*_url` 컬럼 (notices/sermons/staff/preachers/sermon_series)** — 실제 cloudinary 자산이 아님 (YouTube 썸네일·Next.js public/·PDF 파일명)이므로 본 ADR 범위 밖. 향후 cloudinary로 이관 시 본 컨벤션 따름

## Alternatives Considered

| 대안 | 기각 사유 |
|---|---|
| **prefix를 DB에 그대로 저장** (현 상태 유지) | dev/prod 환경 분리가 데이터 레이어에서 깨짐. dump-restore·migration·새 환경 추가 시 매번 경로 변환 필요 |
| **flat 폴더 + Cloudinary tags로 분류** | 5-10 페이지 규모에는 과한 메타데이터. 폴더 탐색이 우선 (Codex 권장) |
| **hero를 별도 `hero/` 폴더에 분리** | 페이지 단위로 자산이 모이지 않음. 페이지 이동/삭제 시 자산 위치도 따로 관리 필요 |
| **`_hero.jpg` 언더스코어 prefix** | "숨김/내부 파일" 의미가 강하고 Cloudinary Media Library에서 시각적 이점 없음 (Codex 검토 반영) |
| **PR 분리** (코드 / DB / Cloudinary 정리 각각) | `cloudinary_id` 계약 변경 하나에 묶여 있어 분리 시 임시 호환 코드 부담 (Codex 검토 반영) |
| **community를 날짜로 partition** (`community/prayer/{YYYY}/{MM}/`) | per-row 폴더가 row 생명주기와 일치. 삭제·감사·소유 추적 우선 (Codex 권장) |

## Consequences

**좋아지는 것**:
- 신규 페이지·신규 도메인 추가 시 폴더 위치 결정이 1줄 규칙 ("정적이면 site/<page>/, 동적이면 uploads/<domain>/")
- DB가 환경 독립 — dev↔prod 데이터 이동 시 cloudinary 경로 변환 불필요
- `public_id` URL 안정성 보장 (운영 정리는 `asset_folder`만 만지므로 기존 URL이 깨지지 않음)
- 코드에서 `dnchurch-dev/` 같은 환경 prefix 하드코딩 0건 보장

**부담**:
- `siteAsset()`·`uploadFolder()` 헬퍼 호출을 잊으면 broken image (단, `normalizePublicId` 방어로 일부 자동 복구). lint·코드 리뷰에서 catch 필요
- 정적 자산 재배치 후속 작업이 별도 PR로 남음 (점진적 정리 부담)
- prod 환경 적용 plan 별도 필요

**다음 작업**:
- 정적 자산 재배치 PR (`site/welcome/` → `site/about/welcome/`, hero co-location)
- prod cloudinary 마이그레이션 plan (운영 데이터 보존 전략·downtime 평가)

## Verification

- 본 PR exec-plan: `docs/exec-plans/active/2026-05-11-cloudinary-asset-structure.md`
- `grep -rn "dnchurch-dev" src/` → 0 hits
- `getCloudinaryUrl(prefix-free path)` 호출 시 ROOT 자동 합성됨 (`normalizePublicId`)
- Cloudinary MCP `search-folders`로 신 컨벤션 폴더만 존재하는지 확인 (legacy 0건)

## References

- [Cloudinary folder modes](https://cloudinary.com/documentation/folder_modes)
- [Cloudinary invalidate cached assets](https://cloudinary.com/documentation/invalidate_cached_media_assets_on_the_cdn)
- Codex 설계 검토: 본 PR 진행 중 codex:rescue 응답 (PASS, 7건 피드백 반영)
- ADR [0001 — codex orchestration strategy](0001-codex-orchestration-strategy.md) — Codex 위임 트리거 (설계 판단)
