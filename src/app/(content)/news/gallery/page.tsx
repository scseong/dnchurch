import type { Metadata } from 'next';
import MainContainer from '@/components/layout/container/MainContainer';
import GalleryBoard from './_component/GalleryBoard';
import { GALLERY_POSTS } from './_data/posts';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '갤러리',
  description: '대구동남교회 성도들이 나눈 은혜의 순간을 함께 봅니다.'
};

export default function GalleryPage() {
  return (
    <MainContainer title="갤러리">
      {/* Hero 제거로 사라진 페이지 제목 — 시각은 MobileHeader가 대신하고, 데스크톱·스크린리더용 h1을 둔다 */}
      <h1 className={styles.blind_title}>갤러리</h1>
      <div className={styles.wrap}>
        <GalleryBoard posts={GALLERY_POSTS} />
      </div>
    </MainContainer>
  );
}
