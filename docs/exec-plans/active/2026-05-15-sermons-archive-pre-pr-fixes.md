# sermons-archive-pre-pr-fixes

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — 기존 함수의 nested join filter 조정 + UI 컴포넌트 수정. 새 함수·캐시·라이브러리·레이어 경계 변경 없음

## 목표

Phase 3 PR 직전 발견된 6건 fix 적용. 정합성(sort cascade, sermon_count published 필터) + 규칙 위반(`<img>` → `<Image>`) + 접근성(focus-visible) + UX(모바일 시트 staged 적용) + 차별화 EmptyState(시리즈 미매칭).

## 검증된 Assumptions

- `useSermonFilter.setFilter`(`useSermonFilter.ts:36`)는 현재 page만 자동 patch. sort cascade는 미구현.
- `sermon-service.ts:122,166` `allSeries`/`allPreachers` nested join `sermons(count)`는 draft + deleted 포함 카운트 — 실제 노출과 불일치(Codex Phase 3-1 NOTE K).
- `GridCard.tsx:30` 사용 `<img src loading="lazy">` — CLAUDE.md "이미지: 항상 `<Image>` + Cloudinary URL" 규칙 위반.
- `AdvancedFilterSheet.tsx` Phase 3-6 즉시 setter 구조 — 닫히지 않은 채 데이터 변경되는 UX 어색함. 사용자 보고.
- `resolveSeriesSlug`(`utils/sermon.ts:79-87`) 미매칭 slug 그대로 반환 → DB 빈 결과 → SermonFilteredList의 일반 EmptyState. 차별화 메시지 없음.
- `$focus-ring-color/width/offset` semantic 토큰 정의 존재(styles SKILL 매핑 표).

## Non-goals

- `<SeriesEpisodeList>` dead code 정리(별도)
- opacity 0.4 토큰화(별도)
- SermonNoteEditor 위치 결정(별도)
- archive 모드 결과 헤더(Phase 3-4 D1 결정 유지)
- 컴포넌트 rename(SermonSeriesBanner/AdvancedFilterSheet — 추후 논의)
- radio role semantics, mobile :active mixin 확장(추후 논의)

## Success Criteria

1. 시리즈/설교자/검색/연도 어느 필터든 setFilter 호출 → sort URL param 자동 제거 + parseSermonParams가 'recent' fallback. patch가 sort를 명시한 경우(예: 적용 버튼)는 그 값 우선.
2. `allSeries`·`allPreachers`의 sermon_count가 `is_published=true` + `deleted_at IS NULL` 조건만 카운트. published 0편인 시리즈/설교자는 inner join으로 결과에서 제외(운영 의도 — D1).
3. GridCard가 `CloudinaryImage` 사용. `fill` + `sizes` 설정으로 grid 카드 thumb 영역 점유.
4. focus-visible: sort_select, sheet option, search_feedback_clear, sidebar_reset, series_meta_link, reset_btn 등에 `$focus-ring-*` 토큰 outline 적용. tab 키 이동 시 보임.
5. AdvancedFilterSheet 즉시 setter → staged state 복귀. Footer "초기화" + "적용" 2 버튼. "적용" 클릭 시 단일 setFilter 호출 + onClose. backdrop 클릭/결과 보기 없는 경우 명세.
6. resolveSeriesSlug 미매칭 시 page.tsx에서 감지 → 차별화 EmptyState("해당 시리즈를 찾을 수 없습니다") 노출.
7. `node scripts/verify-task.mjs sermons-archive-pre-pr-fixes` PASS.

## 영향받는 파일

