'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ScheduleType } from '../page';
import styles from './WorshipSchedule.module.scss';

const columnHelper = createColumnHelper<ScheduleType[0]>();
const columns = [
  columnHelper.accessor('worship', {
    id: '구분',
    header: (info) => info.column.id,
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('time', {
    id: '시간',
    header: (info) => info.column.id,
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('location', {
    id: '장소',
    header: (info) => info.column.id,
    cell: (info) => info.getValue()
  })
];

export default function WorshipSchedule({ schedule }: { schedule: ScheduleType }) {
  const table = useReactTable({
    data: schedule,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  });

  return (
    <table className={styles.table}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className={styles.thead}>
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
