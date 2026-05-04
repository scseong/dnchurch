import Link from 'next/link';
import type { WorshipScheduleType } from '@/types/common';
import styles from './SchoolGrid.module.scss';

type Props = {
  schedules: WorshipScheduleType[];
};

export default function SchoolGrid({ schedules }: Props) {
  return (
    <>
      <ol className={styles.grid}>
        {schedules.map((schedule) => (
          <li key={schedule.id} className={styles.card}>
            {schedule.age_group ? <span className={styles.age}>{schedule.age_group}</span> : null}
            <h5>{schedule.name}</h5>
            <time className={styles.time}>{schedule.time}</time>
            <p className={styles.place}>{schedule.location}</p>
          </li>
        ))}
      </ol>
      <Link href="/next-gen" className={styles.banner}>
        <div>
          <h5>교회학교 페이지로 이동</h5>
          <p>교사진 · 교과 과정 · 행사 일정 안내</p>
        </div>
        <span className={styles.arrow} aria-hidden>
          →
        </span>
      </Link>
    </>
  );
}
