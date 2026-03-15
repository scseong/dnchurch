'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef
} from '@tanstack/react-table';
import {
  StatusBadge,
  CategoryBadge,
  PinIcon
} from '@/app/(with-navbar)/news/notice/_component/table';
import { formattedDate } from '@/utils/date';
import { globalSearchFilter } from '@/utils/notice';
import { DEFAULT_PAGE_SIZE } from '@/constants/notice';
import type { NoticeType, NoticeCategory } from '@/types/notice';
import styles from './NoticeTable.module.scss';
import Pagination from '@/components/layout/Pagination';

type Props = {
  data: NoticeType[];
  total: number;
  currentPage: number;
};

export default function NoticeTable({ data, total, currentPage }: Props) {
  const columnHelper = createColumnHelper<NoticeType>();
  const columns = useMemo<ColumnDef<NoticeType, any>[]>(
    () => [
      columnHelper.display({
        id: 'index',
        header: '번호',
        size: 52,
        cell: ({ row }) => <span>{row.original.is_pinned ? <PinIcon /> : row.index + 1}</span>
      }),
      columnHelper.accessor('category', {
        header: '카테고리',
        size: 88,
        enableSorting: false,
        cell: ({ getValue }) => <CategoryBadge category={getValue()} />
      }),
      columnHelper.accessor('title', {
        header: '제목',
        size: 400,
        enableSorting: false,
        cell: ({ getValue, row }) => (
          <Link href={`/news/notice/${row.original.id}`}>
            <span>
              <span>{getValue()}</span>
            </span>
          </Link>
        )
      }),
      columnHelper.accessor('view_count', {
        header: '조회',
        size: 64,
        enableSorting: false,
        cell: ({ getValue }) => <span>{getValue().toLocaleString()}</span>
      }),
      columnHelper.accessor('created_at', {
        header: '등록일',
        size: 100,
        enableSorting: false,
        cell: ({ getValue }) => <span>{formattedDate(getValue(), 'YY.MM.DD')}</span>
      })
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    globalFilterFn: globalSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <table className={styles.table}>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th key={header.id} style={{ width: header.column.getSize() }}>
                {header.isPlaceholder ? null : (
                  <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>등록된 공지사항이 없습니다.</td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      <Pagination totalCount={total} currentPage={currentPage} pageSize={10} maxVisiblePages={5} />
    </table>
  );
}
