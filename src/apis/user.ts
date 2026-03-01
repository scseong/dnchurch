import { supabase } from '@/lib/supabase/client';

export const getProfileById = async (userId = '') => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return profile;
};
