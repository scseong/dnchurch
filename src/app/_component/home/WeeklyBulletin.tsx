import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import { getLatestBulletin } from '@/services/bulletin';
import styles from './WeeklyBulletin.module.scss';

export default async function WeeklyBulletin() {
  const { data: bulletin } = await getLatestBulletin();

  if (!bulletin) return null;

  const [, month, day] = bulletin.sunday_date.split('-');

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <Link href={`/news/bulletins/${bulletin.id}`} className={styles.card}>
          <span className={styles.date}>
            <strong className={styles.day}>{Number(day)}</strong>
            <span className={styles.month}>{Number(month)}월</span>
          </span>
          <span className={styles.text}>
            <strong className={styles.title}>이번 주 주보</strong>
            <span className={styles.desc}>{bulletin.title}</span>
          </span>
          <DownloadIcon />
        </Link>
      </LayoutContainer>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}
