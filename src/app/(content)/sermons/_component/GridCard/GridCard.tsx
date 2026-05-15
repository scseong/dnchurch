import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { formattedDate } from '@/utils/date';
import { formatPreacherLabel, formatSermonDuration, getSermonThumbnail } from '@/utils/sermon';
import type { SermonCardItem } from '@/types/sermon';
import styles from './GridCard.module.scss';

const ANIMATION_STEP_MS = 60;

type Props = {
  sermon: SermonCardItem;
  index?: number;
};

export default function GridCard({ sermon, index = 0 }: Props) {
  const thumbnail = getSermonThumbnail(sermon);
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const duration = formatSermonDuration(sermon.duration);

  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * ANIMATION_STEP_MS}ms` }}
      aria-label={`${sermon.title} - ${preacherLabel}${duration ? `, ${duration}` : ''}`}
    >
      <div className={styles.thumb}>
        {thumbnail ? (
          <CloudinaryImage
            src={thumbnail}
            alt={sermon.title}
            fill
            sizes="(min-width: 1024px) 13rem, (min-width: 768px) 30vw, 40vw"
          />
        ) : (
          <div className={styles.thumb_placeholder} aria-hidden="true" />
        )}
        <span className={styles.play_btn} aria-hidden="true">
          <IoPlay />
        </span>
        {duration && (
          <span className={styles.duration} aria-hidden="true">
            {duration}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{sermon.title}</h3>
        {sermon.scripture && (
          <span className={styles.scripture}>{sermon.scripture}</span>
        )}
        <div className={styles.meta}>
          <span>{preacherLabel}</span>
          <span className={styles.meta_dot} aria-hidden="true">
            ·
          </span>
          <span>{formattedDate(sermon.sermon_date, 'YY.MM.DD')}</span>
        </div>
      </div>
    </Link>
  );
}
