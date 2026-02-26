import { createServerSideClient } from '@/lib/supabase/server';

export const getUserSession = async () => {
  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();

  return data.user || null;
};
