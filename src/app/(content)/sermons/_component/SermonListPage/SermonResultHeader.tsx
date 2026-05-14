'use client';

import clsx from 'clsx';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { SermonSortKey } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  resultCount: number;
  hasQuery: boolean;
};

export default function SermonResultHeader({ resultCount, hasQuery }: Props) {
  const { sort, setSort } = useSermonFilter();
  const isActive = sort !== 'recent';

  return (
    <header className={styles.result_header}>
      <p className={styles.result_count}>
        <span>{hasQuery ? '결과 ' : '총 '}</span>
        <strong>{resultCount}</strong>
        <span>개 설교</span>
      </p>
      <select
        className={clsx(styles.sort_select, isActive && styles.sort_select_active)}
        value={sort}
        onChange={(event) => setSort(event.target.value as SermonSortKey)}
        aria-label="설교 정렬"
      >
        <option value="recent">정렬: 최신순</option>
        <option value="oldest">정렬: 오래된순</option>
      </select>
    </header>
  );
}
