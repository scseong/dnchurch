'use client';

import clsx from 'clsx';
import {
  HiChevronDown,
  HiChevronUp,
  HiOutlineFilm,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';
import { formattedDate, formatRelativeTime } from '@/utils/date';
import {
  deriveSermonStatus,
  SERMON_STATUS_LABEL,
  type AdminSermon,
  type AdminSermonSortKey,
  type AdminSermonSortState
} from '@/types/sermon';
import MobileCardList from './MobileCardList';
import Pagination from './Pagination';
import SermonEmptyState from './SermonEmptyState';
import styles from '../table.module.scss';

interface ColumnDef {
  id: string;
  key: AdminSermonSortKey | null;
  label: string;
  srLabel?: string;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'thumb', key: null, label: '', srLabel: '썸네일', className: styles.col_thumb },
  { id: 'title', key: 'title', label: '제목' },
  { id: 'status', key: null, label: '상태', className: styles.col_status },
  { id: 'date', key: 'sermon_date', label: '설교일', className: styles.col_date },
  { id: 'preacher', key: null, label: '설교자', className: styles.col_preacher },
  { id: 'series', key: null, label: '시리즈', className: styles.col_series },
  { id: 'updated', key: 'updated_at', label: '수정', className: styles.col_updated },
  { id: 'actions', key: null, label: '액션', className: styles.col_actions }
];

interface SermonTableProps {
  sermons: AdminSermon[];
  sort: AdminSermonSortState | null;
  onSortChange: (key: AdminSermonSortKey) => void;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (sermon: AdminSermon) => void;
  onDelete: (sermon: AdminSermon) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export default function SermonTable({
  sermons,
  sort,
  onSortChange,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  hasActiveFilters,
  onClearFilters,
  onCreateNew,
  isLoading = false
}: SermonTableProps) {
  const renderSortIcon = (columnKey: AdminSermonSortKey) => {
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
    <>
      <div
        className={clsx(styles.table_wrap, isLoading && styles.is_loading)}
        aria-busy={isLoading || undefined}
      >
        {isLoading && <div className={styles.loading_overlay} aria-hidden />}
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
                          ? () => onSortChange(column.key as AdminSermonSortKey)
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
              {sermons.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length}>
                    <SermonEmptyState
                      hasActiveFilters={hasActiveFilters}
                      onClearFilters={onClearFilters}
                      onCreateNew={onCreateNew}
                    />
                  </td>
                </tr>
              ) : (
                sermons.map((sermon) => {
                  const status = deriveSermonStatus(sermon);
                  return (
                    <tr key={sermon.id} onClick={() => onEdit(sermon)}>
                      <td className={styles.col_thumb}>
                        <div className={styles.row_thumb}>
                          <HiOutlineFilm aria-hidden />
                          {sermon.duration && (
                            <span className={styles.thumb_duration}>{sermon.duration}</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.title_cell}>
                        <p className={styles.row_title}>{sermon.title}</p>
                        <p
                          className={clsx(
                            styles.row_scripture,
                            !sermon.scripture && styles.none
                          )}
                        >
                          {sermon.scripture ?? '성경 구절 미입력'}
                        </p>
                      </td>
                      <td className={styles.col_status}>
                        <span className={clsx(styles.status_pill, styles[status])}>
                          <span className={styles.status_dot} aria-hidden />
                          {SERMON_STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className={styles.col_date}>
                        {formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}
                      </td>
                      <td className={styles.col_preacher}>{sermon.preacher.name}</td>
                      <td className={styles.col_series}>
                        {sermon.sermon_series ? (
                          <span className={styles.series_pill}>
                            {sermon.sermon_series.title}
                          </span>
                        ) : (
                          <span className={styles.single_pill}>단독</span>
                        )}
                      </td>
                      <td className={styles.col_updated}>
                        {formatRelativeTime(sermon.updated_at)}
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
                            aria-label={`${sermon.title} 수정`}
                            onClick={() => onEdit(sermon)}
                          >
                            <HiOutlinePencil aria-hidden />
                          </button>
                          <button
                            type="button"
                            className={clsx(styles.action_button, styles.danger)}
                            title="삭제"
                            aria-label={`${sermon.title} 삭제`}
                            onClick={() => onDelete(sermon)}
                          >
                            <HiOutlineTrash aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
      <MobileCardList
        sermons={sermons}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onEdit={onEdit}
        onDelete={onDelete}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onCreateNew={onCreateNew}
        isLoading={isLoading}
      />
    </>
  );
}
