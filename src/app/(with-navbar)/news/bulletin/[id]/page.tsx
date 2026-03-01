import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import { BoardHeader, BoardBody, BoardFooter, BoardListLink } from '@/components/board';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { generateFileDownloadList } from '@/utils/file';
import { isNumeric } from '@/utils/validator';
import { getAllBulletinIds, getBulletinById, getAdjacentBulletins } from '@/services/bulletin';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isNumeric(id)) return {};

  const { data: bulletin } = await getBulletinById(id);

  if (!bulletin) return {};

  const title = `${bulletin.title}`;
  const description = '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: bulletin.image_url?.[0] ? [{ url: getCloudinaryUrl(bulletin.image_url[0]) }] : []
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

export default async function BulletinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;

  if (!isNumeric(bulletinId)) notFound();

  const [bulletinRes, prevNextRes] = await Promise.all([
    getBulletinById(bulletinId),
    getAdjacentBulletins(Number(bulletinId))
  ]);

  const { data: bulletin, error } = bulletinRes;
  const { data: prevNextBulletin } = prevNextRes;

  if (!bulletin || error) notFound();

  const { id, created_at, image_url, title, user_id, profiles } = bulletin;
  const files = generateFileDownloadList({ urls: image_url });

  return (
    <MainContainer title="주보">
      <BoardHeader
        title={title}
        userName={profiles?.user_name ?? '관리자'}
        createdAt={created_at}
        userId={user_id}
        thumbnail={getCloudinaryUrl(image_url[0])}
        id={id.toString()}
        updateLink={`/news/bulletin/${id}/update`}
      />
      <BoardBody images={image_url} />
      <BoardFooter files={files} prevNext={prevNextBulletin} />
      <BoardListLink link="/news/bulletin" />
    </MainContainer>
  );
}
