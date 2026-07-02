import { handleResponse } from '@/services/handle-response';
import { NOTICE_BUCKET } from '@/constants/notice';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { NoticeListParams } from '@/types/notice';

export const noticeService = (supabase: SupabaseClient<Database>) => ({
  list: async ({
    category,
    page = 1,
    pageSize = 10,
    search,
    sort = 'latest'
  }: NoticeListParams = {}) => {
    let query = supabase.from(NOTICE_BUCKET).select('*', { count: 'exact' }).is('deleted_at', null);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    query = query.order('is_pinned', { ascending: false });

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
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
