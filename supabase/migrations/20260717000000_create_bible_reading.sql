-- 성경읽기 트래커 (사용자 소유 데이터)
--
-- 이 앱의 첫 사용자 소유 CRUD 테이블. profiles는 role/status 권한 상승 위험 때문에
-- 클라이언트 쓰기를 GRANT 회수로 잠갔지만, 읽기 기록은 민감 컬럼이 없고 행이 전부
-- user_id 소유라 owner-RLS(auth.uid() = user_id)로 CRUD를 연다. 뮤테이션은 여전히
-- 사용자 세션 Server Action이 수행하고(ARCHITECTURE.md: 클라이언트 직접 write 금지),
-- 세션 클라이언트라 RLS가 실제로 적용된다(admin bypass 아님). 관련 ADR: user-owned-data-rls.

-- 원자 단위 = 이 사용자가 이 날(read_date) 이 책(book_order) 이 장(chapter)을
-- 이 회차(cycle)에 읽었다. 연속·일/주/월·통독·목표는 모두 이 행에서 파생한다.
create table public.bible_reading_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_order smallint not null check (book_order between 1 and 66),
  chapter smallint not null check (chapter between 1 and 150),
  read_date date not null,
  cycle smallint not null default 1 check (cycle >= 1),
  created_at timestamptz not null default now(),
  -- 토글 멱등. cycle 미포함이라 같은 날 같은 장을 두 회차에서 재독하는 극희귀 케이스는 무시.
  unique (user_id, book_order, chapter, read_date)
);

comment on table public.bible_reading_records is '사용자별 성경 장 읽기 기록. 원자 단위(날짜·책·장·회차)에서 연속·통독 등을 파생.';

create index bible_reading_records_user_date_idx on public.bible_reading_records (user_id, read_date);
create index bible_reading_records_user_cycle_idx on public.bible_reading_records (user_id, cycle);

alter table public.bible_reading_records enable row level security;

create policy "bible_records_select_own"
  on public.bible_reading_records for select to authenticated
  using (auth.uid() = user_id);

create policy "bible_records_insert_own"
  on public.bible_reading_records for insert to authenticated
  with check (auth.uid() = user_id);

create policy "bible_records_update_own"
  on public.bible_reading_records for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bible_records_delete_own"
  on public.bible_reading_records for delete to authenticated
  using (auth.uid() = user_id);

-- 사용자당 1행. 없으면 서비스가 기본값(weekly_goal=50, current_cycle=1)으로 취급하고
-- 목표 변경·다음 회독 시 upsert로 생성한다.
create table public.bible_reading_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_goal smallint not null default 50 check (weekly_goal between 5 and 150),
  current_cycle smallint not null default 1 check (current_cycle >= 1),
  updated_at timestamptz not null default now()
);

comment on table public.bible_reading_settings is '사용자별 성경읽기 설정 (주간 목표·현재 통독 회차).';

alter table public.bible_reading_settings enable row level security;

create policy "bible_settings_select_own"
  on public.bible_reading_settings for select to authenticated
  using (auth.uid() = user_id);

create policy "bible_settings_insert_own"
  on public.bible_reading_settings for insert to authenticated
  with check (auth.uid() = user_id);

create policy "bible_settings_update_own"
  on public.bible_reading_settings for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
