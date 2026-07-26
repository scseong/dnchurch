import { handleResponse } from '@/services/handle-response';
import { buildBaseSlug } from '@/lib/sermon-slug';
import type { SermonDbInsert, SermonDbUpdate } from '@/lib/sermon-form-mapper';
import type { PostgrestResponse, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  SermonListParams,
  SermonWithRelations,
  SermonListItem,
  SermonCardItem,
  SeriesEpisodeItem,
  SeriesWithSermonCount,
  SeriesDetail,
  PreacherWithSermonCount,
  AdminSermon,
  AdminSermonListParams,
  SermonStatusTab
} from '@/types/sermon';

/** RPC create_sermon / update_sermon에 전달하는 리소스 행 형식 */
export type SermonResourceRpcInput = {
  id: string;
  title: string;
  file_url: string;
  file_type: Database['public']['Enums']['sermon_resource_type'];
  file_size_bytes: number | null;
};

const SERMON_WITH_RELATIONS_SELECT = `
  *,
  preacher:preachers(*),
  sermon_series(*),
  sermon_resources(*)
`;

const SERMON_LIST_ITEM_SELECT = `
  id, slug, sermon_date, video_id, video_provider, thumbnail_url,
  title, scripture, service_type,
  preacher:preachers(name, title)
`;

/** 목록 카드 전용 셀렉트 — SermonCardItem과 1:1 (slug·summary는 의도적 superset, P5) */
const SERMON_CARD_SELECT = `
  id, slug, sermon_date, video_id, video_provider, thumbnail_url,
  title, scripture, service_type, summary, duration,
  preacher:preachers(name, title),
  sermon_series(id, slug, title)
`;

/** 시리즈 회차 전용 셀렉트 — SeriesEpisodeItem과 1:1, 관계 join 없음 (P5) */
const SERIES_EPISODE_SELECT = `
  id, series_order, sermon_date, video_id, video_provider, thumbnail_url,
  title, scripture, duration
`;

const ADMIN_SERMON_SELECT = `
  *,
  preacher:preachers(id, name),
  sermon_series(id, title)
`;

const NONE_SERIES_SENTINEL = '__none';

function escapeOrToken(value: string): string {
  return value.replace(/[(),]/g, ' ');
}

