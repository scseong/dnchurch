import Link from 'next/link';
import clsx from 'clsx';
import { formattedDate } from '@/utils/date';
import { getRevealStyle } from '@/utils/reveal';
import { formatPreacherLabel, getSermonThumbnail } from '@/utils/sermon';
import type { SermonListItem } from '@/types/sermon';
import styles from './SermonCard.module.scss';

type SermonCardProps = {
  sermon: SermonListItem;
  isLatest?: boolean;
  index?: number;
  isSub?: boolean;
};

export default function SermonCard({ sermon, isLatest, index, isSub }: SermonCardProps) {
  const thumbnail = getSermonThumbnail(sermon);
  const preacherLabel = formatPreacherLabel(sermon.preacher);

  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className={clsx(styles.card, isSub && styles.card_sub)}
      aria-label={`${sermon.title} - ${preacherLabel}`}
      data-reveal
      style={getRevealStyle(index)}
    >
      <div className={styles.card_thumb}>
        {/* TODO: Cloudinary 최적화 */}
        {thumbnail && (
          <img src={thumbnail} alt={sermonAlt(sermon, preacherLabel)} loading="lazy" />
        )}
        {isLatest && <span className={styles.latest_badge}>LATEST</span>}
        <PlayIcon className={styles.thumb_play} />
      </div>
      <div className={styles.meta_bar}>
        <div className={styles.meta_left}>
          <span className={styles.title} title={sermon.title}>
            {sermon.title}
          </span>
          <div className={styles.meta_sub}>
            <span className={styles.scripture}>{sermon.scripture}</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.date}>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.preacher}>{preacherLabel}</span>
          </div>
        </div>
        <PlayIcon className={styles.play_btn} />
      </div>
    </Link>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 12 14" fill="currentColor">
        <path d="M0 0v14l12-7z" />
      </svg>
    </span>
  );
}

function sermonAlt(
  sermon: Pick<SermonListItem, 'title' | 'sermon_date'>,
  preacherLabel: string
) {
  return `${sermon.title} - ${preacherLabel} (${formattedDate(sermon.sermon_date, 'YYYY.MM.DD')})`;
}
