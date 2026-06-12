-- Recreate create_bulletin: url field removed from images jsonb shape
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

-- Recreate update_bulletin: url field removed from images jsonb shape
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

-- Drop redundant url column: cloudinary_id 만으로 getCloudinaryUrl()이 URL 재생성 가능
ALTER TABLE bulletin_images DROP COLUMN IF EXISTS url;
