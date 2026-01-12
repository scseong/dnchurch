import type { PostgrestError } from '@supabase/supabase-js';
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export type NextCacheOptions = {
  tags?: string[];
  revalidate?: number;
  cache?: RequestCache;
};

export type SupabaseResult<T> = PostgrestResponse<T> | PostgrestSingleResponse<T>;
