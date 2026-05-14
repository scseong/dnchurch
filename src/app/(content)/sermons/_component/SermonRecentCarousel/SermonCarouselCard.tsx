import Link from 'next/link';
import clsx from 'clsx';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import type { SermonWithRelations } from '@/types/sermon';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { getSermonThumbnail, formatPreacherLabel, formatSermonDuration } from '@/utils/sermon';
import { formattedDate } from '@/utils/date';
import styles from './SermonRecentCarousel.module.scss';

type Props = {
  sermon: SermonWithRelations;
};

export default function SermonCarouselCard({ sermon }: Props) {
  const thumb = cloudinaryFetchUrl(getSermonThumbnail(sermon));
  const duration = formatSermonDuration(sermon.duration);
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const hasSeries = Boolean(sermon.sermon_series);
  const labelText = sermon.sermon_series?.title ?? sermon.service_type;

  return (
    <Link href={`/sermons/${sermon.id}`} className={styles.card} draggable={false}>
      <div className={styles.thumb_box}>
        {thumb && (
          <CloudinaryImage
            src={thumb}
            alt={sermon.title}
            fill
            sizes="(min-width: 768px) 240px, 210px"
            className={styles.thumb}
          />
        )}
        <span className={styles.play_circle} aria-hidden>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        {duration && <span className={styles.duration}>{duration}</span>}
      </div>
      <div className={styles.body}>
        <span className={clsx(styles.label, hasSeries ? styles.label_series : styles.label_type)}>
          {labelText}
        </span>
        <h3 className={styles.title}>{sermon.title}</h3>
        {sermon.scripture && <p className={styles.scripture}>{sermon.scripture}</p>}
        <div className={styles.meta_bar}>
          <span>{preacherLabel}</span>
          <span className={styles.dot} aria-hidden>·</span>
          <span>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
        </div>
      </div>
    </Link>
  );
}
