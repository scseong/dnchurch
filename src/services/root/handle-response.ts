import type { SupabaseResult } from '@/shared/supabase/types';

export const handleResponse = <T>(res: SupabaseResult<T>): SupabaseResult<T> => {
  if (res.error) {
    console.error('[Supabase Error]', res.error);
    throw res.error;
  }
  return res;
};
