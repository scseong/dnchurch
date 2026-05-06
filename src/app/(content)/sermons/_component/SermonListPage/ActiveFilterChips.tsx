'use client';

import { Pill } from '@/components/ui/Pill/Pill';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
};

export default function ActiveFilterChips({ allSeries }: Props) {
  const { series, preacher, q, year, isActive, setFilter } = useSermonFilter();

  if (!isActive) return null;

  const seriesLabel = series === 'none'
    ? '단독 설교'
    : series
      ? allSeries.find((item) => item.slug === series)?.title
      : null;

  return (
    <ul role="list" aria-label="적용된 필터" className={styles.active_filters}>
      {seriesLabel && (
        <li>
          <Pill closable onClose={() => setFilter({ series: null })}>
            {seriesLabel}
          </Pill>
        </li>
      )}
      {year && (
        <li>
          <Pill closable onClose={() => setFilter({ year: null })}>
            {year}년
          </Pill>
        </li>
      )}
      {preacher && (
        <li>
          <Pill closable onClose={() => setFilter({ preacher: null })}>
            {preacher}
          </Pill>
        </li>
      )}
      {q && (
        <li>
          <Pill closable onClose={() => setFilter({ q: null })}>
            &quot;{q}&quot;
          </Pill>
        </li>
      )}
      <li>
        <button
          type="button"
          className={styles.clear_all}
          onClick={() =>
            setFilter({ series: null, preacher: null, q: null, year: null })
          }
        >
          전체 해제
        </button>
      </li>
    </ul>
  );
}
