import Link from 'next/link';
import PageHeader from '@/components/admin/layout/PageHeader';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="404"
        title="페이지를 찾을 수 없습니다"
        description="요청하신 관리자 페이지가 없거나 주소가 변경되었습니다."
      />
      <Link href="/admin" className={styles.link}>
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
