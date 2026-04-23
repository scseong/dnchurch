import { notFound } from 'next/navigation';
import PageHeader from '@/components/admin/layout/PageHeader';
import SermonForm from '@/components/admin/sermons/SermonForm';
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
    <>
      <PageHeader
        eyebrow="설교 관리"
        badge="수정"
        title={sermon.title}
        description="영상, 본문, 자료를 수정하고 저장하세요"
        actions={[
          { label: '임시저장', variant: 'outline' },
          { label: '수정 저장', variant: 'pri' }
        ]}
      />
      <SermonForm
        initialData={mapSermonToFormData(sermon)}
        preachers={preachers}
        series={series}
      />
    </>
  );
}
