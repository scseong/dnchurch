import Link from 'next/link';
import styles from './Logo.module.scss';

export default function Logo() {
  return (
    <div className={styles.logo}>
      <Link href="/">대구동남교회</Link>
    </div>
  );
}
