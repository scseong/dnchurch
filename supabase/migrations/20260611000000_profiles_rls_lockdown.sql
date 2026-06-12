-- profiles 테이블 RLS 잠금
--
-- 문제: profiles에 RLS가 꺼져 있고 anon/authenticated에 전 컬럼 SELECT/INSERT/UPDATE/DELETE가
-- grant돼 있었다. 공개 anon 키로 (a) 전 교인 PII 조회, (b) 본인 role을 admin으로 변경해
-- 권한 탈취가 가능했다. custom_access_token_hook이 dev에 없어 checkAdminPermission이
-- DB fallback(profiles.role 직접 조회)을 타므로, role 변경은 다음 요청에서 바로 admin으로 인식된다.
--
-- 해결: RLS를 켜고, 클라이언트 직접 쓰기를 모두 차단한다. 회원가입은 postgres 소유 트리거
-- handle_new_user(SECURITY DEFINER)가 처리하므로 anon/authenticated의 INSERT 권한이 없어도 동작한다.
-- 앱은 본인 행만 읽으므로(getProfileById·checkAdminPermission fallback 둘 다 user.id 기준)
-- authenticated 본인 행 SELECT만 허용한다.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- anon은 어떤 접근도 불가
REVOKE ALL ON TABLE public.profiles FROM anon;

-- authenticated는 SELECT만 유지, 직접 쓰기는 회수
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.profiles FROM authenticated;

-- 본인 행만 조회
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- JWT 발급 hook(custom_access_token_hook)을 켤 때 supabase_auth_admin이 role을 읽을 수 있게
-- 미리 정책을 둔다. hook 미설치 상태에서는 미사용 경로라 무해하다.
CREATE POLICY "profiles_select_auth_admin"
  ON public.profiles
  FOR SELECT
  TO supabase_auth_admin
  USING (true);

GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
