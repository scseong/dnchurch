import 'server-only';

import { createServerSideClient } from '@/lib/supabase/server';
import type { OrgOption } from '@/types/common';

// 프로필 편집의 부서·구역 드롭다운 소스. RLS는 authenticated 읽기.
export async function getDeptDistrictOptions(): Promise<{
  departments: OrgOption[];
  districts: OrgOption[];
}> {
  const supabase = await createServerSideClient();
  const [deptRes, distRes] = await Promise.all([
    supabase.from('departments').select('id, name').order('sort_order'),
    supabase.from('districts').select('id, name').order('sort_order')
  ]);
  if (deptRes.error) throw deptRes.error;
  if (distRes.error) throw distRes.error;
  return { departments: deptRes.data, districts: distRes.data };
}
