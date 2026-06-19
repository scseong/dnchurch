import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import { getAllSeries, getFeaturedSermon, getSermons } from '@/services/sermon';
import SermonFeatured from './_component/SermonFeatured/SermonFeatured';
import SermonRecentCarousel from './_component/SermonRecentCarousel/SermonRecentCarousel';
import SermonSeriesCarousel from './_component/SermonSeriesCarousel/SermonSeriesCarousel';
import styles from './page.module.scss';

const RECENT_CAROUSEL_COUNT = 8;

const PAGE_DESCRIPTION = '대구동남교회 설교 영상과 말씀을 만나보세요.';
const PAGE_CANONICAL = `${process.env.NEXT_PUBLIC_SITE_URL}/sermons`;

export const metadata: Metadata = {
  title: '설교',
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_CANONICAL },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '설교',
    description: PAGE_DESCRIPTION,
    url: PAGE_CANONICAL
  },
  twitter: { card: 'summary', title: '설교', description: PAGE_DESCRIPTION }
};

type SermonsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// archive 뷰는 `/sermons/all`로 이관됨 (2026-05-14, exec-plan sermons-featured).
// 기존 공유·인덱싱된 필터 URL(`/sermons?series=...&year=...&q=...`)이 Featured 카드만 보여주는 회귀를 막기 위해
// 쿼리가 존재하면 `/sermons/all`로 query를 보존해 redirect한다.
export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else qs.append(key, value);
  }
  const query = qs.toString();
  if (query) redirect(`/sermons/all?${query}`);

  // Featured 1건이 캐러셀 첫 카드와 중복되지 않도록 pageSize +1 후 Featured ID 필터링 (sermons-recent-carousel D4).
  // 시리즈는 ended_at이 null인 진행 중만 메인 노출 (sermons-series-carousel D5).
  const [featured, recent, allSeries] = await Promise.all([
    getFeaturedSermon(),
    getSermons({ pageSize: RECENT_CAROUSEL_COUNT + 1 }),
    getAllSeries()
  ]);
  const recentList = recent.sermons
    .filter((sermon) => sermon.id !== featured?.id)
    .slice(0, RECENT_CAROUSEL_COUNT);
  const ongoingSeries = allSeries.filter((series) => series.ended_at === null);

  return (
    <LayoutContainer className={styles.sections}>
      <SermonFeatured sermon={featured} />
      <SermonRecentCarousel sermons={recentList} />
      <SermonSeriesCarousel series={ongoingSeries} />
    </LayoutContainer>
  );
}
