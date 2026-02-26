'use client';

import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import type { AnnouncementWithProfile } from '@/apis/announcement';
import { formattedDate } from '@/utils/date';
import styles from './AnnouncementTable.module.scss';

const columnHelper = createColumnHelper<AnnouncementWithProfile>();

export default function AnnouncementTable({
  posts,
  count
}: {
  posts: AnnouncementWithProfile[] | null;
  count: number;
}) {
  const columns = [
    columnHelper.accessor('id', {
      id: '번호',
      header: (info) => info.column.id,
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('title', {
      id: '제목',
      header: (info) => info.column.id,
      cell: (info) => (
        <Link href={`/news/announcement/${info.row.original.id}`}>{info.getValue()}</Link>
      )
    }),
    columnHelper.accessor('created_at', {
      id: '등록일',
      header: (info) => info.column.id,
      cell: (info) => formattedDate(info.getValue(), 'YY.MM.DD')
    }),
    columnHelper.accessor('profiles.user_name', {
      id: '작성자',
      header: (info) => info.column.id,
      cell: (info) => info.getValue()
    })
  ];

  const table = useReactTable({
    data: posts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: count
  });

  return (
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
  );
}
