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

  // iframe은 진입 즉시 마운트되어 플레이어가 미리 부팅됨(포스터가 가림).
  // 클릭 시 src에 autoplay=1을 더해 — iframe navigation이 사용자 제스처 스택
  // 안에서 일어나므로 모바일 자동재생 정책을 통과(단일 탭으로 재생).
  const baseSrc = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
  const iframeSrc = playing ? `${baseSrc}&autoplay=1` : baseSrc;

  const handlePlay = () => setPlaying(true);

  return (
    <div className={styles.video_wrap}>
      <div className={styles.main}>
        <iframe
          src={iframeSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          tabIndex={playing ? undefined : -1}
          aria-hidden={playing ? undefined : true}
        />
        {!playing && (
          <button
            type="button"
            className={styles.poster}
            onClick={handlePlay}
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
