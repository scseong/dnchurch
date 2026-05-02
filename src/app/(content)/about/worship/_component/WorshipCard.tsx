import clsx from 'clsx';
import type { WorshipScheduleType } from '@/types/common';
import styles from './WorshipCard.module.scss';

type Variant = 'sunday' | 'weekday';

type Props = {
  variant: Variant;
  schedule: WorshipScheduleType;
};

export default function WorshipCard({ variant, schedule }: Props) {
  if (variant === 'sunday') {
    return <SundayCard schedule={schedule} />;
  }
  return <WeekdayCard schedule={schedule} />;
}

function SundayCard({ schedule }: { schedule: WorshipScheduleType }) {
  const featured = schedule.is_featured;

  return (
    <article className={clsx(styles.sunday, featured && styles.featured)}>
      {featured ? (
        <span className={styles.flag}>대표 예배</span>
      ) : (
        <span className={styles.label}>주일 저녁</span>
      )}
      <header className={styles.title_row}>
        <h4>{schedule.name}</h4>
        <time className={styles.time}>{schedule.time}</time>
      </header>
      <dl className={styles.meta}>
        <div>
          <dt>장소</dt>
          <dd>{schedule.location}</dd>
        </div>
        {schedule.duration ? (
          <div>
            <dt>소요시간</dt>
            <dd>{schedule.duration}</dd>
          </div>
        ) : null}
      </dl>
      {schedule.description ? <p className={styles.desc}>{schedule.description}</p> : null}
    </article>
  );
}

const WEEKDAY_LABELS: Record<string, string> = {
  새벽기도회: '월–토',
  수요기도회: '수요일',
  금요기도회: '금요일'
};

function WeekdayCard({ schedule }: { schedule: WorshipScheduleType }) {
  const { hour, ampm } = parseTime(schedule.time);
  const day = WEEKDAY_LABELS[schedule.name];

  return (
    <article className={styles.weekday}>
      <div className={styles.time_col}>
        {day ? <span className={styles.day}>{day}</span> : null}
        <span className={styles.hour}>{hour}</span>
        <span className={styles.ampm}>{ampm}</span>
      </div>
      <div className={styles.info_col}>
        <h4>{schedule.name}</h4>
        <p className={styles.place}>{schedule.location}</p>
        {schedule.description ? <p className={styles.desc}>{schedule.description}</p> : null}
      </div>
    </article>
  );
}

function parseTime(rawTime: string) {
  const cleaned = rawTime.replace(/^매일\s*/, '').trim();
  const isAm = cleaned.startsWith('오전');
  const hour = cleaned.replace(/^오전\s*/, '').replace(/^오후\s*/, '').trim();
  return { hour, ampm: isAm ? 'AM' : 'PM' };
}
