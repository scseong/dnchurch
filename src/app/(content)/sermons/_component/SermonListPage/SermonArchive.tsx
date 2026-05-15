import SermonCard from '../SermonCard/SermonCard';
import SermonYearGrid from './SermonYearGrid';
import type { SermonArchiveView } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  archive: SermonArchiveView;
};

export default function SermonArchive({ archive }: Props) {
  const { featured, yearCounts } = archive;

  return (
    <>
      {featured && (
        <section className={styles.featured} aria-label="이번 주 말씀">
          <SermonCard sermon={featured} />
        </section>
      )}

      <SermonYearGrid yearCounts={yearCounts} />
    </>
  );
}
