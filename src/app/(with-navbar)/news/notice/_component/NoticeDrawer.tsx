'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoCloseOutline, IoChevronBack, IoChevronForward, IoEyeOutline } from 'react-icons/io5';
import { BsPaperclip } from 'react-icons/bs';
import useScrollLock from '@/hooks/useScrollLock';
import { NOTICE_CATEGORIES, NEW_BADGE_DAYS } from '@/constants/notice';
import { formattedDate } from '@/utils/date';
import type { NoticeType } from '@/types/notice';
import styles from './NoticeDrawer.module.scss';

type Props = {
  notice: NoticeType | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
};

export default function NoticeDrawer({ notice, onClose, onNavigate, hasPrev, hasNext }: Props) {
  const isOpen = notice !== null;
  useScrollLock(isOpen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || typeof window === 'undefined') return null;

  const isNew =
    Date.now() - new Date(notice.created_at).getTime() < NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
  const isUrgent = notice.category === '긴급';

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={notice.title}
      >
        {/* 모바일 핸들 */}
        <div className={styles.handle} aria-hidden="true" />

        {/* 헤더 */}
        <header className={styles.header}>
          <div className={styles.header_top}>
            <div className={styles.header_meta}>
              <span className={clsx(styles.category, isUrgent && styles.urgent)}>
                {NOTICE_CATEGORIES[notice.category]}
              </span>
              {isNew && <span className={styles.badge_new}>NEW</span>}
            </div>
            <button
              type="button"
              className={styles.close_btn}
              onClick={onClose}
              aria-label="닫기"
            >
              <IoCloseOutline aria-hidden="true" />
            </button>
          </div>
          <h2 className={clsx(styles.title, isUrgent && styles.urgent)}>{notice.title}</h2>
          <div className={styles.header_info}>
            <time>{formattedDate(notice.created_at, 'YYYY.MM.DD')}</time>
            <span className={styles.views}>
              <IoEyeOutline aria-hidden="true" />
              {notice.view_count.toLocaleString()}
            </span>
          </div>
        </header>

        {/* 본문 */}
        <div className={styles.content}>
          <p className={styles.content_body}>{notice.content}</p>
        </div>

        {/* 첨부파일 */}
        {notice.attachment_url && (
          <div className={styles.attachment}>
            <BsPaperclip aria-hidden="true" />
            <a
              href={notice.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachment_link}
            >
              첨부파일 다운로드
            </a>
          </div>
        )}

        {/* 이전/다음 */}
        <footer className={styles.nav}>
          <button
            type="button"
            className={clsx(styles.nav_btn, !hasPrev && styles.disabled)}
            onClick={() => onNavigate('prev')}
            disabled={!hasPrev}
            aria-label="이전 글"
          >
            <IoChevronBack aria-hidden="true" />
            <span>이전 글</span>
          </button>
          <button
            type="button"
            className={clsx(styles.nav_btn, !hasNext && styles.disabled)}
            onClick={() => onNavigate('next')}
            disabled={!hasNext}
            aria-label="다음 글"
          >
            <span>다음 글</span>
            <IoChevronForward aria-hidden="true" />
          </button>
        </footer>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
