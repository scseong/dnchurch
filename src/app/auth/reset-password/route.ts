import { NextResponse } from 'next/server';
import { EMAIL_VERIFICATION_TIME } from '@/shared/constants/timer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const response = NextResponse.redirect(new URL('/reset-password', origin));
    response.cookies.set('reset_auth_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: EMAIL_VERIFICATION_TIME,
      path: '/'
    });

    return response;
  }

  return NextResponse.redirect(new URL('/login', origin));
}
