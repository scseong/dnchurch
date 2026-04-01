'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoCheckmark } from 'react-icons/io5';
import useScrollLock from '@/hooks/useScrollLock';
import { NOTICE_SORT_OPTIONS } from '@/constants/notice';
import type { NoticeSortOption } from '@/constants/notice';
import styles from './SortBottomSheet.module.scss';

type Props = {
  isOpen: boolean;
  currentSort: NoticeSortOption;
  onSelect: (sort: NoticeSortOption) => void;
  onClose: () => void;
};

export default function SortBottomSheet({ isOpen, currentSort, onSelect, onClose }: Props) {
  useScrollLock(isOpen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className={clsx(styles.overlay, isOpen && styles.open)} onClick={onClose}>
      <div
        className={clsx(styles.sheet, isOpen && styles.open)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="정렬 선택"
      >
        <div className={styles.handle} />
        <ul className={styles.option_list}>
          {Object.entries(NOTICE_SORT_OPTIONS).map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                className={clsx(styles.option, currentSort === key && styles.selected)}
                onClick={() => onSelect(key as NoticeSortOption)}
              >
                <span>{label}</span>
                {currentSort === key && <IoCheckmark className={styles.check} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
