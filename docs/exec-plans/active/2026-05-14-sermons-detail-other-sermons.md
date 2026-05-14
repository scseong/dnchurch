# sermons-detail-other-sermons

- **상태**: 🟡 진행 중
- **시작일**: 2026-05-14
- **브랜치**: feat/sermons-detail
- **Open questions**: none
- **ADR needed**: no — `_component/` + `SermonDetailPage.tsx` + `[id]/page.tsx` 데이터 추가만 (ADR_TRIGGER_PARTS 미해당, 신규 service method 없음)

## 목표

`/sermons/[id]` 본문 하단(`main_column` 안, `<SermonNoteEditor>` 위)에 "같은 설교자의 다른 설교 3개" 섹션 추가. mockup Phase 2-3(line 307-323) — 가로 row 3개(작은 썸네일 + 제목 + 날짜). 현재 설교 제외, 같은 설교자 다른 설교 3건 이상일 때만 표시.

## 검증된 Assumptions

- `sermon.preacher` 타입 `Preacher | null` (`types/sermon.ts:11-15`). truthy일 때 `preacher.id` 사용 가능.
- 기존 `getSermons({preacherId, pageSize: N})` 가능 — `SermonListParams.preacherId`(`types/sermon.ts:37-45`) + `sermon-service.ts:76 query.eq('preacher_id', preacherId)`. Phase 1-1 Featured와 동일 server-only static client 패턴.
- mockup Phase 2-3은 별도 컴포넌트 함수 정의 없음(`grep "function OtherSermons"` 0 hit) — prompt 본문(line 307-323) + standalone sidebar 디자인(line 1219-1276) 차용.
- mockup 본문 "가로 row 3개" → PC 3 카드 / 모바일 vertical stack 3 카드 (Phase 1-2 recent 카드 비슷 패턴 단순 컴팩트).
- 본 task에 모바일 분기 포함 — `mobileFullBleed` 없음, 단순 `respond-up` grid 분기 (Phase 2-4 별도 분리하지 않음 — 단순한 grid라 한 task 안 흡수).

## Non-goals

- 시리즈 사이드바 변경 (Phase 2-2 완료, 본 task 무관)
- mockup `StandaloneSidebar` 우측 사이드바 배치 (사이드바 영역은 시리즈 있을 때만 — Phase 2-2 결정. 단독 설교는 사이드바 미렌더 유지)
- 새 service method 추가
- `<SermonVideoPlayer>` / `<ScriptureBlock>` / `<SermonNoteEditor>` 자체 수정
- mockup의 `Phase 2-3 검증` "모바일에서는 별도 섹션으로 표시" — 본 task에서 모바일도 동일 위치(main_column 안) 노출. 별도 섹션 분리는 Phase 2-4에서

## Success Criteria

1. **신규 컴포넌트** `src/app/(content)/sermons/_component/SermonOtherByPreacher/SermonOtherByPreacher.tsx` + `.module.scss`. props: `{ preacherLabel: string; sermons: SermonWithRelations[] }`. `sermons.length === 0`이면 `return null`.
2. **레이아웃** — 헤더 h2 "{preacherLabel}의 다른 설교" + 3 카드 grid (PC `grid-template-columns: repeat(3, 1fr)`, 모바일 1 column stack). gap `$content-gap-m`.
3. **카드 구조** — `<Link href={\`/sermons/${id}\`} draggable={false}>` 래핑, 상단 16:9 썸네일(`<CloudinaryImage fill>` + `cloudinaryFetchUrl`), 하단 텍스트(title `<h3>` 2줄 line-clamp + scripture `$primary` + date `$txt-tertiary`).
4. **데이터 fetching** — `[id]/page.tsx`에서 `sermon.preacher?.id` truthy 시 `getSermons({preacherId: sermon.preacher.id, pageSize: 4})` 호출. 결과 `filter(s => s.id !== sermon.id).slice(0, 3)` 적용. 3건 미만이면 빈 배열 전달 → 컴포넌트 미렌더.
5. **위치** — `SermonDetailPage.tsx` `<div className={styles.info_section}>` 안 `<SermonNoteEditor>` 위 (resource list 다음).
6. **PC drag-ghost 차단** — Phase 1-2 D5 패턴 (Link draggable={false} + SCSS user-select:none + -webkit-user-drag:none + thumb pointer-events:none).
7. **검증 통과** — `verify-task.mjs sermons-detail-other-sermons` PASS + `yarn dev` 수동: 같은 설교자 ≥3건 설교 / 같은 설교자 2건 이하 / 단독 설교 / 시리즈 있는 설교 4 케이스.

