# 설교 도메인 코드 리뷰

- **수집일**: 2026-05-20
- **범위**: sermon 도메인 전체 (공개 라우트 + 어드민 + 도메인 레이어)
- **목적**: 후속 개선 EXEC_PLAN 입력 자료
- **작성 컨텍스트**: 9개 기준(구조·컴포넌트·비즈니스 로직·상태·데이터·타입·성능·접근성·기타)으로 약 90개 파일 정독
- **검증 이력**:
  - 1차: Claude 정독 (13개 항목 A~M)
  - 2차: Codex 객관 리뷰 (5개 단독 발견 N~R, 3개 보강)
  - 3차: Claude 자체 검증 (Codex CHANGE_REQUEST 5건 코드·exec-plan·메모리로 교차 확인, 모두 반영)
  - 4차: Claude 자체 검증 (Codex CHANGE_REQUEST 3건 추가 — 항목 수 정정, B의 lint 회피 의도 발굴, 메모리 추적성 보강)

## 탐색 대상

- `src/actions/sermon.action.ts`
- `src/services/sermon/{index,admin,sermon-service,sermon-cache}.ts`
- `src/lib/{sermon-form,sermon-form-mapper,sermon-resource,sermon-slug}.ts`, `src/lib/utils/sermon-filter.ts`
- `src/utils/sermon.ts`
- `src/hooks/{useSermonFilter,useSeriesFilter}.ts`
- `src/types/{sermon,sermon-form}.ts`
- `src/app/(content)/sermons/**`
- `src/app/(admin)/admin/sermons/**`
- `src/components/admin/sermons/**`
- `src/app/_component/home/{RecentSermons,SermonCard}.tsx`

`about`, `worship`, 전역 레이아웃, 공용 UI, 전역 토큰은 제외.

## Codex 교차 검토 + Claude 자체 검증 (3·4차)

같은 범위로 Codex 객관 리뷰를 받아 두 분석을 병합한 뒤, Codex의 CHANGE_REQUEST를 두 차례에 걸쳐 코드·exec-plan·메모리·git log·tech-debt-tracker에서 다시 확인했다.

**병합 결과**

- **양쪽이 합의한 항목**: C, D, E, G, J, K, M — 7건
- **Codex 단독 발견 (1차 누락)**: N, O, P, Q, R — 5건 (N·O·P가 우선순위 높음)
- **Claude 1차 단독 발견 (Codex 누락)**: A, B, F, H, I, L — 6건
- 합계: 13개 항목 A~M + 5개 항목 N~R = **18개 항목**, 그중 F는 4차에서 비결함으로 철회 → 활성 17개

**Codex CHANGE_REQUEST 3차 검증 결과**

1. F 항목은 비결함으로 정정. `docs/exec-plans/active/2026-05-18-sermons-a11y-perf.md:59`에 "ARIA tablist 의도적 회피(PC 전 패널 노출=disclosure 패턴)"이라고 이미 결정.
2. O 항목에 RPC overload 정리 추가. `database.types.ts:596-608` `increment_sermon_views`가 `int8`/`uuid` ambiguity → typegen이 error 타입 생성. RPC 호출 자체가 type-broken.
3. B 항목의 영향 범위 정정. 메모리 `feedback_no_queue_microtask.md` 실재. 단 `queueMicrotask`가 sermon 외 3곳에도 잔존(`useMediaQuery.ts:10`, `NoticeControlBar.tsx:26`, `DesktopHeader.tsx:21`) → 전역 부채 일부.
4. 전체 구조의 컴포넌트 배치 표현 정정. `SermonForm`은 new/edit 재사용, `SermonListPage`만 route-local 후보.
5. N과 O의 PR 분리. 변경 축이 다름.

**Codex CHANGE_REQUEST 4차 검증 결과**

1. 검증 이력 항목 수 오류 정정. 1차는 12개가 아니라 13개(A~M).
2. **B의 `queueMicrotask`는 lint 회피용 의도적 우회책으로 확인**. git log:
   - `0e8fd31 Fix: react-hooks/set-state-in-effect 10건 — queueMicrotask로 외부 prop 동기화 처리` (도입)
   - `7354b9f Fix: react-hooks/set-state-in-effect 8건 — queueMicrotask 제거` (일부 청산)
   - `docs/tech-debt-tracker.md:99-104`도 "9건은 후속 컴포넌트 리팩터(useDialog 통합·**SermonListPage 재구조** 등) 과정에서 자연 청산" 명시.
   - 단순 `setState` 교체는 lint 재발 위험 → "제거해도 안전" 표현 철회, 청산 분기와 lint 검증 조건 추가, **별도 전역 정리 task로 이동**.
3. 메모리 추적성 보강. B에 메모리 경로와 짧은 인용을 직접 명시.

**요약**

- Codex가 더 잘 본 영역 — 데이터 경계, 캐시·증감 정책, SSOT 일관성, 부채 트레이드오프 인식.
- Claude 1차가 더 잘 본 영역 — 단일 컴포넌트 안의 버그, 사용자 메모리 정합성, 미세 중복 패턴.
- Claude 자체 검증으로 1차의 과장 2건(F 결함화·컴포넌트 위치 일반화)을 정정, B의 단순 제거 권고를 청산 분기로 재작성. 분리 권장에 따라 B를 설교 PR에서 빼고 별도 전역 정리 task로 이동.

