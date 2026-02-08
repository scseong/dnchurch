import { rootService } from '@/services/root/api-schema';
import { createStaticClient } from '@/shared/supabase/static';
import type { NextCacheOptions } from '@/shared/supabase/types';

export const getStaticService = (options: NextCacheOptions = {}) => {
  const supabase = createStaticClient(options);
  return rootService(supabase);
};
