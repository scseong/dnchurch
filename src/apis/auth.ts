import { supabase } from '@/shared/supabase/client';

interface Credentials {
  email: string;
  password: string;
}

export async function signUp({ email, password }: Credentials) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  return data;
}

export async function signInWithPassword({ email, password }: Credentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
}

export async function signInWithKakao(nextUrl: string | null) {
  await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: nextUrl
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${nextUrl}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.reload();
}
