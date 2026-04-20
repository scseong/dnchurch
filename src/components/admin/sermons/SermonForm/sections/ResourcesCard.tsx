import { HiOutlinePaperClip, HiPlus } from 'react-icons/hi';
import type { SermonCardProps } from '@/types/sermon-form';
import styles from '../index.module.scss';

export default function ResourcesCard({ data }: SermonCardProps) {
  const hasFiles = data.resources.length > 0;
  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>4</span>
        <div>
          <h3 className={styles.card_heading_title}>첨부 자료</h3>
          <p className={styles.card_heading_desc}>설교문·악보 등 첨부 파일을 업로드합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        {!hasFiles && (
          <button type="button" className={styles.upload}>
            <span className={styles.upload_icon}>
              <HiOutlinePaperClip />
            </span>
            <span className={styles.upload_text}>
              <span className={styles.upload_accent}>클릭하여 업로드</span> 또는 드래그
            </span>
            <span className={styles.upload_desc}>PDF, DOCX, PPTX · 최대 50MB</span>
          </button>
        )}
        {hasFiles && (
          <button type="button" className={styles.add_button}>
            <HiPlus />
            파일 추가
          </button>
        )}
      </div>
    </section>
  );
}