## 영향받는 파일

- 신규: `src/app/(content)/sermons/_component/SermonOtherByPreacher/SermonOtherByPreacher.tsx`
- 신규: `src/app/(content)/sermons/_component/SermonOtherByPreacher/SermonOtherByPreacher.module.scss`
- 수정: `src/app/(content)/sermons/[id]/page.tsx` — `getSermons({preacherId, pageSize: 4})` 추가 호출 + filter/slice + prop 전달
- 수정: `src/app/(content)/sermons/_component/SermonDetailPage/SermonDetailPage.tsx` — `otherSermonsByPreacher` prop 추가, `<SermonOtherByPreacher>` 배치

## 단계별 체크리스트

- [ ] 1. `SermonOtherByPreacher.tsx` — 카드 3개 grid, `<Link>` 래핑, CloudinaryImage 썸네일, drag-ghost 차단
- [ ] 2. `SermonOtherByPreacher.module.scss` — semantic 토큰만 (`$bg-card`/`$border-card`/`$radius-s`/`$primary`/`$txt-*`). PC `grid-template-columns: repeat(3, 1fr)` / 모바일 `1fr`
- [ ] 3. `[id]/page.tsx` — preacher id로 `getSermons` 호출 + filter/slice + prop 전달
- [ ] 4. `SermonDetailPage.tsx` — `otherSermonsByPreacher: SermonWithRelations[]` prop 추가, `<SermonNoteEditor>` 위에 `<SermonOtherByPreacher preacherLabel={preacherLabel} sermons={otherSermonsByPreacher} />` 배치
- [ ] 5. `yarn dev` 수동 — 4 케이스 + 카드 클릭 → `/sermons/${id}` 이동
- [ ] 6. `verify-task.mjs sermons-detail-other-sermons` 통과

## Verification

```bash
yarn lint
yarn lint:styles
yarn build
yarn knip

# 수동 (yarn dev)
# → 같은 설교자 ≥3건 설교 /sermons/[id] — 섹션 표시 (3 카드)
# → 같은 설교자 2건 이하 — 섹션 미렌더 (return null)
# → 단독 설교(시리즈 없음) — 섹션 표시 (사이드바 없으므로 본문 100% width grid 3)
# → 시리즈 있는 설교 — 사이드바 옆 main_column 안 섹션 표시 (grid 3 fit)
# → 카드 클릭 → /sermons/${id} 이동 / 드래그 → ghost 없음

node scripts/verify-task.mjs sermons-detail-other-sermons
```

---

## Codex 계획 검증

- **결론**: **PASS_WITH_DECISION_LOG** (2026-05-14, fresh thread `a774d0679b1bbbdd0`)
- **5체크**: 1·2·3·4 OK, 5 새 추상화 사실상 없음(신규 컴포넌트 1, service 0).

**Codex verdict** (verbatim 발췌):
> a. `page.tsx`: `getSermonById` 뒤 `getSermonsBySeries`와 `getSermons({ preacherId })`는 서로 독립이므로 순차 await는 TTFB를 늘릴 수 있음. 권장: sermon 로드 후 두 호출을 `Promise.all`로 묶기.
> b. `pageSize:4 → filter(current id) → slice(0,3)`: "same-preacher count ≥ 3"을 "현재 설교 제외 3개 이상"으로 해석하면 맞음. 권장: 결정 로그에 "current 제외 기준" 명시.
> c. "mobile shows as separate section"은 1fr stack인지, mobile에서 위치 이동인지 모호함. 권장: 위치는 `main_column` above `SermonNoteEditor`로 고정한다고 결정 로그에 남기기.

