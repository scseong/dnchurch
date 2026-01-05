import { createBrowserClient } from '@supabase/ssr';
import { createFetch } from '@/shared/supabase/lib';
import { Database } from '@/shared/types/database.types';

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient(tags: string[] = [], revalidate = 3600) {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({ next: { tags, revalidate } })
      }
    }
  );

  return client;
}
