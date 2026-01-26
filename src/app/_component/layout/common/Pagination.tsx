'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { IoIosArrowBack, IoIosArrowForward, IoIosMore } from 'react-icons/io';
import useQueryParams from '@/hooks/useQueryParams';
import usePagination from '@/hooks/usePagination';
import styles from './Pagination.module.scss';

type Props = {
  totalCount: number;
  pageSize?: number;
  currentPage: number;
  maxVisiblePages?: number;
};

export default function Pagination({
  totalCount,
  pageSize = 10,
  currentPage,
  maxVisiblePages = 5
}: Props) {
  const { createQueryURL } = useQueryParams();
  const { pages, totalPages } = usePagination({
    totalCount,
    pageSize,
    maxVisiblePages,
    currentPage
  });

  const getPrevPage = () => {
    if (currentPage > totalPages) return totalPages;
    return Math.max(1, currentPage - 1);
  };

  const getNextPage = () => {
    return Math.min(totalPages, currentPage + 1);
  };

  if (!totalCount || totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="페이지 네비게이션" role="navigation">
      <ul className={styles.page_list}>
        <li>
          <PrevButton disabled={currentPage <= 1} href={createQueryURL('page', getPrevPage())} />
        </li>
        {pages.map((page, idx) =>
          page === 'dots' ? (
            <li className={styles.dot} key={`dots-${idx}`}>
              <IoIosMore />
            </li>
          ) : (
            <PageLink
              page={page}
              isCurrent={page === currentPage}
              href={createQueryURL('page', page)}
              key={`page-${page}`}
            />
          )
        )}
        <li>
          <NextButton
            disabled={currentPage >= totalPages}
            href={createQueryURL('page', getNextPage())}
          />
        </li>
      </ul>
    </nav>
  );
}

export function PageLink({
  page,
  isCurrent,
  href
}: {
  page: number;
  isCurrent: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(styles.page_link, isCurrent && styles.current)}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {page}
    </Link>
  );
}

export function PrevButton({ disabled, href }: { disabled: boolean; href: string }) {
  return disabled ? (
    <span className={clsx(styles.page_link, styles.disabled)} aria-disabled="true">
      <IoIosArrowBack /> <span className="hidden-on-mobile">이전</span>
    </span>
  ) : (
    <Link href={href} className={styles.page_link}>
      <IoIosArrowBack /> <span className="hidden-on-mobile">이전</span>
    </Link>
  );
}

export function NextButton({ disabled, href }: { disabled: boolean; href: string }) {
  return disabled ? (
    <span className={clsx(styles.page_link, styles.disabled)} aria-disabled="true">
      <span className="hidden-on-mobile">다음</span> <IoIosArrowForward />
    </span>
  ) : (
    <Link href={href} className={styles.page_link}>
      <span className="hidden-on-mobile">다음</span> <IoIosArrowForward />
    </Link>
  );
}
