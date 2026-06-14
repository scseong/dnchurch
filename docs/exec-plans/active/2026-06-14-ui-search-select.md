# ui-search-select

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-14
- **브랜치**: feat/ui-search-select
- **Open questions**: none (admin/content 분기 제거 — SearchField는 기본 시맨틱 토큰 1벌. `.shell` cascade는 WORK 중 불가 판명, 사용자 승인으로 폐기)
- **ADR needed**: no — ui/ 신규 컴포넌트는 ADR 0004 범위. admin 토큰 분기를 두지 않는 건 ADR 0012("`-admin` 토큰은 admin 전용")와 일치 — 공용 컴포넌트는 기본 토큰을 쓴다.

## 목표

흩어진 검색 입력 5종을 `ui/SearchField` 하나로 모은다. 입력 어휘를 ui/로 통일하고, 거의 복제인 Sermon/Series 검색을 합친다. 공용 컴포넌트라 기본 시맨틱 토큰 1벌만 쓰고 admin/content 톤 분기는 두지 않는다 — admin은 2~3명이 보는 면이고, cool tone은 테이블·사이드바처럼 정보가 빽빽한 면에 필요하지 검색 입력 하나에는 필요 없다(사용자 결정). (Codex 권고로 `ui/Select`는 분리해 후속 task로 둔다.)

## 검증된 Assumptions

(explorer가 지정 11파일 + ui barrel + 토큰 정의를 읽고 확인)

- 검색 5종(admin `SearchBox`, `SermonSearchForm`, `SeriesSearchForm`, `NoticeSearchBar`, `NoticeControlBar`)은 "컨테이너 + leading 검색 아이콘 + input + 조건부 trailing clear" 구조를 공유한다.
- `SermonSearchForm`↔`SeriesSearchForm`은 차이가 3곳(filter hook·placeholder·aria-label)뿐인 복제다.
- 상태 소유가 갈린다 — admin `SearchBox`는 부모 소유(`value`·`onChange`·`onClear`·`isPending` props), content 2종은 자체(`useDebounce` 300 + filter hook + URL), notices 2종은 자체 submit-only.
- clear 아이콘이 3종 혼재한다(`HiX`·`IoClose`·`IoCloseCircle`), 아이콘 라이브러리도 `hi` vs `io5`로 갈린다.
- `ui/TextField`·`ui/Button`이 `forwardRef` + `leadingIcon`/`trailingSlot` 슬롯 선례를 준다.
- (WORK 중 정정) `.shell`은 CSS Module 해시 클래스라 `:global(.shell)` 매칭이 안 된다. ADR 0012가 admin 토큰을 컴파일타임 SCSS 변수로 확정해 런타임 톤 cascade 장치 자체가 없다. → SearchField에 admin/content 분기를 두지 않고 기본 토큰 1벌로 간다(Option C, 사용자 승인).
- `$border-admin` 토큰에 "콘텐츠 영역 사용 금지" 주석이 있다 — 공용 컴포넌트는 admin 토큰을 쓰지 않고 기본 시맨틱 토큰을 쓴다(ADR 0012와 일치).
- `NoticeSearchBar.module.scss`가 `--notice-*` CSS 변수를 쓰는데 레포에 선언·폴백이 없다(explorer grep 0건). 검색 입력을 ui/SearchField로 옮기면 이 깨진 참조가 search 영역에서 사라진다.

## Success Criteria

