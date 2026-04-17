'use client';

import { IoClose } from 'react-icons/io5';
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
        <li className={styles.filter_chip}>
          {seriesLabel}
          <button
            type="button"
            onClick={() => setFilter({ series: null })}
            aria-label="시리즈 필터 해제"
          >
            <IoClose />
          </button>
        </li>
      )}
      {year && (
        <li className={styles.filter_chip}>
          {year}년
          <button
            type="button"
            onClick={() => setFilter({ year: null })}
            aria-label="연도 필터 해제"
          >
            <IoClose />
          </button>
        </li>
      )}
      {preacher && (
        <li className={styles.filter_chip}>
          {preacher}
          <button
            type="button"
            onClick={() => setFilter({ preacher: null })}
            aria-label="설교자 필터 해제"
          >
            <IoClose />
          </button>
        </li>
      )}
      {q && (
        <li className={styles.filter_chip}>
          &quot;{q}&quot;
          <button
            type="button"
            onClick={() => setFilter({ q: null })}
            aria-label="검색 해제"
          >
            <IoClose />
          </button>
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
