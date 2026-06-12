CREATE TABLE staff (
  id          serial       PRIMARY KEY,
  name        text         NOT NULL,
  title       text         NOT NULL,
  image_url   text,
  education   text[]       NOT NULL DEFAULT '{}',
  experience  text[]       NOT NULL DEFAULT '{}',
  contact     text,
  order_index integer      NOT NULL DEFAULT 0,
  is_active   boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff is publicly readable"
  ON staff FOR SELECT
  USING (true);

CREATE POLICY "only admins can modify staff"
  ON staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 초기 데이터
INSERT INTO staff (name, title, image_url, education, experience, contact, order_index) VALUES
  ('김성규', '담임목사', '/images/senior-profile-image.jpg',
   ARRAY['합동신학대학원대학교 졸업'], ARRAY['합신 총회장'],
   'purityk@hanmail.net', 0),
  ('박지권', '교육목사', '/images/assistant-profile-image.jpg',
   ARRAY['합동신학대학원대학교 졸업'], ARRAY['대구 DFC 대표'],
   'gwon56@naver.com', 1);
