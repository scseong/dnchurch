import { createStaticClient } from '@/lib/supabase/static';

export type SiteSettings = Record<string, string>;

export const getSiteSettings = async (keys: string[]): Promise<SiteSettings> => {
  const supabase = createStaticClient({
    tags: ['site-settings'],
    cache: 'force-cache'
  });

  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', keys);

  return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]));
};
