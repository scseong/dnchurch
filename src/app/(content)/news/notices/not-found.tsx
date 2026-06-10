import Link from 'next/link';
import styles from './not-found.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>공지사항을 찾을 수 없습니다</h2>
      <p className={styles.description}>
        요청하신 공지사항이 삭제되었거나 주소가 올바르지 않습니다.
      </p>
      <Link href="/news/notices" className={styles.list_link}>
        공지사항 목록으로
      </Link>
    </div>
  );
}
