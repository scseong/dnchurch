# p5-select-narrowing

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-02
- **브랜치**: refactor/p5-select-narrowing
- **Open questions**: none
- **ADR needed**: no — 셀렉트와 타입 계약을 좁히고 죽은 쿼리를 지운다. 레이어 서열, 캐시, 인증, 데이터 흐름은 그대로다

## 목표

감사 P5: 목록 쿼리들이 상세용 넓은 셀렉트를 공유하던 것을 소비처가 실제 읽는 필드로 좁힌다. PR #91 회귀(소비처 감사 누락 → `cover_image_url` 유실)의 재도전이라, **타입을 먼저 좁혀 tsc가 누락을 잡는 그물**로 삼고 공유 상수 대신 경로별 전용 셀렉트를 만든다.

## 검증된 Assumptions

explorer 전수 맵(도구 호출 68회)으로 훑고, 무게가 실리는 단정은 직접 다시 검증했다. 근거 명령을 함께 적는다.

- **A. `list()` 소비처(5곳: featured·recent 캐러셀·/sermons/all·다른설교·sitemap)는 `sermon_resources`를 안 읽는다** — `rg '\.sermon_resources' src` 2건뿐: `SermonDetailSections.tsx:61`(상세)·`sermon-form-mapper.ts:64`(어드민 폼). 목록 union은 기존 `SermonCardItem` 필드와 일치(+preacher name·title, series id·slug·title).
- **B. 회차(bySeriesSlug·bySeriesId episodes) 소비처는 관계 3종을 전부 안 읽는다** — `rg 'preacher|\.content' SeriesDetailPage/` 0건. 필요 스칼라 9개: id, series_order, sermon_date, video_id, video_provider, thumbnail_url, title, scripture, duration.
- **C. bulletins에서 `content`·`updated_at`·`view_count`를 읽는 곳 0** — `rg '\.content\b' src`는 notices뿐. bulletins union: id, title, sunday_date, created_at, author_id. bulletin_images union: id, cloudinary_id, order_index (`bulletin_id`·`created_at` 미사용).
- **D. getAllSeries union: id, slug, title, description, cover_image_url, started_at, ended_at (+sermon_count)** — `year`·`created_at`만 제거 가능. **PR #91 회귀 필드 `cover_image_url`은 SeriesCard:12가 읽으므로 유지 필수.** getAllPreachers union: id, name, title (+sermon_count) — bio·photo_url·created_at·updated_at 제거 가능.
- admin은 별도 쿼리(`getAdminSeries/getAdminPreachers`, `select('*')`)로 타입만 공유 — 타입을 union으로 좁혀도 superset 셀렉트라 구조적으로 만족.
- Pick 키는 전부 실존 — `database.types.ts` Row 대조(bulletins·bulletin_images·sermon_series·preachers).
- 죽은 코드 2건 확정: `sermonService.detailBySlug`(wrapper 없음, 호출 0)·`getBulletinList`+`bulletinService.list()`(deprecated, summary는 listQuery 직접 사용) — `rg` 정의 외 0건.
- 선례: `recent()`가 이미 좁은 셀렉트+`SermonListItem` 타입 패턴 — 이번 작업이 따라갈 모양.

## Success Criteria

- **타입 그물**: 타입을 소비처 union으로 먼저 좁힌 뒤 `yarn build`(tsc) 통과 — 놓친 소비처가 있으면 컴파일 실패로 드러남.
- **셀렉트↔타입 1:1 대조표 (Codex CR)**: 전용 셀렉트 7곳(`SERMON_CARD_SELECT`·`SERIES_EPISODE_SELECT`·bulletin list/latest/detail·allSeries·allPreachers) 각각 "셀렉트 컬럼 == 선언 타입 Pick 필드"를 표로 대조해 검증 기록에 남긴다. 의도적 superset은 명기(SermonCardItem의 `slug`·`summary`). 서비스의 `as unknown as` 캐스트가 tsc 그물을 우회하는 사각지대(셀렉트가 타입보다 좁은 경우)를 사람 대조로 막는다.
- 셀렉트별 제거 확인: list()에서 `sermon_resources` join 소멸, 회차에서 관계 3종 소멸, bulletin_images 3필드만, series/preachers 미사용 컬럼 소멸.
- payload 실측: 4쿼리 REST 응답 바이트 before/after 기록.
- dev 브라우저 실측 — 회귀 이력 지점 우선: `/sermons` 시리즈 캐러셀 **cover 이미지**, `/sermons/all` 사이드바·배너·필터시트, `/sermons/series/[id]` 히어로+회차, `/sermons/[id]` 사이드바·다른설교·**자료 다운로드**, 홈(WeeklyBulletin), `/news/bulletins`(+latest 이미지)·상세, admin 목록 필터·new/edit 폼.
- `rg "detailBySlug|getBulletinList"` src 0건. verify-task PASS, knip 신규 0.

