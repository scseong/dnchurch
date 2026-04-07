'use client';

import { useState, useCallback } from 'react';
import NoticeTable from '@/app/(with-navbar)/news/notice/_component/NoticeTable';
import NoticeDrawer from '@/app/(with-navbar)/news/notice/_component/NoticeDrawer';
import Pagination from '@/components/layout/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/constants/notice';
import type { NoticeType } from '@/types/notice';

type Props = {
  data: NoticeType[];
  total: number;
  currentPage: number;
};

export default function NoticeListClient({ data, total, currentPage }: Props) {
  const [drawerNotice, setDrawerNotice] = useState<NoticeType | null>(null);

  const handleRowClick = useCallback((notice: NoticeType) => {
    setDrawerNotice(notice);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerNotice(null);
  }, []);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!drawerNotice) return;
      const currentIndex = data.findIndex((n) => n.id === drawerNotice.id);
      const nextIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex >= 0 && nextIndex < data.length) {
        setDrawerNotice(data[nextIndex]);
      }
    },
    [data, drawerNotice]
  );

  const currentIndex = drawerNotice ? data.findIndex((n) => n.id === drawerNotice.id) : -1;

  return (
    <>
      <NoticeTable data={data} total={total} currentPage={currentPage} onRowClick={handleRowClick} />
      <Pagination
        totalCount={total}
        currentPage={currentPage}
        pageSize={DEFAULT_PAGE_SIZE}
        maxVisiblePages={5}
      />
      <NoticeDrawer
        notice={drawerNotice}
        onClose={handleCloseDrawer}
        onNavigate={handleNavigate}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < data.length - 1}
      />
    </>
  );
}
