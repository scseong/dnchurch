'use client';

import clsx from 'clsx';
import Field from '../primitives/Field';
import Input from '../primitives/Input';
import type { VideoCardProps, VideoProvider } from '@/types/sermon-form';
import styles from '../index.module.scss';

const PROVIDERS: { key: VideoProvider; label: string }[] = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'vimeo', label: 'Vimeo' }
];

export default function VideoCard({
  videoProvider,
  videoUrl,
  videoId,
  duration,
  thumbnailUrl,
  onChange
}: VideoCardProps) {
  const urlHint = videoUrl
    ? videoId
      ? `인식된 ID: ${videoId}`
      : 'URL을 확인하세요'
    : undefined;

  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>2</span>
        <div>
          <h3 className={styles.card_heading_title}>영상 정보</h3>
          <p className={styles.card_heading_desc}>YouTube/Vimeo 영상을 연결합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        <div className={styles.fields}>
          <Field label="영상 플랫폼" required>
            <div className={styles.provider_tabs}>
              {PROVIDERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={clsx(styles.provider_tab, videoProvider === key && styles.on)}
                  onClick={() => onChange({ videoProvider: key })}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="영상 URL" optional hint={urlHint}>
            <Input
              placeholder="https://youtube.com/watch?v=... 또는 video ID"
              value={videoUrl}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
            />
          </Field>

          <div className={styles.field_short}>
            <Field label="재생 시간" optional>
              <Input
                placeholder="예: 32:15"
                value={duration}
                onChange={(e) => onChange({ duration: e.target.value })}
              />
            </Field>
          </div>

          {thumbnailUrl && (
            <Field label="썸네일 미리보기" optional>
              <div className={styles.thumb_preview}>
                <img src={thumbnailUrl} alt="썸네일 미리보기" />
                <span className={styles.thumb_badge}>
                  {videoProvider === 'youtube' ? 'YouTube 자동 생성' : 'Vimeo 자동 생성'}
                </span>
              </div>
            </Field>
          )}
        </div>
      </div>
    </section>
  );
}
