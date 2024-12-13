'use client';

import { createContext, PropsWithChildren, useEffect, useState, useContext, useMemo } from 'react';
import { supabase } from '@/shared/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { ProfileType } from '@/shared/types/types';

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

  useEffect(() => {
    const getUserProfile = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        setError(error);
        return;
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profile);
      }
    };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        getUserProfile();
      } else {
        setProfile(null);
      }
    });

    getUserProfile();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    if (error) {
      return {
        profile,
        error
      };
    }
    return {
      profile,
      error: null
    };
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

export default SessionContextProvider;
