import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import SermonCard from '@/app/_component/home/SermonCard';
import { getRecentSermons } from '@/apis/sermons';
import { getRevealStyle } from '@/utils/reveal';
import styles from './RecentSermons.module.scss';

export default async function RecentSermons() {
  const { data: sermons } = await getRecentSermons(4);

  if (!sermons?.length) return null;

  const [featured, ...rest] = sermons;

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div data-reveal style={getRevealStyle()} className={styles.header}>
          <div className={styles.header_left}>
            <span className={styles.caption}>the Message</span>
            <h2>지난 설교 다시보기</h2>
          </div>
          <Link href="/sermons" className={styles.header_link}>
            설교 전체 보기 →
          </Link>
        </div>
        <div className={styles.grid}>
          <SermonCard sermon={featured} isLatest index={0} />
          <div className={styles.sub_list}>
            {rest.map((sermon, i) => (
              <SermonCard key={sermon.id} sermon={sermon} index={i + 1} isSub />
            ))}
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
