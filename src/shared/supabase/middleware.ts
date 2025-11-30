import { createMiddlewareClient } from '@/shared/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = await createMiddlewareClient(request, response);

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  const noAuthPages = ['/login', '/sign-up', '/forget-password'];

  if (user && noAuthPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