**평이 풀이**: a) `[id]/page.tsx`에서 series + preacher 두 fetch를 `Promise.all`로 병렬 → TTFB 단축. b) "≥3건" 기준이 현재 제외 후라는 점 명시. c) 모바일에서 별도 섹션 이동 아닌 단순 1fr stack(동일 위치)이라는 점 명시.

## Codex 1차 검증

- **결론**: 미요청

## Claude 2차 검증

- **최종 판단**: 미작성

---

## 의사결정 로그 (사전 기록)

- **2026-05-14 D1 — `getSermons({preacherId, pageSize:4})` 직접 호출 vs 신규 service method**: 신규 method `getOtherSermonsByPreacher` 추가하면 cache key 분리 가능하나 ADR 0010 외과적 변경 위반. Phase 1-1 Featured 동일 패턴(`getSermons({pageSize:1})`) 채택. cache는 `sermon-cache.ts list()` 공유(1day revalidate). pageSize:4로 1건 buffer + slice 3로 현재 설교 제외.
- **2026-05-14 D2 — 본 task에 모바일 grid 분기 포함**: mockup Phase 2-4가 모바일 별도 처리 명시이나 본 컴포넌트의 PC 3 grid → 모바일 1 column stack은 `respond-up`만으로 단순 처리 가능. Phase 2-4의 모바일 분기는 사이드바 위치 + 메타 압축 등 더 큰 변경이라 본 단순 grid는 본 task 안 흡수.
- **2026-05-14 D3 — Phase 1-2 D5 drag-ghost 차단 패턴 재적용**: PC `<Link>` 카드 wrap의 anchor native drag ghost는 Phase 1-2에서 사용자 검증 발견. 본 카드도 동일 처리 (`draggable={false}` + SCSS user-select/-webkit-user-drag/pointer-events). 카드 디자인 컨벤션화.
- **2026-05-14 D4 — `Promise.all`로 series + preacher 병렬 fetch (Codex CR-a 반영)**: 1차 plan은 `[id]/page.tsx` 현 코드(`getSermonById` → `getSermonsBySeries` 순차)에 `getSermons({preacherId})`만 추가하는 형태였음. Codex 지적 — 둘은 독립이라 순차 await는 TTFB 증가. 해결: sermon 로드 후 `Promise.all([getSermonsBySeries(...), getSermons({preacherId, pageSize: 4})])` 병렬화. 같은 sermon 페이지 진입 시 2 fetch 병렬 → 단일 fetch 시간(서비스 단 더 느린 쪽)으로 단축.
- **2026-05-14 D5 — "3건 이상" 기준은 현재 설교 제외 후 (Codex CR-b 반영)**: mockup line 318 "3개 이상 있을 때만"의 해석. `pageSize: 4` fetch 후 `filter(s => s.id !== sermon.id)` 적용한 결과가 ≥3건일 때 표시. 정확히 4건이면 현재 1건 제외 → 3건 노출, 컴포넌트 `sermons.length === 0` 분기 외 별도 ≥3 게이트 X. 단 SermonOtherByPreacher가 3 카드만 렌더(slice(0,3))라 결과가 1-2건이면 카드 1-2개만 노출 — 본 plan은 그 경우도 미렌더 처리? 결정: `≥3건일 때만 렌더`를 `[id]/page.tsx`에서 `result.length === 3`이면 컴포넌트에 prop 전달, 미만이면 빈 배열로 전달해 `return null`.
- **2026-05-14 D6 — 모바일 위치 main_column 안 동일 (Codex CR-c 반영)**: mockup Phase 2-3 검증 "모바일에서는 별도 섹션으로 표시" — 본 plan은 별도 섹션 분리 X, `main_column` 안 `SermonNoteEditor` 위 동일 위치 유지. 모바일 변경은 grid 1fr stack 뿐. 더 큰 모바일 layout reshuffle은 Phase 2-4 별도.

## 참고 자료

- `docs/references/sermons/Sermon-Implementation-Prompts.md` Phase 2-3 (line 307-323)
- `docs/references/sermons/ChurchSermonAll.jsx` — StandaloneSidebar(line 1219-1276)에서 row 디자인 차용
- Phase 1-2 D5 drag-ghost 패턴 / Phase 2-2 사이드바 톤 통일 D8 (완료 후 묶음 PR)
