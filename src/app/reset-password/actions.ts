'use server';

import { cookies } from 'next/headers';
import { createServerSideClient } from '@/lib/supabase/server';
import { generateErrorMessage } from '@/utils/error';
import { RESET_AUTH_CODE_KEY, RESET_USER_ID_KEY } from '@/constants/auth';
import { createAdminServerClient } from '@/lib/supabase/admin';

export async function updatePasswordAndSignOut(newPassword: string) {
  const supabase = await createServerSideClient();
  const supabaseAdmin = createAdminServerClient();
  const cookieStore = await cookies();

  const authCode = cookieStore.get(RESET_AUTH_CODE_KEY)?.value;
  let userId = cookieStore.get(RESET_USER_ID_KEY)?.value;

  if (authCode) {
    const {
      error: exchangeError,
      data: { session }
    } = await supabase.auth.exchangeCodeForSession(authCode);
    userId = session?.user.id;
    cookieStore.delete(RESET_AUTH_CODE_KEY);

    if (exchangeError) {
      return {
        error: '링크가 만료되었습니다. 인증 메일을 다시 요청해주세요.'
      };
    }

    cookieStore.set(RESET_USER_ID_KEY, userId!, {
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

    cookieStore.delete(RESET_USER_ID_KEY);
    return { error: null, redirectTo: '/login' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    return { error: generateErrorMessage(updateError) };
  }

  return { error: null, redirectTo: '/' };
}
