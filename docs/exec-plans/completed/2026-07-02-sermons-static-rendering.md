# sermons-static-rendering

- **상태**: ✅ 완료 (2026-07-02)
- **시작일**: 2026-07-02
- **브랜치**: develop (작업 브랜치 분리 예정: refactor/sermons-static-rendering)
- **Open questions**: none
- **ADR needed**: no — next.config.ts에 redirects() 6항목을 추가하지만 새 정책·구조가 아니라 페이지 안의 redirect 로직을 빌드 설정으로 옮기는 일회성 구현 판단 (상세 `## ADR 판단`)

## 목표

설교 페이지들을 콘텐츠 성격(주 1회 갱신)에 맞는 렌더링 모드로 되돌린다. `/sermons`는 완전 정적(○), `/sermons/[id]`·`/sermons/series/[id]`는 빌드 시점 정적 생성 후 하루 주기 재검증(SSG+ISR, ●)으로 바꾸고, `/sermons/all`만 정당한 dynamic으로 남긴다.

## 검증된 Assumptions

- `/sermons`가 dynamic인 유일한 원인은 레거시 필터 URL redirect용 `searchParams` 접근 — `src/app/(content)/sermons/page.tsx:37-46` 직접 확인. 본문 데이터 3종은 전부 static client
- redirect 대상 키는 6개 — `SERMON_FILTER_KEYS` 4개(`series`·`preacher`·`q`·`year`, `src/utils/sermon.ts:99`)에 `sort`(`SERMON_URL_KEYS`, `:101`)와 별도 파싱되는 `page`(`:113`)를 더한 것
- `/sermons/series`(목록)는 이미 정적 — 2026-07-02 빌드 로그 `logs/sermon-view-count-fix/20260702-143454/build-next.log` `○ /sermons/series 1d`. 이번 변경 대상 아님, 유지만 확인
- `/sermons/[id]`·`/sermons/series/[id]`는 `revalidate = 86400` 선언에도 generateStaticParams 부재로 빌드 마커 ƒ — 이전 task(sermon-view-count-fix) 빌드 로그. 주보 상세는 generateStaticParams(10건)로 ● + Revalidate 1d 표시 — `news/bulletins/[id]/page.tsx:34-45` 선례
- `getFilteredSermons`는 이미 static client 캐시 경유 (`services/sermon/index.ts:60-65` → `getSermons` → `createStaticClient(sermonCache.list())`) — **이전 대화의 "createServerSideClient 사용" 판단은 explorer 줄 번호 오독이었고, 캐시 전환 항목은 불필요**
- `allSeries`는 활성(is_active) 시리즈만 id 포함 반환 — `sermon-service.ts:135-146`. 시리즈 상세 generateStaticParams에 재사용 가능
- sermon id 목록용 경량 쿼리는 없음 — `sermon-service.ts` grep. 신규 추가 필요
- `/sermons/[id]`에 비숫자 id 가드 없음 — `Number('abc')` = NaN이 쿼리에 닿아 500 계열. 주보는 `isNumeric` 가드로 404 (`bulletins/[id]/page.tsx:52`)

## Success Criteria

- [x] `next build` 라우트 표에서 `/sermons` = `○`, `/sermons/[id]` = `●`(1d, 프리렌더 id 1·2·3 포함), `/sermons/series/[id]` = `●`(1d), `/sermons/series` = `○` 유지, `/sermons/all` = `ƒ` 유지 — run 20260702-160150 build-next.log
- [x] 6개 필터 키 각각 307 + `Location: /sermons/all?<key>=x`. 조합 `?series=x&utm_source=y` → `/sermons/all?series=x&utm_source=y` 쿼리 전체 보존 (yarn start 실측)
- [x] 미등록 키 `?utm_source=x` → 200 (redirect 없음). 빈 값 `?series=` → 200 (D1 수용대로)
- [x] `/sermons/abc` → 404
- [x] 동작 보존: `/sermons` 본문 "설교" 매치, `/sermons/all?series=none` "전체 설교" 매치, `/sermons/5` → 200
- [x] `node scripts/verify-task.mjs sermons-static-rendering` 통과 (run 20260702-160150, knip 98줄 이전 run과 동일 — 신규 0)

## 접근법

1. **`/sermons` 정적화**: `page.tsx`의 searchParams redirect 루프 제거. `next.config.ts` `redirects()`에 6개 필터 키별 `has: [{ type: 'query', key: <key> }]` 항목 추가 (destination `/sermons/all`, `permanent: false`, 쿼리는 기본 보존).
2. **상세 2곳 SSG+ISR**: `sermon-service`에 `publishedIds(limit)` 경량 쿼리 신설(`select('id')` + is_published + 미삭제 + sermon_date desc + limit) → `getPublishedSermonIds` 진입점(`sermonCache.list()` 태그). `/sermons/[id]`에 generateStaticParams(최근 10건 — 주보 선례와 동일 규모). `/sermons/series/[id]`는 기존 `getAllSeries()` 재사용해 활성 시리즈 id 전체 프리렌더. 나머지 id는 dynamicParams(기본 true)로 첫 방문 시 렌더 후 캐시.
3. **비숫자 id 가드**: `/sermons/[id]`에 주보와 같은 숫자 가드 → `notFound()`.

