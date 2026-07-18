# bible-reading-tracker

- **상태**: 🟡 진행 중
- **시작일**: 2026-07-17
- **브랜치**: feat/my-page
- **Open questions**: none (settings RLS·같은 날 통독 리셋은 D1·D5로 해소)
- **ADR needed**: yes — 이 앱의 첫 사용자 소유 CRUD 테이블. owner-RLS 정책을 도입하되 뮤테이션은 기존 규칙대로 Server Action을 지킨다. `## ADR 판단` 참조.

## 목표

`/mypage`에 성경읽기 트래커를 붙인다. 사용자가 날짜별로 읽은 성경 장을 기록하면 연속 일수, 일·주·월 기록, 성경 통독 진행률, 주간 목표가 그 기록에서 파생돼 보인다. Claude Design 시안(한빛교회 마이페이지.html = 마이 페이지.dc.html 번들 버전)의 성경읽기 영역을 실제 기능으로 만든다.

## 검증된 Assumptions

- 시안 로직은 "모든 것이 날짜별 기록에서 파생된다(일 단위)"로 설계돼 있다 — `mypage-design.dc.html:535`, `logByDate[date][book]=Set<chapter>` 구조.
- 66권 이름·장수는 고정(총 1189장, 구약 39·신약 27, 최대 150장=시편)이다 — 시안 `books` 배열(`mypage-design.dc.html:496-499`), 노드 스크립트로 합계 검산.
- 현재 DB에 사용자 활동/읽기 기록 테이블이 없다 — `mcp__claude_ai_Supabase__list_tables` 13개 테이블에 해당 없음.
- **뮤테이션은 항상 Server Action, 클라이언트 직접 Supabase write 금지** — `docs/ARCHITECTURE.md:35`. eslint가 `app → apis` 직접 import도 error로 막는다(`eslint.config.mjs:84-97`).
- admin 소유 테이블 RLS는 `EXISTS(profiles WHERE id=auth.uid() AND role='admin')` 패턴 — `sermons` 정책 SQL 조회.
- `profiles`는 role/status 권한 상승 위험 때문에 클라이언트 쓰기를 GRANT 회수로 잠갔다 — `20260611000000_profiles_rls_lockdown.sql`. 읽기 기록에는 그런 민감 컬럼이 없다.
- `createServerSideClient()`는 사용자 세션 쿠키를 실어 `auth.uid()`가 로그인 사용자로 잡힌다(RLS owner 정책이 실제로 적용됨, admin bypass 아님) — `.claude/skills/supabase/SKILL.md`.

## Non-goals

- 기록 공유(카카오톡·이미지 저장·링크 복사) — 외부 SDK·이미지 생성 연동이라 별도 task. "내 기록 공유하기" 버튼은 "준비 중" 토스트로 둔다.
- 설정 시트의 알림 토글·읽기 알림 시간·번역본·고객센터 — my-page task에서 이미 "준비 중"으로 둔 항목. 이번 범위 밖.
- 성경 본문 표시·읽기 기능 — 기록만 한다.
- 개역개정 외 번역본의 다른 장수 — 1189장 고정.

## 접근법

- **데이터 모델**: 원자 단위 하나만 저장하고 나머지는 파생한다. `bible_reading_records` 한 행 = "이 사용자가 이 날(`read_date`) 이 책(`book_order`) 이 장(`chapter`)을 이 회차(`cycle`)에 읽었다". 연속·일/주/월·통독·목표는 이 행들에서 계산한다(집계 컬럼 저장 안 함, D4).
- **66권 참조 데이터**: `src/constants/bible.ts` TS 상수 `BIBLE_BOOKS: {order 1-66, name, chapters, testament}[]` + `getBookByOrder(order)` 헬퍼(내부에서 `order-1` 인덱싱, 1-based↔0-based 경계를 한 곳에 가둔다, D6). `BIBLE_TOTAL_CHAPTERS = 1189`.
- **쓰기 경로**: 클라이언트 직접 쓰기는 `ARCHITECTURE.md:35` 위반이라 쓰지 않는다. 모든 뮤테이션은 `src/actions/bible-reading.action.ts`의 Server Action이 `createServerSideClient()`(사용자 세션)로 수행한다. RLS owner 정책이 실제로 적용되고, `user_id`는 `getUser()`가 준 값으로 서버가 채워 스푸핑을 원천 차단한다. 잦은 토글은 낙관적 UI(클라이언트 로컬 상태 즉시 반영 후 실패 시 롤백) + 범위/모두읽음은 한 번의 액션으로 여러 장을 보내 왕복을 줄인다.
- **읽기 경로**: 서버 페이지(`page.tsx`) → `services/bible-reading`(파생 계산) → `apis/bible-reading`(서버 읽기, `createServerSideClient`). 초기 로드에 사용자의 기록 전체(작은 컬럼: book_order·chapter·read_date·cycle) + settings를 한 번 조회해 클라이언트로 내린다. 단일 사용자라 행 수가 작다(1189장×소수 회차 ≈ 수천 행 이하).
- **배치**: `/mypage`에서 프로필 헤더와 계정 메뉴 사이에 트래커를 넣는다(시안 순서). 기록기는 시안대로 전체 화면 오버레이(`BottomSheet size="full"`).

