'use client';

import clsx from 'clsx';
import { IoTimeOutline, IoPlayCircle } from 'react-icons/io5';
import { formatSermonDuration } from '@/utils/sermon';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SeriesEpisodeList.module.scss';

const MAX_VISIBLE = 5;

type Props = {
  currentSermonId: number;
  sermons: SermonWithRelations[];
  seriesTitle: string;
  onSelect: (sermon: SermonWithRelations) => void;
  onViewAll: () => void;
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function SeriesEpisodeList({
  currentSermonId,
  sermons,
  seriesTitle,
  onSelect,
  onViewAll
}: Props) {
  const visible = sermons.slice(0, MAX_VISIBLE);
  const totalCount = sermons.length;
  const hasMore = totalCount > MAX_VISIBLE;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{seriesTitle}</h3>
      <ul className={styles.list}>
        {visible.map((sermon, idx) => {
          const isCurrent = sermon.id === currentSermonId;
          const order = sermon.series_order ?? idx + 1;
          const preacherName = sermon.preacher?.name ?? '';
          const duration = formatSermonDuration(sermon.duration);
          const shortDate = formatShortDate(sermon.sermon_date);

          return (
            <li key={sermon.id}>
              <button
                type="button"
                className={clsx(styles.row, isCurrent && styles.row_current)}
                onClick={() => onSelect(sermon)}
                aria-current={isCurrent || undefined}
              >
                <div className={styles.order_col}>
                  <span className={styles.order_label}>제{order}편</span>
                  <span className={clsx(styles.order_badge, isCurrent && styles.badge_current)}>
                    {isCurrent ? (
                      <IoPlayCircle aria-hidden="true" />
                    ) : (
                      order
                    )}
                  </span>
                </div>

                <div className={styles.info}>
                  <span className={styles.title}>{sermon.title}</span>
                  <span className={styles.meta}>
                    {shortDate}
                    {preacherName && (
                      <>
                        <span className={styles.dot} aria-hidden="true" />
                        {preacherName}
                      </>
                    )}
                    {sermon.scripture && (
                      <>
                        <span className={styles.dot} aria-hidden="true" />
                        {sermon.scripture}
                      </>
                    )}
                  </span>
                  {isCurrent && <span className={styles.now_label}>현재 재생 중</span>}
                </div>

                {duration && (
                  <span className={styles.duration}>
                    <IoTimeOutline aria-hidden="true" />
                    {duration}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button type="button" className={styles.view_all} onClick={onViewAll}>
          시리즈 전체 {totalCount}편 보기 →
        </button>
      )}
    </div>
  );
}
