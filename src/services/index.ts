import { createServerSideClient } from '@/shared/supabase/server';
import { rootService } from '@/services/api-schema';
import { SupabaseClientOptions } from '@/shared/types/types';

export const getServerService = async (options: SupabaseClientOptions = {}) => {
  const supabase = await createServerSideClient(options);
  return rootService(supabase);
};
