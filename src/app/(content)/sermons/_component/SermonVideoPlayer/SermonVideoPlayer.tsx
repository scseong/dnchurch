'use client';

import { IoVideocamOutline } from 'react-icons/io5';
import styles from './SermonVideoPlayer.module.scss';

type Props = {
  videoId: string | null;
  title: string;
};

export default function SermonVideoPlayer({ videoId, title }: Props) {
  if (!videoId) {
    return (
      <div className={styles.placeholder} role="status">
        <IoVideocamOutline className={styles.placeholder_icon} aria-hidden="true" />
        <p className={styles.placeholder_text}>영상이 준비 중입니다</p>
      </div>
    );
  }

  return (
    <div className={styles.sticky_wrap}>
      <div className={styles.main}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
