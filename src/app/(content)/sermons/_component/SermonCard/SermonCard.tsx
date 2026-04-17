import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';
import { formattedDate } from '@/utils/date';
import { formatPreacherLabel, formatSermonDuration, getSermonThumbnail } from '@/utils/sermon';
import type { SermonCardItem } from '@/types/sermon';
import styles from './SermonCard.module.scss';

type Props = {
  sermon: SermonCardItem;
};

export default function SermonCard({ sermon }: Props) {
  const thumbnail = getSermonThumbnail(sermon);
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const duration = formatSermonDuration(sermon.duration);
  const seriesTitle = sermon.sermon_series?.title;

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className={styles.card}
      aria-label={`${sermon.title} - ${preacherLabel}`}
    >
      <div className={styles.thumb}>
        {thumbnail ? (
          <img src={thumbnail} alt={sermon.title} loading="lazy" />
        ) : (
          <div className={styles.thumb_placeholder} aria-hidden="true" />
        )}
        {seriesTitle && <span className={styles.series}>{seriesTitle}</span>}
        <span className={styles.play_btn} aria-hidden="true">
          <IoPlay />
        </span>
        {duration && <span className={styles.duration}>{duration}</span>}
      </div>

      <div className={styles.info}>
        <span className={styles.label}>이번 주 말씀</span>
        <h3 className={styles.title}>{sermon.title}</h3>
        <div className={styles.meta}>
          <span>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>{preacherLabel}</span>
        </div>
        {sermon.summary && <p className={styles.summary}>{sermon.summary}</p>}
        {sermon.scripture && (
          <span className={styles.scripture}>{sermon.scripture}</span>
        )}
      </div>
    </Link>
  );
}