## 스키마 (마이그레이션 계약)

```sql
create table public.bible_reading_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_order smallint not null check (book_order between 1 and 66),
  chapter smallint not null check (chapter between 1 and 150),
  read_date date not null,
  cycle smallint not null default 1 check (cycle >= 1),
  created_at timestamptz not null default now(),
  unique (user_id, book_order, chapter, read_date)   -- 토글 멱등 (cycle 미포함: 같은 날 같은 장 재독은 무시, 극희귀)
);
create index on public.bible_reading_records (user_id, read_date);
create index on public.bible_reading_records (user_id, cycle);
alter table public.bible_reading_records enable row level security;
create policy "select_own" on public.bible_reading_records for select to authenticated using (auth.uid() = user_id);
create policy "insert_own" on public.bible_reading_records for insert to authenticated with check (auth.uid() = user_id);
create policy "update_own" on public.bible_reading_records for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.bible_reading_records for delete to authenticated using (auth.uid() = user_id);

create table public.bible_reading_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_goal smallint not null default 50 check (weekly_goal between 5 and 150),
  current_cycle smallint not null default 1 check (current_cycle >= 1),
  updated_at timestamptz not null default now()
);
alter table public.bible_reading_settings enable row level security;
create policy "select_own" on public.bible_reading_settings for select to authenticated using (auth.uid() = user_id);
create policy "insert_own" on public.bible_reading_settings for insert to authenticated with check (auth.uid() = user_id);
create policy "update_own" on public.bible_reading_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- `WITH CHECK (auth.uid()=user_id)`가 INSERT/UPDATE에 반드시 붙는다 — `USING`만으로는 남의 `user_id` 행 삽입을 못 막는다(Codex 지적).
- settings 행은 지연 생성: 없으면 서비스가 기본값(weekly_goal=50, current_cycle=1)으로 취급하고, 목표 변경·다음 회독 때 upsert.

## 의사결정 로그

- **D1 — 읽기 기록은 owner-RLS 정책을 두되, 뮤테이션은 기존 규칙대로 사용자 세션 Server Action으로 한다 (Codex CR 반영)**
  - 문제: 초기 계획은 클라이언트가 Supabase에 직접 write하려 했으나 `ARCHITECTURE.md:35`("뮤테이션은 항상 Server Action")·eslint 레이어와 충돌한다.
  - 해결: 뮤테이션은 `actions/bible-reading.action.ts`가 `createServerSideClient()`(사용자 세션)로 실행한다. 이 클라이언트는 admin bypass가 아니라 사용자 JWT를 실어 owner-RLS(`auth.uid()=user_id`)가 그대로 적용된다. `profiles`는 role/status 권한 상승 때문에 클라이언트 쓰기를 GRANT 회수로 잠갔지만, 읽기 기록은 민감 컬럼이 없고 행이 전부 `user_id` 소유라 owner-RLS로 CRUD를 연다.
  - 결과: 아키텍처 규칙을 지키면서 사용자별 격리를 RLS로 보장한다. 첫 사용자 소유 CRUD 테이블이라 정책 경계를 ADR로 남긴다.
- **D2 — 66권은 DB 테이블이 아니라 `src/constants/bible.ts` TS 상수로 둔다**
  - 문제: 책 이름·장수는 고정 참조 데이터인데 테이블로 만들면 매 조회에 join이 붙는다.
  - 해결: 앱의 고정 목록 상수 패턴(예: 갤러리 카테고리)을 따른다. 기록에는 `book_order`(1-66 정경 순번)만 저장. DB CHECK(`book_order 1-66`, `chapter 1-150`)로 하한/상한을, 서버 액션이 `BIBLE_BOOKS[order-1].chapters`로 책별 정확한 상한(예: 창세기 50)을 검증한다.
  - 결과: 조회에 join이 없고, 잘못된 장 번호는 DB CHECK + 서버 검증 2겹으로 막는다.
- **D3 — 기록은 (user_id, book_order, chapter, read_date) 유니크로 멱등 처리**
  - 문제: 같은 장을 같은 날 두 번 눌러도 한 번만 기록돼야 한다(시안은 Set).
  - 해결: 4컬럼 unique. 장 켜기=insert on conflict do nothing, 끄기=delete. 같은 장을 다른 날 다시 읽는 건 허용(통독은 회차별 distinct로 처리). unique에 cycle을 넣지 않아 "같은 날 같은 장을 두 회차에서 재독"은 무시되지만 극히 희귀해 감수한다.
  - 결과: 토글이 멱등이고 재독 기록도 날짜별로 남는다.
- **D4 — 연속·집계는 저장하지 않고 조회 시 계산한다**
  - 문제: streak·월 집계·통독 진행을 컬럼으로 캐시하면 기록 변경마다 동기화 버그가 생긴다.
  - 해결: 초기 로드에 사용자 기록 전체(작은 컬럼)를 한 번 조회해 서비스/클라이언트에서 계산. streak은 distinct `read_date`를 전부 받아 오늘부터 연속 일수를 끝까지 세므로 길이 제한이 없다(Codex의 "최근 N일" 오류 방지).
  - 결과: 단일 진실 원천은 기록 행 하나뿐이고 streak이 임의 길이에 정확하다.
- **D5 — 통독 회차는 날짜 필터가 아니라 기록의 `cycle` 컬럼으로 구분한다 (Codex CR 반영)**
  - 문제: 초기 계획의 `read_date >= cycle_start_date` 필터는 "오늘 오전에 1189장을 채우고 다음 회독을 시작"할 때 오전 기록(read_date=오늘)이 새 회차에도 포함돼 0%로 리셋되지 않는다. `read_date`가 date라 오전/오후를 못 가른다.
  - 해결: 각 기록에 `cycle`(삽입 시점의 `current_cycle`)을 박는다. 통독 진행 = distinct(book_order,chapter) where cycle=current_cycle. "다음 회독 시작하기" = `settings.current_cycle += 1`. 이후 기록은 새 cycle로 저장돼 진행이 0부터 시작한다. 오전 기록은 cycle=1로 남아 새 회차에서 제외된다. 일/주/월·연속은 회차 무관하게 `read_date`로 계산한다(그날 읽은 건 그날 읽은 것).
  - 결과: 같은 날 회독 리셋이 정확히 0%가 된다. `cycles_done` 표기는 `current_cycle - 1`로 파생.
- **D6 — book_order는 1-based, 변환은 `getBookByOrder`에 가둔다 (Codex CR 반영)**
  - 문제: DB는 1-66, 배열 인덱스는 0-65라 `BIBLE_BOOKS[book_order]`로 쓰면 1칸씩 밀리고 66은 undefined가 된다.
  - 해결: `getBookByOrder(order)`가 유일한 변환 지점(`BIBLE_BOOKS[order-1]`)이고, 쓸 때는 항상 `book.order`를 저장한다. 컴포넌트·서비스는 배열 인덱싱을 직접 하지 않는다.
  - 결과: off-by-one을 한 함수로 가둔다.
- **D7 — 시안 대표색 #93702E를 `$accent`(gold)로 매핑해 트래커 데이터 시각화를 골드로 맞춘다 (사용자 UI 대조 요청)**
  - 문제: 초기 구현은 상태·진행 표시에 `$primary`(brown-800 #5a3f2e)를 써서 시안(#93702E gold)보다 갈색이 짙게 나왔다. 사용자가 목업을 서버로 띄워 나란히 대조하며 "최대한 동일"을 요구했다.
  - 해결: 시안의 #93702E는 앱 semantic `$accent`(gold-600)와 정확히 같다. 연속 카드 그라디언트·주간 요일 박스·통독 배지/진행바·월 히트맵·기록기 장/책 상태·활성 세그먼트·프로필 아바타를 `$accent` 계열로 바꿨다. 진행바는 `linear-gradient($accent-hover,$accent)`, 히트맵은 `$accent-subtle→$accent-hover→$accent` 3단계. 구조도 시안에 맞춰 일 뷰 항목·빈 상태에 골드 책 아이콘, 목표 모달에 원형 스테퍼를 추가했다.
  - 결과: 브라우저 실측으로 연속·일/주/월·통독·기록기·목표 모달이 시안과 근접. 다만 공용 컴포넌트 `Button`(primary)·`Tabs`(pill active)는 앱 원칙(ADR 0020: brand=brown)을 따라 brown으로 남긴다 — 시안의 gold 버튼과 다르지만, 공용 컴포넌트를 앱 전역에서 바꾸는 대신 트래커 고유 데이터 시각화만 골드로 맞춘 선택. gold 버튼이 필요하면 `Button` accent variant 신설이 후속 과제.

## ADR 판단

작성 완료 — `docs/decisions/0022-user-owned-data-rls.md`. 결정: "사용자 소유 데이터 테이블은 owner-RLS(`USING`+`WITH CHECK` = `auth.uid()=user_id`)를 두고, 뮤테이션은 사용자 세션 Server Action으로 한다. `profiles`식 admin 잠금은 role/status 같은 권한 상승 컬럼이 있는 테이블에만."

## Success Criteria

- 로그인 사용자가 기록기에서 책→장을 선택하면 `bible_reading_records`에 행이 생기고(오늘 기록·연속·통독 갱신), 같은 장을 다시 누르면 행이 삭제된다 — 브라우저 실측 + `SELECT count(*) ... WHERE user_id=<uid>` 전후 비교.
- 다른 사용자 스푸핑 차단: user A 세션으로 `user_id=<user B>` INSERT 시도가 RLS로 거부된다(0행/permission denied) — SQL로 확인. 서버 액션은 `user_id`를 `getUser()` 값으로만 채운다.
- 일/주/월 탭이 각각 오늘 기록, 7일 스트립 + 주간 목표 %, 월 달력 히트맵을 보여준다 — 브라우저 실측.
- 통독 진행률 = distinct(book_order,chapter) where cycle=current_cycle / 1189. 1189 도달 시 "다음 회독 시작하기"가 뜨고, 누르면 `current_cycle`이 1 늘고 진행률이 0%가 된다. 같은 날 리셋해도 0%다 — SQL로 경계값 주입해 확인.
- 주간 목표를 바꾸면 `bible_reading_settings.weekly_goal`이 갱신되고 주간 % 분모가 바뀐다.
- `getBookByOrder`가 order 1→창세기, 66→요한계시록을 반환하고, `sum(BIBLE_BOOKS.chapters) === 1189`·`BIBLE_BOOKS.length === 66`이다 — 단위 확인(런타임 assert 또는 콘솔).
- 잘못된 장(예: 창세기 51장) 기록 시도가 서버 액션에서 거부된다 — 액션 검증 확인.
- 비로그인 `/mypage` 접근은 기존대로 `/login` 리다이렉트.
- `node scripts/verify-task.mjs bible-reading-tracker` (lint·styles·build·knip) 통과.

## 영향받는 파일

- `supabase/migrations/<ts>_create_bible_reading.sql` — 2 테이블 + unique + CHECK + 인덱스 + owner-RLS(USING·WITH CHECK) (신규)
- `src/types/database.types.ts` — `yarn generate:types` 재생성
- `src/constants/bible.ts` — `BIBLE_BOOKS`·`getBookByOrder`·`BIBLE_TOTAL_CHAPTERS` (신규)
- `src/apis/bible-reading.ts` — 서버 읽기(createServerSideClient) (신규)
- `src/services/bible-reading/index.ts` — 파생 계산(streak·주/월·통독·기간 집계) (신규)
- `src/actions/bible-reading.action.ts` — 기록/해제/목표/다음회독 Server Action (신규)
- `src/app/(content)/mypage/_component/tracker/` — StreakCard·RecordTabs(Day/Week/Month)·PlanCard·GoalModal·Recorder + module.scss (신규)
- `src/app/(content)/mypage/page.tsx` — 트래커 섹션 삽입 + 초기 fetch
- `docs/decisions/<n>-user-owned-data-rls.md` — ADR (신규)

## 단계별 체크리스트

- [x] 1. 마이그레이션(2 테이블·unique·CHECK·인덱스·owner-RLS USING+WITH CHECK) → dev 적용 → 타입 재생성
- [x] 2. `bible.ts`(상수+`getBookByOrder`, 합계 assert) + `apis/bible-reading`(서버 읽기) + `services/bible-reading`(파생)
- [x] 3. `actions/bible-reading.action.ts`(기록/해제/목표/다음회독, user_id=getUser, 장 범위 검증)
- [x] 4. page.tsx 초기 fetch + StreakCard + 통독 카드
- [x] 5. 일/주/월 기록 탭(달력 히트맵·주 스트립·목표 %)
- [x] 6. 기록기 오버레이(책→장, 날짜 이동, 낱장/범위, 모두읽음/해제) + 낙관적 쓰기
- [x] 7. 주간 목표 모달 + 통독 다음 회독 + 스타일 토큰·반응형 + ADR 작성
- [x] 8. VERIFY + 브라우저 실측(RLS 교차·기록·파생·목업 대조 UI 개선)·스크린샷

## Verification

- `node scripts/verify-task.mjs bible-reading-tracker`

---

## Codex 계획 검증

- **결론**: CHANGE_REQUEST (confidence: high) — 2026-07-17 1차. material 6건 반영 완료.
- **현재 판단**: Codex 지적과 처리:
  1. "레이어 충돌 — `apis/bible-reading` 브라우저 클라이언트 CRUD가 `ARCHITECTURE.md`의 '뮤테이션은 항상 Server Action'과 충돌" → `ARCHITECTURE.md:35` 직접 확인 후 클라이언트 직접 쓰기를 접고 사용자 세션 Server Action으로 전환(D1 개정, apis=서버 읽기·actions=쓰기).
  2. "RLS `WITH CHECK` 누락 — `USING`만으로는 user A가 user B 행을 넣는 걸 못 막음" → 스키마 계약에 INSERT/UPDATE `WITH CHECK (auth.uid()=user_id)` 명시.
  3. "같은 날 통독 리셋 깨짐 — `read_date >= cycle_start_date`는 오전 기록을 새 회차에 포함" → 기록에 `cycle` 컬럼 도입(D5), 진행=cycle=current_cycle distinct, 리셋=current_cycle++.
  4. "book_order 1-based off-by-one 경계 없음" → `getBookByOrder(order-1)` 단일 변환점(D6).
  5. "장 유효성 DB CHECK·서버 검증 없음" → `chapter 1-150` CHECK + 액션에서 `BIBLE_BOOKS[order-1].chapters` 상한 검증(D2).
  6. "streak '최근 N일' pass/fail 기준 없음" → distinct read_date 전부 받아 임의 길이 정확(D4), SC에 명시.
  - expression-only(Open questions 부정확, unique를 체크리스트에 재명시 등)도 반영.
- **다음 행동**: WORK 진입. 스키마·RLS는 CODEX_FIRST_PASS에서 diff 재검증.

## Codex 1차 검증

- **결론**: FIX_APPLIED — 2026-07-17. Codex가 직접 수정 3건(모두 correctness), Claude가 diff 교차 확인.
- **현재 판단**: Codex 적용 수정과 Claude 확인:
  1. `TrackerSection.tsx` 롤백 회차 보존 — 기록 해제를 롤백할 때 `addRecords`(현재 cycle)가 아니라 `restoreRecords`(제거된 행을 원래 cycle 그대로 복원)를 쓴다. 과거 회차 기록을 오늘 해제·롤백하면 cycle이 바뀌던 버그를 막는다. diff 확인: `toggleChapter`·`clearBook`이 `removed` 스냅샷을 잡아 복원.
  2. `apis/bible-reading.ts` getBibleReadingRecords 페이지네이션 — Supabase 기본 1000행 한도 때문에 기록이 1000행을 넘는 사용자는 일부만 받아 통독·연속이 틀리던 것을, `range`로 1000행씩 끝까지 받도록 고쳤다.
  3. `actions/bible-reading.action.ts` startNextCycleAction 페이지네이션 — 통독 완료 판정 `distinct==1189`가 1189>1000이라 1000행 한도에 걸려 영영 완료로 안 잡히던 것을, 같은 range 루프로 고쳤다.
- **다음 행동**: verify-task + 브라우저 실측 후 2차 갱신.

## Claude 2차 검증

- **최종 판단**: PASS — 2026-07-17.
- **현재 판단**: Codex 수정 3건 diff를 다시 읽어 의도·범위 확인(위 1차 기록). 브라우저 실측(dev 서버 3002, 테스트 계정 vihaya8934):
  - 기록기에서 창세기 2·3장 기록 → `bible_reading_records`에 (cycle=1) 2행 저장, 같은 장 재클릭 시 삭제(토글) — SQL 전후 확인.
  - 파생 실시간 갱신: 연속 1일째, 이번 달 1일, 오늘 2장, 오늘 기록 "창세기 2–3장", 통독 2/1189장 0%.
  - 주간 뷰(금요일 ✓·목표 2/50장 4%)·월 달력 히트맵(2026년 7월, 7/1=수요일, 오늘 링) 정상.
  - RLS: user A 세션으로 본인 insert 성공, user B(admin) id insert는 `new row violates row-level security policy`로 거부 — `pg_policy` role 시뮬레이션 SQL로 확인.
  - 실측 후 테스트 기록 전량 삭제(원복).
  - UI 개선(사용자 요청, 목업 대조) — 목업(한빛교회 마이페이지.html)을 8080 정적 서버로 띄워 나란히 비교하며 아래를 반영했다.
    - 연속 카드에 골드 불꽃 원형 배지를 넣고, 좌측 텍스트·우측 배지 행 배치.
    - 통독 버튼을 솔리드 브라운 "지난 날짜·권별로 기록하기"로 변경.
    - 카드 모서리를 $radius-l로 부드럽게.
- **UI 폴리시 2차(사용자 11개 대조 요청, 최초 2차 검증 이후 추가)**: 목업과 나란히 비교하며 아래를 반영했다.
  - `Button`에 accent variant(gold) 신설, 트래커 CTA·`Tabs` pill active를 골드로 맞춤(D7의 후속 과제였던 gold 버튼 해소).
  - 기록 공유 시트(`ShareSheet.tsx`) 신설 — 일/주/월 pill 탭 + 골드 통계 카드(대구동남교회·시편 119:105), 카카오톡·이미지 저장·링크 복사는 "준비 중" 토스트.
  - 헤더에 설정 아이콘(`resolveHeaderAction /mypage → 'settings'`) → 계정 섹션(`#mypage-account`)으로 스크롤.
  - 일/주/월 탭을 세그먼트(배경 전환) 방식으로 교체.
  - 주간 목표를 number input + `-`/`+` 스텝 1로 변경.
  - 통독 카드 제목 앞 책 아이콘 제거.
  - 버튼 min-height 부여 — sm 3.6·md 4.2·lg 4.8rem.
  - 프로필 섹션 배경·패딩 제거.
  - 기록기 헤더에 뒤로가기 + 닫기 동시 배치.
  - 날짜 바 화살표를 흰 배경으로, "기록할 날짜" 라벨을 줄바꿈.
  - 책 목록에서 제목 + 장수를 한 줄에 배치.
  - 챕터 번호 그리드가 스타일이 안 먹던 것을 고침: `.chapter` 버튼에 `width:100%`(grid 셀이 `<li>`라 버튼이 숫자 폭으로 줄던 문제) + `1px solid $border-card` 테두리 부여.

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 |
| --- | --- | --- | --- | --- | --- | --- |
| 최초 2차 | 20260717-141437 | ✅ | ✅ | ✅ | 0 | 브라우저 실측·RLS SQL 완료 |
| UI 폴리시 재검증 | 20260718-190653 | ✅ | ✅ | ✅ | 0 | 챕터 그리드 실측 완료 |

- **챕터 그리드 실측(dev 3005, 홍길동/vihaya8934)**: 기록기 → 창세기 챕터 그리드를 목업과 대조해 아래를 확인했다.
  - 8열 셀이 그리드 폭을 꽉 채운다(`width:100%` 반영, 수정 전엔 버튼이 숫자 폭으로 줄었음).
  - 읽은 장은 골드 배경(`$accent-subtle`)으로 칠해진다.
  - 안 읽은 장은 연회색 + 1px `$border-card` 테두리로 구분된다(수정 전엔 테두리가 없었음).
- **다음 행동**: doc-editor 점검 → 사용자 승인 → 커밋.

## 검증 이력

<details>
<summary>2026-07-17 Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: RLS WITH CHECK 누락·같은 날 통독 리셋 오류·레이어 충돌·book_order 경계 미정의
- 조치: D1 개정, D5·D6 신설, 스키마 SQL 계약 추가, SC 스푸핑/장검증 보강

</details>

## 후속 작업

- 기록 공유(카카오톡·이미지·링크)
  - 이유: 외부 SDK·이미지 생성 연동이 필요해 트래커 코어와 분리.
  - 다음 기준: 트래커 머지 후.
  - 기록 위치: 없음 (후속 task)
