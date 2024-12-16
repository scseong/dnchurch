import BulletinTable from './_component/BulletinTable';
import { BulletinType } from '@/shared/types/types';

export default function Bulletin() {
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

  return (
    <section>
      <h2>주보</h2>
      <BulletinTable data={bulletin} />
    </section>
  );
}
