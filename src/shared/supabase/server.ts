import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/shared/types/database.types';

export const createServerSideClient = async (isAdmin = false) => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isAdmin ? process.env.NEXT_SUPABASE_SERVICE_ROLE! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
          } catch {}
        }
      }
    }
  );
};

export const createMiddlewareClient = async (request: NextRequest, response: NextResponse) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value));
        }
      }
    }
  );
};

// export const createFetch =
//   (options: Pick<RequestInit, 'next' | 'cache'>) =>
//   (url: RequestInfo | URL, init?: RequestInit) => {
//     return fetch(url, {
//       ...init,
//       ...options
//     });
//   };

// export const createServerSideClient = async ({
//   cache,
//   tag
// }: {
//   cache?: RequestCache;
//   tag?: string | string[];
// }) => {
//   const cookieStore = await cookies();

//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       global: {
//         fetch: createFetch({
//           next: {
//             tags: [...(tag || 'supabase')]
//           },
//           cache
//         })
//       },
//       cookies: {
//         get: (key) => cookieStore.get(key)?.value,
//         set: (key, value, options) => {
//           cookieStore.set(key, value, options);
//         },
//         remove: (key, options) => {
//           cookieStore.set(key, '', options);
//         }
//       }
//     }
//   );
// };
