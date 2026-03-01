import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BulletinForm from '@/app/(with-navbar)/news/bulletin/_component/BulletinForm';
import { MainContainer } from '@/components/layout';
import { getBulletinById } from '@/services/bulletin';

export const metadata: Metadata = {
  title: '주보 수정'
};

export default async function BulletinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: bulletin, error } = await getBulletinById(id);

  if (error || !bulletin) notFound();

  return (
    <MainContainer title="주보 수정하기">
      <BulletinForm
        mode="edit"
        bulletinId={id}
        initialData={{
          title: bulletin.title,
          date: bulletin.date,
          imageUrls: bulletin.image_url,
          userId: bulletin.user_id
        }}
      />
    </MainContainer>
  );
}
