import { LayoutContainer } from '@/components/layout';
import SermonCard from '@/app/_component/home/SermonCard';
import { getRecentSermons } from '@/services/sermon';
import SectionHeader from './SectionHeader';
import styles from './RecentSermons.module.scss';

export default async function RecentSermons() {
  const sermons = await getRecentSermons(1);

  if (!sermons.length) return null;

  const [featured] = sermons;

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <SectionHeader title="말씀 먼저 들어보기" link={{ label: '더보기', href: '/sermons/all' }} />
        <SermonCard sermon={featured} />
      </LayoutContainer>
    </section>
  );
}
