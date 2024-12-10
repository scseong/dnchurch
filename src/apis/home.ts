import { supabase } from '@/shared/supabase/client';

export const getHomeBanner = async () => {
  const { data: home_banner, error } = await supabase.from('home_banner').select('*');

  if (error) throw new Error(error.message);

  return home_banner;
};
