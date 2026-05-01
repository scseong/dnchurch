import SermonCard from '../SermonCard/SermonCard';
import GridCard from '../GridCard/GridCard';
import SermonYearGrid from './SermonYearGrid';
import type { SermonArchiveView } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  archive: SermonArchiveView;
};

export default function SermonArchive({ archive }: Props) {
  const { featured, recentSermons, yearCounts } = archive;

  return (
    <>
      {featured && (
        <section className={styles.featured} aria-label="이번 주 말씀">
          <SermonCard sermon={featured} />
        </section>
      )}

      {recentSermons.length > 0 && (
        <section className={styles.year_section} aria-labelledby="recent-heading">
          <h2 id="recent-heading" className={styles.year_heading}>
            최근 말씀
          </h2>
          <ul role="list" className={styles.grid}>
            {recentSermons.map((s, i) => (
              <li key={s.id}>
                <GridCard sermon={s} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SermonYearGrid yearCounts={yearCounts} />
    </>
  );
}
