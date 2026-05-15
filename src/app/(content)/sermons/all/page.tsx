import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { EmptyState, Pagination } from '@/components/ui';
import SermonSidebar from '../_component/SermonListPage/SermonSidebar';
import SermonToolbar from '../_component/SermonListPage/SermonToolbar';
import SermonArchive from '../_component/SermonListPage/SermonArchive';
import SermonFilteredList from '../_component/SermonListPage/SermonFilteredList';
import SermonResultHeader from '../_component/SermonListPage/SermonResultHeader';
import {
  FILTER_PAGE_SIZE,
  getAllPreachers,
  getAllSeries,
  getFilteredSermons,
  getSermonArchiveList,
  getSermonYearCounts,
  getSermonsTotalCount
} from '@/services/sermon';
import {
  buildSermonArchive,
  buildSermonHref,
  computeStandaloneCount,
  parseSermonParams,
  resolvePreacherName,
  resolveSeriesSlug
} from '@/utils/sermon';
import styles from '../_component/SermonListPage/SermonListPage.module.scss';

export const metadata: Metadata = {
  title: '전체 설교',
  description: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요'
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AllSermonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { series, preacher, search, year, sort, page } = parseSermonParams(params);
  const hasFilter = !!(series || preacher || search || year);

  const [allSeries, allPreachers] = await Promise.all([
    getAllSeries(),
    getAllPreachers(),
  ]);

  const resolvedSeriesId = resolveSeriesSlug(series, allSeries);
  const resolvedPreacherId = resolvePreacherName(preacher, allPreachers);

  const [totalCount, yearCounts, listResult] = await Promise.all([
    getSermonsTotalCount(),
    getSermonYearCounts(),
    hasFilter
      ? getFilteredSermons({
          seriesId: resolvedSeriesId,
          preacherId: resolvedPreacherId,
          search,
          year,
          sort,
          page
        })
      : getSermonArchiveList()
  ]);

  const standaloneCount = computeStandaloneCount(totalCount, allSeries);
  const activeSeries = series ?? null;
  const activePreacher = preacher ?? null;
  const filteredTotal = listResult.total;
  const totalPages = hasFilter
    ? Math.max(1, Math.ceil(filteredTotal / FILTER_PAGE_SIZE))
    : 1;

  // 시리즈 미매칭 — slug가 있지만 'none'도 아니고 allSeries에도 없음
  const isUnknownSeries =
    !!series &&
    series !== 'none' &&
    !allSeries.some((item) => item.slug === series);

  // Out-of-range page → 마지막 페이지로 redirect (D4)
  if (hasFilter && filteredTotal > 0 && page > totalPages) {
    redirect(buildSermonHref(params, { page: String(totalPages) }));
  }

  return (
    <LayoutContainer>
      <div className={styles.body}>
        <SermonSidebar
          allSeries={allSeries}
          allPreachers={allPreachers}
          totalCount={totalCount}
          standaloneCount={standaloneCount}
          activeSeries={activeSeries}
          activePreacher={activePreacher}
          hasActiveFilter={hasFilter}
          params={params}
        />
        <div className={styles.main}>
          <SermonToolbar
            allSeries={allSeries}
            allPreachers={allPreachers}
            resultCount={listResult.total}
          />
          {isUnknownSeries ? (
            <EmptyState
              title="해당 시리즈를 찾을 수 없습니다"
              description="URL이 올바른지 확인하거나 사이드바에서 다른 시리즈를 선택해 주세요."
              announce
            />
          ) : hasFilter ? (
            <>
              <SermonResultHeader
                resultCount={filteredTotal}
                hasQuery={!!search}
                currentPage={page}
                totalPages={totalPages}
              />
              <SermonFilteredList sermons={listResult.sermons} />
              <Pagination
                totalCount={filteredTotal}
                pageSize={FILTER_PAGE_SIZE}
                currentPage={page}
              />
            </>
          ) : (
            <SermonArchive archive={buildSermonArchive(listResult.sermons, yearCounts)} />
          )}
        </div>
      </div>
    </LayoutContainer>
  );
}
