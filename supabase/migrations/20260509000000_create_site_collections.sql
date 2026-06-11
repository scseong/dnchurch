-- ═══════════════════════════════════════════════════════════════════════════
-- about pages content foundation (Phase 1)
-- ADR 0006 — domain-driven content for about pages
--   * site_collections (신규): 작은 array 데이터 — church_history, welcome_faq
--   * staff.greeting_paragraphs (컬럼 추가): 담임목사 인사말 본문
--   * site_settings (확장): location 단일값 키 8개
-- ═══════════════════════════════════════════════════════════════════════════

-- updated_at 자동 갱신 함수 (기존 함수 없음, 인라인 정의)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- site_collections 테이블
-- ───────────────────────────────────────────────────────────────────────────

create table site_collections (
  key         text         primary key,
  items       jsonb        not null,
  description text,
  updated_at  timestamptz  not null default now(),
  updated_by  uuid         references auth.users(id)
);

alter table site_collections enable row level security;

create policy "site_collections is publicly readable"
  on site_collections for select
  using (true);

create policy "only admins can modify site_collections"
  on site_collections for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create trigger site_collections_set_updated_at
before update on site_collections
for each row execute function set_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- staff 컬럼 추가 — 담임목사 인사말 본문
-- ───────────────────────────────────────────────────────────────────────────

alter table staff add column greeting_paragraphs jsonb not null default '[]'::jsonb;

-- ───────────────────────────────────────────────────────────────────────────
-- site_settings 확장 — location 단일값 키 8개 (기존과 일관)
-- ───────────────────────────────────────────────────────────────────────────

insert into site_settings (key, value, description) values
  ('church_phone',           'TODO',                          '교회 대표 전화'),
  ('church_email',           'TODO',                          '교회 대표 이메일'),
  ('church_zipcode',         'TODO',                          '우편번호'),
  ('opening_hours_sunday',   '오전 09:00 – 오후 09:00',        '주일 운영시간'),
  ('opening_hours_weekday',  '오전 09:00 – 오후 06:00',        '평일 운영시간'),
  ('opening_hours_saturday', '오전 09:00 – 오후 03:00',        '토요일 운영시간'),
  ('parking_info_1',         'TODO: 지하 주차장 안내',          '주차 안내 1'),
  ('parking_info_2',         'TODO: 주일 예배 시 무료 안내',    '주차 안내 2')
on conflict (key) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- site_collections seed — Phase 1 row 2개 (church_history, welcome_faq)
-- ───────────────────────────────────────────────────────────────────────────

insert into site_collections (key, items, description) values
  (
    'church_history',
    $$[
      {"year": "1952", "text": "대구동남교회 설립"},
      {"year": "TODO", "text": "TODO: 주요 연혁 입력"},
      {"year": "TODO", "text": "TODO: 주요 연혁 입력"},
      {"year": "TODO", "text": "TODO: 주요 연혁 입력"},
      {"year": "TODO", "text": "TODO: 주요 연혁 입력"}
    ]$$::jsonb,
    'Hub · Vision 페이지 연혁 timeline 공유'
  ),
  (
    'welcome_faq',
    $$[
      {
        "q": "처음 가도 괜찮을까요?",
        "a": "물론입니다. 정해진 복장도, 미리 알려야 할 절차도 없습니다. 그저 오시는 발걸음 자체를 환영합니다. 입구의 「새가족 안내석」에서 안내자가 자리까지 함께 해드립니다."
      },
      {
        "q": "예배 시간에 늦어도 들어갈 수 있나요?",
        "a": "네, 언제든 들어오실 수 있습니다. 문 앞 안내자가 조용히 자리로 안내해 드리며, 늦은 입장이 부담이 되지 않도록 배려하고 있습니다."
      },
      {
        "q": "아이와 함께 가도 되나요?",
        "a": "주일 오전에는 5세 이상 자녀를 위한 교회학교가 운영되며, 영유아실(Cry Room)이 본당 옆에 마련되어 있어 함께 예배드릴 수 있습니다."
      },
      {
        "q": "꼭 등록해야 하나요?",
        "a": "등록은 의무가 아닙니다. 천천히 둘러보시고, 마음이 편해지셨을 때 새가족반을 통해 인사 나누시면 됩니다. 등록 없이 예배만 참석하셔도 전혀 문제없습니다."
      }
    ]$$::jsonb,
    'Welcome 페이지 FAQ 목록'
  )
on conflict (key) do nothing;
