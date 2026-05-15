'use client';

import { useState } from 'react';
import { IoFunnelOutline } from 'react-icons/io5';
import AdvancedFilterSheet from '../AdvancedFilterSheet/AdvancedFilterSheet';
import useSermonFilter from '@/hooks/useSermonFilter';
import type {
  PreacherWithSermonCount,
  SeriesWithSermonCount
} from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  allPreachers: PreacherWithSermonCount[];
};

export default function ToolbarFilterButton({ allSeries, allPreachers }: Props) {
  const [open, setOpen] = useState(false);
  const { activeFilterCount } = useSermonFilter();

  return (
    <>
      <button
        type="button"
        className={styles.filter_btn}
        onClick={() => setOpen(true)}
        aria-label={
          activeFilterCount > 0
            ? `상세 필터 열기 (${activeFilterCount}개 적용됨)`
            : '상세 필터 열기'
        }
      >
        <IoFunnelOutline aria-hidden="true" />
        <span className={styles.filter_label}>상세 필터</span>
        {activeFilterCount > 0 && (
          <span className={styles.filter_badge} aria-hidden="true">
            {activeFilterCount}
          </span>
        )}
      </button>
      <AdvancedFilterSheet
        open={open}
        onClose={() => setOpen(false)}
        allSeries={allSeries}
        allPreachers={allPreachers}
      />
    </>
  );
}
