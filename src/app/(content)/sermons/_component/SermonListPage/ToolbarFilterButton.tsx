'use client';

import { useState } from 'react';
import { IoFunnelOutline } from 'react-icons/io5';
import AdvancedFilterSheet from '../AdvancedFilterSheet/AdvancedFilterSheet';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { Preacher } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allPreachers: Preacher[];
};

export default function ToolbarFilterButton({ allPreachers }: Props) {
  const [open, setOpen] = useState(false);
  const { preacher, setFilter } = useSermonFilter();

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
        preachers={allPreachers}
        activePreacher={preacher}
        onApply={(id) => setFilter({ preacher: id })}
      />
    </>
  );
}
