import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getSermonById,
  getSermons,
  getSermonsBySeries,
  incrementSermonViewCount
} from '@/services/sermon';
import { getSermonThumbnail } from '@/utils/sermon';
import type { SermonWithRelations } from '@/types/sermon';
import SermonDetailPage from '../_component/SermonDetailPage/SermonDetailPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermonById(Number(id));
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

  if (sermon.video_id && sermon.video_provider === 'youtube') {
    base.embedUrl = `https://www.youtube.com/embed/${sermon.video_id}`;
    base.contentUrl = `https://www.youtube.com/watch?v=${sermon.video_id}`;
  }

  if (sermon.duration) base.duration = sermon.duration;

  return base;
}

export default async function SermonDetail({ params }: PageProps) {
  const { id } = await params;
  const sermon = await getSermonById(Number(id));

  if (!sermon) notFound();

  // 시리즈 회차 + 같은 설교자 다른 설교를 병렬 fetch (의사결정 로그 D4 — sermons-detail-other-sermons).
  // 같은 설교자 ≥3건일 때만 노출 (현재 설교 제외 후 기준, D5). pageSize 4 = 현재 1건 buffer + 최대 3건 노출.
  const [seriesEpisodes, otherByPreacher] = await Promise.all([
    sermon.sermon_series?.slug
      ? getSermonsBySeries(sermon.sermon_series.slug)
      : Promise.resolve([] as SermonWithRelations[]),
    sermon.preacher?.id
      ? getSermons({ preacherId: sermon.preacher.id, pageSize: 4 }).then((res) =>
          res.sermons.filter((s) => s.id !== sermon.id).slice(0, 3)
        )
      : Promise.resolve([] as SermonWithRelations[])
  ]);

  const otherSermonsByPreacher = otherByPreacher.length === 3 ? otherByPreacher : [];

  incrementSermonViewCount(sermon.id).catch(() => {});

  const jsonLd = buildJsonLd(sermon);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SermonDetailPage
        sermon={sermon}
        seriesEpisodes={seriesEpisodes}
        otherSermonsByPreacher={otherSermonsByPreacher}
      />
    </>
  );
}
