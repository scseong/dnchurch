import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cleanUrl = new URL('/reset-password', origin);

    const response = NextResponse.redirect(cleanUrl.toString());

    const oneMinuteInSeconds = 60;
    response.cookies.set('reset_auth_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: oneMinuteInSeconds * 2,
      path: '/'
    });

    return response;
  }

  return NextResponse.redirect(new URL('/login', origin));
}
