import { rootService } from '@/services/root/api-schema';
import { createServerSideClient } from '@/shared/supabase/server';
import type { NextCacheOptions } from '@/shared/supabase/types';

export const getServerService = async (options: NextCacheOptions = {}) => {
  const supabase = await createServerSideClient(options);
  return rootService(supabase);
};
