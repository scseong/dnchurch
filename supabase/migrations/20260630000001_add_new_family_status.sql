-- 새가족 등록 대응 상태 — 관리자가 연락·정착 진행을 추적한다.
-- 상태 변경은 service_role(admin) 전용. 공개 insert는 항상 'pending'으로만 들어온다.

create type public.new_family_status_enum as enum ('pending', 'contacted', 'completed');

alter table public.new_family_registrations
  add column status public.new_family_status_enum not null default 'pending';

-- insert 정책에 status='pending' 강제 — anon이 직접 'completed'로 위장 insert하는 것을 막는다.
drop policy if exists "anyone can submit new family registration" on public.new_family_registrations;

create policy "anyone can submit new family registration"
  on public.new_family_registrations
  for insert
  to anon, authenticated
  with check (privacy_agreed = true and status = 'pending');
