-- 설교 CUD를 원자화하는 RPC 3종.
-- create_bulletin/update_bulletin (20260314000000) 패턴을 차용.
-- storage 작업은 트랜잭션에 못 들어가므로 앱 레이어가 시퀀싱(업로드 선행 / 삭제 paths 반환).

-- ============================================================
-- create_sermon — sermons + sermon_resources INSERT 원자화
--   p_payload   : mapFormToDbInsert 결과 + base_slug 키 포함
--   p_resources : [{ id, title, file_url, file_type, file_size_bytes }]
-- 슬러그 충돌 시 함수 안에서 -2, -3, ... 으로 재시도.
-- ============================================================

CREATE OR REPLACE FUNCTION create_sermon(
  p_payload jsonb,
  p_resources jsonb DEFAULT '[]'::jsonb
)
RETURNS SETOF sermons
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_slug text := p_payload->>'base_slug';
  v_slug text := v_base_slug;
  v_attempt int := 1;
  v_series_id uuid := NULLIF(p_payload->>'series_id', '')::uuid;
  v_series_order int;
  v_sermon_id bigint;
BEGIN
  -- defense-in-depth: action 레이어 가드를 우회한 직접 호출(SDK) 차단
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  IF v_base_slug IS NULL OR v_base_slug = '' THEN
    RAISE EXCEPTION 'base_slug is required';
  END IF;

  IF v_series_id IS NOT NULL THEN
    SELECT COUNT(*) + 1 INTO v_series_order
    FROM sermons
    WHERE series_id = v_series_id AND deleted_at IS NULL;
  END IF;

  -- slug unique 충돌 시 재시도 (최대 100회)
  LOOP
    BEGIN
      INSERT INTO sermons (
        title, slug, sermon_date, preacher_id, series_id, series_order,
        service_type, video_provider, video_id, thumbnail_url,
        duration, scripture, scripture_text, summary, is_published
      ) VALUES (
        p_payload->>'title',
        v_slug,
        (p_payload->>'sermon_date')::date,
        (p_payload->>'preacher_id')::uuid,
        v_series_id,
        v_series_order,
        (p_payload->>'service_type')::service_type_enum,
        COALESCE(p_payload->>'video_provider', 'youtube'),
        p_payload->>'video_id',
        p_payload->>'thumbnail_url',
        p_payload->>'duration',
        p_payload->>'scripture',
        p_payload->>'scripture_text',
        p_payload->>'summary',
        COALESCE((p_payload->>'is_published')::boolean, false)
      )
      RETURNING id INTO v_sermon_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 100 THEN
        RAISE EXCEPTION 'failed to generate unique slug from base "%" after 100 attempts', v_base_slug;
      END IF;
      v_slug := v_base_slug || '-' || v_attempt;
    END;
  END LOOP;

  IF jsonb_array_length(p_resources) > 0 THEN
    INSERT INTO sermon_resources (
      id, sermon_id, title, file_url, file_type, file_size_bytes, sort_order
    )
    SELECT
      (r->>'id')::uuid,
      v_sermon_id,
      r->>'title',
      r->>'file_url',
      (r->>'file_type')::sermon_resource_type,
      NULLIF(r->>'file_size_bytes', '')::int,
      (idx)::int
    FROM jsonb_array_elements(p_resources) WITH ORDINALITY AS arr(r, idx);
  END IF;

  RETURN QUERY SELECT * FROM sermons WHERE id = v_sermon_id;
END;
$$;

-- ============================================================
-- update_sermon — sermons UPDATE + sermon_resources sync 원자화
--   p_keep_resource_ids : 폼에 살아남은 기존 resource id 배열
--   p_new_resources     : 신규 resource (storage 업로드 끝난 상태)
-- 반환: { sermon: row, deleted_urls: text[] } — 삭제할 storage URL을 TS가 처리
-- 슬러그는 변경하지 않음 (permalink 안정성).
-- ============================================================

CREATE OR REPLACE FUNCTION update_sermon(
  p_id bigint,
  p_payload jsonb,
  p_keep_resource_ids uuid[] DEFAULT '{}'::uuid[],
  p_new_resources jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sermon sermons;
  v_deleted_urls text[];
  v_max_order int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  UPDATE sermons SET
    title          = COALESCE(p_payload->>'title', title),
    sermon_date    = COALESCE((p_payload->>'sermon_date')::date, sermon_date),
    preacher_id    = COALESCE((p_payload->>'preacher_id')::uuid, preacher_id),
    series_id      = NULLIF(p_payload->>'series_id', '')::uuid,
    service_type   = COALESCE((p_payload->>'service_type')::service_type_enum, service_type),
    video_provider = COALESCE(p_payload->>'video_provider', video_provider),
    video_id       = p_payload->>'video_id',
    thumbnail_url  = p_payload->>'thumbnail_url',
    duration       = p_payload->>'duration',
    scripture      = p_payload->>'scripture',
    scripture_text = p_payload->>'scripture_text',
    summary        = p_payload->>'summary',
    is_published   = COALESCE((p_payload->>'is_published')::boolean, is_published),
    updated_at     = now()
  WHERE id = p_id
  RETURNING * INTO v_sermon;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sermon not found: %', p_id USING ERRCODE = 'P0001';
  END IF;

  -- 폼에서 빠진 기존 리소스 → soft-delete + URL 수집
  WITH deleted AS (
    UPDATE sermon_resources
    SET deleted_at = now(), updated_at = now()
    WHERE sermon_id = p_id
      AND deleted_at IS NULL
      AND id <> ALL(p_keep_resource_ids)
    RETURNING file_url
  )
  SELECT array_agg(file_url) INTO v_deleted_urls FROM deleted;

  IF v_deleted_urls IS NULL THEN
    v_deleted_urls := '{}'::text[];
  END IF;

  -- 살아남은 리소스의 max sort_order 계산 (신규의 sort_order 시작점)
  SELECT COALESCE(MAX(sort_order), 0) INTO v_max_order
  FROM sermon_resources
  WHERE sermon_id = p_id AND deleted_at IS NULL;

  IF jsonb_array_length(p_new_resources) > 0 THEN
    INSERT INTO sermon_resources (
      id, sermon_id, title, file_url, file_type, file_size_bytes, sort_order
    )
    SELECT
      (r->>'id')::uuid,
      p_id,
      r->>'title',
      r->>'file_url',
      (r->>'file_type')::sermon_resource_type,
      NULLIF(r->>'file_size_bytes', '')::int,
      v_max_order + (idx)::int
    FROM jsonb_array_elements(p_new_resources) WITH ORDINALITY AS arr(r, idx);
  END IF;

  RETURN jsonb_build_object(
    'sermon', to_jsonb(v_sermon),
    'deleted_urls', to_jsonb(v_deleted_urls)
  );
END;
$$;

-- ============================================================
-- delete_sermon — sermon + 모든 resources soft-delete + 삭제할 URL 반환
-- ============================================================

CREATE OR REPLACE FUNCTION delete_sermon(p_id bigint)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_urls text[];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  WITH deleted AS (
    UPDATE sermon_resources
    SET deleted_at = now(), updated_at = now()
    WHERE sermon_id = p_id AND deleted_at IS NULL
    RETURNING file_url
  )
  SELECT array_agg(file_url) INTO v_urls FROM deleted;

  UPDATE sermons SET deleted_at = now(), updated_at = now()
  WHERE id = p_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'sermon not found or already deleted: %', p_id USING ERRCODE = 'P0001';
  END IF;

  RETURN COALESCE(v_urls, '{}'::text[]);
END;
$$;
