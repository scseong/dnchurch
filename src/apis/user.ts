import { createServerSideClient } from '@/shared/supabase/server';

export const getCurrnetUser = async () => {
  const supabase = await createServerSideClient();
  const user = await supabase.auth.getUser();

  return user.data.user;
};
