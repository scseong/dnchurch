import clsx from 'clsx';
import { LayoutContainer } from '@/components/layout';
import SermonVideoPlayer from '../SermonVideoPlayer/SermonVideoPlayer';
import SermonSeriesSidebar from '../SermonSeriesSidebar/SermonSeriesSidebar';
import SermonOtherByPreacher from '../SermonOtherByPreacher/SermonOtherByPreacher';
import SermonDetailSections from './SermonDetailSections';
import DetailShareButton from './DetailShareButton';
import { formattedDate } from '@/utils/date';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import {
  formatPreacherLabel,
  formatSermonDuration,
  getSermonThumbnail
} from '@/utils/sermon';
import type { SeriesEpisodeItem, SermonCardItem, SermonWithRelations } from '@/types/sermon';
import styles from './SermonDetailPage.module.scss';

type Props = {
  sermon: SermonWithRelations;
  seriesEpisodes: SeriesEpisodeItem[];
  otherSermonsByPreacher: SermonCardItem[];
};

export default function SermonDetailPage({
  sermon,
  seriesEpisodes,
  otherSermonsByPreacher
}: Props) {
  const preacherLabel = formatPreacherLabel(sermon.preacher);
  const series = sermon.sermon_series;
  const hasSeriesSidebar = Boolean(series) && seriesEpisodes.length > 0;

  // 목업: 시리즈는 영상 좌상단 pill "제목 00"으로, 재생시간은 우하단으로.
  // series_order가 null이면 회차 번호를 붙이지 않는다 (sidebar와 동일 — 없는 회차를 00으로 오기하지 않음).
  const seriesLabel = series
    ? sermon.series_order != null
      ? `${series.title} ${String(sermon.series_order).padStart(2, '0')}`
      : series.title
    : undefined;
  const duration = formatSermonDuration(sermon.duration) || undefined;

  return (
    <LayoutContainer>
      <div className={clsx(styles.layout, hasSeriesSidebar && styles.layout_with_sidebar)}>
        <div className={styles.main_column}>
          <div className={styles.video_section}>
            <SermonVideoPlayer
              key={String(sermon.id)}
              videoId={sermon.video_id}
              videoProvider={sermon.video_provider}
              thumbnailUrl={cloudinaryFetchUrl(getSermonThumbnail(sermon))}
              title={sermon.title}
              seriesLabel={seriesLabel}
              seriesHref={series ? `/sermons/series/${series.id}` : undefined}
              duration={duration}
            />
          </div>

          <div className={styles.info_section}>
            <SermonMeta sermon={sermon} preacherLabel={preacherLabel} />

            <SermonDetailSections sermon={sermon} />
          </div>
        </div>

        {hasSeriesSidebar && series && (
          <SermonSeriesSidebar
            series={series}
            episodes={seriesEpisodes}
            currentSermonId={sermon.id}
          />
        )}

        <div className={styles.other_full_width}>
          <SermonOtherByPreacher
            preacherLabel={preacherLabel}
            sermons={otherSermonsByPreacher}
          />
        </div>
      </div>
    </LayoutContainer>
  );
}

/* ── Sub-components ── */

type SermonMetaProps = {
  sermon: SermonWithRelations;
  preacherLabel: string;
};

// 목업: 제목 아래 한 줄 메타(설교자 · 본문 · 날짜) — 공유·저장 버튼은 헤더 공유로 대체.
function SermonMeta({ sermon, preacherLabel }: SermonMetaProps) {
  return (
    <div className={styles.meta_block}>
      <div className={styles.meta_head}>
        <h1 className={styles.sermon_title}>{sermon.title}</h1>
        <DetailShareButton />
      </div>
      <div className={styles.meta_row}>
        <span>{preacherLabel}</span>
        {sermon.scripture && (
          <>
            <Dot />
            <span>{sermon.scripture}</span>
          </>
        )}
        <Dot />
        <span>{formattedDate(sermon.sermon_date, 'YYYY.MM.DD')}</span>
      </div>
    </div>
  );
}

function Dot() {
  return <span className={styles.dot} aria-hidden="true" />;
}
