import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import type { SermonWithRelations } from '@/types/sermon';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { getSermonThumbnail } from '@/utils/sermon';
import { formattedDate } from '@/utils/date';
import styles from './SermonOtherByPreacher.module.scss';

type Props = {
  preacherLabel: string;
  sermons: SermonWithRelations[];
};

export default function SermonOtherByPreacher({ preacherLabel, sermons }: Props) {
  if (sermons.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{preacherLabel}의 다른 설교</h2>
      <div className={styles.grid}>
        {sermons.map((sermon) => (
          <OtherCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
    </section>
  );
}

function OtherCard({ sermon }: { sermon: SermonWithRelations }) {
  const thumb = cloudinaryFetchUrl(getSermonThumbnail(sermon));

  return (
    <Link href={`/sermons/${sermon.id}`} className={styles.card} draggable={false}>
      <div className={styles.thumb_box}>
        {thumb && (
          <CloudinaryImage
            src={thumb}
            alt={sermon.title}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className={styles.thumb}
          />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.card_title}>{sermon.title}</h3>
        <div className={styles.meta}>
          {sermon.scripture && <span className={styles.scripture}>{sermon.scripture}</span>}
          {sermon.scripture && <span className={styles.dot} aria-hidden="true">·</span>}
          <span className={styles.date}>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
        </div>
      </div>
    </Link>
  );
}
