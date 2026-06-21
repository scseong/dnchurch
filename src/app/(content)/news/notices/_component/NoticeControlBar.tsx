'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import { RiArrowDownSLine } from 'react-icons/ri';
import { SearchField, Select } from '@/components/ui';
import CategoryBottomSheet from '@/app/(content)/news/notices/_component/CategoryBottomSheet';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './NoticeControlBar.module.scss';

type Props = {
  total: number;
  currentCategory?: NoticeCategory;
  currentSearch?: string;
};

export default function NoticeControlBar({ total, currentCategory, currentSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentSearch ?? '');
  const [showCategorySheet, setShowCategorySheet] = useState(false);

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

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateParams({ category: value || null });
    },
    [updateParams]
  );

  const handleCategoryTagRemove = useCallback(() => {
    updateParams({ category: null });
  }, [updateParams]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateParams({ search: query || null });
    },
    [query, updateParams]
  );

  const handleSearchClear = useCallback(() => {
    setQuery('');
    updateParams({ search: null });
  }, [updateParams]);

  return (
    <div className={styles.bar}>
      {/* 좌측: 건수 + 활성 태그 */}
      <div className={styles.bar_left}>
        <span className={styles.total}>총 {total.toLocaleString()}건</span>
        {currentCategory && (
          <span className={styles.active_tag}>
            {NOTICE_CATEGORIES[currentCategory]}
            <button
              type="button"
              className={styles.tag_remove}
              onClick={handleCategoryTagRemove}
              aria-label={`${NOTICE_CATEGORIES[currentCategory]} 필터 해제`}
            >
              <IoClose aria-hidden="true" />
            </button>
          </span>
        )}
      </div>

      {/* 우측: 분류 + 검색 */}
      <div className={styles.bar_right}>
        {/* PC: select */}
        <Select
          className={styles.pc_only}
          value={currentCategory ?? ''}
          onChange={handleCategoryChange}
          options={[
            { value: '', label: '전체 분류' },
            ...Object.entries(NOTICE_CATEGORIES).map(([key, label]) => ({ value: key, label }))
          ]}
          emphasized={Boolean(currentCategory)}
          aria-label="분류 선택"
        />

        {/* Mobile: text button */}
        <button
          type="button"
          className={clsx(
            styles.category_btn,
            styles.mobile_only,
            currentCategory && styles.selected
          )}
          onClick={() => setShowCategorySheet(true)}
          aria-label="분류 선택"
        >
          {currentCategory ? NOTICE_CATEGORIES[currentCategory] : '전체 분류'}
          <RiArrowDownSLine aria-hidden="true" />
        </button>

        {/* 검색창 */}
        <search className={styles.search_form}>
          <SearchField
            value={query}
            onChange={setQuery}
            onClear={handleSearchClear}
            onSubmit={handleSearch}
            placeholder="검색…"
            aria-label="공지사항 검색"
          />
        </search>
      </div>

      <CategoryBottomSheet
        isOpen={showCategorySheet}
        currentCategory={currentCategory}
        onSelect={(value) => {
          handleCategoryChange(value ?? '');
          setShowCategorySheet(false);
        }}
        onClose={() => setShowCategorySheet(false)}
      />
    </div>
  );
}
