import { notFound } from 'next/navigation';
import SermonFormShell from '@/app/(admin)/admin/sermons/_components/SermonFormShell';
import { getSermonForEdit } from '@/services/sermon';
import { getAdminPreachers, getAdminSeries } from '@/services/sermon/admin';
import { mapSermonToFormData } from '@/lib/sermon-form-mapper';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SermonEditPage({ params }: Props) {
  const { id } = await params;
  const [sermon, preachers, series] = await Promise.all([
    getSermonForEdit(Number(id)),
    getAdminPreachers(),
    getAdminSeries()
  ]);

  if (!sermon) notFound();

  return (
    <SermonFormShell
      mode="edit"
      sermonId={sermon.id}
      initialTitle={sermon.title}
      initialData={mapSermonToFormData(sermon)}
      preachers={preachers}
      series={series}
    />
  );
}
