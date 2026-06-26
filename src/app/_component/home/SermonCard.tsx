import Link from 'next/link';
import { formattedDate } from '@/utils/date';
import { formatPreacherLabel, getSermonThumbnail } from '@/utils/sermon';
import type { SermonListItem } from '@/types/sermon';
import styles from './SermonCard.module.scss';

type SermonCardProps = {
  sermon: SermonListItem;
};

export default function SermonCard({ sermon }: SermonCardProps) {
  const thumbnail = getSermonThumbnail(sermon);
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const dateLabel = formattedDate(sermon.sermon_date, 'YYYY.MM.DD');

  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className={styles.card}
      aria-label={`${sermon.title} - ${preacherLabel}`}
    >
      <div className={styles.thumb}>
        {thumbnail && <img src={thumbnail} alt={`${sermon.title} 설교 영상`} loading="lazy" />}
        <span className={styles.badge}>▶ 온라인 예배</span>
        <span className={styles.play} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5v14l12-7z" />
          </svg>
        </span>
      </div>
      <div className={styles.info}>
        <span className={styles.eyebrow}>
          {sermon.service_type ?? '예배'} · {dateLabel}
        </span>
        <span className={styles.title}>{sermon.title}</span>
        <span className={styles.meta}>
          {preacherLabel} · {sermon.scripture}
        </span>
      </div>
    </Link>
  );
}
