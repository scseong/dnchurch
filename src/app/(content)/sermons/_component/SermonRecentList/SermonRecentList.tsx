import Link from 'next/link';
import type { SermonWithRelations } from '@/types/sermon';
import GridCard from '../GridCard/GridCard';
import styles from './SermonRecentList.module.scss';

type Props = {
  sermons: SermonWithRelations[];
};

export default function SermonRecentList({ sermons }: Props) {
  if (sermons.length === 0) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.section_title}>최근 설교</h2>
        <Link href="/sermons/all" className={styles.more_link}>
          전체 보기 →
        </Link>
      </header>
      <ul className={styles.list}>
        {sermons.map((sermon, index) => (
          <li key={sermon.id}>
            <GridCard sermon={sermon} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}
