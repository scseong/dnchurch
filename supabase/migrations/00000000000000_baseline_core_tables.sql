-- ============================================================
-- Baseline: 대시보드에서 손으로 만들어 마이그레이션에 빠져 있던 핵심 테이블
-- profiles / bulletins / bulletin_images / notices + 관련 enum·트리거·RLS
--
-- 이 파일은 가장 이른 타임스탬프(00000000000000)로 다른 모든 마이그레이션보다 먼저 실행된다.
-- 이후 마이그레이션이 이 테이블들을 참조한다(예: 20260314000000이 bulletins/bulletin_images에 INSERT,
-- 20260314000001 staff RLS가 profiles를 참조, 20260511이 bulletin_images.url을 DROP).
-- 따라서 여기서는 "역사적 시작 상태"를 만든다 — bulletin_images.url을 포함하고,
-- profiles RLS는 켜지 않는다(보안 마이그레이션 20260611000000이 켠다).
-- ============================================================

-- ---------- enum ----------
CREATE TYPE role_enum AS ENUM ('admin', 'dept_manager', 'member');
CREATE TYPE profile_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notice_category_enum AS ENUM (
  '예배', '행사', '교육', '모집', '교인소식', '선교', '행정', '긴급', '기타'
);

-- ---------- profiles ----------
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL,
  name         text NOT NULL,
  display_name text,
  role         role_enum NOT NULL DEFAULT 'member',
  status       profile_status_enum NOT NULL DEFAULT 'pending',
  dept_id      integer,
  phone        text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

-- 회원가입 시 auth.users → profiles 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, display_name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NULL,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone_number'),
    COALESCE(
      NEW.raw_user_meta_data->>'picture',       -- Google
      NEW.raw_user_meta_data->>'profile_image'  -- Kakao
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------- bulletins ----------
CREATE TABLE bulletins (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text NOT NULL,
  content     text,
  sunday_date date NOT NULL UNIQUE,
  view_count  integer NOT NULL DEFAULT 0,
  author_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- ---------- bulletin_images ----------
-- url 컬럼은 역사적 시작 상태. 20260314000000의 create_bulletin이 사용하고,
-- 20260511000000이 DROP한다.
CREATE TABLE bulletin_images (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bulletin_id   bigint NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
  cloudinary_id text NOT NULL,
  url           text,
  order_index   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_order UNIQUE (bulletin_id, order_index)
);

-- ---------- notices ----------
CREATE TABLE notices (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title          text NOT NULL,
  content        text NOT NULL,
  category       notice_category_enum NOT NULL DEFAULT '기타',
  is_pinned      boolean NOT NULL DEFAULT false,
  is_public      boolean NOT NULL DEFAULT true,
  attachment_url text,
  author_id      uuid,
  view_count     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);

-- ---------- RLS ----------
-- profiles는 여기서 RLS를 켜지 않는다(보안 마이그레이션 20260611000000이 켠다).

ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bulletins_select_anyone"
  ON bulletins FOR SELECT TO public
  USING (deleted_at IS NULL);

CREATE POLICY "bulletins_insert_admin_only"
  ON bulletins FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.status = 'approved'
  ));

CREATE POLICY "bulletins_update_admin_only"
  ON bulletins FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.status = 'approved'
  ));

ALTER TABLE bulletin_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bulletin_images_select_anyone"
  ON bulletin_images FOR SELECT TO public
  USING (true);

CREATE POLICY "bulletin_images_insert_admin_only"
  ON bulletin_images FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.status = 'approved'
  ));

CREATE POLICY "bulletin_images_delete_admin_only"
  ON bulletin_images FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.status = 'approved'
  ));

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON notices FOR SELECT TO public
  USING (true);
