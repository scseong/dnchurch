'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoDocumentTextOutline, IoDownloadOutline } from 'react-icons/io5';
import { LayoutContainer } from '@/components/layout';
import SermonVideoPlayer from '../SermonVideoPlayer/SermonVideoPlayer';
import SermonVideoTools from '../SermonVideoTools/SermonVideoTools';
import ScriptureBlock from '../ScriptureBlock/ScriptureBlock';
import SermonNoteEditor from '../SermonNoteEditor/SermonNoteEditor';
import SeriesEpisodeList from '../SeriesEpisodeList/SeriesEpisodeList';
import { formattedDate } from '@/utils/date';
import { formatSermonDuration } from '@/utils/sermon';
import type { SermonWithRelations, SermonResource } from '@/types/sermon';
import styles from './SermonDetailPage.module.scss';

type Props = {
  sermon: SermonWithRelations;
  seriesEpisodes: SermonWithRelations[];
};

export default function SermonDetailPage({ sermon, seriesEpisodes }: Props) {
  const router = useRouter();

  const preacherLabel = sermon.preacher
    ? `${sermon.preacher.name}${sermon.preacher.title ? ` ${sermon.preacher.title}` : ''}`
    : '';
  const duration = formatSermonDuration(sermon.duration);
  const hasSeriesEpisodes = seriesEpisodes.length > 0;
  const activeResources = sermon.sermon_resources.filter((r) => !r.deleted_at);

  const handleEpisodeSelect = (ep: SermonWithRelations) => {
    router.push(`/sermons/${ep.id}`);
  };

  const handleViewAllSeries = () => {
    if (sermon.sermon_series?.slug) {
      router.push(`/sermons/all?series=${sermon.sermon_series.slug}`);
    }
  };

  return (
    <LayoutContainer>
      <div className={styles.layout}>
        <div className={styles.video_section}>
          <SermonVideoPlayer videoId={sermon.video_id} title={sermon.title} />
          <SermonVideoTools sermonId={String(sermon.id)} />
        </div>

        <div className={styles.info_section}>
          <SermonMeta
            sermon={sermon}
            preacherLabel={preacherLabel}
            duration={duration}
          />

          {sermon.scripture && sermon.scripture_text && (
            <ScriptureBlock
              scriptureRef={sermon.scripture}
              scriptureText={sermon.scripture_text}
            />
          )}

          {sermon.summary && (
            <p className={styles.summary_text}>{sermon.summary}</p>
          )}

          {activeResources.length > 0 && <ResourceList resources={activeResources} />}

          {hasSeriesEpisodes && (
            <SeriesEpisodeList
              currentSermonId={sermon.id}
              sermons={seriesEpisodes}
              seriesTitle={sermon.sermon_series?.title ?? '시리즈'}
              onSelect={handleEpisodeSelect}
              onViewAll={handleViewAllSeries}
            />
          )}

          {/* 노트는 mockup에 없으나 dnchurch 자체 기능. 임시 페이지 최하단 노출 (의사결정 로그 D2 — 별도 task로 위치 확정 예정) */}
          <SermonNoteEditor sermonId={String(sermon.id)} />
        </div>
      </div>
    </LayoutContainer>
  );
}

/* ── Sub-components ── */

type SermonMetaProps = {
  sermon: SermonWithRelations;
  preacherLabel: string;
  duration: string | null;
};

function SermonMeta({ sermon, preacherLabel, duration }: SermonMetaProps) {
  const series = sermon.sermon_series;
  const seriesOrder = sermon.series_order;

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
      {sermon.scripture && <span className={styles.scripture_tag}>{sermon.scripture}</span>}
      <div className={styles.meta_row}>
        <span>{formattedDate(sermon.sermon_date, 'YYYY년 MM월 DD일')}</span>
        <Dot />
        <span>{sermon.service_type}</span>
        {duration && (
          <>
            <Dot />
            <span>{duration}</span>
          </>
        )}
        <Dot />
        <span>{preacherLabel}</span>
      </div>
    </div>
  );
}

type ResourceListProps = {
  resources: SermonResource[];
};

function ResourceList({ resources }: ResourceListProps) {
  return (
    <ul className={styles.resource_list}>
      {resources.map((res) => (
        <li key={res.id}>
          <a
            href={res.file_url}
            className={styles.resource_item}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <IoDocumentTextOutline className={styles.resource_icon} aria-hidden="true" />
            <div className={styles.resource_info}>
              <span className={styles.resource_title}>{res.title}</span>
              {res.file_type && (
                <span className={styles.resource_type}>{res.file_type.toUpperCase()}</span>
              )}
            </div>
            <IoDownloadOutline className={styles.resource_download} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Dot() {
  return <span className={styles.dot} aria-hidden="true" />;
}
