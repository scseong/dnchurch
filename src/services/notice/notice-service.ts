import { handleResponse } from '@/services/handle-response';
import { NOTICE_BUCKET } from '@/constants/notice';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { NoticeListParams } from '@/types/notice';

// PostgREST .or()에서 `(`, `)`, `,`는 조건 구분자다. 검색어에 섞이면 title+content OR가 깨지므로 공백으로 뺀다.
function escapeOrToken(value: string): string {
  return value.replace(/[(),]/g, ' ');
}

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
      const safe = escapeOrToken(search);
      query = query.or(`title.ilike.%${safe}%,content.ilike.%${safe}%`);
    }

    query = query.order('is_pinned', { ascending: false });

    switch (sort) {
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
    const res = await supabase
      .from(NOTICE_BUCKET)
      .select('id')
      .is('deleted_at', null)
      .order('id', { ascending: false });
    return handleResponse(res);
  },

  detailById: async (id: string) => {
    const res = await supabase
      .from(NOTICE_BUCKET)
      .select('*')
      .eq('id', Number(id))
      .is('deleted_at', null)
      .single();
    return handleResponse(res);
  },

  // 상세의 이전·다음 글 — created_at 기준 바로 앞뒤 1건. 없으면 null.
  // 같은 created_at(초 단위 동시 등록)에서 형제 글을 건너뛰지 않도록 (created_at, id) 복합 keyset을 쓴다.
  adjacent: async (noticeId: number, createdAt: string) => {
    const select = () =>
      supabase.from(NOTICE_BUCKET).select('id, title').is('deleted_at', null);

    const [prev, next] = await Promise.all([
      // 이전(더 오래된) 글: created_at가 더 이르거나, 같으면 id가 더 작은 것
      select()
        .or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${noticeId})`)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // 다음(더 새로운) 글: created_at가 더 늦거나, 같으면 id가 더 큰 것
      select()
        .or(`created_at.gt.${createdAt},and(created_at.eq.${createdAt},id.gt.${noticeId})`)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()
    ]);

    return { prev: handleResponse(prev).data, next: handleResponse(next).data };
  }
});
