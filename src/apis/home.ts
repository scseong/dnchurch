import { supabase } from '@/shared/client/supabase';

export const getHomeBanner = async () => {
  const { data: home_banner, error } = await supabase.from('home_banner').select('*');

  if (error) throw new Error(error.message);

  return home_banner;
};
