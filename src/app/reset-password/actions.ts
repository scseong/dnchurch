'use server';

import { cookies } from 'next/headers';
import { createServerSideClient } from '@/shared/supabase/server';
import { generateErrorMessage } from '@/shared/constants/error';

export async function updatePasswordAndSignOut(newPassword: string) {
  const cookieStore = await cookies();
  const authCode = cookieStore.get('reset_auth_code')?.value;
  const supabase = await createServerSideClient({});

  if (authCode) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
    cookieStore.delete('reset_auth_code');

    if (exchangeError) {
      return {
        error: '링크가 만료되었습니다. 인증 메일을 다시 요청해주세요.'
      };
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    const message = generateErrorMessage(updateError);
    return { error: message };
  }

  await supabase.auth.signOut();
  return { error: null };
}
