CREATE OR REPLACE FUNCTION get_sermon_year_counts()
RETURNS TABLE(year integer, count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    EXTRACT(YEAR FROM sermon_date)::integer AS year,
    COUNT(*)::bigint AS count
  FROM sermons
  WHERE is_published = true
    AND deleted_at IS NULL
  GROUP BY 1
  ORDER BY 1 DESC;
$$;
