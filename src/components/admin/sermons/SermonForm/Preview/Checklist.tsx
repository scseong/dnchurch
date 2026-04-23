import clsx from 'clsx';
import { HiCheck } from 'react-icons/hi';
import type { SermonFormData } from '@/types/sermon-form';
import parent from '../index.module.scss';
import styles from './preview.module.scss';

type Status = 'empty' | 'err' | 'ok';

interface ChecklistEntry {
  label: string;
  required?: boolean;
  status: Status;
}

const STATUS_CLASS: Record<Status, string> = {
  empty: styles.checklist_empty,
  err: styles.checklist_err,
  ok: styles.checklist_ok
};

const requiredStatus = (filled: boolean): Status => (filled ? 'ok' : 'err');
const optionalStatus = (filled: boolean): Status => (filled ? 'ok' : 'empty');

interface ChecklistProps {
  data: SermonFormData;
}

export default function Checklist({ data }: ChecklistProps) {
  const items: ChecklistEntry[] = [
    { label: '설교 제목', required: true, status: requiredStatus(data.title.trim() !== '') },
    { label: '설교 날짜', required: true, status: requiredStatus(data.sermonDate !== '') },
    { label: '설교자 선택', required: true, status: requiredStatus(data.preacherId !== '') },
    { label: '예배 종류', required: true, status: requiredStatus(data.serviceType !== '') },
    { label: '영상 연결 (YouTube/Vimeo)', status: optionalStatus(Boolean(data.videoId)) },
    { label: '성경 본문', status: optionalStatus(data.scripture.trim() !== '') },
    { label: '설교 요약', status: optionalStatus(data.summary.trim() !== '') },
    { label: '썸네일 업로드', status: optionalStatus(Boolean(data.thumbnailUrl)) }
  ];
  const completed = items.filter((item) => item.status === 'ok').length;

  return (
    <section className={parent.card}>
      <header className={styles.checklist_head}>
        <span className={styles.checklist_title}>발행 준비 상태</span>
        <span className={styles.checklist_progress}>
          {completed}/{items.length}
        </span>
      </header>
      <ul className={styles.checklist_items}>
        {items.map((item) => (
          <li key={item.label} className={styles.checklist_item}>
            <span className={clsx(styles.checklist_badge, STATUS_CLASS[item.status])}>
              {item.status === 'ok' && <HiCheck />}
              {item.status === 'err' && '!'}
            </span>
            <span className={styles.checklist_label}>
              {item.label}
              {item.required && (
                <span className={styles.checklist_required} aria-hidden>
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
