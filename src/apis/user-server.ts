import 'server-only';

import { createServerSideClient } from '@/lib/supabase/server';
import type { ProfileWithOrg } from '@/types/common';

export const getProfileByIdServer = async (userId: string): Promise<ProfileWithOrg> => {
  const supabase = await createServerSideClient();
  // 부서·구역 이름을 함께 읽는다 (각각 profiles의 단일 FK — dept_id, district_id).
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, departments(name), districts(name)')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return profile as ProfileWithOrg;
};
