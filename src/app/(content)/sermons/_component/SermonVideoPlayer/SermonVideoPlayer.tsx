'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { IoPlay, IoVideocamOutline } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './SermonVideoPlayer.module.scss';

type Props = {
  videoId: string | null;
  videoProvider: string;
  thumbnailUrl: string | null;
  title: string;
  /** 영상 좌상단 시리즈 pill (예: "산상수훈 03"). */
  seriesLabel?: string;
  /** 시리즈 pill 링크 — 있으면 시리즈로 이동. */
  seriesHref?: string;
  /** 영상 우하단 재생시간 (예: "36:24"). */
  duration?: string;
};

function Placeholder({ text }: { text: string }) {
  return (
    <div className={styles.placeholder} role="status">
      <IoVideocamOutline className={styles.placeholder_icon} aria-hidden="true" />
      <p className={styles.placeholder_text}>{text}</p>
    </div>
  );
}

export default function SermonVideoPlayer({
  videoId,
  videoProvider,
  thumbnailUrl,
  title,
  seriesLabel,
  seriesHref,
  duration
}: Props) {
  const [playing, setPlaying] = useState(false);

  // iframe은 진입 즉시 마운트되어 플레이어가 미리 부팅됨(포스터가 가림).
  // 클릭 시 src에 autoplay=1을 더해 — iframe navigation이 사용자 제스처 스택
  // 안에서 일어나므로 모바일 자동재생 정책을 통과(단일 탭으로 재생).
  const baseSrc = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
  const iframeSrc = playing ? `${baseSrc}&autoplay=1` : baseSrc;

  let inner: ReactNode;
  if (!videoId) {
    inner = <Placeholder text="영상이 준비 중입니다" />;
  } else if (videoProvider !== 'youtube') {
    inner = <Placeholder text="지원하지 않는 영상 형식입니다" />;
  } else {
    inner = (
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
    );
  }

  // 재생 전(포스터·placeholder)에만 시리즈 pill·재생시간을 영상 위에 올린다.
  const showOverlay = !playing;

  return (
    <div className={styles.video_wrap}>
      {inner}
      {showOverlay && seriesLabel && (
        seriesHref ? (
          <Link href={seriesHref} className={styles.series_pill}>
            {seriesLabel}
          </Link>
        ) : (
          <span className={styles.series_pill}>{seriesLabel}</span>
        )
      )}
      {showOverlay && duration && (
        <span className={styles.duration} aria-hidden="true">
          {duration}
        </span>
      )}
    </div>
  );
}
