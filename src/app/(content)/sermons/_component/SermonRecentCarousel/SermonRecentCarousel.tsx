'use client';

import Link from 'next/link';
import type { SermonWithRelations } from '@/types/sermon';
import { Carousel, CarouselArrows, useCarousel } from '@/components/ui/Carousel/Carousel';
import SermonCarouselCard from './SermonCarouselCard';
import styles from './SermonRecentCarousel.module.scss';

type Props = {
  sermons: SermonWithRelations[];
};

export default function SermonRecentCarousel({ sermons }: Props) {
  const carousel = useCarousel();

  if (sermons.length === 0) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.section_title}>최근 설교</h2>
        <div className={styles.header_actions}>
          <CarouselArrows
            canScrollLeft={carousel.canScrollLeft}
            canScrollRight={carousel.canScrollRight}
            onScroll={carousel.scrollByDirection}
          />
          <Link href="/sermons/all" className={styles.more_link}>
            더 보기 →
          </Link>
        </div>
      </header>
      <Carousel ariaLabel="최근 설교 캐러셀" mobileFullBleed carousel={carousel}>
        {sermons.map((sermon) => (
          <SermonCarouselCard key={sermon.id} sermon={sermon} />
        ))}
      </Carousel>
    </section>
  );
}
