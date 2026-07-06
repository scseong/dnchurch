import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import { getAllSeries } from '@/services/sermon';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import SeriesGrid from '../_component/SeriesListPage/SeriesGrid';
import styles from '../_component/SeriesListPage/SeriesListPage.module.scss';

const PAGE_DESCRIPTION = '대구동남교회의 강해 설교 시리즈를 모았습니다';
const PAGE_CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons/series`;

export const metadata: Metadata = {
  title: '모든 시리즈',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_CANONICAL },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '모든 시리즈',
    description: PAGE_DESCRIPTION,
    url: PAGE_CANONICAL
  },
  twitter: { card: 'summary', title: '모든 시리즈', description: PAGE_DESCRIPTION }
};

export default async function AllSeriesPage() {
  const allSeries = await getAllSeries();

  return (
    <LayoutContainer>
      {/* Hero 밴드 제거로 사라진 페이지 h1 보전 — 헤더 '시리즈'와 별개, 데스크톱 접근성용 */}
      <h1 className={styles.blind_title}>시리즈</h1>
      <div className={styles.page}>
        <SeriesGrid series={allSeries} />
      </div>
    </LayoutContainer>
  );
}
