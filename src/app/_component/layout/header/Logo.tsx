import Link from 'next/link';
import styles from './Header.module.scss';

export default function Logo() {
  return (
    <div className={styles.logo}>
      <h1>
        <Link href="/">대구동남교회</Link>
      </h1>
    </div>
  );
}
