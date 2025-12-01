'use client';

import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useEffect, useState, useContext, useMemo } from 'react';
import { supabase } from '@/shared/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { ProfileType } from '@/shared/types/types';
import { getProfileById } from '@/apis/user';

const SessionContext = createContext<{
  isLoading: boolean;
  profile: ProfileType | null;
  error: AuthError | null;
}>({
  isLoading: true,
  profile: null,
  error: null
});

function SessionContextProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useMemo(
    () => async (userId: string) => {
      setIsLoading(true);
      try {
        const profile = await getProfileById(userId);
        setProfile(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null);
        setError(error as AuthError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsLoading(true);
        setProfile(null);
        setError(null);
        setIsLoading(false);
        router.refresh();
      } else if (!session) {
        setProfile(null);
        setIsLoading(false);
      }

      if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, fetchProfile]);

  const value = useMemo(() => {
    return { profile, isLoading, error };
  }, [profile, isLoading, error]);

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
