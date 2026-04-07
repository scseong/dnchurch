'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { IoSearchOutline, IoCloseCircle, IoClose } from 'react-icons/io5';
import { RiArrowDownSLine } from 'react-icons/ri';
import CategoryBottomSheet from '@/app/(with-navbar)/news/notice/_component/CategoryBottomSheet';
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

  useEffect(() => {
    setQuery(currentSearch ?? '');
  }, [currentSearch]);

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
        <select
          className={clsx(
            styles.category_select,
            styles.pc_only,
            currentCategory && styles.selected
          )}
          value={currentCategory ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label="분류 선택"
        >
          <option value="">전체 분류</option>
          {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

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
        <form className={styles.search_form} onSubmit={handleSearch} role="search">
          <IoSearchOutline className={styles.search_icon} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색…"
            className={styles.search_input}
            aria-label="공지사항 검색"
          />
          {query && (
            <button
              type="button"
              className={styles.search_clear}
              onClick={handleSearchClear}
              aria-label="검색어 초기화"
            >
              <IoCloseCircle aria-hidden="true" />
            </button>
          )}
        </form>
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
