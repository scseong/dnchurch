# sermons-archive-mode-cleanup

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — 상수 1개 rename + 타입 1 필드 제거 + UI 카드 레이아웃 변경. 아키텍처·캐시·라이브러리 변경 없음

## 목표

`/sermons/all`의 archive 모드(필터 없음)에서 "최근 말씀" 섹션 제거 + GridCard를 mockup `SermonGridCard`(`ChurchSermonAll.jsx:542-592`) 가로 레이아웃으로 재구성. 이 페이지의 책임을 "검색·필터 탐색"으로 좁히고, 정보(제목·성경·설교자·날짜)가 시선 가로 흐름에서 즉시 파악되도록.

## 검증된 Assumptions

- archive 모드 진입점: `all/page.tsx:50-63` `hasFilter ? getFilteredSermons : getSermonArchiveList()`. archive 결과는 `SermonArchive` 컴포넌트로 렌더.
- 현 `SermonArchive.tsx:11-40` 구조: featured(SermonCard) + recentSermons(GridCard × 11) + SermonYearGrid. 사용자 메시지 "이전 /sermons에서 최신 설교 섹션 있음 — 중복" → recent만 제거 의도. featured/YearGrid는 유지.
- `ARCHIVE_RECENT_COUNT = 12` (`services/sermon/index.ts:11`)는 featured 1 + recent 11 의도. recent 제거 후 1로 축소.
- `SermonArchiveView` 타입(`types/sermon.ts:57-61`)에 `recentSermons` 필드. 제거 + `buildSermonArchive`(`utils/sermon.ts`) rest 미산출.
- GridCard 사용처: 본 task에서 SermonArchive(제거) + SermonFilteredList(유지). 다른 도메인 import 0건(`rg "import.*GridCard"`).
- mockup `SermonGridCard:542-592` 패턴: grid `130px 1fr` + 좌측 16/9 썸네일(play indicator + 우하 duration) + 우측 title(14px semibold, 2 line clamp) → scripture(12px primary semibold) → meta(11px tertiary preacher · date).

## Non-goals

- featured/SermonYearGrid 제거 — 사용자 미언급, recent만 명시
- SermonFilteredList 자체 변경 — 카드만 교체로 영향
- 모바일 단일 컬럼 → 가로 카드 그대로(`SermonFilteredList grid mobile 1fr → tablet 2fr`)
- featured 카드(SermonCard) 디자인 변경
- archive 모드 자체 제거 — 단일 모드 통합은 별도 결정

## Success Criteria

1. `/sermons/all` 필터 없이 진입 시 "최근 말씀" 섹션 미렌더. featured(1편) + SermonYearGrid만 노출.
2. `getSermonArchiveList()` 호출이 `pageSize: 1`로 변경, 11편 dead fetch 제거.
3. `SermonArchiveView` 타입에 `recentSermons` 필드 없음. `buildSermonArchive`도 미산출.
4. GridCard 레이아웃: grid `13rem 1fr` + 좌측 썸네일 + 우측 정보. title/scripture/preacher·date 순서 가로 흐름.
5. 카드 스타일: `$bg-card` + `$border-card` 1px + `$radius-s` + `$padding-card`. 토큰만, primitive 직접 사용 0건.
6. `node scripts/verify-task.mjs sermons-archive-mode-cleanup` PASS.

## 영향받는 파일

- `src/types/sermon.ts` — `SermonArchiveView`에서 `recentSermons` 필드 제거
- `src/utils/sermon.ts` — `buildSermonArchive`에서 rest 산출 제거
- `src/services/sermon/index.ts` — `ARCHIVE_RECENT_COUNT` → `ARCHIVE_FEATURED_COUNT = 1` rename + comment
- `src/app/(content)/sermons/_component/SermonListPage/SermonArchive.tsx` — recent 섹션 제거 + GridCard import 제거
- `src/app/(content)/sermons/_component/GridCard/GridCard.tsx` — 가로 레이아웃으로 재구성 (title·scripture·meta 순), series chip 제거
- `src/app/(content)/sermons/_component/GridCard/GridCard.module.scss` — `.card` grid layout + `.thumb` 비율 + .play_btn, .duration, .title(line-clamp 2), .scripture, .meta 재정의

