'use client';

import clsx from 'clsx';
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlineFilm,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineTrash
} from 'react-icons/hi';
import { formattedDate, formatRelativeTime } from '@/utils/date';
import { MOCK_ROWS, SERMON_STATUS_LABEL } from './mockData';
import Pagination from './Pagination';
import styles from '../table.module.scss';

export type SortKey = 'title' | 'date' | 'updated';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

interface ColumnDef {
  id: string;
  key: SortKey | null;
  label: string;
  srLabel?: string;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'thumb', key: null, label: '', srLabel: '썸네일', className: styles.col_thumb },
  { id: 'title', key: 'title', label: '제목' },
  { id: 'status', key: null, label: '상태', className: styles.col_status },
  { id: 'date', key: 'date', label: '설교일', className: styles.col_date },
  { id: 'preacher', key: null, label: '설교자', className: styles.col_preacher },
  { id: 'series', key: null, label: '시리즈', className: styles.col_series },
  { id: 'updated', key: 'updated', label: '수정', className: styles.col_updated },
  { id: 'actions', key: null, label: '액션', className: styles.col_actions }
];

interface SermonTableProps {
  sort: SortState | null;
  onSortChange: (key: SortKey) => void;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function SermonTable({
  sort,
  onSortChange,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}: SermonTableProps) {
  const renderSortIcon = (columnKey: SortKey) => {
    const isActive = sort?.key === columnKey;
    const isAsc = isActive && sort.direction === 'asc';
    const isDesc = isActive && sort.direction === 'desc';
    return (
      <span className={styles.sort_icon}>
        <HiChevronUp
          className={clsx(
            styles.sort_icon_chevron,
            isAsc && styles.sort_icon_chevron_active
          )}
          aria-hidden
        />
        <HiChevronDown
          className={clsx(
            styles.sort_icon_chevron,
            isDesc && styles.sort_icon_chevron_active
          )}
          aria-hidden
        />
      </span>
    );
  };

  return (
    <div className={styles.table_wrap}>
        <div className={styles.table_scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map((column) => {
                  const isSortable = column.key !== null;
                  const ariaSort =
                    isSortable && sort?.key === column.key
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined;
                  return (
                    <th
                      key={column.id}
                      className={clsx(column.className, isSortable && styles.sortable)}
                      onClick={
                        isSortable && column.key
                          ? () => onSortChange(column.key as SortKey)
                          : undefined
                      }
                      aria-sort={ariaSort}
                    >
                      {column.srLabel ? (
                        <span className={styles.sr_only}>{column.srLabel}</span>
                      ) : (
                        column.label
                      )}
                      {isSortable && column.key && renderSortIcon(column.key)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length}>
                    <div className={styles.empty}>
                      <span className={styles.empty_icon}>
                        <HiOutlineSearch aria-hidden />
                      </span>
                      <p className={styles.empty_title}>결과가 없습니다</p>
                      <p className={styles.empty_desc}>검색어나 필터 조건을 바꿔보세요</p>
                    </div>
                  </td>
                </tr>
              ) : (
                MOCK_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.col_thumb}>
                      <div className={styles.row_thumb}>
                        <HiOutlineFilm aria-hidden />
                        {row.duration && (
                          <span className={styles.thumb_duration}>{row.duration}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.title_cell}>
                      <p className={styles.row_title}>{row.title}</p>
                      <p
                        className={clsx(
                          styles.row_scripture,
                          !row.scripture && styles.none
                        )}
                      >
                        {row.scripture ?? '성경 구절 미입력'}
                      </p>
                    </td>
                    <td className={styles.col_status}>
                      <span className={clsx(styles.status_pill, styles[row.status])}>
                        <span className={styles.status_dot} aria-hidden />
                        {SERMON_STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className={styles.col_date}>
                      {formattedDate(row.date, 'YYYY.MM.DD')}
                    </td>
                    <td className={styles.col_preacher}>{row.preacher.name}</td>
                    <td className={styles.col_series}>
                      {row.series ? (
                        <span className={styles.series_pill}>{row.series.title}</span>
                      ) : (
                        <span className={styles.single_pill}>단독</span>
                      )}
                    </td>
                    <td className={styles.col_updated}>
                      {formatRelativeTime(row.updatedAt)}
                    </td>
                    <td className={styles.col_actions}>
                      <div
                        className={styles.row_actions}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={styles.action_button}
                          title="수정"
                          aria-label={`${row.title} 수정`}
                        >
                          <HiOutlinePencil aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={clsx(styles.action_button, styles.danger)}
                          title="삭제"
                          aria-label={`${row.title} 삭제`}
                        >
                          <HiOutlineTrash aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
    </div>
  );
}
