import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const pathname = request.nextUrl.pathname;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.nextUrl));
  }

  if (user && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return supabaseResponse;
}
