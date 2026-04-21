'use client';

import { useCallback, useState } from 'react';
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
import { parseVideoId } from '@/lib/video-url';
import { inferResourceType } from '@/lib/sermon-resource';
import styles from './index.module.scss';

const MAX_RESOURCE_BYTES = 50 * 1024 * 1024;

interface SermonFormProps {
  initialData?: SermonFormData;
}

export default function SermonForm({ initialData }: SermonFormProps = {}) {
  const [data, setData] = useState<SermonFormData>(initialData ?? INITIAL_SERMON_FORM_DATA);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePatch = useCallback((patch: SermonFormPatch) => {
    setData((d) => {
      const next = { ...d, ...patch };
      const videoChanged =
        patch.videoUrl !== undefined || patch.videoProvider !== undefined;
      if (videoChanged) {
        next.videoId = parseVideoId(next.videoUrl, next.videoProvider);
      }
      if (videoChanged && !d.thumbnailManual) {
        next.thumbnailUrl =
          next.videoProvider === 'youtube' && next.videoId
            ? `https://img.youtube.com/vi/${next.videoId}/hqdefault.jpg`
            : '';
      }
      return next;
    });
  }, []);

  const handleAddResources = useCallback((files: FileList) => {
    const additions: SermonResourceInput[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_RESOURCE_BYTES) continue;
      additions.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        fileType: inferResourceType(file.name),
        file
      });
    }
    if (additions.length === 0) return;
    setData((d) => ({ ...d, resources: [...d.resources, ...additions] }));
  }, []);

  const handleRemoveResource = useCallback((id: string) => {
    setData((d) => ({ ...d, resources: d.resources.filter((r) => r.id !== id) }));
  }, []);

  return (
    <>
      <form className={styles.wrap}>
        <div className={styles.form_col}>
          <BasicInfoCard
            title={data.title}
            sermonDate={data.sermonDate}
            preacherId={data.preacherId}
            seriesId={data.seriesId}
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
          <ScriptureCard data={data} setData={setData} />
          <ResourcesCard
            resources={data.resources}
            onAdd={handleAddResources}
            onRemove={handleRemoveResource}
          />
          <PublishCard data={data} setData={setData} />
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
