import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import styles from './LoginPrompt.module.scss';

export default function LoginPrompt() {
  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div className={styles.card}>
          <span className={styles.icon_box} aria-hidden="true">
            <LockIcon />
          </span>
          <div className={styles.text}>
            <strong className={styles.title}>이미 대구동남교회 가족이신가요?</strong>
            <span className={styles.desc}>로그인하면 교제·기도·헌금·출석을 이용할 수 있어요</span>
          </div>
          <Link href="/login" className={styles.button}>
            로그인
          </Link>
        </div>
      </LayoutContainer>
    </section>
  );
}

function LockIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