---

## 1. 전체 구조

**도메인 책임 흐름** — `lib(mapper/slug/resource) → services/sermon → actions/sermon.action → app/(admin|content)`. apis 폴더는 sermon 도메인에 없고 services가 직접 supabase를 쥔다. 다른 도메인(staff, announcement, auth)은 `apis/`를 거치므로 일관성 차이가 있다. CLAUDE.md는 `apis → services → actions → app`을 명시하나 sermon 도메인만 apis가 비어 있다.

**컴포넌트 배치 — 평가 분리**

- 공개: `src/app/(content)/sermons/_component/` — 페이지 전용 OK
- 어드민 폼 shell: `src/app/(admin)/admin/sermons/_components/SermonFormShell.tsx`
- 어드민 폼 본체: `src/components/admin/sermons/SermonForm/`
- 어드민 리스트: `src/components/admin/sermons/SermonListPage/`

세부 평가:
- `SermonForm`은 `new/page.tsx`와 `[id]/edit/page.tsx`에서 모두 사용 — admin sermons 내부 재사용 컴포넌트. 현 위치(`src/components/admin/sermons/`)는 합리적.
- `SermonListPage`는 admin 리스트 페이지(`page.tsx`) 단독 사용 — route-local 후보. `app/(admin)/admin/sermons/_components/`로 옮기는 게 CLAUDE.md 규칙과 일치.

---

## 2. 개선 항목 (A ~ R)

각 항목 끝에 **[기준]** 태그로 9가지 기준 중 해당 영역을 표기한다. **[출처]** 태그로 발견 경로를 표기한다.

### A. 어드민 폼 미리보기에 설교자 UUID가 그대로 표시됨 [비즈니스 로직] [Claude 1차 단독]

- **문제**: `PreviewCard`가 `preacherId`(UUID 문자열)를 그대로 meta 칸에 박는다.
- **영향**: 어드민이 폼 입력 중 미리보기 영역에 "설교자: 5f3a9c-…" 형태로 UUID가 노출. 미리보기 신뢰도 저하.
- **개선 방향**: `preachers: Preacher[]`도 prop으로 받아 `preachers.find(p => p.id === preacherId)?.name`으로 매핑한다. 상위 `SermonForm`이 이미 `preachers`를 가지고 있어 prop 전달만 추가하면 된다.
- **우선순위**: 높음
- **관련 파일**: `src/components/admin/sermons/SermonForm/Preview/PreviewCard.tsx:14-20`, `src/components/admin/sermons/SermonForm/index.tsx:81`
- **예시**

```tsx
// 변경 전
const metaParts = [
  sermonDate ? formattedDate(sermonDate, 'YYYY년 M월 D일') : '',
  preacherId,
].filter(Boolean);

// 변경 후
const preacherName = preachers.find((p) => p.id === preacherId)?.name ?? '';
const metaParts = [
  sermonDate ? formattedDate(sermonDate, 'YYYY년 M월 D일') : '',
  preacherName,
].filter(Boolean);
```

### B. `queueMicrotask` 청산 — lint 회피 의도 확인 / 별도 전역 task로 이동 [상태 관리] [Claude 1차 단독 → 4차 재작성]

- **문제**: 설교 어드민 리스트에서 `queueMicrotask(() => setState(...))`를 두 곳에서 사용 (`useListFilters.ts:27`, `SermonListPage/index.tsx:65`).
- **메모리 SSOT (추적성)**: `C:\Users\ckdtj\.claude\projects\C--Users-ckdtj-Desktop-dev-dnchurch-dnchurch-project-dnchurch\memory\feedback_no_queue_microtask.md` — "`queueMicrotask`를 코드에서 사용하지 않는다. **Why:** 사용자가 명시적으로 금지 지시. **How to apply:** 타이밍 지연이 필요한 경우 `setTimeout(fn, 0)`, `requestAnimationFrame`, 또는 React의 `useEffect` 자체 타이밍을 활용한다. `queueMicrotask`는 어떤 상황에서도 작성하지 않는다."
- **영향 범위 (3차 검증 정정)**: 설교 도메인 단독 결함이 아니다. 전역 grep 시 다른 3곳(`src/hooks/useMediaQuery.ts:10`, `src/app/(content)/news/notices/_component/NoticeControlBar.tsx:26`, `src/components/layout/Header/DesktopHeader.tsx:21`)에도 잔존 — 총 5건.
- **lint 회피 의도 (4차 보강)**: `queueMicrotask`는 우연히 들어간 게 아니라 **`react-hooks/set-state-in-effect` lint 룰의 회피책으로 의도적으로 도입**되었다. 근거:
  - git log: `0e8fd31 Fix: react-hooks/set-state-in-effect 10건 — queueMicrotask로 외부 prop 동기화 처리`, `7354b9f Fix: react-hooks/set-state-in-effect 8건 — queueMicrotask 제거`
  - `docs/tech-debt-tracker.md:99-104`: "React Compiler 신규 룰. 9건은 후속 컴포넌트 리팩터(useDialog 통합·SermonListPage 재구조 등) 과정에서 자연 청산, 1건은 외부 prop 동기화 패턴으로 line-disable + 사유 주석 유지"
  - 즉 단순히 `queueMicrotask`를 `setState` 직접 호출로 바꾸면 lint가 재발한다.
