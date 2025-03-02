import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '../types/database.types';

export const createFetch =
  (options: Pick<RequestInit, 'next' | 'cache'>) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options
    });
  };

// ServerActions, RouterHandler
export const createServerSideClient = async ({
  cache,
  tag
}: {
  cache?: RequestCache;
  tag?: string;
}) => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({
          next: {
            tags: [tag || 'supabase']
          },
          cache
        })
      },
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: (key, value, options) => {
          cookieStore.set(key, value, options);
        },
        remove: (key, options) => {
          cookieStore.set(key, '', options);
        }
      }
    }
  );
};

// RSC
// export const createServerSideClientRSC = async () => {
//   return createServerSideClient(true);
// };
