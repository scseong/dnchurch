-- ============================================================
-- 설교 스키마 (preachers, sermon_series, sermons, sermon_resources)
-- ============================================================

-- 1. preachers
CREATE TABLE preachers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  title       TEXT,
  photo_url   TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. sermon_series
CREATE TABLE sermon_series (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  cover_image_url TEXT,
  year            INT,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. sermons
CREATE TABLE sermons (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  date           DATE NOT NULL,
  preacher_id    UUID NOT NULL REFERENCES preachers(id),
  series_id      UUID REFERENCES sermon_series(id),
  series_order   INT,
  video_provider TEXT NOT NULL DEFAULT 'youtube'
                   CHECK (video_provider IN ('youtube', 'vimeo')),
  video_id       TEXT,
  duration       TEXT,
  scripture_refs TEXT,
  scripture_text TEXT,
  summary        TEXT,
  thumbnail_url  TEXT,
  is_published   BOOLEAN NOT NULL DEFAULT false,
  view_count     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. sermon_resources
CREATE TABLE sermon_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id       UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  file_type       TEXT NOT NULL DEFAULT 'pdf',
  file_url        TEXT NOT NULL,
  file_size_bytes INT,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 인덱스
-- ============================================================

CREATE INDEX idx_sermons_date      ON sermons (date DESC);
CREATE INDEX idx_sermons_series    ON sermons (series_id, series_order);
CREATE INDEX idx_sermons_preacher  ON sermons (preacher_id);
CREATE INDEX idx_sermons_published ON sermons (is_published) WHERE is_published = true;
CREATE INDEX idx_sermon_resources_sermon ON sermon_resources (sermon_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE preachers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_series     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_resources  ENABLE ROW LEVEL SECURITY;

-- preachers: 누구나 조회 가능
CREATE POLICY "preachers_select"
  ON preachers FOR SELECT
  USING (true);

-- sermon_series: 누구나 조회 가능
CREATE POLICY "sermon_series_select"
  ON sermon_series FOR SELECT
  USING (true);

-- sermons: 공개된 설교만 조회 가능
CREATE POLICY "sermons_select_published"
  ON sermons FOR SELECT
  USING (is_published = true);

-- sermon_resources: 누구나 조회 가능
CREATE POLICY "sermon_resources_select"
  ON sermon_resources FOR SELECT
  USING (true);

-- ============================================================
-- 함수: 설교 조회수 증가
-- ============================================================

CREATE OR REPLACE FUNCTION increment_sermon_views(sermon_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sermons
  SET view_count = view_count + 1
  WHERE id = sermon_id;
$$;
