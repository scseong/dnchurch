import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import BulletinDetail from '@/app/(content)/news/bulletins/_component/BulletinDetail';
import { getOgImageUrl } from '@/utils/cloudinary';
import { isNumeric } from '@/utils/validator';
import { getAllBulletinIds, getBulletinById, getAdjacentBulletins } from '@/services/bulletin';
import { OG_FALLBACK_IMAGE } from '@/config/seo';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isNumeric(id)) return {};

  const { data: bulletin } = await getBulletinById(id);

  if (!bulletin) return {};

  const title = `${bulletin.title}`;
  const description = '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.';
  const ogImage = getOgImageUrl(bulletin.bulletin_images?.[0]?.cloudinary_id);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage || OG_FALLBACK_IMAGE }]
    }
  };
}

export async function generateStaticParams() {
  const { data: allBulletins, error } = await getAllBulletinIds();

  if (error || !allBulletins) {
    console.error('주보 ID 목록을 불러오는 데 실패했습니다:', error?.message);
    return [];
  }

  return allBulletins.slice(0, 10).map((bulletin) => ({
    id: bulletin.id.toString()
  }));
}

export const revalidate = 86400; // 24 hours

export default async function BulletinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;

  if (!isNumeric(bulletinId)) notFound();

  const [bulletinRes, prevNextRes] = await Promise.all([
    getBulletinById(bulletinId),
    getAdjacentBulletins(Number(bulletinId))
  ]);

  const { data: bulletin, error } = bulletinRes;
  const { data: prevNextBulletin } = prevNextRes;

  if (!bulletin || error) notFound();

  return (
    <MainContainer title={bulletin.title}>
      <BulletinDetail bulletin={bulletin} prevNext={prevNextBulletin} />
    </MainContainer>
  );
}
