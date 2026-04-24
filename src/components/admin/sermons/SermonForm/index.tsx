'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { HiOutlineEye, HiOutlineX } from 'react-icons/hi';
import BasicInfoCard from './sections/BasicInfoCard';
import VideoCard from './sections/VideoCard';
import ScriptureCard from './sections/ScriptureCard';
import ResourcesCard from './sections/ResourcesCard';
import PublishCard from './sections/PublishCard';
import PreviewCard from './Preview/PreviewCard';
import Checklist from './Preview/Checklist';
import type { Preacher, SeriesWithSermonCount } from '@/types/sermon';
import {
  type SermonFormData,
  type SermonFormPatch,
  type SermonResourceInput
} from '@/types/sermon-form';
import styles from './index.module.scss';

interface SermonFormProps {
  formData: SermonFormData;
  onPatch: (patch: SermonFormPatch) => void;
  onAddResources: (inputs: SermonResourceInput[]) => void;
  onRemoveResource: (id: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isPending: boolean;
  publishLabel: string;
  preachers: Preacher[];
  series: SeriesWithSermonCount[];
}

export default function SermonForm({
  formData,
  onPatch,
  onAddResources,
  onRemoveResource,
  onSaveDraft,
  onPublish,
  isPending,
  publishLabel,
  preachers,
  series
}: SermonFormProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <form className={styles.wrap}>
        <div className={styles.form_col}>
          <BasicInfoCard
            title={formData.title}
            sermonDate={formData.sermonDate}
            preacherId={formData.preacherId}
            seriesId={formData.seriesId}
            serviceType={formData.serviceType}
            preachers={preachers}
            series={series}
            onChange={onPatch}
          />
          <VideoCard
            videoUrl={formData.videoUrl}
            videoId={formData.videoId}
            duration={formData.duration}
            thumbnailUrl={formData.thumbnailUrl}
            onChange={onPatch}
          />
          <ScriptureCard
            scripture={formData.scripture}
            scriptureText={formData.scriptureText}
            summary={formData.summary}
            onChange={onPatch}
          />
          <ResourcesCard
            resources={formData.resources}
            onAdd={onAddResources}
            onRemove={onRemoveResource}
          />
          <PublishCard isPublished={formData.isPublished} onChange={onPatch} />
        </div>
        <aside className={styles.preview_col} aria-label="미리보기">
          <PreviewCard formData={formData} series={series} />
          <Checklist formData={formData} />
        </aside>
      </form>

      <div className={styles.mobile_bar}>
        <button
          type="button"
          className={styles.mobile_preview_button}
          aria-label="미리보기 열기"
          aria-expanded={previewOpen}
          onClick={() => setPreviewOpen(true)}
        >
          <HiOutlineEye />
        </button>
        <button
          type="button"
          className={clsx(styles.mobile_button, styles.outline)}
          disabled={isPending}
          onClick={onSaveDraft}
        >
          임시저장
        </button>
        <button
          type="button"
          className={clsx(styles.mobile_button, styles.primary)}
          disabled={isPending}
          onClick={onPublish}
        >
          {publishLabel}
        </button>
      </div>

      <div
        className={clsx(styles.preview_overlay, previewOpen && styles.open)}
        onClick={() => setPreviewOpen(false)}
        aria-hidden={!previewOpen}
      >
        <div
          className={styles.preview_sheet}
          role="dialog"
          aria-label="미리보기"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.preview_sheet_bar} aria-hidden />
          <header className={styles.preview_sheet_header}>
            <h2 className={styles.preview_sheet_title}>미리보기</h2>
            <button
              type="button"
              className={styles.preview_sheet_close}
              aria-label="닫기"
              onClick={() => setPreviewOpen(false)}
            >
              <HiOutlineX />
            </button>
          </header>
          <div className={styles.preview_sheet_body}>
            <PreviewCard formData={formData} series={series} />
            <Checklist formData={formData} />
          </div>
        </div>
      </div>
    </>
  );
}