- **개선 방향 (분기)**:
  1. effect 내부 `setState`가 정말 필요한 흐름이면 **컴포넌트 재구조**(tech-debt 노트가 명시한 "SermonListPage 재구조" 경로)로 청산.
  2. 외부 prop 동기화 패턴이면 `useEffectEvent` 또는 ref 분리로 setState 시점 분리.
  3. 어느 청산 방식이든 적용 후 `yarn lint`로 `react-hooks/set-state-in-effect` 재발 여부 확인 필수.
- **위치 (4차 결정)**: 본 설교 도메인 PR에서 분리해 **별도 전역 정리 task**(`queue-microtask-cleanup`)로 이동. 설교 2건 + 전역 3건 총 5건을 한 task에서 청산한다. 의도가 "어드민 인터랙션 접근성(E)"과 섞이지 않도록.
- **우선순위**: 높음 (단, 설교 도메인 PR이 아니라 별도 전역 task에서)
- **관련 파일**: `src/components/admin/sermons/SermonListPage/hooks/useListFilters.ts:27`, `src/components/admin/sermons/SermonListPage/index.tsx:65`, `src/hooks/useMediaQuery.ts:10`, `src/app/(content)/news/notices/_component/NoticeControlBar.tsx:26`, `src/components/layout/Header/DesktopHeader.tsx:21`
- **검증**: `rg "queueMicrotask" src` 결과 0건, `yarn lint` PASS(`react-hooks/set-state-in-effect` 재발 0건).

### C. 공개 리스트 검색어에 PostgREST 메타문자 escape 누락 [데이터 패칭] [양쪽 합의]

- **문제**: `sermon-service.ts`의 공개 `list()`가 `query.or(`title.ilike.%${search}%,scripture.ilike.%${search}%`)`를 그대로 박는다. 어드민 `adminList()`에는 `escapeOrToken`이 적용되어 있지만 공개 쪽은 누락.
- **영향**: 사용자가 검색창에 `,` 또는 `()`를 넣으면 `.or()` 파서가 깨져 500 또는 빈 결과로 떨어진다. 사용자 입력 신뢰 경계가 깨진 상태.
- **개선 방향**: 공개 `list`도 `escapeOrToken`을 적용해 동일한 정규화를 거치게 한다. 추가로 어드민 정규화도 `%`나 `*` 같은 와일드카드 문자는 처리하지 않으므로 검색 RPC 또는 전문검색으로 이동하는 후속 옵션 고려.
- **우선순위**: 중간 (Codex 평가 기준으로 조정)
- **관련 파일**: `src/services/sermon/sermon-service.ts:49-51`(escape 정의), `:88-90`(공개 list에 미적용), `:383-384`(어드민 적용 위치)

### D. 홈 SermonCard가 `<img>` 직접 사용 + TODO 잔류 [성능] [양쪽 합의]

- **문제**: `src/app/_component/home/SermonCard.tsx`가 `<img src={thumbnail}>` + `{/* TODO: Cloudinary 최적화 */}` 코멘트 상태. 다른 모든 카드(GridCard, SermonCarouselCard, SeriesCard 등)는 `CloudinaryImage` + `cloudinaryFetchUrl`을 사용.
- **영향**: 홈에서만 이미지가 원본 URL로 가서 LCP·대역폭 손해. CLAUDE.md "이미지: 항상 `<Image>` + Cloudinary URL" 규칙 위반.
- **개선 방향**: 다른 카드들과 동일하게 `cloudinaryFetchUrl(getSermonThumbnail(sermon))` → `<CloudinaryImage>`로 교체. `isLatest` 배지는 그대로 유지.
- **우선순위**: 낮음
- **관련 파일**: `src/app/_component/home/SermonCard.tsx:28-35`

### E. 어드민 테이블 행·정렬 헤더가 키보드 미지원 [접근성] [양쪽 합의]

