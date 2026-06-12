import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import { getAllSeries } from '@/services/sermon';
import { filterSeries, parseSeriesParams } from '@/utils/sermon';
import SeriesFilterSidebar from '../_component/SeriesListPage/SeriesFilterSidebar';
import SeriesToolbar from '../_component/SeriesListPage/SeriesToolbar';
import SeriesResultHeader from '../_component/SeriesListPage/SeriesResultHeader';
import SeriesGrid from '../_component/SeriesListPage/SeriesGrid';
import styles from '../_component/SeriesListPage/SeriesListPage.module.scss';

const PAGE_DESCRIPTION =
  '대구동남교회 강해 설교 시리즈를 상태·연도·검색으로 찾아보세요';
const PAGE_CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons/series`;

export const metadata: Metadata = {
  title: '모든 시리즈',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_CANONICAL },
  openGraph: {
    title: '모든 시리즈',
    description: PAGE_DESCRIPTION,
    url: PAGE_CANONICAL,
    type: 'website'
  },
  twitter: { card: 'summary', title: '모든 시리즈', description: PAGE_DESCRIPTION }
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AllSeriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { status, year, q } = parseSeriesParams(params);
  const hasFilter = !!(status || year || q);

  const allSeries = await getAllSeries();
  const filtered = filterSeries(allSeries, { status, year, q });

  return (
    <LayoutContainer>
      <div className={styles.body}>
        <SeriesFilterSidebar
          allSeries={allSeries}
          status={status}
          year={year}
          q={q}
          hasActiveFilter={hasFilter}
          params={params}
        />
        <div className={styles.main}>
          <SeriesToolbar allSeries={allSeries} />
          <SeriesResultHeader resultCount={filtered.length} query={q} />
          <SeriesGrid series={filtered} />
        </div>
      </div>
    </LayoutContainer>
  );
}
