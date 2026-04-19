import clsx from 'clsx';
import { HiCheck } from 'react-icons/hi';
import parent from '../index.module.scss';
import styles from './preview.module.scss';

type Status = 'empty' | 'err' | 'ok';

interface ChecklistItem {
  label: string;
  required?: boolean;
  status: Status;
}

const ITEMS: ChecklistItem[] = [
  { label: '설교 제목', required: true, status: 'err' },
  { label: '설교 날짜', required: true, status: 'err' },
  { label: '설교자 선택', required: true, status: 'err' },
  { label: '영상 연결 (YouTube/Vimeo)', status: 'empty' },
  { label: '성경 본문', status: 'empty' },
  { label: '설교 요약', status: 'empty' },
  { label: '썸네일 업로드', status: 'empty' }
];

const STATUS_CLASS: Record<Status, string> = {
  empty: styles.cl_empty,
  err: styles.cl_err,
  ok: styles.cl_ok
};

export default function Checklist() {
  const completed = ITEMS.filter((item) => item.status === 'ok').length;

  return (
    <section className={parent.card}>
      <header className={styles.cl_head}>
        <span className={styles.cl_title}>발행 준비 상태</span>
        <span className={styles.cl_progress}>
          {completed}/{ITEMS.length}
        </span>
      </header>
      <ul className={styles.cl_items}>
        {ITEMS.map((item) => (
          <li key={item.label} className={styles.cl_item}>
            <span className={clsx(styles.cl_badge, STATUS_CLASS[item.status])}>
              {item.status === 'ok' && <HiCheck />}
              {item.status === 'err' && '!'}
            </span>
            <span className={styles.cl_label}>
              {item.label}
              {item.required && (
                <span className={styles.cl_required} aria-hidden>
                  *
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
