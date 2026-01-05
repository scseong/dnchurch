import { createStaticClient } from '@/shared/supabase/static';
import { rootService } from '@/services/api-schema';
import { SupabaseClientOptions } from '@/shared/types/types';

export const getStaticService = (options: SupabaseClientOptions = {}) => {
  const supabase = createStaticClient(options);
  return rootService(supabase);
};
