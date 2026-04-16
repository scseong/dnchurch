'use client';

import useSermonFilter from '@/hooks/useSermonFilter';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  standaloneCount: number;
};

export default function SermonSeriesBanner({ allSeries, standaloneCount }: Props) {
  const { series: activeSeries, setFilter } = useSermonFilter();

  if (activeSeries === 'none') {
    return (
      <BannerLayout
        title="단독 설교"
        description="시리즈에 속하지 않은 설교"
        count={standaloneCount}
      />
    );
  }

  const active = activeSeries
    ? allSeries.find((item) => item.slug === activeSeries)
    : null;

  if (!active) return null;

  return (
    <BannerLayout
      title={active.title}
      description={active.description}
      count={active.sermon_count}
    />
  );
}

function BannerLayout({
  title,
  description,
  count,
}: {
  title: string;
  description?: string | null;
  count: number;
}) {
  return (
    <section className={styles.series_banner} aria-label="선택된 시리즈">
      <header className={styles.series_banner_info}>
        <h3 className={styles.series_banner_title}>{title}</h3>
        {description && (
          <p className={styles.series_banner_desc}>{description}</p>
        )}
        <span className={styles.series_banner_count}>{count}편</span>
      </header>
    </section>
  );
}
