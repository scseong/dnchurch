CREATE TYPE worship_category AS ENUM ('main', 'church_school');

CREATE TABLE worship_schedules (
  id          serial            PRIMARY KEY,
  name        text              NOT NULL,
  time        text              NOT NULL,
  location    text              NOT NULL,
  category    worship_category  NOT NULL,
  order_index integer           NOT NULL DEFAULT 0,
  is_active   boolean           NOT NULL DEFAULT true,
  created_at  timestamptz       NOT NULL DEFAULT now(),
  updated_at  timestamptz       NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE worship_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "worship_schedules is publicly readable"
  ON worship_schedules FOR SELECT
  USING (true);

CREATE POLICY "only admins can modify worship_schedules"
  ON worship_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 초기 데이터
INSERT INTO worship_schedules (name, time, location, category, order_index) VALUES
  ('새벽기도회',   '매일 오전 05:30', '소예배실',          'main',          0),
  ('주일낮예배',   '오전 11:00',      '대예배실',          'main',          1),
  ('주일저녁예배', '오후 06:00',      '대예배실',          'main',          2),
  ('수요기도회',   '오후 07:00',      '대예배실',          'main',          3),
  ('금요기도회',   '오후 08:00',      '대예배실',          'main',          4),
  ('유치부',       '오전 09:00',      '소예배실',          'church_school', 0),
  ('초등부',       '오전 09:00',      '교육관 유초등부실', 'church_school', 1),
  ('중고등부',     '오전 09:00',      '대예배실',          'church_school', 2),
  ('청년부',       '오후 01:30',      '대예배실',          'church_school', 3);
