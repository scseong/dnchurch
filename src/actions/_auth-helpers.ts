import { getUserSession } from '@/apis/auth-server';
import { createServerSideClient } from '@/lib/supabase/server';

export async function checkAdminPermission() {
  const user = await getUserSession();
  if (!user) return { user: null, isAdmin: false };

  const supabase = await createServerSideClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { user, isAdmin: profile?.role === 'admin' };
}
