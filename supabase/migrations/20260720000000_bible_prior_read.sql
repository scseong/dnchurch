-- prior-read: 트래커 시작 전 이미 읽은 장을 날짜 없이 현재 회차 통독에만 반영한다.
--
-- read_date NULL = "언젠가 읽음(날짜 없음)". 통독(cycle 기준 distinct book:chapter)에는 포함되고,
-- 일간·주·월·연속(read_date 정확 일치 기준)에는 제외된다. 계산 함수는 이미 두 축이 갈려 있어
-- (bible-tracker.ts: cycleUnionByBook는 cycle만, 날짜 함수는 read_date 일치만) NULL 행이 자연히
-- 통독에만 반영된다. 관련 ADR: user-owned-data-rls(0022) 확장 — owner-RLS 정책은 그대로다.

alter table public.bible_reading_records alter column read_date drop not null;

-- 기존 unique(user_id, book_order, chapter, read_date)는 NULL을 서로 다르게 취급해 prior 중복을 못 막는다.
-- 날짜 없는 행 전용 부분 유니크로 (사용자·책·장·회차) 중복을 막는다.
create unique index bible_reading_records_prior_uniq
  on public.bible_reading_records (user_id, book_order, chapter, cycle)
  where read_date is null;

-- 부분 유니크는 PostgREST onConflict로 겨냥할 수 없어(index predicate 전달 문법 없음),
-- prior insert는 이 RPC로 원자 실행한다. security invoker라 owner-RLS insert 정책
-- (with check auth.uid() = user_id)이 그대로 적용된다. search_path는 빈 값으로 고정(advisor).
create or replace function public.record_prior_chapters(
  p_book_order smallint,
  p_chapters smallint[],
  p_cycle smallint
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.bible_reading_records (user_id, book_order, chapter, read_date, cycle)
  select auth.uid(), p_book_order, c, null, p_cycle
  from unnest(p_chapters) as c
  on conflict (user_id, book_order, chapter, cycle) where read_date is null do nothing;
$$;
