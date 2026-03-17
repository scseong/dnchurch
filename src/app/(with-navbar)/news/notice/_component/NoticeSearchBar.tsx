'use client';

import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { IoSearchOutline, IoCloseCircle } from 'react-icons/io5';
import useQueryParams from '@/hooks/useQueryParams';
import SortBottomSheet from '@/app/(with-navbar)/news/notice/_component/SortBottomSheet';
import { NOTICE_SORT_OPTIONS } from '@/constants/notice';
import type { NoticeSortOption } from '@/constants/notice';
import styles from './NoticeSearchBar.module.scss';

type Props = {
  total: number;
  sort: NoticeSortOption;
  search?: string;
};

export default function NoticeSearchBar({ total, sort, search }: Props) {
  const { updateQueryParam } = useQueryParams();
  const [query, setQuery] = useState(search ?? '');
  const [showSort, setShowSort] = useState(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateQueryParam('search', query);
    },
    [query, updateQueryParam]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    updateQueryParam('search', '');
  }, [updateQueryParam]);

  const handleSortChange = useCallback(
    (value: string) => {
      updateQueryParam('sort', value);
    },
    [updateQueryParam]
  );

  return (
    <div className={styles.bar}>
      <span className={styles.total}>총 {total.toLocaleString()}건</span>

      <div className={styles.controls}>
        <form className={styles.search} onSubmit={handleSearch}>
          <IoSearchOutline className={styles.search_icon} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어 입력"
            className={styles.search_input}
          />
          {query && (
            <button type="button" className={styles.clear_button} onClick={handleClear}>
              <IoCloseCircle />
            </button>
          )}
        </form>

        <select
          className={clsx(styles.sort_select, styles.pc_only)}
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {Object.entries(NOTICE_SORT_OPTIONS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={clsx(styles.sort_button, styles.mobile_only)}
          onClick={() => setShowSort(true)}
        >
          {NOTICE_SORT_OPTIONS[sort]}
        </button>
      </div>

      <SortBottomSheet
        isOpen={showSort}
        currentSort={sort}
        onSelect={(value) => {
          handleSortChange(value);
          setShowSort(false);
        }}
        onClose={() => setShowSort(false)}
      />
    </div>
  );
}
