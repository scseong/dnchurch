import { handleResponse } from '@/services/handle-response';
import { NOTICE_BUCKET } from '@/constants/notice';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { NoticeListParams } from '@/types/notice';

export const noticeService = (supabase: SupabaseClient<Database>) => ({
  list: async ({ category, page = 1, pageSize = 10 }: NoticeListParams = {}) => {
    let query = supabase.from(NOTICE_BUCKET).select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const res = await query.range(from, to);

    return handleResponse(res);
  },

  allIds: async () => {
    const res = await supabase.from(NOTICE_BUCKET).select('id').order('id', { ascending: false });
    return handleResponse(res);
  },

  detailById: async (id: string) => {
    const res = await supabase.from(NOTICE_BUCKET).select('*').eq('id', Number(id)).single();
    return handleResponse(res);
  }
});
