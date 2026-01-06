import { createClient } from '@supabase/supabase-js';
import { createFetch } from '@/shared/supabase/lib';
import { Database } from '@/shared/types/database.types';
import { SupabaseClientOptions } from '@/shared/types/types';

export const createStaticClient = ({
  tags = [],
  revalidate = 3600
}: SupabaseClientOptions = {}) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({ next: { tags, revalidate } })
      }
    }
  );
};
