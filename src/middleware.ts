import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/shared/supabase/middleware';
import { createServerSideClient } from './shared/supabase/server';
import { getUserAdminStatus } from './apis/user.action';

export async function middleware(request: NextRequest) {
  const supabase = await createServerSideClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/news/bulletin/create')) {
    const is_admin = await getUserAdminStatus(user?.id || undefined);
    if (!is_admin) return NextResponse.redirect(new URL('/news/bulletin', request.url));
  }

  await updateSession(request);

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/fellowship', '/news/bulletin/create']
};
