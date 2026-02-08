'use client';

import { rootService } from '@/services/root/api-schema';
import { getSupabaseBrowserClient } from '@/shared/supabase/client';

let cached: ReturnType<typeof rootService> | undefined;

export const getClientService = () => {
  if (cached) return cached;
  const supabase = getSupabaseBrowserClient();
  cached = rootService(supabase);
  return cached;
};
