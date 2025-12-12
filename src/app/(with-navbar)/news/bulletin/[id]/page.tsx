import { notFound } from 'next/navigation';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import { BoardHeader, BoardBody, BoardFooter, BoardListButton } from '@/app/_component/board';
import { getAllBulletinIds, getBulletinsById, getPrevAndNextBulletin } from '@/apis/bulletin';
import { getDownloadFilePath } from '@/apis/storage';
import { convertBase64ToFileName, getFilenameFromUrl } from '@/shared/util/file';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bulletin = await getBulletinsById(id);

  if (!bulletin) return {};

  const title = `${bulletin.title} 주보`;
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

export async function generateStaticParams() {
  const allBulletins = await getAllBulletinIds();
  return allBulletins.map((bulletin) => ({
    id: bulletin.id.toString()
  }));
}

export default async function BulletinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;
  const bulletin = await getBulletinsById(bulletinId);
  const prevNextBulletin = await getPrevAndNextBulletin(Number(bulletinId));

  if (!bulletin) notFound();

  const { id, created_at, image_url, title, user_id, profiles } = bulletin;
  const files = image_url.map((url) => {
    const res = getFilenameFromUrl(url);
    const filename = convertBase64ToFileName(res);
    const downloadPath = getDownloadFilePath({ bucket: BULLETIN_BUCKET, path: res });

    return { filename, downloadPath };
  });

  return (
    <MainContainer title="주보">
      <BoardHeader
        title={title}
        userName={profiles.user_name}
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