- **문제**: `SermonTable`이 `<tr onClick={() => onEdit(sermon)}>`로 행 전체에 클릭 핸들러를 단다. `MobileCardList`도 `<article onClick>`. 행 내부 ‹수정·삭제› 버튼은 `event.stopPropagation()`로 가둔다.
- **Codex 보강**: 정렬 가능한 `<th>`도 키보드 미지원. `SermonTable.tsx:120-128`이 `<th>`에 직접 `onClick={() => onSortChange(...)}`를 단다. `<button>`이 아니라 `<th>`에 핸들러를 달면 Tab으로 도달할 수 없다.
- **영향**: 키보드 사용자는 행 전체로 편집 페이지 진입이 불가능하고, 컬럼 정렬도 마우스로만 가능. 관리자 핵심 업무 화면의 접근성 결함.
- **개선 방향**: 행은 제목 셀에 `<Link href={`/admin/sermons/${id}/edit`}>` 적용 (행 전체 클릭은 유지 가능). 정렬 헤더는 `<th>` 안에 `<button onClick={...}>`을 두고 `<th>`의 onClick은 제거. 모바일 카드도 제목/카드 주요 영역을 링크로 전환.
- **우선순위**: 높음 (Codex 평가 기준으로 조정)
- **관련 파일**: `src/components/admin/sermons/SermonListPage/parts/SermonTable.tsx:120`, `:156`, `src/components/admin/sermons/SermonListPage/parts/MobileCardList.tsx:72`

### F. 설교 디테일 탭 ARIA 패턴 — **비결함 (3차 검증으로 철회)** [접근성]

- **이전 평가 (1차)**: `SermonDetailSections`가 4개 탭을 `<button>` + `role="group"` + `aria-expanded`로 구현 — ARIA tabs 패턴 아님이라 결함이라 판단.
- **3차 검증 결과**: `docs/exec-plans/active/2026-05-18-sermons-a11y-perf.md:59`의 접근성 점검 결과에 "탭 `role="tab"` 부재(체크7) — detail-mockup D4에서 Codex 검증 후 ARIA tablist 의도적 회피(PC 전 패널 노출 = **disclosure 패턴**)"이라 이미 검증·기록되어 있다. tablist가 아니라 disclosure가 의도된 패턴.
- **결정**: 비결함. 본 문서에서 제외.
- **재검토 조건**: 디자인이 변경되어 모바일/PC 양쪽 모두 탭 한 개씩만 노출하는 흐름이 되면(즉 진짜 tabs UI) 재평가.
- **우선순위**: 해당 없음

### G. 어드민 폼 모바일 미리보기가 자체 dialog (BottomSheet 미사용) [컴포넌트 품질 / 접근성] [양쪽 합의]

- **문제**: `SermonForm/index.tsx:106-134`가 `<div className={preview_overlay}>` + `<div role="dialog">` + `e.stopPropagation()`로 BottomSheet를 직접 구현. `@/components/ui`에 `BottomSheet`가 이미 있고 다른 곳(`AdvancedFilterSheet`, `FilterDropdown` 모바일 모드)에서 사용 중.
- **영향**: ESC 닫기 / focus trap / `aria-modal` / 스크롤 잠금이 자체 구현분에 누락. 일관성 부족.
- **개선 방향**: `<BottomSheet open={previewOpen} onClose={...} title="미리보기">`로 교체.
- **우선순위**: 중간
- **관련 파일**: `src/components/admin/sermons/SermonForm/index.tsx:106-134`

### H. 검색 폼·필터 버튼·필터 시트의 Sermon/Series 쌍이 거의 동일 [전체 구조 / 컴포넌트 품질] [Claude 1차 단독]

- **문제**: 다음 쌍이 거의 완전한 복제 상태.
  - `SermonSearchForm` ↔ `SeriesSearchForm` (debounce + URL push 로직 동일, placeholder만 다름)
  - `ToolbarFilterButton` ↔ `SeriesFilterButton`
  - `AdvancedFilterSheet` ↔ `SeriesFilterBottomSheet`
  - `useSermonFilter` ↔ `useSeriesFilter`
- **영향**: 버그 수정·동작 변경 시 두 곳을 동기로 고쳐야 한다. 실제 `SermonSearchForm`의 디바운스 회귀 fix가 적용되었는데 `SeriesSearchForm`에도 동일 fix가 적용되어 있는지 항상 확인 부담.
- **개선 방향**: 과한 추상은 사용자 선호와 충돌하므로 2단계로 접근.
  - 1단계: `useFilterSearch(routePath, useFilter)` 같은 얇은 hook으로 debounce 로직만 묶고 컴포넌트는 placeholder만 다른 두 개 유지.
  - 2단계: 필요 시점에 `<FilterSearchForm path="..." filter={...} placeholder="..." />`로 통합.
- **우선순위**: 낮음~중간 (현재 양쪽 동기 유지 가능하지만 추가 필터 도입 시 발산 위험)
- **관련 파일**: `src/app/(content)/sermons/_component/SermonListPage/SermonSearchForm.tsx`, `src/app/(content)/sermons/_component/SeriesListPage/SeriesSearchForm.tsx`, `src/hooks/useSermonFilter.ts`, `src/hooks/useSeriesFilter.ts`

### I. `mapFormToDbInsert` ↔ `mapFormToDbUpdate` 본문 완전 동일 [비즈니스 로직] [Claude 1차 단독]

