import { cache } from 'react';
import { createServerSideClient } from '@/shared/supabase/server';
import { UserProps } from '@/shared/types/types';

export const getCurrentUser = async (): Promise<UserProps> => {
  const supabase = await createServerSideClient({});
  const { data } = await supabase.auth.getUser();

  return data.user as UserProps;
};

export const getUserAdminStatus = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;

  const supabase = await createServerSideClient({});

  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();

  return data?.is_admin || false;
};
