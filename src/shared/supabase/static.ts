import { createClient } from '@supabase/supabase-js';
import { createFetch } from '@/shared/supabase/fetch';
import type { Database } from '@/shared/types/database.types';
import type { NextCacheOptions } from '@/shared/supabase/types';

export const createStaticClient = (options: NextCacheOptions = {}) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({ cache: 'force-cache', ...options })
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
};