- **문제**: `lib/sermon-form-mapper.ts:8-46` 두 함수 본문이 한 줄도 다르지 않다. 리턴 타입만 다름.
- **영향**: 필드 추가 시 두 곳을 같이 수정해야 한다. 누락 시 insert/update가 어긋나는 버그 가능.
- **개선 방향**: 하나의 `mapFormToDbPayload` 함수로 통합 후 호출자에서 그대로 사용. 또는 `mapFormToDbUpdate = mapFormToDbInsert as (...)` 식의 alias. 리턴 타입은 모든 컬럼이 동일하므로 `Omit<SermonDbInsert, ...>`가 `Omit<SermonDbUpdate, ...>`에 할당 가능.
- **우선순위**: 낮음
- **관련 파일**: `src/lib/sermon-form-mapper.ts:8-46`

### J. `select('*')` + JS 집계의 광범위한 사용 [데이터 패칭 / 성능] [양쪽 합의]

- **문제**: 가벼운 select 분리 누락과 JS 집계가 곳곳에 있다.
  - `getSermons` / `getFeaturedSermon`이 항상 `SERMON_WITH_RELATIONS_SELECT`(resources 배열 포함). 홈 캐러셀이나 `SermonsPage`의 캐러셀은 sermon_resources를 화면에 쓰지 않는다.
- **Codex 보강**: `getAllSeries`(`:125`), `getAllPreachers`(`:207`), `adminStatusCounts`(`:327`) 모두 `select('*')` 후 JS에서 집계. 데이터가 늘면 sidebar/admin list 로딩 비용이 비선형 증가. `docs/tech-debt-tracker.md`에도 이미 등록된 항목.
- **영향**: 페이로드·직렬화 비용 증가, 캐시 키당 메모리 증가, status/year 집계의 시간 복잡도 증가.
- **개선 방향**: 화면별 narrow query 분리. count는 DB count 또는 RPC로 이동. 캐러셀·그리드용 가벼운 select 분리(`detailById`만 풀 join). 측정 후 결정 권장.
- **우선순위**: 중간
- **관련 파일**: `src/services/sermon/sermon-service.ts:28-40`, `:125`, `:207`, `:327`, `src/app/(content)/sermons/page.tsx:50`

### K. `<unknown as T>` 타입 단언 다수 (안전성 vs 가독성) [타입 안정성] [양쪽 합의]

- **문제**: `sermon-service.ts`에서 join 결과를 `(handled.data ?? []) as unknown as SermonWithRelations[]` 식으로 캐스팅하는 곳이 9곳. `mapFormToDbInsert`의 `service_type as SermonDbInsert['service_type']` 같은 단언도 존재.
- **영향**: 컴파일러가 join 결과 모양을 못 추론하므로 어쩔 수 없는 패턴이지만, 잘못된 select 변경이 런타임까지 노출 안 된다. 변경 시 잠재 사이드이펙트.
- **개선 방향**: Supabase의 `PostgrestResponse` generic을 더 적극적으로 사용하거나, select 상수를 `as const`로 만들고 `QueryData<typeof query>`로 묶기. `service_type` 단언은 type guard로 대체. 큰 리팩토링이므로 우선 단언 위치를 좁은 함수에 가두는 정도 권장.
- **우선순위**: 중간
- **관련 파일**: `src/services/sermon/sermon-service.ts` 전반(`:97`, `:133`, `:401` 등), `src/lib/sermon-form-mapper.ts:16`

### L. `SermonResourceInput`의 `url? / file?` invariant이 타입으로 표현 안 됨 [타입 안정성] [Claude 1차 단독]

- **문제**: 신규 리소스는 `file`이 있고 `url` 없음, 기존 보존은 `url`만 있고 `file` 없음 — invariant이 런타임에만 강제(`r.file ? upload : keep`). 타입은 둘 다 optional.
- **영향**: `toRpcResource`에서 `file_url: resource.url!` non-null assertion. 잘못된 분기가 들어오면 런타임 오류.
- **개선 방향**: discriminated union으로 분리.

```ts
type SermonResourceInput =
  | { kind: 'new'; id: string; name: string; size: number; fileType: SermonResourceType; file: File }
  | { kind: 'existing'; id: string; name: string; size: number; fileType: SermonResourceType; url: string };
```

- **우선순위**: 낮음 (현재 동작은 정상, 안전망)
- **관련 파일**: `src/types/sermon-form.ts:6-13`, `src/actions/sermon.action.ts:99-107`

### M. 데드코드 정리 (SeriesEpisodeList, detailBySlug, yearCounts) [전체 구조] [양쪽 합의]

- **문제**: `SermonSeriesSidebar`(detail 페이지에 실제 쓰임)와 `SeriesEpisodeList`(어디서도 사용 안 됨)가 둘 다 "시리즈 회차 리스트 + 현재 회차 강조" 책임을 가짐.
- **Codex 보강**: 데드코드 후보가 더 있다 — `sermon-service.ts:108`의 `detailBySlug` (services/sermon/index.ts에 wrapper 없음), `:240`의 `yearCounts` (wrapper 없음). 호출처 재확인 후 일괄 제거 또는 재사용 계획 명시.
- **영향**: 죽은 코드 + 코드 검색 시 혼란. 설교 상세/시리즈 로직을 읽을 때 실제 경로와 후보 경로가 섞여 유지보수 비용 증가.
- **개선 방향**: 별도 정리 task에서 삭제 또는 재사용 계획 명시. `SeriesEpisodeList`는 `tech-debt-tracker.md`에 등록되어 있음.
- **우선순위**: 낮음
- **관련 파일**: `src/app/(content)/sermons/_component/SeriesEpisodeList/`, `src/services/sermon/sermon-service.ts:108`, `:240`

