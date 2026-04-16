import SermonSearchForm from './SermonSearchForm';
import ToolbarFilterButton from './ToolbarFilterButton';
import SermonSeriesChips from './SermonSeriesChips';
import SermonSeriesBanner from './SermonSeriesBanner';
import ActiveFilterChips from './ActiveFilterChips';
import type { SeriesWithSermonCount, Preacher } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  allPreachers: Preacher[];
  totalCount: number;
  standaloneCount: number;
};

export default function SermonToolbar({
  allSeries,
  allPreachers,
  totalCount,
  standaloneCount
}: Props) {
  return (
    <header className={styles.toolbar_header}>
      <div className={styles.toolbar}>
        <SermonSearchForm />
        <ToolbarFilterButton allPreachers={allPreachers} />
      </div>
      <SermonSeriesChips
        allSeries={allSeries}
        totalCount={totalCount}
        standaloneCount={standaloneCount}
      />
      <SermonSeriesBanner allSeries={allSeries} standaloneCount={standaloneCount} />
      <ActiveFilterChips allSeries={allSeries} />
    </header>
  );
}
