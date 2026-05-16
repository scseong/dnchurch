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
        title="조건에 맞는 시리즈가 없습니다"
        description="다른 상태·연도나 검색어를 사용해 보세요"
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