### N. 어드민 시리즈·설교자 목록이 공개용 게이트 함수를 재사용 [전체 구조 / 데이터 경계] [Codex 단독]

- **문제**: `getAllPreachers` / `getAllSeries`는 공개 노출을 위해 `is_active=true` + `sermons!inner(count)` + `is_published=true` + `deleted_at IS NULL` 조건을 모두 건다. 어드민 새 설교 등록(`new/page.tsx`)과 어드민 리스트 필터(`page.tsx`)가 이 함수들을 그대로 사용.
- **영향**: 초안만 있는 설교자/시리즈, 발행된 설교가 0편인 새 설교자는 어드민 select에서 보이지 않는다. **새 설교자의 첫 설교 등록이 막힐 수 있다.** 어드민 워크플로 차원의 결함.
- **개선 방향**: `getAdminPreachers`, `getAdminSeries` 별도 함수를 `services/sermon/admin.ts`에 추가하고 어드민 페이지가 그것을 사용한다. 공개 count는 공개 쿼리에서만 유지.
- **우선순위**: 높음
- **관련 파일**: `src/services/sermon/sermon-service.ts:122-141`, `:204-223`, `src/app/(admin)/admin/sermons/new/page.tsx:5`, `src/app/(admin)/admin/sermons/page.tsx:27-29`, `src/app/(admin)/admin/sermons/[id]/edit/page.tsx`
- **예시**

```ts
// services/sermon/admin.ts에 추가 — published inner join 없이 전체 활성 항목
export const getAdminPreachers = async () => {
  const supabase = await createServerSideClient();
  const res = await supabase
    .from('preachers')
    .select('id, name, title, is_active')
    .order('sort_order', { ascending: true });
  return handleResponse(res).data ?? [];
};

export const getAdminSeries = async () => {
  const supabase = await createServerSideClient();
  const res = await supabase
    .from('sermon_series')
    .select('id, title, slug, is_active, ended_at')
    .order('started_at', { ascending: false });
  return handleResponse(res).data ?? [];
};
```

### O. 조회수 증가가 `revalidate=86400` 캐시에 가려짐 + RPC overload 깨짐 [데이터 패칭 / 비즈니스 로직] [Codex 단독 + 3차 보강]

- **문제 1 (캐시 vs 부수효과)**: `/sermons/[id]/page.tsx`가 `revalidate = 86400`(24시간 ISR)이고 RSC 본문 내부에서 `incrementSermonViewCount(sermon.id).catch(() => {})`를 호출한다. ISR 캐시 hit 시 RSC가 재실행되지 않아 조회수도 증가하지 않는다.
- **문제 2 (RPC overload — 3차 보강)**: `database.types.ts:596-608`을 보면 `increment_sermon_views`가 `int8`/`uuid` 두 overload로 생성되었고, 양쪽 `Returns` 타입이 `{ error: true } & "Could not choose the best candidate function between: public.increment_sermon_views(sermon_id => int8), public.increment_sermon_views(sermon_id => uuid). Try renaming..."` — typegen이 함수 후보 ambiguity를 error 타입으로 표현. **RPC 호출이 type-broken 상태**. 현재는 `.catch(() => {})`로 실패가 묵살되어 표면화 안 됨.
- **영향**: `view_count`가 신뢰할 수 없는 지표가 되고, 어드민 정렬(`AdminSermonSortKey: 'view_count'`)도 왜곡. route handler/`sendBeacon`으로 분리해도 같은 RPC를 그대로 쓰면 타입·호출 안정성 문제가 남는다.
- **개선 방향 (2가지를 함께)**:
  1. 조회수 증가를 클라이언트 `sendBeacon` 또는 별도 route handler(`POST /api/sermons/[id]/view`)로 분리. 클라이언트 mount 또는 영상 재생 시점에 호출.
  2. DB에서 `increment_sermon_views` 함수 overload를 정리(파라미터 이름을 `sermon_id_int` / `sermon_id_uuid`로 분리하거나, 한쪽을 drop) 또는 신규 RPC명(`increment_sermon_view_by_id` 등)을 만들고 타입을 재생성한다. typegen 결과가 명확한 단일 함수여야 한다.
- **우선순위**: 높음
- **관련 파일**: `src/app/(content)/sermons/[id]/page.tsx:50`, `:95`, `src/services/sermon/index.ts:54`, `src/services/sermon/sermon-service.ts:269`, `src/types/database.types.ts:596-608`
- **예시**

```ts
// 클라이언트 컴포넌트 mount 또는 영상 재생 시점
useEffect(() => {
  navigator.sendBeacon(`/api/sermons/${sermonId}/view`);
}, [sermonId]);
```

### P. 발행 조건 SSOT 부재 (세 곳이 다 다름) [비즈니스 로직] [Codex 단독]

