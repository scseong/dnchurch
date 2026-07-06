-- increment_sermon_views 결함 수정
--
-- 배경 (2026-07-02 refactor-audit D1):
-- 1) 실 DB에 uuid·bigint 오버로드 2개가 공존 — uuid 버전은 과거 스키마(sermons.id uuid) 잔재.
--    PostgREST가 호출을 모호성(PGRST203)으로 거부할 수 있고, 생성 타입에도
--    "Could not choose the best candidate function" 에러가 박혀 있었다.
-- 2) bigint 버전이 SECURITY INVOKER라 익명 방문자의 UPDATE가 RLS(sermons_update_admin 전용)에
--    막혀 0행 무음 — dev 설교 9건 전부 view_count = 0.
--
-- 조치: uuid 오버로드 제거 + bigint 버전을 SECURITY DEFINER로 재생성.
-- 대상을 공개(is_published)·미삭제 설교로 한정해 비공개 설교 조회수 조작을 막는다.

drop function if exists public.increment_sermon_views(uuid);

create or replace function public.increment_sermon_views(sermon_id bigint)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update sermons
  set view_count = view_count + 1
  where id = sermon_id
    and is_published = true
    and deleted_at is null;
$$;