**동작이 바뀌는 지점 (사전 명시)**:
- 지금은 `/sermons?utm_source=x` 같은 **임의의** 쿼리도 `/sermons/all`로 redirect된다. 변경 후에는 필터 키 6개만 redirect되고 나머지 쿼리는 `/sermons`에 그대로 머문다 — 공유 추적 파라미터가 붙은 링크가 엉뚱하게 전체 목록으로 가던 동작이 고쳐지는 쪽.
- `/sermons/abc`가 에러 화면(500 계열) 대신 404를 반환한다.
- 빈 값 필터 쿼리(`?series=`)는 redirect되지 않고 `/sermons`에 머문다 — 값이 있어야 `has` matcher가 매칭 (D1 수용).

## 영향받는 파일

- `next.config.ts` — redirects() 추가 (ADR_TRIGGER_PARTS)
- `src/app/(content)/sermons/page.tsx` — searchParams·redirect 제거
- `src/app/(content)/sermons/[id]/page.tsx` — generateStaticParams + 숫자 가드
- `src/app/(content)/sermons/series/[id]/page.tsx` — generateStaticParams
- `src/services/sermon/sermon-service.ts`, `src/services/sermon/index.ts` — publishedIds 신설

## Non-goals

- `/sermons/all`의 렌더링 모드 변경 — searchParams 기반이라 dynamic이 정당. loading.tsx/Suspense는 감사 P4에서 별도
- `/sermons/series`(목록) 변경 — 이미 정적(○). Success Criteria(SC)에서 유지만 확인
- `getFilteredSermons` 캐시 전환 — 이미 static client 경유로 확인돼 불필요
- 주보 `allIds` 전 행 스캔 방식 정리 — 기존 부채 영역

## 단계별 체크리스트

- [x] 1. `publishedIds` 서비스 + `getPublishedSermonIds` 진입점
- [x] 2. `/sermons/[id]` generateStaticParams + 숫자 가드
- [x] 3. `/sermons/series/[id]` generateStaticParams (getAllSeries 재사용)
- [x] 4. `/sermons` redirect 제거 + next.config redirects() 6항목
- [x] 5. 빌드 마커 확인 (○·●·● / all은 ƒ 유지) + redirect curl 확인
- [x] 6. verify-task

## Verification

- `node scripts/verify-task.mjs sermons-static-rendering`
- 빌드 로그 라우트 표 대조 (`logs/<task>/<run>/build-next.log`)
- `next start`(또는 dev) 상태에서 `curl -sI "http://localhost:3000/sermons?series=x"` → 307/308 + Location `/sermons/all?series=x`, 6키 반복 + 미등록 키(`?utm_source=x`)는 200

## ADR 판단

불필요 — `next.config.ts` 변경이지만 새 라이브러리·구조·정책이 아니라 페이지 내부 redirect의 위치 이동이다. redirect 대상·키는 `src/utils/sermon.ts`의 기존 상수 체계를 따른다. `src/services/`도 ADR trigger에 해당하나 id 전용 read helper 1개 추가뿐이라 레이어 책임 변화가 없다. 영구 결정이 필요해지는 시점(예: redirect 정책 일반화)에 승격한다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high) → 반영 완료
- **현재 판단**: 계획 문장과 검증 기준의 빈틈 2곳(`/sermons/series` 모드 명시, 동작 보존 SC의 판정 기준)을 좁히라는 요구였고, 구현 방식 자체(redirect 이전·generateStaticParams·가드)는 전부 승인됐다. 반영 내역은 검증 이력 참조.
- **다음 행동**: WORK 진입 (CR 반영이 계획 수정으로 끝나 재요청 불필요)

### Codex 계획 검증 결과 (결론 발췌)

```
**4. Success Criteria + Verification**
- [material] `/sermons/series = ○` 기준이 없습니다. 계획 SC는 `/sermons`, `/sermons/[id]`, `/sermons/series/[id]`만 봅니다.
- [material] "기존 동작 보존"은 pass/fail이 아닙니다. `curl -s http://localhost:3000/sermons | rg "설교"` 같은 named artifact가 필요합니다.

