import { createStaticClient } from '@/lib/supabase/static';

// key 누락 / seed 실패 시 빈 배열 fallback — getSiteSettings의 silent fallback과 동일 패턴.
// items는 객체 array 약속(ADR 0006) — primitive T는 의도적으로 차단.
export const getSiteCollection = async <T extends Record<string, unknown>>(
  key: string
): Promise<T[]> => {
  const supabase = createStaticClient({
    tags: ['site-collections', `site-collection-${key}`],
    cache: 'force-cache'
  });

  const { data, error } = await supabase
    .from('site_collections')
    .select('items')
    .eq('key', key)
    .maybeSingle();

  if (error) console.error(`[site-collections] ${key} 조회 실패`, error);

  return (data?.items ?? []) as T[];
};
