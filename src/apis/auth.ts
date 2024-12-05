import { supabase } from '@/shared/supabase/client';

export async function signInWithKakao() {
  await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback'
    }
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
