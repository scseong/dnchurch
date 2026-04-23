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
import {
  INITIAL_SERMON_FORM_DATA,
  type SermonFormData,
  type SermonFormPatch,
  type SermonResourceInput
} from '@/types/sermon-form';

import { applyPatch } from '@/lib/sermon-form';
import styles from './index.module.scss';

interface SermonFormProps {
  initialData?: SermonFormData;
}

export default function SermonForm({ initialData }: SermonFormProps = {}) {
  const [data, setData] = useState<SermonFormData>(initialData ?? INITIAL_SERMON_FORM_DATA);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePatch = (patch: SermonFormPatch) => {
    setData((d) => applyPatch(d, patch));
  };

  const handleAddResources = (inputs: SermonResourceInput[]) => {
    setData((d) => ({ ...d, resources: [...d.resources, ...inputs] }));
  };

  const handleRemoveResource = (id: string) => {
    setData((d) => ({ ...d, resources: d.resources.filter((r) => r.id !== id) }));
  };

  return (
    <>
      <form className={styles.wrap}>
        <div className={styles.form_col}>
          <BasicInfoCard
            title={data.title}
            sermonDate={data.sermonDate}
            preacherId={data.preacherId}
            seriesId={data.seriesId}
            serviceType={data.serviceType}
            onChange={handlePatch}
          />
          <VideoCard
            videoProvider={data.videoProvider}
            videoUrl={data.videoUrl}
            videoId={data.videoId}
            duration={data.duration}
            thumbnailUrl={data.thumbnailUrl}
            onChange={handlePatch}
          />
          <ScriptureCard
            scripture={data.scripture}
            scriptureText={data.scriptureText}
            summary={data.summary}
            onChange={handlePatch}
          />
          <ResourcesCard
            resources={data.resources}
            onAdd={handleAddResources}
            onRemove={handleRemoveResource}
          />
          <PublishCard isPublished={data.isPublished} onChange={handlePatch} />
        </div>
        <aside className={styles.preview_col} aria-label="미리보기">
          <PreviewCard data={data} />
          <Checklist data={data} />
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
        <button type="button" className={clsx(styles.mobile_button, styles.outline)}>
          임시저장
        </button>
        <button type="button" className={clsx(styles.mobile_button, styles.primary)}>
          발행
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
            <PreviewCard data={data} />
            <Checklist data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
