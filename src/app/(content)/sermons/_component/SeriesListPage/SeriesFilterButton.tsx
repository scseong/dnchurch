'use client';

import { useState } from 'react';
import { IoFunnelOutline } from 'react-icons/io5';
import SeriesFilterBottomSheet from './SeriesFilterBottomSheet';
import useSeriesFilter from '@/hooks/useSeriesFilter';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
};

export default function SeriesFilterButton({ allSeries }: Props) {
  const [open, setOpen] = useState(false);
  const { activeFilterCount } = useSeriesFilter();

  return (
    <>
      <button
        type="button"
        className={styles.filter_btn}
        onClick={() => setOpen(true)}
        aria-label={
          activeFilterCount > 0
            ? `필터 열기 (${activeFilterCount}개 적용됨)`
            : '필터 열기'
        }
      >
        <IoFunnelOutline aria-hidden="true" />
        <span className={styles.filter_label}>필터</span>
        {activeFilterCount > 0 && (
          <span className={styles.filter_badge} aria-hidden="true">
            {activeFilterCount}
          </span>
        )}
      </button>
      <SeriesFilterBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        allSeries={allSeries}
      />
    </>
  );
}
