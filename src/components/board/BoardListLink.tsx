import Link from 'next/link';
import styles from './BoardListLink.module.scss';

export default function BoardListLink({ link }: { link: string }) {
  return (
    <div className={styles.wrap}>
      <Link href={link}>목록</Link>
    </div>
  );
}
