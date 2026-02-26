import { handleResponse } from '@/services/root/handle-response';
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
  /**
   * [목록] 페이지네이션 및 연도별 필터링이 적용된 주보 목록 조회
   */
  fetchBulletinList: async ({ year, page = 1, limit = 10 }: BulletinParams = {}) => {
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

  /**
   * [전체 ID] 정적 생성(SSG)을 위한 전체 주보 ID 목록 조회
   */
  fetchAllBulletinIds: async () => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select('id')
      .order('date', { ascending: false });

    return handleResponse(res);
  },

  /**
   * [단일 상세] ID 기반 주보 상세 정보 및 작성자 정보 조회
   */
  fetchBulletinDetailById: async (id: string) => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select(`*, profiles:profiles ( user_name )`)
      .eq('id', Number(id))
      .single();

    return handleResponse(res);
  },

  /**
   * [요약] RPC를 통한 주보 요약 통계/리스트 조회
   */
  fetchBulletinSummaryRpc: async ({
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

  /**
   * [인접 데이터] 특정 주보 기준 이전/다음 주보 정보 조회
   */
  fetchNavigationBulletins: async (targetId: number) => {
    const res = await supabase.rpc('get_prev_and_next_dev', { target_id: targetId }).maybeSingle();

    return handleResponse(res);
  },

  /**
   * [생성] 새로운 주보 게시글 등록
   */
  createBulletin: async ({ title, date, imageUrls, userId }: BulletinFormParams) => {
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

  /**
   * [수정] 기존 주보 게시글 업데이트
   */
  updateBulletin: async ({ title, date, imageUrls, bulletinId }: BulletinEditFormParams) => {
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
  fetchLatestBulletin: async () => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return handleResponse(res);
  }
});
