import MainContainer from '@/components/layout/container/MainContainer';
import AnnouncementTable from './_component/AnnouncementTable';
import { getAnnouncement } from '@/apis/announcement';
import styles from './page.module.scss';

export default async function Announcement() {
  const { posts, count } = await getAnnouncement();

  if (!posts) {
    return (
      <MainContainer title="공지사항">
        <div>데이터를 가져오는 중입니다...</div>
      </MainContainer>
    );
  }

  return (
    <MainContainer title="공지사항">
      <div className={styles.wrap}>
        {/* TODO: 검색 */}
        <div>검색</div>
        <div>
          <AnnouncementTable posts={posts} count={count} />
        </div>
      </div>
    </MainContainer>
  );
}
