import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BulletinForm from '@/app/(with-navbar)/news/bulletin/_component/BulletinForm';
import { MainContainer } from '@/components/layout';
import { getBulletinById } from '@/services/bulletin';
import type { ExistingImageItem } from '@/types/bulletin';

export const metadata: Metadata = {
  title: '주보 수정'
};

export default async function BulletinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: bulletin, error } = await getBulletinById(id);

  if (error || !bulletin) notFound();

  const images: ExistingImageItem[] = (bulletin.bulletin_images ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((img) => ({
      type: 'existing' as const,
      imageId: img.id,
      cloudinaryId: img.cloudinary_id,
      url: img.url,
      orderIndex: img.order_index
    }));

  return (
    <MainContainer title="주보 수정하기">
      <BulletinForm
        mode="edit"
        bulletinId={id}
        initialData={{
          title: bulletin.title,
          sundayDate: bulletin.sunday_date,
          images,
          authorId: bulletin.author_id ?? ''
        }}
      />
    </MainContainer>
  );
}
