'use client';

import clsx from 'clsx';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineFilm,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';
import { formattedDate, formatRelativeTime } from '@/utils/date';
import { MOCK_ROWS, SERMON_STATUS_LABEL } from './mockData';
import styles from '../table.module.scss';

interface MobileCardListProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function MobileCardList({
  total,
  currentPage,
  pageSize,
  onPageChange
}: MobileCardListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <>
      <div className={styles.mobile_list}>
        {MOCK_ROWS.map((row) => (
          <article key={row.id} className={styles.mobile_card}>
            <div className={styles.mobile_card_top}>
              <div className={clsx(styles.row_thumb, styles.mobile_thumb)}>
                <HiOutlineFilm aria-hidden />
                {row.duration && (
                  <span className={styles.thumb_duration}>{row.duration}</span>
                )}
              </div>
              <div className={styles.mobile_card_info}>
                <p className={styles.mobile_card_title}>{row.title}</p>
                <p className={styles.mobile_card_meta}>
                  {formattedDate(row.date, 'YYYY.MM.DD')} · {row.preacher.name}
                </p>
                <div className={styles.mobile_card_tags}>
                  <span className={clsx(styles.status_pill, styles[row.status])}>
                    <span className={styles.status_dot} aria-hidden />
                    {SERMON_STATUS_LABEL[row.status]}
                  </span>
                  {row.series ? (
                    <span className={styles.series_pill}>{row.series.title}</span>
                  ) : (
                    <span className={styles.single_pill}>단독</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.mobile_card_bottom}>
              <div className={styles.mobile_card_stats}>
                {formatRelativeTime(row.updatedAt)}
              </div>
              <div
                className={styles.mobile_card_actions}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.action_button}
                  aria-label={`${row.title} 수정`}
                >
                  <HiOutlinePencil aria-hidden />
                </button>
                <button
                  type="button"
                  className={clsx(styles.action_button, styles.danger)}
                  aria-label={`${row.title} 삭제`}
                >
                  <HiOutlineTrash aria-hidden />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
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
    </>
  );
}
