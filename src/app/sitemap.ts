import type { MetadataRoute } from 'next';
import { getAllSeries, getSermons } from '@/services/sermon';

// Next.js 라우트 세그먼트 설정은 정적 리터럴이어야 한다(변수 참조 불가). 86400 = 1일.
// build 시점 고정 방지 — 하루 단위로 재생성해 새 설교·시리즈를 반영한다.
export const revalidate = 86400;

// 현재 공개 설교는 수십 건 규모라 단일 조회로 충분하다. 1000건을 넘으면 hasMore/total로 반복 조회가 필요하다.
const SITEMAP_MAX_SERMONS = 1000;

// 공개 GNB(src/config/navigation.ts)의 정적 라우트. 동적 상세(설교·시리즈)는 아래에서 추가한다.
const STATIC_PATHS = [
  '',
  '/about',
  '/about/pastor',
  '/about/vision',
  '/about/worship',
  '/about/location',
  '/about/welcome',
  '/about/serving-people',
  '/sermons',
  '/sermons/all',
  '/sermons/series',
  '/next-gen',
  '/next-gen/kindergarten',
  '/next-gen/elementary',
  '/next-gen/youth',
  '/next-gen/young-adult',
  '/community',
  '/community/groups',
  '/community/prayer',
  '/community/sharing',
  '/news',
  '/news/notices',
  '/news/gallery',
  '/news/bulletins'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  // SITE_URL이 없으면 모든 url이 상대 경로가 돼 sitemap이 무효해진다. DB 조회 전에 막는다.
  if (!siteUrl) return [];

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path || '/'}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7
  }));

  try {
    const [{ sermons }, series] = await Promise.all([
      getSermons({ pageSize: SITEMAP_MAX_SERMONS }),
      getAllSeries()
    ]);

    const sermonEntries: MetadataRoute.Sitemap = sermons.map((sermon) => ({
      url: `${siteUrl}/sermons/${sermon.id}`,
      ...(sermon.sermon_date ? { lastModified: new Date(sermon.sermon_date) } : {}),
      changeFrequency: 'monthly',
      priority: 0.6
    }));

    const seriesEntries: MetadataRoute.Sitemap = series.map((item) => ({
      url: `${siteUrl}/sermons/series/${item.id}`,
      changeFrequency: 'monthly',
      priority: 0.5
    }));

    return [...staticEntries, ...sermonEntries, ...seriesEntries];
  } catch (error) {
    console.error('[sitemap] 동적 설교·시리즈 조회 실패 — 정적 경로만 반환', error);
    return staticEntries;
  }
}
