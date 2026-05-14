import SermonSearchForm from './SermonSearchForm';
import ToolbarFilterButton from './ToolbarFilterButton';
import SermonSeriesChips from './SermonSeriesChips';
import SermonSearchFeedback from './SermonSearchFeedback';
import SermonSeriesBanner from './SermonSeriesBanner';
import ActiveFilterChips from './ActiveFilterChips';
import type {
  PreacherWithSermonCount,
  SeriesWithSermonCount
} from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  allPreachers: PreacherWithSermonCount[];
  totalCount: number;
  standaloneCount: number;
  resultCount: number;
};

export default function SermonToolbar({
  allSeries,
  allPreachers,
  totalCount,
  standaloneCount,
  resultCount
}: Props) {
  return (
    <header className={styles.toolbar_header}>
      <div className={styles.toolbar}>
        <SermonSearchForm />
        <ToolbarFilterButton allSeries={allSeries} allPreachers={allPreachers} />
      </div>
      <SermonSeriesChips
        allSeries={allSeries}
        totalCount={totalCount}
        standaloneCount={standaloneCount}
      />
      <SermonSearchFeedback resultCount={resultCount} />
      <SermonSeriesBanner allSeries={allSeries} />
      <ActiveFilterChips allSeries={allSeries} />
    </header>
  );
}
