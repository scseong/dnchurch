import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { getSeriesDetail } from '@/services/sermon';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import SeriesDetailHero from '../../_component/SeriesDetailPage/SeriesDetailHero';
import EpisodeGrid from '../../_component/SeriesDetailPage/EpisodeGrid';
import styles from '../../_component/SeriesDetailPage/SeriesDetailPage.module.scss';

// series_id는 UUID 컬럼 — 비-UUID 문자열이 쿼리에 닿으면 Postgres throw.
// getSeriesDetail 호출 전 형식 가드 → 잘못된 URL은 500 아닌 404.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return {};

  const data = await getSeriesDetail(id);
  if (!data) return {};

  const { series } = data;
  const title = series.title;
  const description = series.description ?? '대구동남교회 강해 설교 시리즈';
  const image = series.cover_image_url
    ? getCloudinaryUrl(series.cover_image_url)
    : null;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons/series/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : []
    }
  };
}

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
