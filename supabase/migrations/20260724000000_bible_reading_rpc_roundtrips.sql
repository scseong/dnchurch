-- 기록 액션의 Supabase 왕복 축소 (perf-audit-fixes).
--
-- recordChaptersAction은 settings의 current_cycle을 select한 뒤 upsert해 액션당 왕복이 3회였다
-- (getUser → settings → upsert). current_cycle 조회를 insert 안으로 옮겨 왕복을 2회로 줄인다.
-- startNextCycleAction은 완주 확인을 위해 현재 회차 전 행(1,189행 이상)을 내려받아 JS에서
-- distinct를 셌다 — distinct 카운트를 서버에서 세는 RPC로 대체한다.
-- 둘 다 security invoker라 owner-RLS 정책이 그대로 적용된다. search_path는 빈 값으로 고정(advisor).

-- 날짜 기록 insert: current_cycle을 함수 안에서 읽는다 (settings 행이 없으면 1 —
-- src/apis/bible-reading.ts DEFAULT_SETTINGS와 같은 기본값).
create or replace function public.record_chapters(
  p_book_order smallint,
  p_chapters smallint[],
  p_read_date date
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.bible_reading_records (user_id, book_order, chapter, read_date, cycle)
  select auth.uid(), p_book_order, c, p_read_date,
         coalesce(
           (select s.current_cycle from public.bible_reading_settings s where s.user_id = auth.uid()),
           1
         )
  from unnest(p_chapters) as c
  on conflict (user_id, book_order, chapter, read_date) do nothing;
$$;

-- 회차의 distinct(book_order, chapter) 수 — 통독 완주 판정용.
create or replace function public.count_cycle_chapters(
  p_cycle smallint
) returns integer
language sql
security invoker
set search_path = ''
stable
as $$
  select count(distinct (book_order, chapter))::integer
  from public.bible_reading_records
  where user_id = auth.uid() and cycle = p_cycle;
$$;
