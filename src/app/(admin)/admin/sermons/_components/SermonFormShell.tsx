'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import PageHeader from '@/components/admin/layout/PageHeader';
import SermonForm from '@/components/admin/sermons/SermonForm';
import { createSermonAction, updateSermonAction } from '@/actions/sermon.action';
import { applyPatch } from '@/lib/sermon-form';
import { useToastStore } from '@/store/toast.store';
import type { Preacher, SeriesWithSermonCount } from '@/types/sermon';
import {
  INITIAL_SERMON_FORM_DATA,
  type SermonFormData,
  type SermonFormPatch,
  type SermonResourceInput
} from '@/types/sermon-form';

interface SermonFormShellProps {
  mode: 'new' | 'edit';
  sermonId?: number;
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
  const router = useRouter();
  const [formData, setData] = useState<SermonFormData>(initialData ?? INITIAL_SERMON_FORM_DATA);
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const toast = useToastStore();

  useUnsavedChanges(isDirty);

  const handlePatch = (patch: SermonFormPatch) => {
    setIsDirty(true);
    setData((d) => applyPatch(d, patch));
  };
  const handleAddResources = (inputs: SermonResourceInput[]) => {
    setIsDirty(true);
    setData((d) => ({ ...d, resources: [...d.resources, ...inputs] }));
  };
  const handleRemoveResource = (id: string) => {
    setIsDirty(true);
    setData((d) => ({ ...d, resources: d.resources.filter((r) => r.id !== id) }));
  };

  const handlePublish = () => {
    startTransition(async () => {
      if (mode === 'new') {
        const result = await createSermonAction({ ...formData, isPublished: true });
        if (result && !result.success) toast.error(result.message);
      } else if (sermonId) {
        const result = await updateSermonAction(sermonId, { ...formData, isPublished: true });
        if (result.success) {
          setIsDirty(false);
          router.push(`/admin/sermons/${sermonId}/edit`);
        } else {
          toast.error(result.message);
        }
      }
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
          { label: publishLabel, variant: 'pri', onClick: handlePublish, disabled: isPending }
        ]}
      />
      <SermonForm
        formData={formData}
        onPatch={handlePatch}
        onAddResources={handleAddResources}
        onRemoveResource={handleRemoveResource}
        onPublish={handlePublish}
        isPending={isPending}
        publishLabel={publishLabel}
        preachers={preachers}
        series={series}
      />
    </>
  );
}
