-- record_prior_chapters의 회차 결정을 함수 안으로 옮긴다 (PR #156 Codex 리뷰 P2).
--
-- 기존 함수는 액션이 settings를 select해 p_cycle로 넘겼다. 그 select의 오류를 액션이
-- 확인하지 않아 조회가 일시 실패하면 회차가 1로 대체됐고, 조회와 RPC 사이에 다음 회독이
-- 시작되면 낡은 회차로 저장됐다. record_chapters(20260724000000)처럼 current_cycle을
-- insert 안에서 읽으면 두 경로가 모두 사라지고 액션 왕복도 3회에서 2회가 된다.
-- security invoker + search_path 고정은 기존 함수와 같다.

drop function if exists public.record_prior_chapters(smallint, smallint[], smallint);

create function public.record_prior_chapters(
  p_book_order smallint,
  p_chapters smallint[]
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.bible_reading_records (user_id, book_order, chapter, read_date, cycle)
  select auth.uid(), p_book_order, c, null,
         coalesce(
           (select s.current_cycle from public.bible_reading_settings s where s.user_id = auth.uid()),
           1
         )
  from unnest(p_chapters) as c
  on conflict (user_id, book_order, chapter, cycle) where read_date is null do nothing;
$$;
