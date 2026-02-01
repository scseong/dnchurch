import { notFound } from 'next/navigation';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import { BoardHeader, BoardBody, BoardFooter, BoardListButton } from '@/app/_component/board';
import { generateFileDownloadList } from '@/shared/util/file';
import { isNumeric } from '@/shared/util/validator';
import {
  fetchAllBulletinIds,
  fetchBulletinDetailById,
  fetchNavigationBulletins
} from '@/services/bulletin';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isNumeric(id)) return {};

  const { data: bulletin } = await fetchBulletinDetailById(id);

  if (!bulletin) return {};

  const title = `${bulletin.title}`;
  const description = '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: bulletin.image_url?.[0] ? [{ url: bulletin.image_url[0] }] : []
    }
  };
}

// export async function generateStaticParams() {
//   const { data: allBulletins, error } = await fetchAllBulletinIds();

//   if (error || !allBulletins) {
//     console.error('주보 ID 목록을 불러오는 데 실패했습니다:', error?.message);
//     return [];
//   }

//   return allBulletins.slice(0, 10).map((bulletin) => ({
//     id: bulletin.id.toString()
//   }));
// }

export default async function BulletinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;

  if (!isNumeric(bulletinId)) notFound();

  const [bulletinRes, prevNextRes] = await Promise.all([
    fetchBulletinDetailById(bulletinId),
    fetchNavigationBulletins(Number(bulletinId))
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
        thumbnail={image_url[0]}
        id={id.toString()}
        updateLink={`/news/bulletin/${id}/update`}
      />
      <BoardBody>
        {image_url.map((url) => (
          <div key={url}>
            <img src={url} alt={url} />
          </div>
        ))}
      </BoardBody>
      <BoardFooter files={files} prevNext={prevNextBulletin} />
      <BoardListButton link="/news/bulletin" />
    </MainContainer>
  );
}