## ADR 판단

- **불필요** — `services/sermon/index.ts`는 `ADR_TRIGGER_PARTS` 포함이지만 본 변경은 ① 상수 rename + 값 1로 축소(`12 → 1`), ② 호출 시 `pageSize` arg 변경뿐. 새 함수·캐시 정책·라이브러리·인증·레이어 경계 변경 없음. 사용자 명시 결정(archive 모드 책임 좁히기) 기반.

## 의사결정 로그

- **D1 — recent 섹션만 제거, featured/YearGrid 유지**. 사용자 메시지 "recent sermon 섹션은 필요 없을 것 같아" — featured/YearGrid 미언급. 외과적 변경 원칙으로 명시 사항만 처리.
- **D2 — GridCard horizontal 레이아웃 + series chip 제거**. mockup `SermonGridCard:542-592`에 series 표시 없음. scripture만 강조(primary 색). 사용자 의도(정보 즉시 파악) + mockup 충실도.
- **D3 — 모바일도 가로 카드 유지**. 130px 썸네일(`$thumb-width: 13rem`)이 모바일에서도 충분히 작음. 텍스트 영역 확보 + 일관성. media query 분기 없이 단일 디자인.

## Verification

- `node scripts/verify-task.mjs sermons-archive-mode-cleanup`
- `yarn dev` → `/sermons/all` 필터 없이 진입 → "최근 말씀" 섹션 미노출, featured + YearGrid만
- 필터 활성(예: `/sermons/all?series=<slug>`) → GridCard 가로 레이아웃 확인
- 카드 hover lift + 썸네일 scale 보존
- `node scripts/harness-gate.mjs sermons-archive-mode-cleanup` (커밋 전)

---

## Codex 계획 검증

- **결론**: 미요청 (사용자 명시 결정 + 단순 외과적 변경, 계획 검증 생략)

## Codex 1차 검증

- **결론**: CHANGE_REQUEST → 2건 반영 → PASS

### Verbatim 요약

> 7 항목 검증:
> 1-4 PASS — recentSermons grep 0, type 정리, ARCHIVE_FEATURED_COUNT, buildSermonArchive 반환 모두 적합
> 5 FAIL — GridCard.module.scss:75 duration `rgba(0,0,0,0.7)` raw color, semantic 토큰 대체 필요
> 6 FAIL — GridCard.tsx:42 duration <span> aria-hidden 누락(play_btn은 있음)
> 7 WARN — 375px viewport에서 13rem thumb + padding으로 텍스트 영역 90-135px, 권장 ~150px 미달(실기기 확인 권장)
> WARN 추가 — beige placeholder 위 $accent play icon 대비 약할 가능성(실시각 확인)

**평이 풀이**: ① rgba duration overlay는 styles SKILL의 rgba 예외에 해당하지만 local var로 의도 명시 권장. ② duration aria-hidden 부여 + aria-label에 duration 통합으로 정보 보존.

**반영**:
1. GridCard.module.scss 상단에 local var `$duration-overlay-bg/$play-overlay-bg/$play-overlay-border` 정의 + 모든 raw rgba 교체
2. GridCard.tsx duration `<span>`에 `aria-hidden="true"` + aria-label에 duration 통합 (`, ${duration}`)

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 수정 1: SCSS local var 3개 추가 + 4 raw rgba 위치 모두 var 참조로 교체 (line 5-8, .play_btn bg/border, .duration bg). 의도 명확화.
- Codex 수정 2: duration aria-hidden 부여 + Link aria-label에 duration concat — sr 사용자에게 정보 보존(중복 안 됨, aria-hidden로 visual span 무시 후 aria-label로 단일 announce).
- verify-task 2회 PASS (전 후 logs `20260515-154042/` + `20260515-155540/`).
- 외과적 변경: 6 파일 plan 매핑. WARN 2건은 실기기 확인 사항(blocker 아님) — placeholder play icon 대비는 실 데이터에 따라 평가.
