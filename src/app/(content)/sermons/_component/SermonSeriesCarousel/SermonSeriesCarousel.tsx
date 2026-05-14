'use client';

import Link from 'next/link';
import type { SeriesWithSermonCount } from '@/types/sermon';
import { Carousel, CarouselArrows, useCarousel } from '@/components/ui/Carousel/Carousel';
import SeriesCard from './SeriesCard';
import styles from './SermonSeriesCarousel.module.scss';

type Props = {
  series: SeriesWithSermonCount[];
};

export default function SermonSeriesCarousel({ series }: Props) {
  const carousel = useCarousel();

  if (series.length === 0) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.section_title}>진행 중인 시리즈</h2>
        <div className={styles.header_actions}>
          <CarouselArrows canL={carousel.canL} canR={carousel.canR} onScroll={carousel.scroll} />
          <Link href="/sermons/series" className={styles.more_link}>
            모든 시리즈 →
          </Link>
        </div>
      </header>
      <Carousel ariaLabel="진행 중인 시리즈 캐러셀" mobileFullBleed carousel={carousel}>
        {series.map((item) => (
          <SeriesCard key={item.id} series={item} />
        ))}
      </Carousel>
    </section>
  );
}
