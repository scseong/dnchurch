'use server';

import { cookies } from 'next/headers';
import { createServerSideClient } from '@/shared/supabase/server';
import { generateErrorMessage } from '@/shared/constants/error';

export async function updatePasswordAndSignOut(newPassword: string) {
  const supabase = await createServerSideClient();
  const supabaseAdmin = await createServerSideClient(true);
  const cookieStore = await cookies();

  const authCode = cookieStore.get('reset_auth_code')?.value;
  let userId = cookieStore.get('reset_user_id')?.value;

  if (authCode) {
    const {
      error: exchangeError,
      data: { session }
    } = await supabase.auth.exchangeCodeForSession(authCode);
    userId = session?.user.id;
    cookieStore.delete('reset_auth_code');

    if (exchangeError) {
      return {
        error: '링크가 만료되었습니다. 인증 메일을 다시 요청해주세요.'
      };
    }

    cookieStore.set('reset_user_id', userId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/'
    });

    await supabase.auth.signOut();
  }

  if (userId) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      return { error: generateErrorMessage(updateError) };
    }

    cookieStore.delete('reset_user_id');
    return { error: null, redirectTo: '/login' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    return { error: generateErrorMessage(updateError) };
  }

  return { error: null, redirectTo: '/' };
}
