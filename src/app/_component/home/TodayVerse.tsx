import { LayoutContainer } from '@/components/layout';
import { getTodayVerse } from '@/services/home';
import styles from './TodayVerse.module.scss';

export default async function TodayVerse() {
  const { text, reference } = await getTodayVerse();

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div className={styles.card}>
          <p className={styles.eyebrow}>오늘의 말씀</p>
          <blockquote className={styles.quote}>{text}</blockquote>
          <cite className={styles.reference}>{reference}</cite>
        </div>
      </LayoutContainer>
    </section>
  );
}
