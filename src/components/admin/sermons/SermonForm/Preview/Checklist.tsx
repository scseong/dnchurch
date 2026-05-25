import clsx from 'clsx';
import { HiCheck } from 'react-icons/hi';
import {
  SERMON_REQUIRED_LABELS,
  SERMON_REQUIRED_ORDER,
  validateSermonPublishReady
} from '@/lib/sermon-form';
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

const optionalStatus = (filled: boolean): Status => (filled ? 'ok' : 'empty');

interface ChecklistProps {
  formData: SermonFormData;
}

export default function Checklist({ formData }: ChecklistProps) {
  const { missing } = validateSermonPublishReady(formData);
  const requiredItems: ChecklistEntry[] = SERMON_REQUIRED_ORDER.map((key) => ({
    label: SERMON_REQUIRED_LABELS[key],
    required: true,
    status: missing.includes(key) ? 'err' : 'ok'
  }));
  const optionalItems: ChecklistEntry[] = [
    { label: '설교 요약', status: optionalStatus(formData.summary.trim() !== '') },
    { label: '첨부 자료', status: optionalStatus(formData.resources.length > 0) }
  ];
  const items: ChecklistEntry[] = [...requiredItems, ...optionalItems];
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
