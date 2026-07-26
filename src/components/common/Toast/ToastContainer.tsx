'use client';

import { useToastStore } from '@/store/toast.store';
import Toast from './Toast';
import styles from './ToastContainer.module.scss';

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-label="알림">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
