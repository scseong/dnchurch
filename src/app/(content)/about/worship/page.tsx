import type { Metadata } from 'next';
import MainContainer from '@/components/layout/container/MainContainer';
import WorshipSchedule from './_component/WorshipSchedule';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { getWorshipSchedules } from '@/apis/worship-schedules';
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
  const { data } = await getWorshipSchedules();
  const schedules = data ?? [];

  const mainSchedules = schedules.filter((s) => s.category === 'main');
  const churchSchoolSchedules = schedules.filter((s) => s.category === 'church_school');

  return (
    <MainContainer title="예배안내">
      <div className={styles.container}>
        <div className={styles.schedule}>
          <h4>예배시간</h4>
          <WorshipSchedule schedule={mainSchedules} />
        </div>
        <div className={styles.schedule}>
          <h4>교회학교 예배시간</h4>
          <WorshipSchedule schedule={churchSchoolSchedules} />
        </div>
      </div>
    </MainContainer>
  );
}
