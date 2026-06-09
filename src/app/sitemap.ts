import type { MetadataRoute } from 'next';
import { getAllSeries, getSermons } from '@/services/sermon';

// build 시점 고정 방지 — 하루 단위로 재생성해 새 설교·시리즈를 반영한다.
export const revalidate = 86400;

const STATIC_PATHS = [
  '',
  '/about',
  '/about/pastor',
  '/about/vision',
  '/about/worship',
  '/about/location',
  '/about/welcome',
  '/sermons',
  '/sermons/all',
  '/sermons/series',
  '/next-gen',
  '/community',
  '/news/notices',
  '/news/gallery'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

  const [{ sermons }, series] = await Promise.all([
    getSermons({ pageSize: 1000 }),
    getAllSeries()
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path || '/'}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7
  }));

  const sermonEntries: MetadataRoute.Sitemap = sermons.map((sermon) => ({
    url: `${siteUrl}/sermons/${sermon.id}`,
    lastModified: new Date(sermon.sermon_date),
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((item) => ({
    url: `${siteUrl}/sermons/series/${item.id}`,
    changeFrequency: 'monthly',
    priority: 0.5
  }));

  return [...staticEntries, ...sermonEntries, ...seriesEntries];
}
