import { handleResponse } from '@/services/handle-response';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  SermonListParams,
  SermonWithRelations,
  SermonListItem,
  SeriesWithSermonCount,
  YearCount
} from '@/types/sermon';

const SERMON_WITH_RELATIONS_SELECT = `
  *,
  preacher:preachers(*),
  sermon_series(*),
  sermon_resources(*)
`;

const SERMON_LIST_ITEM_SELECT = `
  id, slug, sermon_date, video_id, video_provider, thumbnail_url,
  title, scripture, service_type,
  preacher:preachers(name)
`;

/** 설교 도메인 Supabase 쿼리 계층 */
export const sermonService = (supabase: SupabaseClient<Database>) => ({
  /** 필터 + 페이지네이션이 적용된 설교 목록 조회 */
  list: async ({
    page = 1,
    pageSize = 12,
    seriesId,
    preacherId,
    serviceType,
    year,
    search
  }: SermonListParams = {}) => {
    let query = supabase
      .from('sermons')
      .select(SERMON_WITH_RELATIONS_SELECT, { count: 'exact' })
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sermon_date', { ascending: false });

    if (seriesId === '__none') {
      query = query.is('series_id', null);
    } else if (seriesId) {
      query = query.eq('series_id', seriesId);
    }

    if (preacherId) query = query.eq('preacher_id', preacherId);
    if (serviceType) query = query.eq('service_type', serviceType);

    if (year) {
      query = query
        .gte('sermon_date', `${year}-01-01`)
        .lte('sermon_date', `${year}-12-31`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,scripture.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const res = await query.range(from, to);
    const handled = handleResponse(res);

    const sermons = (handled.data ?? []) as unknown as SermonWithRelations[];
    const total = handled.count ?? 0;

    return {
      sermons,
      total,
      hasMore: from + sermons.length < total
    };
  },

  /** slug로 설교 상세(설교자·시리즈·리소스 포함) 조회 */
  detailBySlug: async (slug: string) => {
    const res = await supabase
      .from('sermons')
      .select(SERMON_WITH_RELATIONS_SELECT)
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle();

    const handled = handleResponse(res);
    return (handled.data as unknown as SermonWithRelations | null) ?? null;
  },

  /** 활성 시리즈 전체를 설교 개수와 함께 조회 */
  allSeries: async (): Promise<SeriesWithSermonCount[]> => {
    const res = await supabase
      .from('sermon_series')
      .select('*, sermons(count)')
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .order('sort_order', { ascending: true, nullsFirst: false });

    const handled = handleResponse(res);
    const rows = (handled.data ?? []) as unknown as Array<
      SeriesWithSermonCount & { sermons: Array<{ count: number }> }
    >;

    return rows.map(({ sermons, ...rest }) => ({
      ...rest,
      sermon_count: sermons?.[0]?.count ?? 0
    }));
  },

  /** 시리즈 slug에 속한 설교 전체를 연재 순서로 조회 */
  bySeriesSlug: async (seriesSlug: string) => {
    const seriesRes = await supabase
      .from('sermon_series')
      .select('id')
      .eq('slug', seriesSlug)
      .eq('is_active', true)
      .maybeSingle();

    const seriesHandled = handleResponse(seriesRes);
    if (!seriesHandled.data) return [];

    const res = await supabase
      .from('sermons')
      .select(SERMON_WITH_RELATIONS_SELECT)
      .eq('series_id', seriesHandled.data.id)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('series_order', { ascending: true, nullsFirst: false })
      .order('sermon_date', { ascending: true });

    const handled = handleResponse(res);
    return (handled.data ?? []) as unknown as SermonWithRelations[];
  },

  /** 활성 설교자 전체 조회 */
  allPreachers: async () => {
    const res = await supabase
      .from('preachers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    const handled = handleResponse(res);
    return handled.data ?? [];
  },

  /** 최근 설교를 경량 필드셋으로 조회 (홈 카드용) */
  recent: async (limit = 4): Promise<SermonListItem[]> => {
    const res = await supabase
      .from('sermons')
      .select(SERMON_LIST_ITEM_SELECT)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sermon_date', { ascending: false })
      .limit(limit);

    const handled = handleResponse(res);
    return (handled.data ?? []) as unknown as SermonListItem[];
  },

  /** 연도별 설교 편수 집계 (sermon_date projection + JS 집계) */
  yearCounts: async (): Promise<YearCount[]> => {
    const res = await supabase
      .from('sermons')
      .select('sermon_date')
      .eq('is_published', true)
      .is('deleted_at', null);
    const handled = handleResponse(res);
    const rows = (handled.data ?? []) as Array<{ sermon_date: string }>;
    const map = new Map<number, number>();
    for (const { sermon_date } of rows) {
      const y = new Date(sermon_date).getFullYear();
      map.set(y, (map.get(y) ?? 0) + 1);
    }
    return Array.from(map, ([year, count]) => ({ year, count })).sort(
      (a, b) => b.year - a.year
    );
  },

  /** 활성 설교 전체 수 (count-only, rows 없이 head로 조회) */
  totalCount: async (): Promise<number> => {
    const res = await supabase
      .from('sermons')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .is('deleted_at', null);
    const handled = handleResponse(res);
    return handled.count ?? 0;
  },

  /** 설교 조회수 +1 (RPC `increment_sermon_views` 호출) */
  incrementViewCount: async (sermonId: string) => {
    await supabase.rpc('increment_sermon_views', {
      sermon_id: sermonId
    });
  }
});