- `src/hooks/useSermonFilter.ts` — setFilter에 page/sort cascade(spread 순서로 patch 우선)
- `src/services/sermon/sermon-service.ts` — allSeries/allPreachers inner join + is_published + deleted_at null 필터
- `src/app/(content)/sermons/_component/GridCard/GridCard.tsx` — `<img>` → `CloudinaryImage`
- `src/app/(content)/sermons/_component/GridCard/GridCard.module.scss` — Image fill 호환 스타일(필요 시)
- `src/app/(content)/sermons/_component/SermonListPage/SermonListPage.module.scss` — focus-visible 토큰 outline
- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.module.scss` — focus-visible 토큰
- `src/app/(content)/sermons/_component/AdvancedFilterSheet/AdvancedFilterSheet.tsx` — staged state + Footer 2 button
- `src/app/(content)/sermons/all/page.tsx` — series 미매칭 감지 + 차별화 EmptyState 분기

## 단계별 체크리스트

- [x] fix 1: setFilter sort cascade
- [x] fix 3: sermon_count inner join + published/deleted filter
- [ ] fix 2: GridCard CloudinaryImage
- [ ] fix 4: focus-visible 토큰 적용
- [ ] fix 5: AdvancedFilterSheet staged + 적용/초기화 2 button
- [ ] fix 6: 시리즈 미매칭 차별화 EmptyState
- [ ] Codex 1차 검증
- [ ] verify-task

## 의사결정 로그

- **D1 — sermon_count inner join 채택**. published 0편인 시리즈/설교자는 사이드바에서 제외(운영자가 draft만 가진 상태는 미공개 의도). left join + null-safe count 분리 query는 코드 복잡도만 ↑.
- **D2 — sort cascade spread 순서**. `updateParams({ page: null, sort: null, ...patch })` — 기본 reset이 먼저, patch 명시값이 마지막. AdvancedFilterSheet 적용 버튼이 sort 'oldest' patch 명시 시 그 값 보존.
- **D3 — Sheet staged state 복귀**. Phase 3-6 즉시 setter UX 어색(닫히지 않은 채 데이터 변경). Footer "초기화/적용" 2 button. backdrop/close icon으로 닫으면 변경 폐기. mockup 충실도보다 dnchurch 적용 UX 우선.

## ADR 판단

- **불필요** — `services/sermon`은 `ADR_TRIGGER_PARTS`(`scripts/_shared-config.mjs:7-26`) 포함이지만 본 변경은 ① 기존 메소드(`allSeries`, `allPreachers`)에 nested filter 2줄 추가 + inner join 마커, ② setFilter spread 순서 정정, ③ UI 컴포넌트 staged state 복귀뿐. 새 함수·캐시 정책·라이브러리·레이어 경계 변경 없음.

## Verification

- `node scripts/verify-task.mjs sermons-archive-pre-pr-fixes`
- `yarn dev` → `/sermons/all`에서 정렬 'oldest' 적용 후 시리즈 클릭 → URL에서 sort 사라짐
- 사이드바 시리즈/설교자 count가 published sermons 실제 수와 일치
- GridCard 썸네일 Cloudinary loader 경유
- Tab 키 이동 시 focus 표시(검색 input, sort_select, sheet option 등)
- 모바일 sheet에서 옵션 클릭 시 URL 즉시 갱신 X → "적용" 클릭 후만 URL 갱신
- `/sermons/all?series=잘못된슬러그` 접속 시 "해당 시리즈를 찾을 수 없습니다" EmptyState

---

## Codex 계획 검증

- **결론**: 미요청 (fix 6건 사용자 명시 결정 기반, 계획 검증 생략 결정)

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> A IMPORTS — stale import 없음 (chips/SeriesBrowserSheet 참조 0)
> B TYPE SAFETY — setFilter spread 순서, handleApply sort 전달, sermons!inner shape 방어, CloudinaryImage props 호환 모두 OK
> C LOGIC — draft open transition sync, isUnknownSeries 분기 위치, handleApply 3 키 patch 모두 정상
> D A11Y — Button label, EmptyState announce, focus-visible cascade 유지
> E SCSS — dead class 참조 없음, hardcoded 없음
> F ESLINT-DISABLE — exhaustive-deps next-line 단일 disable, 의도 명확
> G WARN(범위 외) — multi-tab 시 draft 미동기화, crash 없음
>
> 검증: `yarn lint` 통과(기존 warning 24), `yarn lint:styles` 통과(기존 warning 191), `git diff --check` pass
> 최종 PASS

**평이 풀이**: 8 파일 변경 + 3 파일 삭제 전부 통과. spread 순서·inner join·draft state·focus token cascade·dead code 정리 모두 검증.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 없음 — diff 변경 없음.
- verify-task 2회 PASS (`logs/sermons-archive-pre-pr-fixes/20260515-144728/` ESLint fail → 145138 PASS).
- 외과적 변경: 8 파일 변경 + 3 파일 삭제 모두 plan `영향받는 파일` 매핑.
- AdvancedFilterSheet useEffect 패턴 — open transition 시점만 sync. eslint-disable next-line은 react-hooks/exhaustive-deps 단일. CLAUDE.md `--no-verify` 우회 아님 — rule 자체의 의도된 disable.
- D1 inner join 효과 — 운영자가 draft만 가진 시리즈/설교자는 사이드바에서 자동 숨김. 사용자 결정 사항.
