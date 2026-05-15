# sermons-archive-feedback-pass-2

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 표현 변경 + helper 함수 1개 추가. 서비스/타입 변경 없음

## 목표

사용자 피드백 5건 반영: ① 사이드바 radio border 강조, ② 설교자 표기 단순화("OOO 담임목사" → "OOO 목사"), ③ PC ActiveFilterChips 제거, ④ 모바일 ActiveFilterChips + 정렬 select 제거 + filter icon에 active 필터 수 배지, ⑤ Grid 카드 preacher 라벨도 자동 단순화(formatPreacherLabel cascade).

## 검증된 Assumptions

- DB `preachers.title` 값(`mcp__claude_ai_Supabase__execute_sql`로 dev 프로젝트 조회): "담임목사"(1), "부목사"(1) — 둘 다 끝 "목사". 향후 "전도사", "강도사" 추가 가능성 — 끝 토큰 추출 매핑 방식 채택.
- 현 `formatPreacherLabel`(`utils/sermon.ts:67-72`)이 `${name} ${title}` 그대로 반환 → "김성규 담임목사" (길이 7자, 카드 grid 줄바꿈 발생). 끝 토큰 정규화 시 "김성규 목사" (5자) — 단일 라인 유지.
- `ActiveFilterChips.tsx`는 SermonToolbar에서만 사용. 다른 caller 0 — 안전 삭제.
- 모바일 sort_select은 BottomSheet 정렬 섹션과 중복(AdvancedFilterSheet의 sort 옵션). 단 SermonResultHeader 결과 카운트는 그대로 유지.
- 모바일 ToolbarFilterButton은 `.filter_btn .filter_label` span에 `@include blind` 적용 — IoFunnelOutline 아이콘만 노출. **`.filter_btn span` selector가 모든 자식 span 매칭하던 기존 패턴**은 신규 `.filter_badge`도 hide시키는 버그 — 명시 클래스(`.filter_label`)로 selector scope 좁힘.
- `$border-strong` (`rgba($gray-500, 0.44)`, `_color.scss:89`)이 사이드바 카드 white 배경 위에서 radio outline 대비 충분.
- `useSermonFilter`에 `activeFilterCount` getter 추가 — sort 'oldest'면 1, q.trim() 시 1 등 합산.

## Non-goals

- DB `preachers.title` 컬럼 변경 — UI 표시만 정규화
- SermonResultHeader 자체 제거 — "총/결과 N개 설교"는 PC + 모바일 모두 유지
- 다른 페이지 sort UI 변경
- 새 직분(전도사·강도사) DB 도입 — `formatPreacherTitle` 매핑만 미리 제공

## Success Criteria

1. `formatPreacherTitle(title)` helper: "담임목사"/"부목사" → "목사", "전도사"로 끝남 → "전도사", "강도사"로 끝남 → "강도사", 기타 → 원문.
2. `formatPreacherLabel` 반환이 "OOO 목사"/"OOO 전도사" 형식. SermonSidebar/AdvancedFilterSheet 설교자 옵션 + 모든 GridCard/SermonCard/SermonFeatured/SermonDetailPage 등에서 일괄 cascade.
3. SermonSidebar 설교자 옵션이 `formatPreacherLabel(preacher)` 사용 (기존 `preacher.name` only → "OOO 목사").
4. PC + 모바일 모두 ActiveFilterChips 미노출 — 컴포넌트 + 호출 + dead SCSS 제거.
5. SermonResultHeader sort_select은 `display: none` + `respond-up($breakpoint-pc-sm) { display: inline-block }` — 모바일 비표시.
6. ToolbarFilterButton의 IoFunnelOutline 옆에 `activeFilterCount > 0` 시 숫자 배지(`.filter_badge`) 노출. `$primary` bg + `$txt-inverse` text. aria-label에 "(N개 적용됨)" 포함.
7. 사이드바 radio 비활성 border `$border-card` → `$border-strong` (강한 대비).
8. `.filter_btn` selector 정정: `.filter_btn span` → `.filter_btn .filter_label` (배지 차단 방지).
9. GridCard meta 날짜 `YYYY.MM.DD` → `YY.MM.DD` (예: `2026.04.04` → `26.04.04`) — preacher 단축에 더해 날짜도 축약, 좁은 카드 우측 영역 줄바꿈 추가 방지.
10. `node scripts/verify-task.mjs sermons-archive-feedback-pass-2` PASS.

## 영향받는 파일

