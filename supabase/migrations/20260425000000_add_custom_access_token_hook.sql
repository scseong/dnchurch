-- Custom Access Token Hook: profiles.role을 JWT app_metadata에 주입한다.
-- 토큰 발급/갱신 시점에 호출되며, 이후 checkAdminPermission이 DB 조회 없이 claim만으로 role 판별 가능.
-- 참고: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role text;
  claims jsonb;
BEGIN
  SELECT role::text INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := COALESCE(event->'claims', '{}'::jsonb);
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    COALESCE(to_jsonb(user_role), 'null'::jsonb)
  );

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;