/** `select('*, sermons(count)')` 응답의 `sermons: [{ count }]`를 `sermon_count` 평탄 필드로 바꾼다 */
export function mapRowsWithSermonCount<T extends { sermon_count: number }>(
  res: PostgrestResponse<unknown>
): T[] {
  const handled = handleResponse(res);
  const rows = (handled.data ?? []) as unknown as Array<
    T & { sermons: Array<{ count: number }> }
  >;

  return rows.map(({ sermons, ...rest }) => ({
    ...rest,
    sermon_count: sermons?.[0]?.count ?? 0
  })) as unknown as T[];
}

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
    search,
    sort = 'recent'
  }: SermonListParams = {}) => {
    let query = supabase
      .from('sermons')
      .select(SERMON_CARD_SELECT, { count: 'exact' })
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sermon_date', { ascending: sort === 'oldest' });

    if (seriesId === '__none') {
      query = query.is('series_id', null);
    } else if (seriesId) {
      query = query.eq('series_id', seriesId);
    }

    if (preacherId) query = query.eq('preacher_id', preacherId);
    if (serviceType) query = query.eq('service_type', serviceType);

    if (year) {
      query = query.gte('sermon_date', `${year}-01-01`).lte('sermon_date', `${year}-12-31`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,scripture.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const res = await query.range(from, to);
    const handled = handleResponse(res);

    const sermons = (handled.data ?? []) as unknown as SermonCardItem[];
    const total = handled.count ?? 0;

    return {
      sermons,
      total,
      hasMore: from + sermons.length < total
    };
  },

  /** 활성 시리즈 전체를 published + 미삭제 설교 개수와 함께 조회 — 소비처 union 컬럼만 (P5) */
  allSeries: async (): Promise<SeriesWithSermonCount[]> => {
    const res = await supabase
      .from('sermon_series')
      .select('id, slug, title, description, cover_image_url, started_at, ended_at, sermons!inner(count)')
      .eq('is_active', true)
      .eq('sermons.is_published', true)
      .is('sermons.deleted_at', null)
      .order('started_at', { ascending: false })
      .order('sort_order', { ascending: true, nullsFirst: false });

    return mapRowsWithSermonCount<SeriesWithSermonCount>(res);
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
      .select(SERIES_EPISODE_SELECT)
      .eq('series_id', seriesHandled.data.id)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('series_order', { ascending: true, nullsFirst: false })
      .order('sermon_date', { ascending: true });

    const handled = handleResponse(res);
    return (handled.data ?? []) as unknown as SeriesEpisodeItem[];
  },

  /**
   * id로 시리즈 단건 + 회차(설교) 조회. `is_active`는 공개 노출 게이트라 유지
   * — 완료 시리즈는 `ended_at`으로 판별되며 is_active=true로 그대로 노출.
   * 숨김(is_active=false)·미존재 시 null. sermon_count는 노출 회차 수.
   */
  bySeriesId: async (id: string): Promise<SeriesDetail | null> => {
    const seriesRes = await supabase
      .from('sermon_series')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    const seriesHandled = handleResponse(seriesRes);
    if (!seriesHandled.data) return null;

    const res = await supabase
      .from('sermons')
      .select(SERIES_EPISODE_SELECT)
      .eq('series_id', id)
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('series_order', { ascending: true, nullsFirst: false })
      .order('sermon_date', { ascending: true });

    const handled = handleResponse(res);
    const episodes = (handled.data ?? []) as unknown as SeriesEpisodeItem[];
    const seriesRow = seriesHandled.data as unknown as SeriesWithSermonCount;

    return {
      series: { ...seriesRow, sermon_count: episodes.length },
      episodes
    };
  },

  /**
   * 활성 설교자 전체 + published + 미삭제 설교 편수 조회.
   * `sermons!inner(count)`는 집계 lateral이라 발행 0편 설교자도 count:0으로 함께 반환된다(REST 응답으로 확인).
   * 이 전체 목록은 URL preacher 파라미터 해석(resolvePreacherName)과 admin 설교자 선택에 필요하므로 그대로 둔다.
   * 필터 UI에서 0편을 숨기는 일은 표시 직전(`sermons/all/page.tsx`)에서 한다.
   */
  allPreachers: async (): Promise<PreacherWithSermonCount[]> => {
    const res = await supabase
      .from('preachers')
      .select('id, name, title, sermons!inner(count)')
      .eq('is_active', true)
      .eq('sermons.is_published', true)
      .is('sermons.deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    return mapRowsWithSermonCount<PreacherWithSermonCount>(res);
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

  /** 발행 설교 id만 최신순으로 조회 (generateStaticParams용) */
  publishedIds: async (limit: number): Promise<number[]> => {
    const res = await supabase
      .from('sermons')
      .select('id')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('sermon_date', { ascending: false })
      .limit(limit);

    const handled = handleResponse(res);
    return ((handled.data ?? []) as Array<{ id: number }>).map((row) => row.id);
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
  incrementViewCount: async (sermonId: number) => {
    const { error } = await supabase.rpc('increment_sermon_views', {
      sermon_id: sermonId
    });
    if (error) throw error;
  },

  /** [어드민] 설교 생성 — RPC create_sermon으로 sermon + resources 원자 INSERT */
  createSermon: async (
    insert: Omit<SermonDbInsert, 'slug' | 'series_order'>,
    resources: SermonResourceRpcInput[]
  ) => {
    const payload = {
      ...insert,
      base_slug: buildBaseSlug(insert.sermon_date, insert.title)
    };
    const res = await supabase
      .rpc('create_sermon', { p_payload: payload, p_resources: resources })
      .maybeSingle();
    return handleResponse(res);
  },

  /** [어드민] 설교 수정 — RPC update_sermon으로 sermon + resources sync 원자 처리 */
  updateSermon: async (
    id: number,
    update: Omit<SermonDbUpdate, 'slug' | 'series_order' | 'id' | 'created_at'>,
    keepResourceIds: string[],
    newResources: SermonResourceRpcInput[]
  ) => {
    const res = await supabase.rpc('update_sermon', {
      p_id: id,
      p_payload: update,
      p_keep_resource_ids: keepResourceIds,
      p_new_resources: newResources
    });
    return handleResponse(res);
  },

  /** [어드민] 설교 소프트 삭제 — RPC delete_sermon이 삭제할 storage URL 배열을 반환 */
  softDeleteSermon: async (id: number) => {
    const res = await supabase.rpc('delete_sermon', { p_id: id });
    return handleResponse(res);
  },

  /** [어드민] 수정용 설교 조회 — 초안 포함, 삭제 제외 */
  getSermonForEdit: async (id: number) => {
    const res = await supabase
      .from('sermons')
      .select(SERMON_WITH_RELATIONS_SELECT)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    const handled = handleResponse(res);
    return (handled.data as unknown as SermonWithRelations | null) ?? null;
  },

  /** [어드민] 발행 상태별 카운트 — 행을 내려받지 않고 head 카운트 2개로 집계 */
  adminStatusCounts: async (): Promise<Record<SermonStatusTab, number>> => {
    const [publishedRes, draftRes] = await Promise.all([
      supabase
        .from('sermons')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('is_published', true),
      supabase
        .from('sermons')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('is_published', false)
    ]);
    const published = handleResponse(publishedRes).count ?? 0;
    const draft = handleResponse(draftRes).count ?? 0;
    return { all: published + draft, published, draft };
  },

  /** [어드민] 필터/정렬/페이지네이션 적용 목록 — is_published 디폴트 필터 없음 */
  adminList: async (
    params: AdminSermonListParams
  ): Promise<{ sermons: AdminSermon[]; total: number }> => {
    let query = supabase
      .from('sermons')
      .select(ADMIN_SERMON_SELECT, { count: 'exact' })
      .is('deleted_at', null);

    if (params.statusTab === 'published') {
      query = query.eq('is_published', true);
    } else if (params.statusTab === 'draft') {
      query = query.eq('is_published', false);
    }

    if (params.selectedPreachers.length > 0) {
      query = query.in('preacher_id', params.selectedPreachers);
    }

    if (params.selectedSeries.length > 0) {
      const includesNone = params.selectedSeries.includes(NONE_SERIES_SENTINEL);
      const realIds = params.selectedSeries.filter((id) => id !== NONE_SERIES_SENTINEL);
      if (includesNone && realIds.length === 0) {
        query = query.is('series_id', null);
      } else if (!includesNone && realIds.length > 0) {
        query = query.in('series_id', realIds);
      } else {
        query = query.or(`series_id.is.null,series_id.in.(${realIds.join(',')})`);
      }
    }

    if (params.dateFrom) query = query.gte('sermon_date', params.dateFrom);
    if (params.dateTo) query = query.lte('sermon_date', params.dateTo);

    const search = params.search.trim();
    if (search) {
      const safe = escapeOrToken(search);
      query = query.or(`title.ilike.%${safe}%,scripture.ilike.%${safe}%`);
    }

    if (params.sort) {
      query = query.order(params.sort.key, {
        ascending: params.sort.direction === 'asc'
      });
    } else {
      query = query.order('sermon_date', { ascending: false });
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const res = await query.range(from, to);
    const handled = handleResponse(res);

    return {
      sermons: (handled.data ?? []) as unknown as AdminSermon[],
      total: handled.count ?? 0
    };
  },

  /** 공개 설교 상세 조회 — id 기반 */
  detailById: async (id: number) => {
    const res = await supabase
      .from('sermons')
      .select(SERMON_WITH_RELATIONS_SELECT)
      .eq('id', id)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle();

    const handled = handleResponse(res);
    return (handled.data as unknown as SermonWithRelations | null) ?? null;
  }
});
