# sermons-archive-sidebar-radio

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 표현 변경 + utils dead 함수 정리. 서비스/타입 변경 없음

## 목표

`/sermons/all` 사이드바 시리즈 섹션에서 연도(year) 그룹 헤딩 제거 — 단순 시리즈 나열로 시각 구분 명확화. 동시에 active option 표기를 좌측 4px dot에서 mockup `RadioOption`(`ChurchSermonAll.jsx:1364-1395`)의 13px radio circle + 내부 4px white dot 패턴으로 교체. 선택/비선택 상태가 둘 다 명시적 — 클릭 가능 옵션임을 시각 신호.

## 검증된 Assumptions

- 사용자 결정: "연도가 있으니 시리즈 구분이 잘 안돼. 연도를 삭제하고 시리즈를 단순 나열" + "active 되었을 때 dot이 아니라 mockup을 참고해서 동일한 UI".
- mockup `RadioOption:1364-1395` 패턴: button + flex row + 좌측 radio circle(13px border 1.5px, 활성 시 primary bg + 내부 4px white dot) + label + 우측 count.
- 현 `SermonSidebar.tsx`의 `SeriesYearGroup` 컴포넌트 + `getSeriesByYearEntries`(`utils/sermon.ts:46`) 사용 — year 그룹 제거 시 두 헬퍼(`groupSeriesByYear`, `getSeriesByYearEntries`) dead.
- `SermonSeries.year` DB 필드는 그대로 보존(다른 표시 컨텍스트 가능성). 본 task는 UI에서만 무시.
- `option_list` SCSS의 nested `ul` selector도 dead(year sub-list가 더 없음).
- mockup radio border 색 `#D5D1C8`(beige) → dnchurch `$border-card` (beige-200) 매핑. cool primary 활성 색은 `$primary` + 내부 dot `$txt-inverse`.

## Non-goals

- DB `sermon_series.year` 컬럼 변경 — UI 표시만 무시
- 다른 페이지(시리즈 페이지, admin)의 year 사용 변경
- `SermonSeries` 타입 변경
- 사이드바 설교자 섹션 변경(이미 단순 나열)

## Success Criteria

1. PC 사이드바 시리즈 섹션에 연도 헤딩(`{year}년`, `미분류`) 미렌더. "전체" → "단독 설교" → 시리즈 1 → 시리즈 2 → ... 단일 ul 순차.
2. 옵션마다 좌측 13px radio circle:
   - 비활성: `$border-card` 1.5px border + transparent bg
   - 활성: `$primary` 1.5px border + `$primary` bg + 내부 4px `$txt-inverse` dot
3. label은 `.option_label` ellipsis nowrap. 우측 count 기존 그대로.
4. `getSeriesByYearEntries`, `groupSeriesByYear`, `SermonSeries` import 제거(utils/sermon.ts).
5. SCSS dead 클래스 제거(`.sidebar_group`, `.sidebar_year`, `.dot`, `.option_list ul`).
6. `node scripts/verify-task.mjs sermons-archive-sidebar-radio` PASS.

## 영향받는 파일

- `src/app/(content)/sermons/_component/SermonListPage/SermonSidebar.tsx` — `SeriesYearGroup` 컴포넌트 제거 + 단순 nav>ul>li.map. FilterItem children에 radio span + option_label span.
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.dot`/`.sidebar_group`/`.sidebar_year`/option_list nested `ul` 제거. `.radio`/`.radio_active`/`.radio_dot`/`.option_label` 신규.
- `src/utils/sermon.ts` — `groupSeriesByYear`, `getSeriesByYearEntries` 삭제 + 미사용 `SermonSeries` import 정리.

## 의사결정 로그

- **D1 — year 그룹 헤딩 미노출**. 사용자 명시 결정. DB 컬럼은 보존(다른 컨텍스트 사용 가능성). 사이드바 시리즈는 시각 구분(년/년) 노이즈가 진짜 navigation 의도(시리즈 선택)를 가림.
- **D2 — mockup RadioOption 패턴 채택**. 좌측 13px radio circle은 비활성 상태에서도 "선택 가능"한 시각 신호 제공. 기존 dot(활성 시만) 표시보다 affordance 명확.
- **D3 — `$border-card` 비활성 radio border**. mockup `#D5D1C8` (beige tone) ≈ `$border-card` (beige-200). 사이드바 카드 white 배경 위에서 부드러운 대비. `$border-primary` (gray-300)는 더 차가운 톤 — warm 카드와 충돌.

## ADR 판단

- **불필요** — UI 표현만 변경 + 본 변경이 만든 dead 헬퍼 함수 2개 정리. 서비스/타입/캐시/라이브러리/레이어 경계 변경 없음.

## Verification

- `node scripts/verify-task.mjs sermons-archive-sidebar-radio`
- `yarn dev` → `/sermons/all` PC 진입 시 사이드바 시리즈 섹션 연도 헤딩 미노출 + 단순 나열
- 옵션 hover 시 `$bg-hover` bg, 활성 시 `$primary-subtle` bg + `$primary` text + radio circle 채워짐
- 비활성 옵션의 radio circle은 outline만(transparent inside)

---

## Codex 계획 검증

- **결론**: 미요청 (사용자 명시 결정 + UI 작은 변경, 계획 검증 생략)

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> 9 체크 항목 모두 OK:
> 1 import/null guard 없음 2 외과적 3-file diff plan 매핑 3 semantic 토큰만(`$border-card`/`$primary`/`$txt-inverse`/`$radius-circle`), 1.5px border 예외 허용 4 radio aria-hidden + ListItem aria-current 자동 5 ListItem.module.scss `.body` inline-flex라 radio+label 가로 배치 충돌 0 6 `SermonSeries year:number|null` generated type 보존, dead 함수 호출부 0 7 1.5px sub-pixel border 허용 8 radio-size 1.3rem/dot 0.4rem 의도 일치 9 수정 이슈 없음
>
> 직접 수정 0건. 최종 PASS.

**평이 풀이**: ListItem의 `.body` inline-flex와 radio+label span 배치 호환 확인, semantic 토큰 일관성, a11y attrs, SermonSeries 타입 보존 모두 OK.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 없음 — diff 변경 없음.
- verify-task 2회 PASS (`logs/sermons-archive-sidebar-radio/20260515-164108/` + plan 작성 후 ESLint·stylelint·build 통과).
- 외과적 변경: 3 파일 plan 매핑. dead 함수 `groupSeriesByYear` + `getSeriesByYearEntries`는 본 task에서 만든 dead라 삭제 정당(CLAUDE.md "내 변경이 만든 unused만 제거").
- DB `SermonSeries.year` 컬럼 보존 — 메인 페이지/admin 영향 0.
