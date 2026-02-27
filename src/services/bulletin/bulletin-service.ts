import { handleResponse } from '@/services/handle-response';
import { BULLETIN_BUCKET } from '@/constants/bulletin';
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  BulletinParams,
  BulletinSummaryResponse,
  BulletinEditFormParams,
  BulletinFormParams
} from '@/types/bulletin';

export const bulletinService = (supabase: SupabaseClient<Database>) => ({
  list: async ({ year, page = 1, limit = 10 }: BulletinParams = {}) => {
    let query = supabase
      .from(BULLETIN_BUCKET)
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });

    if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const res = await query.range(from, to);

    return handleResponse(res);
  },

  allIds: async () => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select('id')
      .order('date', { ascending: false });

    return handleResponse(res);
  },

  detailById: async (id: string) => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select(`*, profiles:profiles ( user_name )`)
      .eq('id', Number(id))
      .single();

    return handleResponse(res);
  },

  summary: async ({
    year,
    page = 1,
    limit = 10
  }: BulletinParams): Promise<PostgrestSingleResponse<BulletinSummaryResponse>> => {
    const res = await supabase
      .rpc(
        'getbulletinsummary',
        {
          select_year: year || undefined,
          page,
          limit_count: limit
        },
        { get: true }
      )
      .single();

    return handleResponse(res as any) as any;
  },

  adjacents: async (targetId: number) => {
    const res = await supabase.rpc('get_prev_and_next_dev', { target_id: targetId }).maybeSingle();

    return handleResponse(res);
  },

  create: async ({ title, date, imageUrls, userId }: BulletinFormParams) => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .insert({
        title,
        date,
        image_url: imageUrls,
        user_id: userId
      })
      .select()
      .single();

    return handleResponse(res);
  },

  update: async ({ title, date, imageUrls, bulletinId }: BulletinEditFormParams) => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .update({
        title,
        date,
        image_url: imageUrls
      })
      .eq('id', Number(bulletinId))
      .select()
      .single();

    return handleResponse(res);
  },

  /**
   * @deprecated
   * [최신] 가장 최근 날짜의 주보 1건 조회
   */
  latest: async () => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return handleResponse(res);
  }
});
