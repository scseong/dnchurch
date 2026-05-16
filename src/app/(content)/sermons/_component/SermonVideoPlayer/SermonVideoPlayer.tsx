'use client';

import { useState } from 'react';
import { IoPlay, IoVideocamOutline } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './SermonVideoPlayer.module.scss';

type Props = {
  videoId: string | null;
  videoProvider: string;
  thumbnailUrl: string | null;
  title: string;
};

function Placeholder({ text }: { text: string }) {
  return (
    <div className={styles.placeholder} role="status">
      <IoVideocamOutline className={styles.placeholder_icon} aria-hidden="true" />
      <p className={styles.placeholder_text}>{text}</p>
    </div>
  );
}

export default function SermonVideoPlayer({ videoId, videoProvider, thumbnailUrl, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!videoId) {
    return (
      <div className={styles.video_wrap}>
        <Placeholder text="영상이 준비 중입니다" />
      </div>
    );
  }

  if (videoProvider !== 'youtube') {
    return (
      <div className={styles.video_wrap}>
        <Placeholder text="지원하지 않는 영상 형식입니다" />
      </div>
    );
  }

  return (
    <div className={styles.video_wrap}>
      <div className={styles.main}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
            aria-label={`${title} 영상 재생`}
          >
            {thumbnailUrl && (
              <CloudinaryImage
                src={thumbnailUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 800px, 100vw"
                className={styles.poster_img}
              />
            )}
            <span className={styles.play} aria-hidden="true">
              <IoPlay />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
