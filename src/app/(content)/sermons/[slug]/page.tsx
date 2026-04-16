import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSermonBySlug, getSermonsBySeries, incrementSermonViewCount } from '@/services/sermon';
import { getSermonThumbnail } from '@/utils/sermon';
import type { SermonWithRelations } from '@/types/sermon';
import SermonDetailPage from '../_component/SermonDetailPage/SermonDetailPage';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) return {};

  const title = sermon.title;
  const preacherLabel = sermon.preacher
    ? `${sermon.preacher.name}${sermon.preacher.title ? ` ${sermon.preacher.title}` : ''}`
    : '';
  const description = sermon.summary ?? `${preacherLabel}의 설교`;
  const thumbnail = getSermonThumbnail(sermon);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: thumbnail ? [{ url: thumbnail }] : [],
      type: 'article'
    }
  };
}

export const revalidate = 86400;

function buildJsonLd(sermon: SermonWithRelations) {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: sermon.title,
    description: sermon.summary ?? sermon.title,
    datePublished: sermon.sermon_date
  };

  const thumbnail = getSermonThumbnail(sermon);
  if (thumbnail) base.thumbnailUrl = thumbnail;

  if (sermon.video_id) {
    if (sermon.video_provider === 'youtube') {
      base.embedUrl = `https://www.youtube.com/embed/${sermon.video_id}`;
      base.contentUrl = `https://www.youtube.com/watch?v=${sermon.video_id}`;
    } else if (sermon.video_provider === 'vimeo') {
      base.embedUrl = `https://player.vimeo.com/video/${sermon.video_id}`;
    }
  }

  if (sermon.duration) base.duration = sermon.duration;

  return base;
}

export default async function SermonDetail({ params }: PageProps) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);

  if (!sermon) notFound();

  let seriesEpisodes: SermonWithRelations[] = [];
  if (sermon.sermon_series?.slug) {
    seriesEpisodes = await getSermonsBySeries(sermon.sermon_series.slug);
  }

  incrementSermonViewCount(String(sermon.id)).catch(() => {});

  const jsonLd = buildJsonLd(sermon);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SermonDetailPage sermon={sermon} seriesEpisodes={seriesEpisodes} />
    </>
  );
}
