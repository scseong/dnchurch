import { LuCamera } from 'react-icons/lu';
import styles from './gallery.module.scss';

// 목업의 작성 입력 바 — 탭하면 나눔글 작성 모달을 연다.
export default function GalleryComposer({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.composer} onClick={onClick}>
      <span className={styles.composer_avatar} aria-hidden="true">
        나
      </span>
      <span className={styles.composer_placeholder}>은혜의 순간을 나눠보세요</span>
      <span className={styles.composer_camera} aria-hidden="true">
        <LuCamera />
      </span>
    </button>
  );
}
