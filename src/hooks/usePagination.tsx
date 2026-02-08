import { useMemo } from 'react';

type PageItem = number | 'dots';

type Props = {
  totalCount: number;
  pageSize: number;
  maxVisiblePages: number;
  currentPage: number;
};

export default function usePagination({
  totalCount,
  pageSize,
  maxVisiblePages,
  currentPage
}: Props) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const displayPage = Math.max(1, Math.min(currentPage, totalPages));

  const pages = useMemo(() => {
    if (totalPages <= 1) return [];

    const pageArray: PageItem[] = [];
    const maxPagesToShow = maxVisiblePages - 2;
    const half = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(2, displayPage - half);
    let endPage = Math.min(totalPages - 1, displayPage + half);

    if (endPage - startPage + 1 < maxPagesToShow) {
      const delta = maxPagesToShow - (endPage - startPage + 1);
      startPage = Math.max(2, startPage - delta);
    }

    if (endPage - startPage + 1 < maxPagesToShow) {
      const delta = maxPagesToShow - (endPage - startPage + 1);
      endPage = Math.min(totalPages - 1, endPage + delta);
    }

    pageArray.push(1);

    if (startPage > 2) pageArray.push('dots');
    for (let i = startPage; i <= endPage; i++) {
      pageArray.push(i);
    }

    if (endPage < totalPages - 1) pageArray.push('dots');
    if (totalPages > 1) pageArray.push(totalPages);
    return pageArray;
  }, [totalPages, maxVisiblePages, displayPage]);

  return { pages, totalPages };
}
