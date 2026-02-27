import type { Metadata } from 'next';
import MainContainer from '@/components/layout/container/MainContainer';
import WorshipSchedule from './_component/WorshipSchedule';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '예배안내 - 대구동남교회',
  description:
    '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)',
  openGraph: {
    title: '예배안내 - 대구동남교회',
    description:
      '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)'
  }
};

export type ScheduleType = typeof churchData;
const churchData = [
  { worship: '새벽기도회', time: '매일 오전 05:30', location: '소예배실' },
  { worship: '주일낮예배', time: '오전 11:00', location: '대예배실' },
  { worship: '주일저녁예배', time: '오후 06:00', location: '대예배실' },
  { worship: '수요기도회', time: '오후 07:00', location: '대예배실' },
  { worship: '금요기도회', time: '오후 08:00', location: '대예배실' }
];

const sundaySchoolData = [
  { worship: '유치부', time: '오전 09:00', location: '소예배실' },
  { worship: '초등부', time: '오전 09:00', location: '교육관 유초등부실' },
  { worship: '중고등부', time: '오전 09:00', location: '대예배실' },
  { worship: '청년부', time: '오후 01:30', location: '대예배실' }
];

export default function Worship() {
  return (
    <MainContainer title="예배안내">
      <div className={styles.container}>
        <div className={styles.schedule}>
          <h4>예배시간</h4>
          <WorshipSchedule schedule={churchData} />
        </div>
        <div className={styles.schedule}>
          <h4>교회학교 예배시간</h4>
          <WorshipSchedule schedule={sundaySchoolData} />
        </div>
      </div>
    </MainContainer>
  );
}
