import { EmptyState } from '@/components/ui';
import SeriesCard from '../SermonSeriesCarousel/SeriesCard';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesListPage.module.scss';

type Props = {
  series: SeriesWithSermonCount[];
};

export default function SeriesGrid({ series }: Props) {
  if (series.length === 0) {
    return (
      <EmptyState
        title="아직 등록된 시리즈가 없습니다"
        description="새로운 강해 설교 시리즈를 준비하고 있습니다"
        announce
      />
    );
  }

  return (
    <section aria-label="시리즈 목록">
      <ul role="list" className={styles.grid}>
        {series.map((item) => (
          <li key={item.id}>
            <SeriesCard series={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