- `src/utils/sermon.ts` — `formatPreacherTitle` 신규 + `formatPreacherLabel` 사용
- `src/hooks/useSermonFilter.ts` — `activeFilterCount` 계산 + return 추가
- `src/app/(content)/sermons/_component/SermonListPage/SermonSidebar.tsx` — `formatPreacherLabel(preacher)` 적용
- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx` — `formatPreacherLabel(item)` 적용
- `src/app/(content)/sermons/_component/SermonListPage/SermonToolbar.tsx` — `<ActiveFilterChips>` 호출 제거 + import 제거
- `src/app/(content)/sermons/_component/SermonListPage/ToolbarFilterButton.tsx` — `useSermonFilter` 호출 + `.filter_label` span 클래스 + `.filter_badge` 조건부 + aria-label 강화
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — `.radio` border `$border-strong`, `.sort_select { display: none; PC inline-block }`, `.filter_btn { position: relative }` + `.filter_badge` 신규 + `span` selector → `.filter_label`, `.active_filters`/`.clear_all` dead 제거
- **삭제**: `src/app/(content)/sermons/_component/SermonListPage/ActiveFilterChips.tsx`

## 의사결정 로그

- **D1 — 끝 토큰 매핑 방식**. enum/whitelist 대신 `endsWith` 매핑. 한국 교회 직분이 "담임목사/부목사/협동목사/원로목사/전임전도사/교육전도사/강도사" 등 prefix 변화 + 끝 직분 고정 패턴이라 가장 견고. 매핑 안 되는 신규 직분은 원문 fallback (확장성).
- **D2 — ActiveFilterChips 완전 제거(PC + 모바일)**. 사용자 명시 결정. 사이드바·BottomSheet active option + filter_badge가 active 필터 상태 충분히 노출.
- **D3 — sort_select 모바일 미노출 + 결과 헤더는 유지**. mobile은 BottomSheet sort 섹션이 단일 진입점. 결과 카운트(`총 N개 설교`)는 mobile에서도 UX 가치(빈 상태/페이지 정보 포함).
- **D4 — filter_badge는 inline (absolute corner 아님)**. 버튼 안 텍스트/아이콘 다음 inline-flex. 모바일에서는 텍스트(`.filter_label`) blind 되어 아이콘 + 배지만 노출.
- **D5 — `.filter_label` 명시 클래스로 selector 좁힘**. 기존 `.filter_btn span`은 자식 모든 span 매치 — `.filter_badge`도 blind 적용되어 모바일에서 안 보이는 버그. 명시 클래스로 scope 분리.
- **D6 — sort cascade는 `setFilter` 패치 + filter_badge 카운트 모두에 sort 명시 반영**. `sort !== 'recent'`일 때 1로 카운트. 사용자에게 정렬 변경도 active 상태로 인식.
- **D7 — 사용자 직접 SCSS 조정 2줄 포함**. 작업 중 사용자가 IDE에서 `.sidebar width: 28rem → 26rem`(좁힘) + `.sidebar_section gap: $spacing-4 → $spacing-12`(섹션 간격 확대)를 직접 수정. 본 task와 같은 사이드바 UX 개선 맥락이라 같은 commit에 포함. revert 대상 아님(사용자 의도).

## ADR 판단

- **불필요** — UI 표현 + helper 함수 추가 + hook 1 getter. 서비스/캐시/라이브러리/레이어 경계 변경 없음.

## Verification

- `node scripts/verify-task.mjs sermons-archive-feedback-pass-2`
- `yarn dev` → `/sermons/all` 진입 시:
  - 사이드바 설교자 옵션 "OOO 목사" 표기. radio 비활성 outline 시각적으로 명확
  - GridCard meta에 "OOO 목사" 단일 라인(줄바꿈 없음)
  - PC: ActiveFilterChips 미노출, sort dropdown 결과 헤더 우측 노출
  - 모바일: ActiveFilterChips/sort dropdown 미노출, 필터 적용 시 ToolbarFilterButton 아이콘 옆 숫자 배지
- `node scripts/harness-gate.mjs sermons-archive-feedback-pass-2` (커밋 전)

---

## Codex 계획 검증

- **결론**: 미요청 (사용자 명시 5건 결정 + 외과적 변경 작은 범위, 계획 검증 생략)

## Codex 1차 검증

- **결론**: CHANGE_REQUEST(scope 밖 SCSS 2줄) → D7 명시로 해소 → PASS

### Verbatim 요약

> A-G 모두 OK — formatPreacherTitle null guard, series='none' 카운트 일관, .filter_label PC unblind 변경 확인, .filter_badge specificity 충돌 없음, sort_select mobile/PC 구조, YY.MM.DD dayjs 정상, ActiveFilterChips 잔여 참조 0
> H 주의 — plan 추적 안 되는 SCSS 2줄: `.sidebar width 28→26rem`, `.sidebar_section gap $spacing-4→$spacing-12`. 외과적 변경 원칙상 의도면 scope 명시, 아니면 되돌림
> 최종 CHANGE_REQUEST — 기능·타입 버그 0, scope 밖 2줄만

**평이 풀이**: 6 피드백 기능 모두 정상. 단 사용자가 IDE에서 직접 조정한 사이드바 폭·섹션 gap 2줄이 plan에 없어 Codex가 외과적 위반으로 플래그. 실제로는 사용자 의도 변경(revert 불가) — D7로 scope 명시 처리.

### 반영

- D7 의사결정 로그 추가 — 사용자 직접 SCSS 조정(`.sidebar width 26rem`, `.sidebar_section gap $spacing-12`)을 같은 사이드바 UX 맥락으로 본 commit 포함. Codex H 지적은 scope 명시로 해소 → 실질 PASS.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 기능 체크 A-G 전부 OK, 직접 수정 0건. H는 사용자 IDE 변경(system-reminder "Don't revert it" 명시) — D7로 scope 흡수.
- verify-task PASS (`logs/sermons-archive-feedback-pass-2/20260515-170338/`).
- 외과적 변경: plan 영향 파일 매핑 일치 + 사용자 직접 SCSS 2줄은 D7로 명시 추적. ActiveFilterChips 삭제는 본 task가 만든 dead(caller 동시 제거).
- formatPreacherTitle endsWith 순서(전도사→목사→강도사)는 상호 배타라 순서 무관 — "부목사" → '목사', "전임전도사" → '전도사' 정상.
