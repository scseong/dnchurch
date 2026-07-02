import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import { getAllSeries, getFeaturedSermon, getSermons } from '@/services/sermon';
import SermonFeatured from './_component/SermonFeatured/SermonFeatured';
import SermonHomeSearch from './_component/SermonHomeSearch';
import SermonRecentList from './_component/SermonRecentList/SermonRecentList';
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

// archive 뷰는 `/sermons/all`로 이관됨 (2026-05-14, exec-plan sermons-featured).
// 레거시 필터 URL(`/sermons?series=...&q=...`)의 `/sermons/all` redirect는 next.config.ts
// redirects()가 담당 — 페이지에서 searchParams를 읽지 않아 이 라우트는 완전 정적으로 렌더된다.
export default async function SermonsPage() {
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
    <LayoutContainer>
      {/* Hero 밴드 제거로 사라진 페이지 h1 보전 — 헤더 '설교' 타이틀과 별개로 문서 구조상 h1 유지 */}
      <h1 className={styles.blind_title}>설교</h1>
      <SermonHomeSearch className={styles.search} />
      <div className={styles.sections}>
        <SermonFeatured sermon={featured} />
        <SermonRecentList sermons={recentList} />
        <SermonSeriesCarousel series={ongoingSeries} />
      </div>
    </LayoutContainer>
  );
}
