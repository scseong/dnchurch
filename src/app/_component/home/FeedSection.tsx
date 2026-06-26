import { LayoutContainer } from '@/components/layout';
import { getNotices } from '@/services/notice';
import SectionHeader from './SectionHeader';
import FeedContent from './FeedContent';
import styles from './FeedSection.module.scss';

export default async function FeedSection() {
  const { data: notices } = await getNotices({ pageSize: 5 });

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <SectionHeader title="교회 소식" link={{ label: '더 보기', href: '/news/notices' }} />
        <FeedContent notices={notices ?? []} />
      </LayoutContainer>
    </section>
  );
}
