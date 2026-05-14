'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { IoChevronForward } from 'react-icons/io5';
import useSermonFilter from '@/hooks/useSermonFilter';
import { formattedDate } from '@/utils/date';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
};

export default function SermonSeriesBanner({ allSeries }: Props) {
  const { series: activeSeries } = useSermonFilter();

  if (!activeSeries || activeSeries === 'none') return null;

  const active = allSeries.find((item) => item.slug === activeSeries);
  if (!active) return null;

  const ongoing = active.ended_at === null;

  return (
    <section className={styles.series_meta} aria-label="선택된 시리즈">
      <div className={styles.series_meta_body}>
        <span
          className={clsx(
            styles.series_meta_eyebrow,
            ongoing
              ? styles.series_meta_eyebrow_ongoing
              : styles.series_meta_eyebrow_completed
          )}
        >
          SERIES · {ongoing ? 'ON-GOING' : 'COMPLETED'}
        </span>
        <h3 className={styles.series_meta_title}>{active.title}</h3>
        {active.description && (
          <p className={styles.series_meta_desc}>{active.description}</p>
        )}
        <div className={styles.series_meta_row}>
          <span>{formattedDate(active.started_at, 'YYYY.MM.DD')}</span>
          <span className={styles.series_meta_dot} aria-hidden>
            ~
          </span>
          {ongoing ? (
            <span className={styles.series_meta_ongoing}>진행 중</span>
          ) : (
            active.ended_at && (
              <span>{formattedDate(active.ended_at, 'YYYY.MM.DD')}</span>
            )
          )}
          <span className={styles.series_meta_dot} aria-hidden>
            ·
          </span>
          <span className={styles.series_meta_count}>{active.sermon_count}편</span>
        </div>
      </div>
      <Link
        href={`/sermons/series/${active.id}`}
        className={styles.series_meta_link}
      >
        시리즈 상세
        <IoChevronForward aria-hidden />
      </Link>
    </section>
  );
}
