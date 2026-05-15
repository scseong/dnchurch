import 'server-only';

import { sermonCache } from '@/services/sermon/sermon-cache';
import { sermonService } from '@/services/sermon/sermon-service';
import { createStaticClient } from '@/lib/supabase/static';
import { createServerSideClient } from '@/lib/supabase/server';
import type { SermonListParams } from '@/types/sermon';

export const FILTER_PAGE_SIZE = 24;

export const getSermons = (params: SermonListParams = {}) => {
  const supabase = createStaticClient(sermonCache.list());
  return sermonService(supabase).list(params);
};

export const getSermonById = (id: number) => {
  const supabase = createStaticClient(sermonCache.detail(id));
  return sermonService(supabase).detailById(id);
};

export const getAllSeries = () => {
  const supabase = createStaticClient(sermonCache.seriesList());
  return sermonService(supabase).allSeries();
};

export const getSermonsBySeries = (seriesSlug: string) => {
  const supabase = createStaticClient(sermonCache.bySeries(seriesSlug));
  return sermonService(supabase).bySeriesSlug(seriesSlug);
};

/** 시리즈 상세(`/sermons/series/[id]`)용: id 기준 시리즈 단건 + 회차 (완료 포함) */
export const getSeriesDetail = (id: string) => {
  const supabase = createStaticClient(sermonCache.seriesDetail(id));
  return sermonService(supabase).bySeriesId(id);
};

export const getAllPreachers = () => {
  const supabase = createStaticClient(sermonCache.preacherList());
  return sermonService(supabase).allPreachers();
};

export const getRecentSermons = (limit = 4) => {
  const supabase = createStaticClient(sermonCache.recent());
  return sermonService(supabase).recent(limit);
};

// 최신 published 설교 1건 (관계 join 포함). 정렬은 sermon-service.ts:68 `sermon_date desc` 기본값에 의존.
// `is_featured` 컬럼 미존재로 인한 정책 — 어드민 수동 마킹 도입 시 단일 교체 지점.
export const getFeaturedSermon = async () => {
  const { sermons } = await getSermons({ pageSize: 1 });
  return sermons[0] ?? null;
};

export const incrementSermonViewCount = async (sermonId: number) => {
  const supabase = await createServerSideClient();
  return sermonService(supabase).incrementViewCount(sermonId);
};

/** 필터 모드용: 서버 쿼리로 매칭 페이지만 로드 */
export const getFilteredSermons = (
  params: Pick<
    SermonListParams,
    'seriesId' | 'preacherId' | 'search' | 'year' | 'page' | 'sort'
  >
) => getSermons({ pageSize: FILTER_PAGE_SIZE, ...params });

/** 활성 설교 전체 수 (sidebar "전체" 배지용) */
export const getSermonsTotalCount = () => {
  const supabase = createStaticClient(sermonCache.list());
  return sermonService(supabase).totalCount();
};

/** [어드민] 수정용 설교 조회 — 캐시 없음, 초안 포함 */
export const getSermonForEdit = async (id: number) => {
  const supabase = await createServerSideClient();
  return sermonService(supabase).getSermonForEdit(id);
};
