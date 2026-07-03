'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import { SearchField } from '@/components/ui';
import { NOTICE_CATEGORIES, NOTICE_SORT_OPTIONS, type NoticeSortOption } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './NoticeControlBar.module.scss';

type Props = {
  count: number;
  currentCategory?: NoticeCategory;
  currentSearch?: string;
  currentSort: NoticeSortOption;
};

const CATEGORY_ENTRIES = Object.entries(NOTICE_CATEGORIES) as [NoticeCategory, string][];
const SORT_ENTRIES = Object.entries(NOTICE_SORT_OPTIONS) as [NoticeSortOption, string][];

export default function NoticeControlBar({
  count,
  currentCategory,
  currentSearch,
  currentSort
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentSearch ?? '');

  // currentSearch(URL search) 변경 → query 동기화 (렌더 중 prev-state 보정)
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setQuery(currentSearch ?? '');
  }

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [searchParams, router]
  );

  const handleSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      updateParams({ search: query || null });
    },
    [query, updateParams]
  );

  const handleSearchClear = useCallback(() => {
    setQuery('');
    updateParams({ search: null });
  }, [updateParams]);

  const categoryLabel = currentCategory ? NOTICE_CATEGORIES[currentCategory] : '전체';

  return (
    <div className={styles.bar}>
      <search className={styles.search}>
        <SearchField
          value={query}
          onChange={setQuery}
          onClear={handleSearchClear}
          onSubmit={handleSearch}
          placeholder="공지 제목·내용 검색"
          aria-label="공지사항 검색"
        />
      </search>

      <div className={styles.chips}>
        <button
          type="button"
          className={clsx(styles.chip, !currentCategory && styles.chip_active)}
          onClick={() => updateParams({ category: null })}
          aria-pressed={!currentCategory}
        >
          전체
        </button>
        {CATEGORY_ENTRIES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={clsx(styles.chip, currentCategory === value && styles.chip_active)}
            onClick={() => updateParams({ category: value })}
            aria-pressed={currentCategory === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <div className={styles.header_left}>
          <p className={styles.count}>
            {categoryLabel} 공지 <span className={styles.count_num}>{count.toLocaleString()}개</span>
          </p>
          {currentSearch && (
            <span className={styles.search_tag}>
              ‘{currentSearch}’ 검색
              <button
                type="button"
                className={styles.tag_remove}
                onClick={handleSearchClear}
                aria-label="검색어 지우기"
              >
                <IoClose aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
        <div className={styles.sort}>
          {SORT_ENTRIES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={clsx(styles.sort_btn, currentSort === value && styles.sort_active)}
              onClick={() => updateParams({ sort: value === 'latest' ? null : value })}
              aria-pressed={currentSort === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
