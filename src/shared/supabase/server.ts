import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '../types/database.types';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, setCookie } from 'cookies-next/server';

// ServerActions, RouterHandler
export const createServerSideClient = async (serverComponent = false) => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: (key, value, options) => {
          if (serverComponent) return;
          cookieStore.set(key, value, options);
        },
        remove: (key, options) => {
          if (serverComponent) return;
          cookieStore.set(key, '', options);
        }
      }
    }
  );
};

// RSC
export const createServerSideClientRSC = async () => {
  return createServerSideClient(true);
};

// Middleware
export const createServerSideMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => getCookie(key, { req, res }),
        set: (key, value, options) => setCookie(key, value, { req, res, ...options }),
        remove: (key, options) => setCookie(key, '', { req, res, ...options })
      }
    }
  );
};
