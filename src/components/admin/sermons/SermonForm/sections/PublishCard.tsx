import clsx from 'clsx';
import { SERMON_REQUIRED_LABELS, SERMON_REQUIRED_ORDER } from '@/lib/sermon-form';
import type { PublishCardProps } from '@/types/sermon-form';
import styles from '../index.module.scss';

const REQUIRED_LABELS_SENTENCE = SERMON_REQUIRED_ORDER.map(
  (key) => SERMON_REQUIRED_LABELS[key]
).join(', ');

export default function PublishCard({ isPublished, onChange }: PublishCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>5</span>
        <div>
          <h3 className={styles.card_heading_title}>발행 설정</h3>
          <p className={styles.card_heading_desc}>공개 상태와 노출 옵션을 설정합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>공개 상태</legend>
          <div className={styles.toggle_row}>
            <label className={clsx(styles.toggle, !isPublished && styles.on)}>
              <input
                type="radio"
                name="isPublished"
                className={styles.sr_only}
                checked={!isPublished}
                onChange={() => onChange({ isPublished: false })}
              />
              <span className={styles.main}>비공개</span>
              <span className={styles.sub}>임시 저장</span>
            </label>
            <label className={clsx(styles.toggle, isPublished && styles.on)}>
              <input
                type="radio"
                name="isPublished"
                className={styles.sr_only}
                checked={isPublished}
                onChange={() => onChange({ isPublished: true })}
              />
              <span className={styles.main}>공개</span>
              <span className={styles.sub}>사이트에 게시</span>
            </label>
          </div>
        </fieldset>
        <div className={styles.warn_box}>
          발행하려면 {REQUIRED_LABELS_SENTENCE}이 필요합니다
        </div>
      </div>
    </section>
  );
}
