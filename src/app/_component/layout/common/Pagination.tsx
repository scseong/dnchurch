'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import useQueryParams from '@/hooks/useQueryParams';
import styles from './Pagination.module.scss';

interface Props {
  totalCount: number;
  pageSize?: number;
  maxVisiblePages?: number;
}

export default function Pagination({ totalCount, pageSize = 10, maxVisiblePages = 11 }: Props) {
  const { getQueryParam, createPageURL } = useQueryParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  let currentPage = Number(getQueryParam('page')) || 1;
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  if (totalPages <= 1) return null;

  const pages: (number | 'dots')[] = [];
  pages.push(1);

  const half = Math.floor((maxVisiblePages - 3) / 2);
  let startPage = Math.max(2, currentPage - half);
  let endPage = Math.min(totalPages - 1, currentPage + half);

  if (endPage - startPage + 1 < maxVisiblePages - 2) {
    const delta = maxVisiblePages - 2 - (endPage - startPage + 1);
    startPage = Math.max(2, startPage - delta);
  }

  if (startPage > 2) pages.push('dots');
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages - 1) pages.push('dots');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav className={styles.pagination} aria-label="페이지 네비게이션">
      <ul className={styles.page_list}>
        <li>
          {currentPage > 1 ? (
            <Link
              href={createPageURL('page', currentPage - 1)}
              className={styles.page_link}
              aria-label="이전 페이지"
            >
              <IoIosArrowBack /> <span className="hidden-on-mobile">&nbsp;이전</span>
            </Link>
          ) : (
            <span
              className={clsx(styles.page_link, styles.disabled)}
              aria-disabled="true"
              aria-label="이전 페이지"
            >
              <IoIosArrowBack /> <span className="hidden-on-mobile">&nbsp;이전</span>
            </span>
          )}
        </li>

        {pages.map((page, idx) =>
          page === 'dots' ? (
            <li key={`dots-${idx}`} className={styles.dot} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={`page-${page}`}>
              <Link
                href={createPageURL('page', page)}
                className={
                  page === currentPage ? clsx(styles.page_link, styles.current) : styles.page_link
                }
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`페이지 ${page}`}
              >
                {page}
              </Link>
            </li>
          )
        )}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={createPageURL('page', currentPage + 1)}
              className={styles.page_link}
              aria-label="다음 페이지"
            >
              <span className="hidden-on-mobile">다음&nbsp;</span> <IoIosArrowForward />
            </Link>
          ) : (
            <span
              className={clsx(styles.page_link, styles.disabled)}
              aria-disabled="true"
              aria-label="다음 페이지"
            >
              <span className="hidden-on-mobile">다음&nbsp;</span> <IoIosArrowForward />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
