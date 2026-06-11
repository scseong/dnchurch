-- ============================================================
-- 설교 스키마 (preachers, sermon_series, sermons, sermon_resources)
--
-- 실제 dev DB 스키마에 맞춰 재작성(2026-06-12, migration-ssot-recovery).
-- 이전 버전은 sermons.id를 UUID·date 컬럼으로 정의해 실제(bigint·sermon_date)와 어긋났고,
-- service_type·scripture·deleted_at 등 실제 컬럼이 빠져 fresh replay가 깨졌다.
-- ============================================================

-- ---------- enum ----------
CREATE TYPE service_type_enum AS ENUM (
  '주일오전예배', '주일저녁예배', '수요기도회', '금요기도회', '새벽예배', '특별예배'
);
CREATE TYPE sermon_resource_type AS ENUM (
  'pdf', 'audio', 'video', 'link', 'hwp', 'txt'
);

-- ---------- preachers ----------
CREATE TABLE preachers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  title      text,
  photo_url  text,
  bio        text,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- sermon_series ----------
CREATE TABLE sermon_series (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  cover_image_url text,
  sort_order      integer DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  started_at      date NOT NULL,
  ended_at        date,
  year            integer GENERATED ALWAYS AS ((EXTRACT(year FROM started_at))::integer) STORED,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- sermons ----------
CREATE TABLE sermons (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title          text NOT NULL,
  slug           text NOT NULL UNIQUE,
  sermon_date    date NOT NULL,
  preacher_id    uuid NOT NULL REFERENCES preachers(id),
  series_id      uuid REFERENCES sermon_series(id),
  series_order   integer,
  service_type   service_type_enum NOT NULL DEFAULT '주일오전예배',
  video_provider text NOT NULL DEFAULT 'youtube'
                   CHECK (video_provider IN ('youtube', 'vimeo')),
  video_id       text,
  duration       text,
  scripture      text,
  scripture_text text,
  summary        text,
  thumbnail_url  text,
  is_published   boolean NOT NULL DEFAULT false,
  view_count     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);

-- ---------- sermon_resources ----------
CREATE TABLE sermon_resources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id       bigint NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  title           text NOT NULL,
  file_type       sermon_resource_type DEFAULT 'pdf',
  file_url        text NOT NULL,
  file_size_bytes integer,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- ---------- 인덱스 ----------
CREATE INDEX idx_sermons_date_desc    ON sermons (sermon_date DESC);
CREATE INDEX idx_sermons_series       ON sermons (series_id, series_order);
CREATE INDEX idx_sermons_preacher     ON sermons (preacher_id);
CREATE INDEX idx_sermons_published    ON sermons (is_published) WHERE is_published = true;
CREATE INDEX idx_sermons_service_type ON sermons (service_type);
CREATE INDEX idx_sermons_deleted_at   ON sermons (deleted_at);
CREATE INDEX idx_sermon_resources_sermon  ON sermon_resources (sermon_id);
CREATE INDEX idx_sermon_resources_deleted ON sermon_resources (deleted_at);

-- ---------- RLS ----------
ALTER TABLE preachers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_series    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preachers_select"     ON preachers     FOR SELECT USING (true);
CREATE POLICY "sermon_series_select" ON sermon_series FOR SELECT USING (true);

-- 공개 설교는 누구나, 미발행 초안은 admin만 조회
CREATE POLICY "sermons_select_published" ON sermons FOR SELECT USING (is_published = true);
CREATE POLICY "sermons_select_admin"     ON sermons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "sermons_insert_admin"     ON sermons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "sermons_update_admin"     ON sermons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "sermon_resources_select" ON sermon_resources FOR SELECT USING (true);
CREATE POLICY "sermon_resources_insert_admin" ON sermon_resources FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "sermon_resources_update_admin" ON sermon_resources FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ---------- 함수: 설교 조회수 증가 ----------
-- sermons.id가 bigint이므로 파라미터도 bigint(앱이 보내는 값과 일치).
CREATE OR REPLACE FUNCTION increment_sermon_views(sermon_id bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sermons
  SET view_count = view_count + 1
  WHERE id = sermon_id;
$$;