- `src/components/ui/SearchField/`를 신설하고 barrel에 export한다. **제어 컴포넌트** — props: `value`, `onChange:(value: string) => void`, `onClear?`, `onSubmit?`, `loading?`, `placeholder`, `aria-label`. 기본 leading 검색 아이콘.
- **clear 계약**: clear 버튼은 `value`가 있을 때만 뜬다. 누르면 `onClear`가 있으면 그것을, 없으면 `onChange('')`를 부른다(admin은 onClear, content는 onChange 모델 둘 다 수용). clear 뒤 input에 focus를 되돌린다. 버튼은 `type="button"`, `aria-label="검색어 지우기"`. clear 아이콘은 `IoClose` 1종으로 통일한다.
- **loading**: `loading`이면 검색 아이콘 자리에 스피너를 보이고 컨테이너에 `aria-busy`. 미지정이면 영향 0(admin `isPending` → `loading`으로 매핑).
- a11y: SearchField는 검색 landmark를 직접 내지 않는다(landmark-neutral). landmark는 caller가 `<search>`로 감싸 소유한다 — Sermon/Series/NoticeControlBar는 `<search>`로 감싸고(NoticeControlBar는 기존 `role="search"`를 `<search>`로 교체), admin은 live search라 landmark를 두지 않는다. 페이지당 search landmark 1개라 이름 충돌 없음(Codex 1차 확인). input `aria-label`은 prop으로 받는다.
- **토큰**: 기본 시맨틱 토큰 1벌(`$border-primary`·`$txt-tertiary`·`$primary` 등). admin/content 분기 없음. `-admin`·`-soft` 토큰 0건. 하드코딩 px·hex 0(토큰·믹스인 사용).
- `SermonSearchForm`·`SeriesSearchForm`이 ui/SearchField를 쓴다 — 두 폼의 검색 마크업·핸들러 중복 0. debounce·URL 동기화는 호출부에 그대로 둔다.
- admin `SearchBox`·`NoticeControlBar` 검색 입력이 ui/SearchField를 쓴다. NoticeSearchBar와 그 유일 사용처였던 SortBottomSheet는 dead code(src import 0)라 이관 대신 삭제 — `--notice-*` 깨진 참조 12건이 전부 사라진다(사용자 결정).
- `node scripts/verify-task.mjs ui-search-select` lint·stylelint·build 통과, knip 신규 0.
- Claude in Chrome: `/sermons`·`/sermons/series`·`/news/notices`(PC·모바일)·admin 설교 목록에서 검색이 렌더되고 입력·clear·Enter가 동작하며 콘솔 에러 0. admin 검색창은 기본 토큰(neutral)으로 렌더되며 주변과 어색하지 않은지 확인.

## 영향받는 파일

- 신설: `src/components/ui/SearchField/{SearchField.tsx, SearchField.module.scss}`, `src/components/ui/index.ts`(barrel)
- 검색 이관: `SermonSearchForm`·`SeriesSearchForm`·`NoticeControlBar`(+각 module.scss에서 search 영역 정리). admin은 `SearchBox.tsx`를 지우고 부모 `SermonListPage/index.tsx`가 SearchField를 직접 사용(`index.module.scss`의 `.search_box`는 flex 사이징만 남김).
- 삭제(dead code 5파일): `parts/SearchBox.tsx`(admin 래퍼), `NoticeSearchBar.{tsx,module.scss}`, `SortBottomSheet.{tsx,module.scss}`(NoticeSearchBar 전이적 dead).

## Non-goals

- `ui/Select` 신설 + notices PC sort/category select 이관 — 후속 task(PR2). Codex 권고로 분리.
- admin primitives `Select`(`useFieldContext` 종속), BottomSheet 모바일 셀렉트 — 후속.
- EmptyState 통합 — 이미 끝났다(sermons 4곳).
- debounce·URL 동기화 로직 변경 — 호출부에 그대로 둔다.
- `NoticeControlBar`의 `queueMicrotask`(금지 패턴) 제거 — URL 동기화 로직이라 검색 입력 이관 범위 밖. 이미 tech-debt 등록분(중복 추가 안 함).
- 공지 sort 기능 전체 정리(`NOTICE_SORT_OPTIONS` 상수·`sort` 파라미터 plumbing) — SortBottomSheet 삭제로 sort 입력 UI는 사라졌으나 상수·타입·서비스 plumbing은 별도 "공지 sort 기능 dead 여부" 검토로 분리.

## 단계별 체크리스트

