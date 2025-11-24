'use server';

import { createServerSideClient } from '@/shared/supabase/server';
import { cookies } from 'next/headers';

export async function updatePasswordAndSignOut(newPassword: string) {
  const cookieStore = await cookies();
  const authCode = cookieStore.get('reset_auth_code')?.value;

  if (!authCode) {
    return { error: '인증 코드를 찾을 수 없습니다. 인증 메일을 다시 요청해주세요.' };
  }

  const supabase = await createServerSideClient({});
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);

  if (exchangeError) {
    cookieStore.delete('reset_auth_code');
    return {
      error: `인증 코드 교환 실패: ${exchangeError.message}. 링크가 만료되었습니다.`
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  await supabase.auth.signOut();
  cookieStore.delete('reset_auth_code');

  if (updateError) {
    return { error: `비밀번호 업데이트 실패: ${updateError.message}` };
  }

  return { error: null };
}
