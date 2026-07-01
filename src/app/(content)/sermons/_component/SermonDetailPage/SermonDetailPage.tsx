import clsx from 'clsx';
import { LayoutContainer } from '@/components/layout';
import SermonVideoPlayer from '../SermonVideoPlayer/SermonVideoPlayer';
import SermonSeriesSidebar from '../SermonSeriesSidebar/SermonSeriesSidebar';
import SermonOtherByPreacher from '../SermonOtherByPreacher/SermonOtherByPreacher';
import SermonDetailSections from './SermonDetailSections';
import { formattedDate } from '@/utils/date';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import {
  formatPreacherLabel,
  formatSermonDuration,
  getSermonThumbnail
} from '@/utils/sermon';
import type { SermonWithRelations } from '@/types/sermon';
import styles from './SermonDetailPage.module.scss';

type Props = {
  sermon: SermonWithRelations;
  seriesEpisodes: SermonWithRelations[];
  otherSermonsByPreacher: SermonWithRelations[];
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
  const seriesLabel = series
    ? `${series.title} ${String(sermon.series_order ?? 0).padStart(2, '0')}`
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
      <h1 className={styles.sermon_title}>{sermon.title}</h1>
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
