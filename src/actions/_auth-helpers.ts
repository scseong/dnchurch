import { getUserSession } from '@/apis/auth-server';
import { createServerSideClient } from '@/lib/supabase/server';

export async function checkAdminPermission() {
  const user = await getUserSession();
  if (!user) return { user: null, isAdmin: false };

  const claimRole = (user.app_metadata as { role?: string } | undefined)?.role;
  if (claimRole !== undefined) {
    return { user, isAdmin: claimRole === 'admin' };
  }

  // Fallback: hook 미적용 토큰 보유자(과도기). 후속 PR에서 제거.
  const supabase = await createServerSideClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { user, isAdmin: profile?.role === 'admin' };
}
