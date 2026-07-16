import 'server-only';

import { createServerSideClient } from '@/lib/supabase/server';

export const getProfileByIdServer = async (userId: string) => {
  const supabase = await createServerSideClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return profile;
};
