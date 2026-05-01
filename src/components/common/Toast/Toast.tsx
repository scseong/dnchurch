'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { HiX } from 'react-icons/hi';
import type { ToastItem } from '@/store/toast.store';
import styles from './Toast.module.scss';

const DURATION: Record<ToastItem['type'], number> = {
  success: 2500,
  info: 2500,
  error: 4000
};

interface Props extends ToastItem {
  onDismiss: (id: string) => void;
}

export default function Toast({ id, message, type, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), DURATION[type]);
    return () => clearTimeout(timer);
  }, [id, type, onDismiss]);

  return (
    <div
      className={clsx(styles.toast, styles[type])}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span>{message}</span>
      <button
        type="button"
        className={styles.close}
        aria-label="닫기"
        onClick={() => onDismiss(id)}
      >
        <HiX />
      </button>
    </div>
  );
}
