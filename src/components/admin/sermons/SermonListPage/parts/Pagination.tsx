'use client';

import clsx from 'clsx';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import styles from '../table.module.scss';

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const PAGE_WINDOW = 5;

export default function Pagination({
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const windowStart = Math.max(
    1,
    Math.min(totalPages - PAGE_WINDOW + 1, currentPage - Math.floor(PAGE_WINDOW / 2))
  );
  const windowEnd = Math.min(totalPages, windowStart + PAGE_WINDOW - 1);
  const pages: number[] = [];
  for (let page = windowStart; page <= windowEnd; page += 1) pages.push(page);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <div className={styles.pagination}>
      <span className={styles.pagination_info}>
        {startItem}–{endItem} / 전체 {total}개
      </span>
      <div className={styles.pagination_controls}>
        <button
          type="button"
          className={styles.page_button}
          disabled={isFirst}
          onClick={() => onPageChange(1)}
        >
          처음
        </button>
        <button
          type="button"
          className={styles.page_button}
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="이전 페이지"
        >
          <HiChevronLeft aria-hidden />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={clsx(styles.page_button, page === currentPage && styles.on)}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className={styles.page_button}
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="다음 페이지"
        >
          <HiChevronRight aria-hidden />
        </button>
        <button
          type="button"
          className={styles.page_button}
          disabled={isLast}
          onClick={() => onPageChange(totalPages)}
        >
          끝
        </button>
      </div>
      <label className={styles.page_size}>
        페이지당
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}개
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
