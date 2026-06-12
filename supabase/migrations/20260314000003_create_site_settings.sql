CREATE TABLE site_settings (
  key         text         PRIMARY KEY,
  value       text         NOT NULL,
  description text,
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings is publicly readable"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "only admins can modify site_settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 초기 데이터
INSERT INTO site_settings (key, value, description) VALUES
  -- 오시는 길
  ('church_address',       '대구광역시 달서구 달구벌대로307길 58 (죽전동)', '교회 주소'),
  ('church_lat',           '35.85262832577055',                            '지도 위도'),
  ('church_lng',           '128.53467835707838',                           '지도 경도'),
  ('directions_subway',    '2호선 죽전역 1번 출구 (도보 8분)',              '지하철 안내'),
  ('directions_bus_stop_1',   '죽전네거리',                                '버스 정류장 1'),
  ('directions_bus_routes_1', '405 425 509 527 달서5 성서2 250',           '버스 노선 1'),
  ('directions_bus_stop_2',   '죽전119안전센터앞',                          '버스 정류장 2'),
  ('directions_bus_routes_2', '503 서구1-1',                               '버스 노선 2'),

  -- 홈 배너
  ('banner_title',    '동남교회에 오신 것을 환영합니다',                            '홈 배너 제목'),
  ('banner_subtitle', '수고하고 무거운 짐진 당신을 주님의 사랑으로 초대합니다. 마음의 짐을 내려놓고 참된 안식을 누리세요.', '홈 배너 부제'),

  -- 교회 소개 (홈)
  ('about_slogan',  '바른 신학, 바른 교회, 바른 생활',                            '교회 슬로건'),
  ('about_intro_1', '동남교회는 대한예수교장로회(합신) 교단 소속으로, 오직 성경만을 유일한 규칙으로 삼는 개혁주의 신앙을 고백합니다. 바른 신학 위에 굳건히 서서 이 땅에 하나님 나라를 확장하는 건강한 공동체를 세우는 것을 최우선 목적으로 합니다.', '교회 소개 첫째 문단'),
  ('about_intro_2', '바른 신학의 토대 위에서 바른 교회, 바른 생활의 정신을 실천합니다. 그리스도께서 모범을 보이신 것처럼 모든 성도가 겸손한 섬김의 자세로 서로를 존중하며 사랑 안에서 굳건히 연합하는 공동체를 지향합니다.', '교회 소개 둘째 문단');
