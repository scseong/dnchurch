import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface Credentials {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export async function signInWithPassword({ email, password }: Credentials) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
}

export async function signInWithKakao(redirect = '/') {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`
    }
  });

  if (error) throw error;
  return data;
}
