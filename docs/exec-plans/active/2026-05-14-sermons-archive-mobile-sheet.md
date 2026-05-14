# sermons-archive-mobile-sheet

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 컴포넌트 책임 확장(설교자 → 시리즈+설교자+정렬). 서비스/타입 변경 없음

## 목표

모바일에서 `ToolbarFilterButton`이 여는 BottomSheet를 mockup `FilterBottomSheet`(`ChurchSermonAll.jsx:1774-1851`) 형태로 확장 — 시리즈·설교자·정렬 통합 + "초기화" + 즉시 갱신. 현재는 설교자만 처리(staged + 적용 버튼). 모바일 사용자가 PC 사이드바와 동등한 필터·정렬 진입을 한 곳에서 수행하도록.

## 검증된 Assumptions

- 현 `AdvancedFilterSheet.tsx:19-81`은 설교자 단일 축 + staged state(`selected`) + "초기화/적용" 2 버튼. `useEffect`에 `queueMicrotask` 사용 (`AdvancedFilterSheet.tsx:31`) — memory `feedback_no_queue_microtask` 위반 → 본 task에서 제거.
- 트리거 `ToolbarFilterButton.tsx:14-38`는 `allPreachers` 단일 prop. 본 task에서 `allSeries` + `setSeriesFilter` + `sort/setSort` 추가 전달.
- `BottomSheet` UI primitive (`@/components/ui`)는 기존 `AdvancedFilterSheet`에서 이미 활용 — 동일 컴포넌트 재사용.
- mockup `FilterBottomSheet`는 시리즈/설교자/정렬 클릭 시 **즉시 setter 호출**(staged state 없음). 닫기 = "결과 보기" 버튼. 우리도 즉시 `setFilter`/`setSort` 호출 — staged state 제거.
- 설교자/시리즈 ListItem은 PC 사이드바와 동일 dnchurch 디자인 — 모바일에서 동일 `option` 패턴 사용 시 코드 재사용 가능. 단 BottomSheet 안은 layout(폭 100%, 더 큰 padding) 분기.
- mockup `FilterBottomSheet`에 "초기화" 버튼은 시리즈+설교자+정렬 3축 reset (line 1776-1778). `SermonFilterPatch`에 `sort` 키 포함(Phase 3-4 D2 — `utils/sermon.ts:111-118`) → **단일 `setFilter({series:null, preacher:null, sort:null})` 호출**로 1회 `router.push`만 발생 (sort=null이면 URL에서 delete되고 parseSermonParams가 'recent' fallback). setFilter는 page null 자동 reset 포함.
- `BottomSheet` 컴포넌트의 header API는 `title` prop만 노출 (`BottomSheet.tsx:81-94`) — close 버튼만 우측. "초기화" 헤더 우측 배치는 `title` prop에 JSX(`<span>필터</span><button>초기화</button>` 묶음) 넘기는 방식 또는 sheet 내부 첫 줄 별도 header 영역 추가. 후자가 BottomSheet 변경 없음 + 더 단순.

## Non-goals

- 검색 input을 sheet에 포함 — 검색은 PC 사이드바의 별도 영역 + 모바일 toolbar에 그대로 (Phase 3-1 분리 패턴 유지)
- 새 BottomSheet primitive 작성 — `@/components/ui/BottomSheet` 재사용
- PC 사이드바 변경 — 본 task 모바일만
- 연도 필터(`year`) 통합 — 현재 sidebar에도 미노출, 별도 작업

## Success Criteria

1. 모바일 ToolbarFilterButton 클릭 → BottomSheet 열림 (제목 "필터"). PC에서는 toolbar 자체가 `display: none` (Phase 3-1)이라 미노출.
2. 시리즈 섹션: 라벨 "시리즈" + 옵션 리스트(전체 / 단독 설교 / 시리즈명 × n). 활성 옵션 `$primary-subtle` bg + `$primary` text + 체크 아이콘.
3. 설교자 섹션: 라벨 "설교자" + 옵션 리스트(전체 / 설교자명 × n). 동일 활성 스타일.
4. 정렬 섹션: 라벨 "정렬" + 옵션 2개 (최신순/오래된순). 동일 활성 스타일.
5. 클릭 즉시 URL 갱신 — `setFilter({series: <slug>})` 또는 `setSort('oldest')`. staged state 없음.
6. 헤더 우측 "초기화" — 활성 필터(시리즈≠null OR 설교자≠null OR sort≠'recent') 있을 때만 노출. 클릭 시 시리즈/설교자/sort 모두 reset.
7. 푸터 "결과 보기" 버튼 (Primary) — 클릭 시 onClose만 호출 (URL은 이미 갱신됨).
8. `queueMicrotask` 사용 제거 (memory `feedback_no_queue_microtask`).
9. `node scripts/verify-task.mjs sermons-archive-mobile-sheet` PASS.

