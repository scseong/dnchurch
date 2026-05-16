'use client';

import { useEffect } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { LayoutContainer } from '@/components/layout';
import styles from './error.module.scss';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SermonsError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[sermons]', error);
  }, [error]);

  return (
    <LayoutContainer>
      <div className={styles.wrapper} role="alert">
        <span className={styles.icon} aria-hidden>
          <HiOutlineExclamationCircle />
        </span>
        <p className={styles.title}>설교 정보를 불러오지 못했습니다</p>
        <p className={styles.description}>
          잠시 후 다시 시도하거나 새로고침해 주세요.
        </p>
        <button type="button" className={styles.retry} onClick={reset}>
          다시 시도
        </button>
      </div>
    </LayoutContainer>
  );
}
