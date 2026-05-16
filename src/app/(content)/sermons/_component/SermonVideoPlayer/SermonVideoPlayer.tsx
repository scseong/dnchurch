'use client';

import { useEffect, useRef, useState } from 'react';
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

const YT_ORIGIN = 'https://www.youtube.com';

export default function SermonVideoPlayer({ videoId, videoProvider, thumbnailUrl, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const wantPlayRef = useRef(false);

  const sendPlay = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      YT_ORIGIN
    );
  };

  // 사전 부팅된 플레이어가 ready가 되면 큐잉된 재생 의도를 실행 —
  // 준비 전 클릭해도 2차 클릭 없이 단일 클릭으로 재생됨.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YT_ORIGIN) return;
      let data: unknown;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      const ytEvent = (data as { event?: string } | null)?.event;
      if (
        ytEvent === 'onReady' ||
        ytEvent === 'initialDelivery' ||
        ytEvent === 'infoDelivery'
      ) {
        readyRef.current = true;
        if (wantPlayRef.current) {
          wantPlayRef.current = false;
          sendPlay();
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // iframe 로드 직후 listening 핸드셰이크 — YouTube가 onReady 등 이벤트를 보내도록 등록
  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening' }),
      YT_ORIGIN
    );
  };

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

  // iframe은 진입 즉시 로드되어 플레이어가 미리 부팅됨(autoplay 없음, 포스터가 가림).
  // ready면 즉시 재생, 아직이면 의도만 큐잉 → onReady 수신 시 자동 재생(2차 클릭 불요).
  const handlePlay = () => {
    setPlaying(true);
    if (readyRef.current) {
      sendPlay();
    } else {
      wantPlayRef.current = true;
    }
  };

  return (
    <div className={styles.video_wrap}>
      <div className={styles.main}>
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
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