## 영향받는 파일

- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx` — 전면 재구성 (시리즈+설교자+정렬, 즉시 갱신). 파일명·디렉토리 유지 (외과적 변경)
- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.module.scss` — 섹션 라벨 + 옵션 row 스타일
- `src/app/(content)/sermons/_component/SermonListPage/ToolbarFilterButton.tsx` — `allSeries + activeSeries` prop 추가 전달
- `src/app/(content)/sermons/_component/SermonListPage/SermonToolbar.tsx` — `allSeries` ToolbarFilterButton에 전달 (toolbar.allSeries 이미 prop으로 존재)

## 단계별 체크리스트

- [ ] 1. AdvancedFilterSheet 전면 재구성 (시리즈+설교자+정렬 + 즉시 갱신 + queueMicrotask 제거 + 초기화 로직)
- [ ] 2. AdvancedFilterSheet.module.scss 섹션/옵션 스타일
- [ ] 3. ToolbarFilterButton prop 확장
- [ ] 4. SermonToolbar에서 ToolbarFilterButton에 allSeries 전달
- [ ] 5. Codex 1차 검증
- [ ] 6. verify-task

## 의사결정 로그

- **D1 — 컴포넌트 이름 유지**. `AdvancedFilterSheet`로 책임 확장 (시리즈+설교자+정렬). rename(`MobileFilterSheet` 등) 안 함 — caller 1곳만 영향이지만 디렉토리·테스트 추적성 유지. 디자인 변경이 의미를 바꾸지만 컴포넌트 책임(모바일 통합 필터 sheet)은 같음.
- **D2 — 즉시 갱신**. mockup `FilterBottomSheet`는 staged state 없이 클릭 즉시 setter. URL 갱신 → SSR re-fetch → 결과 즉시 반영. "결과 보기" 버튼은 단순 닫기. UX: 사용자가 변경마다 즉시 결과 확인 가능. 단점: 매 클릭마다 네비게이션 발생 — Next.js `router.push({ scroll: false })`로 최소화.
- **D3 — `queueMicrotask` 제거**. memory `feedback_no_queue_microtask` 위반. 새 코드에서는 staged state 자체가 없어서 useEffect 동기화 불필요 — `queueMicrotask`도 자동 제거.
- **D4 — 초기화 동작 (단일 호출)**. mockup은 시리즈/설교자/정렬 3축 reset. 검색(q)·연도(year)는 별도 — sidebar(PC)의 "초기화"는 4 필터 전체 reset. 모바일 sheet "초기화"는 sheet 내 노출 3축만 reset(다른 필터 그대로 유지). `setFilter({series:null, preacher:null, sort:null})` 한 번 호출 → 단일 `router.push`. sort=null이면 URL에서 delete → parseSermonParams가 'recent' fallback. setFilter의 page=null patching으로 page도 자동 reset.
- **D5 — option row 패턴은 mockup trailing checkmark**. PC 사이드바는 `ListItem` + leading dot(Phase 3-1) 패턴, 모바일 sheet는 mockup `FilterOption`(`ChurchSermonAll.jsx:1754-1769`)의 full-width row + trailing checkmark 패턴 — 다른 컴포넌트로 구현(`<button>` 커스텀). 책임이 다른 UI(좁은 사이드바 옵션 vs 풀 폭 모바일 시트 옵션)라 코드 재사용 안 함.
- **D6 — 다중 빠른 탭 시 다중 navigation은 수용**. 옵션 클릭 즉시 `setFilter`/`setSort` 호출 → 매번 `router.push`. Next.js는 dedupe 보장 없음 — 빠른 다중 탭 시 다중 navigation 발생, 마지막 URL이 최종 상태(latest-wins by sp snapshot). UX 영향: 빠른 다중 탭은 일반 사용 패턴 아니라 무시. 디바운스 도입은 비용 vs 효용 낮음.
- **D7 — 설교자 URL 식별자는 `preacher.name`**. 현재 모바일(`AdvancedFilterSheet.tsx:71-72`)과 PC 사이드바(Phase 3-1 `SermonSidebar.tsx:111-113`) 모두 `preacher.name` 사용. 일관성 유지 + `resolvePreacherName` 호환.

