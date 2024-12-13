import { supabase } from '@/shared/supabase/client';

export const getProfileById = async (userId = '') => {
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId);

  return profile?.[0];
};
