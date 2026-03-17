'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoCheckmark } from 'react-icons/io5';
import useScrollLock from '@/hooks/useScrollLock';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './CategoryBottomSheet.module.scss';

type Props = {
  isOpen: boolean;
  currentCategory?: NoticeCategory;
  onSelect: (category: string) => void;
  onClose: () => void;
};

export default function CategoryBottomSheet({
  isOpen,
  currentCategory,
  onSelect,
  onClose
}: Props) {
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

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={clsx(styles.overlay, isOpen && styles.open)}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div
        className={clsx(styles.sheet, isOpen && styles.open)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="분류 선택"
        aria-modal="true"
      >
        <div className={styles.handle} />
        <ul className={styles.option_list}>
          <li>
            <button
              type="button"
              className={clsx(styles.option, !currentCategory && styles.selected)}
              onClick={() => onSelect('')}
            >
              <span>전체 분류</span>
              {!currentCategory && <IoCheckmark className={styles.check} aria-hidden="true" />}
            </button>
          </li>
          {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                className={clsx(styles.option, currentCategory === key && styles.selected)}
                onClick={() => onSelect(key)}
              >
                <span>{label}</span>
                {currentCategory === key && (
                  <IoCheckmark className={styles.check} aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
