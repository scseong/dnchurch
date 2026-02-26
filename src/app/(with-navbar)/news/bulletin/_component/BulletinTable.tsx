'use client';

import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import Pagination from '@/app/_component/layout/common/Pagination';
import type { BulletinType } from '@/types/common';
import styles from './BulletinTable.module.scss';
import { ITEM_PER_PAGE } from '@/constants/bulletin';

type BulletinTableProps = {
  bulletins: BulletinType[] | null;
  total: number;
  currentPage: number;
};

const columnHelper = createColumnHelper<BulletinType>();

export default function BulletinTable({ bulletins, total, currentPage }: BulletinTableProps) {
  const columns = [
    columnHelper.accessor('id', {
      id: '번호',
      header: (info) => info.column.id,
      cell: (info) => total - (currentPage - 1) * ITEM_PER_PAGE - info.row.index
    }),
    columnHelper.accessor('title', {
      id: '제목',
      header: (info) => info.column.id,
      cell: (info) => (
        <Link href={`/news/bulletin/${info.row.original.id}`} prefetch={false}>
          {info.getValue()}
        </Link>
      )
    })
  ];

  const table = useReactTable({
    data: bulletins || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total
  });

  return (
    <>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>주보가 존재하지 않습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination totalCount={total} currentPage={currentPage} pageSize={10} maxVisiblePages={5} />
    </>
  );
}
