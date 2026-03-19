import { createStaticClient } from '@/lib/supabase/static';

export const getRecentSermons = (limit = 3) => {
  const supabase = createStaticClient({
    tags: ['sermon-list'],
    revalidate: 3600
  });

  return supabase
    .from('sermons')
    .select('id, sermon_date, youtube_id, service_type')
    .eq('is_published', true)
    .order('sermon_date', { ascending: false })
    .limit(limit);
};
