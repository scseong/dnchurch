import clsx from 'clsx';
import Field from '../primitives/Field';
import styles from '../index.module.scss';

export default function PublishCard() {
  return (
    <section className={styles.card}>
      <header className={styles.card_h}>
        <span className={styles.card_num}>5</span>
        <div>
          <h3 className={styles.card_ht}>발행 설정</h3>
          <p className={styles.card_hd}>공개 상태와 노출 옵션을 설정합니다</p>
        </div>
      </header>
      <div className={styles.card_b}>
        <Field label="공개 상태">
          <div className={styles.toggle_row}>
            <button type="button" className={clsx(styles.toggle, styles.on)}>
              <span className={styles.main}>초안</span>
              <span className={styles.sub}>비공개</span>
            </button>
            <button type="button" className={styles.toggle}>
              <span className={styles.main}>발행</span>
              <span className={styles.sub}>공개</span>
            </button>
          </div>
        </Field>
        <div className={styles.warn_box}>
          발행하려면 제목, 날짜, 설교자, 영상 연결이 필요합니다
        </div>
      </div>
    </section>
  );
}
