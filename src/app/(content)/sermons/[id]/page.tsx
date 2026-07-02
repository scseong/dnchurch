import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPublishedSermonIds,
  getSermonById,
  getSermons,
  getSermonsBySeries
} from '@/services/sermon';
import { isNumeric } from '@/utils/validator';
import { formatPreacherLabel, getSermonThumbnail } from '@/utils/sermon';
import { getOgImageUrl } from '@/utils/cloudinary';
import { OG_FALLBACK_IMAGE } from '@/config/seo';
import type { SeriesEpisodeItem, SermonCardItem, SermonWithRelations } from '@/types/sermon';
import SermonDetailPage from '../_component/SermonDetailPage/SermonDetailPage';
import SermonViewTracker from '../_component/SermonDetailPage/SermonViewTracker';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isNumeric(id)) notFound();

  const sermon = await getSermonById(Number(id));
  if (!sermon) return {};

  const title = sermon.title;
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const description = sermon.summary ?? `${preacherLabel}의 설교`;
  const thumbnail = getSermonThumbnail(sermon);
  const ogImage = thumbnail ? getOgImageUrl(thumbnail) : null;
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImage || OG_FALLBACK_IMAGE }],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage || OG_FALLBACK_IMAGE]
    }
  };
}

export const revalidate = 86400;

// 최근 발행 설교를 빌드 시점에 프리렌더 (주보 상세 10건 선례와 동일 규모).
// 나머지 id는 dynamicParams(기본 true)로 첫 방문 시 렌더 후 ISR 캐시.
const PRERENDER_COUNT = 10;

export async function generateStaticParams() {
  const ids = await getPublishedSermonIds(PRERENDER_COUNT);
  return ids.map((id) => ({ id: id.toString() }));
}

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
  // 비숫자 id가 bigint 쿼리에 닿으면 Postgres throw → 500. 주보 상세와 같은 가드로 404 처리.
  if (!isNumeric(id)) notFound();

  const sermon = await getSermonById(Number(id));

  if (!sermon) notFound();

  // 시리즈 회차 + 같은 설교자 다른 설교를 병렬 fetch (의사결정 로그 D4 — sermons-detail-other-sermons).
  // 같은 설교자 ≥3건일 때만 노출 (현재 설교 제외 후 기준, D5). pageSize 4 = 현재 1건 buffer + 최대 3건 노출.
  const [seriesEpisodes, otherByPreacher] = await Promise.all([
    sermon.sermon_series?.slug
      ? getSermonsBySeries(sermon.sermon_series.slug)
      : Promise.resolve([] as SeriesEpisodeItem[]),
    sermon.preacher?.id
      ? getSermons({ preacherId: sermon.preacher.id, pageSize: 4 }).then((res) =>
          res.sermons.filter((s) => s.id !== sermon.id).slice(0, 3)
        )
      : Promise.resolve([] as SermonCardItem[])
  ]);

  const otherSermonsByPreacher = otherByPreacher.length === 3 ? otherByPreacher : [];

  const jsonLd = buildJsonLd(sermon);

  return (
    <>
      <SermonViewTracker sermonId={sermon.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <SermonDetailPage
        sermon={sermon}
        seriesEpisodes={seriesEpisodes}
        otherSermonsByPreacher={otherSermonsByPreacher}
      />
    </>
  );
}
