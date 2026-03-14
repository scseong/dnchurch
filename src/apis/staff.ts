import { createStaticClient } from '@/lib/supabase/static';

export const getActiveStaff = () => {
  const supabase = createStaticClient({
    tags: ['staff'],
    cache: 'force-cache'
  });

  return supabase.from('staff').select('*').eq('is_active', true).order('order_index');
};