- **문제**: 발행 조건이 위치마다 다르다.
  - `createSermonAction` / `updateSermonAction` validation: `title, sermonDate, preacherId, serviceType` (4개)
  - `Checklist` required 항목: 위 4개 + `scripture`(성경 구절). 영상은 optional.
  - `PublishCard` 안내 문구: "발행하려면 제목, 날짜, 설교자, **영상 연결**이 필요합니다"
  - `SermonVideoPlayer`: youtube만 처리, 그 외 "지원하지 않는 영상 형식입니다"
  - `Checklist` 라벨: "영상 연결 (YouTube/Vimeo)" — Vimeo는 실제 어디서도 처리 안 함
- **영향**: 운영자가 "발행 가능한 상태"를 잘못 이해한다. Vimeo / 영상 없는 설교 정책이 불명확하다.
- **개선 방향**: `validateSermonForm(formData): { ok: boolean; missing: string[] }` 함수를 `src/lib/sermon-form.ts`에 두고 Server Action / Checklist / PublishCard 안내가 같은 결과를 참조한다. Vimeo는 enum과 안내 문구에서 제거하거나 실제 지원을 추가.
- **우선순위**: 높음
- **관련 파일**: `src/actions/sermon.action.ts:118-124`, `:163-170`, `src/components/admin/sermons/SermonForm/Preview/Checklist.tsx:29-38`, `src/components/admin/sermons/SermonForm/sections/PublishCard.tsx:43-45`, `src/app/(content)/sermons/_component/SermonVideoPlayer/SermonVideoPlayer.tsx:35-41`

### Q. 공개 URL `preacher` 파라미터가 설교자 name 사용 [데이터 패칭 / 전체 구조] [Codex 단독]

- **문제**: `SermonSidebar`가 `buildSermonHref(params, { preacher: preacher.name })`로 설교자 이름을 URL param으로 박는다. `resolvePreacherName(name, allPreachers)`이 이름→UUID로 매핑한다. 시리즈는 slug 기반이라 일관성도 깨짐.
- **영향**: 동명이인 / 이름 변경 / 한글 인코딩 / 공백 처리 / SEO URL 안정성 모두 취약. 이름 변경이 발생하면 기존 공유 URL이 모두 깨진다.
- **개선 방향**: URL은 `preacherId`(UUID) 또는 `preacherSlug` 사용, 표시명은 UI에서만. `preachers` 테이블에 slug 컬럼 추가가 깔끔하지만 마이그레이션 비용 있음. 마이그레이션 시 기존 name URL은 redirect 처리.
- **우선순위**: 중간 (마이그레이션 비용 있음)
- **관련 파일**: `src/app/(content)/sermons/_component/SermonListPage/SermonSidebar.tsx:114`, `src/utils/sermon.ts:58-65`, `src/hooks/useSermonFilter.ts`

### R. 첨부 파일 경로 충돌 + drag/drop 안내 불일치 [비즈니스 로직 / 접근성] [Codex 단독]

- **문제 1**: `buildResourcePath`가 `${folder}/${sanitized}-${Date.now()}.${ext}`로 경로 생성. 같은 이름 + 같은 millisecond에 두 파일이 처리되면 충돌 가능. 어드민이 여러 파일을 한 번에 업로드하면 발생 가능.
- **문제 2**: `ResourcesCard`가 "클릭하여 업로드 또는 드래그"라고 안내하지만 컴포넌트에 `onDrop` / `onDragOver` 핸들러가 없다.
- **영향**: 충돌 발생 시 Supabase `upsert: false` 정책 때문에 업로드 실패. UX 안내가 실제 동작과 다름.
- **개선 방향**: 경로에 `crypto.randomUUID()` suffix 추가. drag/drop을 실제로 구현하거나 안내 문구에서 "드래그" 제거.
- **우선순위**: 중간
- **관련 파일**: `src/actions/sermon.action.ts:17-28`, `src/components/admin/sermons/SermonForm/sections/ResourcesCard.tsx:70-80`
- **예시**

```ts
// 경로 충돌 차단
function buildResourcePath(sermonDate: string, originalName: string): string {
  const folder = formattedDate(sermonDate, 'YYYY/MM');
  const ext = originalName.split('.').pop() ?? 'bin';
  const sanitized = sanitize(originalName);
  return `${folder}/${sanitized}-${crypto.randomUUID()}.${ext}`;
}
```

---

## 3. 우선순위 요약 (4차 검증 후 재조정)

설교 도메인 PR 범위에 포함하는 항목만 표시. B는 전역 정리 task로 이동했으므로 본 표에서 제외.

