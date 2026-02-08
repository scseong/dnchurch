import { createMiddlewareClient } from '@/shared/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = await createMiddlewareClient(request, response);
  const { pathname, search } = request.nextUrl;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const noAuthPages = ['/login', '/sign-up', '/forget-password'];
  const isAuthPage = (path: string) => {
    const exactMatches = ['/mypage', '/news/bulletin/create'];
    const dynamicPattern = /^\/news\/bulletin\/[^/]+\/update$/;

    if (exactMatches.includes(path)) return true;
    if (dynamicPattern.test(path)) return true;
    return false;
  };

  if (user && noAuthPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!user && isAuthPage(pathname)) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/login?redirect=${callbackUrl}`, request.url));
  }

  return response;
}
