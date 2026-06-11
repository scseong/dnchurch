-- create_bulletin / update_bulletin RPC 보안 강화
--
-- 문제: 두 함수가 SECURITY DEFINER(owner=postgres)인데 body에 admin 검사가 없고, anon에게
-- EXECUTE가 열려 있었다. 공개 anon 키로 /rest/v1/rpc/create_bulletin·update_bulletin을 직접
-- 호출하면 로그인 없이 주보를 만들고, id만 알면 임의 주보 수정·이미지 삭제가 가능했다.
-- 앱의 checkAdminPermission도, bulletins RLS도 SECURITY DEFINER가 우회한다.
-- 추가로 update_bulletin은 p_image_ids_to_delete를 bulletin_id와 묶지 않아 다른 주보 이미지까지
-- 지울 수 있었고, create_bulletin은 author_id를 클라이언트 입력값으로 받아 작성자 위조가 가능했다.
--
-- 해결: sermon RPC와 같은 auth.uid() 기반 admin 가드를 body 맨 앞에 넣고, author_id는 auth.uid()로
-- 고정한다. 이미지 삭제는 해당 주보 소속으로 제한한다. search_path를 고정하고 PUBLIC·anon의
-- EXECUTE를 회수한다(authenticated는 유지 — 내부 가드가 비admin을 막는다).

CREATE OR REPLACE FUNCTION create_bulletin(
  p_title TEXT,
  p_sunday_date DATE,
  p_author_id UUID,
  p_images JSONB DEFAULT '[]'::JSONB
)
RETURNS SETOF bulletins
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_bulletin_id BIGINT;
BEGIN
  -- 가드 기준은 bulletins 테이블의 기존 RLS(bulletins_*_admin_only)와 동일하게 role+status로 맞춘다.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  -- author_id는 클라이언트 입력(p_author_id) 대신 호출자 본인으로 고정(작성자 위조 차단).
  INSERT INTO bulletins (title, sunday_date, author_id)
  VALUES (p_title, p_sunday_date, auth.uid())
  RETURNING id INTO v_bulletin_id;

  IF jsonb_array_length(p_images) > 0 THEN
    INSERT INTO bulletin_images (bulletin_id, cloudinary_id, order_index)
    SELECT
      v_bulletin_id,
      (img->>'cloudinary_id')::TEXT,
      (img->>'order_index')::INT
    FROM jsonb_array_elements(p_images) AS img;
  END IF;

  RETURN QUERY SELECT * FROM bulletins WHERE id = v_bulletin_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_bulletin(
  p_bulletin_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_sunday_date DATE DEFAULT NULL,
  p_images_to_add JSONB DEFAULT '[]'::JSONB,
  p_image_ids_to_delete BIGINT[] DEFAULT '{}'::BIGINT[]
)
RETURNS SETOF bulletins
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 가드 기준은 bulletins 테이블의 기존 RLS(bulletins_*_admin_only)와 동일하게 role+status로 맞춘다.
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  UPDATE bulletins
  SET
    title = COALESCE(p_title, title),
    sunday_date = COALESCE(p_sunday_date, sunday_date),
    updated_at = NOW()
  WHERE id = p_bulletin_id;

  -- 삭제 대상 이미지를 해당 주보 소속으로 제한(다른 주보 이미지 삭제 차단).
  IF array_length(p_image_ids_to_delete, 1) > 0 THEN
    DELETE FROM bulletin_images
    WHERE id = ANY(p_image_ids_to_delete)
      AND bulletin_id = p_bulletin_id;
  END IF;

  IF jsonb_array_length(p_images_to_add) > 0 THEN
    INSERT INTO bulletin_images (bulletin_id, cloudinary_id, order_index)
    SELECT
      p_bulletin_id,
      (img->>'cloudinary_id')::TEXT,
      (img->>'order_index')::INT
    FROM jsonb_array_elements(p_images_to_add) AS img;
  END IF;

  RETURN QUERY SELECT * FROM bulletins WHERE id = p_bulletin_id;
END;
$$;

-- 공개·anon 실행 차단. authenticated만 호출 가능하고, 내부 가드가 비admin을 거부한다.
REVOKE EXECUTE ON FUNCTION create_bulletin(TEXT, DATE, UUID, JSONB) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION update_bulletin(BIGINT, TEXT, DATE, JSONB, BIGINT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_bulletin(TEXT, DATE, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_bulletin(BIGINT, TEXT, DATE, JSONB, BIGINT[]) TO authenticated;
