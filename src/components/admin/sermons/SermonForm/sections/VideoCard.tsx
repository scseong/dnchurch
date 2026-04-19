import clsx from 'clsx';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import Field from '../primitives/Field';
import Input from '../primitives/Input';
import styles from '../index.module.scss';

export default function VideoCard() {
  return (
    <section className={styles.card}>
      <header className={styles.card_h}>
        <span className={styles.card_num}>2</span>
        <div>
          <h3 className={styles.card_ht}>영상 정보</h3>
          <p className={styles.card_hd}>YouTube/Vimeo 영상과 썸네일을 연결합니다</p>
        </div>
      </header>
      <div className={styles.card_b}>
        <div className={styles.fields}>
          <Field label="영상 플랫폼" required>
            <div className={styles.prov_tabs}>
              <button type="button" className={clsx(styles.prov_tab, styles.on)}>
                YouTube
              </button>
              <button type="button" className={styles.prov_tab}>
                Vimeo
              </button>
            </div>
          </Field>

          <Field label="영상 URL" optional>
            <Input placeholder="https://youtube.com/watch?v=... 또는 video ID" />
          </Field>

          <div className={styles.field_short}>
            <Field label="재생 시간" optional>
              <Input placeholder="예: 32:15" />
            </Field>
          </div>

          <Field label="썸네일" optional>
            <button type="button" className={styles.upload}>
              <span className={styles.upload_ic}>
                <HiOutlineCloudUpload />
              </span>
              <span className={styles.upload_t}>
                <span className={styles.upload_accent}>클릭하여 업로드</span> 또는 드래그
              </span>
              <span className={styles.upload_d}>
                JPG, PNG, WebP · 최대 5MB · 권장 1280×720
              </span>
            </button>
          </Field>
        </div>
      </div>
    </section>
  );
}
