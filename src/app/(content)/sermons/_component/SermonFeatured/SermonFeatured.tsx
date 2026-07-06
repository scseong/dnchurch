import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import type { SermonCardItem } from '@/types/sermon';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { getSermonThumbnail, formatPreacherLabel, formatSermonDuration } from '@/utils/sermon';
import { formattedDate } from '@/utils/date';
import styles from './SermonFeatured.module.scss';

type Props = {
  sermon: SermonCardItem | null;
};

export default function SermonFeatured({ sermon }: Props) {
  if (!sermon) return null;

  const thumb = cloudinaryFetchUrl(getSermonThumbnail(sermon));
  const duration = formatSermonDuration(sermon.duration);
  const preacherLabel = formatPreacherLabel(sermon.preacher);

  return (
    <section className={styles.section}>
      <h2 className={styles.section_title}>이번 주 설교</h2>
      <Link href={`/sermons/${sermon.id}`} className={styles.card}>
        {thumb && (
          <CloudinaryImage
            src={thumb}
            alt={sermon.title}
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className={styles.thumb}
            priority
          />
        )}
        <div className={styles.pills}>
          <span className={styles.pill_latest}>최신 설교</span>
          {sermon.sermon_series && (
            <span className={styles.pill_series}>{sermon.sermon_series.title}</span>
          )}
        </div>
        <span className={styles.play_circle} aria-hidden>
          <IoPlay />
        </span>
        {duration && <span className={styles.duration}>{duration}</span>}
        <div className={styles.scrim}>
          {sermon.scripture && <p className={styles.scripture}>{sermon.scripture}</p>}
          <h3 className={styles.title}>{sermon.title}</h3>
          <div className={styles.meta}>
            <span className={styles.preacher}>{preacherLabel}</span>
            <span className={styles.dot} aria-hidden>·</span>
            <span>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
            <span className={styles.dot} aria-hidden>·</span>
            <span>{sermon.service_type}</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
