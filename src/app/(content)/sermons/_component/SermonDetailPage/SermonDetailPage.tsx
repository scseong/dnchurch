'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { LayoutContainer } from '@/components/layout';
import SermonVideoPlayer from '../SermonVideoPlayer/SermonVideoPlayer';
import SermonSeriesSidebar from '../SermonSeriesSidebar/SermonSeriesSidebar';
import SermonOtherByPreacher from '../SermonOtherByPreacher/SermonOtherByPreacher';
import SermonMetaActions from './SermonMetaActions';
import SermonDetailSections from './SermonDetailSections';
import { formattedDate } from '@/utils/date';
import { cloudinaryFetchUrl, getKakaoShareUrl } from '@/utils/cloudinary';
import { formatPreacherLabel, getSermonThumbnail } from '@/utils/sermon';
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

function SermonMeta({ sermon, preacherLabel }: SermonMetaProps) {
  const series = sermon.sermon_series;
  const seriesOrder = sermon.series_order;
  const thumbnail = getSermonThumbnail(sermon);
  const shareImageUrl = getKakaoShareUrl(thumbnail) ?? undefined;

  return (
    <div className={styles.meta_block}>
      {series ? (
        <Link href={`/sermons/series/${series.id}`} className={styles.series_tag}>
          {series.title} · 제{seriesOrder ?? '?'}편
        </Link>
      ) : (
        <span className={styles.series_tag_plain}>단독 설교</span>
      )}
      <h1 className={styles.sermon_title}>{sermon.title}</h1>
      <div className={styles.meta_bar}>
        <div className={styles.meta_row}>
          {sermon.scripture && (
            <>
              <span className={styles.meta_scripture}>{sermon.scripture}</span>
              <Dot />
            </>
          )}
          <span>{preacherLabel}</span>
          <Dot />
          <span>{formattedDate(sermon.sermon_date, 'YYYY년 MM월 DD일')}</span>
        </div>
        <SermonMetaActions
          sermonId={String(sermon.id)}
          title={sermon.title}
          description={sermon.summary ?? sermon.scripture ?? undefined}
          shareImageUrl={shareImageUrl}
        />
      </div>
    </div>
  );
}

function Dot() {
  return <span className={styles.dot} aria-hidden="true" />;
}
