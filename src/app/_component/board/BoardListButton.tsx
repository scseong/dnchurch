import Link from 'next/link';
import styles from './BoardListButton.module.scss';

export default function BoardListButton({ link }: { link: string }) {
  return (
    <div className={styles.wrap}>
      <Link href={link}>목록</Link>
    </div>
  );
}
