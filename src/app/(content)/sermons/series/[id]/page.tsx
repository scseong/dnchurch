import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { getSeriesDetail } from '@/services/sermon';
import SeriesDetailHero from '../../_component/SeriesDetailPage/SeriesDetailHero';
import EpisodeGrid from '../../_component/SeriesDetailPage/EpisodeGrid';
import styles from '../../_component/SeriesDetailPage/SeriesDetailPage.module.scss';

export const metadata: Metadata = {
  title: '시리즈 상세',
  description: '대구동남교회 강해 설교 시리즈 상세'
};

// series_id는 UUID 컬럼 — 비-UUID 문자열이 쿼리에 닿으면 Postgres throw.
// getSeriesDetail 호출 전 형식 가드 → 잘못된 URL은 500 아닌 404.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const data = await getSeriesDetail(id);
  if (!data) notFound();

  return (
    <LayoutContainer>
      <div className={styles.page}>
        <SeriesDetailHero series={data.series} />
        <EpisodeGrid episodes={data.episodes} />
      </div>
    </LayoutContainer>
  );
}
