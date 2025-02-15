import BannerClient from './BannerClient';
import { Tables } from '@/shared/types/database.types';

export default async function Banner() {
  // TODO: supabase API 연결
  const data: Tables<'home_banner'>[] = [
    {
      id: 1,
      title: '서로서로 세워가는 교회',
      description: '1. 예배로\n2. 믿음과 행함으로\n3. 전도로',
      order: 1,
      image_url:
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/sign/home_banner/church-4911852_1920.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJob21lX2Jhbm5lci9jaHVyY2gtNDkxMTg1Ml8xOTIwLmpwZyIsImlhdCI6MTczMDgyMzA0NiwiZXhwIjoxNzYyMzU5MDQ2fQ.m7XETfrk2JgqxLeM5uJ-UzISeMX3iNLDWOGng_4Ga-g&t=2024-11-05T16%3A10%3A46.164Z',
      year: 2024
    },
    {
      id: 2,
      title: '차별금지법 반대 연합예배',
      description: null,
      order: 2,
      image_url:
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/sign/home_banner/church.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJob21lX2Jhbm5lci9jaHVyY2guanBnIiwiaWF0IjoxNzMyNjEwNjIwLCJleHAiOjE3NjQxNDY2MjB9.IJ5PfVONthOoKrtyt9Mbr6DodzWCyeb7Ej_OiqLxAkg&t=2024-11-26T08%3A43%3A40.327Z',
      year: 2024
    }
  ];

  return <BannerClient data={data} />;
}
