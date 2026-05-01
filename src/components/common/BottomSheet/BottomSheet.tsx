'use client';

import { PropsWithChildren, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import useScrollLock from '@/hooks/useScrollLock';
import styles from './BottomSheet.module.scss';

type Props = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title: string;
}>;

export default function BottomSheet({ open, onClose, title, children }: Props) {
  useScrollLock(open);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className={clsx(styles.overlay, open && styles.open)}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className={clsx(styles.sheet, open && styles.open)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.handle} aria-hidden="true" />
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.close_btn}
            onClick={onClose}
            aria-label="닫기"
          >
            <IoClose />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