| 우선순위 | 항목 | 출처 |
| --- | --- | --- |
| 높음 | N. 어드민 시리즈·설교자 목록 분리 | Codex 단독 |
| 높음 | O. view count + revalidate 충돌 + RPC overload | Codex 단독 + 3차 보강 |
| 높음 | P. 발행 조건 SSOT | Codex 단독 |
| 높음 | A. PreviewCard 설교자 UUID 표시 | Claude 1차 단독 |
| 높음 | E. 어드민 행·`<th>` 키보드 미지원 | 양쪽 합의 |
| 중간 | C. 공개 검색 escape | 양쪽 합의 |
| 중간 | Q. 공개 URL preacher=name | Codex 단독 |
| 중간 | G. 모바일 미리보기 BottomSheet 미사용 | 양쪽 합의 |
| 중간 | R. 파일 경로 충돌 + drag/drop UX | Codex 단독 |
| 중간 | J. `select('*')` + JS 집계 | 양쪽 합의 |
| 중간 | K. 타입 단언 정리 | 양쪽 합의 |
| 낮음 | H. Sermon/Series 컴포넌트 쌍 통합 | Claude 1차 단독 |
| 낮음 | I. mapFormToDb 중복 | Claude 1차 단독 |
| 낮음 | L. SermonResourceInput discriminated union | Claude 1차 단독 |
| 낮음 | M. 데드코드 정리 | 양쪽 합의 |
| 낮음 | D. 홈 SermonCard `<img>` | 양쪽 합의 |

별도 trees:
- **F**: 비결함 (disclosure 패턴 — `sermons-a11y-perf` exec-plan에서 결정)
- **B (queueMicrotask 5건)**: 별도 전역 정리 task `queue-microtask-cleanup` — 우선순위 높음, 본 설교 도메인 PR 범위 밖

## 4. 종합 평가

- 의존 흐름과 캐시 태그 분리는 잘 되어 있다. 검증 로직(필수 4개 체크)이 server action 양쪽에 잘 박혀 있고, RPC 기반 원자 처리도 견고하다.
- **Codex 교차 검토 후 설교 도메인 PR의 상위 우선순위는 5건**(A, E, N, O, P). 새로 부각된 결함은 모두 "여러 레이어가 같은 규칙을 따라야 하는데 어긋난 곳"이다.
- **Claude 3·4차 자체 검증으로 1차의 과장 2건을 정정**했다 — F를 비결함으로 철회, 컴포넌트 위치 일반화 약화.
- **B는 lint 회피 의도(`react-hooks/set-state-in-effect`)가 있는 의도적 우회책으로 확인**되어 단순 제거가 위험. 청산은 컴포넌트 재구조 또는 `useEffectEvent`/ref 분리를 동반해야 함. 설교 도메인이 아닌 전역 부채라 별도 task로 이동.
- 구조 측면 부담은 "검색·필터 컴포넌트의 Sermon/Series 쌍"(H)이 향후 변경 비용을 키운다.

## 5. 후속 EXEC_PLAN 후보 (4차 검증 후 분리)

상위 우선순위 5건(A, E, N, O, P)을 한 PR로 묶기엔 무리. 의도별로 **4개 설교 PR + 1개 전역 task**로 분리. (메모리: 한 PR=한 의도의 입자를 응집 묶음으로)

1. **어드민 시리즈·설교자 목록 분리 PR** — `sermons-admin-taxonomy` (식별자 유지)
   - N (어드민 시리즈·설교자 목록 분리 — `getAdminPreachers`, `getAdminSeries` 신설)
   - 의도: 공개 ↔ 어드민 데이터 경계 정합화. 새 설교자/시리즈의 첫 등록 흐름 복원.

2. **조회수 부수효과 분리 PR** — `sermons-view-count-side-effect`
   - O (view count → 클라이언트/route handler 분리 + RPC overload 정리)
   - 의도: 캐시 정책과 부수효과 분리, RPC 타입 깨짐 해소. DB 마이그레이션 동반.

3. **발행 흐름 SSOT PR** — `sermons-publish-ssot`
   - P (validateSermonForm SSOT)
   - A (PreviewCard 설교자 UUID 표시 수정)
   - 의도: 어드민 폼의 SSOT 폴리시. 발행 조건과 미리보기의 일관성.

4. **어드민 인터랙션 접근성 PR** — `sermons-admin-interaction`
   - E (행·`<th>` 키보드 + 모바일 카드 링크화)
   - 의도: 어드민 핵심 업무 화면 접근성·키보드 조작.
   - 검증: `yarn lint`, 키보드 조작 수동 확인.

5. **전역 정리 task** — `queue-microtask-cleanup` (설교 도메인 PR 범위 밖)
   - B (설교 어드민 2건 + 전역 3건 = `queueMicrotask` 5건)
   - 목표: 5건 청산 또는 정당한 예외에 line-disable + 사유 주석.
   - 청산 분기:
     - 컴포넌트 재구조 (tech-debt 노트의 "SermonListPage 재구조" 경로)
     - `useEffectEvent` 또는 ref 분리로 setState 시점 분리
   - 검증: `rg "queueMicrotask" src` 0건, `yarn lint` PASS(`react-hooks/set-state-in-effect` 재발 0건).
   - 필요 시: `react-hooks/set-state-in-effect` 회피 패턴을 별도 메모 또는 `tech-debt-tracker.md`에 추가 기록.

중간 우선순위(C, G, J, K, Q, R)는 별도 PR 또는 묶어서 차후 진행. 낮음 우선순위는 정리 task에서 일괄.
