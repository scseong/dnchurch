import SeriesSearchForm from './SeriesSearchForm';
import SeriesFilterButton from './SeriesFilterButton';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
};

export default function SeriesToolbar({ allSeries }: Props) {
  return (
    <header className={styles.toolbar_header}>
      <div className={styles.toolbar}>
        <SeriesSearchForm />
        <SeriesFilterButton allSeries={allSeries} />
      </div>
    </header>
  );
}
