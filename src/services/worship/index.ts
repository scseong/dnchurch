import 'server-only';

import { worshipCache } from '@/services/worship/worship-cache';
import { worshipService } from '@/services/worship/worship-service';
import { createStaticClient } from '@/lib/supabase/static';
import type { WorshipScheduleType } from '@/types/common';

type WorshipScheduleGroups = {
  sunday: WorshipScheduleType[];
  weekday: WorshipScheduleType[];
  school: WorshipScheduleType[];
};

export const getWorshipScheduleGroups = async (): Promise<WorshipScheduleGroups> => {
  const supabase = createStaticClient(worshipCache.list());
  const { data } = await worshipService(supabase).list();
  const rows = data ?? [];

  return {
    sunday: rows.filter((r) => r.category === 'main' && r.sub_category === 'sunday'),
    weekday: rows.filter((r) => r.category === 'main' && r.sub_category === 'weekday'),
    school: rows.filter((r) => r.category === 'church_school')
  };
};
