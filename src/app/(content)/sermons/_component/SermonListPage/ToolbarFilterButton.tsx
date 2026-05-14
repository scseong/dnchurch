'use client';

import { useState } from 'react';
import { IoFunnelOutline } from 'react-icons/io5';
import AdvancedFilterSheet from '../AdvancedFilterSheet/AdvancedFilterSheet';
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

  return (
    <>
      <button
        type="button"
        className={styles.filter_btn}
        onClick={() => setOpen(true)}
        aria-label="상세 필터 열기"
      >
        <IoFunnelOutline aria-hidden="true" />
        <span>상세 필터</span>
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
