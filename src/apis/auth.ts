import { supabase } from '@/shared/supabase/client';

export async function signInWithKakao() {
  await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.reload();
}
