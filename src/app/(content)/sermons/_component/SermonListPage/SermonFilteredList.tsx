import GridCard from '../GridCard/GridCard';
import { EmptyState } from '@/components/ui';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  sermons: SermonWithRelations[];
};

export default function SermonFilteredList({ sermons }: Props) {
  if (sermons.length === 0) {
    return (
      <EmptyState
        title="검색 결과가 없습니다"
        description="다른 검색어나 필터를 사용해 보세요"
        announce
      />
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