- [x] 1. ui/SearchField 신설 — 제어 입력 + leading 검색 아이콘 + 조건부 clear(`IoClose`, `type="button"`, `aria-label`, focus 복귀) + `loading` 스피너·`aria-busy`. 기본 시맨틱 토큰 1벌(admin 분기 없음). `'use client'`(useRef). barrel export.
- [x] 2. `SermonSearchForm` → ui/SearchField (debounce·filter 호출부 유지).
- [x] 3. `SeriesSearchForm` → ui/SearchField (복제 제거).
- [x] 4. admin `SearchBox`(래퍼) 삭제 → 부모가 SearchField 직접 사용 (`isPending`→`loading`, `.search_box`는 사이징만).
- [x] 5. `NoticeControlBar` 검색 → ui/SearchField. `NoticeSearchBar` + 전이적 dead `SortBottomSheet` 삭제 → `--notice-*` 12건 전부 사라짐.
- [x] 6. tech-debt: `--notice-*`는 삭제로 해소(등록 안 함). `queueMicrotask`는 기존 등록분 유지. `SortBottomSheet`는 삭제로 portal hydration 항목에서 제거.
- [x] 7. `verify-task` PASS + Claude in Chrome 5경로 검증(admin 시각만 사용자 확인 남음).

## Verification

- `node scripts/verify-task.mjs ui-search-select`
- Claude in Chrome: 위 4영역 검색 렌더·입력·clear·Enter·콘솔 0. admin 검색창 neutral 토큰이 어색하지 않은지 시각 확인.

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST(1차) → 3건 반영 → 2차에서 `role="search"` 1줄 보완으로 PASS 동등. Codex 2차 표현: "수정 범위가 SC 한 줄이라 재검토 없이 반영 후 WORK 진입".
- **현재 판단**: CR1(범위 분리)·CR2(`.shell` cascade) 완전 해소. CR3는 SearchField를 landmark-neutral(검색 landmark 미발행, 소유는 caller)로 고쳐 마무리.
- **다음 행동**: WORK 진입 — step 1 ui/SearchField부터.
- **WORK 중 정정(2026-06-14)**: `.shell` cascade는 못 쓴다. `.shell`이 CSS Module 해시 클래스라 런타임에 톤을 바꿀 셀렉터가 없고, admin 토큰은 ADR 0012로 컴파일타임 SCSS 변수가 돼 cascade 장치 자체가 없다. 그래서 admin/content 분기를 빼고 기본 토큰 1벌만 쓰기로(plan의 Option C) 사용자가 승인했다. landmark-neutral 결정은 그대로 둔다.

## Codex 1차 검증

- **결론**: 조건부 통과 — 버그·레이어·타입 결함 0. LANDMINE 2건·A11Y 다수는 권고.
- **현재 판단**: spread 순서·`onClear` JSDoc 2건을 반영했다. landmark 충돌·loading live region·조건부 타입·hit target은 보류했다(근거는 검증 이력). 점검 중 NoticeSearchBar가 dead code(src import 0)임을 찾아 이관 대신 삭제로 돌렸다.
- **다음 행동**: verify-task + Claude in Chrome.

## Claude 2차 검증

- **최종 판단**: 통과. 자동 검증 4종 PASS(verify 로그), Chrome 5경로 동작 확인(아래 표).
- **자동 검증**: ESLint·stylelint·build 통과. Knip은 신규 0 — 미사용 파일이 15개에서 13개로 줄었고, `NOTICE_SORT_OPTIONS`는 안 떴고, 새 `SearchField` export는 4곳이 쓴다.

