import { createStaticClient } from '@/lib/supabase/static';

export const getWorshipSchedules = () => {
  const supabase = createStaticClient({
    tags: ['worship-schedules'],
    cache: 'force-cache'
  });

  return supabase
    .from('worship_schedules')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
};