## Verification

- `node scripts/verify-task.mjs sermons-archive-mobile-sheet`
- `yarn dev` → 모바일 뷰포트(< 1024px)에서 "상세 필터" 버튼 클릭 → sheet 열림 + 3 섹션 노출
- 시리즈/설교자/정렬 옵션 클릭 시 URL 즉시 갱신
- "초기화" 클릭 시 sheet 내 3축만 null/recent로 reset, 검색·연도 유지
- "결과 보기" 클릭 시 sheet 닫힘 (URL 변화 없음)
- PC 뷰포트(≥ 1024px)에서 toolbar 자체 미노출(이전 phase)이므로 sheet 진입점 없음 확인

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST → 5건 반영 → PASS_WITH_DECISION_LOG

### Verbatim 요약

> 5건 CHANGE_REQUEST:
> Q1 — 다중 옵션 빠른 탭 시 다중 router.push, stale params latest-wins 동작 결정 필요
> Q2 — 초기화 두 setter 연속 호출 X, 단일 combined reset path 결정 (setFilter sort 키 활용)
> Q5 — BottomSheet header API는 title + close만 → 초기화 위치 결정 (title JSX 또는 sheet 내부 header 영역)
> Q7 — 모바일 option row는 PC ListItem dot이 아닌 mockup trailing checkmark 커스텀 div 명시
> Q9 — preacher.name URL 식별자 유지 명시
>
> Q3·Q4·Q6·Q8 RESOLVED — mockup 분석·BottomSheet footer API·Button default·SCSS 모듈 collision 없음

**평이 풀이**: ① setFilter에 sort 포함해서 한 번 호출로 reset, ② BottomSheet 내부 header 영역 따로 만들기, ③ 모바일 checkmark 패턴은 PC dot과 다른 커스텀 컴포넌트, ④ preacher.name URL 식별자 일관성.

**반영**:
1. Assumptions에 setFilter sort 단일 호출 + BottomSheet header API 한계 명시
2. D4 — 단일 호출 reset 명시
3. D5 — option row trailing checkmark 패턴 결정
4. D6 — 다중 탭 수용 명시
5. D7 — preacher.name 식별자 결정

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> 14 체크 항목:
> A-G PASS (getter 타입·reset URL clean·sort toggle·IoCheckmark import·외과적·queueMicrotask 제거·즉시 갱신)
> H INFO — `hover-bg-shift`는 :active 분기 없음, 단 `.option_active` 즉시 피드백 보완
> I INFO — radio role 더 의미론적이나 button+aria-pressed 치명적 결함 아님
> J PASS — reset 조건 sheet 3축 정확
> K PASS — `PreacherWithSermonCount[]` caller 타입 일치
> L INFO — BottomSheet title API 제약으로 .reset_row 섹션 상단 배치 문서화
> M PASS — snake_case
> N INFO — 샌드박스에서 yarn lint 직접 실행 불가 (Claude 검증)
>
> 직접 수정 0건. 최종 판정 PASS.

**평이 풀이**: 구조·타입·a11y 결정·메모리 위반(queueMicrotask) 모두 통과. INFO 4건은 디자인 결정 사항(hover/radio role/header 배치/샌드박스) — blocking 아님.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 없음 — diff 변경 없음.
- verify-task PASS (`logs/sermons-archive-mobile-sheet/20260514-234553/`). yarn lint·stylelint·build·knip은 Claude 측 verify-task에서 통과 확인 — Codex N INFO 보완.
- 외과적 변경: 4 파일 모두 plan 매핑. AdvancedFilterSheet 전면 재구성 + ToolbarFilterButton/SermonToolbar prop 갱신 + SCSS 신규. 인접 슬립 없음.
- queueMicrotask 제거 — memory `feedback_no_queue_microtask` 준수.
- D4 단일 호출 reset 확인 — `setFilter({series:null, preacher:null, sort:null})` 1회 호출 → updateParams가 page도 함께 null patching → 1회 router.push.
