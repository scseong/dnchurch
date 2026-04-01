import Link from 'next/link';
import styles from './Logo.module.scss';

export default function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <span className={styles.logo_kr}>대구동남교회</span>
      <span className={styles.logo_en}>Dongnam Church · Hapshin</span>
    </Link>
  );
}
