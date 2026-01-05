import { SupabaseClient } from '@supabase/supabase-js';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';
import { Database } from '@/shared/types/database.types';
import { BulletinType } from '@/shared/types/types';

export type BulletinWithUserName = BulletinType & { profiles: { user_name: string } | null };
export type BulletinSummaryResponse = {
  latest: BulletinType;
  years: { year: number }[];
  items: BulletinType[];
  total: number;
};
export type BulletinSummaryParams = {
  year?: number;
  page?: number;
  limit?: number;
};

export const bulletinService = (supabase: SupabaseClient<Database>) => ({
  /**
   * 주보 목록 조회 (페이지네이션)
   */
  getBulletins: async ({ year = 2025, page = 1, limit = 10 }) => {
    let query = supabase
      .from(BULLETIN_BUCKET)
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });

    if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return await query.range(from, to);
  },

  /**
   * 모든 주보의 ID 목록 조회
   */
  getAllBulletinIds: async () => {
    const { data, error } = await supabase.from(BULLETIN_BUCKET).select('id');

    return { data: data as unknown as { id: number }[] | null, error };
  },

  /**
   * 주보 상세 조회 (작성자 포함)
   */
  getBulletinById: async (id: string) => {
    const { data, error } = await supabase
      .from(BULLETIN_BUCKET)
      .select(`*, profiles:profiles ( user_name )`)
      .eq('id', Number(id))
      .single();

    return { data: data as unknown as BulletinWithUserName, error };
  },

  /**
   * 최신 주보 1건 조회
   */
  getLatestBulletin: async () => {
    return await supabase
      .from(BULLETIN_BUCKET)
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();
  },

  /**
   * 주보 요약 정보 조회 (RPC 호출)
   */
  getBulletinSummary: async ({ year, page = 1, limit = 10 }: BulletinSummaryParams) => {
    const { data, error } = await supabase.rpc('getbulletinsummary', {
      select_year: year || undefined,
      page,
      limit_count: limit
    });

    return { data: data as unknown as BulletinSummaryResponse | null, error };
  },

  /**
   * 이전/다음 주보 정보 조회
   */
  getPrevAndNextBulletin: async (targetId: number) => {
    return await supabase.rpc('get_prev_and_next_dev', { target_id: targetId }).maybeSingle();
  }
});