CHANGE_REQUEST confidence: high
```

평이 풀이: 검증 기준의 빈틈 2곳을 좁히라는 요구다.

## Codex 1차 검증

- **결론**: FIX_APPLIED (지적 1건을 수용하고 D1에 기록, 코드 변경 없음)
- **현재 판단**: 빈 값 쿼리(`?series=` 등)는 `has` matcher가 잡지 않아 redirect되지 않는다는 지적. D1 판단으로 수용하고 동작 변경 목록에 명시했다. 나머지 질의 4건은 이상 없음 — 빌드 시점 태그 생성 정상, uuid string param 타입 일치, `isNumeric`(`^\d+$`) 엣지 안전, route group·trailing slash 충돌 없음.
- **다음 행동**: Claude 2차 검증 (build 마커·redirect curl + verify-task)

### Codex 1차 검증 결과 (verbatim, 결론부)

> `has.value`를 생략한 matcher는 Next 소스(`!hasItem.value && value`)상 값이 truthy일 때만 매칭합니다. **`?series=` 또는 `?page=` 처럼 빈 값으로 도착한 요청은 redirect에 걸리지 않습니다.** … 구조 판단이 필요해 Claude Code로 반환합니다.

풀이: 빈 값 쿼리만 예외적으로 redirect에서 빠진다 — 아래 D1로 수용 여부를 정했다.

## 의사결정 로그

- **D1 — 빈 값 필터 쿼리(`?series=`)의 redirect 누락을 수용**
  - 문제: `has` matcher는 값이 있어야 매칭해서, `?series=`처럼 빈 값으로 온 요청은 `/sermons/all`로 안 가고 `/sermons`에 머문다. 구 동작은 이 경우도 redirect했다.
  - 해결: 수용했다 — 빈 값 필터 URL을 만드는 경로가 코드에 없고(`buildSermonHref`는 빈 값을 생략), 구 동작에서도 빈 필터라 전체 목록에 떨어질 뿐이었다. 정적 홈에 머무는 쪽이 사용자에게 손해가 아니고, 이 케이스를 위해 middleware나 page-level fallback을 되살리면 정적화 목적이 깨진다.
  - 결과: 코드 변경 없음. 동작 변경 목록에 "빈 값 쿼리는 redirect 안 됨" 1줄 추가.

## Claude 2차 검증

- **최종 판단**: PASS — 빌드 마커·redirect·404·동작 보존 curl 전부 SC대로 확인, verify-task 통과.
- **현재 판단**: Codex 지적(빈 값 쿼리)은 D1 수용으로 닫았고 코드 수정 없음. knip 98줄이 이전 run과 완전 동일해 신규 미사용 코드 없음. 프리렌더 산출도 실데이터와 일치 — 설교 id 1·2·3 등, 활성 시리즈 1건.
- **다음 행동**: 사용자 승인 후 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260702-160150 | ✅ | ✅ | ✅ | 0 | yarn start 실측 — redirect 6키+조합 307 보존, utm/빈값 200, abc 404, 본문 매치 2종 |

## 검증 이력

<details>
<summary>2026-07-02 Codex 계획 검증 1차 (CHANGE_REQUEST) 반영 내역</summary>

- 판정: CHANGE_REQUEST → 계획 수정으로 해소
- material ①: `/sermons/series` 모드 미명시 → 최신 빌드 로그(20260702-143454)에서 이미 `○` 확인, Assumptions·SC·Non-goals에 "유지 확인" 명시 (Codex 인용 로그는 6/26 옛 것)
- material ② + 표현 3건: 동작 보존 SC를 curl 3종으로 교체, 필터 키 근거 표기 정정(4+1+1), redirect 조합 케이스 추가, ADR 판단에 services 문장 보강. 질의 5건은 이상 없음 — generateMetadata가 두 번 불려도 memoize와 data cache가 중복 조회를 막는다 등

</details>

## 회고

- **잘된 것**: 렌더링 모드를 "이 페이지의 HTML이 무엇에 의존하는가"라는 한 기준으로 세 갈래(정적·SSG+ISR·dynamic)로 갈랐다. `/sermons`는 유일한 dynamic 유발 원인이 레거시 필터 redirect의 searchParams 읽기였음을 코드로 짚고 그것만 next.config로 옮겨 정적화했다(Perf 86→90 사용자 실측). Codex 계획 검증이 `/sermons/series` 목록 모드 누락을 잡아 SC에 유지 확인을 넣었고, 1차 검증이 빈 값 쿼리 redirect 누락을 잡았다(D1 수용). 빌드 마커·redirect·404·동작 보존을 yarn start 실측 curl로 확인했다.
- **다음에 할 것**: `/sermons/all` loading.tsx/Suspense(감사 P4), 공개 `<img>`→`<Image>` 3건, PhotoSwipe dynamic. `getFilteredSermons`가 이미 static client 경유임을 확인해 캐시 전환 항목은 불필요로 정리했다(explorer 초기 오독 정정).
- **발견된 부채**: 신규 없음. knip 98줄이 직전 run과 동일해 이번 변경으로 생긴 미사용 코드 0건.

## 후속 작업

- `/sermons/all` loading.tsx/Suspense (감사 P4)
  - 이유: 이번 범위는 렌더링 모드 정리만
  - 다음 기준: P4 렌더링 폴리시 진행 시
  - 기록 위치: `docs/research/2026-07-02-refactor-audit.md` P4 (로컬)
