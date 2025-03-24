'use client';

import { BulletinType } from '@/shared/types/types';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import styles from './BulletinTable.module.scss';
import Link from 'next/link';
import useQueryParams from '@/hooks/useQueryParams';
import useIsMobile from '@/hooks/useIsMobile';

const columnHelper = createColumnHelper<BulletinType>();

type BulletinTableProps = {
  bulletins: BulletinType[];
  count: number;
  currentPage: string;
};

export default function BulletinTable({ bulletins, count, currentPage }: BulletinTableProps) {
  const isMobile = useIsMobile();
  const { createPageURL } = useQueryParams();
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
    data: bulletins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: count
  });

  const ITEMS_PER_PAGE = 10;
  const totalPage = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;
  const currentGroup = Math.floor((parseInt(currentPage) - 1) / ITEMS_PER_PAGE);
  const startPage = currentGroup * ITEMS_PER_PAGE + 1;
  const endPage = Math.min(startPage + ITEMS_PER_PAGE - 1, totalPage);

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
      <div>
        <ul className={styles.pagination}>
          {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map(
            // TODO: 알고리즘 수정, Prev, Next 버튼 추가
            (number) => {
              if (number > endPage) return null;
              return (
                <li key={number}>
                  <Link
                    href={createPageURL('page', number)}
                    className={number === parseInt(currentPage) ? styles.active : ''}
                    scroll={false}
                  >
                    {number}
                  </Link>
                </li>
              );
            }
          )}
        </ul>
      </div>
    </>
  );
}
