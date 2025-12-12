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
  maxVisiblePages?: number;
};

export default function Pagination({ totalCount, pageSize = 10, maxVisiblePages = 5 }: Props) {
  const { getQueryParam, createQueryURL } = useQueryParams();
  const initialCurrentPage = Number(getQueryParam('page')) || 1;
  const { pages, totalPages, currentPage } = usePagination({
    totalCount,
    pageSize,
    maxVisiblePages,
    currentPage: initialCurrentPage
  });

  if (!totalCount) return;

  return (
    <nav className={styles.pagination} aria-label="페이지 네비게이션" role="navigation">
      <ul className={styles.page_list}>
        <li>
          <PrevButton disabled={currentPage === 1} href={createQueryURL('page', currentPage - 1)} />
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
            disabled={currentPage === totalPages}
            href={createQueryURL('page', currentPage + 1)}
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
