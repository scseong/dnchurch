'use client';

import clsx from 'clsx';
import { IoEyeOutline } from 'react-icons/io5';
import { BsPinAngleFill, BsPaperclip } from 'react-icons/bs';
import { NOTICE_CATEGORIES, DEFAULT_PAGE_SIZE, NEW_BADGE_DAYS } from '@/constants/notice';
import { formattedDate } from '@/utils/date';
import type { NoticeType } from '@/types/notice';
import styles from './NoticeTable.module.scss';
import IconWrap from '@/components/common/IconWrap';

type Props = {
  data: NoticeType[];
  total: number;
  currentPage: number;
  onRowClick: (notice: NoticeType) => void;
};

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

function getFileExt(url: string): string {
  return url.match(/\.(\w+)$/)?.[1].toUpperCase() ?? '파일';
}

export default function NoticeTable({ data, total, currentPage, onRowClick }: Props) {
  if (data.length === 0) {
    return <div className={styles.empty}>등록된 공지사항이 없습니다.</div>;
  }

  return (
    <>
      {/* ── PC Table ── */}
      <table className={styles.table}>
        <thead>
          <tr>
            {['분류', '제목', '등록일', '조회'].map((h) => (
              <th key={h} className={styles.sr_only}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((notice, index) => {
            const rowNumber = total - (currentPage - 1) * DEFAULT_PAGE_SIZE - index;
            const isUrgent = notice.category === '긴급';

            return (
              <tr
                key={notice.id}
                className={clsx(
                  styles.row,
                  notice.is_pinned && styles.pinned,
                  isUrgent && styles.urgent_row
                )}
                onClick={() => onRowClick(notice)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onRowClick(notice)}
                role="button"
                aria-label={notice.title}
              >
                <td className={styles.col_pin}>
                  {notice.is_pinned ? (
                    <IconWrap
                      Icon={BsPinAngleFill}
                      className={styles.pin_icon}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className={styles.row_number}>{rowNumber}</span>
                  )}
                </td>
                <td className={clsx(styles.col_category, isUrgent && styles.urgent)}>
                  {NOTICE_CATEGORIES[notice.category]}
                </td>
                <td className={styles.col_title}>
                  <div className={styles.title_wrap}>
                    <span
                      className={clsx(
                        styles.title_text,
                        notice.is_pinned && styles.pinned_title,
                        isUrgent && styles.urgent
                      )}
                    >
                      {notice.title}
                    </span>
                    <span className={styles.inline_badges}>
                      {notice.attachment_url && (
                        <BsPaperclip className={styles.clip_icon} aria-hidden="true" />
                      )}
                      {isNew(notice.created_at) && <span className={styles.badge_new}>NEW</span>}
                    </span>
                  </div>
                </td>
                <td className={styles.col_date}>{formattedDate(notice.created_at, 'YY.MM.DD')}</td>
                <td className={styles.col_views}>
                  <span className={styles.views_inner}>
                    <IoEyeOutline aria-hidden="true" />
                    <span>{notice.view_count.toLocaleString()}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Mobile List ── */}
      <div className={styles.mobile_list}>
        {data.map((notice) => {
          const isUrgent = notice.category === '긴급';

          return (
            <button
              key={notice.id}
              type="button"
              className={clsx(
                styles.mobile_row,
                notice.is_pinned && styles.pinned,
                isUrgent && styles.urgent_row
              )}
              onClick={() => onRowClick(notice)}
            >
              <div className={styles.mobile_top}>
                <div className={styles.mobile_meta}>
                  {notice.is_pinned && (
                    <BsPinAngleFill className={styles.pin_icon} aria-hidden="true" />
                  )}
                  <span className={clsx(styles.mobile_category, isUrgent && styles.urgent)}>
                    {NOTICE_CATEGORIES[notice.category]}
                  </span>
                  {isNew(notice.created_at) && <span className={styles.badge_new}>NEW</span>}
                </div>
                <span className={styles.mobile_date}>
                  {formattedDate(notice.created_at, 'YY.MM.DD')}
                </span>
              </div>
              <p
                className={clsx(
                  styles.mobile_title,
                  notice.is_pinned && styles.pinned_title,
                  isUrgent && styles.urgent
                )}
              >
                {notice.title}
              </p>
              <div className={styles.mobile_bottom}>
                <div className={styles.mobile_files}>
                  {notice.attachment_url && (
                    <span className={styles.badge_file}>{getFileExt(notice.attachment_url)}</span>
                  )}
                </div>
                <span className={styles.mobile_views}>
                  <IoEyeOutline aria-hidden="true" />
                  {notice.view_count.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
