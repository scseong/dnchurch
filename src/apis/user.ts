import { supabase } from '@/shared/supabase/client';

export const getUserInfo = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  return { user, error };
};

export const getProfileById = async (userId = '') => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile;
};
