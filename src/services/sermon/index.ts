import 'server-only';

import { sermonCache } from '@/services/sermon/sermon-cache';
import { sermonService } from '@/services/sermon/sermon-service';
import { createStaticClient } from '@/lib/supabase/static';
import { createServerSideClient } from '@/lib/supabase/server';
import type { SermonListParams } from '@/types/sermon';

// 아카이브 초기 로드는 최신 설교 N개(featured 1 + 그리드 나머지).
// 지난 연도는 연도 필터(`?year=YYYY`)로 진입 시 서버 쿼리로 해당 연도만 로드.
const ARCHIVE_RECENT_COUNT = 12;
const FILTER_PAGE_SIZE = 24;

export const getSermons = (params: SermonListParams = {}) => {
  const supabase = createStaticClient(sermonCache.list());
  return sermonService(supabase).list(params);
};

export const getSermonBySlug = (slug: string) => {
  const supabase = createStaticClient(sermonCache.detail(slug));
  return sermonService(supabase).detailBySlug(slug);
};

export const getAllSeries = () => {
  const supabase = createStaticClient(sermonCache.seriesList());
  return sermonService(supabase).allSeries();
};

export const getSermonsBySeries = (seriesSlug: string) => {
  const supabase = createStaticClient(sermonCache.bySeries(seriesSlug));
  return sermonService(supabase).bySeriesSlug(seriesSlug);
};

export const getAllPreachers = () => {
  const supabase = createStaticClient(sermonCache.preacherList());
  return sermonService(supabase).allPreachers();
};

export const getRecentSermons = (limit = 4) => {
  const supabase = createStaticClient(sermonCache.recent());
  return sermonService(supabase).recent(limit);
};

export const incrementSermonViewCount = async (sermonId: string) => {
  const supabase = await createServerSideClient();
  return sermonService(supabase).incrementViewCount(sermonId);
};

/** 아카이브 모드용: 최신 설교 N개 로드 (sermon_date desc) */
export const getSermonArchiveList = () =>
  getSermons({ pageSize: ARCHIVE_RECENT_COUNT });

/** 필터 모드용: 서버 쿼리로 매칭 페이지만 로드 */
export const getFilteredSermons = (
  params: Pick<
    SermonListParams,
    'seriesId' | 'preacherId' | 'search' | 'year' | 'page'
  >
) => getSermons({ pageSize: FILTER_PAGE_SIZE, ...params });

/** 활성 설교 전체 수 (sidebar "전체" 배지용) */
export const getSermonsTotalCount = () => {
  const supabase = createStaticClient(sermonCache.list());
  return sermonService(supabase).totalCount();
};

/** 연도별 설교 편수 집계 (지난 설교 연도 그리드용) */
export const getSermonYearCounts = () => {
  const supabase = createStaticClient(sermonCache.list());
  return sermonService(supabase).yearCounts();
};
