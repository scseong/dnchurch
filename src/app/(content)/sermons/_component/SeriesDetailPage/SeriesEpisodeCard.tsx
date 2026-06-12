import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { formattedDate } from '@/utils/date';
import { formatSermonDuration, getSermonThumbnail } from '@/utils/sermon';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SeriesDetailPage.module.scss';

type Props = {
  sermon: SermonWithRelations;
  order: number;
};

export default function SeriesEpisodeCard({ sermon, order }: Props) {
  const thumbnail = cloudinaryFetchUrl(getSermonThumbnail(sermon));
  const duration = formatSermonDuration(sermon.duration);
  const number = String(order).padStart(2, '0');

  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className={styles.episode}
      aria-label={`${number}편 ${sermon.title}${duration ? `, ${duration}` : ''}`}
    >
      <span className={styles.ep_number} aria-hidden="true">
        {number}
      </span>
      <div className={styles.ep_thumb}>
        {thumbnail ? (
          <CloudinaryImage
            src={thumbnail}
            alt={sermon.title}
            fill
            sizes="(min-width: 1024px) 13rem, 40vw"
            className={styles.ep_thumb_img}
          />
        ) : (
          <div className={styles.ep_thumb_placeholder} aria-hidden="true" />
        )}
        <span className={styles.ep_play} aria-hidden="true">
          <IoPlay />
        </span>
        {duration && (
          <span className={styles.ep_duration} aria-hidden="true">
            {duration}
          </span>
        )}
      </div>
      <div className={styles.ep_info}>
        <h3 className={styles.ep_title}>{sermon.title}</h3>
        <div className={styles.ep_meta}>
          {sermon.scripture && (
            <>
              <span className={styles.ep_scripture}>{sermon.scripture}</span>
              <span className={styles.ep_dot} aria-hidden="true">
                ·
              </span>
            </>
          )}
          <span>{formattedDate(sermon.sermon_date, 'YY.MM.DD')}</span>
        </div>
      </div>
    </Link>
  );
}
