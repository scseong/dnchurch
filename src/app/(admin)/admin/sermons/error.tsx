'use client';

import { useEffect } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import styles from './error.module.scss';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SermonAdminListError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[admin/sermons]', error);
  }, [error]);

  return (
    <>
      <PageHeader
        eyebrow="설교"
        title="설교 관리"
        description="등록된 설교를 검색하고 발행 상태를 관리합니다"
      />
      <div className={styles.wrapper} role="alert">
        <span className={styles.icon} aria-hidden>
          <HiOutlineExclamationCircle />
        </span>
        <p className={styles.title}>목록을 불러오는 중 문제가 발생했습니다</p>
        <p className={styles.description}>
          잠시 후 다시 시도하거나 새로고침해 주세요.
        </p>
        <button type="button" className={styles.retry} onClick={reset}>
          다시 시도
        </button>
      </div>
    </>
  );
}
