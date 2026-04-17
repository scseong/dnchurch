'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { IoLibraryOutline } from 'react-icons/io5';
import SeriesBrowserSheet from '../SeriesBrowserSheet/SeriesBrowserSheet';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

const TOP_CHIP_COUNT = 3;

type Props = {
  allSeries: SeriesWithSermonCount[];
  totalCount: number;
  standaloneCount: number;
};

export default function SermonSeriesChips({ allSeries, totalCount, standaloneCount }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { series: activeSeries, setFilter } = useSermonFilter();

  const topSeries = allSeries.slice(0, TOP_CHIP_COUNT);

  return (
    <>
      <nav aria-label="시리즈 바로가기" className={styles.chips}>
        <ul role="list" className={styles.chip_list}>
          <li>
            <button
              type="button"
              className={clsx(styles.chip, !activeSeries && styles.chip_active)}
              onClick={() => setFilter({ series: null, preacher: null, q: null, year: null })}
            >
              전체
            </button>
          </li>
          {topSeries.map((series) => (
            <li key={series.id}>
              <button
                type="button"
                className={clsx(styles.chip, activeSeries === series.slug && styles.chip_active)}
                onClick={() => setFilter({ series: series.slug })}
              >
                {series.title}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={styles.chip_more}
              onClick={() => setSheetOpen(true)}
              aria-label="시리즈 전체 보기"
            >
              <IoLibraryOutline aria-hidden="true" />
              시리즈 전체
            </button>
          </li>
        </ul>
      </nav>

      <SeriesBrowserSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        series={allSeries}
        activeSeries={activeSeries}
        onSelect={(key) =>
          key === null
            ? setFilter({ series: null, preacher: null, q: null, year: null })
            : setFilter({ series: key })
        }
        totalCount={totalCount}
        standaloneCount={standaloneCount}
      />
    </>
  );
}
