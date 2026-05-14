import Link from 'next/link';
import clsx from 'clsx';
import { formattedDate } from '@/utils/date';
import { formatSermonDuration } from '@/utils/sermon';
import type { SermonSeries, SermonWithRelations } from '@/types/sermon';
import styles from './SermonSeriesSidebar.module.scss';

type Props = {
  series: SermonSeries;
  episodes: SermonWithRelations[];
  currentSermonId: number;
};

export default function SermonSeriesSidebar({ series, episodes, currentSermonId }: Props) {
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

      <nav className={styles.list_card} aria-label="시리즈 회차 목록">
        <header className={styles.list_header}>전체 회차 ({episodes.length}편)</header>
        <ul className={styles.episode_list}>
          {episodes.map((ep, idx) => (
            <EpisodeRow
              key={ep.id}
              episode={ep}
              order={ep.series_order ?? idx + 1}
              isCurrent={ep.id === currentSermonId}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

type EpisodeRowProps = {
  episode: SermonWithRelations;
  order: number;
  isCurrent: boolean;
};

function EpisodeRow({ episode, order, isCurrent }: EpisodeRowProps) {
  const duration = formatSermonDuration(episode.duration);
  const content = (
    <>
      <span className={styles.order_num}>{String(order).padStart(2, '0')}</span>
      <span className={styles.info}>
        <span className={styles.title}>{episode.title}</span>
        <span className={styles.meta}>
          {formattedDate(episode.sermon_date, 'YYYY.MM.DD')}
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
    </>
  );

  return (
    <li>
      {isCurrent ? (
        <div
          className={clsx(styles.episode_row, styles.episode_row_current)}
          aria-current="page"
        >
          {content}
        </div>
      ) : (
        <Link
          href={`/sermons/${episode.id}`}
          className={styles.episode_row}
          draggable={false}
        >
          {content}
        </Link>
      )}
    </li>
  );
}
