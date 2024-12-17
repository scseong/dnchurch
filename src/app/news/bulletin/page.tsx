import BulletinTable from './_component/BulletinTable';
import { BulletinType, SearchParams } from '@/shared/types/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import { IoMdShare } from 'react-icons/io';
import KakaoShareBtn from '@/app/_component/common/KakaoShare';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '주보 - 대구동남교회',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 읽어보세요.'
};
export default async function Bulletin({ searchParams }: SearchParams) {
  const { page = 1, year } = await searchParams;

  const bulletin: BulletinType[] = [
    {
      id: 1,
      title: '2024년 12월 8일 첫째 주',
      image_url: [
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222001.jpg?t=2024-12-14T15%3A37%3A18.891Z',
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222002.jpg'
      ],
      created_at: '2024-12-21T07:30:59+00:00',
      updated_at: null,
      user_id: 'fa988960-b9ba-4abf-8591-c66aafff8706'
    },
    {
      id: 2,
      title: '2024년 12월 15일 셋째 주',
      image_url: [
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222001.jpg?t=2024-12-14T15%3A37%3A18.891Z',
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222002.jpg'
      ],
      created_at: '2024-12-21T07:30:59+00:00',
      updated_at: null,
      user_id: 'fa988960-b9ba-4abf-8591-c66aafff8706'
    },
    {
      id: 3,
      title: '2024년 12월 22일 넷째 주',
      image_url: [
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222001.jpg?t=2024-12-14T15%3A37%3A18.891Z',
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/public/bulletin/20241222002.jpg'
      ],
      created_at: '2024-12-21T07:30:59+00:00',
      updated_at: null,
      user_id: 'fa988960-b9ba-4abf-8591-c66aafff8706'
    }
  ];

  const latestBulletin = bulletin[0];

  return (
    <section className={styles.bulletin}>
      <h2>주보</h2>
      <div className={styles.wrap}>
        <section className={styles.latest_bulletin}>
          <div className={styles.notification}>
            <h3>이 주의 주보</h3>
            <p>{latestBulletin.title}</p>
          </div>
          <div className={styles.images_wrap}>
            {latestBulletin.image_url.map((url, idx) => (
              <Link href={url} target="_blank">
                <img src={url} alt={`${latestBulletin.title} - ${idx + 1}`} />
              </Link>
            ))}
          </div>
          <div className={styles.share}>
            <IoMdShare size="1.2rem" />
            <KakaoShareBtn title="주보 - 대구동남교회" description={latestBulletin.title} />
          </div>
        </section>
        <section className={styles.table}>
          <BulletinTable data={bulletin} />
        </section>
      </div>
    </section>
  );
}
