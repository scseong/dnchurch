import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export type NextCacheOptions = {
  tags?: string[];
  revalidate?: false | 0 | number;
  cache?: RequestCache;
};
