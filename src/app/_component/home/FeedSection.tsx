import { LayoutContainer } from '@/components/layout';
import { getNotices } from '@/services/notice';
import { getRevealStyle } from '@/utils/reveal';
import FeedContent from './FeedContent';
import styles from './FeedSection.module.scss';

export default async function FeedSection() {
  const { data: notices } = await getNotices({ pageSize: 5 });

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div data-reveal style={getRevealStyle()} className={styles.header}>
          <span className={styles.caption}>Church News</span>
          <h2>교회 소식</h2>
          <p className={styles.subtitle}>교회의 최신 소식을 확인하세요</p>
        </div>
        <FeedContent notices={notices ?? []} />
      </LayoutContainer>
    </section>
  );
}
