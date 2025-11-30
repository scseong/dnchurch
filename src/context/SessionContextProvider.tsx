'use client';

import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect, useState, useContext, useMemo } from 'react';
import { supabase } from '@/shared/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { ProfileType } from '@/shared/types/types';
import { getProfileById, getUserInfo } from '@/apis/user';

const SessionContext = createContext<{
  profile: ProfileType | null;
  error: AuthError | null;
}>({
  profile: null,
  error: null
});

function SessionContextProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      const { user, error } = await getUserInfo();

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        const profile = await getProfileById(user.id);
        setProfile(profile);
      }
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const params = new URLSearchParams(window.location.search);
        const redirectFrom = params.get('redirect') || '/';
        router.push(decodeURIComponent(redirectFrom));
      }
      if (event === 'SIGNED_OUT') {
        router.refresh();
      }

      if (session) getUserProfile();
      else setProfile(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    if (error) {
      return { profile, error };
    }

    return { profile, error: null };
  }, [profile, error]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useProfile = () => {
  const context = useContext(SessionContext);

  if (context === null || context === undefined) {
    throw new Error(`useProfile must be used within a SessionContextProvider.`);
  }

  return context.profile;
};

export const useIsAdmin = () => {
  const context = useContext(SessionContext);

  if (context === null || context === undefined) {
    throw new Error(`useIsAdmin must be used within a SessionContextProvider.`);
  }

  return context.profile?.is_admin;
};

export default SessionContextProvider;
