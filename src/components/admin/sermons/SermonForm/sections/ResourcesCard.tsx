import { HiOutlinePaperClip, HiPlus } from 'react-icons/hi';
import styles from '../index.module.scss';

export default function ResourcesCard() {
  return (
    <section className={styles.card}>
      <header className={styles.card_h}>
        <span className={styles.card_num}>4</span>
        <div>
          <h3 className={styles.card_ht}>첨부 자료</h3>
          <p className={styles.card_hd}>설교문·악보 등 첨부 파일을 업로드합니다</p>
        </div>
      </header>
      <div className={styles.card_b}>
        <button type="button" className={styles.upload}>
          <span className={styles.upload_ic}>
            <HiOutlinePaperClip />
          </span>
          <span className={styles.upload_t}>
            <span className={styles.upload_accent}>클릭하여 업로드</span> 또는 드래그
          </span>
          <span className={styles.upload_d}>PDF, DOCX, PPTX · 최대 50MB</span>
        </button>
        <button type="button" className={styles.add_btn}>
          <HiPlus />
          파일 추가
        </button>
      </div>
    </section>
  );
}
