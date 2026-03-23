import Link from 'next/link';
import clsx from 'clsx';
import { formattedDate } from '@/utils/date';
import { revealStyle } from '@/utils/reveal';
import type { RecentSermon } from '@/apis/sermons';
import styles from './SermonCard.module.scss';

const YT_THUMB = 'https://img.youtube.com/vi';
const YT_WATCH = 'https://www.youtube.com/watch?v=';

type SermonCardProps = {
  sermon: RecentSermon;
  isLatest?: boolean;
  delay?: number;
  isSub?: boolean;
};

function PlayIcon({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 12 14" fill="currentColor">
        <path d="M0 0v14l12-7z" />
      </svg>
    </span>
  );
}

function sermonAlt(sermon: Pick<RecentSermon, 'title' | 'preacher' | 'sermon_date'>) {
  return `${sermon.title} - ${sermon.preacher} (${formattedDate(sermon.sermon_date, 'YYYY.MM.DD')})`;
}

export default function SermonCard({ sermon, isLatest, delay, isSub }: SermonCardProps) {
  return (
    <Link
      href={sermon.youtube_id ? `${YT_WATCH}${sermon.youtube_id}` : `/sermons/${sermon.id}`}
      className={clsx(styles.card, isSub && styles.card_sub)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${sermon.title} 설교 영상 재생 - ${sermon.preacher}`}
      data-reveal
      style={revealStyle(delay)}
    >
      <div className={styles.card_thumb}>
        {sermon.youtube_id && (
          <img
            src={`${YT_THUMB}/${sermon.youtube_id}/maxresdefault.jpg`}
            alt={sermonAlt(sermon)}
            loading="lazy"
          />
        )}
        {isLatest && <span className={styles.latest_badge}>LATEST</span>}
        <PlayIcon className={styles.thumb_play} />
      </div>
      <div className={styles.meta_bar}>
        <div className={styles.meta_left}>
          <span className={styles.title} title={sermon.title}>
            {sermon.title}
          </span>
          <div className={styles.meta_sub}>
            <span className={styles.scripture}>{sermon.scripture}</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.date}>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.preacher}>{sermon.preacher}</span>
          </div>
        </div>
        <PlayIcon className={styles.play_btn} />
      </div>
    </Link>
  );
}
