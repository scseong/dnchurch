'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoDocumentTextOutline, IoDownloadOutline } from 'react-icons/io5';
import { LayoutContainer } from '@/components/layout';
import SermonVideoPlayer from '../SermonVideoPlayer/SermonVideoPlayer';
import SermonVideoTools from '../SermonVideoTools/SermonVideoTools';
import SermonTabs from '../SermonTabs/SermonTabs';
import ScriptureBlock from '../ScriptureBlock/ScriptureBlock';
import SermonNoteEditor from '../SermonNoteEditor/SermonNoteEditor';
import SeriesEpisodeList from '../SeriesEpisodeList/SeriesEpisodeList';
import Toast from '@/components/common/Toast/Toast';
import { formattedDate } from '@/utils/date';
import { formatSermonDuration } from '@/utils/sermon';
import type { SermonWithRelations, SermonResource } from '@/types/sermon';
import styles from './SermonDetailPage.module.scss';

const TABS = [
  { key: 'summary', label: '요약' },
  { key: 'scripture', label: '본문' },
  { key: 'resources', label: '자료' },
  { key: 'notes', label: '노트' }
];

type Props = {
  sermon: SermonWithRelations;
  seriesEpisodes: SermonWithRelations[];
};

export default function SermonDetailPage({ sermon, seriesEpisodes }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [toast, setToast] = useState({ message: '', show: false });

  const preacherLabel = sermon.preacher
    ? `${sermon.preacher.name}${sermon.preacher.title ? ` ${sermon.preacher.title}` : ''}`
    : '';
  const seriesTitle = sermon.sermon_series?.title;
  const duration = formatSermonDuration(sermon.duration);
  const hasSeriesEpisodes = seriesEpisodes.length > 0;
  const activeResources = sermon.sermon_resources.filter((r) => !r.deleted_at);

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }, []);

  const handleEpisodeSelect = (ep: SermonWithRelations) => {
    router.push(`/sermons/${ep.slug}`);
  };

  const handleViewAllSeries = () => {
    if (sermon.sermon_series?.slug) {
      router.push(`/sermons?series=${sermon.sermon_series.slug}`);
    }
  };

  return (
    <LayoutContainer>
      <div className={styles.layout}>
        <div className={styles.video_section}>
          <SermonVideoPlayer
            videoId={sermon.video_id}
            title={sermon.title}
          />
          <SermonVideoTools sermonId={sermon.id} onToast={showToast} />
        </div>

        <div className={styles.info_section}>
          <SermonMeta
            seriesTitle={seriesTitle}
            seriesOrder={sermon.series_order}
            title={sermon.title}
            date={sermon.sermon_date}
            preacher={preacherLabel}
            scripture={sermon.scripture}
            duration={duration}
            serviceType={sermon.service_type}
          />
          <SermonTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS} />
          <TabContent activeTab={activeTab} sermon={sermon} resources={activeResources} />
          {hasSeriesEpisodes && (
            <SeriesEpisodeList
              currentSermonId={sermon.id}
              sermons={seriesEpisodes}
              seriesTitle={seriesTitle ?? '시리즈'}
              onSelect={handleEpisodeSelect}
              onViewAll={handleViewAllSeries}
            />
          )}
        </div>
      </div>

      <Toast message={toast.message} show={toast.show} />
    </LayoutContainer>
  );
}

/* ── Sub-components ── */

type SermonMetaProps = {
  seriesTitle: string | undefined;
  seriesOrder: number | null;
  title: string;
  date: string;
  preacher: string;
  scripture: string | null;
  duration: string | null;
  serviceType: string;
};

function SermonMeta({
  seriesTitle,
  seriesOrder,
  title,
  date,
  preacher,
  scripture,
  duration,
  serviceType
}: SermonMetaProps) {
  return (
    <div className={styles.meta_block}>
      <span className={styles.series_tag}>
        {seriesTitle ? `${seriesTitle} · 제${seriesOrder ?? '?'}편` : '단독 설교'}
      </span>
      <h1 className={styles.sermon_title}>{title}</h1>
      <div className={styles.meta_row}>
        <span>{formattedDate(date, 'YYYY년 MM월 DD일')}</span>
        <Dot />
        <span>{preacher}</span>
        <Dot />
        <span>{serviceType}</span>
      </div>
      {scripture && <span className={styles.scripture_tag}>{scripture}</span>}
    </div>
  );
}

type TabContentProps = {
  activeTab: string;
  sermon: SermonWithRelations;
  resources: SermonResource[];
};

function TabContent({ activeTab, sermon, resources }: TabContentProps) {
  return (
    <div className={styles.tab_content} role="tabpanel">
      {activeTab === 'summary' && (
        <div className={styles.tab_panel}>
          {sermon.summary ? (
            <p className={styles.summary_text}>{sermon.summary}</p>
          ) : (
            <p className={styles.empty}>등록된 요약이 없습니다</p>
          )}
        </div>
      )}

      {activeTab === 'scripture' && (
        <div className={styles.tab_panel}>
          {sermon.scripture ? (
            <ScriptureBlock scriptureRef={sermon.scripture} scriptureText={sermon.scripture_text} />
          ) : (
            <p className={styles.empty}>등록된 본문이 없습니다</p>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className={styles.tab_panel}>
          {resources.length > 0 ? (
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
          ) : (
            <p className={styles.empty}>등록된 자료가 없습니다</p>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className={styles.tab_panel}>
          <SermonNoteEditor sermonId={sermon.id} />
        </div>
      )}
    </div>
  );
}

function Dot() {
  return <span className={styles.dot} aria-hidden="true" />;
}
