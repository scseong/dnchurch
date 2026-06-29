-- 새가족 등록 신청 (공개 폼)
-- 익명(anon) insert만 허용하고, 읽기는 service_role/admin 전용으로 막는다.
-- privacy_agreed = true인 행만 insert 가능(with check)으로 동의 없는 제출을 DB에서 차단한다.

create table public.new_family_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  birth_date date,
  referral_source text,
  is_new_believer boolean not null default false,
  interests text[] not null default '{}',
  privacy_agreed boolean not null,
  created_at timestamptz not null default now()
);

comment on table public.new_family_registrations is '새가족 등록 신청 (공개 폼). 익명 insert만 허용, 읽기는 service_role/admin 전용.';

alter table public.new_family_registrations enable row level security;

create policy "anyone can submit new family registration"
  on public.new_family_registrations
  for insert
  to anon, authenticated
  with check (privacy_agreed = true);
