import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/shared/supabase/middleware';
import { createServerSideClient } from './shared/supabase/server';

export async function middleware(request: NextRequest) {
  const supabase = await createServerSideClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  await updateSession(request);

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/fellowship']
};
