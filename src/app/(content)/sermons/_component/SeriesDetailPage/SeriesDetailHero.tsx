import CloudinaryImage from '@/components/common/CloudinaryImage';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { formattedDate } from '@/utils/date';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesDetailPage.module.scss';

type Props = {
  series: SeriesWithSermonCount;
};

export default function SeriesDetailHero({ series }: Props) {
  const cover = cloudinaryFetchUrl(series.cover_image_url);

  return (
    <section className={styles.hero}>
      {cover && (
        <CloudinaryImage
          src={cover}
          alt={series.title}
          fill
          sizes="100vw"
          className={styles.hero_image}
          priority
        />
      )}
      <div className={styles.hero_scrim} aria-hidden />
      <div className={styles.hero_content}>
        <span className={styles.hero_eyebrow}>
          SERIES · {series.ended_at === null ? 'ON-GOING' : 'COMPLETED'}
        </span>
        <h1 className={styles.hero_title}>{series.title}</h1>
        {series.description && (
          <p className={styles.hero_desc}>{series.description}</p>
        )}
        <div className={styles.hero_meta}>
          <span>{formattedDate(series.started_at, 'YYYY.MM.DD')}</span>
          <span className={styles.hero_dot} aria-hidden>
            ~
          </span>
          {series.ended_at ? (
            <span>{formattedDate(series.ended_at, 'YYYY.MM.DD')}</span>
          ) : (
            <span className={styles.hero_ongoing}>진행 중</span>
          )}
          <span className={styles.hero_dot} aria-hidden>
            ·
          </span>
          <span className={styles.hero_count}>{series.sermon_count}편</span>
        </div>
      </div>
    </section>
  );
}
