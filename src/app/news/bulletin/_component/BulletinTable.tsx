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

type BulletinTableProps = {
  data: BulletinType[];
};

const columnHelper = createColumnHelper<BulletinType>();

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

export default function BulletinTable({ data }: BulletinTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
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
