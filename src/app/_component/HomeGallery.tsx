import Link from 'next/link';
import HomeGalleryClient from './HomeGalleryClient';
import { IoIosArrowForward } from 'react-icons/io';
import styles from './HomeGallery.module.scss';

/* TODO: supabase API 연동 (갤러리 미구현으로 테스트 API로 대체)*/
async function fetchCats() {
  const response = await fetch('https://cataas.com/api/cats');
  if (!response.ok) {
    throw new Error('Failed to fetch cats');
  }
  return response.json();
}

export default async function HomeGallery() {
  const data = await fetchCats();

  return (
    <section className={styles.home_gallery}>
      <div className={styles.heading}>
        <h2>동남앨범</h2>
        <Link href="/gallery">
          <IoIosArrowForward />
        </Link>
      </div>
      <div className={styles.swiper}>
        <HomeGalleryClient data={data} />
      </div>
    </section>
  );
}

export type CatImageType = {
  _id: string;
  mimetype: string;
  size: string;
  tags: string;
};
