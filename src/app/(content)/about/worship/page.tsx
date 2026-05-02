import type { Metadata } from 'next';
import MainContainer from '@/components/layout/container/MainContainer';
import { getWorshipScheduleGroups } from '@/services/worship';
import WorshipCard from './_component/WorshipCard';
import SchoolGrid from './_component/SchoolGrid';
import AboutWorship from './_component/AboutWorship';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '예배안내',
  description:
    '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)',
  openGraph: {
    title: '예배안내',
    description:
      '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)'
  }
};

export default async function Worship() {
  const { sunday, weekday, school } = await getWorshipScheduleGroups();

  return (
    <MainContainer title="예배안내">
      <section className={styles.section}>
        <header className={styles.section_head}>
          <p className={styles.eyebrow}>Sunday</p>
          <h3>주일예배</h3>
        </header>
        <ol className={styles.sunday_list}>
          {sunday.map((schedule) => (
            <li key={schedule.id}>
              <WorshipCard variant="sunday" schedule={schedule} />
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <header className={styles.section_head}>
          <p className={styles.eyebrow}>Weekday</p>
          <h3>평일예배</h3>
        </header>
        <ol className={styles.weekday_list}>
          {weekday.map((schedule) => (
            <li key={schedule.id}>
              <WorshipCard variant="weekday" schedule={schedule} />
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <header className={styles.section_head}>
          <p className={styles.eyebrow}>Sunday School</p>
          <h3>교회학교 예배</h3>
        </header>
        <SchoolGrid schedules={school} />
      </section>

      <AboutWorship />
    </MainContainer>
  );
}
