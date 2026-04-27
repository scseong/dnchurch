'use client';

import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import styles from './index.module.scss';

export default function SermonListPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        eyebrow="설교"
        title="설교 관리"
        description="등록된 설교를 검색하고 발행 상태를 관리합니다"
        actions={[
          {
            label: '새 설교 등록',
            variant: 'pri',
            icon: <HiPlus />,
            onClick: () => router.push('/admin/sermons/new')
          }
        ]}
      />
      <div className={styles.wrapper}>
        <p className={styles.placeholder}>설교 목록 테이블이 여기에 들어갑니다</p>
      </div>
    </>
  );
}
