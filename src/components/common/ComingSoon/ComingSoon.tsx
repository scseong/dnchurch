import Link from 'next/link';
import styles from './ComingSoon.module.scss';

export default function ComingSoon() {
  return (
    <section className={styles.wrap}>
      <p className={styles.badge}>COMING SOON</p>
      <h2 className={styles.title}>준비 중입니다</h2>
      <p className={styles.desc}>더 나은 모습으로 곧 찾아뵙겠습니다. 조금만 기다려 주세요.</p>
      <Link href="/" className={styles.home_link}>
        홈으로 돌아가기
      </Link>
    </section>
  );
}