## 영향받는 파일

- `src/types/sermon.ts` — `SeriesWithSermonCount`·`PreacherWithSermonCount`를 union Pick으로 축소, `SeriesEpisodeItem` 신설, `SeriesDetail.episodes` 교체
- `src/types/bulletin.ts` — `BulletinWithImages`를 union Pick 기반으로 축소
- `src/services/sermon/sermon-service.ts` — `SERMON_CARD_SELECT`·`SERIES_EPISODE_SELECT` 신설, list/bySeriesSlug/bySeriesId 전환, allSeries/allPreachers 컬럼 명시, `detailBySlug` 삭제
- `src/services/bulletin/bulletin-service.ts` — 공용 셀렉트 상수(스칼라 5 + images 3), `list()` 삭제
- `src/services/bulletin/index.ts` — `getBulletinList` 삭제
- 소비처 prop 타입 전환: `SermonFeatured`·`SermonRecentList`·`SermonFilteredList`·`SermonOtherByPreacher`(→SermonCardItem), `EpisodeGrid`·`SeriesEpisodeCard`·`SermonSeriesSidebar`(→SeriesEpisodeItem), `BulletinTable`·`BulletinTableSection`(→좁은 타입)

## 단계별 체크리스트

- [x] 1. D — series/preacher 타입 union 축소 + 셀렉트 명시 → tsc가 Preacher 전체 행 요구 8곳 적발·교체 → 커밋 41a5973
- [x] 2. A — list()를 `SERMON_CARD_SELECT`+`SermonCardItem`으로 전환, 소비처 6곳 교체, `detailBySlug` 삭제 → tsc 통과 → 커밋 8e897de
- [x] 3. B — 회차를 `SERIES_EPISODE_SELECT`+`SeriesEpisodeItem`으로 전환, 소비처 5곳 교체 → tsc 통과 → 커밋 497055d
- [x] 4. C — bulletin 셀렉트·타입 축소 + `getBulletinList`/`list()` 삭제 → tsc가 테이블·최신 주보 prop 3곳 적발·교체 → 커밋 581c1d0
- [x] 5. 셀렉트↔Pick 1:1 대조표 기록 + payload 실측 + dev 실측 8라우트 통과 + VERIFY PASS (RUN_ID 20260703-051746)

(단계별 dev 실측은 서버 재기동을 줄이기 위해 5에서 일괄 수행으로 조정 — tsc 그물이 단계별 회귀 확인을 대신함)

## 셀렉트↔타입 1:1 대조 (Codex CR 이행)

