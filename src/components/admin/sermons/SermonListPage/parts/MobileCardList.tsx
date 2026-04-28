'use client';

import clsx from 'clsx';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFilm,
  HiOutlineInbox,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash
} from 'react-icons/hi';
import { formattedDate, formatRelativeTime } from '@/utils/date';
import {
  deriveSermonStatus,
  SERMON_STATUS_LABEL,
  type AdminSermon
} from '@/types/sermon';
import styles from '../table.module.scss';

interface MobileCardListProps {
  sermons: AdminSermon[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (sermon: AdminSermon) => void;
  onDelete: (sermon: AdminSermon) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export default function MobileCardList({
  sermons,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  hasActiveFilters,
  onClearFilters,
  onCreateNew,
  isLoading = false
}: MobileCardListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;
  const isEmpty = sermons.length === 0;

  return (
    <>
      <div
        className={clsx(styles.mobile_list, isLoading && styles.is_loading)}
        aria-busy={isLoading || undefined}
      >
        {isLoading && <div className={styles.loading_overlay} aria-hidden />}
        {isEmpty &&
          (hasActiveFilters ? (
            <div className={styles.empty}>
              <span className={styles.empty_icon}>
                <HiOutlineSearch aria-hidden />
              </span>
              <p className={styles.empty_title}>결과가 없습니다</p>
              <p className={styles.empty_desc}>검색어나 필터 조건을 바꿔보세요</p>
              <button
                type="button"
                className={styles.empty_action}
                onClick={onClearFilters}
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.empty_icon}>
                <HiOutlineInbox aria-hidden />
              </span>
              <p className={styles.empty_title}>아직 등록된 설교가 없습니다</p>
              <p className={styles.empty_desc}>첫 설교를 등록해보세요</p>
              <button
                type="button"
                className={clsx(styles.empty_action, styles.primary)}
                onClick={onCreateNew}
              >
                <HiOutlinePlus aria-hidden />첫 설교 등록하기
              </button>
            </div>
          ))}
        {sermons.map((sermon) => {
          const status = deriveSermonStatus(sermon);
          return (
            <article
              key={sermon.id}
              className={styles.mobile_card}
              onClick={() => onEdit(sermon)}
            >
              <div className={styles.mobile_card_top}>
                <div className={clsx(styles.row_thumb, styles.mobile_thumb)}>
                  <HiOutlineFilm aria-hidden />
                  {sermon.duration && (
                    <span className={styles.thumb_duration}>{sermon.duration}</span>
                  )}
                </div>
                <div className={styles.mobile_card_info}>
                  <p className={styles.mobile_card_title}>{sermon.title}</p>
                  <p className={styles.mobile_card_meta}>
                    {formattedDate(sermon.sermon_date, 'YYYY.MM.DD')} · {sermon.preacher.name}
                  </p>
                  <div className={styles.mobile_card_tags}>
                    <span className={clsx(styles.status_pill, styles[status])}>
                      <span className={styles.status_dot} aria-hidden />
                      {SERMON_STATUS_LABEL[status]}
                    </span>
                    {sermon.sermon_series ? (
                      <span className={styles.series_pill}>{sermon.sermon_series.title}</span>
                    ) : (
                      <span className={styles.single_pill}>단독</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.mobile_card_bottom}>
                <div className={styles.mobile_card_stats}>
                  {formatRelativeTime(sermon.updated_at)}
                </div>
                <div
                  className={styles.mobile_card_actions}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.action_button}
                    aria-label={`${sermon.title} 수정`}
                    onClick={() => onEdit(sermon)}
                  >
                    <HiOutlinePencil aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.action_button, styles.danger)}
                    aria-label={`${sermon.title} 삭제`}
                    onClick={() => onDelete(sermon)}
                  >
                    <HiOutlineTrash aria-hidden />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!isEmpty && (
        <div className={styles.mobile_pagination}>
          <button
            type="button"
            className={styles.page_button}
            disabled={isFirst}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="이전 페이지"
          >
            <HiChevronLeft aria-hidden />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.page_button}
            disabled={isLast}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="다음 페이지"
          >
            <HiChevronRight aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
