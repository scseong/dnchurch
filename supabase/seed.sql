-- ============================================================
-- Seed: 설교 관련 샘플 데이터
-- sermons.id는 bigint identity라 id를 지정하지 않고, sermon_resources는 slug로 연결한다.
-- ============================================================

-- preachers
INSERT INTO preachers (id, name, title, photo_url, bio) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '김은혜', '담임목사', NULL, '대구동남교회 담임목사'),
  ('a1b2c3d4-0001-4000-8000-000000000002', '박진우', '부목사',  NULL, '대구동남교회 부목사');

-- sermon_series (year는 started_at에서 자동 생성되는 컬럼이라 지정하지 않는다)
INSERT INTO sermon_series (id, title, slug, description, started_at, sort_order, is_active) VALUES
  ('b2c3d4e5-0002-4000-8000-000000000001', '창세기 강해', 'genesis-exposition', '창세기를 통해 하나님의 창조와 구속의 역사를 배웁니다.', '2025-03-02', 1, true),
  ('b2c3d4e5-0002-4000-8000-000000000002', '산상수훈',    'sermon-on-the-mount', '마태복음 5-7장 산상수훈 시리즈입니다.',               '2026-01-04', 1, true);

-- sermons (id는 identity라 미지정)
INSERT INTO sermons (title, slug, sermon_date, preacher_id, series_id, series_order, video_provider, video_id, duration, scripture, summary, is_published) VALUES
  ('태초에 하나님이',   'in-the-beginning', '2025-03-02', 'a1b2c3d4-0001-4000-8000-000000000001', 'b2c3d4e5-0002-4000-8000-000000000001', 1, 'youtube', 'dQw4w9WgXcQ', '45:30', '창세기 1:1-5',    '천지 창조의 첫째 날, 빛과 어둠을 나누신 하나님의 뜻을 살펴봅니다.', true),
  ('하나님의 형상대로', 'in-gods-image',    '2025-03-09', 'a1b2c3d4-0001-4000-8000-000000000001', 'b2c3d4e5-0002-4000-8000-000000000001', 2, 'youtube', 'dQw4w9WgXcR', '42:15', '창세기 1:26-31',  '하나님의 형상으로 지음 받은 인간의 존엄성과 사명을 나눕니다.',       true),
  ('에덴동산',          'garden-of-eden',   '2025-03-16', 'a1b2c3d4-0001-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 3, 'youtube', 'dQw4w9WgXcS', '38:45', '창세기 2:8-17',   '에덴동산에 담긴 하나님의 풍성한 공급과 언약을 묵상합니다.',         true),
  ('심령이 가난한 자',  'poor-in-spirit',   '2026-01-04', 'a1b2c3d4-0001-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000002', 1, 'youtube', 'dQw4w9WgXcT', '40:20', '마태복음 5:1-6',  '팔복의 첫 번째, 심령이 가난한 자의 참된 의미를 탐구합니다.',       true),
  ('세상의 빛과 소금',  'salt-and-light',   '2026-01-11', 'a1b2c3d4-0001-4000-8000-000000000001', 'b2c3d4e5-0002-4000-8000-000000000002', 2, 'youtube', 'dQw4w9WgXcU', '43:10', '마태복음 5:13-16','그리스도인의 세상 속 역할과 영향력에 대해 나눕니다.',             true),
  ('기도의 본',         'the-lords-prayer', '2026-01-18', 'a1b2c3d4-0001-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000002', 3, 'youtube', 'dQw4w9WgXcV', '47:00', '마태복음 6:5-15', '주기도문을 통해 바른 기도의 자세와 내용을 배웁니다.',             true);

-- sermon_resources (sermon_id는 slug로 조회해 연결)
INSERT INTO sermon_resources (sermon_id, title, file_type, file_url, file_size_bytes, sort_order)
SELECT id, '태초에 하나님이 - 설교 요약', 'pdf', 'https://example.com/resources/genesis-01-summary.pdf', 245000, 1
  FROM sermons WHERE slug = 'in-the-beginning';
INSERT INTO sermon_resources (sermon_id, title, file_type, file_url, file_size_bytes, sort_order)
SELECT id, '심령이 가난한 자 - 소그룹 교재', 'pdf', 'https://example.com/resources/beatitudes-01-guide.pdf', 312000, 1
  FROM sermons WHERE slug = 'poor-in-spirit';
