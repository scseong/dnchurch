import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import type { SeriesWithSermonCount } from '@/types/sermon';
import { formattedDate } from '@/utils/date';
import styles from './SermonSeriesCarousel.module.scss';

type Props = {
  series: SeriesWithSermonCount;
};

export default function SeriesCard({ series }: Props) {
  const cover = series.cover_image_url;

  return (
    <Link href={`/sermons/series/${series.id}`} className={styles.card} draggable={false}>
      <div className={styles.cover}>
        {cover && (
          <CloudinaryImage
            src={cover}
            alt={series.title}
            fill
            sizes="(min-width: 768px) 33vw, 260px"
            className={styles.cover_image}
          />
        )}
        <div className={styles.cover_scrim} aria-hidden />
        <span className={styles.badge}>
          {series.ended_at === null ? 'ON-GOING' : 'COMPLETED'}
        </span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{series.title}</h3>
        {series.description && <p className={styles.description}>{series.description}</p>}
        <div className={styles.meta_bar}>
          <span>{formattedDate(series.started_at, 'YYYY.MM.DD')}</span>
          <span className={styles.dot} aria-hidden>~</span>
          {series.ended_at ? (
            <span>{formattedDate(series.ended_at, 'YYYY.MM.DD')}</span>
          ) : (
            <span className={styles.ongoing}>진행 중</span>
          )}
          <span className={styles.dot} aria-hidden>·</span>
          <span className={styles.count}>{series.sermon_count}편</span>
        </div>
      </div>
    </Link>
  );
}
