import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { EmptyState, Pagination } from '@/components/ui';
import SermonSidebar from '../_component/SermonListPage/SermonSidebar';
import SermonToolbar from '../_component/SermonListPage/SermonToolbar';
import SermonFilteredList from '../_component/SermonListPage/SermonFilteredList';
import SermonResultHeader from '../_component/SermonListPage/SermonResultHeader';
import {
  FILTER_PAGE_SIZE,
  getAllPreachers,
  getAllSeries,
  getFilteredSermons,
  getSermonsTotalCount
} from '@/services/sermon';
import {
  buildSermonHref,
  computeStandaloneCount,
  parseSermonParams,
  resolvePreacherName,
  resolveSeriesSlug
} from '@/utils/sermon';
import { getTotalPages } from '@/utils/pagination';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import styles from '../_component/SermonListPage/SermonListPage.module.scss';

const PAGE_DESCRIPTION = '대구동남교회의 모든 설교를 검색·필터로 찾아보세요';
const PAGE_CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons/all`;

export const metadata: Metadata = {
  title: '전체 설교',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_CANONICAL },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '전체 설교',
    description: PAGE_DESCRIPTION,
    url: PAGE_CANONICAL
  },
  twitter: { card: 'summary', title: '전체 설교', description: PAGE_DESCRIPTION }
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AllSermonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { series, preacher, search, year, sort, page } = parseSermonParams(params);
  const hasFilter = !!(series || preacher || search || year);

  const [allSeries, allPreachers, totalCount] = await Promise.all([
    getAllSeries(),
    getAllPreachers(),
    getSermonsTotalCount()
  ]);

  const standaloneCount = computeStandaloneCount(totalCount, allSeries);
  const activeSeries = series ?? null;
  const activePreacher = preacher ?? null;

  // 필터 UI에는 발행 0편 항목을 숨긴다. 해석(resolve*)·미매칭 판정은 전체 목록을 써야
  // 0편 설교자·시리즈 URL(예: ?preacher=박지권)도 매칭돼 빈 결과로 떨어진다.
  const filterableSeries = allSeries.filter((item) => item.sermon_count > 0);
  const filterablePreachers = allPreachers.filter((item) => item.sermon_count > 0);

  // 시리즈 미매칭 — slug가 있지만 'none'도 아니고 allSeries에도 없음.
  // resolveSeriesSlug는 미매칭 slug를 원문 그대로 반환하므로, 조회 전에 차단하지 않으면
  // raw slug가 UUID 컬럼(series_id)에 들어가 Supabase에서 throw된다.
  const isUnknownSeries =
    !!series &&
    series !== 'none' &&
    !allSeries.some((item) => item.slug === series);

  // 설교자 미매칭 — 이름이 있지만 allPreachers에 없음. resolvePreacherName이 undefined를
  // 반환해 필터가 안 걸리면 전체 설교가 떠서, 시리즈 미매칭(빈 상태)과 동작이 어긋난다.
  const isUnknownPreacher =
    !!preacher && !allPreachers.some((item) => item.name === preacher);

  if (isUnknownSeries || isUnknownPreacher) {
    const emptyTitle = isUnknownSeries
      ? '해당 시리즈를 찾을 수 없습니다'
      : '해당 설교자를 찾을 수 없습니다';
    const emptyDescription = isUnknownSeries
      ? 'URL이 올바른지 확인하거나 사이드바에서 다른 시리즈를 선택해 주세요.'
      : 'URL이 올바른지 확인하거나 사이드바에서 다른 설교자를 선택해 주세요.';

    return (
      <LayoutContainer>
        <div className={styles.body}>
          <SermonSidebar
            allSeries={filterableSeries}
            allPreachers={filterablePreachers}
            totalCount={totalCount}
            standaloneCount={standaloneCount}
            activeSeries={activeSeries}
            activePreacher={activePreacher}
            hasActiveFilter={hasFilter}
            params={params}
          />
          <div className={styles.main}>
            <SermonToolbar allSeries={filterableSeries} allPreachers={filterablePreachers} />
            <EmptyState title={emptyTitle} description={emptyDescription} announce />
          </div>
        </div>
      </LayoutContainer>
    );
  }

  const resolvedSeriesId = resolveSeriesSlug(series, allSeries);
  const resolvedPreacherId = resolvePreacherName(preacher, allPreachers);

  const listResult = await getFilteredSermons({
    seriesId: resolvedSeriesId,
    preacherId: resolvedPreacherId,
    search,
    year,
    sort,
    page
  });

  const filteredTotal = listResult.total;
  const totalPages = getTotalPages(filteredTotal, FILTER_PAGE_SIZE);

  // Out-of-range page → 마지막 페이지로 redirect
  if (filteredTotal > 0 && page > totalPages) {
    redirect(buildSermonHref(params, { page: String(totalPages) }));
  }

  return (
    <LayoutContainer>
      <div className={styles.body}>
        <SermonSidebar
          allSeries={filterableSeries}
          allPreachers={filterablePreachers}
          totalCount={totalCount}
          standaloneCount={standaloneCount}
          activeSeries={activeSeries}
          activePreacher={activePreacher}
          hasActiveFilter={hasFilter}
          params={params}
        />
        <div className={styles.main}>
          <SermonToolbar allSeries={filterableSeries} allPreachers={filterablePreachers} />
          <SermonResultHeader
            resultCount={filteredTotal}
            currentPage={page}
            totalPages={totalPages}
          />
          <SermonFilteredList sermons={listResult.sermons} />
          <Pagination
            totalCount={filteredTotal}
            pageSize={FILTER_PAGE_SIZE}
            currentPage={page}
          />
        </div>
      </div>
    </LayoutContainer>
  );
}