| 셀렉트 | 컬럼 | 타입 | 판정 |
| --- | --- | --- | --- |
| `SERMON_CARD_SELECT` | id, slug, sermon_date, video_id, video_provider, thumbnail_url, title, scripture, service_type, summary, duration + preacher(name,title) + sermon_series(id,slug,title) | `SermonCardItem` = SermonListItem(9필드+preacher 2) + summary·duration + series 3 | 1:1 일치 (소비처 대비 superset은 slug·summary — D3 의도 명기) |
| `SERIES_EPISODE_SELECT` | id, series_order, sermon_date, video_id, video_provider, thumbnail_url, title, scripture, duration | `SeriesEpisodeItem` Pick 9필드 | 1:1 일치 |
| `BULLETIN_WITH_IMAGES_SELECT` | id, title, sunday_date, created_at, author_id + bulletin_images(id, cloudinary_id, order_index) | `BulletinWithImages` Pick 5 + images Pick 3 | 1:1 일치 — 초안의 `profiles?`는 Codex 1차 검증이 불일치로 적발, 어떤 쿼리도 안 채우는 죽은 필드라 제거(687434f) |
| allSeries 셀렉트 | id, slug, title, description, cover_image_url, started_at, ended_at + sermons!inner(count) | `SeriesWithSermonCount` Pick 7 + sermon_count | 1:1 일치 (**cover_image_url 유지 — PR #91 회귀 필드**) |
| allPreachers 셀렉트 | id, name, title + sermons!inner(count) | `PreacherWithSermonCount` Pick 3 + sermon_count | 1:1 일치 |

## payload 실측 (dev REST, 같은 필터로 old/new 셀렉트 응답 바이트)

| 쿼리 | before | after | 감소 |
| --- | --- | --- | --- |
| A. 설교 목록 (published 9행, limit 12) | 6,915 B | 2,308 B | **-66.6%** |
| B. 시리즈 회차 (실 시리즈 1개) | 1,203 B | 189 B | **-84.3%** |
| C. 주보 목록 (limit 10) | 466 B | 302 B | -35.2% |
| D-1. 시리즈 전체 | 349 B | 258 B | -26.1% |
| D-2. 설교자 전체 | 554 B | 227 B | -59.0% |

- D4 count shape 확인: 명시 컬럼 + `sermons!inner(count)` 응답이 `"sermons":[{"count":1}]` — `mapRowsWithSermonCount`가 기대하는 형태 그대로.

## Verification

- `node scripts/verify-task.mjs p5-select-narrowing`
- 단계마다 tsc(빌드) — 타입 그물 가동 확인
- dev 실측 라우트 체크리스트 (SC 참조)
- REST 응답 바이트 before/after 4쿼리

## Non-goals

- `detailById`·`getSermonForEdit`의 셀렉트 축소 — 상세·폼은 전 필드에 가깝게 실사용 (bySeriesId의 series 단건 `select('*')`도 superset이라 유지)
- admin 쿼리(`getAdminSeries/getAdminPreachers`·`ADMIN_SERMON_SELECT`) 축소 — 타입만 공유, 별도 작업
- `summary()`의 items/latest에서 이미지 join 자체를 분리하는 공유 함수 재설계 — 이번엔 필드 축소만
- DB 스키마·인덱스 변경 없음

## 의사결정 로그

- **D1 — 타입을 먼저 좁혀 tsc를 회귀 그물로 쓴다**
  - 문제: PR #91 회귀는 셀렉트만 좁히고 타입은 넓게 남겨(전 필드 타입인데 런타임엔 없음) 컴파일이 조용히 통과한 것이 구조적 원인이다. 수동 소비처 감사는 그때도 누락됐다.
  - 해결: 공유 타입(`SeriesWithSermonCount` 등)을 소비처 union Pick으로 먼저 좁히고 빌드를 돌린다. 놓친 소비처가 있으면 tsc가 그 자리에서 실패한다 — 사람 감사(explorer 전수 맵 + 직접 재검증) 위에 기계 검증을 한 겹 더 얹는다.
  - 결과: "감사 누락 → 조용한 런타임 구멍" 경로가 컴파일 에러로 바뀐다.

- **D2 — 공유 상수 좁히기 대신 경로별 전용 셀렉트**
  - 문제: `SERMON_WITH_RELATIONS_SELECT`는 상세(전 필드 필요)와 목록(카드 필드만)이 공유한다. 상수를 직접 좁히면 상세가 깨진다 — 2026-05-15 exec-plan도 "별건 전용 쿼리 필요"로 보류했었다.
  - 해결: 상세는 기존 상수를 그대로 두고, 목록(`SERMON_CARD_SELECT`)·회차(`SERIES_EPISODE_SELECT`)에 전용 셀렉트를 신설한다. `recent()`+`SermonListItem`이 이미 같은 패턴의 선례다.
  - 결과: 경로별 셀렉트가 소비처 요구와 1:1로 맞고, 상세 경로는 무변경이라 회귀 면적이 없다.

- **D3 — list() 타입은 기존 `SermonCardItem` 재사용, `slug`·`summary`는 의도적 superset (Codex 계획 검증 expression-only)**
  - 문제: 목록 소비처는 `slug`·`summary`를 안 읽는데 `SermonCardItem`은 포함한다. 딱 맞는 새 타입을 만들지, 기존 타입을 재사용할지.
  - 해결: 기존 타입 재사용을 택했다 — 새 타입은 GridCard 등 기존 prop 타입까지 갈아엎는 연쇄 수정을 부르고, 두 필드는 짧은 문자열이라 payload 비용이 미미하다. 1:1 대조표에 "의도적 superset: slug·summary"로 명기해 누락과 구분한다.
  - 결과: 타입 신설 없이 소비처 prop 타입 교체가 최소화된다.

- **D4 — `sermons!inner(count)` 임베드 count는 기존 문법 유지, REST 실측에서 shape 기록 (Codex 계획 검증 expression-only)**
  - 문제: PostgREST 14 기준 괄호 없는 `count`는 legacy 표기다(동작은 지원).
  - 해결: 기존 4곳(allSeries·allPreachers·admin 2곳)이 이미 이 문법이라 이번 작업에서 문법을 바꾸지 않는다 — 바꾸면 축소 범위를 넘는 인접 변경이다. 대신 REST 실측에서 명시 컬럼 + count 조합의 응답 shape를 기록해 회귀를 확인한다.
  - 결과: 문법 통일은 범위 밖으로 유지, 응답 shape 검증은 SC에 흡수.

## ADR 판단

- 불필요 — services 층을 고치지만 셀렉트·타입 계약 축소와 죽은 쿼리 삭제뿐이다. 레이어 서열·캐시 태그·인증·데이터 흐름·라이브러리는 그대로다. 전용 셀렉트 패턴은 기존 `recent()` 선례의 반복이라 영구 결정이 아니다.

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (신뢰도 high) → 반영 완료
- **현재 판단**: 필드 union A~D는 Codex가 소비처 파일을 직접 읽어 전부 CONFIRMED — spread(`{...sermon}`) 0건, 동적 접근 0건, admin에서 뺀 필드 접근 0건까지 다시 확인했다(explorer→Claude→Codex 삼중 확인). material CR 1건: 서비스의 `as unknown as` 캐스트 때문에 셀렉트가 타입보다 좁아도 tsc가 통과하는 사각지대 — 셀렉트↔Pick 1:1 대조표를 SC에 추가했다. expression-only 2건은 D3(SermonCardItem superset 명기)·D4(count legacy shape 기록)로 반영.
- **다음 행동**: WORK 진입 (체크리스트 1: D 시리즈/설교자)

## Codex 1차 검증

- **결론**: CHANGE_REQUEST (신뢰도 high) → 반영 완료 (687434f)
- **현재 판단**: 1:1 대조 재검증에서 5개 중 4개 일치, 1개 불일치 적발 — `BulletinWithImages`의 `profiles?` 필드가 셀렉트에 없음(옛 셀렉트도 임베드 안 하던 죽은 타입 표면). 남기면 미래 소비자의 `profiles?.display_name` 접근을 tsc가 못 막는 사각지대라 타입에서 제거했다. 그 외 확인:
  - 소비처가 어긋나는 새 패턴 0건 (JSON.stringify·spread·동적 접근 검색)
  - superset 2곳(getSeriesDetail `select('*')`, admin 쿼리)은 의도대로
  - 레이어 역방향 import 0건, 죽은 코드 참조 0건
- **다음 행동**: 문서 커밋 후 verify-task 재실행(diff 갱신분) → PR

## Claude 2차 검증

- **최종 판단**: PASS
- **현재 판단**: 타입 그물이 설계대로 작동 — 좁힌 타입이 Preacher 전체 행을 요구하던 8곳과 bulletin prop 3곳을 컴파일 에러로 드러내 교체했다 (knip 미사용 export도 28→27, getBulletinList 제거분). dev 실측 8라우트 통과: /sermons(featured·캐러셀 — cover_image_url 키 REST 존재 확인, 어두운 카드는 DB cover null의 기존 placeholder), /sermons/all(사이드바 카운트·카드), 시리즈 상세(히어로·회차), 설교 상세(사이드바 회차·다른 설교 3카드·자료 섹션), 주보 목록(테이블·latest 이미지)·상세(작성자·등록일·이미지), 홈 WeeklyBulletin, admin 필터·new 폼 셀렉트. 비어 보인 썸네일 2건은 DB 대조로 원래 데이터 없음(placeholder 정상)을 확인했다.
- **다음 행동**: Codex 1차 검증 결과 기록 후 문서 커밋

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 2차 | 20260703-051746 | ✅ | ✅ | ✅ | 0 (27로 감소) | dev 실측 8라우트 완료 |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

## 후속 작업

<!-- 이번 범위 밖 일. Non-goals·체크리스트에 중복 기술 금지 — 여기에만.
- <후속 항목>
  - 이유: <왜 이번에 안 하나>
  - 다음 기준: <언제 다시 하나>
  - 기록 위치: `docs/tech-debt/active.md` 또는 없음 -->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

