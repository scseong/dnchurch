import { createServerSideClient } from '@/shared/supabase/server';
import { UserProps } from '@/shared/types/types';

export const getCurrnetUser = async (): Promise<UserProps> => {
  const supabase = await createServerSideClient();
  const user = await supabase.auth.getUser();

  return user.data.user as UserProps;
};
