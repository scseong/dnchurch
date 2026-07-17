import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createServerSideClient } from '@/lib/supabase/server';
import { safeInternalPath } from '@/utils/url';

// 이메일 확인 링크 착지점. token_hash를 서버에서 검증하므로 code 교환과 달리 기기·브라우저에 묶이지 않는다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  // 가입 확인 전용 라우트라 type 기본값은 'signup'. 이메일 템플릿이 type을 안 넘겨도 동작한다
  const type = (searchParams.get('type') || 'signup') as EmailOtpType;
  const next = safeInternalPath(searchParams.get('next'), origin);

  if (tokenHash) {
    const supabase = await createServerSideClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error', origin));
}
