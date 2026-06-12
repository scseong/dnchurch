-- create_bulletin: bulletins + bulletin_images를 하나의 트랜잭션으로 생성
CREATE OR REPLACE FUNCTION create_bulletin(
  p_title TEXT,
  p_sunday_date DATE,
  p_author_id UUID,
  p_images JSONB DEFAULT '[]'::JSONB
)
RETURNS SETOF bulletins
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bulletin_id BIGINT;
BEGIN
  INSERT INTO bulletins (title, sunday_date, author_id)
  VALUES (p_title, p_sunday_date, p_author_id)
  RETURNING id INTO v_bulletin_id;

  IF jsonb_array_length(p_images) > 0 THEN
    INSERT INTO bulletin_images (bulletin_id, cloudinary_id, url, order_index)
    SELECT
      v_bulletin_id,
      (img->>'cloudinary_id')::TEXT,
      (img->>'url')::TEXT,
      (img->>'order_index')::INT
    FROM jsonb_array_elements(p_images) AS img;
  END IF;

  RETURN QUERY SELECT * FROM bulletins WHERE id = v_bulletin_id;
END;
$$;

-- update_bulletin: bulletins 수정 + bulletin_images 삭제/추가를 하나의 트랜잭션으로 처리
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
AS $$
BEGIN
  UPDATE bulletins
  SET
    title = COALESCE(p_title, title),
    sunday_date = COALESCE(p_sunday_date, sunday_date),
    updated_at = NOW()
  WHERE id = p_bulletin_id;

  IF array_length(p_image_ids_to_delete, 1) > 0 THEN
    DELETE FROM bulletin_images WHERE id = ANY(p_image_ids_to_delete);
  END IF;

  IF jsonb_array_length(p_images_to_add) > 0 THEN
    INSERT INTO bulletin_images (bulletin_id, cloudinary_id, url, order_index)
    SELECT
      p_bulletin_id,
      (img->>'cloudinary_id')::TEXT,
      (img->>'url')::TEXT,
      (img->>'order_index')::INT
    FROM jsonb_array_elements(p_images_to_add) AS img;
  END IF;

  RETURN QUERY SELECT * FROM bulletins WHERE id = p_bulletin_id;
END;
$$;

-- get_adjacent_bulletins: 주보 상세의 이전/다음 네비게이션 (id 기준 인접)
CREATE OR REPLACE FUNCTION get_adjacent_bulletins(target_id BIGINT)
RETURNS TABLE(prev_id BIGINT, prev_title TEXT, next_id BIGINT, next_title TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  prev_row record;
  next_row record;
BEGIN
  SELECT id, title INTO prev_row
  FROM public.bulletins
  WHERE id < target_id AND deleted_at IS NULL
  ORDER BY id DESC
  LIMIT 1;

  SELECT id, title INTO next_row
  FROM public.bulletins
  WHERE id > target_id AND deleted_at IS NULL
  ORDER BY id ASC
  LIMIT 1;

  RETURN QUERY SELECT prev_row.id, prev_row.title, next_row.id, next_row.title;
END;
$$;
