'use client';

import { useState, useTransition } from 'react';
import PageHeader from '@/components/admin/layout/PageHeader';
import SermonForm from '@/components/admin/sermons/SermonForm';
import { createSermonAction, updateSermonAction } from '@/actions/sermon.action';
import { applyPatch } from '@/lib/sermon-form';
import type { Preacher, SeriesWithSermonCount } from '@/types/sermon';
import {
  INITIAL_SERMON_FORM_DATA,
  type SermonFormData,
  type SermonFormPatch,
  type SermonResourceInput
} from '@/types/sermon-form';

interface SermonFormShellProps {
  mode: 'new' | 'edit';
  sermonId?: string;
  initialTitle?: string;
  initialData?: SermonFormData;
  preachers: Preacher[];
  series: SeriesWithSermonCount[];
}

export default function SermonFormShell({
  mode,
  sermonId,
  initialTitle = '새 설교 등록',
  initialData,
  preachers,
  series
}: SermonFormShellProps) {
  const [formData, setData] = useState<SermonFormData>(initialData ?? INITIAL_SERMON_FORM_DATA);
  const [isPending, startTransition] = useTransition();

  const handlePatch = (patch: SermonFormPatch) => setData((d) => applyPatch(d, patch));
  const handleAddResources = (inputs: SermonResourceInput[]) =>
    setData((d) => ({ ...d, resources: [...d.resources, ...inputs] }));
  const handleRemoveResource = (id: string) =>
    setData((d) => ({ ...d, resources: d.resources.filter((r) => r.id !== id) }));
  const handleSetManualThumbnail = (url: string) =>
    setData((d) => ({ ...d, thumbnailUrl: url, thumbnailManual: true }));
  const handleRemoveThumbnail = () =>
    setData((d) => ({ ...d, thumbnailUrl: '', thumbnailManual: false }));

  const handleSaveDraft = () => {
    startTransition(async () => {
      const result =
        mode === 'new'
          ? await createSermonAction({ ...formData, isPublished: false })
          : sermonId
            ? await updateSermonAction(sermonId, { ...formData, isPublished: false })
            : null;
      if (result && !result.success) console.error(result.message);
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      const result =
        mode === 'new'
          ? await createSermonAction({ ...formData, isPublished: true })
          : sermonId
            ? await updateSermonAction(sermonId, { ...formData, isPublished: true })
            : null;
      if (result && !result.success) console.error(result.message);
    });
  };

  const publishLabel = mode === 'new' ? '발행' : '수정 저장';
  const description =
    mode === 'new'
      ? '영상, 본문, 자료를 입력하고 발행하세요'
      : '영상, 본문, 자료를 수정하고 저장하세요';

  return (
    <>
      <PageHeader
        eyebrow="설교 관리"
        badge={mode === 'new' ? '새 설교 등록' : '수정'}
        title={mode === 'new' ? '새 설교 등록' : initialTitle}
        description={description}
        actions={[
          { label: '임시저장', variant: 'outline', onClick: handleSaveDraft, disabled: isPending },
          { label: publishLabel, variant: 'pri', onClick: handlePublish, disabled: isPending }
        ]}
      />
      <SermonForm
        formData={formData}
        onPatch={handlePatch}
        onAddResources={handleAddResources}
        onRemoveResource={handleRemoveResource}
        onSetManualThumbnail={handleSetManualThumbnail}
        onRemoveThumbnail={handleRemoveThumbnail}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPending={isPending}
        publishLabel={publishLabel}
        preachers={preachers}
        series={series}
      />
    </>
  );
}
