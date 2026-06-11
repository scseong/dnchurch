import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>설교를 찾을 수 없습니다</h2>
      <p className={styles.description}>
        요청하신 설교가 삭제되었거나 주소가 올바르지 않습니다.
      </p>
      <Link href="/sermons" className={styles.list_link}>
        전체 설교 보기
      </Link>
    </div>
  );
}
