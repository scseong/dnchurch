import { notFound } from 'next/navigation';
import SermonFormShell from '@/app/(admin)/admin/sermons/_components/SermonFormShell';
import { getAllPreachers, getAllSeries, getSermonForEdit } from '@/services/sermon';
import { mapSermonToFormData } from '@/lib/sermon-form-mapper';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SermonEditPage({ params }: Props) {
  const { slug } = await params;
  const [sermon, preachers, series] = await Promise.all([
    getSermonForEdit(slug),
    getAllPreachers(),
    getAllSeries()
  ]);

  if (!sermon) notFound();

  return (
    <SermonFormShell
      mode="edit"
      sermonId={sermon.id}
      slug={slug}
      initialTitle={sermon.title}
      initialData={mapSermonToFormData(sermon)}
      preachers={preachers}
      series={series}
    />
  );
}
