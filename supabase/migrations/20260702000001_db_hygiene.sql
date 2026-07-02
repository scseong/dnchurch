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
-- 주의(마이그레이션 drift): 정책·함수·인덱스 이름은 dev 실 DB 기준이다. 빈 prod 재생성 시
-- baseline 체인이 같은 이름으로 만들면 replay되고, 이름이 어긋나면 실패한다(기존 drift tech-debt).

-- ─────────────────────────────────────────────────────────────
-- 1) RLS 정책 auth.uid() 래핑 (14)
-- ─────────────────────────────────────────────────────────────

-- bulletins / bulletin_images : role='admin' AND status='approved'
alter policy bulletins_insert_admin_only on public.bulletins
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::role_enum
      and profiles.status = 'approved'::profile_status_enum
  ));

alter policy bulletins_update_admin_only on public.bulletins
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::role_enum
      and profiles.status = 'approved'::profile_status_enum
  ));

alter policy bulletin_images_insert_admin_only on public.bulletin_images
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::role_enum
      and profiles.status = 'approved'::profile_status_enum
  ));

alter policy bulletin_images_delete_admin_only on public.bulletin_images
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'::role_enum
      and profiles.status = 'approved'::profile_status_enum
  ));

-- profiles : 본인 행만
alter policy profiles_select_own on public.profiles
  using ((select auth.uid()) = id);

-- sermons / sermon_resources : role='admin' (status 조건 없음)
alter policy sermons_select_admin on public.sermons
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy sermons_insert_admin on public.sermons
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy sermons_update_admin on public.sermons
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ))
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy sermon_resources_insert_admin on public.sermon_resources
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy sermon_resources_update_admin on public.sermon_resources
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ))
  with check (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

-- site_collections / site_settings / staff / worship_schedules : FOR ALL, role='admin'
-- USING만 바꾸면 미설정 WITH CHECK가 새 USING을 그대로 상속한다(INSERT/UPDATE 보존).
alter policy "only admins can modify site_collections" on public.site_collections
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy "only admins can modify site_settings" on public.site_settings
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy "only admins can modify staff" on public.staff
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

alter policy "only admins can modify worship_schedules" on public.worship_schedules
  using (exists (
    select 1 from profiles
    where profiles.id = (select auth.uid()) and profiles.role = 'admin'::role_enum
  ));

-- ─────────────────────────────────────────────────────────────
-- 2) SECURITY DEFINER / 트리거 함수 search_path 고정 (7)
--    본문은 그대로 두고 config만 더한다.
-- ─────────────────────────────────────────────────────────────

alter function public.create_sermon(jsonb, jsonb) set search_path = public, pg_temp;
alter function public.update_sermon(bigint, jsonb, uuid[], jsonb) set search_path = public, pg_temp;
alter function public.delete_sermon(bigint) set search_path = public, pg_temp;
alter function public.get_adjacent_bulletins(bigint) set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.handle_updated_at() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;

-- ─────────────────────────────────────────────────────────────
-- 3) 중복 인덱스 제거 (idx_sermons_date == idx_sermons_date_desc)
--    idx_sermons_date_desc를 남긴다(001_sermon_schema가 만드는 이름).
-- ─────────────────────────────────────────────────────────────

drop index if exists public.idx_sermons_date;

-- ─────────────────────────────────────────────────────────────
-- 4) FK 커버링 인덱스 추가
-- ─────────────────────────────────────────────────────────────

create index if not exists idx_sermon_resources_sermon on public.sermon_resources (sermon_id);
create index if not exists idx_site_collections_updated_by on public.site_collections (updated_by);
