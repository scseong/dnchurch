'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
  useMemo
} from 'react';
import { supabase } from '@/shared/supabase/client';
import { AuthError, PostgrestError, Session } from '@supabase/supabase-js';
import { getProfileById } from '@/apis/user';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/shared/constants/storageConstants';
import { ProfileType } from '@/shared/types/types';

const SessionContext = createContext<{
  isLoading: boolean;
  profile: ProfileType | null;
  error: AuthError | PostgrestError | null;
}>({
  isLoading: true,
  profile: null,
  error: null
});

function SessionContextProvider({ children }: PropsWithChildren) {
  const lastUserIdRef = useRef<string | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState<AuthError | PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const profile = await getProfileById(userId);
      setProfile(profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
      setError(error as AuthError | PostgrestError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthStateChange = useCallback(
    async (event: string, session: Session | null) => {
      const userId = session?.user?.id ?? null;

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && userId) {
        if (lastUserIdRef.current !== userId) {
          lastUserIdRef.current = userId;
          fetchProfile(userId);
        }

        const redirectTo = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY);
        if (redirectTo) {
          localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
          router.replace(redirectTo);
        }
      }

      if (event === 'SIGNED_OUT') {
        lastUserIdRef.current = null;
        setProfile(null);
        setError(null);
        setIsLoading(false);
        router.refresh();
      }

      if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false);
      }
    },
    [router, fetchProfile]
  );

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const value = useMemo(() => {
    return { profile, isLoading, error };
  }, [profile, isLoading, error]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useProfile = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error(`useProfile must be used within a SessionContextProvider.`);
  return context.profile;
};

export const useIsAdmin = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error(`useIsAdmin must be used within a SessionContextProvider.`);
  return context.profile?.is_admin;
};

export default SessionContextProvider;
