'use client';

import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import useQueryParams from '@/hooks/useQueryParams';
import { ITEM_PER_PAGE } from '@/shared/constants/bulletin';
import type { BulletinType } from '@/shared/types/types';
import styles from './BulletinTable.module.scss';
import Pagination from '@/app/_component/layout/common/Pagination';

const columnHelper = createColumnHelper<BulletinType>();

type BulletinTableProps = {
  bulletins: BulletinType[] | null;
  total: number;
  currentPage: number;
};

export default function BulletinTable({ bulletins, total, currentPage }: BulletinTableProps) {
  const columns = [
    columnHelper.accessor('id', {
      id: '번호',
      header: (info) => info.column.id,
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('title', {
      id: '제목',
      header: (info) => info.column.id,
      cell: (info) => <Link href={`/news/bulletin/${info.row.original.id}`}>{info.getValue()}</Link>
    })
  ];

  const table = useReactTable({
    data: bulletins || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total
  });

  const totalPage = total ? Math.ceil(total / ITEM_PER_PAGE) : 0;
  const currentGroup = Math.floor((currentPage - 1) / ITEM_PER_PAGE);
  const startPage = currentGroup * ITEM_PER_PAGE + 1;
  const endPage = Math.min(startPage + ITEM_PER_PAGE - 1, totalPage);

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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination totalCount={total} pageSize={10} maxVisiblePages={10} />
    </>
  );
}