| 경로 | 렌더 | 입력·clear·focus | landmark | 콘솔 |
| --- | --- | --- | --- | --- |
| /sermons/all PC(사이드바) | ✓ | JS 확인 — clear 후 `activeElement=input`, 빈 값에서 clear 숨김 | `<search>`+form `role=null`, 페이지 1개 | 기존 `BottomSheet` hydration 1건(무관) |
| /sermons/series PC | ✓ | 구조 확인(aria-label·form·search) | `<search>`+form `role=null` | — |
| /news/notices PC | ✓ (분류 셀렉트 공존) | 구조 확인 | 페이지 search landmark 1개(중복 없음) | — |
| /sermons/all 모바일(toolbar) | ✓ | "마가" 입력 → `?q=마가` 필터(2건), clear 노출 | 보이는 search landmark 1개(사이드바 `display:none` 제외) | — |
| /admin/sermons | ✓ neutral 톤이 필터 버튼과 같은 회색 border로 어울림 | "열왕" 입력→필터(1개), clear 후 focus 복귀·clear 숨김·`<div>`(live search) | 없음(부모 소유, onSubmit 미사용) | 기존 BottomSheet hydration 1건(PreacherFilter dropdown, 무관) |

- **admin 시각 확인 완료**: 사용자가 admin 로그인 후 재검증. neutral 톤이 필터 드롭다운과 어색하지 않음을 확대 비교로 확인. Option C 결정 유효.
- **콘솔 에러**: SearchField 경로 0건. /sermons/all·/admin/sermons의 각 1건은 기존 `BottomSheet` hydration mismatch(tech-debt 등록분, 내 변경 무관 — 트리에서 SearchField 아래 BottomSheet가 원인).
- **다음 행동**: doc-editor → 사용자 COMMIT 승인.

## 검증 이력

<details>
<summary>2026-06-14 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: SearchField·Select 단일 PR 과대, surface vs .shell 미결정, a11y·계약 누락.
- 조치: SearchField로 범위 분리, `.shell` cascade 채택, clear 계약·a11y SC 추가.

</details>

<details>
<summary>2026-06-14 Codex 계획 검증 2차</summary>

- 판정: CHANGE_REQUEST → 1줄 보완으로 PASS 동등
- 이유: `role="search"` 조건부가 런타임 DOM 조상 확인이라 footgun.
- 조치: SearchField를 landmark-neutral로, landmark 소유는 caller로 SC 수정.

</details>

<details>
<summary>2026-06-14 Codex 1차 검증 — 권고 처리</summary>

- 반영: `{...inputProps}` spread를 명시 prop 앞으로 옮겨 `type`·`value`·`onChange` 덮어쓰기를 막았다. `onClear`가 value 초기화를 책임진다는 계약을 JSDoc에 적었다.
- 보류: 복수 `<search>` 이름 충돌은 페이지당 landmark가 1개라 안 생긴다(헤더 검색 없음). loading을 읽어주는 live region은 admin 1곳의 짧은 전이라 `aria-busy`로 갈음한다. `aria-label` require-one-of·`onSubmit` 타입가드는 caller가 다 지켜 조건부 타입을 안 넣는다. clear hit target은 `align-self: stretch`로 ~40×44px이고 Chrome에서 확인했다.
- 범위 변경: dead code인 NoticeSearchBar와 그 전이로 죽은 SortBottomSheet를 삭제했다.

</details>

## 후속 작업

- `ui/Select` 신설 + notices PC sort/category select 이관 (PR2)
  - 이유: 독립 검증 축이라 SearchField와 분리(Codex 권고). 회귀 격리.
  - 다음 기준: 본 task 머지 후 `start-task.mjs`로 `ui-select` slug 생성.
  - 기록 위치: 없음 (본 exec-plan 후속)
- admin primitives `Select` → ui/Select 이관 (Field 통합 포함)
  - 이유: `useFieldContext` 종속이라 admin 폼 Field 시스템과 함께 풀어야 한다.
  - 다음 기준: ui/Select API 안정 후.
  - 기록 위치: 없음
- `SortBottomSheet` 등 모바일 셀렉트를 ui/BottomSheet로 재구성
  - 이유: 포털·스크롤락 직접 재구현이라 ui/BottomSheet 재사용이 맞다.
  - 다음 기준: ui/Select 정착 후.
  - 기록 위치: `docs/tech-debt/active.md`(이번에 등록)
