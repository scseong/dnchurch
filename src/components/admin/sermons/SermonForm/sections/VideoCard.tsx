import clsx from 'clsx';
import { HiOutlineCloudUpload } from 'react-icons/hi';
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
  const hasAutoThumb = Boolean(thumbnailUrl);

  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>2</span>
        <div>
          <h3 className={styles.card_heading_title}>영상 정보</h3>
          <p className={styles.card_heading_desc}>YouTube/Vimeo 영상과 썸네일을 연결합니다</p>
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

          <Field label="썸네일" optional>
            {hasAutoThumb ? (
              <div className={styles.thumb_preview}>
                <img src={thumbnailUrl} alt="썸네일 미리보기" />
                <span className={styles.thumb_badge}>YouTube 자동 생성</span>
              </div>
            ) : (
              <button type="button" className={styles.upload}>
                <span className={styles.upload_icon}>
                  <HiOutlineCloudUpload />
                </span>
                <span className={styles.upload_text}>
                  <span className={styles.upload_accent}>클릭하여 업로드</span> 또는 드래그
                </span>
                <span className={styles.upload_desc}>
                  JPG, PNG, WebP · 최대 5MB · 권장 1280×720
                </span>
              </button>
            )}
          </Field>
        </div>
      </div>
    </section>
  );
}
