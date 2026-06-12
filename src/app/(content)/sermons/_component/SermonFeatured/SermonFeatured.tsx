import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import type { SermonWithRelations } from '@/types/sermon';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { getSermonThumbnail, formatPreacherLabel, formatSermonDuration } from '@/utils/sermon';
import { formattedDate } from '@/utils/date';
import styles from './SermonFeatured.module.scss';

type Props = {
  sermon: SermonWithRelations | null;
};

export default function SermonFeatured({ sermon }: Props) {
  if (!sermon) return null;

  const thumb = cloudinaryFetchUrl(getSermonThumbnail(sermon));
  const duration = formatSermonDuration(sermon.duration);
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const summaryFirstParagraph = sermon.summary?.split('\n\n')[0] ?? '';
  const seriesOrderLabel =
    sermon.sermon_series && sermon.series_order !== null
      ? String(sermon.series_order).padStart(2, '0')
      : null;

  return (
    <section className={styles.section}>
      <h2 className={styles.section_title}>이번 주 설교</h2>
      <Link href={`/sermons/${sermon.id}`} className={styles.card}>
        <div className={styles.media}>
        {thumb && (
          <CloudinaryImage
            src={thumb}
            alt={sermon.title}
            fill
            sizes="(min-width: 768px) 580px, 100vw"
            className={styles.thumb}
            priority
          />
        )}
        <span className={styles.play_circle} aria-hidden>
          <IoPlay />
        </span>
        {duration && <span className={styles.duration}>{duration}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          {sermon.sermon_series && (
            <>
              <span className={styles.series}>
                {sermon.sermon_series.title}
                {seriesOrderLabel && ` · ${seriesOrderLabel}`}
              </span>
              <span className={styles.dot}>·</span>
            </>
          )}
          <span className={styles.date}>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
          <span className={styles.dot}>·</span>
          <span>{sermon.service_type}</span>
        </div>
        <h3 className={styles.title}>{sermon.title}</h3>
        {sermon.scripture && <p className={styles.scripture}>{sermon.scripture}</p>}
        {summaryFirstParagraph && <p className={styles.summary}>{summaryFirstParagraph}</p>}
        <p className={styles.preacher}>{preacherLabel}</p>
        </div>
      </Link>
    </section>
  );
}
