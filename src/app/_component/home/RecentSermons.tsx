import Link from 'next/link';
import { getRecentSermons } from '@/apis/sermons';
import { LayoutContainer } from '@/components/layout';
import { formattedDate } from '@/utils/date';
import { revealStyle } from '@/utils/reveal';
import styles from './RecentSermons.module.scss';

const YT_THUMB = 'https://img.youtube.com/vi';
const YT_WATCH = 'https://www.youtube.com/watch?v=';

function PlayIcon({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 12 14" fill="currentColor">
        <path d="M0 0v14l12-7z" />
      </svg>
    </span>
  );
}

export default async function RecentSermons() {
  const { data: sermons } = await getRecentSermons(4);

  if (!sermons?.length) return null;

  const [featured, ...cards] = sermons;

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div data-reveal style={revealStyle()} className={styles.header}>
          <div className={styles.header_left}>
            <span className={styles.caption}>the Message</span>
            <h2>하나님의 말씀</h2>
          </div>
          <Link href="/sermons" className={styles.header_link}>
            설교 전체 보기 →
          </Link>
        </div>
        <a
          data-reveal
          style={revealStyle(0.15)}
          href={
            featured.youtube_id ? `${YT_WATCH}${featured.youtube_id}` : `/sermons/${featured.id}`
          }
          className={styles.featured}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.featured_thumb}>
            {featured.youtube_id && (
              <img
                src={`${YT_THUMB}/${featured.youtube_id}/maxresdefault.jpg`}
                alt={`${featured.sermon_date} 예배 썸네일`}
                loading="lazy"
              />
            )}
          </div>
          <div className={styles.meta_bar}>
            <div className={styles.meta_left}>
              <span className={styles.service_type}>{featured.service_type}</span>
              <span className={styles.date}>
                {formattedDate(featured.sermon_date, 'YYYY.MM.DD')}
              </span>
            </div>
            <div className={styles.meta_right}>
              <span className={styles.latest_badge}>LATEST</span>
              <PlayIcon className={styles.play_btn} />
            </div>
          </div>
        </a>
        <div className={styles.cards}>
          {cards.map((sermon, i) => (
            <a
              key={sermon.id}
              data-reveal
              style={revealStyle(i * 0.15)}
              href={sermon.youtube_id ? `${YT_WATCH}${sermon.youtube_id}` : `/sermons/${sermon.id}`}
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.card_thumb}>
                {sermon.youtube_id && (
                  <img
                    src={`${YT_THUMB}/${sermon.youtube_id}/maxresdefault.jpg`}
                    alt=""
                    loading="lazy"
                  />
                )}
              </div>
              <div className={styles.meta_bar}>
                <div className={styles.meta_left}>
                  <span className={styles.service_type}>{sermon.service_type}</span>
                  <span className={styles.date}>
                    {formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}
                  </span>
                </div>
                <PlayIcon className={styles.play_btn} />
              </div>
            </a>
          ))}
        </div>
      </LayoutContainer>
    </section>
  );
}
