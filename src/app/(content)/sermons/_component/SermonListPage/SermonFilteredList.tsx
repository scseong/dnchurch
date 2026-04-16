import GridCard from '../GridCard/GridCard';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  sermons: SermonWithRelations[];
};

export default function SermonFilteredList({ sermons }: Props) {
  if (sermons.length === 0) {
    return (
      <p className={styles.empty} role="status">
        검색 결과가 없습니다
      </p>
    );
  }

  return (
    <section aria-label="검색 결과">
      <ul role="list" className={styles.grid}>
        {sermons.map((s, i) => (
          <li key={s.id}>
            <GridCard sermon={s} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
