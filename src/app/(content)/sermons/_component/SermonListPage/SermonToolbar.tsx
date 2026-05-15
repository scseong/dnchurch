import SermonSearchForm from './SermonSearchForm';
import ToolbarFilterButton from './ToolbarFilterButton';
import SermonSeriesBanner from './SermonSeriesBanner';
import type {
  PreacherWithSermonCount,
  SeriesWithSermonCount
} from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  allPreachers: PreacherWithSermonCount[];
};

export default function SermonToolbar({ allSeries, allPreachers }: Props) {
  return (
    <header className={styles.toolbar_header}>
      <div className={styles.toolbar}>
        <SermonSearchForm />
        <ToolbarFilterButton allSeries={allSeries} allPreachers={allPreachers} />
      </div>
      <SermonSeriesBanner allSeries={allSeries} />
    </header>
  );
}
