import { notFound } from 'next/navigation';
import { getBulletinsById } from '@/apis/bulletin';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import { BoardHeader, BoardBody, BoardFooter, BoardListButton } from '@/app/_component/board';
import styles from './page.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;
  const bulletin = await getBulletinsById(bulletinId);

  return {
    title: bulletin?.title,
    description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
    openGraph: {
      title: bulletin?.title,
      description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
      images: {
        url: bulletin?.image_url[0]
      }
    }
  };
}

export default async function BulletinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;
  const bulletin = await getBulletinsById(bulletinId);

  if (!bulletin) notFound();

  const { id, created_at, image_url, title, user_id, profiles } = bulletin;

  return (
    <MainContainer title="주보">
      <BoardHeader
        title={title}
        userName={profiles.user_name}
        createdAt={created_at}
        userId={user_id}
        id={id.toString()}
      />
      <BoardBody>
        {image_url.map((url) => (
          <div key={url} className={styles.image_wrap}>
            <img src={url} alt={url} />
          </div>
        ))}
      </BoardBody>
      <BoardFooter files={image_url} />
      <BoardListButton link="/news/bulletin" />
    </MainContainer>
  );
}
