import { LuCamera } from 'react-icons/lu';
import styles from './gallery.module.scss';

// 목업의 작성 입력 바 — 읽기 전용 단계라 표시용(비인터랙티브). 실제 작성 흐름은 후속 단계.
export default function GalleryComposer() {
  return (
    <div className={styles.composer}>
      <span className={styles.composer_avatar} aria-hidden="true">
        나
      </span>
      <span className={styles.composer_placeholder}>은혜의 순간을 나눠보세요</span>
      <span className={styles.composer_camera} aria-hidden="true">
        <LuCamera />
      </span>
    </div>
  );
}
