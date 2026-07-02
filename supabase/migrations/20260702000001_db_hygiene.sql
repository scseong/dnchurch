-- DB 위생 정리 (2026-07-02 refactor-audit P2)
--
-- Supabase advisor(dev)가 경고한 4가지를 걷어낸다. 전부 in-place 변경이라
-- 스키마 구조·인증 정책 의미·데이터 흐름을 바꾸지 않는다.
--   1) RLS auth.uid() 미래핑 14정책 → (select auth.uid())  [auth_rls_initplan]
--   2) SECURITY DEFINER/트리거 함수 7개 search_path 고정      [function_search_path_mutable]
--   3) 중복 인덱스 idx_sermons_date 제거                      [duplicate_index]
--   4) FK 인덱스 2개 추가                                     [unindexed_foreign_keys]
--
-- 보존 근거: (select auth.uid())는 auth.uid()와 같은 값을 반환하되 쿼리당 1회 평가한다(InitPlan).
-- 정책은 ALTER POLICY로 auth.uid()만 바꾸고 cmd·roles·admin 조건은 그대로 둔다.
-- 함수는 ALTER FUNCTION으로 search_path만 더한다(본문 불변, 모든 참조가 public qualified).
--
-- drift 대비: 이 저장소는 마이그레이션이 실 DB를 재현하지 못한다. 정책·enum·테이블은
-- public. 스키마를 명시하고, 함수 ALTER는 존재할 때만 실행한다(to_regprocedure 가드).
-- handle_updated_at·set_updated_at은 dev에만 있는 고아 함수라, fresh DB 재생 시 건너뛴다.

-- ─────────────────────────────────────────────────────────────
-- 1) RLS 정책 auth.uid() 래핑 (14) — public. 스키마 명시
-- ─────────────────────────────────────────────────────────────

-- bulletins / bulletin_images : role='admin' AND status='approved'
alter policy bulletins_insert_admin_only on public.bulletins
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::public.role_enum
      and profiles.status = 'approved'::public.profile_status_enum
  ));

alter policy bulletins_update_admin_only on public.bulletins
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::public.role_enum
      and profiles.status = 'approved'::public.profile_status_enum
  ));

alter policy bulletin_images_insert_admin_only on public.bulletin_images
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::public.role_enum
      and profiles.status = 'approved'::public.profile_status_enum
  ));

alter policy bulletin_images_delete_admin_only on public.bulletin_images
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::public.role_enum
      and profiles.status = 'approved'::public.profile_status_enum
  ));

-- profiles : 본인 행만
alter policy profiles_select_own on public.profiles
  using ((select auth.uid()) = id);

-- sermons / sermon_resources : role='admin' (status 조건 없음)
alter policy sermons_select_admin on public.sermons
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy sermons_insert_admin on public.sermons
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy sermons_update_admin on public.sermons
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy sermon_resources_insert_admin on public.sermon_resources
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy sermon_resources_update_admin on public.sermon_resources
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ))
  with check (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

-- site_collections / site_settings / staff / worship_schedules : FOR ALL, role='admin'
-- USING만 바꾸면 미설정 WITH CHECK가 새 USING을 그대로 상속한다(INSERT/UPDATE 보존).
alter policy "only admins can modify site_collections" on public.site_collections
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy "only admins can modify site_settings" on public.site_settings
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy "only admins can modify staff" on public.staff
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

alter policy "only admins can modify worship_schedules" on public.worship_schedules
  using (exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::public.role_enum
  ));

-- ─────────────────────────────────────────────────────────────
-- 2) SECURITY DEFINER / 트리거 함수 search_path 고정 (7)
--    존재할 때만 실행 — fresh DB 재생 시 없는 함수(고아)는 건너뛴다.
-- ─────────────────────────────────────────────────────────────

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.create_sermon(jsonb, jsonb)',
    'public.update_sermon(bigint, jsonb, uuid[], jsonb)',
    'public.delete_sermon(bigint)',
    'public.get_adjacent_bulletins(bigint)',
    'public.handle_new_user()',
    'public.handle_updated_at()',
    'public.set_updated_at()'
  ]
  loop
    if to_regprocedure(fn) is not null then
      execute format('alter function %s set search_path = public, pg_temp', fn);
    end if;
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 3) 중복 인덱스 제거 (idx_sermons_date == idx_sermons_date_desc)
-- ─────────────────────────────────────────────────────────────

drop index if exists public.idx_sermons_date;

-- ─────────────────────────────────────────────────────────────
-- 4) FK 커버링 인덱스 추가
-- ─────────────────────────────────────────────────────────────

create index if not exists idx_sermon_resources_sermon on public.sermon_resources (sermon_id);
create index if not exists idx_site_collections_updated_by on public.site_collections (updated_by);
