import { LayoutContainer } from '@/components/layout';
import { getNotices } from '@/services/notice';
import { revealStyle, REVEAL_STEP_CONTENT } from '@/utils/reveal';
import FeedContent from './FeedContent';
import styles from './FeedSection.module.scss';

export default async function FeedSection() {
  const { data: notices } = await getNotices({ pageSize: 5 });

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div data-reveal style={revealStyle()} className={styles.header}>
          <span className={styles.caption}>Church Feeds</span>
          <h2>교회 소식과 은혜 나눔</h2>
          <p className={styles.subtitle}>
            교회의 최신 소식과 성도님들의 은혜로운 나눔을 확인하세요
          </p>
        </div>
        <FeedContent notices={notices ?? []} />
      </LayoutContainer>
    </section>
  );
}
