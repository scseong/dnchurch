'use client';

import { IoVideocamOutline } from 'react-icons/io5';
import styles from './SermonVideoPlayer.module.scss';

type Props = {
  videoId: string | null;
  videoProvider: 'youtube' | 'vimeo';
  title: string;
};

function buildEmbedUrl(videoId: string, provider: 'youtube' | 'vimeo') {
  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return `https://www.youtube.com/embed/${videoId}`;
}

export default function SermonVideoPlayer({ videoId, videoProvider, title }: Props) {
  if (!videoId) {
    return (
      <div className={styles.placeholder} role="status">
        <IoVideocamOutline className={styles.placeholder_icon} aria-hidden="true" />
        <p className={styles.placeholder_text}>영상이 준비 중입니다</p>
      </div>
    );
  }

  const src = buildEmbedUrl(videoId, videoProvider);

  return (
    <div className={styles.sticky_wrap}>
      <div className={styles.main}>
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
