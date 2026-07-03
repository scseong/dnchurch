import Link from 'next/link';
import styles from './ComingSoon.module.scss';

type Props = {
  /** 페이지 제목 — Hero 제거로 사라진 h1을 스크린리더용으로 보존한다. */
  title?: string;
};

export default function ComingSoon({ title }: Props) {
  return (
    <section className={styles.wrap}>
      {title && <h1 className={styles.blind_title}>{title}</h1>}
      <p className={styles.badge}>COMING SOON</p>
      <h2 className={styles.title}>준비 중입니다</h2>
      <p className={styles.desc}>더 나은 모습으로 곧 찾아뵙겠습니다. 조금만 기다려 주세요.</p>
      <Link href="/" className={styles.home_link}>
        홈으로 돌아가기
      </Link>
    </section>
  );
}
