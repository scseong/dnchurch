import { EmptyState } from '@/components/ui';
import SeriesEpisodeCard from './SeriesEpisodeCard';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SeriesDetailPage.module.scss';

type Props = {
  episodes: SermonWithRelations[];
};

export default function EpisodeGrid({ episodes }: Props) {
  return (
    <section aria-label="회차 목록">
      <header className={styles.episodes_header}>
        <h2 className={styles.episodes_title}>회차 목록</h2>
        <span className={styles.episodes_total}>총 {episodes.length}편</span>
      </header>
      {episodes.length === 0 ? (
        <EmptyState
          title="아직 공개된 회차가 없습니다"
          description="회차가 공개되면 이곳에 표시됩니다"
          announce
        />
      ) : (
        <ul role="list" className={styles.grid}>
          {episodes.map((sermon, index) => (
            <li key={sermon.id}>
              <SeriesEpisodeCard
                sermon={sermon}
                order={sermon.series_order ?? index + 1}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
