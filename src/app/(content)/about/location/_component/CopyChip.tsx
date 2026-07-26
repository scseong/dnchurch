'use client';

import { useToastStore } from '@/store/toast.store';
import styles from '../page.module.scss';

type Props = {
  value: string;
  toast: string;
  children: React.ReactNode;
};

export default function CopyChip({ value, toast, children }: Props) {
  const success = useToastStore((state) => state.success);
  const error = useToastStore((state) => state.error);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      success(toast);
    } catch {
      error('복사에 실패했습니다');
    }
  };

  return (
    <button type="button" className={styles.chip} onClick={handleCopy}>
      {children}
    </button>
  );
}
