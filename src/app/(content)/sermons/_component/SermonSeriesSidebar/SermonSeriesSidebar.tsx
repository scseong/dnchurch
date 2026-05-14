'use client';

import clsx from 'clsx';
import { formattedDate } from '@/utils/date';
import { formatSermonDuration } from '@/utils/sermon';
import type { SermonSeries, SermonWithRelations } from '@/types/sermon';
import styles from './SermonSeriesSidebar.module.scss';

type Props = {
  series: SermonSeries;
  episodes: SermonWithRelations[];
  currentSermonId: number;
  onSelect: (sermon: SermonWithRelations) => void;
};

export default function SermonSeriesSidebar({
  series,
  episodes,
  currentSermonId,
  onSelect
}: Props) {
  if (episodes.length === 0) return null;

  const isCompleted = Boolean(series.ended_at);
  const endLabel = series.ended_at
    ? formattedDate(series.ended_at, 'YYYY.MM.DD')
    : '진행 중';

  return (
    <aside className={styles.container}>
      <section className={styles.summary_card}>
        <span className={styles.eyebrow}>SERIES</span>
        <h2 className={styles.series_title}>{series.title}</h2>
        {series.description && (
          <p className={styles.series_description}>{series.description}</p>
        )}
        <div className={styles.summary_meta}>
          <span>{formattedDate(series.started_at, 'YYYY.MM.DD')}</span>
          <span className={styles.dot} aria-hidden="true">~</span>
          <span className={isCompleted ? styles.meta_completed : styles.meta_ongoing}>
            {endLabel}
          </span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={styles.count}>{episodes.length}편</span>
        </div>
      </section>

      <section className={styles.list_card}>
        <header className={styles.list_header}>전체 회차 ({episodes.length}편)</header>
        <ul className={styles.episode_list}>
          {episodes.map((ep, idx) => {
            const isCurrent = ep.id === currentSermonId;
            const order = ep.series_order ?? idx + 1;
            const duration = formatSermonDuration(ep.duration);

            return (
              <li key={ep.id}>
                <button
                  type="button"
                  className={clsx(styles.episode_row, isCurrent && styles.episode_row_current)}
                  onClick={() => onSelect(ep)}
                  disabled={isCurrent}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  <span className={styles.order_num}>{String(order).padStart(2, '0')}</span>
                  <span className={styles.info}>
                    <span className={styles.title}>{ep.title}</span>
                    <span className={styles.meta}>
                      {formattedDate(ep.sermon_date, 'YYYY.MM.DD')}
                      {duration && (
                        <>
                          <span className={styles.meta_dot} aria-hidden="true">·</span>
                          {duration}
                        </>
                      )}
                    </span>
                  </span>
                  {isCurrent && (
                    <span className={styles.play_indicator} aria-hidden="true">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
