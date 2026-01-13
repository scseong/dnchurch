import { createMiddlewareClient } from '@/shared/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = await createMiddlewareClient(request, response);
  const { pathname, search } = request.nextUrl;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  // const user = data?.claims;

  const noAuthPages = ['/login', '/sign-up', '/forget-password'];
  const authPages = ['/mypage', '/news/bulletin/create', '/news/bulletin/update'];
  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  if (user && noAuthPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!user && isAuthPage) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/login?redirect=${callbackUrl}`, request.url));
  }

  return response;
}
