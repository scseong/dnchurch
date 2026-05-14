import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import SermonSidebar from '../_component/SermonListPage/SermonSidebar';
import SermonToolbar from '../_component/SermonListPage/SermonToolbar';
import SermonArchive from '../_component/SermonListPage/SermonArchive';
import SermonFilteredList from '../_component/SermonListPage/SermonFilteredList';
import SermonResultHeader from '../_component/SermonListPage/SermonResultHeader';
import {
  getAllPreachers,
  getAllSeries,
  getFilteredSermons,
  getSermonArchiveList,
  getSermonYearCounts,
  getSermonsTotalCount
} from '@/services/sermon';
import {
  buildSermonArchive,
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
  const { series, preacher, search, year, sort } = parseSermonParams(params);
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
          sort
        })
      : getSermonArchiveList()
  ]);

  const standaloneCount = computeStandaloneCount(totalCount, allSeries);
  const activeSeries = series ?? null;
  const activePreacher = preacher ?? null;

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
            totalCount={totalCount}
            standaloneCount={standaloneCount}
            resultCount={listResult.total}
          />
          {hasFilter ? (
            <>
              <SermonResultHeader
                resultCount={listResult.total}
                hasQuery={!!search}
              />
              <SermonFilteredList sermons={listResult.sermons} />
            </>
          ) : (
            <SermonArchive archive={buildSermonArchive(listResult.sermons, yearCounts)} />
          )}
        </div>
      </div>
    </LayoutContainer>
  );
}
