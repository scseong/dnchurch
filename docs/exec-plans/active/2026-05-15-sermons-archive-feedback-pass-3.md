# sermons-archive-feedback-pass-3

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-15
- **브랜치**: feat/sermons-archive
- **Open questions**: none
- **ADR needed**: no — UI 통합/스타일 변경 + 컴포넌트 1개 제거. 서비스/타입 변경 없음

## 목표

사용자 피드백 3건: ① 검색 시 SermonSearchFeedback 섹션과 SermonResultHeader 카운트 중복 → SermonSearchFeedback 제거하고 result_header에 검색어 통합, ② 모바일 filter icon 배지를 wrapper 우상단 notification 스타일로, ③ GridCard 썸네일 play 버튼이 정보 가림 → hover 시에만 표시.

## 검증된 Assumptions

- `SermonSearchFeedback`은 `SermonToolbar`에서만 호출. `resultCount` prop은 SermonToolbar → SermonSearchFeedback 전용 chain. 제거 시 SermonToolbar.resultCount + page.tsx 전달도 dead.
- `SermonResultHeader`는 이미 `'use client'` + `useSermonFilter` 사용 — `q` getter 추가로 검색어 표시 가능. 기존 `hasQuery` prop은 `q.trim()` 내부 판단으로 대체.
- 검색어 지우기: SermonSearchForm(사이드바 PC / toolbar 모바일)에 자체 clear(X) 버튼 이미 존재 — result_header 별도 X 불필요.
- `.filter_btn`은 `position: relative` 적용됨(이전 commit). `.filter_badge` absolute 가능. PC `.toolbar { display:none }`라 배지는 모바일 한정.
- GridCard `.play_btn`은 현재 always visible. hover-only 변경 시 모바일 미표시 — 영상 존재는 `.duration` 배지로 암시되어 정보 손실 없음.

## Non-goals

- 검색어 지우기 별도 UI — SermonSearchForm clear 재사용
- SermonResultHeader 정렬 select 변경 — 이전 pass 유지
- play_btn 모바일 :active 분기 — 정보 가림 방지 목적, 모바일 미표시 의도
- SermonSeriesBanner 변경

## Success Criteria

1. `q.trim()` 있을 때 result_header `"{query}" 검색 결과 {N}개`(query `$primary` bold), 없을 때 `총 {N}개 설교`. 페이지 정보 그대로.
2. SermonSearchFeedback 컴포넌트 + SermonToolbar 호출/import + resultCount prop chain 제거. SCSS `.search_feedback*` 6 클래스 제거.
3. SermonResultHeader `hasQuery` prop 제거 — page.tsx 전달도 제거.
4. `.filter_badge` absolute 우상단(`top/right: -0.6rem`) + `$bg-card` 2px border. 버튼 텍스트 흐름 분리.
5. GridCard `.play_btn` `opacity: 0` + `.card:hover .play_btn { opacity: 1 }` transition.
6. `node scripts/verify-task.mjs sermons-archive-feedback-pass-3` PASS.

## 영향받는 파일

- `SermonResultHeader.tsx` — `q` 사용, `hasQuery` prop 제거, 검색어 분기 렌더
- `all/page.tsx` — SermonResultHeader `hasQuery` 제거 + SermonToolbar `resultCount` 제거
- `SermonToolbar.tsx` — SermonSearchFeedback 호출/import + `resultCount` prop 제거
- `SermonListPage.module.scss` — `.search_feedback*` 제거 + `.result_query` 신규 + `.result_count word-break` + `.filter_badge` notification
- `GridCard.module.scss` — `.play_btn` opacity 0 + `.card:hover` opacity 1
- **삭제**: `SermonSearchFeedback.tsx`

## 의사결정 로그

- **D1 — SermonSearchFeedback 완전 제거, result_header 단일화**. 검색 시 "결과 N개"가 두 곳 중복. result_header에 검색어 + 결과 수 통합. 검색어 지우기는 SermonSearchForm clear 재사용.
- **D2 — filter_badge notification 패턴**. inline → absolute 우상단 + bg-card border ring. 일반 알림 배지 관습.
- **D3 — play_btn hover-only, 모바일 미표시 수용**. 사용자 "play 버튼이 정보 가림" — 모바일 hover 없어 미표시되나 `.duration` 배지로 영상 존재 암시. 정보 우선.

## ADR 판단

- **불필요** — UI 컴포넌트 1개 제거 + 스타일 조정. 서비스/타입/캐시/라이브러리/레이어 경계 변경 없음.

## Verification

- `node scripts/verify-task.mjs sermons-archive-feedback-pass-3`
- `yarn dev` → `/sermons/all?q=요한` → result_header `"요한" 검색 결과 N개`, SearchFeedback 미노출
- 모바일 필터 적용 시 filter icon 우상단 원형 숫자 배지(ring)
- GridCard 비hover 시 play 미표시, hover 시 fade-in
- `node scripts/harness-gate.mjs sermons-archive-feedback-pass-3` (커밋 전)

---

## Codex 계획 검증

- **결론**: 미요청 (사용자 명시 3건 결정 + 외과적 작은 변경)

## Codex 1차 검증

- **결론**: PASS — 수정 0건

### Verbatim 요약

> A OK — raw `-0.6rem` 리터럴은 `feedback_calc_negative`(변수 부정 금지) 대상 아님, 허용
> B OK — `.filter_btn { position: relative }` 이미 존재
> C OK — play_btn aria-hidden, hover-only 의도된 디자인
> D OK — useSermonFilter return q 포함
> E OK — search/hasFilter는 getFilteredSermons에 보존, hasQuery prop만 제거
> F OK — `$bg-card` 2px ring이 `$primary` badge / `$primary-subtle` button 경계 분리감
> G OK — SermonSearchFeedback/.search_feedback 잔여 참조 0
> H OK — result_query $primary vs $txt-secondary 대비 cosmetic note만
>
> yarn lint·lint:styles 0 errors. Final PASS.

**평이 풀이**: 음수 리터럴 토큰 규칙·position relative·a11y·prop chain 제거·dead 참조 모두 통과. 검색어 강조 색 대비는 변경 불요 메모.

## Claude 2차 검증

- **최종 판단**: PASS

### 교차 확인

- Codex 직접 수정 0건 — diff 변경 없음.
- verify-task PASS (`logs/sermons-archive-feedback-pass-3/20260515-172332/`).
- 외과적 변경: 5 modifications + 1 deletion(SermonSearchFeedback) plan 매핑. SermonSearchFeedback은 본 task가 만든 dead(caller 동시 제거).
- `feedback_calc_negative` 메모리 확인: 규칙은 `-$var`(변수 부정) 대상. `.filter_badge top/right: -0.6rem`은 raw 리터럴 — 위반 아님. notification offset 필수값.
- play_btn 모바일 미표시는 D3 의도(정보 가림 방지) — `.duration` 배지로 영상 존재 암시. a11y 영향 0(play_btn aria-hidden 장식).
