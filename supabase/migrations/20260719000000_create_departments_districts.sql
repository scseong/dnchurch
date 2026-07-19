-- 부서(departments)·구역(districts) 마스터 + 프로필 연결
--
-- 부서와 구역은 독립이다 — 구역(믿음·소망·사랑·화평·희락)은 부서에 종속되지 않는 평평한 목록.
-- 프로필은 부서 하나·구역 하나를 각각 고르고, 구역 내 역할(district_role)을 둔다.
-- dept_id는 지금까지 FK 없는 죽은 int였다(baseline). FK를 걸기 전에 orphan 값을 null로 비운다.
-- RLS: 로그인 화면(프로필 편집)에서만 소비하므로 authenticated 읽기 + admin 수정(worship_schedules 패턴).

create table public.departments (
  id integer primary key generated always as identity,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.departments is '교회 부서 마스터. 프로필의 소속 부서 드롭다운 소스.';

create table public.districts (
  id integer primary key generated always as identity,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.districts is '교회 구역 마스터(부서와 독립). 프로필의 소속 구역 드롭다운 소스.';

-- 기존 dept_id는 참조 대상이 없던 죽은 값이라 FK 전에 비운다 (orphan으로 FK 추가 실패 방지).
update public.profiles set dept_id = null where dept_id is not null;

alter table public.profiles
  add constraint profiles_dept_id_fkey foreign key (dept_id) references public.departments (id);
alter table public.profiles
  add column district_id integer references public.districts (id);
alter table public.profiles
  add column district_role text not null default '일반'
    check (district_role in ('일반', '구역리더', '구역장'));
comment on column public.profiles.district_role is '구역 내 역할: 일반·구역리더·구역장.';

-- 구역이 없으면 역할은 일반만 — "구역 내 역할"이라 구역 없이 구역장/리더는 성립하지 않는다.
alter table public.profiles
  add constraint profiles_district_role_requires_district
    check (district_id is not null or district_role = '일반');

-- RLS: authenticated 읽기 + admin 수정
alter table public.departments enable row level security;
alter table public.districts enable row level security;

create policy "departments_select_authenticated"
  on public.departments for select to authenticated using (true);
create policy "departments_admin_modify"
  on public.departments for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "districts_select_authenticated"
  on public.districts for select to authenticated using (true);
create policy "districts_admin_modify"
  on public.districts for all
  using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

-- 시드 (사용자 제공 실제 데이터)
insert into public.departments (name, sort_order) values
  ('유치부', 0),
  ('유초등부', 1),
  ('중고등부', 2),
  ('청년부', 3),
  ('마리아', 4),
  ('디모데', 5),
  ('바울', 6),
  ('리브가', 7),
  ('루디아', 8),
  ('한나', 9);

insert into public.districts (name, sort_order) values
  ('믿음', 0),
  ('소망', 1),
  ('사랑', 2),
  ('화평', 3),
  ('희락', 4);
